import Report, { IReport } from "../models/Report";

// Save a new report after analysis
export const saveReport = async (
  userId: string,
  fileName: string,
  analysis: {
    summary: string;
    findings: string[];
    concerns: string[];
    suggestions: string[];
  },
  extractedText?: string
): Promise<IReport> => {
  const report = new Report({
    userId,
    fileName,
    analysis,
    extractedText: extractedText || "",
  });

  const savedReport = await report.save();
  console.log(`✅ Report saved to DB: ${savedReport._id}`);
  return savedReport;
};

// Get all reports for a user (newest first)
export const getReportsByUser = async (userId: string): Promise<IReport[]> => {
  const reports = await Report.find({ userId })
    .sort({ createdAt: -1 })
    .select("-extractedText") // Exclude large text field for listing
    .exec();

  return reports;
};

// Get the latest report for a user
export const getLatestReport = async (userId: string): Promise<IReport | null> => {
  const report = await Report.findOne({ userId })
    .sort({ createdAt: -1 })
    .exec();

  return report;
};
