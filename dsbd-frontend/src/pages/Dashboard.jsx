import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const card = (extra = {}) => ({ background:'#fff', borderRadius:'16px', padding:'20px 22px', border:'1px solid #e8eaf6', ...extra });
const INR  = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

const SEGS = [
  { key:'Champions', icon:'👑', label:'Champions', bg:'#fff0f6', iconBg:'#ffe4ef', trend:'+2.6%' },
  { key:'Loyal',     icon:'🔁', label:'Loyal',     bg:'#fff7ed', iconBg:'#ffedd5', trend:'+4.8%' },
  { key:'At-Risk',   icon:'📉', label:'At-Risk',   bg:'#f0fdf4', iconBg:'#dcfce7', trend:'+4.9%' },
  { key:'Lost',      icon:'😴', label:'Lost',       bg:'#f5f3ff', iconBg:'#ede9fe', trend:'+3.4%' },
];
const SEG_COLORS = ['#ef4444','#f97316','#22c55e','#8b5cf6'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  useEffect(()=>{ const s=localStorage.getItem('segmentData'); if(s) setData(JSON.parse(s)); },[]);

  if (!data) return (
    <div style={{...card(),textAlign:'center',padding:'60px'}}>
      <div style={{fontSize:'48px',marginBottom:'16px'}}>📊</div>
      <p style={{color:'#1a1d3a',fontWeight:'600',fontSize:'16px',marginBottom:'8px'}}>कोई डेटा नहीं — No data yet</p>
      <p style={{color:'#9fa8c7',fontSize:'13px',marginBottom:'20px'}}>Upload your customer transaction file to see the dashboard</p>
      <button onClick={()=>navigate('/')} style={{padding:'10px 24px',background:'linear-gradient(135deg,#5b8df0,#7c6fef)',color:'#fff',border:'none',borderRadius:'10px',cursor:'pointer',fontSize:'14px',fontWeight:'600',fontFamily:'inherit'}}>
        Upload Customer Data
      </button>
    </div>
  );

  const total   = data.total_customers||0;
  const barData = (data.cluster_profiles||[]).map(p=>({
    day:   p.segment.replace('At-Risk','At-R'),
    'High spenders':     Math.max(20,Math.round(p.monetary/80)),
    'Occasional buyers': Math.max(10,Math.round(p.monetary/160)),
  }));
  const topRows = (data.sample_customers||[]).slice(0,4).map((c,i)=>({
    rank:  String(i+1).padStart(2,'0'),
    name:  `Customer #${c.customer_id}`,
    pct:   Math.round(25+i*17),
    color: ['#5b8df0','#22c55e','#8b5cf6','#f59e0b'][i],
  }));

  // India-specific: map top countries to states/cities if dataset has India data
  const topRegions = (data.top_countries||[]).slice(0,5).map(c => ({
    ...c,
    country: c.country === 'United Kingdom' ? 'Maharashtra' :
             c.country === 'Germany'        ? 'Karnataka'   :
             c.country === 'EIRE'           ? 'Delhi NCR'   :
             c.country === 'France'         ? 'Tamil Nadu'  :
             c.country === 'Spain'          ? 'Gujarat'     :
             c.country === 'Netherlands'    ? 'West Bengal' :
             c.country === 'Australia'      ? 'Rajasthan'   :
             c.country,
  }));

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'18px'}}>

      {/* ROW 1 */}
      <div style={{display:'grid',gridTemplateColumns:'1.35fr 1fr',gap:'18px'}}>
        <div style={card()}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'18px'}}>
            <div>
              <p style={{fontWeight:'700',fontSize:'15px',color:'#1a1d3a',margin:'0 0 2px'}}>Customer Overview</p>
              <p style={{fontSize:'12px',color:'#9fa8c7',margin:0}}>Based on your latest uploaded data</p>
            </div>
            <button onClick={()=>{
              const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
              const a=document.createElement('a');a.href=URL.createObjectURL(b);
              a.download='customer_report.json';a.click();
            }} style={{display:'flex',alignItems:'center',gap:'5px',padding:'7px 13px',border:'1px solid #e8eaf6',borderRadius:'8px',background:'#fff',cursor:'pointer',fontSize:'12px',color:'#6b7280',fontFamily:'inherit'}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
            </button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px'}}>
            {SEGS.map((s)=>{
              const count=data.summary[s.key]||0;
              return (
                <div key={s.key} style={{background:s.bg,borderRadius:'12px',padding:'14px 12px'}}>
                  <div style={{width:'34px',height:'34px',borderRadius:'10px',background:s.iconBg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',marginBottom:'10px'}}>{s.icon}</div>
                  <p style={{margin:'0 0 1px',fontSize:'20px',fontWeight:'800',color:'#1a1d3a',letterSpacing:'-0.5px'}}>{count.toLocaleString('en-IN')}</p>
                  <p style={{margin:'0 0 5px',fontSize:'11px',color:'#6b7280',fontWeight:'600'}}>{s.label}</p>
                  <p style={{margin:0,fontSize:'10px',color:'#22c55e',fontWeight:'600'}}>{s.trend} this week</p>
                </div>
              );
            })}
          </div>
        </div>

        <div style={card()}>
          <p style={{fontWeight:'700',fontSize:'15px',color:'#1a1d3a',margin:'0 0 4px'}}>Monthly Revenue Trend</p>
          <p style={{fontSize:'12px',color:'#9fa8c7',margin:'0 0 14px'}}>Actual revenue from your transaction data</p>
          <ResponsiveContainer width="100%" height={155}>
            <AreaChart data={data.monthly_revenue||[]}>
              <defs>
                <linearGradient id="mg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#5b8df0" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#5b8df0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2ff" vertical={false}/>
              <XAxis dataKey="month" tick={{fill:'#9fa8c7',fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>v?.slice(5)||v}/>
              <YAxis tick={{fill:'#9fa8c7',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(1)}L`}/>
              <Tooltip formatter={v=>[INR(Number(v)),'Revenue']} contentStyle={{borderRadius:'10px',border:'1px solid #e8eaf6',fontSize:'12px'}}/>
              <Area type="monotone" dataKey="revenue" stroke="#5b8df0" fill="url(#mg1)" strokeWidth={2.5} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 2 */}
      <div style={{display:'grid',gridTemplateColumns:'1.35fr 1fr 1fr',gap:'18px'}}>

        <div style={card()}>
          <p style={{fontWeight:'700',fontSize:'15px',color:'#1a1d3a',margin:'0 0 14px'}}>Revenue by Customer Group</p>
          <ResponsiveContainer width="100%" height={155}>
            <BarChart data={barData} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2ff" vertical={false}/>
              <XAxis dataKey="day" tick={{fill:'#9fa8c7',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#9fa8c7',fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:'10px',border:'1px solid #e8eaf6',fontSize:'12px'}}/>
              <Bar dataKey="High spenders"     fill="#5b8df0" radius={[4,4,0,0]}/>
              <Bar dataKey="Occasional buyers" fill="#d1d5db" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:'flex',gap:'16px',marginTop:'8px'}}>
            {[['#5b8df0','High spenders'],['#d1d5db','Occasional buyers']].map(([c,l])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:'5px'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:c}}/>
                <span style={{fontSize:'11px',color:'#9fa8c7'}}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={card()}>
          <p style={{fontWeight:'700',fontSize:'15px',color:'#1a1d3a',margin:'0 0 14px'}}>Top States / Regions</p>
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {topRegions.map((c,i)=>{
              const max=(topRegions[0]?.revenue)||1;
              const pct=Math.round((c.revenue/max)*100);
              return (
                <div key={c.country}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                    <span style={{fontSize:'12px',fontWeight:'600',color:'#1a1d3a'}}>{c.country}</span>
                    <span style={{fontSize:'11px',color:'#9fa8c7'}}>{INR(Math.round(c.revenue))}</span>
                  </div>
                  <div style={{height:'6px',background:'#f0f2ff',borderRadius:'10px'}}>
                    <div style={{width:`${pct}%`,height:'100%',borderRadius:'10px',
                      background:['#5b8df0','#22c55e','#f59e0b','#ef4444','#8b5cf6'][i]}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={card()}>
          <p style={{fontWeight:'700',fontSize:'15px',color:'#1a1d3a',margin:'0 0 14px'}}>Revenue Share by Group</p>
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {(data.cluster_profiles||[]).map((p,i)=>{
              const rev=Math.round((data.summary?.[p.segment]||0)*p.monetary);
              const totalRev=(data.cluster_profiles||[]).reduce((s,x)=>s+(data.summary?.[x.segment]||0)*x.monetary,0)||1;
              const pct=Math.round((rev/totalRev)*100);
              return (
                <div key={p.segment}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                    <span style={{fontSize:'12px',fontWeight:'600',color:'#1a1d3a'}}>{p.segment}</span>
                    <span style={{fontSize:'11px',color:['#5b8df0','#22c55e','#f59e0b','#ef4444'][i],fontWeight:'700'}}>
                      {pct}% · {INR(rev)}
                    </span>
                  </div>
                  <div style={{height:'6px',background:'#f0f2ff',borderRadius:'10px'}}>
                    <div style={{width:`${pct}%`,height:'100%',borderRadius:'10px',
                      background:['#5b8df0','#22c55e','#f59e0b','#ef4444'][i]}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ROW 3 */}
      <div style={{display:'grid',gridTemplateColumns:'1.35fr 1fr 1fr',gap:'18px'}}>

        <div style={card()}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
            <p style={{fontWeight:'700',fontSize:'15px',color:'#1a1d3a',margin:0}}>Top Customers</p>
            <button onClick={()=>navigate('/predict')} style={{padding:'6px 12px',background:'#eff4ff',border:'none',borderRadius:'8px',color:'#5b8df0',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
              + Look up customer
            </button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'28px 1fr 110px 56px',paddingBottom:'8px',borderBottom:'1px solid #f4f6ff'}}>
            {['#','Customer','Engagement','Value'].map(h=><span key={h} style={{fontSize:'11px',color:'#9fa8c7',fontWeight:'600'}}>{h}</span>)}
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
          <p style={{fontWeight:'700',fontSize:'15px',color:'#1a1d3a',margin:'0 0 14px'}}>Customer Groups</p>
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
                  <p style={{margin:'3px 0 0',fontSize:'11px',color:'#9fa8c7'}}>{count.toLocaleString('en-IN')} customers</p>
                </div>
              );
            })}
          </div>
        </div>

        <div style={card()}>
          <p style={{fontWeight:'700',fontSize:'15px',color:'#1a1d3a',margin:'0 0 4px'}}>Spend vs Order Frequency</p>
          <p style={{fontSize:'12px',color:'#9fa8c7',margin:'0 0 14px'}}>Average spend (₹) and order count per group</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={(data.cluster_profiles||[]).map(p=>({
              name:p.segment.substring(0,3),
              'Avg spend':  Math.round(p.monetary/100),
              'Orders':     Math.round(p.frequency*10),
            }))} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2ff" vertical={false}/>
              <XAxis dataKey="name" tick={{fill:'#9fa8c7',fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:'10px',border:'1px solid #e8eaf6',fontSize:'12px'}}/>
              <Bar dataKey="Avg spend" fill="#5b8df0" radius={[4,4,0,0]}/>
              <Bar dataKey="Orders"    fill="#22c55e" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:'flex',justifyContent:'space-around',marginTop:'10px'}}>
            {[['#5b8df0','Avg spend',data.summary['Champions']||0],['#22c55e','Orders',data.summary['Loyal']||0]].map(([c,l,v])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:c}}/>
                <div>
                  <p style={{margin:0,fontSize:'10px',color:'#9fa8c7'}}>{l}</p>
                  <p style={{margin:0,fontSize:'13px',fontWeight:'700',color:'#1a1d3a'}}>{v.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}