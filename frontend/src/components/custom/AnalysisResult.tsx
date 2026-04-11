import {
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  FileText,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { AnalysisResponse } from "../../types/analysis";
import "../../styles/AnalysisResultNew.css";

interface AnalysisResultProps {
  data: AnalysisResponse;
}

const PREVIEW_COUNT = 3;

const cardConfig = {
  findings: {
    label: "Key Findings",
    icon: CheckCircle,
    accent: "#059669",
    softBg: "#e8f8f2",
    text: "#065f46",
  },
  concerns: {
    label: "Health Concerns",
    icon: AlertTriangle,
    accent: "#d97706",
    softBg: "#fff4e5",
    text: "#92400e",
  },
  suggestions: {
    label: "Recommendations",
    icon: Lightbulb,
    accent: "#7c3aed",
    softBg: "#f2ecff",
    text: "#5b21b6",
  },
} as const;

type CardKey = keyof typeof cardConfig;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toPoints = (summary: string, fallback: string[]) => {
  const extracted = summary
    .split(/[.\n]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 14)
    .slice(0, 5);

  return extracted.length > 0 ? extracted : fallback.slice(0, 4);
};

const getRating = (score: number) => {
  if (score >= 85) {
    return { label: "Excellent", tone: "great", color: "#10b981", helper: "Strong overall indicators with low risk signals." };
  }
  if (score >= 70) {
    return { label: "Good", tone: "good", color: "#3b82f6", helper: "Mostly healthy profile with a few watch points." };
  }
  if (score >= 55) {
    return { label: "Fair", tone: "fair", color: "#f59e0b", helper: "Moderate risk profile. Prioritize suggested actions." };
  }
  if (score >= 40) {
    return { label: "Needs Attention", tone: "attention", color: "#ef4444", helper: "Multiple concerns detected; track these with your doctor." };
  }
  return { label: "Critical", tone: "critical", color: "#dc2626", helper: "High-risk pattern. Seek professional medical guidance promptly." };
};

const ExpandableCard = ({ cardKey, items }: { cardKey: CardKey; items: string[] }) => {
  const [expanded, setExpanded] = useState(false);
  const config = cardConfig[cardKey];
  const Icon = config.icon;
  const visibleItems = expanded ? items : items.slice(0, PREVIEW_COUNT);

  return (
    <section className="analysis-detail-card" style={{ borderTopColor: config.accent }}>
      <header className="detail-card-header">
        <div className="detail-card-icon" style={{ background: config.softBg }}>
          <Icon size={20} style={{ color: config.accent }} />
        </div>
        <div className="detail-card-header-text">
          <h3>{config.label}</h3>
          <p>{items.length} {items.length === 1 ? "item" : "items"}</p>
        </div>
        <span className="detail-card-count" style={{ background: config.accent }}>
          {items.length}
        </span>
      </header>

      <div className="detail-card-items">
        {visibleItems.map((item, index) => (
          <article
            key={`${cardKey}-${index}`}
            className="detail-item"
            style={{
              borderLeftColor: config.accent,
              animationDelay: `${index * 70}ms`,
            }}
          >
            <span className="detail-item-index" style={{ background: config.softBg, color: config.text }}>
              {index + 1}
            </span>
            <p>{item}</p>
          </article>
        ))}
      </div>

      {items.length > PREVIEW_COUNT && (
        <button type="button" className="expand-button" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? "Show less" : `Show ${items.length - PREVIEW_COUNT} more`}
          <ChevronDown size={16} style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
        </button>
      )}
    </section>
  );
};

