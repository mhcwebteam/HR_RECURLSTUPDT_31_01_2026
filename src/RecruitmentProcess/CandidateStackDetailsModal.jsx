


import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../Config/Config';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';


const SalaryStackup = ({ data, salary, remarks, setRemarks, TableHeader, DataRow, token }) => (



  <div className="p-6 space-y-6">
    {/* Employee Info Box */}
    <div className="grid grid-cols-2 border border-gray-300 rounded overflow-hidden">
      <div className="p-2 border-r border-b border-gray-300 font-bold bg-gray-50 text-[10px]">NAME</div>
      <div className="p-2 border-b border-gray-300 text-xs uppercase">{data?.NAME}</div>

      <div className="p-2 border-r border-b border-gray-300 font-bold bg-gray-50 text-[10px]">JOB TITLE</div>
      <div className="p-2 border-b border-gray-300 text-xs uppercase">{data?.DEPT || 'N/A'}</div>

      <div className="p-2 border-r border-b border-gray-300 font-bold bg-gray-50 text-[10px]">LOCATION</div>
      <div className="p-2 border-b border-gray-300 text-xs uppercase">{data?.PLANT || 'NISHADA PROJECT, KOKAPET'}</div>

      <div className="p-2 border-r border-b border-gray-300 font-bold bg-gray-50 text-[10px]">FIXED COST TO COMPANY IN INR</div>
      <div className="p-2 border-b border-gray-300 text-xs font-bold">
        {salary.totalCTC.a.toLocaleString('en-IN')}
      </div>

      <div className="p-2 border-r border-b border-gray-300 font-bold bg-gray-50 text-[10px]">VARIABLE PAY IN INR</div>
      <div className="p-2 border-b border-gray-300 text-xs">-</div>

      <div className="p-2 border-r font-bold bg-gray-50 text-[10px]">TOTAL COST TO COMPANY - INR</div>
      <div className="p-2 text-xs font-bold text-blue-900">
        {salary.totalCTC.a.toLocaleString('en-IN')}
      </div>
    </div>

    {/* Main Salary Table */}
    <div className="border border-gray-300 rounded shadow-sm">
      <table className="w-full border-collapse">
        <thead>
          <TableHeader title="I. Compensation Components" colorClass="bg-gray-800" />
        </thead>
        <tbody>
          <DataRow label="1. BASIC SALARY" monthly={salary.basic.m} annual={salary.basic.a} />
          <DataRow label="2. HRA" monthly={salary.hra.m} annual={salary.hra.a} />
          <DataRow label="3. CONVEYANCE" monthly={salary.conveyance.m} annual={salary.conveyance.a} />
          <DataRow label="4. EDUCATION ALLOWANCE" monthly={salary.education.m} annual={salary.education.a} />
          <DataRow label="5. SPECIAL ALLOWANCE" monthly={salary.special.m} annual={salary.special.a} />
          <DataRow label="GROSS SALARY (sum of 1 to 5)" monthly={salary.gross.m} annual={salary.gross.a} isBold={true} isTotal={true} />

          <TableHeader title="II. Other Benefits" colorClass="bg-gray-600" />
          <DataRow label="1. BONUS" monthly={salary.bonus.m} annual={salary.bonus.a} />
          <DataRow label="2. EMPLOYER PF CONTRIBUTION" monthly={salary.employerPF.m} annual={salary.employerPF.a} />
          <DataRow label="3. EMPLOYER ESI CONTRIBUTION" />

          <TableHeader title="III. Deductions on Gross Salary" colorClass="bg-gray-600" />
          <DataRow label="1. EMPLOYEE PF CONTRIBUTION" monthly={salary.employeePF.m} annual={salary.employeePF.a} />
          <DataRow label="2. EMPLOYER ESI CONTRIBUTION" />
          <DataRow label="3. PROFESSIONAL TAX" monthly={salary.pt.m} annual={salary.pt.a} />
          <DataRow label="TOTAL DEDUCTIONS" monthly={salary.totalDeductions.m} annual={salary.totalDeductions.a} isBold={true} isTotal={true} />

          <DataRow label="NET SALARY (Gross - Deductions)" monthly={salary.netSalary.m} annual={salary.netSalary.a} isBold={true} />
          <DataRow label="FIXED COST TO COMPANY" monthly={salary.totalCTC.m} annual={salary.totalCTC.a} isBold={true} isTotal={true} />
        </tbody>
      </table>
      <div className="p-4 bg-white border-t border-gray-300 space-y-2">
        {[
          "You are entitled for GPA. For GTI & GMC 50% of the premium to be borne by the employee as per the policy.",
          "Subsidized lunch will be provided at workplace.",
          "Gratuity is applicable as per provisions of The Gratuity Act 1972.",
          "Your net salary is subject to TDS deduction.",
          "Statutory deductions as applicable.",
          "Management has right to change/modify/alter the CTC structure."
        ].map((point, idx) => (
          <div key={idx} className="flex items-start gap-2 text-[11px] text-gray-700 leading-tight">
            <span className="font-bold">Ø</span>
            <p>{point}</p>
          </div>
        ))}
      </div>
    </div>

    <div>HOD: {data.HR}</div>
    <div>DIRECTOR: {data.DIRECTOR}</div>

    <div>EVC: {data.EVC}</div>


    {/* Remarks */}
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1">{token.Emp_Category} Remarks</label>
      <textarea
        className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
        rows="2"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        placeholder="Enter remarks for the candidate..."
      />
    </div>
  </div>
);

