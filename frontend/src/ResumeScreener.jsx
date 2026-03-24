// ResumeScreener.jsx
// Drop this file into src/ and add <ResumeScreener /> to the right column in App.js

import React, { useState, useRef } from 'react';
import axios from 'axios';

const NODE_COLORS = { HIRE: '#00d68f', REJECT: '#ff4d6a' };

export default function ResumeScreener() {
  const [text, setText]         = useState('');
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  // ── Read a .txt file dropped or selected ──────────────────────────────────
  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => setText(e.target.result);
    reader.readAsText(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  };

  // ── Submit to /screen ──────────────────────────────────────────────────────
  const screen = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post('http://127.0.0.1:5000/screen', {
        resume_text: text,
      });
      setResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.error ?? err.message;
      setError(msg);
    }
    setLoading(false);
  };

  const color   = result ? NODE_COLORS[result.decision] : '#7d8590';
  const hirePct = result?.hire_prob ?? 0;

  return (
    <div className="panel">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" />
          RESUME SCREENER
        </div>
        {result && (
          <span
            className="panel-badge"
            style={{ color, borderColor: color + '44', background: color + '18' }}
          >
            {result.decision} — {result.confidence}% confidence
          </span>
        )}
      </div>

      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Drop zone / textarea */}
        <div
          className={`upload-zone${dragging ? ' drag-over' : ''}`}
          style={{ padding: 0, cursor: 'default' }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste resume text here, or drop a .txt file…"
            style={{
              width: '100%', minHeight: 140,
              background: 'transparent', border: 'none', outline: 'none',
              resize: 'vertical', padding: '14px 16px',
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'var(--text-primary)', lineHeight: 1.7,
            }}
          />
        </div>

        {/* File pick button */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => fileRef.current.click()}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', padding: '8px 14px',
              borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)',
              fontSize: 11, cursor: 'pointer', letterSpacing: '1px',
            }}
          >
            ◈ Browse .txt file
          </button>
          <input
            ref={fileRef} type="file" accept=".txt"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && readFile(e.target.files[0])}
          />

          <button
            className="start-button"
            onClick={screen}
            disabled={loading || !text.trim()}
            style={{ flex: 1, padding: '8px 14px', fontSize: 12 }}
          >
            {loading ? '⏳  analysing...' : '▶  screen this resume'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px', background: 'var(--red-dim)',
            border: '1px solid #ff4d6a22', borderRadius: 'var(--radius)',
            fontSize: 12, color: 'var(--red)',
          }}>
            {error === 'No model trained yet. Run swarm learning first.'
              ? '⚠  Run swarm learning first — the model needs to be trained before screening.'
              : `✗ ${error}`}
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Decision banner */}
            <div style={{
              padding: '18px 20px', borderRadius: 'var(--radius)',
              background: color + '18', border: `1px solid ${color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 4 }}>
                  DECISION
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'var(--font-display)' }}>
                  {result.decision}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 4 }}>
                  HIRE PROBABILITY
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'var(--font-display)' }}>
                  {result.hire_prob}%
                </div>
              </div>
            </div>

            {/* Hire probability bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10,
                color: 'var(--text-muted)', marginBottom: 6, letterSpacing: 1 }}>
                <span>REJECT ←</span>
                <span>→ HIRE</span>
              </div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  width: `${hirePct}%`,
                  background: `linear-gradient(90deg, var(--red), ${color})`,
                  boxShadow: `0 0 8px ${color}66`,
                  transition: 'width 0.8s ease',
                }} />
              </div>
            </div>

            {/* Top keywords */}
            {result.keywords?.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2,
                  textTransform: 'uppercase', marginBottom: 8 }}>
                  Top Keywords Detected
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {result.keywords.map((k, i) => (
                    <span key={i} style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11,
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}>
                      {k.word}
                      <span style={{ color: color, marginLeft: 5, fontSize: 10 }}>
                        {k.score.toFixed(2)}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
