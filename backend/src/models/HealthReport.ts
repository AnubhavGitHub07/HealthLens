import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IHealthMetrics {
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  bloodGlucose?: number;
  cholesterol?: {
    total: number;
    ldl: number;
    hdl: number;
  };
  weight?: number;
  height?: number;
  bmi?: number;
  temperature?: number;
  respiratoryRate?: number;
  customMetrics?: Record<string, number | string>;
}

export interface IHealthReport extends Document {
  userId: Types.ObjectId;
  fileName: string;
  fileUrl: string;
  fileType: 'pdf' | 'image' | 'document';
  fileSize: number;
  extractedText?: string;
  extractedMetrics?: IHealthMetrics;
  analysisResult?: {
    summary: string;
    findings: string[];
    risks: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
    recommendations: string[];
  };
  aiAnalysis?: {
    content: string;
    tokens_used: number;
    processed_at: Date;
  };
  uploadedAt: Date;
  analyzedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const healthReportSchema = new Schema<IHealthReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: {
      type: String,
      enum: ['pdf', 'image', 'document'],
      required: true
    },
    fileSize: { type: Number, required: true },
    extractedText: String,
    extractedMetrics: {
      bloodPressure: {
        systolic: Number,
        diastolic: Number
      },
      heartRate: Number,
      bloodGlucose: Number,
      cholesterol: {
        total: Number,
        ldl: Number,
        hdl: Number
      },
      weight: Number,
      height: Number,
      bmi: Number,
      temperature: Number,
      respiratoryRate: Number,
      customMetrics: Schema.Types.Mixed
    },
    analysisResult: {
      summary: String,
      findings: [String],
      risks: [
        {
          type: String,
          severity: { type: String, enum: ['low', 'medium', 'high'] },
          description: String
        }
      ],
      recommendations: [String]
    },
    aiAnalysis: {
      content: String,
      tokens_used: Number,
      processed_at: Date
    },
    uploadedAt: { type: Date, default: Date.now },
    analyzedAt: Date
  },
  { timestamps: true }
);

// Index for faster queries
healthReportSchema.index({ userId: 1, uploadedAt: -1 });
healthReportSchema.index({ analyzedAt: 1 });

export const HealthReport = mongoose.model<IHealthReport>('HealthReport', healthReportSchema);
