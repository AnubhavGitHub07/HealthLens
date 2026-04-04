import { Response } from 'express';
import axios from 'axios';
import { HealthReport, HealthMetrics } from '../models';
import { AuthRequest } from '../middleware/errorHandler';

// Gemini AI API for health analysis
const analyzeWithGemini = async (metrics: any): Promise<any> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured, using basic analysis');
      return analyzeMetricsBasic(metrics);
    }

    const metricsDescription = Object.entries(metrics)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Analyze these health metrics and provide findings, risks, and recommendations. Format your response as JSON with keys: findings (array of strings), risks (array of {type, severity, description}), recommendations (array of strings).

Metrics:
${metricsDescription}

Provide professional medical analysis. Remember this is informational only and users should consult healthcare providers.`
              }
            ]
          }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (content) {
      try {
        // Extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return {
            summary: `Health metrics analysis for ${new Date().toLocaleDateString()}`,
            findings: analysis.findings || [],
            risks: analysis.risks || [],
            recommendations: analysis.recommendations || []
          };
        }
      } catch (parseError) {
        console.warn('Could not parse Gemini response as JSON');
      }
    }

    return analyzeMetricsBasic(metrics);
  } catch (error) {
    console.error('Error calling Gemini API for analysis:', error instanceof Error ? error.message : error);
    return analyzeMetricsBasic(metrics);
  }
};

// Mock PDF parsing - replace with actual PDF parsing library
const parsePDF = async (fileUrl: string): Promise<string> => {
  // This is a placeholder - in production use pdf-parse or similar
  return 'Parsed PDF content with health metrics';
};

// Mock text extraction - replace with actual OCR/extraction
const extractHealthMetrics = async (text: string): Promise<any> => {
  const metrics: any = {};

  // Pattern matching for common health metrics
  const bpMatch = text.match(/(\d+)\/(\d+)\s*mmHg|BP:\s*(\d+)\/(\d+)/i);
  if (bpMatch) {
    metrics.bloodPressure = {
      systolic: parseInt(bpMatch[1] || bpMatch[3]),
      diastolic: parseInt(bpMatch[2] || bpMatch[4])
    };
  }

  const heartRateMatch = text.match(/(\d+)\s*bpm|heart rate:\s*(\d+)/i);
  if (heartRateMatch) {
    metrics.heartRate = parseInt(heartRateMatch[1] || heartRateMatch[2]);
  }

  const glucoseMatch = text.match(/(\d+)\s*mg\/dL|glucose:\s*(\d+)/i);
  if (glucoseMatch) {
    metrics.bloodGlucose = parseInt(glucoseMatch[1] || glucoseMatch[2]);
  }

  const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*kg|weight:\s*(\d+(?:\.\d+)?)/i);
  if (weightMatch) {
    metrics.weight = parseFloat(weightMatch[1] || weightMatch[2]);
  }

  return metrics;
};

// Basic fallback analysis without AI
const analyzeMetricsBasic = async (metrics: any): Promise<any> => {
  const findings: string[] = [];
  const risks: Array<any> = [];
  const recommendations: string[] = [];

  if (metrics.bloodPressure) {
    if (metrics.bloodPressure.systolic > 130 || metrics.bloodPressure.diastolic > 80) {
      risks.push({
        type: 'hypertension',
        severity: 'medium',
        description: 'Blood pressure reading is elevated'
      });
      recommendations.push('Consult with healthcare provider about blood pressure management');
    }
    findings.push(`Blood pressure: ${metrics.bloodPressure.systolic}/${metrics.bloodPressure.diastolic} mmHg`);
  }

  if (metrics.heartRate) {
    if (metrics.heartRate > 100 || metrics.heartRate < 60) {
      findings.push(`Heart rate: ${metrics.heartRate} bpm (outside normal range)`);
    } else {
      findings.push(`Heart rate: ${metrics.heartRate} bpm (normal)`);
    }
  }

  if (metrics.bloodGlucose) {
    if (metrics.bloodGlucose > 125) {
      risks.push({
        type: 'high-glucose',
        severity: 'medium',
        description: 'Blood glucose level is elevated'
      });
      recommendations.push('Monitor blood glucose levels and consult healthcare provider');
    }
    findings.push(`Blood glucose: ${metrics.bloodGlucose} mg/dL`);
  }

  recommendations.push('Maintain regular health checkups');
  recommendations.push('Stay hydrated and maintain healthy lifestyle');

  return {
    summary: `Report analysis for metrics collected on ${new Date().toLocaleDateString()}`,
    findings,
    risks,
    recommendations
  };
};

export class AnalyzerController {
  static async analyzeReport(req: AuthRequest, res: Response): Promise<void> {
    const { reportId } = req.params;

    const report = await HealthReport.findOne({
      _id: reportId,
      userId: req.userId
    });

    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    if (report.analysisResult) {
      res.status(200).json({
        message: 'Report already analyzed',
        report
      });
      return;
    }

    // Parse the file and extract text
    const extractedText = await parsePDF(report.fileUrl);
    report.extractedText = extractedText;

    // Extract health metrics
    const metrics = await extractHealthMetrics(extractedText);
    report.extractedMetrics = metrics;

    // Analyze metrics using Gemini AI or fallback
    const analysisResult = await analyzeWithGemini(metrics);
    report.analysisResult = analysisResult;
    report.analyzedAt = new Date();

    await report.save();

    // Update health metrics database
    let healthMetrics = await HealthMetrics.findOne({ userId: req.userId });
    if (!healthMetrics) {
      healthMetrics = new HealthMetrics({ userId: req.userId, metrics: [] });
    }

    healthMetrics.metrics.push({
      date: new Date(),
      ...metrics
    });

    healthMetrics.lastUpdated = new Date();
    await healthMetrics.save();

    res.status(200).json({
      message: 'Report analyzed successfully',
      report
    });
  }

  static async getRecommendations(req: AuthRequest, res: Response): Promise<void> {
    const { period = 'month' } = req.query;

    const daysBack = {
      'week': 7,
      'month': 30,
      'quarter': 90,
      'year': 365
    }[period as string] || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const reports = await HealthReport.find({
      userId: req.userId,
      analyzedAt: { $gte: startDate }
    });

    const allRecommendations = new Set<string>();
    const allRisks: Array<any> = [];

    reports.forEach(report => {
      if (report.analysisResult) {
        report.analysisResult.recommendations.forEach(rec => allRecommendations.add(rec));
        report.analysisResult.risks.forEach(risk => allRisks.push(risk));
      }
    });

    res.status(200).json({
      period,
      recommendations: Array.from(allRecommendations),
      risks: allRisks,
      reportCount: reports.length
    });
  }

  static async generateTrends(req: AuthRequest, res: Response): Promise<void> {
    const metrics = await HealthMetrics.findOne({ userId: req.userId });

    if (!metrics || metrics.metrics.length < 2) {
      res.status(400).json({ message: 'Insufficient data for trend analysis' });
      return;
    }

    // Calculate trends
    const recentMetrics = metrics.metrics.slice(-10);
    const olderMetrics = metrics.metrics.slice(-20, -10);

    const calculateTrend = (key: string) => {
      const recentValues = recentMetrics
        .map((m: any) => m[key])
        .filter((v: any) => v !== undefined);
      const olderValues = olderMetrics
        .map((m: any) => m[key])
        .filter((v: any) => v !== undefined);

      if (recentValues.length === 0 || olderValues.length === 0) return null;

      const recentAvg = recentValues.reduce((a: number, b: number) => a + b, 0) / recentValues.length;
      const olderAvg = olderValues.reduce((a: number, b: number) => a + b, 0) / olderValues.length;
      const change = ((recentAvg - olderAvg) / olderAvg) * 100;

      return {
        trend: change > 2 ? 'worsening' : change < -2 ? 'improving' : 'stable',
        change: parseFloat(change.toFixed(2))
      };
    };

    const trends = {
      heartRate: calculateTrend('heartRate'),
      weight: calculateTrend('weight'),
      bloodGlucose: calculateTrend('bloodGlucose')
    };

    res.status(200).json({ trends });
  }

  static async getHealthScore(req: AuthRequest, res: Response): Promise<void> {
    const metrics = await HealthMetrics.findOne({ userId: req.userId });

    if (!metrics || metrics.metrics.length === 0) {
      res.status(400).json({ message: 'No health data available' });
      return;
    }

    // Calculate health score based on latest metrics
    const latest = metrics.metrics[metrics.metrics.length - 1];
    let score = 100;

    if (latest.bloodPressure) {
      if (latest.bloodPressure.systolic > 130 || latest.bloodPressure.diastolic > 80) score -= 20;
    }

    if (latest.heartRate) {
      if (latest.heartRate > 100 || latest.heartRate < 60) score -= 15;
    }

    if (latest.bloodGlucose) {
      if (latest.bloodGlucose > 125) score -= 20;
    }

    if (latest.sleepHours && latest.sleepHours < 6) score -= 10;
    if (latest.steps && latest.steps < 5000) score -= 10;

    score = Math.max(0, score);

    res.status(200).json({
      healthScore: score,
      status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs attention',
      lastUpdated: latest.date
    });
  }
}
