import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [status, setStatus] = useState('Ready');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDemo = async () => {
    setLoading(true);
    setStatus('Running swarm learning...');
    
    try {
      const response = await axios.post('http://localhost:5000/run_swarm', {
        rounds: 5
      });
      
      setResults(response.data);
      setStatus('✓ Complete!');
    } catch (error) {
      setStatus(`✗ Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="App">
      <header>
        <h1>🚀 Resume Screening - Swarm Learning + Blockchain</h1>
      </header>
      
      <main>
        <div className="section">
          <h2>Swarm Learning Demo</h2>
          
          <div className="status-box">
            <p>Status: <strong>{status}</strong></p>
          </div>
          
          <button 
            onClick={runDemo} 
            disabled={loading}
            className="run-button"
          >
            {loading ? 'Running...' : 'Start Swarm Learning'}
          </button>
          
          {results && (
            <div className="results-box">
              <h3>Results</h3>
              <p>Final Accuracy: <strong>{(results.accuracy * 100).toFixed(1)}%</strong></p>
              <p>Rounds: <strong>{results.rounds}</strong></p>
              <p>Transactions: <strong>{results.transactions}</strong></p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;