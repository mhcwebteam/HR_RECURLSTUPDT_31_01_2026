





// import { useState, useEffect } from "react";
// import Swal from "sweetalert2";
// import { FileCheck, CheckCircle } from "lucide-react";
// import { API_BASE_URL } from "../Config/Config";
// import axios from "axios";

// const CandidateApproval = ({ caseId }) => {
//   const [status, setStatus] = useState("");
//   const [file, setFile] = useState(null);
//   const [remarks, setRemarks] = useState("");
//   const [errors, setErrors] = useState({});
//   const [modifyDate, setModifyDate] = useState("");
//   const [offerLetterData, setOfferLetterData] = useState({});
//   const [fileSizeError, setFileSizeError] = useState("");

//   const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};

//   const MAX_FILE_SIZE = 1 * 1024 * 1024;
//   const ALLOWED_FILE_TYPE = "application/pdf";

//   // ✅ Readonly when ofrLetterStatus === "Accept"
//   const isReadOnly = offerLetterData?.ofrLetterStatus === "Accept";

//   const fetchOfrData = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/emp-verify-drftdata`, {
//         headers: { Authorization: `Bearer ${userToken.token}` },
//       });

//       const data = response?.data?.data;
//       const allRecords = Array.isArray(data) ? data : [data];

//       const record = allRecords.find(
//         (item) => String(item?.child_caseid) === String(caseId)
//       );

//       setOfferLetterData(record || {});
//     } catch (err) {
//       console.error("Error In Fetching Offer List");
//     }
//   };

//   useEffect(() => {
//     if (userToken?.token && caseId) fetchOfrData();
//   }, [userToken?.token, caseId]);

//   // ✅ Populate fields when readonly
//   useEffect(() => {
//     if (offerLetterData?.ofrLetterStatus === "Accept") {
//       setStatus("Accept");
//       setRemarks(offerLetterData?.ofrLetterRemarks || "");
//     }
//   }, [offerLetterData]);

//   const readonlyStyle = {
//     backgroundColor: isReadOnly ? '#f3f4f6' : '#ffffff',
//     cursor: isReadOnly ? 'not-allowed' : 'auto',
//   };

//   const validateFile = (file) => {
//     if (!file) return { isValid: true, error: "" };
//     if (file.type !== ALLOWED_FILE_TYPE) {
//       return { isValid: false, error: "Only PDF files are allowed" };
//     }
//     if (file.size > MAX_FILE_SIZE) {
//       return {
//         isValid: false,
//         error: `File size must be less than 1MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
//       };
//     }
//     return { isValid: true, error: "" };
//   };

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     setFileSizeError("");
//     setErrors({});
//     if (selectedFile) {
//       const validation = validateFile(selectedFile);
//       if (!validation.isValid) {
//         setFileSizeError(validation.error);
//         setFile(null);
//         e.target.value = "";
//       } else {
//         setFile(selectedFile);
//       }
//     }
//   };

//   const validate = () => {
//     let newErrors = {};
//     if (!status) newErrors.status = "Status is required";
//     if (status !== "Reject" && !file) newErrors.file = "Please upload duly signed PDF copy";
//     if (status === "Modify" && !modifyDate) newErrors.modifyDate = "Modify joining date is required";
//     if (!remarks.trim()) newErrors.remarks = "Remarks are required";
//     setErrors(newErrors);
//     setFileSizeError("");
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (isReadOnly) return;
//     if (!validate()) return;

//     const confirm = await Swal.fire({
//       title: "Confirm Submission",
//       text: `Are you sure you want to submit with status: ${status}?`,
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Yes, Submit!",
//     });

//     if (!confirm.isConfirmed) return;

//     const formData = new FormData();
//     formData.append("ofrLetterStatus", status);
//     formData.append("ofrLetterRemarks", remarks);
//     formData.append("hiddenCaseId", userToken?.Emp_Id);
//     if (file) formData.append("file", file);
//     if (status === "Modify") formData.append("Candid_Reqstd_Join_date", modifyDate);

//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/candOfrStatusUpdt`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${userToken?.token}`,
//             Accept: "application/json",
//           },
//         }
//       );

//       const data = response.data;

//       if (data?.success) {
//         await Swal.fire({
//           icon: "success",
//           title: "Success!",
//           text: data.message,
//           timer: 1500,
//           showConfirmButton: false,
//         });
//         setStatus("");
//         setFile(null);
//         setRemarks("");
//         setModifyDate("");
//         setErrors({});
//         setFileSizeError("");
//         fetchOfrData(); // ✅ Refresh → auto goes readonly
//       } else {
//         Swal.fire("Error!", data?.message || "Something went wrong", "error");
//       }
//     } catch (error) {
//       console.error(error);
//       Swal.fire("Oops...", "Something went wrong!", "error");
//     }
//   };

