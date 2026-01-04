#!/bin/bash

# Environment Setup Script
# This script creates a .env file from the template

echo "🚀 Setting up environment variables..."

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled. Keeping existing .env file."
        exit 0
    fi
fi

# Copy template to .env
if [ -f env.template ]; then
    cp env.template .env
    echo "✅ .env file created successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Open .env file in your editor"
    echo "   2. Replace all placeholder values with your actual credentials"
    echo "   3. Make sure to change JWT_SECRET, SESSION_SECRET, and other security keys"
    echo ""
    echo "⚠️  IMPORTANT: Never commit .env to version control!"
else
    echo "❌ Error: env.template file not found!"
    exit 1
fi




