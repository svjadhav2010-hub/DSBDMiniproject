import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const [file, setFile]         = useState(null);
  const [status, setStatus]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) { setStatus('Please select a CSV file first.'); return; }
    const form = new FormData();
    form.append('file', file);
    setLoading(true);
    setStatus('Running RFM analysis and K-Means clustering...');
    try {
      const res = await axios.post('http://localhost:8000/upload', form);
      localStorage.setItem('segmentData', JSON.stringify(res.data));
      setStatus('Segmentation complete! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch {
      setStatus('ERROR: Make sure the FastAPI backend is running on port 8000.');
    }
    setLoading(false);
  };

  const steps = [
    { n: '01', title: 'Upload CSV',    desc: 'Online Retail II format' },
    { n: '02', title: 'RFM Analysis',  desc: 'Recency · Frequency · Monetary' },
    { n: '03', title: 'K-Means',       desc: '4 clusters with elbow method' },
    { n: '04', title: 'Dashboard',     desc: 'Charts + predictions ready' },
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '60px 32px' }}>

      {/* Hero */}
      <div style={{ marginBottom: '56px' }}>
        <div style={{
          display: 'inline-block',
          background: '#1e1e3f',
          border: '1px solid #312e81',
          borderRadius: '20px',
          padding: '4px 14px',
          fontSize: '12px',
          color: '#818cf8',
          marginBottom: '20px',
          fontFamily: '"DM Mono", monospace',
          letterSpacing: '0.05em'
        }}>
          DSBD MINI PROJECT
        </div>
        <h1 style={{
          fontSize: '42px', fontWeight: '700', margin: '0 0 16px',
          color: '#f9fafb', letterSpacing: '-1px', lineHeight: 1.1
        }}>
          Customer Segmentation<br />
          <span style={{ color: '#6366f1' }}>for E-Commerce</span>
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0, maxWidth: '480px', lineHeight: 1.6 }}>
          Upload your retail transaction data and get instant RFM-based customer segments powered by K-Means clustering and 4 classifiers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>

        {/* Upload card */}
        <div style={{
          background: '#0f0f1a',
          border: '1px solid #1e1e2e',
          borderRadius: '16px',
          padding: '32px',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#f3f4f6', margin: '0 0 24px' }}>
            Upload dataset
          </h2>

          {/* Dropzone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
            style={{
              border: `2px dashed ${dragOver ? '#6366f1' : file ? '#22c55e' : '#2d2d3f'}`,
              borderRadius: '12px',
              padding: '40px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? '#1e1e3f' : file ? '#052e16' : '#0a0a14',
              transition: 'all 0.2s',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>
              {file ? '✅' : '📂'}
            </div>
            <p style={{ margin: '0 0 4px', fontSize: '14px', color: file ? '#86efac' : '#d1d5db', fontWeight: '500' }}>
              {file ? file.name : 'Drop your CSV here'}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
              {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'or click to browse'}
            </p>
            <input id="fileInput" type="file" accept=".csv"
              style={{ display: 'none' }}
              onChange={e => setFile(e.target.files[0])} />
          </div>

          <button onClick={handleUpload} disabled={loading} style={{
            width: '100%',
            padding: '13px',
            background: loading ? '#374151' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: loading ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: '"DM Sans", sans-serif',
            letterSpacing: '0.01em',
            transition: 'opacity 0.2s',
          }}>
            {loading ? '⟳  Running segmentation...' : '→  Run Segmentation'}
          </button>

          {status && (
            <div style={{
              marginTop: '16px',
              padding: '12px 14px',
              background: status.includes('ERROR') ? '#1f0a0a' : '#0f1a0f',
              border: `1px solid ${status.includes('ERROR') ? '#7f1d1d' : '#14532d'}`,
              borderRadius: '8px',
              color: status.includes('ERROR') ? '#fca5a5' : '#86efac',
              fontSize: '13px',
              fontFamily: '"DM Mono", monospace',
            }}>
              {status}
            </div>
          )}
        </div>

        {/* Pipeline steps */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#f3f4f6', margin: '0 0 20px' }}>
            What happens
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: '16px', alignItems: 'flex-start',
                padding: '16px',
                background: '#0f0f1a',
                border: '1px solid #1e1e2e',
                borderRadius: '12px',
              }}>
                <span style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '11px', color: '#6366f1',
                  fontWeight: '500', minWidth: '24px', paddingTop: '1px'
                }}>{s.n}</span>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '600', color: '#f3f4f6' }}>{s.title}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '16px',
            padding: '14px 16px',
            background: '#0f0f1a',
            border: '1px solid #1e1e2e',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#6b7280',
            fontFamily: '"DM Mono", monospace',
          }}>
            <span style={{ color: '#4ade80' }}>✓</span> Kaggle Online Retail II dataset<br />
            <span style={{ color: '#4ade80' }}>✓</span> ~500K+ transactions supported<br />
            <span style={{ color: '#4ade80' }}>✓</span> Auto outlier removal + RFM scoring
          </div>
        </div>
      </div>
    </div>
  );
}