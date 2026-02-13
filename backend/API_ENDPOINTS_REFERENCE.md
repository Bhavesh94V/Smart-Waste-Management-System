# Smart Waste Management API - Complete Endpoints Reference

## Quick Reference Table

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|----|
| POST | `/auth/register` | Register new user | No | - |
| POST | `/auth/login` | Login user | No | - |
| POST | `/auth/logout` | Logout user | Yes | All |
| GET | `/auth/profile` | Get user profile | Yes | All |
| PUT | `/auth/profile` | Update profile | Yes | All |
| POST | `/auth/change-password` | Change password | Yes | All |
| POST | `/citizen/pickup-request` | Create request | Yes | Citizen |
| GET | `/citizen/pickup-request/:id` | Get request | Yes | Citizen/Admin |
| GET | `/citizen/pickup-requests` | List requests | Yes | Citizen/Admin |
| PUT | `/citizen/pickup-request/:id/status` | Update status | Yes | Citizen/Admin |
| GET | `/citizen/statistics` | Get stats | Yes | Citizen/Admin |
| POST | `/citizen/invoice` | Generate invoice | Yes | Citizen |
| POST | `/citizen/payment/initiate` | Start payment | Yes | Citizen |
| POST | `/citizen/payment/complete` | Complete payment | Yes | Citizen |
| GET | `/citizen/payments` | List payments | Yes | Citizen |
| GET | `/collector/available-requests` | Available requests | Yes | Collector |
| GET | `/collector/assigned-requests` | Assigned requests | Yes | Collector |
| GET | `/collector/request/:id` | Request details | Yes | Collector |
| PUT | `/collector/request/:id/accept` | Accept request | Yes | Collector |
| PUT | `/collector/request/:id/reject` | Reject request | Yes | Collector |
| PUT | `/collector/request/:id/in-transit` | In-transit | Yes | Collector |
| PUT | `/collector/request/:id/collected` | Mark collected | Yes | Collector |
| GET | `/admin/pickup-requests` | All requests | Yes | Admin |
| GET | `/admin/pickup-request/:id` | Request details | Yes | Admin |
| PUT | `/admin/pickup-request/:id/assign-collector` | Assign | Yes | Admin |
| PUT | `/admin/pickup-request/:id/verify` | Verify collection | Yes | Admin |
| GET | `/admin/payments` | All payments | Yes | Admin |
| POST | `/admin/payment/refund` | Refund payment | Yes | Admin |
| GET | `/admin/dashboard-stats` | Statistics | Yes | Admin |
| POST | `/iot/sensor-data` | Send sensor data | No | - |
| GET | `/iot/sensor-data/:binId` | Get sensor history | Yes | Admin |
| GET | `/iot/bins/status` | All bins status | Yes | Admin |
| GET | `/iot/alerts` | Active alerts | Yes | Admin |

---

## Detailed Endpoint Documentation

### AUTHENTICATION ENDPOINTS

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "citizen",
  "phoneNumber": "+91-9876543210",
  "address": "123 Green Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}

Response (201 Created):
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "citizen",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}

Error (409 Conflict):
{
  "success": false,
  "message": "Email already registered"
}
```

#### 2. Login User
```http
POST /api/auth/login
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (200 OK):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGc...",
    "expiresIn": "7d"
  }
}

Error (401 Unauthorized):
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### 3. Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "citizen",
    "status": "active",
    "phoneNumber": "+91-9876543210",
    "address": "123 Green Street",
    "city": "Mumbai"
  }
}
```

#### 4. Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "phoneNumber": "+91-9876543211",
  "address": "456 New Street",
  "city": "Pune"
}

Response (200 OK):
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

#### 5. Change Password
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "oldPassword": "SecurePass123",
  "newPassword": "NewSecurePass456"
}

Response (200 OK):
{
  "success": true,
  "message": "Password changed successfully"
}

Error (401 Unauthorized):
{
  "success": false,
  "message": "Current password is incorrect"
}
```

---

### CITIZEN ENDPOINTS

#### 1. Create Pickup Request
```http
POST /api/citizen/pickup-request
Authorization: Bearer {citizen_token}
Content-Type: application/json

Request:
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

Response (201 Created):
{
  "success": true,
  "message": "Pickup request created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "citizenId": "550e8400-e29b-41d4-a716-446655440000",
    "wasteType": "recyclable",
    "wasteQuantity": 15.5,
    "pickupAddress": "123 Green Street, Mumbai",
    "scheduledDate": "2025-02-10T10:00:00Z",
    "preferredTimeSlot": "8AM-11AM",
    "requestStatus": "pending",
    "estimatedServiceCharge": 305,
    "priority": "high",
    "createdAt": "2025-02-05T10:00:00Z"
  }
}

Validation Error (400 Bad Request):
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "field": "wasteType",
      "message": "Invalid waste type"
    }
  ]
}
```

