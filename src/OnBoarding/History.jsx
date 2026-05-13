import React, { useState, useEffect } from 'react';
import { X, Eye, Download, FileText, Check, CheckCircle, XCircle, Clock, User, IdCard, GraduationCap, Briefcase, FileCheck } from 'lucide-react';
import { API_BASE_URL, API_BASE_URLss } from '../Config/Config';
import Swal from 'sweetalert2';
import axios from 'axios';

const History = ({ open, onClose, data, onStatusChange }) => {

  console.log(data,"fffffffffffffffffffff");
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  const [remarks, setRemarks] = useState(data?.remarks || '');
  const [updateDocuments, setDocuments] = useState([]);
  const [localData, setLocalData] = useState(data);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [viewingDocName, setViewingDocName] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [uploadedFiles, setUploadedFiles] = useState({});

  // Fetch documents data when modal opens
  useEffect(() => {
    if (open && data?.CHILD_CASEID) {
      fetchDocuments();
    }
  }, [open, data?.CHILD_CASEID]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-documents/${data.CHILD_CASEID}`,
        {
          headers: {
            Authorization: `Bearer ${userToken.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data) {
        setLocalData(prev => ({
          ...prev,
          documents: response.data.documents || {}
        }));
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    setDocuments(data?.documents || []);
  }, [data?.documents]);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  if (!open) return null;

  const checkMissingDocuments = () => {
    const allDocuments = [
      ...educationDocuments,
      ...identityDocuments,
      ...professionalDocuments
    ];

    console.log('All Documents:', allDocuments);

    const missingDocs = allDocuments.filter(doc => {
      const hasDocument = doc.path && doc.path !== null && doc.path !== 'N/A' && doc.path !== '';
      const hasUploadedFile = uploadedFiles[doc.documentId];
      const isMissing = !hasDocument && !hasUploadedFile;
      
      console.log(`Document: ${doc.title}`, {
        path: doc.path,
        hasDocument,
        hasUploadedFile,
        isMissing
      });
      
      return isMissing;
    });

    console.log('Missing Documents:', missingDocs);
    return missingDocs;
  };

  const handleVerifySubmit = async () => {
    const missingDocs = checkMissingDocuments();

    if (missingDocs.length > 0) {
      const docList = missingDocs.map(doc => `• ${doc.title}`).join('<br>');
      
      await Swal.fire({
        title: 'Missing Documents!',
        html: `<div style="text-align: left;">
          <p style="margin-bottom: 12px; color: #dc2626; font-weight: 600;">You have missed uploading the following documents:</p>
          <div style="background: #fef2f2; padding: 12px; border-radius: 8px; border-left: 4px solid #dc2626;">
            ${docList}
          </div>
          <p style="margin-top: 12px; font-size: 14px; color: #6b7280;">Please upload all required documents before verifying.</p>
        </div>`,
        icon: 'warning',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK, I will upload',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to verify and submit this record?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Verify!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const payload = {
        child_caseId: data.CHILD_CASEID,
        remarks,
        status: 'verified', // Add status for verification
      };
      const response = await axios.post(`${API_BASE_URL}/verify-update`, payload, {
        headers: {
          Authorization: `Bearer ${userToken.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.data) {
        await Swal.fire({
          title: 'Success!',
          text: 'Verification completed successfully!',
          icon: 'success',
      
        });
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

  const handleRejectSubmit = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to reject this record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Reject!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const payload = {
        child_caseId: data.CHILD_CASEID,
        remarks,
        status: 'rejected', // Add status for rejection
      };
      const response = await axios.post(`${API_BASE_URL}/verify-update`, payload, {
        headers: {
          Authorization: `Bearer ${userToken.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.data) {
        await Swal.fire({
          title: 'Rejected!',
          text: 'Record has been rejected successfully.',
          icon: 'success',
       
        });
        setRemarks('');
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to reject record. Please try again.',
        icon: 'error',
      
      });
    }
  };

  const handleApprove = async (Document_Id, Verify_Id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to approve this document?',
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

  const handleViewDocument = (url, name) => {
    if (url && url !== 'N/A') {
      setViewingDoc(url);
      setViewingDocName(name);
    }
  };

  const handleFileUpload = (documentId, file) => {
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [documentId]: file
      }));
    }
  };

  const InfoRow = ({ label, value, valueColor = 'text-gray-800' }) => (
    <div className="mb-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${valueColor}`}>{value || 'N/A'}</p>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      verified: { color: 'bg-emerald-500', label: 'Verified', icon: CheckCircle },
      pending: { color: 'bg-amber-500', label: 'Pending', icon: Clock },
      rejected: { color: 'bg-rose-500', label: 'Rejected', icon: XCircle },
      uploaded: { color: 'bg-sky-500', label: 'Uploaded', icon: CheckCircle },
      'not uploaded': { color: 'bg-slate-400', label: 'Not Uploaded', icon: XCircle }
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`${config.color} text-white px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm`}>
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
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
            <h3 className="text-lg font-bold text-gray-800">{name}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(fullUrl, '_blank')}
                className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all"
                title="Open in new tab"
              >
                <Download className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-gray-100">
            {isPDF ? (
              <iframe
                src={fullUrl}
                className="w-full h-full min-h-[600px] border-0 rounded-2xl bg-white shadow-lg"
                title={name}
              />
            ) : (
              <img
                src={fullUrl}
                alt={name}
                className="max-w-full h-auto mx-auto rounded-2xl shadow-xl"
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const DocumentCard = ({ docStatus, documentId, Verification_Id, title, documentPath }) => {
    const hasDocument = documentPath && documentPath !== null;
    const hasUploadedFile = uploadedFiles[documentId];
    const displayStatus = hasDocument || hasUploadedFile;
    
    return (
      <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
        displayStatus
          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 hover:border-emerald-300 hover:shadow-md'
          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
      }`}>
        <div className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${displayStatus ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                <FileText className={`w-4 h-4 ${displayStatus ? 'text-emerald-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">{title}</h4>
                <p className="text-[10px] text-gray-500">
                  {displayStatus ? (hasUploadedFile ? 'Newly uploaded' : 'Available') : 'Not uploaded'}
                </p>
              </div>
            </div>
          </div>
          
          {displayStatus ? (
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => handleViewDocument(hasUploadedFile ? URL.createObjectURL(hasUploadedFile) : documentPath, title)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-semibold text-xs shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </button>

              {(docStatus == 1 && !hasUploadedFile) ? (
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-lg shadow-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
              ) : hasUploadedFile ? (
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg shadow-sm">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
              ) : (
                <button
                  onClick={() => handleApprove(documentId, Verification_Id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all font-semibold text-xs shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve
                </button>
              )}
            </div>
          ) : (
            <div className="mt-2">
              <label className="flex items-center justify-center gap-2 px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all cursor-pointer text-xs font-semibold shadow-sm">
                <FileText className="w-3.5 h-3.5" />
                Choose File
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileUpload(documentId, e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    );
  };

  const educationDocuments = [
    { title: '10th Certificate', path: localData?.documents?.['10th_certi'], marks: localData?.SSC_MARKS, documentId: 'tenth_cert', docStatus: localData?.documents?.Tenth_Status, Verification_Id: localData?.Verification_Id },
    { title: 'Intermediate Certificate', path: localData?.documents?.Inter_certi, marks: localData?.INTER_MARKS, documentId: 'inter_cert', docStatus: localData?.documents?.Inter_Status, Verification_Id: localData?.Verification_Id },
    { title: 'B.Tech/Degree Certificate', path: localData?.documents?.Gradu_certi, marks: localData?.BTECH_MARKS, documentId: 'grad_cert', docStatus: localData?.documents?.Grad_Status, Verification_Id: localData?.Verification_Id },
    { title: 'PG Certificate', path: localData?.documents?.PG_FILENAME, marks: localData?.PG_MARKS, documentId: 'pg_cert', docStatus: localData?.documents?.Pg_Status, Verification_Id: localData?.Verification_Id },
  ];

  const identityDocuments = [
    { title: 'Aadhar Card', path: localData?.documents?.Aadhar_certi, documentId: 'aadhar', docStatus: localData?.documents?.Aadhr_Status, Verification_Id: localData?.Verification_Id },
    { title: 'PAN Card', path: localData?.documents?.Pan_certi, documentId: 'pan', docStatus: localData?.documents?.Pan_Status, Verification_Id: localData?.Verification_Id },
  ];

  const professionalDocuments = [
    { title: 'Payslip', path: localData?.documents?.Payslip, documentId: 'payslip', docStatus: localData?.documents?.PaySlip_Status, Verification_Id: localData?.Verification_Id },
    { title: 'Experience Letter', path: localData?.documents?.Exp_Letter, documentId: 'exp_letter', docStatus: localData?.documents?.Exp_Status, Verification_Id: localData?.Verification_Id },
    { title: 'Relieving Letter', path: localData?.documents?.Relieving_Letter, documentId: 'relieving', docStatus: localData?.documents?.Reliv_Status, Verification_Id: localData?.Verification_Id },
  ];

  console.log('Local Data:', localData);
  console.log('Documents Object:', localData?.documents);
  console.log('Education Documents:', educationDocuments);
  console.log('Identity Documents:', identityDocuments);
  console.log('Professional Documents:', professionalDocuments);
  console.log('Uploaded Files:', uploadedFiles);

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'identity', label: 'Identity Documents', icon: IdCard },
    { id: 'education', label: 'Education Details', icon: GraduationCap },
    { id: 'professional', label: 'Professional Experience', icon: Briefcase },
    { id: 'verification', label: 'Verification Status', icon: FileCheck },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-3">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold mb-1">{data?.name || 'N/A'}</h2>
                <p className="text-indigo-100 text-xs flex items-center gap-2">
                  <span className="font-medium">Case ID:</span>
                  
                    {data?.CHILD_CASEID || 'N/A'}
                  
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white rounded-lg p-1.5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-gray-50 border-b px-4 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 font-semibold text-xs transition-all relative ${
                      activeTab === tab.id
                        ? 'text-indigo-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-gray-100">
            {activeTab === 'personal' && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoRow label="Email Address" value={data?.email} valueColor="text-indigo-600" />
                  <InfoRow label="Phone Number" value={data?.phone_number} />
                  <InfoRow label="Date of Birth" value={data?.dob} />
                  {/* <InfoRow label="Address" value={data?.ADDRESS} />
                  <InfoRow label="Submitted Date" value={data?.submitted_date} /> */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</p>
                    <StatusBadge status={data?.STATUS} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'identity' && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <IdCard className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Identity Documents</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <InfoRow label="Aadhar Number" value={data?.aadhar_number} />
                  <InfoRow label="PAN Number" value={data?.pan_number} />
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
            )}

            {activeTab === 'education' && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Education Details & Documents</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {educationDocuments.map((doc, index) => (
                    <div key={index} className="space-y-2">
                      <DocumentCard
                        docStatus={doc.docStatus}
                        documentId={doc.documentId}
                        Verification_Id={doc.Verification_Id}
                        title={doc.title}
                        documentPath={doc.path}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'professional' && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Professional Experience</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <InfoRow label="Previous Company" value={data?.PREVIOUS_COMPANY} />
                  <InfoRow label="Duration" value={data?.DURATION ? `${data.DURATION} months` : 'N/A'} />
                  <InfoRow label="Notice Period" value={data?.NOTICE_PERIOD ? `${data.NOTICE_PERIOD} days` : 'N/A'} />
                  <InfoRow label="Current CTC" value={data?.current_ctc ? `₹${data.current_ctc} LPA` : 'N/A'} valueColor="text-emerald-600" />
                  <InfoRow label="Expected CTC" value={data?.expected_ctc ? `₹${data.expected_ctc} LPA` : 'N/A'} valueColor="text-amber-600" />
                  <InfoRow label="Offer CTC" value={data?.offer_ctc ? `₹${data.offer_ctc} LPA` : 'N/A'} valueColor="text-purple-600" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {professionalDocuments.map((doc, index) => (
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
            )}

            {activeTab === 'verification' && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <FileCheck className="w-4 h-4 text-rose-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Verification Status & Remarks</h3>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Current Status</p>
                  <StatusBadge status={data?.STATUS} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add your remarks here..."
                    rows={4}
                    className="w-full border-2 border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-white px-4 py-3 flex justify-end gap-2 border-t shadow-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-bold text-sm text-gray-700 hover:bg-gray-100 transition-all border-2 border-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectSubmit}
              className="px-4 py-2 rounded-lg font-bold text-sm text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 transition-all shadow-md"
            >
              Reject
            </button>
            <button
              onClick={handleVerifySubmit}
              className="px-4 py-2 rounded-lg font-bold text-sm text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 transition-all shadow-md"
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

export default History;