import { FileText, AlertTriangle, Lightbulb, CheckCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { AnalysisResponse } from "../../types/analysis";
import "../../styles/AnalysisResult.css";

interface AnalysisResultProps {
  data: AnalysisResponse;
}

const cardConfig = {
  findings: {
    label: "Key Findings",
    icon: CheckCircle,
    accent: "#1D9E75",
    bg: "#E1F5EE",
    text: "#0F6E56",
    badge: "#9FE1CB",
  },
  concerns: {
    label: "Health Concerns",
    icon: AlertTriangle,
    accent: "#BA7517",
    bg: "#FAEEDA",
    text: "#854F0B",
    badge: "#FAC775",
  },
  suggestions: {
    label: "Recommendations",
    icon: Lightbulb,
    accent: "#534AB7",
    bg: "#EEEDFE",
    text: "#3C3489",
    badge: "#CECBF6",
  },
} as const;

type CardKey = keyof typeof cardConfig;

const PREVIEW_COUNT = 4;

// Convert summary text to bullet points
const convertSummaryToPoints = (summary: string): string[] => {
  // Split by periods, newlines, and clean up
  const sentences = summary
    .split(/[.\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10); // Only keep meaningful sentences
  
  // Group into key points (max 5)
  return sentences.slice(0, 5);
};

const ExpandableCard = ({
  cardKey,
  items,
}: {
  cardKey: CardKey;
  items: string[];
}) => {
  const [expanded, setExpanded] = useState(false);
  const config = cardConfig[cardKey];
  const Icon = config.icon;
  const visible = expanded ? items : items.slice(0, PREVIEW_COUNT);
  const hasMore = items.length > PREVIEW_COUNT;

  return (
    <div className="analysis-detail-card">
      <div className="card-stripe" style={{ background: config.accent }} />
      
      <div className="card-header">
        <div className="header-icon" style={{ background: config.bg }}>
          <Icon size={16} style={{ color: config.accent }} />
        </div>
        <div className="header-info">
          <h3 className="card-title">{config.label}</h3>
          <p className="card-count">{items.length} {items.length === 1 ? "item" : "items"}</p>
        </div>
        <span className="item-badge" style={{ background: config.bg, color: config.text }}>
          {items.length}
        </span>
      </div>

      <div className="card-content">
        <div className="items-list">
          {visible.map((item, i) => (
            <div key={i} className="item-row">
              <span className="item-number" style={{ background: config.badge, color: config.text }}>
                {i + 1}
              </span>
              <p className="item-text">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="expand-button"
        >
          {expanded
            ? "Show less"
            : `Show ${items.length - PREVIEW_COUNT} more`}
          <ChevronDown
            size={14}
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </button>
      )}
    </div>
  );
};

const AnalysisResult = ({ data }: AnalysisResultProps) => {
  const totalItems =
    (data.findings?.length ?? 0) +
    (data.concerns?.length ?? 0) +
    (data.suggestions?.length ?? 0);

  const summaryPoints = convertSummaryToPoints(data.summary);

  return (
    <div className="analysis-result-page">
      {/* Dark Sidebar */}
      <div className="result-sidebar">
        <div className="sidebar-content">
          <h2>Analysis Report</h2>
          <p>Medical Report Assessment</p>

          <div className="sidebar-stats">
            <div className="stat-item">
              <div>
                <div className="stat-number">{data.findings?.length ?? 0}</div>
                <div className="stat-label">Key Findings</div>
              </div>
            </div>
            <div className="stat-item">
              <div>
                <div className="stat-number">{data.concerns?.length ?? 0}</div>
                <div className="stat-label">Health Concerns</div>
              </div>
            </div>
            <div className="stat-item">
              <div>
                <div className="stat-number">{data.suggestions?.length ?? 0}</div>
                <div className="stat-label">Recommendations</div>
              </div>
            </div>
          </div>

          <div className="sidebar-info">
            <h4>Total Items</h4>
            <p>{totalItems} analysis points identified</p>
          </div>
        </div>
      </div>

      {/* Light Content Area */}
      <div className="result-content">
        <div className="content-header">
          <h1>Medical Report Summary</h1>
          <p>Detailed analysis of your health screening report</p>
        </div>

        <div className="cards-container">
          {/* Summary Card */}
          {data.summary && (
            <div className="analysis-card summary-card">
              <div className="card-header">
                <div className="header-icon summary-icon">
                  <FileText size={18} />
                </div>
                <div className="header-info">
                  <h3 className="card-title">Report Summary</h3>
                  <p className="card-description">{summaryPoints.length} key points</p>
                </div>
              </div>
              
              <div className="summary-content">
                <ul className="summary-points">
                  {summaryPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Three Detail Cards */}
          <div className="detail-cards-grid">
            {data.findings && data.findings.length > 0 && (
              <ExpandableCard cardKey="findings" items={data.findings} />
            )}
            {data.concerns && data.concerns.length > 0 && (
              <ExpandableCard cardKey="concerns" items={data.concerns} />
            )}
            {data.suggestions && data.suggestions.length > 0 && (
              <ExpandableCard cardKey="suggestions" items={data.suggestions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;