//   return (
//     <div style={{
//       background: 'linear-gradient(to bottom right, #ecfdf5, #f0fdf4)',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '12px'
//     }}>
//       <div style={{
//         background: '#ffffff',
//         borderRadius: '12px',
//         boxShadow: '0 4px 12px rgba(52, 211, 153, 0.15)',
//         padding: '20px',
//         width: '100%',
//         maxWidth: '450px',
//         border: '3px solid #34d399'
//       }}>

//         {/* Title */}
//         <h2 style={{
//           fontSize: '16px',
//           fontWeight: 'bold',
//           marginBottom: '16px',
//           color: '#047857',
//           borderBottom: '2px solid #d1fae5',
//           paddingBottom: '8px',
//           display: 'flex',
//           alignItems: 'center',
//           gap: '8px'
//         }}>
//           <FileCheck size={18} color="#047857" />
//           Candidate Offer Approval
//           {/* ✅ Accepted badge */}
//           {isReadOnly && (
//             <span style={{
//               marginLeft: 'auto',
//               fontSize: '11px',
//               background: '#d1fae5',
//               color: '#065f46',
//               padding: '2px 8px',
//               borderRadius: '12px',
//               fontWeight: '600'
//             }}>
//               ✓ Accepted
//             </span>
//           )}
//         </h2>

//         {/* Status */}
//         <div style={{ marginBottom: '12px' }}>
//           <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#047857' }}>
//             Status <span style={{ color: '#ef4444' }}>*</span>
//           </label>
//           <select
//             value={status}
//             disabled={isReadOnly}
//             onChange={(e) => { setStatus(e.target.value); setErrors({}); setFileSizeError(""); }}
//             style={{
//               width: '100%',
//               border: `2px solid ${errors.status ? '#ef4444' : '#d1fae5'}`,
//               borderRadius: '8px',
//               padding: '8px 12px',
//               fontSize: '13px',
//               outline: 'none',
//               transition: 'border-color 0.2s',
//               ...readonlyStyle
//             }}
//             onFocus={(e) => !isReadOnly && !errors.status && (e.target.style.borderColor = '#34d399')}
//             onBlur={(e) => !isReadOnly && !errors.status && (e.target.style.borderColor = '#d1fae5')}
//           >
//             <option value="">Select Status</option>
//             <option value="Accept">Accept</option>
//             <option value="Modify">Modify</option>
//             <option value="Reject">Reject</option>
//           </select>
//           {errors.status && (
//             <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.status}</p>
//           )}
//         </div>

//         {/* File Upload */}
//         <div style={{ marginBottom: '12px' }}>
//           <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#047857' }}>
//             Upload Signed Offer Letter (PDF){" "}
//             {status !== "Reject" && <span style={{ color: '#ef4444' }}>*</span>}
//           </label>

//           {/* ✅ Case 1: Readonly + file exists → clickable link */}
//           {isReadOnly && offerLetterData?.candidOfrLtrSigned ? (
//             <a
//               href={offerLetterData.candidOfrLtrSigned}
//               target="_blank"
//               rel="noreferrer"
//               style={{
//                 display: 'block',
//                 padding: '8px 12px',
//                 background: '#f3f4f6',
//                 borderRadius: '8px',
//                 fontSize: '13px',
//                 color: '#047857',
//                 border: '2px solid #d1fae5',
//                 textDecoration: 'underline'
//               }}
//             >
//               📄 View Uploaded File
//             </a>
//           ) : isReadOnly ? (
//             // ✅ Case 2: Readonly + no file → disabled input
//             <input
//               type="file"
//               disabled={true}
//               style={{
//                 width: '100%',
//                 border: '2px solid #d1fae5',
//                 borderRadius: '8px',
//                 padding: '8px 12px',
//                 fontSize: '13px',
//                 outline: 'none',
//                 backgroundColor: '#f3f4f6',
//                 cursor: 'not-allowed'
//               }}
//             />
//           ) : (
//             // ✅ Case 3: Editable → normal file input
//             <input
//               type="file"
//               accept=".pdf"
//               onChange={handleFileChange}
//               style={{
//                 width: '100%',
//                 border: `2px solid ${errors.file || fileSizeError ? '#ef4444' : '#d1fae5'}`,
//                 borderRadius: '8px',
//                 padding: '8px 12px',
//                 fontSize: '13px',
//                 outline: 'none',
//                 transition: 'border-color 0.2s',
//                 backgroundColor: '#ffffff'
//               }}
//               onFocus={(e) => !errors.file && !fileSizeError && (e.target.style.borderColor = '#34d399')}
//               onBlur={(e) => !errors.file && !fileSizeError && (e.target.style.borderColor = '#d1fae5')}
//             />
//           )}

