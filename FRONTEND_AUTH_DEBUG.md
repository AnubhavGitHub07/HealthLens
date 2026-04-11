# Frontend Auth Testing & Debugging Guide

## ✅ Frontend Status

**Frontend Server**: Running on `http://localhost:5173` ✅
**Framework**: React 19 with TypeScript ✅
**Auth Status**: Component ready with enhanced debugging ✅

## 🔍 New Debug Logging Added

I've added comprehensive console logging to the AuthPage component. When you try to login/signup, you'll see detailed logs in the browser console.

### Expected Console Output for Successful Login:

```
🔍 Auth Debug - Attempting: LOGIN
📤 Endpoint: http://localhost:5001/api/auth/login
📤 Payload: {email: "testuser123@example.com", password: "password123"}
📥 Response received: {success: true, message: "Login successful", token: "eyJ...", user: {...}}
✅ Auth successful! Token received: eyJhbGciOiJIUzI1...
✅ User info: {id: "...", name: "Test User", email: "testuser123@example.com"}
✅ Calling login function...
🔄 Navigating to dashboard...
✅ Navigation triggered
```

## 🧪 Step-by-Step Testing

### Test 1: Open Frontend
1. Open browser: `http://localhost:5173`
2. Should see the Auth page (login form)
3. Press **F12** to open Developer Tools
4. Go to **Console** tab

### Test 2: Try Signup
1. Click "Sign Up" tab
2. Fill in:
   - Name: `Test User`
   - Email: `newuser@example.com` (use a unique email)
   - Password: `password123`
3. Click "Create Account" button
4. **Watch the Console** - you should see all the debug logs above

### Expected Results:
✅ Form should become disabled (loading spinner shows)
✅ Console logs should appear showing the request/response
✅ Should redirect to Dashboard
✅ Dashboard should show your name

### If It Fails:
Check the console for error messages. Common errors:
- `TypeError: Cannot read property 'message' of undefined` - Response format issue
- `Network error` - Backend not running
- `401 Unauthorized` - Wrong credentials
- `400 Bad Request` - Validation error (password too short, etc.)

---

## 📋 Test Cases

### Case 1: New User Signup
```
Input: {name: "Alice", email: "alice@example.com", password: "password123"}
Expected: ✅ Account created, redirected to dashboard
Check console for: ✅ Auth successful! Token received
```

### Case 2: Login with Correct Credentials
```
Input: {email: "alice@example.com", password: "password123"}
Expected: ✅ Logged in, redirected to dashboard
Check console for: ✅ Auth successful! Token received
```

### Case 3: Login with Wrong Password
```
Input: {email: "alice@example.com", password: "wrongpassword"}
Expected: ❌ Error message: "Invalid email or password"
Check console for: ❌ Error Response
```

### Case 4: Signup with Duplicate Email
```
Input: {name: "Bob", email: "alice@example.com", password: "password123"}
Expected: ❌ Error message: "User with this email already exists"
Check console for: ❌ Error Response
```

### Case 5: Password Too Short
```
Input: {name: "Charlie", email: "charlie@example.com", password: "123"}
Expected: ❌ Error message: "Password must be at least 6 characters"
Check console for: ❌ Error Response
```

---

## 🔧 Detailed Debugging Steps

### Step 1: Check Console Logs
When you submit the form, immediately check the console for logs:

```
1. 🔍 Auth Debug - Attempting: [LOGIN or SIGNUP]
   → Confirms form submission was captured
   
2. 📤 Endpoint: http://localhost:5001/api/auth/...
   → Confirms correct endpoint is being called
   
3. 📤 Payload: {...}
   → Confirms data being sent is correct
   
4. 📥 Response received: {...}
   → Confirms backend responded (check if success: true)
   
5. ✅ Auth successful! Token received: ...
   → Confirms response was parsed correctly
```

### Step 2: Check Network Tab
1. Open DevTools → **Network** tab
2. Reload the page (Ctrl+R)
3. Try login/signup
4. Look for request to `/api/auth/login` or `/api/auth/signup`
5. Click on it and check:

```
Headers Tab:
- Method: POST
- Status: 200 (success) or 400/401 (error)
- Content-Type: application/json

Response Tab:
Should see JSON response like:
{
  "success": true,
  "message": "...",
  "token": "eyJ...",
  "user": {...}
}
```

### Step 3: Check LocalStorage
After successful login, data should be saved:

1. DevTools → **Application** tab
2. Go to **LocalStorage**
3. Look for `healthlens_token` and `healthlens_user`
4. Click on them to view values

```
healthlens_token should contain: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
healthlens_user should contain: {"id":"...","name":"...","email":"..."}
```

