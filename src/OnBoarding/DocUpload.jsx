




import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, User, Building2, MapPin, CheckCircle2, Download, Eye, CheckCircle, Clock, XCircle, FileDown } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL, API_BASE_URLss } from '../Config/Config';
import jsPDF from 'jspdf';
import axios from 'axios';

const DocUpload = ({ rowData, onClose }) => {
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  const [formData, setFormData] = useState({
    employeeName: '',
    empId: '',
    designation: '',
    doj: '',
    department: '',
    siteLocation: ''
  });

  // Inject style for SweetAlert2 z-index
  useEffect(() => {
    const styleId = 'swal-z-index-fix';

    // Check if style already exists
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .swal2-container {
          z-index: 99999 !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Cleanup function to remove style when component unmounts
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Map API document keys to checklist items
  const [documentChecklist, setDocumentChecklist] = useState([
    {
      id: 1,
      name: 'RESUME DULY SIGNED',
      apiKey: 'resume',
      statusKey: null,
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single'
    },
    {
      id: 2,
      name: 'CANDIDATE APPLICATION FORM',
      apiKey: 'application_form',
      statusKey: null,
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single'
    },
    {
      id: 3,
      name: 'INTERVIEW EVALUATION SHEET',
      apiKey: 'interview_sheet',
      statusKey: null,
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single'
    },
    {
      id: 4,
      name: 'EDUCATIONALS TESTIMONIALS',
      type: 'multiple',
      subItems: [
        {
          id: '4a',
          name: 'SSC (10th Certificate)',
          apiKey: '10th_certi',
          statusKey: 'Tenth_Status',
          documentIdKey: 'Tenth_DocId',
          approved: false,
          fileName: '',
          filePath: '',
          type: 'single'
        },
        {
          id: '4b',
          name: 'INTERMEDIATE / ITI / DIPLOMA',
          apiKey: 'Inter_certi',
          statusKey: 'Inter_Status',
          documentIdKey: 'Inter_DocId',
          approved: false,
          fileName: '',
          filePath: '',
          type: 'single'
        },
        {
          id: '4c',
          name: 'GRADUATION',
          apiKey: 'Gradu_certi',
          statusKey: 'Grad_Status',
          documentIdKey: 'grad_DocId',
          approved: false,
          fileName: '',
          filePath: '',
          type: 'single'
        },
        {
          id: '4d',
          name: 'POST GRADUATION',
          apiKey: 'Pg_certi',
          statusKey: 'Pg_Status',
          documentIdKey: 'pg_DocId',
          approved: false,
          fileName: '',
          filePath: '',
          type: 'single'
        },
        {
          id: '4e',
          name: 'ANY OTHER CERTIFICATES (Please specify)',
          apiKey: null,
          statusKey: null,
          documentIdKey: null,
          approved: false,
          fileName: '',
          filePath: '',
          type: 'single'
        }
      ]
    },
    {
      id: 5,
      name: 'DULY SIGNED OFFER LETTER',
      apiKey: 'offer_letter',
      statusKey: null,
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single'
    },
    {
      id: 6,
      name: 'DULY SIGNED APPOINTMENT LETTER',
      apiKey: 'appointment_letter',
      statusKey: null,
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single'
    },
    {
      id: 7,
      name: 'EXPERIENCE / RELIEVING LETTERS',
      type: 'multiple',
      subItems: [
        {
          id: '7a',
          name: 'EXPERIENCE LETTER',
          apiKey: 'Exp_Letter',
          statusKey: 'Exp_Status',
          documentIdKey: 'Exp_DocId',
          approved: false,
          fileName: '',
          filePath: '',
          type: 'single'
        },
        {
          id: '7b',
          name: 'RELIEVING LETTER',
          apiKey: 'Relieving_Letter',
          statusKey: 'Reliv_Status',
          documentIdKey: 'Reliev_DocId',
          approved: false,
          fileName: '',
          filePath: '',
          type: 'single'
        }
      ]
    },
    {
      id: 8,
      name: 'LAST 3 MONTHS PAYSLIPS & BANK STATMENT',
      apiKey: 'Payslip',
      statusKey: 'PaySlip_Status',
      documentIdKey: 'PaySlip_DocId',
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single'
    },
    {
      id: 9,
      name: 'LATEST PASSPORT SIZE COLOUR PHOTOGRAPHS (8 Nos.)',
      apiKey: 'photos',
      statusKey: null,
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single'
    },
    {
      id: 10,
      name: 'ID & ADDRESS PROOF (PAN & AADHAR CARD)',
      type: 'multiple',
      subItems: [
        {
          id: '10a',
          name: 'PAN CARD',
          apiKey: 'Pan_certi',
          statusKey: 'Pan_Status',
          documentIdKey: 'pan_DocId',
          approved: false,
          fileName: '',
          filePath: '',
          type: 'single'
        },
        {
          id: '10b',
          name: 'AADHAR CARD',
          apiKey: 'Aadhar_certi',
          statusKey: 'Aadhr_Status',
          documentIdKey: 'Aadhar_DocId',
          approved: false,
          fileName: '',
          filePath: '',
          type: 'single'
        }
      ]
    },
    {
      id: 11,
      name: 'JOINING REPORT',
      apiKey: 'joining_report',
      statusKey: null,
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single'
    },
    {
      id: 12,
      name: 'CODE OF CONDUCT WITH ATTESTATION',
      apiKey: 'code_of_conduct',
      statusKey: null,
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single'
    },
    {
      id: 13,
      name: 'PAYMENT OF GRATUITY FORM',
      apiKey: 'gratuity_form',
      statusKey: null,
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single'
    },
    {
      id: 14,
      name: 'MEDICAL ENROLMENT FORM',
      apiKey: 'medical_form',
      statusKey: null,
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single'
    },
    {
      id: 15,
      name: 'FORM-16 (IF APPLICABLE)',
      apiKey: 'form_16',
      statusKey: null,
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single'
    },
    {
      id: 16,
      name: 'NOMINATION AND DECLARATION FORM -2 (EPFO) / ESIC FORM -1',
      apiKey: 'epfo_form',
      statusKey: null,
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single'
    },
    {
      id: 17,
      name: 'DATA PROTECTION AND PRIVACY POLICY',
      apiKey: 'privacy_policy',
      statusKey: null,
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single'
    },
    {
      id: 18,
      name: 'EPFO COMPOSITE DECLARATION FORM 11',
      apiKey: 'epfo_form_11',
      statusKey: null,
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single'
    },
    {
      id: 19,
      name: 'IT DECLARATION FILLED FORM (IF APPLICABLE)',
      apiKey: 'it_declaration',
      statusKey: null,
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single'
    },
    {
      id: 20,
      name: 'MEDICAL REPORTS (CBP, CUE & ABO Typing)',
      apiKey: 'medical_reports',
      statusKey: null,
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single'
    }
  ]);

  const [viewingPdf, setViewingPdf] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({});

  useEffect(() => {
    if (rowData && rowData.fullData) {
      const employeeData = rowData.fullData;

      // Populate form data
      setFormData({
        employeeName: employeeData.name || rowData.employee_name || '',
        empId: employeeData.child_caseid || rowData.CHILD_CASEID || '',
        designation: employeeData.designation || employeeData.DEPT || rowData.department || '',
        doj: employeeData.joiningDate || rowData.joining_date || '',
        department: employeeData.DEPT || rowData.department || '',
        siteLocation: employeeData.location || rowData.location || ''
      });

      const normalizeFileUrl = (path) => {
        if (!path || typeof path !== 'string') return '';
        if (path.startsWith('http')) return path;
        return `${API_BASE_URLss}${path}`;
      };

      // Populate document checklist with API data
      if (employeeData.documents) {
        const updatedChecklist = documentChecklist.map(item => {
          if (item.type === 'single') {
            const apiDoc = employeeData.documents[item.apiKey];
            const status = item.statusKey ? employeeData.documents[item.statusKey] : null;
            const documentId = item.documentIdKey ? employeeData.documents[item.documentIdKey] : null;

            if (apiDoc && typeof apiDoc === 'string' && apiDoc.includes('/storage/')) {
              const filePath = normalizeFileUrl(apiDoc);
              const fileName = filePath.split('/').pop() || 'Document';
              return {
                ...item,
                fileName,
                filePath,
                approved: status === '1' || status === 1,
                status,
                documentId,
                verificationId: employeeData.Verification_Id
              };
            }
            return item;
          }

          if (item.subItems && Array.isArray(item.subItems)) {
            const updatedSubItems = item.subItems.map(subItem => {
              const apiDoc = employeeData?.documents?.[subItem.apiKey];
              const status = subItem.statusKey
                ? employeeData?.documents?.[subItem.statusKey]
                : null;
              const documentId = subItem.documentIdKey
                ? employeeData?.documents?.[subItem.documentIdKey]
                : null;

              if (
                apiDoc &&
                typeof apiDoc === 'string' &&
                apiDoc.includes('/storage/')
              ) {
                const filePath = `${API_BASE_URLss}${apiDoc}`;
                const fileName = apiDoc.split('/').pop() || 'Document';

                return {
                  ...subItem,
                  fileName,
                  filePath,
                  approved: status === '1' || status === 1,
                  status,
                  documentId,
                  verificationId: employeeData.Verification_Id
                };
              }

              return subItem;
            });

            return {
              ...item,
              subItems: updatedSubItems
            };
          }

          return item;
        });

        setDocumentChecklist(updatedChecklist);
      }
    }
  }, [rowData]);

  const StatusBadge = ({ status }) => {
    if (status === '1' || status === 1) {
      return (
        <div className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-green-700 font-medium">Verified</span>
        </div>
      );
    } else if (status === '0' || status === 0) {
      return (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-yellow-600" />
          <span className="text-yellow-700 font-medium">Pending</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-xs">
          <span className="text-gray-500 font-small">Not Uploaded</span>
        </div>
      );
    }
  };

  // ✅ UPDATED: handleFileUpload now sets status to '0' (Pending) immediately and preserves IDs
  const handleFileUpload = (itemId, file, subItemId = null) => {
    if (file) {
      const updatedChecklist = documentChecklist.map(item => {
        if (item.id === itemId) {
          if (subItemId && item.subItems) {
            const updatedSubItems = item.subItems.map(subItem =>
              subItem.id === subItemId
                ? {
                  ...subItem,
                  fileName: file.name,
                  filePath: URL.createObjectURL(file),
                  status: '0', // ✅ Set as Pending
                  approved: false,
                  // Preserve existing IDs if they exist
                  documentId: subItem.documentId || null,
                  verificationId: subItem.verificationId || rowData?.fullData?.Verification_Id || null
                }
                : subItem
            );
            return { ...item, subItems: updatedSubItems };
          }
          return {
            ...item,
            fileName: file.name,
            filePath: URL.createObjectURL(file),
            status: '0', // ✅ Set as Pending
            approved: false,
            // Preserve existing IDs if they exist
            documentId: item.documentId || null,
            verificationId: item.verificationId || rowData?.fullData?.Verification_Id || null
          };
        }
        return item;
      });

      setDocumentChecklist(updatedChecklist);

      const fileKey = subItemId ? `${itemId}-${subItemId}` : itemId;
      setUploadedFiles(prev => ({
        ...prev,
        [fileKey]: file
      }));

      // ✅ Show success message
      Swal.fire({
        icon: 'success',
        title: 'File Uploaded!',
        text: `${file.name} has been uploaded and is pending approval.`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const handleViewDocument = (filePath) => {
    if (filePath) {
      window.open(filePath, '_blank');
    }
  };

  const handleViewPdfInline = (filePath, fileName) => {
    if (filePath) {
      setViewingPdf({ filePath, fileName });
    }
  };

  const handleClosePdfViewer = () => {
    setViewingPdf(null);
  };

  const handleDownloadDocument = (filePath, fileName) => {
    if (filePath) {
      const link = document.createElement('a');
      link.href = filePath;
      link.download = fileName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // ✅ CORRECTED: Handle document approval using the same logic as VerificationDetailsModal
  const handleApproveDocument = async (item, subItem = null) => {
    const targetItem = subItem || item;
    const documentName = targetItem.name;
    const documentId = targetItem.documentId;
    const verificationId = targetItem.verificationId;

    console.log("documentId",documentId)
    console.log("verificationId",verificationId,"jjjjjjjjjjjjjjjjjjjjj",targetItem)
 

    // Check if we have the required IDs
    if (!documentId || !verificationId) {
      await Swal.fire({
        icon: 'warning',
        title: 'Cannot Approve',
        html: `
          <div style="text-align: left; padding: 10px;">
            <p style="margin-bottom: 10px; color: #dc2626;">Document ID or Verification ID is missing.</p>
            <div style="background: #fee2e2; padding: 10px; border-radius: 6px;">
              <p style="font-size: 13px; color: #991b1b; margin: 0;">
                <strong>Missing:</strong>
              </p>
              <ul style="font-size: 12px; color: #991b1b; margin: 5px 0; padding-left: 20px;">
                ${!documentId ? '<li>Document ID is missing</li>' : ''}
                ${!verificationId ? '<li>Verification ID is missing</li>' : ''}
              </ul>
              <p style="font-size: 12px; color: #991b1b; margin-top: 10px;">
                This document may need to be uploaded to the server first before it can be approved.
              </p>
            </div>
          </div>
        `,
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    // Show confirmation dialog - matching the style from VerificationDetailsModal
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to approve ${documentName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'No',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      // Prepare API payload - exact same format as VerificationDetailsModal
      const payload = {
        Verification_Id: verificationId,
        Document_Id: documentId,
      };

      console.log('Approving document with payload:', payload);

      // Make API call using axios - same as VerificationDetailsModal
      const response = await axios.post(
        `${API_BASE_URL}/verify-Doc-Status`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${userToken.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Approval response:', response.data);

      // Update local state to reflect approval - matching VerificationDetailsModal logic
      const updatedChecklist = documentChecklist.map(docItem => {
        if (docItem.id === item.id) {
          if (subItem) {
            // Update subitem
            const updatedSubItems = docItem.subItems.map(sub =>
              sub.id === subItem.id
                ? { ...sub, status: '1', approved: true }
                : sub
            );
            return { ...docItem, subItems: updatedSubItems };
          } else {
            // Update main item
            return { ...docItem, status: '1', approved: true };
          }
        }
        return docItem;
      });

      setDocumentChecklist(updatedChecklist);

      // Show success message - matching VerificationDetailsModal style
      await Swal.fire({
        icon: 'success',
        title: 'Approved!',
        text: 'Document has been approved successfully.',
        timer: 2000,
        showConfirmButton: false,
      });

    } catch (error) {
      console.error('Error approving document:', error);

      // Show error message - matching VerificationDetailsModal style
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong while approving the document.',
      });
    }
  };

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);

  // PDF Generation functions with improved visibility
  const generatePDFPreview = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = 20;

    const checkPageBreak = (requiredSpace) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MY HOME CONSTRUCTIONS PVT. LTD.', pageWidth / 2, 8, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Employee Document Checklist', pageWidth / 2, 14, { align: 'center' });

    yPosition = 26;

    doc.setTextColor(0, 0, 0);
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 7, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOYEE INFORMATION', margin + 3, yPosition + 4.5);

    yPosition += 10;

    doc.setDrawColor(147, 197, 253);
    doc.setLineWidth(0.2);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 32);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');

    doc.text('Employee Name:', margin + 3, yPosition + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.employeeName || 'N/A', margin + 3, yPosition + 9);

    doc.setFont('helvetica', 'bold');
    doc.text('Designation:', margin + 3, yPosition + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.designation || 'N/A', margin + 3, yPosition + 19);

    doc.setFont('helvetica', 'bold');
    doc.text('Department:', margin + 3, yPosition + 25);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.department || 'N/A', margin + 3, yPosition + 29);

    const midX = pageWidth / 2 + 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Employee ID:', midX, yPosition + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.empId || 'N/A', midX, yPosition + 9);

    doc.setFont('helvetica', 'bold');
    doc.text('Date of Joining:', midX, yPosition + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.doj ? new Date(formData.doj).toLocaleDateString() : 'N/A', midX, yPosition + 19);

    doc.setFont('helvetica', 'bold');
    doc.text('Site/Location:', midX, yPosition + 25);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.siteLocation || 'N/A', midX, yPosition + 29);

    yPosition += 38;

    doc.setFillColor(243, 244, 246);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 7, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('DOCUMENT CHECKLIST', margin + 3, yPosition + 4.5);

    yPosition += 10;

    doc.setFillColor(60, 60, 60);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 6, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 6);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('S.No', margin + 3, yPosition + 4);
    doc.text('Document Type', margin + 20, yPosition + 4);
    doc.text('Status', pageWidth - margin - 50, yPosition + 4);

    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    let rowCount = 0;
    const maxWidth = pageWidth - margin - 80;

    documentChecklist.forEach((item) => {
      checkPageBreak(10);

      let status = 'Not Uploaded';
      let statusColor = [100, 100, 100];
      let statusBgColor = [240, 240, 240];

      if (item.status === '1' || item.status === 1) {
        status = '✓ Verified';
        statusColor = [0, 128, 0];
        statusBgColor = [220, 252, 231];
      } else if (item.status === '0' || item.status === 0) {
        status = '⏱ Pending';
        statusColor = [180, 83, 9];
        statusBgColor = [254, 243, 199];
      }

      if (rowCount % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, 5, 'F');
      }

      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, 5);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(item.id.toString(), margin + 3, yPosition + 3);

      doc.setFont('helvetica', 'normal');
      const documentName = doc.splitTextToSize(item.name, maxWidth);
      doc.text(documentName[0], margin + 20, yPosition + 3);

      const statusX = pageWidth - margin - 48;
      const statusY = yPosition - 1;
      doc.setFillColor(...statusBgColor);
      doc.rect(statusX - 2, statusY, 46, 5, 'F');

      doc.setTextColor(...statusColor);
      doc.setFont('helvetica', 'bold');
      doc.text(status, statusX, yPosition + 3);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      yPosition += 5;
      rowCount++;

      if (item.subItems && item.subItems.length > 0) {
        item.subItems.forEach((subItem) => {
          checkPageBreak(10);

          let subStatus = 'Not Uploaded';
          let subStatusColor = [100, 100, 100];
          let subStatusBgColor = [240, 240, 240];

          if (subItem.status === '1' || subItem.status === 1) {
            subStatus = '✓ Verified';
            subStatusColor = [0, 128, 0];
            subStatusBgColor = [220, 252, 231];
          } else if (subItem.status === '0' || subItem.status === 0) {
            subStatus = '⏱ Pending';
            subStatusColor = [180, 83, 9];
            subStatusBgColor = [254, 243, 199];
          }

          if (rowCount % 2 === 0) {
            doc.setFillColor(249, 250, 251);
            doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, 5, 'F');
          }

          doc.setDrawColor(180, 180, 180);
          doc.setLineWidth(0.2);
          doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, 5);

          doc.setTextColor(70, 70, 70);
          doc.setFontSize(6);
          const subDocName = doc.splitTextToSize(`   ${subItem.id.slice(-1)}) ${subItem.name}`, maxWidth);
          doc.text(subDocName[0], margin + 20, yPosition + 3);

          const subStatusX = pageWidth - margin - 48;
          const subStatusY = yPosition - 1;
          doc.setFillColor(...subStatusBgColor);
          doc.rect(subStatusX - 2, subStatusY, 46, 5, 'F');

          doc.setTextColor(...subStatusColor);
          doc.setFont('helvetica', 'bold');
          doc.text(subStatus, subStatusX, yPosition + 3);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);

          yPosition += 5;
          rowCount++;
        });
      }
    });

    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        `Generated on: ${new Date().toLocaleString()}`,
        margin,
        pageHeight - 10
      );
    }

    const pdfBlob = doc.output('bloburl');
    window.open(pdfBlob, '_blank');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = 20;

    const checkPageBreak = (requiredSpace) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MY HOME CONSTRUCTIONS PVT. LTD.', pageWidth / 2, 8, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Employee Document Checklist', pageWidth / 2, 14, { align: 'center' });

    yPosition = 26;

    doc.setTextColor(0, 0, 0);
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 7, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOYEE INFORMATION', margin + 3, yPosition + 4.5);

    yPosition += 10;

    doc.setDrawColor(147, 197, 253);
    doc.setLineWidth(0.2);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 32);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');

    doc.text('Employee Name:', margin + 3, yPosition + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.employeeName || 'N/A', margin + 3, yPosition + 9);

    doc.setFont('helvetica', 'bold');
    doc.text('Designation:', margin + 3, yPosition + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.designation || 'N/A', margin + 3, yPosition + 19);

    doc.setFont('helvetica', 'bold');
    doc.text('Department:', margin + 3, yPosition + 25);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.department || 'N/A', margin + 3, yPosition + 29);

    const midX = pageWidth / 2 + 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Employee ID:', midX, yPosition + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.empId || 'N/A', midX, yPosition + 9);

    doc.setFont('helvetica', 'bold');
    doc.text('Date of Joining:', midX, yPosition + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.doj ? new Date(formData.doj).toLocaleDateString() : 'N/A', midX, yPosition + 19);

    doc.setFont('helvetica', 'bold');
    doc.text('Site/Location:', midX, yPosition + 25);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.siteLocation || 'N/A', midX, yPosition + 29);

    yPosition += 38;

    doc.setFillColor(243, 244, 246);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 7, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('DOCUMENT CHECKLIST', margin + 3, yPosition + 4.5);

    yPosition += 10;

    doc.setFillColor(60, 60, 60);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 6, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 6);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('S.No', margin + 3, yPosition + 4);
    doc.text('Document Type', margin + 20, yPosition + 4);
    doc.text('Status', pageWidth - margin - 50, yPosition + 4);

    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    let rowCount = 0;
    const maxWidth = pageWidth - margin - 80;

    documentChecklist.forEach((item) => {
      checkPageBreak(10);

      let status = 'Not Uploaded';
      let statusColor = [100, 100, 100];
      let statusBgColor = [240, 240, 240];

      if (item.status === '1' || item.status === 1) {
        status = '✓ Verified';
        statusColor = [0, 128, 0];
        statusBgColor = [220, 252, 231];
      } else if (item.status === '0' || item.status === 0) {
        status = '⏱ Pending';
        statusColor = [180, 83, 9];
        statusBgColor = [254, 243, 199];
      }

      if (rowCount % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, 5, 'F');
      }

      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, 5);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(item.id.toString(), margin + 3, yPosition + 3);

      doc.setFont('helvetica', 'normal');
      const documentName = doc.splitTextToSize(item.name, maxWidth);
      doc.text(documentName[0], margin + 20, yPosition + 3);

      const statusX = pageWidth - margin - 48;
      const statusY = yPosition - 1;
      doc.setFillColor(...statusBgColor);
      doc.rect(statusX - 2, statusY, 46, 5, 'F');

      doc.setTextColor(...statusColor);
      doc.setFont('helvetica', 'bold');
      doc.text(status, statusX, yPosition + 3);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      yPosition += 5;
      rowCount++;

      if (item.subItems && item.subItems.length > 0) {
        item.subItems.forEach((subItem) => {
          checkPageBreak(10);

          let subStatus = 'Not Uploaded';
          let subStatusColor = [100, 100, 100];
          let subStatusBgColor = [240, 240, 240];

          if (subItem.status === '1' || subItem.status === 1) {
            subStatus = '✓ Verified';
            subStatusColor = [0, 128, 0];
            subStatusBgColor = [220, 252, 231];
          } else if (subItem.status === '0' || subItem.status === 0) {
            subStatus = '⏱ Pending';
            subStatusColor = [180, 83, 9];
            subStatusBgColor = [254, 243, 199];
          }

          if (rowCount % 2 === 0) {
            doc.setFillColor(249, 250, 251);
            doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, 5, 'F');
          }

          doc.setDrawColor(180, 180, 180);
          doc.setLineWidth(0.2);
          doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, 5);

          doc.setTextColor(70, 70, 70);
          doc.setFontSize(6);
          const subDocName = doc.splitTextToSize(`   ${subItem.id.slice(-1)}) ${subItem.name}`, maxWidth);
          doc.text(subDocName[0], margin + 20, yPosition + 3);

          const subStatusX = pageWidth - margin - 48;
          const subStatusY = yPosition - 1;
          doc.setFillColor(...subStatusBgColor);
          doc.rect(subStatusX - 2, subStatusY, 46, 5, 'F');

          doc.setTextColor(...subStatusColor);
          doc.setFont('helvetica', 'bold');
          doc.text(subStatus, subStatusX, yPosition + 3);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);

          yPosition += 5;
          rowCount++;
        });
      }
    });

    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        `Generated on: ${new Date().toLocaleString()}`,
        margin,
        pageHeight - 10
      );
    }

    doc.save(`Employee_Documents_${formData.empId}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleSaveChanges = async () => {
    // Save logic here
  };

  const PdfViewer = ({ document, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-5/6 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{document.fileName}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="flex-1 p-4">
          <iframe
            src={document.filePath}
            title={document.fileName}
            className="w-full h-full border-0"
          />
        </div>
        <div className="p-4 border-t flex justify-between">
          <button
            onClick={() => handleDownloadDocument(document.filePath, document.fileName)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Download size={18} />
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Building2 size={24} />
            <div>
              <h2 className="text-xl font-bold">MY HOME CONSTRUCTIONS PVT. LTD.</h2>
              <p className="text-blue-100 text-xs mt-0.5">Employee Documents - {formData.empId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Employee Information */}
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-200 p-4 rounded-r-lg">
            <h3 className="font-bold text-blue-900 text-base mb-3">
              EMPLOYEE INFORMATION
            </h3>

     <div className="space-y-2">
    {/* Row 1 */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
        <label className="text-xs font-semibold text-gray-700 md:col-span-4">
          EMP NAME:
        </label>
        <div className="md:col-span-8 bg-white border border-gray-200 rounded px-2 py-1 text-xs">
          {formData.employeeName}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
        <label className="text-xs font-semibold text-gray-700 md:col-span-3">
          EMP ID:
        </label>
        <div className="md:col-span-9 bg-white border border-gray-200 rounded px-2 py-1 text-xs">
          {formData.empId}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
        <label className="text-xs font-semibold text-gray-700 md:col-span-4">
          DESIGNATION:
        </label>
        <div className="md:col-span-8 bg-white border border-gray-200 rounded px-2 py-1 text-xs">
          {formData.designation}
        </div>
      </div>
    </div>

    {/* Row 2 */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
        <label className="text-xs font-semibold text-gray-700 md:col-span-2">
          DOJ:
        </label>
        <div className="md:col-span-10 bg-white border border-gray-200 rounded px-2 py-1 text-xs">
          {formData.doj ? new Date(formData.doj).toLocaleDateString() : 'Not Set'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
        <label className="text-xs font-semibold text-gray-700 md:col-span-4">
          DEPT:
        </label>
        <div className="md:col-span-8 bg-white border border-gray-200 rounded px-2 py-1 text-xs">
          {formData.department}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
        <label className="text-xs font-semibold text-gray-700 md:col-span-4">
          SITE/LOCATION:
        </label>
        <div className="md:col-span-8 bg-white border border-gray-200 rounded px-2 py-1 text-xs">
          {formData.siteLocation || 'N/A'}
        </div>
      </div>
    </div>
  </div>
</div>

          {/* Documents Table */}
          <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-300 w-16">S.No</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-300">DOCUMENT TYPE</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-300">STATUS</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-300">FILE NAME</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-300">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {documentChecklist.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <tr className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-4 py-3 font-semibold text-gray-700 text-sm">{item.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-800 text-sm">
                          <div className="flex items-center gap-2">
                            {item.name}
                            {(item.status === '1' || item.status === 1) && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3">
                          {item.fileName ? (
                            <span className="text-sm text-gray-600 truncate max-w-[200px] inline-block" title={item.fileName}>
                              {item.fileName}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">No file uploaded</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {/* ✅ UPDATED: Show View, Preview, Download, and Approve buttons for uploaded files (status '0' or '1') */}
                            {item.filePath ? (
                              <>
                                <button
                                  onClick={() => handleViewDocument(item.filePath)}
                                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium transition-colors"
                                >
                                  <Eye size={14} />
                                  View
                                </button>
                                <button
                                  onClick={() => handleViewPdfInline(item.filePath, item.fileName)}
                                  className="flex items-center gap-1 px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs font-medium transition-colors"
                                >
                                  <FileText size={14} />
                                  Preview
                                </button>
                                <button
                                  onClick={() => handleDownloadDocument(item.filePath, item.fileName)}
                                  className="flex items-center gap-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-medium transition-colors"
                                >
                                  <Download size={14} />
                                  Download
                                </button>
                                {/* ✅ Show Approve button for pending documents (status '0') */}
                                {(item.status === '0' || item.status === 0) && (
                                  <button
                                    onClick={() => handleApproveDocument(item)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded text-xs font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105 border-2 border-emerald-400"
                                    title="Click to approve this document"
                                  >
                                    <CheckCircle2 size={14} />
                                    Approve
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                <input
                                  type="file"
                                  id={`file-${item.id}`}
                                  onChange={(e) => handleFileUpload(item.id, e.target.files[0])}
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                />
                                <label
                                  htmlFor={`file-${item.id}`}
                                  className="cursor-pointer px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium transition-colors"
                                >
                                  Upload
                                </label>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {item.subItems && item.subItems.map((subItem) => (
                        <tr key={subItem.id} className="border-b hover:bg-blue-50 transition-colors bg-blue-50 bg-opacity-30">
                          <td className="px-4 py-2"></td>
                          <td className="px-8 py-2 text-xs text-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{subItem.id.slice(-1)})</span>
                              {subItem.name}
                              {(subItem.status === '1' || subItem.status === 1) && (
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <StatusBadge status={subItem.status} />
                          </td>
                          <td className="px-4 py-2">
                            {subItem.fileName ? (
                              <span className="text-xs text-gray-600 truncate max-w-[200px] inline-block" title={subItem.fileName}>
                                {subItem.fileName}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">No file uploaded</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              {/* ✅ UPDATED: Show View, Preview, Download, and Approve buttons for uploaded sub-items */}
                              {subItem.filePath ? (
                                <>
                                  <button
                                    onClick={() => handleViewDocument(subItem.filePath)}
                                    className="flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium transition-colors"
                                  >
                                    <Eye size={12} />
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleViewPdfInline(subItem.filePath, subItem.fileName)}
                                    className="flex items-center gap-1 px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs font-medium transition-colors"
                                  >
                                    <FileText size={12} />
                                    Preview
                                  </button>
                                  <button
                                    onClick={() => handleDownloadDocument(subItem.filePath, subItem.fileName)}
                                    className="flex items-center gap-1 px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-medium transition-colors"
                                  >
                                    <Download size={12} />
                                    Download
                                  </button>
                                  {/* ✅ Show Approve button for pending sub-items (status '0') */}
                                  {(subItem.status === '0' || subItem.status === 0) && (
                                    <button
                                      onClick={() => handleApproveDocument(item, subItem)}
                                      className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded text-xs font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105 border-2 border-emerald-400"
                                      title="Click to approve this document"
                                    >
                                      <CheckCircle2 size={12} />
                                      Approve
                                    </button>
                                  )}
                                </>
                              ) : (
                                <>
                                  <input
                                    type="file"
                                    id={`file-${subItem.id}`}
                                    onChange={(e) => handleFileUpload(item.id, e.target.files[0], subItem.id)}
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                  />
                                  <label
                                    htmlFor={`file-${subItem.id}`}
                                    className="cursor-pointer px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium transition-colors"
                                  >
                                    Upload
                                  </label>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          <button
            onClick={generatePDFPreview}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <FileDown size={18} />
            Preview PDF
          </button>
          <button
            onClick={handleSaveChanges}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <CheckCircle2 size={18} />
            Save Changes
          </button>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <PdfViewer document={viewingPdf} onClose={handleClosePdfViewer} />
      )}
    </>
  );
};

export default DocUpload;