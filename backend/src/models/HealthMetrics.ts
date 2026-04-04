import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMetricEntry {
  date: Date;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  bloodGlucose?: number;
  weight?: number;
  steps?: number;
  sleepHours?: number;
  stressLevel?: number;
  customMetrics?: Record<string, number>;
}

export interface IHealthMetricsDoc extends Document {
  userId: Types.ObjectId;
  metrics: IMetricEntry[];
  trends?: {
    bloodPressure?: {
      trend: 'improving' | 'stable' | 'worsening';
      change: number;
    };
    weight?: {
      trend: 'improving' | 'stable' | 'worsening';
      change: number;
    };
    heartRate?: {
      trend: 'improving' | 'stable' | 'worsening';
      change: number;
    };
  };
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const metricEntrySchema = new Schema<IMetricEntry>(
  {
    date: { type: Date, required: true },
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    bloodGlucose: Number,
    weight: Number,
    steps: Number,
    sleepHours: Number,
    stressLevel: Number,
    customMetrics: Schema.Types.Mixed
  },
  { _id: false }
);

const healthMetricsSchema = new Schema<IHealthMetricsDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    metrics: [metricEntrySchema],
    trends: {
      bloodPressure: {
        trend: { type: String, enum: ['improving', 'stable', 'worsening'] },
        change: Number
      },
      weight: {
        trend: { type: String, enum: ['improving', 'stable', 'worsening'] },
        change: Number
      },
      heartRate: {
        trend: { type: String, enum: ['improving', 'stable', 'worsening'] },
        change: Number
      }
    },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Index for efficient queries
healthMetricsSchema.index({ userId: 1, 'metrics.date': -1 });

export const HealthMetrics = mongoose.model<IHealthMetricsDoc>('HealthMetrics', healthMetricsSchema);