### Step 4: Check if redirect happens
After successful login:
- URL should change from `http://localhost:5173/auth` to `http://localhost:5173/dashboard`
- Should see dashboard content (health overview)
- Header should show "Your Health Overview" with your name

---

## 🐛 Troubleshooting Specific Issues

### Issue: Form doesn't submit
**Check**:
1. All fields filled in? ✓
2. Is there a validation error showing? Check the red error box
3. Is the button disabled (showing spinner)? Try waiting longer

**Solution**: Clear form and try again with valid data

---

### Issue: Network error / Cannot POST
**Check**:
1. Is backend running? Test: `curl http://localhost:5001/api/health`
2. Is frontend URL correct? Should be `http://localhost:5173`
3. Check console for CORS errors

**Solution**:
```bash
# Restart backend
cd backend && npm run dev

# Restart frontend
cd frontend && npm run dev
```

---

### Issue: "Invalid email or password"
**Check**:
1. Are you using existing user credentials?
2. Is password typed correctly (case-sensitive)?
3. Did you just sign up? (Sometimes there's a delay)

**Solution**:
1. Try signing up with a new email
2. Immediately log in with same email/password
3. Check for typos in password

---

### Issue: Login works but doesn't redirect to dashboard
**Check**:
1. Are the console logs showing "✅ Auth successful!"?
2. Check localStorage - is token being saved?
3. Check DevTools Network tab - what's the final request?

**Solution**:
1. Clear localStorage: `localStorage.clear()` in console
2. Hard refresh: `Ctrl+Shift+R` (Mac: `Cmd+Shift+R`)
3. Try login again

---

### Issue: Gets to dashboard but shows "Loading..." forever
**Check**:
1. Open console - any errors?
2. Check if backend is running
3. Is there a network error in Network tab?

**Solution**:
1. Refresh page (Ctrl+R)
2. Check backend logs: `tail -f backend/server.log`
3. Restart backend if needed

---

## 🔍 Console Commands to Run

### Check if user is logged in:
```javascript
// In browser console (F12)
localStorage.getItem('healthlens_token')
localStorage.getItem('healthlens_user')
```

### Clear all auth data:
```javascript
localStorage.clear()
window.location.reload()
```

### Test API manually:
```javascript
// In browser console
fetch('http://localhost:5001/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Test login manually:
```javascript
// In browser console
fetch('http://localhost:5001/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'testuser123@example.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(d => {
  console.log('Response:', d)
  if(d.success) {
    localStorage.setItem('healthlens_token', d.token)
    localStorage.setItem('healthlens_user', JSON.stringify(d.user))
    window.location.href = '/dashboard'
  }
})
```

---

## ✅ Quick Health Check

Run this in the browser console:

```javascript
// Check backend
fetch('http://localhost:5001/api/health').then(r => r.json()).then(console.log)

// Check auth context
console.log('Token:', localStorage.getItem('healthlens_token') ? '✅ Saved' : '❌ Not saved')
console.log('User:', localStorage.getItem('healthlens_user') ? '✅ Saved' : '❌ Not saved')

// Check if on auth page
console.log('Current URL:', window.location.href)
```

---

## 📚 File Structure Reference

```
frontend/
├── src/
│   ├── pages/
│   │   └── AuthPage.tsx           ← Login/Signup form (with debug logs)
│   ├── context/
│   │   └── AuthContext.tsx        ← Auth state management
│   ├── App.tsx                    ← Route configuration
│   └── styles/
│       └── AuthPage.css           ← Form styling
└── package.json
```

---

## 🚀 Next Steps

### If Auth Works:
1. ✅ Try uploading a medical report
2. ✅ Check analysis dashboard
3. ✅ Test chat functionality

### If Auth Doesn't Work:
1. Follow the debugging steps above
2. Check console logs for exact error
3. Review the Error details in this guide

---

## 📞 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid email or password" | Wrong credentials | Check spelling, try signup first |
| "User with this email already exists" | Email in use | Use different email |
| "Password must be at least 6 characters" | Too short | Use 6+ character password |
| "Please fill in all fields" | Missing field | Check all fields are filled |
| Network error / No response | Backend down | Start backend: `npm run dev` |
| "Cannot POST /api/auth/..." | Wrong URL or CORS | Check backend is running |

---

## 💡 Pro Tips

1. **Keep browser console open** (F12) while testing
2. **Check Network tab** to see actual API responses
3. **Use unique emails** for each signup test
4. **Hard refresh** (Ctrl+Shift+R) if things seem stuck
5. **Check backend logs** if frontend shows "Network error"
6. **Use test credentials** from documentation

---

**Status**: ✅ Frontend is ready, debug logs are in place. Follow the steps above to test and debug the auth flow!
