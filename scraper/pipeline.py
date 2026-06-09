"""
Orchestrates scraping all configured models, merges list + detail data,
and exports to website/public/data/cars.json.
"""

from __future__ import annotations

import json
import time
from datetime import datetime, timezone
from pathlib import Path

from processor.price_converter import process_car_price
from processor.translator import translate_car

from .carsensor_scraper import load_config, scrape_all_pages
from .detail_scraper import scrape_detail

OUTPUT_PATH = Path("website/public/data/cars.json")


def run(skip_details: bool = False) -> list[dict]:
    """
    Full pipeline: scrape all models -> fetch details -> export JSON.

    Args:
        skip_details: If True, skip detail page fetching (faster for testing).

    Returns:
        List of fully enriched car dicts.
    """
    config = load_config()
    scraped_at = _utc_now()
    cars: list[dict] = []

    for model in config.get("target_models", []):
        model_name = model["name"]
        list_cars = scrape_all_pages(
            model["url"],
            max_pages=model.get("max_pages"),
            model_name=model_name,
        )

        for detail_index, list_car in enumerate(list_cars, start=1):
            base_car = {
                **list_car,
                "model": model_name,
                "scraped_at": scraped_at,
            }

            if skip_details:
                cars.append(_merge(base_car, {}))
                continue

            print(f"Fetching details {detail_index}/{len(list_cars)}...")
            detail_url = base_car.get("detail_url")
            detail = scrape_detail(detail_url) if detail_url else {}
            cars.append(_merge(base_car, detail))
            time.sleep(1)

    print("🌐 Translating to English...")
    print("💱 Converting prices to USD...")
    enriched = []
    for car in cars:
        car = translate_car(car)
        car = process_car_price(car, config)
        enriched.append(car)

    _export(enriched, OUTPUT_PATH)
    return enriched


def _merge(list_car: dict, detail: dict) -> dict:
    """Merge detail page fields into a list page car dict."""
    return {
        **list_car,
        "images": detail.get("images") or _fallback_images(list_car),
        "description_ja": detail.get("description_ja"),
        "specs": detail.get("specs") or {},
    }


def _export(cars: list[dict], path: Path) -> None:
    """Write cars list to JSON with metadata wrapper."""
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "updated_at": _utc_now(),
        "total": len(cars),
        "cars": cars,
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def _fallback_images(list_car: dict) -> list[str]:
    thumbnail = list_car.get("thumbnail")
    return [thumbnail] if thumbnail else []


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
