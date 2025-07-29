#!/bin/bash

# 🚀 Railway Deployment Script for Baileys WhatsApp Service
# Usage: ./deploy.sh

set -e

echo "🚀 Starting Railway deployment for Baileys WhatsApp Service..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g railway
fi

# Check if logged in to Railway
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run:"
    echo "   railway login"
    exit 1
fi

# Check if in Railway project
if ! railway status &> /dev/null; then
    echo "📁 No Railway project found. Creating new project..."
    railway login
    railway init
    echo "✅ Railway project initialized!"
else
    echo "✅ Railway project found!"
fi

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

# Get deployment URL
echo "🔗 Getting deployment URL..."
RAILWAY_URL=$(railway domain)

if [ -n "$RAILWAY_URL" ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your WhatsApp service is available at: $RAILWAY_URL"
    echo ""
    echo "🧪 Test your endpoints:"
    echo "   Health: $RAILWAY_URL/health"
    echo "   Init: $RAILWAY_URL/api/whatsapp/init"
    echo "   Status: $RAILWAY_URL/api/whatsapp/status"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Test the health endpoint"
    echo "   2. Initialize WhatsApp with /api/whatsapp/init"
    echo "   3. Scan the QR code returned"
    echo "   4. Test sending messages with /api/whatsapp/send"
else
    echo "⚠️ Deployment completed but URL not available yet."
    echo "   Check Railway dashboard for deployment status."
fi

echo "🎉 Deployment process completed!"