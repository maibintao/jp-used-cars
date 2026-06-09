## Task: Research carsensor.net Structure & Build Scraper Foundation
**Status**: ready
**Assigned to**: codex
**Day**: 1 of 6
**Project root**: /Users/yuyanli/used-car-site

---

## Background

This is a Japanese used car listing website project.
We scrape carsensor.net (Japan's largest used car platform), translate
listings to English, convert prices to USD, and display them for
international buyers.

Day 1 goal: fetch the real HTML from carsensor.net, discover the correct
CSS selectors, and write the scraper foundation that Day 2 will build on.

---

## Objective

1. Fetch a real carsensor.net listing page using requests
2. Inspect the HTML to find the correct CSS selectors for each field
3. Write `scraper/selectors.py` documenting all selectors
4. Write `scraper/carsensor_scraper.py` with function stubs + docstrings
5. Write a passing smoke test in `tests/test_scraper.py`

---

## Step 1 — Fetch the page and inspect HTML

Fetch this URL:
```
https://www.carsensor.net/usedcar/search.php?BRDC=TO&CARC=TO_028_
```

Use this exact User-Agent (do NOT hardcode it — read from config.yaml):
```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36
```

Add these headers too:
```python
headers = {
    "User-Agent": ...,          # from config.yaml
    "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Referer": "https://www.carsensor.net/",
}
```

If the page returns a CAPTCHA or 403, try adding a `time.sleep(3)` and
retry once. If it still fails, write the selectors.py with placeholder
comments and note the issue.

---

## Step 2 — Discover CSS selectors

Inspect the HTML and fill in selectors for each field below.

**What to look for:**
- The repeating car card element (there should be 10–20 per page)
- Inside each card, extract these fields:

| Field | Japanese label | What to extract |
|-------|---------------|-----------------|
| `source_id` | — | Unique ID from the URL or data attribute |
| `title_ja` | 車名・グレード | Car name string, e.g. "ランドクルーザープラド TX" |
| `year` | 年式 | Integer, e.g. 2021 |
| `mileage_km` | 走行距離 | Integer km, e.g. 45000 |
| `price_jpy` | 価格 | Integer JPY — convert 万円 to full yen (198万 → 1980000) |
| `grade_ja` | グレード | Grade string or None |
| `color_ja` | 色 | Color string or None |
| `thumbnail` | — | src of the first car image |
| `detail_url` | — | href of the link to the detail page (absolute URL) |

**Price parsing rules:**
- "198万円" → `1980000`
- "198.5万円" → `1985000`
- "応談" (negotiable) or missing → `None`
- Always store as full JPY integer, never as float

**Mileage parsing rules:**
- "4.5万km" → `45000`
- "1.2万km" → `12000`
- "－" or missing → `None`

**Year parsing rules:**
- "2021年" or "2021(R3)年" → `2021`
- Missing → `None`

---

## Step 3 — Write scraper/selectors.py

```python
# scraper/selectors.py
"""
CSS selectors and parsing config for carsensor.net listing pages.
Last verified: [today's date]
"""

SELECTORS = {
    # The repeating card element on the listing page
    "car_card": "???",          # fill in after inspecting HTML

    # Fields within each card
    "title_ja":   "???",
    "year":       "???",
    "mileage":    "???",
    "price":      "???",
    "grade":      "???",
    "color":      "???",
    "thumbnail":  "???",
    "detail_url": "???",
}

# Base URL for constructing absolute links
BASE_URL = "https://www.carsensor.net"

# How to extract source_id from the detail URL
# e.g. /usedcar/detail/CS123456789/ → "CS123456789"
SOURCE_ID_PATTERN = r"/detail/(CS\w+)/"
```

Fill in every `"???"` with the real selector you discovered in Step 2.
Add a comment above each selector explaining what HTML it matches.

---

## Step 4 — Write scraper/carsensor_scraper.py (stubs only)

Implement the three functions below. For Day 1, `scrape_listing_page`
and `parse_car_card` should be FULLY IMPLEMENTED (not stubs) since we
have the selectors. `get_next_page_url` can be a stub.

```python
# scraper/carsensor_scraper.py
"""
carsensor.net listing page scraper.
Fetches car listing pages and parses each car card into a dict.
"""

import re
import time
import random
import requests
import yaml
from bs4 import BeautifulSoup
from pathlib import Path
from .selectors import SELECTORS, BASE_URL, SOURCE_ID_PATTERN


def load_config() -> dict:
    """Load config.yaml from project root."""
    ...


def get_headers(config: dict) -> dict:
    """Return request headers with a randomly selected User-Agent."""
    ...


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
    ...


def parse_car_card(item) -> dict | None:
    """
    Parse a single BeautifulSoup car card element into a dict.

    Returns None if the card is malformed or missing required fields
    (source_id and price_jpy are required; all others can be None).
    """
    ...


def get_next_page_url(soup: BeautifulSoup, current_page: int) -> str | None:
    """
    Return the URL for the next page, or None if on the last page.
    (Stub for Day 1 — implement in Day 2)
    """
    return None  # TODO: implement in Day 2
```

**Implementation requirements for `parse_car_card`:**
- Use the helper functions below for numeric parsing
- Never crash on missing fields — always return `None` for that field
- Return `None` for the whole card only if `source_id` is missing

**Add these helper functions (not in the public API, prefixed with `_`):**

```python
def _parse_price_jpy(text: str | None) -> int | None:
    """Convert "198万円" → 1980000. Returns None for non-numeric."""
    ...

def _parse_mileage_km(text: str | None) -> int | None:
    """Convert "4.5万km" → 45000. Returns None for "－" or missing."""
    ...

def _parse_year(text: str | None) -> int | None:
    """Extract 4-digit year from strings like "2021年" or "2021(R3)年"."""
    ...
```

---

## Step 5 — Write tests/test_scraper.py

```python
# tests/test_scraper.py
"""Smoke tests for the carsensor.net scraper."""

import time
import pytest
from scraper.carsensor_scraper import scrape_listing_page, _parse_price_jpy, _parse_mileage_km, _parse_year

PRADO_URL = "https://www.carsensor.net/usedcar/search.php?BRDC=TO&CARC=TO_028_"

class TestParsers:
    """Unit tests for parsing helpers — no HTTP needed."""

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
    """Integration test — makes real HTTP request to carsensor.net."""

    def test_scrape_prado_page1(self):
        time.sleep(2)  # be polite
        cars = scrape_listing_page(PRADO_URL, page=1)

        assert len(cars) >= 10, f"Expected ≥10 cars, got {len(cars)}"

        required_keys = {"source_id", "title_ja", "price_jpy", "year", "mileage_km"}
        for car in cars:
            assert required_keys.issubset(car.keys()), f"Missing keys in: {car}"

        # At least half should have a non-None price
        priced = [c for c in cars if c["price_jpy"] is not None]
        assert len(priced) >= 5, f"Too few priced cars: {len(priced)}"
```

---

## Output Files (must all be created)

```
scraper/__init__.py           ← empty
scraper/selectors.py          ← selectors dict + BASE_URL + SOURCE_ID_PATTERN
scraper/carsensor_scraper.py  ← full implementation of parse_car_card +
                                 scrape_listing_page, stub for get_next_page_url
tests/__init__.py             ← empty
tests/test_scraper.py         ← TestParsers (8 unit tests) + TestListingPage
```

---

## Hard Constraints

1. **No hardcoded values** — User-Agent, URLs, and delays must come from
   `config.yaml`. Load it via `load_config()` at function call time,
   not at module import time.

2. **Absolute URLs** — `detail_url` must be a full URL, e.g.
   `https://www.carsensor.net/usedcar/detail/CS123456789/`
   not a relative path like `/usedcar/detail/CS123456789/`

3. **Price as integer** — always `int`, never `float`. `198.5万` → `1985000`.

4. **Graceful on missing fields** — a card missing color or grade is fine;
   only skip the card entirely if `source_id` cannot be extracted.

5. **No Playwright** — requests + BeautifulSoup4 only for Day 1.

---

## Acceptance Criteria

Run these commands — all must pass:

```bash
# Unit tests (no HTTP, must be instant)
python -m pytest tests/test_scraper.py::TestParsers -v

# Integration test (makes real HTTP request, takes ~5s)
python -m pytest tests/test_scraper.py::TestListingPage -v

# Quick sanity check
python -c "
from scraper.carsensor_scraper import scrape_listing_page
cars = scrape_listing_page('https://www.carsensor.net/usedcar/search.php?BRDC=TO&CARC=TO_028_')
print(f'Got {len(cars)} cars')
print('First car:', cars[0])
"
```

Expected output of the sanity check:
```
Got 20 cars          ← (or however many are on one page)
First car: {'source_id': 'CS...', 'title_ja': '...', 'year': 2021, ...}
```
