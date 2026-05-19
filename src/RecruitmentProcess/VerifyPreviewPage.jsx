// VerifyPreviewPage.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { API_BASE_URLss } from '../Config/Config';
import dayjs from 'dayjs';
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

const PDF_W_MM       = 210;
const PDF_H_MM       = 297;
const MARGIN_MM      = 8;
const DPI            = 96;
const MM_TO_PX       = DPI / 25.4;
const PDF_CONTENT_PX = Math.round((PDF_W_MM - MARGIN_MM * 2) * MM_TO_PX);

const VerifyPreviewPage = () => {
  const previewRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  const previewData     = JSON.parse(localStorage.getItem('VerifyPreviewPage') || '{}');
const data = previewData?.data || previewData?.formData || {};

  console.log("dattttttttttttt",data);
  const sameAsPermanent = previewData.sameAsPermanent;

  // Add this useEffect in VerifyPreviewPage component
useEffect(() => {
  const handleMessage = async (event) => {
    if (event.data.type === 'GET_PDF_BLOB') {
      // Generate PDF and send blob back to parent
      if (previewRef.current) {
        try {
          const clone = previewRef.current.cloneNode(true);
          const btn = clone.querySelector('.no-print');
          if (btn) btn.remove();
          
          Object.assign(clone.style, {
            position: 'fixed',
            top: '-999999px',
            left: '0',
            width: `${PDF_CONTENT_PX}px`,
            background: '#ffffff',
          });
          
          document.body.appendChild(clone);
          await new Promise(r => setTimeout(r, 450));
          
          const canvas = await html2canvas(clone, {
            scale: 2,
            backgroundColor: '#ffffff',
            width: PDF_CONTENT_PX,
          });
          
          document.body.removeChild(clone);
          
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
          const imgWidth = PDF_W_MM - MARGIN_MM * 2;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', MARGIN_MM, MARGIN_MM, imgWidth, imgHeight);
          
          const blob = pdf.output('blob');
          window.parent.postMessage({ type: 'PDF_BLOB', blob }, '*');
        } catch (err) {
          console.error('PDF generation error:', err);
        }
      }
    }
  };
  
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, [previewRef.current]);

  useEffect(() => {
    const s = document.createElement('style');
    s.id = 'vfpvw-override';
    s.innerHTML = `
      html,body{margin:0!important;padding:0!important;width:100%!important;background:#eef2f7!important;overflow-x:hidden!important;}
      #root,[class*="app"],[class*="App"],[class*="layout"],[class*="Layout"],
      [class*="container"],[class*="Container"],[class*="wrapper"],[class*="Wrapper"],
      [class*="main"],[class*="Main"],[class*="content"],[class*="Content"],
      [class*="page"],[class*="Page"]{max-width:100%!important;width:100%!important;padding:0!important;margin:0!important;overflow-x:hidden!important;}
    `;
    document.head.appendChild(s);
    return () => { const e = document.getElementById('vfpvw-override'); if (e) e.remove(); };
  }, []);

  if (!data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontFamily: 'sans-serif' }}>
        No verification data to preview
      </div>
    );
  }

  const chunkBy = (arr, n) => { const o = []; for (let i = 0; i < arr.length; i += n) o.push(arr.slice(i, i + n)); return o; };
  const padRows = (rows) => { const o = [...rows]; while (o.length % COLS !== 0) o.push(['', '']); return o; };

  /* ─── PDF ─── */
// Add this helper function at the top of your component, before handleDownloadPDF
const convertImageToBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };
    
    img.src = url;
  });
};

