import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AuditLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/audit_log');
      setLogs(response.data.log || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  return (
    <div className="audit-log-box">
      <h3>📋 Audit Log (Blockchain Transactions)</h3>
      
      <table className="audit-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action</th>
            <th>Details</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No transactions yet</td></tr>
          ) : (
            logs.map((log, i) => (
              <tr key={i} className={`status-${log.status}`}>
                <td>{log.timestamp?.slice(-8) || 'N/A'}</td>
                <td>{log.action}</td>
                <td>
                  {log.file || log.rounds || log.error || 'System action'}
                </td>
                <td>
                  <span className={`badge badge-${log.status}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      <p className="log-count">Total transactions: {logs.length}</p>
    </div>
  );
}

export default AuditLog;
