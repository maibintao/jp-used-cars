## Task: Translation + Price Conversion + Enriched JSON
**Status**: ready
**Assigned to**: codex
**Day**: 3 of 6
**Project root**: /Users/yuyanli/used-car-site

---

## Background

Day 2 produced `website/public/data/cars.json` with 90 cars in Japanese,
prices in JPY. Day 3 adds the processing layer that makes the data usable
for international buyers:

1. Translate Japanese fields to English
2. Convert JPY → USD using live exchange rate
3. Add shipping cost to produce a total FOB price
4. Output an enriched `cars.json` the frontend can use directly

---

## Objective

1. Write `processor/translator.py` — Japanese → English translation
2. Write `processor/price_converter.py` — JPY→USD + shipping
3. Write `processor/vocabulary.py` — fixed JA→EN lookup table
4. Update `scraper/pipeline.py` to call the processor after scraping
5. The final `cars.json` must contain both `_ja` and `_en` fields

---

## Step 1 — Vocabulary table

Create `processor/vocabulary.py` with a comprehensive fixed lookup table.
This is used FIRST before falling back to Google Translate.

```python
# processor/vocabulary.py
"""
Fixed Japanese → English vocabulary for car listings.
Checked first before calling any translation API.
"""

VOCAB: dict[str, str] = {
    # Colors
    "白": "White",
    "黒": "Black",
    "シルバー": "Silver",
    "グレー": "Gray",
    "赤": "Red",
    "青": "Blue",
    "紺": "Navy",
    "緑": "Green",
    "ベージュ": "Beige",
    "ブラウン": "Brown",
    "ゴールド": "Gold",
    "オレンジ": "Orange",
    "黄": "Yellow",
    "真珠白": "Pearl White",
    "パールホワイト": "Pearl White",
    "ブラック": "Black",
    "ホワイト": "White",
    "パールブラック": "Pearl Black",

    # Fuel types
    "ガソリン": "Gasoline",
    "ディーゼル": "Diesel",
    "ハイブリッド": "Hybrid",
    "電気": "Electric",
    "LPG": "LPG",

    # Drive types
    "4WD": "4WD",
    "2WD": "2WD",
    "FF": "Front-Wheel Drive",
    "FR": "Rear-Wheel Drive",
    "AWD": "AWD",

    # Transmission
    "AT": "Automatic",
    "MT": "Manual",
    "CVT": "CVT",
    "オートマ": "Automatic",
    "マニュアル": "Manual",

    # Body types
    "SUV": "SUV",
    "セダン": "Sedan",
    "ミニバン": "Minivan",
    "ハッチバック": "Hatchback",
    "ワゴン": "Wagon",
    "クーペ": "Coupe",
    "トラック": "Truck",
    "バン": "Van",
    "軽自動車": "Kei Car",

    # Condition notes
    "修復歴なし": "No accident history",
    "修復歴あり": "Has accident history",
    "禁煙車": "Non-smoking",
    "ワンオーナー": "One owner",
    "記録簿あり": "Service records available",
    "車検整備付": "Inspection included",
    "左ハンドル": "Left-hand drive",
    "右ハンドル": "Right-hand drive",

    # Common features
    "ナビ": "Navigation",
    "バックカメラ": "Rear camera",
    "ETC": "ETC",
    "サンルーフ": "Sunroof",
    "レザーシート": "Leather seats",
    "クルーズコントロール": "Cruise control",
    "衝突軽減装置": "Collision mitigation",
    "LEDヘッドライト": "LED headlights",
    "アルミホイール": "Alloy wheels",
    "スマートキー": "Smart key",
    "Bluetooth": "Bluetooth",
    "パワーシート": "Power seats",
}


def lookup(text: str) -> str | None:
    """Return English translation if text matches a vocabulary entry, else None."""
    return VOCAB.get(text.strip()) if text else None


def translate_with_vocab(text: str) -> str:
    """
    Replace Japanese tokens in text using vocabulary table.
    Falls back to original text if no match found.
    Used for short fields like color and fuel type.
    """
    if not text:
        return text
    result = lookup(text)
    return result if result else text
```

---

## Step 2 — Translator

Create `processor/translator.py`:

