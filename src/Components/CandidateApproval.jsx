import { useState, useMemo, useEffect  } from "react";
import Swal from "sweetalert2";
import { FileCheck ,CheckCircle  } from "lucide-react";
import { API_BASE_URL } from "../Config/Config";
import axios from "axios";

const CandidateApproval = () => {
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

const handleSubmit = async () => {
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
  formData.append("ofrLetterStatus", status);
  formData.append("ofrLetterRemarks", remarks);
  formData.append("hiddenCaseId", userToken?.Emp_Id);

  if (file) {
    formData.append("file", file);
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/candOfrStatusUpdt`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${userToken?.token}`,
          Accept: "application/json",
        
        },
      }
    );

    console.log(response, "API Response");

    const data = response.data; // ✅ Axios way

    if (data?.success) {
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: data.message,
        timer: 1500,
        showConfirmButton: false,
      });

      setStatus("");
      setFile(null);
      setRemarks("");
      setErrors({});
    } else {
      Swal.fire("Error!", data?.message || "Something went wrong", "error");
    }
  } catch (error) {
    console.error(error);
    Swal.fire("Oops...", "Something went wrong!", "error");
  }
};

  return (
    <div style={{ 
      background: 'linear-gradient(to bottom right, #ecfdf5, #f0fdf4)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '12px' 
    }}>
      <div style={{ 
        background: '#ffffff', 
        borderRadius: '12px', 
        boxShadow: '0 4px 12px rgba(52, 211, 153, 0.15)', 
        padding: '20px', 
        width: '100%', 
        maxWidth: '450px', 
        border: '3px solid #34d399' 
      }}>
        <h2 style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          color: '#047857',
          borderBottom: '2px solid #d1fae5',
          paddingBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FileCheck  size={18} color="#047857" />
          Candidate Offer Approval
        </h2>

        {/* Status */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            display: 'block', 
            fontWeight: '600', 
            marginBottom: '6px',
            fontSize: '13px',
            color: '#047857'
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
              border: `2px solid ${errors.status ? '#ef4444' : '#d1fae5'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => !errors.status && (e.target.style.borderColor = '#34d399')}
            onBlur={(e) => !errors.status && (e.target.style.borderColor = '#d1fae5')}
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
            color: '#047857'
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
              border: `2px solid ${errors.file ? '#ef4444' : '#d1fae5'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => !errors.file && (e.target.style.borderColor = '#34d399')}
            onBlur={(e) => !errors.file && (e.target.style.borderColor = '#d1fae5')}
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
            color: '#047857'
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
              border: `2px solid ${errors.remarks ? '#ef4444' : '#d1fae5'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              outline: 'none',
              resize: 'vertical',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => !errors.remarks && (e.target.style.borderColor = '#34d399')}
            onBlur={(e) => !errors.remarks && (e.target.style.borderColor = '#d1fae5')}
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
    background: '#34d399',
    color: '#ffffff',
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background 0.2s',
    boxShadow: '0 2px 4px rgba(52, 211, 153, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  }}
  onMouseEnter={(e) => e.target.style.background = '#10b981'}
  onMouseLeave={(e) => e.target.style.background = '#34d399'}
>
  <CheckCircle size={16} />
  Submit
</button>

      
      </div>
    </div>
  );
};

export default CandidateApproval;