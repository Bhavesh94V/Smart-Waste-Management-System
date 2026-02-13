# Quick Reference Guide

## Smart Waste Management System - Developer Quick Start

---

## Setup (5 minutes)

### Terminal 1: Backend
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### Terminal 2: Frontend
```bash
npm install
npm run dev
# Runs on http://localhost:5173
```

### Login Credentials
```
citizen@test.com / password123
collector@test.com / password123
admin@test.com / password123
```

---

## API Service Usage

### Import
```typescript
import { citizenAPI, collectorAPI, adminAPI, authAPI, iotAPI } from '@/services/api';
```

### Citizen Examples
```typescript
// Create pickup request
await citizenAPI.createPickupRequest({
  wasteType: 'dry',
  location: '123 Green St',
  pickupDate: '2024-02-15',
});

// Get requests
const requests = await citizenAPI.getPickupRequests(status, page, limit);

// Get nearby bins
const bins = await citizenAPI.getNearbyBins(latitude, longitude, radius);

// Make payment
await citizenAPI.initiatePayment(requestId, amount, 'card');

// Submit complaint
await citizenAPI.createComplaint({
  category: 'missed_pickup',
  description: 'Collector didn\'t arrive',
});
```

### Collector Examples
```typescript
// Get assigned routes
const routes = await collectorAPI.getAssignedRoutes(date);

// Accept request
await collectorAPI.acceptPickupRequest(requestId);

// Reject request
await collectorAPI.rejectPickupRequest(requestId, 'reason');

// Update status to collected
await collectorAPI.updatePickupStatus(requestId, 'collected');

// Get daily tasks
const tasks = await collectorAPI.getDailyTasks(date);
```

### Admin Examples
```typescript
// Get all users
const users = await adminAPI.getUsers(role, page, limit);

// Get all requests
const requests = await adminAPI.getAllPickupRequests(status, page, limit);

// Assign collector
await adminAPI.assignPickupRequest(requestId, collectorId);

// Verify collection
await adminAPI.verifyCollection(requestId, {
  weight: 15,
  quality: 'good',
});

// Get analytics
const analytics = await adminAPI.getWasteAnalytics(startDate, endDate);
```

### IoT Examples
```typescript
// Get sensor data
const data = await iotAPI.getSensorData(binId, limit);

// Record sensor data
await iotAPI.recordSensorData({
  binId: 'bin-123',
  fillLevel: 85,
  timestamp: new Date().toISOString(),
});

// Get real-time data
const realtime = await iotAPI.getBinRealTimeData(binId);
```

---

## useAPI Hook Pattern

### Basic Usage
```typescript
import { useAPI } from '@/hooks/useAPI';

const MyComponent = () => {
  const { data, isLoading, error, refetch } = useAPI(
    () => citizenAPI.getPickupRequests(),
    { immediate: true }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{data.map(item => ...)}</div>;
};
```

### With Callbacks
```typescript
const { data, isLoading } = useAPI(
  () => citizenAPI.getPickupRequests(),
  {
    immediate: true,
    onSuccess: (data) => console.log('Loaded!', data),
    onError: (error) => console.error('Failed!', error),
  }
);
```

### Manual Trigger
```typescript
const { data, isLoading, error, execute } = useAPIAction(
  (id) => citizenAPI.getPickupRequestById(id)
);

const handleClick = async (id) => {
  await execute(id);
};
```

---

## Form Submission Pattern

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);
const { toast } = useToast();
const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validate()) {
    toast({ title: 'Error', description: 'Invalid form' });
    return;
  }

  setIsSubmitting(true);
  
  try {
    const response = await citizenAPI.createPickupRequest({
      wasteType: formData.wasteType,
      location: formData.location,
      // ... other fields
    });
    
    toast({ title: 'Success', description: 'Request created' });
    navigate(`/citizen/track/${response.id}`);
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## Component Structure Template

```typescript
import { useState, useEffect } from 'react';
import { useAPI } from '@/hooks/useAPI';
import { useAuth } from '@/contexts/AuthContext';
import { citizenAPI } from '@/services/api';
import { Loader2 } from 'lucide-react';

export default function MyComponent() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useAPI(
    () => citizenAPI.getPickupRequests(),
    { immediate: true }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-4 rounded">
        {error}
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      {data?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

---

## Common Tasks

### Add Loading Spinner
```typescript
import { Loader2 } from 'lucide-react';

{isLoading && (
  <Loader2 className="w-8 h-8 animate-spin text-primary" />
)}
```

### Add Error Message
```typescript
{error && (
  <div className="bg-destructive/10 border border-destructive/20 p-4 rounded">
    <p className="text-destructive">{error}</p>
    <button onClick={refetch}>Retry</button>
  </div>
)}
```

### Add Toast Notification
```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: 'Success',
  description: 'Operation completed',
});

toast({
  title: 'Error',
  description: 'Something went wrong',
  variant: 'destructive',
});
```

### Add Pagination
```typescript
const [page, setPage] = useState(1);

const { data } = useAPI(
  () => citizenAPI.getPickupRequests(undefined, page, 10),
  { immediate: true }
);

