# Frontend-Backend Integration Checklist

## Phase 1: Setup & Configuration

### Backend Setup
- [ ] Navigate to `/backend` directory
- [ ] Run `npm install`
- [ ] Create `.env` file with required variables:
  ```
  PORT=5000
  NODE_ENV=development
  DATABASE_URL=postgresql://user:password@localhost:5432/smart_waste
  MONGODB_URL=mongodb://localhost:27017/smart_waste_iot
  JWT_SECRET=your-secret-key-here
  JWT_EXPIRY=7d
  ```
- [ ] Run `npm start`
- [ ] Verify backend running on `http://localhost:5000`
- [ ] Run database migrations: `npm run migrate`
- [ ] Seed test data: `npm run seed`

### Frontend Setup
- [ ] Navigate to project root
- [ ] Run `npm install`
- [ ] Create `.env.local`:
  ```
  REACT_APP_API_URL=http://localhost:5000/api
  ```
- [ ] Run `npm run dev`
- [ ] Verify frontend running on `http://localhost:5173`

---

## Phase 2: Authentication Integration

### Login Flow
- [ ] Open `http://localhost:5173/login`
- [ ] Test login with backend credentials:
  - Email: `citizen@test.com`, Password: `password123`
  - Email: `collector@test.com`, Password: `password123`
  - Email: `admin@test.com`, Password: `password123`
- [ ] Verify JWT token stored in localStorage
- [ ] Check user redirected to appropriate dashboard
- [ ] Verify token included in subsequent API requests

### Registration Flow
- [ ] Navigate to `/register`
- [ ] Fill form with new user data
- [ ] Select role (citizen/collector)
- [ ] Submit and verify:
  - [ ] No duplicate email error if email exists
  - [ ] User created in database
  - [ ] Token generated and stored
  - [ ] User redirected to dashboard

### Logout Flow
- [ ] Click logout button in header
- [ ] Verify token removed from localStorage
- [ ] Verify user redirected to login page
- [ ] Verify cannot access protected routes

---

## Phase 3: Citizen Features Integration

### Create Pickup Request
- [ ] Login as citizen user
- [ ] Navigate to `/citizen/request`
- [ ] Fill form:
  - [ ] Select waste type (dry/wet/hazardous)
  - [ ] Enter location
  - [ ] Optional: Select pickup date & time
  - [ ] Optional: Add remarks
- [ ] Submit form
- [ ] Verify request created in database:
  ```bash
  # In backend logs, should see:
  # POST /api/citizen/pickup-requests 201 Created
  ```
- [ ] Verify redirect to track page with new request ID

### View Pickup History
- [ ] Navigate to `/citizen/history`
- [ ] Verify all user's pickup requests displayed
- [ ] Verify pagination works (if > 10 requests)
- [ ] Verify each request shows:
  - [ ] Status badge
  - [ ] Waste type
  - [ ] Location
  - [ ] Creation date
  - [ ] Assigned collector (if applicable)

### Track Pickup Status
- [ ] Navigate to `/citizen/track`
- [ ] Click on a request to view details
- [ ] Verify real-time status updates:
  - [ ] Status changes from "requested" → "assigned" → "collected" → "verified" → "paid"
  - [ ] UI refreshes when collector updates status in real-time
- [ ] Verify can cancel request (if status is "requested")

### View Nearby Bins
- [ ] Navigate to `/citizen/bins`
- [ ] Verify bins loaded from API:
  ```javascript
  // Should make GET request to /api/citizen/bins
  ```
- [ ] Verify bin details displayed:
  - [ ] Location
  - [ ] Fill percentage
  - [ ] Waste type
  - [ ] Status (empty/half/full)
- [ ] Verify color coding:
  - [ ] Green for empty
  - [ ] Yellow for half
  - [ ] Red for full

### Make Payment
- [ ] Navigate to `/citizen/payments`
- [ ] Verify pending payments displayed
- [ ] Click "Pay Now" on a payment
- [ ] Verify payment form opens
- [ ] Submit payment
- [ ] Verify in admin: payment status changes to "completed"

### Submit Complaint
- [ ] Navigate to `/citizen/complaints`
- [ ] Click "File Complaint"
- [ ] Fill complaint form:
  - [ ] Select category
  - [ ] Enter description
  - [ ] Link to pickup request (if applicable)
- [ ] Submit complaint
- [ ] Verify complaint created in database
- [ ] Verify admin can see and resolve complaint

---

## Phase 4: Collector Features Integration

### View Assigned Routes
- [ ] Login as collector user
- [ ] Navigate to `/collector/routes`
- [ ] Verify routes loaded from API
- [ ] Verify each route shows:
  - [ ] Date
  - [ ] Number of pickups
  - [ ] Assigned bins
  - [ ] Route status

