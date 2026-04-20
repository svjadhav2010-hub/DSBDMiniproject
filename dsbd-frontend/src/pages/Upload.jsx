import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { n:1, label:'Upload your file'   },
  { n:2, label:'We analyse it'     },
  { n:3, label:'See your results'  },
];

const SAMPLE_FORMATS = [
  { name:'Shopify',     cols:'Customer ID, Email, Total Spent, Order Count, Last Order Date' },
  { name:'WooCommerce', cols:'Customer ID, Billing Email, Order Total, Date Created'         },
  { name:'Excel/CSV',   cols:'Any columns with Customer ID, Date, and Amount'               },
];

export default function Upload() {
  const [step, setStep]         = useState(1);
  const [file, setFile]         = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatus]  = useState('');
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith('.csv')) { setError('Please upload a CSV file. If you have an Excel file, save it as CSV first (File → Save As → CSV).'); return; }
    setFile(f); setError('');
  };

  const runAnalysis = async () => {
    if (!file) return;
    setStep(2); setProgress(0); setError('');

    const messages = [
      [10, 'Reading your customer data...'],
      [25, 'Cleaning and checking the data...'],
      [45, 'Calculating how recently each customer bought...'],
      [60, 'Grouping customers by their buying behaviour...'],
      [75, 'Finding the best customer groups...'],
      [88, 'Training prediction model...'],
      [95, 'Preparing your results...'],
    ];

    let msgIdx = 0;
    const ticker = setInterval(() => {
      if (msgIdx < messages.length) {
        setProgress(messages[msgIdx][0]);
        setStatus(messages[msgIdx][1]);
        msgIdx++;
      }
    }, 900);

    try {
      const form = new FormData();
      form.append('file', file);
      const res = await axios.post('http://localhost:8000/upload', form);
      clearInterval(ticker);
      setProgress(100);
      setStatus('Analysis complete!');
      localStorage.setItem('segmentData', JSON.stringify(res.data));
      localStorage.setItem('lastUploadDate', new Date().toLocaleDateString('en-IN'));
      setTimeout(() => { setStep(3); }, 800);
    } catch (err) {
      clearInterval(ticker);
      setStep(1);
      setError('Could not connect to the analysis server. Make sure the backend is running on port 8000, then try again.');
    }
  };

  const data = step === 3 ? JSON.parse(localStorage.getItem('segmentData') || '{}') : null;

  return (
    <div style={{ maxWidth:'680px', margin:'0 auto', fontFamily:'"Plus Jakarta Sans",sans-serif' }}>

      {/* Progress steps */}
      <div style={{ display:'flex', alignItems:'center', marginBottom:'36px' }}>
        {STEPS.map((s,i) => (
          <div key={s.n} style={{ display:'flex', alignItems:'center', flex: i<STEPS.length-1?1:'0 0 auto' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
              <div style={{
                width:'32px', height:'32px', borderRadius:'50%',
                background: step>s.n?'#22c55e':step===s.n?'linear-gradient(135deg,#5b8df0,#7c6fef)':'#f0f2ff',
                color: step>=s.n?'#fff':'#9fa8c7',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'13px', fontWeight:'700', flexShrink:0,
              }}>
                {step>s.n ? '✓' : s.n}
              </div>
              <p style={{ margin:0, fontSize:'11px', fontWeight:'600', color:step===s.n?'#1a1d3a':'#9fa8c7', whiteSpace:'nowrap' }}>{s.label}</p>
            </div>
            {i < STEPS.length-1 && (
              <div style={{ flex:1, height:'2px', background:step>s.n?'#22c55e':'#f0f2ff', margin:'0 8px 20px', borderRadius:'2px' }}/>
            )}
          </div>
        ))}
      </div>

      {/* STEP 1: Upload */}
      {step === 1 && (
        <div>
          <h1 style={{ fontSize:'24px', fontWeight:'800', color:'#1a1d3a', margin:'0 0 8px', letterSpacing:'-0.5px' }}>
            Upload your customer data
          </h1>
          <p style={{ fontSize:'14px', color:'#6b7280', margin:'0 0 24px', lineHeight:1.6 }}>
            Export a CSV from your store and upload it here. We'll automatically analyse your customers and tell you who needs attention.
          </p>

          {/* Drop zone */}
          <div
            onDragOver={e=>{ e.preventDefault(); setDragOver(true); }}
            onDragLeave={()=>setDragOver(false)}
            onDrop={e=>{ e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={()=>document.getElementById('fileInput').click()}
            style={{
              border:`2px dashed ${dragOver?'#5b8df0':file?'#22c55e':'#d1d5db'}`,
              borderRadius:'16px', padding:'48px 24px', textAlign:'center',
              background: dragOver?'#eff4ff':file?'#f0fdf4':'#fafbff',
              cursor:'pointer', transition:'all 0.2s', marginBottom:'20px',
            }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>{file?'✅':'📂'}</div>
            <p style={{ margin:'0 0 4px', fontSize:'16px', fontWeight:'700', color:file?'#16a34a':'#1a1d3a' }}>
              {file ? file.name : 'Drop your CSV file here'}
            </p>
            <p style={{ margin:0, fontSize:'13px', color:'#9fa8c7' }}>
              {file
                ? `${(file.size/1024/1024).toFixed(2)} MB — ready to analyse`
                : 'or click to browse — CSV files only'}
            </p>
            <input id="fileInput" type="file" accept=".csv" style={{display:'none'}}
              onChange={e=>handleFile(e.target.files[0])}/>
          </div>

          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px', fontSize:'13px', color:'#dc2626', lineHeight:1.5 }}>
              ⚠ {error}
            </div>
          )}

          <button onClick={runAnalysis} disabled={!file} style={{
            width:'100%', padding:'14px',
            background: file?'linear-gradient(135deg,#5b8df0,#7c6fef)':'#e5e7eb',
            color: file?'#fff':'#9ca3af',
            border:'none', borderRadius:'12px', fontSize:'15px', fontWeight:'700',
            cursor: file?'pointer':'not-allowed', fontFamily:'inherit',
            marginBottom:'24px',
          }}>
            {file?'Analyse my customers →':'Select a file first'}
          </button>

          {/* Format guide */}
          <div style={{ background:'#fff', border:'1px solid #e8eaf6', borderRadius:'14px', padding:'18px 20px' }}>
            <p style={{ margin:'0 0 12px', fontSize:'13px', fontWeight:'700', color:'#1a1d3a' }}>
              Which file format should I use?
            </p>
            {SAMPLE_FORMATS.map(f => (
              <div key={f.name} style={{ display:'flex', gap:'10px', marginBottom:'10px', alignItems:'flex-start' }}>
                <span style={{ fontSize:'11px', fontWeight:'700', color:'#5b8df0', background:'#eff4ff', borderRadius:'4px', padding:'2px 7px', flexShrink:0, marginTop:'1px' }}>{f.name}</span>
                <p style={{ margin:0, fontSize:'12px', color:'#6b7280', lineHeight:1.5 }}>{f.cols}</p>
              </div>
            ))}
            <div style={{ marginTop:'12px', padding:'10px 14px', background:'#f8f9ff', borderRadius:'8px', border:'1px solid #e0e7ff' }}>
              <p style={{ margin:0, fontSize:'12px', color:'#4b5563', lineHeight:1.5 }}>
                <span style={{ fontWeight:'700', color:'#5b8df0' }}>Don't have a CSV?</span> In your store admin, go to <strong>Reports → Orders</strong> or <strong>Customers → Export</strong> and download as CSV. Works with Shopify, WooCommerce, Meesho seller panel, and any Excel file saved as CSV.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Analysis progress */}
      {step === 2 && (
        <div style={{ textAlign:'center', padding:'20px 0' }}>
          <div style={{ width:'80px', height:'80px', borderRadius:'20px', background:'linear-gradient(135deg,#5b8df0,#7c6fef)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', margin:'0 auto 24px' }}>
            🔍
          </div>
          <h2 style={{ fontSize:'22px', fontWeight:'800', color:'#1a1d3a', margin:'0 0 8px' }}>
            Analysing your customers...
          </h2>
          <p style={{ fontSize:'14px', color:'#6b7280', margin:'0 0 32px' }}>{statusMsg}</p>

          {/* Progress bar */}
          <div style={{ background:'#f0f2ff', borderRadius:'10px', height:'12px', marginBottom:'12px', overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:'10px',
              background:'linear-gradient(90deg,#5b8df0,#7c6fef)',
              width:`${progress}%`, transition:'width 0.8s ease',
            }}/>
          </div>
          <p style={{ margin:'0 0 32px', fontSize:'13px', color:'#9fa8c7' }}>{progress}% complete</p>

          <div style={{ background:'#f8f9ff', border:'1px solid #e0e7ff', borderRadius:'14px', padding:'18px 20px', textAlign:'left' }}>
            <p style={{ margin:'0 0 10px', fontSize:'13px', fontWeight:'700', color:'#5b8df0' }}>What we're doing:</p>
            {[
              { done: progress>10,  text:'Reading all your orders and customer data' },
              { done: progress>25,  text:'Removing incomplete records automatically' },
              { done: progress>45,  text:'Calculating recency, frequency and spend per customer' },
              { done: progress>60,  text:'Using machine learning to group similar customers' },
              { done: progress>75,  text:'Finding the optimal number of groups' },
              { done: progress>88,  text:'Training prediction model for future use' },
            ].map((item,i) => (
              <div key={i} style={{ display:'flex', gap:'10px', marginBottom:'8px', alignItems:'center' }}>
                <span style={{ fontSize:'14px', flexShrink:0 }}>{item.done?'✅':'⏳'}</span>
                <span style={{ fontSize:'13px', color:item.done?'#166534':'#9fa8c7' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Results summary */}
      {step === 3 && data && (
        <div>
          <div style={{ textAlign:'center', marginBottom:'28px' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>🎉</div>
            <h2 style={{ fontSize:'24px', fontWeight:'800', color:'#1a1d3a', margin:'0 0 8px' }}>
              Analysis complete!
            </h2>
            <p style={{ fontSize:'14px', color:'#6b7280', margin:0 }}>
              We found {(data.total_customers||0).toLocaleString('en-IN')} customers and grouped them into 4 categories.
            </p>
          </div>

          {/* Group summary */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px' }}>
            {[
              { seg:'Champions', icon:'👑', color:'#5b8df0', bg:'#eff4ff', desc:'Your best, most loyal buyers' },
              { seg:'Loyal',     icon:'🔁', color:'#22c55e', bg:'#f0fdf4', desc:'Regular returning customers'  },
              { seg:'At-Risk',   icon:'⚠️', color:'#f59e0b', bg:'#fffbeb', desc:'Haven\'t bought in 3+ months'  },
              { seg:'Lost',      icon:'😴', color:'#ef4444', bg:'#fef2f2', desc:'Very long inactive'            },
            ].map(s => (
              <div key={s.seg} style={{ background:s.bg, border:`1px solid ${s.color}33`, borderRadius:'12px', padding:'14px 16px' }}>
                <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'6px' }}>
                  <span style={{ fontSize:'20px' }}>{s.icon}</span>
                  <p style={{ margin:0, fontSize:'14px', fontWeight:'700', color:'#1a1d3a' }}>{s.seg}</p>
                </div>
                <p style={{ margin:'0 0 4px', fontSize:'22px', fontWeight:'800', color:s.color }}>
                  {(data.summary?.[s.seg]||0).toLocaleString('en-IN')}
                </p>
                <p style={{ margin:0, fontSize:'11px', color:'#6b7280' }}>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* What to do next */}
          <div style={{ background:'#fff', border:'1.5px solid #5b8df0', borderRadius:'14px', padding:'18px 20px', marginBottom:'20px' }}>
            <p style={{ margin:'0 0 12px', fontSize:'14px', fontWeight:'700', color:'#1a1d3a' }}>
              What should I do now?
            </p>
            {[
              { icon:'🏠', text:"Go to Today's Briefing to see your 3 priority tasks",    action:'Go to Briefing', path:'/briefing' },
              { icon:'📢', text:'Send a win-back campaign to your At-Risk customers',       action:'Send Campaign',  path:'/campaigns' },
              { icon:'📊', text:'View detailed charts and reports about your business',    action:'View Reports',   path:'/reports' },
            ].map((item,i) => (
              <div key={i} style={{ display:'flex', gap:'12px', alignItems:'center', padding:'10px 0', borderBottom:i<2?'1px solid #f0f2ff':'none' }}>
                <span style={{ fontSize:'20px', flexShrink:0 }}>{item.icon}</span>
                <p style={{ margin:0, flex:1, fontSize:'13px', color:'#4b5563' }}>{item.text}</p>
                <button onClick={()=>navigate(item.path)} style={{
                  padding:'7px 14px', background:'#eff4ff', border:'none',
                  borderRadius:'8px', color:'#5b8df0', fontSize:'12px',
                  fontWeight:'600', cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
                }}>{item.action} →</button>
              </div>
            ))}
          </div>

          <button onClick={()=>navigate('/briefing')} style={{
            width:'100%', padding:'14px',
            background:'linear-gradient(135deg,#5b8df0,#7c6fef)',
            color:'#fff', border:'none', borderRadius:'12px',
            fontSize:'15px', fontWeight:'700', cursor:'pointer', fontFamily:'inherit',
          }}>
            See today's action plan →
          </button>
        </div>
      )}
    </div>
  );
}