import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Upload from './pages/Upload';
import Predict from './pages/Predict';
import Dashboard from './pages/Dashboard';

function Navbar() {
  const location = useLocation();
  const links = [
    { to: '/', label: 'Upload' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/predict', label: 'Predict' },
  ];
  return (
    <nav style={{
      background: '#0a0a0f',
      borderBottom: '1px solid #1e1e2e',
      padding: '0 40px',
      display: 'flex',
      alignItems: 'center',
      gap: '40px',
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: '10px', height: '10px', background: 'white', borderRadius: '50%' }} />
        </div>
        <span style={{
          color: '#fff', fontWeight: '700', fontSize: '17px',
          fontFamily: '"DM Sans", sans-serif', letterSpacing: '-0.3px'
        }}>
          SegmentIQ
        </span>
      </div>
      <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
        {links.map(l => {
          const active = location.pathname === l.to;
          return (
            <Link key={l.to} to={l.to} style={{
              color: active ? '#fff' : '#6b7280',
              textDecoration: 'none',
              fontSize: '14px',
              fontFamily: '"DM Sans", sans-serif',
              padding: '6px 14px',
              borderRadius: '6px',
              background: active ? '#1e1e2e' : 'transparent',
              transition: 'all 0.15s',
              fontWeight: active ? '500' : '400',
            }}>{l.label}</Link>
          );
        })}
      </div>
      <div style={{
        fontSize: '12px', color: '#4b5563',
        fontFamily: 'monospace',
        background: '#111827',
        padding: '4px 10px',
        borderRadius: '6px',
        border: '1px solid #1f2937'
      }}>
        API: localhost:8000
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div style={{
        fontFamily: '"DM Sans", "Segoe UI", sans-serif',
        minHeight: '100vh',
        background: '#07070d',
        color: '#e5e7eb',
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <Navbar />
        <Routes>
          <Route path="/"           element={<Upload />} />
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/predict"    element={<Predict />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;