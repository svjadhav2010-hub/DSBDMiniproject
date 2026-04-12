import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';

const card = (extra = {}) => ({
  background: '#fff', borderRadius: '16px',
  padding: '20px 24px', border: '1px solid #e8eaf6', ...extra
});

const SEG_COLORS = {
  Champions: { bg: '#fff0f0', icon: '#ef4444', text: '#ef4444', light: '#fef2f2' },
  Loyal:     { bg: '#fff7ed', icon: '#f97316', text: '#f97316', light: '#fff7ed' },
  'At-Risk': { bg: '#f0fdf4', icon: '#22c55e', text: '#22c55e', light: '#f0fdf4' },
  Lost:      { bg: '#f5f3ff', icon: '#8b5cf6', text: '#8b5cf6', light: '#f5f3ff' },
};

const visitorData = [
  { month: 'Jan', loyal: 220, new: 180, unique: 150 },
  { month: 'Feb', loyal: 280, new: 200, unique: 170 },
  { month: 'Mar', loyal: 250, new: 310, unique: 200 },
  { month: 'Apr', loyal: 300, new: 270, unique: 230 },
  { month: 'May', loyal: 340, new: 290, unique: 310 },
  { month: 'Jun', loyal: 290, new: 350, unique: 260 },
  { month: 'Jul', loyal: 320, new: 300, unique: 280 },
];

