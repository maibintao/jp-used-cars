"""
carsensor.net listing page scraper.
Fetches car listing pages and parses each car card into a dict.
"""

from __future__ import annotations

import random
import re
import time
from decimal import Decimal, InvalidOperation
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urljoin, urlparse, urlunparse

import requests
import yaml
from bs4 import BeautifulSoup

from .selectors import BASE_URL, SELECTORS, SOURCE_ID_PATTERN


def load_config() -> dict:
    """Load config.yaml from project root."""
    config_path = Path(__file__).resolve().parents[1] / "config.yaml"
    with config_path.open(encoding="utf-8") as config_file:
        return yaml.safe_load(config_file)


def get_headers(config: dict) -> dict:
    """Return request headers with a randomly selected User-Agent."""
    user_agents = config.get("scraper", {}).get("user_agents", [])
    if not user_agents:
        raise ValueError("config.yaml must define scraper.user_agents")

    return {
        "User-Agent": random.choice(user_agents),
        "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Referer": BASE_URL + "/",
    }


def scrape_listing_page(url: str, page: int = 1) -> list[dict]:
    """
    Fetch one listing page and return a list of parsed car dicts.

    Args:
        url: Base search URL from config.yaml
        page: Page number (1-indexed)

    Returns:
        List of car dicts with keys:
        source_id, title_ja, year, mileage_km, price_jpy,
        grade_ja, color_ja, thumbnail, detail_url

    Raises:
        requests.HTTPError: if the page returns non-200 after retries
    """
    config = load_config()
    scraper_config = config.get("scraper", {})
    timeout = scraper_config.get("timeout_seconds", 15)
    max_retries = scraper_config.get("max_retries", 1)
    delay_seconds = scraper_config.get("delay_seconds", 2)

    page_url = _build_page_url(_canonicalize_url(url, config), page)
    last_response = None

    for attempt in range(max(1, max_retries)):
        response = requests.get(page_url, headers=get_headers(config), timeout=timeout)
        last_response = response
        body_lower = response.text.lower()
        blocked = response.status_code == 403 or "captcha" in body_lower

        if response.status_code == 200 and not blocked:
            soup = BeautifulSoup(response.content, "lxml")
            return [
                car
                for car in (parse_car_card(card) for card in soup.select(SELECTORS["car_card"]))
                if car is not None
            ]

        if attempt < max_retries - 1:
            time.sleep(delay_seconds)

    if last_response is not None:
        last_response.raise_for_status()
    return []


def parse_car_card(item) -> dict | None:
    """
    Parse a single BeautifulSoup car card element into a dict.

    Returns None if the card is malformed or missing required fields
    (source_id is required; all others can be None).
    """
    detail_node = item.select_one(SELECTORS["detail_url"])
    detail_href = detail_node.get("href") if detail_node else None
    detail_url = urljoin(BASE_URL, detail_href) if detail_href else None
    source_id = _extract_source_id(detail_url)

    if not source_id:
        return None

    title_node = item.select_one(SELECTORS["title_ja"])
    title_ja = _clean_text(title_node.get_text(" ", strip=True) if title_node else None)

    price_node = item.select_one(SELECTORS["price"])
    price_jpy = _parse_price_jpy(price_node.get_text("", strip=True) if price_node else None)

    year = _parse_year(_find_spec_value(item, "年式"))
    mileage_km = _parse_mileage_km(_find_spec_value(item, "走行距離"))

    color_ja = None
    color_nodes = item.select(SELECTORS["color"])
    if len(color_nodes) >= 2:
        color_ja = _clean_text(color_nodes[1].get_text(" ", strip=True))

    thumbnail_node = item.select_one(SELECTORS["thumbnail"])
    thumbnail = None
    if thumbnail_node:
        thumbnail = thumbnail_node.get("data-original") or thumbnail_node.get("src")
        thumbnail = _absolute_asset_url(thumbnail)

    return {
        "source_id": source_id,
        "title_ja": title_ja,
        "year": year,
        "mileage_km": mileage_km,
        "price_jpy": price_jpy,
        "grade_ja": _derive_grade(title_ja),
        "color_ja": color_ja,
        "thumbnail": thumbnail,
        "detail_url": detail_url,
    }


def get_next_page_url(soup: BeautifulSoup, current_page: int) -> str | None:
    """
    Return the URL for the next page, or None if on the last page.
    """
    next_page = str(current_page + 1)

    for link in soup.find_all("a", href=True):
        text = _clean_text(link.get_text(" ", strip=True))
        href = link["href"]
        if text and "次へ" in text:
            return urljoin(BASE_URL, href)

        query = parse_qs(urlparse(href).query)
        if query.get("PN") == [next_page]:
            return urljoin(BASE_URL, href)

    return None


