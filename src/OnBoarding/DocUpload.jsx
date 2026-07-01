
// import React, { useState, useEffect } from 'react';
// import { X, FileText, Calendar, User, Building2, MapPin, CheckCircle2, Download, Eye, CheckCircle, Clock, XCircle, FileDown, Maximize2, Minimize2, Edit2, Edit } from 'lucide-react';
// import Swal from 'sweetalert2';
// import { API_BASE_URL, API_BASE_URLss } from '../Config/Config';
// import jsPDF from 'jspdf';
// import axios from 'axios';
// import axiosInstance from '../Config/axiosConfig';
// import ReactDOM from 'react-dom'; 
// const DocUpload = ({ rowData, onClose, refreshTable, Report }) => {



 
//   const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
//   const [formData, setFormData] = useState({
//     employeeName: '',
//     empId: '',
//     designation: '',
//     doj: '',
//     department: '',
//     siteLocation: ''
//   });

//   const [uploadedDocsStatus, setUploadedDocsStatus] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [viewingPdf, setViewingPdf] = useState(null);
//   const [uploadedFiles, setUploadedFiles] = useState({});

  
//   useEffect(() => {
//     const styleId = 'swal-z-index-fix';
//     if (!document.getElementById(styleId)) {
//       const style = document.createElement('style');
//       style.id = styleId;
//       style.textContent = `.swal2-container { z-index: 99999 !important; }`;
//       document.head.appendChild(style);
//     }
//     return () => {
//       const existingStyle = document.getElementById(styleId);
//       if (existingStyle) existingStyle.remove();
//     };
//   }, []);

//   const [documentChecklist, setDocumentChecklist] = useState([

//     { id: 1, name: 'RESUME DULY SIGNED', apiKey: 'RESUME_UPLOAD', statusKey: 'RESUME_Status', documentIdKey: 'RESUME_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//     { id: 2, name: 'CANDIDATE APPLICATION FORM', apiKey: 'candidatefile', statusKey: 'candidatefile_Status', documentIdKey: 'candidatefile_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//     { id: 3, name: 'INTERVIEW EVALUATION SHEET', apiKey: 'hrEvaluationFile', statusKey: 'hr_doc_status', documentIdKey: 'hrEvalution_ID', approved: false, fileName: '', filePath: '', type: 'single' },
//     {
//       id: 4, name: 'EDUCATIONALS TESTIMONIALS', type: 'multiple',
//       subItems: [
//         { id: '4a', name: 'SSC (10th Certificate)', apiKey: '10th_certi', statusKey: 'Tenth_Status', documentIdKey: 'Tenth_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//         { id: '4b', name: 'INTERMEDIATE / ITI / DIPLOMA', apiKey: 'Inter_certi', statusKey: 'Inter_Status', documentIdKey: 'Inter_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//         { id: '4c', name: 'GRADUATION', apiKey: 'Gradu_certi', statusKey: 'Grad_Status', documentIdKey: 'grad_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//         { id: '4d', name: 'POST GRADUATION', apiKey: 'PG_FILENAME', statusKey: 'Pg_Status', documentIdKey: 'pg_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//         { id: '4e', name: 'PHD GRADUATION', apiKey: 'PHD_FILENAME', statusKey: 'PHD_Status', documentIdKey: 'PHD_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//         { id: '4f', name: 'ANY OTHER CERTIFICATES (Please specify)', apiKey: 'OTHER_FILENAME', statusKey: 'OTHER_Status', documentIdKey: 'OTHER_DocId', approved: false, fileName: '', filePath: '', type: 'single' }
//       ]
//     },
//     { id: 5, name: 'DULY SIGNED OFFER LETTER', apiKey: 'offer_letter', statusKey: 'offer_letter_Status', documentIdKey: 'offer_letter_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//     { id: 6, name: 'DULY SIGNED APPOINTMENT LETTER', apiKey: 'appointment_letter', statusKey: 'appointment_letter_Status', documentIdKey: 'appointment_letter_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//     {
//       id: 7, name: 'EXPERIENCE / RELIEVING LETTERS', type: 'multiple',
//       subItems: [
//         { id: '7a', name: 'EXPERIENCE LETTER', apiKey: 'exp_letter', statusKey: 'exp_letter_Status', documentIdKey: 'exp_letter_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//         { id: '7b', name: 'RELIEVING LETTER', apiKey: 'relieving_letter', statusKey: 'relieving_letter_Status', documentIdKey: 'relieving_letter_DocId', approved: false, fileName: '', filePath: '', type: 'single' }
//       ]
//     },
//     { id: 8, name: 'LAST 3 MONTHS PAYSLIPS', apiKey: 'payslips', statusKey: 'payslips_Status', documentIdKey: 'payslips_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//     { id: 9, name: 'Bank Statements', apiKey: 'bank_statements', statusKey: 'bank_statements_Status', documentIdKey: 'bank_statements_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//     { id: 10, name: 'LATEST PASSPORT SIZE COLOUR PHOTOGRAPHS (8 Nos.)', apiKey: 'photo', statusKey: 'photo_Status', documentIdKey: 'photo_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//     {
//       id: 11, name: 'ID & ADDRESS PROOF (PAN & AADHAR CARD)', type: 'multiple',
//       subItems: [
//         { id: '11a', name: 'PAN CARD', apiKey: 'Pan_certi', statusKey: 'Pan_Status', documentIdKey: 'pan_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//         { id: '11b', name: 'AADHAR CARD', apiKey: 'Aadhar_certi', statusKey: 'Aadhr_Status', documentIdKey: 'Aadhar_DocId', approved: false, fileName: '', filePath: '', type: 'single' }
//       ]
//     },
//     { id: 12, name: 'JOINING REPORT', apiKey: 'joining_report', statusKey: 'joining_report_Status', documentIdKey: 'joining_report_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//     { id: 13, name: 'CODE OF CONDUCT WITH ATTESTATION', apiKey: 'code_of_conduct', statusKey: 'code_of_conduct_Status', documentIdKey: 'code_of_conduct_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//     { id: 14, name: 'PAYMENT OF GRATUITY FORM', apiKey: 'gratuity_form', statusKey: 'gratuity_form_Status', documentIdKey: 'gratuity_form_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
  
//     { id: 15, name: 'NOMINATION AND DECLARATION FORM -2 (EPFO) / ESIC FORM -1', apiKey: 'epfo_form', statusKey: 'epfo_form_Status', documentIdKey: 'epfo_form_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//     { id: 16, name: 'DATA PROTECTION AND PRIVACY POLICY', apiKey: 'privacy_policy', statusKey: 'privacy_policy_Status', documentIdKey: 'privacy_policy_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//     { id: 17, name: 'EPFO COMPOSITE DECLARATION FORM 11', apiKey: 'epfo_form_11', statusKey: 'epfo_form_11_Status', documentIdKey: 'epfo_form_11_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//     { id: 18, name: 'IT DECLARATION FILLED FORM (IF APPLICABLE)', apiKey: 'it_declaration', statusKey: 'it_declaration_Status', documentIdKey: 'it_declaration_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//     { id: 19, name: 'MEDICAL REPORTS (CBP, CUE & ABO Typing)', apiKey: 'medical_reports', statusKey: 'medical_reports_Status', documentIdKey: 'medical_reports_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//     { id: 20, name: 'UAN Document', apiKey: 'UAN_FILE', statusKey: 'UAN_Status', documentIdKey: 'UAN_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//       // { id: 21, name: 'MEDICAL ENROLMENT FORM', apiKey: 'mediclaim_form', statusKey: 'mediclaim_form_Status', documentIdKey: 'mediclaim_form_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
//       {
//   id: 21,
//   name: 'MEDICAL ENROLMENT FORM',
//   apiKey: 'mediclaim_form',
//   statusKey: 'mediclaim_form_Status',
//   documentIdKey: 'mediclaim_form_DocId',
//   approved: false,
//   fileName: '',
//   filePath: '',
//   type: 'single',
//   showEnrollmentRadio: true,  // Flag to show radio buttons
//   enrollmentStatus: ''
//        // Will store 'yes' or 'no'
// }
//   ]);

//   const handleEditUpload = (item, subItem = null) => {
//   const inputId = subItem ? `file-${item.id}-${subItem.id}` : `file-${item.id}`;
//   const fileInput = document.getElementById(inputId);
  
//   if (fileInput) {
//     fileInput.value = '';
//     fileInput.click();
//   } else {
//     const tempInput = document.createElement('input');
//     tempInput.type = 'file';
//     tempInput.accept = '.pdf,.jpg,.jpeg,.png';
//     tempInput.style.display = 'none';
//     document.body.appendChild(tempInput);
    
//     tempInput.onchange = (e) => {
//       const file = e.target.files[0];
//       if (file) {
//         // Get the existing document ID before uploading new file
//         const latestItem = documentChecklist.find(i => i.id === item.id);
//         const targetItem = subItem ? latestItem?.subItems?.find(s => s.id === subItem.id) : latestItem;
//         const existingDocumentId = targetItem?.documentId; // Preserve existing ID
        
//         // Store the file with existing document ID
//         const fileKey = subItem ? `${item.id}-${subItem.id}` : item.id;
//         setUploadedFiles(prev => ({ 
//           ...prev, 
//           [fileKey]: { 
//             file: file, 
//             existingDocumentId: existingDocumentId  // Save existing ID
//           } 
//         }));
//         setUploadedDocsStatus(prev => ({ ...prev, [fileKey]: true }));
        
//         // Update UI
//         const updatedChecklist = documentChecklist.map(docItem => {
//           if (docItem.id === item.id) {
//             if (subItem && docItem.subItems) {
//               const updatedSubItems = docItem.subItems.map(sub =>
//                 sub.id === subItem.id
//                   ? { 
//                       ...sub, 
//                       fileName: file.name, 
//                       filePath: URL.createObjectURL(file), 
//                       status: '0',
//                       approved: false,
//                       documentId: existingDocumentId  // Keep existing ID
//                     }
//                   : sub
//               );
//               return { ...docItem, subItems: updatedSubItems };
//             }
//             return { 
//               ...docItem, 
//               fileName: file.name, 
//               filePath: URL.createObjectURL(file), 
//               status: '0',
//               approved: false,
//               documentId: existingDocumentId  // Keep existing ID
//             };
//           }
//           return docItem;
//         });
//         setDocumentChecklist(updatedChecklist);
        
//         Swal.fire({ 
//           icon: 'success', 
//           title: 'File Selected!',
//           text: `${file.name} has been selected. Click Submit to save changes.`,
//           timer: 2000, 
//           showConfirmButton: false 
//         });
//       }
//       document.body.removeChild(tempInput);
//     };
    
//     tempInput.click();
//   }
// };



//     const ignoreDocs = Report == 'JoiningReportList'
//   ? ['appointment_letter', 'mediclaim_form']
//   : [];

// const isAllVerified = documentChecklist?.every((item) => {
//   // Ignore appointment_letter only for JoiningReportList
//   if (ignoreDocs.includes(item.apiKey)) return true;

//   // Medical Enrollment Form validation (id: 21)
//   if (item.id === 21) {
//     // Check if MED_STATUS is already 'YES' from API (already filled)
//     if (item.fullData?.MED_STATUS === 'YES') {
//       return true;
//     }
//     // Otherwise, must select Yes/No option
//     if (!item.enrollmentStatus) return false;
//     return true;
//   }

//   // Multiple documents
//   if (item.type === "multiple" && item.subItems) {
//     return item.subItems.every(sub => sub.status === "1");
//   }

//   // Single document
//   return item.status === "1";
// });

//   const handleSubmit = async () => {

//     const formData = new FormData();
//     formData.append('CHILD_CASEID', rowData?.CHILD_CASEID);
      

//      { Report  == "JoiningReportList"  ? formData.append('onBoarding', 3) : formData.append('onBoarding', 4)};

//   const medicalItem = documentChecklist.find(item => item.id === 21);
//  formData.append('MED_STATUS', medicalItem.enrollmentStatus);


//       if (medicalItem && medicalItem.fullData?.MED_STATUS !== 'YES') {
//     // If MED_STATUS is not already YES from API, user must select Yes/No
//     if (!medicalItem.enrollmentStatus) {
//       await Swal.fire({
//         icon: 'warning',
//         title: 'Medical Enrollment Required',
//         text: 'Please select Yes or No for Medical Enrollment Form before submitting.',
//         confirmButtonColor: '#f59e0b'
//       });
//       return;
//     }
    
//     // If user selects "Yes", they need to upload the document
//     if (medicalItem.enrollmentStatus === 'YES') {
//       // Check if the document is uploaded
//       const hasFile = medicalItem.filePath;
//       const isUploaded = medicalItem.status == "1";

      
//       if (!hasFile && !isUploaded) {
//         await Swal.fire({
//           icon: 'error',
//           title: 'Document Required',
//           text: 'Please upload the Medical Enrollment Form document when selecting "Yes".',
//           confirmButtonColor: '#dc2626'
//         });
//         return;
//       }
//     }
//   }

//        const confirmResult = await Swal.fire({
//     title: 'Are you sure?',
//     text: 'Do you want to verify and submit this form?',
//     icon: 'question',
//     showCancelButton: true,
//     confirmButtonText: 'Yes, Submit',
//     cancelButtonText: 'Cancel',
//     confirmButtonColor: '#10b981',
//     cancelButtonColor: '#6b7280',
//     customClass: {
//       container: 'swal2-container-custom'
//     },
//     didOpen: () => {
//       // Set z-index after modal opens
//       const swalContainer = document.querySelector('.swal2-container');
//       if (swalContainer) {
//         swalContainer.style.zIndex = '9999';
//       }
//     }
//   });
  
//   if (!confirmResult.isConfirmed) {
//     return;
//   }

//     const response = await axiosInstance.post(`${API_BASE_URL}/on-board-Store`, formData, {
//       headers: { Authorization: `Bearer ${userToken.token}` },
//     });
//     if (response.data.success) {
//       await Swal.fire({ icon: "success", title: "Success!", text: response?.data?.message || "Form submitted successfully", timer: 2000, showConfirmButton: false });
//       if (refreshTable) await refreshTable();
     
//     }
//     onClose();
//   };



// useEffect(() => {
//   if (rowData && rowData.fullData) {
//     const employeeData = rowData.fullData;
//     setFormData({
//       employeeName: employeeData.name || rowData.employee_name || '',
//       empId: employeeData.child_caseid || rowData.CHILD_CASEID || '',
//       designation:  employeeData.DESIG  ||employeeData.MANPOWER_DESG || rowData.department || '',
//       doj: employeeData.joiningDate || rowData.joining_date || '',
//       department: employeeData.DEPT || rowData.department || '',
//       siteLocation: employeeData.PLANT || rowData.location || ''
//     });
    
