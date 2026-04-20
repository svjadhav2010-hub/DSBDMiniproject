import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useState } from 'react';

import Briefing   from './pages/Briefing';
import Upload     from './pages/Upload';
import Campaigns  from './pages/Campaigns';
import Dashboard  from './pages/Dashboard';
import Orders     from './pages/Orders';
import Predict    from './pages/Predict';
import Analytics  from './pages/Analytics';
import Messages   from './pages/Messages';
import Settings   from './pages/Settings';
import Login      from './pages/Login';
import NotificationPanel from './components/NotificationPanel';

function ProtectedRoute({ children }) {
  return localStorage.getItem('segiq_auth') === 'true' ? children : <Navigate to="/login" replace />;
}

const NAV = [
  { to:'/briefing',   icon:<HomeIcon />,     label:"Today's Plan",  badge: null        },
  { to:'/upload',     icon:<UploadIcon />,   label:'Upload Data',   badge: null        },
  { to:'/campaigns',  icon:<CampaignIcon />, label:'Campaigns',     badge: '★'         },
  { to:'/reports',    icon:<ChartIcon />,    label:'Reports',       badge: null        },
  { to:'/customers',  icon:<PeopleIcon />,   label:'Customers',     badge: null        },
  { to:'/predict',    icon:<PredictIcon />,  label:'Check Customer',badge: null        },
  { to:'/insights',   icon:<InsightIcon />,  label:'Insights',      badge: null        },
  { to:'/messages',   icon:<MsgIcon />,      label:'Messages',      badge: '•'         },
  { to:'/settings',   icon:<SettIcon />,     label:'Settings',      badge: null        },
];

const PAGE_TITLES = {
  '/briefing':   "Today's Plan",
  '/upload':     'Upload Data',
  '/campaigns':  'Send a Campaign',
  '/reports':    'Business Reports',
  '/customers':  'Your Customers',
  '/predict':    'Check a Customer',
  '/insights':   'How It Works',
  '/messages':   'Messages',
  '/settings':   'Settings',
};

