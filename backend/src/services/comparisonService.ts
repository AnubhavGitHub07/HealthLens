import { GoogleGenerativeAI } from "@google/generative-ai";
import Report, { IReport } from "../models/Report";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ComparisonResult {
  overallTrend: "improving" | "stable" | "declining";
  trendSummary: string;
  improvements: string[];
  declines: string[];
  unchanged: string[];
  recommendations: string[];
}

// Get the two most recent reports for a user
export const getReportsForComparison = async (
  userId: string
): Promise<{ latest: IReport | null; previous: IReport | null }> => {
  const reports = await Report.find({ userId })
    .sort({ createdAt: -1 })
    .limit(2)
    .exec();

  return {
    latest: reports[0] || null,
    previous: reports[1] || null,
  };
};

// Compare two reports using Gemini AI
export const compareReports = async (
  latest: IReport,
  previous: IReport
): Promise<ComparisonResult> => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `You are a health trend analyst. Compare these two medical reports from the SAME patient and identify improvements, declines, and unchanged areas.

PREVIOUS REPORT (Older - Date: ${new Date(previous.createdAt).toLocaleDateString()}):
Summary: ${previous.analysis.summary}
Findings: ${JSON.stringify(previous.analysis.findings)}
Concerns: ${JSON.stringify(previous.analysis.concerns)}
Suggestions: ${JSON.stringify(previous.analysis.suggestions)}

LATEST REPORT (Newer - Date: ${new Date(latest.createdAt).toLocaleDateString()}):
Summary: ${latest.analysis.summary}
Findings: ${JSON.stringify(latest.analysis.findings)}
Concerns: ${JSON.stringify(latest.analysis.concerns)}
Suggestions: ${JSON.stringify(latest.analysis.suggestions)}

RESPOND IN THIS EXACT JSON FORMAT:
{
  "overallTrend": "improving" | "stable" | "declining",
  "trendSummary": "A 2-3 sentence plain-language summary of how the patient's health has changed between the two reports. Be specific about what improved or declined.",
  "improvements": [
    "Specific improvement 1 (e.g., 'Hemoglobin improved from low to normal range')",
    "Specific improvement 2"
  ],
  "declines": [
    "Specific decline 1 (e.g., 'Cholesterol levels have increased')",
    "Specific decline 2"
  ],
  "unchanged": [
    "Area that stayed the same 1",
    "Area that stayed the same 2"
  ],
  "recommendations": [
    "Actionable recommendation based on the trend 1",
    "Actionable recommendation based on the trend 2"
  ]
}

RULES:
- Use simple, everyday language (no medical jargon)
- Be specific — mention actual values or conditions when possible
- If data is insufficient for comparison, say so honestly
- Each array should have at least 1 item
- overallTrend should reflect the MAJORITY of changes

Return ONLY the JSON object.`;

  try {
    console.log("🔄 Comparing reports with Gemini AI...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();
    const comparison = JSON.parse(jsonText) as ComparisonResult;
    console.log("✅ Report comparison complete");
    return comparison;
  } catch (error: any) {
    console.error("❌ Comparison error:", error.message);
    throw new Error(`Failed to compare reports: ${error.message}`);
  }
};