```python
# processor/translator.py
"""
Translates Japanese car listing fields to English.
Uses vocabulary table first, Google Translate as fallback.
"""

from __future__ import annotations
from .vocabulary import lookup, translate_with_vocab


def translate_color(color_ja: str | None) -> str | None:
    """Translate color field using vocabulary table only."""
    if not color_ja:
        return None
    return translate_with_vocab(color_ja)


def translate_title(title_ja: str | None) -> str | None:
    """
    Translate car title to English.
    Strategy: keep model name as-is (already Roman), translate grade tokens.
    e.g. "ランドクルーザープラド 2.8 TX ディーゼルターボ 4WD" →
         "Land Cruiser Prado 2.8 TX Diesel Turbo 4WD"
    """
    if not title_ja:
        return None
    ...


def translate_description(description_ja: str | None) -> str | None:
    """
    Translate seller description using Google Translate.
    Returns None if description is None or empty.
    Falls back to original text if translation fails.
    """
    if not description_ja:
        return None
    ...


def translate_car(car: dict) -> dict:
    """
    Add *_en fields to a car dict. Never modifies *_ja fields.

    Adds:
        title_en, color_en, description_en
    """
    return {
        **car,
        "title_en": translate_title(car.get("title_ja")),
        "color_en": translate_color(car.get("color_ja")),
        "description_en": translate_description(car.get("description_ja")),
    }
```

**Translation strategy for `translate_title`:**
- Known Japanese car name mappings (hardcode these in the function):
  - "ランドクルーザープラド" → "Land Cruiser Prado"
  - "ハイラックス" → "Hilux"
  - "ハイエース" → "HiAce"
  - "アルファード" → "Alphard"
- Alphanumeric tokens (TX, 2.8, 4WD, etc.) keep as-is
- Japanese tokens → look up in VOCAB, keep original if not found
- Join with spaces

