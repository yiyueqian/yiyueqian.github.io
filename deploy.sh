#!/bin/bash

# IP Tracker Deployment Script
echo "🚀 Deploying IP Tracking System to GitHub Pages..."

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Make sure you're in the correct directory."
    exit 1
fi

# Add all files
echo "📁 Adding files to git..."
git add .

# Show what will be committed
echo "📋 Files to be committed:"
git status --short

# Commit with timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "💾 Committing changes..."
git commit -m "Add comprehensive IP tracking system with debugging tools - $TIMESTAMP"

# Push to GitHub
echo "🌐 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🔗 Your website will be available at:"
    echo "   Main site: https://yiyueqian.github.io/"
    echo "   Dashboard: https://yiyueqian.github.io/admin-dashboard.html"
    echo "   Debug tool: https://yiyueqian.github.io/debug-tracker.html"
    echo "   Test page: https://yiyueqian.github.io/test-tracker.html"
    echo ""
    echo "⏰ GitHub Pages may take a few minutes to update."
    echo ""
    echo "🧪 To test the system:"
    echo "1. Visit your main site first"
    echo "2. Then check the dashboard"
    echo "3. Use the test page if you encounter issues"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi
