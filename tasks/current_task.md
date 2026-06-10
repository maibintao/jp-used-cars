## Task: Add 14 New Models + Fix Translation + Unlimited Images
**Status**: ready
**Assigned to**: codex
**Day**: 7 (improvements)
**Project root**: /Users/yuyanli/used-car-site

---

## Three Problems to Fix

### Problem 1 — Add 14 new car models
### Problem 2 — Incomplete translation (Japanese tokens in title_en, specs not translated)
### Problem 3 — Image cap at 10 — raise to 20

---

## Fix 1 — Find correct carsensor URLs and add to config.yaml

First, find the correct search URLs for each model by fetching carsensor.net
search pages. Use this pattern to discover CARC codes:

```
https://www.carsensor.net/usedcar/search.php?BRDC=XX&CARC=XX_SXXX
```

Brand codes:
- Toyota: TO
- Nissan: NS
- Mazda: MA
- Audi: AU
- Lexus: LE
- Mitsubishi: MI
- Honda: HO

For each model below, fetch a candidate URL, verify it returns listings
(status 200 + contains car cards), then add to config.yaml.

**Models to add:**

| Model name (key) | Display name | Japanese name | Brand |
|-----------------|--------------|---------------|-------|
| `landcruiser` | Toyota Land Cruiser | ランドクルーザー | TO |
| `harrier` | Toyota Harrier | ハリアー | TO |
| `rav4` | Toyota RAV4 | RAV4 | TO |
| `crown` | Toyota Crown | クラウン | TO |
| `voxy` | Toyota Voxy | ヴォクシー | TO |
| `noah` | Toyota Noah | ノア | TO |
| `alphard` | Toyota Alphard | アルファード | TO |
| `lexus_lx` | Lexus LX | LX | LE |
| `xtrail` | Nissan X-Trail | エクストレール | NS |
| `cx3` | Mazda CX-3 | CX-3 | MA |
| `cx5` | Mazda CX-5 | CX-5 | MA |
| `audi_q7` | Audi Q7 | Q7 | AU |
| `audi_q8` | Audi Q8 | Q8 | AU |
| `pajero` | Mitsubishi Pajero | パジェロ | MI |
| `crv` | Honda CR-V | CR-V | HO |

**Strategy to find each URL:**
1. Go to https://www.carsensor.net/usedcar/search.php?BRDC=TO (for Toyota)
2. Fetch the page and look for links matching each model name
3. Extract the CARC parameter from the link
4. Verify by fetching the model page and checking for car listings

Use `max_pages: 3` for all new models (to keep pipeline time reasonable).

---

## Fix 2 — Expand vocabulary + improve translation

### 2a — Add to processor/vocabulary.py VOCAB dict:

```python
# Interior / equipment
"中期": "mid-spec",
"前期": "early model",
"後期": "late model",
"純正": "OEM",
"ナビTV": "nav/TV",
"フルセグ": "full-seg TV",
"全周囲カメラ": "360° camera",
"パノラマモニター": "panoramic monitor",
"ドラレコ": "dashcam",
"ドライブレコーダー": "dashcam",
"クラッツィオ": "Clazzio",
"シートカバー": "seat covers",
"センターデフロック": "centre diff lock",
"リフトアップ": "lift-up",
"ローダウン": "lowered",
"ムーンルーフ": "moonroof",
"フリップダウン": "flip-down monitor",
"両側電動スライドドア": "dual power sliding doors",
"電動スライドドア": "power sliding door",
"パワーバックドア": "power tailgate",
"シートヒーター": "heated seats",
"ベンチレーション": "ventilated seats",
"メモリーシート": "memory seats",
"ハンドルヒーター": "heated steering wheel",
"ステアリングヒーター": "heated steering wheel",

# Safety
"レーダークルーズ": "radar cruise control",
"衝突軽減": "collision mitigation",
"車線逸脱": "lane departure warning",
"ブラインドスポット": "blind spot monitor",
"パーキングサポート": "parking assist",
"自動ブレーキ": "auto brake",
"プリクラッシュ": "pre-crash safety",

# Wheels / exterior
"インチアップ": "upgraded wheels",
"オーバーフェンダー": "overfenders",
"LEDヘッド": "LED headlights",
"LEDテール": "LED tail lights",
"フォグランプ": "fog lights",
"ルーフキャリア": "roof carrier",
"ルーフラック": "roof rack",
"牽引フック": "tow hook",
"リアラダー": "rear ladder",

# Specs table keys
"排気量": "Engine Displacement",
"燃料": "Fuel",
"車体色": "Color",
"定員": "Seating Capacity",
"車体": "Body Type",
"ミッション": "Transmission",
"駆動方式": "Drive Type",
"ドア数": "Doors",
"乗車定員": "Seating",
"修復歴": "Accident History",
"保証": "Warranty",
"車検": "Inspection",
"走行距離": "Mileage",
"年式": "Year",
"排気量": "Displacement",
"最大積載量": "Max load",
"車両重量": "Vehicle weight",
"全長": "Length",
"全幅": "Width",
"全高": "Height",
"ホイールベース": "Wheelbase",

# Condition
"ワンオーナー": "One owner",
"記録簿": "Service records",
"車検整備付": "Inspection included",
"保証付": "Warranty included",
"右ハンドル": "Right-hand drive",
"左ハンドル": "Left-hand drive",

# Interior colors
"ベージュ内装": "beige interior",
"黒内装": "black interior",
"ブラック内装": "black interior",
"グレー内装": "grey interior",
"ブラウン内装": "brown interior",

# Audio brands
"カロッツェリア": "Pioneer",
"パイオニア": "Pioneer",
"ケンウッド": "Kenwood",
"クラリオン": "Clarion",
"アルパイン": "Alpine",

# Spec qualifiers
"ターボ": "Turbo",
"ディーゼルターボ": "Diesel Turbo",
"ロング": "long wheelbase",
"ハイルーフ": "high roof",
"標準ルーフ": "standard roof",
"ワイド": "wide body",
"スーパーロング": "super long",

# Inspection year shortcuts
"検R9年": "JCI exp.2027",
"検R8年": "JCI exp.2026",
"検R7年": "JCI exp.2025",
"検R6年": "JCI exp.2024",
"R9年": "2027",
"R8年": "2026",
"R7年": "2025",
"R6年": "2024",
```

