#!/bin/bash

echo "🧪 TaxFlowAI - Quick Demo Test"
echo "================================"
echo ""

echo "Step 1: Starting local web server..."
cd /home/user/TaxFlowAI
python3 -m http.server 8080 > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2

echo "✅ Server started on http://localhost:8080"
echo ""

echo "Step 2: Testing script availability..."
STATUS_TAX=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/tax-calculator-bundle.js)
STATUS_FIX=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/fix-calculate-browser.js)
STATUS_HTML=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/index.html)

echo "  tax-calculator-bundle.js: $STATUS_TAX"
echo "  fix-calculate-browser.js: $STATUS_FIX"
echo "  index.html: $STATUS_HTML"
echo ""

if [ "$STATUS_TAX" = "200" ] && [ "$STATUS_FIX" = "200" ] && [ "$STATUS_HTML" = "200" ]; then
    echo "✅ All files accessible!"
else
    echo "❌ Some files not accessible"
fi

echo ""
echo "Step 3: Opening browser..."
echo ""
echo "🌐 Open this URL in your browser:"
echo "   http://localhost:8080/index.html"
echo ""
echo "Then:"
echo "  1. Open browser console (F12)"
echo "  2. Look for: [TaxFlowAI] Calculate function ready!"
echo "  3. Enter income in Box A: 60000"
echo "  4. Click 'Estimate Credits' button"
echo "  5. See results appear below!"
echo ""
echo "Press Ctrl+C when done to stop the server"
echo ""

# Wait for user to press Ctrl+C
trap "kill $SERVER_PID; echo ''; echo '✅ Server stopped'; exit 0" INT
wait $SERVER_PID
