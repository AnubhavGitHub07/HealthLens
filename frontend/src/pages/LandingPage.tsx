import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './../../styles/LandingPage.css';

export default function LandingPage() {
  useEffect(() => {
    // Scroll progress bar
    const progress = document.getElementById('progress');
    const handleScroll = () => {
      if (progress) {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${window.scrollY / h})`;
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Nav on scroll
    const nav = document.getElementById('nav');
    const handleNavScroll = () => {
      if (nav) {
        nav.classList.toggle('scrolled', window.scrollY > 20);
      }
    };
    window.addEventListener('scroll', handleNavScroll);

    // Reveal on scroll
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => observer.observe(el));

    // Counter animation
    function animateCounter(el: Element) {
      const target = parseInt((el as HTMLElement).dataset.target || '0');
      const duration = 1800;
      const step = target / 60;
      let current = 0;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        (el as HTMLElement).textContent = Math.floor(current).toString();
        if (current >= target) clearInterval(timer);
      }, duration / 60);
    }

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCounter(e.target);
            counterObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll('.counter').forEach((el) => counterObserver.observe(el));

    // Animate bar widths on demo scroll
    const barObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            document.querySelectorAll('.rr-bar').forEach((b) => {
              const w = (b as HTMLElement).style.width;
              (b as HTMLElement).style.width = '0';
              setTimeout(() => {
                (b as HTMLElement).style.width = w;
              }, 100);
            });
            barObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    const demoEl = document.getElementById('demo');
    if (demoEl) barObserver.observe(demoEl);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleNavScroll);
      observer.disconnect();
      counterObserver.disconnect();
      barObserver.disconnect();
    };
  }, []);

  return (
    <>
      {/* Progress Bar */}
      <div id="progress"></div>

      {/* NAV */}
      <nav id="nav">
        <div className="container">
          <div className="nav-inner">
            <Link to="/" className="nav-logo">
              <div className="nav-logo-icon">H</div>
              <span className="nav-logo-text">Health Lens</span>
            </Link>
            <div className="nav-links">
              <a href="#features">Features</a>
              <a href="#how">How It Works</a>
              <a href="#testimonials">Testimonials</a>
              <a href="#demo">Demo</a>
            </div>
            <div className="nav-cta">
              <Link to="/login" className="nav-signin">
                Sign In
              </Link>
              <Link to="/upload" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: '14px' }}>
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="hero-mesh"></div>
        <div className="container">
          <div className="hero-grid">
            {/* Left */}
            <div>
              <div className="hero-eyebrow reveal">
                <div className="live-dot"></div>
                <span className="hero-eyebrow-text">AI-Powered Medical Analysis · Live</span>
              </div>
              <h1 className="hero-h1 reveal reveal-delay-1">
                Turn Complex Reports into <em>Crystal Clear</em> Health Insights
              </h1>
              <p className="hero-sub reveal reveal-delay-2">
                Upload any medical report, lab result, or prescription. Our AI decodes the jargon, highlights risks, and gives you a clear picture of your health — in seconds.
              </p>
              <div className="hero-actions reveal reveal-delay-3">
                <Link to="/upload" className="btn btn-primary btn-lg">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload Your Report
                </Link>
                <a href="#demo" className="btn btn-ghost btn-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="10 8 16 12 10 16 10 8" />
                  </svg>
                  Watch Demo
                </a>
              </div>
              <div className="hero-trust reveal reveal-delay-4">
                <div className="trust-item">
                  <div className="trust-icon">
                    <svg viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  Free to start
                </div>
                <div className="trust-item">
                  <div className="trust-icon">
                    <svg viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  HIPAA Compliant
                </div>
                <div className="trust-item">
                  <div className="trust-icon">
                    <svg viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  No credit card
                </div>
              </div>
            </div>
            {/* Right — Dashboard */}
            <div className="hero-visual reveal reveal-delay-2">
              {/* Floating mini cards */}
              <div className="float-card float-card-2">
                <div className="float-icon" style={{ background: 'rgba(6,182,212,.15)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div>
                  <div className="float-label">Risk Level</div>
                  <div className="float-val" style={{ color: '#06b6d4' }}>
                    Low Risk
                  </div>
                </div>
              </div>
              <div className="float-card float-card-1">
                <div className="float-icon" style={{ background: 'rgba(59,130,246,.15)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div>
                  <div className="float-label">Analysis time</div>
                  <div className="float-val">3.2 seconds</div>
                </div>
              </div>

              <div className="hero-card">
                <div className="hcard-header">
                  <div>
                    <div className="hcard-title">Blood Panel Analysis</div>
                    <div className="hcard-sub">Uploaded · 2 minutes ago</div>
                  </div>
                  <div className="status-badge status-safe">Low Risk</div>
                </div>
                {/* ECG */}
                <div className="ecg-wrap">
                  <svg className="ecg-svg" viewBox="0 0 400 60" preserveAspectRatio="none">
                    <path className="ecg-line" d="M0 30 L40 30 L55 30 L60 10 L65 50 L70 10 L75 30 L90 30 L110 30 L125 30 L130 10 L135 50 L140 10 L145 30 L160 30 L180 30 L195 30 L200 10 L205 50 L210 10 L215 30 L230 30 L250 30 L265 30 L270 10 L275 50 L280 10 L285 30 L300 30 L320 30 L335 30 L340 10 L345 50 L350 10 L355 30 L380 30 L400 30" />
                  </svg>
                </div>
                <div className="metrics-grid">
                  <div className="metric-card metric-normal">
                    <div className="metric-label">Hemoglobin</div>
                    <div className="metric-val">14.2</div>
                    <div className="metric-range">g/dL · Normal</div>
                  </div>
                  <div className="metric-card metric-warn">
                    <div className="metric-label">WBC Count</div>
                    <div className="metric-val">11.2</div>
                    <div className="metric-range">K/μL · Elevated</div>
                  </div>
                </div>
                <div className="ai-summary">
                  <div className="ai-badge">AI Insight</div>
                  <div className="ai-text">Most values are within normal ranges. Your WBC count is slightly elevated — possibly due to mild infection or stress. Follow up recommended.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats">
        <div className="container">
          <div className="stats-inner">
            <div className="stat-item reveal">
              <div className="stat-num">
                <span className="counter" data-target="10">
                  0
                </span>
                <span>K+</span>
              </div>
              <div className="stat-label">Reports Analyzed</div>
            </div>
            <div className="stat-item reveal reveal-delay-1">
              <div className="stat-num">
                <span className="counter" data-target="99">
                  0
                </span>
                <span>%</span>
              </div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
            <div className="stat-item reveal reveal-delay-2">
              <div className="stat-num">
                <span className="counter" data-target="3">
                  0
                </span>
                <span>s</span>
              </div>
              <div className="stat-label">Avg. Analysis Time</div>
            </div>
            <div className="stat-item reveal reveal-delay-3">
              <div className="stat-num">
                <span className="counter" data-target="50">
                  0
                </span>
                <span>+</span>
              </div>
              <div className="stat-label">Report Types Supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section id="problem">
        <div className="container">
          <div className="section-header reveal">
            <div className="badge badge-gray">The Problem</div>
            <h2 className="section-h">Medical Reports Leave You in the Dark</h2>
            <p className="section-sub">
              80% of patients walk out of their doctor's office without understanding their results. Medical jargon shouldn't keep you from understanding your own body.
            </p>
          </div>
          <div className="problem-grid">
            <div className="problem-card pc-1 reveal reveal-delay-1">
              <div className="prob-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className="prob-title">Impenetrable Jargon</div>
              <div className="prob-text">
                Reports packed with Latin, abbreviations, and reference ranges no one explains to you. You leave more confused than when you arrived.
              </div>
            </div>
            <div className="problem-card pc-2 reveal reveal-delay-2">
              <div className="prob-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="prob-title">No Context, Just Numbers</div>
              <div className="prob-text">
                A number without context is meaningless. Is 11.2 K/μL bad? How bad? What causes it? Your report won't tell you.
              </div>
            </div>
            <div className="problem-card pc-3 reveal reveal-delay-3">
              <div className="prob-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="prob-title">Doctor Unreachable</div>
              <div className="prob-text">
                Questions arise at midnight, on weekends, on holidays. Your questions can't wait — but your doctor's available hours can.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="container">
          <div className="section-header reveal">
            <div className="badge badge-teal">Our Solution</div>
            <h2 className="section-h">Everything You Need to Understand Your Health</h2>
            <p className="section-sub">
              Health Lens transforms dense medical documents into clear, actionable insights you can actually use.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card reveal reveal-delay-1">
              <div className="fc-icon fc-blue">
                <svg viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div className="fc-title">Smart Report Analysis</div>
              <div className="fc-text">
                Upload PDFs, images, or photos of your lab reports. Our AI reads and understands blood panels, MRIs, prescriptions, and 50+ report types.
              </div>
            </div>
            <div className="feature-card reveal reveal-delay-2">
              <div className="fc-icon fc-teal">
                <svg viewBox="0 0 24 24">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div className="fc-title">Risk Assessment</div>
              <div className="fc-text">
                Get instant color-coded risk levels — Normal, Watch, or Act — for every metric. Understand what needs attention before your next appointment.
              </div>
            </div>
            <div className="feature-card reveal reveal-delay-3">
              <div className="fc-icon fc-purple">
                <svg viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="fc-title">24/7 AI Health Chat</div>
              <div className="fc-text">
                Ask follow-up questions about your results any time. Our AI doctor explains findings, suggests next steps, and helps you prepare for appointments.
              </div>
            </div>
            <div className="feature-card reveal reveal-delay-1">
              <div className="fc-icon fc-amber">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                </svg>
              </div>
              <div className="fc-title">Health Timeline</div>
              <div className="fc-text">
                Track changes in your metrics over time. Spot trends before they become problems. Every report you upload adds to your personal health story.
              </div>
            </div>
            <div className="feature-card reveal reveal-delay-2">
              <div className="fc-icon fc-rose">
                <svg viewBox="0 0 24 24">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="14" y1="1" x2="14" y2="4" />
                </svg>
              </div>
              <div className="fc-title">Prescription Decoder</div>
              <div className="fc-text">
                Understand every medication in your prescription — what it does, how to take it, side effects, and drug interactions explained in plain English.
              </div>
            </div>
            <div className="feature-card reveal reveal-delay-3">
              <div className="fc-icon fc-cyan">
                <svg viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="fc-title">Privacy First</div>
              <div className="fc-text">
                Bank-level 256-bit encryption. HIPAA compliant storage. Your health data never trains our models. You own your data — always.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how">
        <div className="container">
          <div className="section-header reveal">
            <div className="badge badge-blue">How It Works</div>
            <h2 className="section-h">From Upload to Insights in 3 Steps</h2>
            <p className="section-sub">No medical training needed. If you can take a photo, you can use Health Lens.</p>
          </div>
          <div className="steps-wrap">
            <div className="step reveal reveal-delay-1">
              <div className="step-num">01</div>
              <div className="step-title">Upload Your Report</div>
              <div className="step-text">
                Drop a PDF, snap a photo, or paste text. We support 50+ formats — blood tests, X-ray reports, prescriptions, and more.
              </div>
            </div>
            <div className="step reveal reveal-delay-2">
              <div className="step-num">02</div>
              <div className="step-title">AI Analyzes It</div>
              <div className="step-text">
                Our medical AI reads every value, cross-references clinical databases, and identifies anything that needs your attention.
              </div>
            </div>
            <div className="step reveal reveal-delay-3">
              <div className="step-num">03</div>
              <div className="step-title">Get Clear Insights</div>
              <div className="step-text">
                Receive a plain-language summary, risk flags, recommended actions, and the ability to chat with your AI health assistant.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section id="demo">
        <div className="container">
          <div className="demo-inner">
            <div className="demo-text">
              <div className="badge badge-teal" style={{ marginBottom: '20px' }}>
                See It In Action
              </div>
              <h2 className="section-h">Your Lab Results, Finally Explained</h2>
              <p className="section-sub" style={{ marginTop: '14px' }}>
                Upload your CBC, metabolic panel, lipid profile — anything. Watch Health Lens decode every number and flag what matters.
              </p>
              <div className="demo-list">
                <div className="demo-item">
                  <div className="demo-check">
                    <svg viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="demo-item-text">
                    <strong>Color-coded flags</strong> — instantly see which values are normal, borderline, or need action
                  </div>
                </div>
                <div className="demo-item">
                  <div className="demo-check">
                    <svg viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="demo-item-text">
                    <strong>Plain English explanations</strong> — no medical degree required to understand your own body
                  </div>
                </div>
                <div className="demo-item">
                  <div className="demo-check">
                    <svg viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="demo-item-text">
                    <strong>Personalized AI summary</strong> — tailored insights based on your specific results, not generic advice
                  </div>
                </div>
                <div className="demo-item">
                  <div className="demo-check">
                    <svg viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="demo-item-text">
                    <strong>Doctor-ready notes</strong> — export a summary to share with your physician at your next visit
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '36px' }}>
                <a href="#" className="btn btn-primary btn-lg">
                  Try It Free →
                </a>
              </div>
            </div>
            <div className="demo-mockup">
              <div className="mockup-bar">
                <div className="mockup-dots">
                  <div className="mockup-dot" style={{ background: '#EF4444' }}></div>
                  <div className="mockup-dot" style={{ background: '#FBBF24' }}></div>
                  <div className="mockup-dot" style={{ background: '#10B981' }}></div>
                </div>
                <div className="mockup-url">app.healthlens.ai/analysis/blood-panel</div>
              </div>
              <div className="mockup-body">
                <div className="report-chunk">
                  <div className="report-title">Complete Blood Count (CBC)</div>
                  <div className="report-rows">
                    <div className="report-row">
                      <span className="rr-name">Hemoglobin</span>
                      <div className="rr-bar-wrap">
                        <div className="rr-bar rr-bar-n" style={{ width: '78%' }}></div>
                      </div>
                      <span className="rr-val rr-normal">14.2 g/dL</span>
                    </div>
                    <div className="report-row">
                      <span className="rr-name">WBC Count</span>
                      <div className="rr-bar-wrap">
                        <div className="rr-bar rr-bar-w" style={{ width: '88%' }}></div>
                      </div>
                      <span className="rr-val rr-warn">11.2 K/μL</span>
                    </div>
                    <div className="report-row">
                      <span className="rr-name">Platelets</span>
                      <div className="rr-bar-wrap">
                        <div className="rr-bar rr-bar-n" style={{ width: '65%' }}></div>
                      </div>
                      <span className="rr-val rr-normal">240 K/μL</span>
                    </div>
                    <div className="report-row">
                      <span className="rr-name">Hematocrit</span>
                      <div className="rr-bar-wrap">
                        <div className="rr-bar rr-bar-n" style={{ width: '71%' }}></div>
                      </div>
                      <span className="rr-val rr-normal">42.1%</span>
                    </div>
                  </div>
                </div>
                <div className="report-chunk">
                  <div className="report-title">Metabolic Panel</div>
                  <div className="report-rows">
                    <div className="report-row">
                      <span className="rr-name">Glucose</span>
                      <div className="rr-bar-wrap">
                        <div className="rr-bar rr-bar-n" style={{ width: '55%' }}></div>
                      </div>
                      <span className="rr-val rr-normal">92 mg/dL</span>
                    </div>
                    <div className="report-row">
                      <span className="rr-name">Creatinine</span>
                      <div className="rr-bar-wrap">
                        <div className="rr-bar rr-bar-h" style={{ width: '95%' }}></div>
                      </div>
                      <span className="rr-val rr-high">1.42 mg/dL</span>
                    </div>
                    <div className="report-row">
                      <span className="rr-name">Sodium</span>
                      <div className="rr-bar-wrap">
                        <div className="rr-bar rr-bar-n" style={{ width: '60%' }}></div>
                      </div>
                      <span className="rr-val rr-normal">138 mEq/L</span>
                    </div>
                  </div>
                </div>
                <div className="insight-box">
                  <div className="insight-label">AI Health Insight</div>
                  <div className="insight-text">
                    2 values need attention: Your WBC count and Creatinine are above normal ranges. This may indicate early kidney strain or mild infection. Recommend follow-up with your GP within 1–2 weeks.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials">
        <div className="container">
          <div className="section-header reveal">
            <div className="badge badge-gray">Testimonials</div>
            <h2 className="section-h">Trusted by Thousands of Patients</h2>
            <p className="section-sub">
              From routine checkups to complex diagnoses — see how Health Lens is changing how people relate to their health.
            </p>
          </div>
          <div className="test-grid">
            <div className="test-card reveal reveal-delay-1">
              <div className="test-stars">
                <svg className="star" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg className="star" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg className="star" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg className="star" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg className="star" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="test-quote">
                "I uploaded my thyroid panel and finally understood what TSH levels actually mean for me. The AI walked me through everything my doctor didn't have time to explain.
                Life-changing."
              </div>
              <div className="test-author">
                <div className="test-avatar" style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                  PR
                </div>
                <div>
                  <div className="test-name">Priya Rajan</div>
                  <div className="test-role">Software Engineer · Mumbai</div>
                </div>
              </div>
            </div>
            <div className="test-card reveal reveal-delay-2">
              <div className="test-stars">
                <svg className="star" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg className="star" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg className="star" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg className="star" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg className="star" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="test-quote">
                "My father has diabetes and we upload every blood test. Health Lens catches trends we would've missed and helps us prepare really smart questions for his
                endocrinologist."
              </div>
              <div className="test-author">
                <div className="test-avatar" style={{ background: 'linear-gradient(135deg,#0EA5E9,#0284C7)' }}>
                  AK
                </div>
                <div>
                  <div className="test-name">Arjun Khanna</div>
                  <div className="test-role">Product Manager · Delhi</div>
                </div>
              </div>
            </div>
            <div className="test-card reveal reveal-delay-3">
              <div className="test-stars">
                <svg className="star" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg className="star" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg className="star" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg className="star" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg className="star" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="test-quote">
                "The prescription decoder alone is worth it. I used to blindly take whatever was prescribed. Now I understand exactly what I'm taking and why. I feel like
                an active participant in my healthcare."
              </div>
              <div className="test-author">
                <div className="test-avatar" style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}>
                  SM
                </div>
                <div>
                  <div className="test-name">Sanya Mehta</div>
                  <div className="test-role">Teacher · Bangalore</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST LOGOS */}
      <section id="trust">
        <div className="container">
          <div className="trust-inner">
            <div className="trust-title">Trusted and Compliant</div>
            <div className="trust-logos">
              <div className="trust-logo">
                <svg className="trust-logo-icon" viewBox="0 0 28 28" fill="none">
                  <rect width="28" height="28" rx="6" fill="#EFF6FF" />
                  <path d="M14 4l7 3v7c0 4.2-3 8.1-7 9.5C10 22.1 7 18.2 7 14V7l7-3z" stroke="#3B82F6" strokeWidth="1.5" fill="none" />
                </svg>
                HIPAA Compliant
              </div>
              <div className="trust-logo">
                <svg className="trust-logo-icon" viewBox="0 0 28 28" fill="none">
                  <rect width="28" height="28" rx="6" fill="#ECFDF5" />
                  <rect x="7" y="7" width="14" height="14" rx="3" stroke="#10B981" strokeWidth="1.5" fill="none" />
                  <path d="M10 14l3 3 5-5" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                SOC 2 Type II
              </div>
              <div className="trust-logo">
                <svg className="trust-logo-icon" viewBox="0 0 28 28" fill="none">
                  <rect width="28" height="28" rx="6" fill="#F5F3FF" />
                  <circle cx="14" cy="14" r="6" stroke="#8B5CF6" strokeWidth="1.5" fill="none" />
                  <path d="M14 10v4l2.5 2.5" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                256-bit AES
              </div>
              <div className="trust-logo">
                <svg className="trust-logo-icon" viewBox="0 0 28 28" fill="none">
                  <rect width="28" height="28" rx="6" fill="#FFF7ED" />
                  <path d="M8 20h12M14 8v12M10 12h8" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                GDPR Ready
              </div>
              <div className="trust-logo">
                <svg className="trust-logo-icon" viewBox="0 0 28 28" fill="none">
                  <rect width="28" height="28" rx="6" fill="#FFF1F2" />
                  <path
                    d="M7 14c0-3.9 3.1-7 7-7s7 3.1 7 7-3.1 7-7 7-7-3.1-7-7z"
                    stroke="#F43F5E"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path d="M14 11v6M11 14h6" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                ISO 27001
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-inner">
            <div>
              <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
                <div className="nav-logo-icon">H</div>
                <span className="nav-logo-text" style={{ color: '#fff', fontSize: '18px' }}>
                  Health Lens
                </span>
              </Link>
              <div className="footer-brand-desc">
                AI-powered medical report analysis that makes healthcare understandable for everyone.
              </div>
            </div>
            <div>
              <div className="footer-heading">Product</div>
              <div className="footer-links">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/upload">Upload Report</Link>
                <Link to="/history">Report History</Link>
                <Link to="/chat">AI Assistant</Link>
                <a href="#">Pricing</a>
              </div>
            </div>
            <div>
              <div className="footer-heading">Company</div>
              <div className="footer-links">
                <a href="#">About Us</a>
                <a href="#">Blog</a>
                <a href="#">Careers</a>
                <a href="#">Press Kit</a>
                <a href="#">Contact</a>
              </div>
            </div>
            <div>
              <div className="footer-heading">Legal</div>
              <div className="footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">HIPAA Notice</a>
                <a href="#">Cookie Policy</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2024 Health Lens. All rights reserved.</div>
            <div className="footer-hipaa">
              <div className="hipaa-dot"></div>
              HIPAA Compliant · All data encrypted in transit and at rest
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