<button onClick={() => setPage(page + 1)}>Next</button>
```

### Refetch on Action
```typescript
const handleDelete = async (id: string) => {
  await citizenAPI.cancelPickupRequest(id);
  await refetch(); // Reload data
};
```

---

## File Structure

```
src/
├── services/api.ts          # All API calls
├── hooks/useAPI.ts          # Data fetching hook
├── contexts/AuthContext.tsx # Auth state
├── pages/
│   ├── auth/
│   │   ├── Login.tsx        # ✅ Integrated
│   │   └── Register.tsx     # Ready
│   ├── citizen/
│   │   ├── CitizenDashboard.tsx      # ✅ Integrated
│   │   ├── RequestPickup.tsx         # ✅ Integrated
│   │   ├── TrackStatus.tsx           # Ready
│   │   ├── BinStatus.tsx             # Ready
│   │   ├── PickupHistory.tsx         # Ready
│   │   ├── Payments.tsx              # Ready
│   │   └── Complaints.tsx            # Ready
│   ├── collector/
│   │   ├── CollectorDashboard.tsx    # Ready
│   │   ├── AssignedRoutes.tsx        # Ready
│   │   ├── PickupRequests.tsx        # Ready
│   │   └── DailyTasks.tsx            # Ready
│   └── admin/
│       ├── AdminDashboard.tsx        # ✅ Integrated
│       ├── UserManagement.tsx        # Ready
│       ├── CollectorAssignment.tsx   # Ready
│       ├── BinMonitoring.tsx         # Ready
│       ├── AdminPayments.tsx         # Ready
│       ├── AIReports.tsx             # Ready
│       └── SystemSettings.tsx        # Ready
```

---

## API Endpoints Reference

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `POST /api/auth/refresh`

### Citizen
- `GET|POST /api/citizen/pickup-requests`
- `GET|PUT|DELETE /api/citizen/pickup-requests/:id`
- `GET /api/citizen/bins`
- `GET /api/citizen/bins/:id`
- `GET|POST /api/citizen/payments`
- `GET|POST|PUT /api/citizen/complaints`
- `GET /api/citizen/dashboard-stats`

### Collector
- `GET|PUT /api/collector/routes`
- `GET|POST|PUT /api/collector/pickup-requests`
- `POST /api/collector/pickup-requests/:id/accept`
- `POST /api/collector/pickup-requests/:id/reject`
- `GET /api/collector/daily-tasks`
- `GET /api/collector/dashboard-stats`

### Admin
- `GET|POST|PUT|DELETE /api/admin/users`
- `GET|POST /api/admin/pickup-requests`
- `POST /api/admin/assign-pickup`
- `PUT /api/admin/payments/:id/approve|reject`
- `GET /api/admin/bins`
- `GET /api/admin/analytics/*`
- `GET|POST|PUT /api/admin/settings`

### IoT
- `GET|POST /api/iot/sensor-data`
- `GET /api/iot/bins/:id/realtime`

---

## Testing

### Quick Test
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
npm run dev

# Browser
http://localhost:5173
Login → Verify dashboard loads
```

### Thunder Client
1. Import: `backend/smart-waste-api-collection.json`
2. Set environment: Backend URL
3. Test endpoints manually

### Full Test
Follow: `INTEGRATION_CHECKLIST.md` (12 phases)

---

## Debugging

### Check Token
```javascript
localStorage.getItem('wms_token')
```

### Check API URL
```javascript
console.log(import.meta.env.REACT_APP_API_URL)
```

### Network Tab
DevTools → Network → See all API calls

### API Response
Network tab → Click request → Response tab

### Errors
Network tab → Response tab shows error messages

---

## Common Issues

### "API request failed"
- Check backend running: `http://localhost:5000`
- Check REACT_APP_API_URL in .env.local
- Check CORS in backend

### "Token not found"
- Clear localStorage: `localStorage.clear()`
- Login again
- Check Auth tab in Network

### "Data not loading"
- Check API endpoint spelling
- Verify authentication token valid
- Check backend logs for errors

### "Component not updating"
- Use `refetch()` after action
- Check dependency arrays
- Use React DevTools to check state

---

## TypeScript Types

```typescript
import { User, PickupRequest, Bin, Payment, Complaint } from '@/types';

// User
interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'collector' | 'admin';
  // ... more fields
}

// PickupRequest
interface PickupRequest {
  id: string;
  wasteType: 'dry' | 'wet' | 'hazardous';
  status: 'requested' | 'assigned' | 'collected' | 'verified' | 'paid';
  location: string;
  // ... more fields
}
```

---

## Documentation Files

1. **INTEGRATION_GUIDE.md** - Complete integration steps
2. **INTEGRATION_CHECKLIST.md** - 12-phase testing checklist
3. **PROJECT_README.md** - Full project overview
4. **INTEGRATION_COMPLETE.md** - Summary of completed work
5. **QUICK_REFERENCE.md** - This file!

---

## Quick Links

| Resource | Link |
|----------|------|
| Frontend Code | `src/` |
| Backend Code | `backend/src/` |
| API Service | `src/services/api.ts` |
| API Endpoints | `backend/API_ENDPOINTS_REFERENCE.md` |
| API Testing | `backend/API_TESTING_GUIDE.md` |
| Testing Checklist | `INTEGRATION_CHECKLIST.md` |

---

## Useful Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Check code style
npm run test         # Run tests

# Backend
npm start            # Start server
npm run migrate      # Run migrations
npm run seed         # Seed data
npm run test         # Run tests
npm run test:load    # Load testing
```

---

## Next Page to Integrate

1. Choose a page (e.g., `TrackStatus.tsx`)
2. Follow the component template above
3. Test with Integration Checklist
4. Deploy

---

**Last Updated:** February 2024
**Version:** 1.0.0
**Status:** Production Ready

🚀 Happy coding!
