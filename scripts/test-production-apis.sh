#!/bin/bash

###############################################################################
# Production API Health Check Script
#
# Tests critical API endpoints before/after deployment
# Usage: ./scripts/test-production-apis.sh [base-url]
# Example: ./scripts/test-production-apis.sh https://fly2any.com
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default to localhost if no argument provided
BASE_URL="${1:-http://localhost:3000}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 Production API Health Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Base URL: ${YELLOW}$BASE_URL${NC}"
echo -e "Timestamp: $(date)"
echo ""

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test API endpoint
test_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5

    TESTS_RUN=$((TESTS_RUN + 1))

    echo -n "Testing $name... "

    # Make request and capture response
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" 2>&1)
    fi

    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    # Check status code
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $status_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))

        # Show preview of response
        if command -v jq &> /dev/null; then
            echo "$body" | jq -C '.' 2>/dev/null | head -n 5 || echo "$body" | head -c 200
        else
            echo "$body" | head -c 200
        fi
        echo ""
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo -e "${RED}Response:${NC}"
        echo "$body" | head -c 500
        echo ""
    fi
}

# Function to check environment variable in response
check_env_var() {
    local var_name=$1
    local expected_prefix=$2

    echo -n "Checking environment: $var_name... "

    response=$(curl -s "$BASE_URL/api/environment" 2>&1)

    if echo "$response" | grep -q "$expected_prefix"; then
        echo -e "${GREEN}✓ PASS${NC} (Correct mode detected)"
    else
        echo -e "${RED}✗ FAIL${NC} (Expected prefix: $expected_prefix)"
        echo "Response: $response"
    fi
    echo ""
}

echo -e "${YELLOW}━━━ 1. AI SESSION MANAGEMENT ━━━${NC}"
test_api \
    "AI Session - Create" \
    "POST" \
    "/api/ai/session" \
    '{"action":"create"}' \
    "200"

test_api \
    "AI Session - Get Current" \
    "GET" \
    "/api/ai/session?ip=current" \
    "" \
    "200"

echo -e "${YELLOW}━━━ 2. FLIGHT SEARCH ━━━${NC}"
test_api \
    "Flight Search - Basic" \
    "POST" \
    "/api/flights/search" \
    '{
        "origin": "JFK",
        "destination": "LAX",
        "departureDate": "2024-12-15",
        "adults": 1
    }' \
    "200"

test_api \
    "Flight Search - Round Trip" \
    "POST" \
    "/api/flights/search" \
    '{
        "origin": "SFO",
        "destination": "ORD",
        "departureDate": "2024-12-20",
        "returnDate": "2024-12-27",
        "adults": 2
    }' \
    "200"

echo -e "${YELLOW}━━━ 3. BOOKING FLOW ━━━${NC}"

# Note: These tests will fail without proper test data
# They are meant to verify API is responding, not full flow
echo -e "${BLUE}Note: Payment tests require valid test data${NC}"

test_api \
    "Payment Intent - Validation" \
    "POST" \
    "/api/booking-flow/create-payment-intent" \
    '{
        "bookingState": {
            "id": "test-123",
            "pricing": {
                "total": 299.99,
                "currency": "USD",
                "baseFare": 250,
                "taxes": 49.99,
                "seatFees": 0,
                "baggageFees": 0,
                "extrasFees": 0
            },
            "selectedFlight": {
                "id": "flight-1",
                "airline": "AA",
                "flightNumber": "100"
            }
        },
        "passengers": [{
            "id": "pax-1",
            "firstName": "Test",
            "lastName": "User",
            "email": "test@example.com",
            "phone": "+1234567890",
            "dateOfBirth": "1990-01-01",
            "gender": "male",
            "title": "mr"
        }]
    }' \
    "201"

echo -e "${YELLOW}━━━ 4. ENVIRONMENT VALIDATION ━━━${NC}"
echo -n "Checking environment endpoint... "
env_response=$(curl -s "$BASE_URL/api/environment" 2>&1)
echo "$env_response" | head -c 200
echo ""

# Check for test mode indicators
if echo "$env_response" | grep -q "test"; then
    echo -e "${GREEN}✓ Test mode detected${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Test mode not explicitly indicated${NC}"
fi

echo -e "${YELLOW}━━━ 5. HOMEPAGE & STATIC ASSETS ━━━${NC}"
echo -n "Testing homepage... "
homepage_status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$homepage_status" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $homepage_status)"
else
    echo -e "${RED}✗ FAIL${NC} (HTTP $homepage_status)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo -n "Testing API route... "
api_status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/environment")
if [ "$api_status" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $api_status)"
else
    echo -e "${RED}✗ FAIL${NC} (HTTP $api_status)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Test Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Total Tests: $TESTS_RUN"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ All tests passed! Ready for production.${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ Some tests failed. Review before deploying.${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
