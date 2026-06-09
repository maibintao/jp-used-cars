## Task: GitHub Actions Daily Update + Vercel Deployment
**Status**: ready
**Assigned to**: codex
**Day**: 6 of 6
**Project root**: /Users/yuyanli/used-car-site

---

## Background

The scraper pipeline is fully working (90 cars, 10 images each, translated,
USD prices). The Next.js site builds clean. Day 6 wires everything together:
automated daily scraping via GitHub Actions, and live deployment on Vercel.

---

## Objective

1. Fix GitHub Actions workflow to correctly run the Python pipeline
2. Add a workflow that commits updated `cars.json` and triggers Vercel redeploy
3. Create `vercel.json` config for correct Next.js deployment
4. Write a `scripts/health_check.py` that validates pipeline output
5. Add a `DEPLOYMENT.md` guide for the one-time setup steps

---

## Step 1 — Fix .github/workflows/daily_scrape.yml

The existing workflow at `.github/workflows/daily_scrape.yml` has issues.
Rewrite it completely:

```yaml
# .github/workflows/daily_scrape.yml
name: Daily Car Data Update

on:
  schedule:
    - cron: "0 1 * * *"   # UTC 01:00 = JST 10:00 every day
  workflow_dispatch:        # Allow manual trigger from GitHub UI

jobs:
  scrape-and-deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"
          cache: "pip"

      - name: Install Python dependencies
        run: pip install -r requirements.txt

      - name: Run scraper pipeline
        run: python main.py
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

      - name: Validate output
        run: python scripts/health_check.py

      - name: Commit updated cars.json
        run: |
          git config user.email "bot@jpusedcars.com"
          git config user.name "Daily Update Bot"
          git add website/public/data/cars.json
          git diff --staged --quiet && echo "No changes" || \
            git commit -m "data: daily update $(date -u +%Y-%m-%d)"

      - name: Push changes
        run: git push
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Notify on failure
        if: failure()
        run: |
          echo "::error::Daily scrape failed. Check logs above."
```

---

## Step 2 — Health check script

Create `scripts/health_check.py`:

```python
#!/usr/bin/env python3
"""
Validates cars.json output after pipeline run.
Exits with code 1 if validation fails (causes GitHub Actions to fail).
"""
import json
import sys
from pathlib import Path
from datetime import datetime, timezone

CARS_JSON = Path("website/public/data/cars.json")
MIN_CARS = 50          # Alert if we get fewer than this
MIN_AVG_IMAGES = 3.0   # Alert if average images drops below this
REQUIRED_FIELDS = {
    "source_id", "model", "title_ja", "year",
    "price_jpy", "price_usd", "total_usd",
    "images", "detail_url", "scraped_at",
}

def main():
    if not CARS_JSON.exists():
        print("❌ cars.json not found")
        sys.exit(1)

    data = json.loads(CARS_JSON.read_text())
    cars = data.get("cars", [])
    errors = []

    # Check total count
    if len(cars) < MIN_CARS:
        errors.append(f"Only {len(cars)} cars (expected ≥ {MIN_CARS})")

    # Check required fields
    for i, car in enumerate(cars[:5]):  # spot-check first 5
        missing = REQUIRED_FIELDS - set(car.keys())
        if missing:
            errors.append(f"Car {i} missing fields: {missing}")

    # Check models present
    models = {c["model"] for c in cars}
    for m in ["prado", "hilux", "hiace"]:
        if m not in models:
            errors.append(f"Model '{m}' missing from output")

    # Check image counts
    img_counts = [len(c.get("images", [])) for c in cars]
    avg_images = sum(img_counts) / len(img_counts) if img_counts else 0
    if avg_images < MIN_AVG_IMAGES:
        errors.append(f"Avg images {avg_images:.1f} < {MIN_AVG_IMAGES}")

    # Check prices converted
    priced = [c for c in cars if c.get("price_usd") is not None]
    if len(priced) < len(cars) * 0.7:
        errors.append(f"Only {len(priced)}/{len(cars)} cars have USD price")

    if errors:
        print("❌ Health check FAILED:")
        for e in errors:
            print(f"   • {e}")
        sys.exit(1)

    print(f"✅ Health check passed:")
    print(f"   • {len(cars)} cars across {len(models)} models")
    print(f"   • {avg_images:.1f} avg images per car")
    print(f"   • {len(priced)} cars with USD price")
    print(f"   • Updated at: {data.get('updated_at')}")

if __name__ == "__main__":
    main()
```