### 2b — Update translate_title() in processor/translator.py:

```python
MODEL_NAMES = {
    "ランドクルーザープラド": "Land Cruiser Prado",
    "ランドクルーザー": "Land Cruiser",
    "ハイラックス": "Hilux",
    "ハイエース": "HiAce",
    "アルファード": "Alphard",
    "ヴェルファイア": "Vellfire",
    "ヴォクシー": "Voxy",
    "ノア": "Noah",
    "ハリアー": "Harrier",
    "クラウン": "Crown",
    "エクストレール": "X-Trail",
    "パジェロ": "Pajero",
    "プリウス": "Prius",
    "レクサス": "Lexus",
}
```

Split title into space-separated tokens, look each one up in VOCAB,
replace if found, keep original if not. Join with spaces.

### 2c — Add specs_en to translate_car():

```python
def translate_specs(specs: dict) -> dict:
    from .vocabulary import VOCAB
    result = {}
    for key, value in specs.items():
        en_key = VOCAB.get(key.strip(), key)
        en_value = VOCAB.get(str(value).strip(), value) if value else value
        result[en_key] = en_value
    return result

def translate_car(car: dict) -> dict:
    return {
        **car,
        "title_en": translate_title(car.get("title_ja")),
        "color_en": translate_color(car.get("color_ja")),
        "description_en": translate_description(car.get("description_ja")),
        "specs_en": translate_specs(car.get("specs", {})),
    }
```

---

## Fix 3 — Raise image cap to 20

In `scraper/detail_scraper.py`:
- Change `>= 10` to `>= 20`
- Update docstring from "max 10" to "max 20"

---

## Fix 4 — Update website/lib/cars.ts

```typescript
export const MODEL_LABELS: Record<string, string> = {
  prado: "Toyota Land Cruiser Prado",
  hilux: "Toyota Hilux",
  hiace: "Toyota HiAce",
  landcruiser: "Toyota Land Cruiser",
  harrier: "Toyota Harrier",
  rav4: "Toyota RAV4",
  crown: "Toyota Crown",
  voxy: "Toyota Voxy",
  noah: "Toyota Noah",
  alphard: "Toyota Alphard",
  lexus_lx: "Lexus LX",
  xtrail: "Nissan X-Trail",
  cx3: "Mazda CX-3",
  cx5: "Mazda CX-5",
  audi_q7: "Audi Q7",
  audi_q8: "Audi Q8",
  pajero: "Mitsubishi Pajero",
  crv: "Honda CR-V",
};

export const MODELS = Object.keys(MODEL_LABELS) as string[];
```

---

## Step 5 — Run full pipeline

```bash
python3 main.py
```

This will take 20-40 minutes. Print progress as it runs.

---

## Output Files

```
config.yaml                   ← UPDATED (14 new models)
processor/vocabulary.py       ← UPDATED (expanded VOCAB)
processor/translator.py       ← UPDATED (better title + specs_en)
scraper/detail_scraper.py     ← UPDATED (image cap 10→20)
website/lib/cars.ts           ← UPDATED (all models)
website/public/data/cars.json ← REGENERATED
```

---

## Hard Constraints

1. **Verify each new model URL actually returns listings** before adding
2. **skip_details=False** for final run — real images required
3. **Never crash on missing model** — if a URL returns 0 cars, skip silently
4. **Keep all _ja fields** intact

---

## Acceptance Criteria

```bash
cd /Users/yuyanli/used-car-site

python3 scripts/health_check.py

python3 -c "
import json
from pathlib import Path
from collections import Counter
data = json.loads(Path('website/public/data/cars.json').read_text())
cars = data['cars']
models = Counter(c['model'] for c in cars)
print('Models found:')
for m, n in sorted(models.items()):
    print(f'  {m}: {n} cars')
print('Total:', len(cars))

sample = cars[0]
print()
print('title_en:', sample['title_en'])
print('specs_en:', list(sample.get('specs_en', {}).items())[:3])
img_counts = [len(c['images']) for c in cars]
print(f'Avg images: {sum(img_counts)/len(img_counts):.1f}')
print(f'Max images: {max(img_counts)}')
"

cd website && npm run build
```

Expected:
- 10+ models in output (some may have 0 listings on carsensor — skip those)
- `title_en` has less Japanese
- `specs_en` keys in English
- Max images ≥ 11
