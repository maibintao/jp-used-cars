# ============================================================
#  JP Used Cars — Claude Code × Codex 协作工作流
#  Claude Code 写任务，Codex 执行，Claude Code 审查
# ============================================================

TASK_FILE     := tasks/current_task.md
ARCHIVE_DIR   := tasks/archive
DIFF_FILE     := tasks/codex_output.diff

# ── 查看当前任务 ──────────────────────────────────────────────
.PHONY: task
task:
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "  Current Task"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@cat $(TASK_FILE)

# ── Codex 执行当前任务 ────────────────────────────────────────
# Codex requires an interactive terminal — use ./run_task.sh instead of make run
.PHONY: run
run:
	@echo "👉 Codex needs a real terminal. Run this instead:"
	@echo ""
	@echo "   ./run_task.sh"
	@echo ""

# ── 生成 diff 供 Claude Code 审查 ────────────────────────────
.PHONY: review
review:
	@echo "📋 Generating diff for Claude Code review..."
	git diff HEAD > $(DIFF_FILE)
	@echo ""
	@echo "✅ Diff saved to: $(DIFF_FILE)"
	@echo "👉 Now run /review in Claude Code, or ask:"
	@echo "   'Review the diff at tasks/codex_output.diff'"

# ── 标记任务完成并归档 ────────────────────────────────────────
.PHONY: done
done:
	@TASK_NAME=$$(head -2 $(TASK_FILE) | grep "^## Task:" | sed 's/## Task: //' | tr ' ' '-' | tr '[:upper:]' '[:lower:]'); \
	DATE=$$(date +%Y-%m-%d); \
	FILENAME="$$DATE-$$TASK_NAME.md"; \
	cp $(TASK_FILE) $(ARCHIVE_DIR)/$$FILENAME; \
	echo "✅ Archived to: $(ARCHIVE_DIR)/$$FILENAME"
	@git add -A && git diff --staged --quiet || git commit -m "task: $$(head -2 $(TASK_FILE) | tail -1 | sed 's/## Task: //')"
	@echo "💾 Committed."

# ── 查看任务历史 ──────────────────────────────────────────────
.PHONY: history
history:
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "  Completed Tasks"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@ls -1 $(ARCHIVE_DIR)/ 2>/dev/null || echo "(none yet)"

# ── 运行全部测试 ──────────────────────────────────────────────
.PHONY: test
test:
	python -m pytest tests/ -v

# ── 运行完整数据管道（手动触发）─────────────────────────────
.PHONY: pipeline
pipeline:
	python main.py

# ── 安装 Python 依赖 ─────────────────────────────────────────
.PHONY: install
install:
	pip install -r requirements.txt

# ── 帮助 ─────────────────────────────────────────────────────
.PHONY: help
help:
	@echo ""
	@echo "  JP Used Cars — Command Reference"
	@echo ""
	@echo "  make task      Show current task"
	@echo "  make run       Send current task to Codex"
	@echo "  make review    Generate diff for Claude Code review"
	@echo "  make done      Archive task + git commit"
	@echo "  make history   List completed tasks"
	@echo "  make test      Run all tests"
	@echo "  make pipeline  Run full scrape pipeline manually"
	@echo "  make install   Install Python dependencies"
	@echo ""
