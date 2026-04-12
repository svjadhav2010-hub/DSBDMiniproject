import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const card = (extra = {}) => ({
  background: '#fff', borderRadius: '16px',
  padding: '24px', border: '1px solid #e8eaf6', ...extra
});

export default function Upload() {
  const [file, setFile]         = useState(null);
  const [status, setStatus]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) { setStatus('Please select a CSV file first.'); return; }
    const form = new FormData();
    form.append('file', file);
    setLoading(true);
    setStatus('Running RFM analysis and K-Means clustering...');
    try {
      const res = await axios.post('http://localhost:8000/upload', form);
      localStorage.setItem('segmentData', JSON.stringify(res.data));
      setStatus('Segmentation complete! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch {
      setStatus('ERROR: Make sure FastAPI backend is running on port 8000.');
    }
    setLoading(false);
  };

  const steps = [
    { n: '01', label: 'Upload CSV',   desc: 'Online Retail II format', color: '#5b8df0', bg: '#eff4ff' },
    { n: '02', label: 'RFM Analysis', desc: 'Recency · Frequency · Monetary', color: '#f97316', bg: '#fff7ed' },
    { n: '03', label: 'K-Means',      desc: '4 clusters, elbow method', color: '#22c55e', bg: '#f0fdf4' },
    { n: '04', label: 'Dashboard',    desc: 'Charts + predictions', color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>

      {/* Upload card */}
      <div style={card()}>
        <p style={{ fontWeight: '700', fontSize: '16px', color: '#1a1d3a', margin: '0 0 4px' }}>Upload Dataset</p>
        <p style={{ fontSize: '12px', color: '#9fa8c7', margin: '0 0 20px' }}>Upload your Online Retail CSV to begin</p>

        {/* Dropzone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
          onClick={() => document.getElementById('fileInput').click()}
          style={{
            border: `2px dashed ${dragOver ? '#5b8df0' : file ? '#22c55e' : '#e8eaf6'}`,
            borderRadius: '14px', padding: '40px 20px', textAlign: 'center',
            background: dragOver ? '#eff4ff' : file ? '#f0fdf4' : '#fafbff',
            cursor: 'pointer', transition: 'all 0.2s', marginBottom: '20px',
          }}
        >
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            background: file ? '#dcfce7' : '#eff4ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: '24px',
          }}>
            {file ? '✅' : '📂'}
          </div>
          <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: file ? '#16a34a' : '#1a1d3a' }}>
            {file ? file.name : 'Drop your CSV file here'}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#9fa8c7' }}>
            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'or click to browse files'}
          </p>
          <input id="fileInput" type="file" accept=".csv" style={{ display: 'none' }}
            onChange={e => setFile(e.target.files[0])} />
        </div>

        <button onClick={handleUpload} disabled={loading} style={{
          width: '100%', padding: '13px',
          background: loading ? '#e8eaf6' : 'linear-gradient(135deg, #5b8df0, #7c6fef)',
          color: loading ? '#9fa8c7' : '#fff',
          border: 'none', borderRadius: '12px', fontSize: '14px',
          fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          transition: 'all 0.2s',
        }}>
          {loading ? '⟳  Processing...' : '→  Run Segmentation'}
        </button>

        {status && (
          <div style={{
            marginTop: '14px', padding: '12px 14px', borderRadius: '10px',
            background: status.includes('ERROR') ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${status.includes('ERROR') ? '#fecaca' : '#bbf7d0'}`,
            color: status.includes('ERROR') ? '#dc2626' : '#16a34a',
            fontSize: '13px', fontWeight: '500',
          }}>
            {status}
          </div>
        )}
      </div>

      {/* Right column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Pipeline steps */}
        <div style={card()}>
          <p style={{ fontWeight: '700', fontSize: '16px', color: '#1a1d3a', margin: '0 0 16px' }}>Pipeline Steps</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: '14px', alignItems: 'center',
                padding: '12px 14px', background: '#fafbff',
                borderRadius: '10px', border: '1px solid #f0f2ff',
              }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '10px',
                  background: s.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: s.color }}>{s.n}</span>
                </div>
                <div>
                  <p style={{ margin: '0 0 1px', fontSize: '13px', fontWeight: '600', color: '#1a1d3a' }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9fa8c7' }}>{s.desc}</p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dataset info */}
        <div style={card({ background: 'linear-gradient(135deg, #eff4ff, #f5f3ff)', border: '1px solid #e0e7ff' })}>
          <p style={{ fontWeight: '700', fontSize: '14px', color: '#1a1d3a', margin: '0 0 12px' }}>Dataset Requirements</p>
          {[
            ['Required columns', 'Customer ID, Invoice, InvoiceDate, Quantity, Price'],
            ['Source', 'Online Retail II — Kaggle / UCI'],
            ['Rows supported', 'Up to 1M+ transactions'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', color: '#6b7280', minWidth: '110px', fontWeight: '600' }}>{k}</span>
              <span style={{ fontSize: '11px', color: '#1a1d3a' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}