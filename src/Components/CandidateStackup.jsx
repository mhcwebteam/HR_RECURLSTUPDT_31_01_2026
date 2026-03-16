import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { BadgeCheck, CheckCircle } from "lucide-react";
import { API_BASE_URL } from "../Config/Config";
import axios from "axios";

const CandidateStackup = ({ caseId }) => {
  const [status, setStatus] = useState("");
  const [file, setFile] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState({});
  const [modifyDate, setModifyDate] = useState("");
  const [offerLetterData, setOfferLetterData] = useState({});

  const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};

  const isReadOnly = offerLetterData?.cand_aprvl_status == "Accept";

  const fetchOfrData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-verify-drftdata`, {
        headers: { Authorization: `Bearer ${userToken.token}` },
      });

      const data = response?.data?.data;
      const allRecords = Array.isArray(data) ? data : [data];

      console.log("caseId prop received:", caseId);
      console.log("allRecords child_caseid values:", allRecords.map(i => i?.child_caseid));

      const record = allRecords.find(
        (item) => String(item?.child_caseid) === String(caseId)
      );

      console.log("matched record:", record);
      setOfferLetterData(record || {});
    } catch (err) {
      console.error("Error fetching stackup data");
    }
  };

  useEffect(() => {
    if (userToken?.token && caseId) fetchOfrData();
  }, [userToken?.token, caseId]);

  useEffect(() => {
    if (offerLetterData?.cand_aprvl_status === "Accept") {
      setStatus("Accept");
      setRemarks(offerLetterData?.cand_aprvl_remarks || "");
    }
  }, [offerLetterData]);

  const readonlyStyle = {
    backgroundColor: isReadOnly ? '#f3f4f6' : '#ffffff',
    cursor: isReadOnly ? 'not-allowed' : 'auto',
  };

  const validate = () => {
    let newErrors = {};
    if (!status) newErrors.status = "Status is required";
    if (status === "Modify" && !modifyDate) newErrors.modifyDate = "Modify date is required";
    if (status !== "Reject" && !file) newErrors.file = "Please upload duly signed copy";
    if (!remarks.trim()) newErrors.remarks = "Remarks are required";
    setErrors(newErrors);
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

    try {
      await axios.post(`${API_BASE_URL}/cand-aprvl-updt`, formData, {
        headers: { Authorization: `Bearer ${userToken.token}` },
      });

      setRemarks("");
      setFile(null);
      setStatus("");
      setModifyDate("");
  fetchOfrData();
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Submitted successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire("Error", "API failed", "error");
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(to bottom right, #faf5ff, #f9f5ff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(168, 85, 247, 0.15)',
        padding: '10px',
        width: '100%',
        maxWidth: '480px',
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
          {isReadOnly && (
            <span style={{
              marginLeft: 'auto',
              fontSize: '11px',
              background: '#d1fae5',
              color: '#065f46',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: '600'
            }}>
              ✓ Accepted
            </span>
          )}
        </h2>

        {/* Status */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#7c3aed' }}>
            Status <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            value={status}
            disabled={isReadOnly}
            onChange={(e) => { setStatus(e.target.value); setErrors({}); }}
            style={{
              width: '100%',
              border: `2px solid ${errors.status ? '#ef4444' : '#e9d5ff'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              outline: 'none',
              ...readonlyStyle
            }}
            onFocus={(e) => !isReadOnly && !errors.status && (e.target.style.borderColor = '#a855f7')}
            onBlur={(e) => !isReadOnly && !errors.status && (e.target.style.borderColor = '#e9d5ff')}
          >
            <option value="">Select Status</option>
            <option value="Accept">Accept</option>
            <option value="Modify">Modify</option>
            <option value="Reject">Reject</option>
          </select>
          {errors.status && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.status}</p>}
        </div>

        {/* File Upload */}
       <div style={{ marginBottom: '12px' }}>
  <label
    style={{
      display: 'block',
      fontWeight: '600',
      marginBottom: '6px',
      fontSize: '13px',
      color: '#7c3aed'
    }}
  >
    File Upload {status !== "Reject" && <span style={{ color: '#ef4444' }}>*</span>}
  </label>

  {isReadOnly && offerLetterData?.cand_aprvl_file ? (
  <div
    style={{
      padding: '8px 12px',
      background: '#f3f4f6',
      borderRadius: '8px',
      fontSize: '13px',
      color: '#6b7280',
      border: '2px solid #e9d5ff'
    }}
  >
    📄 {offerLetterData.cand_aprvl_file.split('/').pop()}
  </div>
  ) : (
    <input
      type="file"
      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      disabled={isReadOnly}
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
        ...readonlyStyle
      }}
    />
  )}

  {errors.file && (
    <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
      {errors.file}
    </p>
  )}
</div>
        {/* Modify Date */}
        {status === "Modify" && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#7c3aed' }}>
              Modify Date <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="date"
              value={modifyDate}
              disabled={isReadOnly}
              onChange={(e) => { setModifyDate(e.target.value); setErrors({ ...errors, modifyDate: "" }); }}
              style={{
                width: '100%',
                border: `2px solid ${errors.modifyDate ? '#ef4444' : '#e9d5ff'}`,
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
                outline: 'none',
                ...readonlyStyle
              }}
            />
            {errors.modifyDate && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.modifyDate}</p>}
          </div>
        )}

        {/* Remarks */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#7c3aed' }}>
            Remarks <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            rows="3"
            value={remarks}
            disabled={isReadOnly}
            onChange={(e) => { setRemarks(e.target.value); setErrors({}); }}
            style={{
              width: '100%',
              border: `2px solid ${errors.remarks ? '#ef4444' : '#e9d5ff'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              outline: 'none',
              resize: isReadOnly ? 'none' : 'vertical',
              ...readonlyStyle
            }}
            onFocus={(e) => !isReadOnly && !errors.remarks && (e.target.style.borderColor = '#a855f7')}
            onBlur={(e) => !isReadOnly && !errors.remarks && (e.target.style.borderColor = '#e9d5ff')}
          />
          {errors.remarks && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.remarks}</p>}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isReadOnly}
          style={{
            width: '100%',
            background: isReadOnly ? '#d8b4fe' : '#a855f7',
            color: '#ffffff',
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            cursor: isReadOnly ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(168, 85, 247, 0.2)'
          }}
          onMouseEnter={(e) => !isReadOnly && (e.currentTarget.style.background = '#9333ea')}
          onMouseLeave={(e) => !isReadOnly && (e.currentTarget.style.background = '#a855f7')}
        >
          <CheckCircle size={16} />
          {isReadOnly ? 'Already Accepted' : 'Submit'}
        </button>

      </div>
    </div>
  );
};

export default CandidateStackup;