import React from 'react';

function Results({ results }) {
  if (!results) {
    return <div className="results-placeholder">Run swarm learning to see results...</div>;
  }

  return (
    <div className="results-box">
      <h3>📊 Swarm Learning Results</h3>
      
      <div className="result-cards">
        <div className="card">
          <p className="label">Final Accuracy</p>
          <p className="value">{(results.accuracy * 100).toFixed(1)}%</p>
        </div>
        
        <div className="card">
          <p className="label">Rounds Completed</p>
          <p className="value">{results.rounds}</p>
        </div>
        
        <div className="card">
          <p className="label">Blockchain Transactions</p>
          <p className="value">{results.transactions}</p>
        </div>
        
        <div className="card">
          <p className="label">Active Nodes</p>
          <p className="value">{results.nodes?.length || 3}</p>
        </div>
      </div>
      
      <div className="accuracy-progress">
        <h4>Accuracy by Round:</h4>
        {results.accuracies?.map((acc, i) => (
          <div key={i} className="round-bar">
            <span>Round {i + 1}</span>
            <div className="bar">
              <div 
                className="fill" 
                style={{ width: `${acc * 100}%` }}
              >
                {(acc * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Results;
