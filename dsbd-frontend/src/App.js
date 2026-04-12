import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Upload from './pages/Upload';
import Predict from './pages/Predict';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8f9fa' }}>
        
        {/* Navbar */}
        <nav style={{
          background: '#1a1a2e', padding: '0 32px',
          display: 'flex', alignItems: 'center', gap: '32px', height: '60px'
        }}>
          <span style={{ color: '#e94560', fontWeight: 'bold', fontSize: '18px' }}>
            SegmentIQ
          </span>
          <Link to="/"         style={navLink}>Upload</Link>
          <Link to="/dashboard" style={navLink}>Dashboard</Link>
          <Link to="/predict"   style={navLink}>Predict</Link>
        </nav>

        {/* Pages */}
        <Routes>
          <Route path="/"          element={<Upload />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/predict"   element={<Predict />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}

const navLink = {
  color: '#a9b1d6', textDecoration: 'none', fontSize: '15px'
};

export default App;