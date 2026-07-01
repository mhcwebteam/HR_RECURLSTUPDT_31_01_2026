





// import { useState, useEffect } from "react";
// import Swal from "sweetalert2";
// import { FileCheck, CheckCircle, Eye } from "lucide-react";
// import { API_BASE_URL } from "../Config/Config";
// import axios from "axios";
// import axiosInstance from "../Config/axiosConfig";
// import { useNavigate } from "react-router-dom";

// const CandidateApproval = ({ caseId }) => {
//   const [status, setStatus] = useState("");
//   const [file, setFile] = useState(null);
//   const [remarks, setRemarks] = useState("");
//   const [errors, setErrors] = useState({});
//   const [modifyDate, setModifyDate] = useState("");
//   const [offerLetterData, setOfferLetterData] = useState({});
//   const [fileSizeError, setFileSizeError] = useState("");

//  const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};

//  const navigate = useNavigate();

 
//   const MAX_FILE_SIZE = 1 * 1024 * 1024;
//   const ALLOWED_FILE_TYPE = "application/pdf";


//   const isReadOnly = offerLetterData?.ofrLetterStatus === "Accept";

//   const fetchOfrData = async () => {
//     try {
//       const response = await axiosInstance.get(`${API_BASE_URL}/emp-verify-drftdata`, {
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
//     if (status == "Accept" && !file) newErrors.file = "Please upload duly signed PDF copy";
   
//     if (!remarks.trim()) newErrors.remarks = "Remarks are required";
//     setErrors(newErrors);
//     setFileSizeError("");
//     return Object.keys(newErrors).length === 0;
//   };


//   const formatDate = (date) => {
//   if (!date) return "";

//   // Handle DD-MM-YYYY
//   if (date.includes("-") && date.split("-")[0].length === 2) {
//     const [day, month, year] = date.split("-");
//     return `${year}-${month}-${day}`;
//   }

//   const d = new Date(date);
//   return isNaN(d) ? "" : d.toISOString().split("T")[0];
// };


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
//     if (file) formData.append("candidOfrLtrSigned", file);
//     if (status === "Modify") formData.append("Candid_Reqstd_Join_date", modifyDate);

//     try {
//       const response = await axiosInstance.post(
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
//         // fetchOfrData(); 


//   try {
//          const LogoutResponse = await fetch(`${API_BASE_URL}/logout`, {
//              method: "POST",
//              headers: {
//                "Content-Type": "application/json",
//                Accept: "application/json",
//                Authorization: `Bearer ${userToken.token}`,
//              },
//              body: JSON.stringify({}),
//            });
     
//            localStorage.setItem('userInfo', JSON.stringify({ Emp_Id: "", employee: "", token: "" }));
//            navigate('/');
     
//            if (!LogoutResponse.ok) throw new Error("Server is Not Responding Error 500");
//          } catch (error) {
//            console.error("Logout Failed 401");
//          }
//       } else {
//         Swal.fire("Error", res.data?.message || "API failed", "error");
//       }
//     } catch (err) {
//       if (err.response?.status === 413) {
//         Swal.fire({
//           icon: "error",
//           title: "File Too Large",
//           text: "Please upload a file smaller than 1MB",
//           confirmButtonColor: '#a855f7'
//         });
//       } else {
//         Swal.fire("Error", err.response?.data?.message || err.message || "API failed", "error");
//       }
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
//            onChange={(e) => {
//   const value = e.target.value;

//   setStatus(value);

//   // ✅ RESET EVERYTHING HERE
//   setFile(null);
//   setRemarks("");
//   setModifyDate("");

//   // ✅ clear errors
//   setErrors({});
//   setFileSizeError("");
// }}
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
//             {status == "Accept" && <span style={{ color: '#ef4444' }}>*</span>}
//           </label>

