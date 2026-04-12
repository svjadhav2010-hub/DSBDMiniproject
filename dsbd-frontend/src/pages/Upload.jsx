import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const [file, setFile]       = useState(null);
  const [status, setStatus]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const handleUpload = async () => {
    if (!file) { setStatus('Please select a CSV file first.'); return; }
    const form = new FormData();
    form.append('file', file);
    setLoading(true);
    setStatus('Running segmentation... this may take a moment.');
    try {
      const res = await axios.post('http://localhost:8000/upload', form);
      localStorage.setItem('segmentData', JSON.stringify(res.data));
      setStatus('Done! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setStatus('Error: Backend not running. Start FastAPI first.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>
        Upload Customer Data
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Upload your Online Retail CSV file to run RFM segmentation
      </p>

      {/* Drop zone */}
      <div style={{
        border: '2px dashed #ccc', borderRadius: '12px',
        padding: '48px', textAlign: 'center',
        background: file ? '#f0fff4' : '#fff',
        borderColor: file ? '#38a169' : '#ccc',
        cursor: 'pointer'
      }}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📂</div>
        <p style={{ color: '#555', margin: 0 }}>
          {file ? file.name : 'Click to select your CSV file'}
        </p>
        <input id="fileInput" type="file" accept=".csv"
          style={{ display: 'none' }}
          onChange={e => setFile(e.target.files[0])} />
      </div>

      <button onClick={handleUpload} disabled={loading} style={{
        marginTop: '24px', width: '100%', padding: '14px',
        background: loading ? '#999' : '#e94560',
        color: 'white', border: 'none', borderRadius: '8px',
        fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer'
      }}>
        {loading ? 'Running...' : 'Run Segmentation'}
      </button>

      {status && (
        <div style={{
          marginTop: '16px', padding: '12px 16px',
          background: '#f0f4ff', borderRadius: '8px',
          color: '#333', fontSize: '14px'
        }}>
          {status}
        </div>
      )}
    </div>
  );
}