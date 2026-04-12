import { useState } from 'react';
import axios from 'axios';

const SEG_INFO = {
  Champions: { icon: '👑', color: '#6366f1', bg: '#1e1e3f', border: '#312e81',
    desc: 'Your best customers. They buy often, spend the most, and bought recently. Reward them with exclusive perks and early access.',
    actions: ['Send loyalty rewards', 'Offer early product access', 'Ask for reviews / referrals'] },
  Loyal:     { icon: '💚', color: '#22c55e', bg: '#052e16', border: '#14532d',
    desc: 'Regular buyers with solid frequency and spend. Great candidates for upselling and membership programs.',
    actions: ['Upsell to premium tier', 'Enrol in membership', 'Send personalised offers'] },
  'At-Risk': { icon: '⚠️', color: '#f59e0b', bg: '#1c1107', border: '#78350f',
    desc: 'Were good customers but have not purchased recently. Act now before they are lost.',
    actions: ['Send win-back email', 'Offer limited-time discount', 'Ask what went wrong'] },
  Lost:      { icon: '💔', color: '#ef4444', bg: '#1f0a0a', border: '#7f1d1d',
    desc: 'Long inactive with low spend and frequency. Requires strong incentive to re-activate.',
    actions: ['Send aggressive discount', 'Remove from main list', 'Run re-engagement ad'] },
};

const presets = [
  { label: 'High spender',   recency: 10,  frequency: 20, monetary: 5000 },
  { label: 'Occasional',     recency: 90,  frequency: 3,  monetary: 200  },
  { label: 'Lapsed customer',recency: 300, frequency: 2,  monetary: 80   },
  { label: 'Lost customer',  recency: 500, frequency: 1,  monetary: 30   },
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
        recency:   parseInt(form.recency),
        frequency: parseInt(form.frequency),
        monetary:  parseFloat(form.monetary),
      });
      setResult(res.data);
    } catch {
      setError('Backend error. Make sure FastAPI is running and you have uploaded data first.');
    }
    setLoading(false);
  };

  const fields = [
    { key: 'recency',   label: 'Recency',   unit: 'days since last order', placeholder: '30',  hint: 'Lower = more recent' },
    { key: 'frequency', label: 'Frequency', unit: 'total orders placed',   placeholder: '5',   hint: 'Higher = more loyal' },
    { key: 'monetary',  label: 'Monetary',  unit: 'total lifetime spend £', placeholder: '500', hint: 'Higher = more valuable' },
  ];

  const info = result ? SEG_INFO[result.segment] : null;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px' }}>

      <div style={{ marginBottom: '40px' }}>
        <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#6366f1', fontFamily: '"DM Mono", monospace', letterSpacing: '0.08em' }}>
          SEGMENT PREDICTOR
        </p>
        <h1 style={{ margin: '0 0 10px', fontSize: '32px', fontWeight: '700', color: '#f9fafb', letterSpacing: '-0.5px' }}>
          Predict customer segment
        </h1>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '15px' }}>
          Enter RFM values for any customer to instantly classify them.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

        {/* Input panel */}
        <div>
          {/* Quick presets */}
          <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#6b7280', fontFamily: '"DM Mono", monospace' }}>
            QUICK PRESETS
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '28px' }}>
            {presets.map(p => (
              <button key={p.label} onClick={() => setForm({ recency: p.recency, frequency: p.frequency, monetary: p.monetary })}
                style={{
                  padding: '8px 12px', background: '#0f0f1a',
                  border: '1px solid #1e1e2e', borderRadius: '8px',
                  color: '#9ca3af', fontSize: '12px', cursor: 'pointer',
                  textAlign: 'left', fontFamily: '"DM Sans", sans-serif',
                  transition: 'border-color 0.15s',
                }}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Fields */}
          {fields.map(f => (
            <div key={f.key} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#d1d5db' }}>
                  {f.label}
                </label>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>{f.hint}</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: '#0f0f1a',
                    border: '1px solid #1e1e2e',
                    borderRadius: '10px',
                    color: '#f3f4f6', fontSize: '16px',
                    fontFamily: '"DM Mono", monospace',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                <span style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '11px', color: '#4b5563',
                  fontFamily: '"DM Mono", monospace',
                  pointerEvents: 'none',
                }}>
                  {f.unit}
                </span>
              </div>
            </div>
          ))}

          <button onClick={predict} disabled={loading} style={{
            width: '100%', padding: '13px',
            background: loading ? '#1f2937' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: loading ? '#6b7280' : 'white',
            border: 'none', borderRadius: '10px',
            fontSize: '15px', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: '"DM Sans", sans-serif',
            transition: 'opacity 0.2s',
          }}>
            {loading ? '⟳  Predicting...' : '→  Predict Segment'}
          </button>

          {error && (
            <div style={{
              marginTop: '14px', padding: '12px 14px',
              background: '#1f0a0a', border: '1px solid #7f1d1d',
              borderRadius: '8px', color: '#fca5a5',
              fontSize: '13px', fontFamily: '"DM Mono", monospace',
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Result panel */}
        <div style={{
          background: info ? info.bg : '#0f0f1a',
          border: `1px solid ${info ? info.border : '#1e1e2e'}`,
          borderRadius: '16px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: result ? 'flex-start' : 'center',
          alignItems: result ? 'flex-start' : 'center',
          minHeight: '380px',
          transition: 'all 0.3s',
        }}>
          {!result ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>🎯</div>
              <p style={{ color: '#4b5563', fontSize: '14px', margin: 0 }}>
                Fill in the form and click predict
              </p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{info.icon}</div>
              <p style={{ margin: '0 0 4px', fontSize: '13px', color: info.color, fontWeight: '600', fontFamily: '"DM Mono", monospace' }}>
                PREDICTED SEGMENT
              </p>
              <p style={{ margin: '0 0 16px', fontSize: '36px', fontWeight: '800', color: '#f9fafb', letterSpacing: '-1px' }}>
                {result.segment}
              </p>
              <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>
                {info.desc}
              </p>

              <div style={{ width: '100%', borderTop: `1px solid ${info.border}`, paddingTop: '20px' }}>
                <p style={{ margin: '0 0 12px', fontSize: '12px', color: info.color, fontFamily: '"DM Mono", monospace', letterSpacing: '0.05em' }}>
                  RECOMMENDED ACTIONS
                </p>
                {info.actions.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ color: info.color, fontSize: '14px', marginTop: '1px' }}>›</span>
                    <span style={{ fontSize: '13px', color: '#d1d5db' }}>{a}</span>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: '20px', width: '100%',
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                fontFamily: '"DM Mono", monospace',
                fontSize: '11px', color: '#6b7280',
              }}>
                R={form.recency}d · F={form.frequency} orders · M=£{form.monetary}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}