//           {/* ✅ Case 1: Readonly + file exists → clickable link */}
//         {isReadOnly && offerLetterData?.candidOfrLtrSigned ? (
//   <div
//     style={{
//       padding: '8px 12px',
//       background: '#f3f4f6',
//       borderRadius: '8px',
//       fontSize: '13px',
//       color: '#6b7280',
//       border: '2px solid #d1fae5'
//     }}
//   >

//      <div
//     style={{
//       padding: '8px 12px',
//       background: '#f3f4f6',
//       borderRadius: '8px',
//       fontSize: '13px',
//       color: '#6b7280',
//       border: '2px solid #e9d5ff'
//     }}
//   >
//     📄 {offerLetterData.candidOfrLtrSigned.split('/').pop()}

//     <div style={{ marginTop: '6px' }}>
//   <a
//     href={offerLetterData.candidOfrLtrSigned}
//     target="_blank"
//     rel="noopener noreferrer"
//     style={{
//       display: 'inline-flex',   // ✅ IMPORTANT
//       alignItems: 'center',     // ✅ vertical alignment
//       gap: '6px',               // ✅ spacing between icon & text
//       color: '#1e40af',
//       fontWeight: '600',
//       textDecoration: 'none'
//     }}
//   >
//     <Eye size={14} color="#1e40af" strokeWidth={3} />
//     <span>View Document</span>
//   </a>
// </div>
//   </div>
//   </div>
// ) : isReadOnly ? (
//   // ✅ Case 2: Readonly + no file → disabled input
//   <input
//     type="file"
//      key={status}
//     disabled={true}
//     style={{
//       width: '100%',
//       border: '2px solid #d1fae5',
//       borderRadius: '8px',
//       padding: '8px 12px',
//       fontSize: '13px',
//       outline: 'none',
//       backgroundColor: '#f3f4f6',
//       cursor: 'not-allowed'
//     }}
//             />
//           ) : (
//             // ✅ Case 3: Editable → normal file input
//             <input
//              key={status}
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
// value={formatDate(offerLetterData?.joiningDate)}
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
import { FileCheck, CheckCircle, Eye } from "lucide-react";
import { API_BASE_URL } from "../Config/Config";
import axios from "axios";
import axiosInstance from "../Config/axiosConfig";
import { useNavigate } from "react-router-dom";

const CandidateApproval = ({ caseId }) => {
  const [status, setStatus] = useState("");
  const [file, setFile] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState({});
  const [modifyDate, setModifyDate] = useState("");
  const [offerLetterData, setOfferLetterData] = useState({});
  const [fileSizeError, setFileSizeError] = useState("");

  const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};
  const navigate = useNavigate();

  const MAX_FILE_SIZE = 1 * 1024 * 1024;
  const ALLOWED_FILE_TYPE = "application/pdf";

  const isReadOnly = offerLetterData?.ofrLetterStatus === "Accept";

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

      console.log("offffffffffffffffrrrrrrrr",record);

      setOfferLetterData(record || {});
    } catch (err) {
      console.error("Error In Fetching Offer List");
    }
  };

   useEffect(() => {
    if (userToken?.token && caseId) fetchOfrData();
  }, [userToken?.token, caseId]);

