#!/bin/bash

# Start Frontend Server
cd "$(dirname "$0")/frontend"

echo "🚀 Starting Frontend Server..."
echo ""

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔧 Starting server..."
echo "📍 Frontend will run on http://localhost:3000"
echo ""

npm run dev


