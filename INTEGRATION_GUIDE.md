# Frontend-Backend Integration Guide
## Smart Waste Management System

### Overview
This document provides a comprehensive guide to the frontend-backend integration for the Smart Waste Management System. The architecture follows a 4-Tier design with a React frontend consuming RESTful APIs from a Node.js/Express backend.

---

## 1. Setup Instructions

### Backend Setup
```bash
cd backend
npm install
# Configure environment variables in .env
npm start
# Server runs on http://localhost:5000
```

### Frontend Setup
```bash
npm install
# Update .env.local or src/services/api.ts with backend URL
npm run dev
# Frontend runs on http://localhost:5173
```

### Environment Configuration
Create `.env` file in the frontend root:
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 2. API Service Layer

### Location: `src/services/api.ts`

The centralized API service handles all backend communication:

```typescript
import { authAPI, citizenAPI, collectorAPI, adminAPI, iotAPI } from '@/services/api';

// Usage example:
const response = await citizenAPI.createPickupRequest({
  wasteType: 'dry',
  location: '123 Green St',
  pickupDate: '2024-02-01',
});
```

### API Endpoints by Module

#### Authentication (`authAPI`)
- `register()` - User registration
- `login()` - User login (returns JWT token)
- `logout()` - User logout
- `getProfile()` - Fetch current user
- `updateProfile()` - Update user profile
- `refreshToken()` - Refresh JWT token

#### Citizen Module (`citizenAPI`)
- **Pickup Requests**
  - `createPickupRequest()` - Create new request
  - `getPickupRequests()` - List user's requests
  - `getPickupRequestById()` - Get details
  - `updatePickupRequest()` - Update request
  - `cancelPickupRequest()` - Cancel request

- **Bin Status**
  - `getNearbyBins()` - Get nearby bins
  - `getBinById()` - Get bin details

- **Payments**
  - `getPayments()` - List payments
  - `getPaymentById()` - Get payment details
  - `initiatePayment()` - Create payment

- **Complaints**
  - `getComplaints()` - List complaints
  - `createComplaint()` - Submit complaint
  - `updateComplaint()` - Update complaint

#### Collector Module (`collectorAPI`)
- **Routes**
  - `getAssignedRoutes()` - List assigned routes
  - `getRouteById()` - Get route details
  - `updateRouteStatus()` - Update route status

- **Pickup Requests**
  - `getPickupRequests()` - List requests
  - `acceptPickupRequest()` - Accept request
  - `rejectPickupRequest()` - Reject request
  - `updatePickupStatus()` - Update status

- **Daily Tasks**
  - `getDailyTasks()` - Get today's tasks

#### Admin Module (`adminAPI`)
- **User Management**
  - `getUsers()` - List users
  - `getUserById()` - Get user details
  - `updateUser()` - Update user
  - `deleteUser()` - Delete user

- **Pickup Requests**
  - `getAllPickupRequests()` - List all requests
  - `getPickupRequestById()` - Get details
  - `assignPickupRequest()` - Assign to collector
  - `reassignPickupRequest()` - Reassign request
  - `verifyCollection()` - Verify collection

- **Payments**
  - `getPayments()` - List payments
  - `approvePayment()` - Approve payment
  - `rejectPayment()` - Reject payment

- **Bin Monitoring**
  - `getAllBins()` - List bins
  - `getBinById()` - Get bin details

- **Analytics**
  - `getWasteAnalytics()` - Get waste data
  - `getCollectorPerformance()` - Get performance data
  - `getSystemStats()` - Get system statistics

#### IoT Module (`iotAPI`)
- `getSensorData()` - Get sensor readings
- `recordSensorData()` - Record new sensor data
- `getBinRealTimeData()` - Get real-time bin data

---

## 3. Authentication & Authorization

### JWT Token Management

Tokens are automatically managed by the API service:

