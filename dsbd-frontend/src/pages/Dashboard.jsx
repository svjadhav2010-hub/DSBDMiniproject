import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS   = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'];
const SEG_INFO = {
  Champions: { icon: '👑', color: '#6366f1', bg: '#1e1e3f', border: '#312e81', desc: 'Best customers. Reward them.' },
  Loyal:     { icon: '💚', color: '#22c55e', bg: '#052e16', border: '#14532d', desc: 'Regular buyers. Upsell them.' },
  'At-Risk': { icon: '⚠️', color: '#f59e0b', bg: '#1c1107', border: '#78350f', desc: 'Slipping away. Re-engage now.' },
  Lost:      { icon: '💔', color: '#ef4444', bg: '#1f0a0a', border: '#7f1d1d', desc: 'Long inactive. Win-back campaign.' },
};

const card = {
  background: '#0f0f1a',
  border: '1px solid #1e1e2e',
  borderRadius: '14px',
  padding: '24px',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('segmentData');
    if (saved) setData(JSON.parse(saved));
  }, []);

  if (!data) return (
    <div style={{ padding: '80px', textAlign: 'center' }}>
      <p style={{ color: '#6b7280', fontSize: '16px' }}>No data yet.</p>
      <button onClick={() => navigate('/')} style={{
        marginTop: '16px', padding: '10px 24px',
        background: '#6366f1', color: 'white', border: 'none',
        borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
      }}>Go to Upload</button>
    </div>
  );

  const pieData = Object.entries(data.summary).map(([name, value]) => ({ name, value }));
  const barData = (data.cluster_profiles || []).map(p => ({
    name:      p.segment,
    Recency:   Math.round(p.recency),
    Frequency: Math.round(p.frequency),
    Monetary:  Math.round(p.monetary / 100),
  }));

  const segOrder = ['Champions', 'Loyal', 'At-Risk', 'Lost'];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#6366f1', fontFamily: '"DM Mono", monospace', letterSpacing: '0.08em' }}>
            SEGMENTATION RESULTS
          </p>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#f9fafb', letterSpacing: '-0.5px' }}>
            {data.total_customers.toLocaleString()} customers analysed
          </h1>
        </div>
        <button onClick={() => navigate('/predict')} style={{
          padding: '10px 20px', background: '#6366f1', color: 'white',
          border: 'none', borderRadius: '8px', cursor: 'pointer',
          fontSize: '14px', fontWeight: '500', fontFamily: '"DM Sans", sans-serif'
        }}>
          → Predict new customer
        </button>
      </div>

      {/* Segment cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {segOrder.map(seg => {
          const count = data.summary[seg] || 0;
          const pct   = ((count / data.total_customers) * 100).toFixed(1);
          const info  = SEG_INFO[seg];
          return (
            <div key={seg} style={{
              background: info.bg, border: `1px solid ${info.border}`,
              borderRadius: '14px', padding: '20px',
            }}>
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>{info.icon}</div>
              <p style={{ margin: '0 0 4px', fontSize: '13px', color: info.color, fontWeight: '600' }}>{seg}</p>
              <p style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '700', color: '#f9fafb', letterSpacing: '-0.5px' }}>
                {count.toLocaleString()}
              </p>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#6b7280' }}>{pct}% of total</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', lineHeight: 1.4 }}>{info.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div style={card}>
          <p style={{ margin: '0 0 20px', fontSize: '14px', fontWeight: '600', color: '#f3f4f6' }}>
            Segment distribution
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#374151' }}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[segOrder.indexOf(_.name)] ?? COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px', fontSize: '13px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <p style={{ margin: '0 0 20px', fontSize: '14px', fontWeight: '600', color: '#f3f4f6' }}>
            RFM cluster profiles
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '8px', fontSize: '13px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              <Bar dataKey="Recency"   fill="#ef4444" radius={[3,3,0,0]} />
              <Bar dataKey="Frequency" fill="#6366f1" radius={[3,3,0,0]} />
              <Bar dataKey="Monetary"  fill="#22c55e" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer table */}
      <div style={card}>
        <p style={{ margin: '0 0 20px', fontSize: '14px', fontWeight: '600', color: '#f3f4f6' }}>
          Sample customers
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
                {['Customer ID', 'Recency', 'Frequency', 'Monetary', 'Segment'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    color: '#6b7280', fontWeight: '500', fontSize: '12px',
                    fontFamily: '"DM Mono", monospace', letterSpacing: '0.05em'
                  }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.sample_customers || []).map((c, i) => {
                const info = SEG_INFO[c.segment] || SEG_INFO['Lost'];
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #0f0f1a' }}>
                    <td style={{ padding: '11px 14px', color: '#d1d5db', fontFamily: '"DM Mono", monospace', fontSize: '12px' }}>
                      #{c.customer_id}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#9ca3af' }}>{c.recency}d ago</td>
                    <td style={{ padding: '11px 14px', color: '#9ca3af' }}>{c.frequency} orders</td>
                    <td style={{ padding: '11px 14px', color: '#9ca3af' }}>£{c.monetary.toFixed(0)}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                        fontWeight: '600', background: info.bg,
                        color: info.color, border: `1px solid ${info.border}`
                      }}>{c.segment}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}