Also create `scripts/__init__.py` (empty).

---

## Step 3 — Vercel config

Create `vercel.json` in the project root:

```json
{
  "buildCommand": "cd website && npm install && npm run build",
  "outputDirectory": "website/.next",
  "installCommand": "cd website && npm install",
  "framework": "nextjs",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

Also create `website/.env.production` with placeholder:
```
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

---

## Step 4 — Update .gitignore

Make sure these are in `.gitignore`:
```
.env
.env.local
.env.production.local
.venv/
venv/
.DS_Store
website/.DS_Store
website/node_modules/
website/.next/
*.pyc
__pycache__/
tasks/codex_output.diff
```

---

## Step 5 — DEPLOYMENT.md

Create `DEPLOYMENT.md` at project root:

```markdown
# Deployment Guide

## One-Time Setup

### 1. GitHub Repository
```bash
git remote add origin https://github.com/YOUR_USERNAME/jp-used-cars.git
git push -u origin main
```

### 2. GitHub Secrets
Go to: Settings → Secrets → Actions → New repository secret

| Secret | Value |
|--------|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (optional, for Claude translation) |

Note: `GITHUB_TOKEN` is automatically provided by GitHub Actions.

### 3. Vercel Deployment
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Framework: **Next.js**
4. Root directory: `website`
5. Build command: `npm run build`
6. Click Deploy

### 4. Connect Vercel to GitHub Actions (auto-redeploy)
Vercel automatically redeploys when `main` branch is updated.
The daily GitHub Action commits updated `cars.json` → triggers Vercel redeploy.

### 5. WhatsApp Number
Update the inquiry number in:
`website/app/car/[id]/page.tsx` — find `whatsappNumber` const and update it.

## Daily Update Flow
```
GitHub Actions (UTC 01:00)
  → python main.py          # scrape + translate + convert
  → health_check.py         # validate output
  → git commit cars.json    # commit new data
  → git push                # triggers Vercel redeploy
  → Vercel rebuilds site    # new listings live within ~2 min
```

## Manual Trigger
Go to: GitHub → Actions → "Daily Car Data Update" → Run workflow

## Monitoring
- GitHub Actions: check the Actions tab for daily run status
- If a run fails, GitHub sends an email to the repo owner
```

---

## Output Files

```
.github/workflows/daily_scrape.yml   ← REWRITTEN
scripts/__init__.py                  ← NEW (empty)
scripts/health_check.py              ← NEW
vercel.json                          ← NEW
website/.env.production              ← NEW
.gitignore                           ← UPDATED
DEPLOYMENT.md                        ← NEW
```

---

## Hard Constraints

1. **Do NOT modify any Python scraper or processor files**
2. **Do NOT modify any website frontend files**
3. **Do NOT run the full pipeline** — it takes too long, just validate existing cars.json
4. **health_check.py must pass on current cars.json**

---

## Acceptance Criteria

```bash
cd /Users/yuyanli/used-car-site

# Health check must pass on current data
python3 scripts/health_check.py

# Validate GitHub Actions YAML syntax
python3 -c "
import yaml
with open('.github/workflows/daily_scrape.yml') as f:
    workflow = yaml.safe_load(f)
print('Workflow name:', workflow['name'])
print('Triggers:', list(workflow['on'].keys()))
print('Jobs:', list(workflow['jobs'].keys()))
print('Steps:', len(workflow['jobs']['scrape-and-deploy']['steps']))
print('YAML valid ✅')
"

# Validate vercel.json
python3 -c "
import json
with open('vercel.json') as f:
    v = json.load(f)
print('vercel.json valid ✅')
print('Build command:', v['buildCommand'])
"

# Git status should be clean after commit
git status
```
