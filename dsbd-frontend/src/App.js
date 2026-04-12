import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Upload from './pages/Upload';
import Predict from './pages/Predict';
import Dashboard from './pages/Dashboard';

const NAV_ITEMS = [
  { to: '/dashboard', icon: <PieIcon />,    label: 'Dashboard' },
  { to: '/',          icon: <UploadIcon />, label: 'Upload'    },
  { to: '/predict',   icon: <PredictIcon />,label: 'Predict'   },
  { to: '/dashboard', icon: <ChartIcon />,  label: 'Analytics' },
  { to: '/dashboard', icon: <CartIcon />,   label: 'Orders'    },
  { to: '/dashboard', icon: <MsgIcon />,    label: 'Messages'  },
  { to: '/dashboard', icon: <SettIcon />,   label: 'Settings'  },
];

function Sidebar() {
  const loc = useLocation();
  return (
    <div style={{
      width: '72px', background: '#fff', borderRight: '1px solid #e8eaf6',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 0', gap: '8px', minHeight: '100vh',
      position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '12px',
        background: 'linear-gradient(135deg, #5b8df0, #7c6fef)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h4v4H4zM10 6h4v4h-4zM16 6h4v4h-4zM4 12h4v4H4zM10 12h4v4h-4zM16 12h4v4h-4z" fill="white" />
        </svg>
      </div>
      {NAV_ITEMS.map((item, i) => {
        const active = loc.pathname === item.to && i < 3;
        return (
          <Link key={i} to={item.to} title={item.label} style={{
            width: '44px', height: '44px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: active ? 'linear-gradient(135deg, #5b8df0, #7c6fef)' : 'transparent',
            color: active ? '#fff' : '#9fa8c7',
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}>
            {item.icon}
          </Link>
        );
      })}
      <div style={{ flex: 1 }} />
      <Link to="/" style={{
        width: '44px', height: '44px', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#9fa8c7', textDecoration: 'none',
      }}>
        <LogoutIcon />
      </Link>
    </div>
  );
}

function Topbar({ title }) {
  return (
    <div style={{
      height: '68px', background: '#fff',
      borderBottom: '1px solid #e8eaf6',
      display: 'flex', alignItems: 'center',
      padding: '0 28px', gap: '20px',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1a1d3a', flex: '0 0 auto' }}>
        {title}
      </h1>
      <div style={{
        flex: 1, maxWidth: '380px',
        background: '#f4f6fd', borderRadius: '12px',
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '0 16px', height: '40px', marginLeft: '24px',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fa8c7" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input placeholder="Search here..." style={{
          background: 'transparent', border: 'none', outline: 'none',
          fontSize: '13px', color: '#6b7280', flex: 1,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        }} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: '#fff8e6', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '4px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #5b8df0, #7c6fef)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '13px', fontWeight: '700',
        }}>SJ</div>
        <div>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1a1d3a' }}>Swayam</p>
          <p style={{ margin: 0, fontSize: '11px', color: '#9fa8c7' }}>Admin</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #eef1fb; font-family: 'Plus Jakarta Sans', sans-serif; }
        input::placeholder { color: #9fa8c7; }
      `}</style>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ marginLeft: '72px', flex: 1, minHeight: '100vh' }}>
          <PageWrapper />
        </div>
      </div>
    </BrowserRouter>
  );
}

function PageWrapper() {
  const loc = useLocation();
  const title = loc.pathname === '/dashboard' ? 'Dashboard'
    : loc.pathname === '/predict' ? 'Predict Segment'
    : 'Upload Data';
  return (
    <>
      <Topbar title={title} />
      <div style={{ padding: '24px 28px' }}>
        <Routes>
          <Route path="/"           element={<Upload />} />
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/predict"    element={<Predict />} />
        </Routes>
      </div>
    </>
  );
}

function PieIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg> }
function UploadIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> }
function PredictIcon(){ return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg> }
function ChartIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> }
function CartIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> }
function MsgIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function SettIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> }
function LogoutIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }