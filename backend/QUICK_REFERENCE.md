# HealthLens Backend - Quick Reference

## 🚀 Quick Start (30 seconds)

```bash
cd backend
npm install
npm run dev
```

Server runs on: **http://localhost:5000**

---

## 📋 File Structure

```
backend/src/
├── index.ts                 # Main server file
├── config/
│   └── database.ts          # MongoDB connection
├── models/                  # Mongoose schemas
│   ├── User.ts
│   ├── HealthReport.ts
│   ├── ChatMessage.ts
│   └── HealthMetrics.ts
├── controllers/             # Business logic
│   ├── AuthController.ts
│   ├── UserController.ts
│   ├── ReportController.ts
│   ├── ChatController.ts
│   └── AnalyzerController.ts
├── routes/                  # API endpoints
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── report.routes.ts
│   ├── chat.routes.ts
│   └── analyzer.routes.ts
├── middleware/              # Express middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── logger.ts
└── validators/              # Input validation
    └── index.ts
```

---

## 🔌 API Endpoints Quick Reference

### Authentication (`/api/auth`)
```
POST   /signup          - Register user
POST   /login           - Login user
POST   /refresh-token   - Refresh access token
POST   /logout          - Logout user
GET    /me              - Get current user
```

### Users (`/api/users`)
```
GET    /profile         - Get profile
PUT    /profile         - Update profile
DELETE /account         - Delete account
GET    /settings        - Get settings
PUT    /settings        - Update settings
GET    /health-data     - Get health data
POST   /health-data/metric - Add metric
```

### Reports (`/api/reports`)
```
POST   /upload          - Upload report (multipart)
GET    /                - List reports
GET    /:id             - Get report
PUT    /:id             - Update report
DELETE /:id             - Delete report
GET    /:id/analysis    - Get analysis result
```

### Chat (`/api/chat`)
```
POST   /message         - Send message
GET    /history         - Get chat history
DELETE /:id             - Delete message
POST   /:id/rate        - Rate message
GET    /stats           - Get statistics
```

### Analyzer (`/api/analyzer`)
```
POST   /:id/analyze     - Analyze report
GET    /recommendations - Get recommendations
GET    /trends          - Get trends
GET    /health-score    - Get health score
```

---

## 🔑 Authentication

### Get Access Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

### Use Token (in headers)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/users/profile
```

---

## 📤 File Upload

```bash
curl -X POST http://localhost:5000/api/reports/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/report.pdf" \
  -F "fileName=My Report"
```

**Supported**: PDF, PNG, JPG  
**Max Size**: 50MB

---

## 🗄️ Database Models

### User
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  dateOfBirth: Date,
  gender: 'male' | 'female' | 'other',
  medicalHistory: [String],
  allergies: [String],
  currentMedications: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### HealthReport
```javascript
{
  userId: ObjectId,
  fileName: String,
  fileUrl: String,
  fileType: 'pdf' | 'image' | 'document',
  extractedMetrics: Object,
  analysisResult: {
    summary: String,
    findings: [String],
    risks: [{type, severity, description}],
    recommendations: [String]
  },
  uploadedAt: Date,
  analyzedAt: Date
}
```

### ChatMessage
```javascript
{
  userId: ObjectId,
  userMessage: String,
  aiResponse: String,
  context: {reportId, topic, severity},
  feedback: {rating, isHelpful, comment},
  createdAt: Date
}
```

### HealthMetrics
```javascript
{
  userId: ObjectId (unique),
  metrics: [{
    date: Date,
    bloodPressure: {systolic, diastolic},
    heartRate: Number,
    weight: Number,
    steps: Number,
    sleepHours: Number
  }],
  lastUpdated: Date
}
```

---

## ⚙️ Environment Variables

Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/healthlens
JWT_SECRET=your-super-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=52428800
```

---

## 📊 Common API Responses

### Success (2xx)
```json
{
  "message": "Success message",
  "data": { /* response data */ }
}
```

### Error (4xx/5xx)
```json
{
  "message": "Error message",
  "errors": [
    {"field": "email", "message": "Invalid email"}
  ]
}
```

---

## 🔒 Security

| Feature | Status |
|---------|--------|
| Password Hashing | ✅ bcrypt |
| JWT Tokens | ✅ 15min access, 7d refresh |
| CORS | ✅ Configured |
| Helmet Headers | ✅ Enabled |
| Rate Limiting | ✅ 100/15min global |
| Input Validation | ✅ express-validator |
| File Validation | ✅ Type & size checks |

---

## 🧪 Testing Commands

```bash
# Health check
curl http://localhost:5000/api/health

# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@test.com",
    "password": "TestPass123!"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "TestPass123!"
  }'

# Get Profile (use token from login)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/users/profile
```

---

## 🛠️ NPM Scripts

```bash
npm run dev              # Start dev server with auto-reload
npm run build           # Build TypeScript to JavaScript
npm run start           # Start production server
npm run lint            # Run ESLint
npm test                # Run tests
npm run test:watch     # Watch mode for tests
```

---

## 📚 Documentation Files

- **API_DOCUMENTATION.md** - Complete API reference
- **SETUP.md** - Detailed setup guide
- **DEVELOPMENT_COMPLETE.md** - What's been built
- **README.md** - Project overview

---

## 🚀 Deploy to Production

### Environment Setup
```bash
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=strong_random_secret
REFRESH_TOKEN_SECRET=strong_random_secret
CORS_ORIGIN=your_frontend_domain
```

### Build & Start
```bash
npm run build
npm start
```

### Monitor
```bash
# Check server
curl https://your-domain.com/api/health

# View logs
pm2 logs app
```

---

## ❌ Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
brew services list

# Start MongoDB
brew services start mongodb-community
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

### Dependency Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Compilation Errors
```bash
# Type definitions missing
npm install --save-dev @types/express @types/node
```

---

## 🔗 Important Links

- API Base: `http://localhost:5000/api`
- Frontend: `http://localhost:5173`
- MongoDB: `mongodb://localhost:27017/healthlens`
- Docs: See `backend/API_DOCUMENTATION.md`

---

## 📞 Support

- Check logs: `npm run dev` shows all requests
- Enable debug: `DEBUG=* npm run dev`
- Review errors: Check error response messages
- Reference docs: See API_DOCUMENTATION.md

---

## ✅ Checklist

- [ ] `npm install` completed
- [ ] `.env` file created with MongoDB URI
- [ ] MongoDB is running
- [ ] `npm run dev` server started
- [ ] API responding at `http://localhost:5000/api/health`
- [ ] Test user created via signup
- [ ] Frontend connected to backend
- [ ] File upload tested
- [ ] Chat endpoint tested
- [ ] Ready for AI integration

---

**Last Updated**: January 2024  
**Version**: 1.0.0

Print or bookmark this for quick reference! 📌