def scrape_all_pages(
    url: str,
    max_pages: int | None = None,
    model_name: str | None = None,
) -> list[dict]:
    """
    Scrape all pages for a given model URL.

    Args:
        url: Base search URL
        max_pages: Optional page cap. If None, resolve from config.yaml.
        model_name: Optional model label used for progress output.

    Returns:
        Deduplicated list of car dicts (dedup by source_id).
    """
    config = load_config()
    page_limit = max_pages if max_pages is not None else _resolve_max_pages(url, config)
    delay_seconds = config.get("scraper", {}).get("delay_seconds", 2)
    page = 1
    seen_source_ids: set[str] = set()
    cars: list[dict] = []
    current_url = _canonicalize_url(url, config)

    while True:
        total_label = str(page_limit) if page_limit is not None else "?"
        prefix = f"Scraping {model_name} page" if model_name else "Scraping page"
        print(f"{prefix} {page}/{total_label}...")

        page_cars = scrape_listing_page(current_url, page=page)
        if not page_cars:
            break

        for car in page_cars:
            source_id = car.get("source_id")
            if source_id and source_id not in seen_source_ids:
                seen_source_ids.add(source_id)
                cars.append(car)

        if page_limit is not None and page >= page_limit:
            break

        time.sleep(delay_seconds)
        page += 1

    return cars


def _parse_price_jpy(text: str | None) -> int | None:
    """Convert "198万円" -> 1980000. Returns None for non-numeric."""
    cleaned = _clean_text(text)
    if not cleaned or "応談" in cleaned:
        return None

    match = re.search(r"(\d+(?:\.\d+)?)\s*万円", cleaned)
    if not match:
        return None

    try:
        return int(Decimal(match.group(1)) * Decimal("10000"))
    except (InvalidOperation, ValueError):
        return None


def _parse_mileage_km(text: str | None) -> int | None:
    """Convert "4.5万km" -> 45000. Returns None for "-" or missing."""
    cleaned = _clean_text(text)
    if not cleaned or cleaned in {"-", "－"}:
        return None

    man_km_match = re.search(r"(\d+(?:\.\d+)?)\s*万\s*km", cleaned, re.IGNORECASE)
    if man_km_match:
        try:
            return int(Decimal(man_km_match.group(1)) * Decimal("10000"))
        except (InvalidOperation, ValueError):
            return None

    km_match = re.search(r"(\d[\d,]*)\s*km", cleaned, re.IGNORECASE)
    if km_match:
        return int(km_match.group(1).replace(",", ""))

    return None


def _parse_year(text: str | None) -> int | None:
    """Extract 4-digit year from strings like "2021年" or "2021(R3)年"."""
    cleaned = _clean_text(text)
    if not cleaned:
        return None

    match = re.search(r"(19|20)\d{2}", cleaned)
    return int(match.group(0)) if match else None


def _canonicalize_url(url: str, config: dict) -> str:
    aliases = config.get("scraper", {}).get("url_aliases", {})
    return aliases.get(url, url)


def _resolve_max_pages(url: str, config: dict) -> int | None:
    canonical_url = _canonicalize_url(url, config)
    for model in config.get("target_models", []):
        model_url = model.get("url")
        if not model_url:
            continue
        if url == model_url or canonical_url == _canonicalize_url(model_url, config):
            return model.get("max_pages")
    return config.get("scraper", {}).get("max_pages")


def _build_page_url(url: str, page: int) -> str:
    if page <= 1:
        return url

    parsed = urlparse(url)
    query = parse_qs(parsed.query)
    query["PN"] = [str(page)]
    return urlunparse(parsed._replace(query=urlencode(query, doseq=True)))


def _extract_source_id(detail_url: str | None) -> str | None:
    if not detail_url:
        return None
    match = re.search(SOURCE_ID_PATTERN, detail_url)
    return match.group(1) if match else None


def _find_spec_value(item, label: str) -> str | None:
    for box in item.select(SELECTORS["year"]):
        title = box.select_one(".specList__title")
        data = box.select_one(".specList__data")
        if title and data and _clean_text(title.get_text(" ", strip=True)) == label:
            return data.get_text(" ", strip=True)
    return None


def _derive_grade(title_ja: str | None) -> str | None:
    if not title_ja:
        return None
    parts = title_ja.split(maxsplit=1)
    return parts[1] if len(parts) > 1 else None


def _absolute_asset_url(url: str | None) -> str | None:
    if not url:
        return None
    if url.startswith("//"):
        return "https:" + url
    return urljoin(BASE_URL, url)


def _clean_text(text: str | None) -> str | None:
    if text is None:
        return None
    cleaned = re.sub(r"\s+", " ", text.replace("\xa0", " ")).strip()
    return cleaned or None