#### 2. Get Pickup Request
```http
GET /api/citizen/pickup-request/{id}
Authorization: Bearer {citizen_token}

Response (200 OK):
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "citizenId": "550e8400-e29b-41d4-a716-446655440000",
    "collectorId": null,
    "wasteType": "recyclable",
    "wasteQuantity": 15.5,
    "requestStatus": "pending",
    "citizen": {
      "firstName": "John",
      "email": "john@example.com",
      "phoneNumber": "+91-9876543210"
    },
    "collector": null,
    "payment": null
  }
}
```

#### 3. List Pickup Requests (Pagination)
```http
GET /api/citizen/pickup-requests?page=1&limit=10&status=pending
Authorization: Bearer {citizen_token}

Response (200 OK):
{
  "success": true,
  "data": {
    "total": 5,
    "page": 1,
    "pages": 1,
    "items": [
      { ... },
      { ... }
    ]
  }
}

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- status: Filter by status (pending, assigned, collected, completed, etc.)
- wasteType: Filter by waste type
- dateFrom: Filter from date (ISO format)
- dateTo: Filter to date (ISO format)
```

#### 4. Get Pickup Statistics
```http
GET /api/citizen/statistics
Authorization: Bearer {citizen_token}

Response (200 OK):
{
  "success": true,
  "data": {
    "total": 10,
    "pending": 2,
    "assigned": 1,
    "accepted": 0,
    "in_transit": 1,
    "collected": 2,
    "verified": 2,
    "completed": 2,
    "cancelled": 0
  }
}
```

#### 5. Generate Invoice
```http
POST /api/citizen/invoice
Authorization: Bearer {citizen_token}
Content-Type: application/json

Request:
{
  "pickupRequestId": "550e8400-e29b-41d4-a716-446655440001"
}

Response (201 Created):
{
  "success": true,
  "message": "Invoice generated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "pickupRequestId": "550e8400-e29b-41d4-a716-446655440001",
    "serviceCharge": 305,
    "tax": 54.9,
    "totalAmount": 359.9,
    "currency": "INR",
    "paymentStatus": "pending",
    "invoiceNumber": "INV-1707130800000-ABC123XYZ",
    "invoiceDate": "2025-02-05T10:00:00Z"
  }
}

Conflict Error (400):
{
  "success": false,
  "message": "Payment already initiated for this request"
}
```

#### 6. Initiate Payment
```http
POST /api/citizen/payment/initiate
Authorization: Bearer {citizen_token}
Content-Type: application/json

Request:
{
  "paymentId": "550e8400-e29b-41d4-a716-446655440002",
  "paymentMethod": "upi",
  "transactionReference": "UPI123456789"
}

Response (200 OK):
{
  "success": true,
  "message": "Payment initiated",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "paymentStatus": "initiated",
    "paymentMethod": "upi",
    "paymentGateway": "Razorpay",
    "totalAmount": 359.9
  }
}
```

#### 7. Complete Payment
```http
POST /api/citizen/payment/complete
Authorization: Bearer {citizen_token}
Content-Type: application/json

Request:
{
  "paymentId": "550e8400-e29b-41d4-a716-446655440002",
  "transactionId": "TXN-1707130900000"
}

Response (200 OK):
{
  "success": true,
  "message": "Payment completed successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "paymentStatus": "completed",
    "transactionId": "TXN-1707130900000",
    "paidAt": "2025-02-05T12:00:00Z",
    "totalAmount": 359.9
  }
}
```

#### 8. List Payments
```http
GET /api/citizen/payments?page=1&limit=10&paymentStatus=completed
Authorization: Bearer {citizen_token}

Response (200 OK):
{
  "success": true,
  "data": {
    "total": 3,
    "page": 1,
    "pages": 1,
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "invoiceNumber": "INV-1707130800000-ABC123XYZ",
        "totalAmount": 359.9,
        "paymentStatus": "completed",
        "invoiceDate": "2025-02-05T10:00:00Z"
      }
    ]
  }
}
```

---

### COLLECTOR ENDPOINTS

#### 1. Get Available Pickup Requests
```http
GET /api/collector/available-requests?page=1&limit=10
Authorization: Bearer {collector_token}

Response (200 OK):
{
  "success": true,
  "data": {
    "total": 5,
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "wasteType": "recyclable",
        "wasteQuantity": 15.5,
        "pickupAddress": "123 Green Street, Mumbai",
        "scheduledDate": "2025-02-10T10:00:00Z",
        "preferredTimeSlot": "8AM-11AM",
        "citizen": {
          "firstName": "John",
          "email": "john@example.com",
          "address": "123 Green Street, Mumbai"
        }
      }
    ]
  }
}
```