//           {/* Selected file info */}
//           {file && !isReadOnly && (
//             <p style={{ color: '#10b981', fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
//               <CheckCircle size={12} />
//               Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
//             </p>
//           )}

//           {fileSizeError && (
//             <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{fileSizeError}</p>
//           )}
//           {errors.file && !fileSizeError && (
//             <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.file}</p>
//           )}
//           {!isReadOnly && (
//             <p style={{ color: '#6b7280', fontSize: '10px', marginTop: '4px' }}>PDF only, Max size: 1MB</p>
//           )}
//         </div>

//         {/* HR Date */}
//         <div style={{ marginBottom: '12px' }}>
//           <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#047857' }}>
//             HR Date
//           </label>
//           <input
//             type="date"
//             value={offerLetterData?.joiningDate || ""}
//             readOnly
//             style={{
//               width: '100%',
//               border: '2px solid #d1fae5',
//               borderRadius: '8px',
//               padding: '8px 12px',
//               fontSize: '13px',
//               outline: 'none',
//               backgroundColor: '#f3f4f6',
//               cursor: 'not-allowed'
//             }}
//           />
//         </div>

//         {/* Modify Joining Date */}
//         {status === "Modify" && (
//           <div style={{ marginBottom: '12px' }}>
//             <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#047857' }}>
//               Modify Joining Date <span style={{ color: '#ef4444' }}>*</span>
//             </label>
//             <input
//               type="date"
//               value={modifyDate}
//               disabled={isReadOnly}
//               onChange={(e) => { setModifyDate(e.target.value); setErrors({}); }}
//               style={{
//                 width: '100%',
//                 border: `2px solid ${errors.modifyDate ? '#ef4444' : '#d1fae5'}`,
//                 borderRadius: '8px',
//                 padding: '8px 12px',
//                 fontSize: '13px',
//                 outline: 'none',
//                 transition: 'border-color 0.2s',
//                 ...readonlyStyle
//               }}
//               onFocus={(e) => !isReadOnly && !errors.modifyDate && (e.target.style.borderColor = '#34d399')}
//               onBlur={(e) => !isReadOnly && !errors.modifyDate && (e.target.style.borderColor = '#d1fae5')}
//             />
//             {errors.modifyDate && (
//               <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.modifyDate}</p>
//             )}
//           </div>
//         )}

//         {/* Remarks */}
//         <div style={{ marginBottom: '16px' }}>
//           <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#047857' }}>
//             Remarks <span style={{ color: '#ef4444' }}>*</span>
//           </label>
//           <textarea
//             rows="3"
//             value={remarks}
//             disabled={isReadOnly}
//             onChange={(e) => { setRemarks(e.target.value); setErrors({}); }}
//             placeholder={isReadOnly ? "" : "Enter your remarks here..."}
//             style={{
//               width: '100%',
//               border: `2px solid ${errors.remarks ? '#ef4444' : '#d1fae5'}`,
//               borderRadius: '8px',
//               padding: '8px 12px',
//               fontSize: '13px',
//               outline: 'none',
//               resize: isReadOnly ? 'none' : 'vertical',
//               transition: 'border-color 0.2s',
//               fontFamily: 'inherit',
//               ...readonlyStyle
//             }}
//             onFocus={(e) => !isReadOnly && !errors.remarks && (e.target.style.borderColor = '#34d399')}
//             onBlur={(e) => !isReadOnly && !errors.remarks && (e.target.style.borderColor = '#d1fae5')}
//           />
//           {errors.remarks && (
//             <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.remarks}</p>
//           )}
//         </div>

//         {/* Submit Button */}
//         <button
//           onClick={handleSubmit}
//           disabled={isReadOnly}
//           style={{
//             width: '100%',
//             background: isReadOnly ? '#6ee7b7' : '#34d399',
//             color: '#ffffff',
//             padding: '10px',
//             borderRadius: '8px',
//             border: 'none',
//             cursor: isReadOnly ? 'not-allowed' : 'pointer',
//             fontSize: '14px',
//             fontWeight: '600',
//             transition: 'background 0.2s',
//             boxShadow: '0 2px 4px rgba(52, 211, 153, 0.2)',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             gap: '8px'
//           }}
//           onMouseEnter={(e) => !isReadOnly && (e.currentTarget.style.background = '#10b981')}
//           onMouseLeave={(e) => !isReadOnly && (e.currentTarget.style.background = '#34d399')}
//         >
//           <CheckCircle size={16} />
//           {isReadOnly ? 'Already Accepted' : 'Submit'}
//         </button>

