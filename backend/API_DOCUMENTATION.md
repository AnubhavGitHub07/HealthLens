# HealthLens Backend API Documentation

## Overview
HealthLens is a comprehensive health analysis platform with AI-powered insights. The backend API provides endpoints for user authentication, health report management, AI-powered chat analysis, and health metrics tracking.

## Technology Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express-validator

## Base URL
```
http://localhost:5000/api
```

## Authentication
The API uses JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer {accessToken}
```

Refresh tokens are stored in secure HTTP-only cookies.

---

## API Endpoints

### 1. Authentication Routes (`/api/auth`)

#### Sign Up
- **POST** `/api/auth/signup`
- **Description**: Create a new user account
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
  ```
- **Password Requirements**:
  - Minimum 8 characters
  - Must contain uppercase and lowercase letters
  - Must contain at least one number
  - Must contain at least one special character (@$!%*?&)
- **Response** (201):
  ```json
  {
    "message": "User created successfully",
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "accessToken": "eyJhbGc..."
  }
  ```

#### Login
- **POST** `/api/auth/login`
- **Description**: Authenticate user and receive access token
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
  ```
- **Response** (200):
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "accessToken": "eyJhbGc..."
  }
  ```

#### Refresh Token
- **POST** `/api/auth/refresh-token`
- **Description**: Get a new access token using refresh token
- **Cookies**: Requires refreshToken cookie
- **Response** (200):
  ```json
  {
    "accessToken": "eyJhbGc..."
  }
  ```

#### Logout
- **POST** `/api/auth/logout`
- **Auth**: Required
- **Description**: Logout user and clear refresh token
- **Response** (200):
  ```json
  {
    "message": "Logout successful"
  }
  ```

#### Get Current User
- **GET** `/api/auth/me`
- **Auth**: Required
- **Description**: Get current authenticated user profile
- **Response** (200):
  ```json
  {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "dateOfBirth": "1990-01-15",
      "gender": "male"
    }
  }
  ```

---

### 2. User Routes (`/api/users`)
All user routes require authentication.

#### Get User Profile
- **GET** `/api/users/profile`
- **Auth**: Required
- **Response** (200): User object with full profile

#### Update User Profile
- **PUT** `/api/users/profile`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "bio": "Health conscious individual",
    "allergies": ["penicillin"],
    "medicalHistory": ["hypertension"],
    "currentMedications": ["lisinopril"]
  }
  ```
- **Response** (200): Updated user object

#### Delete Account
- **DELETE** `/api/users/account`
- **Auth**: Required
- **Description**: Permanently delete user account and associated data
- **Response** (200):
  ```json
  {
    "message": "Account deleted successfully"
  }
  ```

#### Get Settings
- **GET** `/api/users/settings`
- **Auth**: Required
- **Response** (200):
  ```json
  {
    "settings": {
      "email": "john@example.com",
      "notificationsEnabled": true,
      "emailNotifications": true,
      "dataSharing": false
    }
  }
  ```

#### Update Settings
- **PUT** `/api/users/settings`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "notificationsEnabled": true,
    "emailNotifications": true,
    "dataSharing": false
  }
  ```
- **Response** (200): Updated settings

#### Get Health Data
- **GET** `/api/users/health-data`
- **Auth**: Required
- **Response** (200):
  ```json
  {
    "metrics": {
      "userId": "user_id",
      "metrics": [
        {
          "date": "2024-01-15T10:30:00Z",
          "bloodPressure": { "systolic": 120, "diastolic": 80 },
          "heartRate": 72,
          "weight": 75.5
        }
      ],
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  }
  ```

