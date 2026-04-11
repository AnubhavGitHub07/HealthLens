import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import axios from "axios";
import {
  FileText, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Minus, Upload, Lightbulb, Heart, ChevronRight, Gauge, Sparkles,
  LogOut, LayoutDashboard, MessageSquare, History, Bell, RefreshCw,
  Activity, ArrowUpRight, Search, Settings, HelpCircle,
} from "lucide-react";
import "../styles/Dashboard.css";
import { useAuth } from "../context/AuthContext";

/* ── Types ─────────────────────────────────────────────── */
interface ReportAnalysis { summary: string; findings: string[]; concerns: string[]; suggestions: string[]; }
interface Report { _id: string; userId: string; fileName: string; analysis: ReportAnalysis; createdAt: string; }
interface ComparisonResult {
  overallTrend: "improving" | "stable" | "declining";
  trendSummary: string; improvements: string[]; declines: string[];
  unchanged: string[]; recommendations: string[];
}

/* ── Animation variants ─────────────────────────────────── */
const card: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, type: "spring", stiffness: 280, damping: 24 } }),
};

/* ── Helpers ────────────────────────────────────────────── */
function timeOfDay() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [report, setReport] = useState<Report | null>(null);
  const [cmp, setCmp] = useState<ComparisonResult | null>(null);
  const [reportCount, setReportCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cmpLoading, setCmpLoading] = useState(false);
  const [cmpMsg, setCmpMsg] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  const name = user?.name?.split(" ")[0] || "there";

  /* Data fetch */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const H = { Authorization: `Bearer ${token}` };
      const [lr, rr] = await Promise.all([
        axios.get("http://localhost:5001/api/reports/latest", { headers: H }),
        axios.get("http://localhost:5001/api/reports", { headers: H }),
      ]);
      if (lr.data.success) setReport(lr.data.report);
      if (rr.data.success) setReportCount(rr.data.count);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }

    try {
      setCmpLoading(true);
      const H = { Authorization: `Bearer ${token}` };
      const cr = await axios.get("http://localhost:5001/api/reports/compare", { headers: H });
      if (cr.data.success && cr.data.comparison) setCmp(cr.data.comparison);
      else if (cr.data.message) setCmpMsg(cr.data.message);
    } catch (e) { console.error(e); }
    finally { setCmpLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  /* Score */
  const analysis = report?.analysis;
  const totalInsights = analysis ? analysis.findings.length + analysis.concerns.length + analysis.suggestions.length : 0;
  const concernPenalty = analysis ? Math.min(analysis.concerns.length * 15, 100) : 0;
  const findingsBonus = analysis ? Math.min(analysis.findings.length * 5, 20) : 0;
  const suggestionsBonus = analysis?.suggestions.length ? 10 : 0;
  const healthScore = Math.max(0, Math.min(100, 100 - concernPenalty + findingsBonus + suggestionsBonus));
  const scoreC = 2 * Math.PI * 50;
  const scoreOff = scoreC - (healthScore / 100) * scoreC;

  const rating = healthScore >= 85 ? { label: "Excellent", cls: "excellent" }
    : healthScore >= 70 ? { label: "Good", cls: "good" }
    : healthScore >= 55 ? { label: "Fair", cls: "fair" }
    : healthScore >= 40 ? { label: "Attention", cls: "attention" }
    : { label: "Critical", cls: "critical" };

  const trend = cmp ? (
    cmp.overallTrend === "improving" ? { icon: <TrendingUp size={18} />, label: "Improving", cls: "improving" }
    : cmp.overallTrend === "declining" ? { icon: <TrendingDown size={18} />, label: "Attention", cls: "declining" }
    : { icon: <Minus size={18} />, label: "Stable", cls: "stable" }
  ) : null;

  /* Nav */
  const nav = [
    { icon: <LayoutDashboard size={16} />, label: "Overview", active: true, go: () => {} },
    { icon: <Upload size={16} />, label: "Upload Report", active: false, go: () => navigate("/upload") },
    { icon: <History size={16} />, label: "Report History", active: false, go: () => navigate("/history") },
    { icon: <MessageSquare size={16} />, label: "AI Assistant", active: false, go: () => navigate("/chat") },
  ];

  /* ── LOADING ── */
  if (loading) return (
    <div className="dash">
      <Sidebar nav={nav} name={name} logout={logout} />
      <div className="dash-main">
        <div className="dash-loading">
          <div className="dash-loading-ring"><Heart size={28} /></div>
          <p>Loading your health data…</p>
          <div className="dash-loading-track"><div className="dash-loading-fill" /></div>
        </div>
      </div>
    </div>
  );

  /* ── EMPTY ── */
  if (!report || !analysis) return (
    <div className="dash">
      <Sidebar nav={nav} name={name} logout={logout} />
      <div className="dash-main">
        <TopBar name={name} search={search} setSearch={setSearch} onRefresh={load} reportDate="" concerns={0} navigate={navigate} />
        <div className="dash-content">
          <motion.div className="dash-empty-state" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="dash-empty-icon"><Heart size={36} /></div>
            <h2>Welcome, {name}!</h2>
            <p>Upload your first medical report to unlock AI-powered health insights, trend tracking, and personalised recommendations.</p>
            <button className="dash-cta" onClick={() => navigate("/upload")}>
              <Upload size={15} /> Upload First Report
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );

  const reportDate = fmtDate(report.createdAt);

  /* ── MAIN DASHBOARD ── */
  return (
    <div className="dash">
      {/* Ambient blobs */}
      <div className="dash-blob dash-blob-1" />
      <div className="dash-blob dash-blob-2" />
      <div className="dash-blob dash-blob-3" />

      <Sidebar nav={nav} name={name} logout={logout} />

      <div className="dash-main">
        <TopBar name={name} search={search} setSearch={setSearch} onRefresh={load} reportDate={reportDate} concerns={analysis.concerns.length} navigate={navigate} />

        <div className="dash-content">

          {/* ── Greeting ── */}
          <motion.div className="dash-greeting" custom={0} variants={card} initial="hidden" animate="show">
            <div>
              <h1 className="dash-greeting-title">Good {timeOfDay()}, <span>{name}</span> 👋</h1>
              <p className="dash-greeting-sub">Here's your personalised health overview — AI-powered insights from your latest report.</p>
            </div>
            <button className="dash-cta" onClick={() => navigate("/upload")}>
              <Upload size={14} /> New Report
            </button>
          </motion.div>

          {/* ── KPI Strip ── */}
          <div className="dash-kpi-strip">
            {[
              { label: "Health Score", val: `${Math.round(healthScore)}`, unit: "/100", icon: <Gauge size={17} />, color: "#14b8a6", glow: "rgba(20,184,166,0.15)" },
              { label: "Total Reports", val: `${reportCount}`, unit: "", icon: <FileText size={17} />, color: "#6366f1", glow: "rgba(99,102,241,0.15)" },
              { label: "Key Findings", val: `${analysis.findings.length}`, unit: "", icon: <CheckCircle size={17} />, color: "#10b981", glow: "rgba(16,185,129,0.15)" },
              { label: "Concerns", val: `${analysis.concerns.length}`, unit: "", icon: <AlertTriangle size={17} />, color: analysis.concerns.length > 0 ? "#f43f5e" : "#10b981", glow: analysis.concerns.length > 0 ? "rgba(244,63,94,0.12)" : "rgba(16,185,129,0.12)" },
              { label: "AI Suggestions", val: `${analysis.suggestions.length}`, unit: "", icon: <Lightbulb size={17} />, color: "#a78bfa", glow: "rgba(167,139,250,0.15)" },
            ].map((k, i) => (
              <motion.div key={k.label} className="dash-kpi" custom={i + 1} variants={card} initial="hidden" animate="show">
                <div className="dash-kpi-icon" style={{ background: k.glow, color: k.color }}>{k.icon}</div>
                <div className="dash-kpi-body">
                  <span className="dash-kpi-label">{k.label}</span>
                  <span className="dash-kpi-value" style={{ color: k.color }}>{k.val}<small>{k.unit}</small></span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Row: Score + Summary ── */}
          <div className="dash-grid-2-wide">
            {/* Score gauge */}
            <motion.div className="dash-card dash-card-score" custom={2} variants={card} initial="hidden" animate="show">
              <div className="dash-card-head">
                <span className="dash-card-tag"><Activity size={13} /> Health Score</span>
                <span className={`dash-badge dash-badge-${rating.cls}`}>{rating.label}</span>
              </div>
              <div className="dash-gauge">
                <svg viewBox="0 0 120 120" className="dash-gauge-svg">
                  <circle cx="60" cy="60" r="50" className="dash-gauge-bg" />
                  <motion.circle cx="60" cy="60" r="50"
                    className="dash-gauge-arc"
                    initial={{ strokeDashoffset: scoreC }}
                    animate={{ strokeDashoffset: scoreOff }}
                    transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
                    style={{ strokeDasharray: scoreC }}
                  />
                </svg>
                <div className="dash-gauge-center">
                  <strong>{Math.round(healthScore)}</strong>
                  <span>/100</span>
                </div>
              </div>
              <div className="dash-score-rows">
                <div className="dash-score-row"><span>Findings bonus</span><b style={{ color: "#10b981" }}>+{findingsBonus}</b></div>
                <div className="dash-score-row"><span>Concern penalty</span><b style={{ color: "#f43f5e" }}>-{concernPenalty}</b></div>
                <div className="dash-score-row"><span>Action bonus</span><b style={{ color: "#a78bfa" }}>+{suggestionsBonus}</b></div>
              </div>
            </motion.div>

            {/* Report Summary */}
            <motion.div className="dash-card dash-card-summary" custom={3} variants={card} initial="hidden" animate="show">
              <div className="dash-card-head">
                <span className="dash-card-tag"><FileText size={13} /> Latest Report</span>
                <span className="dash-date-chip">{reportDate}</span>
              </div>
              <p className="dash-file-name">{report.fileName}</p>
              <p className="dash-summary-text">{analysis.summary}</p>
              {totalInsights > 0 && (
                <div className="dash-dist">
                  <div className="dash-dist-bar">
                    <div className="dash-dist-seg seg-findings" style={{ width: `${(analysis.findings.length / totalInsights) * 100}%` }} />
                    <div className="dash-dist-seg seg-concerns" style={{ width: `${(analysis.concerns.length / totalInsights) * 100}%` }} />
                    <div className="dash-dist-seg seg-suggestions" style={{ width: `${(analysis.suggestions.length / totalInsights) * 100}%` }} />
                  </div>
                  <div className="dash-dist-legend">
                    <span><i className="dlg-dot dlg-findings" />Findings ({analysis.findings.length})</span>
                    <span><i className="dlg-dot dlg-concerns" />Concerns ({analysis.concerns.length})</span>
                    <span><i className="dlg-dot dlg-suggestions" />Actions ({analysis.suggestions.length})</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* ── Row: Concerns + Findings ── */}
          <div className="dash-grid-2">
            {analysis.concerns.length > 0 && (
              <motion.div className="dash-card" custom={4} variants={card} initial="hidden" animate="show">
                <div className="dash-card-head">
                  <span className="dash-card-tag"><AlertTriangle size={13} /> Concerns</span>
                  <span className="dash-badge dash-badge-critical">{analysis.concerns.length}</span>
                </div>
                <div className="dash-list">
                  {analysis.concerns.map((c, i) => (
                    <div key={i} className="dash-list-row dash-list-row-red">
                      <div className="dash-list-dot dot-red"><AlertTriangle size={11} /></div>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            <motion.div className="dash-card" custom={5} variants={card} initial="hidden" animate="show">
              <div className="dash-card-head">
                <span className="dash-card-tag"><CheckCircle size={13} /> Key Findings</span>
                <span className="dash-badge dash-badge-good">{analysis.findings.length}</span>
              </div>
              <div className="dash-list">
                {analysis.findings.length === 0
                  ? <p className="dash-empty-msg">No specific findings noted.</p>
                  : analysis.findings.map((f, i) => (
                    <div key={i} className="dash-list-row">
                      <div className="dash-list-dot dot-teal"><CheckCircle size={11} /></div>
                      <span>{f}</span>
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>

          {/* ── Trend Banner ── */}
          <motion.div custom={5} variants={card} initial="hidden" animate="show">
            <AnimatePresence mode="wait">
              {cmpLoading ? (
                <motion.div key="cmp-load" className="dash-trend-loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="dash-spinner" />
                  <span>AI is analysing trends across your reports…</span>
                </motion.div>
              ) : cmp && trend ? (
                <motion.div key="cmp-data" className={`dash-trend-banner trend-${trend.cls}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="dash-trend-icon-wrap">{trend.icon}</div>
                  <div className="dash-trend-body">
                    <strong className="dash-trend-title">{trend.label}</strong>
                    <p className="dash-trend-text">{cmp.trendSummary}</p>
                  </div>
                  <div className="dash-trend-chips">
                    <span className="trendchip trendchip-green">↑ {cmp.improvements.length} improved</span>
                    <span className="trendchip trendchip-red">↓ {cmp.declines.length} declined</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="cmp-empty" className="dash-trend-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Sparkles size={16} />
                  <span>{cmpMsg || "Upload a second report to unlock AI health trend comparisons."}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Comparison detail ── */}
          {cmp && (
            <div className="dash-grid-2">
              <motion.div className="dash-card" custom={6} variants={card} initial="hidden" animate="show">
                <div className="dash-card-head">
                  <span className="dash-card-tag"><ArrowUpRight size={13} /> Improvements</span>
                  <span className="dash-badge dash-badge-good">{cmp.improvements.length}</span>
                </div>
                <div className="dash-list">
                  {cmp.improvements.length === 0
                    ? <p className="dash-empty-msg">No improvements detected yet.</p>
                    : cmp.improvements.map((item, i) => (
                      <div key={i} className="dash-list-row">
                        <div className="dash-list-dot dot-teal"><CheckCircle size={11} /></div>
                        <span>{item}</span>
                      </div>
                    ))}
                </div>
              </motion.div>
              <motion.div className="dash-card" custom={7} variants={card} initial="hidden" animate="show">
                <div className="dash-card-head">
                  <span className="dash-card-tag"><Lightbulb size={13} /> AI Recommendations</span>
                </div>
                <div className="dash-list">
                  {cmp.recommendations.map((item, i) => (
                    <div key={i} className="dash-list-row">
                      <div className="dash-list-dot dot-purple"><ChevronRight size={11} /></div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* ── Suggestions ── */}
          {analysis.suggestions.length > 0 && (
            <motion.div className="dash-card" custom={8} variants={card} initial="hidden" animate="show">
              <div className="dash-card-head">
                <span className="dash-card-tag"><Lightbulb size={13} /> Suggested Actions</span>
                <span className="dash-badge dash-badge-purple">{analysis.suggestions.length}</span>
              </div>
              <div className="dash-chips-grid">
                {analysis.suggestions.map((s, i) => (
                  <div key={i} className="dash-chip">
                    <ChevronRight size={12} />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SIDEBAR
   ══════════════════════════════════════════════════════════ */
function Sidebar({ nav, name, logout }: {
  nav: { icon: React.ReactNode; label: string; active: boolean; go: () => void }[];
  name: string; logout: () => void;
}) {
  return (
    <aside className="dash-sidebar">
      

      {/* Primary nav */}
      <div className="dash-sidebar-section">
        
        <nav className="dash-sidebar-nav">
          {nav.map(item => (
            <button key={item.label} className={`dash-nav-btn ${item.active ? "active" : ""}`} onClick={item.go}>
              <span className="dash-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.active && <span className="dash-nav-pip" />}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom utility */}
      <div className="dash-sidebar-bottom">
        <button className="dash-nav-btn">
          <span className="dash-nav-icon"><Settings size={16} /></span>
          <span>Settings</span>
        </button>
        <button className="dash-nav-btn">
          <span className="dash-nav-icon"><HelpCircle size={16} /></span>
          <span>Support</span>
        </button>
      </div>

      {/* User chip */}
      <div className="dash-sidebar-user">
        <div className="dash-user-ava">{name[0]?.toUpperCase()}</div>
        <div className="dash-user-info">
          <span className="dash-user-name">{name}</span>
          <span className="dash-user-plan">Free Plan</span>
        </div>
        <button className="dash-logout" onClick={logout} title="Logout"><LogOut size={14} /></button>
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════════════════
   TOP BAR
   ══════════════════════════════════════════════════════════ */
function TopBar({ name, search, setSearch, onRefresh, reportDate, concerns, navigate }: {
  name: string; search: string; setSearch: (v: string) => void;
  onRefresh: () => void; reportDate: string; concerns: number;
  navigate: (path: string) => void;
}) {
  return (
    <header className="dash-topbar">
      <div className="dash-topbar-left">
        <h2 className="dash-topbar-title">Health Dashboard</h2>
        {reportDate && <span className="dash-topbar-sub">Last updated {reportDate}</span>}
      </div>
      <div className="dash-topbar-right">
        <div className="dash-search">
          <Search size={14} className="dash-search-icon" />
          <input
            className="dash-search-input"
            placeholder="Search reports…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="dash-icon-btn" onClick={onRefresh} title="Refresh"><RefreshCw size={15} /></button>
        <button className="dash-icon-btn" title="Notifications" style={{ position: "relative" }}>
          <Bell size={15} />
          {concerns > 0 && <span className="dash-notif-dot" />}
        </button>
        <div className="dash-topbar-avatar" title={name}>{name[0]?.toUpperCase()}</div>
      </div>
    </header>
  );
}
