import { useState } from 'react';
import axios from 'axios';

const COLORS = { Champions: '#05c46b', Loyal: '#0f3460', 'At-Risk': '#533483', Lost: '#e94560' };

export default function Predict() {
  const [form, setForm]     = useState({ recency: '', frequency: '', monetary: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const predict = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await axios.post('http://localhost:8000/predict', {
        recency:   parseInt(form.recency),
        frequency: parseInt(form.frequency),
        monetary:  parseFloat(form.monetary)
      });
      setResult(res.data);
    } catch {
      setError('Backend not running or model not trained yet. Upload data first.');
    }
    setLoading(false);
  };

  const fields = [
    { key: 'recency',   label: 'Recency (days since last purchase)', placeholder: 'e.g. 30' },
    { key: 'frequency', label: 'Frequency (number of orders)',        placeholder: 'e.g. 5'  },
    { key: 'monetary',  label: 'Monetary (total spend £)',            placeholder: 'e.g. 250' }
  ];

  return (
    <div style={{ maxWidth: '500px', margin: '60px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>
        Predict Segment
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Enter a customer's RFM values to predict which segment they belong to
      </p>

      {fields.map(f => (
        <div key={f.key} style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#444' }}>
            {f.label}
          </label>
          <input
            type="number"
            placeholder={f.placeholder}
            value={form[f.key]}
            onChange={e => setForm({ ...form, [f.key]: e.target.value })}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '8px',
              border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box'
            }}
          />
        </div>
      ))}

      <button onClick={predict} disabled={loading} style={{
        width: '100%', padding: '14px',
        background: loading ? '#999' : '#1a1a2e',
        color: 'white', border: 'none', borderRadius: '8px',
        fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer'
      }}>
        {loading ? 'Predicting...' : 'Predict Segment'}
      </button>

      {error && (
        <div style={{ marginTop: '16px', padding: '12px', background: '#fff0f0', borderRadius: '8px', color: '#c00', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{
          marginTop: '24px', padding: '24px', borderRadius: '12px',
          border: `2px solid ${COLORS[result.segment]}`,
          background: COLORS[result.segment] + '11', textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 8px', color: '#666', fontSize: '14px' }}>Predicted segment</p>
          <p style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: '700', color: COLORS[result.segment] }}>
            {result.segment}
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>{result.description}</p>
        </div>
      )}
    </div>
  );
}