// Then replace your handleDownloadPDF with this:
const handleDownloadPDF = async () => {
  if (!previewRef.current) return;
  setGenerating(true);
  
  try {
    // Get the already-loaded image from the actual DOM
    const existingImg = document.querySelector('img[alt="Applicant"]');
    let photoBase64 = null;
    
    if (existingImg && existingImg.complete && existingImg.naturalHeight !== 0) {
      // Image is already loaded, capture it directly from canvas
      try {
        const canvas = document.createElement('canvas');
        canvas.width = existingImg.naturalWidth;
        canvas.height = existingImg.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(existingImg, 0, 0);
        photoBase64 = canvas.toDataURL('image/png');
        console.log("Captured image from DOM successfully");
      } catch (err) {
        console.error('Failed to capture image from DOM:', err);
      }
    }
    
    const clone = previewRef.current.cloneNode(true);
    
    // Replace the image src with base64 if captured
    if (photoBase64) {
      const imgElement = clone.querySelector('img[alt="Applicant"]');
      if (imgElement) {
        imgElement.src = photoBase64;
      }
    }
    
    const btn = clone.querySelector('.no-print');
    if (btn) btn.remove();

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

    clone.querySelectorAll('td div, td').forEach(el => {
      el.style.whiteSpace   = 'normal';
      el.style.wordBreak    = 'break-word';
      el.style.overflow     = 'visible';
      el.style.textOverflow = 'unset';
    });

    document.body.appendChild(clone);
    await new Promise(r => setTimeout(r, 450));

    const canvas = await html2canvas(clone, {
      scale:           2,
      useCORS:         false,
      logging:         false,
      backgroundColor: '#ffffff',
      width:           PDF_CONTENT_PX,
      windowWidth:     PDF_CONTENT_PX,
    });

    document.body.removeChild(clone);

    const SCALE   = 2;
    const pageWpx = PDF_CONTENT_PX * SCALE;
    const pageHpx = Math.round((PDF_H_MM - MARGIN_MM * 2) * MM_TO_PX) * SCALE;
    const totalH  = canvas.height;
    const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const imgWmm  = PDF_W_MM - MARGIN_MM * 2;
    const imgHmm  = PDF_H_MM - MARGIN_MM * 2;

    let srcY = 0, pageNum = 0;
    while (srcY < totalH) {
      if (pageNum > 0) pdf.addPage('a4', 'portrait');
      const sliceH = Math.min(pageHpx, totalH - srcY);
      const slice  = document.createElement('canvas');
      slice.width  = pageWpx;
      slice.height = sliceH;
      const ctx = slice.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageWpx, sliceH);
      ctx.drawImage(canvas, 0, srcY, pageWpx, sliceH, 0, 0, pageWpx, sliceH);
      const renderedHmm = imgHmm * (sliceH / pageHpx);
      pdf.addImage(slice.toDataURL('image/png'), 'PNG', MARGIN_MM, MARGIN_MM, imgWmm, renderedHmm);
      srcY += pageHpx;
      pageNum++;
    }

    const safeName = (data?.NAME || 'verification').replace(/\s+/g, '_');
    pdf.save(`${safeName}_verification.pdf`);
  } catch (err) {
    console.error('PDF error:', err);
    alert('PDF generation failed. See console.');
  } finally {
    setGenerating(false);
  }
};

  /* ─── COMPONENTS ─── */
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

  /* ─── ROWS ─── */
  const basicRows = padRows([
    ['Child Case ID',         data.CHILD_CASEID],
    ['Plant',                 data.PLANT],
    ['Department',            data.DEPT],
    ['Name',                  data.NAME],
    ['Email',                 data.EMAIL],
    ['Phone Number',          data.PHONE_NUMBER],
    ['Emergency Contact',     data.EMER_CONTACT_NUM],
    ['DOB (Original)',        data.ORIGINAL_DOB],
    ['DOB (Aadhar)',          data.DOB_ASPER_ADHAR],
    ['Age',                   data.AGE],
    ['Gender',                data.GENDER],
    ['Marital Status',        data.MARITAL_STATUS],
    ['Languages Known',       data.LANG_KNOWN],
    ['Mother Tongue',         data.MOTHER_TONGUE],
    ['Highest Qualification', data.HIGHEST_QUA],
    ['Aadhaar Number',        data.AADHAR_NUMBER],
    ['PAN Number',            data.PAN_NUM],
    ['UAN Number',            data.UAN_NUM],
    ['ESI Number',            data.ESI_NUM],
    ['Blood Group',           data.BLOOD_GROUP],
    ['Source Type',           data.SRC_TYPE],
    ...(data.SRC_TYPE === 'reference' ? [
      ['Reference Name',      data.SRC_REFER_NAME],
      ['Reference Dept',      data.SRC_REFER_DEPT],
    ] : []),
    ['Passport Number',       data.PASSPORT_NUMBER],
    ['Passport Expiry',       data.PASSPORT_EXPIRY],
    ['Driving License',       data.DRIVING_LICENSE],
    ['DL Expiry',             data.DRIVING_LICENSE_EXPIRY],
  ]);

  const permRows = padRows([
    ['House No / Street', data.HNO],
    ['City / Village',    data.CITY],
    ['Mandal',            data.MANDAL],
    ['District',          data.DISTRICT],
    ['State',             data.STATE],
    ['Pincode',           data.PINCODE],
  ]);

  const presRows = padRows([
    ['House No / Street', data.PRESENT_HNO],
    ['City / Village',    data.PRESENT_CITY],
    ['Mandal',            data.PRESENT_MANDAL],
    ['District',          data.PRESENT_DISTRICT],
    ['State',             data.PRESENT_STATE],
    ['Pincode',           data.PRESENT_PINCODE],
  ]);

  // Matches modal exactly: SSC, Intermediate, Degree always shown; PG only if data exists
  const eduData = [
    { qual: 'SSC (10th) *',    school: data.SSC_SCHOOL_NAME,    board: data.SSC_BOARD,         marks: data.SSC_MARKS,   year: data.SSC_PASSED_YEAR    },
    { qual: 'Intermediate *',  school: data.INTER_COLLEGE_NAME, board: data.INTER_BOARD,       marks: data.INTER_MARKS, year: data.INTER_PASSED_YEAR  },
    { qual: 'Degree/B.Tech *', school: data.GRAD_COLLEGE_NAME,  board: data.DEGREE_UNIVERSITY, marks: data.BTECH_MARKS, year: data.DEGREE_PASSED_YEAR },
    ...(data.PG_COLLEGE_NAME ? [
      { qual: 'PG', school: data.PG_COLLEGE_NAME, board: data.PG_UNIVERSITY, marks: data.PG_MARKS, year: data.PG_PASSED_YEAR },
    ]
    
    
    : []),

        ...(data.PHD_COLLEGE_NAME ? [

 { qual: 'PHD', school: data.PHD_COLLEGE_NAME, board: data.PHD_UNIVERSITY, marks: data.PHD_MARKS, year: data.PHD_PASSED_YEAR },

    ]
    
    
    : []),

            ...(data.OTHER_COLLEGE_NAME ? [

  { qual: 'Others', school: data.OTHER_COLLEGE_NAME, board: data.OTHER_UNIVERSITY, marks: data.OTHER_MARKS, year: data.OTHER_PASSED_YEAR },
    ]
    
    
    : []),



    
    
    
  ];