**For `translate_description`:**
- Use `deep_translator.GoogleTranslator(source="ja", target="en").translate(text)`
- If text > 500 chars, truncate to 500 before translating
- Wrap in try/except — return `None` on any error (don't crash pipeline)

---

## Step 3 — Price converter

Create `processor/price_converter.py`:

```python
# processor/price_converter.py
"""
Converts JPY prices to USD and adds shipping cost.
"""

from __future__ import annotations
import requests
from .vocabulary import lookup  # not used here, just showing import pattern


_cached_rate: float | None = None


def get_live_rate() -> float:
    """
    Fetch live JPY→USD rate from exchangerate-api.com (free tier).
    Caches the result for the duration of the process.
    Falls back to 0.0067 (~149 JPY/USD) if the request fails.
    """
    ...


def convert_price(price_jpy: int | None, shipping_usd: int) -> dict:
    """
    Convert a JPY price to USD and compute total with shipping.

    Args:
        price_jpy: Price in full JPY (e.g. 2989000), or None
        shipping_usd: Shipping cost in USD from config

    Returns:
        {
            "price_usd": int | None,      # car price in USD, rounded to $100
            "shipping_usd": int,           # shipping cost
            "total_usd": int | None,       # price_usd + shipping_usd
            "exchange_rate": float,        # rate used
        }
    """
    ...


def process_car_price(car: dict, config: dict) -> dict:
    """
    Add price fields to a car dict. Reads shipping from config.yaml.

    Adds: price_usd, shipping_usd, total_usd, exchange_rate
    """
    shipping_usd = config.get("shipping", {}).get("default_usd", 2500)
    price_data = convert_price(car.get("price_jpy"), shipping_usd)
    return {**car, **price_data}
```

**Rounding rule:** `price_usd = round(price_jpy * rate / 100) * 100`
(round to nearest $100)

**Exchange rate API:**
```
GET https://api.exchangerate-api.com/v4/latest/JPY
→ response["rates"]["USD"]
```

---

## Step 4 — Update pipeline.py

Add translation and price conversion steps after scraping:

```python
# In scraper/pipeline.py — update the run() function

from processor.translator import translate_car
from processor.price_converter import process_car_price

def run(skip_details: bool = False) -> list[dict]:
    config = load_config()
    # ... existing scraping code ...

    # NEW: translate + convert prices
    print("🌐 Translating to English...")
    print("💱 Converting prices to USD...")
    enriched = []
    for car in cars:
        car = translate_car(car)
        car = process_car_price(car, config)
        enriched.append(car)

    _export(enriched, OUTPUT_PATH)
    return enriched
```

---

## Step 5 — Create processor/__init__.py

```python
# processor/__init__.py
# empty
```

---

## Step 6 — Tests

Create `tests/test_processor.py`:

```python
# tests/test_processor.py
"""Tests for translation and price conversion."""

from processor.vocabulary import lookup, translate_with_vocab
from processor.translator import translate_color, translate_title
from processor.price_converter import convert_price


class TestVocabulary:
    def test_lookup_color(self):
        assert lookup("白") == "White"

    def test_lookup_missing(self):
        assert lookup("存在しない") is None

    def test_translate_with_vocab_match(self):
        assert translate_with_vocab("黒") == "Black"

    def test_translate_with_vocab_no_match(self):
        assert translate_with_vocab("不明") == "不明"  # returns original


class TestTranslator:
    def test_translate_color_white(self):
        assert translate_color("白") == "White"

    def test_translate_color_pearl(self):
        assert translate_color("真珠白") == "Pearl White"

    def test_translate_color_none(self):
        assert translate_color(None) is None

    def test_translate_title_prado(self):
        result = translate_title("ランドクルーザープラド 2.8 TX ディーゼルターボ 4WD")
        assert "Land Cruiser Prado" in result
        assert "2.8" in result
        assert "TX" in result

    def test_translate_title_none(self):
        assert translate_title(None) is None


class TestPriceConverter:
    def test_convert_basic(self):
        result = convert_price(2989000, 2500)
        assert result["price_usd"] is not None
        assert result["price_usd"] % 100 == 0   # rounded to $100
        assert result["shipping_usd"] == 2500
        assert result["total_usd"] == result["price_usd"] + 2500
        assert 0.005 < result["exchange_rate"] < 0.015  # sanity: ~149 JPY/USD

    def test_convert_none_price(self):
        result = convert_price(None, 2500)
        assert result["price_usd"] is None
        assert result["total_usd"] is None
        assert result["shipping_usd"] == 2500
```

---

## Final cars.json structure

Each car in the output must have ALL of these fields:

```json
{
  "source_id": "AU6956752830",
  "model": "prado",
  "title_ja": "ランドクルーザープラド 2.8 TX ...",
  "title_en": "Land Cruiser Prado 2.8 TX Diesel Turbo 4WD ...",
  "year": 2015,
  "mileage_km": 82000,
  "price_jpy": 2989000,
  "price_usd": 20100,
  "shipping_usd": 2500,
  "total_usd": 22600,
  "exchange_rate": 0.00672,
  "grade_ja": "TX",
  "color_ja": "真珠白",
  "color_en": "Pearl White",
  "images": ["https://...jpg"],
  "description_ja": "...",
  "description_en": "...",
  "specs": {"排気量": "2800cc"},
  "detail_url": "https://...",
  "scraped_at": "2026-06-09T01:00:00Z"
}
```

---

## Output Files

```
processor/__init__.py        ← NEW (empty)
processor/vocabulary.py      ← NEW
processor/translator.py      ← NEW
processor/price_converter.py ← NEW
tests/test_processor.py      ← NEW
scraper/pipeline.py          ← UPDATED (add translate + convert steps)
website/public/data/cars.json ← REGENERATED (now with _en and _usd fields)
```

---

## Hard Constraints

1. **Never remove `_ja` fields** — always keep original Japanese alongside English
2. **Translation errors must not crash the pipeline** — wrap all translation
   calls in try/except, return None on failure
3. **Exchange rate cached per run** — call the API once, reuse for all cars
4. **`price_usd` rounded to nearest $100** — never show $20,134, always $20,100
5. **No new dependencies** — `deep-translator` is already in requirements.txt

---

## Acceptance Criteria

```bash
# Unit tests — no HTTP
python3 -m pytest tests/test_processor.py -v

# Full pipeline smoke test (uses existing cars.json, skips re-scraping)
python3 -c "
import json
from pathlib import Path
from processor.translator import translate_car
from processor.price_converter import process_car_price
from scraper.carsensor_scraper import load_config

config = load_config()
data = json.loads(Path('website/public/data/cars.json').read_text())
car = data['cars'][0]
car = translate_car(car)
car = process_car_price(car, config)
print('title_en:', car['title_en'])
print('color_en:', car['color_en'])
print('price_usd:', car['price_usd'])
print('total_usd:', car['total_usd'])
print('exchange_rate:', car['exchange_rate'])
"

# Run full pipeline (re-scrapes + translates + converts)
python3 -c "
import json
from pathlib import Path
from scraper.pipeline import run
cars = run(skip_details=True)
sample = cars[0]
print(f'Total: {len(cars)} cars')
assert 'title_en' in sample, 'Missing title_en'
assert 'price_usd' in sample, 'Missing price_usd'
assert 'total_usd' in sample, 'Missing total_usd'
assert 'color_en' in sample, 'Missing color_en'
print('All fields present!')
print('Sample:', {k: sample[k] for k in ['title_en','price_usd','total_usd','color_en']})
"
```
