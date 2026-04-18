import { useEffect, useState } from 'react';

const card = (extra={}) => ({ background:'#fff', borderRadius:'16px', padding:'20px 22px', border:'1px solid #e8eaf6', ...extra });

const SEG_COLOR = { Champions:'#5b8df0', Loyal:'#22c55e', 'At-Risk':'#f59e0b', Lost:'#ef4444' };
const SEG_BG    = { Champions:'#eff4ff', Loyal:'#f0fdf4', 'At-Risk':'#fffbeb', Lost:'#fef2f2' };

export default function Orders() {
  const [data, setData]       = useState(null);
  const [filter, setFilter]   = useState('All');
  const [search, setSearch]   = useState('');

  useEffect(() => { const s = localStorage.getItem('segmentData'); if(s) setData(JSON.parse(s)); }, []);

  const customers = data?.all_customers || data?.sample_customers || [];
  const filtered  = customers.filter(c => {
    const matchSeg = filter === 'All' || c.segment === filter;
    const matchSearch = String(c.customer_id).includes(search);
    return matchSeg && matchSearch;
  });

  const tabs = ['All', 'Champions', 'Loyal', 'At-Risk', 'Lost'];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
      {/* Summary strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px' }}>
        {tabs.slice(1).map((seg,i) => {
          const count = data?.summary?.[seg] || 0;
          return (
            <div key={seg} style={{ ...card(), borderTop:`3px solid ${SEG_COLOR[seg]}`, cursor:'pointer' }} onClick={() => setFilter(seg)}>
              <p style={{ margin:'0 0 4px', fontSize:'11px', color:SEG_COLOR[seg], fontWeight:'700' }}>{seg.toUpperCase()}</p>
              <p style={{ margin:'0 0 2px', fontSize:'24px', fontWeight:'800', color:'#1a1d3a' }}>{count.toLocaleString()}</p>
              <p style={{ margin:0, fontSize:'11px', color:'#9fa8c7' }}>customers</p>
            </div>
          );
        })}
      </div>

      {/* Table card */}
      <div style={card()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'12px' }}>
          <p style={{ fontWeight:'700', fontSize:'15px', color:'#1a1d3a', margin:0 }}>Customer Orders</p>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            <div style={{ background:'#f4f6fd', borderRadius:'8px', display:'flex', alignItems:'center', gap:'6px', padding:'0 12px', height:'34px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9fa8c7" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search ID..." style={{ background:'transparent', border:'none', outline:'none', fontSize:'13px', color:'#1a1d3a', width:'100px', fontFamily:'inherit' }}/>
            </div>
            {/* Filter tabs */}
            <div style={{ display:'flex', gap:'4px' }}>
              {tabs.map(t => (
                <button key={t} onClick={() => setFilter(t)} style={{
                  padding:'5px 10px', borderRadius:'7px', border:'none', cursor:'pointer',
                  fontSize:'11px', fontWeight:'600', fontFamily:'inherit',
                  background: filter===t ? (t==='All'?'#1a1d3a':SEG_COLOR[t]) : '#f4f6fd',
                  color: filter===t ? '#fff' : '#6b7280',
                }}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        {customers.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'#9fa8c7' }}>
            <p style={{ fontWeight:'600', color:'#1a1d3a', marginBottom:'6px' }}>No customer data</p>
            <p style={{ fontSize:'13px' }}>Upload a dataset to see customer orders here.</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
              <thead>
                <tr style={{ borderBottom:'2px solid #f0f2ff' }}>
                  {['Customer ID','Recency','Frequency','Monetary Value','Segment','Status'].map(h => (
                    <th key={h} style={{ padding:'10px 12px', textAlign:'left', color:'#9fa8c7', fontWeight:'600', fontSize:'11px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c,i) => (
                  <tr key={i} style={{ borderBottom:'1px solid #f8f9fc', transition:'background 0.1s' }}>
                    <td style={{ padding:'11px 12px', fontWeight:'600', color:'#1a1d3a', fontFamily:'monospace', fontSize:'12px' }}>#{c.customer_id}</td>
                    <td style={{ padding:'11px 12px', color:'#6b7280' }}>{c.recency}d ago</td>
                    <td style={{ padding:'11px 12px', color:'#6b7280' }}>{c.frequency} orders</td>
                    <td style={{ padding:'11px 12px', color:'#1a1d3a', fontWeight:'600' }}>£{c.monetary.toFixed(0)}</td>
                    <td style={{ padding:'11px 12px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', background:SEG_BG[c.segment], color:SEG_COLOR[c.segment] }}>
                        {c.segment}
                      </span>
                    </td>
                    <td style={{ padding:'11px 12px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600',
                        background: c.recency < 90 ? '#f0fdf4' : c.recency < 200 ? '#fffbeb' : '#fef2f2',
                        color: c.recency < 90 ? '#22c55e' : c.recency < 200 ? '#f59e0b' : '#ef4444',
                      }}>
                        {c.recency < 90 ? 'Active' : c.recency < 200 ? 'Cooling' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p style={{ textAlign:'center', padding:'24px', color:'#9fa8c7', fontSize:'13px' }}>No customers match this filter.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}