const getPhotoSrc = () => {
  const img = data?.documents?.photo || data?.PHOTO;

  if (!img) return null;

  if (img.startsWith('http')) return img;

  const base = API_BASE_URLss?.replace(/\/$/, ""); // remove trailing slash
  const path = img.replace(/^\//, ""); 
 
  console.log(base,"baseeeeeee",path);

  return `${base}/${path}`;
};

const photoSrc = getPhotoSrc();
   
console.log(photoSrc,"ggggggggggg");


  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { overflow-x: hidden !important; }
        .vfpvw-shell {
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
        .vfpvw-card {
          width: 100%;
          max-width: 1280px;
          min-width: 0;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.09);
          overflow: hidden;
        }
        @media print {
          .vfpvw-shell { position:static!important; left:auto!important; margin:0!important; width:100%!important; padding:0!important; background:white!important; display:block!important; overflow:hidden!important; }
          .vfpvw-card  { max-width:100%!important; box-shadow:none!important; border-radius:0!important; }
          .no-print    { display:none!important; }
        }
      `}</style>

      <div className="vfpvw-shell">
        <div className="vfpvw-card" ref={previewRef}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>Verification Application Preview</div>
              <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>
                {data?.NAME || '—'} &nbsp;|&nbsp; {data?.EMAIL || '—'} &nbsp;|&nbsp; {data?.PHONE_NUMBER || '—'}
              </div>
            </div>
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => navigate(-1)}
                style={{ padding: '6px 16px', background: 'white', color: '#1e3a8a', border: 'none', borderRadius: '5px', cursor: generating ? 'wait' : 'pointer', fontSize: '11.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '1px', opacity: generating ? 0.7 : 1, boxShadow: '0 1px 4px rgba(0,0,0,0.15)', transition: 'opacity 0.2s' }}
                
              >
                ← Back
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={generating}
                style={{ padding: '6px 16px', background: 'white', color: '#1e3a8a', border: 'none', borderRadius: '5px', cursor: generating ? 'wait' : 'pointer', fontSize: '11.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '1px', opacity: generating ? 0.7 : 1, boxShadow: '0 1px 4px rgba(0,0,0,0.15)', transition: 'opacity 0.2s' }}
              >
                {generating ? '⏳ Generating…' : '⬇ Download PDF'}
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '9px', background: '#eef2f7' }}>

            {/* Basic Information */}
             <SectionCard title="Basic Information" icon="👤" theme={t.basic}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <ColTable rows={basicRows} theme={t.basic} />
                </div>
                <div style={{
                  flexShrink: 0,
                  width: '100px',
                  border: `1px dashed ${t.basic.border}`,
                  borderRadius: '6px',
                  background: t.basic.hBg,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '6px 4px',
                }}>
                  {photoSrc ? (
              <img
  src={photoSrc}
  alt="Applicant"
  style={{
    width: '100px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '2px solid red'
  }}
/>
                  ) : (
                    <>
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: t.basic.div, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👤</div>
                      <div style={{ fontSize: '7.5px', color: t.basic.icon, fontWeight: 600, textAlign: 'center' }}>No Photo</div>
                    </>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Addresses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
              <SectionCard title="Permanent Address" icon="🏠" theme={t.permAddr}>
                <ColTable rows={permRows} theme={t.permAddr} />
              </SectionCard>
              <SectionCard title="Present Address" icon="📍" theme={t.presAddr}>
                {sameAsPermanent
                  ? <div style={{ padding: '10px', fontSize: '11px', color: '#15803d', background: '#f0fdf4', borderRadius: '5px', textAlign: 'center' }}>✔ Same as Permanent Address</div>
                  : <ColTable rows={presRows} theme={t.presAddr} />
                }
              </SectionCard>
            </div>

            {/* Education Details */}
            {eduData.length > 0 && (
              <SectionCard title="Education Details" icon="🎓" theme={t.edu}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${t.edu.border}`, tableLayout: 'fixed', fontSize: '10.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${INNER}` }}>
                      {['Qualification', 'School / College', 'University / Board', 'Marks %', 'Passed Year'].map((h, i, arr) => (
                        <th key={h} style={{ padding: '4px 8px', background: t.edu.hBg, color: t.edu.title, fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3px', textAlign: 'left', borderRight: i < arr.length - 1 ? `1px solid ${INNER}` : 'none' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {eduData.map((row, idx, arr) => (
                      <tr key={row.qual} style={{ background: idx % 2 === 0 ? 'white' : '#fafafa', borderBottom: idx < arr.length - 1 ? `1px solid ${INNER}` : 'none' }}>
                        <td style={{ padding: '4px 8px', fontWeight: 600, color: t.edu.title, fontSize: '10px', borderRight: `1px solid ${INNER}` }}>{row.qual}</td>
                        <td style={{ padding: '4px 8px', color: '#334155', borderRight: `1px solid ${INNER}` }}>{row.school || '—'}</td>
                        <td style={{ padding: '4px 8px', color: '#334155', borderRight: `1px solid ${INNER}` }}>{row.board || '—'}</td>
                        <td style={{ padding: '4px 8px', color: '#334155', borderRight: `1px solid ${INNER}` }}>{row.marks || '—'}</td>
                        <td style={{ padding: '4px 8px', color: '#334155' }}>{row.year || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </SectionCard>
            )}

            {/* Experience Details */}
            <SectionCard title="Experience Details" icon="💼" theme={t.exp}>
              {data?.experienceData && data.experienceData.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {data.experienceData.map((exp, idx) => {

                

                    const isCurrent = exp.COMPANY_STAGES == "0";

                    const et = isCurrent
                      ? { border: '#6ee7b7', hBg: '#ecfdf5', icon: '#34d399', title: '#065f46', div: '#a7f3d0' }
                      : { border: '#bae6fd', hBg: '#f0f9ff', icon: '#7dd3fc', title: '#0c4a6e', div: '#e0f2fe' };

                    const expRows = padRows([
                      ['Company Name',  exp.COMPANY_NAME],
                      ['Designation',   exp.DESIGNATION],
                      ['From Date',     dayjs(exp.START_DATE).format("DD/MM/YYYY")],
                      ['To Date',       dayjs(exp.END_DATE).format("DD/MM/YYYY")],
                      ...(isCurrent ? [
                        ['Current CTC',   data.CURRENT_CTC   ? `₹${data.CURRENT_CTC}`          : undefined],
                        ['Expected CTC',  data.EXP_CTC       ? `₹${data.EXP_CTC}`              : undefined],


                        ['noticePeriod', exp.noticePeriod  ? `${exp.noticePeriod} days`    : undefined],
                      ] : []),
                    ].filter(([, v]) => v !== undefined));

                    return (
                      <div key={exp.EMP_COMP_ID || idx} style={{ border: `1px solid ${et.border}`, borderRadius: '6px', overflow: 'hidden', background: 'white' }}>
                        <div style={{ background: et.hBg, borderBottom: `1px solid ${et.border}`, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: et.icon, flexShrink: 0 }} />
                          <span style={{ fontSize: '10.5px', fontWeight: 700, color: et.title }}>
                            {isCurrent ? 'Current Company' : `Previous Company ${idx + 1}`}
                          </span>
                          <span style={{ display: 'inline-block', padding: '1px 7px', background: isCurrent ? '#dcfce7' : '#e0f2fe', color: isCurrent ? '#16a34a' : '#0369a1', borderRadius: '20px', fontSize: '9px', fontWeight: 700, marginLeft: '3px' }}>
                            {isCurrent ? 'CURRENT' : `#${idx + 1}`}
                          </span>
                        </div>
                        <div style={{ padding: '5px' }}>
                          <ColTable rows={expRows} theme={et} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '11px', background: '#f8fafc', borderRadius: '5px' }}>
                  No experience details provided.
                </div>
              )}
            </SectionCard>

          </div>

          {/* Footer */}
          <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '9.5px', color: '#94a3b8' }}>
              Generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
            <span style={{ fontSize: '9.5px', color: '#94a3b8' }}>Case ID: {data?.CHILD_CASEID || '—'}</span>
          </div>

        </div>
      </div>
    </>
  );
};

export default VerifyPreviewPage;