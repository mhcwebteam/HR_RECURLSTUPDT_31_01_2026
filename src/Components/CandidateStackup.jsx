import { useState,useMemo } from "react";
import Swal from "sweetalert2";
import { BadgeCheck, CheckCircle } from "lucide-react";
import { API_BASE_URL } from "../Config/Config";
import axios from "axios";
const CandidateStackup = () => {
  const [status, setStatus] = useState("");
  const [file, setFile] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState({});



  const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};




  const validate = () => {
    let newErrors = {};

    if (!status) {
      newErrors.status = "Status is required";
    }

    if (status !== "Reject" && !file) {
      newErrors.file = "Please upload duly signed copy";
    }

    if (!remarks.trim()) {
      newErrors.remarks = "Remarks are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

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

  console.log("Sending data:");
 

  try {
    const response = await axios.post(
      `${API_BASE_URL}/cand-aprvl-updt`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${userToken.token}`,
        },
      }
    );

    console.log("API response:", response.data);
setRemarks("");
setFile(null);
setStatus("");





         Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Submitted successfully!',
          timer: 1500,
          showConfirmButton: false,
        });
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "API failed", "error");
  }
};



  return (
    <div style={{ 
      background: 'linear-gradient(to bottom right, #faf5ff, #f9f5ff)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '12px' 
    }}>
      <div style={{ 
        background: '#ffffff', 
        borderRadius: '12px', 
        boxShadow: '0 4px 12px rgba(168, 85, 247, 0.15)', 
        padding: '20px', 
        width: '100%', 
        maxWidth: '450px', 
        border: '3px solid #a855f7' 
      }}>
        <h2 style={{ 
  fontSize: '16px', 
  fontWeight: 'bold', 
  marginBottom: '16px',
  color: '#7c3aed',
  borderBottom: '2px solid #e9d5ff',
  paddingBottom: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}}>
  <BadgeCheck size={18} color="#7c3aed" />
  Candidate Stackup Approval
</h2>

        {/* Status */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            display: 'block', 
            fontWeight: '600', 
            marginBottom: '6px',
            fontSize: '13px',
            color: '#7c3aed'
          }}>
            Status <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setErrors({});
            }}
            style={{
              width: '100%',
              border: `2px solid ${errors.status ? '#ef4444' : '#e9d5ff'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => !errors.status && (e.target.style.borderColor = '#a855f7')}
            onBlur={(e) => !errors.status && (e.target.style.borderColor = '#e9d5ff')}
          >
            <option value="">Select Status</option>
            <option value="Accept">Accept</option>
            <option value="Modify">Modify</option>
            <option value="Reject">Reject</option>
          </select>
          {errors.status && (
            <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
              {errors.status}
            </p>
          )}
        </div>

        {/* File */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            display: 'block', 
            fontWeight: '600', 
            marginBottom: '6px',
            fontSize: '13px',
            color: '#7c3aed'
          }}>
            File Upload{" "}
            {status !== "Reject" && (
              <span style={{ color: '#ef4444' }}>*</span>
            )}
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setErrors({});
            }}
            style={{
              width: '100%',
              border: `2px solid ${errors.file ? '#ef4444' : '#e9d5ff'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => !errors.file && (e.target.style.borderColor = '#a855f7')}
            onBlur={(e) => !errors.file && (e.target.style.borderColor = '#e9d5ff')}
          />
          {errors.file && (
            <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
              {errors.file}
            </p>
          )}
        </div>

        {/* Remarks */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            fontWeight: '600', 
            marginBottom: '6px',
            fontSize: '13px',
            color: '#7c3aed'
          }}>
            Remarks <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            rows="3"
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              setErrors({});
            }}
            style={{
              width: '100%',
              border: `2px solid ${errors.remarks ? '#ef4444' : '#e9d5ff'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              outline: 'none',
              resize: 'vertical',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => !errors.remarks && (e.target.style.borderColor = '#a855f7')}
            onBlur={(e) => !errors.remarks && (e.target.style.borderColor = '#e9d5ff')}
          />
          {errors.remarks && (
            <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
              {errors.remarks}
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            background: '#a855f7',
            color: '#ffffff',
          padding: '10px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background 0.2s',
    
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
            boxShadow: '0 2px 4px rgba(168, 85, 247, 0.2)'
          }}
          onMouseEnter={(e) => e.target.style.background = '#9333ea'}
          onMouseLeave={(e) => e.target.style.background = '#a855f7'}
        >
             <CheckCircle size={16} />
          Submit
        </button>
      </div>
    </div>
  );
};

export default CandidateStackup;