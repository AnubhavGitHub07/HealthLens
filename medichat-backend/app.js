import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Set up destination for file uploads
const upload = multer({ dest: "uploads/" });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Basic health routes
app.get("/", (req, res) => {
    res.status(200).send("HealthLens Backend is running 🚀");
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});

// ─── Extract text from PDF ────────────────────────────────────────────
const extractTextFromPDF = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    if (!data.text || data.text.trim().length === 0) {
        throw new Error("No text found in PDF");
    }
    return data.text.trim();
};

// ─── Gemini Analysis Route ──────────────────────────────────────────────
app.post("/api/analyze-report", upload.single("report"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No file uploaded" });
        }

        console.log(`📄 Processing file: ${req.file.originalname}`);

        let reportText = "";
        
        // Extract text if it's a PDF
        if (req.file.originalname.toLowerCase().endsWith(".pdf")) {
            reportText = await extractTextFromPDF(req.file.path);
        } else {
            return res.status(400).json({ success: false, error: "Currently only PDFs are supported in this basic route. Images require Gemini Vision." });
        }

        console.log(`📝 Extracted ${reportText.length} chars. Analyzing with Gemini...`);

        // Send to Gemini
        const prompt = `You are an expert medical report analyst. Analyze the following medical report and provide a comprehensive, patient-friendly analysis.
                        
MEDICAL REPORT:
"""
${reportText}
"""

Respond ONLY with valid JSON (no markdown fences) in this structure:
{
  "summary": "2-3 sentence overview",
  "keyFindings": [{"parameter": "Name", "value": "Value", "normalRange": "Range", "status": "normal/low/high", "explanation": "Simple meaning"}],
  "riskAssessment": {"level": "low/moderate/high", "summary": "Overall risk", "concerns": [], "positives": []},
  "actionPlan": {"immediate": [], "thirtyDays": [], "sixtyDays": [], "ninetyDays": []},
  "medications": {"current": [], "suggestions": []},
  "doctorQuestions": ["Questions to ask doctor"]
}`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Clean up formatting
        const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const analysis = JSON.parse(cleanedText);

        // Delete uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            analysis,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Clean up file if error
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("❌ Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default app;