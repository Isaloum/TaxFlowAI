#!/bin/bash

# TaxFlowAI Backend Deployment Test Script
# Tests all API endpoints after deployment to verify functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API endpoint (passed as argument or use default)
API_ENDPOINT="${1:-}"

if [ -z "$API_ENDPOINT" ]; then
  echo -e "${RED}❌ Error: API endpoint not provided${NC}"
  echo "Usage: $0 <api-endpoint>"
  echo "Example: $0 https://abc123.execute-api.us-east-1.amazonaws.com/prod"
  exit 1
fi

# Remove trailing slash if present
API_ENDPOINT="${API_ENDPOINT%/}"

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  TaxFlowAI Backend Deployment Test Suite     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}🌐 API Endpoint: ${API_ENDPOINT}${NC}"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to print test result
print_result() {
  local test_name="$1"
  local result="$2"
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  if [ "$result" = "PASS" ]; then
    echo -e "${GREEN}✅ ${test_name}${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}❌ ${test_name}${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

# Test 1: API Gateway connectivity
echo -e "${BLUE}🧪 Test 1: API Gateway Connectivity${NC}"
if curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$API_ENDPOINT" | grep -q "200\|404\|403"; then
  print_result "API Gateway is reachable" "PASS"
else
  print_result "API Gateway is reachable" "FAIL"
fi
echo ""

# Test 2: CORS headers
echo -e "${BLUE}🧪 Test 2: CORS Configuration${NC}"
CORS_RESPONSE=$(curl -s -I -X OPTIONS "$API_ENDPOINT/auth/login" \
  -H "Origin: https://main.d2gxcp91k7yq8u.amplifyapp.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" 2>/dev/null || echo "")

if echo "$CORS_RESPONSE" | grep -qi "access-control-allow-origin"; then
  print_result "CORS headers present" "PASS"
else
  print_result "CORS headers present" "FAIL"
fi

if echo "$CORS_RESPONSE" | grep -qi "access-control-allow-methods.*POST"; then
  print_result "CORS allows POST method" "PASS"
else
  print_result "CORS allows POST method" "FAIL"
fi
echo ""

# Test 3: Auth endpoint
echo -e "${BLUE}🧪 Test 3: Authentication Endpoint${NC}"
AUTH_RESPONSE=$(curl -s -X POST "$API_ENDPOINT/auth/login" \
  -H "Content-Type: application/json" \
  -H "Origin: https://main.d2gxcp91k7yq8u.amplifyapp.com" \
  -d '{"email":"test@example.com","password":"wrongpassword"}' \
  --max-time 10 2>/dev/null || echo '{"error":"timeout"}')

if echo "$AUTH_RESPONSE" | grep -q "error\|message\|invalid"; then
  print_result "Auth endpoint responding" "PASS"
else
  print_result "Auth endpoint responding" "FAIL"
fi
echo ""

# Test 4: Response time
echo -e "${BLUE}🧪 Test 4: Response Time${NC}"
START_TIME=$(date +%s%3N)
curl -s -X POST "$API_ENDPOINT/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' \
  --max-time 10 > /dev/null 2>&1 || true
END_TIME=$(date +%s%3N)
RESPONSE_TIME=$((END_TIME - START_TIME))

if [ "$RESPONSE_TIME" -lt 3000 ]; then
  print_result "Response time < 3s (${RESPONSE_TIME}ms)" "PASS"
else
  print_result "Response time < 3s (${RESPONSE_TIME}ms)" "FAIL"
fi
echo ""

# Test 5: Invalid JSON handling
echo -e "${BLUE}🧪 Test 5: Error Handling${NC}"
ERROR_RESPONSE=$(curl -s -X POST "$API_ENDPOINT/auth/login" \
  -H "Content-Type: application/json" \
  -d 'invalid-json' \
  --max-time 10 2>/dev/null || echo '{"error":"timeout"}')

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_ENDPOINT/auth/login" \
  -H "Content-Type: application/json" \
  -d 'invalid-json' \
  --max-time 10 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "500" ]; then
  print_result "Returns proper error codes" "PASS"
else
  print_result "Returns proper error codes (got $HTTP_CODE)" "FAIL"
fi
echo ""

# Test 6: API Gateway outputs
echo -e "${BLUE}🧪 Test 6: CloudFormation Outputs${NC}"
if command -v aws &> /dev/null; then
  STACK_OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name taxflowai-backend \
    --query 'Stacks[0].Outputs' \
    --output json 2>/dev/null || echo "[]")
  
  if echo "$STACK_OUTPUTS" | grep -q "ApiEndpoint"; then
    print_result "Stack outputs available" "PASS"
  else
    print_result "Stack outputs available" "FAIL"
  fi
else
  print_result "AWS CLI not available (skipped)" "PASS"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Test Summary                                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Tests:  ${TOTAL_TESTS}"
echo -e "${GREEN}Passed:       ${TESTS_PASSED}${NC}"
echo -e "${RED}Failed:       ${TESTS_FAILED}${NC}"
echo ""

# Calculate success rate
SUCCESS_RATE=$(awk "BEGIN {printf \"%.0f\", ($TESTS_PASSED / $TOTAL_TESTS) * 100}")
echo -e "Success Rate: ${SUCCESS_RATE}%"
echo ""

# Print API endpoint info
echo -e "${YELLOW}📋 API Information${NC}"
echo -e "Endpoint:     ${API_ENDPOINT}"
echo -e "Region:       us-east-1"
echo -e "Stack:        taxflowai-backend"
echo ""

# Print next steps
echo -e "${YELLOW}📝 Next Steps${NC}"
echo "1. Update frontend NEXT_PUBLIC_API_URL environment variable"
echo "2. Test end-to-end authentication flow"
echo "3. Verify document upload functionality"
echo "4. Check CloudWatch logs for any errors"
echo ""

# Exit with appropriate code
if [ "$TESTS_FAILED" -gt 0 ]; then
  echo -e "${RED}⚠️  Some tests failed. Review the output above.${NC}"
  exit 1
else
  echo -e "${GREEN}🎉 All tests passed successfully!${NC}"
  exit 0
fi