#### Add Health Metric
- **POST** `/api/users/health-data/metric`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "date": "2024-01-15T10:30:00Z",
    "bloodPressure": { "systolic": 120, "diastolic": 80 },
    "heartRate": 72,
    "bloodGlucose": 95,
    "weight": 75.5,
    "steps": 8500,
    "sleepHours": 7.5,
    "stressLevel": 3
  }
  ```
- **Response** (201): Created metric entry

---

### 3. Report Routes (`/api/reports`)
All report routes require authentication.

#### Upload Report
- **POST** `/api/reports/upload`
- **Auth**: Required
- **Content-Type**: multipart/form-data
- **Files**: PDF or image files (max 50MB)
- **Form Data**:
  ```
  file: <binary file>
  fileName: "My Health Report"
  fileType: "pdf"
  ```
- **Response** (201):
  ```json
  {
    "message": "Report uploaded successfully",
    "report": {
      "id": "report_id",
      "fileName": "My Health Report",
      "fileUrl": "/uploads/file-123.pdf",
      "fileType": "pdf",
      "fileSize": 2048000,
      "uploadedAt": "2024-01-15T10:30:00Z"
    }
  }
  ```

#### List Reports
- **GET** `/api/reports?page=1&limit=10`
- **Auth**: Required
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response** (200):
  ```json
  {
    "reports": [
      {
        "id": "report_id",
        "fileName": "My Health Report",
        "fileUrl": "/uploads/file-123.pdf",
        "uploadedAt": "2024-01-15T10:30:00Z",
        "analyzedAt": "2024-01-15T10:35:00Z"
      }
    ],
    "pagination": {
      "current": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
  ```

#### Get Report
- **GET** `/api/reports/:reportId`
- **Auth**: Required
- **Response** (200): Report object with all details

#### Update Report
- **PUT** `/api/reports/:reportId`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "extractedMetrics": {
      "bloodPressure": { "systolic": 130, "diastolic": 85 },
      "heartRate": 78,
      "weight": 76.2
    },
    "analysisResult": {
      "summary": "Analysis summary",
      "findings": ["Finding 1", "Finding 2"],
      "risks": [
        {
          "type": "hypertension",
          "severity": "medium",
          "description": "Elevated blood pressure detected"
        }
      ],
      "recommendations": ["Recommendation 1", "Recommendation 2"]
    }
  }
  ```
- **Response** (200): Updated report

#### Delete Report
- **DELETE** `/api/reports/:reportId`
- **Auth**: Required
- **Response** (200):
  ```json
  {
    "message": "Report deleted successfully"
  }
  ```

#### Get Analysis Result
- **GET** `/api/reports/:reportId/analysis`
- **Auth**: Required
- **Response** (200):
  ```json
  {
    "analysisResult": {
      "summary": "Report analysis for metrics collected on 1/15/2024",
      "findings": [
        "Blood pressure: 130/85 mmHg",
        "Heart rate: 78 bpm (normal)"
      ],
      "risks": [
        {
          "type": "hypertension",
          "severity": "medium",
          "description": "Blood pressure reading is elevated"
        }
      ],
      "recommendations": [
        "Consult with healthcare provider about blood pressure management",
        "Maintain regular health checkups",
        "Stay hydrated and maintain healthy lifestyle"
      ]
    }
  }
  ```

---

### 4. Chat Routes (`/api/chat`)
All chat routes require authentication.

#### Send Chat Message
- **POST** `/api/chat/message`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "message": "What does this mean about my blood pressure?",
    "reportId": "optional_report_id"
  }
  ```
- **Message Requirements**:
  - 1-5000 characters
  - Cannot be empty
- **Response** (201):
  ```json
  {
    "message": "Chat message processed",
    "chat": {
      "id": "chat_id",
      "userMessage": "What does this mean about my blood pressure?",
      "aiResponse": "Normal blood pressure is typically...",
      "context": {
        "reportId": "report_id",
        "topic": "health-analysis"
      },
      "tokens_used": {
        "prompt": 15,
        "completion": 45,
        "total": 60
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
  ```

#### Get Chat History
- **GET** `/api/chat/history?page=1&limit=20&reportId=optional_id`
- **Auth**: Required
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `reportId`: Filter by report (optional)
- **Response** (200):
  ```json
  {
    "messages": [
      {
        "id": "chat_id",
        "userMessage": "...",
        "aiResponse": "...",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "current": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
  ```

#### Delete Chat Message
- **DELETE** `/api/chat/:messageId`
- **Auth**: Required
- **Response** (200):
  ```json
  {
    "message": "Chat message deleted successfully"
  }
  ```

#### Rate Chat Message
- **POST** `/api/chat/:messageId/rate`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "rating": 4,
    "isHelpful": true,
    "comment": "Very helpful response"
  }
  ```
- **Response** (200): Updated chat message with rating

#### Get Chat Statistics
- **GET** `/api/chat/stats`
- **Auth**: Required
- **Response** (200):
  ```json
  {
    "stats": {
      "totalMessages": 42,
      "averageRating": 4.2,
      "helpful": 35
    }
  }
  ```

---

### 5. Analyzer Routes (`/api/analyzer`)
All analyzer routes require authentication.

#### Analyze Report
- **POST** `/api/analyzer/:reportId/analyze`
- **Auth**: Required
- **Description**: Parse and analyze uploaded health report
- **Response** (200):
  ```json
  {
    "message": "Report analyzed successfully",
    "report": {
      "id": "report_id",
      "extractedText": "Extracted text content...",
      "extractedMetrics": {
        "bloodPressure": { "systolic": 130, "diastolic": 85 },
        "heartRate": 78,
        "weight": 76.2
      },
      "analysisResult": {
        "summary": "...",
        "findings": [...],
        "risks": [...],
        "recommendations": [...]
      },
      "analyzedAt": "2024-01-15T10:35:00Z"
    }
  }
  ```

#### Get Recommendations
- **GET** `/api/analyzer/recommendations?period=month`
- **Auth**: Required
- **Query Parameters**:
  - `period`: "week" | "month" | "quarter" | "year" (default: month)
- **Response** (200):
  ```json
  {
    "period": "month",
    "recommendations": [
      "Consult with healthcare provider about blood pressure management",
      "Maintain regular health checkups",
      "Stay hydrated and maintain healthy lifestyle"
    ],
    "risks": [
      {
        "type": "hypertension",
        "severity": "medium",
        "description": "Blood pressure reading is elevated"
      }
    ],
    "reportCount": 5
  }
  ```

#### Generate Trends
- **GET** `/api/analyzer/trends`
- **Auth**: Required
- **Response** (200):
  ```json
  {
    "trends": {
      "heartRate": {
        "trend": "stable",
        "change": 0.50
      },
      "weight": {
        "trend": "improving",
        "change": -2.30
      },
      "bloodGlucose": {
        "trend": "worsening",
        "change": 5.80
      }
    }
  }
  ```

#### Get Health Score
- **GET** `/api/analyzer/health-score`
- **Auth**: Required
- **Response** (200):
  ```json
  {
    "healthScore": 78,
    "status": "good",
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
  ```

---

## Error Responses

### 400 Bad Request
```json
{
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "An error occurred processing your request"
}
```

---

## Rate Limiting

- **Global**: 100 requests per 15 minutes
- **Auth Endpoints**: 5 requests per 15 minutes
- **Response Headers**:
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 98
  X-RateLimit-Reset: 1642345680
  ```

---

## Security Headers

The API includes the following security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

---

## File Upload Specifications

### Supported Formats
- PDF (.pdf)
- JPEG (.jpg, .jpeg)
- PNG (.png)

### Size Limits
- Maximum file size: 50MB
- Recommended: < 10MB for faster processing

### Upload Directory
Files are stored in `/uploads/` directory with unique names.

---

## Environment Variables

Create a `.env` file in the backend root with:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/healthlens

# Authentication
JWT_SECRET=your-jwt-secret-key
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# File Upload
MAX_FILE_SIZE=52428800

# CORS
CORS_ORIGIN=http://localhost:5173

# AI Integration (Future)
OPENAI_API_KEY=your-openai-api-key
```

---

## Installation & Setup

### Prerequisites
- Node.js >= 16.0.0
- MongoDB >= 4.0
- npm or yarn

### Installation Steps

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run ESLint
npm run lint

# Run tests
npm test

# Watch mode for tests
npm run test:watch
```

---

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   ├── AuthController.ts
│   │   ├── UserController.ts
│   │   ├── ReportController.ts
│   │   ├── ChatController.ts
│   │   └── AnalyzerController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── HealthReport.ts
│   │   ├── ChatMessage.ts
│   │   ├── HealthMetrics.ts
│   │   └── index.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── report.routes.ts
│   │   ├── chat.routes.ts
│   │   └── analyzer.routes.ts
│   ├── validators/
│   │   └── index.ts
│   └── index.ts
├── .env.example
├── package.json
└── tsconfig.json
```

---

## API Testing

### Using cURL

```bash
# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Using Postman
1. Import the API endpoints
2. Set Authorization header with Bearer token
3. Test each endpoint

---

## Performance Considerations

- Pagination is recommended for list endpoints
- Large file uploads may take time; implement progress tracking on frontend
- Chat responses use mock data; replace with OpenAI API for production
- Database indexes are configured for common queries

---

## Future Enhancements

- [ ] OpenAI API integration for AI-powered analysis
- [ ] PDF parsing with text extraction
- [ ] Image OCR for health metrics extraction
- [ ] WebSocket support for real-time chat
- [ ] Advanced health analytics and reporting
- [ ] Multi-language support
- [ ] Mobile app API support

---

## Support

For issues or questions, please contact the development team or open an issue in the repository.
