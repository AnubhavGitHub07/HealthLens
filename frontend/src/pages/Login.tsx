import { useState } from 'react';
import './../styles/Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful login - replace with actual authentication
      localStorage.setItem('authToken', 'mock-token-' + Date.now());
      window.location.href = '/dashboard';
    } catch {
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Left side - Brand */}
        <div className="auth-brand-section">
          <div className="auth-brand">
            <div className="brand-logo">
              <div className="logo-icon">HL</div>
            </div>
            <h1 className="brand-title">HealthLens</h1>
            <p className="brand-tagline">Your AI Health Companion</p>
          </div>

          <div className="auth-benefits">
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <p>Instant health report analysis</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <p>24/7 AI health assistant</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <p>Bank-level security & HIPAA compliant</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <p>Track your health journey</p>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <h2>Sign In</h2>
            <p className="auth-form-subtitle">Welcome back! Sign in to your account</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="form-footer">
                <label className="remember-me">
                  <input type="checkbox" />
                  Remember me
                </label>
                <a href="/forgot-password" className="forgot-link">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="social-login">
              <button className="social-btn google">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
                </svg>
                Google
              </button>
              <button className="social-btn apple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.05 13.5c-.91 2.18-.69 4.05.6 5.33 1.48 1.48 3.72.72 4.97-1.48.32-.59.56-1.22.7-1.9-2.1-.13-3.65-.58-5.27-2.05zm-4.5-7c1.14 0 1.97-.86 1.97-1.97S13.69 2.56 12.55 2.56c-1.14 0-1.97.86-1.97 1.97S11.41 6.5 12.55 6.5z"/>
                </svg>
                Apple
              </button>
            </div>

            <p className="auth-footer-text">
              Don't have an account?{' '}
              <a href="/signup" className="auth-link">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
