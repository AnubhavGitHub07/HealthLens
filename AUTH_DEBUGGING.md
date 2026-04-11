# Signup & Login Troubleshooting Guide

## ✅ Backend Status - WORKING

Both endpoints are **fully functional**:

```bash
# Signup Test ✅
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"testuser123@example.com","password":"password123"}'

Response:
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "69d9349423e20577b6ffd997",
    "name": "Test User",
    "email": "testuser123@example.com"
  }
}

# Login Test ✅
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser123@example.com","password":"password123"}'

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "69d9349423e20577b6ffd997",
    "name": "Test User",
    "email": "testuser123@example.com"
  }
}
```

## 🔍 Debugging Steps

### Step 1: Check Backend Server
```bash
# Verify server is running
curl http://localhost:5001/api/health

# You should see:
# {"success":true,"message":"HealthLens API is running 🚀"}

# If not, restart it
cd /Users/anubhavdwivedi/Documents/Hackathon/HackDays/HealthLens/backend
npm run dev
```

### Step 2: Check Frontend Console
1. Open browser: `http://localhost:5173` (or your frontend URL)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try login/signup and look for errors:
   - Red error messages
   - Network request failures
   - TypeScript errors

### Step 3: Check Network Tab
1. Open DevTools → **Network** tab
2. Try login/signup
3. Look for requests to `/api/auth/login` or `/api/auth/signup`
4. Click on the request
5. Check:
   - **Status**: Should be `200` or `201`
   - **Response**: Should have `success: true`
   - **Headers**: Should show `Access-Control-Allow-Origin: *`

### Step 4: Check Frontend URL
Make sure you're accessing the correct frontend URL:
- ✅ Correct: `http://localhost:5173`
- ✅ Correct: `http://localhost:3000`
- ❌ Wrong: `http://localhost:5001` (that's backend)

### Step 5: Check localStorage
After successful login, user data should be stored:

1. Open DevTools → **Application** tab
2. Go to **LocalStorage**
3. Look for:
   - `healthlens_token` - Should have JWT token
   - `healthlens_user` - Should have user JSON

If these aren't there after login, the response isn't being saved.

## 🐛 Common Issues & Solutions

### Issue: "Cannot POST /api/auth/login"
**Cause**: Backend not running or wrong port

**Solution**:
```bash
# Check if backend is running on port 5001
lsof -i :5001

# If not, start it
cd backend && npm run dev
```

### Issue: "Network error" or "Failed to connect"
**Cause**: Backend server is down or API URL is wrong

**Solution**:
1. Verify backend URL in AuthPage.tsx:
   ```tsx
   const res = await axios.post(`http://localhost:5001${endpoint}`, payload);
   ```
2. Make sure backend is running:
   ```bash
   curl http://localhost:5001/api/health
   ```

### Issue: "Invalid email or password" (even with correct credentials)
**Cause**: User doesn't exist in database or wrong password

**Solution**:
1. Try signup first with new email
2. Then try login with same email/password
3. Check that password is typed correctly (case-sensitive)

### Issue: Login works but doesn't redirect to dashboard
**Cause**: Response not being saved to localStorage

**Solution**:
1. Check console for errors
2. Check Network tab for response content
3. Verify response has `token` and `user` fields
4. Check AuthContext login function is being called

### Issue: Form shows error message
**Cause**: Could be validation or API error

**Solution**:
1. Check what error message says
2. Look at console for more details
3. Check network response in DevTools

## 🧪 Test with Example Credentials

### Fresh Test User (Create New)
```bash
# Step 1: Create new user with signup
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Demo User",
    "email":"demo'$(date +%s)'@test.com",
    "password":"Test@12345"
  }'

# Step 2: Use credentials from response to login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo'$(date +%s)'@test.com","password":"Test@12345"}'
```

## ✅ Expected Frontend Flow

1. **Signup Page**:
   - Enter Name, Email, Password
   - Click "Create Account"
   - ✅ Should see success message
   - ✅ Should redirect to Dashboard

2. **Login Page**:
   - Enter Email, Password
   - Click "Sign In"
   - ✅ Should see success message
   - ✅ Should redirect to Dashboard
   - ✅ Dashboard should show your name

## 📋 Signup/Login Validation Rules

| Field | Rules |
|-------|-------|
| Email | Must be valid email format |
| Password | Minimum 6 characters |
| Name (signup) | Required for signup |
| Email (duplicate) | Cannot signup with existing email |

## 🔐 Token Details

When you get a token, it looks like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDkzNDk0MjNlMjA1NzdiNmZmZDk5NyIsImlhdCI6MTc3NTg0MjQ1OCwiZXhwIjoxNzc2NDQ3MjU4fQ.t3BmhfR_i3d7Jz2Mvwr2aDn2a4hJEpinFxI7388oulU
```

This token:
- ✅ Is valid for **7 days**
- ✅ Contains your user ID
- ✅ Is stored in localStorage as `healthlens_token`
- ✅ Is sent with all authenticated requests via Authorization header

## 🚀 Quick Verification

Run these commands to verify everything works:

```bash
# 1. Check backend is running
curl http://localhost:5001/api/health
# Expected: {"success":true,"message":"HealthLens API is running 🚀"}

# 2. Test signup
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test'$(date +%s)'@test.com","password":"test123"}'
# Expected: success: true with token

# 3. Open frontend in browser
# http://localhost:5173

# 4. Check browser console (F12)
# Should be no errors

# 5. Try signup/login in browser
# Should work seamlessly
```

## 📞 Still Having Issues?

### Check These Files
- **Frontend**: `/frontend/src/pages/AuthPage.tsx`
- **Backend**: `/backend/src/routes/auth.ts`
- **Auth Context**: `/frontend/src/context/AuthContext.tsx`

### Enable Debug Logging
Add this to AuthPage.tsx to see what's happening:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  console.log("🔍 Auth attempt:", { isLogin, email }); // Add this

  if (!email || !password || (!isLogin && !name)) {
    setError("Please fill in all fields");
    return;
  }

  try {
    setLoading(true);
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
    const payload = isLogin
      ? { email, password }
      : { name, email, password };

    console.log("📤 Sending to:", endpoint); // Add this
    const res = await axios.post(`http://localhost:5001${endpoint}`, payload);
    console.log("📥 Response received:", res.data); // Add this

    if (res.data.success) {
      console.log("✅ Success! Logging in..."); // Add this
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    }
  } catch (err: any) {
    console.error("❌ Error:", err.response?.data || err.message); // Add this
    setError(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  } finally {
    setLoading(false);
  }
};
```

Then check the console output when you try login/signup.

## 🎯 Summary

✅ **Backend**: Both signup and login are **working perfectly**
✅ **CORS**: Properly configured to allow requests
✅ **Database**: Connected and storing users correctly
✅ **Endpoints**: Both `/api/auth/login` and `/api/auth/signup` are responsive

**The issue is likely on the frontend side** - check browser console and network tab for details.