//       </div>
//     </div>
//   );
// };

// export default CandidateApproval;





import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FileCheck, CheckCircle } from "lucide-react";
import { API_BASE_URL } from "../Config/Config";
import axios from "axios";

const CandidateApproval = ({ caseId }) => {
  const [status, setStatus] = useState("");
  const [file, setFile] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState({});
  const [modifyDate, setModifyDate] = useState("");
  const [offerLetterData, setOfferLetterData] = useState({});
  const [fileSizeError, setFileSizeError] = useState("");

  const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};

  const MAX_FILE_SIZE = 1 * 1024 * 1024;
  const ALLOWED_FILE_TYPE = "application/pdf";


  console.log(offerLetterData,":ofrrrr666666666666666");

  
// candidOfrLtrSigned


  // ✅ Readonly when ofrLetterStatus === "Accept"
  const isReadOnly = offerLetterData?.ofrLetterStatus === "Accept";

  const fetchOfrData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-verify-drftdata`, {
        headers: { Authorization: `Bearer ${userToken.token}` },
      });

      const data = response?.data?.data;
      const allRecords = Array.isArray(data) ? data : [data];

      const record = allRecords.find(
        (item) => String(item?.child_caseid) === String(caseId)
      );

      setOfferLetterData(record || {});
    } catch (err) {
      console.error("Error In Fetching Offer List");
    }
  };

  useEffect(() => {
    if (userToken?.token && caseId) fetchOfrData();
  }, [userToken?.token, caseId]);

  // ✅ Populate fields when readonly
  useEffect(() => {
    if (offerLetterData?.ofrLetterStatus === "Accept") {
      setStatus("Accept");
      setRemarks(offerLetterData?.ofrLetterRemarks || "");
    }
  }, [offerLetterData]);

  const readonlyStyle = {
    backgroundColor: isReadOnly ? '#f3f4f6' : '#ffffff',
    cursor: isReadOnly ? 'not-allowed' : 'auto',
  };

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

    console.log(selectedFile,"t555555555555555555555555555");
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
    if (status !== "Reject" && !file) newErrors.file = "Please upload duly signed PDF copy";
    if (status === "Modify" && !modifyDate) newErrors.modifyDate = "Modify joining date is required";
    if (!remarks.trim()) newErrors.remarks = "Remarks are required";
    setErrors(newErrors);
    setFileSizeError("");
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
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
    formData.append("ofrLetterStatus", status);
    formData.append("ofrLetterRemarks", remarks);
    formData.append("hiddenCaseId", userToken?.Emp_Id);
    if (file) formData.append("candidOfrLtrSigned", file);
    if (status === "Modify") formData.append("Candid_Reqstd_Join_date", modifyDate);

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

      const data = response.data;

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
        setModifyDate("");
        setErrors({});
        setFileSizeError("");
        fetchOfrData(); // ✅ Refresh → auto goes readonly
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

        {/* Title */}
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
          <FileCheck size={18} color="#047857" />
          Candidate Offer Approval
          {/* ✅ Accepted badge */}
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
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#047857' }}>
            Status <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            value={status}
            disabled={isReadOnly}
            onChange={(e) => { setStatus(e.target.value); setErrors({}); setFileSizeError(""); }}
            style={{
              width: '100%',
              border: `2px solid ${errors.status ? '#ef4444' : '#d1fae5'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.2s',
              ...readonlyStyle
            }}
            onFocus={(e) => !isReadOnly && !errors.status && (e.target.style.borderColor = '#34d399')}
            onBlur={(e) => !isReadOnly && !errors.status && (e.target.style.borderColor = '#d1fae5')}
          >
            <option value="">Select Status</option>
            <option value="Accept">Accept</option>
            <option value="Modify">Modify</option>
            <option value="Reject">Reject</option>
          </select>
          {errors.status && (
            <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.status}</p>
          )}
        </div>

        {/* File Upload */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#047857' }}>
            Upload Signed Offer Letter (PDF){" "}
            {status !== "Reject" && <span style={{ color: '#ef4444' }}>*</span>}
          </label>

          {/* ✅ Case 1: Readonly + file exists → clickable link */}
        {isReadOnly && offerLetterData?.candidOfrLtrSigned ? (
  <div
    style={{
      padding: '8px 12px',
      background: '#f3f4f6',
      borderRadius: '8px',
      fontSize: '13px',
      color: '#6b7280',
      border: '2px solid #d1fae5'
    }}
  >
    📄 {offerLetterData.candidOfrLtrSigned.split('/').pop()}
  </div>
) : isReadOnly ? (
  // ✅ Case 2: Readonly + no file → disabled input
  <input
    type="file"
    disabled={true}
    style={{
      width: '100%',
      border: '2px solid #d1fae5',
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '13px',
      outline: 'none',
      backgroundColor: '#f3f4f6',
      cursor: 'not-allowed'
    }}
            />
          ) : (
            // ✅ Case 3: Editable → normal file input
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{
                width: '100%',
                border: `2px solid ${errors.file || fileSizeError ? '#ef4444' : '#d1fae5'}`,
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: '#ffffff'
              }}
              onFocus={(e) => !errors.file && !fileSizeError && (e.target.style.borderColor = '#34d399')}
              onBlur={(e) => !errors.file && !fileSizeError && (e.target.style.borderColor = '#d1fae5')}
            />
          )}

          {/* Selected file info */}
          {file && !isReadOnly && (
            <p style={{ color: '#10b981', fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={12} />
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}

          {fileSizeError && (
            <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{fileSizeError}</p>
          )}
          {errors.file && !fileSizeError && (
            <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.file}</p>
          )}
          {!isReadOnly && (
            <p style={{ color: '#6b7280', fontSize: '10px', marginTop: '4px' }}>PDF only, Max size: 1MB</p>
          )}
        </div>

        {/* HR Date */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#047857' }}>
            HR Date
          </label>
          <input
            type="date"
            value={offerLetterData?.joiningDate || ""}
            readOnly
            style={{
              width: '100%',
              border: '2px solid #d1fae5',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#f3f4f6',
              cursor: 'not-allowed'
            }}
          />
        </div>

        {/* Modify Joining Date */}
        {status === "Modify" && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#047857' }}>
              Modify Joining Date <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="date"
              value={modifyDate}
              disabled={isReadOnly}
              onChange={(e) => { setModifyDate(e.target.value); setErrors({}); }}
              style={{
                width: '100%',
                border: `2px solid ${errors.modifyDate ? '#ef4444' : '#d1fae5'}`,
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
                outline: 'none',
                transition: 'border-color 0.2s',
                ...readonlyStyle
              }}
              onFocus={(e) => !isReadOnly && !errors.modifyDate && (e.target.style.borderColor = '#34d399')}
              onBlur={(e) => !isReadOnly && !errors.modifyDate && (e.target.style.borderColor = '#d1fae5')}
            />
            {errors.modifyDate && (
              <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.modifyDate}</p>
            )}
          </div>
        )}

        {/* Remarks */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#047857' }}>
            Remarks <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            rows="3"
            value={remarks}
            disabled={isReadOnly}
            onChange={(e) => { setRemarks(e.target.value); setErrors({}); }}
            placeholder={isReadOnly ? "" : "Enter your remarks here..."}
            style={{
              width: '100%',
              border: `2px solid ${errors.remarks ? '#ef4444' : '#d1fae5'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              outline: 'none',
              resize: isReadOnly ? 'none' : 'vertical',
              transition: 'border-color 0.2s',
              fontFamily: 'inherit',
              ...readonlyStyle
            }}
            onFocus={(e) => !isReadOnly && !errors.remarks && (e.target.style.borderColor = '#34d399')}
            onBlur={(e) => !isReadOnly && !errors.remarks && (e.target.style.borderColor = '#d1fae5')}
          />
          {errors.remarks && (
            <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.remarks}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isReadOnly}
          style={{
            width: '100%',
            background: isReadOnly ? '#6ee7b7' : '#34d399',
            color: '#ffffff',
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            cursor: isReadOnly ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background 0.2s',
            boxShadow: '0 2px 4px rgba(52, 211, 153, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => !isReadOnly && (e.currentTarget.style.background = '#10b981')}
          onMouseLeave={(e) => !isReadOnly && (e.currentTarget.style.background = '#34d399')}
        >
          <CheckCircle size={16} />
          {isReadOnly ? 'Already Accepted' : 'Submit'}
        </button>

      </div>
    </div>
  );
};

export default CandidateApproval;