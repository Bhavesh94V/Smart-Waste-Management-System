# Authentication & Integration Debugging Guide

## Overview
This guide helps diagnose and fix authentication flow issues. All console logs are prefixed with `[Auth]`, `[API]`, `[ProtectedRoute]`, `[RoleRedirect]` for easy tracking.

## Critical Issues Fixed

### 1. Response Structure Handling
**Issue**: Backend returns `{data: {user: {...}}, token: "..."}` but code expected `{user: {...}, token: "..."}`

**Solution Implemented**:
```javascript
// Now handles multiple response structures
const userData = response.data?.user || response.user || response;
```

### 2. Token Persistence
**Issue**: Token not persisted to localStorage after login/register

**Solution**:
- API service automatically calls `setToken(response.token)` after login/register
- AuthContext stores both token and user data
- Token is sent in `Authorization: Bearer {token}` header

### 3. Loading State During Auth Check
**Issue**: Routes render before auth context finishes checking token

**Solution**:
- ProtectedRoute now shows loading spinner while `isLoading === true`
- RoleRedirect waits for `isLoading` to complete before redirecting
- AuthProvider initializes auth state on mount

### 4. Role-Based Redirection
**Issue**: Users not redirected to correct dashboard after login

**Solution**:
- Login/Register pages navigate to `/` (root)
- RoleRedirect component checks user role and redirects accordingly
- ProtectedRoute enforces role requirements

## Testing Checklist

### Phase 1: Backend Connection
```bash
# Test 1: Check API endpoint is reachable
curl http://localhost:5000/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Test 2: Check error handling
curl http://localhost:5000/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@test.com","password":"wrong"}'
```

### Phase 2: Frontend Authentication
```
1. Open browser console
2. Navigate to http://localhost:5173/login
3. Check console for: "[Auth] Attempting login for:"
4. Enter credentials and submit
5. Look for:
   - "[Auth] Login response:" (success)
   - "[Auth] Login successful for: user@email Role: citizen"
   - OR "[Auth] Login failed:" (error)
```

### Phase 3: Token Storage
```javascript
// In browser console
localStorage.getItem('wms_token')      // Should return JWT token
localStorage.getItem('wms_user')       // Should return user JSON
```

### Phase 4: Protected Routes
```
1. After login, check console for:
   - "[RoleRedirect] Redirecting user with role X to /X"
2. Navigate to protected route
3. Look for:
   - "[ProtectedRoute] User not authenticated" (if not logged in)
   - "[ProtectedRoute] User role X not allowed" (if wrong role)
```

### Phase 5: API Calls
```javascript
// In browser console after login
fetch('http://localhost:5000/api/citizen/dashboard-stats', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('wms_token')}`,
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(console.log)
```

## Common Issues & Solutions

### Issue: "Session expired. Please login again"
**Cause**: Token is invalid or expired
**Solution**:
1. Clear localStorage: `localStorage.clear()`
2. Login again
3. Check token format in API headers

### Issue: User not set after login
**Cause**: Response structure mismatch
**Solution**:
1. Check backend response format
2. Verify `response.user` or `response.data.user` exists
3. Check AuthContext handles response correctly

### Issue: Redirecting to login on page refresh
**Cause**: Auth context not initialized properly
**Solution**:
1. Wait for `isLoading === false` before checking `isAuthenticated`
2. Verify `getProfile()` endpoint is called correctly
3. Check token is being sent in Authorization header

### Issue: Protected routes show loading forever
**Cause**: `isLoading` stays true
**Solution**:
1. Check if `getProfile()` endpoint exists
2. Verify error handling in `initializeAuth()`
3. Check browser console for network errors

## Debug Logging

All authentication flows are logged:

```
[Auth] Attempting login for: user@email.com
[Auth] Login response: {...full response...}
[Auth] Login successful for: user@email Role: citizen

[API Error] /auth/login: Invalid credentials
[ProtectedRoute] User not authenticated, redirecting to login
[RoleRedirect] Redirecting user with role citizen to /citizen
```

## Backend Requirements

### Register Endpoint (POST /api/auth/register)
```json
Request:
{
  "name": "John",
  "email": "john@test.com",
  "phone": "+91...",
  "address": "123 Street",
  "password": "password123",
  "role": "citizen"
}

Response (Success 201):
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "name": "John",
    "email": "john@test.com",
    "phone": "+91...",
    "address": "123 Street",
    "role": "citizen",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}

Response (Error):
{
  "message": "Email already exists",
  "error": "DUPLICATE_EMAIL"
}
```

### Login Endpoint (POST /api/auth/login)
```json
Request:
{
  "email": "john@test.com",
  "password": "password123"
}

Response (Success 200):
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "name": "John",
    "email": "john@test.com",
    "phone": "+91...",
    "address": "123 Street",
    "role": "citizen",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}

Response (Error 401):
{
  "message": "Invalid credentials",
  "error": "INVALID_CREDENTIALS"
}
```

### Profile Endpoint (GET /api/auth/profile)
```
Request Headers:
Authorization: Bearer eyJhbGc...

Response (Success 200):
{
  "user": {
    "id": "uuid",
    "name": "John",
    "email": "john@test.com",
    ...
  }
}

Response (Error 401):
{
  "message": "Invalid or expired token"
}
```

## End-to-End Flow Verification

1. **Registration Flow**
   ```
   User fills form → Click Register → 
   [Auth] Attempting registration for: email@test.com →
   AuthContext.register() called →
   apiCall('/auth/register') →
   Token stored in localStorage →
   User data stored in localStorage →
   Navigate to '/' →
   RoleRedirect checks role →
   [RoleRedirect] Redirecting to /citizen →
   ProtectedRoute allows access →
   CitizenDashboard renders
   ```

2. **Login Flow**
   ```
   User enters credentials → Click Login →
   [Auth] Attempting login for: email@test.com →
   AuthContext.login() called →
   apiCall('/auth/login') →
   Token stored → User stored →
   Navigate to '/' →
   RoleRedirect redirects to role dashboard →
   Dashboard loads with real API data
   ```

3. **Page Refresh Flow**
   ```
   User navigates to protected route →
   AuthProvider initializes (useEffect) →
   Token found in localStorage →
   getProfile() called with token →
   User set in context →
   isLoading becomes false →
   ProtectedRoute renders content
   ```

## Environment Variables

Make sure your `.env` or `.env.local` has:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

Or update the API_BASE_URL in `src/services/api.ts`:
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

## Performance Metrics

Monitor these during testing:
- Time from submit to redirect: Should be < 2s
- Time for protected route to render: Should be < 1s after load
- Number of API calls: Should be 1 for login, 1 for profile check

## Next Steps

If you encounter issues:

1. Check browser DevTools Console for all `[*]` prefixed logs
2. Check Network tab for API request/responses
3. Check Application > Storage > localStorage for tokens
4. Verify backend is running on port 5000
5. Test backend endpoints directly with curl or Postman
