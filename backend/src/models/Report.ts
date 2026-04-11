import mongoose, { Schema, Document } from "mongoose";

// Interface for the Report document
export interface IReport extends Document {
  userId: string;
  fileName: string;
  analysis: {
    summary: string;
    findings: string[];
    concerns: string[];
    suggestions: string[];
  };
  extractedText?: string;
  createdAt: Date;
}

// Mongoose Schema
const ReportSchema = new Schema<IReport>(
  {
    userId: {
      type: String,
      required: true,
      default: "demo-user",
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    analysis: {
      summary: { type: String, required: true },
      findings: { type: [String], default: [] },
      concerns: { type: [String], default: [] },
      suggestions: { type: [String], default: [] },
    },
    extractedText: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt automatically
  }
);

const Report = mongoose.model<IReport>("Report", ReportSchema);

export default Report;
