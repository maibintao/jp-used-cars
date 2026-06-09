"""Smoke tests for the carsensor.net scraper."""

import time

from bs4 import BeautifulSoup

from scraper.carsensor_scraper import (
    _parse_mileage_km,
    _parse_price_jpy,
    _parse_year,
    scrape_listing_page,
)

PRADO_URL = "https://www.carsensor.net/usedcar/search.php?BRDC=TO&CARC=TO_028_"


class TestParsers:
    """Unit tests for parsing helpers - no HTTP needed."""

    def test_parse_price_full(self):
        assert _parse_price_jpy("198万円") == 1980000

    def test_parse_price_decimal(self):
        assert _parse_price_jpy("198.5万円") == 1985000

    def test_parse_price_negotiable(self):
        assert _parse_price_jpy("応談") is None

    def test_parse_price_none(self):
        assert _parse_price_jpy(None) is None

    def test_parse_mileage_normal(self):
        assert _parse_mileage_km("4.5万km") == 45000

    def test_parse_mileage_dash(self):
        assert _parse_mileage_km("－") is None

    def test_parse_year_simple(self):
        assert _parse_year("2021年") == 2021

    def test_parse_year_with_wareki(self):
        assert _parse_year("2021(R3)年") == 2021


class TestListingPage:
    """Integration test - makes real HTTP request to carsensor.net."""

    def test_scrape_prado_page1(self):
        time.sleep(2)  # be polite
        cars = scrape_listing_page(PRADO_URL, page=1)

        assert len(cars) >= 10, f"Expected >=10 cars, got {len(cars)}"

        required_keys = {"source_id", "title_ja", "price_jpy", "year", "mileage_km"}
        for car in cars:
            assert required_keys.issubset(car.keys()), f"Missing keys in: {car}"

        priced = [c for c in cars if c["price_jpy"] is not None]
        assert len(priced) >= 5, f"Too few priced cars: {len(priced)}"


class TestPagination:
    """Test pagination logic - no HTTP needed."""

    def test_page_url_page1(self):
        from scraper.carsensor_scraper import _build_page_url

        url = "https://www.carsensor.net/usedcar/search.php?CARC=TO_S152"
        assert _build_page_url(url, 1) == url

    def test_page_url_page2(self):
        from scraper.carsensor_scraper import _build_page_url

        url = "https://www.carsensor.net/usedcar/search.php?CARC=TO_S152"
        result = _build_page_url(url, 2)
        assert "PN=2" in result

    def test_next_page_url_from_link(self):
        from scraper.carsensor_scraper import get_next_page_url

        soup = BeautifulSoup(
            '<a href="/usedcar/search.php?CARC=TO_S152&PN=2">次へ</a>',
            "lxml",
        )
        assert get_next_page_url(soup, 1) == "https://www.carsensor.net/usedcar/search.php?CARC=TO_S152&PN=2"


class TestDetailScraper:
    """Test detail scraper failure behavior - no HTTP needed."""

    def test_detail_http_error_returns_empty_defaults(self, monkeypatch):
        import requests
        from scraper.detail_scraper import scrape_detail

        def raise_timeout(*args, **kwargs):
            raise requests.Timeout("timeout")

        monkeypatch.setattr("scraper.detail_scraper.time.sleep", lambda *_: None)
        monkeypatch.setattr("scraper.detail_scraper.requests.get", raise_timeout)

        assert scrape_detail("https://www.carsensor.net/usedcar/detail/AU000/index.html") == {
            "images": [],
            "description_ja": None,
            "specs": {},
        }


class TestPipeline:
    """Test pipeline with skip_details=True - no detail HTTP requests."""

    def test_pipeline_skip_details(self):
        from scraper.pipeline import run

        time.sleep(2)
        cars = run(skip_details=True)
        assert len(cars) > 0
        assert all("model" in c for c in cars)
        assert all("scraped_at" in c for c in cars)
        assert all("source_id" in c for c in cars)

    def test_json_output_exists(self):
        import json
        from pathlib import Path

        output = Path("website/public/data/cars.json")
        assert output.exists()
        data = json.loads(output.read_text())
        assert "cars" in data
        assert "updated_at" in data
        assert data["total"] == len(data["cars"])
