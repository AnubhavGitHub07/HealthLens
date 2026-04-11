import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Activity,
  TrendingUp,
  Upload,
} from "lucide-react";
import "../styles/HistoryPage.css";
import { useAuth } from "../context/AuthContext";

interface ReportAnalysis {
  summary: string;
  findings: string[];
  concerns: string[];
  suggestions: string[];
}

interface Report {
  _id: string;
  userId: string;
  fileName: string;
  analysis: ReportAnalysis;
  createdAt: string;
}

export default function HistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5001/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data.reports || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const truncateSummary = (summary: string, maxLength = 140) => {
    if (summary.length <= maxLength) return summary;
    return summary.substring(0, maxLength).trim() + "...";
  };

  // Loading state
  if (loading) {
    return (
      <div className="history-page">
        <div className="history-loading">
          <div className="history-loading-spinner" />
          <p>Loading your report history...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="history-page">
        <div className="history-empty">
          <div className="history-empty-icon">
            <AlertTriangle size={36} />
          </div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="history-empty-btn" onClick={fetchReports}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      {/* Top Bar */}
      <div className="history-topbar">
        <div className="history-topbar-left">
          <button className="history-back-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={18} />
          </button>
          <span className="history-topbar-title">Report History</span>
        </div>
        <div className="history-topbar-right">
          <span className="history-badge">
            {reports.length} {reports.length === 1 ? "Report" : "Reports"}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="history-content">
        {/* Header */}
        <div className="history-header">
          <h1>
            Your Medical <span>Reports</span>
          </h1>
          <p>Track your health journey with AI-analyzed reports over time.</p>
        </div>

        {reports.length === 0 ? (
          /* Empty State */
          <div className="history-empty">
            <div className="history-empty-icon">
              <FileText size={36} />
            </div>
            <h3>No reports yet</h3>
            <p>Upload your first medical report to start tracking your health journey.</p>
            <button className="history-empty-btn" onClick={() => navigate("/upload")}>
              <Upload size={18} />
              Upload Report
            </button>
          </div>
        ) : (
          <>
            {/* Stats Strip */}
            <div className="history-stats">
              <div className="history-stat-card">
                <div className="history-stat-icon total">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="history-stat-value">{reports.length}</div>
                  <div className="history-stat-label">Total Reports</div>
                </div>
              </div>
              <div className="history-stat-card">
                <div className="history-stat-icon latest">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="history-stat-value">
                    {getTimeAgo(reports[0].createdAt)}
                  </div>
                  <div className="history-stat-label">Latest Report</div>
                </div>
              </div>
              <div className="history-stat-card">
                <div className="history-stat-icon trend">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div className="history-stat-value">
                    {reports.reduce((sum, r) => sum + r.analysis.findings.length, 0)}
                  </div>
                  <div className="history-stat-label">Total Findings</div>
                </div>
              </div>
            </div>

            {/* Report Cards */}
            <div className="history-list">
              {reports.map((report, index) => (
                <div
                  key={report._id}
                  className="history-report-card"
                  style={{ animationDelay: `${index * 0.06}s` }}
                  onClick={() => navigate(`/upload`)} // TODO: navigate to detail view
                >
                  {/* Top Row */}
                  <div className="report-card-top">
                    <div className="report-card-meta">
                      <span className="report-file-name">{report.fileName}</span>
                      <span className="report-date">
                        <Clock size={13} />
                        {formatDate(report.createdAt)} at {formatTime(report.createdAt)}
                      </span>
                    </div>
                    <div className="report-card-badges">
                      <span className="report-count-badge badge-findings">
                        <CheckCircle size={11} /> {report.analysis.findings.length} findings
                      </span>
                      {report.analysis.concerns.length > 0 && (
                        <span className="report-count-badge badge-concerns">
                          <AlertTriangle size={11} /> {report.analysis.concerns.length} concerns
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="report-summary">
                    {truncateSummary(report.analysis.summary)}
                  </p>

                  {/* Footer */}
                  <div className="report-card-footer">
                    <div className="report-insights-strip">
                      <span className="insight-mini">
                        <Activity size={13} />
                        <span>{report.analysis.findings.length}</span> findings
                      </span>
                      <span className="insight-mini">
                        <AlertTriangle size={13} />
                        <span>{report.analysis.concerns.length}</span> concerns
                      </span>
                      <span className="insight-mini">
                        <CheckCircle size={13} />
                        <span>{report.analysis.suggestions.length}</span> suggestions
                      </span>
                    </div>
                    <span className="report-view-btn">
                      View Details <ChevronRight size={15} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
