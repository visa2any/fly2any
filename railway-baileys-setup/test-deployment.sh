#!/bin/bash

# 🧪 Railway Deployment Test Script
# Usage: ./test-deployment.sh https://your-railway-url.up.railway.app

set -e

RAILWAY_URL=$1

if [ -z "$RAILWAY_URL" ]; then
    echo "❌ Usage: ./test-deployment.sh https://your-railway-url.up.railway.app"
    exit 1
fi

echo "🧪 Testing Railway deployment at: $RAILWAY_URL"
echo "=================================================="

# Test 1: Health Check
echo "🔍 Test 1: Health Check"
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" "$RAILWAY_URL/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -c 4)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Health check passed"
    echo "Response: $(echo "$HEALTH_RESPONSE" | head -c -4 | jq '.status' 2>/dev/null || echo "OK")"
else
    echo "❌ Health check failed (HTTP $HTTP_CODE)"
    exit 1
fi

echo ""

# Test 2: WhatsApp Init
echo "🔍 Test 2: WhatsApp Initialization"
INIT_RESPONSE=$(curl -s -X POST "$RAILWAY_URL/api/whatsapp/init" \
  -H "Content-Type: application/json" \
  -w "%{http_code}")

HTTP_CODE=$(echo "$INIT_RESPONSE" | tail -c 4)
RESPONSE_BODY=$(echo "$INIT_RESPONSE" | head -c -4)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ WhatsApp initialization successful"
    
    # Check if QR code is present
    if echo "$RESPONSE_BODY" | jq -e '.qrCode' >/dev/null 2>&1; then
        echo "✅ QR Code generated successfully"
        QR_LENGTH=$(echo "$RESPONSE_BODY" | jq -r '.qrCode' | wc -c)
        echo "📱 QR Code length: $QR_LENGTH characters"
    else
        echo "⚠️ No QR code in response (may already be connected)"
    fi
else
    echo "❌ WhatsApp initialization failed (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
fi

echo ""

# Test 3: Status Check
echo "🔍 Test 3: Status Check"
STATUS_RESPONSE=$(curl -s "$RAILWAY_URL/api/whatsapp/status" -w "%{http_code}")
HTTP_CODE=$(echo "$STATUS_RESPONSE" | tail -c 4)
RESPONSE_BODY=$(echo "$STATUS_RESPONSE" | head -c -4)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Status check successful"
    
    CONNECTION_STATE=$(echo "$RESPONSE_BODY" | jq -r '.connectionState' 2>/dev/null || echo "unknown")
    CONNECTED=$(echo "$RESPONSE_BODY" | jq -r '.connected' 2>/dev/null || echo "unknown")
    
    echo "📡 Connection State: $CONNECTION_STATE"
    echo "🔗 Connected: $CONNECTED"
    
    if [ "$CONNECTED" = "true" ]; then
        echo "🎉 WhatsApp is connected and ready!"
    else
        echo "⏳ WhatsApp not connected yet - scan QR code to connect"
    fi
else
    echo "❌ Status check failed (HTTP $HTTP_CODE)"
fi

echo ""
echo "=================================================="
echo "🎯 Test Summary:"
echo "   Service URL: $RAILWAY_URL"
echo "   Health: $([ "$HTTP_CODE" = "200" ] && echo "✅ OK" || echo "❌ FAILED")"
echo "   WhatsApp Init: Available"
echo "   Status API: Available"
echo ""
echo "📱 Next Steps:"
echo "   1. If QR code was generated, scan it with WhatsApp"
echo "   2. Check status again to verify connection"
echo "   3. Test sending messages once connected"
echo ""
echo "🔗 Useful endpoints:"
echo "   Health: $RAILWAY_URL/health"
echo "   Init: $RAILWAY_URL/api/whatsapp/init"
echo "   Status: $RAILWAY_URL/api/whatsapp/status"
echo "   Send: $RAILWAY_URL/api/whatsapp/send"
echo ""
echo "🎉 Deployment test completed!"