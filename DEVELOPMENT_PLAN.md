# 🚗 日本二手车展示网站 — 完整开发计划

> **项目名称**：JP Used Cars（暂定）
> **目标**：从 carsensor.net 抓取指定车型数据，翻译成英文、换算成美元、加上海运费，构建面向海外买家的二手车展示网站，每日自动更新。
> **最后更新**：2026-06-09

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术选型](#2-技术选型)
3. [系统架构](#3-系统架构)
4. [阶段一：调研与环境搭建](#4-阶段一调研与环境搭建)
5. [阶段二：爬虫开发](#5-阶段二爬虫开发)
6. [阶段三：数据处理层](#6-阶段三数据处理层)
7. [阶段四：数据库设计](#7-阶段四数据库设计)
8. [阶段五：展示网站](#8-阶段五展示网站)
9. [阶段六：自动化与部署](#9-阶段六自动化与部署)
10. [时间排期](#10-时间排期)
11. [费用估算](#11-费用估算)
12. [风险与应对](#12-风险与应对)
13. [后续扩展计划](#13-后续扩展计划)
14. [配置参数表](#14-配置参数表)

---

## 1. 项目概述

### 1.1 业务目标

| 目标 | 说明 |
|------|------|
| 数据来源 | carsensor.net（日本最大二手车平台） |
| 目标车型 | Toyota Prado、Hilux、HiAce、Alphard 等（可配置扩展） |
| 目标用户 | 海外二手车进口商、个人买家（英语用户） |
| 核心价值 | 日文数据英文化 + 价格透明化（含运费） |
| 更新频率 | 每日自动同步 |

### 1.2 核心功能

- [x] 自动爬取 carsensor.net 指定车型列表页 + 详情页
- [x] 日文内容自动翻译为英文
- [x] JPY → USD 实时汇率换算
- [x] 叠加固定海运费，展示 Total FOB 价格
- [x] 响应式展示网站（移动端友好）
- [x] 询盘/联系功能（WhatsApp / Email）
- [x] GitHub Actions 每日定时执行更新

---

## 2. 技术选型

### 2.1 后端 / 数据处理

| 组件 | 技术 | 理由 |
|------|------|------|
| 爬虫 | Python + BeautifulSoup4 | 轻量、易维护；必要时升级为 Playwright |
| 翻译 | deep-translator（Google） | 免费；车型专业词汇使用固定对照表补充 |
| 汇率 | exchangerate-api.com | 免费套餐每日更新，满足需求 |
| 数据库 | SQLite（MVP）→ PostgreSQL（扩展） | 初期零成本，后期迁移容易 |
| 任务调度 | GitHub Actions cron | 免费、无需服务器 |

### 2.2 前端

| 组件 | 技术 | 理由 |
|------|------|------|
| 框架 | Next.js 14 (App Router) | SSG + ISR，SEO 友好，Vercel 免费托管 |
| 样式 | Tailwind CSS | 快速开发，移动端适配 |
| 图片 | Next.js Image + CDN 引用 | 不托管原图，规避版权风险 |
| 部署 | Vercel | 免费套餐，Git Push 自动部署 |

### 2.3 目录结构

```
used-car-site/
├── scraper/                  # 爬虫模块
│   ├── __init__.py
│   ├── carsensor_scraper.py  # 列表页爬虫
│   ├── detail_scraper.py     # 详情页爬虫
│   └── selectors.py          # CSS选择器配置（易于维护）
├── processor/                # 数据处理模块
│   ├── translator.py         # 翻译
│   ├── price_converter.py    # 汇率+运费
│   └── vocabulary.py         # 日英专业词汇对照表
├── database/                 # 数据库模块
│   ├── schema.sql
│   ├── db.py
│   └── cars.db               # SQLite 文件（gitignore）
├── website/                  # Next.js 前端
│   ├── app/
│   │   ├── page.tsx          # 首页
│   │   ├── cars/[model]/     # 车型列表
│   │   └── car/[id]/         # 详情页
│   ├── components/
│   └── public/data/          # 导出的 JSON 数据
├── .github/workflows/
│   └── daily_scrape.yml
├── config.yaml               # 统一配置（车型、运费、翻页数等）
├── main.py                   # 主入口
├── requirements.txt
└── DEVELOPMENT_PLAN.md       # 本文档
```

---

## 3. 系统架构

```
┌─────────────────────────────────────────────────────┐
│                  GitHub Actions (每日 01:00 UTC)      │
└─────────────────────────┬───────────────────────────┘
                          │ 触发
                          ▼
┌─────────────────────────────────────────────────────┐
│                     main.py                          │
│                                                      │
│  ① scraper  →  ② processor  →  ③ database          │
│     爬取            翻译/换算        存储              │
│                          │                           │
│                          ▼                           │
│               ④ 导出 cars.json                       │
└─────────────────────────┬───────────────────────────┘
                          │ git push / Vercel 触发
                          ▼
┌─────────────────────────────────────────────────────┐
│                  Next.js 网站 (Vercel)                │
│                                                      │
│   首页  →  车型列表  →  车辆详情  →  询盘             │
└─────────────────────────────────────────────────────┘
```

### 数据流

```
carsensor.net HTML
    ↓ 解析
{ title_ja, price_jpy, year, mileage, images[], detail_url }
    ↓ 翻译
{ title_en, grade_en, color_en, description_en }
    ↓ 价格处理
{ price_usd, shipping_usd, total_usd }
    ↓ 存储 + 导出
cars.json → Next.js 静态页面
```

---

## 4. 阶段一：调研与环境搭建

**目标**：摸清 carsensor.net 结构，跑通第一条数据

### 任务清单

- [ ] 分析 carsensor.net 列表页 HTML 结构
  - 确认是否有 JS 渲染（需要 Playwright 还是 requests 够用）
  - 找到车辆卡片的 CSS 选择器
  - 确认翻页 URL 规律
- [ ] 分析详情页 HTML 结构
  - 大图、规格表、车况说明
- [ ] 确认各目标车型的搜索 URL
- [ ] 初始化 Python 项目，安装依赖
- [ ] 配置 `config.yaml`，写入初始车型列表

### config.yaml 示例

```yaml
target_models:
  - name: prado
    display_name: "Toyota Land Cruiser Prado"
    url: "https://www.carsensor.net/usedcar/search.php?BRDC=TO&CARC=TO_028_"
    max_pages: 5
  - name: hilux
    display_name: "Toyota Hilux"
    url: "https://www.carsensor.net/usedcar/search.php?BRDC=TO&CARC=TO_031_"
    max_pages: 5
  - name: hiace
    display_name: "Toyota HiAce"
    url: "https://www.carsensor.net/usedcar/search.php?BRDC=TO&CARC=TO_027_"
    max_pages: 5

shipping:
  default_usd: 2500
  # 按目的地差异化（可选）
  destinations:
    australia: 3000
    africa: 3500
    middle_east: 2800

scraper:
  delay_seconds: 2
  timeout_seconds: 15
  max_retries: 3
  user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
```

**预估工时**：3.5 小时

---

## 5. 阶段二：爬虫开发

**目标**：稳定抓取目标车型的完整数据

### 5.1 列表页爬虫

```python
# scraper/carsensor_scraper.py（核心逻辑示意）

def scrape_listing_page(url: str, page: int) -> list[dict]:
    """抓取一页列表，返回车辆基础信息列表"""
    ...

def parse_car_card(item) -> dict:
    """解析单个车辆卡片"""
    return {
        "source_id":   ...,  # carsensor 内部 ID（用于去重）
        "model":       ...,
        "title_ja":    ...,
        "year":        ...,
        "mileage_km":  ...,
        "price_jpy":   ...,
        "grade_ja":    ...,
        "color_ja":    ...,
        "thumbnail":   ...,
        "detail_url":  ...,
    }
```

### 5.2 详情页爬虫

```python
# scraper/detail_scraper.py

def scrape_detail(url: str) -> dict:
    """抓取详情页，补充图片列表和完整描述"""
    return {
        "images":          [...],  # 最多取 8 张
        "description_ja":  ...,
        "specs":           {...},  # 排量、车身、燃料等
    }
```

### 5.3 反爬策略

| 措施 | 实现 |
|------|------|
| 请求延迟 | `time.sleep(config.delay_seconds)` |
| User-Agent 轮换 | 维护 5-10 个 UA 列表 |
| 错误重试 | 指数退避，最多 3 次 |
| IP 代理（备用） | 如遭封禁，接入住宅代理（月约 $5） |

**预估工时**：11 小时

---

## 6. 阶段三：数据处理层

**目标**：将日文原始数据转换为可展示的英文+美元数据

### 6.1 翻译模块

```python
# processor/translator.py

# 第一优先：固定词汇对照表（快、准、免费）
VOCABULARY = {
    "プラド": "Prado",
    "白": "White",
    "黒": "Black",
    "走行距離": "Mileage",
    "年式": "Year",
    "修復歴なし": "No accident history",
    "ディーゼル": "Diesel",
    "4WD": "4WD",
    # ... 持续补充
}

# 第二优先：Google Translate（处理长描述）
def translate_description(text: str) -> str:
    ...
```

### 6.2 价格处理模块

```python
# processor/price_converter.py

def process_price(price_jpy: int, destination: str = "default") -> dict:
    rate = get_live_rate()  # 实时汇率
    shipping = config.shipping[destination]
    car_usd = round(price_jpy * rate / 100) * 100  # 取整到百位
    return {
        "price_jpy":    price_jpy,
        "price_usd":    car_usd,
        "shipping_usd": shipping,
        "total_usd":    car_usd + shipping,
        "rate_used":    rate,
        "rate_date":    today(),
    }
```

### 6.3 专业词汇对照表维护

文件：`processor/vocabulary.py`

分类维护：颜色、车身类型、燃料、设备配置、车况描述等。
优先使用对照表，Google Translate 作为兜底。

**预估工时**：4.5 小时

---

## 7. 阶段四：数据库设计

**目标**：持久化存储，支持每日增量更新

### 7.1 主表 Schema

```sql
CREATE TABLE cars (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id       TEXT UNIQUE NOT NULL,  -- carsensor 原始 ID，用于去重
    model           TEXT NOT NULL,         -- prado / hilux / hiace
    title_ja        TEXT,
    title_en        TEXT,
    year            INTEGER,
    mileage_km      INTEGER,
    grade_ja        TEXT,
    grade_en        TEXT,
    color_ja        TEXT,
    color_en        TEXT,
    description_ja  TEXT,
    description_en  TEXT,
    specs_json      TEXT,                  -- JSON: 排量/燃料/车身等
    images_json     TEXT,                  -- JSON array of URLs
    price_jpy       INTEGER,
    price_usd       INTEGER,
    shipping_usd    INTEGER,
    total_usd       INTEGER,
    exchange_rate   REAL,
    detail_url      TEXT,
    is_active       INTEGER DEFAULT 1,     -- 0 = 已下架
    first_seen      TEXT,
    last_seen       TEXT,
    updated_at      TEXT
);

CREATE INDEX idx_model   ON cars(model);
CREATE INDEX idx_price   ON cars(total_usd);
CREATE INDEX idx_year    ON cars(year);
CREATE INDEX idx_active  ON cars(is_active);
```

### 7.2 每日更新逻辑

```
1. 标记所有现有记录为 is_active = 0
2. 爬取当日数据
3. 按 source_id UPSERT：
   - 已存在 → 更新价格/状态，is_active = 1
   - 新增   → 插入新记录，is_active = 1
4. is_active = 0 的记录 = 已从 carsensor 下架
```

**预估工时**：3.5 小时

---

## 8. 阶段五：展示网站

**目标**：面向英文用户的专业二手车展示网站

### 8.1 页面结构

```
/                        首页（车型导航 + 最新上架）
/cars/prado              Prado 列表（筛选+排序）
/cars/hilux              Hilux 列表
/car/[id]                单车详情页
/contact                 联系页面
```

### 8.2 车辆卡片设计规范

```
┌────────────────────────────────┐
│  [主图 4:3]                    │
│                                │
├────────────────────────────────┤
│  2021 Toyota Land Cruiser Prado│
│  TX Limited  ·  Pearl White    │
│                                │
│  📅 2021    🛣 45,000 km       │
├────────────────────────────────┤
│  Car Price      $18,500        │
│  + Shipping     + $2,500       │
│  ─────────────────────────     │
│  Total (FOB)    $21,000        │
│                                │
│  [View Details]  [Inquire →]   │
└────────────────────────────────┘
```

### 8.3 详情页内容结构

1. 图片轮播（最多 8 张）
2. 车辆标题 + 基本参数（年份/里程/颜色/燃料）
3. **价格明细区**（醒目展示）
   - Car Price (USD)
   - Estimated Shipping
   - Total FOB Price
   - *汇率说明：1 USD = X JPY（更新日期）*
4. 规格参数表（排量、车身、驱动方式等）
5. 车况说明（翻译后的描述）
6. 联系/询价按钮

### 8.4 筛选与排序功能

**筛选项**：
- 年份范围（滑块）
- 里程范围（滑块）
- 总价范围（滑块）
- 颜色（多选）

**排序项**：
- 最新上架
- 价格从低到高 / 从高到低
- 里程从低到高

### 8.5 联系方式集成

```tsx
// 优先推荐 WhatsApp（海外买家常用）
const WHATSAPP_NUMBER = "+81-xxx-xxxx-xxxx";  // 配置你的号码

<a href={`https://wa.me/${WHATSAPP_NUMBER}?text=...`}>
  Inquire via WhatsApp
</a>
```

**预估工时**：18 小时

---

## 9. 阶段六：自动化与部署

**目标**：零人工干预，每日自动更新数据并重新部署网站

### 9.1 GitHub Actions 配置

```yaml
# .github/workflows/daily_scrape.yml
name: Daily Car Data Update

on:
  schedule:
    - cron: "0 1 * * *"   # UTC 01:00 = 日本时间 10:00
  workflow_dispatch:        # 支持手动触发

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run scraper pipeline
        run: python main.py
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}  # 如使用Claude翻译

      - name: Commit updated data
        run: |
          git config user.email "bot@jpusedcars.com"
          git config user.name "Daily Update Bot"
          git add website/public/data/cars.json
          git diff --staged --quiet || git commit -m "chore: daily update $(date +%Y-%m-%d)"
          git push

      - name: Notify on failure
        if: failure()
        run: echo "Scraper failed — send alert email or Slack notification here"
```

### 9.2 Vercel 自动部署

- 连接 GitHub 仓库
- 每次 `git push` 自动触发重新部署
- 环境变量在 Vercel Dashboard 配置
- 域名绑定（自定义域名 ~$10/年）

### 9.3 监控告警（可选）

- GitHub Actions 失败时发邮件通知
- 数据量骤降（< 50 条）时告警（爬虫可能失效）
- Vercel 构建失败通知

**预估工时**：5 小时

---

## 10. 时间排期

### 工时汇总

| 阶段 | 内容 | 工时 |
|------|------|------|
| 阶段一 | 调研 + 环境搭建 | 3.5h |
| 阶段二 | 爬虫开发 | 11.0h |
| 阶段三 | 数据处理层 | 4.5h |
| 阶段四 | 数据库设计 | 3.5h |
| 阶段五 | 展示网站 | 18.0h |
| 阶段六 | 自动化 + 部署 | 5.0h |
| **合计** | | **~45.5h** |

### 按天排期（每天 4-6 小时）

| 天 | 主要任务 | 交付物 |
|----|---------|-------|
| Day 1 | 调研 carsensor 结构 + 搭环境 + 列表页爬虫 | 能跑通的爬虫雏形 |
| Day 2 | 详情页爬虫 + 反爬优化 + 数据清洗 | 完整爬虫，数据入 SQLite |
| Day 3 | 翻译模块 + 汇率换算 + 运费计算 | 处理完毕的英文数据 |
| Day 4 | Next.js 初始化 + 首页 + 车型列表页 | 可浏览的网站骨架 |
| Day 5 | 详情页 + 询价功能 + 移动端适配 | 完整前端 |
| Day 6 | GitHub Actions + Vercel 部署 + 联调测试 | 🎉 网站上线运行 |

> **全职投入**：约 6 天  
> **兼职投入**（每天 2-3 小时）：约 2-3 周

---

## 11. 费用估算

### 月度成本

| 项目 | 方案 | 月费用 |
|------|------|--------|
| 爬虫运行 | GitHub Actions（免费套餐） | $0 |
| 翻译 | deep-translator（Google 非官方） | $0 |
| 汇率 API | exchangerate-api.com 免费套餐 | $0 |
| 数据库 | SQLite 本地文件 | $0 |
| 网站托管 | Vercel 免费套餐 | $0 |
| 域名 | Namecheap / Cloudflare | ~$1 |
| **合计（基础版）** | | **~$1/月** |

### 可选升级

| 升级项 | 触发条件 | 费用 |
|--------|---------|------|
| 住宅代理 IP | 遭遇 IP 封禁 | ~$5-10/月 |
| Claude Haiku 翻译 | 翻译质量不满意 | ~$2-5/月 |
| PostgreSQL | 数据量 > 5000 条 | $0（Supabase 免费套餐） |
| 付费汇率 API | 需要分钟级更新 | ~$5/月 |

---

## 12. 风险与应对

| 风险 | 概率 | 影响 | 应对方案 |
|------|------|------|---------|
| carsensor.net 反爬封 IP | 中 | 高 | 请求延迟 + UA 轮换；备用住宅代理 |
| 网站结构更新导致爬虫失效 | 低 | 中 | 每日数量监控告警 + 快速修复（1-2h） |
| 翻译质量差（专业词汇） | 中 | 低 | 固定词汇对照表兜底，持续补充 |
| 图片加载慢（日本 CDN） | 中 | 低 | Next.js Image 懒加载；考虑转存 Cloudflare |
| 汇率 API 不稳定 | 低 | 低 | 缓存上次汇率，失败时使用缓存值 |
| carsensor.net ToS 风险 | 低 | 高 | 仅引用链接不托管原图；控制爬取频率 |

---

## 13. 后续扩展计划

### MVP 之后（第 2-3 个月）

- [ ] 增加更多车型（Alphard、Vellfire、Hiace Commuter）
- [ ] 增加品牌筛选（Nissan Patrol、Mitsubishi Pajero）
- [ ] 用户收藏/对比功能
- [ ] SEO 优化（sitemap、结构化数据）

### 中期（第 4-6 个月）

- [ ] 多语言支持（阿拉伯语、法语、葡萄牙语）
- [ ] WhatsApp Business API 自动回复询价
- [ ] 按目的地港口显示不同运费（横滨/大阪 → 蒙巴萨/迪拜/悉尼）
- [ ] 成交记录展示（增加信任感）

### 长期

- [ ] 用户注册 + 收藏夹
- [ ] 价格历史追踪图表
- [ ] 直接接入日本拍卖行数据（USS、TAA、JU）

---

## 14. 配置参数表

所有可调参数均集中在 `config.yaml`，无需改代码：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `shipping.default_usd` | 2500 | 默认海运费（美元） |
| `scraper.max_pages` | 5 | 每个车型爬取页数 |
| `scraper.delay_seconds` | 2 | 请求间隔（秒） |
| `scraper.max_retries` | 3 | 失败重试次数 |
| `price.round_to` | 100 | 美元价格取整单位 |
| `translation.use_claude` | false | 是否用 Claude API 翻译 |
| `schedule.cron` | `0 1 * * *` | 每日更新时间（UTC） |

---

*文档维护：每次架构调整后同步更新本文档*
