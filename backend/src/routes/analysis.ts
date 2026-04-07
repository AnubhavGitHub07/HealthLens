import express from "express";
import { upload } from "../middleware/fileUpload";
import multer from "multer";
import { extractTextFromPDF } from "../utils/pdfExtractor";
import path from "path";
import { analyzeMedicalReport } from "../utils/geminiAnalyzer";
import fs from "fs";




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

// POST /api/analyze - Full analysis: Extract text + AI analysis
router.post("/analyze", (req: any, res: any, next: any) => {
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

      res.status(200).json({
        success: true,
        message: "Analysis complete ✅",
        analysis,
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

export default router;