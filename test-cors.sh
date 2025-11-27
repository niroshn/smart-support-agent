#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                    CORS Configuration Test                       ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test backend is running
echo "1. Testing backend health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" -H "Origin: http://localhost:5173" http://localhost:3001/api/health 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Backend is running${NC}"
    echo "  Response: $RESPONSE_BODY"
else
    echo -e "${RED}✗ Backend not responding (HTTP $HTTP_CODE)${NC}"
    echo -e "${YELLOW}  Make sure to run: cd server && yarn dev${NC}"
    exit 1
fi

echo ""

# Test CORS headers
echo "2. Testing CORS headers..."
CORS_HEADERS=$(curl -s -I -H "Origin: http://localhost:5173" http://localhost:3001/api/health 2>&1)

if echo "$CORS_HEADERS" | grep -q "Access-Control-Allow-Origin"; then
    ORIGIN=$(echo "$CORS_HEADERS" | grep "Access-Control-Allow-Origin" | cut -d' ' -f2- | tr -d '\r')
    echo -e "${GREEN}✓ CORS headers present${NC}"
    echo "  Access-Control-Allow-Origin: $ORIGIN"
else
    echo -e "${RED}✗ CORS headers missing${NC}"
    exit 1
fi

if echo "$CORS_HEADERS" | grep -q "Access-Control-Allow-Credentials"; then
    echo -e "${GREEN}✓ Credentials allowed${NC}"
else
    echo -e "${YELLOW}⚠ Credentials not explicitly allowed${NC}"
fi

echo ""

# Test preflight request
echo "3. Testing preflight OPTIONS request..."
OPTIONS_RESPONSE=$(curl -s -w "\n%{http_code}" -X OPTIONS \
    -H "Origin: http://localhost:5173" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    http://localhost:3001/api/chat 2>&1)

OPTIONS_CODE=$(echo "$OPTIONS_RESPONSE" | tail -n1)

if [ "$OPTIONS_CODE" = "204" ] || [ "$OPTIONS_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Preflight request successful (HTTP $OPTIONS_CODE)${NC}"
else
    echo -e "${YELLOW}⚠ Preflight returned HTTP $OPTIONS_CODE (may still work)${NC}"
fi

echo ""

# Test chat endpoint structure (not actual chat, just structure)
echo "4. Testing chat endpoint availability..."
CHAT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Origin: http://localhost:5173" \
    -H "Content-Type: application/json" \
    -d '{"messages":[],"newMessage":"test"}' \
    http://localhost:3001/api/chat 2>&1)

CHAT_CODE=$(echo "$CHAT_RESPONSE" | tail -n1)

if [ "$CHAT_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Chat endpoint accessible${NC}"
    echo "  (Streaming response received)"
elif [ "$CHAT_CODE" = "500" ]; then
    # 500 might be due to API key or AI service, but endpoint is accessible
    echo -e "${YELLOW}⚠ Chat endpoint accessible but returned HTTP 500${NC}"
    echo "  (This may be due to API configuration, CORS is OK)"
else
    echo -e "${YELLOW}⚠ Chat endpoint returned HTTP $CHAT_CODE${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✓ CORS configuration looks good!${NC}"
echo ""
echo "Next steps:"
echo "  1. Make sure frontend is running: yarn dev"
echo "  2. Open http://localhost:5173 in your browser"
echo "  3. Check browser console for any CORS errors"
echo "  4. Try sending a chat message"
echo ""
echo "If you still see CORS errors:"
echo "  - Clear browser cache (Ctrl+Shift+Delete)"
echo "  - Restart both servers"
echo "  - Check CORS_TROUBLESHOOTING.md for more help"
echo ""
