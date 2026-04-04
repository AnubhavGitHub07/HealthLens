import { Response } from 'express';
import { HealthReport } from '../models';
import { AuthRequest } from '../middleware/errorHandler';
import { validationResult } from 'express-validator';

export class ReportController {
  static async uploadReport(req: AuthRequest, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No file provided' });
      return;
    }

    const { fileName, fileType } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;

    const report = new HealthReport({
      userId: req.userId,
      fileName: fileName || req.file.originalname,
      fileUrl,
      fileType: fileType || 'document',
      fileSize: req.file.size,
      uploadedAt: new Date()
    });

    await report.save();

    res.status(201).json({
      message: 'Report uploaded successfully',
      report
    });
  }

  static async listReports(req: AuthRequest, res: Response): Promise<void> {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    const reports = await HealthReport.find({ userId: req.userId })
      .sort({ uploadedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await HealthReport.countDocuments({ userId: req.userId });

    res.status(200).json({
      reports,
      pagination: {
        current: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  }

  static async getReport(req: AuthRequest, res: Response): Promise<void> {
    const { reportId } = req.params;

    const report = await HealthReport.findOne({
      _id: reportId,
      userId: req.userId
    });

    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    res.status(200).json({ report });
  }

  static async updateReport(req: AuthRequest, res: Response): Promise<void> {
    const { reportId } = req.params;
    const { extractedMetrics, analysisResult } = req.body;

    const report = await HealthReport.findOneAndUpdate(
      { _id: reportId, userId: req.userId },
      {
        extractedMetrics,
        analysisResult,
        analyzedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    res.status(200).json({
      message: 'Report updated successfully',
      report
    });
  }

  static async deleteReport(req: AuthRequest, res: Response): Promise<void> {
    const { reportId } = req.params;

    const report = await HealthReport.findOneAndDelete({
      _id: reportId,
      userId: req.userId
    });

    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    res.status(200).json({ message: 'Report deleted successfully' });
  }

  static async getAnalysisResult(req: AuthRequest, res: Response): Promise<void> {
    const { reportId } = req.params;

    const report = await HealthReport.findOne({
      _id: reportId,
      userId: req.userId
    });

    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    if (!report.analysisResult) {
      res.status(400).json({ message: 'Report has not been analyzed yet' });
      return;
    }

    res.status(200).json({ analysisResult: report.analysisResult });
  }
}
