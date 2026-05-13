import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';

const PDF_W_MM = 210;
const PDF_H_MM = 297;
const MARGIN_MM = 8;

export const generateVerificationPDF = async (data, sameAsPermanent) => {
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'fixed';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  tempDiv.style.width = '1200px';
  tempDiv.style.backgroundColor = '#eef2f7';
  tempDiv.style.padding = '20px';
  tempDiv.style.fontFamily = 'DM Sans, sans-serif';

  // Build education rows dynamically
  const getEduRows = () => {
    const rows = [];
    
    // SSC - Always show
    rows.push(`
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">SSC (10th) *</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${data?.SSC_SCHOOL_NAME || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${data?.SSC_BOARD || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${data?.SSC_MARKS || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${data?.SSC_PASSED_YEAR || 'N/A'}</td>
      </tr>
    `);
    
    // Intermediate
    rows.push(`
      <tr style="background: #f9fafb;">
        <td style="border: 1px solid #ddd; padding: 8px;">Intermediate *</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${data?.INTER_COLLEGE_NAME || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${data?.INTER_BOARD || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${data?.INTER_MARKS || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${data?.INTER_PASSED_YEAR || 'N/A'}</td>
      </tr>
    `);
    
    // Degree/B.Tech
    rows.push(`
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">Degree/B.Tech *</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${data?.GRAD_COLLEGE_NAME || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${data?.DEGREE_UNIVERSITY || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${data?.BTECH_MARKS || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${data?.DEGREE_PASSED_YEAR || 'N/A'}</td>
      </tr>
    `);
    
    // PG (if exists)
    if (data?.PG_COLLEGE_NAME && data?.PG_COLLEGE_NAME !== 'N/A') {
      rows.push(`
        <tr style="background: #f9fafb;">
          <td style="border: 1px solid #ddd; padding: 8px;">PG</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${data?.PG_COLLEGE_NAME}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${data?.PG_UNIVERSITY || 'N/A'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${data?.PG_MARKS || 'N/A'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${data?.PG_PASSED_YEAR || 'N/A'}</td>
        </tr>
      `);
    }
    
    // PHD (if exists)
    if (data?.PHD_COLLEGE_NAME && data?.PHD_COLLEGE_NAME !== 'N/A') {
      rows.push(`
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">PHD</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${data?.PHD_COLLEGE_NAME}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${data?.PHD_UNIVERSITY || 'N/A'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${data?.PHD_MARKS || 'N/A'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${data?.PHD_PASSED_YEAR || 'N/A'}</td>
        </tr>
      `);
    }
    
    // Others (if exists)
    if (data?.OTHER_COLLEGE_NAME && data?.OTHER_COLLEGE_NAME !== 'N/A') {
      rows.push(`
        <tr style="background: #f9fafb;">
          <td style="border: 1px solid #ddd; padding: 8px;">Others</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${data?.OTHER_COLLEGE_NAME}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${data?.OTHER_UNIVERSITY || 'N/A'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${data?.OTHER_MARKS || 'N/A'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${data?.OTHER_PASSED_YEAR || 'N/A'}</td>
        </tr>
      `);
    }
    
    return rows.join('');
  };

  // Build experience rows
  const getExpRows = () => {
    if (!data?.experienceData || data.experienceData.length === 0) {
      return '<tr><td colspan="7" style="padding: 20px; text-align: center;">No experience details provided.</td></tr>';
    }
    
    let expHtml = '';
    data.experienceData.forEach((exp, idx) => {
      const isCurrent = exp.COMPANY_STAGES === "0";
      expHtml += `
        <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'};">
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>${isCurrent ? 'Current Company' : `Company ${idx + 1}`}</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${exp.COMPANY_NAME || 'N/A'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${exp.DESIGNATION || 'N/A'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${exp.START_DATE ? dayjs(exp.START_DATE).format("DD/MM/YYYY") : 'N/A'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${exp.END_DATE ? dayjs(exp.END_DATE).format("DD/MM/YYYY") : 'N/A'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${isCurrent && data?.CURRENT_CTC ? `₹${data.CURRENT_CTC}` : '-'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${isCurrent && data?.EXP_CTC ? `₹${data.EXP_CTC}` : '-'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${isCurrent && exp.noticePeriod ? `${exp.noticePeriod} days` : '-'}</td>
        </tr>
      `;
    });
    return expHtml;
  };

  tempDiv.innerHTML = `
    <div style="background: white; border-radius: 12px; overflow: hidden; max-width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%); padding: 16px 24px;">
        <div style="font-size: 20px; font-weight: 700; color: white;">Verification Application Preview</div>
        <div style="font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 5px;">
          ${data?.NAME || '—'} | ${data?.EMAIL || '—'} | ${data?.PHONE_NUMBER || '—'}
        </div>
      </div>
      
      <div style="padding: 20px; background: #f4f6f9;">
        
        <!-- BASIC INFORMATION TABLE -->
        <div style="background: white; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr style="background: #e5e7eb;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">CHILD CASE ID</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">PLANT</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">DEPARTMENT</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">NAME</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">EMAIL</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">PHONE NUMBER</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">EMERGENCY CONTACT</th>
             </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.CHILD_CASEID || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.PLANT || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.DEPT || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.NAME || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.EMAIL || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.PHONE_NUMBER || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.EMER_CONTACT_NUM || 'N/A'}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <th style="border: 1px solid #ddd; padding: 8px;">DOB (ORIGINAL)</th>
              <th style="border: 1px solid #ddd; padding: 8px;">DOB (AADHAR)</th>
              <th style="border: 1px solid #ddd; padding: 8px;">AGE</th>
              <th style="border: 1px solid #ddd; padding: 8px;">GENDER</th>
              <th style="border: 1px solid #ddd; padding: 8px;">MARITAL STATUS</th>
              <th style="border: 1px solid #ddd; padding: 8px;">LANGUAGES KNOWN</th>
              <th style="border: 1px solid #ddd; padding: 8px;">MOTHER TONGUE</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.ORIGINAL_DOB || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.DOB_ASPER_ADHAR || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.AGE || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.GENDER || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.MARITAL_STATUS || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.LANG_KNOWN || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.MOTHER_TONGUE || 'N/A'}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <th style="border: 1px solid #ddd; padding: 8px;">HIGHEST QUALIFICATION</th>
              <th style="border: 1px solid #ddd; padding: 8px;">AADHAAR NUMBER</th>
              <th style="border: 1px solid #ddd; padding: 8px;">PAN NUMBER</th>
              <th style="border: 1px solid #ddd; padding: 8px;">UAN NUMBER</th>
              <th style="border: 1px solid #ddd; padding: 8px;">ESI NUMBER</th>
              <th style="border: 1px solid #ddd; padding: 8px;">BLOOD GROUP</th>
              <th style="border: 1px solid #ddd; padding: 8px;">SOURCE TYPE</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.HIGHEST_QUA || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.AADHAR_NUMBER || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.PAN_NUM || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.UAN_NUM || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.ESI_NUM || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.BLOOD_GROUP || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.SRC_TYPE || 'N/A'}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <th style="border: 1px solid #ddd; padding: 8px;">PASSPORT NUMBER</th>
              <th style="border: 1px solid #ddd; padding: 8px;">PASSPORT EXPIRY</th>
              <th style="border: 1px solid #ddd; padding: 8px;">DRIVING LICENSE</th>
              <th style="border: 1px solid #ddd; padding: 8px;">DL EXPIRY</th>
              <th style="border: 1px solid #ddd; padding: 8px;">TOTAL EXPERIENCE</th>
              <td style="border: 1px solid #ddd; padding: 8px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px;"></td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.PASSPORT_NUMBER || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.PASSPORT_EXPIRY || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.DRIVING_LICENSE || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.DRIVING_LICENSE_EXPIRY || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.TOTAL_EXP || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px;"></td>
            </tr>
          </table>
        </div>

        <!-- PERMANENT ADDRESS -->
        <div style="background: white; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr style="background: #e5e7eb;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">HOUSE NO / STREET</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">CITY / VILLAGE</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">MANDAL</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">DISTRICT</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">STATE</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">PINCODE</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">SAME AS PERMANENT</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.HNO || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.CITY || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.MANDAL || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.DISTRICT || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.STATE || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.PINCODE || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${sameAsPermanent ? 'YES' : 'NO'}</td>
            </tr>
          </table>
        </div>

        <!-- PRESENT ADDRESS (if different) -->
        ${!sameAsPermanent ? `
        <div style="background: white; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr style="background: #e5e7eb;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">HOUSE NO / STREET</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">CITY / VILLAGE</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">MANDAL</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">DISTRICT</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">STATE</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">PINCODE</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.PRESENT_HNO || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.PRESENT_CITY || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.PRESENT_MANDAL || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.PRESENT_DISTRICT || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.PRESENT_STATE || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${data?.PRESENT_PINCODE || 'N/A'}</td>
            </tr>
          </table>
        </div>
        ` : '<div style="background: #f0fdf4; padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center; color: #15803d;">✔ Present Address is Same as Permanent Address</div>'}

        <!-- EDUCATION DETAILS -->
        <div style="background: white; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #e5e7eb;">
                <th style="border: 1px solid #ddd; padding: 8px;">QUALIFICATION</th>
                <th style="border: 1px solid #ddd; padding: 8px;">SCHOOL/COLLEGE</th>
                <th style="border: 1px solid #ddd; padding: 8px;">UNIVERSITY/BOARD</th>
                <th style="border: 1px solid #ddd; padding: 8px;">MARKS %</th>
                <th style="border: 1px solid #ddd; padding: 8px;">PASSED YEAR</th>
              </tr>
            </thead>
            <tbody>
              ${getEduRows()}
            </tbody>
          </table>
        </div>

        <!-- EXPERIENCE DETAILS -->
        <div style="background: white; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #e5e7eb;">
                <th style="border: 1px solid #ddd; padding: 8px;">TYPE</th>
                <th style="border: 1px solid #ddd; padding: 8px;">COMPANY NAME</th>
                <th style="border: 1px solid #ddd; padding: 8px;">DESIGNATION</th>
                <th style="border: 1px solid #ddd; padding: 8px;">FROM DATE</th>
                <th style="border: 1px solid #ddd; padding: 8px;">TO DATE</th>
                <th style="border: 1px solid #ddd; padding: 8px;">CURRENT CTC</th>
                <th style="border: 1px solid #ddd; padding: 8px;">EXPECTED CTC</th>
                <th style="border: 1px solid #ddd; padding: 8px;">NOTICE PERIOD</th>
              </tr>
            </thead>
            <tbody>
              ${getExpRows()}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="text-align: center; font-size: 10px; color: #6b7280; margin-top: 20px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
          Generated on: ${new Date().toLocaleString()}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(tempDiv);
  await new Promise(r => setTimeout(r, 500));

  const canvas = await html2canvas(tempDiv, {
    scale: 1.5,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true,
  });
  
  document.body.removeChild(tempDiv);
  
  const imgData = canvas.toDataURL('image/jpeg', 0.7);
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });
  
  const imgWidth = PDF_W_MM - MARGIN_MM * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  let heightLeft = imgHeight;
  let position = 0;
  
  pdf.addImage(imgData, 'JPEG', MARGIN_MM, position + MARGIN_MM, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= (PDF_H_MM - MARGIN_MM * 2);
  
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', MARGIN_MM, position + MARGIN_MM, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= (PDF_H_MM - MARGIN_MM * 2);
  }
  
  return pdf.output('blob');
};








