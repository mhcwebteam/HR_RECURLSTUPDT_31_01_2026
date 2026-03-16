import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  User, Mail, Phone, Briefcase, GraduationCap, FileUp, Send,
  X, Eye, Download, FileText, Check, CheckCircle, XCircle, Clock,
  Maximize2, ChevronUp, ChevronDown, Calendar, MapPin, IdCard,
  FileCheck, Hash, Home, BookOpen, Award, Globe, Users, CreditCard,
  Shield, FileSignature, Building, DollarSign, AlertCircle, Heart,
  ThumbsUp, ThumbsDown, MessageCircle, UserCheck, PenTool, Map, Flag,
  CreditCard as CreditCardIcon, Book, PhoneCall, Info,
  Droplet
} from 'lucide-react';
import { API_BASE_URL, API_BASE_URLss } from '../Config/Config';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const VerificationDetailsModal = ({ open, onClose, data, onStatusChange, refersh }) => {
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  const [remarks, setRemarks] = useState('');
  const [viewingDoc, setViewingDoc] = useState(null);
  const [viewingDocName, setViewingDocName] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [approvedDocs, setApprovedDocs] = useState({});
  const [rejectedDocs, setRejectedDocs] = useState({});
  const [loading, setLoading] = useState(false);
  const [sameAsPermanent, setSameAsPermanent] = useState(data?.DESIG === 'YES');
const navigate = useNavigate();
  // Section collapse states
  const [openSections, setOpenSections] = useState({
    basicInfo: true,
    education: false,
    experience: false
  });

  console.log("Verification Data:", data);

  useEffect(() => {
    setSameAsPermanent(data?.DESIG === 'YES');

    // Initialize approved/rejected docs from existing statuses
    const initialApproved = {};
    const initialRejected = {};

    if (data?.documents) {
      // Map document IDs to their status
      const docStatusMap = {
        Aadhar_DocId: 'Aadhr_Status',
        pan_DocId: 'Pan_Status',
        photo_DocId: 'photo_Status',
        RESUME_DocId: 'RESUME_Status',
        UAN_DocId: 'UAN_Status',
        Tenth_DocId: 'Tenth_Status',
        Inter_DocId: 'Inter_Status',
        grad_DocId: 'Grad_Status',
        pg_DocId: 'Pg_Status',
        PHD_DocId: 'PHD_Status',
        OTHER_DocId: 'OTHER_Status'
      };

      Object.entries(docStatusMap).forEach(([docIdKey, statusKey]) => {
        if (data.documents[docIdKey]) {
          const docId = data.documents[docIdKey];
          const status = data.documents[statusKey];
          if (status === "1" || status === 1) {
            initialApproved[docId] = true;
          } else if (status === "2" || status === 2) {
            initialRejected[docId] = true;
          }
        }
      });
    }

    setApprovedDocs(initialApproved);
    setRejectedDocs(initialRejected);
  }, [data]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleViewDocument = (url, name) => {
    if (url && url !== 'N/A' && url !== null) {
      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URLss}${url}`;
      setViewingDoc(fullUrl);
      setViewingDocName(name);
    }
  };

  const handleApprove = async (documentId, title, documentPath, type = 'document', expId = null) => {
    const result = await Swal.fire({
      title: 'Approve Document?',
      text: `Are you sure you want to approve ${title}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      let payload = {};

      if (type === 'document') {
        payload.Document_Id = documentId;
        payload.Verification_Id = data?.Verification_Id;
      } else if (type === 'payslip') {
        payload.EMP_PAYSLIP_ID = documentId;
        payload.PAYSLIP_STATUS = "1";
      } else if (type === 'experience') {
        payload.EMP_COMP_ID = expId;
        if (title.includes('Bank Statement')) {
          payload.BANK_STATEMENT_DOC_STATUS = "1";
        } else if (title.includes('Offer Letter')) {
          payload.OFFER_LETTER_STATUS = "1";
        } else if (title.includes('Relieving Letter')) {
          payload.RELIEV_DOC_STATUS = "1";
        } else if (title.includes('Experience Letter')) {
          payload.EXPERIENCE_DOC_STATUS = "1";
        }
      }

      setApprovedDocs(prev => ({ ...prev, [documentId]: true }));
      setRejectedDocs(prev => {
        const newState = { ...prev };
        delete newState[documentId];
        return newState;
      });

      await axios.post(`${API_BASE_URL}/verify-Doc-Status`, payload, {
        headers: {
          Authorization: `Bearer ${userToken.token}`,
          'Content-Type': 'application/json',
        },
      });

      await Swal.fire({
        icon: 'success',
        title: 'Approved!',
        text: `${title} has been approved.`,
        timer: 1500,
        showConfirmButton: false,
      });

    } catch (error) {
      console.error("Approval error:", error);
      setApprovedDocs(prev => {
        const newState = { ...prev };
        delete newState[documentId];
        return newState;
      });

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to approve document. Please try again.',
      });
    }
  };

  const handleReject = async () => {
    if (!remarks || remarks.trim() === "") {
      return Swal.fire({
        icon: "warning",
        title: "Remarks Required",
        text: "Please enter rejection remarks.",
      });
    }

    const result = await Swal.fire({
      title: "Reject Verification?",
      text: "Are you sure you want to reject this verification?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Reject",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    try {
      const payload = {
        CHILD_CASEID: data?.CHILD_CASEID,
        remarks,
      };

      const response = await axios.post(
        `${API_BASE_URL}/delete-verification-case`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${userToken.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Rejected!',
          text: response.data.message,
          timer: 1500,
          showConfirmButton: false,
        });

        if (refersh) await refersh();
        setRemarks('');
        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: response.data?.message || "Something went wrong",
        });
      }
    } catch (error) {
      console.error("Reject Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || "Server error occurred",
      });
    }
  };

  const handleSubmit = async () => {
    const hasApproved = Object.values(approvedDocs).some(status => status === true);

    if (!hasApproved) {
      return Swal.fire({
        title: "Approval Required",
        text: "Please approve at least one document before submitting!",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
    }

    const result = await Swal.fire({
      title: "Submit Verification?",
      text: "Are you sure you want to submit this verification?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Submit",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const payload = {
        child_caseId: data?.CHILD_CASEID,
        remarks,
      };

      const response = await axios.post(`${API_BASE_URL}/verify-update`, payload, {
        headers: {
          Authorization: `Bearer ${userToken.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Verification submitted successfully!',
          timer: 1500,
          showConfirmButton: false,
        });

        if (refersh) await refersh();
        setRemarks('');
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to submit verification. Please try again.',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const DocumentViewer = ({ url, name, onClose }) => {
    if (!url) return null;
    const isPDF = url.toLowerCase().endsWith('.pdf');

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              {name}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-lg">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-gray-100">
            {isPDF ? (
              <iframe src={url} className="w-full h-full min-h-[600px] border-0 rounded-lg" title={name} />
            ) : (
              <img src={url} alt={name} className="max-w-full h-auto mx-auto rounded-lg" />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Custom Input Field with Approve Button
  const FieldWithApprove = ({ label, value, documentId, documentPath, fieldName, icon: Icon }) => {
    const isApproved = approvedDocs[documentId];
    const isRejected = rejectedDocs[documentId];

    return (
      <div style={{ position: 'relative', marginBottom: '8px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>
          {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '2px 8px',
            height: '32px',
            border: `1.5px solid ${isApproved ? '#10b981' : isRejected ? '#ef4444' : '#93c5fd'}`,
            borderRadius: '6px',
            background: '#f9f9f9',
          }}>
            {Icon && <Icon size={14} color="#1e40af" />}
            <span style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: '500' }}>
              {value || 'N/A'}
            </span>
          </div>

          {documentPath && (
            <button
              onClick={() => handleViewDocument(documentPath, label)}
              style={{
                padding: '6px 10px',
                background: '#dbeafe',
                border: 'none',
                borderRadius: '6px',
                color: '#1e40af',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: '600'
              }}
            >
              <Eye size={14} /> View
            </button>
          )}

          {documentId && !isApproved && !isRejected && (
            <button
              onClick={() => handleApprove(documentId, label, documentPath)}
              style={{
                padding: '6px 12px',
                background: '#10b981',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: '600'
              }}
            >
              <ThumbsUp size={14} /> Approve
            </button>
          )}

          {isApproved && (
            <span style={{
              padding: '6px 12px',
              background: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '6px',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              <CheckCircle size={14} /> Approved
            </span>
          )}

          {isRejected && (
            <span style={{
              padding: '6px 12px',
              background: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              <XCircle size={14} /> Rejected
            </span>
          )}
        </div>
      </div>
    );
  };

  // Select Field with Approve Button
  const SelectFieldWithApprove = ({ label, value, documentId, documentPath, fieldName, icon: Icon }) => {
    const isApproved = approvedDocs[documentId];
    const isRejected = rejectedDocs[documentId];

    return (
      <div style={{ marginBottom: '8px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>
          {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '2px 8px',
            height: '32px',
            border: `1.5px solid ${isApproved ? '#10b981' : isRejected ? '#ef4444' : '#93c5fd'}`,
            borderRadius: '6px',
            background: '#f9f9f9',
          }}>
            {Icon && <Icon size={14} color="#1e40af" />}
            <span style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: '500' }}>
              {value || 'N/A'}
            </span>
          </div>

          {documentPath && (
            <button
              onClick={() => handleViewDocument(documentPath, label)}
              style={{
                padding: '6px 10px',
                background: '#dbeafe',
                border: 'none',
                borderRadius: '6px',
                color: '#1e40af',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: '600'
              }}
            >
              <Eye size={14} /> View
            </button>
          )}

          {documentId && !isApproved && !isRejected && (
            <button
              onClick={() => handleApprove(documentId, label, documentPath)}
              style={{
                padding: '6px 12px',
                background: '#10b981',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: '600'
              }}
            >
              <ThumbsUp size={14} /> Approve
            </button>
          )}

          {isApproved && (
            <span style={{
              padding: '6px 12px',
              background: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '6px',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              <CheckCircle size={14} /> Approved
            </span>
          )}
        </div>
      </div>
    );
  };

  // File Upload Field with Approve Button
  const FileFieldWithApprove = ({ label, documentPath, documentId, fieldName }) => {
    const isApproved = approvedDocs[documentId];
    const isRejected = rejectedDocs[documentId];

    return (
      <div style={{ marginBottom: '8px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>
          {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '2px 8px',
            height: '32px',
            border: `1.5px dashed ${isApproved ? '#10b981' : isRejected ? '#ef4444' : '#93c5fd'}`,
            borderRadius: '6px',
            background: '#f0f7ff',
          }}>
            <span style={{ fontSize: '11px', color: '#1e3a8a' }}>
              {documentPath ? '📄 Doc Available' : 'No file uploaded'}
            </span>
            {documentPath && (
              <button
                onClick={() => handleViewDocument(documentPath, label)}
                style={{
                  padding: '6px 10px',
                  background: '#dbeafe',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#1e40af',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                <Eye size={14} />
              </button>
            )}
          </div>



          {documentId && !isApproved && !isRejected && documentPath && (
            <button
              onClick={() => handleApprove(documentId, label, documentPath)}
              style={{
                padding: '6px 12px',
                background: '#10b981',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: '600'
              }}
            >
              <ThumbsUp size={14} /> Approve
            </button>
          )}

          {isApproved && (
            <span style={{
              padding: '6px 12px',
              background: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '6px',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              <CheckCircle size={14} /> Approved
            </span>
          )}
        </div>
      </div>
    );
  };

  const sectionHeading = {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#1e40af',
    borderBottom: '2px solid #dbeafe',
    paddingBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className={`bg-white rounded-2xl ${isMaximized ? 'w-full h-full' : 'max-w-7xl w-full max-h-[90vh]'} overflow-hidden shadow-2xl flex flex-col`}>

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{data?.NAME || 'N/A'}</h2>
              <p className="text-blue-100 text-sm">
                {data?.EMAIL || 'N/A'} | {data?.PHONE_NUMBER || 'N/A'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMaximized(!isMaximized)} className="p-2 hover:bg-blue-500 rounded-lg">
                <Maximize2 size={18} />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-lg">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable Content - EXACT Recruitment Form UI */}
          <div className="overflow-y-auto flex-1 p-6 bg-gray-50">
            <div style={{
              maxWidth: '100%',
              width: '100%',
              margin: '0 auto',
              padding: '8px',
              borderRadius: '10px',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
              border: '3px solid #87b5ee',
              background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe, #eff6ff)'
            }}>

              {/* ================= BASIC INFORMATION ================= */}
              <div style={{
                background: 'linear-gradient(160deg, #fafafa 0%, #ffffff 40%, #ffffff 100%)',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(30,64,175,0.08)',
                padding: '8px',
                border: '1.5px solid rgba(147,197,253,0.6)',
                marginBottom: '8px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: 'linear-gradient(90deg, #1e40af 0%, #2563eb 25%, #3b82f6 50%, #0ea5e9 75%, #06b6d4 100%)',
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h2 style={{
                    ...sectionHeading,
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    background: 'linear-gradient(90deg, #1e3a8a, #1d4ed8, #0284c7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <User size={16} />
                    Basic Information
                  </h2>
                  <button onClick={() => toggleSection('basicInfo')} style={{
                    background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                    border: 'none', color: '#fff', borderRadius: '6px',
                    width: '20px', height: '20px', fontSize: '9px', fontWeight: '700',
                    cursor: 'pointer'
                  }}>
                    {openSections.basicInfo ? '▲' : '▼'}
                  </button>
                </div>

                {openSections.basicInfo && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px' }}>

                      {/* Row 1: Case Info */}
                      <FieldWithApprove
                        label="Child Case ID"
                        value={data?.CHILD_CASEID}
                        icon={Hash}
                      />
                      <FieldWithApprove
                        label="Plant"
                        value={data?.PLANT}
                        icon={Building}
                      />
                      <FieldWithApprove
                        label="Department"
                        value={data?.DEPT}
                        icon={Briefcase}
                      />
                      <FieldWithApprove
                        label="Name *"
                        value={data?.NAME}
                        icon={User}
                      />

                      {/* Row 2: Personal Info */}
                      <SelectFieldWithApprove
                        label="Gender *"
                        value={data?.GENDER}
                        icon={Users}
                      />

                      <SelectFieldWithApprove
                        label="Marital Status *"
                        value={data?.MARITAL_STATUS}
                        icon={Heart}
                      />

                      <FieldWithApprove
                        label="Languages Known *"
                        value={data?.LANG_KNOWN}
                        icon={Globe}
                      />

                      <FieldWithApprove
                        label="Mother Tongue *"
                        value={data?.MOTHER_TONGUE}
                        icon={Book}
                      />

                      {/* Row 3: Contact Info */}
                      <FieldWithApprove
                        label="Email *"
                        value={data?.EMAIL}
                        icon={Mail}
                      />

                      <FieldWithApprove
                        label="Phone Number *"
                        value={data?.PHONE_NUMBER}
                        icon={Phone}
                      />

                      <FieldWithApprove
                        label="Emergency Contact *"
                        value={data?.EMER_CONTACT_NUM}
                        icon={PhoneCall}
                      />

                      {/* Row 4: DOB & Age */}
                      <FieldWithApprove
                        label="DOB (as per original) *"
                        value={data?.ORIGINAL_DOB}
                        icon={Calendar}
                      />

                      <FieldWithApprove
                        label="DOB (as per Aadhar) *"
                        value={data?.DOB_ASPER_ADHAR}

                        icon={Calendar}
                      />

                      <FieldWithApprove
                        label="Age"
                        value={data?.AGE}
                        icon={Award}
                      />

                      <FieldWithApprove
                        label="Highest Qualification *"
                        value={data?.HIGHEST_QUA}
                        icon={GraduationCap}
                      />

                      {/* Row 5: ID Numbers */}
                      <FieldWithApprove
                        label="Aadhaar Number *"
                        value={data?.AADHAR_NUMBER}

                        icon={IdCard}
                      />

                      <FieldWithApprove
                        label="PAN Number *"
                        value={data?.PAN_NUM}
                        icon={CreditCard}
                      />

                      <FieldWithApprove
                        label="UAN Number *"
                        value={data?.UAN_NUM}

                        icon={Shield}
                      />

                      <FieldWithApprove
                        label="ESI Number *"
                        value={data?.ESI_NUM}
                        icon={CreditCardIcon}
                      />

                      {/* Row 6: Source Info */}
                      <SelectFieldWithApprove
                        label="Source *"
                        value={data?.SRC_TYPE}
                        icon={Info}
                      />

                      {data?.SRC_TYPE === "reference" && (
                        <>
                          <FieldWithApprove
                            label="Reference Name *"
                            value={data?.SRC_REFER_NAME}
                            icon={UserCheck}
                          />
                          <FieldWithApprove
                            label="Reference Dept *"
                            value={data?.SRC_REFER_DEPT}
                            icon={Building}
                          />
                        </>
                      )}

                      {/* Row 7: Blood Group */}
                      <SelectFieldWithApprove
                        label="Blood Group"
                        value={data?.BLOOD_GROUP}
                        icon={Droplet}
                      />

                      {/* Row 8: Passport & License */}
                      <FieldWithApprove
                        label="Passport Number"
                        value={data?.PASSPORT_NUMBER}
                        documentId={data?.documents?.PASSPORT_DocId}
                        documentPath={data?.documents?.PASSPORT_FILE}
                        icon={FileSignature}
                      />

                      {data?.PASSPORT_NUMBER && (
                        <FieldWithApprove
                          label="Passport Expiry Date *"
                          value={data?.PASSPORT_EXPIRY}
                          icon={Calendar}
                        />
                      )}

                      <FieldWithApprove
                        label="Driving Licence Number"
                        value={data?.DRIVING_LICENSE}
                        documentId={data?.documents?.LICENSE_DocId}
                        documentPath={data?.documents?.LICENSE_FILE}
                        icon={IdCard}
                      />

                      {data?.DRIVING_LICENSE && (
                        <FieldWithApprove
                          label="Driving Licence Expiry *"
                          value={data?.DRIVING_LICENSE_EXPIRY}
                          icon={Calendar}
                        />
                      )}
                    </div>

                    {/* ADDRESS SECTION */}
                    <div style={{ marginTop: '12px', borderTop: '1px solid rgba(147,197,253,0.45)', paddingTop: '8px' }}>

                      {/* Permanent Address */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                          <h3 style={{ fontSize: '11px', fontWeight: '700', color: '#1d4ed8', padding: '2px 10px', background: 'rgba(37,99,235,0.10)', border: '1.5px solid rgba(59,130,246,0.35)', borderRadius: '20px' }}>
                            Permanent Address <span style={{ color: '#ef4444' }}>*</span>
                          </h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '6px' }}>
                          <FieldWithApprove label="H.No / Street" value={data?.HNO} icon={Home} />
                          <FieldWithApprove label="Village / City" value={data?.CITY} icon={Map} />
                          <FieldWithApprove label="Mandal" value={data?.MANDAL} icon={MapPin} />
                          <FieldWithApprove label="District" value={data?.DISTRICT} icon={Flag} />
                          <FieldWithApprove label="State" value={data?.STATE} icon={Globe} />
                          <FieldWithApprove label="Pincode" value={data?.PINCODE} icon={Hash} />
                        </div>
                      </div>

                      {/* Same as Permanent Radio */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af' }}>Same as Permanent Address?</span>
                        <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input type="radio" checked={sameAsPermanent === true} disabled /> Yes
                        </label>
                        <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input type="radio" checked={sameAsPermanent === false} disabled /> No
                        </label>
                      </div>

                      {/* Present Address */}
                      {!sameAsPermanent && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: '700', color: '#1d4ed8', padding: '2px 10px', background: 'rgba(37,99,235,0.10)', border: '1.5px solid rgba(59,130,246,0.35)', borderRadius: '20px' }}>
                              Present Address <span style={{ color: '#ef4444' }}>*</span>
                            </h3>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '6px' }}>
                            <FieldWithApprove label="H.No / Street" value={data?.PRESENT_HNO} icon={Home} />
                            <FieldWithApprove label="Village / City" value={data?.PRESENT_CITY} icon={Map} />
                            <FieldWithApprove label="Mandal" value={data?.PRESENT_MANDAL} icon={MapPin} />
                            <FieldWithApprove label="District" value={data?.PRESENT_DISTRICT} icon={Flag} />
                            <FieldWithApprove label="State" value={data?.PRESENT_STATE} icon={Globe} />
                            <FieldWithApprove label="Pincode" value={data?.PRESENT_PINCODE} icon={Hash} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* DOCUMENT UPLOADS SECTION */}
                    <div style={{
                      marginTop: '12px',
                      padding: '8px',
                      background: 'linear-gradient(135deg, #ffffff, #f0f7ff)',
                      borderRadius: '8px',
                      border: '1.5px dashed #71acef',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <FileUp size={13} color="#0f3f8b" />
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#0f3f8b', textTransform: 'uppercase' }}>
                          Document Uploads
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                        <FileFieldWithApprove
                          label="Aadhaar Card *"
                          documentPath={data?.documents?.Aadhar_certi}
                          documentId={data?.documents?.Aadhar_DocId}
                        />

                        <FileFieldWithApprove
                          label="Resume with Sign *"
                          documentPath={data?.documents?.RESUME_UPLOAD}
                          documentId={data?.documents?.RESUME_DocId}
                        />

                        <FileFieldWithApprove
                          label="PAN Card *"
                          documentPath={data?.documents?.Pan_certi}
                          documentId={data?.documents?.pan_DocId}
                        />

                        <FileFieldWithApprove
                          label="Photo *"
                          documentPath={data?.documents?.photo}
                          documentId={data?.documents?.photo_DocId}
                        />

                        <FileFieldWithApprove
                          label="UAN Document"
                          documentPath={data?.documents?.UAN_FILE}
                          documentId={data?.documents?.UAN_DocId}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ================= EDUCATION DETAILS ================= */}
              <div style={{
                background: '#f8fbff',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(30,64,175,0.08)',
                padding: '8px',
                border: '1px solid #dbeafe',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    color: '#1e3a8a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <GraduationCap size={15} />
                    Education Details
                  </h2>
                  <button onClick={() => toggleSection('education')} style={{
                    background: '#1e40af', border: 'none', color: '#fff',
                    borderRadius: '5px', width: '20px', height: '20px',
                    fontSize: '9px', fontWeight: '700', cursor: 'pointer'
                  }}>
                    {openSections.education ? '▲' : '▼'}
                  </button>
                </div>

                {openSections.education && (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: 'rgb(115, 164, 244)', color: '#ffffff' }}>
                          <th style={{ padding: '8px' }}>Qualification</th>
                          <th style={{ padding: '8px' }}>School/College</th>
                          <th style={{ padding: '8px' }}>University/Board</th>
                          <th style={{ padding: '8px' }}>Per (%)</th>
                          <th style={{ padding: '8px' }}>Passed Year</th>
                          <th style={{ padding: '8px' }}>Certificate</th>
                          <th style={{ padding: '8px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* SSC */}
                        <tr style={{ background: '#ffffff' }}>
                          <td style={{ padding: '6px' }}>
                            <span style={{ padding: '4px 8px', background: '#e0edff', borderRadius: '16px', fontSize: '11px', fontWeight: '600', color: '#1d4ed8' }}>
                              SSC (10th) *
                            </span>
                          </td>
                          <td style={{ padding: '6px' }}>{data?.SSC_SCHOOL_NAME || 'N/A'}</td>
                          <td style={{ padding: '6px' }}>{data?.SSC_BOARD || 'N/A'}</td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>{data?.SSC_MARKS || 'N/A'}</td>
                          <td style={{ padding: '6px' }}>{data?.SSC_PASSED_YEAR || 'N/A'}</td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>
                            {data?.documents?.['10th_certi'] ? (
                              <button onClick={() => handleViewDocument(data?.documents['10th_certi'], '10th Certificate')}
                                style={{ padding: '4px 8px', background: '#dbeafe', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                <Eye size={14} />
                              </button>
                            ) : 'N/A'}
                          </td>
                          <td style={{ padding: '6px' }}>
                            {data?.documents?.Tenth_DocId && !approvedDocs[data.documents.Tenth_DocId] && (
                              <button onClick={() => handleApprove(data.documents.Tenth_DocId, '10th Certificate', data.documents['10th_certi'])}
                                style={{ padding: '4px 10px', background: '#10b981', border: 'none', borderRadius: '4px', color: 'white', fontSize: '11px', cursor: 'pointer' }}>
                                Approve
                              </button>
                            )}
                            {data?.documents?.Tenth_DocId && approvedDocs[data.documents.Tenth_DocId] && (
                              <span style={{ color: '#10b981', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={14} /> Approved
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* Intermediate */}
                        <tr style={{ background: '#f9f9f9' }}>
                          <td style={{ padding: '6px' }}>
                            <span style={{ padding: '4px 8px', background: '#e0edff', borderRadius: '16px', fontSize: '11px', fontWeight: '600', color: '#1d4ed8' }}>
                              Intermediate *
                            </span>
                          </td>
                          <td style={{ padding: '6px' }}>{data?.INTER_COLLEGE_NAME || 'N/A'}</td>
                          <td style={{ padding: '6px' }}>{data?.INTER_BOARD || 'N/A'}</td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>{data?.INTER_MARKS || 'N/A'}</td>
                          <td style={{ padding: '6px' }}>{data?.INTER_PASSED_YEAR || 'N/A'}</td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>
                            {data?.documents?.Inter_certi ? (
                              <button onClick={() => handleViewDocument(data.documents.Inter_certi, 'Intermediate Certificate')}
                                style={{ padding: '4px 8px', background: '#dbeafe', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                <Eye size={14} />
                              </button>
                            ) : 'N/A'}
                          </td>
                          <td style={{ padding: '6px' }}>
                            {data?.documents?.Inter_DocId && !approvedDocs[data.documents.Inter_DocId] && (
                              <button onClick={() => handleApprove(data.documents.Inter_DocId, 'Intermediate Certificate', data.documents.Inter_certi)}
                                style={{ padding: '4px 10px', background: '#10b981', border: 'none', borderRadius: '4px', color: 'white', fontSize: '11px', cursor: 'pointer' }}>
                                Approve
                              </button>
                            )}
                            {data?.documents?.Inter_DocId && approvedDocs[data.documents.Inter_DocId] && (
                              <span style={{ color: '#10b981', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={14} /> Approved
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* Graduation */}
                        <tr style={{ background: '#ffffff' }}>
                          <td style={{ padding: '6px' }}>
                            <span style={{ padding: '4px 8px', background: '#e0edff', borderRadius: '16px', fontSize: '11px', fontWeight: '600', color: '#1d4ed8' }}>
                              Degree/B.Tech *
                            </span>
                          </td>
                          <td style={{ padding: '6px' }}>{data?.GRAD_COLLEGE_NAME || 'N/A'}</td>
                          <td style={{ padding: '6px' }}>{data?.DEGREE_UNIVERSITY || 'N/A'}</td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>{data?.BTECH_MARKS || 'N/A'}</td>
                          <td style={{ padding: '6px' }}>{data?.DEGREE_PASSED_YEAR || 'N/A'}</td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>
                            {data?.documents?.Gradu_certi ? (
                              <button onClick={() => handleViewDocument(data.documents.Gradu_certi, 'Degree Certificate')}
                                style={{ padding: '4px 8px', background: '#dbeafe', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                <Eye size={14} />
                              </button>
                            ) : 'N/A'}
                          </td>
                          <td style={{ padding: '6px' }}>
                            {data?.documents?.grad_DocId && !approvedDocs[data.documents.grad_DocId] && (
                              <button onClick={() => handleApprove(data.documents.grad_DocId, 'Degree Certificate', data.documents.Gradu_certi)}
                                style={{ padding: '4px 10px', background: '#10b981', border: 'none', borderRadius: '4px', color: 'white', fontSize: '11px', cursor: 'pointer' }}>
                                Approve
                              </button>
                            )}
                            {data?.documents?.grad_DocId && approvedDocs[data.documents.grad_DocId] && (
                              <span style={{ color: '#10b981', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={14} /> Approved
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* PG (Optional) */}
                        {data?.PG_COLLEGE_NAME && (
                          <tr style={{ background: '#f9f9f9' }}>
                            <td style={{ padding: '6px' }}>
                              <span style={{ padding: '4px 8px', background: '#e0edff', borderRadius: '16px', fontSize: '11px', fontWeight: '600', color: '#1d4ed8' }}>
                                PG
                              </span>
                            </td>
                            <td style={{ padding: '6px' }}>{data?.PG_COLLEGE_NAME}</td>
                            <td style={{ padding: '6px' }}>{data?.PG_UNIVERSITY}</td>
                            <td style={{ padding: '6px', textAlign: 'center' }}>{data?.PG_MARKS}</td>
                            <td style={{ padding: '6px' }}>{data?.PG_PASSED_YEAR}</td>
                            <td style={{ padding: '6px', textAlign: 'center' }}>
                              {data?.documents?.Pg_certi && (
                                <button onClick={() => handleViewDocument(data.documents.Pg_certi, 'PG Certificate')}
                                  style={{ padding: '4px 8px', background: '#dbeafe', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                  <Eye size={14} />
                                </button>
                              )}
                            </td>
                            <td style={{ padding: '6px' }}>
                              {data?.documents?.pg_DocId && !approvedDocs[data.documents.pg_DocId] && (
                                <button onClick={() => handleApprove(data.documents.pg_DocId, 'PG Certificate', data.documents.Pg_certi)}
                                  style={{ padding: '4px 10px', background: '#10b981', border: 'none', borderRadius: '4px', color: 'white', fontSize: '11px', cursor: 'pointer' }}>
                                  Approve
                                </button>
                              )}
                              {data?.documents?.pg_DocId && approvedDocs[data.documents.pg_DocId] && (
                                <span style={{ color: '#10b981', fontSize: '11px' }}>✓ Approved</span>
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ================= EXPERIENCE DETAILS ================= */}
              <div style={{
                background: 'linear-gradient(160deg, #ffffff 0%, #feffff 40%, #fbfbfb 100%)',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(30,64,175,0.08)',
                padding: '14px',
                border: '1.5px solid rgba(147,197,253,0.6)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h2 style={{
                    ...sectionHeading,
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    background: 'linear-gradient(90deg, #1e3a8a, #1d4ed8, #0284c7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <Briefcase size={16} />
                    Experience Details
                  </h2>
                  <button onClick={() => toggleSection('experience')} style={{
                    background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                    border: 'none', color: '#fff', borderRadius: '6px',
                    width: '22px', height: '22px', fontSize: '9px', fontWeight: '700',
                    cursor: 'pointer'
                  }}>

                    {openSections.experience ? '▲' : '▼'}
                  </button>
                </div>

                {openSections.experience && (
                  <>{data?.experienceData?.map((exp, index) => (
                    <div key={index} style={{
                      marginBottom: '10px',
                      padding: '10px',
                      border: '1.5px solid rgba(147,197,253,0.5)',
                      borderRadius: '10px',
                      background: exp.END_DATE === new Date().toISOString().split('T')[0] ? '#f0f7ff' : '#ffffff'
                    }}>
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{
                          padding: '2px 10px',
                          background: exp.END_DATE === new Date().toISOString().split('T')[0] ? 'rgba(37,99,235,0.10)' : 'rgba(147,197,253,0.20)',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: exp.END_DATE === new Date().toISOString().split('T')[0] ? '#1d4ed8' : '#3b82f6'
                        }}>
                          {exp.END_DATE === new Date().toISOString().split('T')[0] ? 'Current Company' : `Company ${index + 1}`}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                        <FieldWithApprove label="Company Name" value={exp.COMPANY_NAME} icon={Building} />
                        <FieldWithApprove label="Designation" value={exp.DESIGNATION} icon={Briefcase} />
                        <FieldWithApprove label="From Date" value={exp.START_DATE} icon={Calendar} />
                        <FieldWithApprove label="To Date" value={exp.END_DATE === new Date().toISOString().split('T')[0] ? 'Present' : exp.END_DATE} icon={Calendar} />
                      </div>

                      {/* Experience Documents */}
                      {exp.END_DATE === new Date().toISOString().split('T')[0] && (
                        <div style={{
                          marginTop: '8px',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '8px',
                          padding: '8px',
                          background: 'rgba(255,255,255,0.8)',
                          borderRadius: '8px',
                          border: '1px dashed #93c5fd'
                        }}>
                          {exp.payslips?.map((payslip, pIdx) => (
                            <FileFieldWithApprove
                              key={payslip.EMP_PAYSLIP_ID || pIdx}
                              label={`Payslip ${pIdx + 1}`}
                              documentPath={payslip.PAYSLIP_FILE}
                              documentId={payslip.EMP_PAYSLIP_ID}
                            />
                          ))}

                          {exp.OFFER_LETTER_DOC && (
                            <FileFieldWithApprove
                              label="Offer Letter"
                              documentPath={exp.OFFER_LETTER_DOC}
                              documentId={exp.OFFER_DOC_ID}
                            />
                          )}

                          {exp.RELIVING_LETTER_DOC && (
                            <FileFieldWithApprove
                              label="Relieving Letter"
                              documentPath={exp.RELIVING_LETTER_DOC}
                              documentId={exp.RELIEVING_DOC_ID}
                            />
                          )}

                          {exp.EXPERIENCE_DOC && (
                            <FileFieldWithApprove
                              label="Experience Letter"
                              documentPath={exp.EXPERIENCE_DOC}
                              documentId={exp.EXP_DOC_ID}
                            />
                          )}

                          {exp.BANK_STATEMENT_DOC && (
                            <FileFieldWithApprove
                              label="Bank Statement"
                              documentPath={exp.BANK_STATEMENT_DOC}
                              documentId={exp.BANK_STATEMENT_DOC_ID}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                    {/* CTC Information */}
                    <div style={{
                      marginTop: '12px',
                      padding: '10px',
                      background: 'rgba(37,99,235,0.05)',
                      borderRadius: '8px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '8px'
                    }}>
                      <FieldWithApprove label="Current CTC" value={data?.CURRENT_CTC ? `₹${data.CURRENT_CTC}` : 'N/A'} icon={DollarSign} />
                      <FieldWithApprove label="Expected CTC" value={data?.EXP_CTC ? `₹${data.EXP_CTC}` : 'N/A'} icon={DollarSign} />
                      <FieldWithApprove label="Notice Period" value={data?.NOTICE_PERIOD ? `${data.NOTICE_PERIOD} days` : 'N/A'} icon={Clock} />
                    </div>
                  </>
                )}
              </div>

              {/* ================= REMARKS SECTION ================= */}
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: '#fff',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MessageCircle size={16} color="#4b5563" />
                  <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Verification Remarks</h3>
                </div>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add verification remarks here..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '12px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white px-6 py-4 flex justify-end gap-3 border-t">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
      <button
  onClick={() => {
    localStorage.setItem('VerifyPreviewPage', JSON.stringify({ data, sameAsPermanent }));
    navigate('/VerifyPreviewPage');
  }}
  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
>
  <Eye className="w-4 h-4" />
  Preview
</button>
            <button onClick={handleReject} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 flex items-center gap-2">
              <XCircle size={16} /> Reject
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle size={16} /> {loading ? 'Submitting...' : 'Verify & Submit'}
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