import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChatMessage extends Document {
  userId: Types.ObjectId;
  userMessage: string;
  aiResponse: string;
  context?: {
    reportId?: Types.ObjectId;
    topic?: string;
    severity?: 'low' | 'medium' | 'high';
  };
  feedback?: {
    rating: number; // 1-5
    isHelpful: boolean;
    comment?: string;
  };
  tokens_used?: {
    prompt: number;
    completion: number;
    total: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    userMessage: { type: String, required: true },
    aiResponse: { type: String, required: true },
    context: {
      reportId: {
        type: Schema.Types.ObjectId,
        ref: 'HealthReport'
      },
      topic: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      isHelpful: Boolean,
      comment: String
    },
    tokens_used: {
      prompt: Number,
      completion: Number,
      total: Number
    }
  },
  { timestamps: true }
);

// Index for faster queries
chatMessageSchema.index({ userId: 1, createdAt: -1 });
chatMessageSchema.index({ 'context.reportId': 1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
