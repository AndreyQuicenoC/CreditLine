#!/bin/bash

# CREDITLINE - COMPREHENSIVE TESTING SCRIPT
# Tests all endpoints, security, persistence, and design

echo "================================"
echo "CreditLine Comprehensive Tests"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:5173"
ADMIN_EMAIL="admin@creditline.com"
ADMIN_PASSWORD="admin123"
OPERARIO_EMAIL="operario@creditline.com"
OPERARIO_PASSWORD="operario123"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function for tests
test_endpoint() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    local token="$6"

    echo -n "Testing: $test_name... "

    if [ -z "$token" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "$BACKEND_URL$endpoint" \
            -H "Content-Type: application/json" \
            ${data:+-d "$data"})
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "$BACKEND_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            ${data:+-d "$data"})
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [[ "$http_code" == "$expected_status"* ]]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $http_code)"
        echo "Response: $body"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo -e "${BLUE}=== PHASE 1: Connectivity Tests ===${NC}"
echo ""

# Test backend connectivity
echo -n "Backend connectivity... "
if curl -s -f "$BACKEND_URL/api/users/login/" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Backend not responding on port 8000)"
    ((TESTS_FAILED++))
    exit 1
fi

# Test frontend connectivity
echo -n "Frontend connectivity... "
if curl -s -f "$FRONTEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Frontend not responding on port 5173)"
    ((TESTS_FAILED++))
    exit 1
fi

echo ""
echo -e "${BLUE}=== PHASE 2: Authentication Tests ===${NC}"
echo ""

# Test 1: Login as admin
echo -n "Admin login... "
login_response=$(curl -s -X POST "$BACKEND_URL/api/users/login/" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}")