export default function Dashboard() {
  const [data, setData]   = useState(null);
  const navigate          = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('segmentData');
    if (saved) setData(JSON.parse(saved));
  }, []);

  if (!data) return (
    <div style={{ ...card(), textAlign: 'center', padding: '60px' }}>
      <p style={{ color: '#9fa8c7', marginBottom: '16px' }}>No segmentation data yet.</p>
      <button onClick={() => navigate('/')} style={{
        padding: '10px 24px', background: 'linear-gradient(135deg, #5b8df0, #7c6fef)',
        color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer',
        fontSize: '14px', fontWeight: '600',
      }}>Upload Data</button>
    </div>
  );

  const segOrder  = ['Champions', 'Loyal', 'At-Risk', 'Lost'];
  const statIcons = ['💰', '📦', '🛍️', '👥'];

  const statCards = segOrder.map((seg, i) => ({
    label: seg, value: (data.summary[seg] || 0).toLocaleString(),
    sub: `+${(Math.random()*10).toFixed(1)}% from yesterday`,
    icon: statIcons[i], ...SEG_COLORS[seg],
  }));

  const barData = (data.cluster_profiles || []).map(p => ({
    day: p.segment,
    online:  Math.round(p.monetary / 80),
    offline: Math.round(p.recency * 30),
  }));

  const topProducts = (data.sample_customers || []).slice(0, 4).map((c, i) => ({
    rank: String(i + 1).padStart(2, '0'),
    name: `Customer #${c.customer_id}`,
    pct:  Math.round(20 + Math.random() * 30),
    seg:  c.segment,
    color: ['#5b8df0','#22c55e','#8b5cf6','#f59e0b'][i],
  }));

  const rfmBar = (data.cluster_profiles || []).map(p => ({
    name: p.segment.substring(0, 3),
    target: Math.round(p.monetary / 60),
    reality: Math.round(p.monetary / 90),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Row 1: Today's Sales + Visitor Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>

        {/* Today's Sales */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <p style={{ fontWeight: '700', fontSize: '16px', color: '#1a1d3a', margin: '0 0 2px' }}>Today's Sales</p>
              <p style={{ fontSize: '12px', color: '#9fa8c7', margin: 0 }}>Segmentation Summary</p>
            </div>
            <button onClick={() => {
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
              a.download = 'segments.json'; a.click();
            }} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', border: '1px solid #e8eaf6', borderRadius: '8px',
              background: '#fff', cursor: 'pointer', fontSize: '12px',
              color: '#6b7280', fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
            {statCards.map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: '12px', padding: '14px 12px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '10px',
                  background: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '16px', marginBottom: '10px',
                }}>{s.icon}</div>
                <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '800', color: '#1a1d3a' }}>{s.value}</p>
                <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: '10px', color: '#22c55e', fontWeight: '600' }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Visitor Insights */}
        <div style={card()}>
          <p style={{ fontWeight: '700', fontSize: '16px', color: '#1a1d3a', margin: '0 0 16px' }}>Visitor Insights</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={visitorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#9fa8c7', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9fa8c7', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e8eaf6', fontSize: '12px' }} />
              <Line type="monotone" dataKey="loyal"  stroke="#5b8df0" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="new"    stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} />
              <Line type="monotone" dataKey="unique" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
            {[['#5b8df0','Loyal Customers'],['#ef4444','New Customers'],['#f59e0b','Unique Customers']].map(([c,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: c }} />
                <span style={{ fontSize: '10px', color: '#9fa8c7' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Revenue + Satisfaction + Target */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '20px' }}>

        {/* Total Revenue */}
        <div style={card()}>
          <p style={{ fontWeight: '700', fontSize: '16px', color: '#1a1d3a', margin: '0 0 16px' }}>Total Revenue</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#9fa8c7', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9fa8c7', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e8eaf6', fontSize: '12px' }} />
              <Bar dataKey="online"  fill="#5b8df0" radius={[4,4,0,0]} name="Online Sales" />
              <Bar dataKey="offline" fill="#d1d5db" radius={[4,4,0,0]} name="Offline Sales" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
            {[['#5b8df0','Online Sales'],['#d1d5db','Offline Sales']].map(([c,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
                <span style={{ fontSize: '11px', color: '#9fa8c7' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div style={card()}>
          <p style={{ fontWeight: '700', fontSize: '16px', color: '#1a1d3a', margin: '0 0 16px' }}>Customer Satisfaction</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={visitorData.map((d,i) => ({ name: d.month, last: 200+i*15, curr: 180+i*25 }))}>
              <defs>
                <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#5b8df0" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#5b8df0" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#9fa8c7', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e8eaf6', fontSize: '12px' }} />
              <Area type="monotone" dataKey="last" stroke="#5b8df0" fill="url(#cg1)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="curr" stroke="#22c55e" fill="url(#cg2)" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '12px' }}>
            {[['#5b8df0','Last Month','₹3,00,00'],['#22c55e','This Month','₹4,50,00']].map(([c,l,v]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
                <div><p style={{ margin:0, fontSize:'10px', color:'#9fa8c7' }}>{l}</p><p style={{ margin:0, fontSize:'12px', fontWeight:'700', color:'#1a1d3a' }}>{v}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Target vs Reality */}
        <div style={card()}>
          <p style={{ fontWeight: '700', fontSize: '16px', color: '#1a1d3a', margin: '0 0 16px' }}>Target vs Reality</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={rfmBar} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#9fa8c7', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e8eaf6', fontSize: '12px' }} />
              <Bar dataKey="reality" fill="#22c55e" radius={[4,4,0,0]} name="Reality Sales" />
              <Bar dataKey="target"  fill="#5b8df0" radius={[4,4,0,0]} name="Target Sales" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[['#22c55e','Reality Sales','Global',data.summary['Champions']||0],
              ['#5b8df0','Target Sales','Commercial',(data.total_customers||0)]].map(([c,l,sub,v]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: c+'22', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: c }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin:0, fontSize:'11px', fontWeight:'600', color:'#1a1d3a' }}>{l}</p>
                  <p style={{ margin:0, fontSize:'10px', color:'#9fa8c7' }}>{sub}</p>
                </div>
                <span style={{ fontSize:'12px', fontWeight:'700', color:'#1a1d3a' }}>{v.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Top Customers + Map placeholder + Volume */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '20px' }}>

        {/* Top Customers table */}
        <div style={card()}>
          <p style={{ fontWeight: '700', fontSize: '16px', color: '#1a1d3a', margin: '0 0 16px' }}>Top Customers</p>
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 60px', gap: '0', marginBottom: '10px' }}>
            {['#','Name','Popularity','Sales'].map(h => (
              <span key={h} style={{ fontSize: '11px', color: '#9fa8c7', fontWeight: '600', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>{h}</span>
            ))}
          </div>
          {topProducts.map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 60px', alignItems: 'center', padding: '10px 0', borderBottom: i < topProducts.length-1 ? '1px solid #f8f9fc' : 'none' }}>
              <span style={{ fontSize: '12px', color: '#9fa8c7', fontWeight: '600' }}>{p.rank}</span>
              <span style={{ fontSize: '13px', color: '#1a1d3a', fontWeight: '500' }}>{p.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '5px', background: '#f0f0f0', borderRadius: '10px', maxWidth: '120px' }}>
                  <div style={{ width: `${p.pct}%`, height: '100%', background: p.color, borderRadius: '10px' }} />
                </div>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: '700', color: p.color,
                background: p.color + '18', borderRadius: '6px',
                padding: '3px 8px', textAlign: 'center',
              }}>{p.pct}%</span>
            </div>
          ))}
        </div>

        {/* Segment Map */}
        <div style={card()}>
          <p style={{ fontWeight: '700', fontSize: '16px', color: '#1a1d3a', margin: '0 0 14px' }}>Segments by Size</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {segOrder.map((seg, i) => {
              const count = data.summary[seg] || 0;
              const pct   = data.total_customers ? ((count / data.total_customers) * 100).toFixed(1) : 0;
              const colors = ['#5b8df0','#22c55e','#f59e0b','#ef4444'];
              return (
                <div key={seg}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '13px', color: '#1a1d3a', fontWeight: '500' }}>{seg}</span>
                    <span style={{ fontSize: '12px', color: colors[i], fontWeight: '700' }}>{pct}%</span>
                  </div>
                  <div style={{ height: '8px', background: '#f0f4ff', borderRadius: '10px' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: colors[i], borderRadius: '10px', transition: 'width 1s ease' }} />
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#9fa8c7' }}>{count.toLocaleString()} customers</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Volume vs Service Level */}
        <div style={card()}>
          <p style={{ fontWeight: '700', fontSize: '16px', color: '#1a1d3a', margin: '0 0 16px' }}>Volume vs Frequency</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={(data.cluster_profiles||[]).map(p => ({
              name: p.segment.substring(0,3),
              volume: Math.round(p.monetary / 100),
              freq:   Math.round(p.frequency * 10),
            }))} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#9fa8c7', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e8eaf6', fontSize: '12px' }} />
              <Bar dataKey="volume" fill="#5b8df0" radius={[4,4,0,0]} name="Volume" />
              <Bar dataKey="freq"   fill="#22c55e" radius={[4,4,0,0]} name="Services" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
            {[['#5b8df0','Volume', data.summary['Champions']||0],
              ['#22c55e','Services', data.summary['Loyal']||0]].map(([c,l,v]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
                <div><p style={{ margin:0, fontSize:'10px', color:'#9fa8c7' }}>{l}</p><p style={{ margin:0, fontSize:'13px', fontWeight:'700', color:'#1a1d3a' }}>{v.toLocaleString()}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}