useEffect(() => {
  if (offerLetterData) {
    setStatus(offerLetterData.ofrLetterStatus || "");
    setRemarks(offerLetterData.ofrLetterRemarks || "");
    setModifyDate(
      formatDate(offerLetterData.Candid_Reqstd_Join_date || "")
    );
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

  const formatDate = (date) => {
    if (!date) return "";
    if (date.includes("-") && date.split("-")[0].length === 2) {
      const [day, month, year] = date.split("-");
      return `${year}-${month}-${day}`;
    }
    const d = new Date(date);
    return isNaN(d) ? "" : d.toISOString().split("T")[0];
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
      const response = await axiosInstance.post(
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
        Swal.fire("Error", response.data?.message || "API failed", "error");
      }
    } catch (err) {
      if (err.response?.status === 413) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Please upload a file smaller than 1MB",
          confirmButtonColor: '#34d399'
        });
      } else {
        Swal.fire("Error", err.response?.data?.message || err.message || "API failed", "error");
      }
    }
  };

  // Responsive Styles
  const styles = {
    container: {
      background: 'linear-gradient(to bottom right, #ecfdf5, #f0fdf4)',
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
      boxShadow: '0 4px 12px rgba(52, 211, 153, 0.15)',
      padding: 'clamp(16px, 5vw, 28px)',
      width: '100%',
      maxWidth: 'clamp(320px, 90%, 520px)',
      border: '3px solid #34d399',
      margin: '0 auto',
      boxSizing: 'border-box'
    },
    title: {
      fontSize: 'clamp(16px, 5vw, 20px)',
      fontWeight: 'bold',
      marginBottom: 'clamp(16px, 4vw, 24px)',
      color: '#047857',
      borderBottom: '2px solid #d1fae5',
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
      color: '#047857'
    },
    select: {
      width: '100%',
      border: `2px solid ${errors.status ? '#ef4444' : '#d1fae5'}`,
      borderRadius: 'clamp(8px, 2.5vw, 10px)',
      padding: 'clamp(8px, 2.5vw, 12px) clamp(12px, 3vw, 14px)',
      fontSize: 'clamp(13px, 3.5vw, 14px)',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
      ...readonlyStyle
    },
    input: {
      width: '100%',
      border: `2px solid ${errors.file || fileSizeError ? '#ef4444' : '#d1fae5'}`,
      borderRadius: 'clamp(8px, 2.5vw, 10px)',
      padding: 'clamp(8px, 2.5vw, 12px) clamp(12px, 3vw, 14px)',
      fontSize: 'clamp(13px, 3.5vw, 14px)',
      outline: 'none',
      transition: 'border-color 0.2s',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      border: `2px solid ${errors.remarks ? '#ef4444' : '#d1fae5'}`,
      borderRadius: 'clamp(8px, 2.5vw, 10px)',
      padding: 'clamp(8px, 2.5vw, 12px) clamp(12px, 3vw, 14px)',
      fontSize: 'clamp(13px, 3.5vw, 14px)',
      outline: 'none',
      resize: isReadOnly ? 'none' : 'vertical',
      transition: 'border-color 0.2s',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      ...readonlyStyle
    },
    button: {
      width: '100%',
      background: isReadOnly ? '#6ee7b7' : '#34d399',
      color: '#ffffff',
      padding: 'clamp(10px, 3vw, 14px)',
      borderRadius: 'clamp(8px, 2.5vw, 10px)',
      border: 'none',
      cursor: isReadOnly ? 'not-allowed' : 'pointer',
      fontSize: 'clamp(14px, 3.5vw, 16px)',
      fontWeight: '600',
      transition: 'background 0.2s',
      boxShadow: '0 2px 4px rgba(52, 211, 153, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
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
      padding: 'clamp(8px, 2.5vw, 12px) clamp(12px, 3vw, 14px)',
      borderRadius: 'clamp(8px, 2.5vw, 10px)',
      border: '2px solid #d1fae5',
      fontSize: 'clamp(13px, 3.5vw, 14px)',
      backgroundColor: '#f3f4f6',
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
    },
    fileDisplay: {
      padding: 'clamp(8px, 2.5vw, 12px)',
      background: '#f3f4f6',
      borderRadius: 'clamp(8px, 2.5vw, 10px)',
      fontSize: 'clamp(12px, 3.5vw, 13px)',
      color: '#6b7280',
      border: '2px solid #d1fae5',
      wordBreak: 'break-all'
    },
    link: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      color: '#1e40af',
      fontWeight: '600',
      textDecoration: 'none',
      fontSize: 'clamp(12px, 3.5vw, 13px)'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          <FileCheck size={18} color="#047857" />
          Candidate Offer Approval
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
              setModifyDate("");
              setErrors({});
              setFileSizeError("");
            }}
            style={styles.select}
            onFocus={(e) => !isReadOnly && !errors.status && (e.target.style.borderColor = '#34d399')}
            onBlur={(e) => !isReadOnly && !errors.status && (e.target.style.borderColor = '#d1fae5')}
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
            Upload Signed Offer Letter (PDF) {status == "Accept" && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
{/* Existing Document */}
{offerLetterData?.candidOfrLtrSigned && (
  <div style={styles.fileDisplay}>
    📄 {offerLetterData.candidOfrLtrSigned.split('/').pop()}

    <div style={{ marginTop: '6px' }}>
      <a
        href={offerLetterData.candidOfrLtrSigned}
        target="_blank"
        rel="noopener noreferrer"
        style={styles.link}
      >
        <Eye size={14} color="#1e40af" strokeWidth={3} />
        <span>View Document</span>
      </a>
    </div>
  </div>
)}

{/* Upload */}
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
          backgroundColor: '#f3f4f6',
          cursor: 'not-allowed'
        }
      : {})
  }}
  onFocus={(e) =>
    !isReadOnly &&
    !errors.file &&
    !fileSizeError &&
    (e.target.style.borderColor = '#34d399')
  }
  onBlur={(e) =>
    !isReadOnly &&
    !errors.file &&
    !fileSizeError &&
    (e.target.style.borderColor = '#d1fae5')
  }
