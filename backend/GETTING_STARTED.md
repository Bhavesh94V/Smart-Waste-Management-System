# Smart Waste Management Backend - Getting Started Guide

Welcome! This guide will help you quickly set up and start testing the Smart Waste Management System backend API.

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and update:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD` - Your PostgreSQL credentials
- `JWT_SECRET` - A strong random string
- `MONGODB_URI` - Your MongoDB connection string (or use default)

### 3. Start the Server
```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════════════════════╗
║  Smart Waste Management Backend API                    ║
║  Server running on: http://localhost:5000              ║
║  Environment: development                              ║
╚════════════════════════════════════════════════════════╝
```

### 4. Test the API
```bash
# Test health check
curl http://localhost:5000/api/health

# Response:
# {"status":"OK","timestamp":"2025-02-05T10:00:00Z","uptime":12.34,"environment":"development"}
```

---

## Complete Testing Workflow

### Option 1: Using Thunder Client (Recommended)

1. **Install Extension**
   - Open VS Code
   - Search for "Thunder Client" in Extensions
   - Install and enable

2. **Import Collection**
   - Open Thunder Client
   - Click "Import" button
   - Select `smart-waste-api-collection.json`
   - All 38 pre-configured requests will be imported

3. **Set Environment Variables**
   - After first login requests, copy the `token` value
   - In Thunder Client, set variable: `citizen_token = {copied_token}`
   - Do the same for `collector_token` and `admin_token`

4. **Follow the Testing Guide**
   - Open `API_TESTING_GUIDE.md`
   - Execute requests in the exact order shown
   - Verify each response matches the expected format

### Option 2: Using Postman

1. Download and install Postman
2. Import `smart-waste-api-collection.json`
3. Set up environment variables (same as Thunder Client)
4. Follow `API_TESTING_GUIDE.md`

### Option 3: Using cURL Commands

```bash
# 1. Register a Citizen
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "role": "citizen",
    "phoneNumber": "+91-9876543210"
  }'

# Copy the token from response

# 2. Create Pickup Request
TOKEN="eyJhbGciOiJIUzI1NiIs..." # From registration
curl -X POST http://localhost:5000/api/citizen/pickup-request \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "wasteType": "recyclable",
    "wasteQuantity": 15.5,
    "pickupAddress": "123 Green Street, Mumbai",
    "scheduledDate": "2025-02-10T10:00:00Z",
    "preferredTimeSlot": "8AM-11AM"
  }'
```

---

## Understanding the Architecture

```
┌─────────────────────────────────────┐
│  Frontend (React/Vue)               │
│  Citizen / Collector / Admin        │
└──────────────────┬──────────────────┘
                   │ HTTP REST
┌──────────────────▼──────────────────┐
│  Express.js Application             │
│  Controllers → Services → Database  │
└──────────────────┬──────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   PostgreSQL            MongoDB
  (User, Requests,    (IoT Sensor
   Payments, etc)      Data)
```

### Key Concepts

**Roles**
- **Citizen**: Creates waste pickup requests, makes payments
- **Collector**: Accepts assignments, collects waste
- **Admin**: Manages requests, assigns collectors, verifies collection

**Request Status Flow**
```
pending → assigned → accepted → in_transit → collected → verified → completed
```

**Payment Status Flow**
```
pending → initiated → completed
                  ↘ failed