ADMIN_TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
ADMIN_USER=$(echo "$login_response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [[ ! -z "$ADMIN_TOKEN" ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (No token returned)"
    ((TESTS_FAILED++))
    exit 1
fi

# Test 2: Login as operario
echo -n "Operario login... "
login_response=$(curl -s -X POST "$BACKEND_URL/api/users/login/" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$OPERARIO_EMAIL\", \"password\": \"$OPERARIO_PASSWORD\"}")

OPERARIO_TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [[ ! -z "$OPERARIO_TOKEN" ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (No token returned)"
    ((TESTS_FAILED++))
fi

# Test 3: Invalid credentials
echo -n "Invalid credentials rejection... "
login_response=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/users/login/" \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@creditline.com", "password": "wrongpassword"}')

http_code=$(echo "$login_response" | tail -n1)
if [[ "$http_code" == "401"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Should return 401, got $http_code)"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${BLUE}=== PHASE 3: Authorization Tests ===${NC}"
echo ""

# Test 4: Operario cannot create users
echo -n "Operario cannot create users... "
response=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/users/create/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPERARIO_TOKEN" \
    -d '{"nombre": "Test", "email": "test@test.com", "rol": "OPERARIO", "password": "password123"}')

http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" == "403"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Should return 403, got $http_code)"
    ((TESTS_FAILED++))
fi

# Test 5: Operario cannot view all users
echo -n "Operario cannot list users... "
response=$(curl -s -w "\n%{http_code}" -X GET "$BACKEND_URL/api/users/list/" \
    -H "Authorization: Bearer $OPERARIO_TOKEN")

http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" == "403"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Should return 403, got $http_code)"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${BLUE}=== PHASE 4: User Management Tests ===${NC}"
echo ""

# Test 6: Create user with valid data
echo -n "Create user with valid data... "
test_timestamp=$(date +%s)
test_email="testuser$test_timestamp@example.com"
create_response=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/users/create/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"nombre\": \"Test User\", \"email\": \"$test_email\", \"rol\": \"OPERARIO\", \"password\": \"password123\"}")

http_code=$(echo "$create_response" | tail -n1)
body=$(echo "$create_response" | head -n-1)
TEST_USER_ID=$(echo "$body" | grep -o '"auth_id":"[^"]*' | cut -d'"' -f4)

if [[ "$http_code" == "201"* ]] && [[ ! -z "$TEST_USER_ID" ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
    ((TESTS_FAILED++))
fi

# Test 7: Duplicate email prevention
echo -n "Duplicate email prevention... "
response=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/users/create/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"nombre\": \"Another User\", \"email\": \"$test_email\", \"rol\": \"OPERARIO\", \"password\": \"password123\"}")

http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" == "400"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Should return 400, got $http_code)"
    ((TESTS_FAILED++))
fi

# Test 8: Password validation (too short)
echo -n "Password minimum length validation... "
response=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/users/create/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"nombre\": \"Test\", \"email\": \"short@pass.com\", \"rol\": \"OPERARIO\", \"password\": \"12345\"}")

http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" == "400"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Should return 400, got $http_code)"
    ((TESTS_FAILED++))
fi

# Test 9: Email format validation
echo -n "Email format validation... "
response=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/users/create/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"nombre\": \"Test\", \"email\": \"invalidemail\", \"rol\": \"OPERARIO\", \"password\": \"password123\"}")

http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" == "400"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Should return 400, got $http_code)"
    ((TESTS_FAILED++))
fi

# Test 10: List users
echo -n "List all users... "
response=$(curl -s -w "\n%{http_code}" -X GET "$BACKEND_URL/api/users/list/" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" == "200"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Should return 200, got $http_code)"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${BLUE}=== PHASE 5: Configuration Management Tests ===${NC}"
echo ""

# Test 11: Get system configuration
echo -n "Get system configuration... "
response=$(curl -s -w "\n%{http_code}" -X GET "$BACKEND_URL/api/users/system-config/" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)
if [[ "$http_code" == "200"* ]] && echo "$body" | grep -q "tasa_interes"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
    ((TESTS_FAILED++))
fi

# Test 12: Update system configuration
echo -n "Update system configuration... "
response=$(curl -s -w "\n%{http_code}" -X PUT "$BACKEND_URL/api/users/system-config/update/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"tasa_interes": 12.5, "impuesto_retraso": 6.0}')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)
if [[ "$http_code" == "200"* ]] && echo "$body" | grep -q "12.5"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
    ((TESTS_FAILED++))
fi

# Test 13: Config validation (out of range)
echo -n "Configuration value range validation... "
response=$(curl -s -w "\n%{http_code}" -X PUT "$BACKEND_URL/api/users/system-config/update/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"tasa_interes": 150}')

http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" == "400"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Should return 400, got $http_code)"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${BLUE}=== PHASE 6: Profile Management Tests ===${NC}"
echo ""

# Test 14: Get user profile
echo -n "Get user profile... "
response=$(curl -s -w "\n%{http_code}" -X GET "$BACKEND_URL/api/users/profile/" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)
if [[ "$http_code" == "200"* ]] && echo "$body" | grep -q "nombre"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
    ((TESTS_FAILED++))
fi

# Test 15: Update profile
echo -n "Update user profile... "
response=$(curl -s -w "\n%{http_code}" -X PUT "$BACKEND_URL/api/users/profile/update/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"nombre": "Updated Admin Name"}')

http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" == "200"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${BLUE}=== PHASE 7: Deletion Tests ===${NC}"
echo ""

# Test 16: Delete user
echo -n "Delete created user... "
if [[ ! -z "$TEST_USER_ID" ]]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$BACKEND_URL/api/users/$TEST_USER_ID/delete/" \
        -H "Authorization: Bearer $ADMIN_TOKEN")

    http_code=$(echo "$response" | tail -n1)
    if [[ "$http_code" == "200"* ]]; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${YELLOW}⊘ SKIP${NC} (No test user created)"
fi

# Test 17: Prevent self-deletion
echo -n "Prevent self-deletion... "
response=$(curl -s -w "\n%{http_code}" -X DELETE "$BACKEND_URL/api/users/$ADMIN_USER/delete/" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" == "400"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Should return 400, got $http_code)"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${BLUE}=== PHASE 8: CORS & Security Headers ===${NC}"
echo ""

# Test 18: CORS headers present
echo -n "CORS headers present... "
response=$(curl -s -i "$BACKEND_URL/api/users/login/" 2>&1 | grep -i "Access-Control-Allow-Origin")
if [[ ! -z "$response" ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (CORS headers missing)"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${BLUE}=== PHASE 9: Persistence Tests ===${NC}"
echo ""

# Test 19: Verify user persistence
echo -n "User persistence (verify in DB)... "
list_response=$(curl -s -X GET "$BACKEND_URL/api/users/list/" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

if echo "$list_response" | grep -q "$ADMIN_EMAIL"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (User not found in list)"
    ((TESTS_FAILED++))
fi

# Test 20: Verify configuration persistence
echo -n "Configuration persistence... "
config_response=$(curl -s -X GET "$BACKEND_URL/api/users/system-config/" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

if echo "$config_response" | grep -q "tasa_interes"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Config not found)"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${BLUE}=== PHASE 10: Frontend Tests ===${NC}"
echo ""

# Test 21: Frontend loads
echo -n "Frontend loads correctly... "
if curl -s "$FRONTEND_URL" | grep -q "CreditLine"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Frontend not loading)"
    ((TESTS_FAILED++))
fi

echo ""
echo "================================"
echo -e "Test Results"
echo "================================"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
TOTAL=$((TESTS_PASSED + TESTS_FAILED))
echo "Total: $TOTAL"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    echo -e "${GREEN}✓ System ready for deployment${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo -e "${YELLOW}Please fix the issues above${NC}"
    exit 1
fi
