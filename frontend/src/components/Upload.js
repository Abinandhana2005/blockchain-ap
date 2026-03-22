import React, { useState } from 'react';
import axios from 'axios';

function Upload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setUploading(true);
    
    try {
      for (let file of files) {
        const formData = new FormData();
        formData.append('file', file);

        await axios.post('http://localhost:5000/upload', formData);
      }
      
      setMessage(`✓ ${files.length} file(s) uploaded successfully!`);
      onUploadSuccess?.();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`✗ Upload failed: ${error.message}`);
    }
    
    setUploading(false);
  };

  return (
    <div className="upload-box">
      <h3>📄 Upload Resumes</h3>
      
      <label className="upload-label">
        <input 
          type="file" 
          multiple 
          accept=".txt,.pdf" 
          onChange={handleUpload}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <div className="upload-button">
          {uploading ? 'Uploading...' : '📁 Click to Upload Resumes'}
        </div>
      </label>
      
      {message && <p className="upload-message">{message}</p>}
    </div>
  );
}

export default Upload;