//     const normalizeFileUrl = (path) => {
//       if (!path || typeof path !== 'string') return '';
//       if (path.startsWith('http')) return path;
//       return `${API_BASE_URLss}${path}`;
//     };
    
//     // 👇 Complete mapping for all documents
//     const getDocSubmitKey = (apiKey) => {
//       const specialMappings = {
//         // Education Documents
//         '10th_certi': '10TH_FILENAME_documents_submit',
//         'Inter_certi': 'INTER_FILENAME_documents_submit',
//         'Gradu_certi': 'BTECH_FILENAME_documents_submit',
//         'PG_FILENAME': 'PG_FILENAME_documents_submit',
//         'PHD_FILENAME': 'PHD_FILENAME_documents_submit',
//         'OTHER_FILENAME': 'OTHER_FILENAME_documents_submit',
        
//         // ID Proofs
//         'Aadhar_certi': 'AADHAR_PATH_documents_submit',
//         'Pan_certi': 'PAN_PATH_documents_submit',
        
//         // Photos
//         'photo': 'PHOTO_documents_submit',
        
//         // Offer & Appointment
//         'offer_letter': 'offer_letter_documents_submit',
//         'appointment_letter': 'appointment_letter_documents_submit',
        
//         // Experience Letters
//         'exp_letter': 'exp_letter_documents_submit',
//         'relieving_letter': 'relieving_letter_documents_submit',
        
//         // Financial Documents
//         'payslips': 'payslips_documents_submit',
//         'bank_statements': 'bank_statements_documents_submit',
        
//         // Other Documents
//         'RESUME_UPLOAD': 'RESUME_UPLOAD_documents_submit',
//         'candidatefile': 'candidatefile_documents_submit',
//         'UAN_FILE': 'UAN_FILE_documents_submit',
//         'joining_report': 'joining_report_documents_submit',
//         'code_of_conduct': 'code_of_conduct_documents_submit',
//         'gratuity_form': 'gratuity_form_documents_submit',
//         'epfo_form': 'epfo_form_documents_submit',
//         'privacy_policy': 'privacy_policy_documents_submit',
//         'epfo_form_11': 'epfo_form_11_documents_submit',
//         'it_declaration': 'it_declaration_documents_submit',
//         'medical_reports': 'medical_reports_documents_submit',
//         'mediclaim_form': 'mediclaim_form_documents_submit'
//       };
      
//       return specialMappings[apiKey] || `${apiKey}_documents_submit`;
//     };
    
//     if (employeeData.documents || employeeData) {
//       const updatedChecklist = documentChecklist.map(item => {
//         // Handle Medical Enrollment Form (id: 21) - Set enrollmentStatus from MED_STATUS
//         if (item.id === 21) {
//           return {
//             ...item,
//             fullData: employeeData, // Store fullData for access to MED_STATUS
//             enrollmentStatus: employeeData.MED_STATUS === 'YES' ? 'YES' : (employeeData.MED_STATUS === 'NO' ? 'NO' : ''),
//             // Also set file info if document exists
//             fileName: employeeData.documents?.mediclaim_form ? employeeData.documents.mediclaim_form.split('/').pop() : '',
//             filePath: employeeData.documents?.mediclaim_form ? normalizeFileUrl(employeeData.documents.mediclaim_form) : '',
//             status: employeeData.documents?.mediclaim_form_Status || '0'
//           };
//         }
        
//         if (item.type === 'single') {
//           const apiDoc = employeeData.documents[item.apiKey] || employeeData[item.apiKey];
//           const status = item.statusKey ? employeeData.documents[item.statusKey] || employeeData[item.statusKey] : null;
//           const documentId = item.documentIdKey ? employeeData.documents[item.documentIdKey] || employeeData[item.documentIdKey] : null;
          
//           // 👇 Get the correct submit key
//           const docSubmitKey = getDocSubmitKey(item.apiKey);
//           const docSubmitValue = employeeData.documents?.[docSubmitKey] || null;
          
//           console.log('Document:', item.name, 'API Key:', item.apiKey, 'Submit Key:', docSubmitKey, 'Value:', docSubmitValue);
          
//           if (apiDoc) {
//             return { 
//               ...item, 
//               fileName: apiDoc.split('/').pop() || 'Document', 
//               filePath: normalizeFileUrl(apiDoc), 
//               status, 
//               approved: status === '1' || status === 1, 
//               documentId, 
//               verificationId: employeeData.Verification_Id,
//               docSubmitValue
//             };
//           }
//           return { ...item, docSubmitValue };
//         }
        
//         if (item.subItems && Array.isArray(item.subItems)) {
//           const updatedSubItems = item.subItems.map(subItem => {
//             const apiDoc = employeeData?.documents?.[subItem.apiKey];
//             const status = subItem.statusKey ? employeeData?.documents?.[subItem.statusKey] : null;
//             const documentId = subItem.documentIdKey ? employeeData?.documents?.[subItem.documentIdKey] : null;
            
//             // 👇 Use mapping for sub-items
//             const docSubmitKey = getDocSubmitKey(subItem.apiKey);
//             const docSubmitValue = employeeData.documents?.[docSubmitKey] || null;
            
//             if (apiDoc) {
//               return { 
//                 ...subItem, 
//                 fileName: apiDoc.split('/').pop() || 'Document', 
//                 filePath: normalizeFileUrl(apiDoc), 
//                 status, 
//                 approved: status === '1' || status === 1, 
//                 documentId, 
//                 verificationId: employeeData.Verification_Id,
//                 docSubmitValue
//               };
//             }
//             return { ...subItem, docSubmitValue };
//           });
//           return { ...item, subItems: updatedSubItems };
//         }
//         return item;
//       });
//       setDocumentChecklist(updatedChecklist);
//     }
//   }
// }, [rowData]);

//   const StatusBadge = ({ status }) => {
//     if (status === '1' || status === 1) {
//       return (
//         <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: '#dcfce7', borderRadius: '9999px', border: '1px solid #bbf7d0' }}>
//           <CheckCircle size={12} color="#16a34a" />
//           <span style={{ fontSize: '11px', fontWeight: 600, color: '#15803d', letterSpacing: '0.02em' }}>Verified</span>
//         </span>
//       );
//     } else if (status === '0' || status === 0) {
//       return (
//         <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: '#fef9c3', borderRadius: '9999px', border: '1px solid #fde68a' }}>
//           <Clock size={12} color="#b45309" />
//           <span style={{ fontSize: '11px', fontWeight: 600, color: '#92400e', letterSpacing: '0.02em' }}>Pending</span>
//         </span>
//       );
//     } else {
//       return (
//         <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: '#f3f4f6', borderRadius: '9999px', border: '1px solid #e5e7eb' }}>
//           <span style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '0.02em' }}>Not Uploaded</span>
//         </span>
//       );
//     }
//   };

// const handleFileUpload = (itemId, file, subItemId = null) => {
//   if (file) {
//     // For new uploads (no existing document)
//     const updatedChecklist = documentChecklist.map(item => {
//       if (item.id === itemId) {
//         if (subItemId && item.subItems) {
//           const updatedSubItems = item.subItems.map(subItem =>
//             subItem.id === subItemId
//               ? { ...subItem, fileName: file.name, filePath: URL.createObjectURL(file), status: '0', approved: false }
//               : subItem
//           );
//           return { ...item, subItems: updatedSubItems };
//         }
//         return { ...item, fileName: file.name, filePath: URL.createObjectURL(file), status: '0', approved: false };
//       }
//       return item;
//     });
//     setDocumentChecklist(updatedChecklist);

//     const fileKey = subItemId ? `${itemId}-${subItemId}` : itemId;
//     setUploadedFiles(prev => ({ ...prev, [fileKey]: file })); // Store just the file for new uploads
//     setUploadedDocsStatus(prev => ({ ...prev, [fileKey]: true }));
    
//     Swal.fire({ 
//       icon: 'success', 
//       title: 'File Uploaded!',
//       text: `${file.name} has been uploaded. Click Submit to save.`,
//       timer: 2000, 
//       showConfirmButton: false 
//     });
//   }
// };



// const handleSubmitDocument = async (item, subItem = null) => {
//   if (isSubmitting) return;

//   try {
//     setIsSubmitting(true);

//     const childCaseId = rowData?.fullData?.CHILD_CASEID || rowData?.CHILD_CASEID;

//     if (!childCaseId) {
//       await Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: 'CHILD_CASEID is missing.'
//       });
//       return;
//     }

//     const targetItem = subItem || item;
//     const fileKey = subItem ? `${item.id}-${subItem.id}` : item.id;
//     const uploadedData = uploadedFiles[fileKey];
    
//     // Check if it's an edit (has existing document ID) or new upload
//     const isEdit = uploadedData?.existingDocumentId;
//     const uploadedFile = isEdit ? uploadedData.file : uploadedData;
//     const existingDocumentId = uploadedData?.existingDocumentId;

//     if (!uploadedFile) {
//       await Swal.fire({
//         icon: 'warning',
//         title: 'No File',
//         text: `Please upload ${targetItem.name} first.`
//       });
//       return;
//     }

//     Swal.fire({
//       title: 'Submitting...',
//       allowOutsideClick: false,
//       didOpen: () => Swal.showLoading()
//     });

//     const formData = new FormData();
//     formData.append('CHILD_CASEID', childCaseId);
//     formData.append(targetItem.apiKey, uploadedFile);
//     formData.append('onBoarding', 2);
    
//     // CRITICAL: Send the existing document ID to backend for update
//     if (isEdit && existingDocumentId) {
//       formData.append('DOCUMENT_ID', existingDocumentId);
//       formData.append('IS_UPDATE', 'true');
//       console.log('Updating existing document ID:', existingDocumentId);
//     }

//     const response = await axiosInstance.post(
//       `/on-board-Store`,
//       formData,
//       {
//         headers: {
//           Authorization: `Bearer ${userToken.token}`,
//           'Content-Type': 'multipart/form-data'
//         }
//       }
//     );

//     if (response.data.success) {
//       // For edits, ALWAYS use the existing document ID
//       // For new uploads, get from response or use temporary
//       const newDocumentId = isEdit 
//         ? existingDocumentId  // Keep the same ID for updates
//         : (response?.data?.document_id || targetItem.documentId || `temp_${Date.now()}`);
      
//       const verificationId = rowData?.fullData?.Verification_Id || null;

//       console.log('Document saved with ID:', newDocumentId, 'Is Edit:', isEdit);
//         if (refreshTable) {
//         await refreshTable();
//       }

//       // Update local state
//       setDocumentChecklist(prevChecklist => {
//         return prevChecklist.map(docItem => {
//           if (docItem.id === item.id) {
//             if (subItem && docItem.subItems) {
//               return {
//                 ...docItem,
//                 subItems: docItem.subItems.map(sub =>
//                   sub.id === subItem.id
//                     ? {
//                         ...sub,
//                         status: '0',  // Reset to pending after update (needs re-approval)
//                         approved: false,
//                         documentId: newDocumentId,  // Keep same ID for edits
//                         verificationId: verificationId,
//                         fileName: uploadedFile.name,
//                         filePath: URL.createObjectURL(uploadedFile)
//                       }
//                     : sub
//                 )
//               };
//             }
//             return {
//               ...docItem,
//               status: '0',  // Reset to pending after update
//               approved: false,
//               documentId: newDocumentId,  // Keep same ID for edits
//               verificationId: verificationId,
//               fileName: uploadedFile.name,
//               filePath: URL.createObjectURL(uploadedFile)
//             };
//           }
//           return docItem;
//         });
//       });

//       setUploadedDocsStatus(prev => ({
//         ...prev,
//         [fileKey]: 'submitted'
//       }));

//       // Clear the uploaded file from state
//       setUploadedFiles(prev => {
//         const newState = { ...prev };
//         delete newState[fileKey];
//         return newState;
//       });

//       await Swal.fire({
//         icon: 'success',
//         title: 'Success!',
//         text: `${targetItem.name} ${isEdit ? 'updated' : 'submitted'} successfully.`,
//         timer: 2000,
//         showConfirmButton: false
//       });

//       // Optional: Refresh parent table to get latest data
    
//     }
//   } catch (error) {
//     console.error('Error submitting document:', error);
//     Swal.fire({
//       icon: 'error',
//       title: 'Submission Failed',
//       text: error.response?.data?.message || error.message
//     });
//   } finally {
//     setIsSubmitting(false);
//   }
// }; 

  

// const handleViewDocument = (filePath) => {
//   if (!filePath) return;

//   let fullPath = filePath;

//   if (filePath.includes('hrEvaldocument')) {
//     fullPath = filePath.replace(
//       'storage/',
//       'storage/verification_files/'
//     );
//   }

//   window.open(fullPath, '_blank');
// };
//   const handleViewPdfInline = (filePath, fileName) => { if (filePath) setViewingPdf({ filePath, fileName }); };
//   const handleClosePdfViewer = () => setViewingPdf(null);
//   const handleDownloadDocument = (filePath, fileName) => {
//     if (filePath) {
//       const link = document.createElement('a');
//       link.href = filePath;
//       link.download = fileName || 'document.pdf';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };


//   const handleApproveDocument = async (item, subItem = null) => {
//   const latestItem = documentChecklist.find(i => i.id === item.id);

//   const targetItem = subItem
//     ? latestItem?.subItems?.find(s => s.id === subItem.id)
//     : latestItem;

//   if (!targetItem) return;

//   // FIXED VALUES
//   const documentId =
//     targetItem?.documentId ||
//     targetItem?.fullData?.documents?.mediclaim_form_DocId;

//   const verificationId =
//     targetItem?.verificationId ||
//     targetItem?.fullData?.Verification_Id;

//   const documentName = targetItem?.name;


//   const latest =
//     latestItem?.apiKey == "hrEvaluationFile"
//       ? "hr_evolution"
//       : "";

//   // VALIDATION
//   if (!documentId || !verificationId) {
//     await Swal.fire({
//       icon: 'warning',
//       title: 'Cannot Approve',
//       html: `<p>Document ID or Verification ID is missing. Please submit the document first.</p>`,
//       confirmButtonColor: '#f59e0b'
//     });

//     return;
//   }

//   // CONFIRM
//   const result = await Swal.fire({
//     title: 'Are you sure?',
//     text: `Approve ${documentName}?`,
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonColor: '#16a34a',
//     cancelButtonColor: '#dc2626',
//     confirmButtonText: 'Yes, Approve',
//     cancelButtonText: 'No'
//   });

//   if (!result.isConfirmed) return;

//   try {

//     // API CALL
//     const response = await axiosInstance.post(
//       `${API_BASE_URL}/verify-Doc-Status`,
//       {
//         Verification_Id: verificationId,
//         Document_Id: documentId,
//         doc_type: latest
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${userToken.token}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     // UPDATE UI
//     setDocumentChecklist(prev =>
//       prev.map(docItem => {

