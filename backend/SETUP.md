# Backend Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install all required packages including:
- Express.js and related middleware
- MongoDB driver and Mongoose ODM
- JWT authentication libraries
- File upload handling
- TypeScript and development tools

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/healthlens

# Authentication Secrets (Generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key-change-this

# File Upload Settings
MAX_FILE_SIZE=52428800  # 50MB in bytes

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# AI Integration (Optional for now)
OPENAI_API_KEY=your-openai-api-key

# Database Admin Settings (Optional)
DB_USER=admin
DB_PASSWORD=password
```

### 3. Setup MongoDB

#### Option A: Local MongoDB
```bash
# macOS with Homebrew
brew install mongodb-community
brew services start mongodb-community

# Verify installation
mongosh

# Create database
use healthlens
```

#### Option B: MongoDB Atlas (Cloud)
1. Visit https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthlens?retryWrites=true&w=majority
```

### 4. Create Uploads Directory

```bash
cd backend
mkdir -p uploads
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5001`

You should see:
```
Server running on port 5001
Connected to MongoDB
```

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/
│   │   ├── AuthController.ts    # Auth logic
│   │   ├── UserController.ts    # User management
│   │   ├── ReportController.ts  # Report handling
│   │   ├── ChatController.ts    # Chat AI responses
│   │   └── AnalyzerController.ts # Health analysis
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication
│   │   ├── errorHandler.ts      # Error handling
│   │   └── logger.ts            # Request logging
│   ├── models/
│   │   ├── User.ts              # User schema
│   │   ├── HealthReport.ts      # Report schema
│   │   ├── ChatMessage.ts       # Chat schema
│   │   ├── HealthMetrics.ts     # Metrics schema
│   │   └── index.ts             # Model exports
│   ├── routes/
│   │   ├── auth.routes.ts       # Auth endpoints
│   │   ├── user.routes.ts       # User endpoints
│   │   ├── report.routes.ts     # Report endpoints
│   │   ├── chat.routes.ts       # Chat endpoints
│   │   └── analyzer.routes.ts   # Analyzer endpoints
│   ├── validators/
│   │   └── index.ts             # Input validation
│   └── index.ts                 # Main server file
├── uploads/                      # File storage directory
├── .env.example                  # Environment template
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

---

## Available Scripts

```bash
# Development (with auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm test

# Watch mode for tests
npm run test:watch
```

---

## API Endpoints Overview

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `DELETE /api/users/account` - Delete account
- `GET /api/users/settings` - Get settings
- `PUT /api/users/settings` - Update settings
- `GET /api/users/health-data` - Get health data
- `POST /api/users/health-data/metric` - Add metric

### Health Reports
- `POST /api/reports/upload` - Upload report
- `GET /api/reports` - List reports
- `GET /api/reports/:reportId` - Get report
- `PUT /api/reports/:reportId` - Update report
- `DELETE /api/reports/:reportId` - Delete report
- `GET /api/reports/:reportId/analysis` - Get analysis

### Chat & AI
- `POST /api/chat/message` - Send message
- `GET /api/chat/history` - Chat history
- `DELETE /api/chat/:messageId` - Delete message
- `POST /api/chat/:messageId/rate` - Rate message
- `GET /api/chat/stats` - Chat statistics

### Health Analysis
- `POST /api/analyzer/:reportId/analyze` - Analyze report
- `GET /api/analyzer/recommendations` - Get recommendations
- `GET /api/analyzer/trends` - Get trends
- `GET /api/analyzer/health-score` - Get health score

---

## Testing the API

### Test User Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "TestPass123!"
  }'
```

### Test User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "TestPass123!"
  }'
```

### Test Protected Route (Get Profile)
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Upload Health Report
```bash
curl -X POST http://localhost:5000/api/reports/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/health_report.pdf" \
  -F "fileName=My Health Report"
```

