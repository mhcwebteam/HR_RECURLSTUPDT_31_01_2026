// PreviewPage.js
import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const THEMES = {
  basic:    { border: '#a5b4fc', hBg: '#eef2ff', icon: '#818cf8', title: '#4338ca', div: '#c7d2fe' },
  permAddr: { border: '#86efac', hBg: '#f0fdf4', icon: '#4ade80', title: '#15803d', div: '#bbf7d0' },
  presAddr: { border: '#6ee7b7', hBg: '#ecfdf5', icon: '#34d399', title: '#065f46', div: '#a7f3d0' },
  edu:      { border: '#fcd34d', hBg: '#fffbeb', icon: '#f59e0b', title: '#92400e', div: '#fde68a' },
  exp:      { border: '#7dd3fc', hBg: '#f0f9ff', icon: '#38bdf8', title: '#075985', div: '#bae6fd' },
};

const INNER = '#e5e7eb';
const COLS  = 7;
const PCT   = `${(100 / COLS).toFixed(4)}%`;

// ── PDF: A4 Portrait — tall pages
const PDF_W_MM   = 210;
const PDF_H_MM   = 297;
const MARGIN_MM  = 8;
const DPI        = 96;
const MM_TO_PX   = DPI / 25.4;
const PDF_CONTENT_PX = Math.round((PDF_W_MM - MARGIN_MM * 2) * MM_TO_PX); // ~737px

