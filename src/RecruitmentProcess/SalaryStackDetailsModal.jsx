




import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../Config/Config";
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import { Eye } from 'lucide-react';

const InfoRow = ({ label, value, valueColor = 'text-gray-700' }) => (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500 min-w-[90px] font-medium">{label}:</span>
      <span className={`font-semibold ${valueColor}`}>{value || 'N/A'}</span>
    </div>
  );

 const SalaryRow = ({ 
  label, 
  field, 
  monthly, 
  annual, 
  isEditable = true, 
  isBold = false, 
  bgColor = '', 
  isFixed = false, 
  showESINote = false,
  isViewMode,        // ✅ ADD THESE
  salaryComponents,  // ✅ ADD THESE
  handleInputChange  // ✅ ADD THESE
}) => (
  <tr className={`${bgColor} hover:bg-gray-50 transition-colors text-xs`}>
    <td className={`px-3 py-1.5 ${isBold ? 'font-bold' : 'font-medium'} text-gray-700`}>
      {label}
      {isFixed && <span className="ml-1 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Fixed</span>}
      {showESINote && !salaryComponents.is_esi_applicable && (
        <span className="ml-1 text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded">N/A</span>
      )}
    </td>
    <td className="px-3 py-1.5 text-center">
      {isEditable && !isViewMode && !isFixed ? (
        <input
          type="number"
          value={monthly}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-20 px-2 py-0.5 border border-gray-300 rounded text-center text-xs focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
        />
      ) : (
        <span className={isBold ? 'font-bold' : ''}>{monthly.toLocaleString('en-IN')}</span>
      )}
    </td>
    <td className={`px-3 py-1.5 text-center ${isBold ? 'font-bold' : ''}`}>
      {annual.toLocaleString('en-IN')}
    </td>
  </tr>
);
const SalaryStackDetailsModal = ({ open, onClose, data, onStatusChange }) => {

  console.log(":fdgdfgggggggggggg",data);

  const FIXED_COMPONENTS = {
    conveyance: 1600,
    education_allowance: 200
  };
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  const [isEditing, setIsEditing] = useState(false);
  const [existingSalaryBreakupId, setExistingSalaryBreakupId] = useState(null);
  const [newSalaryBreakupId, setNewSalaryBreakupId] = useState(null);

  const generateRandomId = () => {
    return 'SB_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  };

  const calculateSalaryBreakdown = (offerCTC) => {
    const monthlyCTC = offerCTC / 12;
    const conveyance = FIXED_COMPONENTS.conveyance;
    const education_allowance = FIXED_COMPONENTS.education_allowance;
    const basic_salary = Math.round(monthlyCTC * 0.50);
    const hra = Math.round(basic_salary * 0.40);
    const employee_pf_contribution = Math.min(Math.round(basic_salary * 0.12), 1800);
    const employer_pf_contribution = employee_pf_contribution;
    const grossSalaryForESI = basic_salary + hra + conveyance + education_allowance;
    const is_esi_applicable = grossSalaryForESI <= 10000;
    const employeeESIContribution = is_esi_applicable ? Math.round(grossSalaryForESI * 0.0075) : 0;
    const employer_esi_contribution = is_esi_applicable ? Math.round(grossSalaryForESI * 0.0325) : 0;
    const professional_tax = 200;
    const otherBenefits = employer_pf_contribution + employer_esi_contribution;
    const deductions = employee_pf_contribution + employeeESIContribution + professional_tax;
    const targetGross = monthlyCTC - otherBenefits + deductions;
    const special_allowance = Math.round(targetGross - basic_salary - hra - conveyance - education_allowance);
    const bonus = Math.round((offerCTC * 0.04) / 12);

    return {
      basic_salary,
      hra,
      conveyance,
      education_allowance,
      special_allowance: Math.max(0, special_allowance),
      bonus,
      leave_travel_allowance: 0,
      meal_vouchers: 0,
      employer_pf_contribution,
      employer_esi_contribution,
      employee_pf_contribution,
      employeeESIContribution,
      professional_tax,
      is_esi_applicable
    };
  };

  const [offerCTC, setOfferCTC] = useState(0);
  const [salaryComponents, setSalaryComponents] = useState({
    basic_salary: 0,
    hra: 0,
    conveyance: FIXED_COMPONENTS.conveyance,
    education_allowance: FIXED_COMPONENTS.education_allowance,
    special_allowance: 0,
    bonus: 0,
    leave_travel_allowance: 0,
    meal_vouchers: 0,
    employer_pf_contribution: 1800,
    employer_esi_contribution: 0,
    employee_pf_contribution: 1800,
    employeeESIContribution: 0,
    professional_tax: 200,
    is_esi_applicable: false
  });

  const [remarks, setRemarks] = useState('');
  const [isViewMode, setIsViewMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && data) {
      const offerAmount = parseFloat(data.OFFER_CTC);
      setOfferCTC(offerAmount);
      const breakdown = calculateSalaryBreakdown(offerAmount);
      setSalaryComponents(breakdown);
      setRemarks('');

      if (data.id) {
        setIsEditing(true);
        setExistingSalaryBreakupId(data.id);
        console.log("Editing existing salary breakup:", data.salary_breakup_id);
      } else {
        setIsEditing(false);
        setExistingSalaryBreakupId(null);
        const newId = generateRandomId();
        setNewSalaryBreakupId(newId);
        console.log("Creating new salary breakup with ID:", newId);
      }
    }
  }, [open, data]);

  const calculations = {
    bonus: Math.round(salaryComponents.basic_salary * 8.33 / 100),
    special_allowance: Math.round(Math.max(0,
      (offerCTC || 0) / 12 - (
        (salaryComponents?.basic_salary || 0) +
        (salaryComponents?.hra || 0) +
        (salaryComponents?.conveyance || 0) +
        (salaryComponents?.education_allowance || 0) +
        (salaryComponents?.employer_pf_contribution || 0) +
        ((salaryComponents?.basic_salary || 0) * 8.33 / 100)
      )
    )),
    grossSalary: Math.round((salaryComponents?.basic_salary || 0) +
      (salaryComponents?.hra || 0) +
      (salaryComponents?.conveyance || 0) +
      (salaryComponents?.education_allowance || 0) +
      Math.max(0,
        (offerCTC || 0) / 12 - (
          (salaryComponents?.basic_salary || 0) +
          (salaryComponents?.hra || 0) +
          (salaryComponents?.conveyance || 0) +
          (salaryComponents?.education_allowance || 0) +
          (salaryComponents?.employer_pf_contribution || 0) +
          ((salaryComponents?.basic_salary || 0) * 8.33 / 100)
        )
      )),
    otherBenefits: salaryComponents.bonus +
      salaryComponents.leave_travel_allowance +
      salaryComponents.meal_vouchers +
      salaryComponents.employer_pf_contribution +
      salaryComponents.employer_esi_contribution,
    totalDeductions: salaryComponents.employee_pf_contribution +
      salaryComponents.employeeESIContribution +
      salaryComponents.professional_tax,
    get netSalaryMonthly() {
      return this.grossSalary - this.totalDeductions;
    },
    get netSalaryAnnual() {
      return this.netSalaryMonthly * 12;
    },
    get grossSalaryAnnual() {
      return this.grossSalary * 12;
    },
    get otherBenefitsAnnual() {
      return this.otherBenefits * 12;
    },
    get totalDeductionsAnnual() {
      return this.totalDeductions * 12;
    },
    get fixedCostAnnual() {
      return offerCTC || 0;
    }
  };

  const handleOfferCTCChange = (newOfferCTC) => {
    setOfferCTC(newOfferCTC);
    const breakdown = calculateSalaryBreakdown(newOfferCTC);
    setSalaryComponents(breakdown);
  };

  // Generate PROPERLY ALIGNED PDF Preview
  const handlePreviewPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 10;

      // Header
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
      
      // Employee details with FIXED alignment
      const employeeInfo = [
        ['Name:', String(data?.NAME || 'N/A'), 'Case ID:', String(data.CHILD_CASEID || 'N/A')],
        ['Email:', String(data?.EMAIL || 'N/A'), 'Phone:', String(data?.PHONE_NUMBER || 'N/A')],
        ['Job Title:', String(data?.JOB_TITLE || 'N/A'), 'Location:', String(data?.PLANT || 'N/A')]
      ];

      employeeInfo.forEach((row) => {
        doc.setFont('helvetica', 'bold');
        doc.text(row[0], 15, yPos);
        doc.setFont('helvetica', 'normal');
        const label1Text = doc.splitTextToSize(row[1], 55);
        doc.text(label1Text, 38, yPos);
        
        doc.setFont('helvetica', 'bold');
        doc.text(row[2], 105, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(row[3], 128, yPos);
        
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
        ['Offer CTC (Annual):', `Rs ${offerCTC.toLocaleString('en-IN')}`],
        ['Gross Salary (Monthly):', `Rs ${calculations.grossSalary.toLocaleString('en-IN')}`],
        ['Total Deductions (Monthly):', `Rs ${calculations.totalDeductions.toLocaleString('en-IN')}`],
        ['Net Salary (Monthly):', `Rs ${calculations.netSalaryMonthly.toLocaleString('en-IN')}`],
        ['Net Salary (Annual):', `Rs ${calculations.netSalaryAnnual.toLocaleString('en-IN')}`]
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

      // PROPERLY ALIGNED Table Headers
      const col1X = 10;
      const col1Width = 100;
      const col2X = col1X + col1Width;
      const col2Width = 45;
      const col3X = col2X + col2Width;
      const col3Width = 45;
      
      doc.setFillColor(16, 185, 129);
      doc.setTextColor(255, 255, 255);
      doc.rect(col1X, yPos, col1Width, 6, 'F');
      doc.rect(col2X, yPos, col2Width, 6, 'F');
      doc.rect(col3X, yPos, col3Width, 6, 'F');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Component', col1X + 5, yPos + 4);
      doc.text('Monthly (INR)', col2X + col2Width/2, yPos + 4, { align: 'center' });
      doc.text('Annual (INR)', col3X + col3Width/2, yPos + 4, { align: 'center' });
      
      yPos += 6;
      doc.setTextColor(0, 0, 0);

      // Helper function to draw a table row with PROPER alignment
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
          doc.text(String(monthly), col2X + col2Width/2, yPos + 3.5, { align: 'center' });
          doc.text(String(annual), col3X + col3Width/2, yPos + 3.5, { align: 'center' });
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
      drawRow('Basic Salary', salaryComponents.basic_salary.toLocaleString('en-IN'), (salaryComponents.basic_salary * 12).toLocaleString('en-IN'));
      drawRow('HRA', salaryComponents.hra.toLocaleString('en-IN'), (salaryComponents.hra * 12).toLocaleString('en-IN'));
      drawRow('Conveyance (Fixed)', salaryComponents.conveyance.toLocaleString('en-IN'), (salaryComponents.conveyance * 12).toLocaleString('en-IN'));
      drawRow('Education Allowance (Fixed)', salaryComponents.education_allowance.toLocaleString('en-IN'), (salaryComponents.education_allowance * 12).toLocaleString('en-IN'));
      drawRow('Special Allowance', calculations.special_allowance.toLocaleString('en-IN'), (calculations.special_allowance * 12).toLocaleString('en-IN'));
      drawRow('GROSS SALARY', calculations.grossSalary.toLocaleString('en-IN'), calculations.grossSalaryAnnual.toLocaleString('en-IN'), true, [243, 244, 246]);

      // Section II - Other Benefits
      drawRow('II. OTHER BENEFITS', '', '', false, [229, 231, 235], true);
      drawRow('Bonus', calculations.bonus.toLocaleString('en-IN'), (calculations.bonus * 12).toLocaleString('en-IN'));
      drawRow('Leave Travel Allowance', salaryComponents.leave_travel_allowance.toLocaleString('en-IN'), (salaryComponents.leave_travel_allowance * 12).toLocaleString('en-IN'));
      drawRow('Meal Vouchers', salaryComponents.meal_vouchers.toLocaleString('en-IN'), (salaryComponents.meal_vouchers * 12).toLocaleString('en-IN'));
      drawRow('Employer PF Contribution', salaryComponents.employer_pf_contribution.toLocaleString('en-IN'), (salaryComponents.employer_pf_contribution * 12).toLocaleString('en-IN'));
      drawRow('Employer ESI Contribution', salaryComponents.employer_esi_contribution.toLocaleString('en-IN'), (salaryComponents.employer_esi_contribution * 12).toLocaleString('en-IN'));

      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      // Section III - Deductions
      drawRow('III. DEDUCTIONS ON GROSS SALARY', '', '', false, [229, 231, 235], true);
      drawRow('Employee PF Contribution', salaryComponents.employee_pf_contribution.toLocaleString('en-IN'), (salaryComponents.employee_pf_contribution * 12).toLocaleString('en-IN'));
      drawRow('Employee ESI Contribution', salaryComponents.employeeESIContribution.toLocaleString('en-IN'), (salaryComponents.employeeESIContribution * 12).toLocaleString('en-IN'));
      drawRow('Professional Tax', salaryComponents.professional_tax.toLocaleString('en-IN'), (salaryComponents.professional_tax * 12).toLocaleString('en-IN'));
      drawRow('TOTAL DEDUCTIONS', calculations.totalDeductions.toLocaleString('en-IN'), calculations.totalDeductionsAnnual.toLocaleString('en-IN'), true, [243, 244, 246]);

      // Section IV - Net Salary
      drawRow('IV. NET SALARY', '', '', false, [229, 231, 235], true);
      drawRow('NET SALARY (I+II-III)', calculations.netSalaryMonthly.toLocaleString('en-IN'), calculations.netSalaryAnnual.toLocaleString('en-IN'), true, [243, 244, 246]);

      // Section V - Fixed Cost to Company
      drawRow('V. FIXED COST TO COMPANY', '', '', false, [229, 231, 235], true);
      drawRow('FIXED COST TO COMPANY', (offerCTC / 12).toLocaleString('en-IN'), offerCTC.toLocaleString('en-IN'), true, [243, 244, 246]);

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

  const handleSubmit = async (status) => {

    console.log("staaaaaaaaaaaaaaaaaaaaaaaaaaaa",status);
  const result = await Swal.fire({
    title: status === 'pending' ? 'Confirm Approval' : 'Confirm Rejection',
    text: `Are you sure you want to ${status === 'pending' ? 'approve' : 'reject'} this salary breakup?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: status === 'pending' ? '#10b981' : '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: status === 'pending' ? 'Yes, Approve!' : 'Yes, Reject!',
    cancelButtonText: 'Cancel'
  });

  if (!result.isConfirmed) {
    return;
  }
    const payload = {
      childCaseId: data.CHILD_CASEID,
      VerificationId: data.verification_id,
      status: status,
      remarks: remarks,
      offer_ctc: offerCTC,
      basic_salary: salaryComponents.basic_salary,
      hra: salaryComponents.hra,
      conveyance: FIXED_COMPONENTS.conveyance,
      education_allowance: FIXED_COMPONENTS.education_allowance,
      special_allowance: calculations.special_allowance,
      bonus: calculations.bonus,
      Gross_Salary: calculations.grossSalary,
      Total_Deductions: calculations.totalDeductions,
      Net_Salary: calculations.netSalaryMonthly,
      leave_travel_allowance: salaryComponents.leave_travel_allowance,
      meal_vouchers: salaryComponents.meal_vouchers,
      employer_pf_contribution: salaryComponents.employer_pf_contribution,
      employer_esi_contribution: salaryComponents.employer_esi_contribution,
      employee_pf_contribution: salaryComponents.employee_pf_contribution,
      employee_esi_contribution: salaryComponents.employeeESIContribution,
      professional_tax: 200,
      PERCENTOF_HIKE: data.PERCENTOF_HIKE || '',
      DESIG: data?.DESIG || '',
      is_esi_applicable: salaryComponents.is_esi_applicable
    };

    if (isEditing && existingSalaryBreakupId) {
      payload.salary_breakup_id = existingSalaryBreakupId;
    } else if (!isEditing && newSalaryBreakupId) {
      payload.salary_breakup_id = newSalaryBreakupId;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/salary-breakUp`, payload, {
        headers: {
          Authorization: `Bearer ${userToken.token}`,
          'Content-Type': 'application/json',
        },
      });

      await Swal.fire({
        icon: "success",
        title: status === 'pending' ? 'Approved!' : 'Rejected!',
        text: response.data.message || `Salary breakup ${status} successfully!`,
        timer: 1500,
        showConfirmButton: false,
      });

      console.log("ggggggggggggggggggggggg",status);

      if (onStatusChange) {
        onStatusChange({
          id: data.verification_id,
          salary_breakup_id: isEditing ? existingSalaryBreakupId : newSalaryBreakupId,
          offer_ctc: offerCTC,
          status: status,
          ...payload
        });
      }

      onClose();
    } catch (err) {
      console.error('Error saving salary breakup:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';

      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Error saving salary breakup: ' + errorMessage,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    if (field === 'conveyance' || field === 'education_allowance') {
      return;
    }

    setSalaryComponents(prev => ({
      ...prev,
      [field]: numValue
    }));
  };




  if (!open) return null;

  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] overflow-hidden shadow-2xl">
        {/* Ultra Compact Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2.5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💰</span>
            <div>
              <h2 className="text-base font-bold">Salary Stackup</h2>
               <h3 className="text-base">{data.EMAIL}</h3>
                     
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsViewMode(!isViewMode)}
              className="bg-white text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-all flex items-center gap-1"
            >
              {isViewMode ? (
                <>
                  <span className="text-sm">✏️</span>
                  Edit
                </>
              ) : (
                <>
                   <Eye className="w-4 h-4" />
  View
                </>
              )}
            </button>
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all">
              <span className="text-base">✖️</span>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(94vh-115px)] p-3 bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Employee Info - Pastel Blue */}
          <div className="bg-white rounded-xl shadow-sm p-3 mb-2.5 border border-blue-100">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base">👤</span>
              <h3 className="text-sm font-bold text-blue-900">Employee Information</h3>
            </div>
            <div className="grid grid-cols-3 gap-x-2 gap-y-1">
              <InfoRow label="Name" value={data?.NAME} />
              <InfoRow label="Case ID" value={data?.CHILD_CASEID} valueColor="text-blue-700" />
              <InfoRow label="Job Title" value={data?.DEPT} />
              <InfoRow label="Phone" value={data?.PHONE_NUMBER} />
              <InfoRow label="Location" value={data?.PLANT} valueColor="text-blue-700" />
                  <InfoRow label="DESIG" value={data?.MANPOWER_DESG} />
            </div>
          </div>

          {/* Compensation Components - Pastel Green */}
          <div className="bg-white rounded-xl shadow-sm p-3 mb-2.5 border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-base">💵</span>
                <h3 className="text-sm font-bold text-emerald-900">I. Compensation Components</h3>
              </div>
              {!isViewMode && (
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                  Edit Mode
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
         <table className="w-full table-fixed border-collapse">
        <thead>
  <tr className="bg-emerald-100 border-b border-emerald-200">
    <th className="px-3 py-1.5 text-left font-bold text-xs w-[40%]">
      Component
    </th>
    <th className="px-3 py-1.5 text-center font-bold text-xs w-[30%]">
      Monthly (₹)
    </th>
    <th className="px-3 py-1.5 text-center font-bold text-xs w-[30%]">
      Annual (₹)
    </th>
  </tr>
</thead>
                <tbody>
                  <SalaryRow label="Basic Salary" field="basic_salary" monthly={salaryComponents.basic_salary} annual={salaryComponents.basic_salary * 12} isViewMode={isViewMode} salaryComponents={salaryComponents} handleInputChange={handleInputChange} />
<SalaryRow label="HRA" field="hra" monthly={salaryComponents.hra} annual={salaryComponents.hra * 12} isViewMode={isViewMode} salaryComponents={salaryComponents} handleInputChange={handleInputChange} />
<SalaryRow label="Conveyance" field="conveyance" monthly={salaryComponents.conveyance} annual={salaryComponents.conveyance * 12} isFixed={true} isViewMode={isViewMode} salaryComponents={salaryComponents} handleInputChange={handleInputChange} />
<SalaryRow label="Education Allow." field="education_allowance" monthly={salaryComponents.education_allowance} annual={salaryComponents.education_allowance * 12} isFixed={true} isViewMode={isViewMode} salaryComponents={salaryComponents} handleInputChange={handleInputChange} />
<SalaryRow label="Special Allow." field="special_allowance" monthly={calculations.special_allowance} annual={calculations.special_allowance * 12} isViewMode={isViewMode} salaryComponents={salaryComponents} handleInputChange={handleInputChange} />
<SalaryRow label="GROSS SALARY" field="grossSalary" monthly={calculations.grossSalary} annual={calculations.grossSalaryAnnual} isEditable={false} isBold={true} bgColor="bg-emerald-100" isViewMode={isViewMode} salaryComponents={salaryComponents} handleInputChange={handleInputChange} /></tbody>
              </table>
            </div>
          </div>

          {/* Other Benefits - Pastel Purple */}
          <div className="bg-white rounded-xl shadow-sm p-3 mb-2.5 border border-purple-100">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base">🎁</span>
              <h3 className="text-sm font-bold text-purple-900">II. Other Benefits</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-purple-100 border-b border-purple-200">
                    <th className="px-5 py-1.5 text-left font-bold text-purple-900 text-xs">Component</th>
                    <th className="px-5 py-1.5 text-center font-bold text-purple-900 text-xs">Monthly (₹)</th>
                    <th className="px-5 py-1.5 text-center font-bold text-purple-900 text-xs">Annual (₹)</th>
                  </tr>
                </thead>
                <tbody>
                 <SalaryRow label="Bonus" field="bonus" monthly={calculations.bonus} annual={calculations.bonus * 12} isViewMode={isViewMode} salaryComponents={salaryComponents} handleInputChange={handleInputChange} />
<SalaryRow label="LTA" field="leave_travel_allowance" monthly={salaryComponents.leave_travel_allowance} annual={salaryComponents.leave_travel_allowance * 12} isViewMode={isViewMode} salaryComponents={salaryComponents} handleInputChange={handleInputChange} />
<SalaryRow label="Meal Vouchers" field="meal_vouchers" monthly={salaryComponents.meal_vouchers} annual={salaryComponents.meal_vouchers * 12} isViewMode={isViewMode} salaryComponents={salaryComponents} handleInputChange={handleInputChange} />
<SalaryRow label="Employer PF" field="employer_pf_contribution" monthly={salaryComponents.employer_pf_contribution} annual={salaryComponents.employer_pf_contribution * 12} isViewMode={isViewMode} salaryComponents={salaryComponents} handleInputChange={handleInputChange} />
<SalaryRow label="Employer ESI" field="employer_esi_contribution" monthly={salaryComponents.employer_esi_contribution} annual={salaryComponents.employer_esi_contribution * 12} showESINote={true} isViewMode={isViewMode} salaryComponents={salaryComponents} handleInputChange={handleInputChange} /></tbody>
              </table>
            </div>
          </div>

          {/* Deductions - Pastel Red */}
          <div className="bg-white rounded-xl shadow-sm p-3 mb-2.5 border border-red-100">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base">➖</span>
              <h3 className="text-sm font-bold text-red-900">III. Deductions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-red-100 border-b border-red-200">
                    <th className="px-6 py-1.5 text-left font-bold text-red-900 text-xs">Component</th>
                    <th className="px-6 py-1.5 text-center font-bold text-red-900 text-xs">Monthly (₹)</th>
                    <th className="px-6 py-1.5 text-center font-bold text-red-900 text-xs">Annual (₹)</th>
                  </tr>
                </thead>
                <tbody>
                 <SalaryRow label="Employee PF" field="employee_pf_contribution" monthly={salaryComponents.employee_pf_contribution} annual={salaryComponents.employee_pf_contribution * 12} isViewMode={isViewMode} salaryComponents={salaryComponents} handleInputChange={handleInputChange} />
<SalaryRow label="Employee ESI" field="employeeESIContribution" monthly={salaryComponents.employeeESIContribution} annual={salaryComponents.employeeESIContribution * 12} showESINote={true} isViewMode={isViewMode} salaryComponents={salaryComponents} handleInputChange={handleInputChange} />
<SalaryRow label="Professional Tax" field="professional_tax" monthly={salaryComponents.professional_tax} annual={salaryComponents.professional_tax * 12} isViewMode={isViewMode} salaryComponents={salaryComponents} handleInputChange={handleInputChange} />
<SalaryRow label="TOTAL DEDUCTIONS" field="totalDeductions" monthly={calculations.totalDeductions} annual={calculations.totalDeductionsAnnual} isEditable={false} isBold={true} bgColor="bg-red-100" isViewMode={isViewMode} salaryComponents={salaryComponents} handleInputChange={handleInputChange} /> </tbody>
              </table>
            </div>
          </div>

          {/* Net Salary - Pastel Teal */}
          <div className="bg-white rounded-xl shadow-sm p-3 mb-2.5 border border-teal-100">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base">✅</span>
              <h3 className="text-sm font-bold text-teal-900">IV. Net Salary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-teal-100 border-b border-teal-200">
                    <th className="px-7 py-1.5 text-left font-bold text-teal-900 text-xs">Component</th>
                    <th className="px-8 py-1.5 text-center font-bold text-teal-900 text-xs">Monthly (₹)</th>
                    <th className="px-7 py-1.5 text-center font-bold text-teal-900 text-xs">Annual (₹)</th>
                  </tr>
                </thead>
                <tbody>
<SalaryRow label="NET SALARY (I+II-III)" field="netSalary" monthly={calculations.netSalaryMonthly} annual={calculations.netSalaryAnnual} isEditable={false} isBold={true} bgColor="bg-teal-100" isViewMode={isViewMode} salaryComponents={salaryComponents} handleInputChange={handleInputChange} />                </tbody>
              </table>
            </div>
          </div>

          {/* Fixed CTC - Pastel Amber */}
          <div className="bg-white rounded-xl shadow-sm p-3 mb-2.5 border border-amber-100">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base">💼</span>
              <h3 className="text-sm font-bold text-amber-900">V. Fixed Cost to Company</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-amber-100 border-b border-amber-200">
                    <th className="px-8 py-1.5 text-left font-bold text-amber-900 text-xs">Component</th>
                    <th className="px-8 py-1.5 text-center font-bold text-amber-900 text-xs">Monthly (₹)</th>
                    <th className="px-8 py-1.5 text-center font-bold text-amber-900 text-xs">Annual (₹)</th>
                  </tr>
                </thead>
                <tbody>
<SalaryRow label="FIXED CTC" field="fixedCost" monthly={offerCTC ? offerCTC / 12 : 0} annual={offerCTC || 0} isEditable={false} isBold={true} bgColor="bg-amber-100" isViewMode={isViewMode} salaryComponents={salaryComponents} handleInputChange={handleInputChange} />                </tbody>
              </table>
            </div>
          </div>

          {/* Offer CTC Input - Pastel Orange */}
          <div className="bg-white rounded-xl shadow-sm p-3 border border-orange-100 mb-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏆</span>
                <div>
                  <h3 className="text-sm font-bold text-orange-900">Offer CTC (Annual)</h3>
                  <p className="text-[10px] text-orange-700">Total cost to company for this position</p>
                </div>
              </div>
              <div className="text-right">
                {!isViewMode ? (
                  <input
                    type="number"
                    value={offerCTC}
                    onChange={(e) => handleOfferCTCChange(parseFloat(e.target.value) || 0)}
                    className="text-xl font-bold text-orange-700 border-2 border-orange-300 rounded-lg px-3 py-1 text-right focus:ring-2 focus:ring-orange-500 focus:border-transparent w-44"
                  />
                ) : (
                  <div className="text-xl font-bold text-orange-700">
                    ₹ {offerCTC.toLocaleString('en-IN')}
                  </div>
                )}
                <div className="text-[10px] text-orange-600 mt-0.5">
                  Calculated CTC: ₹ {calculations.fixedCostAnnual.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Remarks - Pastel Gray */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl shadow-sm p-3 border border-gray-200">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">📝</span>
              <label className="block font-semibold text-gray-700 text-xs">Remarks</label>
            </div>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add remarks..."
              rows={2}
              className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Ultra Compact Footer */}
        <div className="bg-gray-50 px-3 py-2 flex justify-between items-center border-t border-gray-200">
          <div className="text-[10px] text-gray-500">
            {new Date().toLocaleString('en-IN')}
          </div>
          <div className="flex gap-1.5">
            <button onClick={onClose} disabled={isSubmitting} className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 transition-all disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handlePreviewPDF} disabled={isSubmitting} className="px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 transition-all flex items-center gap-1 disabled:opacity-50">
              <span className="text-xs">📄</span>
             Preview PDF
            </button>
            {/* <button onClick={() => handleSubmit('rejected')} disabled={isSubmitting} className="px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-all flex items-center gap-1 disabled:opacity-50">
              <span className="text-xs">❌</span>
              Reject
            </button> */}
            <button onClick={() => handleSubmit('pending')} disabled={isSubmitting} className="px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-all flex items-center gap-1 disabled:opacity-50">
              <span className="text-xs">✔️</span>
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryStackDetailsModal;