```typescript
// Token is automatically stored on login
const result = await authAPI.login('user@test.com', 'password123');

// Token is automatically sent with requests
// No manual header management needed

// Token is automatically cleared on logout
await authAPI.logout();
```

### Role-Based Access Control

The frontend enforces role-based routing using `ProtectedRoute`:

```typescript
<Route path="/citizen" element={
  <ProtectedRoute allowedRoles={['citizen']}>
    <CitizenLayout />
  </ProtectedRoute>
}>
  {/* Citizen routes */}
</Route>
```

### Available Roles
- `citizen` - End user submitting waste
- `collector` - Waste collection worker
- `admin` - System administrator

---

## 4. Data Flow Examples

### Complete Pickup Request Flow

```
1. Citizen submits request form
   └─> POST /api/citizen/pickup-requests
       └─> Backend validates & creates record
           └─> Returns request ID

2. Admin receives notification
   └─> GET /api/admin/pickup-requests
       └─> Lists all pending requests

3. Admin assigns collector
   └─> POST /api/admin/assign-pickup
       └─> Backend updates request status to 'assigned'

4. Collector accepts/rejects
   └─> POST /api/collector/pickup-requests/{id}/accept
       └─> Backend updates status to 'assigned'

5. Collector completes pickup
   └─> PUT /api/collector/pickup-requests/{id}/status
       └─> Updates status to 'collected'

6. Admin verifies collection
   └─> PUT /api/admin/pickup-requests/{id}/verify
       └─> Updates status to 'verified'

7. Payment generated & processed
   └─> POST /api/citizen/payments
       └─> Updates status to 'paid'
```

### Real-Time Data Updates

IoT data flows through the system:

```
1. Smart bin reports fill level
   └─> POST /api/iot/sensor-data
       └─> Records sensor reading

2. Frontend polls for updates
   └─> GET /api/iot/bins/realtime/all
       └─> Returns current bin status

3. UI updates with new data
   └─> Admin dashboard shows real-time bins
   └─> Citizen app shows nearby bins
```

---

## 5. Loading & Error States

### useAPI Hook

Custom hook for managing async data loading:

```typescript
import { useAPI, useAPIAction } from '@/hooks/useAPI';

// Immediate load on component mount
const { data, isLoading, error, refetch } = useAPI(
  () => citizenAPI.getPickupRequests(),
  {
    immediate: true,
    onSuccess: (data) => console.log('Data loaded:', data),
    onError: (error) => console.error('Error:', error),
  }
);

// Manual trigger on user action
const { data, isLoading, error, execute } = useAPIAction(
  (id) => citizenAPI.getPickupRequestById(id),
  {
    onSuccess: (data) => showNotification('Request loaded'),
  }
);

// Trigger the action
await execute('request-123');
```

### Loading States

All async operations show loading spinners:

```typescript
if (isLoading) {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" />
      <p>Loading data...</p>
    </div>
  );
}
```

### Error Handling

Errors are caught and displayed to users:

```typescript
if (error) {
  return (
    <div className="bg-destructive/10 border border-destructive/20 p-4 rounded">
      {error}
    </div>
  );
}
```

---

## 6. Integration Patterns

### Citizen Dashboard

```typescript
export default function CitizenDashboard() {
  const { user } = useAuth();
  const { data: requests, isLoading } = useAPI(
    () => citizenAPI.getPickupRequests(),
    { immediate: true }
  );
  const { data: bins } = useAPI(
    () => citizenAPI.getNearbyBins(),
    { immediate: true }
  );

  return (
    <div>
      {isLoading ? <Spinner /> : (
        <>
          <StatCard title="Active Requests" value={requests?.length} />
          <BinList bins={bins} />
        </>
      )}
    </div>
  );
}
```

### Admin Collector Assignment

```typescript
const handleAssign = async (requestId: string, collectorId: string) => {
  try {
    await adminAPI.assignPickupRequest(requestId, collectorId);
    toast.success('Collector assigned');
    refetchRequests();
  } catch (error) {
    toast.error(error.message);
  }
};
```

