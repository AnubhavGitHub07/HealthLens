<div align="center">

# 🏥 HealthLens

### AI-Powered Medical Report Analyzer

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

**Helping patients understand their medical reports through personalized health insights powered by Google Gemini AI.**

[✨ Features](#-features) · [🚀 Quick Start](#-quick-start) · [📖 API Docs](#-api-documentation) · [🏗️ Architecture](#️-architecture) · [🤝 Contributing](#-contributing)

---

</div>

## 📋 Problem Statement

| Statistic | Impact |
|-----------|--------|
| **78%** of patients | Don't understand their medical reports |
| **500M+** medical tests annually | Lack proper explanation for patients |
| **Majority** of patients | Experience anxiety from unclear results |
| **No existing solution** | Provides personalized, AI-powered medical guidance |

> Medical reports are filled with complex terminology, reference ranges, and clinical jargon that most patients cannot interpret on their own. This leads to unnecessary anxiety, delayed treatment, and poor health decisions.

## 💡 Solution

**HealthLens** bridges the gap between complex medical data and patient understanding. Users simply upload their medical report, and our AI-powered system delivers:

- 🔍 **Plain-language explanations** of every finding
- ⚠️ **Risk assessments** with color-coded severity levels
- 📅 **Personalized 90-day action plans** for health improvement
- 💊 **Medication insights** with dosage and interaction warnings
- 🩺 **Doctor visit preparation** with smart questions to ask

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📤 **Report Upload** | Drag-and-drop PDF/image upload with instant preview |
| 🔬 **Text Extraction** | Automatic data extraction from PDFs and images |
| 🧠 **Gemini AI Analysis** | Advanced medical reasoning powered by Google Gemini |
| 📊 **Visual Results** | Formatted, color-coded analysis with risk indicators |
| 📅 **90-Day Action Plan** | Personalized timeline of health recommendations |
| 🩺 **Doctor Prep** | Smart questions tailored to your results |
| 💾 **Download Report** | Save your complete analysis as a document |
| 📱 **Mobile Responsive** | Fully optimized for all screen sizes |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ → [Download](https://nodejs.org/)
- **npm** v9+
- **Google Gemini API Key** → [Get one free](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/AnubhavGitHub07/HealthLens.git
cd HealthLens
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Open .env and add your GEMINI_API_KEY
```

Edit the `.env` file:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=5001
```

```bash
# Start the backend server
npm run dev
```

The backend will start on **http://localhost:5001**

### 3. Frontend Setup

```bash
# Open a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on **http://localhost:5173**

### 4. You're Ready! 🎉

Open **http://localhost:5173** in your browser and upload a medical report to get started.

---

## 🏗️ Architecture

```
HealthLens/
│
├── medichat-backend/                # Node.js + Express API Server
│   ├── server.js                    # Express entry point
│   ├── .env                         # Environment variables (gitignored)
│   ├── .env.example                 # Environment template
│   ├── package.json
│   ├── routes/
│   │   └── analyze.js               # POST /api/analyze-report
│   ├── middleware/
│   │   └── upload.js                # Multer file upload configuration
│   ├── utils/
│   │   ├── pdfExtractor.js          # PDF-Parse text extraction
│   │   ├── geminiClient.js          # Google Gemini API wrapper
│   │   └── prompts.js               # Medical analysis prompt templates
│   └── config/
│       └── firebase.js              # Firebase Admin SDK config
│
├── medichat-frontend/               # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── main.jsx                 # React entry point
│   │   ├── App.jsx                  # Root application component
│   │   ├── index.css                # Tailwind directives + custom styles
│   │   ├── components/
│   │   │   ├── Header.jsx           # Navigation header
│   │   │   ├── Footer.jsx           # App footer with disclaimer
│   │   │   ├── HeroSection.jsx      # Landing hero with CTA
│   │   │   ├── FileUpload.jsx       # Drag-and-drop file upload
│   │   │   ├── AnalysisResults.jsx  # Medical analysis display
│   │   │   ├── ActionPlan.jsx       # 90-day recommendation timeline
│   │   │   ├── DoctorPrep.jsx       # Doctor visit preparation
│   │   │   └── LoadingSpinner.jsx   # Analysis loading animation
│   │   └── pages/
│   │       └── Home.jsx             # Main page orchestrator
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── docs/
│   └── API_DOCS.md                  # Detailed API documentation
├── .gitignore
└── README.md
```

---

## 🔧 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** + **Express.js** | REST API server |
| **Google Gemini API** | AI-powered medical analysis & reasoning |
| **Multer** | Multipart file upload handling |
| **PDF-Parse** | Text extraction from PDF documents |
| **Firebase Admin** | Database for storing analysis history |
| **dotenv** | Environment variable management |
| **CORS** | Cross-origin request handling |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | Component-based UI framework |
| **Vite** | Lightning-fast build tool & dev server |
| **Tailwind CSS v4** | Utility-first CSS framework |
| **Axios** | HTTP client for API communication |
| **React Icons** | Icon library |
| **html2canvas** + **jsPDF** | Report download/export functionality |

---

## 📖 API Documentation

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "HealthLens API is running",
  "timestamp": "2026-04-03T12:00:00.000Z"
}
```

### Analyze Medical Report

```http
POST /api/analyze-report
Content-Type: multipart/form-data
```

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `report` | `File` | Medical report file (PDF, PNG, JPG) — Max 10MB |

**Response:**
```json
{
  "success": true,
  "analysis": {
    "summary": "Plain-language overview of your report...",
    "keyFindings": [
      {
        "parameter": "Hemoglobin",
        "value": "12.5 g/dL",
        "normalRange": "13.5-17.5 g/dL",
        "status": "low",
        "explanation": "Your hemoglobin is slightly below normal..."
      }
    ],
    "riskAssessment": {
      "level": "moderate",
      "details": "Based on your results..."
    },
    "actionPlan": {
      "immediate": ["..."],
      "thirtyDays": ["..."],
      "sixtyDays": ["..."],
      "ninetyDays": ["..."]
    },
    "medications": ["..."],
    "doctorQuestions": ["..."]
  },
  "timestamp": "2026-04-03T12:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "No file uploaded or unsupported file type"
}
```

---

## 🔄 User Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  User opens  │────▶│ Clicks Upload│────▶│ Selects PDF/IMG  │
│   web app    │     │    button    │     │     file         │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                                                   ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Downloads   │◀───│   Results    │◀───│  Gemini AI       │
│  analysis    │    │   displayed  │    │  analyzes data    │
└─────────────┘     └──────────────┘     └─────────────────┘
```

1. **Upload** → User drags or selects a medical report (PDF/Image)
2. **Extract** → System extracts text data from the uploaded file
3. **Analyze** → Google Gemini AI performs medical reasoning on extracted data
4. **Display** → Results shown in easy-to-understand, color-coded sections
5. **Act** → User receives a 90-day personalized action plan
6. **Prepare** → Smart doctor visit questions generated
7. **Save** → Download complete analysis as a document

---

## 🌐 Deployment

### Backend → Heroku

```bash
cd medichat-backend

# Login to Heroku
heroku login

# Create a new app
heroku create medichat-pro-api

# Set environment variables
heroku config:set GEMINI_API_KEY=your_key_here

# Deploy
git push heroku main
```

### Frontend → Vercel

```bash
cd medichat-frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

> **Note:** Update the API base URL in the frontend to point to your deployed backend URL before deploying to production.

---

## 🧠 How Gemini AI is Used

| Capability | Application in HealthLens |
|------------|---------------------------|
| **Text Understanding** | Extracts and interprets medical values, terminology, and reference ranges |
| **Advanced Reasoning** | Analyzes medical data contextually — correlates findings, identifies patterns |
| **Content Generation** | Creates personalized action plans, explanations in plain language |
| **Multi-turn Context** | Maintains report context across analysis sections (50K token window) |
| **Vision (Multimodal)** | Reads medical reports from images when PDF text extraction isn't possible |

---

## 📊 Success Metrics

| Metric | Target |
|--------|--------|
| Report understanding clarity | **8.5+ / 10** |
| Analysis generation time | **< 3 seconds** |
| API accuracy | **95%+** |
| System uptime | **99.9%** |
| User satisfaction (NPS) | **50+** |

---

## 🛡️ Security & Privacy

- 🔒 **No data stored permanently** — uploaded files are deleted after analysis
- 🔐 **API keys** stored in environment variables, never committed to code
- 🛡️ **File validation** — only accepted formats (PDF, PNG, JPG) up to 10MB
- ⚕️ **Medical disclaimer** — all analysis is informational, not a substitute for professional medical advice

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Scripts

```bash
# Backend
cd medichat-backend
npm run dev          # Start with nodemon (hot reload)
npm start            # Start production server

# Frontend
cd medichat-frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 📄 License

This project is licensed under the **ISC License** — see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built with ❤️ for HackDays 2026

---

<div align="center">

### ⚠️ Medical Disclaimer

*HealthLens is designed for **informational purposes only**. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider with questions regarding a medical condition.*

---

**[⬆ Back to Top](#-medichat-pro)**

</div>
