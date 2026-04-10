import {
  FileText,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  ChevronDown,
  ArrowLeft,
  Printer,
  Activity,
  Shield,
  Heart,
  Sparkles,
  Clock,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import type { AnalysisResponse } from "../../types/analysis";
import "../../styles/AnalysisResult.css";

interface AnalysisResultProps {
  data: AnalysisResponse;
  onNewAnalysis?: () => void;
}

const cardConfig = {
  findings: {
    label: "Key Findings",
    description: "Important observations identified in your report",
    icon: CheckCircle,
    color: "#34D399",
    colorDim: "rgba(52, 211, 153, 0.10)",
    gradient: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
    emoji: "🔬",
  },
  concerns: {
    label: "Health Concerns",
    description: "Areas that require your attention and follow-up",
    icon: AlertTriangle,
    color: "#FBBF24",
    colorDim: "rgba(251, 191, 36, 0.10)",
    gradient: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
    emoji: "⚠️",
  },
  suggestions: {
    label: "Recommendations",
    description: "Actionable steps to improve your health outcomes",
    icon: Lightbulb,
    color: "#A78BFA",
    colorDim: "rgba(167, 139, 250, 0.10)",
    gradient: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)",
    emoji: "💡",
  },
} as const;

type CardKey = keyof typeof cardConfig;
const PREVIEW_COUNT = 4;

