import { useState } from 'react';

const INITIAL = [
  { id:1, read:false, icon:'📊', title:'Segmentation complete', body:'5,676 customers split into 4 segments.', time:'2 min ago' },
  { id:2, read:false, icon:'⚠️', title:'At-Risk segment growing', body:'3,403 customers flagged as At-Risk (+4.9%).', time:'1 hr ago' },
  { id:3, read:false, icon:'🎯', title:'Model retrained', body:'Decision Tree accuracy: 94.2% on latest data.', time:'3 hr ago' },
  { id:4, read:true,  icon:'📁', title:'Export downloaded', body:'segments.json was exported successfully.', time:'Yesterday' },
  { id:5, read:true,  icon:'👑', title:'New Champion detected', body:'Customer #17850 upgraded to Champions.', time:'Yesterday' },
];

export default function NotificationPanel({ onClose }) {
  const [notes, setNotes] = useState(INITIAL);
  const unread = notes.filter(n => !n.read).length;

  const markAll  = () => setNotes(notes.map(n => ({ ...n, read: true })));
  const markOne  = (id) => setNotes(notes.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteOne = (id) => setNotes(notes.filter(n => n.id !== id));

  return (
    <div style={{
      position:'fixed', top:0, right:0, bottom:0, width:'360px',
      background:'#fff', boxShadow:'-4px 0 24px rgba(0,0,0,0.10)',
      zIndex:200, display:'flex', flexDirection:'column',
      fontFamily:'"Plus Jakarta Sans", sans-serif',
    }}>
      {/* Header */}
      <div style={{ padding:'20px 20px 14px', borderBottom:'1px solid #f0f2ff', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <p style={{ margin:'0 0 2px', fontWeight:'700', fontSize:'16px', color:'#1a1d3a' }}>Notifications</p>
          <p style={{ margin:0, fontSize:'12px', color:'#9fa8c7' }}>{unread} unread</p>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          {unread > 0 && (
            <button onClick={markAll} style={{ padding:'6px 12px', background:'#eff4ff', border:'none', borderRadius:'8px', color:'#5b8df0', fontSize:'12px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit' }}>
              Mark all read
            </button>
          )}
          <button onClick={onClose} style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#f4f6fd', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#6b7280' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
        {notes.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'#9fa8c7' }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>🎉</div>
            <p style={{ fontWeight:'600', color:'#1a1d3a' }}>All caught up!</p>
            <p style={{ fontSize:'13px' }}>No notifications.</p>
          </div>
        ) : notes.map(n => (
          <div key={n.id} onClick={() => markOne(n.id)} style={{
            display:'flex', gap:'12px', padding:'14px 20px',
            background: n.read ? '#fff' : '#f8f9ff',
            borderLeft: n.read ? '3px solid transparent' : '3px solid #5b8df0',
            cursor:'pointer', transition:'background 0.15s',
          }}>
            <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'#f4f6fd', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>
              {n.icon}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ margin:'0 0 2px', fontSize:'13px', fontWeight: n.read ? '500' : '700', color:'#1a1d3a' }}>{n.title}</p>
              <p style={{ margin:'0 0 4px', fontSize:'12px', color:'#6b7280', lineHeight:1.4 }}>{n.body}</p>
              <p style={{ margin:0, fontSize:'11px', color:'#9fa8c7' }}>{n.time}</p>
            </div>
            <button onClick={e => { e.stopPropagation(); deleteOne(n.id); }} style={{ background:'none', border:'none', cursor:'pointer', color:'#d1d5db', padding:'2px', flexShrink:0, alignSelf:'flex-start' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding:'14px 20px', borderTop:'1px solid #f0f2ff', textAlign:'center' }}>
        <button onClick={() => setNotes([])} style={{ fontSize:'12px', color:'#ef4444', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:'600' }}>
          Clear all notifications
        </button>
      </div>
    </div>
  );
}