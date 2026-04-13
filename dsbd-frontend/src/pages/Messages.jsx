import { useState } from 'react';

const card = (e={}) => ({ background:'#fff', borderRadius:'16px', padding:'20px 22px', border:'1px solid #e8eaf6', ...e });

const THREADS = [
  { id:1, name:'Champions Campaign', avatar:'👑', last:'Loyalty rewards email sent to 9 customers.', time:'2m', unread:2, color:'#5b8df0' },
  { id:2, name:'At-Risk Re-engagement', avatar:'⚠️', last:'Win-back discount code dispatched.', time:'1h', unread:1, color:'#f59e0b' },
  { id:3, name:'Lost Customers',  avatar:'😴', last:'Final re-engagement attempt scheduled.', time:'3h', unread:0, color:'#ef4444' },
  { id:4, name:'Loyal Upsell',    avatar:'🔁', last:'Premium membership offer sent.', time:'1d', unread:0, color:'#22c55e' },
  { id:5, name:'Data Team',       avatar:'📊', last:'New segmentation run complete.', time:'2d', unread:0, color:'#8b5cf6' },
];

const MSGS = {
  1: [
    { from:'System', text:'Champions campaign initiated for 9 customers.', time:'10:02' },
    { from:'System', text:'Email template: "Exclusive early access — thank you for being our best customer".', time:'10:03' },
    { from:'You',    text:'Great. Please also add a 15% loyalty discount code.', time:'10:15' },
    { from:'System', text:'Discount code CHAMP15 added to all outgoing emails.', time:'10:16' },
  ],
  2: [
    { from:'System', text:'3,403 At-Risk customers identified. Win-back campaign ready.', time:'09:00' },
    { from:'You',    text:'Send them a 20% discount valid for 7 days.', time:'09:10' },
    { from:'System', text:'Discount COMEBACK20 dispatched to all At-Risk customers.', time:'09:11' },
  ],
  3: [
    { from:'System', text:'1,874 Lost customers. Recommend final re-engagement.', time:'Yesterday' },
    { from:'You',    text:'Schedule one last campaign then archive them.', time:'Yesterday' },
  ],
  4: [
    { from:'System', text:'390 Loyal customers eligible for upsell.', time:'1d ago' },
    { from:'System', text:'Premium membership offer sent successfully.', time:'1d ago' },
  ],
  5: [
    { from:'Data Team', text:'Segmentation complete — 5,676 customers processed.', time:'2d ago' },
    { from:'You',       text:'Looks good. Share the report with stakeholders.', time:'2d ago' },
  ],
};

export default function Messages() {
  const [active, setActive] = useState(1);
  const [input, setInput]   = useState('');
  const [msgs, setMsgs]     = useState(MSGS);

  const send = () => {
    if (!input.trim()) return;
    setMsgs(prev => ({ ...prev, [active]: [...(prev[active]||[]), { from:'You', text:input, time:'Now' }] }));
    setInput('');
  };

  const thread = THREADS.find(t => t.id === active);

  return (
    <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'18px', height:'calc(100vh - 130px)' }}>
      {/* Thread list */}
      <div style={{ ...card({ padding:0 }), overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'16px 18px', borderBottom:'1px solid #f0f2ff' }}>
          <p style={{ margin:'0 0 10px', fontWeight:'700', fontSize:'15px', color:'#1a1d3a' }}>Messages</p>
          <div style={{ background:'#f4f6fd', borderRadius:'8px', display:'flex', alignItems:'center', gap:'6px', padding:'0 12px', height:'32px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9fa8c7" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search..." style={{ background:'transparent', border:'none', outline:'none', fontSize:'12px', color:'#1a1d3a', flex:1, fontFamily:'inherit' }}/>
          </div>
        </div>
        <div style={{ overflowY:'auto', flex:1 }}>
          {THREADS.map(t => (
            <div key={t.id} onClick={() => setActive(t.id)} style={{
              display:'flex', gap:'10px', padding:'12px 18px', cursor:'pointer',
              background: active===t.id ? '#f4f7ff' : '#fff',
              borderLeft: active===t.id ? `3px solid ${t.color}` : '3px solid transparent',
              borderBottom:'1px solid #f8f9fc',
            }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:t.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>{t.avatar}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                  <p style={{ margin:0, fontSize:'13px', fontWeight:'700', color:'#1a1d3a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.name}</p>
                  <span style={{ fontSize:'10px', color:'#9fa8c7', flexShrink:0, marginLeft:'4px' }}>{t.time}</span>
                </div>
                <p style={{ margin:0, fontSize:'11px', color:'#9fa8c7', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.last}</p>
              </div>
              {t.unread > 0 && (
                <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:'#5b8df0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', color:'#fff', fontWeight:'700', flexShrink:0 }}>{t.unread}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat pane */}
      <div style={{ ...card({ padding:0 }), display:'flex', flexDirection:'column' }}>
        {/* Chat header */}
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #f0f2ff', display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:thread.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>{thread.avatar}</div>
          <div>
            <p style={{ margin:'0 0 1px', fontWeight:'700', fontSize:'14px', color:'#1a1d3a' }}>{thread.name}</p>
            <p style={{ margin:0, fontSize:'11px', color:'#22c55e', fontWeight:'600' }}>● Active</p>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:'12px' }}>
          {(msgs[active]||[]).map((m,i) => (
            <div key={i} style={{ display:'flex', justifyContent: m.from==='You' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth:'70%', padding:'10px 14px', borderRadius: m.from==='You' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: m.from==='You' ? 'linear-gradient(135deg,#5b8df0,#7c6fef)' : '#f4f6fd',
                color: m.from==='You' ? '#fff' : '#1a1d3a',
              }}>
                {m.from !== 'You' && <p style={{ margin:'0 0 4px', fontSize:'10px', fontWeight:'700', color:thread.color, opacity:0.8 }}>{m.from}</p>}
                <p style={{ margin:'0 0 4px', fontSize:'13px', lineHeight:1.4 }}>{m.text}</p>
                <p style={{ margin:0, fontSize:'10px', opacity:0.6, textAlign: m.from==='You'?'right':'left' }}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding:'14px 20px', borderTop:'1px solid #f0f2ff', display:'flex', gap:'10px' }}>
          <input value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&send()}
            placeholder="Type a message..." style={{
              flex:1, padding:'10px 14px', border:'1px solid #e8eaf6',
              borderRadius:'10px', fontSize:'13px', color:'#1a1d3a',
              background:'#f8f9ff', outline:'none', fontFamily:'inherit',
            }}/>
          <button onClick={send} style={{
            padding:'10px 18px', background:'linear-gradient(135deg,#5b8df0,#7c6fef)',
            border:'none', borderRadius:'10px', color:'#fff', cursor:'pointer',
            fontSize:'13px', fontWeight:'600', fontFamily:'inherit',
          }}>Send</button>
        </div>
      </div>
    </div>
  );
}