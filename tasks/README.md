# Tasks — Claude Code × Codex Workflow

## 协作流程

```
Claude Code 写 current_task.md
       ↓
make run   →   Codex 执行
       ↓
make review  →  Claude Code 审查 diff
       ↓
（如有问题）Claude Code 更新 current_task.md → make run
       ↓
（通过）make done  →  归档，进入下一个任务
```

## 文件说明

| 文件 | 说明 |
|------|------|
| `current_task.md` | 当前 Codex 正在执行的任务（始终只有一个）|
| `codex_output.diff` | 最近一次 `make review` 生成的 diff |
| `archive/` | 已完成的任务，按日期命名 |

## 任务状态

| Status | 含义 |
|--------|------|
| `ready` | 已写好，等待 `make run` |
| `in_review` | Codex 已完成，Claude Code 正在审查 |
| `needs_revision` | Claude Code 发现问题，需要 Codex 修改 |
| `done` | 通过审查，已归档 |

## 6-Day 任务计划

- [x] Day 1 — Research carsensor structure + selectors + scraper skeleton
- [ ] Day 2 — Full list scraper + detail scraper + anti-scrape
- [ ] Day 3 — Translator + price converter + database
- [ ] Day 4 — Next.js setup + homepage + model list page
- [ ] Day 5 — Detail page + inquiry + mobile responsive
- [ ] Day 6 — GitHub Actions + Vercel deploy + end-to-end test