//         if (docItem.id === item.id) {

//           // SUB ITEMS
//           if (subItem && docItem.subItems) {
//             return {
//               ...docItem,
//               subItems: docItem.subItems.map(sub =>
//                 sub.id === subItem.id
//                   ? {
//                       ...sub,
//                       status: '1',
//                       approved: true
//                     }
//                   : sub
//               )
//             };
//           }

//           // NORMAL ITEMS
//           return {
//             ...docItem,
//             status: '1',
//             approved: true
//           };
//         }

//         return docItem;
//       })
//     );

//     // STATUS UPDATE
//     setUploadedDocsStatus(prev => ({
//       ...prev,
//       [subItem ? subItem.id : item.id]: 'approved'
//     }));

//     // REFRESH TABLE
//     if (refreshTable) {
//       await refreshTable();
//     }

//     // SUCCESS
//     await Swal.fire({
//       icon: 'success',
//       title: 'Approved!',
//       text: 'Document approved successfully.',
//       timer: 2000,
//       showConfirmButton: false
//     });

//   } catch (error) {

//     Swal.fire({
//       icon: 'error',
//       title: 'Error',
//       text:
//         error.response?.data?.message ||
//         'Something went wrong.'
//     });

//   }
// };

// // const handleApproveDocument = async (item, subItem = null) => {
// //   const latestItem = documentChecklist.find(i => i.id === item.id);
// //   const targetItem = subItem ? latestItem?.subItems?.find(s => s.id === subItem.id) : latestItem;


// //   if (!targetItem) return;
// //   const { documentId, verificationId, name: documentName } = targetItem;

// //   console.log("verification_id",verificationId, "akkkkkkkkk","dcooooooooooo",documentId)

// //   const latest = latestItem?.apiKey == "hrEvaluationFile" ? "hr_evolution" : "";
// //   if (!documentId || !verificationId) {
// //     await Swal.fire({ icon: 'warning', title: 'Cannot Approve', html: `<p>Document ID or Verification ID is missing. Please submit the document first.</p>`, confirmButtonColor: '#f59e0b' });
// //     return;
// //   }
// //   const result = await Swal.fire({ title: 'Are you sure?', text: `Approve ${documentName}?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#16a34a', cancelButtonColor: '#dc2626', confirmButtonText: 'Yes, Approve', cancelButtonText: 'No' });
// //   if (!result.isConfirmed) return;
// //   try {
// //     const response = await axiosInstance.post(`${API_BASE_URL}/verify-Doc-Status`, 
// //       { Verification_Id: verificationId, Document_Id: documentId, doc_type: latest }, 
// //       { headers: { Authorization: `Bearer ${userToken.token}`, 
// //       'Content-Type': 'application/json' } });

// //     setDocumentChecklist(prev => prev.map(docItem => {
// //       if (docItem.id === item.id) {
// //         if (subItem && docItem.subItems) return { ...docItem, subItems: docItem.subItems.map(sub => sub.id === subItem.id ? { ...sub, status: '1', approved: true } : sub) };
// //         return { ...docItem, status: '1', approved: true };
// //       }
// //       return docItem;
// //     }));
// //     setUploadedDocsStatus(prev => ({ ...prev, [subItem ? subItem.id : item.id]: 'approved' }));
    
// //     // IMPORTANT: Refresh the parent table data after successful approval
// //     if (refreshTable) {
// //       await refreshTable();
// //     }
    
// //     await Swal.fire({ icon: 'success', title: 'Approved!', text: 'Document approved successfully.', timer: 2000, showConfirmButton: false });
// //   } catch (error) {
// //     Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Something went wrong.' });
// //   }
// // };

//   // ─── Shared icon size for ALL action buttons ───
//   const ICON_SIZE = 13;

//   // ─── Shared button styles ───
//   const btnBase = { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', letterSpacing: '0.02em', transition: 'all 0.15s' };
//   const btnView = { ...btnBase, background: '#eff6ff', color: '#1d4ed8' };
//   const btnPreview = { ...btnBase, background: '#f5f3ff', color: '#6d28d9' };
//    const btnEdit = { ...btnBase, background: '#f5f3ff', color: '#b7b942' };
//   const btnDownload = { ...btnBase, background: '#f0fdf4', color: '#15803d' };
//   const btnSubmit = { ...btnBase, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff' };
//   const btnApprove = { ...btnBase, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff' };
//   const btnUpload = { ...btnBase, background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer' };

// const renderActionButtons = (item, subItem = null, isSubRow = false) => {
//   const latestItem = documentChecklist.find(i => i.id === item.id);
//   const targetItem = subItem ? latestItem?.subItems?.find(s => s.id === subItem.id) : latestItem;
//   const fileKey = subItem ? `${item.id}-${subItem.id}` : item.id;
//   const isUploaded = uploadedDocsStatus[fileKey] === true;
//   const isSubmittedStatus = uploadedDocsStatus[fileKey] === 'submitted';
//   const hasFile = targetItem?.filePath;

//   console.log("hasssssssssss",hasFile);
//   const isApproved = targetItem?.status === '1' || targetItem?.status === 1;
//   const isPending = targetItem?.status === '0' || targetItem?.status === 0;
  
//   // Special handling for Medical Enrollment Form (id: 21)
//   if (item.id === 21) {
//     const medStatus = targetItem?.fullData?.MED_STATUS;

//       const mediclaimStatus =
//     targetItem?.status ||
//     targetItem?.fullData?.documents?.mediclaim_form_Status;

//   const isMediclaimApproved =
//     mediclaimStatus === '1' ||
//     mediclaimStatus === 1;
    
//     // If MED_STATUS is "YES" from API - show view/preview/download only (no edit/submit/approve)
//     if (medStatus === 'YES') {
//     return (
//   <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
    
//     {hasFile && (
//       <>
//         <button
//           style={btnView}
//           onClick={() => handleViewDocument(targetItem.filePath)}
//         >
//           <Eye size={ICON_SIZE} /> View
//         </button>

//         <button
//           style={btnPreview}
//           onClick={() =>
//             handleViewPdfInline(
//               targetItem.filePath,
//               targetItem.fileName
//             )
//           }
//         >
//           <FileText size={ICON_SIZE} /> Preview
//         </button>

//         <button
//           style={btnDownload}
//           onClick={() =>
//             handleDownloadDocument(
//               targetItem.filePath,
//               targetItem.fileName
//             )
//           }
//         >
//           <Download size={ICON_SIZE} /> Download
//         </button>

//         {/* SHOW APPROVE ONLY IF NOT APPROVED */}
//         {!isMediclaimApproved && (
//           <button
//             style={btnApprove}
//             onClick={() => handleApproveDocument(item, subItem)}
//           >
//             <CheckCircle2 size={ICON_SIZE} /> Approve
//           </button>
//         )}

//         {/* SHOW APPROVED TAG */}
//         {isMediclaimApproved && (
//           <span
//             style={{
//               display: 'inline-flex',
//               alignItems: 'center',
//               gap: '4px',
//               padding: '3px 8px',
//               background: '#dcfce7',
//               borderRadius: '9999px',
//               fontSize: '11px',
//               color: '#15803d',
//               fontWeight: 600
//             }}
//           >
//             <CheckCircle size={ICON_SIZE} /> Approved
//           </span>
//         )}
//       </>
//     )}
//   </div>
// );
//     }
    
//     return null; // Return null to show no action buttons for Medical Enrollment Form when not YES
//   }
  
//   // Normal document handling for other documents
//   if (hasFile) {
//     return (
//       <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
//         <button style={btnView} onClick={() => handleViewDocument(targetItem.filePath)}>
//           <Eye size={ICON_SIZE} /> View
//         </button>
//         <button style={btnPreview} onClick={() => handleViewPdfInline(targetItem.filePath, targetItem.fileName)}>
//           <FileText size={ICON_SIZE} /> Preview
//         </button>
   
//         {isPending && (
//           <button style={btnEdit} onClick={() => handleEditUpload(item, subItem)}>
//             <Edit size={ICON_SIZE} /> Edit
//           </button>
//         )}
        
//         <button style={btnDownload} onClick={() => handleDownloadDocument(targetItem.filePath, targetItem.fileName)}>
//           <Download size={ICON_SIZE} /> Download
//         </button>
        
//         {isUploaded && !isSubmittedStatus && (
//           <button style={btnSubmit} onClick={() => handleSubmitDocument(item, subItem)} disabled={isSubmitting}>
//             <CheckCircle2 size={ICON_SIZE} /> {isSubmitting ? 'Saving...' : 'Submit'}
//           </button>
//         )}
        
//         {isPending && !isUploaded && (
//           <button style={btnApprove} onClick={() => handleApproveDocument(item, subItem)}>
//             <CheckCircle2 size={ICON_SIZE} /> Approve
//           </button>
//         )}
        
//         {isApproved && (
//           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: '#dcfce7', borderRadius: '9999px', fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
//             <CheckCircle size={ICON_SIZE} /> Approved
//           </span>
//         )}
//       </div>
//     );
//   }

//   const inputId = subItem ? `file-${item.id}-${subItem.id}` : `file-${item.id}`;
//   return (
//     <div>
//       <input type="file" id={inputId} onChange={(e) => handleFileUpload(item.id, e.target.files[0], subItem?.id)} style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png" />
//       <label htmlFor={inputId} style={btnUpload}>
//         <Download size={ICON_SIZE} style={{ transform: 'rotate(180deg)' }} /> Upload
//       </label>
//     </div>
//   );
// };

// // const renderActionButtons = (item, subItem = null, isSubRow = false) => {
// //   const latestItem = documentChecklist.find(i => i.id === item.id);
// //   const targetItem = subItem ? latestItem?.subItems?.find(s => s.id === subItem.id) : latestItem;
// //   const fileKey = subItem ? `${item.id}-${subItem.id}` : item.id;
// //   const isUploaded = uploadedDocsStatus[fileKey] === true;
// //   const isSubmittedStatus = uploadedDocsStatus[fileKey] === 'submitted';
// //   const hasFile = targetItem?.filePath;
// //   const isApproved = targetItem?.status === '1' || targetItem?.status === 1;
// //   const isPending = targetItem?.status === '0' || targetItem?.status === 0;
  


  
// //   if (hasFile) {
// //     return (
// //       <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
// //         <button style={btnView} onClick={() => handleViewDocument(targetItem.filePath)}>
// //           <Eye size={ICON_SIZE} /> View
// //         </button>
// //         <button style={btnPreview} onClick={() => handleViewPdfInline(targetItem.filePath, targetItem.fileName)}>
// //           <FileText size={ICON_SIZE} /> Preview
// //         </button>
   
// //         {  isPending && (
// //           <button style={btnEdit} onClick={() => handleEditUpload(item, subItem)}>
// //             <Edit size={ICON_SIZE} /> Edit
// //           </button>
// //         )}
        
// //         <button style={btnDownload} onClick={() => handleDownloadDocument(targetItem.filePath, targetItem.fileName)}>
// //           <Download size={ICON_SIZE} /> Download
// //         </button>
        
// //         {isUploaded && !isSubmittedStatus && (
// //           <button style={btnSubmit} onClick={() => handleSubmitDocument(item, subItem)} disabled={isSubmitting}>
// //             <CheckCircle2 size={ICON_SIZE} /> {isSubmitting ? 'Saving...' : 'Submit'}
// //           </button>
// //         )}
        
// //         {isPending && !isUploaded && (
// //           <button style={btnApprove} onClick={() => handleApproveDocument(item, subItem)}>
// //             <CheckCircle2 size={ICON_SIZE} /> Approve
// //           </button>
// //         )}
        
// //         {isApproved && (
// //           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: '#dcfce7', borderRadius: '9999px', fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
// //             <CheckCircle size={ICON_SIZE} /> Approved
// //           </span>
// //         )}
// //       </div>
// //     );
// //   }

// //   const inputId = subItem ? `file-${item.id}-${subItem.id}` : `file-${item.id}`;
// //   return (
// //     <div>
// //       <input type="file" id={inputId} onChange={(e) => handleFileUpload(item.id, e.target.files[0], subItem?.id)} style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png" />
// //       <label htmlFor={inputId} style={btnUpload}>
// //         <Download size={ICON_SIZE} style={{ transform: 'rotate(180deg)' }} /> Upload
// //       </label>
// //     </div>
// //   );
// // };
//   // PDF Generation functions with improved visibility
//   const generatePDFPreview = () => {
//     const doc = new jsPDF();
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const margin = 15;
//     let yPosition = 20;

//     const checkPageBreak = (requiredSpace) => {
//       if (yPosition + requiredSpace > pageHeight - margin) {
//         doc.addPage();
//         yPosition = 20;
//         return true;
//       }
//       return false;
//     };

//     doc.setFillColor(37, 99, 235);
//     doc.rect(0, 0, pageWidth, 18, 'F');
//     doc.setTextColor(255, 255, 255);
//     doc.setFontSize(16);
//     doc.setFont('helvetica', 'bold');
//     doc.text('MY HOME CONSTRUCTIONS PVT. LTD.', pageWidth / 2, 8, { align: 'center' });
//     doc.setFontSize(8);
//     doc.setFont('helvetica', 'normal');
//     doc.text('Employee Document Checklist', pageWidth / 2, 14, { align: 'center' });

//     yPosition = 26;

//     doc.setTextColor(0, 0, 0);
//     doc.setFillColor(243, 244, 246);
//     doc.rect(margin, yPosition, pageWidth - 2 * margin, 7, 'F');
//     doc.setFontSize(11);
//     doc.setFont('helvetica', 'bold');
//     doc.text('EMPLOYEE INFORMATION', margin + 3, yPosition + 4.5);

//     yPosition += 10;

//     doc.setDrawColor(147, 197, 253);
//     doc.setLineWidth(0.2);
//     doc.rect(margin, yPosition, pageWidth - 2 * margin, 32);

//     doc.setFontSize(8);
//     doc.setFont('helvetica', 'bold');

//     doc.text('Employee Name:', margin + 3, yPosition + 5);
//     doc.setFont('helvetica', 'normal');
//     doc.text(formData.employeeName || 'N/A', margin + 3, yPosition + 9);

//     doc.setFont('helvetica', 'bold');
//     doc.text('Designation:', margin + 3, yPosition + 15);
//     doc.setFont('helvetica', 'normal');
//     doc.text(formData.designation || 'N/A', margin + 3, yPosition + 19);

//     doc.setFont('helvetica', 'bold');
//     doc.text('Department:', margin + 3, yPosition + 25);
//     doc.setFont('helvetica', 'normal');
//     doc.text(formData.department || 'N/A', margin + 3, yPosition + 29);

