import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResponse } from "../types/analysis";

// Debug: Check if API key is loaded
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set in environment variables!");
} else {
  console.log("✅ GEMINI_API_KEY is loaded (length:", process.env.GEMINI_API_KEY.length, ")");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const analyzeMedicalReport = async (text: string): Promise<AnalysisResponse> => {
  try {
    // Using gemini-2.5-flash with JSON mode
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `You are an expert medical AI assistant specializing in health report analysis. Your role is to provide comprehensive, accurate, and actionable insights from medical documents.

ANALYSIS TASK:
Analyze the following medical report with precision and clarity. Focus on extracting the most relevant and actionable information for the patient.

FORMAT YOUR RESPONSE AS A VALID JSON OBJECT EXACTLY MATCHING THIS STRUCTURE:
{
  "summary": "Provide a concise overview of the report in 2-3 sentences, highlighting the most important findings.",
  "findings": [
    "List all significant findings with clinical relevance, including normal ranges and actual values where applicable. Highlight any abnormalities or areas of concern"
  ],
  "concerns": [
    "Identify potential health risks based on the findings, rate severity, and explain clinical significance."
  ],
  "suggestions": [
    "Immediate recommendations like lifestyle modifications, dietary suggestions, and when to follow up with healthcare providers. Professional next steps like recommended specialists or additional tests."
  ]
}

Medical Report to Analyze:
${text}

IMPORTANT: Be empathetic, clear, and avoid medical jargon where possible. If jargon is necessary, explain it. Provide actionable, evidence-based suggestions in the arrays. Return ONLY the JSON object.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Parse the JSON response
    const jsonText = response.text();
    const payload = JSON.parse(jsonText) as AnalysisResponse;
    return payload;

  } catch (error: any) {
    console.error("🔴 Gemini API Error Details:", {
      message: error.message,
      status: error.status,
      code: error.code,
      apiKey: process.env.GEMINI_API_KEY ? "Set" : "NOT SET",
      apiKeyLength: process.env.GEMINI_API_KEY?.length
    });
    throw new Error("Error analyzing report with Gemini: " + error.message);
  }
};