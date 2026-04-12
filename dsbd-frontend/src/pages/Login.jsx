import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DEMO_USERS = [
  { email: 'admin@segmentiq.com', password: 'admin123', name: 'Swayam' },
  { email: 'demo@segmentiq.com',  password: 'demo123',  name: 'Demo User' },
];

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    setTimeout(() => {
      const user = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem('segiq_auth', 'true');
        localStorage.setItem('segiq_user', user.name);
        navigate('/dashboard');
      } else {
        setError('Invalid email or password.');
      }
      setLoading(false);
    }, 800);
  };

  const fillDemo = () => { setEmail('admin@segmentiq.com'); setPassword('admin123'); };

  return (
    <div style={{
      minHeight: '100vh', background: '#eef1fb',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: '960px', minHeight: '540px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(91,141,240,0.15)' }}>

        {/* Left panel — blue gradient */}
        <div style={{
          flex: 1, background: 'linear-gradient(145deg, #5b8df0 0%, #7c6fef 60%, #9b59f5 100%)',
          padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          color: '#fff',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" opacity="0.7"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" opacity="0.7"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" opacity="0.5"/>
              </svg>
            </div>
            <span style={{ fontSize: '18px', fontWeight: '700' }}>SegmentIQ</span>
          </div>

          {/* Hero text */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', opacity: 0.7, marginBottom: '12px' }}>
              DSBD MINI PROJECT
            </p>
            <h2 style={{ fontSize: '30px', fontWeight: '800', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.5px' }}>
              Customer<br />Segmentation<br />Platform
            </h2>
            <p style={{ fontSize: '14px', opacity: 0.8, lineHeight: 1.6, maxWidth: '280px' }}>
              Upload transaction data, run RFM analysis, and get AI-powered customer segments in seconds.
            </p>
          </div>

          {/* Feature chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              ['📊', 'RFM Analysis + K-Means Clustering'],
              ['🎯', '4 Classifiers: LR, KNN, DT, SVM'],
              ['📈', 'Live Dashboard with Charts'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', flexShrink: 0,
                }}>{icon}</div>
                <span style={{ fontSize: '13px', opacity: 0.9 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — login form */}
        <div style={{
          flex: 1, background: '#fff', padding: '48px 40px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1d3a', marginBottom: '6px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '14px', color: '#9fa8c7', marginBottom: '32px' }}>
            Sign in to your SegmentIQ account
          </p>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Email address
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@segmentiq.com" required
                style={{
                  width: '100%', padding: '12px 14px',
                  border: '1px solid #e8eaf6', borderRadius: '10px',
                  fontSize: '14px', color: '#1a1d3a', background: '#fafbff',
                  outline: 'none', fontFamily: '"Plus Jakarta Sans", sans-serif',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{
                    width: '100%', padding: '12px 44px 12px 14px',
                    border: '1px solid #e8eaf6', borderRadius: '10px',
                    fontSize: '14px', color: '#1a1d3a', background: '#fafbff',
                    outline: 'none', fontFamily: '"Plus Jakarta Sans", sans-serif',
                  }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#9fa8c7', padding: '2px',
                }}>
                  {showPass
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <span style={{ fontSize: '12px', color: '#5b8df0', cursor: 'pointer', fontWeight: '500' }}>
                Forgot password?
              </span>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', marginBottom: '16px',
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '8px', color: '#dc2626', fontSize: '13px',
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? '#e8eaf6' : 'linear-gradient(135deg, #5b8df0, #7c6fef)',
              color: loading ? '#9fa8c7' : '#fff',
              border: 'none', borderRadius: '12px',
              fontSize: '15px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              marginBottom: '16px',
            }}>
              {loading ? '⟳  Signing in...' : 'Sign in'}
            </button>

            {/* Demo credentials hint */}
            <div style={{
              padding: '12px 14px', background: '#f4f6fd',
              borderRadius: '10px', border: '1px solid #e0e7ff',
            }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: '600', color: '#5b8df0' }}>
                Demo credentials
              </p>
              <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                admin@segmentiq.com / admin123
              </p>
              <button type="button" onClick={fillDemo} style={{
                marginTop: '6px', fontSize: '12px', color: '#5b8df0',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: '"Plus Jakarta Sans", sans-serif', padding: 0,
                fontWeight: '600',
              }}>
                → Auto-fill credentials
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}