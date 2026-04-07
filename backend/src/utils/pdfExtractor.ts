import fs from "fs";
import pdfParse from "pdf-parse";

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    return data.text;
  } catch (error: any) {
    console.error("PDF extraction error:", error);
    throw new Error(error.message || "Error extracting text from PDF");
  }
};