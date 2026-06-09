## Task: Detail Page Scraper + Pagination + Multi-Model Pipeline
**Status**: ready
**Assigned to**: codex
**Day**: 2 of 6
**Project root**: /Users/yuyanli/used-car-site

---

## Background

Day 1 delivered a working list page scraper for Toyota Prado (30 cars per
page, all fields extracted correctly). Day 2 builds on that foundation:

1. Scrape detail pages to get full images and specs
2. Implement pagination so we get all pages, not just page 1
3. Scrape all 3 models (Prado, Hilux, HiAce) in one pipeline run
4. Save results to a JSON file for the frontend

---

## Objective

1. Write `scraper/detail_scraper.py` — fetches a detail page URL and
   returns additional fields not available on the list page
2. Implement `get_next_page_url()` in `scraper/carsensor_scraper.py`
3. Write `scraper/pipeline.py` — orchestrates scraping all models,
   merges list + detail data, saves to `website/public/data/cars.json`
4. Add tests for all new code

---

## Step 1 — Detail page scraper

Fetch a detail page (e.g. `https://www.carsensor.net/usedcar/detail/AU6956752830/index.html`)
and extract:

| Field | What to extract |
|-------|----------------|
| `images` | All car photo URLs (list, max 10). Look for `<img>` tags inside the main photo area. |
| `description_ja` | Free-text condition notes / seller comments (often in a `.carFeature` or similar block) |
| `specs` | Dict of key→value for the spec table (e.g. `{"排気量": "2800cc", "燃料": "ディーゼル", "車体色": "パールホワイト", ...}`) |

Create `scraper/detail_scraper.py`:

```python
# scraper/detail_scraper.py
"""
Fetches a carsensor.net detail page and extracts full images,
specs table, and seller description.
"""

from __future__ import annotations
import time
import requests
from bs4 import BeautifulSoup
from .carsensor_scraper import load_config, get_headers


def scrape_detail(detail_url: str) -> dict:
    """
    Fetch a detail page and return supplementary fields.

    Returns dict with keys:
        images: list[str]        — absolute image URLs, max 10
        description_ja: str | None  — seller comment text
        specs: dict[str, str]    — spec table key/value pairs

    On any HTTP or parse error, returns empty defaults (never raises).
    """
    ...
```

**Requirements:**
- On HTTP error or timeout → return `{"images": [], "description_ja": None, "specs": {}}`
- Deduplicate image URLs, keep order
- Images must be absolute URLs
- `specs` keys should be the Japanese label text (e.g. "排気量", "走行距離")
- Add `time.sleep(1)` before the request (detail pages are slower to scrape)

---

## Step 2 — Implement pagination

In `scraper/carsensor_scraper.py`, implement `get_next_page_url()` which
currently stubs to `return None`.

carsensor.net pagination: look for a "次へ" (next) link or a page number
nav element. The URL pattern uses `?PN=2`, `?PN=3` etc.

Also add a new function `scrape_all_pages()`:

```python
def scrape_all_pages(url: str, max_pages: int | None = None) -> list[dict]:
    """
    Scrape all pages for a given model URL.

    Args:
        url: Base search URL
        max_pages: Cap from config.yaml (scraper.max_pages per model).
                   If None, read from config.yaml.

    Returns:
        Deduplicated list of car dicts (dedup by source_id).
    """
    ...
```

---

## Step 3 — Pipeline

Create `scraper/pipeline.py`:

```python
# scraper/pipeline.py
"""
Orchestrates scraping all configured models, merges list + detail data,
and exports to website/public/data/cars.json.
"""

from __future__ import annotations
import json
import time
from datetime import datetime, timezone
from pathlib import Path

from .carsensor_scraper import load_config, scrape_all_pages
from .detail_scraper import scrape_detail


def run(skip_details: bool = False) -> list[dict]:
    """
    Full pipeline: scrape all models → fetch details → export JSON.

    Args:
        skip_details: If True, skip detail page fetching (faster for testing).

    Returns:
        List of fully enriched car dicts.
    """
    ...


def _merge(list_car: dict, detail: dict) -> dict:
    """Merge detail page fields into a list page car dict."""
    ...


def _export(cars: list[dict], path: Path) -> None:
    """Write cars list to JSON with metadata wrapper."""
    ...
```

**JSON output format** (`website/public/data/cars.json`):

