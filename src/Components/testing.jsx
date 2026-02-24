
import React, { useEffect, useState, useRef } from 'react';
import { API_BASE_URL } from '../Config/Config';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  ArrowRightLeft, Building2, User, ArrowRight, Users,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Hash, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, Inbox, MapPin, Briefcase, Download,
  ChevronDown, Search, X,
} from 'lucide-react';

const avatarColors = [
  ['#a78bfa', '#c4b5fd'], ['#818cf8', '#a5b4fc'], ['#7dd3fc', '#93c5fd'], ['#86efac', '#bbf7d0'],
];

const statusConfig = {
  Transferred: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', Icon: CheckCircle2 },
  Pending:     { bg: '#fffbeb', text: '#92400e', border: '#fde68a', Icon: AlertCircle },
  Rejected:    { bg: '#fef2f2', text: '#991b1b', border: '#fecaca', Icon: XCircle },
  Approved:    { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', Icon: CheckCircle2 },
};

const PAGE_SIZE = 7;
const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'NA';
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

/* ── Reusable Searchable Dropdown ── */
function SearchableDropdown({ placeholder, icon: Icon, value, onChange, options, labelKey, valueKey }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o =>
    (o[labelKey] || '').toLowerCase().includes(q.toLowerCase())
  
  );

console.log(filtered,"frrrrrrrrrrrrr55555555555555555");

  const selected = options.find(o => o[valueKey] === value);
  const handleSelect = (val) => { 


    onChange(val); 
    setOpen(false); 
    setQ(''); 
  };
  const handleClear = (e) => { e.stopPropagation(); onChange(''); setQ(''); };

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: '210px' }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          background: '#fff', borderRadius: '9px',
          border: `1.5px solid ${open ? '#7c6fcf' : '#c9c2f0'}`,
          padding: '0 10px', height: '32px', cursor: 'pointer',
          transition: 'all .15s', userSelect: 'none',
          boxShadow: open ? '0 0 0 3px rgba(124,111,207,0.15)' : 'none',
        }}
      >
        {Icon && <Icon size={13} color="#8b83c8" strokeWidth={2} />}
        <span style={{ flex: 1, fontSize: '12px', color: selected ? '#312e7a' : '#8b83c8', fontWeight: selected ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selected ? `${selected[valueKey]} — ${selected[labelKey]}` : placeholder}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>

          {value && (
            <span onClick={handleClear} style={{ display: 'flex', alignItems: 'center', padding: '2px', borderRadius: '4px', color: '#9ca3af' }}>
              <X size={11} strokeWidth={2.5} />
            </span>
          )}
          
          <ChevronDown size={13} color="#8b83c8" strokeWidth={2} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }} />
        </div>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: '36px', left: 0, zIndex: 999,
          background: '#fff', borderRadius: '10px', minWidth: '260px',
          border: '1.5px solid #d4cdf5', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}>
          {/* Inner search */}
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
          {/* Options list */}
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
                onMouseLeave={e => { if (o[valueKey] !== value) e.currentTarget.style.background = o[valueKey] === value ? '#f0eeff' : 'transparent'; }}
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

