#!/bin/bash

# MongoDB Setup Script for Education & Learning Copilot
# This script helps set up MongoDB for the application

echo "🔧 MongoDB Setup for Education & Learning Copilot"
echo "=================================================="
echo ""

# Check if MongoDB is installed
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is installed"
    mongod --version | head -1
else
    echo "❌ MongoDB is not installed"
    echo ""
    echo "📦 Installation Options:"
    echo ""
    echo "Option 1: Install MongoDB locally (macOS)"
    echo "  brew tap mongodb/brew"
    echo "  brew install mongodb-community"
    echo "  brew services start mongodb-community"
    echo ""
    echo "Option 2: Use Docker"
    echo "  docker run -d -p 27017:27017 --name mongodb-education-copilot mongo:latest"
    echo ""
    echo "Option 3: Use MongoDB Atlas (Cloud - Recommended)"
    echo "  1. Sign up at https://www.mongodb.com/cloud/atlas"
    echo "  2. Create a free cluster"
    echo "  3. Get connection string"
    echo "  4. Add to .env: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/education_copilot"
    echo ""
fi

# Check if .env file exists
if [ -f .env ]; then
    echo "✅ .env file exists"
    
    # Check if MONGODB_URI is set
    if grep -q "MONGODB_URI" .env; then
        echo "✅ MONGODB_URI is configured in .env"
        grep "MONGODB_URI" .env | sed 's/\(.*password\)[^@]*\(@.*\)/\1***\2/' || grep "MONGODB_URI" .env
    else
        echo "⚠️  MONGODB_URI not found in .env"
        echo ""
        echo "Adding default MongoDB URI..."
        echo "MONGODB_URI=mongodb://localhost:27017/education_copilot" >> .env
        echo "✅ Added MONGODB_URI to .env"
    fi
else
    echo "❌ .env file not found"
    echo "Creating .env from template..."
    if [ -f env.template ]; then
        cp env.template .env
        echo "MONGODB_URI=mongodb://localhost:27017/education_copilot" >> .env
        echo "✅ Created .env file"
    else
        echo "❌ env.template not found"
    fi
fi

echo ""
echo "📝 Next Steps:"
echo "  1. Start MongoDB (if using local installation)"
echo "  2. Run: npm run dev"
echo "  3. Check console for MongoDB connection status"
echo ""


