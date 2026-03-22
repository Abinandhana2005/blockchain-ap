import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import Upload from './components/Upload';
import Results from './components/Results';
import AuditLog from './components/AuditLog';
import Dashboard from './components/Dashboard';

function App() {
  const [status, setStatus] = useState('Ready');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

  const runSwarmLearning = async () => {
    setLoading(true);
    setStatus('🔄 Running swarm learning...');
    
    try {
      const response = await axios.post('http://localhost:5000/run_swarm', {
        rounds: 5
      });
      
      setResults(response.data);
      setStatus('✓ Swarm learning completed!');
    } catch (error) {
      setStatus(`✗ Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  const handleUploadSuccess = () => {
    setUploadCount(uploadCount + 1);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🚀 Resume Screening - Swarm Learning + Blockchain</h1>
        <p>Decentralized ML with Smart Contract Validation</p>
      </header>
      
      <main className="app-main">
        <div className="container">
          <div className="left-column">
            <Upload onUploadSuccess={handleUploadSuccess} />
            
            <div className="action-box">
              <button 
                onClick={runSwarmLearning}
                disabled={loading}
                className="start-button"
              >
                {loading ? '⏳ Running...' : '▶️ Start Swarm Learning'}
              </button>
              <p className="status-text">{status}</p>
            </div>
            
            <Dashboard uploadCount={uploadCount} />
          </div>
          
          <div className="right-column">
            <Results results={results} />
            <AuditLog />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
