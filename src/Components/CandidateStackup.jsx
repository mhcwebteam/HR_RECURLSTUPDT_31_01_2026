// import { useState, useMemo } from "react";
// import Swal from "sweetalert2";
// import { BadgeCheck, CheckCircle } from "lucide-react";
// import { API_BASE_URL } from "../Config/Config";
// import axios from "axios";

// const CandidateStackup = () => {
//   const [status, setStatus] = useState("");
//   const [file, setFile] = useState(null);
//   const [remarks, setRemarks] = useState("");
//   const [errors, setErrors] = useState({});
//   const [salary, setSalary] = useState("");

//   const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};

//   const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
//   const ALLOWED_FILE_TYPE = "application/pdf";

//   // File validation function
//   const validateFile = (file) => {
//     if (!file) return { valid: true, message: "" };
    
//     if (file.type !== ALLOWED_FILE_TYPE) {
//       return { valid: false, message: "Only PDF files are allowed" };
//     }
    
//     if (file.size > MAX_FILE_SIZE) {
//       return { valid: false, message: "File size must be less than 1MB" };
//     }
    
//     return { valid: true, message: "" };
//   };

//   const validate = () => {
//     let newErrors = {};

//     if (!status) {
//       newErrors.status = "Status is required";
//     }
    
//     if (status === "Modify" && !salary) {
//       newErrors.salary = "Expected salary is required";
//     }

//     if (status !== "Reject") {
//       if (!file) {
//         newErrors.file = "Please upload duly signed copy";
//       } else {
//         const fileValidation = validateFile(file);
//         if (!fileValidation.valid) {
//           newErrors.file = fileValidation.message;
//         }
//       }
//     }

//     if (!remarks.trim()) {
//       newErrors.remarks = "Remarks are required";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validate()) {
//       return;
//     }

//     const confirm = await Swal.fire({
//       title: "Confirm Submission",
//       text: `Are you sure you want to submit with status: ${status}?`,
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Yes, Submit!",
//     });

//     if (!confirm.isConfirmed) return;

//     const formData = new FormData();
//     formData.append("status", status);
//     formData.append("remarks", remarks);
//     formData.append("hiddenCaseId", userToken?.Emp_Id);

//     if (status === "Modify") {
//       formData.append("CandidSalaryModify", salary);
//     }

//     if (file) formData.append("file", file);

//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/cand-aprvl-updt`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${userToken.token}`,
//           },
//         }
//       );

//       setRemarks("");
//       setFile(null);
//       setStatus("");
//       setSalary("");

//       Swal.fire({
//         icon: "success",
//         title: "Success!",
//         text: "Submitted successfully!",
//         timer: 1500,
//         showConfirmButton: false,
//       });

//     } catch (err) {
//       Swal.fire("Error", "API failed", "error");
//     }
//   };

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
    
//     if (selectedFile) {
//       const fileValidation = validateFile(selectedFile);
      
//       if (!fileValidation.valid) {
//         Swal.fire({
//           icon: "error",
//           title: "Invalid File",
//           text: fileValidation.message,
//           confirmButtonColor: "#a855f7"
//         });
//         e.target.value = ""; // Clear the file input
//         setFile(null);
//       } else {
//         setFile(selectedFile);
//       }
//     } else {
//       setFile(null);
//     }
    
//     setErrors({});
//   };

//   return (
//     <div style={{ 
//       background: 'linear-gradient(to bottom right, #faf5ff, #f9f5ff)', 
//       display: 'flex', 
//       alignItems: 'center', 
//       justifyContent: 'center', 
//       padding: '2px'
//     }}>
//       <div style={{ 
//         background: '#ffffff', 
//         borderRadius: '12px', 
//         boxShadow: '0 4px 12px rgba(168, 85, 247, 0.15)', 
//         padding: '10px',
//         width: '100%', 
//         maxWidth: '480px',
//         border: '3px solid #a855f7' 
//       }}>
//         <h2 style={{ 
//           fontSize: '16px', 
//           fontWeight: 'bold', 
//           marginBottom: '16px',
//           color: '#7c3aed',
//           borderBottom: '2px solid #e9d5ff',
//           paddingBottom: '8px',
//           display: 'flex',
//           alignItems: 'center',
//           gap: '8px'
//         }}>
//           <BadgeCheck size={18} color="#7c3aed" />
//           Candidate Stackup Approval
//         </h2>

//         {/* Status */}
//         <div style={{ marginBottom: '12px' }}>
//           <label style={{ 
//             display: 'block', 
//             fontWeight: '600', 
//             marginBottom: '6px',
//             fontSize: '13px',
//             color: '#7c3aed'
//           }}>
//             Status <span style={{ color: '#ef4444' }}>*</span>
//           </label>
//           <select
//             value={status}
//             onChange={(e) => {
//               setStatus(e.target.value);
//               setErrors({});
//             }}
//             style={{
//               width: '100%',
//               border: `2px solid ${errors.status ? '#ef4444' : '#e9d5ff'}`,
//               borderRadius: '8px',
//               padding: '8px 12px',
//               fontSize: '13px',
//               outline: 'none',
//               transition: 'border-color 0.2s'
//             }}
//             onFocus={(e) => !errors.status && (e.target.style.borderColor = '#a855f7')}
//             onBlur={(e) => !errors.status && (e.target.style.borderColor = '#e9d5ff')}
//           >
//             <option value="">Select Status</option>
//             <option value="Accept">Accept</option>
//             <option value="Modify">Modify</option>
//             <option value="Reject">Reject</option>
//           </select>
//           {errors.status && (
//             <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
//               {errors.status}
//             </p>
//           )}
//         </div>

