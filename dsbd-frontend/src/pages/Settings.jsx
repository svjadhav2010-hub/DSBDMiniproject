import { useState } from 'react';

const card = (e={}) => ({ background:'#fff', borderRadius:'16px', padding:'22px 24px', border:'1px solid #e8eaf6', ...e });

function Toggle({ value, onChange }) {
  return (
    <div onClick={()=>onChange(!value)} style={{
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
  const [model, setModel]   = useState('decision_tree');
  const [clusters, setClusters] = useState(4);
  const [theme, setTheme]   = useState('light');

  const save = () => {
    localStorage.setItem('segiq_user', name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px', alignItems:'start' }}>

      {/* Profile */}
      <div style={card()}>
        <p style={{ fontWeight:'700', fontSize:'15px', color:'#1a1d3a', margin:'0 0 18px' }}>Profile Settings</p>
        <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'20px' }}>
          <div style={{ width:'56px', height:'56px', borderRadius:'16px', background:'linear-gradient(135deg,#5b8df0,#7c6fef)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'18px', fontWeight:'700' }}>
            {name.slice(0,2).toUpperCase()}
          </div>
          <div>
            <p style={{ margin:'0 0 2px', fontWeight:'700', color:'#1a1d3a', fontSize:'15px' }}>{name}</p>
            <p style={{ margin:0, fontSize:'12px', color:'#9fa8c7' }}>Administrator · SegmentIQ</p>
          </div>
        </div>
        {[['Display name','text',name,setName],['Email','email','admin@segmentiq.com',()=>{}]].map(([label,type,val,setter])=>(
          <div key={label} style={{ marginBottom:'14px' }}>
            <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'#374151', marginBottom:'5px' }}>{label}</label>
            <input type={type} value={val} onChange={e=>setter(e.target.value)} style={{
              width:'100%', padding:'10px 13px', border:'1px solid #e8eaf6',
              borderRadius:'9px', fontSize:'13px', color:'#1a1d3a',
              background:'#fafbff', outline:'none', fontFamily:'inherit', boxSizing:'border-box',
            }}/>
          </div>
        ))}
        <button onClick={save} style={{
          width:'100%', padding:'11px', background: saved ? '#22c55e' : 'linear-gradient(135deg,#5b8df0,#7c6fef)',
          color:'#fff', border:'none', borderRadius:'10px', fontSize:'13px',
          fontWeight:'600', cursor:'pointer', fontFamily:'inherit', transition:'background 0.3s',
        }}>
          {saved ? '✓ Saved!' : 'Save changes'}
        </button>
      </div>

      {/* Notifications */}
      <div style={card()}>
        <p style={{ fontWeight:'700', fontSize:'15px', color:'#1a1d3a', margin:'0 0 18px' }}>Notification Preferences</p>
        {[
          ['segmentation','Segmentation complete','Alert when a new run finishes'],
          ['atRisk','At-Risk alerts','Notify when segment grows >5%'],
          ['export','Export notifications','Alert on file download'],
          ['weekly','Weekly digest','Summary email every Monday'],
        ].map(([key,label,desc])=>(
          <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f8f9fc' }}>
            <div>
              <p style={{ margin:'0 0 2px', fontSize:'13px', fontWeight:'600', color:'#1a1d3a' }}>{label}</p>
              <p style={{ margin:0, fontSize:'11px', color:'#9fa8c7' }}>{desc}</p>
            </div>
            <Toggle value={notifs[key]} onChange={v=>setNotifs({...notifs,[key]:v})}/>
          </div>
        ))}
      </div>

      {/* ML Settings */}
      <div style={card()}>
        <p style={{ fontWeight:'700', fontSize:'15px', color:'#1a1d3a', margin:'0 0 18px' }}>ML Model Settings</p>
        <div style={{ marginBottom:'18px' }}>
          <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'#374151', marginBottom:'8px' }}>Default classifier</label>
          {[['decision_tree','Decision Tree','94.2% accuracy — recommended'],['svm','SVM','91.1% accuracy'],['knn','KNN','88.3% accuracy'],['logistic','Logistic Regression','82.1% accuracy']].map(([val,label,desc])=>(
            <div key={val} onClick={()=>setModel(val)} style={{
              display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px',
              borderRadius:'9px', border:`1px solid ${model===val?'#5b8df0':'#f0f2ff'}`,
              background: model===val?'#eff4ff':'#fafbff',
              cursor:'pointer', marginBottom:'6px',
            }}>
              <div style={{ width:'16px', height:'16px', borderRadius:'50%', border:`2px solid ${model===val?'#5b8df0':'#d1d5db'}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {model===val && <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#5b8df0' }}/>}
              </div>
              <div>
                <p style={{ margin:'0 0 1px', fontSize:'13px', fontWeight:'600', color:'#1a1d3a' }}>{label}</p>
                <p style={{ margin:0, fontSize:'11px', color:'#9fa8c7' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div>
          <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'#374151', marginBottom:'6px' }}>
            Number of clusters (K = {clusters})
          </label>
          <input type="range" min={2} max={8} value={clusters} onChange={e=>setClusters(Number(e.target.value))} style={{ width:'100%', accentColor:'#5b8df0' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#9fa8c7', marginTop:'3px' }}>
            <span>2</span><span>4 (recommended)</span><span>8</span>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div style={card()}>
        <p style={{ fontWeight:'700', fontSize:'15px', color:'#1a1d3a', margin:'0 0 18px' }}>Appearance</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'18px' }}>
          {[['light','☀️ Light'],['dark','🌙 Dark']].map(([val,label])=>(
            <div key={val} onClick={()=>setTheme(val)} style={{
              padding:'14px', borderRadius:'10px', border:`2px solid ${theme===val?'#5b8df0':'#f0f2ff'}`,
              background: theme===val?'#eff4ff':'#fafbff',
              cursor:'pointer', textAlign:'center', fontSize:'13px',
              fontWeight: theme===val?'700':'500',
              color: theme===val?'#5b8df0':'#6b7280',
            }}>{label}</div>
          ))}
        </div>

        <div style={{ padding:'14px', background:'#f8f9ff', borderRadius:'10px', border:'1px solid #e8eaf6', marginTop:'8px' }}>
          <p style={{ margin:'0 0 8px', fontSize:'12px', fontWeight:'700', color:'#5b8df0' }}>App info</p>
          {[['Version','1.0.0'],['Dataset','Online Retail II'],['Backend','FastAPI + scikit-learn'],['Database','In-memory / localStorage']].map(([k,v])=>(
            <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
              <span style={{ fontSize:'12px', color:'#9fa8c7' }}>{k}</span>
              <span style={{ fontSize:'12px', color:'#1a1d3a', fontWeight:'600' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}