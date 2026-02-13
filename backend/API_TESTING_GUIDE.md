# Smart Waste Management System - API Testing Guide

## Overview
This guide provides step-by-step instructions to test all API endpoints of the Smart Waste Management System backend using Thunder Client or Postman. Follow the sequence below to verify the complete end-to-end workflow.

## Prerequisites
- Thunder Client extension (VS Code) or Postman installed
- Backend server running on `http://localhost:5000`
- Thunder Client collection imported (see below)

---

## Phase 1: Authentication APIs

### 1.1 Register as Citizen
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "citizen@example.com",
  "password": "SecurePass123",
  "role": "citizen",
  "phoneNumber": "+91-9876543210",
  "address": "123 Green Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

**Expected Response:** 201 Created
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid...",
      "firstName": "John",
      "email": "citizen@example.com",
      "role": "citizen",
      "status": "active"
    },
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": "7d"
  }
}
```

**Save:** Store the `token` value for future requests.

---

### 1.2 Register as Waste Collector
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "firstName": "Ram",
  "lastName": "Kumar",
  "email": "collector@example.com",
  "password": "SecurePass123",
  "role": "collector",
  "phoneNumber": "+91-8765432109",
  "address": "456 Waste Hub",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400002",
  "collectorType": "individual",
  "collectorLicense": "LIC123456",
  "collectorVehicleType": "Auto Rickshaw"
}
```

**Expected Response:** 201 Created (Similar to above)

**Save:** Store the collector's `token` value.

---

### 1.3 Register as Admin
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "AdminPass123",
  "role": "admin",
  "phoneNumber": "+91-7654321098",
  "address": "Admin Office",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400003"
}
```

**Expected Response:** 201 Created

**Save:** Store the admin's `token` value.

---

### 1.4 Login as Citizen
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "citizen@example.com",
  "password": "SecurePass123"
}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGc...",
    "expiresIn": "7d"
  }
}
```

---

### 1.5 Get User Profile
**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer {citizen_token}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "firstName": "John",
    "email": "citizen@example.com",
    "role": "citizen",
    "status": "active"
  }
}
```

---

## Phase 2: Citizen APIs - Pickup Request Management

### 2.1 Create Pickup Request
**Endpoint:** `POST /api/citizen/pickup-request`

**Headers:**
```
Authorization: Bearer {citizen_token}
```

**Request Body:**
```json
{
  "wasteType": "recyclable",
  "wasteQuantity": 15.5,
  "description": "Old plastic bottles and cardboard",
  "pickupAddress": "123 Green Street, Mumbai",
  "pickupLatitude": 19.0760,
  "pickupLongitude": 72.8777,
  "scheduledDate": "2025-02-10T10:00:00Z",
  "preferredTimeSlot": "8AM-11AM",
  "priority": "high"
}
```

**Expected Response:** 201 Created
```json
{
  "success": true,
  "message": "Pickup request created successfully",
  "data": {
    "id": "uuid...",
    "citizenId": "uuid...",
    "wasteType": "recyclable",
    "wasteQuantity": 15.5,
    "requestStatus": "pending",
    "estimatedServiceCharge": 305,
    "createdAt": "2025-02-05T10:00:00Z"
  }
}
```

**Save:** Store the `id` (pickup request ID) for next steps.

---

### 2.2 Get Pickup Request Status
**Endpoint:** `GET /api/citizen/pickup-request/{pickup_request_id}`

**Headers:**
```
Authorization: Bearer {citizen_token}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "citizenId": "uuid...",
    "collectorId": null,
    "wasteType": "recyclable",
    "requestStatus": "pending",
    "payment": null
  }
}
```

---

### 2.3 List All Pickup Requests (Citizen)
**Endpoint:** `GET /api/citizen/pickup-requests?page=1&limit=10&status=pending`

**Headers:**
```
Authorization: Bearer {citizen_token}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "total": 1,
    "page": 1,
    "pages": 1,
    "items": [...]
  }
}
```

---

## Phase 3: Admin APIs - Collector Assignment

### 3.1 Admin Login (if needed)
Login using the admin credentials created in Step 1.3.

---

### 3.2 List All Pickup Requests (Admin View)
**Endpoint:** `GET /api/admin/pickup-requests?page=1&limit=10`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "total": 1,
    "page": 1,
    "pages": 1,
    "items": [
      {
        "id": "uuid...",
        "citizenId": "uuid...",
        "citizen": { "firstName": "John", "email": "citizen@example.com" },
        "wasteType": "recyclable",
        "requestStatus": "pending",
        "createdAt": "2025-02-05T10:00:00Z"
      }
    ]
  }
}
```

