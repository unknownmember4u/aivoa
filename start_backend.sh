#!/bin/bash

# Terminate background jobs on exit
trap "kill 0" EXIT

echo "🌐 Starting FastAPI Backend Server..."
cd "$(dirname "$0")/backend"

if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
fi

# Run Uvicorn backend server on port 8000
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
