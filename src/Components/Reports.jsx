import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Config/Config';
import Swal from 'sweetalert2';
import axiosInstance from '../Config/axiosConfig';

const stageConfig = {
  'offer letter':       { label: 'Offer Letter',       bg: '#f2e5b2', color: '#92400e', icon: '📄' },
  'verification':       { label: 'Verification',       bg: '#d1fae5', color: '#065f46', icon: '✅' },
  'salary stack':       { label: 'Salary Stackup',     bg: '#fee2e2', color: '#991b1b', icon: '💰' },
  'candidate approval': { label: 'Candidate Approval', bg: '#ede9fe', color: '#5b21b6', icon: '👤' },
  'note for approval':  { label: 'Note for Approval',  bg: '#fce7f3', color: '#9d174d', icon: '📝' },
  'recruitment mail':   { label: 'Recruitment Mail',   bg: '#dbeafe', color: '#1e40af', icon: '📧' },
  'actions':            { label: 'Actions',            bg: '#dcfce7', color: '#166534', icon: '⚡' },
};

const currentStageConfig = {
  'offer letter':       { label: 'Offer Letter',       bg: '#fef9c3', color: '#854d0e', icon: '📄', border: '#fde68a' },
  'verification':       { label: 'Verification',       bg: '#bbf7d0', color: '#14532d', icon: '🔍', border: '#6ee7b7' },
  'salary stack':       { label: 'Salary Stackup',     bg: '#fecdd3', color: '#881337', icon: '💼', border: '#fca5a5' },
  'candidate approval': { label: 'Candidate Approval', bg: '#ddd6fe', color: '#4c1d95', icon: '✔️', border: '#c4b5fd' },
  'note for approval':  { label: 'Note for Approval',  bg: '#fbcfe8', color: '#831843', icon: '📋', border: '#f9a8d4' },
  'recruitment mail':   { label: 'Recruitment Mail',   bg: '#bfdbfe', color: '#1e3a8a', icon: '📬', border: '#93c5fd' },
  'actions':            { label: 'Actions',            bg: '#a7f3d0', color: '#064e3b', icon: '⚡', border: '#6ee7b7' },
};

const getStage      = (s) => { const k = Object.keys(stageConfig).find(k => (s||'').toLowerCase().includes(k)); return k ? stageConfig[k] : { label: s||'Unknown', bg:'#f1f5f9', color:'#475569', icon:'📌' }; };
const getCurrentCfg = (s) => { const k = Object.keys(currentStageConfig).find(k => (s||'').toLowerCase().includes(k)); return k ? currentStageConfig[k] : { label: s||'—', bg:'#f1f5f9', color:'#475569', icon:'📍', border:'#e2e8f0' }; };

