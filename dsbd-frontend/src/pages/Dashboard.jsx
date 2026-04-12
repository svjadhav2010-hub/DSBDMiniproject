import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#e94560', '#0f3460', '#533483', '#05c46b'];

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('segmentData');
    if (saved) setData(JSON.parse(saved));
  }, []);

  if (!data) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
      <h2>No data yet</h2>
      <p>Go to Upload page and run segmentation first.</p>
    </div>
  );

  const pieData = Object.entries(data.summary).map(([name, value]) => ({ name, value }));
  const barData = data.cluster_profiles.map(p => ({
    name: p.segment,
    Recency: Math.round(p.recency),
    Frequency: Math.round(p.frequency),
    Monetary: Math.round(p.monetary)
  }));

  return (
    <div style={{ padding: '40px 32px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '26px', fontWeight: '600', marginBottom: '8px' }}>
        Segmentation Dashboard
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        {data.total_customers} customers segmented into {Object.keys(data.summary).length} groups
      </p>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
        {pieData.map((seg, i) => (
          <div key={seg.name} style={{
            background: '#fff', borderRadius: '12px',
            padding: '20px', border: '1px solid #eee',
            borderTop: `4px solid ${COLORS[i]}`
          }}>
            <p style={{ margin: '0 0 8px', color: '#888', fontSize: '13px' }}>{seg.name}</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '600' }}>{seg.value}</p>
            <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '12px' }}>customers</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #eee' }}>
          <h3 style={{ marginTop: 0, fontSize: '16px' }}>Segment distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90}
                dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #eee' }}>
          <h3 style={{ marginTop: 0, fontSize: '16px' }}>Cluster RFM profiles</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Recency"   fill="#e94560" />
              <Bar dataKey="Frequency" fill="#0f3460" />
              <Bar dataKey="Monetary"  fill="#05c46b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer table */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #eee', marginTop: '24px' }}>
        <h3 style={{ marginTop: 0, fontSize: '16px' }}>Sample customers</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                {['Customer ID', 'Recency', 'Frequency', 'Monetary', 'Segment'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#666', fontWeight: '500' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.sample_customers.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 12px' }}>{c.customer_id}</td>
                  <td style={{ padding: '10px 12px' }}>{c.recency}d</td>
                  <td style={{ padding: '10px 12px' }}>{c.frequency}</td>
                  <td style={{ padding: '10px 12px' }}>£{c.monetary.toFixed(2)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '12px',
                      background: COLORS[['Champions','Loyal','At-Risk','Lost'].indexOf(c.segment)] + '22',
                      color: COLORS[['Champions','Loyal','At-Risk','Lost'].indexOf(c.segment)]
                    }}>{c.segment}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}