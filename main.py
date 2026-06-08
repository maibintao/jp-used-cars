"""
JP Used Cars — Main Pipeline Entry Point
Orchestrates: scrape → translate → convert prices → save → export JSON
"""

import json
import yaml
from datetime import datetime
from pathlib import Path


def load_config():
    with open("config.yaml") as f:
        return yaml.safe_load(f)


def run_pipeline():
    config = load_config()
    print(f"\n{'='*50}")
    print(f"  JP Used Cars Pipeline — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*50}\n")

    # Step 1: Scrape
    print("📡 Step 1: Scraping carsensor.net...")
    # from scraper.carsensor_scraper import scrape_all_models
    # raw_cars = scrape_all_models(config)

    # Step 2: Get exchange rate
    print("💱 Step 2: Fetching JPY/USD exchange rate...")
    # from processor.price_converter import get_live_rate, process_price
    # rate = get_live_rate()

    # Step 3: Translate + convert
    print("🌐 Step 3: Translating and converting prices...")
    # from processor.translator import translate_car
    # processed = [translate_car(car) for car in raw_cars]

    # Step 4: Save to DB
    print("💾 Step 4: Saving to database...")
    # from database.db import upsert_cars
    # upsert_cars(processed)

    # Step 5: Export JSON
    print("📤 Step 5: Exporting JSON for website...")
    output_path = Path("website/public/data/cars.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    # with open(output_path, "w") as f:
    #     json.dump(processed, f, ensure_ascii=False, indent=2)

    print("\n✅ Pipeline complete! (modules not yet implemented)")


if __name__ == "__main__":
    run_pipeline()
