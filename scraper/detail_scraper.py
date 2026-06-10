"""
Fetches a carsensor.net detail page and extracts full images,
specs table, and seller description.
"""

from __future__ import annotations

import time
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

from .carsensor_scraper import get_headers, load_config
from .selectors import BASE_URL

EMPTY_DETAIL = {"images": [], "description_ja": None, "specs": {}}


def scrape_detail(detail_url: str) -> dict:
    """
    Fetch a detail page and return supplementary fields.

    Returns dict with keys:
        images: list[str]        - absolute image URLs, max 10
        description_ja: str | None  - seller comment text
        specs: dict[str, str]    - spec table key/value pairs

    On any HTTP or parse error, returns empty defaults (never raises).
    """
    try:
        time.sleep(1)
        config = load_config()
        timeout = config.get("scraper", {}).get("timeout_seconds", 15)
        response = requests.get(detail_url, headers=get_headers(config), timeout=timeout)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "lxml")
        return {
            "images": _extract_images(soup),
            "description_ja": _extract_description(soup),
            "specs": _extract_specs(soup),
        }
    except Exception as exc:
        print(f"Detail scrape error for {detail_url}: {exc}")
        return EMPTY_DETAIL.copy()


def _extract_images(soup: BeautifulSoup) -> list[str]:
    """
    Try multiple selector strategies to find all car photos.
    Returns deduplicated absolute URLs, max 10.
    """
    candidates: list[str] = []

    for noscript in soup.find_all("noscript"):
        inner = BeautifulSoup(noscript.get_text(), "html.parser")
        for img in inner.find_all("img"):
            src = img.get("src") or img.get("data-src") or img.get("data-original")
            if src and _is_car_photo(src):
                candidates.append(src)

    for img in soup.find_all("img"):
        src = img.get("data-original") or img.get("data-src") or img.get("src")
        if src and _is_car_photo(src):
            candidates.append(src)

    seen: set[str] = set()
    image_urls: list[str] = []
    for src in candidates:
        absolute_url = _absolute_url(src)
        if absolute_url and absolute_url not in seen:
            seen.add(absolute_url)
            image_urls.append(absolute_url)
        if len(image_urls) >= 20:
            break

    return image_urls


def _is_car_photo(url: str) -> bool:
    """Filter out icons, logos, banners, and keep likely car photos."""
    url_lower = url.lower()
    path_lower = urlparse(url_lower).path
    is_photo_cdn = "carsensor" in url_lower or "ccsrpcma" in url_lower or "ccsrpcml" in url_lower
    is_image = any(path_lower.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"])
    is_not_icon = "icon" not in url_lower and "logo" not in url_lower
    return (is_photo_cdn or is_image) and is_image and is_not_icon


def _extract_description(soup: BeautifulSoup) -> str | None:
    for selector in [
        ".shopComment",
        ".carFeature",
        ".commentText",
        ".sellerComment",
        ".shopComment__text",
    ]:
        node = soup.select_one(selector)
        text = _clean_text(node.get_text(" ", strip=True) if node else None)
        if text:
            return text
    return None


def _extract_specs(soup: BeautifulSoup) -> dict[str, str]:
    specs: dict[str, str] = {}

    for table in soup.select("table.defaultTable__table, table"):
        for row in table.select("tr"):
            cells = row.find_all(["th", "td"], recursive=False)
            index = 0
            while index < len(cells) - 1:
                if cells[index].name != "th":
                    index += 1
                    continue
                key = _clean_spec_key(cells[index].get_text(" ", strip=True))
                value = _clean_text(cells[index + 1].get_text(" ", strip=True))
                if key and value and key not in specs:
                    specs[key] = value
                index += 2

    return specs


def _absolute_url(raw_url: str | None) -> str | None:
    if not raw_url:
        return None
    if raw_url.startswith("data:"):
        return None
    if raw_url.startswith("//"):
        return "https:" + raw_url
    if raw_url.startswith("http"):
        return raw_url
    return urljoin(BASE_URL, raw_url)


def _clean_spec_key(text: str | None) -> str | None:
    cleaned = _clean_text(text)
    if not cleaned:
        return None
    return cleaned.replace(" ?", "").strip()


def _clean_text(text: str | None) -> str | None:
    if text is None:
        return None
    cleaned = " ".join(text.replace("\xa0", " ").split())
    return cleaned or None
