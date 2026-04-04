



// import { useState, useEffect } from "react";
// import Swal from "sweetalert2";
// import { BadgeCheck, CheckCircle, Eye } from "lucide-react";
// import { API_BASE_URL } from "../Config/Config";
// import axios from "axios";
// import axiosInstance from "../Config/axiosConfig";
// import { useNavigate } from "react-router-dom";

// const CandidateStackup = ({ caseId }) => {
//   const [status, setStatus] = useState("");
//   const [file, setFile] = useState(null);
//   const [remarks, setRemarks] = useState("");
//   const [errors, setErrors] = useState({});

//   const [expCTC, setExpCTC] = useState("");
//   const [offerLetterData, setOfferLetterData] = useState({});
//   const [offeredCTC, setOfferedCTC] = useState('');
//    const navigate = useNavigate();
//   const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};

//   const isReadOnly = offerLetterData?.cand_aprvl_status === "Accept";

  

//   const fetchOfrData = async () => {
//     try {
//       const response = await axiosInstance.get(`${API_BASE_URL}/emp-verify-drftdata`, {
//         headers: { Authorization: `Bearer ${userToken.token}` },
//       });

//       const data = response?.data?.data;
//       const allRecords = Array.isArray(data) ? data : [data];

//       console.log("caseId prop received:", data);
//       console.log("allRecords child_caseid values:", allRecords.map(i => i?.child_caseid));

//       const record = allRecords.find(
//         (item) => String(item?.child_caseid) === String(caseId)
//       );

//       console.log("matched record:", record);
//       setOfferLetterData(record || {});
//     } catch (err) {
//       console.error("Error fetching stackup data");
//     }
//   };



//   useEffect(() => {
//     if (userToken?.token && caseId) fetchOfrData();
//   }, [userToken?.token, caseId]);

//   useEffect(() => {
//     if (offerLetterData?.cand_aprvl_status === "Accept") {
//       setStatus("Accept");
//       setRemarks(offerLetterData?.cand_aprvl_remarks || "");
//     }
//   }, [offerLetterData]);


//   useEffect(() => {
//     if (offerLetterData) {
//       setOfferedCTC(
//         offerLetterData.offer_ctc
//           ? Number(offerLetterData.offer_ctc)
//           : ''
//       );
//     }
//   }, [offerLetterData]);



//   const readonlyStyle = {
//     backgroundColor: isReadOnly ? '#f3f4f6' : '#ffffff',
//     cursor: isReadOnly ? 'not-allowed' : 'auto',
//   };

//   const formattedCTC = offeredCTC
//     ? Number(offeredCTC).toLocaleString('en-IN')
//     : '';

//   const lakhs = offeredCTC
//     ? (Number(offeredCTC) / 100000).toFixed(1)
//     : '';

//   const validate = () => {
//     let newErrors = {};
//     if (!status) newErrors.status = "Status is required";
//     // if (status === "Modify" && !modifyDate) newErrors.modifyDate = "Modify date is required";
//     if (status !== "Reject" && !file) newErrors.file = "Please upload duly signed copy";
//     if (!remarks.trim()) newErrors.remarks = "Remarks are required";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };




//   const handleSubmit = async (e) => {

//     e.preventDefault();
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
//     formData.append("status", status);
//     formData.append("remarks", remarks);
//     formData.append("hiddenCaseId", userToken?.Emp_Id);
//     if (file) formData.append("file", file);
//     formData.append("CAND_EXP_CTC", expCTC);

//   try {
//   const res = await axiosInstance.post(`${API_BASE_URL}/cand-aprvl-updt`, formData, {
//     headers: { Authorization: `Bearer ${userToken.token}` },
//   });

//   console.log("API Response:", res.data); // ✅ log the response

//   if (res.data?.success) {
//     setRemarks("");
//     setFile(null);
//     setStatus("");
  

//     await Swal.fire({
//       icon: "success",
//       title: "Success!",
//       text: res.data.message || "Submitted successfully!",
//       timer: 1500,
//       showConfirmButton: false,
//     });

// try {
//       const LogoutResponse = await fetch(`${API_BASE_URL}/logout`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Accept: "application/json",
//             Authorization: `Bearer ${userToken.token}`,
//           },
//           body: JSON.stringify({}),
//         });
  
//         localStorage.setItem('userInfo', JSON.stringify({ Emp_Id: "", employee: "", token: "" }));
//         navigate('/');
  
//         if (!LogoutResponse.ok) throw new Error("Server is Not Responding Error 500");
//       } catch (err) {
//         console.error("Logout error:", err);
//     } finally {
//         localStorage.setItem('userInfo', JSON.stringify({ Emp_Id: "", employee: "", token: "" }));
//         window.location.href = '/';
//     }

