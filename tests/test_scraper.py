"""Smoke tests for the carsensor.net scraper."""

import time

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