const convertSummaryToPoints = (summary: string): string[] => {
  const sentences = summary
    .split(/[.\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
  return sentences.slice(0, 6);
};

/* ─── Animated Health Score Ring ─── */
const HealthScoreRing = ({
  findings,
  concerns,
}: {
  findings: number;
  concerns: number;
}) => {
  const [animVal, setAnimVal] = useState(0);
  const score = Math.min(100, Math.max(20, Math.round(100 - concerns * 8 + findings * 2)));
  const radius = 58;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (animVal / 100) * circ;

  const palette = (s: number) =>
    s >= 75 ? { c: "#34D399", l: "Excellent" }
    : s >= 55 ? { c: "#FBBF24", l: "Good" }
    : s >= 35 ? { c: "#FB923C", l: "Fair" }
    : { c: "#F87171", l: "Needs Attention" };

  const { c, l } = palette(score);

  useEffect(() => {
    const t = setTimeout(() => {
      let cur = 0;
      const iv = setInterval(() => {
        cur += 1;
        if (cur >= score) { clearInterval(iv); setAnimVal(score); }
        else setAnimVal(cur);
      }, 18);
      return () => clearInterval(iv);
    }, 700);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="score-ring-wrap">
      <div className="score-ring-glow" style={{ background: `radial-gradient(circle, ${c}25 0%, transparent 70%)` }} />
      <svg viewBox="0 0 130 130" className="score-ring-svg">
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c} />
            <stop offset="100%" stopColor={c} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="7" />
        <circle
          cx="65" cy="65" r={radius} fill="none"
          stroke="url(#scoreGrad)" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 65 65)"
          style={{ transition: "stroke-dashoffset 0.25s ease" }}
        />
      </svg>
      <div className="score-ring-center">
        <span className="score-ring-num" style={{ color: c }}>{animVal}</span>
        <span className="score-ring-label">{l}</span>
      </div>
    </div>
  );
};

/* ─── Category Progress Bar ─── */
const CategoryBar = ({
  label,
  count,
  max,
  color,
  delay,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
  delay: number;
}) => {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <motion.div
      className="cat-bar"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="cat-bar-top">
        <span className="cat-bar-label">{label}</span>
        <span className="cat-bar-count" style={{ color }}>{count}</span>
      </div>
      <div className="cat-bar-track">
        <motion.div
          className="cat-bar-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};

/* ─── Scroll-reveal wrapper ─── */
const RevealSection = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

/* ─── Full-Width Detail Section ─── */
const DetailSection = ({
  cardKey,
  items,
  index,
}: {
  cardKey: CardKey;
  items: string[];
  index: number;
}) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = cardConfig[cardKey];
  const Icon = cfg.icon;
  const visible = expanded ? items : items.slice(0, PREVIEW_COUNT);
  const hasMore = items.length > PREVIEW_COUNT;

  return (
    <RevealSection delay={index * 0.12} className="dc-section">
      {/* Section header */}
      <div className="dc-header">
        <div className="dc-header-left">
          <div className="dc-icon-wrap" style={{ background: cfg.colorDim }}>
            <Icon size={22} style={{ color: cfg.color }} />
          </div>
          <div className="dc-header-text">
            <h3>{cfg.label}</h3>
            <p>{cfg.description}</p>
          </div>
        </div>
        <div className="dc-header-right">
          <div className="dc-count-badge" style={{ background: cfg.colorDim, color: cfg.color }}>
            <span className="dc-count-num">{items.length}</span>
            <span className="dc-count-label">{items.length === 1 ? "item" : "items"}</span>
          </div>
        </div>
      </div>

      {/* Items grid */}
      <div className="dc-items-grid">
        <AnimatePresence mode="sync">
          {visible.map((item, i) => (
            <motion.div
              key={`${cardKey}-${i}`}
              className="dc-item"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            >
              <div className="dc-item-indicator">
                <div className="dc-item-line" style={{ background: cfg.gradient }} />
                <div className="dc-item-num" style={{ background: cfg.colorDim, color: cfg.color }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
              </div>
              <div className="dc-item-content">
                <p>{item}</p>
              </div>
              <ArrowRight size={14} className="dc-item-arrow" style={{ color: cfg.color }} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Expand / Collapse */}
      {hasMore && (
        <motion.button
          onClick={() => setExpanded((e) => !e)}
          className="dc-expand-btn"
          style={{ color: cfg.color, borderColor: `${cfg.color}25` }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>{expanded ? "Show less" : `Show ${items.length - PREVIEW_COUNT} more`}</span>
          <ChevronDown
            size={15}
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
        </motion.button>
      )}

      {/* Decorative bottom gradient line */}
      <div className="dc-section-line" style={{ background: `linear-gradient(90deg, ${cfg.color}00, ${cfg.color}30, ${cfg.color}00)` }} />
    </RevealSection>
  );
};

/* ═══════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════ */

const AnalysisResult = ({ data, onNewAnalysis }: AnalysisResultProps) => {
  const totalItems =
    (data.findings?.length ?? 0) +
    (data.concerns?.length ?? 0) +
    (data.suggestions?.length ?? 0);

  const summaryPoints = convertSummaryToPoints(data.summary);
  const now = new Date();
  const timeStr = now.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="ar-page">
      <div className="ar-bg-mesh" />
      <div className="ar-bg-grain" />

      {/* ─── Nav bar ─── */}
      <motion.nav
        className="ar-nav"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <button className="ar-nav-back" onClick={onNewAnalysis}>
          <ArrowLeft size={16} />
          <span>New Analysis</span>
        </button>

        <div className="ar-nav-center">
          <Sparkles size={16} className="ar-nav-sparkle" />
          <span>AI Health Report</span>
        </div>

        <div className="ar-nav-actions">
          <span className="ar-nav-time">
            <Clock size={12} />
            {timeStr}
          </span>
          <button className="ar-nav-btn" onClick={() => window.print()} title="Print">
            <Printer size={15} />
          </button>
        </div>
      </motion.nav>

      {/* ─── Hero panel ─── */}
      <motion.section
        className="ar-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.7 }}
      >
        <div className="ar-hero-left">
          <HealthScoreRing
            findings={data.findings?.length ?? 0}
            concerns={data.concerns?.length ?? 0}
          />
        </div>

        <div className="ar-hero-right">
          <motion.div
            className="ar-hero-text"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2>
              <Heart size={20} className="ar-hero-heart" />
              Health Assessment Complete
            </h2>
            <p>
              We analyzed your report and found <strong>{totalItems}</strong> key
              insights across {[data.findings, data.concerns, data.suggestions].filter(a => a && a.length > 0).length} categories.
            </p>
          </motion.div>

          <div className="ar-hero-bars">
            <CategoryBar label="Findings" count={data.findings?.length ?? 0} max={totalItems} color="#34D399" delay={0.5} />
            <CategoryBar label="Concerns" count={data.concerns?.length ?? 0} max={totalItems} color="#FBBF24" delay={0.6} />
            <CategoryBar label="Tips" count={data.suggestions?.length ?? 0} max={totalItems} color="#A78BFA" delay={0.7} />
          </div>
        </div>
      </motion.section>

      {/* ─── Summary ─── */}
      {data.summary && (
        <RevealSection className="ar-summary" delay={0.1}>
          <div className="ar-summary-head">
            <div className="ar-summary-icon">
              <FileText size={20} />
            </div>
            <div>
              <h2>Report Summary</h2>
              <p>{summaryPoints.length} key points</p>
            </div>
          </div>

          <div className="ar-summary-grid">
            {summaryPoints.map((pt, i) => (
              <motion.div
                key={i}
                className="ar-summary-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.4 }}
                whileHover={{ x: 6, transition: { duration: 0.2 } }}
              >
                <div className="ar-summary-num">{String(i + 1).padStart(2, "0")}</div>
                <p>{pt}</p>
                <ChevronRight size={14} className="ar-summary-arrow" />
              </motion.div>
            ))}
          </div>
        </RevealSection>
      )}

      {/* ─── Full-Width Detail Sections ─── */}
      <div className="ar-details-container">
        {data.findings && data.findings.length > 0 && (
          <DetailSection cardKey="findings" items={data.findings} index={0} />
        )}
        {data.concerns && data.concerns.length > 0 && (
          <DetailSection cardKey="concerns" items={data.concerns} index={1} />
        )}
        {data.suggestions && data.suggestions.length > 0 && (
          <DetailSection cardKey="suggestions" items={data.suggestions} index={2} />
        )}
      </div>

      {/* ─── Footer ─── */}
      <footer className="ar-footer">
        <Shield size={14} />
        <p>
          AI-generated analysis — not a substitute for professional medical advice.
          Always consult your healthcare provider.
        </p>
      </footer>
    </div>
  );
};

export default AnalysisResult;