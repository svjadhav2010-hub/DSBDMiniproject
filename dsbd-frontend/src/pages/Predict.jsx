import { useState } from 'react';
import axios from 'axios';

const card = (extra = {}) => ({
  background: '#fff', borderRadius: '16px',
  padding: '24px', border: '1px solid #e8eaf6', ...extra
});

const SEG = {
  Champions: { color: '#5b8df0', bg: '#eff4ff', border: '#c7d7fd', icon: '👑',
    desc: 'Best customers — bought recently, buy often, spend the most.',
    actions: ['Send loyalty rewards', 'Offer early access', 'Ask for referrals'] },
  Loyal:     { color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', icon: '💚',
    desc: 'Regular buyers with solid frequency and spend. Great for upselling.',
    actions: ['Upsell to premium', 'Enrol in membership', 'Send personalised offers'] },
  'At-Risk': { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: '⚠️',
    desc: 'Were good customers but have not purchased recently.',
    actions: ['Send win-back email', 'Offer time-limited discount', 'Ask for feedback'] },
  Lost:      { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: '💔',
    desc: 'Long inactive with low spend. Needs strong incentive.',
    actions: ['Aggressive discount', 'Re-engagement ad', 'Remove from main list'] },
};

const presets = [
  { label: 'High spender',    recency: 10,  frequency: 20, monetary: 5000 },
  { label: 'Regular buyer',   recency: 45,  frequency: 8,  monetary: 800  },
  { label: 'Lapsed customer', recency: 200, frequency: 3,  monetary: 200  },
  { label: 'Lost customer',   recency: 400, frequency: 1,  monetary: 40   },
];

export default function Predict() {
  const [form, setForm]       = useState({ recency: '', frequency: '', monetary: '' });
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const predict = async () => {
    if (!form.recency || !form.frequency || !form.monetary) {
      setError('Please fill in all three fields.'); return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await axios.post('http://localhost:8000/predict', {
        recency: parseInt(form.recency),
        frequency: parseInt(form.frequency),
        monetary: parseFloat(form.monetary),
      });
      setResult(res.data);
    } catch {
      setError('Backend error. Make sure FastAPI is running on port 8000.');
    }
    setLoading(false);
  };

  const fields = [
    { key: 'recency',   label: 'Recency',   suffix: 'days',   placeholder: '30',  hint: 'Days since last order' },
    { key: 'frequency', label: 'Frequency', suffix: 'orders', placeholder: '5',   hint: 'Total number of orders' },
    { key: 'monetary',  label: 'Monetary',  suffix: '₹',      placeholder: '500', hint: 'Total lifetime spend' },
  ];

  const info = result ? SEG[result.segment] : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>

      {/* Input panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Presets */}
        <div style={card()}>
          <p style={{ fontWeight: '700', fontSize: '16px', color: '#1a1d3a', margin: '0 0 14px' }}>Quick Presets</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {presets.map(p => (
              <button key={p.label} onClick={() => setForm({ recency: p.recency, frequency: p.frequency, monetary: p.monetary })}
                style={{
                  padding: '10px 14px', background: '#fafbff',
                  border: '1px solid #e8eaf6', borderRadius: '10px',
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  transition: 'all 0.15s',
                }}>
                <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: '#1a1d3a' }}>{p.label}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#9fa8c7' }}>R:{p.recency} F:{p.frequency} M:₹{p.monetary}</p>
              </button>
            ))}
          </div>
        </div>

        {/* RFM inputs */}
        <div style={card()}>
          <p style={{ fontWeight: '700', fontSize: '16px', color: '#1a1d3a', margin: '0 0 18px' }}>Enter RFM Values</p>
          {fields.map(f => (
            <div key={f.key} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{f.label}</label>
                <span style={{ fontSize: '11px', color: '#9fa8c7' }}>{f.hint}</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="number" placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{
                    width: '100%', padding: '11px 52px 11px 14px',
                    border: '1px solid #e8eaf6', borderRadius: '10px',
                    fontSize: '14px', color: '#1a1d3a',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    background: '#fafbff', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '11px', color: '#9fa8c7', fontWeight: '600',
                }}>
                  {f.suffix}
                </span>
              </div>
            </div>
          ))}

          <button onClick={predict} disabled={loading} style={{
            width: '100%', padding: '13px',
            background: loading ? '#e8eaf6' : 'linear-gradient(135deg, #5b8df0, #7c6fef)',
            color: loading ? '#9fa8c7' : '#fff',
            border: 'none', borderRadius: '12px',
            fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
          }}>
            {loading ? '⟳  Predicting...' : '→  Predict Segment'}
          </button>

          {error && (
            <div style={{
              marginTop: '12px', padding: '11px 14px', borderRadius: '10px',
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#dc2626', fontSize: '13px',
            }}>{error}</div>
          )}
        </div>
      </div>

      {/* Result panel */}
      <div style={{
        ...card(info ? { background: info.bg, border: `1px solid ${info.border}` } : {}),
        minHeight: '440px',
        display: 'flex', flexDirection: 'column',
        justifyContent: result ? 'flex-start' : 'center',
        alignItems: result ? 'stretch' : 'center',
      }}>
        {!result ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px',
              background: '#eff4ff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px',
            }}>🎯</div>
            <p style={{ color: '#1a1d3a', fontWeight: '600', fontSize: '15px', margin: '0 0 6px' }}>Ready to predict</p>
            <p style={{ color: '#9fa8c7', fontSize: '13px', margin: 0 }}>Fill in the form on the left</p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '20px',
                background: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 14px', fontSize: '28px',
                border: `1px solid ${info.border}`,
              }}>{info.icon}</div>
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: info.color, fontWeight: '700', letterSpacing: '0.06em' }}>
                PREDICTED SEGMENT
              </p>
              <p style={{ margin: '0 0 10px', fontSize: '32px', fontWeight: '800', color: '#1a1d3a', letterSpacing: '-0.5px' }}>
                {result.segment}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: 1.5, maxWidth: '280px', marginLeft: 'auto', marginRight: 'auto' }}>
                {info.desc}
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: '700', color: info.color, letterSpacing: '0.06em' }}>
                RECOMMENDED ACTIONS
              </p>
              {info.actions.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: info.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '10px', color: info.color, fontWeight: '700' }}>{i+1}</span>
                  </div>
                  <span style={{ fontSize: '13px', color: '#374151' }}>{a}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', textAlign: 'center' }}>
                {[['Recency', form.recency, 'days'], ['Frequency', form.frequency, 'orders'], ['Monetary', form.monetary, '₹']].map(([l,v,u]) => (
                  <div key={l}>
                    <p style={{ margin: '0 0 2px', fontSize: '10px', color: '#9fa8c7', fontWeight: '600' }}>{l}</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1a1d3a' }}>{v}</p>
                    <p style={{ margin: 0, fontSize: '10px', color: '#9fa8c7' }}>{u}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}