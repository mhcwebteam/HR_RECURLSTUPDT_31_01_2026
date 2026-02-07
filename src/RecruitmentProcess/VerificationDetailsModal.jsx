



import React, { useState, useEffect } from 'react';
import { X, Eye, Download, FileText, Check, CheckCircle, XCircle, Clock, Maximize2 } from 'lucide-react';
import { API_BASE_URL, API_BASE_URLss } from '../Config/Config';
import Swal from 'sweetalert2';
import axios from 'axios';

const VerificationDetailsModal = ({ open, onClose, data, onStatusChange, setSelectedUser,refersh }) => {
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  const [remarks, setRemarks] = useState(data?.remarks || '');
  const [updateDocuments, setDocuments] = useState([]);
  const [localData, setLocalData] = useState(data);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [viewingDocName, setViewingDocName] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [approvedDocs, setApprovedDocs] = useState({});

  useEffect(() => {
    setDocuments(data?.documents || []);
    
    // Initialize approvedDocs from data
    if (data?.documents) {
      const initialApproved = {};
      // Map document types to their status fields
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
          initialApproved[data.documents[docIdKey]] = data.documents[statusKey] === 1;
        }
      });
      
      setApprovedDocs(initialApproved);
    }
  }, [data?.documents, setSelectedUser]);

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

  const handleApprove = async (Document_Id, Verify_Id, title) => {
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

    if (!result.isConfirmed) {
      return;
    }

    try {
      const payload = {
        Verification_Id: Verify_Id,
        Document_Id: Document_Id,
      };

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

      // Update the local state immediately
      setApprovedDocs(prev => ({
        ...prev,
        [Document_Id]: true
      }));

      // Also update the parent component if needed
      setSelectedUser(data);

      await Swal.fire({
        icon: 'success',
        title: 'Approved!',
        text: 'Document has been approved successfully.',
        timer: 500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong while approving the document.',
      });
    }
  };

  const isDocApproved = (documentId, docStatus) => {
    // First check if we've approved it locally
    if (documentId && approvedDocs[documentId]) {
      return true;
    }
    // Then check the original status from data
    return docStatus == 1;
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

  const DocumentCard = ({ docStatus, documentId, Verification_Id, title, documentPath }) => {
    const hasDocument = documentPath && documentPath !== null;
    const isApproved = isDocApproved(documentId, docStatus);
    
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
                  onClick={() => handleApprove(documentId, Verification_Id, title, documentPath)}
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
    { title: '10th Certificate', path: data?.documents?.['10th_certi'], marks: data?.SSC_MARKS, documentId: data?.documents?.Tenth_DocId, docStatus: data?.documents?.Tenth_Status, Verification_Id: data.Verification_Id },
    { title: 'Intermediate Certificate', path: data?.documents?.Inter_certi, marks: data?.INTER_MARKS, documentId: data?.documents?.Inter_DocId, docStatus: data?.documents?.Inter_Status, Verification_Id: data.Verification_Id },
    { title: 'B.Tech/Degree Certificate ', path: data?.documents?.Gradu_certi, marks: data?.BTECH_MARKS, documentId: data?.documents?.grad_DocId, docStatus: data?.documents?.Grad_Status, Verification_Id: data.Verification_Id },
    { title: 'PG Certificate', path: data?.documents?.Pg_certi, marks: data?.PG_MARKS, documentId: data?.documents?.pg_DocId, docStatus: data?.documents?.Pg_Status, Verification_Id: data.Verification_Id },
  ];

  const identityDocuments = [
    { title: 'Aadhar Card', path: data?.documents?.Aadhar_certi, documentId: data?.documents?.Aadhar_DocId, docStatus: data?.documents?.Aadhr_Status, Verification_Id: data.Verification_Id },
    { title: 'PAN Card', path: data?.documents?.Pan_certi, documentId: data?.documents?.pan_DocId, docStatus: data?.documents?.Pan_Status, Verification_Id: data.Verification_Id },
  ];

  const professionalDocuments = [
    { title: 'Payslip', path: data?.documents?.Payslip, documentId: data?.documents?.PaySlip_DocId, docStatus: data?.documents?.PaySlip_Status, Verification_Id: data.Verification_Id },
    { title: 'Experience Letter', path: data?.documents?.Exp_Letter, documentId: data?.documents?.Exp_DocId, docStatus: data?.documents?.Exp_Status, Verification_Id: data.Verification_Id },
    { title: 'Relieving Letter', path: data?.documents?.Relieving_Letter, documentId: data?.documents?.Reliev_DocId, docStatus: data?.documents?.Reliv_Status, Verification_Id: data.Verification_Id },
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
                  <DocumentCard key={index} docStatus={doc.docStatus} documentId={doc.documentId} Verification_Id={doc.Verification_Id} title={doc.title} documentPath={doc.path} />
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
                    <DocumentCard docStatus={doc.docStatus} documentId={doc.documentId} Verification_Id={doc.Verification_Id} title={doc.title} documentPath={doc.path} />
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
            <div className="bg-white rounded-xl shadow-sm p-4 mb-3">
              <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span>
                Professional Experience
              </h3>
              <div className="border-b border-gray-200 mb-3"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <InfoRow label="Previous Company" value={data?.PREVIOUS_COMPANY} />
                <InfoRow label="Duration" value={data?.DURATION ? `${data.DURATION} months` : 'N/A'} />
                <InfoRow label="Notice Period" value={data?.NOTICE_PERIOD ? `${data.NOTICE_PERIOD} days` : 'N/A'} />
                <InfoRow label="Current CTC" value={data?.CURRENT_CTC ? `₹${data.CURRENT_CTC} LPA` : 'N/A'} valueColor="text-green-600" />
                <InfoRow label="Expected CTC" value={data?.EXP_CTC ? `₹${data.EXP_CTC} LPA` : 'N/A'} valueColor="text-orange-600" />
                <InfoRow label="Offer CTC" value={data?.OFFER_CTC ? `₹${data.OFFER_CTC} LPA` : 'N/A'} valueColor="text-purple-600" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {professionalDocuments.map((doc, index) => (
                  <DocumentCard key={index} docStatus={doc.docStatus} documentId={doc.documentId} Verification_Id={doc.Verification_Id} title={doc.title} documentPath={doc.path} />
                ))}
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