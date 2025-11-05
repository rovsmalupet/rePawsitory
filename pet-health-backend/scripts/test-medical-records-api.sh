#!/bin/bash

echo "Testing Medical Records API Endpoints"
echo "======================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Login as vet
echo "1. Logging in as Dr. Parker..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dr.parker@vetclinic.com","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo "Token: ${TOKEN:0:30}..."
echo ""

# Step 2: Get vet's patients
echo "2. Getting vet's patients..."
PATIENTS=$(curl -s http://localhost:5001/api/vet/patients \
  -H "Authorization: Bearer $TOKEN")

PET_ID=$(echo $PATIENTS | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PET_ID" ]; then
  echo -e "${RED}✗ No patients found${NC}"
  exit 1
fi

PATIENT_NAME=$(echo $PATIENTS | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✓ Found patients${NC}"
echo "First patient: $PATIENT_NAME (ID: $PET_ID)"
echo ""

# Step 3: Get medical records for the patient
echo "3. Getting medical records for $PATIENT_NAME..."
RECORDS=$(curl -s "http://localhost:5001/api/pets/$PET_ID/medical-records" \
  -H "Authorization: Bearer $TOKEN")

RECORD_COUNT=$(echo $RECORDS | grep -o '"_id"' | wc -l)

if [ "$RECORD_COUNT" -eq 0 ]; then
  echo -e "${RED}✗ No medical records found${NC}"
  echo "Response: $RECORDS"
  exit 1
fi

echo -e "${GREEN}✓ Found $RECORD_COUNT medical record(s)${NC}"
echo ""

# Step 4: Show record details
echo "4. Medical Records Summary:"
echo "-------------------------"
echo "$RECORDS" | python3 -m json.tool 2>/dev/null || echo "$RECORDS"
echo ""

echo -e "${GREEN}✓ All API endpoints working correctly!${NC}"
echo ""
echo "Next steps:"
echo "1. Open your browser to http://localhost:3000"
echo "2. Login as dr.parker@vetclinic.com / password123"
echo "3. Go to 'My Patients'"
echo "4. Click 'View Records' on any patient"
echo "5. You should see the medical records"