const AnalysisResult = ({ data }: AnalysisResultProps) => {
  const [ringReady, setRingReady] = useState(false);
  const findings = data.findings ?? [];
  const concerns = data.concerns ?? [];
  const suggestions = data.suggestions ?? [];

  const findingsCount = findings.length;
  const concernsCount = concerns.length;
  const suggestionsCount = suggestions.length;
  const totalItems = findingsCount + concernsCount + suggestionsCount;

  const fallbackSummary = [...findings, ...concerns, ...suggestions];
  const summaryPoints = toPoints(data.summary, fallbackSummary);

  const concernPenalty = Math.min(concernsCount * 16, 100);
  const findingBonus = Math.min(findingsCount * 4, 16);
  const suggestionBonus = suggestionsCount > 0 ? 8 : 0;
  const healthScore = clamp(100 - concernPenalty + findingBonus + suggestionBonus, 0, 100);

  const rating = getRating(healthScore);

  const findingsPercent = totalItems ? Math.round((findingsCount / totalItems) * 100) : 0;
  const concernsPercent = totalItems ? Math.round((concernsCount / totalItems) * 100) : 0;
  const suggestionsPercent = totalItems ? Math.round((suggestionsCount / totalItems) * 100) : 0;

  const circumference = 2 * Math.PI * 45;
  const scoreOffset = circumference - (healthScore / 100) * circumference;

  const topConcerns = concerns.slice(0, 3);
  const topActions = suggestions.slice(0, 4);

  useEffect(() => {
    const id = window.setTimeout(() => setRingReady(true), 50);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="analysis-result-page-new">
      <aside className="result-sidebar-new">
        <div className="sidebar-content-new">
          <div>
            <h2 className="sidebar-title">HealthLens Report</h2>
            <p className="sidebar-subtitle">Visual medical analysis snapshot</p>
          </div>

          <section className="health-score-container">
            <div className="score-circle">
              <svg className="score-svg" viewBox="0 0 120 120" aria-label="Health score gauge">
                <circle className="score-bg" cx="60" cy="60" r="45" />
                <circle
                  className="score-fill"
                  cx="60"
                  cy="60"
                  r="45"
                  stroke={rating.color}
                  strokeDasharray={circumference}
                  strokeDashoffset={ringReady ? scoreOffset : circumference}
                />
              </svg>

              <div className="score-value">
                <span className="score-number" style={{ color: rating.color }}>
                  {Math.round(healthScore)}
                </span>
                <span className="score-label">/100</span>
                <span className={`score-rating score-${rating.tone}`}>{rating.label}</span>
              </div>
            </div>

            <p className="score-description">{rating.helper}</p>

            <div className="score-impact-grid">
              <div className="impact-chip positive">
                <CheckCircle size={14} /> +{findingBonus} positive
              </div>
              <div className="impact-chip negative">
                <ShieldAlert size={14} /> -{concernPenalty} risk
              </div>
              <div className="impact-chip neutral">
                <Sparkles size={14} /> +{suggestionBonus} action bonus
              </div>
            </div>

            <div className="formula-box">
              <p>Score Formula</p>
              <strong>
                100 - ({concernsCount} × 16) + ({findingsCount} × 4) + {suggestionsCount > 0 ? "8" : "0"}
              </strong>
            </div>
          </section>

          <section className="sidebar-stats-new">
            <div className="stat-item-new">
              <Activity size={18} />
              <div>
                <strong>{totalItems}</strong>
                <span>Total insights</span>
              </div>
            </div>
            <div className="stat-item-new">
              <AlertTriangle size={18} />
              <div>
                <strong>{concernsCount}</strong>
                <span>Risk signals</span>
              </div>
            </div>
            <div className="stat-item-new">
              <Target size={18} />
              <div>
                <strong>{suggestionsCount}</strong>
                <span>Action items</span>
              </div>
            </div>
          </section>
        </div>
      </aside>

      <main className="result-content-new">
        <header className="content-header-new">
          <h1>Your Medical Report, Explained Clearly</h1>
          <p>
            Structured highlights, risk view, and next-step recommendations so you can quickly understand what
            matters most.
          </p>
        </header>

        <section className="overview-card">
          <div className="overview-top">
            <h2>At a Glance</h2>
            <span>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
          </div>

          <div className="metric-strip">
            <article className="metric-tile findings">
              <div>
                <p>Findings</p>
                <h3>{findingsCount}</h3>
              </div>
              <small>{findingsPercent}% of total points</small>
            </article>
            <article className="metric-tile concerns">
              <div>
                <p>Concerns</p>
                <h3>{concernsCount}</h3>
              </div>
              <small>{concernsPercent}% of total points</small>
            </article>
            <article className="metric-tile suggestions">
              <div>
                <p>Recommendations</p>
                <h3>{suggestionsCount}</h3>
              </div>
              <small>{suggestionsPercent}% of total points</small>
            </article>
          </div>

          <div className="composition-section">
            <div className="composition-header">
              <p>Report Composition</p>
              <span>{totalItems} total entries</span>
            </div>
            <div className="composition-track">
              <div className="composition-segment findings" style={{ width: `${findingsPercent}%` }} />
              <div className="composition-segment concerns" style={{ width: `${concernsPercent}%` }} />
              <div className="composition-segment suggestions" style={{ width: `${suggestionsPercent}%` }} />
            </div>
          </div>
        </section>

        {summaryPoints.length > 0 && (
          <section className="summary-card-new">
            <header className="summary-header">
              <div className="summary-icon">
                <FileText size={20} />
              </div>
              <div>
                <h3>Plain-language Summary</h3>
                <p>Important takeaways from your uploaded report</p>
              </div>
            </header>
            <div className="summary-body">
              {summaryPoints.map((point, index) => (
                <article key={`summary-${index}`} className="summary-point">
                  <span className="point-number">{index + 1}</span>
                  <p className="point-text">{point}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="priority-grid">
          <article className="priority-card concerns-priority">
            <header>
              <h3>Priority Concerns</h3>
              <span>Top risk indicators</span>
            </header>
            {topConcerns.length === 0 ? (
              <p className="empty-note">No major concerns flagged in this report.</p>
            ) : (
              <ul>
                {topConcerns.map((item, idx) => (
                  <li key={`concern-${idx}`}>
                    <span>High</span>
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="priority-card actions-priority">
            <header>
              <h3>Recommended Next Steps</h3>
              <span>Suggested follow-up actions</span>
            </header>
            {topActions.length === 0 ? (
              <p className="empty-note">No specific actions listed.</p>
            ) : (
              <ul>
                {topActions.map((item, idx) => (
                  <li key={`action-${idx}`}>
                    <span>Step {idx + 1}</span>
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>

        <section className="detail-cards-grid-new">
          {findings.length > 0 && <ExpandableCard cardKey="findings" items={findings} />}
          {concerns.length > 0 && <ExpandableCard cardKey="concerns" items={concerns} />}
          {suggestions.length > 0 && <ExpandableCard cardKey="suggestions" items={suggestions} />}
        </section>
      </main>
    </div>
  );
};

export default AnalysisResult;