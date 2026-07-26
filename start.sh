#!/bin/bash

# Terminate background jobs on exit
trap "kill 0" EXIT

echo "🚀 Starting AI-Powered Pharma Complaint System..."

# 1. Start Backend Server
echo "🌐 Starting FastAPI Backend..."
cd "$(dirname "$0")/backend"
if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
fi
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &

# 2. Start Frontend Server
echo "💻 Starting Vite Frontend..."
cd "../frontend"
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules not found. Installing dependencies..."
    npm install
fi
npm run dev &

# Wait for both background processes
wait
