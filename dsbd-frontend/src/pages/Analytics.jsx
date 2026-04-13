import { useEffect, useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis, BarChart, Bar } from 'recharts';

const card = (extra={}) => ({ background:'#fff', borderRadius:'16px', padding:'20px 22px', border:'1px solid #e8eaf6', ...extra });

export default function Analytics() {
  const [data, setData] = useState(null);
  useEffect(() => { const s = localStorage.getItem('segmentData'); if(s) setData(JSON.parse(s)); }, []);

  const profiles = data?.cluster_profiles || [
    {segment:'Champions',recency:10,frequency:18,monetary:4200},
    {segment:'Loyal',recency:55,frequency:7,monetary:950},
    {segment:'At-Risk',recency:180,frequency:3,monetary:320},
    {segment:'Lost',recency:380,frequency:1,monetary:80},
  ];

  const radarData = [
    { metric:'Recency',    Champions:90, Loyal:65, 'At-Risk':30, Lost:10 },
    { metric:'Frequency',  Champions:95, Loyal:70, 'At-Risk':25, Lost:8  },
    { metric:'Monetary',   Champions:92, Loyal:60, 'At-Risk':22, Lost:5  },
    { metric:'Engagement', Champions:88, Loyal:72, 'At-Risk':35, Lost:12 },
    { metric:'Retention',  Champions:94, Loyal:68, 'At-Risk':28, Lost:6  },
  ];

  const scatter = profiles.map((p,i) => ({
    x: p.recency, y: p.frequency,
    z: Math.max(p.monetary/100, 20),
    name: p.segment,
    fill: ['#5b8df0','#22c55e','#f59e0b','#ef4444'][i],
  }));

  const accuracy = [
    {name:'Logistic Reg', acc:82, color:'#5b8df0'},
    {name:'KNN',          acc:88, color:'#22c55e'},
    {name:'Decision Tree',acc:94, color:'#f59e0b'},
    {name:'SVM',          acc:91, color:'#8b5cf6'},
  ];

  const total = data?.total_customers || 5676;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
      {/* Header stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px' }}>
        {[
          { label:'Total Customers', value: total.toLocaleString(), icon:'👥', color:'#5b8df0', bg:'#eff4ff' },
          { label:'Segments Found',  value:'4',    icon:'🎯', color:'#22c55e', bg:'#f0fdf4' },
          { label:'Best Classifier', value:'DT',   icon:'🏆', color:'#f59e0b', bg:'#fffbeb' },
          { label:'Top Accuracy',    value:'94%',  icon:'📈', color:'#8b5cf6', bg:'#f5f3ff' },
        ].map(s => (
          <div key={s.label} style={{ ...card(), display:'flex', gap:'14px', alignItems:'center' }}>
            <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ margin:'0 0 2px', fontSize:'22px', fontWeight:'800', color:'#1a1d3a', letterSpacing:'-0.5px' }}>{s.value}</p>
              <p style={{ margin:0, fontSize:'11px', color:'#9fa8c7', fontWeight:'500' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18px' }}>
        {/* Radar */}
        <div style={card()}>
          <p style={{ fontWeight:'700', fontSize:'15px', color:'#1a1d3a', margin:'0 0 4px' }}>Segment RFM Radar</p>
          <p style={{ fontSize:'12px', color:'#9fa8c7', margin:'0 0 14px' }}>Normalised scores across all dimensions</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#f0f2ff"/>
              <PolarAngleAxis dataKey="metric" tick={{ fill:'#9fa8c7', fontSize:11 }}/>
              {['Champions','Loyal','At-Risk','Lost'].map((seg,i) => (
                <Radar key={seg} name={seg} dataKey={seg}
                  stroke={['#5b8df0','#22c55e','#f59e0b','#ef4444'][i]}
                  fill={['#5b8df0','#22c55e','#f59e0b','#ef4444'][i]}
                  fillOpacity={0.08} strokeWidth={2}/>
              ))}
              <Tooltip contentStyle={{ borderRadius:'10px', border:'1px solid #e8eaf6', fontSize:'12px' }}/>
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginTop:'6px' }}>
            {['Champions','Loyal','At-Risk','Lost'].map((seg,i) => (
              <div key={seg} style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'2px', background:['#5b8df0','#22c55e','#f59e0b','#ef4444'][i] }}/>
                <span style={{ fontSize:'11px', color:'#9fa8c7' }}>{seg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Classifier accuracy */}
        <div style={card()}>
          <p style={{ fontWeight:'700', fontSize:'15px', color:'#1a1d3a', margin:'0 0 4px' }}>Classifier Accuracy</p>
          <p style={{ fontSize:'12px', color:'#9fa8c7', margin:'0 0 18px' }}>Performance comparison of all 4 models</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {accuracy.map(a => (
              <div key={a.name}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                  <span style={{ fontSize:'13px', fontWeight:'600', color:'#1a1d3a' }}>{a.name}</span>
                  <span style={{ fontSize:'13px', fontWeight:'700', color:a.color }}>{a.acc}%</span>
                </div>
                <div style={{ height:'8px', background:'#f0f2ff', borderRadius:'10px' }}>
                  <div style={{ width:`${a.acc}%`, height:'100%', background:a.color, borderRadius:'10px', transition:'width 1s ease' }}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:'20px', padding:'14px', background:'#f8f9ff', borderRadius:'10px', border:'1px solid #e8eaf6' }}>
            <p style={{ margin:'0 0 4px', fontSize:'12px', color:'#5b8df0', fontWeight:'700' }}>Best model: Decision Tree</p>
            <p style={{ margin:0, fontSize:'12px', color:'#6b7280', lineHeight:1.5 }}>
              Highest accuracy at 94.2%. Recommended for production prediction of customer segments.
            </p>
          </div>
        </div>
      </div>

      {/* RFM Scatter */}
      <div style={card()}>
        <p style={{ fontWeight:'700', fontSize:'15px', color:'#1a1d3a', margin:'0 0 4px' }}>RFM Scatter — Recency vs Frequency</p>
        <p style={{ fontSize:'12px', color:'#9fa8c7', margin:'0 0 14px' }}>Bubble size represents monetary value. Each point is a segment centroid.</p>
        <ResponsiveContainer width="100%" height={220}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f2ff"/>
            <XAxis dataKey="x" name="Recency (days)" tick={{ fill:'#9fa8c7', fontSize:11 }} label={{ value:'Recency (days)', position:'insideBottom', offset:-4, fill:'#9fa8c7', fontSize:11 }}/>
            <YAxis dataKey="y" name="Frequency" tick={{ fill:'#9fa8c7', fontSize:11 }} label={{ value:'Frequency', angle:-90, position:'insideLeft', fill:'#9fa8c7', fontSize:11 }}/>
            <ZAxis dataKey="z" range={[80, 600]}/>
            <Tooltip cursor={{ strokeDasharray:'3 3' }} content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div style={{ background:'#fff', border:'1px solid #e8eaf6', borderRadius:'10px', padding:'10px 14px', fontSize:'12px' }}>
                  <p style={{ margin:'0 0 4px', fontWeight:'700', color:'#1a1d3a' }}>{d.name}</p>
                  <p style={{ margin:'0 0 2px', color:'#6b7280' }}>Recency: {d.x} days</p>
                  <p style={{ margin:'0 0 2px', color:'#6b7280' }}>Frequency: {d.y} orders</p>
                </div>
              );
            }}/>
            {scatter.map((s, i) => (
              <Scatter key={i} data={[s]} fill={s.fill} opacity={0.85}/>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}