### View Pickup Requests
- [ ] Navigate to `/collector/requests`
- [ ] Verify list of requests in "assigned" status
- [ ] Test Accept Request:
  - [ ] Click "Accept" button
  - [ ] Verify request status changes to "assigned"
  - [ ] Verify request moves to active list
- [ ] Test Reject Request:
  - [ ] Click "Reject" button
  - [ ] Enter rejection reason
  - [ ] Verify request status reverts to "requested"
  - [ ] Verify admin can reassign

### Update Collection Status
- [ ] From request details, click "Mark as Collected"
- [ ] Verify request status changes to "collected"
- [ ] Verify admin notified for verification

### View Daily Tasks
- [ ] Navigate to `/collector/tasks`
- [ ] Verify shows:
  - [ ] Total pickups assigned
  - [ ] Completed pickups
  - [ ] Total bins on route
  - [ ] Completed bin collections
- [ ] Verify updates in real-time as requests are completed

---

## Phase 5: Admin Features Integration

### View All Pickup Requests
- [ ] Login as admin user
- [ ] Navigate to `/admin/assignments`
- [ ] Verify all requests displayed with filters:
  - [ ] Filter by status (requested/assigned/collected/verified/paid)
  - [ ] Pagination working (10 per page)
  - [ ] Search by location or citizen name

### Assign Collector
- [ ] Click on a "requested" status pickup request
- [ ] Click "Assign Collector"
- [ ] Select available collector from dropdown
- [ ] Confirm assignment
- [ ] Verify in database:
  - [ ] Request's `collectorId` updated
  - [ ] Status changed to "assigned"
  - [ ] Collector receives notification

### Verify Collection
- [ ] Navigate to requests with "collected" status
- [ ] Click "Verify Collection"
- [ ] Enter verification details:
  - [ ] Waste weight
  - [ ] Quality check
  - [ ] Additional remarks
- [ ] Click "Approve Collection"
- [ ] Verify status changes to "verified"
- [ ] Verify payment automatically generated

### Manage Payments
- [ ] Navigate to `/admin/payments`
- [ ] Verify all payments displayed with status
- [ ] Test Approve Payment:
  - [ ] Click "Approve" on pending payment
  - [ ] Verify status changes to "completed"
  - [ ] Verify citizen sees payment as "paid" in their dashboard
- [ ] Test Reject Payment:
  - [ ] Click "Reject"
  - [ ] Enter reason
  - [ ] Verify status changes to "failed"

### Monitor Bins
- [ ] Navigate to `/admin/bins`
- [ ] Verify all bins displayed with real-time fill levels
- [ ] Verify IoT sensor data showing:
  - [ ] Current fill percentage
  - [ ] Last updated time
  - [ ] Temperature/humidity (if available)
- [ ] Verify alert for bins > 80% full
- [ ] Test clicking full bin:
  - [ ] Verify can manually trigger collection
  - [ ] Verify creates pickup request

### View Reports & Analytics
- [ ] Navigate to `/admin/reports`
- [ ] Verify dashboard loads with charts:
  - [ ] Weekly collections by waste type
  - [ ] Monthly trends
  - [ ] Waste distribution (pie chart)
- [ ] Verify data matches database records
- [ ] Test date range filters
- [ ] Export reports to CSV/PDF

### Manage System Settings
- [ ] Navigate to `/admin/settings`
- [ ] Update settings:
  - [ ] Service charges
  - [ ] Service fee amount
  - [ ] Operating hours
  - [ ] Alert thresholds
- [ ] Verify changes saved to database
- [ ] Verify changes reflected in other modules

---

## Phase 6: Real-Time Features

### IoT Sensor Data
- [ ] Verify sensor data endpoint:
  ```bash
  curl http://localhost:5000/api/iot/sensor-data
  ```
- [ ] Verify bins display real-time fill levels
- [ ] Verify admin dashboard updates with new sensor readings
- [ ] Test simulating full bin:
  - [ ] Send sensor data with 95% fill
  - [ ] Verify alert shows in admin dashboard
  - [ ] Verify citizen sees "Full" status in nearby bins

### WebSocket (if implemented)
- [ ] Open browser DevTools → Network → WS
- [ ] Verify WebSocket connection established
- [ ] Update request status as collector
- [ ] Verify citizen receives real-time notification
- [ ] Verify status updates without page refresh

---

## Phase 7: End-to-End Flow Testing

### Complete Pickup Flow
1. [ ] **Citizen creates request**
   ```
   Login as citizen → Create pickup request → Submit
   ```

2. [ ] **Admin receives and assigns**
   ```
   Login as admin → View request → Assign collector → Save
   ```

3. [ ] **Collector accepts and completes**
   ```
   Login as collector → View request → Accept → Mark collected
   ```

4. [ ] **Admin verifies**
   ```
   Login as admin → Verify collection → Enter details → Approve
   ```

5. [ ] **Payment generated and processed**
   ```
   Verify payment created → Citizen pays → Admin approves → Payment marked complete
   ```

