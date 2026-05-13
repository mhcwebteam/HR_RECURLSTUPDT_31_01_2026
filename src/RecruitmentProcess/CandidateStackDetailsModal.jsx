import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { API_BASE_URL, API_BASE_URLss } from '../Config/Config';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import logo from "../asset/imagesmy.png"

const SalaryStackup = ({ data, salary, remarks, setRemarks, TableHeader, DataRow, note, personalData }) => (
  <div className="p-3 space-y-3">

    {/* Employee Info Box */}
    <div className="grid grid-cols-2 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      {[
        { label: 'NAME',                  value: data?.FIRST_NAME || data?.NAME || 'N/A' },
        { label: 'JOB TITLE',             value: data?.DEPT || 'N/A' },
        { label: 'LOCATION',              value: data?.PLANT || 'N/A' },
        { label: 'FIXED COST TO COMPANY', value: `₹ ${salary.totalCTC.a.toLocaleString('en-IN')}`, valueClass: 'text-emerald-700 font-bold' },
        { label: 'VARIABLE PAY',          value: '-', valueClass: 'text-gray-400' },
        { label: 'TOTAL COST TO COMPANY', value: `₹ ${salary.totalCTC.a.toLocaleString('en-IN')}`, valueClass: 'text-blue-700 font-bold', rowClass: 'bg-blue-50' },
      ].map(({ label, value, valueClass = 'text-gray-900', rowClass = '' }, i, arr) => (
        <React.Fragment key={label}>
          <div className={`px-3 py-1.5 border-r ${i < arr.length - 1 ? 'border-b' : ''} border-gray-300 font-semibold bg-gray-50 text-[10px] uppercase tracking-wider text-gray-600`}>
            {label}
          </div>
          <div className={`px-3 py-1.5 ${i < arr.length - 1 ? 'border-b' : ''} border-gray-300 text-xs ${valueClass} ${rowClass}`}>
            {value}
          </div>
        </React.Fragment>
      ))}
    </div>

    {/* Salary Table */}
    <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <TableHeader title="I. COMPENSATION COMPONENTS" colorClass="bg-gradient-to-r from-gray-800 to-gray-700" />
        </thead>
        <tbody>
          <DataRow label="Basic Salary"          monthly={salary.basic.m}       annual={salary.basic.a} />
          <DataRow label="HRA"                   monthly={salary.hra.m}         annual={salary.hra.a} />
          <DataRow label="Conveyance"            monthly={salary.conveyance.m}  annual={salary.conveyance.a}  isFixed={true} />
          <DataRow label="Education Allowance"   monthly={salary.education.m}   annual={salary.education.a}   isFixed={true} />
          <DataRow label="Special Allowance"     monthly={salary.special.m}     annual={salary.special.a} />
          <DataRow label="GROSS SALARY"          monthly={salary.gross.m}       annual={salary.gross.a}       isBold={true} isTotal={true} bgColor="bg-emerald-50" />

          <TableHeader title="II. OTHER BENEFITS" colorClass="bg-gradient-to-r from-gray-700 to-gray-600" />
          <DataRow label="Bonus"                        monthly={salary.bonus.m}      annual={salary.bonus.a} />
          <DataRow label="Employer PF Contribution"     monthly={salary.employerPF.m} annual={salary.employerPF.a} />
          <DataRow label="Employer ESI Contribution"    monthly={0}                   annual={0}                   isDisabled={true} />

          <TableHeader title="III. DEDUCTIONS" colorClass="bg-gradient-to-r from-gray-700 to-gray-600" />
          <DataRow label="Employee PF Contribution"  monthly={salary.employeePF.m}      annual={salary.employeePF.a} />
          <DataRow label="Employee ESI Contribution" monthly={0}                         annual={0}                   isDisabled={true} />
          <DataRow label="Professional Tax"          monthly={salary.pt.m}              annual={salary.pt.a} />
          <DataRow label="TOTAL DEDUCTIONS"          monthly={salary.totalDeductions.m} annual={salary.totalDeductions.a} isBold={true} isTotal={true} bgColor="bg-red-50" />

          <DataRow label="NET SALARY (Gross - Deductions)" monthly={salary.netSalary.m} annual={salary.netSalary.a} isBold={true} isHighlight={true} />
          <DataRow label="FIXED COST TO COMPANY"           monthly={salary.totalCTC.m}  annual={salary.totalCTC.a}  isBold={true} isTotal={true} bgColor="bg-blue-50" />
        </tbody>
      </table>

      {/* Terms & Conditions */}
      <div className="px-3 py-2 bg-white border-t border-gray-300 space-y-1">
        <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Terms & Conditions</h4>
        {[
          "You are entitled for GPA. For GTI & GMC 50% of the premium to be borne by the employee as per the policy.",
          "Subsidized lunch will be provided at workplace.",
          "Gratuity is applicable as per provisions of The Gratuity Act 1972.",
          "Your net salary is subject to TDS deduction.",
          "Statutory deductions as applicable.",
          "Management has right to change/modify/alter the CTC structure."
        ].map((point, idx) => (
          <div key={idx} className="flex items-start gap-1.5 text-[10px] text-gray-500 leading-snug">
            <span className="text-gray-400 mt-0.5">•</span>
            <p className="flex-1">{point}</p>
          </div>
        ))}
      </div>
    </div>

  </div>
);