//     const midX = pageWidth / 2 + 5;
//     doc.setFont('helvetica', 'bold');
//     doc.text('Employee ID:', midX, yPosition + 5);
//     doc.setFont('helvetica', 'normal');
//     doc.text(formData.empId || 'N/A', midX, yPosition + 9);

//     doc.setFont('helvetica', 'bold');
//     doc.text('Date of Joining:', midX, yPosition + 15);
//     doc.setFont('helvetica', 'normal');
//    doc.text(
//   formData.doj
//     ? new Date(formData.doj).toLocaleDateString('en-GB')
//     : 'N/A',
//   midX,
//   yPosition + 19
// );

//     doc.setFont('helvetica', 'bold');
//     doc.text('Site/Location:', midX, yPosition + 25);
//     doc.setFont('helvetica', 'normal');
//     doc.text(formData.siteLocation || 'N/A', midX, yPosition + 29);

//     yPosition += 38;

//     doc.setFillColor(243, 244, 246);
//     doc.rect(margin, yPosition, pageWidth - 2 * margin, 7, 'F');
//     doc.setFontSize(11);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(0, 0, 0);
//     doc.text('DOCUMENT CHECKLIST', margin + 3, yPosition + 4.5);

//     yPosition += 10;

//     doc.setFillColor(60, 60, 60);
//     doc.rect(margin, yPosition, pageWidth - 2 * margin, 6, 'F');
//     doc.setDrawColor(0, 0, 0);
//     doc.setLineWidth(0.3);
//     doc.rect(margin, yPosition, pageWidth - 2 * margin, 6);

//     doc.setFontSize(9);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(255, 255, 255);
//     doc.text('S.No', margin + 3, yPosition + 4);
//     doc.text('Document Type', margin + 20, yPosition + 4);
//     doc.text('Status', pageWidth - margin - 50, yPosition + 4);

//     yPosition += 6;

//     doc.setFont('helvetica', 'normal');
//     let rowCount = 0;
//     const maxWidth = pageWidth - margin - 80;

//     documentChecklist.forEach((item) => {
//       checkPageBreak(10);

//       let status = 'Not Uploaded';
//       let statusColor = [100, 100, 100];
//       let statusBgColor = [240, 240, 240];

//       if (item.status === '1' || item.status === 1) {
//         status = '✓ Verified';
//         statusColor = [0, 128, 0];
//         statusBgColor = [220, 252, 231];
//       } else if (item.status === '0' || item.status === 0) {
//         status = '⏱ Pending';
//         statusColor = [180, 83, 9];
//         statusBgColor = [254, 243, 199];
//       }

//       if (rowCount % 2 === 0) {
//         doc.setFillColor(249, 250, 251);
//         doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, 5, 'F');
//       }

//       doc.setDrawColor(180, 180, 180);
//       doc.setLineWidth(0.2);
//       doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, 5);

//       doc.setTextColor(0, 0, 0);
//       doc.setFontSize(7);
//       doc.setFont('helvetica', 'bold');
//       doc.text(item.id.toString(), margin + 3, yPosition + 3);

//       doc.setFont('helvetica', 'normal');
//       const documentName = doc.splitTextToSize(item.name, maxWidth);
//       doc.text(documentName[0], margin + 20, yPosition + 3);

//       const statusX = pageWidth - margin - 48;
//       const statusY = yPosition - 1;
//       doc.setFillColor(...statusBgColor);
//       doc.rect(statusX - 2, statusY, 46, 5, 'F');

//       doc.setTextColor(...statusColor);
//       doc.setFont('helvetica', 'bold');
//       doc.text(status, statusX, yPosition + 3);
//       doc.setFont('helvetica', 'normal');
//       doc.setTextColor(0, 0, 0);

//       yPosition += 5;
//       rowCount++;

//       if (item.subItems && item.subItems.length > 0) {
//         item.subItems.forEach((subItem) => {
//           checkPageBreak(10);

//           let subStatus = 'Not Uploaded';
//           let subStatusColor = [100, 100, 100];
//           let subStatusBgColor = [240, 240, 240];

//           if (subItem.status === '1' || subItem.status === 1) {
//             subStatus = '✓ Verified';
//             subStatusColor = [0, 128, 0];
//             subStatusBgColor = [220, 252, 231];
//           } else if (subItem.status === '0' || subItem.status === 0) {
//             subStatus = '⏱ Pending';
//             subStatusColor = [180, 83, 9];
//             subStatusBgColor = [254, 243, 199];
//           }

//           if (rowCount % 2 === 0) {
//             doc.setFillColor(249, 250, 251);
//             doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, 5, 'F');
//           }

//           doc.setDrawColor(180, 180, 180);
//           doc.setLineWidth(0.2);
//           doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, 5);

//           doc.setTextColor(70, 70, 70);
//           doc.setFontSize(6);
//           const subDocName = doc.splitTextToSize(`   ${subItem.id.slice(-1)}) ${subItem.name}`, maxWidth);
//           doc.text(subDocName[0], margin + 20, yPosition + 3);

//           const subStatusX = pageWidth - margin - 48;
//           const subStatusY = yPosition - 1;
//           doc.setFillColor(...subStatusBgColor);
//           doc.rect(subStatusX - 2, subStatusY, 46, 5, 'F');

//           doc.setTextColor(...subStatusColor);
//           doc.setFont('helvetica', 'bold');
//           doc.text(subStatus, subStatusX, yPosition + 3);
//           doc.setFont('helvetica', 'normal');
//           doc.setTextColor(0, 0, 0);

//           yPosition += 5;
//           rowCount++;
//         });
//       }
//     });

//     const totalPages = doc.internal.pages.length - 1;
//     for (let i = 1; i <= totalPages; i++) {
//       doc.setPage(i);
//       doc.setFontSize(7);
//       doc.setTextColor(128, 128, 128);
//       doc.text(
//         `Page ${i} of ${totalPages}`,
//         pageWidth / 2,
//         pageHeight - 10,
//         { align: 'center' }
//       );
//       doc.text(
//         `Generated on: ${new Date().toLocaleString()}`,
//         margin,
//         pageHeight - 10
//       );
//     }

//     const pdfBlob = doc.output('bloburl');
//     window.open(pdfBlob, '_blank');
//   };

//    const handleDownloadPDF = () => {
//      const doc = new jsPDF();
//      const pageWidth = doc.internal.pageSize.getWidth();
//      const pageHeight = doc.internal.pageSize.getHeight();
//      const margin = 15;
//      let yPosition = 20;
 
//      const checkPageBreak = (requiredSpace) => {
//        if (yPosition + requiredSpace > pageHeight - margin) {
//          doc.addPage();
//          yPosition = 20;
//          return true;
//        }
//        return false;
//      };
 
//      doc.setFillColor(37, 99, 235);
//      doc.rect(0, 0, pageWidth, 18, 'F');
//      doc.setTextColor(255, 255, 255);
//      doc.setFontSize(16);
//      doc.setFont('helvetica', 'bold');
//      doc.text('MY HOME CONSTRUCTIONS PVT. LTD.', pageWidth / 2, 8, { align: 'center' });
//      doc.setFontSize(8);
//      doc.setFont('helvetica', 'normal');
//      doc.text('Employee Document Checklist', pageWidth / 2, 14, { align: 'center' });
 
//      yPosition = 26;
 
//      doc.setTextColor(0, 0, 0);
//      doc.setFillColor(243, 244, 246);
//      doc.rect(margin, yPosition, pageWidth - 2 * margin, 7, 'F');
//      doc.setFontSize(11);
//      doc.setFont('helvetica', 'bold');
//      doc.text('EMPLOYEE INFORMATION', margin + 3, yPosition + 4.5);
 
//      yPosition += 10;
 
//      doc.setDrawColor(147, 197, 253);
//      doc.setLineWidth(0.2);
//      doc.rect(margin, yPosition, pageWidth - 2 * margin, 32);
 
//      doc.setFontSize(8);
//      doc.setFont('helvetica', 'bold');
 
//      doc.text('Employee Name:', margin + 3, yPosition + 5);
//      doc.setFont('helvetica', 'normal');
//      doc.text(formData.employeeName || 'N/A', margin + 3, yPosition + 9);
 
//      doc.setFont('helvetica', 'bold');
//      doc.text('Designation:', margin + 3, yPosition + 15);
//      doc.setFont('helvetica', 'normal');
//      doc.text(formData.designation || rowData.fullData.MANPOWER_DESG, margin + 3, yPosition + 19);
 
//      doc.setFont('helvetica', 'bold');
//      doc.text('Department:', margin + 3, yPosition + 25);
//      doc.setFont('helvetica', 'normal');
//      doc.text(formData.department || 'N/A', margin + 3, yPosition + 29);
 
//      const midX = pageWidth / 2 + 5;
//      doc.setFont('helvetica', 'bold');
//      doc.text('Employee ID:', midX, yPosition + 5);
//      doc.setFont('helvetica', 'normal');
//      doc.text(formData.empId || 'N/A', midX, yPosition + 9);
 
//      doc.setFont('helvetica', 'bold');
//      doc.text('Date of Joining:', midX, yPosition + 15);
//      doc.setFont('helvetica', 'normal');
//      doc.text(formData.doj ? new Date(formData.doj).toLocaleDateString() : 'N/A', midX, yPosition + 19);
 
//      doc.setFont('helvetica', 'bold');
//      doc.text('Site/Location:', midX, yPosition + 25);
//      doc.setFont('helvetica', 'normal');
//      doc.text(formData.siteLocation || 'N/A', midX, yPosition + 29);
 
//      yPosition += 38;
 
//      doc.setFillColor(243, 244, 246);
//      doc.rect(margin, yPosition, pageWidth - 2 * margin, 7, 'F');
//      doc.setFontSize(11);
//      doc.setFont('helvetica', 'bold');
//      doc.setTextColor(0, 0, 0);
//      doc.text('DOCUMENT CHECKLIST', margin + 3, yPosition + 4.5);
 
//      yPosition += 10;
 
//      doc.setFillColor(60, 60, 60);
//      doc.rect(margin, yPosition, pageWidth - 2 * margin, 6, 'F');
//      doc.setDrawColor(0, 0, 0);
//      doc.setLineWidth(0.3);
//      doc.rect(margin, yPosition, pageWidth - 2 * margin, 6);
 
//      doc.setFontSize(9);
//      doc.setFont('helvetica', 'bold');
//      doc.setTextColor(255, 255, 255);
//      doc.text('S.No', margin + 3, yPosition + 4);
//      doc.text('Document Type', margin + 20, yPosition + 4);
//      doc.text('Status', pageWidth - margin - 50, yPosition + 4);
 
//      yPosition += 6;
 
//      doc.setFont('helvetica', 'normal');
//      let rowCount = 0;
//      const maxWidth = pageWidth - margin - 80;
 
//      documentChecklist.forEach((item) => {
//        checkPageBreak(10);
 
//        let status = 'Not Uploaded';
//        let statusColor = [100, 100, 100];
//        let statusBgColor = [240, 240, 240];
 
//        if (item.status === '1' || item.status === 1) {
//          status = '✓ Verified';
//          statusColor = [0, 128, 0];
//          statusBgColor = [220, 252, 231];
//        } else if (item.status === '0' || item.status === 0) {
//          status = '⏱ Pending';
//          statusColor = [180, 83, 9];
//          statusBgColor = [254, 243, 199];
//        }
 
//        if (rowCount % 2 === 0) {
//          doc.setFillColor(249, 250, 251);
//          doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, 5, 'F');
//        }
 
//        doc.setDrawColor(180, 180, 180);
//        doc.setLineWidth(0.2);
//        doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, 5);
 
//        doc.setTextColor(0, 0, 0);
//        doc.setFontSize(7);
//        doc.setFont('helvetica', 'bold');
//        doc.text(item.id.toString(), margin + 3, yPosition + 3);
 
//        doc.setFont('helvetica', 'normal');
//        const documentName = doc.splitTextToSize(item.name, maxWidth);
//        doc.text(documentName[0], margin + 20, yPosition + 3);
 
//        const statusX = pageWidth - margin - 48;
//        const statusY = yPosition - 1;
//        doc.setFillColor(...statusBgColor);
//        doc.rect(statusX - 2, statusY, 46, 5, 'F');
 
//        doc.setTextColor(...statusColor);
//        doc.setFont('helvetica', 'bold');
//        doc.text(status, statusX, yPosition + 3);
//        doc.setFont('helvetica', 'normal');
//        doc.setTextColor(0, 0, 0);
 
//        yPosition += 5;
//        rowCount++;
 
//        if (item.subItems && item.subItems.length > 0) {
//          item.subItems.forEach((subItem) => {
//            checkPageBreak(10);
 
//            let subStatus = 'Not Uploaded';
//            let subStatusColor = [100, 100, 100];
//            let subStatusBgColor = [240, 240, 240];
 
//            if (subItem.status === '1' || subItem.status === 1) {
//              subStatus = '✓ Verified';
//              subStatusColor = [0, 128, 0];
//              subStatusBgColor = [220, 252, 231];
//            } else if (subItem.status === '0' || subItem.status === 0) {
//              subStatus = '⏱ Pending';
//              subStatusColor = [180, 83, 9];
//              subStatusBgColor = [254, 243, 199];
//            }
 
//            if (rowCount % 2 === 0) {
//              doc.setFillColor(249, 250, 251);
//              doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, 5, 'F');
//            }
 
//            doc.setDrawColor(180, 180, 180);
//            doc.setLineWidth(0.2);
//            doc.rect(margin, yPosition - 1, pageWidth - 2 * margin, 5);
 
//            doc.setTextColor(70, 70, 70);
//            doc.setFontSize(6);
//            const subDocName = doc.splitTextToSize(`   ${subItem.id.slice(-1)}) ${subItem.name}`, maxWidth);
//            doc.text(subDocName[0], margin + 20, yPosition + 3);
 
//            const subStatusX = pageWidth - margin - 48;
//            const subStatusY = yPosition - 1;
//            doc.setFillColor(...subStatusBgColor);
//            doc.rect(subStatusX - 2, subStatusY, 46, 5, 'F');
 
//            doc.setTextColor(...subStatusColor);
//            doc.setFont('helvetica', 'bold');
//            doc.text(subStatus, subStatusX, yPosition + 3);
//            doc.setFont('helvetica', 'normal');
//            doc.setTextColor(0, 0, 0);
 
//            yPosition += 5;
//            rowCount++;
//          });
//        }
//      });
 
