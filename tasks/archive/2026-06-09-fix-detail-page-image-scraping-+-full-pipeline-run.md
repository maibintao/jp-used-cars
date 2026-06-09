## Task: Fix Detail Page Image Scraping + Full Pipeline Run
**Status**: ready
**Assigned to**: codex
**Day**: 5.5 (hotfix)
**Project root**: /Users/yuyanli/used-car-site

---

## Problem

Currently every car in `website/public/data/cars.json` has exactly 1 image
(the list-page thumbnail). The detail scraper exists but was never run with
real HTTP requests — all pipeline runs used `skip_details=True`.

The fix: verify the detail page image selectors work, then run the full
pipeline with `skip_details=False` to populate real multi-image data.

---

## Step 1 — Diagnose the detail scraper

Fetch one real detail page and print what the current scraper returns:

```python
# Run this as a diagnostic script (don't save to file)
from scraper.detail_scraper import scrape_detail
result = scrape_detail("https://www.carsensor.net/usedcar/detail/AU6956752830/index.html")
print("images:", result["images"])
print("image count:", len(result["images"]))
print("specs keys:", list(result["specs"].keys())[:5])
print("description:", result["description_ja"][:100] if result["description_ja"] else None)
```

If `images` is empty or has only 1 item, the selector is wrong.

---

## Step 2 — Fix scraper/detail_scraper.py

Open `scraper/detail_scraper.py` and fix the image extraction logic.

On a carsensor.net detail page, images are typically in:
- A main photo block with multiple `<img>` tags
- OR a JavaScript-rendered gallery where images appear in `<noscript>` tags
- OR `data-src` / `data-original` lazy-load attributes

**Strategy to find all images:**

```python
def _extract_images(soup: BeautifulSoup) -> list[str]:
    """
    Try multiple selector strategies to find all car photos.
    Returns deduplicated list of absolute URLs, max 10.
    """
    candidates = []

    # Strategy 1: noscript tags often contain the real img src
    for noscript in soup.find_all("noscript"):
        inner = BeautifulSoup(noscript.get_text(), "html.parser")
        for img in inner.find_all("img"):
            src = img.get("src") or img.get("data-src")
            if src and _is_car_photo(src):
                candidates.append(src)

    # Strategy 2: img tags with data-src or data-original (lazy load)
    for img in soup.find_all("img"):
        src = (
            img.get("data-original")
            or img.get("data-src")
            or img.get("src")
        )
        if src and _is_car_photo(src):
            candidates.append(src)

    # Deduplicate, convert to absolute, limit to 10
    seen = set()
    result = []
    for src in candidates:
        abs_src = _absolute_url(src)
        if abs_src and abs_src not in seen:
            seen.add(abs_src)
            result.append(abs_src)
        if len(result) >= 10:
            break

    return result


def _is_car_photo(url: str) -> bool:
    """Filter out icons, logos, banners — keep only car photos."""
    url_lower = url.lower()
    # carsensor car photos are on ccsrpcma.carsensor.net or similar CDNs
    # and end in .jpg or .jpeg
    is_photo_cdn = "carsensor" in url_lower or "ccsrpcma" in url_lower
    is_image = any(url_lower.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"])
    # Exclude tiny icons (w= or width= params suggesting small size)
    is_not_icon = "icon" not in url_lower and "logo" not in url_lower
    return (is_photo_cdn or is_image) and is_not_icon


def _absolute_url(url: str) -> str | None:
    from urllib.parse import urljoin
    from .selectors import BASE_URL
    if not url or url.startswith("data:"):
        return None
    if url.startswith("//"):
        return "https:" + url
    if url.startswith("http"):
        return url
    return urljoin(BASE_URL, url)
```

Update `scrape_detail()` to use `_extract_images(soup)` instead of whatever
it currently does for images.

---

## Step 3 — Verify fix works

After updating `detail_scraper.py`, run the diagnostic again:

```python
from scraper.detail_scraper import scrape_detail
result = scrape_detail("https://www.carsensor.net/usedcar/detail/AU6956752830/index.html")
print("image count:", len(result["images"]))
for url in result["images"]:
    print(" ", url)
```

**Expected:** 3–10 images per car (carsensor typically shows 5-8 photos).
If still 0 or 1, inspect the raw HTML and adjust selectors before proceeding.

---

## Step 4 — Run full pipeline with details

Once the image selector works, run the complete pipeline:

```python
# This will take 5-10 minutes — it fetches 90 detail pages
from scraper.pipeline import run
cars = run(skip_details=False)

# Verify results
img_counts = [len(c['images']) for c in cars]
print(f"Total cars: {len(cars)}")
print(f"Cars with 1 image:  {img_counts.count(1)}")
print(f"Cars with 2+ images: {sum(1 for x in img_counts if x >= 2)}")
print(f"Max images: {max(img_counts)}")
print(f"Avg images: {sum(img_counts)/len(img_counts):.1f}")
```

**Expected result:**
- Most cars should have 3–8 images
- Cars with only 1 image should be < 10 (some listings genuinely have few photos)
- `website/public/data/cars.json` updated with new image arrays

---

## Step 5 — Update pipeline rate limiting

The full pipeline fetches 90+ detail pages. Add polite delays to avoid
getting blocked:

In `scraper/pipeline.py`, ensure there is a `time.sleep(1)` between each
detail page request (it should already be there — verify it is).

Also add a progress indicator:
```
Scraping prado page 1/5...
Fetching details 1/30 for prado...
Fetching details 2/30 for prado...
...
```

---

## Output Files

```
scraper/detail_scraper.py     ← UPDATED (fix _extract_images)
website/public/data/cars.json ← REGENERATED (now with multiple images per car)
```

---

## Hard Constraints

1. **Do NOT change any frontend files** — only scraper and cars.json
2. **Do NOT use skip_details=True** for the final run — must fetch real detail pages
3. **Max 10 images per car** — don't store more
4. **time.sleep(1) between detail requests** — be polite to carsensor.net
5. **On any detail page error** — log the error, use thumbnail fallback, continue

---

## Acceptance Criteria

```bash
cd /Users/yuyanli/used-car-site

python3 -c "
import json
from pathlib import Path
data = json.loads(Path('website/public/data/cars.json').read_text())
cars = data['cars']
img_counts = [len(c['images']) for c in cars]
print(f'Total cars: {len(cars)}')
print(f'Cars with 1 image:  {img_counts.count(1)}')
print(f'Cars with 2+ images: {sum(1 for x in img_counts if x >= 2)}')
print(f'Max images: {max(img_counts)}')
print(f'Avg images: {sum(img_counts)/len(img_counts):.1f}')
# Must have majority with 2+ images
assert sum(1 for x in img_counts if x >= 2) > len(cars) * 0.7, 'Too few multi-image cars'
print('PASS: majority of cars have multiple images')
"

# Frontend build must still pass
cd website && npm run build
```
