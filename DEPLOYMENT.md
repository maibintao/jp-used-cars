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