//      const totalPages = doc.internal.pages.length - 1;
//      for (let i = 1; i <= totalPages; i++) {
//        doc.setPage(i);
//        doc.setFontSize(7);
//        doc.setTextColor(128, 128, 128);
//        doc.text(
//          `Page ${i} of ${totalPages}`,
//          pageWidth / 2,
//          pageHeight - 10,
//          { align: 'center' }
//        );
//        doc.text(
//          `Generated on: ${new Date().toLocaleString()}`,
//          margin,
//          pageHeight - 10
//        );
//      }
 
//      doc.save(`Employee_Documents_${formData.empId}_${new Date().toISOString().split('T')[0]}.pdf`);
//    };

//   // ─── Column width map ───
//   const colWidths = { sno: 52, docType: '30%', status: 120, fileName: '22%', actions: '28%' };


//   // ─── Modal sizing ───
//  const modalStyle = isFullscreen
//   ? { position: 'fixed', inset: 0, borderRadius: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', background: '#fff' } // Remove duplicate zIndex
//   : { position: 'relative', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '92vh', width: '100%', maxWidth: 1400, margin: '0 auto', background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
// const PdfViewer = ({ document: pdfDoc, onClose }) => {
//   const [portalContainer, setPortalContainer] = useState(null);
  
//   useEffect(() => {
//     // Use the global window.document, not the prop
//     if (typeof window !== 'undefined' && window.document) {
//       let container = window.document.getElementById('pdf-viewer-portal');
//       if (!container) {
//         container = window.document.createElement('div');
//         container.id = 'pdf-viewer-portal';
//         window.document.body.appendChild(container);
//       }
//       setPortalContainer(container);
      
//       // Prevent body scroll
//       window.document.body.style.overflow = 'hidden';
      
//       return () => {
//         if (window.document && window.document.body) {
//           window.document.body.style.overflow = '';
//         }
//       };
//     }
//   }, []);
  
//   if (!portalContainer) return null;
  
//   const viewerContent = (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0, 0, 0, 0.85)',
//       zIndex: 999999,
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//     }} onClick={(e) => {
//       if (e.target === e.currentTarget) onClose();
//     }}>
//       <div style={{
//         backgroundColor: '#fff',
//         borderRadius: '12px',
//         width: '90%',
//         maxWidth: '1200px',
//         height: '85%',
//         display: 'flex',
//         flexDirection: 'column',
//         overflow: 'hidden',
//         boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
//       }}>
//         <div style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           padding: '16px 24px',
//           borderBottom: '1px solid #e2e8f0',
//           backgroundColor: '#fff',
//         }}>
//           <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
//             {pdfDoc.fileName}
//           </h3>
//           <button
//             onClick={onClose}
//             style={{
//               background: 'none',
//               border: 'none',
//               fontSize: '28px',
//               cursor: 'pointer',
//               color: '#64748b',
//               padding: '0 8px',
//               borderRadius: '6px',
//             }}
//           >
//             ×
//           </button>
//         </div>
//         <div style={{ flex: 1, padding: '20px', overflow: 'auto', backgroundColor: '#f8fafc' }}>
//           <iframe
//             src={pdfDoc.filePath}
//             title={pdfDoc.fileName}
//             style={{
//               width: '100%',
//               height: '100%',
//               border: 'none',
//               borderRadius: '8px',
//             }}
//           />
//         </div>
//         <div style={{
//           padding: '16px 24px',
//           borderTop: '1px solid #e2e8f0',
//           display: 'flex',
//           justifyContent: 'flex-end',
//           gap: '12px',
//           backgroundColor: '#fff',
//         }}>
      
      
//         </div>
//       </div>
//     </div>
//   );
  
//   return ReactDOM.createPortal(viewerContent, portalContainer);
// };

//   return (
//     <>
//       <div style={modalStyle}>

//         {/* ─── HEADER ─── */}
//         <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)', color: '#fff', padding: '14px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
//             <div style={{ width: 42, height: 42, background: 'rgba(255,255,255,0.18)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(255,255,255,0.3)' }}>
//               <Building2 size={22} color="#fff" />
//             </div>
//             <div>
//               <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{ rowData?.fullData?.ONBOARD_PLANT || formData?.siteLocation}</h2>
//               <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2, letterSpacing: '0.04em' }}>
//                 Employee Onboarding Documents &nbsp;•&nbsp; ID: {formData.empId}
//               </p>
//             </div>
//           </div>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//             {/* Fullscreen Toggle */}
//             <button
//               onClick={() => setIsFullscreen(f => !f)}
//               title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
//               style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'background 0.2s' }}
//               onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
//               onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
//             >
//               {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
//             </button>
//             {/* Close */}
//             <button
//               onClick={onClose}
//               title="Close"
//               style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'background 0.2s' }}
//               onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.5)'}
//               onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
//             >
//               <X size={16} />
//             </button>
//           </div>
//         </div>

//         {/* ─── SCROLLABLE CONTENT ─── */}
//         <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', background: '#f8fafc' }}>

//           {/* Employee Info Card */}
//           <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
//               <User size={15} color="#2563eb" />
//               <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a8a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Employee Information</span>
//             </div>
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 24px' }}>
//               {[
//                 { label: 'Emp Name', value: formData.employeeName },
//                 { label: 'Case ID', value: formData.empId },
//                 { label: 'Designation', value: formData.designation || rowData.fullData.MANPOWER_DESG },
//          {
//   label: 'Date of Joining',
//   value: formData.doj
//     ? new Date(formData.doj).toLocaleDateString('en-GB')
//     : 'Not Set'
// },
//                 { label: 'Department', value: formData.department },
//                 { label: 'Site / Location', value:   rowData?.fullData?.ONBOARD_PLANT || formData.siteLocation || 'N/A' },
//               ].map(({ label, value }) => (
//                 <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
//                   <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', minWidth: 90, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}:</span>
//                   <span style={{ fontSize: 12, color: '#1e293b', fontWeight: 500, background: '#f1f5f9', borderRadius: 5, padding: '2px 8px', flex: 1 }}>{value || '—'}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Documents Table */}
//           <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
//             <div style={{ overflowX: 'auto' }}>
//               <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
//                 <colgroup>
//                   <col style={{ width: colWidths.sno }} />
//                   <col style={{ width: colWidths.docType }} />
//                   <col style={{ width: colWidths.status }} />
//                   <col style={{ width: colWidths.fileName }} />
//                   <col style={{ width: colWidths.actions }} />
//                 </colgroup>
//                 <thead>
//                   <tr style={{ background: 'linear-gradient(to right, #1e3a8a, #1d4ed8)' }}>
//                     {['S.No', 'Document Type', 'Status', 'File Name', 'Actions'].map(h => (
//                       <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '2px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//               {documentChecklist.map((item, index) => (
//   <React.Fragment key={item.id}>
//     {/* Main row */}
//     <tr style={{ background: index % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
//       onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
//       onMouseLeave={e => e.currentTarget.style.background = index % 2 === 0 ? '#fff' : '#f8fafc'}
//     >
//       {/* S.No */}
//       <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 700, color: '#64748b', verticalAlign: 'middle' }}>
//         <span style={{ width: 24, height: 24, background: '#eff6ff', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#1d4ed8' }}>{item.id}</span>
//       </td>
//       {/* Document Type */}
//       <td style={{ padding: '9px 14px', verticalAlign: 'middle' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
//           {item.type === 'multiple' ? (
//             <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', lineHeight: 1.4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{item.name}</span>
//           ) : (
//             <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', lineHeight: 1.4, letterSpacing: '0.02em' }}>{item.name}</span>
//           )}
//           {(item.status === '1' || item.status === 1) && <CheckCircle size={13} color="#16a34a" style={{ flexShrink: 0 }} />}
          
//        {/* Radio buttons for MEDICAL ENROLMENT FORM (id: 21) */}
// {/* {item.id === 21 && (
//   <div style={{ 
//     display: 'inline-flex', 
//     alignItems: 'center', 
//     gap: '12px', 
//     marginLeft: '12px',
//     padding: '4px 12px',
//     background: '#f1f5f9',
//     borderRadius: '20px',
//     border: '1px solid #e2e8f0'
//   }}>
//     <label style={{ 
//       display: 'inline-flex', 
//       alignItems: 'center', 
//       gap: '6px', 
//       fontSize: '11px', 
//       cursor: item.fullData?.MED_STATUS === 'YES' ? 'not-allowed' : 'pointer',
//       fontWeight: 600,
//       opacity: item.fullData?.MED_STATUS === 'YES' ? 0.6 : 1
//     }}>
//       <input
//         type="radio"
//         name={`enrollment_${item.id}`}
//         value="yes"
//         checked={item.enrollmentStatus === 'YES'}
//         disabled={item.fullData?.MED_STATUS === 'YES'}
//         onChange={(e) => {
//           const updatedChecklist = documentChecklist.map(docItem =>
//             docItem.id === item.id
//               ? { ...docItem, enrollmentStatus: 'YES' }
//               : docItem
//           );
//           setDocumentChecklist(updatedChecklist);
//         }}
//         style={{ margin: 0, cursor: 'pointer' }}
//       />
//       <span style={{ color: '#16a34a' }}>Yes</span>
//     </label>
//     <label style={{ 
//       display: 'inline-flex', 
//       alignItems: 'center', 
//       gap: '6px', 
//       fontSize: '11px', 
//       cursor: 'pointer',
//       fontWeight: 600
//     }}>
//       <input
//         type="radio"
//         name={`enrollment_${item.id}`}
//         value="no"
//         checked={item.enrollmentStatus === 'NO'}
//         onChange={(e) => {
//           const updatedChecklist = documentChecklist.map(docItem =>
//             docItem.id === item.id
//               ? { ...docItem, enrollmentStatus: 'NO' }
//               : docItem
//           );
//           setDocumentChecklist(updatedChecklist);
//         }}
//         style={{ margin: 0, cursor: 'pointer' }}
//       />
//       <span style={{ color: '#dc2626' }}>No</span>
//     </label>
//   </div>
// )} */}


// {/* Radio buttons for MEDICAL ENROLMENT FORM (id: 21) - ONLY for JoiningReportList */}
// { item.id === 21 && (
//   <div style={{ 
//     display: 'inline-flex', 
//     alignItems: 'center', 
//     gap: '12px', 
//     marginLeft: '12px',
//     padding: '4px 12px',
//     background: '#f1f5f9',
//     borderRadius: '20px',
//     border: '1px solid #e2e8f0'
//   }}>
//     <label style={{ 
//       display: 'inline-flex', 
//       alignItems: 'center', 
//       gap: '6px', 
//       fontSize: '11px', 
//       cursor: item.fullData?.MED_STATUS === 'YES' ? 'not-allowed' : 'pointer',
//       fontWeight: 600,
//       opacity: item.fullData?.MED_STATUS === 'YES' ? 0.6 : 1
//     }}>
//       <input
//         type="radio"
//         name={`enrollment_${item.id}`}
//         value="yes"
//         checked={item.fullData?.MED_STATUS === 'YES' || item.enrollmentStatus === 'YES'}
//         disabled={item.fullData?.MED_STATUS === 'YES'}
//         onChange={(e) => {
//           const updatedChecklist = documentChecklist.map(docItem =>
//             docItem.id === item.id
//               ? { ...docItem, enrollmentStatus: 'YES' }
//               : docItem
//           );
//           setDocumentChecklist(updatedChecklist);
//         }}
//         style={{ margin: 0, cursor: 'pointer' }}
//       />
//       <span style={{ color: '#16a34a' }}>Yes</span>
//     </label>
//     <label style={{ 
//       display: 'inline-flex', 
//       alignItems: 'center', 
//       gap: '6px', 
//       fontSize: '11px', 
//       cursor: item.fullData?.MED_STATUS === 'YES' ? 'not-allowed' : 'pointer',
//       fontWeight: 600,
//       opacity: item.fullData?.MED_STATUS === 'YES' ? 0.6 : 1
//     }}>
//       <input
//         type="radio"
//         name={`enrollment_${item.id}`}
//         value="no"
//         checked={item.enrollmentStatus === 'NO'}
//         disabled={item.fullData?.MED_STATUS === 'YES'}
//         onChange={(e) => {
//           const updatedChecklist = documentChecklist.map(docItem =>
//             docItem.id === item.id
//               ? { ...docItem, enrollmentStatus: 'NO' }
//               : docItem
//           );
//           setDocumentChecklist(updatedChecklist);
//         }}
//         style={{ margin: 0, cursor: 'pointer' }}
//       />
//       <span style={{ color: '#dc2626' }}>No</span>
//     </label>
//   </div>
// )}
//         </div>
//       </td>
//       {/* Status */}
//       <td style={{ padding: '9px 14px', verticalAlign: 'middle' }}>
//         {item.type !== 'multiple' && <StatusBadge status={item.status} />}
//       </td>
//       {/* File Name */}
//       <td style={{ padding: '9px 14px', verticalAlign: 'middle' }}>
//         {item.type !== 'multiple' && (
//           item.fileName
//             ? <span title={item.fileName} style={{ fontSize: 11, color: '#475569', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{item.fileName}</span>
//             : <span style={{ fontSize: 11, color: '#cbd5e1' }}>No file</span>
//         )}
//       </td>
//       {/* Actions */}
//       <td style={{ padding: '9px 14px', verticalAlign: 'middle' }}>
//         {item.type !== 'multiple' && renderActionButtons(item)}
//       </td>
//     </tr>

//     {/* Sub-rows */}
//     {item.subItems && item.subItems.map((subItem, si) => (
//       <tr key={subItem.id}
//         style={{ background: '#f0f4ff', borderBottom: '1px solid #e8eef8', transition: 'background 0.15s' }}
//         onMouseEnter={e => e.currentTarget.style.background = '#e0ecff'}
//         onMouseLeave={e => e.currentTarget.style.background = '#f0f4ff'}
//       >
//         <td style={{ padding: '7px 14px', verticalAlign: 'middle' }}>
//           <div style={{ width: 2, height: 22, background: '#93c5fd', borderRadius: 2, margin: '0 auto' }} />
//         </td>
//         <td style={{ padding: '7px 14px 7px 24px', verticalAlign: 'middle' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//             <span style={{ fontSize: 10, fontWeight: 700, color: '#93c5fd' }}>{subItem.id.slice(-1)})</span>
//             <span style={{ fontSize: 10.5, color: '#4b5563', fontWeight: 500, lineHeight: 1.4, letterSpacing: '0.02em' }}>{subItem.name}</span>
//             {(subItem.status === '1' || subItem.status === 1) && <CheckCircle size={12} color="#16a34a" style={{ flexShrink: 0 }} />}
//           </div>
//         </td>
//         <td style={{ padding: '7px 14px', verticalAlign: 'middle' }}><StatusBadge status={subItem.status} /></td>
//         <td style={{ padding: '7px 14px', verticalAlign: 'middle' }}>
//           {subItem.fileName
//             ? <span title={subItem.fileName} style={{ fontSize: 11, color: '#475569', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{subItem.fileName}</span>
//             : <span style={{ fontSize: 11, color: '#cbd5e1' }}>No file</span>
//           }
//         </td>
//         <td style={{ padding: '7px 14px', verticalAlign: 'middle' }}>
//           {renderActionButtons(item, subItem, true)}
//         </td>
//       </tr>
//     ))}
//   </React.Fragment>
// ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         {/* ─── FOOTER ─── */}
//         <div style={{ background: '#fff', padding: '14px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, flexShrink: 0 }}>
//           <button onClick={onClose} style={{ ...btnBase, background: '#f1f5f9', color: '#475569', padding: '8px 20px', fontSize: 13 }}>Close</button>
//           <button onClick={generatePDFPreview} style={{ ...btnBase, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', padding: '8px 20px', fontSize: 13 }}>
//             <FileDown size={15} /> Preview PDF
//           </button>
//           <button onClick={handleDownloadPDF} style={{ ...btnBase, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', padding: '8px 20px', fontSize: 13 }}>
//             <Download size={15} /> Download PDF
//           </button>
//           {isAllVerified && (
//             <button onClick={handleSubmit} style={{ ...btnBase, background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', padding: '8px 22px', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}>
//               <CheckCircle size={15} /> Verify &amp; Submit
//             </button>
//           )}
//         </div>
//       </div>

