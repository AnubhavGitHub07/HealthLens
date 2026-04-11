import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResponse } from "../types/analysis";

// Debug: Check if API key is loaded
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set in environment variables!");
} else {
  console.log("✅ GEMINI_API_KEY is loaded (length:", process.env.GEMINI_API_KEY.length, ")");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRY_DELAY = 30000; // 30 seconds

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const calculateBackoffDelay = (attemptNumber: number): number => {
  // Exponential backoff with jitter
  const exponentialDelay = INITIAL_RETRY_DELAY * Math.pow(2, attemptNumber - 1);
  const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5);
  return Math.min(jitteredDelay, MAX_RETRY_DELAY);
};

export const analyzeMedicalReport = async (text: string): Promise<AnalysisResponse> => {
  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${MAX_RETRIES} to analyze report...`);

      // Using gemini-1.5-flash with JSON mode
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      const prompt = `You are a friendly health report translator who helps people without medical training understand their medical reports. Your job is to explain medical findings in simple, everyday language while keeping the information accurate.

IMPORTANT GUIDELINES:
1. Use simple, everyday language instead of medical jargon
2. When you must use medical terms, ALWAYS explain them in parentheses using simple words
3. Focus on what the findings MEAN for the patient's health, not just what the numbers are
4. Use practical examples when helpful
5. Be encouraging and positive while being honest about concerns
6. Structure everything as clear, easy-to-read bullet points

FORMAT YOUR RESPONSE AS A VALID JSON OBJECT WITH THIS EXACT STRUCTURE:
{
  "summary": "Write 2-3 sentences in simple language explaining what this medical report is about and the main takeaway. Start with 'This report shows...' or 'Based on this test...'",
  "findings": [
    "What this finding is: [SIMPLE EXPLANATION]",
    "What the numbers mean: [EXPLAIN IN EVERYDAY TERMS]",
    "Is this good or concerning?: [CLEAR ANSWER]"
  ],
  "concerns": [
    "CONCERN: [Simple name of what to watch out for]",
    "Why it matters: [Explain in simple terms why this is important]",
    "What should I know?: [Practical information they need]"
  ],
  "suggestions": [
    "LIFESTYLE: [Specific, actionable suggestion they can do today]",
    "DIET: [Simple food-related suggestions]",
    "ACTIVITY: [Exercise or movement suggestions]",
    "NEXT STEPS: [Who to see and when - be specific]",
    "TIMELINE: [When to follow up or when to expect improvement]"
  ]
}

TONE GUIDELINES:
- Write like you're explaining to a friend, not a doctor
- Be honest but encouraging
- Avoid saying 'abnormal' or 'abnormality' - instead say 'higher than ideal' or 'lower than expected'
- Replace medical terms with simple ones:
  * 'lipid panel' → 'cholesterol and fat levels'
  * 'glucose' → 'blood sugar'
  * 'hypertension' → 'high blood pressure'
  * 'cardiovascular' → 'heart and blood vessels'
  * 'inflammatory markers' → 'signs of inflammation (body swelling or irritation)'

STRUCTURE EACH ITEM AS:
[SIMPLE NAME]: [What it means in everyday terms and what to do about it]

Medical Report to Analyze:
${text}

CRITICAL: Return ONLY the JSON object. Use simple words. Focus on helping someone understand what their results mean for their daily life.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // Parse the JSON response
      const jsonText = response.text();
      const payload = JSON.parse(jsonText) as AnalysisResponse;
      
      console.log("✅ Successfully analyzed report on attempt", attempt);
      return payload;

    } catch (error: any) {
      lastError = error;
      
      console.error(`❌ Attempt ${attempt} failed:`, {
        message: error.message,
        status: error.status,
        code: error.code,
      });

      // Check if it's a 503 Service Unavailable or rate limit error
      const isServiceError = error.status === 503 || error.code === 'SERVICE_UNAVAILABLE' || error.message?.includes('503') || error.message?.includes('high demand');
      const isRateLimited = error.status === 429 || error.code === 'RATE_LIMIT_EXCEEDED';

      // If it's a service unavailable or rate limit error AND we have retries left, wait and retry
      if ((isServiceError || isRateLimited) && attempt < MAX_RETRIES) {
        const waitTime = calculateBackoffDelay(attempt);
        console.log(`⏳ Waiting ${waitTime}ms before retry ${attempt + 1}...`);
        await delay(waitTime);
        continue;
      }

      // If it's a different error or last attempt, throw it
      if (attempt === MAX_RETRIES) {
        break; // Exit loop to throw error below
      }
    }
  }

  // If we've exhausted all retries, throw the last error
  console.error("🔴 Gemini API Error - Max retries exceeded:", {
    message: lastError.message,
    status: lastError.status,
    code: lastError.code,
    apiKey: process.env.GEMINI_API_KEY ? "Set" : "NOT SET",
    apiKeyLength: process.env.GEMINI_API_KEY?.length
  });
  
  throw new Error(
    `Error analyzing report with Gemini after ${MAX_RETRIES} attempts: ${lastError.message}. ` +
    `The AI service is currently experiencing high demand. Please try again in a few moments.`
  );
};