export default function History() {

  const [employeeData, setEmployeData]    = useState([]);


  const [selectedEmp, setSelectedEmp]     = useState('');


  const [selectedPlant, setSelectedPlant] = useState('');
  const [transferData, setTransferData]   = useState([]);
  const [loading, setLoading]             = useState(false);
  const [page, setPage]                   = useState(1);

  const [hoveredRow, setHoveredRow]       = useState(null);

    const [token]  = useState(() => JSON.parse(localStorage.getItem('userInfo')) || null);



  const FilterEmployee = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get-Emps-Trns-DrpDwn`, 

        { headers: { Accept: 'application/json', Authorization: `Bearer ${token?.token}` } });

    console.log(res,"r5r555555555555555555555555");

      setEmployeData(res.data);
    } catch (err) { console.error(err.response?.data || err.message); }
  };

     const fetchTransferData = async (empId=null) => {
      
        setLoading(true);
        try {
         
           const url = `${API_BASE_URL}/empTrsferGetDt${empId ? `/${empId}` : ""}`;
           console.log(url);
            const res = await axios.get(
                url,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token?.token}`,
                    },
                }
            );


            
    console.log(res,"4444444444444444444444444444444");
            // Check different possible response structures
            if (res.data && res.data.ovrlEmpHistryData) {
                setTransferData(res.data.ovrlEmpHistryData);
            } else if (Array.isArray(res.data)) {
                setTransferData(res.data);
            } else if (res.data && res.data.data) {
                setTransferData(res.data.data);
            } else {
                setTransferData([]);
            }

        } catch (error) {
            console.error("Error fetching transfer data:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "Failed to fetch transfer data",
                timer: 2000,
                showConfirmButton: false,
            });
            setTransferData([]);
        } finally {
            setLoading(false);
        }
    };


      useEffect(() => {
        if (token?.token) {
          fetchTransferData()
        }
    }, [token?.token]);


  const handleEmpChange = (id) => { setSelectedEmp(id); setSelectedPlant(''); setPage(1); fetchTransferData(id); };
  const handlePlantChange = (plant) => { setSelectedPlant(plant); setPage(1); };

  useEffect(() => { if (token?.token) FilterEmployee(); }, [token?.token]);
  useEffect(() => { setPage(1); }, [selectedPlant]);

  // Derive unique plants from loaded transfer data
  const plantOptions = [...new Map(
    transferData.flatMap(t => [
      t.old_plant ? { plant_id: t.old_plant, plant_name: t.old_plant } : null,
      t.new_plant ? { plant_id: t.new_plant, plant_name: t.new_plant } : null,
    ].filter(Boolean)).map(p => [p.plant_id, p])
  ).values()];

  const handleDownload = () => {
    const headers = ['Employee Name', 'Emp ID', 'Case ID', 'Transfer Date', 'From Plant', 'From Dept', 'From Designation', 'To Plant', 'To Dept', 'To Designation', 'Status'];
    const rows = filteredData.map(t => [
      getEmployeeName(t.emp_id), t.emp_id, t.case_id, formatDate(t.transfer_date),
      t.old_plant, t.old_department, t.old_designation,
      t.new_plant, t.new_department, t.new_designation,
      t.transfer_status
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'transfer_history.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredData = transferData.filter(t => {
    return !selectedPlant || t.old_plant === selectedPlant || t.new_plant === selectedPlant;
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const pagedData  = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const getEmployeeName = (empId) => {
     const emp = employeeData?.empDrpDwn?.find(e => e.emp_id === empId); 

     console.log("empempempemp",emp)
     return emp?.EMP_NAME || '';
     };


  
  const pageNums = () => { const p = []; for (let n = Math.max(1, page - 2); n <= Math.min(totalPages, page + 2); n++) p.push(n); return p; };

  const empOptions = Array.isArray(employeeData?.empDrpDwn)
    ? employeeData.empDrpDwn.map(e => ({ emp_id: e.emp_id, empName: e.EMP_NAME }))
    : [];

  const GRID = '1.6fr 0.85fr 2.6fr 50px 2.6fr 1fr';

  const P = {
    headerBg:     'linear-gradient(130deg, #e8e4f8 0%, #dde8f8 100%)',
    headerBorder: '#c9c2f0',
    colHeadBg:    '#f0eeff',
    colHeadBorder:'#d4cdf5',
    colHeadText:  '#4b3fa0',
    accentBtn:    '#7c6fcf',
    accentBtnHov: '#6257b5',
  };

  const s = {
    // root: { padding: '16px', fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",  background: '#ffffff',   boxSizing: 'border-box' , overflow: 'hidden'},
    root: {
  padding: '1px',
  fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
  minHeight: '100vh',
  background: '#ffffff',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column', // important
},
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

      {/* ── TOP HEADER CARD ── */}
      <div style={s.headerCard}>
        <div style={s.stripe}>
          <div>
            <div style={s.titleText}>Plant Transfer History</div>
            <div style={s.subText}>Employee plant-to-plant transfer records</div>
          </div>
          <div style={s.controls}>

        
            <SearchableDropdown
              placeholder="Select Employee"
              icon={Users}
              value={selectedEmp}
              onChange={handleEmpChange}
              options={empOptions}
              labelKey="empName"
              valueKey="emp_id"
            />

            {/* Plant Searchable Dropdown */}
            <SearchableDropdown
              placeholder="Select Plant"
              icon={MapPin}
              value={selectedPlant}
              onChange={handlePlantChange}
              options={plantOptions}
              labelKey="plant_name"
              valueKey="plant_id"
            />

            {/* Download Button */}
            <button style={s.dlBtn} onClick={handleDownload}
              onMouseEnter={e => e.currentTarget.style.background = P.accentBtnHov}
              onMouseLeave={e => e.currentTarget.style.background = P.accentBtn}>
              <Download size={13} strokeWidth={2.2} />
              Download CSV
            </button>
          </div>
        </div>
      </div>

      {/* ── TABLE CARD ── */}
      <div style={s.tableCard}>

        {/* ── COLUMN HEADERS ── */}
        <div style={s.colHeader}>
          <div style={s.colCell('flex-start')}>Employee</div>
          <div style={s.colCell('center')}>Case ID</div>
          <div style={s.colCell('flex-start')}>From Plant · Dept · Designation</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${P.colHeadBorder}` }}></div>
          <div style={s.colCell('flex-start')}>To Plant · Dept · Designation</div>
          <div style={{ ...s.colCell('center'), borderRight: 'none' }}>Status</div>
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
            <p style={{ color: '#1f2937', fontSize: '14px', fontWeight: 700, margin: '0 0 4px' }}>
              {(selectedEmp || transferData.length) ? 'No records found' : 'Select an employee'}
            </p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>
              {(selectedEmp || transferData.length) ? 'No transfers match your current filters.' : 'Choose an employee above, or select All Employees.'}
            </p>
          </div>
        )}

        {/* ── DATA ROWS ── */}
        {!loading && pagedData.map((t, i) => {
          const name = getEmployeeName(t.EMP_ID);
        
          const [c1, c2] = avatarColors[i % avatarColors.length];
          const st = statusConfig[t.transfer_status] || { bg: '#f3f4f6', text: '#374151', border: '#d1d5db', Icon: AlertCircle };
          const StatusIcon = st.Icon;
          const globalIdx = (page - 1) * PAGE_SIZE + i;

          return (
            <div key={t.case_id || i} style={s.row(globalIdx % 2 === 0, hoveredRow === i)}
              onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)}>

              {/* Employee */}
              <div style={s.cell({ gap: '10px' })}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0, background: `linear-gradient(135deg,${c1},${c2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff' }}>
                  {getInitials(name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '12px', color: '#111827' }}>{name || 'Unknown'}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <User size={9} strokeWidth={2} />{t.EMP_ID}
                    <span style={{ color: '#d1d5db' }}>·</span>
                    <Clock size={9} strokeWidth={2} />{formatDate(t.TRANSFER_DATE)}
                  </div>
                </div>
              </div>

              {/* Case ID */}
              <div style={s.cell({ justifyContent: 'center' })}>
                <span style={{ background: '#ede9fe', color: '#4c1d95', fontSize: '9.5px', fontWeight: 700, padding: '4px 8px', borderRadius: '7px', border: '1px solid #c4b5fd', display: 'flex', alignItems: 'center', gap: '4px', wordBreak: 'break-all' }}>
                  <Hash size={9} strokeWidth={2.5} />{t.case_id}
                </span>
              </div>

              {/* FROM */}
              <div style={s.cell({ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' })}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={11} color={P.accentBtn} strokeWidth={2.2} />
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#111827' }}>{t.old_plant || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f0eeff', color: '#4b3fa0', fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: `1px solid ${P.colHeadBorder}` }}>
                    <Building2 size={9} strokeWidth={2} />{t.old_department || 'N/A'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f0eeff', color: '#4b3fa0', fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: `1px solid ${P.colHeadBorder}` }}>
                    <Briefcase size={9} strokeWidth={2} />{t.old_designation || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #f3f4f6', borderRight: '1px solid #f3f4f6' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: P.accentBtn, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRight size={12} color="white" strokeWidth={2.5} />
                </div>
              </div>

              {/* TO */}
              <div style={s.cell({ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' })}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={11} color={P.accentBtn} strokeWidth={2.2} />
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#111827' }}>{t.new_plant || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f0eeff', color: '#4b3fa0', fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: `1px solid ${P.colHeadBorder}` }}>
                    <Building2 size={9} strokeWidth={2} />{t.new_department || 'N/A'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f0eeff', color: '#4b3fa0', fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: `1px solid ${P.colHeadBorder}` }}>
                    <Briefcase size={9} strokeWidth={2} />{t.new_designation || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div style={s.cell({ justifyContent: 'center', borderRight: 'none' })}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: st.bg, color: st.text, border: `1.5px solid ${st.border}`, whiteSpace: 'nowrap' }}>
                  <StatusIcon size={11} strokeWidth={2.5} />{'Transferred'}
                </span>
              </div>

            </div>
          );
        })}

        {/* ── PAGINATION ── */}
        {!loading && filteredData.length > 0 && (
          <div style={s.pagFooter}>
            <span style={s.pageText}>Page <b style={{ color: '#374151' }}>{page}</b> of <b style={{ color: '#374151' }}>{totalPages}</b> · {PAGE_SIZE} rows/page</span>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button onClick={() => setPage(1)} disabled={page === 1} style={s.pgBtn(false, page === 1)}><ChevronsLeft size={13} strokeWidth={2.2} /></button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={s.pgBtn(false, page === 1)}><ChevronLeft size={13} strokeWidth={2.2} /></button>
              {pageNums().map(p => <button key={p} onClick={() => setPage(p)} style={{ ...s.pgBtn(p === page, false), minWidth: '30px' }}>{p}</button>)}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={s.pgBtn(false, page === totalPages)}><ChevronRight size={13} strokeWidth={2.2} /></button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={s.pgBtn(false, page === totalPages)}><ChevronsRight size={13} strokeWidth={2.2} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}