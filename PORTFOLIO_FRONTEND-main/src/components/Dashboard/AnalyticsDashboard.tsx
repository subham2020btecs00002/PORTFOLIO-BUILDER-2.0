import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { FaEye, FaEnvelope, FaClock, FaCopy, FaQrcode, FaEdit, FaExternalLinkAlt, FaTools, FaRobot, FaSyncAlt, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaLayerGroup } from 'react-icons/fa';
import QRCode from 'qrcode';
import { toast } from 'react-toastify';
import type { IntelligenceEvaluationData } from '../../types';
import './AnalyticsDashboard.css';

interface AnalyticsRes {
  views: number;
  contactCount: number;
  lastVisited: string | null;
}

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsRes | null>(null);
  const [evaluation, setEvaluation] = useState<IntelligenceEvaluationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [displayViews, setDisplayViews] = useState(0);
  const [displayContacts, setDisplayContacts] = useState(0);

  // Animated counter: uses requestAnimationFrame — no library, zero cost
  const animateCount = useCallback((target: number, setter: (v: number) => void) => {
    if (target === 0) return;
    const duration = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setter(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  const publicUrl = user?.username 
    ? `${window.location.origin}/p/${user.username}` 
    : '';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, evalRes] = await Promise.allSettled([
          api.get<AnalyticsRes>('/api/portfolio/analytics'),
          api.get<IntelligenceEvaluationData>('/api/portfolio/intelligence/evaluation'),
        ]);

        if (analyticsRes.status === 'fulfilled') {
          setAnalytics(analyticsRes.value.data);
          animateCount(analyticsRes.value.data.views, setDisplayViews);
          animateCount(analyticsRes.value.data.contactCount, setDisplayContacts);
        } else if ((analyticsRes.reason as any)?.response?.status === 404) {
          toast.info('Please create your portfolio first!');
          navigate('/portfolio');
          return;
        }

        if (evalRes.status === 'fulfilled' && evalRes.value.data) {
          setEvaluation(evalRes.value.data);
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    void fetchDashboardData();
  }, [navigate, animateCount]);

  const handleRefreshEvaluation = async () => {
    try {
      setEvaluating(true);
      const { data } = await api.post<IntelligenceEvaluationData>('/api/portfolio/intelligence/evaluate');
      setEvaluation(data);
      toast.success('AI ATS Score & SHAP Insights updated!');
    } catch (err) {
      console.error('Failed to refresh evaluation:', err);
      toast.error('Failed to re-evaluate portfolio intelligence.');
    } finally {
      setEvaluating(false);
    }
  };

  useEffect(() => {
    if (publicUrl) {
      QRCode.toDataURL(publicUrl, { width: 160, margin: 1 })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Error generating QR code:', err));
    }
  }, [publicUrl]);

  const handleCopyLink = () => {
    if (!publicUrl) {
      toast.warning('Set your username in settings first to get a custom link!');
      return;
    }
    navigator.clipboard.writeText(publicUrl);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    // Skeleton placeholders — match the real card layout so there's no layout shift
    return (
      <div className="dashboard-wrapper portfolio-page-wrapper">
        <div className="dashboard-header">
          <div>
            <div className="skeleton" style={{ width: 200, height: 36, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 300, height: 18 }} />
          </div>
        </div>
        <div className="analytics-stats-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="stat-card card-glass">
              <div className="skeleton" style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 10 }} />
                <div className="skeleton" style={{ width: '40%', height: 32 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper portfolio-page-wrapper animated fade-in">
      <div className="dashboard-header">
        <div>
          <h1>Your Dashboard</h1>
          <p className="dashboard-sub">Monitor your portfolio visitor activities and settings.</p>
        </div>
        <div className="dashboard-action-buttons">
          <button className="btn-secondary" onClick={() => navigate('/portfolio/edit')}>
            <FaEdit /> Edit Portfolio
          </button>
          {user?.username && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>
              <FaExternalLinkAlt /> View Live
            </a>
          )}
        </div>
      </div>

      {!user?.username && (
        <div className="alert-setup card-glass">
          <FaTools className="alert-icon" />
          <div>
            <h4>Custom URL Slug Required</h4>
            <p>You haven't set a custom username yet. Go to settings to claim your unique link like <code>/p/yourname</code>.</p>
            <button className="btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => navigate('/settings')}>
              Claim Slug
            </button>
          </div>
        </div>
      )}

      {/* Analytics stats */}
      <div className="analytics-stats-grid">
        <div className="stat-card card-glass">
          <div className="stat-icon icon-blue"><FaEye /></div>
          <div className="stat-content">
            <span className="stat-label">Total Profile Views</span>
            <h3 className="stat-value">{displayViews}</h3>
          </div>
        </div>

        <div className="stat-card card-glass">
          <div className="stat-icon icon-green"><FaEnvelope /></div>
          <div className="stat-content">
            <span className="stat-label">Contact Messages</span>
            <h3 className="stat-value">{displayContacts}</h3>
          </div>
        </div>

        <div className="stat-card card-glass">
          <div className="stat-icon icon-purple"><FaClock /></div>
          <div className="stat-content">
            <span className="stat-label">Last Visited Time</span>
            <h3 className="stat-value" style={{ fontSize: '1.2rem', fontWeight: 600 }}>
              {analytics?.lastVisited 
                ? new Date(analytics.lastVisited).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'No visits yet'}
            </h3>
          </div>
        </div>
      </div>

      {/* Portfolio Intelligence & Explainable AI (SHAP) Section */}
      <div className="intelligence-section card-glass">
        <div className="intelligence-header">
          <div className="intelligence-title-group">
            <div className="intelligence-badge">
              <FaRobot className="sparkle-icon" /> AI ATS Intelligence
            </div>
            <h2>Machine Learning Portfolio Benchmark</h2>
            <p className="intelligence-sub">
              Trained on 470+ real developer profiles. Explains exact scoring drivers via Shapley additive feature attribution.
            </p>
          </div>
          <div className="intelligence-header-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn-primary intelligence-open-full-btn"
              onClick={() => navigate('/portfolio/intelligence')}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <FaRobot /> Full ML Benchmark &amp; Validation →
            </button>
            <button 
              className="btn-secondary intelligence-refresh-btn" 
              onClick={handleRefreshEvaluation}
              disabled={evaluating}
            >
              <FaSyncAlt className={evaluating ? 'spin-icon' : ''} /> 
              {evaluating ? 'Re-evaluating...' : 'Recalculate AI Score'}
            </button>
          </div>
        </div>

        {evaluation ? (
          <div className="intelligence-body-grid">
            {/* Left Column: ATS Score Gauge & Quick Metrics */}
            <div className="intelligence-score-card">
              <div className="score-radial-wrapper">
                <svg className="score-radial-svg" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" className="radial-bg" />
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    className="radial-progress" 
                    strokeDasharray={314}
                    strokeDashoffset={314 - (314 * Math.min(100, Math.max(0, evaluation.atsScore))) / 100}
                  />
                </svg>
                <div className="radial-inner-content">
                  <span className="score-number">{evaluation.atsScore}</span>
                  <span className="score-max">/100</span>
                </div>
              </div>

              <div className="score-grade-badge">
                <span className="grade-label">ATS Readiness Tier:</span>
                <span className={`grade-pill grade-${evaluation.grade.replace('+', '-plus').replace('-', '-minus').toLowerCase()}`}>
                  {evaluation.grade} Tier
                </span>
              </div>

              <div className="quick-metrics-row">
                <div className="quick-metric-item">
                  <span className="metric-label">Readability</span>
                  <span className="metric-val">{evaluation.readabilityIndex}</span>
                </div>
                <div className="quick-metric-item">
                  <span className="metric-label">Metric Density</span>
                  <span className="metric-val">{Math.round(evaluation.metricDensity * 100)}%</span>
                </div>
                <div className="quick-metric-item">
                  <span className="metric-label">Action Verbs</span>
                  <span className="metric-val">{Math.round(evaluation.actionVerbRatio * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Right Column: SHAP Waterfall Impact Factors & Recommendations */}
            <div className="intelligence-insights-column">
              <h3><FaLightbulb className="section-icon-gold" /> Key Scoring Drivers (SHAP Explainability)</h3>
              <p className="insights-sub">How specific elements of your portfolio impacted your score:</p>

              <div className="shap-factors-list">
                {evaluation.shapExplanations.map((exp, idx) => (
                  <div key={idx} className={`shap-factor-card factor-${exp.direction}`}>
                    <div className="factor-header">
                      <div className="factor-name-group">
                        {exp.direction === 'positive' ? (
                          <FaCheckCircle className="factor-icon-pos" />
                        ) : (
                          <FaExclamationTriangle className="factor-icon-neg" />
                        )}
                        <span className="factor-name">{exp.feature}</span>
                      </div>
                      <span className={`factor-points points-${exp.direction}`}>
                        {exp.impact > 0 ? `+${exp.impact}` : `${exp.impact}`} pts
                      </span>
                    </div>
                    <p className="factor-advice">{exp.advice}</p>
                  </div>
                ))}
              </div>

              {/* Skill Gap Recommender Chips */}
              {evaluation.skillRecommendations && evaluation.skillRecommendations.length > 0 && (
                <div className="skill-gaps-container">
                  <h4><FaLayerGroup className="section-icon-indigo" /> High-Leverage Tech Recommendations</h4>
                  <p className="skill-gaps-sub">Top complementary technologies to level up your market fit:</p>
                  <div className="skill-chips-row">
                    {evaluation.skillRecommendations.map((rec, idx) => (
                      <div key={idx} className="skill-recommendation-chip">
                        <span className="chip-name">{rec.skill}</span>
                        <span className="chip-match">{Math.round(rec.relevanceScore * 100)}% match</span>
                        <span className="chip-cat">{rec.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="intelligence-loading-placeholder">
            <FaRobot className="spin-icon placeholder-robot" />
            <p>Analyzing portfolio text against 24 machine learning features...</p>
          </div>
        )}
      </div>

      {/* Share Section */}
      {user?.username && (
        <div className="dashboard-share-section grid-2col">
          <div className="share-link-card card-glass">
            <h3>Share Link</h3>
            <p>Your unique public portfolio URL link is ready to be shared with employers.</p>
            <div className="dashboard-link-input-group">
              <input type="text" value={publicUrl} readOnly />
              <button onClick={handleCopyLink}>
                <FaCopy /> Copy
              </button>
            </div>
            <p className="share-helper">Paste this URL on your LinkedIn, resume CV, or email signatures.</p>
          </div>

          <div className="share-qr-card card-glass">
            <h3>QR Code Profile</h3>
            <p>Let people scan this QR Code to access your portfolio directly.</p>
            <div className="qr-preview-wrapper">
              {qrCodeUrl ? (
                <>
                  <img src={qrCodeUrl} alt="QR Code Profile" />
                  <a href={qrCodeUrl} download={`${user.username}-portfolio-qr.png`} className="btn-secondary" style={{ marginTop: '16px', fontSize: '0.85rem' }}>
                    <FaQrcode /> Download QR Code
                  </a>
                </>
              ) : (
                <div className="skeleton" style={{ width: 160, height: 160, borderRadius: 8 }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Embed Iframe Section */}
      {user?.username && (
        <div className="dashboard-embed-section card-glass" style={{ marginTop: '24px', padding: '32px' }}>
          <h3>Embed Portfolio on Your Website</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Want to display your portfolio card on your personal blog or external website? Copy the iframe embed code snippet below.
          </p>
          <div className="dashboard-link-input-group">
            <input 
              type="text" 
              value={`<iframe src="${publicUrl}" width="100%" height="600" style="border:1px solid rgba(0,0,0,0.1); border-radius:12px;" title="${user.username}'s Portfolio"></iframe>`} 
              readOnly 
            />
            <button onClick={() => {
              navigator.clipboard.writeText(`<iframe src="${publicUrl}" width="100%" height="600" style="border:1px solid rgba(0,0,0,0.1); border-radius:12px;" title="${user.username}'s Portfolio"></iframe>`);
              toast.success('Embed iframe code copied to clipboard!');
            }}>
              <FaCopy /> Copy Code
            </button>
          </div>
        </div>
      )}


    </div>
  );
};

export default AnalyticsDashboard;
