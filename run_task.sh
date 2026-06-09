#!/bin/bash
# Run current task with Codex
# Usage: ./run_task.sh
set -e

TASK_FILE="tasks/current_task.md"

if [ ! -f "$TASK_FILE" ]; then
  echo "❌ No task file found at $TASK_FILE"
  exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ OPENAI_API_KEY is not set"
  echo "   Run: export OPENAI_API_KEY='sk-...'"
  exit 1
fi

echo "🤖 Sending task to Codex..."
echo ""

PROMPT=$(cat "$TASK_FILE")
codex "$PROMPT"
