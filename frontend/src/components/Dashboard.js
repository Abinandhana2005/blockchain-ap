import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard({ uploadCount }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [uploadCount]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="dashboard">
      <h3>🎯 System Status</h3>
      
      <div className="stat-cards">
        <div className="stat-card">
          <p className="stat-label">Resumes Loaded</p>
          <p className="stat-value">{stats?.resumes_loaded || 0}</p>
        </div>
        
        <div className="stat-card">
          <p className="stat-label">Audit Log Entries</p>
          <p className="stat-value">{stats?.audit_log_entries || 0}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
