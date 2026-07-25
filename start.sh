#!/bin/bash

# Terminate background jobs on exit
trap "kill 0" EXIT

echo "🚀 Starting AI-Powered Pharma Complaint System..."

# 1. Start Backend Server
echo "🌐 Starting FastAPI Backend..."
cd "$(dirname "$0")/backend"
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &

# 2. Start Frontend Server
echo "💻 Starting Vite Frontend..."
cd "../frontend"
# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules not found. Installing dependencies..."
    npm install
fi
npm run dev &

# Wait for both background processes
wait