```

---

## Directory Structure

```
backend/
├── src/
│   ├── config/              # Database configuration
│   │   ├── database.js      # PostgreSQL/MySQL setup
│   │   └── mongodb.js       # MongoDB setup
│   │
│   ├── models/              # Database models
│   │   ├── User.js
│   │   ├── PickupRequest.js
│   │   ├── Payment.js
│   │   ├── CollectorRoute.js
│   │   ├── AuditLog.js
│   │   └���─ IoTSensorData.js
│   │
│   ├── services/            # Business logic
│   │   ├── AuthService.js
│   │   ├── PickupRequestService.js
│   │   └── PaymentService.js
│   │
│   ├── controllers/         # Request handlers
│   │   ├── AuthController.js
│   │   ├── PickupRequestController.js
│   │   └── PaymentController.js
│   │
│   ├── routes/              # API endpoints
│   │   ├── auth.routes.js
│   │   ├── citizen.routes.js
│   │   ├── collector.routes.js
│   │   ├── admin.routes.js
│   │   └── iot.routes.js
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js          # JWT & Authorization
│   │   ├── errorHandler.js  # Global error handling
│   │   └── requestLogger.js # Request logging
│   │
│   ├── utils/               # Utility functions
│   │   ├── logger.js        # Winston logger
│   │   └── validators.js    # Input validation
│   │
│   └── server.js            # Express app setup
���
├── package.json
├── .env.example
├── README.md
├─��� API_TESTING_GUIDE.md
├��─ API_ENDPOINTS_REFERENCE.md
├── IMPLEMENTATION_SUMMARY.md
└── smart-waste-api-collection.json
```

---

## Common Tasks

### ✅ Create a New User Account

```bash
POST /api/auth/register
{
  "firstName": "Your First Name",
  "lastName": "Your Last Name",
  "email": "your.email@example.com",
  "password": "StrongPassword123",
  "role": "citizen",  # or "collector" or "admin"
  "phoneNumber": "+91-9876543210",
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

### ✅ Submit a Waste Pickup Request

```bash
POST /api/citizen/pickup-request
Authorization: Bearer {your_token}
{
  "wasteType": "recyclable",
  "wasteQuantity": 20.0,
  "pickupAddress": "123 Main Street, Mumbai",
  "scheduledDate": "2025-02-10T10:00:00Z",
  "preferredTimeSlot": "8AM-11AM",
  "priority": "medium"
}
```

### ✅ Check Pickup Request Status

```bash
GET /api/citizen/pickup-request/{request_id}
Authorization: Bearer {your_token}
```

### ✅ Accept a Collection Assignment (Collector)

```bash
PUT /api/collector/request/{request_id}/accept
Authorization: Bearer {collector_token}
{
  "notes": "On the way to collect waste"
}
```

### ✅ Mark Waste as Collected (Collector)

```bash
PUT /api/collector/request/{request_id}/collected
Authorization: Bearer {collector_token}
{
  "notes": "Waste collected successfully",
  "imageProof": ["https://example.com/image.jpg"]
}
```

### ✅ Verify Collection (Admin)

```bash
PUT /api/admin/pickup-request/{request_id}/verify
Authorization: Bearer {admin_token}
{
  "notes": "Verification complete"
}
```

### ✅ Generate and Pay Invoice

```bash
# Generate invoice
POST /api/citizen/invoice
Authorization: Bearer {citizen_token}
{
  "pickupRequestId": "{request_id}"
}

# Initiate payment
POST /api/citizen/payment/initiate
Authorization: Bearer {citizen_token}
{
  "paymentId": "{payment_id}",
  "paymentMethod": "upi"
}

# Complete payment
POST /api/citizen/payment/complete
Authorization: Bearer {citizen_token}
{
  "paymentId": "{payment_id}",
  "transactionId": "TXN-12345"
}
```

---

## Troubleshooting

### Issue: Database Connection Error
```
Error: Unable to connect to database
```

**Solution:**
1. Ensure PostgreSQL/MySQL is running
2. Check database credentials in `.env`
3. Verify database exists: `createdb smart_waste_db`
4. Ensure proper permissions

### Issue: Port 5000 Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### Issue: JWT Token Invalid
```
Error: Invalid or malformed token
```

**Solution:**
1. Generate new token by logging in again
2. Copy full token from response
3. Include in Authorization header: `Bearer {complete_token}`
4. Check token hasn't expired (7 days)

### Issue: Forbidden - Insufficient Permissions
```
Error: This action requires one of these roles: admin
```

**Solution:**
1. Use correct role's token for the endpoint
2. Check user role: `GET /api/auth/profile`
3. Use admin token for `/api/admin/*` endpoints

### Issue: Validation Error - Invalid Input

**Solution:**
1. Check `API_ENDPOINTS_REFERENCE.md` for required fields
2. Ensure date format is ISO 8601: `2025-02-10T10:00:00Z`
3. Validate enum values (wasteType, timeSlot, etc.)
4. Ensure required fields are present

---

## Next Steps After Basic Setup

### 1. Deploy to Development Server
```bash
# Using PM2
npm install -g pm2
pm2 start src/server.js --name "smart-waste-api"
pm2 logs
```

### 2. Setup Database Backups
```bash
# PostgreSQL backup
pg_dump smart_waste_db > backup.sql

# Restore
psql smart_waste_db < backup.sql
```

### 3. Monitor with Logs
```bash
# View real-time logs
tail -f logs/all.log

# View errors only
tail -f logs/error.log
```

### 4. Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:5000/api/health

# Or use Artillery
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:5000/api/health
```

### 5. Connect Frontend
Update frontend `.env`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## API Endpoint Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/register` | POST | Create new account |
| `/auth/login` | POST | User login |
| `/auth/profile` | GET | Get user profile |
| `/citizen/pickup-request` | POST | Create pickup request |
| `/citizen/pickup-requests` | GET | List my requests |
| `/collector/available-requests` | GET | View available tasks |
| `/collector/request/:id/accept` | PUT | Accept assignment |
| `/admin/pickup-requests` | GET | Admin view all |
| `/admin/pickup-request/:id/verify` | PUT | Verify collection |
| `/citizen/invoice` | POST | Generate invoice |
| `/citizen/payment/complete` | POST | Pay invoice |

See `API_ENDPOINTS_REFERENCE.md` for complete list with examples.

---

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Complete setup & architecture guide |
| `API_TESTING_GUIDE.md` | Step-by-step testing with workflows |
| `API_ENDPOINTS_REFERENCE.md` | Complete endpoint documentation |
| `IMPLEMENTATION_SUMMARY.md` | What was built & features |
| `GETTING_STARTED.md` | This file - quick start guide |
| `.env.example` | Environment variables template |
| `smart-waste-api-collection.json` | Thunder Client/Postman collection |

---

## Success Checklist

- [x] Backend server running on http://localhost:5000
- [x] All endpoints returning valid responses
- [x] User registration working
- [x] Login generating JWT tokens
- [x] Pickup requests creating successfully
- [x] Status updates working
- [x] Payment flow completing
- [x] Admin verification succeeding
- [x] Error handling working
- [x] Audit logs being recorded

---

## Need Help?

1. **API Issues?** → Check `API_ENDPOINTS_REFERENCE.md`
2. **Testing Problems?** → Follow `API_TESTING_GUIDE.md`
3. **Setup Issues?** → See `README.md` troubleshooting
4. **Code Structure?** → Review `IMPLEMENTATION_SUMMARY.md`
5. **Specific Errors?** → Check logs: `tail -f logs/error.log`

---

## What's Next?

1. ✅ Run the backend
2. ✅ Import Thunder Client collection
3. ✅ Follow API testing guide
4. ✅ Test complete workflow
5. → Deploy to production
6. → Connect with frontend

---

Happy testing! The backend is ready to support your Smart Waste Management System.

**Questions?** Check the documentation files or the API endpoints reference.