const PreviewPage = () => {
  const previewRef  = useRef(null);
  const [generating, setGenerating] = useState(false);

  const previewData     = JSON.parse(localStorage.getItem('previewData') || '{}');
  const formData        = previewData.formData;
  const experiences     = previewData.experiences;
  const sameAsPermanent = previewData.sameAsPermanent;

  useEffect(() => {
    const s = document.createElement('style');
    s.id = 'pvw-override';
    s.innerHTML = `
      html,body{margin:0!important;padding:0!important;width:100%!important;background:#eef2f7!important;overflow-x:hidden!important;}
      #root,[class*="app"],[class*="App"],[class*="layout"],[class*="Layout"],
      [class*="container"],[class*="Container"],[class*="wrapper"],[class*="Wrapper"],
      [class*="main"],[class*="Main"],[class*="content"],[class*="Content"],
      [class*="page"],[class*="Page"]{max-width:100%!important;width:100%!important;padding:0!important;margin:0!important;overflow-x:hidden!important;}
    `;
    document.head.appendChild(s);
    return () => { const e = document.getElementById('pvw-override'); if (e) e.remove(); };
  }, []);

  if (!formData) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No data to preview</div>;
  }

  const getFileName = (f) => {
    if (!f) return '—';
    if (typeof f === 'string') return f.split('/').pop();
    return f.name || '—';
  };
  const formatDate  = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';
  const chunkBy     = (arr, n) => { const o=[]; for(let i=0;i<arr.length;i+=n) o.push(arr.slice(i,i+n)); return o; };
  const padRows     = (rows) => { const o=[...rows]; while(o.length%COLS!==0) o.push(['','']); return o; };

  /* ─── PDF: off-screen portrait clone → A4 portrait pages ─── */
  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    setGenerating(true);
    try {
      const clone = previewRef.current.cloneNode(true);

      // Remove download button
      const btn = clone.querySelector('.no-print');
      if (btn) btn.remove();

      // Fix clone width to PDF content width
      Object.assign(clone.style, {
        position:   'fixed',
        top:        '-999999px',
        left:       '0',
        width:      `${PDF_CONTENT_PX}px`,
        maxWidth:   `${PDF_CONTENT_PX}px`,
        minWidth:   `${PDF_CONTENT_PX}px`,
        background: '#ffffff',
        overflow:   'visible',
        zIndex:     '-9999',
      });

      // Allow text to wrap inside cells
      clone.querySelectorAll('td div, td').forEach(el => {
        el.style.whiteSpace  = 'normal';
        el.style.wordBreak   = 'break-word';
        el.style.overflow    = 'visible';
        el.style.textOverflow = 'unset';
      });

      document.body.appendChild(clone);
      await new Promise(r => setTimeout(r, 450));

      const canvas = await html2canvas(clone, {
        scale:           2,
        useCORS:         true,
        logging:         false,
        backgroundColor: '#ffffff',
        width:           PDF_CONTENT_PX,
        windowWidth:     PDF_CONTENT_PX,
      });

      document.body.removeChild(clone);

      const SCALE    = 2;
      const pageWpx  = PDF_CONTENT_PX * SCALE;
      const pageHpx  = Math.round((PDF_H_MM - MARGIN_MM * 2) * MM_TO_PX) * SCALE; // portrait height
      const totalH   = canvas.height;

      const pdf      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWmm   = PDF_W_MM - MARGIN_MM * 2;
      const imgHmm   = PDF_H_MM - MARGIN_MM * 2;

      let srcY = 0, pageNum = 0;

      while (srcY < totalH) {
        if (pageNum > 0) pdf.addPage('a4', 'portrait');

        const sliceH = Math.min(pageHpx, totalH - srcY);

        const slice = document.createElement('canvas');
        slice.width  = pageWpx;
        slice.height = sliceH;
        const ctx = slice.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageWpx, sliceH);
        ctx.drawImage(canvas, 0, srcY, pageWpx, sliceH, 0, 0, pageWpx, sliceH);

        const renderedHmm = imgHmm * (sliceH / pageHpx);

        pdf.addImage(
          slice.toDataURL('image/png'),
          'PNG',
          MARGIN_MM,
          MARGIN_MM,
          imgWmm,
          renderedHmm
        );

        srcY += pageHpx;
        pageNum++;
      }

      pdf.save('recruitment-application.pdf');
    } catch (err) {
      console.error('PDF error:', err);
      alert('PDF generation failed. See console.');
    } finally {
      setGenerating(false);
    }
  };

  /* ─── Components ─── */
  const ColTable = ({ rows, theme }) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${theme.border}`, tableLayout: 'fixed', borderRadius: '5px', overflow: 'hidden' }}>
      <tbody>
        {chunkBy(rows, COLS).map((chunk, ri, all) => (
          <tr key={ri} style={{ borderBottom: ri < all.length - 1 ? `1px solid ${INNER}` : 'none' }}>
            {chunk.map(([label, value], ci) => (
              <td key={ci} style={{ padding: '4px 8px', verticalAlign: 'top', width: PCT, background: 'white', borderRight: ci < chunk.length - 1 ? `1px solid ${INNER}` : 'none', overflow: 'hidden' }}>
                <div style={{ fontSize: '8px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25px', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
                <div style={{ fontSize: '10.5px', color: value ? '#1e293b' : '#d1d5db', fontWeight: value ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '—'}</div>
              </td>
            ))}
            {chunk.length < COLS && Array(COLS - chunk.length).fill(null).map((_, i) => (
              <td key={`e${i}`} style={{ background: 'white', width: PCT, borderRight: i < (COLS - chunk.length - 1) ? `1px solid ${INNER}` : 'none' }} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const SectionCard = ({ title, icon, theme, children }) => (
    <div style={{ border: `1px solid ${theme.border}`, borderRadius: '7px', overflow: 'hidden', background: 'white' }}>
      <div style={{ background: theme.hBg, borderBottom: `1px solid ${theme.border}`, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '7px' }}>
        <div style={{ width: '17px', height: '17px', background: theme.icon, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', flexShrink: 0 }}>{icon}</div>
        <span style={{ fontSize: '10px', fontWeight: 700, color: theme.title, textTransform: 'uppercase', letterSpacing: '0.45px' }}>{title}</span>
        <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, ${theme.div}, transparent)` }} />
      </div>
      <div style={{ padding: '6px' }}>{children}</div>
    </div>
  );

  const t = THEMES;

  const basicRows = padRows([
    ['Child Case ID', formData.CHILD_CASEID], ['Plant', formData.PLANT], ['Department', formData.DEPT], ['First Name', formData.FIRST_NAME],
    ['Email', formData.EMAIL], ['Phone Number', formData.PHONE_NUMBER], ['Emergency Contact', formData.EMER_CONTACT_NUM],
    ['DOB (Original)', formatDate(formData.ORIGINAL_DOB)], ['DOB (Aadhar)', formatDate(formData.DOB_ASPER_ADHAR)], ['Age', formData.AGE],
    ['Gender', formData.GENDER], ['Marital Status', formData.MARITAL_STATUS], ['Languages Known', formData.LANG_KNOWN],
    ['Mother Tongue', formData.MOTHER_TONGUE], ['Highest Qualification', formData.HIGHEST_QUA], ['Aadhaar Number', formData.AADHAR_NUM],
    ['PAN Number', formData.PAN_NUM], ['UAN Number', formData.UAN_NUM], ['UAN Document', getFileName(formData.UAN_FILE)],
    ['ESI Number', formData.ESI_NUM], ['Source Type', formData.SRC_TYPE],
    ...(formData.SRC_TYPE === 'reference' ? [['Reference Name', formData.SRC_REFER_NAME], ['Reference Dept', formData.SRC_REFER_DEPT]] : []),
    ['Blood Group', formData.BLOOD_GROUP], ['Passport Number', formData.PASSPORT_NUMBER],
    ['Passport Expiry', formatDate(formData.PASSPORT_EXPIRY)], ['Driving License', formData.DRIVING_LICENSE],
    ['DL Expiry', formatDate(formData.DRIVING_LICENSE_EXPIRY)],
  ]);

  const permRows = padRows([
    ['House No / Street', formData.HNO], ['City / Village', formData.CITY], ['Mandal', formData.MANDAL],
    ['District', formData.DISTRICT], ['State', formData.STATE], ['Pincode', formData.PINCODE],
  ]);

  const presRows = padRows([
    ['House No / Street', formData.PRESENT_HNO], ['City / Village', formData.PRESENT_CITY], ['Mandal', formData.PRESENT_MANDAL],
    ['District', formData.PRESENT_DISTRICT], ['State', formData.PRESENT_STATE], ['Pincode', formData.PRESENT_PINCODE],
  ]);

  const eduData = [
    { qual: 'SSC (10th)',    school: formData.SSC_SCHOOL_NAME,    board: formData.SSC_BOARD,         marks: formData.SSC_MARKS,   year: formData.SSC_PASSED_YEAR,    cert: formData['10TH_FILENAME'] },
    { qual: 'Inter/Diploma', school: formData.INTER_COLLEGE_NAME, board: formData.INTER_BOARD,       marks: formData.INTER_MARKS, year: formData.INTER_PASSED_YEAR,  cert: formData.INTER_FILENAME },
    { qual: 'Degree/B.Tech', school: formData.GRAD_COLLEGE_NAME,  board: formData.DEGREE_UNIVERSITY, marks: formData.BTECH_MARKS, year: formData.DEGREE_PASSED_YEAR, cert: formData.BTECH_FILENAME },
    { qual: 'PG (Optional)', school: formData.PG_COLLEGE_NAME,    board: formData.PG_UNIVERSITY,     marks: formData.PG_MARKS,    year: formData.PG_PASSED_YEAR,     cert: formData.PG_FILENAME },
    { qual: 'PHD',           school: formData.PHD_COLLEGE_NAME,   board: formData.PHD_UNIVERSITY,    marks: formData.PHD_MARKS,   year: formData.PHD_PASSED_YEAR,    cert: formData.PHD_FILENAME },
    { qual: 'Others',        school: formData.OTHER_COLLEGE_NAME, board: formData.OTHER_UNIVERSITY,  marks: formData.OTHER_MARKS, year: formData.OTHER_PASSED_YEAR,  cert: formData.OTHER_FILENAME },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        /* No x-overflow anywhere */
        html, body { overflow-x: hidden !important; }

        .pvw-shell {
          position: relative;
          left: 50%; right: 50%;
          margin-left: -50vw; margin-right: -50vw;
          width: 100vw;
          min-height: 100vh;
          background: #eef2f7;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 16px 24px;
          font-family: 'DM Sans','Segoe UI',sans-serif;
          overflow-x: hidden;
        }

        .pvw-card {
          width: 100%;
          max-width: 1280px;
          min-width: 0;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.09);
          overflow: hidden;   /* clips any child overflow — no scrollbar */
        }

        @media print {
          .pvw-shell { position:static!important; left:auto!important; margin:0!important; width:100%!important; padding:0!important; background:white!important; display:block!important; overflow:hidden!important; }
          .pvw-card  { max-width:100%!important; box-shadow:none!important; border-radius:0!important; }
          .no-print  { display:none!important; }
        }
      `}</style>

      <div className="pvw-shell">
        <div className="pvw-card" ref={previewRef}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>Recruitment Application Preview</div>
              <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>Review all submitted information before final submission</div>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={generating}
              className="no-print"
              style={{ padding: '6px 16px', background: 'white', color: '#1e3a8a', border: 'none', borderRadius: '5px', cursor: generating ? 'wait' : 'pointer', fontSize: '11.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', opacity: generating ? 0.7 : 1, boxShadow: '0 1px 4px rgba(0,0,0,0.15)', transition: 'opacity 0.2s' }}
            >
              {generating ? '⏳ Generating…' : '⬇ Download PDF'}
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '9px', background: '#eef2f7' }}>

            <SectionCard title="Basic Information" icon="👤" theme={t.basic}>
              <ColTable rows={basicRows} theme={t.basic} />
            </SectionCard>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
              <SectionCard title="Permanent Address" icon="🏠" theme={t.permAddr}>
                <ColTable rows={permRows} theme={t.permAddr} />
              </SectionCard>
              <SectionCard title="Present Address" icon="📍" theme={t.presAddr}>
                {sameAsPermanent
                  ? <div style={{ padding: '10px', fontSize: '11px', color: '#15803d', background: '#f0fdf4', borderRadius: '5px', textAlign: 'center' }}>✔ Same as Permanent Address</div>
                  : <ColTable rows={presRows} theme={t.presAddr} />}
              </SectionCard>
            </div>

            <SectionCard title="Education Details" icon="🎓" theme={t.edu}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${t.edu.border}`, tableLayout: 'fixed', fontSize: '10.5px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${INNER}` }}>
                    {['Qualification', 'School / College', 'University / Board', '%', 'Year', 'Certificate'].map((h, i, arr) => (
                      <th key={h} style={{ padding: '4px 8px', background: t.edu.hBg, color: t.edu.title, fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3px', textAlign: 'left', borderRight: i < arr.length - 1 ? `1px solid ${INNER}` : 'none' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eduData.map((row, idx, arr) => (
                    <tr key={row.qual} style={{ background: 'white', borderBottom: idx < arr.length - 1 ? `1px solid ${INNER}` : 'none' }}>
                      <td style={{ padding: '4px 8px', fontWeight: 600, color: t.edu.title, fontSize: '10px', borderRight: `1px solid ${INNER}` }}>{row.qual}</td>
                      {[row.school, row.board, row.marks, row.year, getFileName(row.cert)].map((v, i, a) => (
                        <td key={i} style={{ padding: '4px 8px', color: '#334155', borderRight: i < a.length - 1 ? `1px solid ${INNER}` : 'none' }}>{v || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>

            <SectionCard title="Experience Details" icon="💼" theme={t.exp}>
              {experiences && experiences.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {experiences.map((exp, idx) => {
                    const meaningful = padRows([
                      ['Company Name', exp.COMPANY_NAME], ['Designation', exp.DESIGNATION], ['From Date', formatDate(exp.FROM_DATE)],
                      ['To Date', formatDate(exp.TO_DATE)], ['Duration', exp.DURATION],
                      ...(exp.isCurrent ? [
                        ['Notice Period', exp.NOTICE_PERIOD], ['Current CTC', formData.CURRENT_CTC], ['Expected CTC', formData.EXP_CTC],
                        ['Total Exp', formData.TOTAL_EXP],
                      ] : []),
                    ].filter(([, v]) => v !== undefined));

                    const et = exp.isCurrent
                      ? { border: '#6ee7b7', hBg: '#ecfdf5', icon: '#34d399', title: '#065f46', div: '#a7f3d0' }
                      : { border: '#bae6fd', hBg: '#f0f9ff', icon: '#7dd3fc', title: '#0c4a6e', div: '#e0f2fe' };

                    return (
                      <div key={exp.id || idx} style={{ border: `1px solid ${et.border}`, borderRadius: '6px', overflow: 'hidden', background: 'white' }}>
                        <div style={{ background: et.hBg, borderBottom: `1px solid ${et.border}`, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: et.icon, flexShrink: 0 }} />
                          <span style={{ fontSize: '10.5px', fontWeight: 700, color: et.title }}>{exp.isCurrent ? 'Current Company' : `Previous Company ${idx + 1}`}</span>
                          <span style={{ display: 'inline-block', padding: '1px 7px', background: exp.isCurrent ? '#dcfce7' : '#e0f2fe', color: exp.isCurrent ? '#16a34a' : '#0369a1', borderRadius: '20px', fontSize: '9px', fontWeight: 700, marginLeft: '3px' }}>
                            {exp.isCurrent ? 'CURRENT' : `#${idx + 1}`}
                          </span>
                        </div>
                        <div style={{ padding: '5px' }}>
                          <ColTable rows={meaningful} theme={et} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '11px', background: '#f8fafc', borderRadius: '5px' }}>No experience details provided.</div>
              )}
            </SectionCard>

          </div>
        </div>
      </div>
    </>
  );
};

export default PreviewPage;