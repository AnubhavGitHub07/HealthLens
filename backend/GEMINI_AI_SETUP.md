# Gemini AI Integration Guide

## 🤖 Overview

HealthLens now integrates **Google Gemini AI** for:
1. **Health Chat**: AI-powered health consultations and Q&A
2. **Report Analysis**: Intelligent analysis of health metrics and recommendations
3. **Personalized Insights**: Contextual health guidance based on user data

---

## 📋 Setup Instructions

### Step 1: Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API key"
3. Select or create a Google Cloud project
4. Copy your API key

### Step 2: Add API Key to `.env`

Edit `.env` file in the `backend` directory:

```env
GEMINI_API_KEY=your-actual-gemini-api-key-here
```

**⚠️ Important**: 
- Never commit `.env` file to version control
- Keep your API key secret
- Regenerate if accidentally exposed

### Step 3: Install Dependencies

```bash
cd backend
npm install
```

The axios library (already in package.json) is used for API calls.

---

## 🔌 API Endpoints Using Gemini

### 1. Health Chat Endpoint

**Endpoint**: `POST /api/chat/message`

**Request**:
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What does it mean if my blood pressure is 140/90?",
    "reportId": "optional-report-id"
  }'
```

**Response**:
```json
{
  "message": "Chat message processed",
  "chat": {
    "id": "chat_id",
    "userMessage": "What does it mean if my blood pressure is 140/90?",
    "aiResponse": "A blood pressure reading of 140/90 mmHg is considered Stage 2 Hypertension and may require medical attention. Here's what you should know...",
    "context": {
      "reportId": "optional-report-id",
      "topic": "health-analysis"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Report Analysis Endpoint

**Endpoint**: `POST /api/analyzer/:reportId/analyze`

**Request**:
```bash
curl -X POST http://localhost:5000/api/analyzer/report-id-here/analyze \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "message": "Report analyzed successfully",
  "report": {
    "id": "report_id",
    "extractedMetrics": {
      "bloodPressure": { "systolic": 140, "diastolic": 90 },
      "heartRate": 85,
      "weight": 78.5
    },
    "analysisResult": {
      "summary": "Health metrics analysis for 1/15/2024",
      "findings": [
        "Blood pressure is elevated (140/90 mmHg)",
        "Heart rate is slightly elevated at 85 bpm"
      ],
      "risks": [
        {
          "type": "hypertension",
          "severity": "high",
          "description": "Blood pressure reading is significantly elevated"
        }
      ],
      "recommendations": [
        "Schedule an appointment with your doctor",
        "Monitor blood pressure daily",
        "Reduce sodium intake",
        "Increase physical activity"
      ]
    },
    "analyzedAt": "2024-01-15T10:35:00Z"
  }
}
```

### 3. Get Recommendations Endpoint

**Endpoint**: `GET /api/analyzer/recommendations?period=month`

Uses Gemini to provide personalized recommendations based on historical data.

---

## 🎯 How Gemini AI is Used

### Chat Messages
When users ask health questions:
1. Message is sent to Gemini API
2. Prompt includes context (health topic, medical focus)
3. AI generates personalized, health-focused response
4. Response stored in database for history

**System Prompt**:
```
You are a helpful health information assistant. A user is asking about their health 
metrics or medical report. Provide clear, accurate, and compassionate responses. 
Always remind them to consult with healthcare professionals for medical advice.
```

### Report Analysis
When analyzing health reports:
1. Extracted metrics sent to Gemini API
2. AI analyzes metrics and generates findings
3. Identifies potential health risks
4. Provides personalized recommendations
5. Results stored with report

**Analysis Prompt**:
```
Analyze these health metrics and provide findings, risks, and recommendations. 
Format your response as JSON with keys: findings (array), risks (array), recommendations (array).
Provide professional medical analysis. Remember this is informational only.
```

---

## 🛡️ Safety & Compliance

### Data Handling
- Only essential health metrics sent to Gemini
- No personally identifiable information (PII) included
- Responses processed and stored locally
- User data remains in your MongoDB database

### Medical Disclaimer
All AI responses include:
- Reminder to consult healthcare professionals
- Statement that analysis is informational only
- Encouragement to seek professional medical advice

### API Limits
- **Free Tier**: 60 requests per minute
- **Paid Tier**: Higher limits available
- Rate limiting applied at backend: 100 req/15min global

---

## 🔄 Fallback System

If Gemini API is unavailable:
1. System logs the error
2. Fallback responses provided
3. Basic health information given
4. Users prompted to try again

### Fallback Examples
- Blood pressure questions → standard ranges
- Heart rate questions → normal values
- Weight questions → general guidance
- Medication questions → consult doctor message

---

## 🧪 Testing Gemini Integration

### Test Chat Message

```bash
# 1. Get auth token (signup/login first)
TOKEN=your-jwt-token

# 2. Send test message
curl -X POST http://localhost:5000/api/chat/message \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is a healthy heart rate?"
  }'
```

### Test Report Analysis

```bash
# Upload a report first
curl -X POST http://localhost:5000/api/reports/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/report.pdf" \
  -F "fileName=My Report"

# Then analyze it (use reportId from upload response)
curl -X POST http://localhost:5000/api/analyzer/report-id/analyze \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Monitoring Gemini Usage

### API Call Logging
Check your Node.js console for:
- Successful API calls
- Response times
- Error messages if API fails

### Database Tracking
Each chat message stores:
- `tokens_used`: Token count for Gemini calls
- `createdAt`: Timestamp
- Response content for history

### Google Cloud Console
Monitor usage at [Google Cloud Console](https://console.cloud.google.com/):
1. Select your project
2. Go to Generative Language API
3. View quota and usage statistics

---

## ⚙️ Configuration Options

### Environment Variables

```env
# Required
GEMINI_API_KEY=your-api-key

# Optional (defaults shown)
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/healthlens
```

### Gemini Model Options

Current implementation uses: **gemini-1.5-flash**

Other available models:
- `gemini-1.5-pro` - More powerful, higher latency
- `gemini-1.0-pro` - Previous version
- `gemini-1.5-flash` - Default (balanced, fast)

To change model, edit:
- `ChatController.ts` line 18
- `AnalyzerController.ts` line 21

Replace: `gemini-1.5-flash:generateContent` with desired model

---

## 🐛 Troubleshooting

### Error: "GEMINI_API_KEY not configured"
**Solution**: 
- Add `GEMINI_API_KEY` to `.env` file
- Restart server: `npm run dev`
- Verify key format (should start with "AI")

### Error: "Invalid API key"
**Solution**:
- Check API key is correct in `.env`
- Verify key is active in Google AI Studio
- Try regenerating key if old

### Error: "Quota exceeded"
**Solution**:
- Check usage in Google Cloud Console
- Wait for quota reset (typically monthly)
- Consider upgrading to paid plan
- Fallback responses will be used automatically

### Gemini not responding
**Solution**:
- Check internet connection
- Verify API key is valid
- Check Google Gemini API status
- Fallback responses used automatically
- Try again after 1 minute

### "Could not parse Gemini response"
**Solution**:
- This is handled gracefully with fallback
- Check API key permissions
- Review console logs for details
- May occur with complex requests

---

## 📈 Performance Optimization

### API Call Caching
Gemini API calls are made on every message/analysis.

To optimize (future enhancement):
- Cache similar queries
- Rate limit per user
- Batch multiple requests

### Token Usage
Monitor token consumption:
- Chat messages: ~50-200 tokens each
- Report analysis: ~100-500 tokens each
- Free tier includes generous daily limits

---

## 🔒 Security Considerations

### API Key Protection
- ✅ Stored in `.env` (not in code)
- ✅ Never logged or exposed
- ✅ Removed from version control
- ❌ Never commit `.env` file

### Data Privacy
- Only health metrics sent (no PHI)
- No user identification data
- Responses processed server-side
- Data stored in your database

### Rate Limiting
- 100 requests per 15 minutes (global)
- 5 requests per 15 minutes (auth endpoints)
- Per-user rate limiting can be added

---

## 📚 API Documentation

### Gemini API Response Format

**Typical Response**:
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Response text from Gemini..."
          }
        ]
      }
    }
  ]
}
```

**Error Response**:
```json
{
  "error": {
    "code": 400,
    "message": "Invalid API key",
    "status": "INVALID_ARGUMENT"
  }
}
```

### Rate Limits

| Plan | Requests/min | Requests/day |
|------|------------|------------|
| Free | 60 | 1,500 |
| Paid | Higher | Negotiable |

---

## 🚀 Production Deployment

### Before Going Live
- [ ] Test Gemini integration thoroughly
- [ ] Set up monitoring and logging
- [ ] Configure production API key
- [ ] Enable HTTPS only
- [ ] Set up error tracking (Sentry/etc)
- [ ] Load test rate limits
- [ ] Review data privacy
- [ ] Backup API key securely

### Deployment Checklist
```bash
# 1. Set production environment
NODE_ENV=production

# 2. Use strong API key
GEMINI_API_KEY=production-api-key

# 3. Enable monitoring
npm run build
npm start

# 4. Monitor logs
tail -f logs/production.log
```

---

## 🔗 Useful Links

- [Google AI Studio](https://aistudio.google.com/app/apikey)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Gemini Models Reference](https://ai.google.dev/models)

---

## 💬 Support & Questions

### Common Questions

**Q: How many API calls does each action make?**
A: 
- Chat message: 1 call
- Report analysis: 1 call
- Get recommendations: 0 calls (uses existing analyses)

**Q: Can I use Gemini without an API key?**
A: Yes, fallback responses will be used but with less personalization.

**Q: Is my health data sent to Google?**
A: Only health metrics are sent (no personal identifiers). Review privacy terms.

**Q: Can I switch AI models?**
A: Yes, update the model name in `ChatController.ts` and `AnalyzerController.ts`.

**Q: What if API is down?**
A: Fallback responses provide basic health information.

---

## 📝 Next Steps

1. ✅ Get Gemini API key from Google AI Studio
2. ✅ Add `GEMINI_API_KEY` to `.env` file
3. ✅ Run `npm install` to ensure dependencies
4. ✅ Start server: `npm run dev`
5. ✅ Test chat endpoint with curl
6. ✅ Test report analysis
7. ✅ Monitor usage in Google Cloud Console
8. ✅ Deploy to production when ready

---

**Happy analyzing! 🎉**

Last Updated: January 2024