//   } else {
//     // Backend responded 200 but success=false
//     Swal.fire("Error", res.data?.message || "API failed", "error");
//   }
// } catch (err) {
//   // Axios actually failed (network error or status != 2xx)
//   if (err.response?.status === 413) {
//     Swal.fire({
//       icon: "error",
//       title: "File Too Large",
//       text: "Please upload a file smaller than 5MB",
//       confirmButtonColor: '#a855f7'
//     });
//   } else {
//     Swal.fire("Error", err.response?.data?.message || err.message || "API failed", "error");
//   }
// }
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
//           <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#7c3aed' }}>
//             Status <span style={{ color: '#ef4444' }}>*</span>
//           </label>
//           <select
//             value={status}
//             disabled={isReadOnly}
//             onChange={(e) => { setStatus(e.target.value); setErrors({}); }}
//             style={{
//               width: '100%',
//               border: `2px solid ${errors.status ? '#ef4444' : '#e9d5ff'}`,
//               borderRadius: '8px',
//               padding: '8px 12px',
//               fontSize: '13px',
//               outline: 'none',
//               ...readonlyStyle
//             }}
//             onFocus={(e) => !isReadOnly && !errors.status && (e.target.style.borderColor = '#a855f7')}
//             onBlur={(e) => !isReadOnly && !errors.status && (e.target.style.borderColor = '#e9d5ff')}
//           >
//             <option value="">Select Status</option>
//             <option value="Accept">Accept</option>
//             <option value="Modify">Modify</option>
//             <option value="Reject">Reject</option>
//           </select>
//           {errors.status && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.status}</p>}
//         </div>

//         {/* File Upload */}
//         <div style={{ marginBottom: '12px' }}>
//           <label
//             style={{
//               display: 'block',
//               fontWeight: '600',
//               marginBottom: '6px',
//               fontSize: '13px',
//               color: '#7c3aed'
//             }}
//           >
//             File Upload {status !== "Reject" && <span style={{ color: '#ef4444' }}>*</span>}
//           </label>

//        {isReadOnly && offerLetterData?.cand_aprvl_file ? (
//   <div
//     style={{
//       padding: '8px 12px',
//       background: '#f3f4f6',
//       borderRadius: '8px',
//       fontSize: '13px',
//       color: '#6b7280',
//       border: '2px solid #e9d5ff'
//     }}
//   >
//     📄 {offerLetterData.cand_aprvl_file.split('/').pop()}

//     <div style={{ marginTop: '6px' }}>
//   <a
//     href={offerLetterData.cand_aprvl_file}
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
// ) : (
//             <input
//               type="file"
//               accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//               disabled={isReadOnly}
//               onChange={(e) => {
//                 setFile(e.target.files[0]);
//                 setErrors({});
//               }}
//               style={{
//                 width: '100%',
//                 border: `2px solid ${errors.file ? '#ef4444' : '#e9d5ff'}`,
//                 borderRadius: '8px',
//                 padding: '8px 12px',
//                 fontSize: '13px',
//                 outline: 'none',
//                 ...readonlyStyle
//               }}
//             />
//           )}

//           {errors.file && (
//             <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
//               {errors.file}
//             </p>
//           )}
//         </div>
//         {/* Modify Date */}
//         {status === "Modify" && (
//           <div style={{ marginBottom: '12px' }}>
//             <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#7c3aed' }}>
//               Candidate Expected CTC <span style={{ color: '#ef4444' }}>*</span>
//             </label>

//             <input
//               type="number"
//               name="expCTC"
//               value={expCTC}
//               onChange={(e) => {
//                 setExpCTC(e.target.value);
//                 setErrors({});
//               }}
//               placeholder="Enter Expected CTC"
//               style={{
//                 width: '100%',
//                 padding: '8px',
//                 borderRadius: '6px',
//                 border: errors.expCTC ? '1px solid #ef4444' : '1px solid #ccc',
//                 fontSize: '12px'
//               }}
//             />
//           </div>
//         )}


//         <div style={{ marginBottom: '12px' }}>
//           <label style={{
//             display: 'block',
//             fontWeight: '600',
//             marginBottom: '6px',
//             fontSize: '13px',
//             color: '#7c3aed'
//           }}>
//             Proposed CTC <span style={{ color: '#ef4444' }}>*</span>
//           </label>

//           <input
//             type="text"
//             value={formattedCTC}
//             disabled
//             style={{
//               width: '100%',
//               padding: '8px',
//               borderRadius: '6px',
//               border: '1px solid #d1d5db',
//               fontSize: '14px',
//               backgroundColor: '#f1ebeb',
//               color: '#6e6f71',
//               cursor: 'not-allowed'
//             }}
//           />

//           {/* 👇 Display Lakhs + per annum */}
//           {offeredCTC && (
//             <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
//               ({lakhs} Lakhs) per annum
//             </div>
//           )}
//         </div>