const pastelRows = ['#fff9f0','#f0fdf4','#fdf4ff','#f0f9ff','#fff0f3','#f0fdfa'];
const MONTHS     = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Reports = () => {
  const [data, setData]         = useState([]);
  const [hrData, setHrData]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(0);
  const [search, setSearch]     = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear]   = useState('');
  const PER = 8;

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  // ── Fetch rejected history ──
const loadRejected = async () => {
  try {
    setLoading(true);

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const empName = userInfo?.employee;
    const token = userInfo?.token;
    const caseId = null;

    console.log("empName:", empName);
    console.log("token:", token);
   
    if (!empName || !token) {
      throw new Error("Missing empName or token");
    }

    const r = await axios.get(
     `${API_BASE_URL}/vrfy-Rjct-Hsty-Data/${caseId}/${empName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("API SUCCESS:", r);

    setData(r?.data?.verifyHistoryData || []);
  } catch (err) {
    console.error("ERROR:", err);

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err?.response?.data?.message || err.message || 'Failed to fetch records'
    });
  } finally {
    setLoading(false);
  }
};

  // ── Fetch current stage (hr-Aprvl-Data) ──
  const hrAprvlFetchData = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/hr-Aprvl-Data`, {
        headers: { Accept:'application/json', Authorization:`Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const d = await res.json();
      setHrData(d?.hrApprovalData || d?.HrAprvlData || []);
    } catch (err) {
      console.error('Error fetching HR approvals', err);
    }
  };


  useEffect(() => {
    loadRejected();
  },[])

  useEffect(() => {
    if (token) {
  
    hrAprvlFetchData();
    }
  }, [token]);

  // ── Build a lookup map: Child_CaseId → Recruit_Process ──
  const currentStageMap = useMemo(() => {
    const map = {};
    hrData.forEach(row => {
      if (row.Child_CaseId) {
        map[String(row.Child_CaseId).trim()] = row.Recruit_Process || '';
      }
    });
    return map;
  }, [hrData]);

  // ── Unique years ──
  const years = useMemo(() => {
    return [...new Set(data.map(r => r.deleted_at ? new Date(r.deleted_at).getFullYear() : null).filter(Boolean))].sort((a,b) => b-a);
  }, [data]);

  // ── Filter + search ──
  const filtered = useMemo(() => {
    let d = [...data];
    if (search.trim()) {
      const t = search.toLowerCase();
      d = d.filter(r => (r.caseId||'').toLowerCase().includes(t));
    }
    if (filterMonth !== '') d = d.filter(r => r.deleted_at && new Date(r.deleted_at).getMonth() === parseInt(filterMonth));
    if (filterYear)         d = d.filter(r => r.deleted_at && new Date(r.deleted_at).getFullYear() === parseInt(filterYear));
    return d;
  }, [data, search, filterMonth, filterYear]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER));
  const rows       = filtered.slice(page * PER, (page+1) * PER);
  const hasFilter  = filterMonth !== '' || filterYear;

  const clearFilters = () => { setFilterMonth(''); setFilterYear(''); setPage(0); };

  const cols = [
  { label:'S.No',          icon:'🔢', w:'55px'  },
  { label:'Case ID',       icon:'🏷️', w:'145px' },
  { label:'Candidate Name',     icon:'👤', w:'140px' },
  { label:'Rejected Stage',icon:'⛔', w:'170px' },
  
  { label:'Rejected Date', icon:'🗓️', w:'120px' },
  { label:'Rejected By',   icon:'🚫', w:'140px' },
  { label:'Current Stage', icon:'📍', w:'185px' },
];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
        .rr { font-family:'Nunito',sans-serif; min-height:80vh; padding:2px; }

        .rr-head { background:linear-gradient(120deg,#e0e7ff 0%,#fce7f3 50%,#d1fae5 100%); border-radius:18px; padding:18px 24px; margin-bottom:14px; display:flex; align-items:center; justify-content:space-between; border:1.5px solid #e9d5ff; box-shadow:0 4px 20px rgba(139,92,246,0.08); }
        .rr-head-left { display:flex; align-items:center; gap:14px; }
        .rr-head-icon { width:46px; height:46px; border-radius:13px; background:#fff; border:1.5px solid #e9d5ff; display:flex; align-items:center; justify-content:center; font-size:21px; box-shadow:0 2px 10px rgba(139,92,246,0.12); transition:transform 0.25s,box-shadow 0.25s; cursor:default; }
        .rr-head-icon:hover { transform:rotate(-8deg) scale(1.12); box-shadow:0 6px 18px rgba(139,92,246,0.22); }
        .rr-head-title { font-size:19px; font-weight:800; color:#3b0764; margin:0; }
        .rr-head-sub   { font-size:11.5px; color:#7c3aed; font-weight:600; margin-top:2px; }

        .rr-toolbar { display:flex; align-items:center; gap:10px; margin-bottom:14px; flex-wrap:wrap; }
        .rr-pill { background:#fff; border:1.5px solid #e9d5ff; border-radius:100px; padding:6px 14px; font-size:12px; font-weight:700; color:#7c3aed; display:flex; align-items:center; gap:6px; white-space:nowrap; }
        .rr-pill-num { font-size:16px; font-weight:800; color:#5b21b6; }

        .rr-search { flex:1; min-width:180px; max-width:880px; display:flex; align-items:center; gap:8px; background:#fff; border:1.5px solid #ddd6fe; border-radius:10px; padding:7px 12px; box-shadow:0 2px 8px rgba(139,92,246,0.06); transition:border-color 0.2s,box-shadow 0.2s; }
        .rr-search:focus-within { border-color:#a78bfa; box-shadow:0 2px 14px rgba(139,92,246,0.14); }
        .rr-search input { border:none; outline:none; font-size:12.5px; font-weight:600; color:#3b0764; background:transparent; width:100%; font-family:'Nunito',sans-serif; }
        .rr-search input::placeholder { color:#c4b5fd; font-weight:500; }

        .rr-filter-btn { display:flex; align-items:center; gap:7px; background:#fff; border:1.5px solid #ddd6fe; border-radius:10px; padding:7px 16px; font-size:12px; font-weight:700; color:#7c3aed; font-family:'Nunito',sans-serif; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(139,92,246,0.06); white-space:nowrap; }
        .rr-filter-btn:hover,.rr-filter-btn.active { background:#ede9fe; border-color:#a78bfa; transform:translateY(-1px); box-shadow:0 4px 12px rgba(139,92,246,0.16); }
        .rr-filter-icon { font-size:14px; transition:transform 0.3s; }
        .rr-filter-btn:hover .rr-filter-icon { transform:rotate(20deg) scale(1.2); }
        .rr-active-dot { width:7px; height:7px; border-radius:50%; background:#7c3aed; box-shadow:0 0 6px #a78bfa; }

        .rr-refresh-btn { background:#fff; border:1.5px solid #e9d5ff; border-radius:10px; padding:7px 14px; font-size:12px; font-weight:700; color:#7c3aed; font-family:'Nunito',sans-serif; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s; box-shadow:0 2px 8px rgba(139,92,246,0.06); white-space:nowrap; }
        .rr-refresh-btn:hover { background:#f5f3ff; transform:translateY(-1px); box-shadow:0 4px 12px rgba(139,92,246,0.14); }
        .rr-refresh-icon { font-size:14px; transition:transform 0.45s; display:inline-block; }
        .rr-refresh-btn:hover .rr-refresh-icon { transform:rotate(180deg); }

        /* FILTER MODAL */
        .rr-overlay { position:fixed; inset:0; background:rgba(59,7,100,0.18); z-index:1000; display:flex; align-items:center; justify-content:center; animation:fadeIn 0.18s ease; backdrop-filter:blur(2px); }
        .rr-modal { background:#fff; border-radius:20px; border:2px solid #e9d5ff; padding:28px; width:380px; max-width:95vw; box-shadow:0 20px 60px rgba(139,92,246,0.22); animation:popIn 0.22s ease; }
        .rr-modal-title { font-size:16px; font-weight:800; color:#3b0764; margin:0 0 4px; display:flex; align-items:center; gap:8px; }
        .rr-modal-sub { font-size:11.5px; color:#a78bfa; margin-bottom:20px; font-weight:600; }
        .rr-modal-label { font-size:11px; font-weight:800; color:#7c3aed; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:6px; display:flex; align-items:center; gap:5px; }
        .rr-modal-select { width:100%; padding:9px 12px; border:1.5px solid #ddd6fe; border-radius:10px; font-size:13px; font-weight:600; color:#3b0764; font-family:'Nunito',sans-serif; background:#faf5ff; outline:none; cursor:pointer; margin-bottom:16px; transition:border-color 0.2s; }
        .rr-modal-select:focus { border-color:#a78bfa; }
        .rr-modal-footer { display:flex; gap:10px; margin-top:4px; }
        .rr-modal-clear { flex:1; padding:9px; border-radius:10px; border:1.5px solid #ddd6fe; background:#f5f3ff; color:#7c3aed; font-size:13px; font-weight:700; font-family:'Nunito',sans-serif; cursor:pointer; transition:all 0.18s; }
        .rr-modal-clear:hover { background:#ede9fe; }
        .rr-modal-apply { flex:2; padding:9px; border-radius:10px; border:none; background:linear-gradient(135deg,#7c3aed,#a78bfa); color:#fff; font-size:13px; font-weight:800; font-family:'Nunito',sans-serif; cursor:pointer; transition:all 0.18s; box-shadow:0 4px 12px rgba(124,58,237,0.3); }
        .rr-modal-apply:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(124,58,237,0.4); }

        /* TABLE */
        .rr-card { background:#fff; border-radius:18px; border:1.5px solid #e9d5ff; overflow:auto; box-shadow:0 8px 32px rgba(139,92,246,0.09); }
        .rr-th { padding:12px 16px; font-size:9.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; color:#7c3aed; background:linear-gradient(90deg,#f5f3ff,#fce7f3); border-bottom:2px solid #e9d5ff; white-space:nowrap; text-align:left; }
        .rr-th-inner { display:inline-flex; align-items:center; gap:5px; }
        .rr-th-emoji { font-size:12px; transition:transform 0.25s; display:inline-block; }
        .rr-th:hover .rr-th-emoji { transform:scale(1.35) rotate(-8deg); }

        .rr-row { border-bottom:1px solid #f3e8ff; transition:all 0.18s; animation:rowIn 0.22s ease both; }
        .rr-row:last-child { border-bottom:none; }
        .rr-row:hover { transform:translateX(4px); box-shadow:inset 4px 0 0 #a78bfa; }
        .rr-td { padding:11px 16px; vertical-align:middle; }

        .rr-sno { width:26px; height:26px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:10.5px; font-weight:800; color:#7c3aed; background:#ede9fe; border:1px solid #ddd6fe; margin:0 auto; transition:transform 0.2s; }
        .rr-row:hover .rr-sno { transform:scale(1.15); }

        .rr-caseid { font-size:11px; font-weight:700; color:#1e40af; background:#dbeafe; border:1px solid #bfdbfe; border-radius:7px; padding:3px 9px; display:inline-block; transition:transform 0.2s,box-shadow 0.2s; }
        .rr-row:hover .rr-caseid { transform:scale(1.04); box-shadow:0 2px 8px rgba(37,99,235,0.15); }

        .rr-avatar { width:30px; height:30px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex-shrink:0; transition:transform 0.25s,box-shadow 0.25s; }
        .rr-row:hover .rr-avatar { transform:rotate(-6deg) scale(1.1); box-shadow:0 4px 12px rgba(0,0,0,0.15); }

        .rr-stage { display:inline-flex; align-items:center; gap:5px; border-radius:100px; padding:3px 10px; font-size:10px; font-weight:700; white-space:nowrap; transition:transform 0.2s,box-shadow 0.2s; }
        .rr-stage-icon { font-size:11px; transition:transform 0.3s; }
        .rr-row:hover .rr-stage { transform:scale(1.05); box-shadow:0 2px 8px rgba(0,0,0,0.1); }
        .rr-row:hover .rr-stage-icon { transform:scale(1.3) rotate(10deg); }

        .rr-current { display:inline-flex; align-items:center; gap:5px; border-radius:8px; padding:3px 10px; font-size:10px; font-weight:700; white-space:nowrap; border-style:dashed; border-width:1.5px; transition:transform 0.2s; }
        .rr-current-icon { font-size:11px; transition:transform 0.3s; }
        .rr-row:hover .rr-current { transform:scale(1.05); }
        .rr-row:hover .rr-current-icon { transform:translateY(-2px) scale(1.3); }
        .rr-current-none { font-size:11px; color:#c4b5fd; font-style:italic; font-weight:600; }

        .rr-date { font-size:11.5px; color:#6b7280; font-weight:600; }
        .rr-date-icon { font-size:12px; transition:transform 0.25s; display:inline-block; }
        .rr-row:hover .rr-date-icon { transform:scale(1.25) rotate(-10deg); }

        .rr-by { display:inline-flex; align-items:center; gap:6px; background:#fee2e2; border:1.5px solid #fecaca; border-radius:8px; padding:3px 9px; font-size:11px; font-weight:700; color:#991b1b; transition:transform 0.2s,box-shadow 0.2s; }
        .rr-by-icon { font-size:11px; transition:transform 0.3s; display:inline-block; }
        .rr-row:hover .rr-by { transform:scale(1.04); box-shadow:0 2px 8px rgba(239,68,68,0.18); }
        .rr-row:hover .rr-by-icon { transform:rotate(15deg) scale(1.2); }

        .rr-empty { text-align:center; padding:60px 20px; }
        .rr-empty-icon { font-size:40px; margin-bottom:10px; animation:bounce 1.4s ease infinite; }
        .rr-empty-title { font-size:14px; font-weight:800; color:#7c3aed; }
        .rr-empty-sub   { font-size:12px; color:#a78bfa; margin-top:4px; }
        .rr-spin { width:28px; height:28px; border:3px solid #ede9fe; border-top-color:#7c3aed; border-radius:50%; animation:spin 0.7s linear infinite; margin:0 auto 10px; }

        .rr-footer { display:flex; align-items:center; justify-content:space-between; padding:12px 18px; background:linear-gradient(90deg,#f5f3ff,#fce7f3); border-top:1.5px solid #e9d5ff; }
        .rr-foot-info { font-size:12px; color:#7c3aed; font-weight:700; }
        .rr-pag-btns  { display:flex; gap:5px; align-items:center; }
        .rr-pag-btn { padding:5px 13px; border-radius:9px; border:1.5px solid #ddd6fe; background:#fff; color:#7c3aed; font-size:12px; font-weight:700; font-family:'Nunito',sans-serif; cursor:pointer; transition:all 0.18s; }
        .rr-pag-btn:hover:not(:disabled) { background:#ede9fe; transform:translateY(-2px); box-shadow:0 4px 10px rgba(139,92,246,0.15); }
        .rr-pag-btn:disabled { opacity:0.3; cursor:not-allowed; }
        .rr-pag-num { width:30px; height:30px; border-radius:9px; border:1.5px solid #ddd6fe; background:#fff; color:#7c3aed; font-size:12px; font-weight:800; font-family:'Nunito',sans-serif; cursor:pointer; transition:all 0.18s; display:flex; align-items:center; justify-content:center; }
        .rr-pag-num.active { background:#7c3aed; border-color:#7c3aed; color:#fff; box-shadow:0 4px 12px rgba(124,58,237,0.35); }
        .rr-pag-num:not(.active):hover { background:#ede9fe; transform:translateY(-2px); }

        @keyframes rowIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
      `}</style>

      <div className="rr">

        {/* HEADER */}
        <div className="rr-head">
          <div className="rr-head-left">
            <div className="rr-head-icon">🗂️</div>
            <div>
              <h1 className="rr-head-title">Rejection Report</h1>
              <p className="rr-head-sub">Audit trail of all rejected candidate records</p>
            </div>
          </div>
          <button className="rr-refresh-btn" onClick={() => { loadRejected(); hrAprvlFetchData(); }}>
            <span className="rr-refresh-icon">🔄</span> Refresh
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="rr-toolbar">
          <div className="rr-pill">
            <span className="rr-pill-num">{filtered.length}</span>
            {filtered.length !== data.length ? `/ ${data.length}` : ''} records
          </div>

          <div className="rr-search">
            <span style={{ fontSize:'14px' }}>🔍</span>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search Case ID..."
            />
            {search && (
              <span onClick={() => { setSearch(''); setPage(0); }}
                style={{ cursor:'pointer', fontSize:'13px', color:'#c4b5fd' }}>✕</span>
            )}
          </div>

          <button className={`rr-filter-btn ${hasFilter ? 'active' : ''}`} onClick={() => setFilterOpen(true)}>
            <span className="rr-filter-icon">🎛️</span>
            Filter by Date
            {hasFilter && <span className="rr-active-dot" />}
          </button>

          {hasFilter && (
            <button className="rr-filter-btn" onClick={clearFilters}
              style={{ color:'#dc2626', borderColor:'#fecaca', background:'#fff1f2' }}>
              ✕ Clear Filter
            </button>
          )}
        </div>

        {/* TABLE */}
        <div className="rr-card">
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {cols.map(({ label, icon, w }) => (
                  <th key={label} className="rr-th" style={{ width: w||'auto' }}>
                    <span className="rr-th-inner">
                      <span className="rr-th-emoji">{icon}</span>
                      {label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="rr-empty">
                  <div className="rr-spin" />
                  <div className="rr-empty-sub">Loading records...</div>
                </td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="rr-empty">
                  <div className="rr-empty-icon">📭</div>
                  <div className="rr-empty-title">No Records Found</div>
                  <div className="rr-empty-sub">Try adjusting your filters</div>
                </td></tr>
              ) : rows.map((item, i) => {
                const stage    = getStage(item.RevisionTrackStatus);

                // ── CURRENT STAGE: look up from hrData by matching caseId ──
                const rawCurrent  = currentStageMap[String(item.caseId || '').trim()] || '';
                const currentStage = getCurrentCfg(rawCurrent);

                const gIdx    = page * PER + i + 1;
                const rowBg   = pastelRows[i % pastelRows.length];
                const avBg    = ['#fbcfe8','#bbf7d0','#bfdbfe','#ddd6fe','#fed7aa','#a5f3fc'][i % 6];
                const avColor = ['#9d174d','#065f46','#1e40af','#5b21b6','#92400e','#0e7490'][i % 6];

                return (
                  <tr key={item.verifyDelete_Id || i} className="rr-row"
                    style={{ background:rowBg, animationDelay:`${i*0.04}s` }}>

                    <td className="rr-td" style={{ textAlign:'center' }}>
                      <div className="rr-sno">{gIdx}</div>
                    </td>

                    <td className="rr-td">
                      <span className="rr-caseid">{item.caseId || '—'}</span>
                    </td>

                    <td className="rr-td">
                      <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                        <div className="rr-avatar" style={{ background:avBg, color:avColor }}>
                          {(item.name||'?')[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize:'12.5px', fontWeight:700, color:'#1e293b', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100px' }}>
                          {item.name || '—'}
                        </span>
                      </div>
                    </td>

                    {/* REJECTED STAGE */}
                    <td className="rr-td">
                      <span className="rr-stage" style={{ background:stage.bg, color:stage.color }}>
                        <span className="rr-stage-icon">{stage.icon}</span>
                        {stage.label}
                      </span>
                    </td>

                   

                    <td className="rr-td">
                      <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                        <span className="rr-date-icon">📅</span>
                        <span className="rr-date">
                          {item.deleted_at
                            ? new Date(item.deleted_at).toLocaleDateString('en-GB',{ day:'2-digit', month:'short', year:'numeric' })
                            : '—'}
                        </span>
                      </div>
                    </td>

                    <td className="rr-td">
                      <span className="rr-by">
                        <span className="rr-by-icon">👤</span>
                        {item.rejected_by || '—'}
                      </span>
                    </td>
 {/* CURRENT STAGE — from hr-Aprvl-Data matched by caseId */}
                    <td className="rr-td">
                      {rawCurrent ? (
                        <span className="rr-current"
                          style={{ background:currentStage.bg, color:currentStage.color, borderColor:currentStage.border }}>
                          <span className="rr-current-icon">{currentStage.icon}</span>
                          {currentStage.label}
                        </span>
                      ) : (
                        <span className="rr-current-none">Not in pipeline</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && filtered.length > PER && (
            <div className="rr-footer">
              <span className="rr-foot-info">
                {page*PER+1}–{Math.min((page+1)*PER, filtered.length)} of {filtered.length}
              </span>
              <div className="rr-pag-btns">
                <button className="rr-pag-btn" onClick={()=>setPage(p=>p-1)} disabled={page===0}>← Prev</button>
                {Array.from({ length:totalPages }, (_,i) => (
                  <button key={i} className={`rr-pag-num ${i===page?'active':''}`} onClick={()=>setPage(i)}>{i+1}</button>
                ))}
                <button className="rr-pag-btn" onClick={()=>setPage(p=>p+1)} disabled={page===totalPages-1}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FILTER MODAL */}
      {filterOpen && (
        <div className="rr-overlay" onClick={e => e.target===e.currentTarget && setFilterOpen(false)}>
          <div className="rr-modal">
            <div className="rr-modal-title">🎛️ Filter Records</div>
            <div className="rr-modal-sub">Filter rejection records by month and year</div>

            <div className="rr-modal-label">📅 Month</div>
            <select className="rr-modal-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              <option value="">All Months</option>
              {MONTHS.map((m,i) => <option key={m} value={i}>{m}</option>)}
            </select>

            <div className="rr-modal-label">📆 Year</div>
            <select className="rr-modal-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              <option value="">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <div className="rr-modal-footer">
              <button className="rr-modal-clear" onClick={() => { clearFilters(); setFilterOpen(false); }}>Clear</button>
              <button className="rr-modal-apply" onClick={() => { setPage(0); setFilterOpen(false); }}>Apply Filters ✓</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Reports;