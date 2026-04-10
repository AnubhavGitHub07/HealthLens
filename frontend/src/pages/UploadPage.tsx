import { useState } from "react";
import axios, { AxiosError } from "axios";
import UploadZone from "../components/custom/UploadZone";

import AnalysisResult from "../components/custom/AnalysisResult";
import type { AnalysisResponse } from "../types/analysis";
import { Clock, Lock, Zap } from "lucide-react";
import "../styles/UploadPage.css";

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setResult(null);
      setError("");

      const response = await axios.post<{ analysis: AnalysisResponse }>(
        "http://localhost:5001/api/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data.analysis);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Error uploading file";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setFile(null);
    setError("");
  };

  if (result) {
    return <AnalysisResult data={result} onNewAnalysis={handleNewAnalysis} />;
  }

  return (
    <div className="upload-page-wrapper">
      {/* Left Side - Dark Theme */}
      <div className="upload-left-section">
        <div className="upload-left-content">
          <div className="upload-badge">
            <span className="badge-icon">✨</span>
            <span>AI-Powered Medical Analysis</span>
          </div>

          <h1 className="upload-main-title">
            Upload Your Medical <span className="gradient-text">Report</span>
          </h1>

          <p className="upload-subtitle">
            Get instant AI insights about your health in seconds
          </p>

          <div className="upload-features">
            <div className="feature-item">
              <div className="feature-icon">
                <Clock size={20} />
              </div>
              <div>
                <h4>Instant Analysis</h4>
                <p>Get results in seconds</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <Lock size={20} />
              </div>
              <div>
                <h4>Secure & Private</h4>
                <p>HIPAA Compliant</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <Zap size={20} />
              </div>
              <div>
                <h4>AI-Powered</h4>
                <p>Powered by Google Gemini</p>
              </div>
            </div>
          </div>

          <div className="upload-stats">
            <div className="stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Reports Analyzed</span>
            </div>
            <div className="stat">
              <span className="stat-number">98%</span>
              <span className="stat-label">Accuracy Rate</span>
            </div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Light Theme */}
      <div className="upload-right-section">
        <div className="upload-right-content">
          <UploadZone onFileChange={handleFileChange} file={file} />

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="upload-button-primary"
          >
            {loading ? (
              <span className="button-loading">
                <span className="button-spinner"></span>
                Analyzing...
              </span>
            ) : (
              <>
                <span>Analyze Report</span>
                <span className="button-arrow">→</span>
              </>
            )}
          </button>

          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <div>
                <p className="error-title">Error</p>
                <p className="error-message">{error}</p>
              </div>
            </div>
          )}

      

          <div className="upload-info">
            <p className="info-text">
              <strong>Supported formats:</strong> PDF, JPG, PNG, DOC, DOCX
            </p>
            <p className="info-text">
              <strong>Max file size:</strong> 10MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );

};

export default UploadPage;