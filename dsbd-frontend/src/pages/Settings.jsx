import { useState } from 'react';

const card = (e = {}) => ({ background:'#fff', borderRadius:'16px', padding:'22px 24px', border:'1px solid #e8eaf6', ...e });

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width:'40px', height:'22px', borderRadius:'11px', cursor:'pointer',
      background: value ? 'linear-gradient(135deg,#5b8df0,#7c6fef)' : '#e5e7eb',
      position:'relative', transition:'background 0.2s', flexShrink:0,
    }}>
      <div style={{
        position:'absolute', top:'3px', left: value ? '21px' : '3px',
        width:'16px', height:'16px', borderRadius:'50%', background:'#fff',
        transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.15)',
      }}/>
    </div>
  );
}

export default function Settings() {
  const user = localStorage.getItem('segiq_user') || 'Swayam';
  const [name, setName]   = useState(user);
  const [saved, setSaved] = useState(false);

  const [notifs, setNotifs] = useState({
    segmentation: true, atRisk: true, export: false, weekly: true,
  });

  const [model, setModel]       = useState('decision_tree');
  const [clusters, setClusters] = useState(4);
  const [theme, setTheme]       = useState('light');

  const save = () => {
    localStorage.setItem('segiq_user', name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Plain-language model descriptions
  const models = [
    {
      val: 'decision_tree',
      label: 'Decision Tree',
      badge: '✅ Recommended',
      desc: 'Most accurate (94%). Works like a flowchart of yes/no questions. Easy to understand why it made a decision.',
    },
    {
      val: 'svm',
      label: 'Support Vector',
      badge: '91% accurate',
      desc: 'Very reliable, especially when customer groups overlap. Slightly harder to explain.',
    },
    {
      val: 'knn',
      label: 'Nearest Neighbour',
      badge: '88% accurate',
      desc: 'Groups customers by finding others who behave similarly. Good for spotting patterns.',
    },
    {
      val: 'logistic',
      label: 'Simple Scoring',
      badge: '82% accurate',
      desc: 'Fastest to run. Best when you need quick results and explanations are important.',
    },
  ];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px', alignItems:'start' }}>

      {/* Profile */}
      <div style={card()}>
        <p style={{ fontWeight:'700', fontSize:'15px', color:'#1a1d3a', margin:'0 0 18px' }}>Your Profile</p>
        <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'20px' }}>
          <div style={{ width:'56px', height:'56px', borderRadius:'16px', background:'linear-gradient(135deg,#5b8df0,#7c6fef)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'18px', fontWeight:'700' }}>
            {name.slice(0,2).toUpperCase()}
          </div>
          <div>
            <p style={{ margin:'0 0 2px', fontWeight:'700', color:'#1a1d3a', fontSize:'15px' }}>{name}</p>
            <p style={{ margin:0, fontSize:'12px', color:'#9fa8c7' }}>Administrator · SegmentIQ</p>
          </div>
        </div>

        {[
          ['Your name', 'text', name, setName],
          ['Email address', 'email', 'admin@segmentiq.com', () => {}],
        ].map(([label, type, val, setter]) => (
          <div key={label} style={{ marginBottom:'14px' }}>
            <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'#374151', marginBottom:'5px' }}>{label}</label>
            <input type={type} value={val} onChange={e => setter(e.target.value)} style={{
              width:'100%', padding:'10px 13px', border:'1px solid #e8eaf6',
              borderRadius:'9px', fontSize:'13px', color:'#1a1d3a',
              background:'#fafbff', outline:'none', fontFamily:'inherit', boxSizing:'border-box',
            }}/>
          </div>
        ))}

        <button onClick={save} style={{
          width:'100%', padding:'11px',
          background: saved ? '#22c55e' : 'linear-gradient(135deg,#5b8df0,#7c6fef)',
          color:'#fff', border:'none', borderRadius:'10px', fontSize:'13px',
          fontWeight:'600', cursor:'pointer', fontFamily:'inherit', transition:'background 0.3s',
        }}>
          {saved ? '✓ Saved!' : 'Save changes'}
        </button>
      </div>

      {/* Notifications */}
      <div style={card()}>
        <p style={{ fontWeight:'700', fontSize:'15px', color:'#1a1d3a', margin:'0 0 18px' }}>Alerts & Notifications</p>
        {[
          ['segmentation', 'Analysis complete',        'Notify me when customer analysis finishes running'],
          ['atRisk',       'Customers leaving alert',  'Alert when "At-Risk" group grows above 5%'],
          ['export',       'Report downloaded',        'Confirm when a report file is downloaded'],
          ['weekly',       'Weekly summary email',     'Send me a summary every Monday morning'],
        ].map(([key, label, desc]) => (
          <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f8f9fc' }}>
            <div>
              <p style={{ margin:'0 0 2px', fontSize:'13px', fontWeight:'600', color:'#1a1d3a' }}>{label}</p>
              <p style={{ margin:0, fontSize:'11px', color:'#9fa8c7' }}>{desc}</p>
            </div>
            <Toggle value={notifs[key]} onChange={v => setNotifs({ ...notifs, [key]: v })}/>
          </div>
        ))}
      </div>

      {/* Prediction model */}
      <div style={card()}>
        <p style={{ fontWeight:'700', fontSize:'15px', color:'#1a1d3a', margin:'0 0 6px' }}>Prediction Model</p>
        <p style={{ fontSize:'12px', color:'#9fa8c7', margin:'0 0 16px', lineHeight:1.5 }}>
          Choose how the system predicts which group a customer belongs to. All models give accurate results — the difference is speed vs explainability.
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'20px' }}>
          {models.map(m => (
            <div key={m.val} onClick={() => setModel(m.val)} style={{
              padding:'12px 14px', borderRadius:'10px',
              border:`1.5px solid ${model===m.val?'#5b8df0':'#f0f2ff'}`,
              background: model===m.val?'#eff4ff':'#fafbff',
              cursor:'pointer',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
                <div style={{ width:'16px', height:'16px', borderRadius:'50%', border:`2px solid ${model===m.val?'#5b8df0':'#d1d5db'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {model===m.val && <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#5b8df0' }}/>}
                </div>
                <span style={{ fontSize:'13px', fontWeight:'700', color:'#1a1d3a' }}>{m.label}</span>
                <span style={{ fontSize:'10px', fontWeight:'600', color: model===m.val?'#5b8df0':'#9fa8c7', background: model===m.val?'#dbeafe':'#f4f6fd', padding:'2px 7px', borderRadius:'20px' }}>{m.badge}</span>
              </div>
              <p style={{ margin:0, fontSize:'12px', color:'#6b7280', lineHeight:1.4, paddingLeft:'26px' }}>{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Number of groups */}
        <div>
          <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'#374151', marginBottom:'6px' }}>
            Number of customer groups: <span style={{ color:'#5b8df0' }}>{clusters}</span>
          </label>
          <input type="range" min={2} max={8} step={1} value={clusters}
            onChange={e => setClusters(Number(e.target.value))}
            style={{ width:'100%', accentColor:'#5b8df0' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#9fa8c7', marginTop:'4px' }}>
            <span>2 groups (broad)</span>
            <span style={{ color:'#5b8df0', fontWeight:'600' }}>4 — recommended</span>
            <span>8 groups (detailed)</span>
          </div>
          <p style={{ margin:'8px 0 0', fontSize:'11px', color:'#9fa8c7', lineHeight:1.5 }}>
            More groups = more specific targeting but harder to manage. 4 groups (Champions, Loyal, At-Risk, Lost) works best for most businesses.
          </p>
        </div>
      </div>

      {/* Appearance + App info */}
      <div style={card()}>
        <p style={{ fontWeight:'700', fontSize:'15px', color:'#1a1d3a', margin:'0 0 18px' }}>Display</p>

        <p style={{ fontSize:'12px', fontWeight:'600', color:'#374151', marginBottom:'8px' }}>Colour theme</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px' }}>
          {[['light','☀️ Light mode'],['dark','🌙 Dark mode']].map(([val,label]) => (
            <div key={val} onClick={() => setTheme(val)} style={{
              padding:'14px', borderRadius:'10px',
              border:`2px solid ${theme===val?'#5b8df0':'#f0f2ff'}`,
              background: theme===val?'#eff4ff':'#fafbff',
              cursor:'pointer', textAlign:'center', fontSize:'13px',
              fontWeight: theme===val?'700':'500',
              color: theme===val?'#5b8df0':'#6b7280',
            }}>{label}</div>
          ))}
        </div>

        <div style={{ padding:'16px', background:'#f8f9ff', borderRadius:'10px', border:'1px solid #e8eaf6' }}>
          <p style={{ margin:'0 0 10px', fontSize:'12px', fontWeight:'700', color:'#5b8df0' }}>About this app</p>
          {[
            ['Version',         '1.0.0'],
            ['Data source',     'Your uploaded CSV file'],
            ['Groups detected', '4 customer segments'],
            ['Analysis engine', 'Python + machine learning'],
            ['Storage',         'Your browser (no server needed)'],
          ].map(([k,v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
              <span style={{ fontSize:'12px', color:'#9fa8c7' }}>{k}</span>
              <span style={{ fontSize:'12px', color:'#1a1d3a', fontWeight:'600' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}