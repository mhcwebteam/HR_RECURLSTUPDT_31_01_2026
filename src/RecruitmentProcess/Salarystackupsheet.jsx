import React, { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { API_BASE_URL } from '../Config/Config';
import axiosInstance from '../Config/axiosConfig';
import MHCPLLogo  from "../asset/imagesmy.png"
import TTPLLogo  from "../asset/TTCLogo.jpg"
/* ============================================================
   CONFIG — mirrors the @php block in your Blade template 1:1
   ============================================================ */

// BUKRS -> Ref No prefix (same as $companyPrefixMap in Blade)
const COMPANY_PREFIX_MAP = {
  '2000': 'MHCPL',
  '2050': 'MHCTD',
  '2100': 'ASDPL',
  '2150': 'MHIPL',
  '2250': 'HDPL',
  '2350': 'TTPL',
  '3100': 'MHPSPL',
};
const logoMap = {
  TTPL: TTPLLogo,
  MHCPL: MHCPLLogo,
};


const money = (v) => {
  const n = Number(v);
  if (!v || isNaN(n)) return '0';
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const todayDMY = () => {
  const d = new Date();
  const pad = (x) => String(x).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};




function resolveCompanyInfo(matchedcompdesc) {
  const companyName = matchedcompdesc?.COMP_CODE_DESC;
  const plantName = matchedcompdesc?.plant_name || "";
  const companyCode = matchedcompdesc?.BUKRS || "";

  const refPrefix =
    COMPANY_PREFIX_MAP[String(companyCode)];

    const logo = logoMap[refPrefix];

  return {
    companyName,
    plantName,
    companyCode,
    refPrefix,
    logo
  };
}


export default function SalaryStackUpSheet({ salaryData = [{}], plantType = [] }) {


  const sheetRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [token, setToken] = useState(() => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  });

  const [plants, setPlants] = useState([]);



  
  const zmmPlants = async () => {
 
    if (!token?.token) return;

    try {
        const response = await axiosInstance.get(
            `${API_BASE_URL}/zmm-plants`,
            {
                headers: { Authorization: `Bearer ${token.token}` },
            }
        );

        setPlants(response.data.data); // ✅ store data here

  

    } catch (err) {
        console.error("Error fetching plants", err);
    }
};

    useEffect(() => {
zmmPlants()
    },[])

  



const record = salaryData[0] || {};


const plantCode = String(record?.PLANT || "")
  .split("-")[0]
  .trim();

const matchedPlant = plants.find(
  (item) => String(item?.plant_code).trim() == plantCode
);

  const { companyName, plantName, refPrefix,logo } = resolveCompanyInfo(matchedPlant);
  console.log("refPrefixrefPrefixrefPrefix",record.DATE);

  const refNo = record.REF_NO ?? `${refPrefix}-HR-F29`;
  const version = record.VERSION ?? '00';
  const date = record.DATE ?? todayDMY();

  const fixedCost = Number(record.offer_ctc ?? 0);
  const variablePay = Number(record.variable_pay ?? 0);
  const totalCost = fixedCost + variablePay;


  const val = (key) => Number(record[key] ?? 0);
  const annual = (key) => val(key) * 12;

  const handleDownloadPDF = async () => {
    if (!sheetRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(sheetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth - 20; // 10mm margin each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      pdf.save(`${(record.NAME || 'Salary_StackUp').replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  /* ---------- shared cell styles (mirrors .sheet td in Blade) ---------- */
  const cell = {
    border: '1px solid #000',
    padding: '4px 10px',
    fontSize: 12,
    color: '#000',
  };
  const moneyCell = {
    ...cell,
    fontFamily: "'Courier New', monospace",
    fontWeight: 700,
    textAlign: 'right',
  };
  const th = { ...cell, fontWeight: 700, background: '#f3f4f6' };

  return (
    <div style={{ fontFamily: "'Segoe UI',Tahoma,Geneva,Verdana,sans-serif" }}>
   <div
  style={{
    marginBottom: 12,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  }}
>
     
      </div>

      <div
        ref={sheetRef}
        style={{
          maxWidth: 900,
          margin: '0 auto',
          background: '#ffffff',
          padding: 16,
        }}
      >
        {/* ================= HEADER ================= */}
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse', border: '1.5px solid #000' }}>
          <tbody>
            <tr>
              <td rowSpan={2} width="15%" style={{ ...cell, textAlign: 'center', verticalAlign: 'middle' }}>
                  <img src={logo} alt="Logo" 
                            />
              </td>
              <td width="55%" style={{ ...cell, textAlign: 'center', verticalAlign: 'middle' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{companyName}</div>
              </td>
              <td width="30%" style={{ ...cell, verticalAlign: 'middle' }}>
                <strong>Ref No:</strong> {refNo}
              </td>
            </tr>
            <tr>
              <td style={{ ...cell, verticalAlign: 'middle' }}>
                <div style={{ fontSize: 16, fontWeight: 700, textAlign: 'center' }}>STACK-UP SHEET</div>
              </td>
              <td style={{ ...cell, padding: 0 }}>
                <div style={{ padding: '6px 14px', borderBottom: '1px solid #000' }}>
                  <strong>Date:</strong> {date}
                </div>
                <div style={{ padding: '6px 14px' }}>
                  <strong>Version :</strong> {version}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ height: 5 }} />

        {/* ================= EMPLOYEE SUMMARY ================= */}
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td width="24.5%" style={{ ...cell, fontWeight: 700 }}>NAME</td>
              <td colSpan={2} style={cell}>{record.NAME ?? ''}</td>
            </tr>
            <tr>
              <td style={{ ...cell, fontWeight: 700 }}>JOB TITLE</td>
              <td colSpan={2} style={cell}>{record.DESIG || record.MANPOWER_DESG || ''}</td>
            </tr>
            <tr>
              <td style={{ ...cell, fontWeight: 700 }}>LOCATION</td>
              <td colSpan={2} style={cell}>{record.LOCATION ?? plantName}</td>
            </tr>
            <tr>
              <td style={cell}>FIXED COST TO COMPANY IN INR</td>
              <td colSpan={2} style={{ ...moneyCell, textAlign: 'left', width: '20%' }}>{money(fixedCost)}</td>
            </tr>
            <tr>
              <td style={cell}>VARIABLE PAY IN INR</td>
              <td colSpan={2} style={{ ...moneyCell, textAlign: 'left' }}>{variablePay ? money(variablePay) : ''}</td>
            </tr>
            <tr>
              <td style={{ ...cell, fontWeight: 700 }}>TOTAL COST TO COMPANY - INR</td>
              <td colSpan={2} style={{ ...moneyCell, textAlign: 'left' }}>{money(totalCost)}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ height: 5 }} />

        {/* ================= COMPENSATION COMPONENTS ================= */}
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td width="8%" style={th}>S. No</td>
              <td width="47%" style={th}>COMPENSATION COMPONENTS</td>
              <td width="22%" style={{ ...th, textAlign: 'right' }}>MONTHLY - INR</td>
              <td width="23%" style={{ ...th, textAlign: 'right' }}>ANNUAL - INR</td>
            </tr>

            <tr>
              <td style={cell}>1</td><td style={cell}>BASIC SALARY</td>
              <td style={moneyCell}>{money(val('basic_salary'))}</td>
              <td style={moneyCell}>{money(annual('basic_salary'))}</td>
            </tr>
            <tr>
              <td style={cell}>2</td><td style={cell}>HRA</td>
              <td style={moneyCell}>{money(val('hra'))}</td>
              <td style={moneyCell}>{money(annual('hra'))}</td>
            </tr>
            <tr>
              <td style={cell}>3</td><td style={cell}>CONVEYANCE</td>
              <td style={moneyCell}>{money(val('conveyance'))}</td>
              <td style={moneyCell}>{money(annual('conveyance'))}</td>
            </tr>
            <tr>
              <td style={cell}>4</td><td style={cell}>EDUCATION ALLOWANCE</td>
              <td style={moneyCell}>{money(val('education_allowance'))}</td>
              <td style={moneyCell}>{money(annual('education_allowance'))}</td>
            </tr>
            <tr>
              <td style={cell}>5</td><td style={cell}>SPECIAL ALLOWANCE</td>
              <td style={moneyCell}>{money(val('special_allowance'))}</td>
              <td style={moneyCell}>{money(annual('special_allowance'))}</td>
            </tr>
            <tr style={{ background: '#fef3c7', fontWeight: 700 }}>
              <td style={cell}>I</td><td style={cell}>GROSS SALARY (sum of 1 to 5)</td>
              <td style={moneyCell}>{money(val('Gross_Salary'))}</td>
              <td style={moneyCell}>{money(annual('Gross_Salary'))}</td>
            </tr>

            <tr style={{ background: '#f3f4f6' }}>
              <td style={cell}>II</td>
              <td colSpan={3} style={{ ...cell, fontWeight: 700 }}>OTHER BENEFITS</td>
            </tr>
            <tr>
              <td style={cell}>1</td><td style={cell}>BONUS</td>
              <td style={moneyCell}>{money(val('bonus'))}</td>
              <td style={moneyCell}>{money(annual('bonus'))}</td>
            </tr>
            <tr>
              <td style={cell}>2</td><td style={cell}>EMPLOYER PF CONTRIBUTION</td>
              <td style={moneyCell}>{money(val('employer_pf_contribution'))}</td>
              <td style={moneyCell}>{money(annual('employer_pf_contribution'))}</td>
            </tr>
            <tr>
              <td style={cell}>3</td><td style={cell}>EMPLOYER ESI CONTRIBUTION</td>
              <td style={moneyCell}>{val('employer_esi_contribution') ? money(val('employer_esi_contribution')) : '-'}</td>
              <td style={moneyCell}>{val('employer_esi_contribution') ? money(annual('employer_esi_contribution')) : '-'}</td>
            </tr>

            <tr style={{ background: '#f3f4f6' }}>
              <td style={cell}>III</td>
              <td colSpan={3} style={{ ...cell, fontWeight: 700 }}>DEDUCTIONS ON GROSS SALARY</td>
            </tr>
            <tr>
              <td style={cell}>1</td><td style={cell}>EMPLOYEE PF CONTRIBUTION</td>
              <td style={moneyCell}>{money(val('employee_pf_contribution'))}</td>
              <td style={moneyCell}>{money(annual('employee_pf_contribution'))}</td>
            </tr>
            <tr>
              <td style={cell}>2</td><td style={cell}>EMPLOYEE ESI CONTRIBUTION</td>
              <td style={moneyCell}>{val('employee_esi_contribution') ? money(val('employee_esi_contribution')) : '-'}</td>
              <td style={moneyCell}>{val('employee_esi_contribution') ? money(annual('employee_esi_contribution')) : '-'}</td>
            </tr>
            <tr>
              <td style={cell}>3</td><td style={cell}>PROFESSIONAL TAX</td>
              <td style={moneyCell}>{money(val('professional_tax'))}</td>
              <td style={moneyCell}>{money(annual('professional_tax'))}</td>
            </tr>
            <tr style={{ background: '#fee2e2', fontWeight: 700 }}>
              <td style={cell}>IV</td><td style={cell}>TOTAL DEDUCTIONS (sum of 1 to 3)</td>
              <td style={moneyCell}>{money(val('Total_Deductions'))}</td>
              <td style={moneyCell}>{money(annual('Total_Deductions'))}</td>
            </tr>

            <tr style={{ background: '#d1fae5', fontWeight: 700 }}>
              <td style={cell}>V</td><td style={cell}>NET SALARY</td>
              <td style={moneyCell}>{money(val('Net_Salary'))}</td>
              <td style={moneyCell}>{money(annual('Net_Salary'))}</td>
            </tr>
            <tr style={{ background: '#fbbf24', fontWeight: 700 }}>
              <td style={cell}>V</td><td style={cell}>FIXED COST TO COMPANY</td>
              <td style={moneyCell}>{money(fixedCost / 12)}</td>
              <td style={moneyCell}>{money(fixedCost)}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ height: 6 }} />

        {/* ================= NOTES ================= */}
        <div style={{ fontSize: 12, color: '#000', lineHeight: 1.7, padding: '0 4px 10px 4px' }}>
          <div>Ø You are entitled to GPA. For GTI & GMC 50% of the premium to be borne by the employee as per company policy.</div>
          <div>Ø Subsidized lunch will be provided at workplace.</div>
          <div>Ø Gratuity is applicable as per provisions of the Gratuity Act 1972.</div>
          <div>Ø Your net salary is subject to TDS deduction.</div>
          <div>Ø Management has right to change/modify/alter the CTC structure.</div>
        </div>

        {/* ================= SIGNATURE BLOCK ================= */}
        <div style={{ fontSize: 14, fontWeight: 700, padding: '10px 4px 4px 4px' }}>{companyName}</div>
        <div style={{ height: 16 }} />
        <table width="100%" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td colSpan={2} style={{ padding: 4, fontSize: 13, fontWeight: 700, borderTop: '1px solid #000', width: '60%' }}>
                Authorised Signatory
              </td>
              <td style={{ padding: 4, fontSize: 13, borderTop: '1px solid #000' }}>
                Candidate's Acceptance<br />Date:
              </td>
            </tr>
          </tbody>
        </table>

      
           <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 12,
  }}
>
  <button
    onClick={handleDownloadPDF}
    disabled={downloading}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "9px 18px",
      border: "none",
      borderRadius: "8px",
      background: downloading ? "#9ca3af" : "#10b981",
      color: "#fff",
      fontSize: "10px",
      fontWeight: 600,
      cursor: downloading ? "not-allowed" : "pointer",
      boxShadow: "0 3px 8px rgba(16, 185, 129, 0.25)",
    }}
  >
  
    {downloading ? "Generating..." : "Download PDF"}
  </button>
</div>
      
      </div>
    </div>
  );
}

