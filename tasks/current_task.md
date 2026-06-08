## Task: Research carsensor.net Structure & Write Selectors
**Status**: ready
**Assigned to**: codex
**Day**: 1 of 6
**Context files**: config.yaml, scraper/selectors.py (to be created)

---

## Objective

Fetch the Toyota Land Cruiser Prado listing page from carsensor.net, parse
the HTML structure, and write a `selectors.py` config file that maps each
data field to the correct CSS selector or parsing logic.

Also create the scraper skeleton `scraper/carsensor_scraper.py` with
all functions stubbed and documented.

---

## Steps

1. Fetch this URL with requests + a realistic User-Agent:
   `https://www.carsensor.net/usedcar/search.php?BRDC=TO&CARC=TO_028_`

2. Inspect the HTML and find the CSS selectors for:
   - Car listing card container (the repeating item)
   - Car title / model name
   - Year (年式)
   - Mileage (走行距離) — numeric value in km
   - Price (価格) — numeric value in JPY, in 万円
   - Grade (グレード)
   - Color (色)
   - Thumbnail image URL
   - Link to detail page

3. Write `scraper/selectors.py` with a dict `SELECTORS` containing all
   discovered selectors, plus comments explaining the HTML structure.

4. Write `scraper/carsensor_scraper.py` with these stubbed functions
   (full implementation comes in the next task):
   - `scrape_listing_page(url: str, page: int) -> list[dict]`
   - `parse_car_card(item) -> dict`
   - `get_next_page_url(soup, current_page: int) -> str | None`

5. Write `tests/test_scraper.py` with one smoke test:
   - Fetches page 1 of Prado URL
   - Asserts at least 10 listings are returned
   - Asserts each listing has: source_id, title_ja, price_jpy, year, mileage_km

---

## Output Files

- `scraper/selectors.py`      ← NEW
- `scraper/carsensor_scraper.py`  ← NEW (stubs only)
- `scraper/__init__.py`       ← NEW (empty)
- `tests/__init__.py`         ← NEW (empty)
- `tests/test_scraper.py`     ← NEW

---

## Constraints

- Read User-Agent list from `config.yaml` (use the first one for research)
- Add `time.sleep(2)` between any real HTTP requests in tests
- Price is in 万円 on carsensor — store as full JPY integer
  (e.g. "198万円" → 1980000)
- If a field is missing on a card, return `None` for that field (don't crash)
- Do NOT implement pagination yet — stubs only

---

## Acceptance Criteria

- [ ] `scraper/selectors.py` exists and `SELECTORS` dict is populated
- [ ] `scraper/carsensor_scraper.py` exists with all 3 functions present
- [ ] `python -m pytest tests/test_scraper.py -v` passes
- [ ] At least 10 cars returned in the smoke test
