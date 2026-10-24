#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=== Starting PromptProof Development Environment ==="

# Trap to kill all subprocesses on exit
trap 'kill $(jobs -p) 2>/dev/null || true' EXIT

export PYTHONPATH="$DIR/backend"
echo "Starting Backend on http://localhost:8000..."
"$DIR/backend/venv/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

echo "Starting Frontend Dev Server on http://localhost:5173..."
cd frontend && npm run dev &
FRONTEND_PID=$!

wait