//         {/* Remarks */}
//         <div style={{ marginBottom: '16px' }}>
//           <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#7c3aed' }}>
//             Remarks <span style={{ color: '#ef4444' }}>*</span>
//           </label>
//           <textarea
//             rows="3"
//             value={remarks}
//             disabled={isReadOnly}
//             onChange={(e) => { setRemarks(e.target.value); setErrors({}); }}
//             style={{
//               width: '100%',
//               border: `2px solid ${errors.remarks ? '#ef4444' : '#e9d5ff'}`,
//               borderRadius: '8px',
//               padding: '8px 12px',
//               fontSize: '13px',
//               outline: 'none',
//               resize: isReadOnly ? 'none' : 'vertical',
//               ...readonlyStyle
//             }}
//             onFocus={(e) => !isReadOnly && !errors.remarks && (e.target.style.borderColor = '#a855f7')}
//             onBlur={(e) => !isReadOnly && !errors.remarks && (e.target.style.borderColor = '#e9d5ff')}
//           />
//           {errors.remarks && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.remarks}</p>}
//         </div>

//         {/* Submit Button */}
//         <button
//           onClick={handleSubmit}
//           disabled={isReadOnly}
//           style={{
//             width: '100%',
//             background: isReadOnly ? '#d8b4fe' : '#a855f7',
//             color: '#ffffff',
//             padding: '10px',
//             borderRadius: '8px',
//             border: 'none',
//             cursor: isReadOnly ? 'not-allowed' : 'pointer',
//             fontSize: '14px',
//             fontWeight: '600',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             gap: '8px',
//             boxShadow: '0 2px 4px rgba(168, 85, 247, 0.2)'
//           }}
//           onMouseEnter={(e) => !isReadOnly && (e.currentTarget.style.background = '#9333ea')}
//           onMouseLeave={(e) => !isReadOnly && (e.currentTarget.style.background = '#a855f7')}
//         >
//           <CheckCircle size={16} />
//           {isReadOnly ? 'Already Accepted' : 'Submit'}
//         </button>

//       </div>
//     </div>
//   );
// };

// export default CandidateStackup;




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
  const [fileSizeError, setFileSizeError] = useState(""); // ✅ Added

  const [expCTC, setExpCTC] = useState("");
  const [offerLetterData, setOfferLetterData] = useState({});
  const [offeredCTC, setOfferedCTC] = useState('');

  const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};
    const navigate = useNavigate();

  // ✅ Add validation constants
  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
  const ALLOWED_FILE_TYPE = "application/pdf";

  const isReadOnly = offerLetterData?.cand_aprvl_status === "Accept";

  const fetchOfrData = async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/emp-verify-drftdata`, {
        headers: { Authorization: `Bearer ${userToken.token}` },
      });

      const data = response?.data?.data;
      const allRecords = Array.isArray(data) ? data : [data];

      console.log("caseId prop received:", data);
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

  // ✅ Add file validation function
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

  // ✅ Add file change handler with validation
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
    if (status !== "Reject" && !file) newErrors.file = "Please upload duly signed PDF copy";
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

      console.log("API Response:", res.data);

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
            onChange={(e) => { setStatus(e.target.value); setErrors({}); setFileSizeError(""); }}
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

        {/* File Upload - Updated with validation */}
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
            File Upload (PDF only) {status !== "Reject" && <span style={{ color: '#ef4444' }}>*</span>}
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
              <div style={{ marginTop: '6px' }}>
                <a
                  href={offerLetterData.cand_aprvl_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#1e40af',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  <Eye size={14} color="#1e40af" strokeWidth={3} />
                  <span>View Document</span>
                </a>
              </div>
            </div>
          ) : isReadOnly ? (
            <input
              type="file"
              disabled={true}
              style={{
                width: '100%',
                border: '2px solid #e9d5ff',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#f3f4f6',
                cursor: 'not-allowed'
              }}
            />
          ) : (
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{
                width: '100%',
                border: `2px solid ${errors.file || fileSizeError ? '#ef4444' : '#e9d5ff'}`,
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
              onFocus={(e) => !errors.file && !fileSizeError && (e.target.style.borderColor = '#a855f7')}
              onBlur={(e) => !errors.file && !fileSizeError && (e.target.style.borderColor = '#e9d5ff')}
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

        {/* Modify Date */}
        {status === "Modify" && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#7c3aed' }}>
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
                padding: '8px',
                borderRadius: '6px',
                border: errors.expCTC ? '1px solid #ef4444' : '1px solid #ccc',
                fontSize: '12px'
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontWeight: '600',
            marginBottom: '6px',
            fontSize: '13px',
            color: '#7c3aed'
          }}>
            Proposed CTC <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            value={formattedCTC}
            disabled
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              backgroundColor: '#f1ebeb',
              color: '#6e6f71',
              cursor: 'not-allowed'
            }}
          />
          {offeredCTC && (
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              ({lakhs} Lakhs) per annum
            </div>
          )}
        </div>

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
