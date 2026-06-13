#!/usr/bin/env python3
"""
Validates cars.json output after pipeline run.
Exits with code 1 if validation fails (causes GitHub Actions to fail).
"""
import json
import sys
from pathlib import Path
from datetime import datetime, timezone

CARS_JSON = Path("website/public/data/cars.json")
MIN_CARS = 50          # Alert if we get fewer than this
MIN_AVG_IMAGES = 3.0   # Alert if average images drops below this
REQUIRED_FIELDS = {
    "source_id", "model", "title_ja", "year",
    "price_jpy", "price_usd", "total_usd",
    "images", "detail_url", "scraped_at",
}


def main():
    if not CARS_JSON.exists():
        print("❌ cars.json not found")
        sys.exit(1)

    data = json.loads(CARS_JSON.read_text())
    cars = data.get("cars", [])
    errors = []

    # Check total count
    if len(cars) < MIN_CARS:
        errors.append(f"Only {len(cars)} cars (expected ≥ {MIN_CARS})")

    # Check required fields
    for i, car in enumerate(cars[:5]):  # spot-check first 5
        missing = REQUIRED_FIELDS - set(car.keys())
        if missing:
            errors.append(f"Car {i} missing fields: {missing}")

    # Check models present
    models = {c["model"] for c in cars}
    for m in ["prado", "hilux", "hiace", "harrier", "rav4"]:
        if m not in models:
            errors.append(f"Model '{m}' missing from output")

    # Check image counts
    img_counts = [len(c.get("images", [])) for c in cars]
    avg_images = sum(img_counts) / len(img_counts) if img_counts else 0
    if avg_images < MIN_AVG_IMAGES:
        errors.append(f"Avg images {avg_images:.1f} < {MIN_AVG_IMAGES}")

    # Check prices converted
    priced = [c for c in cars if c.get("price_usd") is not None]
    if len(priced) < len(cars) * 0.7:
        errors.append(f"Only {len(priced)}/{len(cars)} cars have USD price")

    if errors:
        print("❌ Health check FAILED:")
        for e in errors:
            print(f"   • {e}")
        sys.exit(1)

    print(f"✅ Health check passed:")
    print(f"   • {len(cars)} cars across {len(models)} models")
    print(f"   • {avg_images:.1f} avg images per car")
    print(f"   • {len(priced)} cars with USD price")
    print(f"   • Updated at: {data.get('updated_at')}")


if __name__ == "__main__":
    main()