//         {/* File */}
//         <div style={{ marginBottom: '12px' }}>
//           <label style={{ 
//             display: 'block', 
//             fontWeight: '600', 
//             marginBottom: '6px',
//             fontSize: '13px',
//             color: '#7c3aed'
//           }}>
//             File Upload (PDF only, max 1MB){" "}
//             {status !== "Reject" && (
//               <span style={{ color: '#ef4444' }}>*</span>
//             )}
//           </label>
//           <input
//             type="file"
//             accept=".pdf"
//             onChange={handleFileChange}
//             style={{
//               width: '100%',
//               border: `2px solid ${errors.file ? '#ef4444' : '#e9d5ff'}`,
//               borderRadius: '8px',
//               padding: '8px 12px',
//               fontSize: '13px',
//               outline: 'none',
//               transition: 'border-color 0.2s'
//             }}
//             onFocus={(e) => !errors.file && (e.target.style.borderColor = '#a855f7')}
//             onBlur={(e) => !errors.file && (e.target.style.borderColor = '#e9d5ff')}
//           />
//           {errors.file && (
//             <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
//               {errors.file}
//             </p>
//           )}
//           {file && (
//             <p style={{ 
//               color: '#10b981', 
//               fontSize: '11px', 
//               marginTop: '4px' 
//             }}>
//               ✓ {file.name} ({(file.size / 1024).toFixed(2)} KB)
//             </p>
//           )}
//         </div>

//         {/* Modify Salary */}
//         {status === "Modify" && (
//           <div style={{ marginBottom: '12px' }}>
//             <label
//               style={{
//                 display: 'block',
//                 fontWeight: '600',
//                 marginBottom: '6px',
//                 fontSize: '13px',
//                 color: '#7c3aed'
//               }}
//             >
//               Candidate Expected Amount <span style={{ color: '#ef4444' }}>*</span>
//             </label>

//             <input
//               type="number"
//               value={salary}
//               onChange={(e) => {
//                 setSalary(e.target.value);
//                 setErrors({});
//               }}
//               placeholder="Enter expected salary"
//               style={{
//                 width: '100%',
//                 border: `2px solid ${errors.salary ? '#ef4444' : '#e9d5ff'}`,
//                 borderRadius: '8px',
//                 padding: '8px 12px',
//                 fontSize: '13px',
//                 outline: 'none',
//                 transition: 'border-color 0.2s'
//               }}
//               onFocus={(e) =>
//                 !errors.salary && (e.target.style.borderColor = '#a855f7')
//               }
//               onBlur={(e) =>
//                 !errors.salary && (e.target.style.borderColor = '#e9d5ff')
//               }
//             />

//             {errors.salary && (
//               <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
//                 {errors.salary}
//               </p>
//             )}
//           </div>
//         )}

//         {/* Remarks */}
//         <div style={{ marginBottom: '16px' }}>
//           <label style={{ 
//             display: 'block', 
//             fontWeight: '600', 
//             marginBottom: '6px',
//             fontSize: '13px',
//             color: '#7c3aed'
//           }}>
//             Remarks <span style={{ color: '#ef4444' }}>*</span>
//           </label>
//           <textarea
//             rows="3"
//             value={remarks}
//             onChange={(e) => {
//               setRemarks(e.target.value);
//               setErrors({});
//             }}
//             placeholder="Enter your remarks..."
//             style={{
//               width: '100%',
//               border: `2px solid ${errors.remarks ? '#ef4444' : '#e9d5ff'}`,
//               borderRadius: '8px',
//               padding: '8px 12px',
//               fontSize: '13px',
//               outline: 'none',
//               resize: 'vertical',
//               transition: 'border-color 0.2s'
//             }}
//             onFocus={(e) => !errors.remarks && (e.target.style.borderColor = '#a855f7')}
//             onBlur={(e) => !errors.remarks && (e.target.style.borderColor = '#e9d5ff')}
//           />
//           {errors.remarks && (
//             <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
//               {errors.remarks}
//             </p>
//           )}
//         </div>

//         <button
//           onClick={handleSubmit}
//           style={{
//             width: '100%',
//             background: '#a855f7',
//             color: '#ffffff',
//             padding: '10px',
//             borderRadius: '8px',
//             border: 'none',
//             cursor: 'pointer',
//             fontSize: '14px',
//             fontWeight: '600',
//             transition: 'background 0.2s',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             gap: '8px',
//             boxShadow: '0 2px 4px rgba(168, 85, 247, 0.2)'
//           }}
//           onMouseEnter={(e) => e.target.style.background = '#9333ea'}
//           onMouseLeave={(e) => e.target.style.background = '#a855f7'}
//         >
//           <CheckCircle size={16} />
//           Submit
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CandidateStackup;



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

  const isReadOnly = offerLetterData?.cand_aprvl_status === "Accept";

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







      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Submitted successfully!",
        timer: 1500,
        showConfirmButton: false,
      });



try {
        await fetch(`${API_BASE_URL}/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${userToken.token}`,
            },
            body: JSON.stringify({}),
        });
    } catch (err) {
        console.error("Logout error:", err);
    } finally {
        localStorage.setItem('userInfo', JSON.stringify({ Emp_Id: "", employee: "", token: "" }));
        window.location.href = '/';
    }

} catch (err) {
    // ✅ Show specific error based on status
    if (err.response?.status === 413) {
        Swal.fire({
            icon: "error",
            title: "File Too Large",
            text: "Please upload a file smaller than 5MB",
            confirmButtonColor: '#a855f7'
        });
    } else {
        Swal.fire("Error", err.response?.data?.message || "API failed", "error");
    }
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