#### 2. Get Assigned Requests
```http
GET /api/collector/assigned-requests?page=1&limit=10
Authorization: Bearer {collector_token}

Response (200 OK):
{
  "success": true,
  "data": {
    "total": 3,
    "items": [ ... ]
  }
}
```

#### 3. Accept Pickup Request
```http
PUT /api/collector/request/{id}/accept
Authorization: Bearer {collector_token}
Content-Type: application/json

Request:
{
  "notes": "On the way to pick up waste"
}

Response (200 OK):
{
  "success": true,
  "message": "Pickup request status updated",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "requestStatus": "accepted",
    "collectorAcceptanceTime": "2025-02-05T10:30:00Z"
  }
}
```

#### 4. Reject Pickup Request
```http
PUT /api/collector/request/{id}/reject
Authorization: Bearer {collector_token}
Content-Type: application/json

Request:
{
  "notes": "Cannot fulfill this request due to heavy traffic"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "requestStatus": "rejected"
  }
}
```

#### 5. Mark In-Transit
```http
PUT /api/collector/request/{id}/in-transit
Authorization: Bearer {collector_token}
Content-Type: application/json

Request:
{
  "notes": "Collector is on the way"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "requestStatus": "in_transit"
  }
}
```

#### 6. Mark as Collected
```http
PUT /api/collector/request/{id}/collected
Authorization: Bearer {collector_token}
Content-Type: application/json

Request:
{
  "notes": "Waste successfully collected - 15.5 kg",
  "imageProof": [
    "https://cdn.example.com/proof1.jpg",
    "https://cdn.example.com/proof2.jpg"
  ]
}

Response (200 OK):
{
  "success": true,
  "data": {
    "requestStatus": "collected",
    "collectionTime": "2025-02-05T11:00:00Z"
  }
}
```

---

### ADMIN ENDPOINTS

#### 1. List All Pickup Requests
```http
GET /api/admin/pickup-requests?page=1&limit=10&status=pending
Authorization: Bearer {admin_token}

Response (200 OK):
{
  "success": true,
  "data": {
    "total": 15,
    "page": 1,
    "pages": 2,
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "citizen": {
          "firstName": "John",
          "email": "john@example.com"
        },
        "wasteType": "recyclable",
        "requestStatus": "pending",
        "createdAt": "2025-02-05T10:00:00Z"
      }
    ]
  }
}
```

#### 2. Assign Collector to Request
```http
PUT /api/admin/pickup-request/{id}/assign-collector
Authorization: Bearer {admin_token}
Content-Type: application/json

Request:
{
  "collectorId": "550e8400-e29b-41d4-a716-446655440003"
}

Response (200 OK):
{
  "success": true,
  "message": "Collector assigned successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "collectorId": "550e8400-e29b-41d4-a716-446655440003",
    "requestStatus": "assigned"
  }
}
```

#### 3. Verify Collection
```http
PUT /api/admin/pickup-request/{id}/verify
Authorization: Bearer {admin_token}
Content-Type: application/json

Request:
{
  "notes": "Verification complete - Waste quantity and type confirmed"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "requestStatus": "verified",
    "verificationTime": "2025-02-05T11:30:00Z",
    "verificationNotes": "Verification complete - Waste quantity and type confirmed"
  }
}
```

#### 4. List All Payments
```http
GET /api/admin/payments?page=1&limit=10&paymentStatus=completed
Authorization: Bearer {admin_token}

Response (200 OK):
{
  "success": true,
  "data": {
    "total": 8,
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "invoiceNumber": "INV-1707130800000-ABC123XYZ",
        "totalAmount": 359.9,
        "paymentStatus": "completed",
        "transactionId": "TXN-1707130900000"
      }
    ]
  }
}
```

#### 5. Refund Payment
```http
POST /api/admin/payment/refund
Authorization: Bearer {admin_token}
Content-Type: application/json

Request:
{
  "paymentId": "550e8400-e29b-41d4-a716-446655440002",
  "refundReason": "User requested cancellation"
}

Response (200 OK):
{
  "success": true,
  "message": "Payment refunded successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "paymentStatus": "refunded",
    "refundAmount": 359.9,
    "refundedAt": "2025-02-05T13:00:00Z"
  }
}
```

#### 6. Dashboard Statistics
```http
GET /api/admin/dashboard-stats
Authorization: Bearer {admin_token}

Response (200 OK):
{
  "success": true,
  "data": {
    "total": 25,
    "pending": 3,
    "assigned": 2,
    "completed": 15,
    "cancelled": 5
  }
}
```

---

### IoT ENDPOINTS