```json
{
  "updated_at": "2026-06-09T01:00:00Z",
  "total": 87,
  "cars": [
    {
      "source_id": "AU6956752830",
      "model": "prado",
      "title_ja": "ランドクルーザープラド 2.8 TX ...",
      "year": 2015,
      "mileage_km": 82000,
      "price_jpy": 2989000,
      "grade_ja": "TX",
      "color_ja": "真珠白",
      "images": ["https://...jpg", "https://...jpg"],
      "description_ja": "...",
      "specs": {"排気量": "2800cc", "燃料": "ディーゼル"},
      "detail_url": "https://www.carsensor.net/...",
      "scraped_at": "2026-06-09T01:00:00Z"
    }
  ]
}
```

**Pipeline requirements:**
- Each model's cars must include a `"model"` field (e.g. `"prado"`)
- Add `"scraped_at"` timestamp (ISO 8601 UTC) to each car
- Between each detail page request add `time.sleep(1)` — be polite
- `skip_details=True` must work for fast testing (no detail HTTP requests)
- Print progress: `Scraping prado page 1/5...`, `Fetching details 1/30...`

---

## Step 4 — Update main.py

Wire the pipeline into `main.py` so `python main.py` runs the full scrape:

```python
from scraper.pipeline import run as run_pipeline

def run_pipeline_step():
    print("📡 Running scraper pipeline...")
    cars = run_pipeline()
    print(f"✅ {len(cars)} cars exported to website/public/data/cars.json")
```

Replace the placeholder comments in `main.py` Steps 1-5 with a single call
to `run_pipeline()`.

---

## Step 5 — Tests

Add to `tests/test_scraper.py`:

```python
class TestPagination:
    """Test pagination logic — no HTTP needed."""

    def test_page_url_page1(self):
        from scraper.carsensor_scraper import _build_page_url
        url = "https://www.carsensor.net/usedcar/search.php?CARC=TO_S152"
        assert _build_page_url(url, 1) == url  # page 1 = no PN param

    def test_page_url_page2(self):
        from scraper.carsensor_scraper import _build_page_url
        url = "https://www.carsensor.net/usedcar/search.php?CARC=TO_S152"
        result = _build_page_url(url, 2)
        assert "PN=2" in result

class TestPipeline:
    """Test pipeline with skip_details=True — no detail HTTP requests."""

    def test_pipeline_skip_details(self):
        from scraper.pipeline import run
        time.sleep(2)
        cars = run(skip_details=True)
        assert len(cars) > 0
        assert all("model" in c for c in cars)
        assert all("scraped_at" in c for c in cars)
        assert all("source_id" in c for c in cars)

    def test_json_output_exists(self):
        from pathlib import Path
        output = Path("website/public/data/cars.json")
        assert output.exists()
        import json
        data = json.loads(output.read_text())
        assert "cars" in data
        assert "updated_at" in data
        assert data["total"] == len(data["cars"])
```

---

## Output Files

```
scraper/detail_scraper.py     ← NEW
scraper/pipeline.py           ← NEW
tests/test_scraper.py         ← UPDATED (add TestPagination + TestPipeline)
main.py                       ← UPDATED (call pipeline.run())
scraper/carsensor_scraper.py  ← UPDATED (implement get_next_page_url + scrape_all_pages)
website/public/data/cars.json ← GENERATED (after pipeline runs)
```

---

## Hard Constraints

1. **Respect config.yaml** — `max_pages` per model comes from
   `target_models[].max_pages` in config.yaml, not hardcoded
2. **Never crash on a bad detail page** — `scrape_detail()` must always
   return the default empty dict on any error
3. **Deduplication** — if the same `source_id` appears on multiple pages,
   keep only the first occurrence
4. **model field** — every car dict must have `"model"` set to the model
   name key from config.yaml (e.g. `"prado"`, `"hilux"`, `"hiace"`)
5. **No new dependencies** — use only what's already in requirements.txt

---

## Acceptance Criteria

```bash
# Unit + pagination tests (no HTTP)
python3 -m pytest tests/test_scraper.py::TestParsers -v
python3 -m pytest tests/test_scraper.py::TestPagination -v

# Pipeline test with skip_details (list pages only, ~30s)
python3 -m pytest tests/test_scraper.py::TestPipeline -v

# Verify JSON output
python3 -c "
import json
from pathlib import Path
data = json.loads(Path('website/public/data/cars.json').read_text())
print(f'Total cars: {data[\"total\"]}')
print(f'Models: {set(c[\"model\"] for c in data[\"cars\"])}')
print(f'Updated at: {data[\"updated_at\"]}')
print('First car:', list(data['cars'][0].keys()))
"
```

Expected output:
```
Total cars: 87        ← (approximate, depends on live listings)
Models: {'prado', 'hilux', 'hiace'}
Updated at: 2026-06-09T...Z
First car: ['source_id', 'model', 'title_ja', 'year', ...]
```
