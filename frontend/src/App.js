import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';
import ResumeScreener from './ResumeScreener';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';

// ─── Helpers ───────────────────────────────────────────────────────────────
const shortHash = (h) => h ? h.slice(0, 8) + '...' + h.slice(-6) : '—';
const shortAddr = (a) => a ? a.slice(0, 6) + '...' + a.slice(-4) : '—';
const NODE_IDS    = ['Node_A', 'Node_B', 'Node_C'];
const NODE_COLORS = { Node_A: '#00d68f', Node_B: '#4dabf7', Node_C: '#f0a500' };
const FAKE_ADDRS  = [
  '0xABcD1234ef567890ABcD1234ef567890ABcD1200',
  '0x1234567890abcdef1234567890abcdef12345678',
  '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
];

// ─── Panel ─────────────────────────────────────────────────────────────────
function Panel({ title, badge, badgeColor, children, noPad }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-title-icon" />
          {title}
        </div>
        {badge && (
          <span className="panel-badge"
            style={badgeColor ? { color: badgeColor, borderColor: badgeColor + '44', background: badgeColor + '18' } : {}}>
            {badge}
          </span>
        )}
      </div>
      <div className={noPad ? '' : 'panel-body'}>{children}</div>
    </div>
  );
}

// ─── 1. ACCURACY GRAPH ─────────────────────────────────────────────────────
function AccuracyGraph({ results }) {
  if (!results) {
    return (
      <Panel title="ACCURACY CONVERGENCE" badge="CHART">
        <div className="results-placeholder">
          <div className="placeholder-icon">◈</div>
          <div>Run swarm learning to see convergence graph</div>
        </div>
      </Panel>
    );
  }

  const rounds = results.round_details ?? [];
  const chartData = rounds.map((rd, i) => {
    const row = { round: `R${i + 1}` };
    if (rd.node_accuracies) {
      NODE_IDS.forEach((id, j) => {
        row[id] = parseFloat((rd.node_accuracies[j] * 100).toFixed(2));
      });
    }
    row['Average'] = parseFloat((rd.avg_accuracy * 100).toFixed(2));
    return row;
  });

  const data = chartData.length > 0 ? chartData : [
    { round:'R1', Node_A:60.0, Node_B:58.0, Node_C:62.0, Average:60.0 },
    { round:'R2', Node_A:65.0, Node_B:64.0, Node_C:67.0, Average:65.3 },
    { round:'R3', Node_A:71.0, Node_B:70.0, Node_C:73.0, Average:71.3 },
    { round:'R4', Node_A:77.0, Node_B:76.0, Node_C:80.0, Average:77.7 },
    { round:'R5', Node_A:84.0, Node_B:83.0, Node_C:86.0, Average:84.3 },
  ];

  const initial = data[0]?.Average ?? 60;
  const final   = data[data.length - 1]?.Average ?? 84;
  const gain    = (final - initial).toFixed(1);

  return (
    <Panel title="ACCURACY CONVERGENCE" badge={`+${gain}% GAIN`} badgeColor="#00d68f">
      <div className="convergence-summary">
        <div className="conv-card">
          <div className="conv-label">Initial</div>
          <div className="conv-value">{initial.toFixed(1)}%</div>
        </div>
        <div className="conv-card">
          <div className="conv-label">Final</div>
          <div className="conv-value">{final.toFixed(1)}%</div>
        </div>
        <div className="conv-card highlight">
          <div className="conv-label">Swarm Gain</div>
          <div className="conv-value">+{gain}%</div>
        </div>
        <div className="conv-card">
          <div className="conv-label">Rounds</div>
          <div className="conv-value">{data.length}</div>
        </div>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top:10, right:10, left:-10, bottom:0 }}>
            <CartesianGrid stroke="#1e2d3d" strokeDasharray="3 3" />
            <XAxis dataKey="round" tick={{ fill:'#7d8590', fontSize:11, fontFamily:'JetBrains Mono' }} />
            <YAxis domain={[50,100]} tick={{ fill:'#7d8590', fontSize:11, fontFamily:'JetBrains Mono' }}
              tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ background:'#0d1117', border:'1px solid #1e2d3d', borderRadius:6,
                fontFamily:'JetBrains Mono', fontSize:12 }}
              labelStyle={{ color:'#7d8590' }}
              formatter={(v, name) => [`${v}%`, name]}
            />
            <Legend wrapperStyle={{ fontSize:11, fontFamily:'JetBrains Mono', color:'#7d8590' }} />
            <ReferenceLine y={50} stroke="#ff4d6a" strokeDasharray="4 4"
              label={{ value:'min', fill:'#ff4d6a', fontSize:10 }} />
            {NODE_IDS.map(id => (
              <Line key={id} type="monotone" dataKey={id} stroke={NODE_COLORS[id]}
                strokeWidth={1.5} dot={{ r:3, fill:NODE_COLORS[id] }} activeDot={{ r:5 }} />
            ))}
            <Line type="monotone" dataKey="Average" stroke="#ffffff" strokeWidth={2}
              strokeDasharray="5 3" dot={{ r:3, fill:'#ffffff' }} activeDot={{ r:5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

// ─── 2. RESUME UPLOAD ──────────────────────────────────────────────────────
function UploadSection({ onUpload }) {
  const [msg, setMsg]       = useState(null);
  const [dragging, setDrag] = useState(false);
  const [files, setFiles]   = useState([]);
  const ref = useRef();

  const processFiles = (fileList) => {
    const arr = Array.from(fileList);
    setFiles(arr);
    setMsg(`${arr.length} file${arr.length > 1 ? 's' : ''} queued`);
    onUpload(arr.length);
  };

  return (
    <Panel title="RESUME INTAKE" badge="INPUT">
      <div
        className={`upload-zone ${dragging ? 'drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); processFiles(e.dataTransfer.files); }}
        onClick={() => ref.current.click()}
      >
        <div className="upload-icon">⬆</div>
        <div className="upload-text">
          <strong>Drop resumes or click to browse</strong>
          .pdf · .txt · .docx accepted
        </div>
        <input ref={ref} type="file" multiple accept=".pdf,.txt,.docx"
          style={{ display:'none' }} onChange={e => processFiles(e.target.files)} />
      </div>

      {files.length > 0 && (
        <div className="file-list">
          {files.slice(0, 4).map((f, i) => (
            <div key={i} className="file-row">
              <span className="file-icon">◈</span>
              <span className="file-name">{f.name}</span>
              <span className="file-size">{(f.size / 1024).toFixed(1)}kb</span>
            </div>
          ))}
          {files.length > 4 && (
            <div className="file-row muted">+ {files.length - 4} more files</div>
          )}
        </div>
      )}
      {msg && <div className="upload-message">✓ {msg}</div>}
    </Panel>
  );
}

// ─── 3. BLOCKCHAIN AUDIT LOG ───────────────────────────────────────────────
function AuditLog({ entries }) {
  const validated  = entries.filter(e => e.approved !== false).length;
  const realChain  = entries.filter(e => e.real_chain).length;
  const totalGas   = entries.reduce((sum, e) => sum + (e.gas_used ?? 21432), 0);

  return (
    <Panel title="BLOCKCHAIN AUDIT LOG" badge={`${entries.length} TXS`} noPad>
      <div className="audit-header-row">
        <span>#</span>
        <span>TX HASH</span>
        <span>NODE</span>
        <span>RND</span>
        <span>ACCURACY</span>
        <span>WEIGHTS HASH</span>
        <span>STATUS</span>
      </div>
      <div className="audit-entries">
        {entries.length === 0 ? (
          <div className="audit-empty">
            No transactions yet<br />
            Run swarm learning to generate on-chain entries
          </div>
        ) : entries.map((e, i) => (
          <div key={i} className={`audit-row ${e.approved !== false ? 'validated' : 'failed'}`}>
            <span className="row-index">{i + 1}</span>
            <span className="tx-hash" title={e.tx_hash}>{shortHash(e.tx_hash)}</span>
            <span className="node-cell" style={{ color: NODE_COLORS[e.node] ?? '#7d8590' }}>{e.node}</span>
            <span className="round-cell">R{e.round}</span>
            <span className="accuracy-cell">{(e.accuracy * 100).toFixed(2)}%</span>
            <span className="weights-hash" title={e.weights_hash}>{shortHash(e.weights_hash)}</span>
            <span className={`status-badge ${e.approved !== false ? 'validated' : 'failed'}`}>
              {e.approved !== false ? '✓ OK' : '✗ FAIL'}
            </span>
          </div>
        ))}
      </div>
      {entries.length > 0 && (
        <div className="audit-footer">
          <span className="audit-footer-stat">Validated: <span>{validated}</span></span>
          <span className="audit-footer-stat">Failed: <span style={{ color:'var(--red)' }}>{entries.length - validated}</span></span>
          <span className="audit-footer-stat">
            {realChain > 0
              ? <span style={{ color:'var(--green)' }}>⬡ {realChain} on-chain</span>
              : <span>Est. gas: {totalGas.toLocaleString()}</span>
            }
          </span>
        </div>
      )}
    </Panel>
  );
}

// ─── 4. NODE STATUS PANEL ──────────────────────────────────────────────────
function NodeStatus({ results, loading }) {
  const nodeData = NODE_IDS.map((id, i) => {
    const rounds    = results?.round_details ?? [];
    const lastRound = rounds[rounds.length - 1];
    const acc       = lastRound?.node_accuracies?.[i] ?? null;
    const trust     = results?.trust_scores?.[i] ?? 100;
    const allAcc    = rounds.map(r => r.node_accuracies?.[i] ?? 0);
    return { id, acc, trust, addr: FAKE_ADDRS[i], allAcc };
  });

  return (
    <Panel title="SWARM NODES" badge={`${NODE_IDS.length} ACTIVE`}>
      <div className="node-list">
        {nodeData.map(({ id, acc, trust, addr, allAcc }) => (
          <div key={id} className={`node-item ${loading || results ? 'active' : ''}`}>
            <div className="node-indicator"
              style={{ background: NODE_COLORS[id], boxShadow: `0 0 8px ${NODE_COLORS[id]}` }} />
            <div className="node-info">
              <div className="node-id" style={{ color: NODE_COLORS[id] }}>{id}</div>
              <div className="node-addr">{shortAddr(addr)}</div>
            </div>
            <div className="node-mini-bars">
              {allAcc.map((a, i) => (
                <div key={i} className="mini-bar"
                  style={{ height:`${Math.max(a * 26, 4)}px`, background: NODE_COLORS[id] + 'cc' }} />
              ))}
            </div>
            <div className="node-right">
              <div className="node-accuracy" style={{ color: acc ? NODE_COLORS[id] : 'var(--text-muted)' }}>
                {acc !== null ? `${(acc * 100).toFixed(1)}%` : '--.--%'}
              </div>
              <div className="node-trust">trust: {trust}</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ─── 5. CONVERGENCE PROOF ──────────────────────────────────────────────────
function ConvergenceProof({ results }) {
  const rounds     = results?.round_details ?? [];
  const initial    = results?.initial_accuracy ?? rounds[0]?.avg_accuracy ?? 0.60;
  const final      = results?.accuracy ?? rounds[rounds.length - 1]?.avg_accuracy ?? 0.84;
  const gain       = ((final - initial) * 100).toFixed(1);
  const singleNode = rounds[0]?.node_accuracies?.[0] ?? initial;

  return (
    <Panel title="CONVERGENCE PROOF" badge="SWARM vs SINGLE" badgeColor="#4dabf7">
      <div className="proof-grid">
        <div className="proof-row">
          <div className="proof-label">Single node (round 1)</div>
          <div className="proof-bar-wrap">
            <div className="proof-bar single" style={{ width:`${singleNode * 100}%` }} />
            <span className="proof-bar-val muted">{(singleNode * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="proof-row">
          <div className="proof-label">Swarm aggregate (final)</div>
          <div className="proof-bar-wrap">
            <div className="proof-bar swarm" style={{ width:`${final * 100}%` }} />
            <span className="proof-bar-val green">{(final * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="proof-improvement">
          <span className="proof-delta">+{gain}%</span>
          <span className="proof-delta-label">accuracy gain from swarm aggregation over single-node training</span>
        </div>
      </div>
    </Panel>
  );
}

// ─── Contract Info + Stats ─────────────────────────────────────────────────
function ContractInfo({ txCount, blockchainLive, onChainTx }) {
  return (
    <Panel title="SMART CONTRACT" badge={blockchainLive ? 'LIVE' : 'GANACHE'}
      badgeColor={blockchainLive ? '#00d68f' : undefined}>
      <div className="contract-info">
        {[
          ['Address',      '0x5FbD...2315',                              ''],
          ['Network',      'localhost:8545',                             'green'],
          ['Chain ID',     '1337',                                       ''],
          ['Method',       'submitUpdate()',                             ''],
          ['Mode',         blockchainLive ? 'Real Ganache' : 'Simulated', blockchainLive ? 'green' : ''],
          ['Transactions', onChainTx ?? txCount,                        'amber'],
          ['Min accuracy', '50%',                                        ''],
          ['Max accuracy', '95%',                                        ''],
        ].map(([k, v, cls]) => (
          <div key={k} className="contract-row">
            <span className="contract-key">{k}</span>
            <span className={`contract-val ${cls}`}>{v}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ChainStats({ txCount, uploadCount, results }) {
  return (
    <Panel title="CHAIN STATS">
      <div className="chain-stats">
        {[
          ['Transactions', txCount,                                                         'on-chain'],
          ['Rounds',       results ? 5 : 0,                                                'completed'],
          ['Resumes',      (results?.resume_split?.total ?? 50) + uploadCount,             'in dataset'],
          ['Accuracy',     results ? `${(results.accuracy * 100).toFixed(0)}%` : '--',    'final swarm'],
        ].map(([label, val, sub]) => (
          <div key={label} className="stat-cell">
            <div className="stat-cell-label">{label}</div>
            <div className="stat-cell-value">{val}</div>
            <div className="stat-cell-sub">{sub}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [status, setStatus]           = useState('Ready to initialize swarm');
  const [results, setResults]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [uploadCount, setUpload]      = useState(0);
  const [auditLog, setAuditLog]       = useState([]);
  const [blockNum, setBlockNum]       = useState(1248);
  const [blockchainLive, setChainLive] = useState(false);

  // Auto-increment block number
  useEffect(() => {
    const t = setInterval(() => setBlockNum(n => n + 1), 6000);
    return () => clearInterval(t);
  }, []);

  // Check if backend + blockchain are alive on mount
  useEffect(() => {
    axios.get('http://127.0.0.1:5000/health')
      .then(res => setChainLive(res.data.blockchain_live ?? false))
      .catch(() => {});
  }, []);

  const buildAudit = (data) =>
    (data.round_details ?? []).flatMap(rd => rd.transactions ?? []);

  const runSwarm = async () => {
    setLoading(true);
    setStatus('Connecting to smart contract...');
    setAuditLog([]);

    try {
      setStatus('Dispatching training to nodes...');
      const res  = await axios.post('http://127.0.0.1:5000/run_swarm', { rounds: 5 });
      const data = res.data;
      setResults(data);
      setChainLive(data.blockchain_live ?? false);
      const entries = buildAudit(data);
      setAuditLog(entries);
      setBlockNum(n => n + entries.length);

      const chainLabel = data.blockchain_live ? 'real Ganache' : 'simulation';
      setStatus(`Complete — ${entries.length} transactions committed (${chainLabel})`);
    } catch {
      // Full demo fallback — every panel works even offline
      const demo = {
        accuracy: 0.84, initial_accuracy: 0.60,
        trust_scores: [125, 125, 125],
        blockchain_live: false,
        resume_split: { total: 30 },
        round_details: [0.60, 0.66, 0.72, 0.79, 0.84].map((avg, i) => ({
          round: i + 1, avg_accuracy: avg,
          node_accuracies: [avg - 0.02, avg, avg + 0.02],
          transactions: NODE_IDS.map((id, j) => ({
            node: id, round: i + 1,
            accuracy: avg - 0.02 + j * 0.02, approved: true,
            real_chain:   false,
            gas_used:     21432,
            tx_hash:      '0x' + Math.random().toString(16).slice(2).padEnd(64, '0'),
            weights_hash: '0x' + Math.random().toString(16).slice(2).padEnd(64, '0'),
            trust_score:  100 + (i + 1) * 5,
          })),
        })),
      };
      setResults(demo);
      const entries = buildAudit(demo);
      setAuditLog(entries);
      setBlockNum(n => n + entries.length);
      setStatus(`Demo mode — ${entries.length} simulated transactions`);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          <div className="header-tag">Decentralized ML</div>
          <div className="header-title">Swarm<span>Chain</span></div>
          <div className="header-subtitle">Resume Screening · Swarm Learning · Blockchain Validation</div>
        </div>
        <div className="header-right">
          <div className="network-badge">
            <div className="pulse-dot" style={{ background: blockchainLive ? '#00d68f' : '#f0a500',
              boxShadow: `0 0 8px ${blockchainLive ? '#00d68f' : '#f0a500'}` }} />
            {blockchainLive ? 'Ganache LIVE' : 'Ganache localhost'}
          </div>
          <div className="block-counter">Block <span>#{blockNum}</span></div>
        </div>
      </header>

      <div className="container">
        {/* ── LEFT COLUMN ── */}
        <div className="left-column">
          <UploadSection onUpload={(n) => setUpload(c => c + n)} />
          <Panel title="CONTROL">
            {loading && <div className="loading-bar"><div className="loading-bar-fill" /></div>}
            <button className="start-button" onClick={runSwarm} disabled={loading}>
              {loading ? '⏳  running swarm...' : '▶  execute swarm learning'}
            </button>
            <div className={`status-line ${loading ? 'active' : ''}`}>
              {loading && '● '}{status}
            </div>
          </Panel>
          <ContractInfo
            txCount={auditLog.length}
            blockchainLive={blockchainLive}
            onChainTx={results?.on_chain_tx_count}
          />
          <NodeStatus results={results} loading={loading} />
          <ChainStats txCount={auditLog.length} uploadCount={uploadCount} results={results} />
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="right-column">
          <AccuracyGraph results={results} />
          {results && <ConvergenceProof results={results} />}
          {/* Resume Screener — active only after swarm has run */}
          <ResumeScreener modelReady={results?.model_ready ?? false} />
          <AuditLog entries={auditLog} />
        </div>
      </div>
    </div>
  );
}