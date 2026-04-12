import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useNavigate } from 'react-router-dom';

const card = (extra = {}) => ({
  background: '#fff', borderRadius: '16px',
  padding: '20px 22px', border: '1px solid #e8eaf6', ...extra
});

const SEGS = [
  { key:'Champions', icon:'👑', label:'Champions', bg:'#fff0f6', iconBg:'#ffe4ef', trend:'+2.6%' },
  { key:'Loyal',     icon:'🔁', label:'Loyal',     bg:'#fff7ed', iconBg:'#ffedd5', trend:'+4.8%' },
  { key:'At-Risk',   icon:'📉', label:'At-Risk',   bg:'#f0fdf4', iconBg:'#dcfce7', trend:'+4.9%' },
  { key:'Lost',      icon:'😴', label:'Lost',      bg:'#f5f3ff', iconBg:'#ede9fe', trend:'+3.4%' },
];
const SEG_COLORS = ['#ef4444','#f97316','#22c55e','#8b5cf6'];

const visitorData = [
  {m:'Jan',loyal:180,new:170,unique:160},{m:'Feb',loyal:220,new:200,unique:175},
  {m:'Mar',loyal:250,new:310,unique:200},{m:'Apr',loyal:290,new:260,unique:230},
  {m:'May',loyal:340,new:290,unique:310},{m:'Jun',loyal:295,new:350,unique:270},
  {m:'Jul',loyal:320,new:305,unique:290},
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { const s = localStorage.getItem('segmentData'); if(s) setData(JSON.parse(s)); },[]);

  if (!data) return (
    <div style={{...card(),textAlign:'center',padding:'60px'}}>
      <div style={{fontSize:'48px',marginBottom:'16px'}}>📊</div>
      <p style={{color:'#1a1d3a',fontWeight:'600',fontSize:'16px',marginBottom:'8px'}}>No data yet</p>
      <p style={{color:'#9fa8c7',fontSize:'13px',marginBottom:'20px'}}>Upload your CSV to see the dashboard</p>
      <button onClick={()=>navigate('/')} style={{padding:'10px 24px',background:'linear-gradient(135deg,#5b8df0,#7c6fef)',color:'#fff',border:'none',borderRadius:'10px',cursor:'pointer',fontSize:'14px',fontWeight:'600',fontFamily:'"Plus Jakarta Sans",sans-serif'}}>Upload Data</button>
    </div>
  );

  const total   = data.total_customers||0;
  const barData = (data.cluster_profiles||[]).map(p=>({day:p.segment.replace('At-Risk','At-R'),online:Math.max(20,Math.round(p.monetary/80)),offline:Math.max(10,Math.round(p.recency*25))}));
  const rfmBar  = (data.cluster_profiles||[]).map(p=>({name:p.segment.substring(0,3),target:Math.round(p.monetary/55),reality:Math.round(p.monetary/85)}));
  const topRows = (data.sample_customers||[]).slice(0,4).map((c,i)=>({rank:String(i+1).padStart(2,'0'),name:`Customer #${c.customer_id}`,pct:Math.round(25+i*17),color:['#5b8df0','#22c55e','#8b5cf6','#f59e0b'][i],seg:c.segment}));

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'18px'}}>

      {/* ROW 1 */}
      <div style={{display:'grid',gridTemplateColumns:'1.35fr 1fr',gap:'18px'}}>
        <div style={card()}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'18px'}}>
            <div>
              <p style={{fontWeight:'700',fontSize:'15px',color:'#1a1d3a',margin:'0 0 2px'}}>Today's Sales</p>
              <p style={{fontSize:'12px',color:'#9fa8c7',margin:0}}>Segmentation Summary</p>
            </div>
            <button onClick={()=>{const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='segments.json';a.click();}} style={{display:'flex',alignItems:'center',gap:'5px',padding:'7px 13px',border:'1px solid #e8eaf6',borderRadius:'8px',background:'#fff',cursor:'pointer',fontSize:'12px',color:'#6b7280',fontFamily:'"Plus Jakarta Sans",sans-serif'}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px'}}>
            {SEGS.map((s)=>{
              const count=data.summary[s.key]||0;
              return (
                <div key={s.key} style={{background:s.bg,borderRadius:'12px',padding:'14px 12px'}}>
                  <div style={{width:'34px',height:'34px',borderRadius:'10px',background:s.iconBg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',marginBottom:'10px'}}>{s.icon}</div>
                  <p style={{margin:'0 0 1px',fontSize:'20px',fontWeight:'800',color:'#1a1d3a',letterSpacing:'-0.5px'}}>{count.toLocaleString()}</p>
                  <p style={{margin:'0 0 5px',fontSize:'11px',color:'#6b7280',fontWeight:'600'}}>{s.label}</p>
                  <p style={{margin:0,fontSize:'10px',color:'#22c55e',fontWeight:'600'}}>{s.trend} from yesterday</p>
                </div>
              );
            })}
          </div>
        </div>

        <div style={card()}>
          <p style={{fontWeight:'700',fontSize:'15px',color:'#1a1d3a',margin:'0 0 14px'}}>Visitor Insights</p>
          <ResponsiveContainer width="100%" height={155}>
            <LineChart data={visitorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2ff" vertical={false}/>
              <XAxis dataKey="m" tick={{fill:'#9fa8c7',fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#9fa8c7',fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:'10px',border:'1px solid #e8eaf6',fontSize:'12px'}}/>
              <Line type="monotone" dataKey="loyal"  stroke="#5b8df0" strokeWidth={2.5} dot={false}/>
              <Line type="monotone" dataKey="new"    stroke="#ef4444" strokeWidth={2.5} dot={{fill:'#ef4444',r:3}}/>
              <Line type="monotone" dataKey="unique" stroke="#f59e0b" strokeWidth={2.5} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
          <div style={{display:'flex',gap:'14px',marginTop:'8px'}}>
            {[['#5b8df0','Loyal Customers'],['#ef4444','New Customers'],['#f59e0b','Unique Customers']].map(([c,l])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:'5px'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'2px',background:c}}/><span style={{fontSize:'10px',color:'#9fa8c7'}}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 2 */}
      <div style={{display:'grid',gridTemplateColumns:'1.35fr 1fr 1fr',gap:'18px'}}>
        <div style={card()}>
          <p style={{fontWeight:'700',fontSize:'15px',color:'#1a1d3a',margin:'0 0 14px'}}>Total Revenue</p>
          <ResponsiveContainer width="100%" height={155}>
            <BarChart data={barData} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2ff" vertical={false}/>
              <XAxis dataKey="day" tick={{fill:'#9fa8c7',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#9fa8c7',fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:'10px',border:'1px solid #e8eaf6',fontSize:'12px'}}/>
              <Bar dataKey="online"  fill="#5b8df0" radius={[4,4,0,0]} name="Online Sales"/>
              <Bar dataKey="offline" fill="#d1d5db" radius={[4,4,0,0]} name="Offline Sales"/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:'flex',gap:'16px',marginTop:'8px'}}>
            {[['#5b8df0','Online Sales'],['#d1d5db','Offline Sales']].map(([c,l])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:'5px'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:c}}/><span style={{fontSize:'11px',color:'#9fa8c7'}}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={card()}>
          <p style={{fontWeight:'700',fontSize:'15px',color:'#1a1d3a',margin:'0 0 14px'}}>Customer Satisfaction</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={visitorData.map((d,i)=>({name:d.m,last:200+i*14,curr:185+i*22}))}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5b8df0" stopOpacity={0.15}/><stop offset="95%" stopColor="#5b8df0" stopOpacity={0}/></linearGradient>
                <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2ff" vertical={false}/>
              <XAxis dataKey="name" tick={{fill:'#9fa8c7',fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:'10px',border:'1px solid #e8eaf6',fontSize:'12px'}}/>
              <Area type="monotone" dataKey="last" stroke="#5b8df0" fill="url(#ag1)" strokeWidth={2} dot={false}/>
              <Area type="monotone" dataKey="curr" stroke="#22c55e" fill="url(#ag2)" strokeWidth={2} dot={{fill:'#22c55e',r:3}}/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{display:'flex',justifyContent:'space-around',marginTop:'10px'}}>
            {[['#5b8df0','Last Month','₹3,00,00'],['#22c55e','This Month','₹4,50,00']].map(([c,l,v])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:c}}/>
                <div><p style={{margin:0,fontSize:'10px',color:'#9fa8c7'}}>{l}</p><p style={{margin:0,fontSize:'12px',fontWeight:'700',color:'#1a1d3a'}}>{v}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div style={card()}>
          <p style={{fontWeight:'700',fontSize:'15px',color:'#1a1d3a',margin:'0 0 14px'}}>Target vs Reality</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={rfmBar} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2ff" vertical={false}/>
              <XAxis dataKey="name" tick={{fill:'#9fa8c7',fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:'10px',border:'1px solid #e8eaf6',fontSize:'12px'}}/>
              <Bar dataKey="reality" fill="#22c55e" radius={[4,4,0,0]} name="Reality Sales"/>
              <Bar dataKey="target"  fill="#5b8df0" radius={[4,4,0,0]} name="Target Sales"/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{marginTop:'10px',display:'flex',flexDirection:'column',gap:'7px'}}>
            {[['#22c55e','Reality Sales','Global',data.summary['Champions']||0],['#5b8df0','Target Sales','Commercial',total]].map(([c,l,sub,v])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <div style={{width:'24px',height:'24px',borderRadius:'7px',background:c+'22',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <div style={{width:'7px',height:'7px',borderRadius:'2px',background:c}}/>
                </div>
                <div style={{flex:1}}><p style={{margin:0,fontSize:'11px',fontWeight:'600',color:'#1a1d3a'}}>{l}</p><p style={{margin:0,fontSize:'10px',color:'#9fa8c7'}}>{sub}</p></div>
                <span style={{fontSize:'12px',fontWeight:'700',color:'#1a1d3a'}}>{v.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3 */}
      <div style={{display:'grid',gridTemplateColumns:'1.35fr 1fr 1fr',gap:'18px'}}>
        <div style={card()}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
            <p style={{fontWeight:'700',fontSize:'15px',color:'#1a1d3a',margin:0}}>Top Customers</p>
            <button onClick={()=>navigate('/predict')} style={{padding:'6px 12px',background:'#eff4ff',border:'none',borderRadius:'8px',color:'#5b8df0',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'"Plus Jakarta Sans",sans-serif'}}>+ Predict new</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'28px 1fr 110px 56px',paddingBottom:'8px',borderBottom:'1px solid #f4f6ff'}}>
            {['#','Name','Popularity','Sales'].map(h=><span key={h} style={{fontSize:'11px',color:'#9fa8c7',fontWeight:'600'}}>{h}</span>)}
          </div>
          {topRows.map((p,i)=>(
            <div key={i} style={{display:'grid',gridTemplateColumns:'28px 1fr 110px 56px',alignItems:'center',padding:'9px 0',borderBottom:i<topRows.length-1?'1px solid #f8f9fc':'none'}}>
              <span style={{fontSize:'12px',color:'#9fa8c7',fontWeight:'600'}}>{p.rank}</span>
              <span style={{fontSize:'13px',color:'#1a1d3a',fontWeight:'500'}}>{p.name}</span>
              <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <div style={{flex:1,height:'5px',background:'#f0f2ff',borderRadius:'10px'}}>
                  <div style={{width:`${p.pct}%`,height:'100%',background:p.color,borderRadius:'10px'}}/>
                </div>
              </div>
              <span style={{fontSize:'11px',fontWeight:'700',color:p.color,background:p.color+'18',borderRadius:'6px',padding:'3px 7px',textAlign:'center'}}>{p.pct}%</span>
            </div>
          ))}
        </div>

        <div style={card()}>
          <p style={{fontWeight:'700',fontSize:'15px',color:'#1a1d3a',margin:'0 0 14px'}}>Segments by Size</p>
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {SEGS.map((s,i)=>{
              const count=data.summary[s.key]||0;
              const pct=total?((count/total)*100).toFixed(1):0;
              return (
                <div key={s.key}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'7px'}}>
                      <span style={{fontSize:'14px'}}>{s.icon}</span>
                      <span style={{fontSize:'13px',color:'#1a1d3a',fontWeight:'500'}}>{s.key}</span>
                    </div>
                    <span style={{fontSize:'12px',color:SEG_COLORS[i],fontWeight:'700'}}>{pct}%</span>
                  </div>
                  <div style={{height:'7px',background:'#f0f2ff',borderRadius:'10px'}}>
                    <div style={{width:`${pct}%`,height:'100%',background:SEG_COLORS[i],borderRadius:'10px',transition:'width 1s ease'}}/>
                  </div>
                  <p style={{margin:'3px 0 0',fontSize:'11px',color:'#9fa8c7'}}>{count.toLocaleString()} customers</p>
                </div>
              );
            })}
          </div>
        </div>

        <div style={card()}>
          <p style={{fontWeight:'700',fontSize:'15px',color:'#1a1d3a',margin:'0 0 14px'}}>Volume vs Frequency</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={(data.cluster_profiles||[]).map(p=>({name:p.segment.substring(0,3),volume:Math.round(p.monetary/100),freq:Math.round(p.frequency*10)}))} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2ff" vertical={false}/>
              <XAxis dataKey="name" tick={{fill:'#9fa8c7',fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:'10px',border:'1px solid #e8eaf6',fontSize:'12px'}}/>
              <Bar dataKey="volume" fill="#5b8df0" radius={[4,4,0,0]} name="Volume"/>
              <Bar dataKey="freq"   fill="#22c55e" radius={[4,4,0,0]} name="Frequency"/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:'flex',justifyContent:'space-around',marginTop:'10px'}}>
            {[['#5b8df0','Volume',data.summary['Champions']||0],['#22c55e','Services',data.summary['Loyal']||0]].map(([c,l,v])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:c}}/>
                <div><p style={{margin:0,fontSize:'10px',color:'#9fa8c7'}}>{l}</p><p style={{margin:0,fontSize:'13px',fontWeight:'700',color:'#1a1d3a'}}>{v.toLocaleString()}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}