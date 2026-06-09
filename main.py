"""
JP Used Cars — Main Pipeline Entry Point
Orchestrates: scrape → translate → convert prices → save → export JSON
"""

import yaml
from datetime import datetime

from scraper.pipeline import run as run_scraper_pipeline


def load_config():
    with open("config.yaml") as f:
        return yaml.safe_load(f)


def run_pipeline():
    print(f"\n{'='*50}")
    print(f"  JP Used Cars Pipeline — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*50}\n")

    print("📡 Running scraper pipeline...")
    cars = run_scraper_pipeline()
    print(f"✅ {len(cars)} cars exported to website/public/data/cars.json")


if __name__ == "__main__":
    run_pipeline()