---

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running
```bash
# macOS
brew services start mongodb-community

# Verify
mongosh
```

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution**: Change PORT in `.env` or kill existing process
```bash
# Find process on port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Module Not Found Errors
```
Error: Cannot find module 'express'
```
**Solution**: Install dependencies
```bash
npm install
```

### TypeScript Compilation Errors
```
error TS2307: Cannot find module 'express'
```
**Solution**: Install type definitions
```bash
npm install --save-dev @types/express @types/node
```

### JWT Token Invalid
```
Error: invalid token
```
**Solution**: Ensure JWT_SECRET in `.env` matches across restarts. Token format should be `Bearer {token}`

---

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` file to version control
- Use strong random values for JWT secrets
- Rotate secrets periodically in production

### 2. Database
- Use MongoDB Atlas for production (don't expose local DB)
- Enable authentication on MongoDB
- Use connection pooling

### 3. File Uploads
- Validate file types on both client and server
- Store files outside public directory
- Implement virus scanning for production
- Use CDN for file delivery

### 4. API Security
- Enable HTTPS in production
- Set secure CORS origins
- Implement rate limiting (already configured)
- Validate all inputs (validators in place)
- Use helmet for security headers (configured)

### 5. Authentication
- Use bcrypt for password hashing (configured)
- Implement token expiration (15min access, 7d refresh)
- Store refresh tokens in secure HTTP-only cookies
- Implement logout on token blacklist

---

## Performance Optimization

### Database Indexes
Indexes are created on:
- `User.email` - for login lookups
- `HealthReport.userId` with sort by date
- `ChatMessage.userId` for history
- `HealthMetrics.userId` (unique)

### Caching Strategies
- Frontend caches auth tokens
- Consider Redis for session caching
- Implement ETag for static responses

### Pagination
All list endpoints support pagination:
- Default limit: 10-20 items
- Use `page` and `limit` query parameters
- Total count included in response

---

## Connecting Frontend

The frontend at `http://localhost:5173` is already configured to connect to this backend.

### In frontend code:
```typescript
const API_BASE_URL = 'http://localhost:5000/api';

// Example API call
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

---

## Database Backup

### Export MongoDB Data
```bash
mongodump --uri "mongodb://localhost:27017/healthlens" --out ./backup
```

### Import MongoDB Data
```bash
mongorestore --uri "mongodb://localhost:27017/healthlens" ./backup
```

---

## Deployment Checklist

- [ ] Update environment variables for production
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL
- [ ] Update CORS_ORIGIN to production frontend URL
- [ ] Configure MongoDB Atlas
- [ ] Set up error logging service
- [ ] Implement database backups
- [ ] Configure file storage (S3 or similar)
- [ ] Set up monitoring and alerts
- [ ] Update API documentation for production URL
- [ ] Test all endpoints on production
- [ ] Set up CI/CD pipeline

---

## Next Steps

1. **Install and run backend**: `npm install && npm run dev`
2. **Test API endpoints** using provided curl commands
3. **Connect frontend** to backend API
4. **Implement AI integration** for OpenAI API
5. **Add PDF parsing** for document analysis
6. **Set up production deployment**

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## Support & Debugging

### Check Server Status
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### View Server Logs
The server logs all requests with:
- HTTP method
- Route path
- Response status
- Response time

### Debug Mode
Set `NODE_ENV=development` for:
- Detailed error messages
- Stack traces
- Request/response logging
- Disable compression for debugging

---

## Architecture Overview

```
Frontend (React)           Backend (Express)        Database (MongoDB)
    ↓                          ↓                           ↓
localhost:5173          localhost:5001              localhost:27017
    │                          │                           │
    │──── HTTP Requests ──→    │                           │
    │                          │──── Query/Update ────→    │
    │                          │                           │
    │    ← JSON Response ──    │                           │
    │                          │    ← Data Response ─      │
```

### Authentication Flow
```
1. User submits credentials
2. Backend validates and hashes password
3. Backend generates JWT tokens
4. Access token sent to frontend
5. Refresh token stored in secure cookie
6. Frontend includes access token in Authorization header
7. Backend verifies token on protected routes
```

---

## Resources

- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT Docs](https://jwt.io/)
- [TypeScript Docs](https://www.typescriptlang.org/)

---

Last updated: January 2026
