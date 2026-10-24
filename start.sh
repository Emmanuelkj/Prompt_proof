#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=== Starting PromptProof Backend & Static Frontend ==="
echo "Access UI at http://localhost:8000"

# Rebuild frontend if needed
if [ ! -d "frontend/dist" ]; then
    echo "Building frontend..."
    cd frontend && npm run build && cd ..
fi

export PYTHONPATH="$DIR/backend"
exec "$DIR/backend/venv/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8000