const CandidateStackDetailsModal = ({ open, onClose, data, onStatusChange, note,  personalData }) => {





  const [activeTab, setActiveTab] = useState('personal');
  const [token] = useState(() => {
    const authToken = JSON.parse(localStorage.getItem("userInfo"));
    return authToken || null;
  });
  const [offerCTC, setOfferCTC] = useState(0);
  const [remarks, setRemarks] = useState('');

 

  // Calculate detailed breakdown
  const calculateDetailedBreakdown = (ctc) => {
    const annualCTC = parseFloat(ctc) || 0;
    const monthlyCTC = annualCTC / 12;

    const annualBasic = Math.round(annualCTC * 0.50);
    const monthlyBasic = Math.round(annualBasic / 12);

    const annualHRA = Math.round(annualBasic * 0.40);
    const monthlyHRA = Math.round(annualHRA / 12);

    const monthlyConveyance = 1600;
    const monthlyEducation = 200;

    const monthlyEmployeePF = Math.min(Math.round(monthlyBasic * 0.12), 1800);
    const monthlyEmployerPF = monthlyEmployeePF;
    const monthlyPT = 200;
    const monthlyBonus = Math.round(monthlyBasic * 0.0833);

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
      setActiveTab('personal');
      setRemarks('');
    }
  }, [open, data]);

  if (!open) return null;

  const TableHeader = ({ title, colorClass }) => (
    <tr className={`${colorClass} text-white`}>
      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">{title}</th>
      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">MONTHLY (₹)</th>
      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">ANNUAL (₹)</th>
    </tr>
  );

  const DataRow = ({ label, monthly, annual, isBold = false, isTotal = false, isFixed = false, isDisabled = false, isHighlight = false, bgColor = '' }) => {
    let rowBgColor = bgColor;
    if (isTotal) rowBgColor = 'bg-gray-50';
    if (isHighlight) rowBgColor = 'bg-blue-50';
    
    return (
      <tr className={`border-b border-gray-200 ${rowBgColor} hover:bg-gray-50 transition-colors`}>
        <td className="px-4 py-2.5 text-xs">
          <span className={`${isBold ? 'font-bold' : 'font-medium'} ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {label}
            {isFixed && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Fixed</span>}
          </span>
        </td>
        <td className={`px-4 py-2.5 text-center text-xs ${isBold ? 'font-bold' : ''} ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
          {isDisabled ? '-' : `₹ ${Math.round(monthly || 0).toLocaleString('en-IN')}`}
        </td>
        <td className={`px-4 py-2.5 text-center text-xs ${isBold ? 'font-bold' : ''} ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
          {isDisabled ? '-' : `₹ ${Math.round(annual || 0).toLocaleString('en-IN')}`}
        </td>
      </tr>
    );
  };

 const handlePreviewPDF = () => {
  try {
    const pw = 150; // ← increased from 210 to 230 to fit right-side values
    const ph = 170;

    const doc = new jsPDF({ unit:'mm', format:[pw, ph] });
    let y = 0, ri = 0;

    // Header
    doc.setFillColor(2,84,161); doc.rect(0, 0, pw, 20, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(13); doc.setFont('helvetica','bold');   doc.text('MY HOME GROUP', pw/2, 7, {align:'center'});
    doc.setFontSize(8);  doc.setFont('helvetica','normal'); doc.text('SALARY BREAKUP DOCUMENT', pw/2, 13, {align:'center'});
   y = 20;

    // Employee Info
    const infoRows = [
      ['NAME',                  data?.FIRST_NAME || data?.NAME || 'N/A'],
      ['JOB TITLE',             data?.DEPT  || 'N/A'],
      ['LOCATION',              data?.PLANT || 'N/A'],
      ['FIXED COST TO COMPANY', `Rs. ${salary.totalCTC.a.toLocaleString('en-IN')}`],
      ['VARIABLE PAY',          '-'],
      ['TOTAL COST TO COMPANY', `Rs. ${salary.totalCTC.a.toLocaleString('en-IN')}`],
    ];
    doc.setDrawColor(200,200,200);
    infoRows.forEach(([label, value], i) => {
      const ry = y + i * 5;
      doc.setFillColor(...(i===5?[235,245,255]:i%2===0?[249,250,251]:[255,255,255]));
      doc.rect(10, ry, pw-20, 5, 'F'); doc.rect(10, ry, pw-20, 5, 'S');
      doc.setFontSize(7); doc.setFont('helvetica','bold');   doc.setTextColor(80,80,80); doc.text(label, 14, ry+3.4);
      doc.setFont('helvetica','normal');
      doc.setTextColor(i===3?5:i===5?37:30, i===3?150:i===5?99:30, i===3?80:i===5?235:30);
      doc.text(value, pw-14, ry+3.4, {align:'right'});
    });
    y += infoRows.length * 5 + 4;

    // column positions — fixed
    const colM  = pw - 75;  // Monthly center
    const colA  = pw - 14;  // Annual right edge

    // Helpers
    const secHead = (title) => {
      doc.setFillColor(50,60,70); doc.rect(10, y, pw-20, 5, 'F');
      doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont('helvetica','bold');
      doc.text(title,          14,    y+3.4);
      doc.text('MONTHLY (Rs.)', colM, y+3.4, {align:'center'});
      doc.text('ANNUAL (Rs.)',  colA, y+3.4, {align:'right'});
      y += 5;
    };

    const row = (label, m, a, {isBold=false,isTotal=false,isHighlight=false,isDisabled=false,isFixed=false}={}) => {
      doc.setFillColor(...(isHighlight?[235,245,255]:isTotal?[248,250,252]:ri%2===0?[255,255,255]:[250,250,250])); ri++;
      doc.rect(10, y, pw-20, 5, 'F'); doc.setDrawColor(220,220,220); doc.rect(10, y, pw-20, 5, 'S');
      doc.setFont('helvetica',isBold?'bold':'normal'); doc.setFontSize(7);
      doc.setTextColor(...(isDisabled?[150,150,150]:[50,50,50]));
      doc.text(label+(isFixed?' [Fixed]':''), 14, y+3.4);
      doc.text(isDisabled?'-':`Rs. ${Math.round(m||0).toLocaleString('en-IN')}`, colM, y+3.4, {align:'center'});
      doc.text(isDisabled?'-':`Rs. ${Math.round(a||0).toLocaleString('en-IN')}`, colA, y+3.4, {align:'right'});
      y += 5;
    };

    // Column header
    doc.setFillColor(30,41,59); doc.rect(10, y, pw-20, 5, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(7.5); doc.setFont('helvetica','bold');
    doc.text('COMPENSATION DETAILS', 14,   y+3.4);
    doc.text('MONTHLY (Rs.)',        colM,  y+3.4, {align:'center'});
    doc.text('ANNUAL (Rs.)',         colA,  y+3.4, {align:'right'});
    y += 5;

    // Sections
    const s = salary;
    secHead('I. COMPENSATION COMPONENTS');
    row('Basic Salary',        s.basic.m,      s.basic.a);
    row('HRA',                 s.hra.m,        s.hra.a);
    row('Conveyance',          s.conveyance.m, s.conveyance.a, {isFixed:true});
    row('Education Allowance', s.education.m,  s.education.a,  {isFixed:true});
    row('Special Allowance',   s.special.m,    s.special.a);
    row('GROSS SALARY',        s.gross.m,      s.gross.a,      {isBold:true,isTotal:true});

    secHead('II. OTHER BENEFITS');
    row('Bonus',                     s.bonus.m,      s.bonus.a);
    row('Employer PF Contribution',  s.employerPF.m, s.employerPF.a);
    row('Employer ESI Contribution', 0, 0, {isDisabled:true});

    secHead('III. DEDUCTIONS');
    row('Employee PF Contribution',  s.employeePF.m,      s.employeePF.a);
    row('Employee ESI Contribution', 0, 0, {isDisabled:true});
    row('Professional Tax',          s.pt.m,              s.pt.a);
    row('TOTAL DEDUCTIONS',          s.totalDeductions.m, s.totalDeductions.a, {isBold:true,isTotal:true});

    row('NET SALARY (Gross - Deductions)', s.netSalary.m, s.netSalary.a, {isBold:true,isHighlight:true});
    row('FIXED COST TO COMPANY',           s.totalCTC.m,  s.totalCTC.a,  {isBold:true,isTotal:true});

    // Terms — no gap
   
    // Footer flush
    const finalH = Math.ceil(y) + 7;
    doc.setFillColor(2,84,161); doc.rect(0, finalH-7, pw, 7, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.text('MY HOME GROUP — Confidential Document', pw/2, finalH-2.5, {align:'center'});

    window.open(doc.output('bloburl'), '_blank');
  } catch (error) {
    console.error('Error generating PDF:', error);
    Swal.fire({icon:'error', title:'Error', text:'Failed to generate PDF preview'});
  }
};

 const handleSubmit = async () => {
    const result = await Swal.fire({
      title: 'Confirm Approval',
      text: 'Are you sure you want to approve this candidate?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    const payload = {
      caseId: data.CHILD_CASEID,
      remarks: remarks,
      category: token?.Emp_Category,
    employee:token?.employee
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/Note-For-AprvlUpdt`, payload, {
        headers: {
          Authorization: `Bearer ${token?.token}`,
          'Content-Type': 'application/json',
        },
      });

     if (response) {
  await Swal.fire({
    icon: "success",
    title: "Approved Successfully",
    text: "Note for approval updated successfully",
    timer: 1500,
    showConfirmButton: false,
  });

  setRemarks("");
  if (onStatusChange) onStatusChange();
  
  // ✅ Only call note() if it's actually a function
  if (typeof note === 'function') await note();
  
  onClose();
  window.location.reload(); // ✅ Always last
}
    } catch (err) {
      console.error('Error saving:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.response?.data?.message || 'Something went wrong',
        confirmButtonColor: '#ef4444'
      });
    }
  };


  const PersonalDetails = () => {

const matchedPersonal = Array.isArray(personalData)
    ? personalData.find((ele) => ele.child_caseid === data?.CHILD_CASEID)
    : null;

   

  // ✅ Take ONLY index 0 from experienceData (present company)
  const presentExperience = matchedPersonal?.experienceData?.[0] || null;

  const handleFileOpen = (filePath) => {
    if (!filePath) {
      Swal.fire({
        icon: 'warning',
        title: 'No File',
        text: 'No file available',
      });
      return;
    }

    const fileUrl = filePath.startsWith('http') 
      ? filePath 
      : `${API_BASE_URLss}${filePath}`;
    
    window.open(fileUrl, '_blank');
  };

const getFileName = (path) => {
  if (!path) return "No File";

  const file = path.split("/").pop();
  const cleanName = file.replace(/^verification_\d+_/, "");

  return cleanName.length > 20
    ? cleanName.substring(0, 20) + "..."
    : cleanName;
};

    
    const currentCTC = parseFloat(data?.CURRENT_CTC || 0);
    const offerCTC = parseFloat(data?.OFFER_CTC || 0);
    const hikePercentage = currentCTC > 0 ? (((offerCTC - currentCTC) / currentCTC) * 100).toFixed(2) : 0;

    return (
      <div className="p-4 space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    
    {/* PRESENT DETAILS */}
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-gray-700 pb-1.5 border-b-2 border-blue-200 flex items-center gap-2">
        <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">👤</span>
        PRESENT DETAILS
      </h3>
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 shadow-sm">
        <DetailRow label="Name"                 value={data?.FIRST_NAME || data?.NAME || 'N/A'} />
        <DetailRow label="Current CTC"          value={`₹ ${currentCTC.toLocaleString('en-IN')}`} valueColor="text-emerald-700 font-bold" />
        <DetailRow label="Present Company"       value={presentExperience?.COMPANY_NAME || 'N/A'} />
        <DetailRow label="Total Experience"     value={`${matchedPersonal?.TOTAL_EXP || 'N/A'} years`} />
        <DetailRow label="Designation"          value={data?.DESIGNATION || data?.DEPT || 'N/A'} />
        <DetailRow label="Highest Qualification" value={matchedPersonal?.HIGHEST_QUA || 'N/A'} />
      </div>
    </div>

    {/* PROPOSED DETAILS */}
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-gray-700 pb-1.5 border-b-2 border-emerald-200 flex items-center gap-2">
        <span className="bg-emerald-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">📋</span>
        PROPOSED DETAILS
      </h3>
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 shadow-sm">
        <DetailRow label="Source Type"        value={matchedPersonal?.SRC_TYPE || 'N/A'} />
        <DetailRow label="Offered CTC"        value={`₹ ${offerCTC.toLocaleString('en-IN')}`} valueColor="text-blue-700 font-bold" />
        <DetailRow 
          label="Hike Percentage" 
          value={`${hikePercentage}%`} 
          valueColor={parseFloat(hikePercentage) > 0 ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'} 
        />
<DetailRow
  label="Joining Duration"
  value={
    matchedPersonal?.experienceData?.[0]?.noticePeriod
      ? `${matchedPersonal.experienceData[0].noticePeriod} days`
      : 'N/A'
  }
/>
        <DetailRow label="Offered Designation" value={data?.DESIG || 'N/A'} />

        {/* HR Evaluation File */}
        <div className="flex justify-between items-center px-3 py-2 hover:bg-gray-50 transition-colors">
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">HR Evaluation File</span>
          {matchedPersonal?.hrEvaluationFile ? (
            <button
              onClick={() => handleFileOpen(matchedPersonal?.hrEvaluationFile)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              <span>📄</span>
              {getFileName(matchedPersonal?.hrEvaluationFile)}
            </button>
          ) : (
            <span className="text-xs font-semibold text-gray-400">No File</span>
          )}
        </div>
      </div>
    </div>

  </div>
</div>
    );
  };

  const DetailRow = ({ label, value, valueColor = "text-gray-900" }) => (
  <div className="flex justify-between items-center px-3 py-2 hover:bg-gray-50 transition-colors">
    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</span>
    <span className={`text-xs font-semibold ${valueColor}`}>{value}</span>
  </div>
);


  const getCurrentApprovalStep = () => {
  if (data?.HR !== 'Approved') return 'HR';
  if (data?.DIRECTOR !== 'Approved') return 'DIRECTOR';
  if (data?.EVC !== 'Approved') return 'EVC';
  return null;
};

const currentStep = getCurrentApprovalStep();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '650px' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-5 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Logo" className="w-14 h-14 rounded-full border-2 border-white shadow-md" />
            <div>
              <h1 className="text-xl font-bold text-white">MY HOME GROUP</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-medium text-blue-200">Candidate Details</span>
                <span className="text-xs text-blue-300">•</span>
                <span className="text-xs font-medium text-blue-200">
                  {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <span className="bg-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium text-white border border-blue-500">
                CASEID: {data?.CHILD_CASEID || 'N/A'}
              </span>
              <span className="bg-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium text-white border border-emerald-500">
                {data?.PLANT || 'N/A'}
              </span>

              
            </div>
            <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors ml-2">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
       <div className="flex border-b bg-gray-50 flex-shrink-0">
  <TabButton 
    active={activeTab === 'personal'} 
    onClick={() => setActiveTab('personal')}
    icon="👤"
    label="Personal Details"
  />
  <TabButton 
    active={activeTab === 'salary'} 
    onClick={() => setActiveTab('salary')}
    icon="💰"
    label="Salary Stackup"
  />
</div>

        {/* Content Area */}
        <div className="overflow-y-auto custom-scrollbar" style={{ height: activeTab === 'personal' ? '400px' : '460px' }}>
          {activeTab === 'personal' && <PersonalDetails />}
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

        {/* Status Cards + Remarks - 60/40 Split */}
<div className="flex bg-gray-50" style={{ minHeight: '110px' }}>
{/* LEFT - 60% - HOD / DIRECTOR / EVC Status */}
<div className="flex flex-col justify-center px-4 py-3 " style={{ width: '60%' }}>
  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Approval Status</p>
  <div className="flex gap-2">
  {[
  { key: 'HR', title: 'HOD', border: 'border-blue-200', bg: 'bg-blue-50' },
  { key: 'DIRECTOR', title: 'DIRECTOR', border: 'border-purple-200', bg: 'bg-purple-50' },
  { key: 'EVC', title: 'EVC', border: 'border-orange-200', bg: 'bg-orange-50' },
].map(({ key, title, border, bg }) => {

  let statusType = '';

  if (data?.[key] == 'Approved') {
    statusType = 'approved';
  } else if (currentStep == key) {
    statusType = 'wip';
  } else {
    statusType = 'pending';
  }

  return (
    <div key={key} className={`flex-1 border ${border} ${bg} rounded-lg px-3 py-2 flex items-center gap-2`}>

      <div className="flex flex-col items-center gap-0.5">
        <span className="text-base">👤</span>
        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wide">{title}</p>
      </div>

      <div className="w-px self-stretch bg-gray-300 mx-1" />

      <span
        className={`flex-1 text-center px-1.5 py-1.5 rounded-full text-[9px] font-semibold border ${
          statusType === 'approved'
            ? 'bg-green-100 text-green-700 border-green-300'
            : statusType === 'wip'
            ? 'bg-blue-100 text-blue-700 border-blue-300'
            : 'bg-yellow-100 text-yellow-700 border-yellow-300'
        }`}
      >
        {statusType === 'approved'
          ? '✓ Approved'
          : statusType === 'wip'
          ? '⚡ WIP'
          : '⏳ Pending'}
      </span>

    </div>
  );
})}
  </div>
</div>

  <div className="flex flex-col px-4 py-3 bg-gray-50" style={{ width: '40%' }}>
  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
    <span className="mr-1">💬</span>
    {token?.Emp_Category} Remarks
  </label>
  <textarea
    className="flex-1 w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
    value={remarks}
    onChange={(e) => setRemarks(e.target.value)}
    placeholder="Enter your remarks here..."
  />
</div>
</div>

        {/* Action Buttons */}
        <div className="px-5 py-3 bg-gray-50 border-t flex justify-end gap-2 flex-shrink-0">
          <ActionButton onClick={onClose} variant="secondary">
            CANCEL
          </ActionButton>
          <ActionButton onClick={handlePreviewPDF} variant="purple" icon="📄">
            PREVIEW PDF
          </ActionButton>
          {/* <ActionButton onClick={() => onStatusChange?.({ ...data, status: 'rejected', remarks })} variant="danger">
            REJECT
          </ActionButton> */}
          <ActionButton onClick={handleSubmit} variant="primary">
            APPROVE & SUBMIT
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    style={active ? { backgroundColor: '#BBDCE5' } : {}}
    className={`flex-1 px-6 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
      active
        ? 'text-blue-900 border-b-2 border-blue-400'
        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
    }`}
  >
    <span>{icon}</span>
    {label}
  </button>
);
const ActionButton = ({ onClick, children, variant = 'primary', icon, disabled }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    purple: 'bg-purple-600 hover:bg-purple-700 text-white'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
        variants[variant]
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

// Add this CSS to your global styles or component
const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

export default CandidateStackDetailsModal;