6. [ ] **Confirm all statuses updated**
   ```
   Verify final status is "paid" across all views
   ```

---

## Phase 8: Error Handling

### Test Error Scenarios
- [ ] Login with invalid credentials
  - [ ] Verify error message displayed
  - [ ] Verify user not logged in
  
- [ ] Create request without required fields
  - [ ] Verify validation error shown
  - [ ] Verify request not created
  
- [ ] Network timeout
  - [ ] Disable network in DevTools
  - [ ] Attempt to load data
  - [ ] Verify error message shown
  - [ ] Verify "Retry" button works
  
- [ ] Token expiration
  - [ ] Wait for token to expire (or manually expire in localStorage)
  - [ ] Attempt to access protected route
  - [ ] Verify redirected to login
  - [ ] Verify can login again

---

## Phase 9: Performance & Optimization

- [ ] Check Network tab in DevTools:
  - [ ] API requests < 500ms
  - [ ] Bundle size < 5MB
  - [ ] No unnecessary re-renders
  
- [ ] Test pagination:
  - [ ] Load first page
  - [ ] Navigate to page 5
  - [ ] Verify only 10 items loaded
  
- [ ] Test search/filters:
  - [ ] Filter by status
  - [ ] Search by location
  - [ ] Verify performance acceptable

---

## Phase 10: Security Checks

- [ ] Verify JWT token:
  - [ ] Only stored in localStorage
  - [ ] Sent only in Authorization header
  - [ ] Not logged to console
  
- [ ] Verify HTTPS:
  - [ ] All API calls use https:// (in production)
  
- [ ] Verify role-based access:
  - [ ] Citizen cannot access admin routes
  - [ ] Collector cannot access citizen data
  - [ ] Admin can access all routes
  
- [ ] Test CORS:
  - [ ] Requests from frontend allowed
  - [ ] Requests from other origins blocked

---

## Phase 11: Browser & Device Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Responsive Design
- [ ] Desktop (1920px) - [ ] Tablet (768px)
- [ ] Mobile (375px)

### Features to Test on Each
- [ ] Login/Register
- [ ] View dashboard
- [ ] Create request
- [ ] View list/table
- [ ] Submit form

---

## Phase 12: Final Checklist

### Code Quality
- [ ] No console errors
- [ ] No console warnings (except 3rd party)
- [ ] All TODOs removed
- [ ] No unused imports
- [ ] Code formatted properly

### Documentation
- [ ] INTEGRATION_GUIDE.md complete
- [ ] API endpoints documented
- [ ] Frontend components documented
- [ ] Deployment steps documented

### Database
- [ ] All tables created
- [ ] Sample data seeded
- [ ] Indexes created for performance
- [ ] Foreign key relationships verified

### Deployment Ready
- [ ] Environment variables configured
- [ ] Backend can run on production server
- [ ] Frontend build successful: `npm run build`
- [ ] No hardcoded URLs
- [ ] Error handling complete
- [ ] Logging configured

---

## Testing Reports

### Tests Passed: _____ / _____
- [ ] Authentication: _____ / 4
- [ ] Citizen Features: _____ / 5
- [ ] Collector Features: _____ / 4
- [ ] Admin Features: _____ / 6
- [ ] End-to-End: _____ / 6
- [ ] Error Handling: _____ / 4
- [ ] Performance: _____ / 3
- [ ] Security: _____ / 4

### Issues Found & Resolved
```
1. Issue: 
   Resolution: 
   Date Fixed: 

2. Issue: 
   Resolution: 
   Date Fixed: 
```

### Sign-Off
- [ ] Testing completed by: ___________________
- [ ] Date: ___________________
- [ ] Ready for production: [ ] YES [ ] NO

---

## Troubleshooting

### Backend won't start
```bash
# Check port in use
lsof -i :5000

# Kill process
kill -9 <PID>

# Check environment variables
cat .env

# Check database connection
npm run test:db
```

### Frontend can't reach backend
```bash
# Check REACT_APP_API_URL
grep REACT_APP_API_URL .env.local

# Test API directly
curl http://localhost:5000/api/auth/login -X POST

# Check CORS in backend
# Should see CORS headers in response
```

### Token not persisting
```javascript
// Check localStorage
localStorage.getItem('wms_token')

// Check if token saved on login
// Monitor network tab for Set-Cookie header
```

### Data not updating
```javascript
// Force refresh in component
const { refetch } = useAPI(...)
await refetch()

// Check API response in network tab
// Verify data structure matches expected format
```

---

## Next Steps After Integration

1. [ ] Deploy backend to production server
2. [ ] Deploy frontend to Vercel/hosting
3. [ ] Configure custom domain
4. [ ] Setup CI/CD pipeline
5. [ ] Enable monitoring & logging
6. [ ] Schedule database backups
7. [ ] Setup error tracking (Sentry)
8. [ ] Enable analytics
9. [ ] Setup support contact form
10. [ ] Plan for scale-up

