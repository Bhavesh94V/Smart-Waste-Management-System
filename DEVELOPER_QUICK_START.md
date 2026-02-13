# Developer Quick Start - 5 Minute Setup

## Prerequisites
- Node.js 16+ and npm 8+
- Git
- Any code editor (VS Code recommended)
- Terminal/Command Prompt

## Quick Start (Copy & Paste)

### 1. Terminal 1 - Start Backend
```bash
cd backend
npm install
npm start
```

**Expected**:
```
✓ Server running on http://localhost:5000
✓ API available at http://localhost:5000/api
```

### 2. Terminal 2 - Start Frontend
```bash
npm install
npm run dev
```

**Expected**:
```
✓ Frontend at http://localhost:5173
✓ Ready for requests
```

### 3. Browser - Test Login
```
URL: http://localhost:5173/login
Email: citizen@test.com
Password: password123
Click Login
```

**Expected**:
- ✓ Redirects to /citizen
- ✓ Dashboard loads
- ✓ User name displayed
- ✓ No console errors

---

## Key API Endpoints

### Authentication
```javascript
// In browser console after login
const token = localStorage.getItem('wms_token');

// Test API call
fetch('http://localhost:5000/api/citizen/dashboard-stats', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log)
```

### Common Endpoints
```
POST   /api/auth/register            Register user
POST   /api/auth/login               Login user
GET    /api/auth/profile             Get profile
POST   /api/citizen/pickup-requests   Create request
GET    /api/citizen/pickup-requests   List requests
POST   /api/citizen/payments          Pay invoice
GET    /api/admin/users               Manage users
```

**Full list**: See API_ENDPOINTS_REFERENCE.md

---

## File Structure

### Frontend
```
src/
├── pages/               # Page components
│   ├── auth/           # Login, Register
│   ├── citizen/        # Citizen features
│   ├── admin/          # Admin features
│   └── collector/      # Collector features
├── components/         # Reusable components
├── services/api.ts     # API client (IMPORTANT!)
├── contexts/           # Auth context
├── hooks/              # Custom hooks
└── App.tsx             # Main routing
```

### Backend
```
backend/
├── src/
│   ├── models/         # Database models
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   ├── routes/         # API routes
│   ├── middleware/     # Auth, logging
│   └── server.js       # Main server
├── scripts/            # Seeding, migration
└── package.json
```

---

## Common Tasks

### Add a New API Endpoint

1. **Backend** (`backend/src/routes/citizen.routes.js`):
```javascript
router.get('/new-endpoint', (req, res) => {
  res.json({ data: 'response' });
});
```

2. **Frontend** (`src/services/api.ts`):
```javascript
export const citizenAPI = {
  newEndpoint: async () => {
    return apiCall('/citizen/new-endpoint');
  }
};
```

3. **Use in Component**:
```javascript
import { citizenAPI } from '@/services/api';

const handleClick = async () => {
  const data = await citizenAPI.newEndpoint();
  console.log(data);
};
```

### Add Authentication to Route

```javascript
// src/App.tsx
<Route path="/citizen/new-page" element={
  <ProtectedRoute allowedRoles={['citizen']}>
    <NewPage />
  </ProtectedRoute>
}/>
```

### Create Loading State

```javascript
const [isLoading, setIsLoading] = useState(false);

const loadData = async () => {
  setIsLoading(true);
  try {
    const data = await apiCall();
  } finally {
    setIsLoading(false);
  }
};
```

### Handle API Errors

```javascript
try {
  const response = await citizenAPI.method();
} catch (error) {
  toast({
    title: 'Error',
    description: error.message,
    variant: 'destructive',
  });
}
```

---

## Debugging

### 1. Check Console Logs
```
[Auth] ...
[API] ...
[ProtectedRoute] ...
```

### 2. Check Storage
```javascript
localStorage.getItem('wms_token')
localStorage.getItem('wms_user')
```

### 3. Check Network
- Open DevTools → Network tab
- Look for API calls
- Check Response tab for data
- Check Authorization header

### 4. Common Issues
| Issue | Check |
|-------|-------|
| Can't login | Backend running? Test user exists? |
| 401 error | Token expired? Login again |
| Data not loading | API endpoint exists? Check Network tab |
| Redirect loop | Clear localStorage, restart |

---

## Test Accounts

**Citizen** (access /citizen):
```
Email: citizen@test.com
Password: password123
```

**Collector** (access /collector):
```
Email: collector@test.com
Password: password123
```

**Admin** (access /admin):
```
Email: admin@test.com
Password: password123
```

---

## Useful Commands

```bash
# Frontend
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview build
npm run type-check    # Check TypeScript

# Backend
npm start             # Start server
npm run migrate       # Database migration
npm run seed          # Seed test data
npm test              # Run tests
```

---

## Important Files to Know

| File | Purpose |
|------|---------|
| `src/services/api.ts` | All API calls |
| `src/contexts/AuthContext.tsx` | Authentication state |
| `src/App.tsx` | Routes & navigation |
| `src/components/ProtectedRoute.tsx` | Access control |
| `backend/src/server.js` | Backend entry point |
| `.env` | Environment variables |

---

## Response Formats

### Success Response
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "123",
    "email": "user@test.com",
    "role": "citizen"
  },
  "data": {...}
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

### List Response
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

---

## Performance Tips

1. **Avoid** `localStorage` reads in loops
2. **Cache** API responses when possible
3. **Debounce** search/filter inputs
4. **Lazy load** images and heavy components
5. **Memoize** expensive computations

---

## Security Reminders

1. ✓ Never commit `.env` files
2. ✓ Always use HTTPS in production
3. ✓ Validate all inputs
4. ✓ Don't store passwords
5. ✓ Refresh tokens periodically
6. ✓ Use environment variables for secrets

---

## Getting Help

1. **Console Logs**: Check browser console for `[Auth]`, `[API]` logs
2. **Network Tab**: See all API requests/responses
3. **Docs**: Read AUTH_DEBUGGING_GUIDE.md
4. **Backend Logs**: Check server console output
5. **Test**: Run INTEGRATION_VERIFICATION.md tests

---

## Example: Complete Feature

### Add "Contact Support" Page

**1. Create Component** (`src/pages/Support.tsx`):
```typescript
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function Support() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Call API
      const response = await fetch('http://localhost:5000/api/support', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('wms_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: 'Help!' })
      });
      
      if (response.ok) {
        toast({ title: 'Sent!' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Contact Support</h1>
      <form onSubmit={handleSubmit}>
        <textarea placeholder="Your message" />
        <Button disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  );
}
```

**2. Add Route** (`src/App.tsx`):
```typescript
<Route path="/support" element={
  <ProtectedRoute>
    <Support />
  </ProtectedRoute>
}/>
```

**3. Add Navigation**:
```typescript
<Link to="/support">Contact Support</Link>
```

**Done!** Feature complete with auth, loading state, and error handling.

---

## Next Steps

- [ ] Clone/open project
- [ ] Run quick start commands above
- [ ] Test login flow
- [ ] Review AUTH_DEBUGGING_GUIDE.md
- [ ] Run INTEGRATION_VERIFICATION.md tests
- [ ] Check API_ENDPOINTS_REFERENCE.md
- [ ] Start building!

---

**Welcome to Smart Waste Management System!**

Questions? Check the documentation files or run the debugging guide.

Last Updated: December 2024