---

### 3.3 Assign Collector to Pickup Request
**Endpoint:** `PUT /api/admin/pickup-request/{pickup_request_id}/assign-collector`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "collectorId": "{collector_id_from_registration}"
}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "message": "Collector assigned successfully",
  "data": {
    "id": "uuid...",
    "collectorId": "collector_uuid...",
    "requestStatus": "assigned"
  }
}
```

---

## Phase 4: Collector APIs - Request Acceptance & Collection

### 4.1 Get Available Pickup Requests (Collector)
**Endpoint:** `GET /api/collector/available-requests`

**Headers:**
```
Authorization: Bearer {collector_token}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "total": 1,
    "items": [
      {
        "id": "uuid...",
        "citizen": { "firstName": "John", "address": "123 Green Street" },
        "wasteType": "recyclable",
        "requestStatus": "assigned"
      }
    ]
  }
}
```

---

### 4.2 Accept Pickup Request (Collector)
**Endpoint:** `PUT /api/collector/request/{pickup_request_id}/accept`

**Headers:**
```
Authorization: Bearer {collector_token}
```

**Request Body:**
```json
{
  "notes": "On the way to pick up waste"
}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "message": "Pickup request status updated",
  "data": {
    "id": "uuid...",
    "requestStatus": "accepted",
    "collectorAcceptanceTime": "2025-02-05T10:30:00Z"
  }
}
```

---

### 4.3 Mark as In-Transit (Collector)
**Endpoint:** `PUT /api/collector/request/{pickup_request_id}/in-transit`

**Headers:**
```
Authorization: Bearer {collector_token}
```

**Request Body:**
```json
{
  "notes": "Collector is on the way"
}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "requestStatus": "in_transit"
  }
}
```

---

### 4.4 Mark Waste as Collected (Collector)
**Endpoint:** `PUT /api/collector/request/{pickup_request_id}/collected`

**Headers:**
```
Authorization: Bearer {collector_token}
```

**Request Body:**
```json
{
  "notes": "Waste successfully collected - 15.5 kg",
  "imageProof": ["https://example.com/image1.jpg"]
}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "requestStatus": "collected",
    "collectionTime": "2025-02-05T11:00:00Z"
  }
}
```

---

## Phase 5: Admin APIs - Verification & Payment

### 5.1 Admin Verifies Collection
**Endpoint:** `PUT /api/admin/pickup-request/{pickup_request_id}/verify`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "notes": "Verification complete - Waste quantity and type confirmed"
}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "requestStatus": "verified",
    "verificationTime": "2025-02-05T11:30:00Z"
  }
}
```

---

## Phase 6: Payment APIs

### 6.1 Generate Invoice (Citizen)
**Endpoint:** `POST /api/citizen/invoice`

**Headers:**
```
Authorization: Bearer {citizen_token}
```

**Request Body:**
```json
{
  "pickupRequestId": "{pickup_request_id}"
}
```

**Expected Response:** 201 Created
```json
{
  "success": true,
  "message": "Invoice generated successfully",
  "data": {
    "id": "uuid...",
    "pickupRequestId": "uuid...",
    "serviceCharge": 305,
    "tax": 54.9,
    "totalAmount": 359.9,
    "invoiceNumber": "INV-1707130800000-ABC123XYZ",
    "paymentStatus": "pending"
  }
}
```