#### 1. Send Sensor Data
```http
POST /api/iot/sensor-data
X-API-Key: {iot_api_key}
Content-Type: application/json

Request:
{
  "binId": "BIN-001",
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777,
    "address": "Mumbai Downtown"
  },
  "sensorReadings": {
    "fillLevel": 75,
    "weight": 45.5,
    "temperature": 28,
    "humidity": 65,
    "methaneLevel": 5,
    "odorLevel": 3
  },
  "wasteType": "mixed",
  "status": "high"
}

Response (201 Created):
{
  "success": true,
  "message": "Sensor data received",
  "data": {
    "binId": "BIN-001",
    "sensorReadings": { ... },
    "status": "high",
    "timestamp": "2025-02-05T10:00:00Z"
  }
}
```

#### 2. Get Sensor History
```http
GET /api/iot/sensor-data/{binId}?limit=100
Authorization: Bearer {admin_token}

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "binId": "BIN-001",
      "sensorReadings": { ... },
      "timestamp": "2025-02-05T10:00:00Z"
    }
  ]
}
```

#### 3. Get All Bins Status
```http
GET /api/iot/bins/status
Authorization: Bearer {admin_token}

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "binId": "BIN-001",
      "status": "high",
      "fillLevel": 75,
      "alert": "none",
      "timestamp": "2025-02-05T10:00:00Z"
    }
  ]
}
```

#### 4. Get Active Alerts
```http
GET /api/iot/alerts
Authorization: Bearer {admin_token}

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "binId": "BIN-005",
      "alert": "overfull",
      "alertTriggeredAt": "2025-02-05T09:45:00Z",
      "sensorReadings": { ... }
    }
  ]
}
```

---

## HTTP Status Codes Reference

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | GET request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

---

## Request/Response Headers

### Standard Request Headers
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
Accept: application/json
```

### Standard Response Headers
```
Content-Type: application/json
X-Response-Time: 125ms
```

---

## Data Types & Validation

### Waste Types
- `biodegradable` - Food waste, leaves, paper, etc.
- `recyclable` - Plastic, paper, metal, glass
- `hazardous` - Chemicals, batteries, medical waste
- `mixed` - Mixed waste
- `e-waste` - Electronic waste

### Time Slots
- `8AM-11AM`
- `11AM-2PM`
- `2PM-5PM`
- `5PM-8PM`

### Request Status
- `pending` - Waiting for collection
- `assigned` - Assigned to collector
- `accepted` - Collector accepted
- `rejected` - Collector rejected
- `in_transit` - Being transported
- `collected` - Waste collected
- `verified` - Admin verified
- `completed` - Process complete
- `cancelled` - Request cancelled

### Payment Methods
- `upi` - UPI transfer
- `credit_card` - Credit card
- `debit_card` - Debit card
- `bank_transfer` - Bank transfer
- `wallet` - Digital wallet
- `cash_on_collection` - Cash on collection

---

## Example Workflows

### Complete Pickup Request Workflow
1. Citizen creates request → `POST /citizen/pickup-request`
2. Admin assigns collector → `PUT /admin/pickup-request/:id/assign-collector`
3. Collector accepts → `PUT /collector/request/:id/accept`
4. Collector marks in-transit → `PUT /collector/request/:id/in-transit`
5. Collector marks collected → `PUT /collector/request/:id/collected`
6. Admin verifies → `PUT /admin/pickup-request/:id/verify`
7. Citizen generates invoice → `POST /citizen/invoice`
8. Citizen pays → `POST /citizen/payment/complete`
9. Request completed → Status becomes `completed`

### Authentication Workflow
1. User registers → `POST /auth/register`
2. User logs in → `POST /auth/login`
3. Frontend stores token from login response
4. All subsequent requests include token in Authorization header
5. User logs out → `POST /auth/logout`

---

## Postman/Thunder Client Collection

A complete collection file is provided: `smart-waste-api-collection.json`

### Import Instructions:
1. Download the collection file
2. Open Postman/Thunder Client
3. Click "Import" or "Collections" → "Import Collection"
4. Select the JSON file
5. Update environment variables with your tokens
6. Start testing!

---

## Rate Limiting

- No explicit rate limiting in basic setup
- Implement as needed:
  - Public endpoints: 100 requests/hour
  - Authenticated endpoints: 1000 requests/hour
  - Admin endpoints: Unlimited

---

## Pagination

All list endpoints support pagination:

```
GET /api/endpoint?page=1&limit=10&sortBy=createdAt&sortOrder=DESC

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10, max: 100)
- sortBy: Sort field (default: createdAt)
- sortOrder: ASC or DESC (default: DESC)
```

Response includes:
```json
{
  "total": 50,
  "page": 1,
  "pages": 5,
  "items": [...]
}
```
