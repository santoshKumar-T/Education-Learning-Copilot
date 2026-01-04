#!/bin/bash

# Start Backend Server
cd "$(dirname "$0")/backend"

echo "🚀 Starting Backend Server..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f env.template ]; then
        cp env.template .env
        echo "MONGODB_URI=mongodb://localhost:27017/education_copilot" >> .env
        echo "✅ Created .env file"
    fi
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔧 Starting server..."
echo "📍 Backend will run on http://localhost:5000"
echo ""
echo "⚠️  Make sure MongoDB is running!"
echo "   - Local: brew services start mongodb-community"
echo "   - Docker: docker start mongodb-education-copilot"
echo "   - Or use MongoDB Atlas (cloud)"
echo ""

npm run dev