//       {viewingPdf && <PdfViewer document={viewingPdf} onClose={handleClosePdfViewer} />}
//     </>
//   );
// };

// export default DocUpload;



import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, User, Building2, MapPin, CheckCircle2, Download, Eye, CheckCircle, Clock, XCircle, FileDown, Maximize2, Minimize2, Edit2, Edit } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL, API_BASE_URLss } from '../Config/Config';
import jsPDF from 'jspdf';
import axios from 'axios';
import axiosInstance from '../Config/axiosConfig';
import ReactDOM from 'react-dom';

const DocUpload = ({ rowData, onClose, refreshTable, Report }) => {

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  const [formData, setFormData] = useState({
    employeeName: '',
    empId: '',
    designation: '',
    doj: '',
    department: '',
    siteLocation: ''
  });

  const [uploadedDocsStatus, setUploadedDocsStatus] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingPdf, setViewingPdf] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({});

  useEffect(() => {
    const styleId = 'swal-z-index-fix';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `.swal2-container { z-index: 99999 !important; }`;
      document.head.appendChild(style);
    }
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) existingStyle.remove();
    };
  }, []);

  const [documentChecklist, setDocumentChecklist] = useState([
    { id: 1, name: 'RESUME DULY SIGNED', apiKey: 'RESUME_UPLOAD', statusKey: 'RESUME_Status', documentIdKey: 'RESUME_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
    { id: 2, name: 'CANDIDATE APPLICATION FORM', apiKey: 'candidatefile', statusKey: 'candidatefile_Status', documentIdKey: 'candidatefile_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
    { id: 3, name: 'INTERVIEW EVALUATION SHEET', apiKey: 'hrEvaluationFile', statusKey: 'hr_doc_status', documentIdKey: 'hrEvalution_ID', approved: false, fileName: '', filePath: '', type: 'single' },
    {
      id: 4, name: 'EDUCATIONALS TESTIMONIALS', type: 'multiple',
      subItems: [
        { id: '4a', name: 'SSC (10th Certificate)', apiKey: '10th_certi', statusKey: 'Tenth_Status', documentIdKey: 'Tenth_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
        { id: '4b', name: 'INTERMEDIATE / ITI / DIPLOMA', apiKey: 'Inter_certi', statusKey: 'Inter_Status', documentIdKey: 'Inter_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
        { id: '4c', name: 'GRADUATION', apiKey: 'Gradu_certi', statusKey: 'Grad_Status', documentIdKey: 'grad_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
        { id: '4d', name: 'POST GRADUATION', apiKey: 'PG_FILENAME', statusKey: 'Pg_Status', documentIdKey: 'pg_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
        { id: '4e', name: 'PHD GRADUATION', apiKey: 'PHD_FILENAME', statusKey: 'PHD_Status', documentIdKey: 'PHD_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
        { id: '4f', name: 'ANY OTHER CERTIFICATES (Please specify)', apiKey: 'OTHER_FILENAME', statusKey: 'OTHER_Status', documentIdKey: 'OTHER_DocId', approved: false, fileName: '', filePath: '', type: 'single' }
      ]
    },
    { id: 5, name: 'DULY SIGNED OFFER LETTER', apiKey: 'offer_letter', statusKey: 'offer_letter_Status', documentIdKey: 'offer_letter_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
    { id: 6, name: 'DULY SIGNED APPOINTMENT LETTER', apiKey: 'appointment_letter', statusKey: 'appointment_letter_Status', documentIdKey: 'appointment_letter_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
    {
      id: 7, name: 'EXPERIENCE / RELIEVING LETTERS', type: 'multiple',
      subItems: [
        { id: '7a', name: 'EXPERIENCE LETTER', apiKey: 'exp_letter', statusKey: 'exp_letter_Status', documentIdKey: 'exp_letter_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
        { id: '7b', name: 'RELIEVING LETTER', apiKey: 'relieving_letter', statusKey: 'relieving_letter_Status', documentIdKey: 'relieving_letter_DocId', approved: false, fileName: '', filePath: '', type: 'single' }
      ]
    },
    { id: 8, name: 'LAST 3 MONTHS PAYSLIPS', apiKey: 'payslips', statusKey: 'payslips_Status', documentIdKey: 'payslips_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
    { id: 9, name: 'Bank Statements', apiKey: 'bank_statements', statusKey: 'bank_statements_Status', documentIdKey: 'bank_statements_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
    { id: 10, name: 'LATEST PASSPORT SIZE COLOUR PHOTOGRAPHS (8 Nos.)', apiKey: 'photo', statusKey: 'photo_Status', documentIdKey: 'photo_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
    {
      id: 11, name: 'ID & ADDRESS PROOF (PAN & AADHAR CARD)', type: 'multiple',
      subItems: [
        { id: '11a', name: 'PAN CARD', apiKey: 'Pan_certi', statusKey: 'Pan_Status', documentIdKey: 'pan_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
        { id: '11b', name: 'AADHAR CARD', apiKey: 'Aadhar_certi', statusKey: 'Aadhr_Status', documentIdKey: 'Aadhar_DocId', approved: false, fileName: '', filePath: '', type: 'single' }
      ]
    },
    { id: 12, name: 'JOINING REPORT', apiKey: 'joining_report', statusKey: 'joining_report_Status', documentIdKey: 'joining_report_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
    { id: 13, name: 'CODE OF CONDUCT WITH ATTESTATION', apiKey: 'code_of_conduct', statusKey: 'code_of_conduct_Status', documentIdKey: 'code_of_conduct_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
    { id: 14, name: 'PAYMENT OF GRATUITY FORM', apiKey: 'gratuity_form', statusKey: 'gratuity_form_Status', documentIdKey: 'gratuity_form_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
    { id: 15, name: 'NOMINATION AND DECLARATION FORM -2 (EPFO) / ESIC FORM -1', apiKey: 'epfo_form', statusKey: 'epfo_form_Status', documentIdKey: 'epfo_form_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
    { id: 16, name: 'DATA PROTECTION AND PRIVACY POLICY', apiKey: 'privacy_policy', statusKey: 'privacy_policy_Status', documentIdKey: 'privacy_policy_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
    { id: 17, name: 'EPFO COMPOSITE DECLARATION FORM 11', apiKey: 'epfo_form_11', statusKey: 'epfo_form_11_Status', documentIdKey: 'epfo_form_11_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
    { id: 18, name: 'IT DECLARATION FILLED FORM (IF APPLICABLE)', apiKey: 'it_declaration', statusKey: 'it_declaration_Status', documentIdKey: 'it_declaration_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
    { id: 19, name: 'MEDICAL REPORTS (CBP, CUE & ABO Typing)', apiKey: 'medical_reports', statusKey: 'medical_reports_Status', documentIdKey: 'medical_reports_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
    { id: 20, name: 'UAN Document', apiKey: 'UAN_FILE', statusKey: 'UAN_Status', documentIdKey: 'UAN_DocId', approved: false, fileName: '', filePath: '', type: 'single' },
    {
      id: 21,
      name: 'MEDICAL ENROLMENT FORM',
      apiKey: 'mediclaim_form',
      statusKey: 'mediclaim_form_Status',
      documentIdKey: 'mediclaim_form_DocId',
      approved: false,
      fileName: '',
      filePath: '',
      type: 'single',
      showEnrollmentRadio: true,
      enrollmentStatus: ''
    }
  ]);

// ✅ FIXED: handleEditUpload - Use the correct document ID
const handleEditUpload = (item, subItem = null) => {
  const inputId = subItem ? `file-${item.id}-${subItem.id}` : `file-${item.id}`;
  const fileInput = document.getElementById(inputId);
  
  if (fileInput) {
    fileInput.value = '';
    fileInput.click();
  } else {
    const tempInput = document.createElement('input');
    tempInput.type = 'file';
    tempInput.accept = '.pdf,.jpg,.jpeg,.png';
    tempInput.style.display = 'none';
    document.body.appendChild(tempInput);
    
    tempInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // 🔥 Get the latest state to get the current document ID
        const latestItem = documentChecklist.find(i => i.id === item.id);
        const targetItem = subItem 
          ? latestItem?.subItems?.find(s => s.id === subItem.id) 
          : latestItem;
        
        // 🔥 Use the document ID from the current state
        const existingDocumentId = targetItem?.documentId;
        
        console.log('📝 Editing document, existing ID:', existingDocumentId);
        
        const fileKey = subItem ? `${item.id}-${subItem.id}` : item.id;
        setUploadedFiles(prev => ({ 
          ...prev, 
          [fileKey]: { 
            file: file, 
            existingDocumentId: existingDocumentId // ✅ Pass the correct ID
          } 
        }));
        setUploadedDocsStatus(prev => ({ ...prev, [fileKey]: true }));
        
        // Update UI with the existing document ID preserved
        const updatedChecklist = documentChecklist.map(docItem => {
          if (docItem.id === item.id) {
            if (subItem && docItem.subItems) {
              const updatedSubItems = docItem.subItems.map(sub =>
                sub.id === subItem.id
                  ? { 
                      ...sub, 
                      fileName: file.name, 
                      filePath: URL.createObjectURL(file), 
                      status: '0',
                      approved: false,
                      documentId: existingDocumentId // ✅ Keep the correct ID
                    }
                  : sub
              );
              return { ...docItem, subItems: updatedSubItems };
            }
            return { 
              ...docItem, 
              fileName: file.name, 
              filePath: URL.createObjectURL(file), 
              status: '0',
              approved: false,
              documentId: existingDocumentId // ✅ Keep the correct ID
            };
          }
          return docItem;
        });
        setDocumentChecklist(updatedChecklist);
        
        Swal.fire({ 
          icon: 'success', 
          title: 'File Selected!',
          text: `${file.name} has been selected. Click Submit to save changes.`,
          timer: 2000, 
          showConfirmButton: false 
        });
      }
      document.body.removeChild(tempInput);
    };
    
    tempInput.click();
  }
};

  const ignoreDocs = Report == 'JoiningReportList'
    ? ['appointment_letter', 'mediclaim_form']
    : [];

  const isAllVerified = documentChecklist?.every((item) => {
    if (ignoreDocs.includes(item.apiKey)) return true;

    if (item.id === 21) {
      if (item.fullData?.MED_STATUS === 'YES') {
        return true;
      }
      if (!item.enrollmentStatus) return false;
      return true;
    }

    if (item.type === "multiple" && item.subItems) {
      return item.subItems.every(sub => sub.status === "1");
    }

    return item.status === "1";
  });

const handleSubmitDocument = async (item, subItem = null) => {
  if (isSubmitting) return;

  try {
    setIsSubmitting(true);

    const childCaseId = rowData?.fullData?.CHILD_CASEID || rowData?.CHILD_CASEID;

    if (!childCaseId) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'CHILD_CASEID is missing.'
      });
      return;
    }

    const targetItem = subItem || item;
    const fileKey = subItem ? `${item.id}-${subItem.id}` : item.id;
    const uploadedData = uploadedFiles[fileKey];

    const uploadedFile = uploadedData?.file || uploadedData;
    const existingDocumentId = uploadedData?.existingDocumentId;

    if (!uploadedFile) {
      await Swal.fire({
        icon: 'warning',
        title: 'No File',
        text: `Please upload ${targetItem.name} first.`
      });
      return;
    }

    Swal.fire({
      title: 'Submitting...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const formData = new FormData();
    formData.append('CHILD_CASEID', childCaseId);
    formData.append(targetItem.apiKey, uploadedFile);
    formData.append('onBoarding', 2);

    if (existingDocumentId) {
      formData.append('DOCUMENT_ID', existingDocumentId);
      formData.append('IS_UPDATE', 'true');
      console.log('🔄 Updating existing document ID:', existingDocumentId);
    } else {
      console.log('📄 Creating new document');
    }

    const response = await axiosInstance.post(
      `/on-board-Store`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${userToken.token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response.data.success) {
    

            const fieldMapping = {
        '10th_certi':   '10TH_FILENAME',
        'Inter_certi':  'INTER_FILENAME',
        'Gradu_certi':  'BTECH_FILENAME',
        'Pan_certi':    'PAN_PATH',
        'Aadhar_certi': 'AADHAR_PATH',
        'photo':        'PHOTO',
      };
      const dbFieldName = fieldMapping[targetItem.apiKey] || targetItem.apiKey;

      // Backend returns document_ids keyed by dbFieldName
      const documentIds = response?.data?.document_ids || {};
      const docIdFromResponse = documentIds[dbFieldName];

      const finalDocumentId = docIdFromResponse || existingDocumentId || response?.data?.document_id;


    const verificationId = rowData?.fullData?.Verification_Id || null;

      // console.log('✅ Document saved with ID:', finalDocumentId, 'Is Edit:', !!existingDocumentId);
      console.log('Response data:', response.data);

      setDocumentChecklist(prevChecklist => {
        return prevChecklist.map(docItem => {
          if (docItem.id === item.id) {
            if (subItem && docItem.subItems) {
              return {
                ...docItem,
                subItems: docItem.subItems.map(sub =>
                  sub.id === subItem.id
                    ? {
                        ...sub,
                        status: '0',
                        approved: false,
                        documentId: finalDocumentId,
                        verificationId: verificationId,
                        fileName: uploadedFile.name,
                        filePath: URL.createObjectURL(uploadedFile)
                      }
                    : sub
                )
              };
            }
            return {
              ...docItem,
              status: '0',
              approved: false,
              documentId: finalDocumentId,
              verificationId: verificationId,
              fileName: uploadedFile.name,
              filePath: URL.createObjectURL(uploadedFile)
            };
          }
          return docItem;
        });
      });

      setUploadedFiles(prev => {
        const newState = { ...prev };
        if (newState[fileKey]) {
          newState[fileKey] = {
            ...newState[fileKey],
            existingDocumentId: finalDocumentId
          };
        }
        return newState;
      });

      setUploadedDocsStatus(prev => ({
        ...prev,
        [fileKey]: 'submitted'
      }));

      if (refreshTable) {
        await refreshTable();
      }

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `${targetItem.name} ${existingDocumentId ? 'updated' : 'submitted'} successfully. Document ID: ${finalDocumentId}`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  } catch (error) {
    console.error('Error submitting document:', error);
    Swal.fire({
      icon: 'error',
      title: 'Submission Failed',
      text: error.response?.data?.message || error.message
    });
  } finally {
    setIsSubmitting(false);
  }
};

// ✅ FIXED: handleApproveDocument - Use the correct document ID from latest state
const handleApproveDocument = async (item, subItem = null) => {
  // 🔥 Get the latest state to ensure we have the most current document ID
  const latestItem = documentChecklist.find(i => i.id === item.id);
  
  const targetItem = subItem
    ? latestItem?.subItems?.find(s => s.id === subItem.id)
    : latestItem;

  if (!targetItem) {
    console.error('❌ Target item not found');
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Document not found in current state.'
    });
    return;
  }

  // 🔥 Get the document ID from the LATEST state
  const documentId = targetItem?.documentId;
  const verificationId = targetItem?.verificationId || rowData?.fullData?.Verification_Id;
  const documentName = targetItem?.name;

  console.log('🔍 ===== APPROVE DOCUMENT DEBUG =====');
  console.log('Item ID:', item.id);
  console.log('SubItem:', subItem);
  console.log('Document ID from state:', documentId);
  console.log('Verification ID:', verificationId);
  console.log('Document Name:', documentName);
  console.log('Full Target Item:', targetItem);
  console.log('🔍 ===== END DEBUG =====');

  // Validation
  if (!documentId || !verificationId) {
    await Swal.fire({
      icon: 'warning',
      title: 'Cannot Approve',
      html: `
        <p>Document ID or Verification ID is missing. Please submit the document first.</p>
        <p style="font-size:12px;color:#666;margin-top:8px;">
          Document ID: ${documentId || '❌ Missing'}<br/>
          Verification ID: ${verificationId || '❌ Missing'}
        </p>
      `,
      confirmButtonColor: '#f59e0b'
    });
    return;
  }

  // Confirmation
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Approve ${documentName}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#16a34a',
    cancelButtonColor: '#dc2626',
    confirmButtonText: 'Yes, Approve',
    cancelButtonText: 'No'
  });

  if (!result.isConfirmed) return;

  try {
    const latest = latestItem?.apiKey === "hrEvaluationFile" ? "hr_evolution" : "";

    // 🔥 Send the CORRECT document ID
    const payload = {
      Verification_Id: verificationId,
      Document_Id: documentId, // ✅ This should be the correct ID (e.g., 5388)
      doc_type: latest
    };

    console.log('📤 Sending approval payload:', payload);

    const response = await axiosInstance.post(
      `${API_BASE_URL}/verify-Doc-Status`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${userToken.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Approval Response:', response.data);

    // Update UI
    setDocumentChecklist(prev =>
      prev.map(docItem => {
        if (docItem.id === item.id) {
          if (subItem && docItem.subItems) {
            return {
              ...docItem,
              subItems: docItem.subItems.map(sub =>
                sub.id === subItem.id
                  ? {
                      ...sub,
                      status: '1',
                      approved: true
                    }
                  : sub
              )
            };
          }
          return {
            ...docItem,
            status: '1',
            approved: true
          };
        }
        return docItem;
      })
    );

    setUploadedDocsStatus(prev => ({
      ...prev,
      [subItem ? subItem.id : item.id]: 'approved'
    }));

    if (refreshTable) {
      await refreshTable();
    }

    await Swal.fire({
      icon: 'success',
      title: 'Approved!',
      text: `Document "${documentName}" approved successfully. (ID: ${documentId})`,
      timer: 2000,
      showConfirmButton: false
    });

  } catch (error) {
    console.error('❌ Approval Error:', error);
    console.error('Error details:', error.response?.data);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || error.message || 'Something went wrong.'
    });
  }
};

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('CHILD_CASEID', rowData?.CHILD_CASEID);
    
    { Report == "JoiningReportList" ? formData.append('onBoarding', 3) : formData.append('onBoarding', 4) };

    const medicalItem = documentChecklist.find(item => item.id === 21);
    formData.append('MED_STATUS', medicalItem.enrollmentStatus);

    if (medicalItem && medicalItem.fullData?.MED_STATUS !== 'YES') {
      if (!medicalItem.enrollmentStatus) {
        await Swal.fire({
          icon: 'warning',
          title: 'Medical Enrollment Required',
          text: 'Please select Yes or No for Medical Enrollment Form before submitting.',
          confirmButtonColor: '#f59e0b'
        });
        return;
      }
      
      if (medicalItem.enrollmentStatus === 'YES') {
        const hasFile = medicalItem.filePath;
        const isUploaded = medicalItem.status == "1";
        
        if (!hasFile && !isUploaded) {
          await Swal.fire({
            icon: 'error',
            title: 'Document Required',
            text: 'Please upload the Medical Enrollment Form document when selecting "Yes".',
            confirmButtonColor: '#dc2626'
          });
          return;
        }
      }
    }

    const confirmResult = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to verify and submit this form?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Submit',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      customClass: {
        container: 'swal2-container-custom'
      },
      didOpen: () => {
        const swalContainer = document.querySelector('.swal2-container');
        if (swalContainer) {
          swalContainer.style.zIndex = '9999';
        }
      }
    });
    
    if (!confirmResult.isConfirmed) {
      return;
    }

    const response = await axiosInstance.post(`${API_BASE_URL}/on-board-Store`, formData, {
      headers: { Authorization: `Bearer ${userToken.token}` },
    });
    if (response.data.success) {
      await Swal.fire({ icon: "success", title: "Success!", text: response?.data?.message || "Form submitted successfully", timer: 2000, showConfirmButton: false });
      if (refreshTable) await refreshTable();
    }
    onClose();
  };

  useEffect(() => {
    if (rowData && rowData.fullData) {
      const employeeData = rowData.fullData;
      setFormData({
        employeeName: employeeData.name || rowData.employee_name || '',
        empId: employeeData.child_caseid || rowData.CHILD_CASEID || '',
        designation: employeeData.DESIG || employeeData.MANPOWER_DESG || rowData.department || '',
        doj: employeeData.joiningDate || rowData.joining_date || '',
        department: employeeData.DEPT || rowData.department || '',
        siteLocation: employeeData.PLANT || rowData.location || ''
      });
      
      const normalizeFileUrl = (path) => {
        if (!path || typeof path !== 'string') return '';
        if (path.startsWith('http')) return path;
        return `${API_BASE_URLss}${path}`;
      };
      
      const getDocSubmitKey = (apiKey) => {
        const specialMappings = {
          '10th_certi': '10TH_FILENAME_documents_submit',
          'Inter_certi': 'INTER_FILENAME_documents_submit',
          'Gradu_certi': 'BTECH_FILENAME_documents_submit',
          'PG_FILENAME': 'PG_FILENAME_documents_submit',
          'PHD_FILENAME': 'PHD_FILENAME_documents_submit',
          'OTHER_FILENAME': 'OTHER_FILENAME_documents_submit',
          'Aadhar_certi': 'AADHAR_PATH_documents_submit',
          'Pan_certi': 'PAN_PATH_documents_submit',
          'photo': 'PHOTO_documents_submit',
          'offer_letter': 'offer_letter_documents_submit',
          'appointment_letter': 'appointment_letter_documents_submit',
          'exp_letter': 'exp_letter_documents_submit',
          'relieving_letter': 'relieving_letter_documents_submit',
          'payslips': 'payslips_documents_submit',
          'bank_statements': 'bank_statements_documents_submit',
          'RESUME_UPLOAD': 'RESUME_UPLOAD_documents_submit',
          'candidatefile': 'candidatefile_documents_submit',
          'UAN_FILE': 'UAN_FILE_documents_submit',
          'joining_report': 'joining_report_documents_submit',
          'code_of_conduct': 'code_of_conduct_documents_submit',
          'gratuity_form': 'gratuity_form_documents_submit',
          'epfo_form': 'epfo_form_documents_submit',
          'privacy_policy': 'privacy_policy_documents_submit',
          'epfo_form_11': 'epfo_form_11_documents_submit',
          'it_declaration': 'it_declaration_documents_submit',
          'medical_reports': 'medical_reports_documents_submit',
          'mediclaim_form': 'mediclaim_form_documents_submit'
        };
        return specialMappings[apiKey] || `${apiKey}_documents_submit`;
      };
      
      if (employeeData.documents || employeeData) {
        const updatedChecklist = documentChecklist.map(item => {
          if (item.id === 21) {
            return {
              ...item,
              fullData: employeeData,
              enrollmentStatus: employeeData.MED_STATUS === 'YES' ? 'YES' : (employeeData.MED_STATUS === 'NO' ? 'NO' : ''),
              fileName: employeeData.documents?.mediclaim_form ? employeeData.documents.mediclaim_form.split('/').pop() : '',
              filePath: employeeData.documents?.mediclaim_form ? normalizeFileUrl(employeeData.documents.mediclaim_form) : '',
              status: employeeData.documents?.mediclaim_form_Status || '0',
              documentId:employeeData.documents?.mediclaim_form_DocId || null,
              verificationId: employeeData.verification_Id || null
            };
          }
          
          if (item.type === 'single') {
            const apiDoc = employeeData.documents[item.apiKey] || employeeData[item.apiKey];
            const status = item.statusKey ? employeeData.documents[item.statusKey] || employeeData[item.statusKey] : null;
            const documentId = item.documentIdKey ? employeeData.documents[item.documentIdKey] || employeeData[item.documentIdKey] : null;
            
            const docSubmitKey = getDocSubmitKey(item.apiKey);
            const docSubmitValue = employeeData.documents?.[docSubmitKey] || null;
            
            if (apiDoc) {
              return { 
                ...item, 
                fileName: apiDoc.split('/').pop() || 'Document', 
                filePath: normalizeFileUrl(apiDoc), 
                status, 
                approved: status === '1' || status === 1, 
                documentId, 
                verificationId: employeeData.Verification_Id,
                docSubmitValue
              };
            }
            return { ...item, docSubmitValue };
          }
          
          if (item.subItems && Array.isArray(item.subItems)) {
            const updatedSubItems = item.subItems.map(subItem => {
              const apiDoc = employeeData?.documents?.[subItem.apiKey];
              const status = subItem.statusKey ? employeeData?.documents?.[subItem.statusKey] : null;
              const documentId = subItem.documentIdKey ? employeeData?.documents?.[subItem.documentIdKey] : null;
              
              const docSubmitKey = getDocSubmitKey(subItem.apiKey);
              const docSubmitValue = employeeData.documents?.[docSubmitKey] || null;
              
              if (apiDoc) {
                return { 
                  ...subItem, 
                  fileName: apiDoc.split('/').pop() || 'Document', 
                  filePath: normalizeFileUrl(apiDoc), 
                  status, 
                  approved: status === '1' || status === 1, 
                  documentId, 
                  verificationId: employeeData.Verification_Id,
                  docSubmitValue
                };
              }
              return { ...subItem, docSubmitValue };
            });
            return { ...item, subItems: updatedSubItems };
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
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: '#dcfce7', borderRadius: '9999px', border: '1px solid #bbf7d0' }}>
          <CheckCircle size={12} color="#16a34a" />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#15803d', letterSpacing: '0.02em' }}>Verified</span>
        </span>
      );
    } else if (status === '0' || status === 0) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: '#fef9c3', borderRadius: '9999px', border: '1px solid #fde68a' }}>
          <Clock size={12} color="#b45309" />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#92400e', letterSpacing: '0.02em' }}>Pending</span>
        </span>
      );
    } else {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: '#f3f4f6', borderRadius: '9999px', border: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '0.02em' }}>Not Uploaded</span>
        </span>
      );
    }
  };

  const handleFileUpload = (itemId, file, subItemId = null) => {
    if (file) {
      const updatedChecklist = documentChecklist.map(item => {
        if (item.id === itemId) {
          if (subItemId && item.subItems) {
            const updatedSubItems = item.subItems.map(subItem =>
              subItem.id === subItemId
                ? { ...subItem, fileName: file.name, filePath: URL.createObjectURL(file), status: '0', approved: false }
                : subItem
            );
            return { ...item, subItems: updatedSubItems };
          }
          return { ...item, fileName: file.name, filePath: URL.createObjectURL(file), status: '0', approved: false };
        }
        return item;
      });
      setDocumentChecklist(updatedChecklist);

      const fileKey = subItemId ? `${itemId}-${subItemId}` : itemId;
      setUploadedFiles(prev => ({ ...prev, [fileKey]: file }));
      setUploadedDocsStatus(prev => ({ ...prev, [fileKey]: true }));
      
      Swal.fire({ 
        icon: 'success', 
        title: 'File Uploaded!',
        text: `${file.name} has been uploaded. Click Submit to save.`,
        timer: 2000, 
        showConfirmButton: false 
      });
    }
  };

  const handleViewDocument = (filePath) => {
    if (!filePath) return;
    let fullPath = filePath;
    if (filePath.includes('hrEvaldocument')) {
      fullPath = filePath.replace('storage/', 'storage/verification_files/');
    }
    window.open(fullPath, '_blank');
  };

  const handleViewPdfInline = (filePath, fileName) => { 
    if (filePath) setViewingPdf({ filePath, fileName }); 
  };
  
  const handleClosePdfViewer = () => setViewingPdf(null);
  
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

  // ─── Shared icon size for ALL action buttons ───
  const ICON_SIZE = 13;

  // ─── Shared button styles ───
  const btnBase = { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', letterSpacing: '0.02em', transition: 'all 0.15s' };
  const btnView = { ...btnBase, background: '#eff6ff', color: '#1d4ed8' };
  const btnPreview = { ...btnBase, background: '#f5f3ff', color: '#6d28d9' };
  const btnEdit = { ...btnBase, background: '#f5f3ff', color: '#b7b942' };
  const btnDownload = { ...btnBase, background: '#f0fdf4', color: '#15803d' };
  const btnSubmit = { ...btnBase, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff' };
  const btnApprove = { ...btnBase, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff' };
  const btnUpload = { ...btnBase, background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer' };

  const renderActionButtons = (item, subItem = null, isSubRow = false) => {
    const latestItem = documentChecklist.find(i => i.id === item.id);
    const targetItem = subItem ? latestItem?.subItems?.find(s => s.id === subItem.id) : latestItem;


    const fileKey = subItem ? `${item.id}-${subItem.id}` : item.id;
    const isUploaded = uploadedDocsStatus[fileKey] === true;
    const isSubmittedStatus = uploadedDocsStatus[fileKey] === 'submitted';
    const hasFile = targetItem?.filePath;
    const isApproved = targetItem?.status === '1' || targetItem?.status === 1;
    const isPending = targetItem?.status === '0' || targetItem?.status === 0;
    
    // Special handling for Medical Enrollment Form (id: 21)
    if (item.id === 21) {
      const medStatus = targetItem?.fullData?.MED_STATUS;
      const mediclaimStatus = targetItem?.status || targetItem?.fullData?.documents?.mediclaim_form_Status;
      const isMediclaimApproved = mediclaimStatus === '1' || mediclaimStatus === 1;
      
      if (medStatus === 'YES') {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
            {hasFile && (
              <>
                <button style={btnView} onClick={() => handleViewDocument(targetItem.filePath)}>
                  <Eye size={ICON_SIZE} /> View
                </button>
                <button style={btnPreview} onClick={() => handleViewPdfInline(targetItem.filePath, targetItem.fileName)}>
                  <FileText size={ICON_SIZE} /> Preview
                </button>
                <button style={btnDownload} onClick={() => handleDownloadDocument(targetItem.filePath, targetItem.fileName)}>
                  <Download size={ICON_SIZE} /> Download
                </button>
                {!isMediclaimApproved && (
                  <button style={btnApprove} onClick={() => handleApproveDocument(item, subItem)}>
                    <CheckCircle2 size={ICON_SIZE} /> Approve
                  </button>
                )}
                {isMediclaimApproved && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: '#dcfce7', borderRadius: '9999px', fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
                    <CheckCircle size={ICON_SIZE} /> Approved
                  </span>
                )}
              </>
            )}
          </div>
        );
      }
      return null;
    }
    
    // Normal document handling
    if (hasFile) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          <button style={btnView} onClick={() => handleViewDocument(targetItem.filePath)}>
            <Eye size={ICON_SIZE} /> View
          </button>
          <button style={btnPreview} onClick={() => handleViewPdfInline(targetItem.filePath, targetItem.fileName)}>
            <FileText size={ICON_SIZE} /> Preview
          </button>
     
          {isPending && (
            <button style={btnEdit} onClick={() => handleEditUpload(item, subItem)}>
              <Edit size={ICON_SIZE} /> Edit
            </button>
          )}
          
          <button style={btnDownload} onClick={() => handleDownloadDocument(targetItem.filePath, targetItem.fileName)}>
            <Download size={ICON_SIZE} /> Download
          </button>
          
          {isUploaded && !isSubmittedStatus && (
            <button style={btnSubmit} onClick={() => handleSubmitDocument(item, subItem)} disabled={isSubmitting}>
              <CheckCircle2 size={ICON_SIZE} /> {isSubmitting ? 'Saving...' : 'Submit'}
            </button>
          )}
          
          {isPending && !isUploaded && (
            <button style={btnApprove} onClick={() => handleApproveDocument(item, subItem)}>
              <CheckCircle2 size={ICON_SIZE} /> Approve
            </button>
          )}
          
          {isApproved && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: '#dcfce7', borderRadius: '9999px', fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
              <CheckCircle size={ICON_SIZE} /> Approved
            </span>
          )}
        </div>
      );
    }

    const inputId = subItem ? `file-${item.id}-${subItem.id}` : `file-${item.id}`;
    return (
      <div>
        <input type="file" id={inputId} onChange={(e) => handleFileUpload(item.id, e.target.files[0], subItem?.id)} style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png" />
        <label htmlFor={inputId} style={btnUpload}>
          <Download size={ICON_SIZE} style={{ transform: 'rotate(180deg)' }} /> Upload
        </label>
      </div>
    );
  };

  // PDF Generation functions
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
    doc.text(formData.doj ? new Date(formData.doj).toLocaleDateString('en-GB') : 'N/A', midX, yPosition + 19);

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
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, pageHeight - 10);
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
    doc.text(formData.designation || rowData.fullData.MANPOWER_DESG, margin + 3, yPosition + 19);

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
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, pageHeight - 10);
    }

    doc.save(`Employee_Documents_${formData.empId}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // ─── Column width map ───
  const colWidths = { sno: 52, docType: '30%', status: 120, fileName: '22%', actions: '28%' };

  // ─── Modal sizing ───
  const modalStyle = isFullscreen
    ? { position: 'fixed', inset: 0, borderRadius: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', background: '#fff' }
    : { position: 'relative', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '92vh', width: '100%', maxWidth: 1400, margin: '0 auto', background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };

  const PdfViewer = ({ document: pdfDoc, onClose }) => {
    const [portalContainer, setPortalContainer] = useState(null);
    
    useEffect(() => {
      if (typeof window !== 'undefined' && window.document) {
        let container = window.document.getElementById('pdf-viewer-portal');
        if (!container) {
          container = window.document.createElement('div');
          container.id = 'pdf-viewer-portal';
          window.document.body.appendChild(container);
        }
        setPortalContainer(container);
        window.document.body.style.overflow = 'hidden';
        return () => {
          if (window.document && window.document.body) {
            window.document.body.style.overflow = '';
          }
        };
      }
    }, []);
    
    if (!portalContainer) return null;
    
    const viewerContent = (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }} onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '1200px',
          height: '85%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#fff',
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
              {pdfDoc.fileName}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer',
                color: '#64748b',
                padding: '0 8px',
                borderRadius: '6px',
              }}
            >
              ×
            </button>
          </div>
          <div style={{ flex: 1, padding: '20px', overflow: 'auto', backgroundColor: '#f8fafc' }}>
            <iframe
              src={pdfDoc.filePath}
              title={pdfDoc.fileName}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '8px',
              }}
            />
          </div>
        </div>
      </div>
    );
    
    return ReactDOM.createPortal(viewerContent, portalContainer);
  };

  return (
    <>
      <div style={modalStyle}>
        {/* ─── HEADER ─── */}
        <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)', color: '#fff', padding: '14px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, background: 'rgba(255,255,255,0.18)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(255,255,255,0.3)' }}>
              <Building2 size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{ rowData?.fullData?.ONBOARD_PLANT || formData?.siteLocation}</h2>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2, letterSpacing: '0.04em' }}>
                Employee Onboarding Documents &nbsp;•&nbsp; ID: {formData.empId}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setIsFullscreen(f => !f)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={onClose}
              title="Close"
              style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.5)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ─── SCROLLABLE CONTENT ─── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', background: '#f8fafc' }}>
          {/* Employee Info Card */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <User size={15} color="#2563eb" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a8a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Employee Information</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 24px' }}>
              {[
                { label: 'Emp Name', value: formData.employeeName },
                { label: 'Case ID', value: formData.empId },
                { label: 'Designation', value: formData.designation || rowData.fullData.MANPOWER_DESG },
                { label: 'Date of Joining', value: formData.doj ? new Date(formData.doj).toLocaleDateString('en-GB') : 'Not Set' },
                { label: 'Department', value: formData.department },
                { label: 'Site / Location', value: rowData?.fullData?.ONBOARD_PLANT || formData.siteLocation || 'N/A' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', minWidth: 90, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}:</span>
                  <span style={{ fontSize: 12, color: '#1e293b', fontWeight: 500, background: '#f1f5f9', borderRadius: 5, padding: '2px 8px', flex: 1 }}>{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents Table */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: colWidths.sno }} />
                  <col style={{ width: colWidths.docType }} />
                  <col style={{ width: colWidths.status }} />
                  <col style={{ width: colWidths.fileName }} />
                  <col style={{ width: colWidths.actions }} />
                </colgroup>
                <thead>
                  <tr style={{ background: 'linear-gradient(to right, #1e3a8a, #1d4ed8)' }}>
                    {['S.No', 'Document Type', 'Status', 'File Name', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '2px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {documentChecklist.map((item, index) => (
                    <React.Fragment key={item.id}>
                      {/* Main row */}
                      <tr style={{ background: index % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                        onMouseLeave={e => e.currentTarget.style.background = index % 2 === 0 ? '#fff' : '#f8fafc'}
                      >
                        <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 700, color: '#64748b', verticalAlign: 'middle' }}>
                          <span style={{ width: 24, height: 24, background: '#eff6ff', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#1d4ed8' }}>{item.id}</span>
                        </td>
                        <td style={{ padding: '9px 14px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            {item.type === 'multiple' ? (
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', lineHeight: 1.4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{item.name}</span>
                            ) : (
                              <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', lineHeight: 1.4, letterSpacing: '0.02em' }}>{item.name}</span>
                            )}
                            {(item.status === '1' || item.status === 1) && <CheckCircle size={13} color="#16a34a" style={{ flexShrink: 0 }} />}
                            
                            {item.id === 21 && (
                              <div style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                marginLeft: '12px',
                                padding: '4px 12px',
                                background: '#f1f5f9',
                                borderRadius: '20px',
                                border: '1px solid #e2e8f0'
                              }}>
                                <label style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '6px', 
                                  fontSize: '11px', 
                                  cursor: item.fullData?.MED_STATUS === 'YES' ? 'not-allowed' : 'pointer',
                                  fontWeight: 600,
                                  opacity: item.fullData?.MED_STATUS === 'YES' ? 0.6 : 1
                                }}>
                                  <input
                                    type="radio"
                                    name={`enrollment_${item.id}`}
                                    value="yes"
                                    checked={item.fullData?.MED_STATUS === 'YES' || item.enrollmentStatus === 'YES'}
                                    disabled={item.fullData?.MED_STATUS === 'YES'}
                                    onChange={(e) => {
                                      const updatedChecklist = documentChecklist.map(docItem =>
                                        docItem.id === item.id
                                          ? { ...docItem, enrollmentStatus: 'YES' }
                                          : docItem
                                      );
                                      setDocumentChecklist(updatedChecklist);
                                    }}
                                    style={{ margin: 0, cursor: 'pointer' }}
                                  />
                                  <span style={{ color: '#16a34a' }}>Yes</span>
                                </label>
                                <label style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '6px', 
                                  fontSize: '11px', 
                                  cursor: item.fullData?.MED_STATUS === 'YES' ? 'not-allowed' : 'pointer',
                                  fontWeight: 600,
                                  opacity: item.fullData?.MED_STATUS === 'YES' ? 0.6 : 1
                                }}>
                                  <input
                                    type="radio"
                                    name={`enrollment_${item.id}`}
                                    value="no"
                                    checked={item.enrollmentStatus === 'NO'}
                                    disabled={item.fullData?.MED_STATUS === 'YES'}
                                    onChange={(e) => {
                                      const updatedChecklist = documentChecklist.map(docItem =>
                                        docItem.id === item.id
                                          ? { ...docItem, enrollmentStatus: 'NO' }
                                          : docItem
                                      );
                                      setDocumentChecklist(updatedChecklist);
                                    }}
                                    style={{ margin: 0, cursor: 'pointer' }}
                                  />
                                  <span style={{ color: '#dc2626' }}>No</span>
                                </label>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '9px 14px', verticalAlign: 'middle' }}>
                          {item.type !== 'multiple' && <StatusBadge status={item.status} />}
                        </td>
                        <td style={{ padding: '9px 14px', verticalAlign: 'middle' }}>
                          {item.type !== 'multiple' && (
                            item.fileName
                              ? <span title={item.fileName} style={{ fontSize: 11, color: '#475569', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{item.fileName}</span>
                              : <span style={{ fontSize: 11, color: '#cbd5e1' }}>No file</span>
                          )}
                        </td>
                        <td style={{ padding: '9px 14px', verticalAlign: 'middle' }}>
                          {item.type !== 'multiple' && renderActionButtons(item)}
                        </td>
                      </tr>

                      {/* Sub-rows */}
                      {item.subItems && item.subItems.map((subItem, si) => (
                        <tr key={subItem.id}
                          style={{ background: '#f0f4ff', borderBottom: '1px solid #e8eef8', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#e0ecff'}
                          onMouseLeave={e => e.currentTarget.style.background = '#f0f4ff'}
                        >
                          <td style={{ padding: '7px 14px', verticalAlign: 'middle' }}>
                            <div style={{ width: 2, height: 22, background: '#93c5fd', borderRadius: 2, margin: '0 auto' }} />
                          </td>
                          <td style={{ padding: '7px 14px 7px 24px', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#93c5fd' }}>{subItem.id.slice(-1)})</span>
                              <span style={{ fontSize: 10.5, color: '#4b5563', fontWeight: 500, lineHeight: 1.4, letterSpacing: '0.02em' }}>{subItem.name}</span>
                              {(subItem.status === '1' || subItem.status === 1) && <CheckCircle size={12} color="#16a34a" style={{ flexShrink: 0 }} />}
                            </div>
                          </td>
                          <td style={{ padding: '7px 14px', verticalAlign: 'middle' }}><StatusBadge status={subItem.status} /></td>
                          <td style={{ padding: '7px 14px', verticalAlign: 'middle' }}>
                            {subItem.fileName
                              ? <span title={subItem.fileName} style={{ fontSize: 11, color: '#475569', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{subItem.fileName}</span>
                              : <span style={{ fontSize: 11, color: '#cbd5e1' }}>No file</span>
                            }
                          </td>
                          <td style={{ padding: '7px 14px', verticalAlign: 'middle' }}>
                            {renderActionButtons(item, subItem, true)}
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

        {/* ─── FOOTER ─── */}
        <div style={{ background: '#fff', padding: '14px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ ...btnBase, background: '#f1f5f9', color: '#475569', padding: '8px 20px', fontSize: 13 }}>Close</button>
          <button onClick={generatePDFPreview} style={{ ...btnBase, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', padding: '8px 20px', fontSize: 13 }}>
            <FileDown size={15} /> Preview PDF
          </button>
          <button onClick={handleDownloadPDF} style={{ ...btnBase, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', padding: '8px 20px', fontSize: 13 }}>
            <Download size={15} /> Download PDF
          </button>
          {isAllVerified && (
            <button onClick={handleSubmit} style={{ ...btnBase, background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', padding: '8px 22px', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}>
              <CheckCircle size={15} /> Verify &amp; Submit
            </button>
          )}
        </div>
      </div>

      {viewingPdf && <PdfViewer document={viewingPdf} onClose={handleClosePdfViewer} />}
    </>
  );
};

export default DocUpload;


