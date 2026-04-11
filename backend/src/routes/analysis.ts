import express from "express";
import { upload } from "../middleware/fileUpload";
import multer from "multer";
import { extractTextFromPDF } from "../utils/pdfExtractor";
import path from "path";
import { analyzeMedicalReport } from "../utils/geminiAnalyzer";
import fs from "fs";
import { saveReport, getReportsByUser, getLatestReport } from "../services/reportService";
import { getReportsForComparison, compareReports } from "../services/comparisonService";
import authMiddleware from "../middleware/auth";

const router = express.Router();

// POST /api/analyze-report
router.post("/analyze-report", (req: any, res: any, next: any) => {
  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size exceeds 10MB limit"
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "File upload error"
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload error"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    res.status(200).json({
      success: true,
      message: "File uploaded successfully ✅",
      file: req.file.filename
    });
  });
});

// POST /api/extract-text - Extract text from uploaded PDF
router.post("/extract-text", (req: any, res: any, next: any) => {
  upload(req, res, async (err: any) => {
    const filePath = req.file ? path.join(process.cwd(), `uploads/${req.file.filename}`) : null;
    
    try {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size exceeds 10MB limit"
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error"
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error"
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const extractedText = await extractTextFromPDF(filePath!);

      res.status(200).json({
        success: true,
        message: "Text extracted successfully ✅",
        text: extractedText.substring(0, 500) // preview
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    } finally {
      // Delete the uploaded file after processing
      if (filePath && fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${filePath}:`, err);
          } else {
            console.log(`✅ File deleted: ${filePath}`);
          }
        });
      }
    }
  });
});

// POST /api/analyze - Full analysis: Extract text + AI analysis (PROTECTED)
router.post("/analyze", authMiddleware, (req: any, res: any, next: any) => {
  upload(req, res, async (err: any) => {
    const filePath = req.file ? path.join(process.cwd(), `uploads/${req.file.filename}`) : null;
    
    try {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size exceeds 10MB limit"
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error"
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error"
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const extractedText = await extractTextFromPDF(filePath!);

      // Limit text size to 50,000 characters to avoid token limits
      const MAX_TEXT_LENGTH = 50000;
      const limitedText = extractedText.length > MAX_TEXT_LENGTH 
        ? extractedText.substring(0, MAX_TEXT_LENGTH) + "\n\n[Text truncated due to length]"
        : extractedText;

      const analysis = await analyzeMedicalReport(limitedText);

      // Sanitize: Gemini sometimes returns objects instead of strings in arrays
      const flattenItem = (item: any): string => {
        if (typeof item === "string") return item;
        if (typeof item === "object" && item !== null) {
          return Object.values(item).join(" — ");
        }
        return String(item);
      };

      const sanitizedAnalysis = {
        summary: typeof analysis.summary === "string" ? analysis.summary : String(analysis.summary),
        findings: (analysis.findings || []).map(flattenItem),
        concerns: (analysis.concerns || []).map(flattenItem),
        suggestions: (analysis.suggestions || []).map(flattenItem),
      };

      // Save report to MongoDB
      const savedReport = await saveReport(
        req.user.id,
        req.file.originalname,
        sanitizedAnalysis,
        limitedText
      );

      console.log(`📄 Report saved with ID: ${savedReport._id}`);

      res.status(200).json({
        success: true,
        message: "Analysis complete ✅",
        analysis: sanitizedAnalysis,
        reportId: savedReport._id,
        stats: {
          originalTextLength: extractedText.length,
          processedTextLength: limitedText.length
        }
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    } finally {
      // Delete the uploaded file after processing
      if (filePath && fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${filePath}:`, err);
          } else {
            console.log(`✅ File deleted: ${filePath}`);
          }
        });
      }
    }
  });
});

// GET /api/reports - Get all reports for a user (PROTECTED)
router.get("/reports", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const reports = await getReportsByUser(userId);

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching reports",
    });
  }
});

// GET /api/reports/latest - Get the latest report for a user (PROTECTED)
router.get("/reports/latest", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const report = await getLatestReport(userId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "No reports found for this user",
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching latest report",
    });
  }
});

// GET /api/reports/compare - Compare latest two reports (PROTECTED)
router.get("/reports/compare", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { latest, previous } = await getReportsForComparison(userId);

    if (!latest) {
      return res.status(404).json({
        success: false,
        message: "No reports found. Upload at least one report first.",
      });
    }

    if (!previous) {
      return res.status(200).json({
        success: true,
        message: "Only one report found. Upload another report to see comparison.",
        comparison: null,
        reportsCount: 1,
      });
    }

    const comparison = await compareReports(latest, previous);

    res.status(200).json({
      success: true,
      comparison,
      latestReportDate: latest.createdAt,
      previousReportDate: previous.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error comparing reports",
    });
  }
});

export default router;