/>

{/* Selected New File */}
{file && !isReadOnly && (
  <p style={styles.fileInfo}>
    <CheckCircle size={12} />
    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
  </p>
)}

{fileSizeError && (
  <p style={styles.errorText}>
    {fileSizeError}
  </p>
)}

{errors.file && !fileSizeError && (
  <p style={styles.errorText}>
    {errors.file}
  </p>
)}

{!isReadOnly && (
  <p style={styles.hintText}>
    PDF only, Max size: 1MB
  </p>
)}
        </div>

        {/* HR Date */}
        <div style={styles.section}>
          <label style={styles.label}>HR Date</label>
          <input
            type="date"
            value={formatDate(offerLetterData?.joiningDate)}
            readOnly
            style={styles.disabledInput}
          />
        </div>

        {/* Modify Joining Date */}
        {status === "Modify" && (
          <div style={styles.section}>
            <label style={styles.label}>
              Modify Joining Date <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="date"
              value={modifyDate}
              disabled={isReadOnly}
              onChange={(e) => { setModifyDate(e.target.value); setErrors({}); }}
              style={styles.input}
              onFocus={(e) => !isReadOnly && !errors.modifyDate && (e.target.style.borderColor = '#34d399')}
              onBlur={(e) => !isReadOnly && !errors.modifyDate && (e.target.style.borderColor = '#d1fae5')}
            />
            {errors.modifyDate && <p style={styles.errorText}>{errors.modifyDate}</p>}
          </div>
        )}

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
            placeholder={isReadOnly ? "" : "Enter your remarks here..."}
            style={styles.textarea}
            onFocus={(e) => !isReadOnly && !errors.remarks && (e.target.style.borderColor = '#34d399')}
            onBlur={(e) => !isReadOnly && !errors.remarks && (e.target.style.borderColor = '#d1fae5')}
          />
          {errors.remarks && <p style={styles.errorText}>{errors.remarks}</p>}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isReadOnly}
          style={styles.button}
          onMouseEnter={(e) => !isReadOnly && (e.currentTarget.style.background = '#10b981')}
          onMouseLeave={(e) => !isReadOnly && (e.currentTarget.style.background = '#34d399')}
          onTouchStart={(e) => !isReadOnly && (e.currentTarget.style.background = '#10b981')}
          onTouchEnd={(e) => !isReadOnly && (e.currentTarget.style.background = '#34d399')}
        >
          <CheckCircle size={16} />
          {isReadOnly ? 'Already Accepted' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default CandidateApproval;