const CandidateStackDetailsModal = ({ open, onClose, data, onStatusChange }) => {


  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'company', 'salary'

  const [token, userToken] = useState(() => {
    const authToken = JSON.parse(localStorage.getItem("userInfo"));
    return authToken ? authToken : null
  })

  const [offerCTC, setOfferCTC] = useState(0);
  const [remarks, setRemarks] = useState('');

  // Logic from your image/requirements
  const calculateDetailedBreakdown = (ctc) => {
    const annualCTC = parseFloat(ctc) || 0;
    const monthlyCTC = annualCTC / 12;

    // 1. Basic (approx 50% of CTC)
    const annualBasic = Math.round(annualCTC * 0.50);
    const monthlyBasic = Math.round(annualBasic / 12);

    // 2. HRA (approx 40% of Basic)
    const annualHRA = Math.round(annualBasic * 0.40);
    const monthlyHRA = Math.round(annualHRA / 12);

    // 3. Fixed Components
    const monthlyConveyance = 1600;
    const monthlyEducation = 200;

    // 4. PF & Professional Tax
    const monthlyEmployeePF = Math.min(Math.round(monthlyBasic * 0.12), 1800);
    const monthlyEmployerPF = monthlyEmployeePF;
    const monthlyPT = 200;

    // 5. Bonus (approx 8.33% of basic)
    const monthlyBonus = Math.round(monthlyBasic * 0.0833);

    // 6. Special Allowance (Balancing figure)
    const currentSum = monthlyBasic + monthlyHRA + monthlyConveyance + monthlyEducation + monthlyEmployerPF + monthlyBonus;
    const monthlySpecial = Math.max(0, Math.round(monthlyCTC - currentSum));

    const monthlyGross = monthlyBasic + monthlyHRA + monthlyConveyance + monthlyEducation + monthlySpecial;
    const monthlyDeductions = monthlyEmployeePF + monthlyPT;

    return {
      basic: { m: monthlyBasic, a: monthlyBasic * 12 },
      hra: { m: monthlyHRA, a: monthlyHRA * 12 },
      conveyance: { m: monthlyConveyance, a: monthlyConveyance * 12 },
      education: { m: monthlyEducation, a: monthlyEducation * 12 },
      special: { m: monthlySpecial, a: monthlySpecial * 12 },
      gross: { m: monthlyGross, a: monthlyGross * 12 },
      bonus: { m: monthlyBonus, a: monthlyBonus * 12 },
      employerPF: { m: monthlyEmployerPF, a: monthlyEmployerPF * 12 },
      employeePF: { m: monthlyEmployeePF, a: monthlyEmployeePF * 12 },
      pt: { m: monthlyPT, a: monthlyPT * 12 },
      totalDeductions: { m: monthlyDeductions, a: monthlyDeductions * 12 },
      netSalary: { m: monthlyGross - monthlyDeductions, a: (monthlyGross - monthlyDeductions) * 12 },
      totalCTC: { m: monthlyCTC, a: annualCTC }
    };
  };

  const [salary, setSalary] = useState(calculateDetailedBreakdown(0));

  useEffect(() => {
    if (open && data) {
      const amount = parseFloat(data.OFFER_CTC) || 0;
      setOfferCTC(amount);
      setSalary(calculateDetailedBreakdown(amount));
      setActiveTab('personal'); // Reset to personal details when modal opens
    }
  }, [open, data]);

  if (!open) return null;

  const TableHeader = ({ title, colorClass }) => (
    <tr className={`${colorClass} text-white`}>
      <th className="px-4 py-2 text-left text-sm font-bold uppercase">{title}</th>
      <th className="px-4 py-2 text-center text-sm font-bold">MONTHLY - INR</th>
      <th className="px-4 py-2 text-center text-sm font-bold">ANNUAL - INR</th>
    </tr>
  );

  const DataRow = ({ label, monthly, annual, isBold = false, isTotal = false }) => (
    <tr className={`border-b border-gray-200 ${isTotal ? 'bg-gray-100' : ''}`}>
      <td className={`px-4 py-2 text-sm ${isBold ? 'font-bold' : 'text-gray-700'}`}>{label}</td>
      <td className={`px-4 py-2 text-center text-sm ${isBold ? 'font-bold' : ''}`}>{Math.round(monthly || 0).toLocaleString('en-IN')}</td>
      <td className={`px-4 py-2 text-center text-sm ${isBold ? 'font-bold' : ''}`}>{Math.round(annual || 0).toLocaleString('en-IN')}</td>
    </tr>
  );

  // Generate ALIGNED PDF Preview
  const handlePreviewPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 10;

      // Header with better spacing
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, pageWidth, 20, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SALARY BREAKUP DOCUMENT', pageWidth / 2, 10, { align: 'center' });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, 16, { align: 'center' });

      yPos = 26;

      // Employee Information Section
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(243, 244, 246);
      doc.rect(10, yPos, pageWidth - 20, 7, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('EMPLOYEE INFORMATION', 15, yPos + 5);

      yPos += 10;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');

      // Employee details with proper column widths
      const employeeInfo = [
        ['Name:', String(data?.NAME || 'N/A'), 'Case ID:', String(data?.CHILD_CASEID || 'N/A')],
        ['Job Title:', String(data?.DEPT || 'N/A'), 'Phone:', String(data?.PHONE_NUMBER || 'N/A')],
        ['Location:', String(data?.PLANT || 'N/A'), 'Current CTC:', String('Rs ' + (parseFloat(data?.CURRENT_CTC || 0).toLocaleString('en-IN')))]
      ];

      employeeInfo.forEach((row) => {
        doc.setFont('helvetica', 'bold');
        doc.text(row[0], 15, yPos);
        doc.setFont('helvetica', 'normal');
        const label1Text = doc.splitTextToSize(row[1], 60);
        doc.text(label1Text, 40, yPos);

        doc.setFont('helvetica', 'bold');
        doc.text(row[2], 110, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(row[3], 135, yPos);

        yPos += 5;
      });

      yPos += 3;

      // Salary Summary Section
      doc.setFillColor(254, 243, 199);
      doc.rect(10, yPos, pageWidth - 20, 7, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(146, 64, 14);
      doc.text('SALARY SUMMARY', 15, yPos + 5);

      yPos += 10;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);

      const salarySummary = [
        ['Offer CTC (Annual):', `Rs ${salary.totalCTC.a.toLocaleString('en-IN')}`],
        ['Gross Salary (Monthly):', `Rs ${salary.gross.m.toLocaleString('en-IN')}`],
        ['Total Deductions (Monthly):', `Rs ${salary.totalDeductions.m.toLocaleString('en-IN')}`],
        ['Net Salary (Monthly):', `Rs ${salary.netSalary.m.toLocaleString('en-IN')}`],
        ['Net Salary (Annual):', `Rs ${salary.netSalary.a.toLocaleString('en-IN')}`]
      ];

      salarySummary.forEach((row, index) => {
        doc.setFont('helvetica', 'bold');
        doc.text(row[0], 15, yPos);
        doc.setFont('helvetica', index >= 3 ? 'bold' : 'normal');
        doc.text(row[1], pageWidth - 15, yPos, { align: 'right' });
        yPos += 5;
      });

      yPos += 3;

      // Detailed Breakdown Section Header
      doc.setFillColor(16, 185, 129);
      doc.rect(10, yPos, pageWidth - 20, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('DETAILED SALARY BREAKDOWN', 15, yPos + 5);

      yPos += 10;
      doc.setTextColor(0, 0, 0);

      // Define column positions for perfect alignment
      const col1X = 10;  // Component column start
      const col1Width = 115;  // Component column width
      const col2X = col1X + col1Width;  // Monthly column start
      const col2Width = 37.5;  // Monthly column width
      const col3X = col2X + col2Width;  // Annual column start
      const col3Width = 37.5;  // Annual column width

      // Table Headers with proper alignment
      doc.setFillColor(16, 185, 129);
      doc.setTextColor(255, 255, 255);
      doc.rect(col1X, yPos, col1Width, 6, 'F');
      doc.rect(col2X, yPos, col2Width, 6, 'F');
      doc.rect(col3X, yPos, col3Width, 6, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Component', col1X + 5, yPos + 4);
      doc.text('Monthly (INR)', col2X + (col2Width / 2), yPos + 4, { align: 'center' });
      doc.text('Annual (INR)', col3X + (col3Width / 2), yPos + 4, { align: 'center' });

      yPos += 6;
      doc.setTextColor(0, 0, 0);

      // Helper function to draw a table row with perfect alignment
      const drawRow = (label, monthly, annual, isBold = false, bgColor = null, isHeader = false) => {
        if (bgColor) {
          doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
          doc.rect(col1X, yPos, col1Width + col2Width + col3Width, 5, 'F');
        }

        doc.setFont('helvetica', isBold || isHeader ? 'bold' : 'normal');
        doc.setFontSize(isHeader ? 8 : 7);

        if (isHeader) {
          doc.text(label, col1X + 5, yPos + 3.5);
        } else {
          doc.text(label, col1X + 5, yPos + 3.5);
          doc.text(String(monthly || '0'), col2X + (col2Width / 2), yPos + 3.5, { align: 'center' });
          doc.text(String(annual || '0'), col3X + (col3Width / 2), yPos + 3.5, { align: 'center' });
        }

        // Draw borders
        doc.setDrawColor(200, 200, 200);
        doc.rect(col1X, yPos, col1Width, 5);
        doc.rect(col2X, yPos, col2Width, 5);
        doc.rect(col3X, yPos, col3Width, 5);

        yPos += 5;
      };

      // Section I - Compensation Components
      drawRow('I. COMPENSATION COMPONENTS', '', '', false, [229, 231, 235], true);
      drawRow('Basic Salary', salary.basic.m.toLocaleString('en-IN'), salary.basic.a.toLocaleString('en-IN'));
      drawRow('HRA', salary.hra.m.toLocaleString('en-IN'), salary.hra.a.toLocaleString('en-IN'));
      drawRow('Conveyance', salary.conveyance.m.toLocaleString('en-IN'), salary.conveyance.a.toLocaleString('en-IN'));
      drawRow('Education Allowance', salary.education.m.toLocaleString('en-IN'), salary.education.a.toLocaleString('en-IN'));
      drawRow('Special Allowance', salary.special.m.toLocaleString('en-IN'), salary.special.a.toLocaleString('en-IN'));
      drawRow('GROSS SALARY', salary.gross.m.toLocaleString('en-IN'), salary.gross.a.toLocaleString('en-IN'), true, [243, 244, 246]);

      // Section II - Other Benefits
      drawRow('II. OTHER BENEFITS', '', '', false, [229, 231, 235], true);
      drawRow('Bonus', salary.bonus.m.toLocaleString('en-IN'), salary.bonus.a.toLocaleString('en-IN'));
      drawRow('Employer PF Contribution', salary.employerPF.m.toLocaleString('en-IN'), salary.employerPF.a.toLocaleString('en-IN'));
      drawRow('Employer ESI Contribution', '0', '0');

      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      // Section III - Deductions
      drawRow('III. DEDUCTIONS ON GROSS SALARY', '', '', false, [229, 231, 235], true);
      drawRow('Employee PF Contribution', salary.employeePF.m.toLocaleString('en-IN'), salary.employeePF.a.toLocaleString('en-IN'));
      drawRow('Employee ESI Contribution', '0', '0');
      drawRow('Professional Tax', salary.pt.m.toLocaleString('en-IN'), salary.pt.a.toLocaleString('en-IN'));
      drawRow('TOTAL DEDUCTIONS', salary.totalDeductions.m.toLocaleString('en-IN'), salary.totalDeductions.a.toLocaleString('en-IN'), true, [243, 244, 246]);

      // Section IV - Net Salary
      drawRow('IV. NET SALARY', '', '', false, [229, 231, 235], true);
      drawRow('NET SALARY (Gross - Deductions)', salary.netSalary.m.toLocaleString('en-IN'), salary.netSalary.a.toLocaleString('en-IN'), true, [243, 244, 246]);

      // Section V - Fixed Cost to Company
      drawRow('V. FIXED COST TO COMPANY', '', '', false, [229, 231, 235], true);
      drawRow('FIXED COST TO COMPANY', salary.totalCTC.m.toLocaleString('en-IN'), salary.totalCTC.a.toLocaleString('en-IN'), true, [243, 244, 246]);

      yPos += 3;

      // Remarks Section
      if (remarks) {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFillColor(249, 250, 251);
        doc.rect(10, yPos, pageWidth - 20, 6, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('REMARKS', 15, yPos + 4);

        yPos += 8;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const splitRemarks = doc.splitTextToSize(String(remarks), pageWidth - 30);
        doc.text(splitRemarks, 15, yPos);
      }

      // Footer
      const footerY = pageHeight - 12;
      doc.setFontSize(7);
      doc.setTextColor(128, 128, 128);
      doc.text('This is a computer-generated document. No signature is required.', pageWidth / 2, footerY, { align: 'center' });
      doc.text(`Page 1 of ${doc.internal.getNumberOfPages()}`, pageWidth - 15, footerY, { align: 'right' });

      // Open PDF in new window
      window.open(doc.output('bloburl'), '_blank');
    } catch (error) {
      console.error('Error generating PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to generate PDF preview: ' + error.message,
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleSubmit = async () => {
    const payload = {
      caseId: data.CHILD_CASEID,
      remarks: remarks,
      category: token.Emp_Category
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/Note-For-AprvlUpdt`, payload, {
        headers: {
          Authorization: `Bearer ${token.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response) {
        // 🟢 Success Swal (WAIT till shown)
            await Swal.fire({
              icon: "success",
              title: "Approved Successfully",
              text: "Note for approval updated successfully",
              timer: 1500,
              showConfirmButton: false,
            });
        onClose();
        setRemarks("")
        // Parent component refresh
        if (onStatusChange) onStatusChange();
      }

    } catch (err) {
      console.error('Error saving salary breakup:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';

      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Error saving salary breakup: ' + errorMessage,
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // Personal Details Component
  const PersonalDetails = () => (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-blue-900 mb-4 border-b-2 border-blue-900 pb-2">Personal Details</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Name</label>
          <p className="text-sm font-semibold text-gray-800">{data?.FIRST_NAME || 'N/A'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Present Company</label>
          <p className="text-sm font-semibold text-gray-800">{data?.PRESENT_COMPANY || 'N/A'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Designation</label>
          <p className="text-sm font-semibold text-gray-800">{data?.DESIGNATION || data?.DEPT || 'N/A'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Current Salary</label>
          <p className="text-sm font-semibold text-green-700">₹{data?.CURRENT_CTC ? parseFloat(data.CURRENT_CTC).toLocaleString('en-IN') : '0'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Experience</label>
          <p className="text-sm font-semibold text-gray-800">{data?.EXPERIENCE || 'N/A'} years</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Notice Period</label>
          <p className="text-sm font-semibold text-gray-800">{data?.NOTICE_PERIOD || 'N/A'}</p>
        </div>
      </div>
    </div>
  );

  // Company Requirements Component
  const CompanyRequirements = () => (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-blue-900 mb-4 border-b-2 border-blue-900 pb-2">Company Requirements</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Case ID</label>
          <p className="text-sm font-semibold text-gray-800">{data?.CHILD_CASEID || 'N/A'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Plant</label>
          <p className="text-sm font-semibold text-gray-800">{data?.PLANT || 'N/A'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Designation</label>
          <p className="text-sm font-semibold text-gray-800">{data?.DEPT || 'N/A'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Years of Experience Required</label>
          <p className="text-sm font-semibold text-gray-800">{data?.REQUIRED_EXPERIENCE || data?.EXPERIENCE || 'N/A'} years</p>
        </div>
      </div>
    </div>
  );

  // Salary Stackup Component (your existing salary sheet)


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '600px' }}>

        {/* Top Header */}
        <div className="bg-white p-4 border-b flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <img
                src="/images/imagesmy.png"
                alt="Logo"
                className="h-15 w-15 rounded-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-blue-900 leading-tight">MY HOME GROUP</h1>
              <div className="flex justify-between items-center w-full">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  Candidate Details
                </p>
                <p className="text-xs font-semibold pl-100 text-gray-500">
                  Date: {new Date().toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b bg-gray-50 flex-shrink-0">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 px-6 py-3 text-sm font-semibold transition-all ${activeTab === 'personal'
              ? 'bg-blue-900 text-white border-b-2 border-blue-900'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`flex-1 px-6 py-3 text-sm font-semibold transition-all ${activeTab === 'company'
              ? 'bg-blue-900 text-white border-b-2 border-blue-900'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Company Requirements
          </button>
          <button
            onClick={() => setActiveTab('salary')}
            className={`flex-1 px-6 py-3 text-sm font-semibold transition-all ${activeTab === 'salary'
              ? 'bg-blue-900 text-white border-b-2 border-blue-900'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Salary Stackup
          </button>
        </div>

        {/* Content Area - Fixed height with scroll */}
        <div className="overflow-y-auto" style={{ height: activeTab === 'salary' ? '380px' : '468px' }}>
          {activeTab === 'personal' && <PersonalDetails />}
          {activeTab === 'company' && <CompanyRequirements />}
          {activeTab === 'salary' && (

            <SalaryStackup
              data={data}
              salary={salary}
              remarks={remarks}
              setRemarks={setRemarks}
              TableHeader={TableHeader}
              DataRow={DataRow}
              token={token}
            />
          )}

        </div>

        {/* Footer Buttons - Only show on Salary Stackup tab */}
        {activeTab === 'salary' && (
          <div className="px-4 py-2 bg-gray-50 border-t flex justify-end gap-2 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-gray-300 rounded font-bold text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handlePreviewPDF}
              className="px-4 py-1.5 bg-purple-600 text-white rounded font-bold text-sm hover:bg-purple-700 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PREVIEW PDF
            </button>
            <button
              onClick={() => onStatusChange({ ...data, status: 'rejected', remarks })}
              className="px-4 py-1.5 bg-red-600 text-white rounded font-bold text-sm hover:bg-red-700 transition-colors"
            >
              REJECT
            </button>
            <button
              onClick={() => handleSubmit()}
              className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-700"
            >
              APPROVE & SUBMIT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default CandidateStackDetailsModal;