**Save:** Store the `id` (payment ID) for the next step.

---

### 6.2 Initiate Payment (Citizen)
**Endpoint:** `POST /api/citizen/payment/initiate`

**Headers:**
```
Authorization: Bearer {citizen_token}
```

**Request Body:**
```json
{
  "paymentId": "{payment_id}",
  "paymentMethod": "upi",
  "transactionReference": "UPI123456789"
}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "message": "Payment initiated",
  "data": {
    "id": "uuid...",
    "paymentStatus": "initiated",
    "paymentGateway": "Razorpay"
  }
}
```

---

### 6.3 Complete Payment (Citizen)
**Endpoint:** `POST /api/citizen/payment/complete`

**Headers:**
```
Authorization: Bearer {citizen_token}
```

**Request Body:**
```json
{
  "paymentId": "{payment_id}",
  "transactionId": "TXN-1707130900000"
}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "message": "Payment completed successfully",
  "data": {
    "id": "uuid...",
    "paymentStatus": "completed",
    "transactionId": "TXN-1707130900000",
    "paidAt": "2025-02-05T12:00:00Z"
  }
}
```

---

### 6.4 List Payments (Citizen)
**Endpoint:** `GET /api/citizen/payments?page=1&limit=10&paymentStatus=completed`

**Headers:**
```
Authorization: Bearer {citizen_token}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "total": 1,
    "items": [...]
  }
}
```

---

## Phase 7: Notifications & Final Status Confirmation

### 7.1 Get Pickup Request Status (Final)
**Endpoint:** `GET /api/citizen/pickup-request/{pickup_request_id}`

**Headers:**
```
Authorization: Bearer {citizen_token}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "requestStatus": "completed",
    "payment": {
      "paymentStatus": "completed",
      "totalAmount": 359.9
    },
    "citizen": { "firstName": "John" },
    "collector": { "firstName": "Ram" }
  }
}
```

**Result:** The entire workflow is complete! ✅

---

## Error Handling Test Cases

### Test Unauthorized Access
**Endpoint:** `GET /api/citizen/pickup-requests` (without Authorization header)

**Expected Response:** 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required. Please provide a valid JWT token.",
  "error": "NO_TOKEN"
}
```

---

### Test Forbidden Access
**Endpoint:** `GET /api/admin/pickup-requests` (using citizen token)

**Headers:**
```
Authorization: Bearer {citizen_token}
```

**Expected Response:** 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden: This action requires one of these roles: admin"
}
```

---

### Test Invalid Input
**Endpoint:** `POST /api/citizen/pickup-request` (missing required fields)

**Request Body:**
```json
{
  "wasteType": "invalid_type"
}
```

**Expected Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [...]
}
```

---

## Summary of Test Sequence

1. ✅ Register 3 users (citizen, collector, admin)
2. ✅ Login and retrieve profile
3. ✅ Citizen creates pickup request
4. ✅ Admin assigns collector to request
5. ✅ Collector accepts and collects waste
6. ✅ Admin verifies collection
7. ✅ Citizen generates invoice
8. ✅ Citizen completes payment
9. ✅ Final status confirmation
10. ✅ Error handling validation

---

## Importing Thunder Client Collection

1. Copy the JSON collection file: `smart-waste-api-collection.json`
2. Open VS Code → Thunder Client
3. Click "Import" → Select the JSON file
4. All requests will be pre-configured with proper headers and endpoints
5. Replace token placeholders with actual tokens from Step 1

---

## Notes

- All timestamps are in ISO 8601 format
- Token expiry is 7 days by default
- Service charges are calculated as: `baseCharge (50) + (quantity × 10) + priorityCharge`
- Tax is 18% GST on service charge
- All sensitive data (passwords, tokens) should be stored securely
