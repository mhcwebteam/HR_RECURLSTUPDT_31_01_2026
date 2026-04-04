import React, { useEffect, useState, useRef, useMemo } from 'react';
import { API_BASE_URL } from '../src/Config/Config';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  Building2, User, ArrowRight, Users,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Hash, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, Inbox, MapPin, Briefcase, Download,
  ChevronDown, Search, X,
} from 'lucide-react';
import axiosInstance from './Config/axiosConfig';

const avatarColors = [
  ['#a78bfa', '#c4b5fd'], ['#818cf8', '#a5b4fc'], ['#7dd3fc', '#93c5fd'], ['#86efac', '#bbf7d0'],
];

const statusConfig = {
  Transferred: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', Icon: CheckCircle2 },
  Pending: { bg: '#fffbeb', text: '#92400e', border: '#fde68a', Icon: AlertCircle },
  Rejected: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca', Icon: XCircle },
  Approved: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', Icon: CheckCircle2 },
};

const PAGE_SIZE = 7;
const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'NA';

/* ── Reusable Searchable Dropdown (with disabled) ── */
function SearchableDropdown({ placeholder, icon: Icon, value, onChange, options = [], labelKey, valueKey, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = Array.isArray(options)
    ? options.filter(o => (o[labelKey] || '').toLowerCase().includes(q.toLowerCase()))
    : [];

  const selected = options.find(o => o[valueKey] === value);
  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
    setQ('');
  };
  const handleClear = (e) => { e.stopPropagation(); onChange(''); setQ(''); };

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: '210px' }}>
      <div
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          background: disabled ? '#f3f4f6' : '#fff',
          borderRadius: '9px',
          border: `1.5px solid ${open ? '#7c6fcf' : '#c9c2f0'}`,
          padding: '0 10px', height: '32px', cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all .15s', userSelect: 'none',
          boxShadow: open ? '0 0 0 3px rgba(124,111,207,0.15)' : 'none',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {Icon && <Icon size={13} color="#8b83c8" strokeWidth={2} />}
        <span style={{ flex: 1, fontSize: '12px', color: selected ? '#312e7a' : '#8b83c8', fontWeight: selected ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selected ? `${selected[valueKey]} — ${selected[labelKey]}` : placeholder}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {value && !disabled && (
            <span onClick={handleClear} style={{ display: 'flex', alignItems: 'center', padding: '2px', borderRadius: '4px', color: '#9ca3af' }}>
              <X size={11} strokeWidth={2.5} />
            </span>
          )}
          <ChevronDown size={13} color="#8b83c8" strokeWidth={2} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }} />
        </div>
      </div>
      {open && !disabled && (
        <div style={{
          position: 'absolute', top: '36px', left: 0, zIndex: 9999,
          background: '#fff', borderRadius: '10px', minWidth: '260px',
          border: '1.5px solid #d4cdf5', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #f0eeff', position: 'relative' }}>
            <Search size={12} color="#8b83c8" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              autoFocus
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search..."
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', paddingLeft: '28px', paddingRight: '8px',
                height: '28px', borderRadius: '7px', border: '1.5px solid #d4cdf5',
                fontSize: '11.5px', color: '#312e7a', outline: 'none', background: '#faf9ff',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <div
              onClick={() => handleSelect('')}
              style={{ padding: '7px 12px', fontSize: '11.5px', color: '#8b83c8', cursor: 'pointer', borderBottom: '1px solid #f5f3ff' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <em>All</em>
            </div>
            {filtered.length === 0 && (
              <div style={{ padding: '12px', fontSize: '11.5px', color: '#9ca3af', textAlign: 'center' }}>No results</div>
            )}
            {filtered.map((o, i) => (
              <div
                key={i}
                onClick={() => handleSelect(o[valueKey])}
                style={{
                  padding: '7px 12px', fontSize: '11.5px', cursor: 'pointer',
                  color: o[valueKey] === value ? '#4b3fa0' : '#374151',
                  fontWeight: o[valueKey] === value ? 700 : 400,
                  background: o[valueKey] === value ? '#f0eeff' : 'transparent',
                  borderBottom: '1px solid #faf9ff',
                }}
                onMouseEnter={e => { if (o[valueKey] !== value) e.currentTarget.style.background = '#f5f3ff'; }}
                onMouseLeave={e => { if (o[valueKey] !== value) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ color: '#8b83c8', marginRight: '6px', fontSize: '10.5px' }}>{o[valueKey]}</span>
                {o[labelKey]}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HODHistory() {
  const [token] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || null);

  // Data states
  const [transferData, setTransferData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Filter states
  const [hrOptions, setHrOptions] = useState([]);
  const [caseOptions, setCaseOptions] = useState([]);
  const [selectedHr, setSelectedHr] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);

  // Fetch HR list
  const fetchHrNames = async () => {
    try {
      const res = await axiosInstance.get(`${API_BASE_URL}/hod/hr-names`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token?.token}` }
      });

      console.log(res.data.hodsHrsData,"ttttttttttt4555544");
     
      setHrOptions(res?.data?.hodsHrsData);
    } catch (err) {
      console.error('Failed to load HR names:', err);
      setHrOptions([]);
    }
  };

  // Fetch case IDs for selected HR
  const fetchCaseIds = async (hrName) => {
    try {
      const res = await axiosInstance.post(`${API_BASE_URL}/hod/case-ids`,
        { assigned_to: hrName },
        { headers: { Accept: 'application/json', Authorization: `Bearer ${token?.token}` } }
      );
      // Assuming response has HodsHrsCasIds array
      setCaseOptions(res.data?.HodsHrsCasIds || []);
    } catch (err) {
      console.error('Failed to fetch case IDs:', err);
      setCaseOptions([]);
    }
  };

  // Main data fetcher
  const fetchData = async (hrName = '', caseId = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (hrName) params.append('hrName', hrName);
      if (caseId) params.append('caseId', caseId);
      const url = `${API_BASE_URL}/hod-Undr-Hrs-GetData${params.toString() ? `?${params.toString()}` : ''}`;

      const res = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${token?.token}` }
      });

      // Extract the array – adjust based on actual response structure
      const data = res.data?.overlHodHrData || (Array.isArray(res.data) ? res.data : []);
      setTransferData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch data', timer: 2000, showConfirmButton: false });
      setTransferData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (token?.token) {
      fetchHrNames();
      fetchData(); // load all data
    }
  }, [token?.token]);

  // Handlers
  const handleHrChange = (hrName) => {
    setSelectedHr(hrName);
    setSelectedCase(null);      // reset case when HR changes
    setCaseOptions([]);         // clear previous cases
    setPage(1);

    if (hrName) {
      fetchCaseIds(hrName);     // get cases for this HR
      fetchData(hrName, '');    // fetch data for this HR (no case)
    } else {
      fetchData('', '');        // fetch all data
    }
  };

  const handleCaseChange = (caseId) => {
    setSelectedCase(caseId);
    setPage(1);
    // Fetch data with current HR and selected case
    fetchData(selectedHr, caseId);
  };

  // Pagination helpers
  const filteredData = transferData; // No client filters, all filtering done by API
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const pagedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pageNums = () => {
    const p = [];
    for (let n = Math.max(1, page - 2); n <= Math.min(totalPages, page + 2); n++) p.push(n);
    return p;
  };

  const formatDateDMY = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const handleDownload = () => {
    const headers = [
      'Employee Name', 'Emp ID', 'Case ID', 'Transfer Date',
      'From Plant', 'From Dept', 'From Designation',
      'To Plant', 'To Dept', 'To Designation', 'Status'
    ];
    const rows = filteredData.map(t => [
      t.empName || 'N/A',
      t.EMP_ID,
      t.case_id,
      formatDateDMY(t.TRANSFER_DATE),
      t.old_plant,
      t.old_department,
      t.old_designation,
      t.new_plant,
      t.new_department,
      t.new_designation,
      t.transfer_status
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transfer_history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Styles (keep as before)
  const GRID = '1.6fr 0.85fr 2.6fr 50px 2.6fr 1fr';
  const P = {
    headerBg: 'linear-gradient(130deg, #e8e4f8 0%, #dde8f8 100%)',
    headerBorder: '#c9c2f0',
    colHeadBg: '#f0eeff',
    colHeadBorder: '#d4cdf5',
    colHeadText: '#4b3fa0',
    accentBtn: '#7c6fcf',
    accentBtnHov: '#6257b5',
  };
  const s = {
    root: { padding: '1px', fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif", minHeight: '100vh', background: '#ffffff', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' },
    headerCard: { background: '#fff', borderRadius: '16px', border: `1px solid ${P.headerBorder}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '8px', overflow: 'visible' },
    stripe: { background: P.headerBg, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', borderRadius: '16px' },
    titleText: { fontSize: '15px', fontWeight: 800, color: '#312e7a', letterSpacing: '-0.3px' },
    subText: { fontSize: '11px', color: '#8b83c8', marginTop: '1px' },
    controls: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
    dlBtn: { display: 'flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 14px', borderRadius: '9px', border: `1.5px solid ${P.accentBtn}`, background: P.accentBtn, color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all .15s' },
    tableCard: { background: '#fff', borderRadius: '16px', border: `1px solid ${P.colHeadBorder}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' },
    colHeader: { display: 'grid', gridTemplateColumns: GRID, borderBottom: `2px solid ${P.colHeadBorder}`, background: P.colHeadBg },
    colCell: (align = 'flex-start', extra = {}) => ({ display: 'flex', alignItems: 'center', justifyContent: align, gap: '6px', padding: '10px 13px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: P.colHeadText, borderRight: `1px solid ${P.colHeadBorder}`, ...extra }),
    row: (even, hov) => ({ display: 'grid', gridTemplateColumns: GRID, borderBottom: '1px solid #f3f4f6', background: hov ? '#f5f3ff' : even ? '#fff' : '#fdfcff', transition: 'background .12s', cursor: 'default' }),
    cell: (extra = {}) => ({ display: 'flex', alignItems: 'center', padding: '9px 13px', fontSize: '12px', color: '#111827', borderRight: '1px solid #f3f4f6', ...extra }),
    pagFooter: { padding: '9px 18px', background: '#faf9ff', borderTop: `1.5px solid ${P.colHeadBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' },
    pageText: { fontSize: '11px', color: '#8b83c8' },
    pgBtn: (active, disabled) => ({ border: active ? 'none' : `1.5px solid ${P.colHeadBorder}`, cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: '7px', fontSize: '11.5px', fontWeight: 700, transition: 'all .15s', padding: '0 10px', height: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '3px', background: active ? P.accentBtn : disabled ? '#f3f4f6' : '#fff', color: active ? '#fff' : disabled ? '#d1d5db' : '#4b3fa0', boxShadow: active ? '0 2px 8px rgba(124,111,207,.35)' : 'none' }),
  };

  return (
    <div style={s.root}>
      <div style={s.headerCard}>
        <div style={s.stripe}>
          <div>
            <div style={s.titleText}>Plant Transfer History</div>
            <div style={s.subText}>Employee plant-to-plant transfer records</div>
          </div>
          <div style={s.controls}>
            {/* HR Dropdown */}
            <SearchableDropdown
              placeholder="Select HR"
              value={selectedHr}
              onChange={handleHrChange}
              options={hrOptions}
              labelKey="hr_names"       
              valueKey="hr_names"
            />

            {/* Case ID Dropdown */}
            <SearchableDropdown
              placeholder={selectedHr ? "Select Case ID" : "Select HR first"}
              value={selectedCase}
              onChange={handleCaseChange}
              options={caseOptions}
              labelKey="CaseIds"        // adjust based on actual API field (maybe "case_id" or "CaseIds")
              valueKey="CaseIds"
              disabled={!selectedHr}
            />

            {/* Download Button */}
            <button style={s.dlBtn} onClick={handleDownload}>
              <Download size={13} /> Download CSV
            </button>
          </div>
        </div>
      </div>

      <div style={s.tableCard}>
        {/* Column Headers */}
        <div style={s.colHeader}>
          <div style={s.colCell('flex-start')}>Employee</div>
          <div style={s.colCell('center')}>Case ID</div>
          <div style={s.colCell('flex-start')}>From Plant · Dept · Designation</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${P.colHeadBorder}` }}></div>
          <div style={s.colCell('flex-start')}>To Plant · Dept · Designation</div>
          <div style={{ ...s.colCell('center'), borderRight: 'none' }}>Transfer Date</div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ padding: '56px', textAlign: 'center' }}>
            <RefreshCw size={26} color={P.accentBtn} style={{ animation: 'spin .8s linear infinite', margin: '0 auto 10px', display: 'block' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Loading records…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredData.length === 0 && (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#f0eeff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: `1px solid ${P.colHeadBorder}` }}>
              <Inbox size={24} color={P.accentBtn} strokeWidth={1.8} />
            </div>
            <p style={{ color: '#1f2937', fontSize: '14px', fontWeight: 700, margin: '0 0 4px' }}>No records found</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>No transfers match your current filters.</p>
          </div>
        )}

        {/* Data Rows */}
        {!loading && pagedData.map((t, i) => {
          const name = t.empName || 'Unknown';
          const [c1, c2] = avatarColors[i % avatarColors.length];
          const st = statusConfig[t.transfer_status] || { bg: '#f3f4f6', text: '#374151', border: '#d1d5db', Icon: AlertCircle };
          const StatusIcon = st.Icon;
          const globalIdx = (page - 1) * PAGE_SIZE + i;

          return (
            <div key={t.case_id || i} style={s.row(globalIdx % 2 === 0, hoveredRow === i)} onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)}>
              {/* Employee */}
              <div style={s.cell({ gap: '10px' })}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: `linear-gradient(135deg,${c1},${c2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff' }}>
                  {getInitials(name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '12px' }}>{name}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <User size={9} />{t.EMP_ID}
                    <span>·</span>
                    <Clock size={9} />{formatDateDMY(t.TRANSFER_DATE)}
                  </div>
                </div>
              </div>

              {/* Case ID */}
              <div style={s.cell({ justifyContent: 'center' })}>
                <span style={{ background: '#ede9fe', color: '#4c1d95', fontSize: '9.5px', fontWeight: 700, padding: '4px 8px', borderRadius: '7px', border: '1px solid #c4b5fd', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Hash size={9} />{t.case_id}
                </span>
              </div>

              {/* FROM */}
              <div style={s.cell({ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' })}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={11} color={P.accentBtn} />
                  <span style={{ fontSize: '11.5px', fontWeight: 700 }}>{t.old_plant || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f0eeff', color: '#4b3fa0', fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: `1px solid ${P.colHeadBorder}` }}>
                    <Building2 size={9} />{t.old_department || 'N/A'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f0eeff', color: '#4b3fa0', fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: `1px solid ${P.colHeadBorder}` }}>
                    <Briefcase size={9} />{t.old_designation || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: P.accentBtn, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRight size={12} color="white" />
                </div>
              </div>

              {/* TO */}
              <div style={s.cell({ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' })}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={11} color={P.accentBtn} />
                  <span style={{ fontSize: '11.5px', fontWeight: 700 }}>{t.new_plant || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f0eeff', color: '#4b3fa0', fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: `1px solid ${P.colHeadBorder}` }}>
                    <Building2 size={9} />{t.new_department || 'N/A'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f0eeff', color: '#4b3fa0', fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: `1px solid ${P.colHeadBorder}` }}>
                    <Briefcase size={9} />{t.new_designation || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Transfer Date / Status */}
              <div style={s.cell({ justifyContent: 'center', borderRight: 'none' })}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: st.bg, color: st.text, border: `1.5px solid ${st.border}`, whiteSpace: 'nowrap' }}>
                  <StatusIcon size={11} />
                  {formatDateDMY(t.TRANSFER_DATE)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Pagination */}
        {!loading && filteredData.length > 0 && (
          <div style={s.pagFooter}>
            <span style={s.pageText}>Page {page} of {totalPages} · {PAGE_SIZE} rows/page</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setPage(1)} disabled={page === 1} style={s.pgBtn(false, page === 1)}><ChevronsLeft size={13} /></button>
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} style={s.pgBtn(false, page === 1)}><ChevronLeft size={13} /></button>
              {pageNums().map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ ...s.pgBtn(p === page, false), minWidth: '30px' }}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} style={s.pgBtn(false, page === totalPages)}><ChevronRight size={13} /></button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={s.pgBtn(false, page === totalPages)}><ChevronsRight size={13} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}