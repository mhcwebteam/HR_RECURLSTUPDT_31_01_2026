import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../Config/Config';

// ── Status config ─────────────────────────────────────────────────────────────
const getStyle = (raw, isCurrent) => {
    const s = (raw || '').toLowerCase();
    if (s === 'approved' || s === 'approve')
        return { color: '#15803d', bg: '#f0fdf4', border: '#86efac', dot: '#22c55e', badge: 'APPROVED' };
    if (s === 'reject' || s === 'rejected')
        return { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444', badge: 'REJECTED' };
    if (isCurrent)
        return { color: '#c2410c', bg: '#fff7ed', border: '#fdba74', dot: '#f97316', badge: 'WIP' };
    return     { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', dot: '#d1d5db', badge: 'PENDING' };
};

// ── Tiny atoms ────────────────────────────────────────────────────────────────
const MetaField = ({ label, value }) => (
    <Box>
        <Typography sx={{ fontSize: '9.5px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>
            {label}
        </Typography>
        <Typography sx={{ fontSize: '11.5px', color: '#111827', fontWeight: 500, lineHeight: 1.4 }}>
            {value || '—'}
        </Typography>
    </Box>
);

const StatusBadge = ({ label, dot }) => (
    <Box sx={{ px: '7px', py: '1px', borderRadius: '3px', backgroundColor: dot, color: '#fff', fontSize: '9px', fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
        {label}
    </Box>
);

// ── Step card ─────────────────────────────────────────────────────────────────
const StepCard = ({ step, statusRaw, isCurrent, isLast, remarks, user, date }) => {
    const st       = getStyle(statusRaw, isCurrent);
    const isApproved = ['approved', 'approve'].includes((statusRaw || '').toLowerCase());
    const isRej    = ['reject', 'rejected'].includes((statusRaw || '').toLowerCase());

    return (
        <Box sx={{ display: 'flex', gap: '8px' }}>
            {/* spine */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: '1px' }}>
                <Box sx={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: (isApproved || isRej || isCurrent) ? st.dot : '#e5e7eb',
                    border: `2px solid ${st.dot}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isCurrent ? `0 0 0 2px ${st.border}` : 'none',
                }}>
                    <Typography sx={{ color: isApproved || isRej || isCurrent ? '#fff' : '#9ca3af', fontSize: '9px', fontWeight: 800, lineHeight: 1 }}>
                        {isApproved ? '✓' : isRej ? '✗' : step.index + 1}
                    </Typography>
                </Box>
                {!isLast && (
                    <Box sx={{ width: 2, flex: 1, minHeight: 12, mt: '2px', backgroundColor: isApproved ? '#86efac' : '#e5e7eb' }} />
                )}
            </Box>

            {/* card */}
            <Box sx={{
                flex: 1, border: `1px solid ${st.border}`, borderRadius: '6px',
                p: '7px 10px', mb: isLast ? 0 : 1,
                backgroundColor: st.bg,
                boxShadow: isCurrent ? `0 0 0 1.5px #f97316` : 'none',
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: '#111827' }}>
                        {step.title}
                    </Typography>
                    <StatusBadge label={st.badge} dot={st.dot} />
                </Box>

                {user && (
                    <Typography sx={{ fontSize: '10.5px', color: '#4b5563', mt: '3px' }}>
                        <span style={{ fontWeight: 600 }}>Assigned: </span>{user}
                    </Typography>
                )}

      {date && (
    <Typography
        sx={{
            fontSize: '10px',
            color: '#6b7280',
            mt: '2px'
        }}
    >
        <strong>Approved On:</strong>{' '}
        {new Date(date.replace(' ', 'T')).toLocaleString('en-GB')}
    </Typography>
)}



                {/* remarks for approved / rejected */}
                {remarks && (isApproved || isRej) && (
                    <Box sx={{ mt: '5px', pt: '4px', borderTop: `1px dashed ${st.border}`, display: 'flex', gap: '4px' }}>
                        <Typography sx={{ fontSize: '9.5px', fontWeight: 700, color: st.color, whiteSpace: 'nowrap' }}>Remarks:</Typography>
                        <Typography sx={{ fontSize: '10.5px', color: '#374151', fontStyle: 'italic', lineHeight: 1.4 }}>{remarks}</Typography>
                    </Box>
                )}

                {/* wip note */}
                {isCurrent && !isApproved && !isRej && (
                    <Typography sx={{ fontSize: '10px', color: st.color, fontWeight: 600, mt: '3px' }}>
                        ⏳ Awaiting approval{user ? ` from ${user}` : ''}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const HRMView = ({ ID, isMaximized }) => {
    const [loading, setLoading]   = useState(true);
    const [hrmData, setHrmData]   = useState(null);
    const [error, setError]       = useState(null);
    const [currentStep, setCurrentStep] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (!ID) return;
        (async () => {
            setLoading(true); setError(null);
            try {
                const res  = await fetch(`${API_BASE_URL}/noteForAprvlGetMRFData/${ID}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                console.log('HRM API DATA:', json);
                if (json.success && json.VerifyData?.length > 0) {
                    const d = json.VerifyData[0];
                    setHrmData(d);
                    resolveCurrentStep(d);
                } else {
                    setError('No data found');
                }
            } catch (e) {
                console.error(e);
                setError('Failed to fetch approval data');
                Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch HRM data' });
            } finally {
                setLoading(false);
            }
        })();
    }, [ID]);

    const resolveCurrentStep = (d) => {
        const approvals = d.approvals || {};
        const steps = buildSteps(approvals);
        for (const s of steps) {
            const st = (d[s.apiKey] || '').toLowerCase();
            const u  = s.getUser();
            if (u && (!st || st === 'pending')) { setCurrentStep(s.key); setCurrentUser(u); return; }
        }
        // fallback — no approvals key, find first pending
        for (const s of steps) {
            const st = (d[s.apiKey] || '').toLowerCase();
            if (!st || st === 'pending') { setCurrentStep(s.key); return; }
        }
        setCurrentStep('COMPLETED');
    };

const buildSteps = (approvals) => {

    const getApproval = (role) =>
        approvals.find(x => x.approval_role === role);

    return [
        { 
            key: 'HR',
            title: getApproval('HR')?.emp_designation ?? 'HR Approval',
            apiKey: 'hr',
            getUser: () => getApproval('HR')?.approval_name,
            remarks: (d) => d?.hr_remarks,
              Date: (d) => d?.hr_Date,
        },

        { 
            key: 'DEPT_HOD',
            title: getApproval('DEPT HOD')?.emp_designation ?? 'Dept HOD Approval',
            apiKey: 'dept_hod',
            getUser: () => getApproval('DEPT HOD')?.approval_name,
            remarks: (d) => d?.hod_remarks,
            Date: (d) => d?.dept_hod_Date,

        },

        { 
            key: 'PRES_PROJECT',
            title: getApproval('PRES PROJECT')?.emp_designation ?? 'President Approval',
            apiKey: 'pres_project',
            getUser: () => getApproval('PRES PROJECT')?.approval_name,
            remarks: (d) => d?.pres_project_remarks,
              Date: (d) => d?.pres_prj_Date,
        },

        { 
            key: 'DIRECTOR_PROJECT',
            title: getApproval('DIRECTOR PROJECT')?.emp_designation ?? 'Director Approval',
            apiKey: 'director_project',
            getUser: () => getApproval('DIRECTOR PROJECT')?.approval_name,
            remarks: (d) => d?.director_project_remarks,
                  Date: (d) => d?.directors_Date,
        },

        { 
            key: 'SR_MGMT',
            title: getApproval('SR MGMT')?.emp_designation ?? 'SR Management Approval',
            apiKey: 'sr_mgmt',
            getUser: () => getApproval('SR MGMT')?.approval_name,
            remarks: (d) => d?.sr_mgmt_remarks,
                  Date: (d) => d?.sr_mgmt_Date,
        },

        { 
            key: 'DIRECTORS',
            title: getApproval('DIRECTORS')?.emp_designation ?? 'Directors Approval',
            apiKey: 'directors',
            getUser: () => getApproval('DIRECTORS')?.approval_name,
            remarks: (d) => d?.directors_remarks,
                  Date: (d) => d?.directors_Date,
        },
    ];
};

    if (loading) return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 5, gap: 1 }}>
            <CircularProgress size={16} />
            <Typography sx={{ fontSize: '11px', color: '#6b7280' }}>Loading…</Typography>
        </Box>
    );

    if (error || !hrmData) return (
        <Typography sx={{ textAlign: 'center', py: 3, fontSize: '11px', color: '#ef4444' }}>
            {error || 'No HRM data available'}
        </Typography>
    );

    const data     = hrmData;
    const approvals = data.approvals || {};
    const allSteps  = buildSteps(approvals);

    console.log(allSteps,"hhhhhhhhhhhhhhhh")

    // visible = has user assigned; fallback = all steps (when no approvals key)
    const raw = allSteps.filter(s => s.getUser() != null);
    const visibleSteps = raw.length > 0 ? raw : allSteps.filter(s => data[s.apiKey] !== undefined);

    const isFullyApproved = visibleSteps.every(s => ['approved','approve'].includes((data[s.apiKey]||'').toLowerCase()));
    const isRejected      = visibleSteps.some(s  => ['reject','rejected'].includes((data[s.apiKey]||'').toLowerCase()));

    const overallSt = isRejected
        ? { label: 'REJECTED',       color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' }
        : isFullyApproved
        ? { label: 'FULLY APPROVED', color: '#15803d', bg: '#f0fdf4', border: '#86efac' }
        : { label: 'IN PROGRESS',    color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd' };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>

            {/* ── Info card ── */}
            <Box sx={{ border: '1px solid #e5e7eb', borderRadius: '7px', p: '10px 12px', backgroundColor: '#fafafa' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ fontSize: '10.5px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        HRM Request Information
                    </Typography>
                    <Box sx={{ px: '8px', py: '2px', borderRadius: '4px', fontSize: '9px', fontWeight: 700,
                        backgroundColor: overallSt.bg, color: overallSt.color, border: `1px solid ${overallSt.border}` }}>
                        {overallSt.label}
                    </Box>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 14px' }}>
                    <MetaField label="Case ID"     value={data.child_caseid || ID} />
                    <MetaField label="Candidate"   value={data.name} />
                    <MetaField label="Department"  value={data.DEPT} />
                    <MetaField label="Designation" value={data.DESIG || data.MANPOWER_DESG} />
                    <MetaField label="Plant"       value={data.PLANT} />
                    <MetaField label="Email"       value={data.email} />
                </Box>
            </Box>

            {/* ── Approval flow ── */}
            <Box sx={{ border: '1px solid #e5e7eb', borderRadius: '7px', p: '10px 12px', backgroundColor: '#fafafa' }}>
                <Typography sx={{ fontSize: '10.5px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.2 }}>
                    Approval Flow
                </Typography>

                {visibleSteps.map((step, index) => (
  <Box
    key={step.key}
    sx={{
      transition: 'all 0.2s ease',
      borderRadius: '6px',
      '&:hover': {
        transform: 'scale(1.01)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'default',
      },
    }}
  >
    <StepCard
      step={{ ...step, index }}
      statusRaw={data[step.apiKey]}
      isCurrent={currentStep === step.key}
      isLast={index === visibleSteps.length - 1}
      remarks={step.remarks(data)}
      date ={step.Date(data)}
      user={step.getUser()}
    />
  </Box>
))}

                {/* final verdict */}
                {(isFullyApproved || isRejected) && (
                    <Box sx={{
                        mt: 1.2, p: '6px 10px', borderRadius: '5px', textAlign: 'center',
                        backgroundColor: overallSt.bg, border: `1px solid ${overallSt.border}`,
                    }}>
                        <Typography sx={{ fontSize: '10.5px', fontWeight: 700, color: overallSt.color }}>
                            {isRejected ? '✗ Request Rejected' : '✓ Fully Approved'}
                        </Typography>
                    </Box>
                )}
            </Box>

        </Box>
    );
};

export default HRMView;
