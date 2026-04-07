// Analysis response structure
// Matches the backend AnalysisResponse from src/types/analysis.ts
export interface AnalysisResponse {
  summary: string;
  findings: string[];
  concerns: string[];
  suggestions: string[];
}