### Collector Task Completion

```typescript
const handleCompletePickup = async (requestId: string) => {
  try {
    await collectorAPI.updatePickupStatus(requestId, 'collected');
    toast.success('Pickup marked as collected');
    refetchRequests();
  } catch (error) {
    toast.error(error.message);
  }
};
```

---

## 7. Testing the Integration

### Manual Testing Steps

#### 1. Register a New User
```
POST /api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "+91 9876543210",
  "address": "123 Test St",
  "password": "password123",
  "role": "citizen"
}
```

#### 2. Login
```
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### 3. Create Pickup Request
```
POST /api/citizen/pickup-requests
{
  "wasteType": "dry",
  "location": "123 Test St",
  "pickupDate": "2024-02-01",
  "remarks": "Please collect at morning"
}
```

#### 4. View Request in Admin Panel
```
GET /api/admin/pickup-requests
```

#### 5. Assign to Collector
```
POST /api/admin/assign-pickup
{
  "pickupRequestId": "request-123",
  "collectorId": "collector-456"
}
```

### Use Thunder Client Collection

Import `smart-waste-api-collection.json` into Thunder Client:
1. Click "New Collection"
2. Import the JSON file
3. Set environment variables
4. Execute requests in order

---

## 8. Common Integration Issues & Solutions

### CORS Issues
**Problem**: Browser blocks requests to backend
**Solution**: Ensure backend has CORS enabled:
```javascript
// In backend server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
```

### Token Expiration
**Problem**: User gets logged out unexpectedly
**Solution**: The API service automatically handles token refresh:
```typescript
// Automatic token refresh on 401
if (response.status === 401) {
  clearToken();
  window.location.href = '/login';
}
```

### Data Not Updating
**Problem**: UI doesn't reflect backend changes
**Solution**: Use refetch to reload data:
```typescript
const { data, refetch } = useAPI(...);

// After action completes
await refetch();
```

### Geolocation for Nearby Bins
**Problem**: getNearbyBins() needs coordinates
**Solution**: Get user coordinates:
```typescript
navigator.geolocation.getCurrentPosition(
  (position) => {
    citizenAPI.getNearbyBins(
      position.coords.latitude,
      position.coords.longitude
    );
  }
);
```

---

## 9. Database Seeding

### Create Test Data

Run backend seeding script:
```bash
cd backend
node scripts/seed-database.js
```

This creates:
- 10 test users (citizens, collectors, admins)
- 20 sample pickup requests
- 15 smart bins
- Sample IoT sensor readings
- Payment records

---

## 10. Deployment Checklist

- [ ] Backend running on production server
- [ ] Frontend environment variables updated
- [ ] SSL certificates configured
- [ ] Database backups scheduled
- [ ] API rate limiting enabled
- [ ] Logging and monitoring setup
- [ ] Email notifications configured
- [ ] Payment gateway integrated
- [ ] IoT device credentials configured
- [ ] Database indexes created

---

## 11. Performance Optimization

### API Caching
```typescript
// Cache GET requests
const { data } = useAPI(
  () => citizenAPI.getPickupRequests(),
  { immediate: true }
);

// Manual refetch when needed
const refetch = () => /* fetch again */;
```

### Pagination
```typescript
// Paginate large lists
const page1 = await citizenAPI.getPickupRequests(undefined, 1, 10);
const page2 = await citizenAPI.getPickupRequests(undefined, 2, 10);
```

### Lazy Loading Images
```typescript
<img
  src={imageUrl}
  loading="lazy"
  alt="Bin image"
/>
```

---

## 12. Support & Documentation

- **Backend API Docs**: `/backend/API_ENDPOINTS_REFERENCE.md`
- **API Testing Guide**: `/backend/API_TESTING_GUIDE.md`
- **Backend README**: `/backend/README.md`
- **Frontend Components**: Each component is self-documented with JSDoc comments

For issues or questions, refer to the comprehensive documentation in each layer.
