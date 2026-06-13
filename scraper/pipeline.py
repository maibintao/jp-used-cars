"""
Orchestrates scraping all configured models, merges list + detail data,
and exports to website/public/data/cars.json.

Accumulation strategy (Plan B):
- Keep cars from previous runs (with last_seen timestamp)
- Add newly scraped cars
- Remove cars not seen for STALE_DAYS days (assumed sold/delisted)
"""

from __future__ import annotations

import json
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

from processor.price_converter import process_car_price
from processor.translator import translate_car

from .carsensor_scraper import load_config, scrape_all_pages
from .detail_scraper import scrape_detail

OUTPUT_PATH = Path("website/public/data/cars.json")
STALE_DAYS = 7  # Remove cars not seen for this many days


def run(skip_details: bool = False) -> list[dict]:
    config = load_config()
    today = _utc_now()

    # Load existing accumulated cars keyed by source_id
    existing: dict[str, dict] = {}
    if OUTPUT_PATH.exists():
        try:
            data = json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
            for car in data.get("cars", []):
                if car.get("source_id"):
                    existing[car["source_id"]] = car
            print(f"📦 Loaded {len(existing)} existing cars from previous run")
        except Exception as e:
            print(f"⚠️  Could not load existing cars: {e}")

    # Scrape fresh listings
    freshly_scraped: dict[str, dict] = {}
    for model in config.get("target_models", []):
        model_name = model["name"]
        list_cars = scrape_all_pages(
            model["url"],
            max_pages=model.get("max_pages"),
            model_name=model_name,
        )

        for detail_index, list_car in enumerate(list_cars, start=1):
            base_car = {**list_car, "model": model_name, "scraped_at": today}

            if skip_details:
                freshly_scraped[list_car["source_id"]] = _merge(base_car, {})
                continue

            print(f"Fetching details {detail_index}/{len(list_cars)} for {model_name}...")
            detail_url = base_car.get("detail_url")
            detail = scrape_detail(detail_url) if detail_url else {}
            freshly_scraped[list_car["source_id"]] = _merge(base_car, detail)
            time.sleep(1)

    print(f"🔍 Scraped {len(freshly_scraped)} cars today")

    # Translate + price all newly scraped cars
    print("🌐 Translating to English...")
    print("💱 Converting prices to USD...")
    translated_fresh: dict[str, dict] = {}
    for sid, car in freshly_scraped.items():
        car = translate_car(car)
        car = process_car_price(car, config)
        translated_fresh[sid] = car

    # Merge: existing + fresh
    stale_cutoff = datetime.now(timezone.utc) - timedelta(days=STALE_DAYS)
    merged: list[dict] = []
    new_count = updated_count = kept_count = removed_count = 0

    # Start from existing, update or keep
    for sid, old_car in existing.items():
        if sid in translated_fresh:
            # Car still on market — refresh data, update last_seen
            fresh = translated_fresh[sid]
            merged.append({
                **fresh,
                "first_seen": old_car.get("first_seen", today),
                "last_seen": today,
            })
            updated_count += 1
        else:
            # Not in today's scrape — keep if not stale
            last_seen_str = old_car.get("last_seen", old_car.get("scraped_at", today))
            try:
                last_seen_dt = datetime.fromisoformat(last_seen_str.replace("Z", "+00:00"))
            except Exception:
                last_seen_dt = stale_cutoff  # treat as stale if unparseable
            if last_seen_dt >= stale_cutoff:
                merged.append({**old_car, "last_seen": old_car.get("last_seen", today)})
                kept_count += 1
            else:
                removed_count += 1

    # Add brand-new cars not in existing
    for sid, car in translated_fresh.items():
        if sid not in existing:
            merged.append({**car, "first_seen": today, "last_seen": today})
            new_count += 1

    print(f"✅ New: {new_count}  Updated: {updated_count}  Kept: {kept_count}  Removed (stale): {removed_count}")
    print(f"📊 Total after merge: {len(merged)}")

    # Filter min price
    min_price = config.get("price", {}).get("min_total_usd", 0)
    if min_price:
        before = len(merged)
        merged = [c for c in merged if (c.get("total_usd") or 0) >= min_price]
        print(f"🚫 Filtered {before - len(merged)} cars below ${min_price} (kept {len(merged)})")

    _export(merged, OUTPUT_PATH)
    return merged


def _merge(list_car: dict, detail: dict) -> dict:
    return {
        **list_car,
        "images": detail.get("images") or _fallback_images(list_car),
        "description_ja": detail.get("description_ja"),
        "specs": detail.get("specs") or {},
    }


def _export(cars: list[dict], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "updated_at": _utc_now(),
        "total": len(cars),
        "cars": _normalize_specs(cars),
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def _normalize_specs(cars: list[dict]) -> list[dict]:
    spec_keys = sorted({key for car in cars for key in (car.get("specs") or {})})
    if not spec_keys:
        return cars
    normalized = []
    for car in cars:
        specs = car.get("specs") or {}
        normalized.append({
            **car,
            "specs": {key: str(specs.get(key) or "") for key in spec_keys},
        })
    return normalized


def _fallback_images(list_car: dict) -> list[str]:
    thumbnail = list_car.get("thumbnail")
    return [thumbnail] if thumbnail else []


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
