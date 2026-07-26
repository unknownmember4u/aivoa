#!/bin/bash

echo "🌐 Starting FastAPI Backend Server on http://127.0.0.1:8000..."
cd "$(dirname "$0")"

if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
fi

uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