function Sidebar() {
  const loc = useLocation();
  const handleLogout = () => { localStorage.removeItem('segiq_auth'); window.location.href='/login'; };
  return (
    <div style={{ width:'68px', background:'#fff', borderRight:'1px solid #e8eaf6', display:'flex', flexDirection:'column', alignItems:'center', padding:'18px 0', gap:'2px', minHeight:'100vh', position:'fixed', left:0, top:0, bottom:0, zIndex:50 }}>
      {/* Logo */}
      <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'linear-gradient(135deg,#5b8df0,#7c6fef)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px', flexShrink:0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" opacity="0.7"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" opacity="0.7"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" opacity="0.5"/>
        </svg>
      </div>

      {NAV.map((item,i) => {
        const active = loc.pathname === item.to;
        return (
          <div key={i} style={{ position:'relative', width:'100%', display:'flex', justifyContent:'center' }}>
            <Link to={item.to} title={item.label} style={{
              width:'44px', height:'44px', borderRadius:'12px',
              display:'flex', alignItems:'center', justifyContent:'center',
              background: active?'linear-gradient(135deg,#5b8df0,#7c6fef)':'transparent',
              color: active?'#fff':'#b0b8d4', textDecoration:'none',
              transition:'all 0.18s', position:'relative',
            }}>
              {item.icon}
              {item.badge && (
                <div style={{ position:'absolute', top:'7px', right:'7px', width:'7px', height:'7px', borderRadius:'50%', background:'#ef4444', border:'1.5px solid #fff' }}/>
              )}
            </Link>
            {active && <div style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%)', width:'3px', height:'22px', borderRadius:'2px 0 0 2px', background:'linear-gradient(135deg,#5b8df0,#7c6fef)' }}/>}
          </div>
        );
      })}

      <div style={{ flex:1 }}/>
      <button onClick={handleLogout} title="Sign out" style={{ width:'44px', height:'44px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', color:'#b0b8d4', background:'transparent', border:'none', cursor:'pointer', transition:'all 0.18s' }}>
        <LogoutIcon/>
      </button>
    </div>
  );
}

function Topbar({ showNotif, setShowNotif }) {
  const user  = localStorage.getItem('segiq_user') || 'Admin';
  const loc   = useLocation();
  const title = PAGE_TITLES[loc.pathname] || 'SegmentIQ';
  return (
    <div style={{ height:'64px', background:'#fff', borderBottom:'1px solid #e8eaf6', display:'flex', alignItems:'center', padding:'0 24px', gap:'16px', position:'sticky', top:0, zIndex:40 }}>
      <h1 style={{ margin:0, fontSize:'19px', fontWeight:'700', color:'#1a1d3a', flex:'0 0 auto' }}>{title}</h1>
      <div style={{ flex:1, maxWidth:'320px', marginLeft:'20px', background:'#f4f6fd', borderRadius:'10px', display:'flex', alignItems:'center', gap:'8px', padding:'0 14px', height:'38px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9fa8c7" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input placeholder="Search customers..." style={{ background:'transparent', border:'none', outline:'none', fontSize:'13px', color:'#6b7280', flex:1, fontFamily:'inherit' }}/>
      </div>
      <div style={{ flex:1 }}/>
      <div style={{ position:'relative', cursor:'pointer' }} onClick={()=>setShowNotif(v=>!v)}>
        <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:showNotif?'#eff4ff':'#fff8e6', border:showNotif?'1px solid #c7d7fd':'1px solid transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={showNotif?'#5b8df0':'#f59e0b'} strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <div style={{ position:'absolute', top:'-3px', right:'-3px', width:'16px', height:'16px', borderRadius:'50%', background:'#ef4444', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'8px', color:'#fff', fontWeight:'800' }}>3</div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginLeft:'6px' }}>
        <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'linear-gradient(135deg,#5b8df0,#7c6fef)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'12px', fontWeight:'700' }}>
          {user.slice(0,2).toUpperCase()}
        </div>
        <div>
          <p style={{ margin:0, fontSize:'13px', fontWeight:'600', color:'#1a1d3a' }}>{user}</p>
          <p style={{ margin:0, fontSize:'11px', color:'#9fa8c7' }}>Admin</p>
        </div>
      </div>
    </div>
  );
}

function AppShell() {
  const [showNotif, setShowNotif] = useState(false);
  return (
    <div style={{ display:'flex' }}>
      <Sidebar/>
      <div style={{ marginLeft:'68px', flex:1, minHeight:'100vh', background:'#eef1fb' }}>
        <Topbar showNotif={showNotif} setShowNotif={setShowNotif}/>
        <div style={{ padding:'24px 28px' }}>
          <Routes>
            <Route path="/"          element={<Navigate to="/briefing" replace/>}/>
            <Route path="/briefing"  element={<Briefing />}/>
            <Route path="/upload"    element={<Upload />}/>
            <Route path="/campaigns" element={<Campaigns />}/>
            <Route path="/reports"   element={<Dashboard />}/>
            <Route path="/customers" element={<Orders />}/>
            <Route path="/predict"   element={<Predict />}/>
            <Route path="/insights"  element={<Analytics />}/>
            <Route path="/messages"  element={<Messages />}/>
            <Route path="/settings"  element={<Settings />}/>
          </Routes>
        </div>
      </div>
      {showNotif && (
        <>
          <div onClick={()=>setShowNotif(false)} style={{ position:'fixed', inset:0, zIndex:199, background:'rgba(0,0,0,0.15)' }}/>
          <NotificationPanel onClose={()=>setShowNotif(false)}/>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#eef1fb; font-family:'Plus Jakarta Sans',sans-serif; }
        input::placeholder { color:#9fa8c7; }
        a:hover { opacity:0.85; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#e0e4f0; border-radius:10px; }
        button:active { transform:scale(0.98); }
      `}</style>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/*"     element={<ProtectedRoute><AppShell/></ProtectedRoute>}/>
      </Routes>
    </BrowserRouter>
  );
}

function HomeIcon()     { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
function UploadIcon()   { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> }
function CampaignIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.59 3.38 2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.1a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16"/></svg> }
function ChartIcon()    { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> }
function PeopleIcon()   { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
function PredictIcon()  { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> }
function InsightIcon()  { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 20h.01M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16h.01"/></svg> }
function MsgIcon()      { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function SettIcon()     { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> }
function LogoutIcon()   { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }