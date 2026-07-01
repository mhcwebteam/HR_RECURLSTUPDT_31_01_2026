



import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { BadgeCheck, CheckCircle, Eye } from "lucide-react";
import { API_BASE_URL } from "../Config/Config";
import axios from "axios";
import axiosInstance from "../Config/axiosConfig";
import { useNavigate } from "react-router-dom";

const CandidateStackup = ({ caseId }) => {
  const [status, setStatus] = useState("");
  const [file, setFile] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState({});
  const [fileSizeError, setFileSizeError] = useState("");

  const [expCTC, setExpCTC] = useState("");
  const [offerLetterData, setOfferLetterData] = useState({});
  const [offeredCTC, setOfferedCTC] = useState('');

  const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};
  const navigate = useNavigate();

  const MAX_FILE_SIZE = 1 * 1024 * 1024;
  const ALLOWED_FILE_TYPE = "application/pdf";

  const isReadOnly = offerLetterData?.cand_aprvl_status === "Accept"

  const fetchOfrData = async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/emp-verify-drftdata`, {
        headers: { Authorization: `Bearer ${userToken.token}` },
      });

      const data = response?.data?.data;
      const allRecords = Array.isArray(data) ? data : [data];

      const record = allRecords.find(
        (item) => String(item?.child_caseid) === String(caseId)
      );

      setOfferLetterData(record || {});
    } catch (err) {
      console.error("Error fetching stackup data");
    }
  };

  useEffect(() => {
    if (userToken?.token && caseId) fetchOfrData();
  }, [userToken?.token, caseId]);

  // useEffect(() => {
  //   if (offerLetterData?.cand_aprvl_status === "Accept") {
  //     setStatus("Accept");
  //     setRemarks(offerLetterData?.cand_aprvl_remarks || "");
  //   }
  // }, [offerLetterData]);


  useEffect(() => {
  if (offerLetterData) {
    setStatus(offerLetterData.cand_aprvl_status || "");
    setRemarks(offerLetterData.cand_aprvl_remarks || "");
      setExpCTC(offerLetterData.cand_exp_ctc || "");
  }
}, [offerLetterData]);
  useEffect(() => {
    if (offerLetterData) {
      setOfferedCTC(
        offerLetterData.offer_ctc
          ? Number(offerLetterData.offer_ctc)
          : ''
      );
    }
  }, [offerLetterData]);

  const readonlyStyle = {
    backgroundColor: isReadOnly ? '#f3f4f6' : '#ffffff',
    cursor: isReadOnly ? 'not-allowed' : 'auto',
  };

  const formattedCTC = offeredCTC
    ? Number(offeredCTC).toLocaleString('en-IN')
    : '';

  const lakhs = offeredCTC
    ? (Number(offeredCTC) / 100000).toFixed(1)
    : '';

  const validateFile = (file) => {
    if (!file) return { isValid: true, error: "" };
    if (file.type !== ALLOWED_FILE_TYPE) {
      return { isValid: false, error: "Only PDF files are allowed" };
    }
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size must be less than 1MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      };
    }
    return { isValid: true, error: "" };
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileSizeError("");
    setErrors({});

    if (selectedFile) {
      const validation = validateFile(selectedFile);
      if (!validation.isValid) {
        setFileSizeError(validation.error);
        setFile(null);
        e.target.value = "";
      } else {
        setFile(selectedFile);
      }
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!status) newErrors.status = "Status is required";
    if (status == "Accept" && !file) newErrors.file = "Please upload duly signed PDF copy";
    if (!remarks.trim()) newErrors.remarks = "Remarks are required";
    setErrors(newErrors);
    setFileSizeError("");
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!validate()) return;

    const confirm = await Swal.fire({
      title: "Confirm Submission",
      text: `Are you sure you want to submit with status: ${status}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Submit!",
    });

    if (!confirm.isConfirmed) return;

    const formData = new FormData();
    formData.append("status", status);
    formData.append("remarks", remarks);
    formData.append("hiddenCaseId", userToken?.Emp_Id);
    if (file) formData.append("file", file);
    formData.append("CAND_EXP_CTC", expCTC);

    try {
      const res = await axiosInstance.post(`${API_BASE_URL}/cand-aprvl-updt`, formData, {
        headers: { Authorization: `Bearer ${userToken.token}` },
      });

      if (res.data?.success) {
        setRemarks("");
        setFile(null);
        setStatus("");
        setExpCTC("");
        setFileSizeError("");

        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: res.data.message || "Submitted successfully!",
          timer: 1500,
          showConfirmButton: false,
        });

        try {
          const LogoutResponse = await fetch(`${API_BASE_URL}/logout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${userToken.token}`,
            },
            body: JSON.stringify({}),
          });
          
          localStorage.setItem('userInfo', JSON.stringify({ Emp_Id: "", employee: "", token: "" }));
          navigate('/');
          
          if (!LogoutResponse.ok) throw new Error("Server is Not Responding Error 500");
        } catch (error) {
          console.error("Logout Failed 401");
        }
      } else {
        Swal.fire("Error", res.data?.message || "API failed", "error");
      }
    } catch (err) {
      if (err.response?.status === 413) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Please upload a file smaller than 1MB",
          confirmButtonColor: '#a855f7'
        });
      } else {
        Swal.fire("Error", err.response?.data?.message || err.message || "API failed", "error");
      }
    }
  };

  // Responsive Styles
  const styles = {
    container: {
      background: 'linear-gradient(to bottom right, #faf5ff, #f9f5ff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(8px, 3vw, 20px)',
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box'
    },
    card: {
      background: '#ffffff',
      borderRadius: 'clamp(12px, 4vw, 20px)',
      boxShadow: '0 4px 12px rgba(168, 85, 247, 0.15)',
      padding: 'clamp(16px, 5vw, 28px)',
      width: '100%',
      maxWidth: 'clamp(320px, 90%, 520px)',
      border: '3px solid #a855f7',
      margin: '0 auto',
      boxSizing: 'border-box'
    },
    title: {
      fontSize: 'clamp(16px, 5vw, 20px)',
      fontWeight: 'bold',
      marginBottom: 'clamp(16px, 4vw, 24px)',
      color: '#7c3aed',
      borderBottom: '2px solid #e9d5ff',
      paddingBottom: 'clamp(8px, 2vw, 12px)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    },
    label: {
      display: 'block',
      fontWeight: '600',
      marginBottom: 'clamp(6px, 2vw, 8px)',
      fontSize: 'clamp(13px, 3.5vw, 14px)',
      color: '#7c3aed'
    },
    select: {
      width: '100%',
      border: `2px solid ${errors.status ? '#ef4444' : '#e9d5ff'}`,
      borderRadius: 'clamp(8px, 2.5vw, 10px)',
      padding: 'clamp(8px, 2.5vw, 12px) clamp(12px, 3vw, 14px)',
      fontSize: 'clamp(13px, 3.5vw, 14px)',
      outline: 'none',
      boxSizing: 'border-box',
      ...readonlyStyle
    },
    input: {
      width: '100%',
      border: `2px solid ${errors.file || fileSizeError ? '#ef4444' : '#e9d5ff'}`,
      borderRadius: 'clamp(8px, 2.5vw, 10px)',
      padding: 'clamp(8px, 2.5vw, 12px) clamp(12px, 3vw, 14px)',
      fontSize: 'clamp(13px, 3.5vw, 14px)',
      outline: 'none',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      border: `2px solid ${errors.remarks ? '#ef4444' : '#e9d5ff'}`,
      borderRadius: 'clamp(8px, 2.5vw, 10px)',
      padding: 'clamp(8px, 2.5vw, 12px) clamp(12px, 3vw, 14px)',
      fontSize: 'clamp(13px, 3.5vw, 14px)',
      outline: 'none',
      resize: isReadOnly ? 'none' : 'vertical',
      boxSizing: 'border-box',
      ...readonlyStyle
    },
    button: {
      width: '100%',
      background: isReadOnly ? '#d8b4fe' : '#a855f7',
      color: '#ffffff',
      padding: 'clamp(10px, 3vw, 14px)',
      borderRadius: 'clamp(8px, 2.5vw, 10px)',
      border: 'none',
      cursor: isReadOnly ? 'not-allowed' : 'pointer',
      fontSize: 'clamp(14px, 3.5vw, 16px)',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: '0 2px 4px rgba(168, 85, 247, 0.2)',
      transition: 'all 0.3s ease',
      WebkitTapHighlightColor: 'transparent'
    },
    fileInfo: {
      color: '#10b981',
      fontSize: 'clamp(11px, 3vw, 12px)',
      marginTop: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      flexWrap: 'wrap'
    },
    errorText: {
      color: '#ef4444',
      fontSize: 'clamp(11px, 3vw, 12px)',
      marginTop: '4px'
    },
    hintText: {
      color: '#6b7280',
      fontSize: 'clamp(10px, 2.5vw, 11px)',
      marginTop: '4px'
    },
    disabledInput: {
      width: '100%',
      padding: 'clamp(8px, 2.5vw, 12px)',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      fontSize: 'clamp(14px, 3.5vw, 15px)',
      backgroundColor: '#f1ebeb',
      color: '#6e6f71',
      cursor: 'not-allowed',
      boxSizing: 'border-box'
    },
    section: {
      marginBottom: 'clamp(12px, 4vw, 18px)'
    },
    badge: {
      marginLeft: 'auto',
      fontSize: 'clamp(10px, 3vw, 11px)',
      background: '#d1fae5',
      color: '#065f46',
      padding: '2px 8px',
      borderRadius: '12px',
      fontWeight: '600',
      whiteSpace: 'nowrap'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          <BadgeCheck size={18} color="#7c3aed" />
          Candidate Stackup Approval
          {isReadOnly && (
            <span style={styles.badge}>
              ✓ Accepted
            </span>
          )}
        </h2>

        {/* Status */}
        <div style={styles.section}>
          <label style={styles.label}>
            Status <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            value={status}
            disabled={isReadOnly}
            onChange={(e) => {
              const value = e.target.value;
              setStatus(value);
              setFile(null);
              setRemarks("");
              setErrors({});
              setFileSizeError("");
            }}
            style={styles.select}
            onFocus={(e) => !isReadOnly && !errors.status && (e.target.style.borderColor = '#a855f7')}
            onBlur={(e) => !isReadOnly && !errors.status && (e.target.style.borderColor = '#e9d5ff')}
          >
            <option value="">Select Status</option>
            <option value="Accept">Accept</option>
            <option value="Modify">Negotiation</option>
            <option value="Reject">Reject</option>
          </select>
          {errors.status && <p style={styles.errorText}>{errors.status}</p>}
        </div>

        {/* File Upload */}
        <div style={styles.section}>
          <label style={styles.label}>
            File Upload (PDF only) {status == "Accept" && <span style={{ color: '#ef4444' }}>*</span>}
          </label>

 {/* Existing Document */}
{offerLetterData?.cand_aprvl_file && (
  <div
    style={{
      padding: "clamp(8px, 2.5vw, 12px)",
      background: "#f3f4f6",
      borderRadius: "8px",
      fontSize: "clamp(12px, 3.5vw, 13px)",
      color: "#6b7280",
      border: "2px solid #e9d5ff",
      wordBreak: "break-all",
      marginBottom: "10px",
    }}
  >
    📄 {offerLetterData.cand_aprvl_file.split("/").pop()}

    <div style={{ marginTop: "6px" }}>
      <a
        href={offerLetterData.cand_aprvl_file}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "#1e40af",
          fontWeight: "600",
          textDecoration: "none",
          fontSize: "clamp(12px, 3.5vw, 13px)",
        }}
      >
        <Eye size={14} color="#1e40af" strokeWidth={3} />
        <span>View Current Document</span>
      </a>
    </div>
  </div>
)}

{/* File Upload */}
<input
  type="file"
  key={status}
  accept=".pdf"
  disabled={isReadOnly}
  onChange={handleFileChange}
  style={{
    ...styles.input,
    ...(isReadOnly
      ? {
          backgroundColor: "#f3f4f6",
          cursor: "not-allowed",
        }
      : {}),
  }}
  onFocus={(e) =>
    !isReadOnly &&
    !errors.file &&
    !fileSizeError &&
    (e.target.style.borderColor = "#a855f7")
  }
  onBlur={(e) =>
    !isReadOnly &&
    !errors.file &&
    !fileSizeError &&
    (e.target.style.borderColor = "#e9d5ff")
  }
/>

{/* Selected File */}
{file && !isReadOnly && (
  <p style={styles.fileInfo}>
    <CheckCircle size={12} />
    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
  </p>
)}

{fileSizeError && (
  <p style={styles.errorText}>{fileSizeError}</p>
)}

{errors.file && !fileSizeError && (
  <p style={styles.errorText}>{errors.file}</p>
)}

{!isReadOnly && (
  <p style={styles.hintText}>
    PDF only, Max size: 1MB
  </p>
)}
        </div>

        {/* Modify Date */}
        {status === "Modify" && (
          <div style={styles.section}>
            <label style={styles.label}>
              Candidate Expected CTC <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number"
              name="expCTC"
              value={expCTC}
              onChange={(e) => {
                setExpCTC(e.target.value);
                setErrors({});
              }}
              placeholder="Enter Expected CTC"
              style={{
                width: '100%',
                padding: 'clamp(8px, 2.5vw, 12px)',
                borderRadius: '6px',
                border: errors.expCTC ? '1px solid #ef4444' : '1px solid #ccc',
                fontSize: 'clamp(12px, 3.5vw, 14px)',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        {/* Proposed CTC */}
        <div style={styles.section}>
          <label style={styles.label}>
            Proposed CTC <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            value={formattedCTC}
            disabled
            style={styles.disabledInput}
          />
          {offeredCTC && (
            <div style={styles.hintText}>
              ({lakhs} Lakhs) per annum
            </div>
          )}
        </div>

        {/* Remarks */}
        <div style={styles.section}>
          <label style={styles.label}>
            Remarks <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            rows="3"
            value={remarks}
            disabled={isReadOnly}
            onChange={(e) => { setRemarks(e.target.value); setErrors({}); }}
            style={styles.textarea}
            onFocus={(e) => !isReadOnly && !errors.remarks && (e.target.style.borderColor = '#a855f7')}
            onBlur={(e) => !isReadOnly && !errors.remarks && (e.target.style.borderColor = '#e9d5ff')}
          />
          {errors.remarks && <p style={styles.errorText}>{errors.remarks}</p>}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isReadOnly}
          style={styles.button}
          onMouseEnter={(e) => !isReadOnly && (e.currentTarget.style.background = '#9333ea')}
          onMouseLeave={(e) => !isReadOnly && (e.currentTarget.style.background = '#a855f7')}
          onTouchStart={(e) => !isReadOnly && (e.currentTarget.style.background = '#9333ea')}
          onTouchEnd={(e) => !isReadOnly && (e.currentTarget.style.background = '#a855f7')}
        >
          <CheckCircle size={16} />
          {isReadOnly ? 'Already Accepted' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default CandidateStackup;