



import React, { useState, useEffect } from 'react';
import { X, Eye, Download, FileText, Check, CheckCircle, XCircle, Clock, Maximize2 } from 'lucide-react';
import { API_BASE_URL, API_BASE_URLss } from '../Config/Config';
import Swal from 'sweetalert2';
import axios from 'axios';

const VerificationDetailsModal = ({ open, onClose, data, onStatusChange, setSelectedUser, refersh }) => {
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  const [remarks, setRemarks] = useState(data?.remarks || '');
  const [updateDocuments, setDocuments] = useState([]);
  const [expDocuments, setExDocuments] = useState([]);
  const [localData, setLocalData] = useState(data);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [viewingDocName, setViewingDocName] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [approvedDocs, setApprovedDocs] = useState({});

  console.log("Modal Data:", localData);

  useEffect(() => {
  setDocuments(data?.documents || []);
  setExDocuments(data?.expDocuments || []);
  
  // Combine both data and local approvedDocs state
  const initialApproved = {};
  
  // First, check documents from data
  if (data?.documents) {
    const docTypes = {
      Tenth_DocId: 'Tenth_Status',
      Inter_DocId: 'Inter_Status',
      grad_DocId: 'Grad_Status',
      pg_DocId: 'Pg_Status',
      Aadhar_DocId: 'Aadhr_Status',
      pan_DocId: 'Pan_Status',
      PaySlip_DocId: 'PaySlip_Status',
      Exp_DocId: 'Exp_Status',
      Reliev_DocId: 'Reliv_Status'
    };
    
    Object.entries(docTypes).forEach(([docIdKey, statusKey]) => {
      if (data.documents[docIdKey]) {
        initialApproved[data.documents[docIdKey]] = 
          data.documents[statusKey] === 1 || 
          data.documents[statusKey] === "1";
      }
    });
  }
  
  // Also check experienceData for bank statements, offer letters, etc.
  if (data?.experienceData) {
    data.experienceData.forEach((exp) => {
      // Check bank statement
      if (exp.BANK_STATEMENT_DOC_ID) {
        initialApproved[exp.BANK_STATEMENT_DOC_ID] = 
          exp.BANK_STATEMENT_DOC_STATUS == "1" || 
          exp.BANK_STATEMENT_DOC_STATUS == 1;
      }
      
      // Check offer letter
      if (exp.OFFER_DOC_ID) {
        initialApproved[exp.OFFER_DOC_ID] = 
          exp.OFFER_LETTER_STATUS == "1" || 
          exp.OFFER_LETTER_STATUS == 1;
      }
      
      // Check relieving letter
      if (exp.RELIEVING_DOC_ID) {
        initialApproved[exp.RELIEVING_DOC_ID] = 
          exp.RELIEV_DOC_STATUS == "1" || 
          exp.RELIEV_DOC_STATUS == 1;
      }
      
      // Check experience letter
      if (exp.EXP_DOC_ID) {
        initialApproved[exp.EXP_DOC_ID] = 
          exp.EXPERIENCE_DOC_STATUS == "1" || 
          exp.EXPERIENCE_DOC_STATUS == 1;
      }
      
      // Check payslips
      if (exp.payslips) {
        exp.payslips.forEach((payslip) => {
          if (payslip.EMP_PAYSLIP_ID) {
         
            initialApproved[payslip.EMP_PAYSLIP_ID] = 
              payslip.PAYSLIP_STATUS == "1" || 
              payslip.PAYSLIP_STATUS == 1;
          }
        });
      }
    });
  }
  
  setApprovedDocs(prev => ({
    ...initialApproved,
    ...prev 
  }));
}, [data?.documents, data?.experienceData, setSelectedUser]);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const isApproved = true;
  if (!open) return null;

  const handleSubmit = async () => {
    // ✅ CHECK IF AT LEAST ONE DOCUMENT IS APPROVED
    const hasApprovedDoc = Object.values(approvedDocs).some(status => status === true);
    
    if (!hasApprovedDoc) {
      await Swal.fire({
        title: "Approval Required",
        text: "Please approve at least one document before submitting!",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    // ✅ CONFIRMATION ALERT BEFORE SUBMISSION
    const result = await Swal.fire({
      title: "Confirm Submission",
      text: "Are you sure you want to submit this verification?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Submit!",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const payload = {
        child_caseId: data.CHILD_CASEID,
        remarks,
      };
      
      const response = await axios.post(`${API_BASE_URL}/verify-update`, payload, {
        headers: {
          Authorization: `Bearer ${userToken.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data) {
        // ✅ Call onStatusChange to update parent state with verification_status: "1"
        if (onStatusChange) {
          onStatusChange({
            id: data.CHILD_CASEID,
            verification_status: "1"
          });
        }
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Verification updated successfully!',
          timer: 1500,
          showConfirmButton: false,
        });

        if (refersh) {
          await refersh();
        }
        
        setRemarks('');
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update verification. Please try again.',
        icon: 'error',
      });
    }
  };

const handleApprove = async (
  Document_Id,
  Verify_Id,
  title,
  documentPath,
  EMP_COMP_ID
) => {

  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to approve ${title}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#16a34a',
    cancelButtonColor: '#dc2626',
    confirmButtonText: 'Yes, Approve',
    cancelButtonText: 'No',
  });

  if (!result.isConfirmed) return;

  try {
    // ✅ DEFINE PAYLOAD HERE - BEFORE USING IT
    let payload = {};

    let docType = null;
    const lowerTitle = title.toLowerCase();

    // ===== DOCUMENT TYPE CHECK =====
    if (lowerTitle.includes('bank statement')) {
      payload.EMP_COMP_ID = EMP_COMP_ID || "";
      payload.BANK_STATEMENT_DOC_STATUS = "1";
      // payload.Document_Id = Document_Id;  // ✅ ADD Document_Id
      docType = 'bank_statement';

    } else if (lowerTitle.includes('offer letter')) {
      payload.EMP_COMP_ID = EMP_COMP_ID || "";
      payload.OFFER_LETTER_STATUS = "1";
      // payload.Document_Id = Document_Id;  // ✅ ADD Document_Id
      docType = 'offer_letter';

    } else if (lowerTitle.includes('relieving letter')) {
      payload.EMP_COMP_ID = EMP_COMP_ID || "";
      payload.RELIEV_DOC_STATUS = "1";
      // payload.Document_Id = Document_Id;  // ✅ ADD Document_Id
      docType = 'relieving_letter';

    } else if (lowerTitle.includes('experience letter')) {
      payload.EMP_COMP_ID = EMP_COMP_ID || "";
      payload.EXPERIENCE_DOC_STATUS = "1";
      // payload.Document_Id = Document_Id;  // ✅ ADD Document_Id
      docType = 'experience_letter';

    } else if (lowerTitle.includes('payslip')) {
      // payload.EMP_COMP_ID = EMP_COMP_ID || "";  // ✅ UNCOMMENT THIS
     payload.EMP_PAYSLIP_ID = Document_Id;
       payload.EMP_COMP_ID = EMP_COMP_ID || "";
      payload.PAYSLIP_STATUS = "1";
      // payload.Document_Id = Document_Id; // Optional - if backend needs both
      docType = 'payslip';
    }


    else {
      payload.Document_Id = Document_Id;
      payload.Verification_Id  = Verify_Id

    }
    
    setApprovedDocs(prev => ({
      ...prev,
      [Document_Id]: true
    }));

    if (docType && localData?.experienceData) {
      const updatedExperienceData = localData.experienceData.map(exp => {
        if (docType === 'bank_statement' && exp.BANK_STATEMENT_DOC_ID == Document_Id) {
          return {
            ...exp,
            BANK_STATEMENT_DOC_STATUS: "1",
            BANK_STATEMENT_STATUS: "1"
          };
        }
        if (docType === 'offer_letter' && exp.OFFER_DOC_ID == Document_Id) {
          return {
            ...exp,
            OFFER_LETTER_STATUS: "1",
            OFFER_STATUS: "1"
          };
        }
        if (docType === 'relieving_letter' && exp.RELIEVING_DOC_ID == Document_Id) {
          return {
            ...exp,
            RELIEV_DOC_STATUS: "1",
            RELIEVING_STATUS: "1"
          };
        }
        if (docType === 'experience_letter' && exp.EXP_DOC_ID == Document_Id) {
          return {
            ...exp,
            EXPERIENCE_DOC_STATUS: "1",
            EXP_STATUS: "1"
          };
        }
        if (docType === 'payslip' && exp.payslips?.some(p => p.EMP_PAYSLIP_ID == Document_Id)) {
          const updatedPayslips = exp.payslips.map(p =>
            p.EMP_PAYSLIP_ID === Document_Id
              ? { ...p, PAYSLIP_STATUS: "1" }
              : p
          );
          return {
            ...exp,
            payslips: updatedPayslips
          };
        }
        return exp;
      });

      setLocalData(prev => ({
        ...prev,
        experienceData: updatedExperienceData
      }));
    }

    // ===== API CALL =====
    await axios.post(
      `${API_BASE_URL}/verify-Doc-Status`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${userToken.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    await Swal.fire({
      icon: 'success',
      title: 'Approved!',
      text: `${title} has been approved successfully.`,
      timer: 1500,
      showConfirmButton: false,
    });

  } catch (error) {
    console.error("Approval error:", error);

    // Revert UI if API fails
    setApprovedDocs(prev => {
      const newState = { ...prev };
      delete newState[Document_Id];
      return newState;
    });

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Something went wrong while approving the document.',
    });
  }
};


// const handleApprove = async (Document_Id, Verify_Id, title, documentPath, EMP_COMP_ID) => {


//   const result = await Swal.fire({
//     title: 'Are you sure?',
//     text: `Do you want to approve ${title}?`,
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonColor: '#16a34a',
//     cancelButtonColor: '#dc2626',
//     confirmButtonText: 'Yes, Approve',
//     cancelButtonText: 'No',
//   });

//   if (!result.isConfirmed) {
//     return;
//   }

//   try {
//     const payload = {
//       Verification_Id: Verify_Id,
//       Document_Id: Document_Id,
//       EMP_COMP_ID: EMP_COMP_ID || "",
//       EMP_PAYSLIP_ID: Document_Id || "",
//     };

//     let docType = null;
    
//     // Add specific status field based on document title
//     if (title.toLowerCase().includes('bank statement')) {
//       payload.BANK_STATEMENT_DOC_STATUS = "1";
//       docType = 'bank_statement';
//     } else if (title.toLowerCase().includes('offer letter')) {
//       payload.OFFER_LETTER_STATUS = "1";
//       docType = 'offer_letter';
//     } else if (title.toLowerCase().includes('relieving letter')) {
//       payload.RELIEV_DOC_STATUS = "1";
//       docType = 'relieving_letter';
//     } else if (title.toLowerCase().includes('payslip')) {
//       payload.PAYSLIP_STATUS = "1";  // Fixed typo: PLAYSLIP_STATUS -> PAYSLIP_STATUS
//       docType = 'payslip';
//     } else if (title.toLowerCase().includes('experience letter')) {
//       payload.EXPERIENCE_DOC_STATUS = "1";
//       docType = 'experience_letter';
//     }

//     console.log("Sending approval payload:", payload);

//     // IMMEDIATELY update the local state BEFORE API call
//     // 1. Update approvedDocs
//     setApprovedDocs(prev => ({
//       ...prev,
//       [Document_Id]: true
//     }));

//     // 2. Update localData if it's an experience-related document
//     if (docType && localData?.experienceData) {
//       const updatedExperienceData = localData.experienceData.map(exp => {
//         if (docType === 'bank_statement' && exp.BANK_STATEMENT_DOC_ID === Document_Id) {
//           return { 
//             ...exp, 
//             BANK_STATEMENT_DOC_STATUS: "1",
//             BANK_STATEMENT_STATUS: "1" 
//           };
//         }
//         if (docType === 'offer_letter' && exp.OFFER_DOC_ID === Document_Id) {
//           return { 
//             ...exp, 
//             OFFER_LETTER_STATUS: "1",
//             OFFER_STATUS: "1" 
//           };
//         }
//         if (docType === 'relieving_letter' && exp.RELIEVING_DOC_ID === Document_Id) {
//           return { 
//             ...exp, 
//             RELIEV_DOC_STATUS: "1",
//             RELIEVING_STATUS: "1" 
//           };
//         }
//         if (docType === 'experience_letter' && exp.EXP_DOC_ID === Document_Id) {
//           return { 
//             ...exp, 
//             EXPERIENCE_DOC_STATUS: "1",
//             EXP_STATUS: "1" 
//           };
//         }
//         if (docType === 'payslip' && exp.payslips?.some(p => p.EMP_PAYSLIP_ID === Document_Id)) {
//           const updatedPayslips = exp.payslips.map(p => 
//             p.EMP_PAYSLIP_ID === Document_Id 
//               ? { ...p, PAYSLIP_STATUS: "1" }
//               : p
//           );
//           return { ...exp, payslips: updatedPayslips };
//         }
//         return exp;
//       });

//       setLocalData(prev => ({
//         ...prev,
//         experienceData: updatedExperienceData
//       }));
//     }

//     // 3. Now make the API call
//     const response = await axios.post(
//       `${API_BASE_URL}/verify-Doc-Status`,
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${userToken.token}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     await Swal.fire({
//       icon: 'success',
//       title: 'Approved!',
//       text: `${title} has been approved successfully.`,
//       timer: 1500,
//       showConfirmButton: false,
//     });
//   } catch (error) {
//     console.error("Approval error:", error);
    
//     // If API fails, revert the local state
//     setApprovedDocs(prev => {
//       const newState = { ...prev };
//       delete newState[Document_Id];
//       return newState;
//     });
    
//     Swal.fire({
//       icon: 'error',
//       title: 'Error',
//       text: 'Something went wrong while approving the document.',
//     });
//   }
// };

  const isDocApproved = (documentId, docStatus) => {
    console.log("isDocApproved check:", { documentId, docStatus, approvedDocs });
    
    // First check if we've approved it locally
    if (documentId && approvedDocs[documentId]) {
      console.log("Approved locally");
      return true;
    }
    // Then check the original status from data
    // Check for both string "1" and number 1
    const isApproved = docStatus === 1 || docStatus === "1";
    console.log("Status from data is approved:", isApproved);
    return isApproved;
  };

  const handleViewDocument = (url, name) => {
    if (url && url !== 'N/A') {
      setViewingDoc(url);
      setViewingDocName(name);
    }
  };

  const InfoRow = ({ icon, label, value, valueColor = 'text-gray-700' }) => (
    <div className="flex items-start mb-1.5">
      <div className="flex items-center min-w-[150px] text-gray-600 font-medium text-xs">
        {icon && <span className="mr-2 text-blue-500">{icon}</span>}
        <span>{label}:</span>
      </div>
      <div className={`flex-1 font-medium text-xs ${valueColor}`}>
        {value || 'N/A'}
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      verified: { color: 'bg-green-500', label: 'Verified', icon: CheckCircle },
      pending: { color: 'bg-amber-500', label: 'Pending', icon: Clock },
      rejected: { color: 'bg-red-500', label: 'Rejected', icon: XCircle },
      uploaded: { color: 'bg-blue-500', label: 'Uploaded', icon: CheckCircle },
      'not uploaded': { color: 'bg-gray-500', label: 'Not Uploaded', icon: XCircle }
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`${config.color} text-white px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const DocumentViewer = ({ url, name, onClose }) => {
    if (!url) return null;
    const isPDF = url.toLowerCase().endsWith('.pdf');
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URLss}${url}`;

  
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(fullUrl, '_blank')}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                title="Open in new tab"
              >
                <Download className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-gray-50">
            {isPDF ? (
              <iframe
                src={fullUrl}
                className="w-full h-full min-h-[600px] border-0 rounded-lg bg-white"
                title={name}
              />
            ) : (
              <img
                src={fullUrl}
                alt={name}
                className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const DocumentCard = ({ 
    docStatus, 
    documentId, 
    Verification_Id, 
    title, 
    documentPath,
    EMP_COMP_ID,
    bankStatementStatus,
    offerLetterStatus,
    relievingStatus,
    payslipStatus,
    experienceStatus
  }) => {
  
    
    const hasDocument = documentPath && documentPath !== null;
    
    let statusToCheck = docStatus;
    
    if (title.toLowerCase().includes('bank statement')) {
      statusToCheck = bankStatementStatus || docStatus;
    } else if (title.toLowerCase().includes('offer letter')) {
      statusToCheck = offerLetterStatus || docStatus;
    } else if (title.toLowerCase().includes('relieving letter')) {
      statusToCheck = relievingStatus || docStatus;
    } else if (title.toLowerCase().includes('payslip')) {
      statusToCheck = payslipStatus || docStatus;
    } else if (title.toLowerCase().includes('experience letter')) {
      statusToCheck = experienceStatus || docStatus;
    }
    
    const isApproved = isDocApproved(documentId, statusToCheck);
    
    console.log(`Document: ${title}, Status to check: ${statusToCheck}, Is Approved: ${isApproved}`);
    
    return (
      <div className={`p-3 rounded-lg border-2 transition-all ${hasDocument
        ? 'border-blue-200 bg-blue-50 hover:border-blue-300 hover:shadow-md'
        : 'border-gray-200 bg-gray-50'
        }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <FileText className={`w-4 h-4 ${hasDocument ? 'text-blue-600' : 'text-gray-400'}`} />
            <div className="flex-1">
              <h4 className="font-semibold text-xs text-gray-800">{title}</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {hasDocument ? 'Document available' : 'Not uploaded'}
              </p>
              {isApproved && (
                <p className="text-[10px] text-green-600 mt-0.5 font-semibold">
                  ✓ Approved
                </p>
              )}
            </div>
          </div>
          {hasDocument ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewDocument(documentPath, title)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </button>

              {isApproved ? (
                <span className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </span>
              ) : (
                <button
                  onClick={() => handleApprove(documentId, Verification_Id, title, documentPath, EMP_COMP_ID)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-xs font-medium"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve
                </button>
              )}
            </div>
          ) : (
            <span className="px-3 py-1.5 bg-gray-300 text-gray-600 rounded-lg text-xs font-medium">
              N/A
            </span>
          )}
        </div>
      </div>
    );
  };

  const educationDocuments = [
    { 
      title: '10th Certificate', 
      path: data?.documents?.['10th_certi'], 
      marks: data?.SSC_MARKS, 
      documentId: data?.documents?.Tenth_DocId, 
      docStatus: data?.documents?.Tenth_Status, 
      Verification_Id: data.Verification_Id 
    },
    { 
      title: 'Intermediate Certificate', 
      path: data?.documents?.Inter_certi, 
      marks: data?.INTER_MARKS, 
      documentId: data?.documents?.Inter_DocId, 
      docStatus: data?.documents?.Inter_Status, 
      Verification_Id: data.Verification_Id 
    },
    { 
      title: 'B.Tech/Degree Certificate ', 
      path: data?.documents?.Gradu_certi, 
      marks: data?.BTECH_MARKS, 
      documentId: data?.documents?.grad_DocId, 
      docStatus: data?.documents?.Grad_Status, 
      Verification_Id: data.Verification_Id 
    },
    { 
      title: 'PG Certificate', 
      path: data?.documents?.Pg_certi, 
      marks: data?.PG_MARKS, 
      documentId: data?.documents?.pg_DocId, 
      docStatus: data?.documents?.Pg_Status, 
      Verification_Id: data.Verification_Id 
    },

     { 
      title: 'PHD Certificate', 
      path: data?.documents?.PHD_FILENAME, 
      marks: data?.PHD_MARKS, 
      documentId: data?.documents?.PHD_DocId, 
      docStatus: data?.documents?.PHD_Status, 
      Verification_Id: data.Verification_Id 
    },

      { 
      title: 'Others', 
      path: data?.documents?.OTHER_FILENAME, 
      marks: data?.PG_MARKS, 
      documentId: data?.documents?.OTHER_Status, 
      docStatus: data?.documents?.OTHER_DocId, 
      Verification_Id: data.Verification_Id 
    },



  ];

  const identityDocuments = [
    { 
      title: 'Aadhar Card', 
      path: data?.documents?.Aadhar_certi, 
      documentId: data?.documents?.Aadhar_DocId, 
      docStatus: data?.documents?.Aadhr_Status, 
      Verification_Id: data.Verification_Id 
    },
    { 
      title: 'PAN Card', 
      path: data?.documents?.Pan_certi, 
      documentId: data?.documents?.pan_DocId, 
      docStatus: data?.documents?.Pan_Status, 
      Verification_Id: data.Verification_Id 
    },

       { 
      title: 'Photo', 
      path: data?.documents?.photo, 
      documentId: data?.documents?.photo_DocId, 
      docStatus: data?.documents?.photo_Status, 
      Verification_Id: data.Verification_Id 
    },

       { 
      title: 'Resume', 
      path: data?.documents?.RESUME_UPLOAD, 
      documentId: data?.documents?.RESUME_DocId, 
      docStatus: data?.documents?.RESUME_Status, 
      Verification_Id: data.Verification_Id 
    },
     { 
      title: 'UAN Doc', 
      path: data?.documents?.UAN_FILE, 
      documentId: data?.documents?.UAN_DocId, 
      docStatus: data?.documents?.UAN_Status, 
      Verification_Id: data.Verification_Id 
    },

  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className={`bg-white rounded-3xl ${isMaximized ? 'w-full h-full max-w-full' : 'max-w-6xl w-full max-h-[90vh]'} overflow-hidden shadow-2xl flex flex-col`}>
          {/* Header - Reduced Height */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-3 flex justify-between items-center flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold">{data?.NAME || 'N/A'}</h2>
              <p className="text-blue-100 text-xs">{data?.EMAIL || 'N/A'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="text-white hover:bg-blue-200 hover:bg-opacity-20 rounded-full p-2 transition-all"
                title={isMaximized ? "Restore" : "Maximize"}
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="text-white hover:bg-blue-200 hover:bg-opacity-20 rounded-full p-2 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sticky Personal Information */}
          <div className="bg-white shadow-sm px-6 py-2.5 flex-shrink-0 border-b border-gray-200">
            <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InfoRow label="Case ID" value={data?.CHILD_CASEID} valueColor="text-purple-600" />
              <InfoRow label="Phone Number" value={data?.PHONE_NUMBER} />
              <InfoRow label="Date of Birth" value={data?.DOB} />
              <InfoRow label="Address" value={data?.ADDRESS} />
              <InfoRow label="Submitted Date" value={data?.submitted_date} />
              <div className="flex items-start mb-1.5">
                <div className="flex items-center min-w-[150px] text-gray-600 font-medium text-xs">
                  <span>Status:</span>
                </div>
                <div className="flex-1">
                  <StatusBadge status={data?.STATUS} />
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 p-4 bg-gray-50">
            {/* Identity Documents */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-3">
              <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                Identity Documents
              </h3>
              <div className="border-b border-gray-200 mb-3"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-3">
                <InfoRow label="Aadhar Number" value={data?.AADHAR_NUM} />
                <InfoRow label="PAN Number" value={data?.PAN_NUM} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {identityDocuments.map((doc, index) => (
                  <DocumentCard 
                    key={index} 
                    docStatus={doc.docStatus} 
                    documentId={doc.documentId} 
                    Verification_Id={doc.Verification_Id} 
                    title={doc.title} 
                    documentPath={doc.path} 
                  />
                ))}
              </div>
            </div>

            {/* Education Details */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-3">
              <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-green-600 rounded-full"></span>
                Education Details & Documents
              </h3>
              <div className="border-b border-gray-200 mb-3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {educationDocuments.map((doc, index) => (
                  <div key={index} className="space-y-1.5">
                    <DocumentCard 
                      docStatus={doc.docStatus} 
                      documentId={doc.documentId} 
                      Verification_Id={doc.Verification_Id} 
                      title={doc.title} 
                      documentPath={doc.path} 
                    />
                    {doc.marks && doc.marks !== 'N/A' && (
                      <div className="text-center">
                        <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                          Marks: {doc.marks}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Experience */}
          {/* Professional Experience */}
<div className="bg-white rounded-xl shadow-sm p-4 mb-3">
  <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
    <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span>
    Professional Experience
  </h3>
  <div className="border-b border-gray-200 mb-3"></div>
  
  {/* Experience Details from localData (not data) */}
  {localData?.experienceData?.map((exp, index) => (
    <div key={index} className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <InfoRow label="Company" value={exp.COMPANY_NAME} />
        <InfoRow label="Designation" value={exp.DESIGNATION} />
        {/* <InfoRow label="Duration" value={exp.DESIGNATION} /> */}
        <InfoRow label="Experience" value={`${exp.EXPERIENCE_YEARS} years`} />
      </div>

      {/* Professional Documents - From localData */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Experience Letter */}
        {exp.EXPERIENCE_DOC && (
          <DocumentCard 
            title="Experience Letter"
            documentPath={exp.EXPERIENCE_DOC}
            documentId={exp.EXP_DOC_ID}
            docStatus={exp.EXPERIENCE_DOC_STATUS || exp.EXP_STATUS}
            Verification_Id={data.Verification_Id}
            EMP_COMP_ID={exp.EMP_COMP_ID}
            experienceStatus={exp.EXPERIENCE_DOC_STATUS || exp.EXP_STATUS}
          />
        )}
        
        {/* Relieving Letter */}
        {exp.RELIVING_LETTER_DOC && (
          <DocumentCard 
            title="Relieving Letter"
            documentPath={exp.RELIVING_LETTER_DOC}
            documentId={exp.RELIEVING_DOC_ID}
            docStatus={exp.RELIEV_DOC_STATUS || exp.RELIEVING_STATUS}
            Verification_Id={data.Verification_Id}
            EMP_COMP_ID={exp.EMP_COMP_ID}
            relievingStatus={exp.RELIEV_DOC_STATUS || exp.RELIEVING_STATUS}
          />
        )}
        
        {/* Bank Statement */}
        {exp.BANK_STATEMENT_DOC && (
          <DocumentCard 
            title="Bank Statement"
            documentPath={exp.BANK_STATEMENT_DOC}
            documentId={exp.BANK_STATEMENT_DOC_ID}
            docStatus={exp.BANK_STATEMENT_DOC_STATUS || exp.BANK_STATEMENT_STATUS}
            Verification_Id={data.Verification_Id}
            EMP_COMP_ID={exp.EMP_COMP_ID}
            bankStatementStatus={exp.BANK_STATEMENT_DOC_STATUS || exp.BANK_STATEMENT_STATUS}
          />
        )}
        
        {/* Offer Letter */}
        {exp.OFFER_LETTER_DOC && (
          <DocumentCard 
            title="Offer Letter"
            documentPath={exp.OFFER_LETTER_DOC}
            documentId={exp.OFFER_DOC_ID}
            docStatus={exp.OFFER_LETTER_STATUS || exp.OFFER_STATUS}
            Verification_Id={data.Verification_Id}
            EMP_COMP_ID={exp.EMP_COMP_ID}
            offerLetterStatus={exp.OFFER_LETTER_STATUS || exp.OFFER_STATUS}
          />
        )}
        
        {/* Payslips */}
        {exp.payslips && exp.payslips.map((payslip, payslipIndex) => (
          <DocumentCard 
            key={payslip.EMP_PAYSLIP_ID || payslipIndex}
            title={`Payslip ${payslipIndex + 1}`}
            documentPath={payslip.PAYSLIP_FILE}
            documentId={payslip.EMP_PAYSLIP_ID}
            docStatus={payslip.PAYSLIP_STATUS}
            Verification_Id={data.Verification_Id}
            EMP_COMP_ID={exp.EMP_COMP_ID}
            payslipStatus={payslip.PAYSLIP_STATUS}
          />
        ))}
      </div>
    </div>
  ))}
  
  {/* Additional professional info from main data */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
    <InfoRow label="Current CTC" value={data?.CURRENT_CTC ? `₹${data.CURRENT_CTC} LPA` : 'N/A'} valueColor="text-green-600" />
    <InfoRow label="Expected CTC" value={data?.EXP_CTC ? `₹${data.EXP_CTC} LPA` : 'N/A'} valueColor="text-orange-600" />
    {/* <InfoRow label="Offer CTC" value={data?.OFFER_CTC ? `₹${data.OFFER_CTC} LPA` : 'N/A'} valueColor="text-purple-600" /> */}
    <InfoRow label="Notice Period" value={data?.NOTICE_PERIOD ? `${data.NOTICE_PERIOD} days` : 'N/A'} />
  </div>
</div>

            {/* Verification Status & Remarks */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
                Verification Status & Remarks
              </h3>
              <div className="border-b border-gray-200 mb-3"></div>

              <div className="flex items-center mb-3">
                <span className="font-semibold text-gray-600 text-sm mr-3">Current Status:</span>
                <StatusBadge status={data?.STATUS} />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 text-sm mb-2">
                  Remarks:
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add your remarks here..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg font-semibold text-sm text-gray-600 hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              // onClick={() => handleSubmit()}
              className="px-5 py-2 rounded-lg font-semibold text-sm text-white bg-red-500 hover:bg-red-600 transition-all"
            >
              Reject
            </button>
            <button
              onClick={() => handleSubmit()}
              className="px-5 py-2 rounded-lg font-semibold text-sm text-white bg-green-500 hover:bg-green-600 transition-all"
            >
              Verify & Submit
            </button>
          </div>
        </div>
      </div>

      {viewingDoc && (
        <DocumentViewer
          url={viewingDoc}
          name={viewingDocName}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </>
  );
};

export default VerificationDetailsModal;