


import React, { useContext, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { Upload, User, Mail, Phone, Briefcase,Eye, BookOpen, Award, Plus, Trash2, GraduationCap, Info, FileUp, RotateCcw, Send } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL, API_BASE_URLss } from "../Config/Config"
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../Config/axiosConfig.jsx'


const RecruitmentForm = () => {


  const [sameAsPermanent, setSameAsPermanent] = useState(null);

const [statusEdit, setStatusEdit] = useState(null); //
const [updatedFiles, setUpdatedFiles] = useState([])

  // ✅ CORRECT ORDER
  const [formStatus, setFormStatus] = useState('');
  const isPending = formStatus === 'pending' || formStatus === 'submit';
  const [removedFiles, setRemovedFiles] = useState([]); // ✅ NEW: Track removed files with their metadata
  const [formData, setFormData] = useState({
    CHILD_CASEID: "",
    PLANT: "",
    FIRST_NAME: '',
    LAST_NAME: '',
    EMAIL: '',
    PHONE_NUMBER: '',
    ORIGINAL_DOB: '',
    GENDER: '',
    MARITAL_STATUS: '',
    LANG_KNOWN: '',
    MOTHER_TONGUE: '',
    DEPT: '',
    HNO: '',
    CITY: '',
    MANDAL: '',
    DISTRICT: '',
    STATE: '',
    PINCODE: '',
    PRESENT_HNO: '',
    PRESENT_CITY: '',
    PRESENT_MANDAL: '',
    PRESENT_DISTRICT: '',
    PRESENT_STATE: '',
    PRESENT_PINCODE: '',
    TOTAL_EXP: '',
    // IDs
    AADHAR_NUM: '',
    PAN_NUM: '',
    UAN_NUM: '',
    UAN_FILE: null,
    DOB_ASPER_ADHAR: '',
    ESI_NUM: '',
    SRC_TYPE: '',
    SRC_REFER_NAME: '',
    SRC_REFER_DEPT: '',
    EMER_CONTACT_NUM: '',
    PASSPORT_NUMBER: '',
    PASSPORT_EXPIRY: '',
    DRIVING_LICENSE: '',
    DRIVING_LICENSE_EXPIRY: '',
    BLOOD_GROUP: '',
    // Education
    SSC_SCHOOL_NAME: '',
    SSC_BOARD: '',
    SSC_MARKS: '',
    SSC_PASSED_YEAR: '',
    '10TH_FILENAME': null,
    INTER_COLLEGE_NAME: '',
    INTER_BOARD: '',
    INTER_MARKS: '',
    INTER_PASSED_YEAR: '',
    INTER_FILENAME: null,
    GRAD_COLLEGE_NAME: '',
    DEGREE_UNIVERSITY: '',
    BTECH_MARKS: '',
    DEGREE_PASSED_YEAR: '',
    BTECH_FILENAME: null,
    PG_COLLEGE_NAME: '',
    PG_UNIVERSITY: '',
    PG_MARKS: '',
    PG_PASSED_YEAR: '',
    PG_FILENAME: null,
    PHD_COLLEGE_NAME: '',
    PHD_UNIVERSITY: '',
    PHD_MARKS: '',
    PHD_PASSED_YEAR: '',
    PHD_FILENAME: null,
    OTHER_COLLEGE_NAME: '',
    OTHER_UNIVERSITY: '',
    OTHER_MARKS: '',
    OTHER_PASSED_YEAR: '',
    OTHER_FILENAME: null,
    // Files
    AADHAR_PATH: null,
    AADHAR_DOCID: null, // ✅ Store Aadhaar Doc ID
    AADHAR_STATUS: null, // ✅ Store Aadhaar Status
    PAN_PATH: null,
    PHOTO: null,
    RESUME_UPLOAD: null,
    payslips: null,
    relieving_letter: null,
    offer_letter: null,
    exp_letter: null,
    bank_statements: null,
    CURRENT_CTC: '',
    EXP_CTC: '',
    AGE: "",
    address_status: "",

   TYPE_PLANT: "",
  GROUP_CODE: "",
    SUB_CODE: "",
  SUB_POST:"",
GROUP_DEPT: "",
RAISER_EMP_ID: "",
RECRUIT_CYCLE: "",
HIGHEST_QUA: "",

//  documentMetadata: {
//   '10TH_FILENAME': { docId: null, status: null, certfi: null },
//   'INTER_FILENAME': { docId: null, status: null, certfi: null },
//   'BTECH_FILENAME': { docId: null, status: null, certfi: null },
//   'PG_FILENAME': { docId: null, status: null, certfi: null },
//   'PHD_FILENAME': { docId: null, status: null, certfi: null },
//   'OTHER_FILENAME': { docId: null, status: null, certfi: null },
//   'AADHAR_PATH': { docId: null, status: null, certfi: null },
//   'PAN_PATH': { docId: null, status: null, certfi: null },
//   'UAN_FILE': { docId: null, status: null, certfi: null },
//   'PHOTO': { docId: null, status: null, certfi: null },
//   'RESUME_UPLOAD': { docId: null, status: null, certfi: null },   // ✅ fixed key
//   'payslips': { docId: null, status: null, certfi: null },
//   'relieving_letter': { docId: null, status: null, certfi: null },
//   'offer_letter': { docId: null, status: null, certfi: null },
//   'exp_letter': { docId: null, status: null, certfi: null },
//   'bank_statements': { docId: null, status: null, certfi: null }
// }
  });



  // null = no selection
  const [openSections, setOpenSections] = useState({
    basicInfo: true,
    education: true,
    experience: true,
  });
  const [experiences, setExperiences] = useState([
    {
      id: Date.now(),
      COMPANY_NAME: '',
      DESIGNATION: '',
      FROM_DATE: '',
       TO_DATE:'',
      DURATION: '',
      CURRENT_CTC: '',
      EXP_CTC: '',
      NOTICE_PERIOD: '',
      PAYSLIPS: [],
      RELIEVING_LETTER: null,
      COMPANY_STAGES: '',
      OFFER_LETTER: null,
      EXP_LETTER: null,
      BANK_STATEMENTS: [],
      EMP_COMP_ID: '',
      isCurrent: true
    }
  ]);


 const navigate = useNavigate();


  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);


  const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};


  // Refs for scrolling to error fields
  const fieldRefs = useRef({});
  
  const registerRef = (fieldName, element) => {
    if (element) {
      fieldRefs.current[fieldName] = element;
    }
  };


// ✅ ADD THIS before return()
const responsiveStyles = `
  @media (max-width: 768px) {
    .address-grid { flex-direction: column !important; }
    .address-grid > div { flex: none !important; width: 100% !important; }
    .edu-table { font-size: 10px !important; }
    .edu-table th, .edu-table td { padding: 4px !important; }
    .edu-table input { font-size: 10px !important; height: 26px !important; }
    .btn-row { flex-direction: column !important; align-items: center !important; }
    .btn-row button { width: 90% !important; justify-content: center !important; }
  }
  @media (max-width: 480px) {
    .edu-table-wrap { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
    .edu-table { min-width: 560px !important; }
  }
`;

  const fieldValidations = {
                                           
    FIRST_NAME: (val) => val.replace(/[^a-zA-Z ]/g, ''),                // letters + space
       LANG_KNOWN: (val) => val.replace(/[^a-zA-Z ,\.]/g, ''),   
         MOTHER_TONGUE: (val) => val.replace(/[^a-zA-Z ]/g, ''),   
            HIGHEST_QUA: (val) => val.replace(/[^a-zA-Z ,\.]/g, ''),   
             SSC_SCHOOL_NAME: (val) => val.replace(/[^a-zA-Z ]/g, ''),     
        SSC_BOARD: (val) => val.replace(/[^a-zA-Z0-9 .,-]/g, ''), 
            INTER_COLLEGE_NAME: (val) => val.replace(/[^a-zA-Z ]/g, ''),   
             INTER_BOARD: (val) => val.replace(/[^a-zA-Z ]/g, ''),   
            GRAD_COLLEGE_NAME: (val) => val.replace(/[^a-zA-Z ]/g, ''), 
             DEGREE_UNIVERSITY: (val) => val.replace(/[^a-zA-Z ]/g, ''),  
              PG_COLLEGE_NAME: (val) => val.replace(/[^a-zA-Z ]/g, ''), 
             PG_UNIVERSITY: (val) => val.replace(/[^a-zA-Z ]/g, ''),  
                PHD_COLLEGE_NAME: (val) => val.replace(/[^a-zA-Z ]/g, ''), 
             PHD_UNIVERSITY: (val) => val.replace(/[^a-zA-Z ]/g, ''),  
              OTHER_COLLEGE_NAME: (val) => val.replace(/[^a-zA-Z ]/g, ''), 
             OTHER_UNIVERSITY: (val) => val.replace(/[^a-zA-Z ]/g, ''),
               COMPANY_NAME: (val) => val.replace(/[^a-zA-Z0-9 ]/g, ''),
             DESIGNATION: (val) => val.replace(/[^a-zA-Z ]/g, ''),    
}; 

const EmpVerify = async () => {
  if (!userToken?.token) return;

  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/emp-verify-drftdata`, {
      headers: { Authorization: `Bearer ${userToken.token}` },
    });

    console.log("Draft Data Response:", response);

    if (response.data?.success && response.data?.data) {
      const userCaseId = userToken?.Manpower?.CHILD_CASEID || userToken?.CHILD_CASEID;

      const draftRecords = response.data.data.filter(
        item => String(item.child_caseid || '').trim() === String(userCaseId || '').trim() &&
          (item.status?.toLowerCase() === "draft" || 
           item.status?.toLowerCase() === "pending" ||
           item.Status_Edit === "Edit")
      );

      if (draftRecords.length > 0) {
        const draftData = draftRecords[0];
        setFormStatus(draftData.status?.toLowerCase() || '');
        setStatusEdit(draftData.Status_Edit || null);

        const documents = draftData.documents || {};
        const documentMetadata = {};

        // ----- MAPPING FOR CERTIFICATE FILES (actual file paths) -----
        const certificateMapping = {
          // Education
          '10th_certi': '10TH_FILENAME',
          'Inter_certi': 'INTER_FILENAME',
          'Gradu_certi': 'BTECH_FILENAME',
          'PG_FILENAME': 'PG_FILENAME',
          'PHD_FILENAME': 'PHD_FILENAME',
          'OTHER_FILENAME': 'OTHER_FILENAME',
          // ID
          'Aadhar_certi': 'AADHAR_PATH',
          'Pan_certi': 'PAN_PATH',
          'UAN_FILE': 'UAN_FILE',
          'photo': 'PHOTO',
          'RESUME_UPLOAD': 'RESUME_UPLOAD',
          // Experience
          'payslips': 'payslips',
          'relieving_letter': 'relieving_letter',
          'offer_letter': 'offer_letter',
          'exp_letter': 'exp_letter',
          'bank_statements': 'bank_statements'
        };

        // ----- MAPPING FOR DocId SUFFIXES (e.g., 'UAN_DocId' -> 'UAN_FILE') -----
        const docIdToField = {
          'Aadhar': 'AADHAR_PATH',
          'pan': 'PAN_PATH',          // matches "pan_DocId"
          'UAN': 'UAN_FILE',          // matches "UAN_DocId"
          'Tenth': '10TH_FILENAME',
          'Inter': 'INTER_FILENAME',
          'grad': 'BTECH_FILENAME',   // matches "grad_DocId"
          'Pg': 'PG_FILENAME',
          'PHD_FILENAME': 'PHD_FILENAME',
          'OTHER_FILENAME': 'OTHER_FILENAME',
          'RESUME': 'RESUME_UPLOAD',  // matches "RESUME_DocId"
          'photo': 'PHOTO',
          'payslips': 'payslips',
          'bank_statements': 'bank_statements',
          'relieving_letter': 'relieving_letter',
          'offer_letter': 'offer_letter',
          'exp_letter': 'exp_letter'
        };

        // 1️⃣ Store certificate file paths
        Object.keys(certificateMapping).forEach(certKey => {
          const fieldName = certificateMapping[certKey];
          if (documents[certKey]) {
            if (!documentMetadata[fieldName]) documentMetadata[fieldName] = {};
            documentMetadata[fieldName].certfi = documents[certKey];
          }
        });

        // 2️⃣ Extract DocId and Status using docIdToField
        Object.keys(documents).forEach(key => {
          if (key.endsWith('_DocId')) {
            const baseName = key.replace('_DocId', '');
            const fieldName = docIdToField[baseName];
            if (fieldName) {
              if (!documentMetadata[fieldName]) documentMetadata[fieldName] = {};
              documentMetadata[fieldName].docId = documents[key];
              console.log(`✅ Mapped ${key}=${documents[key]} → ${fieldName}.docId`);
            } else {
              console.warn(`⚠️ No mapping for DocId key: ${key}`);
            }
          }
          if (key.endsWith('_Status')) {
            const baseName = key.replace('_Status', '');
            const fieldName = docIdToField[baseName];
            if (fieldName) {
              if (!documentMetadata[fieldName]) documentMetadata[fieldName] = {};
              documentMetadata[fieldName].status = documents[key];
            }
          }
        });

        console.log("Final Document Metadata:", documentMetadata);

        // Update formData
        setFormData(prev => ({
          ...prev,
          CHILD_CASEID: draftData.child_caseid || '',
          PLANT: draftData.PLANT || '',
          FIRST_NAME: draftData.name || '',
          EMAIL: draftData.email || '',
          HIGHEST_QUA: draftData.HIGHEST_QUA || '',
          PHONE_NUMBER: draftData.phone_number || '',
          ORIGINAL_DOB: draftData.ORIGINAL_DOB || '',
          GENDER: draftData.GENDER || '',
          MARITAL_STATUS: draftData.MARITAL_STATUS || '',
          LANG_KNOWN: draftData.LANG_KNOWN || '',
          MOTHER_TONGUE: draftData.MOTHER_TONGUE || '',
          DEPT: draftData.DEPT || '',
          HNO: draftData.HNO || '',
          CITY: draftData.CITY || '',
          MANDAL: draftData.MANDAL || '',
          DISTRICT: draftData.DISTRICT || '',
          STATE: draftData.STATE || '',
          PINCODE: draftData.PINCODE || '',
          PRESENT_HNO: draftData.PRESENT_HNO || '',
          PRESENT_CITY: draftData.PRESENT_CITY || '',
          PRESENT_MANDAL: draftData.PRESENT_MANDAL || '',
          PRESENT_DISTRICT: draftData.PRESENT_DISTRICT || '',
          PRESENT_STATE: draftData.PRESENT_STATE || '',
          PRESENT_PINCODE: draftData.PRESENT_PINCODE || '',
          AADHAR_NUM: draftData.aadhar_number || '',
          PAN_NUM: draftData.pan_number || '',
          UAN_NUM: draftData.UAN_NUM || '',

          // Document files (real paths or null)
          '10TH_FILENAME': documents['10th_certi'] || null,
          'INTER_FILENAME': documents['Inter_certi'] || null,
          'BTECH_FILENAME': documents['Gradu_certi'] || null,
          'PG_FILENAME': documents['PG_FILENAME'] || null,
          'PHD_FILENAME': documents['PHD_FILENAME'] || null,
          'OTHER_FILENAME': documents['OTHER_FILENAME'] || null,
          'UAN_FILE': documents['UAN_FILE'] || null,
          'AADHAR_PATH': documents['Aadhar_certi'] || null,
          'PAN_PATH': documents['Pan_certi'] || null,
          'RESUME_UPLOAD': documents['RESUME_UPLOAD'] || null,
          'PHOTO': documents['photo'] || null,
          'payslips': documents['payslips'] || null,
          'relieving_letter': documents['relieving_letter'] || null,
          'offer_letter': documents['offer_letter'] || null,
          'exp_letter': documents['exp_letter'] || null,
          'bank_statements': documents['bank_statements'] || null,

           DOB_ASPER_ADHAR: draftData.DOB_ASPER_ADHAR || '',
            ESI_NUM: draftData.ESI_NUM || '',
            SRC_TYPE: draftData.SRC_TYPE || '',
            SRC_REFER_NAME: draftData.SRC_REFER_NAME || '',
            SRC_REFER_DEPT: draftData.SRC_REFER_DEPT || '',
            EMER_CONTACT_NUM: draftData.EMER_CONTACT_NUM || '',
            PASSPORT_NUMBER: draftData.PASSPORT_NUMBER || '',
            PASSPORT_EXPIRY: draftData.PASSPORT_EXPIRY || '',
            DRIVING_LICENSE: draftData.DRIVING_LICENSE || '',
            DRIVING_LICENSE_EXPIRY: draftData.DRIVING_LICENSE_EXPIRY || '',
            BLOOD_GROUP: draftData.BLOOD_GROUP || '',
            SSC_SCHOOL_NAME: draftData.SSC_SCHOOL_NAME || '',
            SSC_BOARD: draftData.SSC_BOARD || '',
            SSC_MARKS: draftData.ssc_marks || '',
            SSC_PASSED_YEAR: draftData.SSC_PASSED_YEAR || '',
            INTER_COLLEGE_NAME: draftData.INTER_COLLEGE_NAME || '',
            INTER_BOARD: draftData.INTER_BOARD || '',
            INTER_MARKS: draftData.inter_marks || '',
            INTER_PASSED_YEAR: draftData.INTER_PASSED_YEAR || '',
            GRAD_COLLEGE_NAME: draftData.GRAD_COLLEGE_NAME || '',
            DEGREE_UNIVERSITY: draftData.DEGREE_UNIVERSITY || '',
            BTECH_MARKS: draftData.btech_marks || '',
            DEGREE_PASSED_YEAR: draftData.DEGREE_PASSED_YEAR || '',
            PG_COLLEGE_NAME: draftData.PG_COLLEGE_NAME || '',
            PG_UNIVERSITY: draftData.PG_UNIVERSITY || '',
            PG_MARKS: draftData.pg_marks || '',
            PG_PASSED_YEAR: draftData.PG_PASSED_YEAR || '',
            PHD_COLLEGE_NAME: draftData.PHD_COLLEGE_NAME || '',
            PHD_UNIVERSITY: draftData.PHD_UNIVERSITY || '',
            PHD_MARKS: draftData.PHD_MARKS || '',
            PHD_PASSED_YEAR: draftData.PHD_PASSED_YEAR || '',
            OTHER_COLLEGE_NAME: draftData.OTHER_COLLEGE_NAME || '',
            OTHER_UNIVERSITY: draftData.OTHER_UNIVERSITY || '',
            OTHER_MARKS: draftData.OTHER_MARKS || '',
            OTHER_PASSED_YEAR: draftData.OTHER_PASSED_YEAR || '',
            CURRENT_CTC: draftData.current_ctc || '',
            EXP_CTC: draftData.expected_ctc || '',
            AGE: draftData.AGE || '',
           EMP_COMP_ID: draftData.EMP_COMP_ID || '',
            TOTAL_EXP: draftData.TOTAL_EXP || '',
       

          documentMetadata: { ...prev.documentMetadata, ...documentMetadata }
        }));

        // Address and experience data remain unchanged
        if (draftData.address_status === "YES") setSameAsPermanent(true);
        else if (draftData.address_status === "NO") setSameAsPermanent(false);

        if (draftData.experienceData?.length) {
          const mappedExperiences = draftData.experienceData.map((exp, index) => ({
            id: Date.now() + index,
            COMPANY_NAME: exp.COMPANY_NAME || '',
            COMPANY_STAGES: exp.COMPANY_STAGES || (index === 0 ? "0" : "1"),
            DESIGNATION: exp.DESIGNATION || '',
            FROM_DATE: exp.START_DATE || '',
            TO_DATE: exp.END_DATE || '',
            DURATION: exp.EXPERIENCE_YEARS || '',
            EMP_COMP_ID: exp.EMP_COMP_ID || '',
            NOTICE_PERIOD: exp.noticePeriod || '',
            isCurrent: exp.COMPANY_STAGES === "0" || index === 0,
            CURRENT_CTC: '',
            EXP_CTC: '',
            PAYSLIPS: [],
            BANK_STATEMENTS: [],
            OFFER_LETTER: null,
            RELIEVING_LETTER: null,
            EXP_LETTER: null,
            offer_letter: null,
            relieving_letter: null
          }));
          setExperiences(mappedExperiences);
        }
      }
    }
  } catch (err) {
    console.error("Error fetching verify data", err);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load draft data' });
  }
};

  useEffect(() => {
    EmpVerify();
  }, [userToken?.token]);



const openFile = async (file, fileName = 'Document') => {
  if (!file) return;

  try {
    let url;

    if (file instanceof File) {
      // Newly uploaded file (File object)
      url = URL.createObjectURL(file);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } else if (typeof file === 'string') {
      // Existing file path from server - just construct URL and open
      let fullUrl = file;
      
      if (!file.startsWith('http') && !file.startsWith('https')) {
        if (file.startsWith('/')) {
          fullUrl = `${API_BASE_URLss}${file}`;
        } else {
          fullUrl = `${API_BASE_URLss}/${file}`;
        }
      }
      
      // Open directly in new tab
      window.open(fullUrl, '_blank');
    }
  } catch (error) {
    console.error("Error opening file:", error);
    Swal.fire({
      title: 'Error',
      text: 'Could not open file. Please try again.',
      icon: 'error',
      confirmButtonColor: '#ef4444'
    });
  }
};

  useEffect(() => {
    if (userToken?.Emp_Id) {
      setFormData((prev) => ({
        ...prev,
        PLANT: userToken?.Manpower?.PLANT || "",
        CHILD_CASEID: userToken?.Manpower?.CHILD_CASEID,
        DEPT: userToken?.Manpower?.DEPT,
       EMP: userToken?.Manpower?.RECRUIT_CYCLE,
       TYPE_PLANT: userToken?.Manpower?.TYPE_PLANT,

       GROUP_CODE: userToken?.Manpower?.GROUP_CODE,
    SUB_CODE: userToken?.Manpower?.SUB_CODE,
  SUB_POST: userToken?.Manpower?.SUB_POST,
GROUP_DEPT: userToken?.Manpower?.DEPT,
RAISER_EMP_ID: "",
RECRUIT_CYCLE: userToken?.Manpower?.RECRUIT_CYCLE,

      }));
    }
  }, [userToken?.Emp_Id]);



  // Calculate age from DOBAADHAR
  const calculateAge = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };






const handleInputChange = (e) => {
  if (isPending) return;

  const { name, value } = e.target;

  let sanitized = fieldValidations[name]
    ? fieldValidations[name](value)
    : value;

  const dateFields = [
    "ORIGINAL_DOB",
    "DOB_ASPER_ADHAR",
    "PASSPORT_EXPIRY",
    "DRIVING_LICENSE_EXPIRY",
    "INTER_PASSED_YEAR",
    "SSC_PASSED_YEAR",
    "DEGREE_PASSED_YEAR",
     "PG_PASSED_YEAR",
      "PHD_PASSED_YEAR",
       "OTHER_PASSED_YEAR"
  ];

  if (dateFields.includes(name)) {
    if (value) {
      let [year, month, day] = value.split("-");

      // ❌ If year more than 4 digits → trim
      if (year.length > 4) {
        year = year.slice(0, 4);
      }

      // ❌ If year less than 4 → stop
      if (!/^\d{4}$/.test(year)) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Year must be exactly 4 digits (YYYY)",
        }));
        return;
      }

      // ✅ Rebuild safe value
      sanitized = `${year}-${month}-${day}`;
    }
  }

  if (name === "DOB_ASPER_ADHAR") {
    const age = calculateAge(sanitized);

    setFormData((prev) => ({
      ...prev,
      DOB_ASPER_ADHAR: sanitized,
      AGE: age,
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: sanitized,
    }));
  }

  if (showErrors && errors[name]) {
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }
};


const handleFileChange = (e) => {
  if (isPending) return;
  const { name, files } = e.target;
  const file = files[0];

  if (!file) return;

  // clear error on change
  if (showErrors && errors[name]) {
    setErrors(prev => ({ ...prev, [name]: "" }));
  }

  // ---------- CONFIG ----------
  const photoFields = ["PHOTO"];
  const isPhoto = photoFields.includes(name);

  const maxPhotoSize = 50 * 1024; // 50 KB
  const maxPdfSize = 200 * 1024; // 200 KB
  const maxLargePdfSize = 500 * 1024; // 500 KB

  // ---------- PHOTO VALIDATION ----------
  if (isPhoto) {
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedImageTypes.includes(file.type)) {
      Swal.fire({
        title: "Invalid File Type",
        text: "Only JPG, JPEG, or PNG images are allowed",
        icon: "error",
      });
      e.target.value = "";
      return;
    }

    if (file.size > maxPhotoSize) {
      Swal.fire({
        title: "File Too Large",
        text: "Photo size must be less than 50 KB",
        icon: "error",
      });
      e.target.value = "";
      return;
    }
  }

  // ---------- PDF VALIDATION ----------
  if (!isPhoto) {
    if (file.type !== "application/pdf") {
      Swal.fire({
        title: "Invalid File Type",
        text: "Only PDF files are allowed",
        icon: "error",
      });
      e.target.value = "";
      return;
    }

    const maxSize =
      name === "payslips" || name === "bank_statements"
        ? maxLargePdfSize
        : maxPdfSize;

    if (file.size > maxSize) {
      Swal.fire({
        title: "File Too Large",
        text: `File size must be less than ${maxSize === maxLargePdfSize ? "500kb" : "200kb"}`,
        icon: "error",
      });
      e.target.value = "";
      return;
    }
  }

  // ✅ Get existing file and metadata dynamically
  const oldFilePath = formData[name];
  
  // Get metadata from documentMetadata object (new structure)
  let oldDocId = null;
  let oldStatus = null;
  let oldCertfi = null;
  
  if (formData.documentMetadata && formData.documentMetadata[name]) {
    oldDocId = formData.documentMetadata[name].docId;
    oldStatus = formData.documentMetadata[name].status;
    oldCertfi = formData.documentMetadata[name].certfi;
  }
  
  // Also check legacy flat fields for backward compatibility
  const legacyDocId = formData[`${name}_DOCID`];
  const legacyStatus = formData[`${name}_STATUS`];
  const legacyCertfi = formData[`${name}_CERTFI`];
  
  if (legacyDocId) oldDocId = legacyDocId;
  if (legacyStatus) oldStatus = legacyStatus;
  if (legacyCertfi) oldCertfi = legacyCertfi;

  // ✅ If there's an existing file, track it as an update
  if (oldFilePath && typeof oldFilePath === 'string') {
    // This is an update operation - track the old file being replaced
    setUpdatedFiles(prev => [...prev, {
      fieldName: name,
      oldFilePath: oldFilePath,
      oldDocId: oldDocId,
      oldStatus: oldStatus,
      oldCertfi: oldCertfi,
      newFile: file,
      updatedAt: new Date().toISOString()
    }]);

    // Also add to removed files
    setRemovedFiles(prev => [...prev, {
     fieldName: name,
      filePath: oldFilePath,
      docID: oldDocId,
      file_status: oldStatus,
      certfi: oldCertfi,
      removedAt: new Date().toISOString()
    }]);
  }

  // ✅ When uploading new file, clear ALL associated metadata dynamically
  setFormData(prev => {
    const updated = { ...prev, [name]: file };
    
    // Clear metadata from documentMetadata object
    if (prev.documentMetadata) {
      updated.documentMetadata = {
        ...prev.documentMetadata,
        [name]: {
          docId: null,
          status: null,
          certfi: null
        }
      };
    }
    
    // Clear legacy flat fields if they exist
    const docIdField = `${name}_DOCID`;
    const statusField = `${name}_STATUS`;
    const certfiField = `${name}_CERTFI`;
    
    if (prev[docIdField] !== undefined) updated[docIdField] = null;
    if (prev[statusField] !== undefined) updated[statusField] = null;
    if (prev[certfiField] !== undefined) updated[certfiField] = null;
    
    return updated;
  });
};



const handleRemoveFile = (name, filePath = null, verificationId = null, fileStatus = null, certfi = null) => {
  // Prefer docID – it's the reliable key for deletion


  if (verificationId) {
    setRemovedFiles(prev => [...prev, {
      Doc_Type: name,
      verification_Id: verificationId,
      removedAt: new Date().toISOString()
    }]);
  } else if (filePath && filePath.includes('/')) {
    // Fallback to real file path if docID missing (should not happen)
    setRemovedFiles(prev => [...prev, {
      Doc_Type: name,
      filePath: filePath,
      removedAt: new Date().toISOString()
    }]);
  }
  
  // Clear the file and its metadata from formData
  setFormData(prev => ({
    ...prev,
    [name]: null,
    documentMetadata: {
      ...prev.documentMetadata,
      [name]: { docId: null, status: null, certfi: null }
    }
  }));
};

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
const experienceFieldValidations = {
    COMPANY_NAME: (val) => val.replace(/[^a-zA-Z0-9 ]/g, ''),
    DESIGNATION: (val) => val.replace(/[^a-zA-Z ]/g, ''),
};
const handleExperienceChange = (id, field, value) => {
    // ✅ Apply validation if rule exists
    const sanitized = experienceFieldValidations[field]
        ? experienceFieldValidations[field](value)
        : value;

    setExperiences(prev => prev.map(exp => {
        if (exp.id == id) {
            const updated = { ...exp, [field]: sanitized }; // ✅ use sanitized

            if (field === 'FROM_DATE' || field === 'TO_DATE') {
                if (updated.FROM_DATE && updated.TO_DATE) {
                    const fromDate = new Date(updated.FROM_DATE);
                    const toDate = new Date(updated.TO_DATE);

                    let years = toDate.getFullYear() - fromDate.getFullYear();
                    let months = toDate.getMonth() - fromDate.getMonth();
                    let days = toDate.getDate() - fromDate.getDate();

                    if (days < 0) {
                        months--;
                        const lastMonth = new Date(toDate.getFullYear(), toDate.getMonth(), 0);
                        days += lastMonth.getDate();
                    }
                    if (months < 0) {
                        years--;
                        months += 12;
                    }

                    const totalMonths = years * 12 + months;
                    if (totalMonths > 0 || days > 0) {
                        updated.DURATION = days > 0
                            ? `${totalMonths + 1} (${totalMonths} months ${days} days)`
                            : totalMonths.toString();
                    } else {
                        updated.DURATION = '';
                    }
                }
           }
            return updated;
        }
        return exp;
    }));

    if (showErrors && errors[`exp_${id}_${field}`]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`exp_${id}_${field}`];
            return newErrors;
        });
    }
};





  const handleDraft = async () => {
    // FIRST_NAME

if (!formData.EMAIL?.trim()) {
  Swal.fire({
    title: "Email Required",
    text: "Email is mandatory even for saving as draft. Please enter your email address.",
    icon: "warning",
    confirmButtonColor: "#3085d6",
    confirmButtonText: "OK"
  });

  return; // ✅ STOP execution here
}

if (!formData.FIRST_NAME?.trim()) {
  Swal.fire({
    title: "Name Required",
    text: "Name is mandatory even for saving as draft. Please enter your name.",
    icon: "warning",
    confirmButtonColor: "#3085d6",
    confirmButtonText: "OK"
  });

  return; // ✅ STOP execution here
}

    const draftResult = await Swal.fire({
      title: "Save as Draft?",
      text: "Do you want to save this form as a draft?",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Save Draft!",
      cancelButtonText: "No, Continue Editing"
    });



      if (!draftResult.isConfirmed) return;

  // ✅ LOADING POPUP
  Swal.fire({
    title: "Processing...",
    text: "Saving your draft, please wait...",
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

    const data = new FormData();

    // Add regular fields
    Object.entries(formData).forEach(([key, value]) => {
      if (!value) return;

      if (value instanceof File) {
        data.append(key, value);
      } else if (typeof value == "string") {
        data.append(key, value);
      } else if (key === "AADHAR_DOCID" || key === "AADHAR_STATUS") {
        // Send numeric/other values as strings
        if (value !== null && value !== undefined) {
          data.append(key, String(value));
        }
      }
    });


  
    data.append("status", "draft");
    data.append("address_status", sameAsPermanent ? "YES" : "NO");
    if (formData.AGE) data.append("AGE", String(formData.AGE));

    // ✅ Add removed files information
  // if (removedFiles.length > 0) {
  data.append('removed_files', JSON.stringify(removedFiles));
// }

if (updatedFiles.length > 0) {
  data.append('updated_files', JSON.stringify(updatedFiles));
}

// Also send document metadata


// Inside handleSubmit and handleDraft functions, replace the experiences loop with:

experiences.forEach((exp, index) => {
  // Basic fields - always send for all experiences
  data.append(`experiences[${index}][companyname]`, exp.COMPANY_NAME || "");
  data.append(`experiences[${index}][designation]`, exp.DESIGNATION || "");
  data.append(`experiences[${index}][fromdate]`, exp.FROM_DATE || "");
  data.append(`experiences[${index}][todate]`, exp.TO_DATE || "");
  data.append(`experiences[${index}][duration]`, exp.DURATION || "");
  data.append(`experiences[${index}][stage]`, index);
  data.append(`experiences[${index}][isCurrent]`, exp.isCurrent ? "true" : "false");


  data.append(`experiences[${index}][EMP_COMP_ID]`, exp.EMP_COMP_ID || '');

    
  
  // Notice Period - only for current company
  if (exp.isCurrent) {
    data.append(`experiences[${index}][noticePeriod]`, exp.NOTICE_PERIOD || "");
  }
  
  // For debugging

});

  
    


    const response = await axiosInstance.post(`${API_BASE_URL}/recruitStore`, data, {
      headers: {
        Authorization: `Bearer ${userToken.token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      // ✅ Clear removed files after successful save
      setRemovedFiles([]);
      Swal.fire({
        title: "Draft Saved!",
        text: "Your form has been saved as draft successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire("Failed", response.data.message, "error");
    }
  };

  

  const addExperience = () => {
    setExperiences(prev => [...prev, {
      id: Date.now(),
      COMPANY_NAME: '',
      DESIGNATION: '',
      FROM_DATE: '',
      TO_DATE: '',
      DURATION: '',
      CURRENT_CTC: '',
      EXP_CTC: '',
      NOTICE_PERIOD: '',
      PAYSLIPS: [],
      relieving_letter: null,
      offer_letter: null,
      EXP_LETTER: null,
      BANK_STATEMENTS: [],
      isCurrent: false,
      COMPANY_STAGES: "",
    }]);
  };

const removeExperience = async (id) => {


  if (experiences.length == 1) {
    Swal.fire({
      title: "Cannot Remove",
      text: "At least one experience entry is required",
      icon: "warning",
    });
    return;
  }

  // Confirmation popup
  const result = await Swal.fire({
    title: "Are you sure?",
    text: `Do you want to delete this experience? (ID: ${id})`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });

  if (!result.isConfirmed) return;




  const payload = { EMP_COMP_ID: id };

  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/EmpExpDelete`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${userToken.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (response?.data?.status === 200) {
      Swal.fire({
        icon: "success",
        title: "Deleted Successfully!",
        text: response?.data?.message,
        timer: 1500,
        showConfirmButton: false,
      });

      // Remove from state
      setExperiences((prev) =>
        prev.filter((exp) => exp.EMP_COMP_ID !== id)
      );
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: response?.data?.message || "Something went wrong",
        timer: 2500,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    console.error("Delete error:", error);
    Swal.fire({
      title: "Delete Failed",
      text:
        error.response?.data?.message ||
        "Something went wrong. Please try again.",
      icon: "error",
      confirmButtonColor: "#dc2626",
    });
  }
};



  const scrollToError = (fieldName) => {
    // ── 1. Determine which section owns this field and open it ──
    const basicInfoFields = [
      'FIRST_NAME','LAST_NAME','GENDER','MARITAL_STATUS','LANG_KNOWN','MOTHER_TONGUE',
      'EMAIL','PHONE_NUMBER','EMER_CONTACT_NUM','ORIGINAL_DOB','DOB_ASPER_ADHAR','AGE',
      'HIGHEST_QUA','AADHAR_NUM','PAN_NUM','UAN_NUM','UAN_FILE','ESI_NUM',
      'SRC_TYPE','SRC_REFER_NAME','SRC_REFER_DEPT','BLOOD_GROUP',
      'PASSPORT_NUMBER','PASSPORT_EXPIRY','DRIVING_LICENSE','DRIVING_LICENSE_EXPIRY',
      'HNO','CITY','MANDAL','DISTRICT','STATE','PINCODE',
      'PRESENT_HNO','PRESENT_CITY','PRESENT_MANDAL','PRESENT_DISTRICT','PRESENT_STATE','PRESENT_PINCODE',
      'AADHAR_PATH','PAN_PATH','PHOTO','RESUME_UPLOAD',
    ];
    const educationFields = [
      'SSC_SCHOOL_NAME','SSC_BOARD','SSC_MARKS','SSC_PASSED_YEAR','10TH_FILENAME',
      'INTER_COLLEGE_NAME','INTER_BOARD','INTER_MARKS','INTER_PASSED_YEAR','INTER_FILENAME',
      'GRAD_COLLEGE_NAME','DEGREE_UNIVERSITY','BTECH_MARKS','DEGREE_PASSED_YEAR','BTECH_FILENAME',
      'PG_COLLEGE_NAME','PG_UNIVERSITY','PG_MARKS','PG_PASSED_YEAR','PG_FILENAME',
      'PHD_COLLEGE_NAME','PHD_UNIVERSITY','PHD_MARKS','PHD_PASSED_YEAR','PHD_FILENAME',
      'OTHER_COLLEGE_NAME','OTHER_UNIVERSITY','OTHER_MARKS','OTHER_PASSED_YEAR','OTHER_FILENAME',
    ];
    const experienceFields = [
      'CURRENT_CTC','EXP_CTC','TOTAL_EXP','payslips','bank_statements',
    ];

    const isExperienceField = fieldName.startsWith('exp_') || experienceFields.includes(fieldName);

    let sectionToOpen = null;
    if (basicInfoFields.includes(fieldName)) sectionToOpen = 'basicInfo';
    else if (educationFields.includes(fieldName)) sectionToOpen = 'education';
    else if (isExperienceField) sectionToOpen = 'experience';

    // Open the section if needed, then scroll after React re-renders
    if (sectionToOpen) {
      setOpenSections(prev => {
        if (!prev[sectionToOpen]) {
          // Section was closed – open it and schedule scroll after paint
          setTimeout(() => performScroll(fieldName), 300);
          return { ...prev, [sectionToOpen]: true };
        }
        // Section already open – scroll immediately
        setTimeout(() => performScroll(fieldName), 50);
        return prev;
      });
    } else {
      setTimeout(() => performScroll(fieldName), 50);
    }
  };

  // ─── FIX: performScroll handles refs AND id-based fallback for ALL element types ───
  const performScroll = (fieldName) => {
    let element = fieldRefs.current[fieldName] || document.getElementById(fieldName);

    if (!element) return false;

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Only focus focusable elements (inputs, selects, textareas)
    const focusable = ['INPUT', 'SELECT', 'TEXTAREA'];
    if (focusable.includes(element.tagName)) {
      element.focus();
    }

    // Highlight animation
    const originalBorder = element.style.border;
    const originalBoxShadow = element.style.boxShadow;
    element.style.transition = 'all 0.3s';
    element.style.border = '2px solid #ef4444';
    element.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';

    setTimeout(() => {
      if (element) {
        element.style.border = originalBorder;
        element.style.boxShadow = originalBoxShadow;
      }
    }, 2000);

    return true;
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic fields
    if (!formData.FIRST_NAME?.trim()) newErrors.FIRST_NAME = "First Name is required";
    if (!formData.GENDER) newErrors.GENDER = "Gender is required";
    if (!formData.MARITAL_STATUS) newErrors.MARITAL_STATUS = "Marital Status is required";
    
    if (!formData.LANG_KNOWN?.trim()) newErrors.LANG_KNOWN = "Languages Known is required";
    if (!formData.MOTHER_TONGUE?.trim()) newErrors.MOTHER_TONGUE = "Mother Tongue is required";
    if (!formData.EMAIL?.trim()) {
      newErrors.EMAIL = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.EMAIL)) {
      newErrors.EMAIL = "Invalid email format";
    }
     if (!formData.PHONE_NUMBER?.trim()) {
      newErrors.PHONE_NUMBER = "Phone Number is required";
    } else if (formData.PHONE_NUMBER.length !== 10) {
      newErrors.PHONE_NUMBER = "Phone number must be 10 digits";
    }
     if (!formData.EMER_CONTACT_NUM?.trim()) {
      newErrors.EMER_CONTACT_NUM = "Emergency Contact is required";
    } else if (formData.EMER_CONTACT_NUM.length !== 10) {
      newErrors.EMER_CONTACT_NUM = "Emergency contact must be 10 digits";
    }
    if (!formData.ORIGINAL_DOB) newErrors.ORIGINAL_DOB = "Date of Birth is required";
    if (!formData.DOB_ASPER_ADHAR) newErrors.DOB_ASPER_ADHAR = "DOB (as per Aadhar) is required";
if (!formData.HIGHEST_QUA?.trim()) newErrors.HIGHEST_QUA = "Highest Qualification is required";
if (!formData.AADHAR_NUM?.trim()) {
      newErrors.AADHAR_NUM = "Aadhaar Number is required";
    } else if (formData.AADHAR_NUM.length !== 12) {
      newErrors.AADHAR_NUM = "Aadhaar must be 12 digits";
    }
    if (!formData.PAN_NUM?.trim()) newErrors.PAN_NUM = "PAN Number is required";   

if (!formData.UAN_NUM?.trim()) newErrors.UAN_NUM = "UAN Number is required";
    if (formData.UAN_NUM?.length === 12 && !formData.UAN_FILE) newErrors.UAN_FILE = "UAN File is required";
if (!formData.ESI_NUM?.trim()) newErrors.ESI_NUM = "ESI Number is required";
    if (!formData.SRC_TYPE) newErrors.SRC_TYPE = "Source is required";
    if (formData.SRC_TYPE === "reference" && !formData.SRC_REFER_NAME?.trim()) {
      newErrors.SRC_REFER_NAME = "Reference Name is required";
    }
    if (formData.SRC_TYPE === "reference" && !formData.SRC_REFER_DEPT?.trim()) {
      newErrors.SRC_REFER_DEPT = "Reference dept is required";
    }


    if (formData.PASSPORT_NUMBER?.trim() && !formData.PASSPORT_EXPIRY) {
      newErrors.PASSPORT_EXPIRY = "Passport Expiry date is required";
    }
    if (formData.DRIVING_LICENSE?.trim() && !formData.DRIVING_LICENSE) {
      newErrors.DRIVING_LICENSE_EXPIRY = "Licence Expiry date is required";
    }



    // Permanent Address
    if (!formData.HNO?.trim()) newErrors.HNO = "House No/Street is required";
    if (!formData.CITY?.trim()) newErrors.CITY = "City is required";
    if (!formData.DISTRICT?.trim()) newErrors.DISTRICT = "District is required";
    if (!formData.STATE?.trim()) newErrors.STATE = "State is required";
    if (!formData.PINCODE?.trim()) newErrors.PINCODE = "Pincode is required";

    // Present Address
    if (sameAsPermanent !== true) {
      if (!formData.PRESENT_HNO?.trim()) newErrors.PRESENT_HNO = "House No/Street is required";
      if (!formData.PRESENT_CITY?.trim()) newErrors.PRESENT_CITY = "City is required";
      if (!formData.PRESENT_DISTRICT?.trim()) newErrors.PRESENT_DISTRICT = "District is required";
      if (!formData.PRESENT_STATE?.trim()) newErrors.PRESENT_STATE = "State is required";
      if (!formData.PRESENT_PINCODE?.trim()) newErrors.PRESENT_PINCODE = "Pincode is required";
    }

if (!formData.AADHAR_PATH) newErrors.AADHAR_PATH = "Aadhaar Card is required";
     if (!formData.RESUME_UPLOAD) newErrors.RESUME_UPLOAD = "Resume is required";
    if (!formData.PAN_PATH) newErrors.PAN_PATH = "PAN Card is required";
    if (!formData.PHOTO) newErrors.PHOTO = "Photo is required";
   



    // ID proofs
    
    
    
    // Education
    if (!formData.SSC_SCHOOL_NAME?.trim()) newErrors.SSC_SCHOOL_NAME = "SSC School is required";
        if (!formData.SSC_BOARD?.trim()) newErrors.SSC_BOARD = "SSC Board is required";
    if (!formData.SSC_MARKS?.toString().trim()) newErrors.SSC_MARKS = "SSC %";
    if(!formData.SSC_PASSED_YEAR) newErrors.SSC_PASSED_YEAR = "SSC passed yr is required";
    if (!formData['10TH_FILENAME']) newErrors['10TH_FILENAME'] = "10th Marksheet is required";

    if (formData.EMP !== "Work Man") {
      if (!formData.INTER_COLLEGE_NAME?.trim()) newErrors.INTER_COLLEGE_NAME = "Intermediate College is required";
        if (!formData.INTER_BOARD?.trim()) newErrors.INTER_BOARD = "Inter Board is required";
      if (!formData.INTER_MARKS?.toString().trim()) newErrors.INTER_MARKS = "Inter %";
         if(!formData.INTER_PASSED_YEAR) newErrors.INTER_PASSED_YEAR = "Inter passed yr is required";

      if (!formData.INTER_FILENAME) newErrors.INTER_FILENAME = "Inter Marksheet is required";
      

      if (!formData.GRAD_COLLEGE_NAME?.trim()) newErrors.GRAD_COLLEGE_NAME = "Degree/B.Tech College is required";
           if (!formData.DEGREE_UNIVERSITY?.trim()) newErrors.DEGREE_UNIVERSITY = "Degree univ is required";

      if (!formData.BTECH_MARKS?.toString().trim()) newErrors.BTECH_MARKS = "B.Tech/Degree % ";
       if (!formData.DEGREE_PASSED_YEAR?.trim()) newErrors.DEGREE_PASSED_YEAR = "Degree passed yr is required";
      if (!formData.BTECH_FILENAME) newErrors.BTECH_FILENAME = "B.Tech/Degree Marksheet is required";
    }

   
   
 experiences.forEach((exp, index) => {
      if (!exp.COMPANY_NAME?.trim()) {
        newErrors[`exp_${exp.id}_COMPANY_NAME`] = "Company name is required";
      }
      if (!exp.DESIGNATION?.trim()) {
        newErrors[`exp_${exp.id}_DESIGNATION`] = "Designation is required";
      }
      if (!exp.FROM_DATE) {
        newErrors[`exp_${exp.id}_FROM_DATE`] = "From date is required";
      }
      if (!exp.TO_DATE) {
        newErrors[`exp_${exp.id}_TO_DATE`] = "To date is required";
      }
      if (exp.FROM_DATE && exp.TO_DATE) {
        const fromDate = new Date(exp.FROM_DATE);
        const toDate = new Date(exp.TO_DATE);
        if (toDate < fromDate) {
          newErrors[`exp_${exp.id}_TO_DATE`] = "To date cannot be before from date";
        }
      }
      if (exp.isCurrent) {
        if (!exp.NOTICE_PERIOD?.toString().trim()) {
          newErrors[`exp_${exp.id}_NOTICE_PERIOD`] = "Notice period is required for current company";
        } else if (exp.NOTICE_PERIOD < 0) {
          newErrors[`exp_${exp.id}_NOTICE_PERIOD`] = "Notice period cannot be negative";
        }
      }
    });

    

    // CTC
    if (!formData.CURRENT_CTC?.toString().trim()) newErrors.CURRENT_CTC = "Current CTC is required";
    if (!formData.EXP_CTC?.toString().trim()) newErrors.EXP_CTC = "Expected CTC is required";
    if (!formData.TOTAL_EXP?.trim()) newErrors.TOTAL_EXP = "Total Experience is required";

   

   
   
   

   const hasCurrentCompany = experiences.some(exp => exp.isCurrent);
    if (hasCurrentCompany && !formData.bank_statements) {
      newErrors.bank_statements = "Bank Statements are required";
    }
    if (hasCurrentCompany && !formData.payslips) {
      newErrors.payslips = "payslips are required";
    }

    return newErrors;
  };



    const handleSubmit = async () => {


  const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
     setShowErrors(true);

      const firstErrorField = Object.keys(validationErrors)[0];
      
      // Scroll to the first error field
      if (firstErrorField) {
       scrollToError(firstErrorField);
      }

      return;
    }


    const result = await Swal.fire({
      title: "Confirm Submission",
      text: "Are you sure you want to submit this form?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Submit!",
      cancelButtonText: "No, Cancel"
    });

    if (!result.isConfirmed) return;


  // ✅ LOADING POPUP
  Swal.fire({
    title: "Processing...",
    text: "Saving your submit, please wait...",
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

    const data = new FormData();

    // Add regular fields
    Object.entries(formData).forEach(([key, value]) => {
      if (!value) return;

      if (value instanceof File) {
        data.append(key, value);
      } else if (typeof value == "string") {
        data.append(key, value);
      } else if (key === "AADHAR_DOCID" || key === "AADHAR_STATUS") {
        // Send numeric/other values as strings
        if (value !== null && value !== undefined) {
          data.append(key, String(value));
        }
      }
    });


  
     data.append('status', "submit");
   data.append('address_status', sameAsPermanent === true ? "YES" : sameAsPermanent === false ? "NO" : "");
    if (formData.AGE) data.append("AGE", String(formData.AGE));

    // ✅ Add removed files information
    if (removedFiles.length > 0) {
      data.append('removed_files', JSON.stringify(removedFiles));
    }


  
experiences.forEach((exp, index) => {
  data.append(`experiences[${index}][companyname]`, exp.COMPANY_NAME || "");
  data.append(`experiences[${index}][designation]`, exp.DESIGNATION || "");
  data.append(`experiences[${index}][fromdate]`, exp.FROM_DATE || "");
  data.append(`experiences[${index}][todate]`, exp.TO_DATE || "");
  data.append(`experiences[${index}][duration]`, exp.DURATION || "");
  data.append(`experiences[${index}][stage]`, index);
  data.append(`experiences[${index}][isCurrent]`, exp.isCurrent ? "true" : "false");




data.append(`experiences[${index}][EMP_COMP_ID]`, exp.EMP_COMP_ID);

  if (exp.isCurrent) {
     
    data.append(`experiences[${index}][noticePeriod]`, exp.NOTICE_PERIOD || "");
  }


});

  
    

    // Send request
    const response = await axiosInstance.post(`${API_BASE_URL}/recruitStore`, data, {
      headers: {
        Authorization: `Bearer ${userToken.token}`,
        "Content-Type": "multipart/form-data",
      },
    });

     if (response.data.success) {
        // ✅ Clear removed files after successful save
        setRemovedFiles([]);
        await Swal.fire({
          title: "Success",
          text: "Recruitment data updated successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
// resetForm();
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
        // Optionally reset or redirect
      } else {
        await Swal.fire("Failed", response.data.message, "error");
      }
  };
  

  const resetForm = () => {
    setFormData({
      CHILD_CASEID: '',
      PLANT: '',
      FIRST_NAME: '',
      LAST_NAME: '',
      EMAIL: '',
      ADDRSS_STATUS: "",
      PHONE_NUMBER: '',
      ORIGINAL_DOB: '',
      GENDER: '',
      MARITAL_STATUS: '',
      LANG_KNOWN: '',
      MOTHER_TONGUE: '',
      DEPT: '',
      EMP: '',
      HNO: '',
      CITY: '',
      MANDAL: '',
      DISTRICT: '',
      STATE: '',
      PINCODE: '',
      PRESENT_HNO: '',
      PRESENT_CITY: '',
      PRESENT_MANDAL: '',
      PRESENT_DISTRICT: '',
      PRESENT_STATE: '',
      PRESENT_PINCODE: '',
      AADHAR_NUM: '',
      PAN_NUM: '',
      UAN_NUM: '',
      UAN_FILE: null,
      DOB_ASPER_ADHAR: '',
      ESI_NUM: '',
      SRC_TYPE: '',
      SRC_REFER_NAME: '',
      SRC_REFER_DEPT: '',
      EMER_CONTACT_NUM: '',
      PASSPORT_NUMBER: '',
     PASSPORT_EXPIRY: '',
      DRIVING_LICENSE: '',
      DRIVING_LICENSE_EXPIRY: '',
      BLOOD_GROUP: '',
      SSC_SCHOOL_NAME: '',
      SSC_BOARD: '',
      SSC_MARKS: '',
      SSC_PASSED_YEAR: '',
      '10TH_FILENAME': null,
      INTER_COLLEGE_NAME: '',
      INTER_BOARD: '',
      INTER_MARKS: '',
      INTER_PASSED_YEAR: '',
      INTER_FILENAME: null,
      GRAD_COLLEGE_NAME: '',
      DEGREE_UNIVERSITY: '',
      BTECH_MARKS: '',
      DEGREE_PASSED_YEAR: '',
      BTECH_FILENAME: null,
      PG_COLLEGE_NAME: '',
      PG_UNIVERSITY: '',
      PG_MARKS: '',
      PG_PASSED_YEAR: '',
      PG_FILENAME: null,
      PHD_COLLEGE_NAME: '',
      PHD_UNIVERSITY: '',
      PHD_MARKS: '',
      PHD_PASSED_YEAR: '',
      PHD_FILENAME: null,
      OTHER_COLLEGE_NAME: '',
      OTHER_UNIVERSITY: '',
      OTHER_MARKS: '',
      OTHER_PASSED_YEAR: '',
      OTHER_FILENAME: null,
      AADHAR_PATH: null,
      AADHAR_DOCID: null,
      AADHAR_STATUS: null,
      PAN_PATH: null,
      PHOTO: null,
      RESUME_UPLOAD: null,
      CURRENT_CTC: '',
      EXP_CTC: '',
      AGE: '',
      HIGHEST_QUA: '',
    });
    setExperiences([
      {
        id: Date.now(),
        COMPANY_NAME: '',
        DESIGNATION: '',
        FROM_DATE: '',
        TO_DATE: '',
        DURATION: '',
        CURRENT_CTC: '',
        EXP_CTC: '',
        NOTICE_PERIOD: '',
        PAYSLIPS: [],
        RELIEVING_LETTER: null,
        OFFER_LETTER: null,
        EXP_LETTER: null,
        BANK_STATEMENTS: [],
        isCurrent: true
      }
    ]);
    setSameAsPermanent(null);
   setErrors({});
    setShowErrors(false);
    setRemovedFiles([]); // ✅ Clear removed files on reset
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

  const inputStyle = {
    width: '100%',
    height: '30px',
    padding: '5px 8px',
    border: '1px solid #93c5fd',
    borderRadius: '4px',
    fontSize: '12px',
    background: '#ffffff',
    boxSizing: 'border-box'
  };
const FileUpload = ({ label, name, onChange, onRemove, error, selectedFile, isPending, onOpenFile }) => {
  const inputRef = React.useRef();
  
  // ✅ Get metadata from documentMetadata
  const metadata = formData.documentMetadata?.[name] || {
    docId: null,
    status: null,
    certfi: null
  };

const getFileNameFromPath = (path) => {
  if (!path) return null;

  let fullName = '';
  if (typeof path === 'string') {
    const parts = path.split('/');
    fullName = parts[parts.length - 1];
  } else {
    fullName = path?.name || '';
  }

  if (!fullName) return null;

  const dotIndex = fullName.lastIndexOf('.');
  const ext = dotIndex !== -1 ? fullName.slice(dotIndex) : '';      // e.g. ".pdf"
  const baseName = dotIndex !== -1 ? fullName.slice(0, dotIndex) : fullName;

  // ✅ Show up to 6 chars of base name + extension
 const truncated = baseName.length > 15
    ? baseName.slice(0, 15) + ext        // e.g. "resume.pdf", "aadhar.pdf"
    : fullName;                       // short names shown as-is

  return truncated;
};

  const handleChange = (e) => onChange(e);
  
  const handleRemove = () => {
    if (inputRef.current) inputRef.current.value = '';
    
    // ✅ IMPORTANT: Use the ACTUAL file path from selectedFile or metadata
    let filePath = null;
    let docId = metadata?.docId || null;
    let status = metadata?.status || null;
    let certfi = metadata?.certfi || null;

    // Priority: selectedFile (if string) > certfi > null
    if (selectedFile && typeof selectedFile === 'string') {
      filePath = selectedFile;  // This is the actual file path from server
    } else if (certfi) {
      filePath = certfi;  // Fallback to certfi
    } else if (selectedFile && selectedFile instanceof File) {
      filePath = selectedFile.name;
    }
    
    console.log(`Removing ${name}:`, { filePath, docId, status, certfi });
    onRemove(name, filePath, docId, status, certfi);
  };

  const fileName = selectedFile ? getFileNameFromPath(selectedFile) : '';

  return (
    <div id={name} ref={(ele) => registerRef(name, ele)}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '3px' }}>
        {label}
      </label>

      {!isPending ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              ref={inputRef}
              type="file"
              name={name}
              accept="application/pdf,image/jpeg,image/png"
              onChange={handleChange}
              style={{ display: 'none' }}
            />
            <span style={{ padding: '5px 10px', background: 'linear-gradient(to right, #dbeafe, #bfdbfe)', color: '#1e40af', borderRadius: '6px', fontWeight: '600', fontSize: '11px' }}>
              Choose File
            </span>
          </label>

          {selectedFile && (
            <>
              <button type="button" onClick={() => onOpenFile(selectedFile)} style={{ padding: '5px 10px', background: 'linear-gradient(to right, #6fb6ed, #76b2ee)', color: 'white', borderRadius: '6px', fontWeight: '600', fontSize: '11px', border: 'none', cursor: 'pointer' }}>
                <Eye size={12} color="#1e40af" strokeWidth={3} />
              </button>
              
              <button type="button" onClick={handleRemove} style={{ background: '#c84141', color: '#f6efef', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
              
              <span style={{ color: '#1e40af', fontSize: '10px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                {fileName || 'Selected file'}
              </span>
            </>
          )}
        </div>
      ) : (
        selectedFile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
            <button type="button" onClick={() => onOpenFile(selectedFile)} style={{ padding: '4px 12px', background: 'linear-gradient(to right, #7baaeb, #6998e9)', color: 'white', borderRadius: '6px', fontWeight: '600', fontSize: '11px', border: 'none', cursor: 'pointer' }}>
              <Eye size={12} color="#1e40af" strokeWidth={3} />
            </button>
            <span style={{ color: '#1e40af', fontSize: '9px', fontWeight: '500' }}>{fileName || 'File uploaded'}</span>
          </div>
        )
      )}
      
      {error && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px' }}>{error}</p>}
    </div>
  );
};


const TableFileUpload = ({ name, onChange, onRemove, selectedFile, error, isPending, onOpenFile }) => {
  const inputRef = React.useRef();
  
  // ✅ Get metadata dynamically
  const metadata = formData.documentMetadata?.[name] || {
    docId: null,
    status: null,
    certfi: null
  };

const getFileNameFromPath = (path) => {
  if (!path) return null;

  let fullName = '';
  if (typeof path === 'string') {
    const parts = path.split('/');
    fullName = parts[parts.length - 1];
  } else {
    fullName = path?.name || '';
  }

  if (!fullName) return null;

  const dotIndex = fullName.lastIndexOf('.');
  const ext = dotIndex !== -1 ? fullName.slice(dotIndex) : '';      // e.g. ".pdf"
  const baseName = dotIndex !== -1 ? fullName.slice(0, dotIndex) : fullName;

  // ✅ Show up to 6 chars of base name + extension
  const truncated = baseName.length > 15
    ? baseName.slice(0, 15) + ext        // e.g. "resume.pdf", "aadhar.pdf"
    : fullName;                          // short names shown as-is

  return truncated;
};

  const handleChange = (e) => onChange(e);
  const handleRemove = () => {
    if (inputRef.current) inputRef.current.value = '';
    
    let filePath = null;
    let docId = metadata?.docId || null;
    let status = metadata?.status || null;
    let certfi = metadata?.certfi || null;

    if (selectedFile && typeof selectedFile === 'string') {
      filePath = selectedFile;
    }

    console.log(`Removing ${name}:`, { filePath, docId, status, certfi });
    onRemove(name, filePath, docId, status, certfi);
  };

  const fileName = selectedFile ? getFileNameFromPath(selectedFile) : '';

  return (
    <div id={name} ref={(ele) => registerRef(name, ele)}>
      {!isPending ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <label style={{ cursor: 'pointer' }}>
              <input ref={inputRef} type="file" name={name} accept="application/pdf" onChange={handleChange} style={{ display: 'none' }} />
              <span style={{ padding: '4px 8px', background: '#3b82f6', color: 'white', borderRadius: '4px', fontSize: '10px', fontWeight: '600', cursor: 'pointer' }}>
                {selectedFile ? 'Upload' : '📁 Upload'}
              </span>
            </label>
            
            {selectedFile && (
              <>
                <button type="button" onClick={() => onOpenFile(selectedFile, name)} style={{ padding: '4px 8px', background: '#9db6f5', color: 'white', borderRadius: '4px', fontSize: '10px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                  <Eye size={12} color="#1e40af" strokeWidth={3} />
                </button>
                
                <button type="button" onClick={handleRemove} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
              </>
            )}
          </div>
          {selectedFile && <span style={{ fontSize: '9px', color: '#1e40af' }}>{fileName}</span>}
        </div>
      ) : (
        selectedFile && (
          <div style={{ textAlign: 'center' }}>
            <button type="button" onClick={() => onOpenFile(selectedFile, name)} style={{ padding: '4px 8px', background: '#a5bef0', color: 'white', borderRadius: '4px', fontSize: '9px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
              <Eye size={12} color="#1e40af" strokeWidth={3} />
            </button>
            <div style={{ fontSize: '7px', color: '#1e40af' }}>{fileName}</div>
          </div>
        )
      )}
      {error && <p style={{ color: '#ef4444', fontSize: '9px', textAlign: 'center' }}>{error}</p>}
    </div>
  );
};

  
  return (
    <div style={{
      maxWidth: '100%',
      width: '100%',
      margin: '0 auto',
      padding: '4px',
      borderRadius: '10px',
      boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
      border: '3px solid #87b5ee',
      background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe, #eff6ff)'
    }}>
      <style>{responsiveStyles}</style>
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        <form
         id="recruitmentForm"
          onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

          {/* ================= BASIC INFORMATION ================= */}
          <div style={{
            background: 'linear-gradient(160deg, #fafafa 0%, #ffffff 40%, #ffffff 100%)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(30,64,175,0.08), 0 8px 32px rgba(59,130,246,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
            padding: '8px',
            paddingTop: '20px',
            border: '1.5px solid rgba(147,197,253,0.6)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* decorative top bar and blobs (omitted for brevity, keep as original) */}
             <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: 'linear-gradient(90deg, #1e40af 0%, #2563eb 25%, #3b82f6 50%, #0ea5e9 75%, #06b6d4 100%)',
              borderRadius: '12px 12px 0 0',
            }} />
            <div style={{
              position: 'absolute', top: '-40px', right: '-40px',
              width: '160px', height: '160px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(147,197,253,0.18) 0%, transparent 65%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: '-30px', left: '-20px',
              width: '120px', height: '120px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(186,230,253,0.15) 0%, transparent 65%)',
              pointerEvents: 'none',
            }} />

  <div className="btn-row" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px', marginBottom: '10px', flexWrap: 'wrap', padding: '15px 0' }}>
                       <h2 style={{
                         ...sectionHeading,
                         margin: 0,
                         fontSize: '13px',
                         fontWeight: '800',
                         letterSpacing: '0.6px',
                         textTransform: 'uppercase',
                         background: 'linear-gradient(90deg, #1e3a8a, #1d4ed8, #0284c7)',
                         WebkitBackgroundClip: 'text',
                         WebkitTextFillColor: 'transparent',
                         display: 'flex', alignItems: 'center', gap: '6px',
                       }}>
                         <User size={16} strokeWidth={2} />
                         Basic Information
                       </h2>
                       <button
                         type="button"
                         onClick={() => toggleSection('basicInfo')}
                         style={{
                           background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                           border: 'none', cursor: 'pointer', color: '#fff',
                           borderRadius: '6px', width: '20px', height: '20px',
                           display: 'flex', alignItems: 'center', justifyContent: 'center',
                           fontSize: '9px', fontWeight: '700',
                           boxShadow: '0 2px 6px rgba(37,99,235,0.35)',
                         }}
                       >
                         {openSections.basicInfo ? '▲' : '▼'}
                       </button>
                     </div>
            <div style={{ opacity: isPending ? 0.85 : 1 }}>
    
  {openSections.basicInfo && (
    <>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '6px' }}>
        <InputField 
          label="Child Case ID" 
          name="CHILD_CASEID" 
          value={formData.CHILD_CASEID} 
          onChange={handleInputChange}   
          inputRef={(el) => registerRef('CHILD_CASEID', el)}  
          disabled 
        />
        <InputField 
          label="Plant" 
          name="PLANT" 
          value={formData.PLANT} 
          onChange={handleInputChange} 
          disabled 
          inputRef={(el) => registerRef('PLANT', el)}
        />
        <InputField 
          label="Department" 
          name="DEPT" 
          value={formData.DEPT} 
          onChange={handleInputChange} 
          disabled 
          inputRef={(el) => registerRef('DEPT', el)}
        />
        <InputField 
          label="Employee level" 
          name="EMP" 
          value={formData.EMP} 
          onChange={handleInputChange} 
          disabled 
          inputRef={(el) => registerRef('EMP', el)}
        />

        <InputField 
          label={<>Name <span style={{ color: '#d30f0f' }}>*</span></>}
          name="FIRST_NAME" 
          value={formData.FIRST_NAME} 
          onChange={handleInputChange} 
          error={showErrors ? errors.FIRST_NAME : ''}
          inputRef={(el) => registerRef('FIRST_NAME', el)}
        />
        
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>
            Gender <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select 
            id="GENDER"
            name="GENDER" 
            value={formData.GENDER} 
            onChange={handleInputChange}
            inputRef={(el) => registerRef('GENDER', el)}
            style={{
              width: '100%', padding: '2px 8px', height: '28px',
              border: `1.5px solid ${showErrors && errors.GENDER ? '#ef4444' : '#1572dd'}`,
              borderRadius: '6px', fontSize: '12px', outline: 'none',
              background: '#ffffff',
              color: '#1e3a8a', fontWeight: '500',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
            }}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {showErrors && errors.GENDER && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.GENDER}</p>}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>
            Marital Status <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select 
            id="MARITAL_STATUS"
            name="MARITAL_STATUS" 
            value={formData.MARITAL_STATUS} 
            onChange={handleInputChange}
            inputRef={(el) => registerRef('MARITAL_STATUS', el)}
            style={{
              width: '100%', padding: '2px 8px', height: '28px',
              border: `1.5px solid ${showErrors && errors.MARITAL_STATUS ? '#ef4444' : '#1472dd'}`,
              borderRadius: '6px', fontSize: '12px', outline: 'none',
              background: '#ffffff',
              color: '#1e3a8a', fontWeight: '500',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
            }}>
            <option value="">Select Status</option>
            <option value="Married">Married</option>
            <option value="Unmarried">Unmarried</option>
          </select>
          {showErrors && errors.MARITAL_STATUS && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.MARITAL_STATUS}</p>}
        </div>

        <InputField 
          label={<>Languages Known <span style={{ color: '#ef4444' }}>*</span></>} 
          name="LANG_KNOWN" 
          value={formData.LANG_KNOWN} 
          onChange={handleInputChange} 
          placeholder="e.g. English, Telugu" 
          error={showErrors ? errors.LANG_KNOWN : ''}
          inputRef={(el) => registerRef('LANG_KNOWN', el)}
        />
        
        <InputField 
          label={<>Mother Tongue <span style={{ color: '#ef4444' }}>*</span></>} 
          name="MOTHER_TONGUE" 
          value={formData.MOTHER_TONGUE} 
          onChange={handleInputChange} 
          error={showErrors ? errors.MOTHER_TONGUE : ''}
          inputRef={(el) => registerRef('MOTHER_TONGUE', el)}
        />

        <InputField 
          label={<>Email <span style={{ color: '#ef4444' }}>*</span></>} 
          name="EMAIL" 
          type="email" 
          value={formData.EMAIL} 
          onChange={handleInputChange} 
          error={showErrors ? errors.EMAIL : ''}
          inputRef={(el) => registerRef('EMAIL', el)}
        />
        
        <InputField 
          label={<>Phone Number <span style={{ color: '#ef4444' }}>*</span></>} 
          name="PHONE_NUMBER" 
          value={formData.PHONE_NUMBER} 
          maxLength={10} 
       onChange={handleInputChange} 
          error={showErrors ? errors.PHONE_NUMBER : ''}
          inputRef={(el) => registerRef('PHONE_NUMBER', el)}
        />
        
        <InputField 
          label={<>Emergency Contact <span style={{ color: '#ef4444' }}>*</span></>} 
          name="EMER_CONTACT_NUM" 
          value={formData.EMER_CONTACT_NUM} 
          maxLength={10} 
          onChange={(e) => { 
            const val = e.target.value.replace(/\D/g, ""); 
            if (val.length <= 10) { 
              handleInputChange({ target: { name: "EMER_CONTACT_NUM", value: val } }); 
            } 
          }} 
          error={showErrors ? errors.EMER_CONTACT_NUM : ''}
          inputRef={(el) => registerRef('EMER_CONTACT_NUM', el)}
        />

        <InputField 
          label={<>DOB (as per original) <span style={{ color: '#ef4444' }}>*</span></>} 
          name="ORIGINAL_DOB" 
          type="date" 
          value={formData.ORIGINAL_DOB} 
          onChange={handleInputChange} 
          error={showErrors ? errors.ORIGINAL_DOB : ''}
          inputRef={(el) => registerRef('ORIGINAL_DOB', el)}
        />
        
        <InputField 
          label={<>DOB (as per Aadhar) <span style={{ color: '#ef4444' }}>*</span></>} 
          name="DOB_ASPER_ADHAR" 
          type="date" 
          value={formData.DOB_ASPER_ADHAR} 
          onChange={handleInputChange} 
          error={showErrors ? errors.DOB_ASPER_ADHAR : ''}
          inputRef={(el) => registerRef('DOB_ASPER_ADHAR', el)}
        />
        
        <InputField 
          label="Age" 
          name="AGE" 
          value={formData.AGE} 
          disabled 
          inputRef={(el) => registerRef('AGE', el)}
        />

   <InputField 
  label={<>Highest Qualification <span style={{ color: '#ef4444' }}>*</span></>} 
  name="HIGHEST_QUA" 
  value={formData.HIGHEST_QUA} 
  onChange={handleInputChange} 
  error={showErrors ? errors.HIGHEST_QUA : ''} 
  inputRef={(el) => registerRef('HIGHEST_QUA', el)} 
/>

        <InputField 
          label={<>Aadhaar Number <span style={{ color: "#ef4444" }}>*</span></>} 
          name="AADHAR_NUM" 
          value={formData.AADHAR_NUM} 
          maxLength={12} 
          onChange={(e) => { 
            let val = e.target.value.replace(/\s/g, "").replace(/[^0-9]/g, ""); 
            if (val.length <= 12) handleInputChange({ target: { name: "AADHAR_NUM", value: val } }); 
          }} 
          error={showErrors ? errors.AADHAR_NUM : ""}
          inputRef={(el) => registerRef('AADHAR_NUM', el)}
        />
        
        <InputField 
          label={<>PAN Number <span style={{ color: "#ef4444" }}>*</span></>} 
          name="PAN_NUM" 
          value={formData.PAN_NUM} 
          maxLength={10} 
          onChange={(e) => { 
            let val = e.target.value.toUpperCase().replace(/\s/g, "").replace(/[^A-Z0-9]/g, ""); 
            if (val.length <= 10) handleInputChange({ target: { name: "PAN_NUM", value: val } }); 
          }} 
          error={showErrors ? errors.PAN_NUM : ""}
          inputRef={(el) => registerRef('PAN_NUM', el)}
        />
        
        <InputField 
          label={<>UAN Number <span style={{ color: "#ef4444" }}>*</span></>} 
          name="UAN_NUM" 
          value={formData.UAN_NUM} 
          maxLength={12} 
          onChange={(e) => { 
            let val = e.target.value.replace(/\s/g, "").replace(/[^0-9]/g, ""); 
            if (val.length <= 12) handleInputChange({ target: { name: "UAN_NUM", value: val } }); 
          }} 
          error={showErrors ? errors.UAN_NUM : ""}
          inputRef={(el) => registerRef('UAN_NUM', el)}
        />

        {
          (formData.UAN_NUM || '').length == 12 && (
            <FileUpload
              label={<>UAN Document <span style={{ color: '#ef4444' }}>*</span></>}
              name="UAN_FILE" 
              onChange={handleFileChange}
              onRemove={handleRemoveFile}
              selectedFile={formData.UAN_FILE}
                onOpenFile={openFile} 
            isPending={isPending} 
              error={showErrors ? errors.UAN_FILE : ''} 
            />
          )
        }

        <InputField 
          label={<>ESI Number <span style={{ color: "#ef4444" }}>*</span></>} 
          name="ESI_NUM" 
          value={formData.ESI_NUM} 
          maxLength={10} 
          onChange={(e) => { 
            let val = e.target.value.replace(/\s/g, "").replace(/[^0-9]/g, ""); 
            if (val.length <= 10) handleInputChange({ target: { name: "ESI_NUM", value: val } }); 
          }} 
          error={showErrors ? errors.ESI_NUM : ""}
          inputRef={(el) => registerRef('ESI_NUM', el)}
        />

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>
            Source <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select 
            id="SRC_TYPE"
            name="SRC_TYPE" 
            value={formData.SRC_TYPE} 
            onChange={handleInputChange}
            ref={(el) => registerRef('SRC_TYPE', el)}
            style={{
              width: '100%', padding: '2px 8px', height: '28px',
              border: `1.5px solid ${showErrors && errors.SRC_TYPE ? "#ef4444" : "#217be3"}`,
              borderRadius: '6px', fontSize: '12px', outline: 'none',
              background: '#ffffff',
              color: '#1e3a8a', fontWeight: '500', cursor: 'pointer',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
            }}>
            <option value="">Select Source</option>
            <option value="Social Media">Social Media</option>
            <option value="Naukri">Naukri</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Indeed">Indeed</option>
            <option value="reference">Reference</option>
            <option value="Others">Others</option>
          </select>
          {showErrors && errors.SRC_TYPE && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.SRC_TYPE}</p>}
        </div>

        {formData.SRC_TYPE === "reference" && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>
                Reference Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                id="SRC_REFER_NAME"
                type="text" 
                name="SRC_REFER_NAME" 
                value={formData.SRC_REFER_NAME || ''} 
                onChange={handleInputChange}
                ref={(el) => registerRef('SRC_REFER_NAME', el)}
                placeholder="Enter reference name"
                style={{ width: '100%', padding: '2px 8px', height: '28px', boxSizing: 'border-box', border: `1.5px solid ${showErrors && errors.SRC_REFER_NAME ? "#ef4444" : "#1974db"}`, borderRadius: '6px', fontSize: '12px', outline: 'none', background: '#ffffff', color: '#1e3a8a' }}
              />
              {showErrors && errors.SRC_REFER_NAME && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.SRC_REFER_NAME}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>
                DEPT(Referal Person) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                id="SRC_REFER_DEPT"
                type="text" 
                name="SRC_REFER_DEPT" 
                value={formData.SRC_REFER_DEPT || ''} 
                onChange={handleInputChange}
                ref={(el) => registerRef('SRC_REFER_DEPT', el)}
                placeholder="Enter reference dept"
                style={{ width: '100%', padding: '2px 8px', height: '28px', boxSizing: 'border-box', border: `1.5px solid ${showErrors && errors.SRC_REFER_DEPT ? "#ef4444" : "#1974db"}`, borderRadius: '6px', fontSize: '12px', outline: 'none', background: '#ffffff', color: '#1e3a8a' }}
              />
              {showErrors && errors.SRC_REFER_DEPT && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.SRC_REFER_DEPT}</p>}
            </div>
          </>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>
            Blood Group
          </label>
          <select 
            id="BLOOD_GROUP"
            name="BLOOD_GROUP" 
            value={formData.BLOOD_GROUP} 
            onChange={handleInputChange}
            ref={(el) => registerRef('BLOOD_GROUP', el)}
            style={{
              width: '100%', padding: '2px 8px', height: '28px',
              border: `1.5px solid ${showErrors && errors.BLOOD_GROUP ? '#ef4444' : '#1d74d7'}`,
              borderRadius: '6px', fontSize: '12px', outline: 'none',
              background: '#ffffff',
              color: '#1e3a8a', fontWeight: '600',
             boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
            }}>
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          {showErrors && errors.BLOOD_GROUP && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.BLOOD_GROUP}</p>}
        </div>

        <InputField 
          label="Passport Number" 
          name="PASSPORT_NUMBER" 
          value={formData.PASSPORT_NUMBER} 
          maxLength={9} 
          onChange={(e) => { 
            let val = e.target.value.toUpperCase().replace(/\s/g, "").replace(/[^A-Z0-9]/g, ""); 
            if (val.length <= 10) handleInputChange({ target: { name: "PASSPORT_NUMBER", value: val } }); 
          }} 
          error={showErrors ? errors.PASSPORT_NUMBER : ""}
          inputRef={(el) => registerRef('PASSPORT_NUMBER', el)}
        />

        {(formData.PASSPORT_NUMBER || '').length > 0 && (
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>
              Passport Expiry Date <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              id="PASSPORT_EXPIRY"
              type="date" 
              name="PASSPORT_EXPIRY" 
              value={formData.PASSPORT_EXPIRY || ''} 
              onChange={handleInputChange}
              ref={(el) => registerRef('PASSPORT_EXPIRY', el)}
              style={{ width: '100%', padding: '2px 8px', height: '28px', boxSizing: 'border-box', border: `1.5px solid ${showErrors && errors.PASSPORT_EXPIRY ? '#ef4444' : '#207ce6'}`, borderRadius: '6px', fontSize: '12px', outline: 'none', background: '#ffffff' }}
            />
            {showErrors && errors.PASSPORT_EXPIRY && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.PASSPORT_EXPIRY}</p>}
          </div>
        )}

        <InputField 
          label="Driving Licence Number" 
          name="DRIVING_LICENSE" 
          value={formData.DRIVING_LICENSE} 
          maxLength={16} 
          onChange={(e) => { 
            const val = e.target.value.toUpperCase(); 
            if (val.length <= 16) handleInputChange({ target: { name: "DRIVING_LICENSE", value: val } }); 
          }} 
          error={showErrors ? errors.DRIVING_LICENSE : ''}
          inputRef={(el) => registerRef('DRIVING_LICENSE', el)}
        />

        {(formData.DRIVING_LICENSE || '').length > 0 && (
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>
              Driving Licence Expiry Date <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              id="DRIVING_LICENSE_EXPIRY"
              type="date" 
              name="DRIVING_LICENSE_EXPIRY" 
              value={formData.DRIVING_LICENSE_EXPIRY || ''} 
              onChange={handleInputChange}
              ref={(el) => registerRef('DRIVING_LICENSE_EXPIRY', el)}
              style={{ width: '100%', padding: '2px 8px', height: '28px', boxSizing: 'border-box', border: `1.5px solid ${showErrors && errors.DRIVING_LICENSE_EXPIRY ? '#ef4444' : '#2078dd'}`, borderRadius: '6px', fontSize: '12px', outline: 'none', background: '#ffffff' }}
            />
            {showErrors && errors.DRIVING_LICENSE_EXPIRY && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.DRIVING_LICENSE_EXPIRY}</p>}
          </div>
        )}
      </div>

      {/* ADDRESS SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '6px', marginBottom: '4px', padding: '6px 0 4px', borderTop: '1px solid rgba(147,197,253,0.45)', width: '100%' }}>
        {/* Permanent Address */}
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px 10px', background: 'rgba(37,99,235,0.10)', border: '1.5px solid rgba(59,130,246,0.35)', borderRadius: '20px', width: 'fit-content', margin: '0 auto 10px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '700', color: '#1d4ed8', margin: 0, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Permanent Address <span style={{ color: '#ef4444' }}>*</span>
            </h3>
          </div>
         <div className="address-grid" style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
            {[
              { name: 'HNO', label: 'H.No / Street', err: errors.HNO },
              { name: 'CITY', label: 'Village / City', err: errors.CITY },
              { name: 'MANDAL', label: 'Mandal', err: errors.MANDAL },
              { name: 'DISTRICT', label: 'District', err: errors.DISTRICT },
              { name: 'STATE', label: 'State', err: errors.STATE },
              { name: 'PINCODE', label: 'Pincode', err: errors.PINCODE },
            ].map(f => (
              <div key={f.name} style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>{f.label}</label>
                <input
                  id={f.name}
                  name={f.name}
                  value={formData[f.name]}
                  onChange={handleInputChange}
                  ref={(el) => registerRef(f.name, el)}
                  placeholder={f.label}
                  maxLength={f.name === 'PINCODE' ? 6 : undefined}
                  style={{
                    width: '100%', padding: '2px 6px', height: '28px',
                    border: `1.5px solid ${showErrors && f.err ? '#ef4444' : '#1771d8'}`,
                    borderRadius: '5px', fontSize: '11px', outline: 'none',
                    background: '#ffffff', color: '#1e3a8a'
                  }}
                />
                {showErrors && f.err && <p style={{ color: '#ef4444', fontSize: '9px', marginTop: '2px' }}>{f.err}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Radio buttons */}
        <div style={{ marginTop: '16px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af' }}>Same as Permanent Address?</label>
          <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="radio"
              name="address_status"
              checked={sameAsPermanent === true}
              onChange={() => {
                setSameAsPermanent(true);
                setFormData(prev => ({
                  ...prev,
                  PRESENT_HNO: prev.HNO || '',
                  PRESENT_CITY: prev.CITY || '',
                  PRESENT_MANDAL: prev.MANDAL || '',
                  PRESENT_DISTRICT: prev.DISTRICT || '',
                  PRESENT_STATE: prev.STATE || '',
                  PRESENT_PINCODE: prev.PINCODE || '',
                }));
              }}
            /> Yes
          </label>
          <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="radio"
              name="address_status"
              checked={sameAsPermanent === false}
              onChange={() => {
                setSameAsPermanent(false);
                setFormData(prev => ({
                  ...prev,
                  PRESENT_HNO: '',
                  PRESENT_CITY: '',
                  PRESENT_MANDAL: '',
                  PRESENT_DISTRICT: '',
                  PRESENT_STATE: '',
                  PRESENT_PINCODE: '',
                }));
              }}
            /> No
          </label>
        </div>

        {/* Present Address */}
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px 10px', background: 'rgba(37,99,235,0.10)', border: '1.5px solid rgba(59,130,246,0.35)', borderRadius: '20px', width: 'fit-content', margin: '0 auto 10px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '700', color: '#1d4ed8', margin: 0, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Present Address <span style={{ color: '#ef4444' }}>*</span>
            </h3>
          </div>
        <div className="address-grid" style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
            {[
              { name: 'PRESENT_HNO', label: 'H.No / Street', err: errors.PRESENT_HNO },
              { name: 'PRESENT_CITY', label: 'Village / City', err: errors.PRESENT_CITY },
              { name: 'PRESENT_MANDAL', label: 'Mandal', err: errors.PRESENT_MANDAL },
              { name: 'PRESENT_DISTRICT', label: 'District', err: errors.PRESENT_DISTRICT },
              { name: 'PRESENT_STATE', label: 'State', err: errors.PRESENT_STATE },
              { name: 'PRESENT_PINCODE', label: 'Pincode', err: errors.PRESENT_PINCODE },
            ].map(f => (
              <div key={f.name} style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>{f.label}</label>
                <input
                  id={f.name}
                  name={f.name}
                  value={formData[f.name]}
                  onChange={handleInputChange}
                  ref={(el) => registerRef(f.name, el)}
                  disabled={sameAsPermanent === true}
                  style={{
                    width: '100%', padding: '2px 6px', height: '28px',
                    border: `1.5px solid ${showErrors && f.err ? '#ef4444' : '#1f79e0'}`,
                    borderRadius: '5px', fontSize: '11px', outline: 'none',
                    background: sameAsPermanent === true ? '#e9ecef' : '#ffffff',
                    color: sameAsPermanent === true ? '#495057' : '#1e3a8a',
                    cursor: sameAsPermanent === true ? 'not-allowed' : 'text'
                  }}
                />
                {showErrors && f.err && <p style={{ color: '#ef4444', fontSize: '9px', marginTop: '2px' }}>{f.err}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FILE UPLOADS */}
      <div style={{
        marginTop: '6px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '6px',
        padding: '6px 8px',
        background: 'linear-gradient(135deg, rgb(255, 255, 255) 0%, rgba(2rgb(243, 249, 247)rgb(246, 245, 250) 100%)',
        borderRadius: '8px',
        border: '1.5px dashed #71acef',
        boxShadow: 'inset 0 1px 4px rgba(147,197,253,0.12)',
      }}>
        <div style={{
          gridColumn: '1 / -1', fontSize: '10px', fontWeight: '700', color: '#0f3f8b',
          letterSpacing: '0.8px', textTransform: 'uppercase',
          marginBottom: '1px', paddingBottom: '3px',
          borderBottom: '1px solid rgb(19, 17, 100), 0.4)',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <FileUp size={13} color="#0f3f8b" />
          Document Uploads
        </div>
        <FileUpload 
          label={<>Aadhaar Card <span style={{ color: '#ef4444' }}>*</span></>} 
          name="AADHAR_PATH" 
          onChange={handleFileChange} 
          onRemove={handleRemoveFile} 
          selectedFile={formData.AADHAR_PATH} 
          error={showErrors ? errors.AADHAR_PATH : ''}  
          onOpenFile={openFile} 
          isPending={isPending} 
          docId={formData.AADHAR_DOCID}
          fileStatus={formData.AADHAR_STATUS}
        />
        <FileUpload 
          label={<>Resume Upload with sign <span style={{ color: '#ef4444' }}>*</span></>} 
          name="RESUME_UPLOAD" 
          onChange={handleFileChange} 
          onRemove={handleRemoveFile} 
          selectedFile={formData.RESUME_UPLOAD} 
          error={showErrors ? errors.RESUME_UPLOAD : ''} 
           onOpenFile={openFile}
             isPending={isPending}  
        />
        <FileUpload 
          label={<>PAN Card <span style={{ color: '#ef4444' }}>*</span></>} 
          name="PAN_PATH" 
          onChange={handleFileChange} 
          onRemove={handleRemoveFile} 
          selectedFile={formData.PAN_PATH} 
          error={showErrors ? errors.PAN_PATH : ''} 
           onOpenFile={openFile} 
             isPending={isPending} 
        />
        <FileUpload
          label={<>Photo <span style={{ color: "#ef4444" }}>*</span></>}
          name="PHOTO"
          accept=".jpg,.jpeg,.png"
          onChange={handleFileChange}
            onRemove={handleRemoveFile} 
          selectedFile={formData.PHOTO}
          error={showErrors ? errors.PHOTO : ""}
           onOpenFile={openFile} 
             isPending={isPending} 
        />
      </div>
    </>
  )}

            </div></div>

          {/* ================= EDUCATION DETAILS ================= */}
         <div style={{
            background: '#f8fbff',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(30,64,175,0.08)',
            padding: '8px',
            border: '1px solid #dbeafe',
            position: 'relative',
          }}>

        <div className="btn-row" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px', marginBottom: '10px', flexWrap: 'wrap', padding: '15px 0' }}>
              <h2 style={{
                margin: 0,
                fontSize: '13px',
                fontWeight: '800',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: '#1e3a8a',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <GraduationCap size={15} />
                Education Details
              </h2>
              <button
                type="button"
                onClick={() => toggleSection('education')}
                style={{
                  background: '#1e40af',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#fff',
                  borderRadius: '5px',
                  width: '20px',
                  height: '20px',
                  fontSize: '9px',
                  fontWeight: '700'
                }}
              >
                {openSections.education ? '▲' : '▼'}
              </button>
            </div>

            {openSections.education && (
              <div style={{opacity: isPending ? 0.85 : 1 }}>
          <div className="edu-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
  <table className="edu-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', tableLayout: 'fixed' }}>
                    <thead>
                      <tr style={{ background: 'rgb(115, 164, 244)', color: '#ffffff' }}>
                        <th style={{ width: '160px', padding: '8px' }}>Qualification</th>
                        <th style={{ width: '240px', padding: '8px' }}>School/College</th>
                        <th style={{ width: '220px', padding: '8px' }}>University/Board</th>
                        <th style={{ width: '90px', padding: '8px', textAlign: 'center' }}>Per (%)</th>
                        <th style={{ width: '160px', padding: '8px' }}>Passed Year</th>
                        <th style={{ width: '120px', padding: '8px' }}>Certificate</th>
                   </tr>
                    </thead>
                    <tbody>
                      {/* SSC */}
                      <tr style={{ background: '#ffffff' }}>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <span style={{ display: 'inline-block', width: '150px', padding: '5px 8px', background: '#e0edff', border: '1px solid #93c5fd', borderRadius: '16px', fontSize: '11px', fontWeight: '600', color: '#1d4ed8' }}>
                            SSC (10th) <span style={{ color: '#ef4444' }}>*</span>
                          </span>
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="text" name="SSC_SCHOOL_NAME"   ref={(el) => registerRef('SSC_SCHOOL_NAME', el)}     value={formData.SSC_SCHOOL_NAME} onChange={handleInputChange} placeholder="School/College" style={{ ...inputStyle, borderColor: showErrors && errors.SSC_SCHOOL_NAME ? '#ef4444' : '#93c5fd' }} />
                     {showErrors && errors.SSC_SCHOOL_NAME && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.SSC_SCHOOL_NAME}</p>}
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="text" name="SSC_BOARD"  ref={(el) => registerRef('SSC_BOARD', el)}  value={formData.SSC_BOARD || ''} onChange={handleInputChange} placeholder="University/Board"    style={{ ...inputStyle, borderColor: showErrors && errors.SSC_BOARD ? '#ef4444' : '#93c5fd' }}  />
                       {showErrors && errors.SSC_BOARD && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.SSC_BOARD}</p>}
                        </td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <input type="number" name="SSC_MARKS"   ref={(el) => registerRef('SSC_MARKS', el)} value={formData.SSC_MARKS} onChange={handleInputChange} placeholder="%" style={{ ...inputStyle, width: '70px', textAlign: 'center', borderColor: showErrors && errors.SSC_MARKS ? '#ef4444' : '#93c5fd' }} />
                           {showErrors && errors.SSC_MARKS && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.SSC_MARKS}</p>}
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="date" name="SSC_PASSED_YEAR"  ref={(el) => registerRef('SSC_PASSED_YEAR', el)}   value={formData.SSC_PASSED_YEAR || ''} onChange={handleInputChange} style={{ ...inputStyle, borderColor: showErrors && errors.SSC_PASSED_YEAR ? '#ef4444' : '#93c5fd' }} />
                           {showErrors && errors.SSC_PASSED_YEAR && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.SSC_PASSED_YEAR}</p>}

                        </td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <TableFileUpload name="10TH_FILENAME" onChange={handleFileChange} onOpenFile={openFile} 
            isPending={isPending}   onRemove={handleRemoveFile} selectedFile={formData['10TH_FILENAME']} error={showErrors ? errors['10TH_FILENAME'] : ''} />
                        </td>
                      </tr>

                      {/* Intermediate */}
                      <tr style={{ background: '#f9f9f9' }}>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <span style={{ display: 'inline-block', width: '150px', padding: '5px 8px', background: '#e0edff', border: '1px solid #93c5fd', borderRadius: '16px', fontSize: '11px', fontWeight: '600', color: '#1d4ed8' }}>
                            Intermediate/Diploma <span style={{ color: '#ef4444' }}>*</span>
                          </span>
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="text" name="INTER_COLLEGE_NAME"   ref={(el) => registerRef('INTER_COLLEGE_NAME', el)} value={formData.INTER_COLLEGE_NAME}    onChange={handleInputChange} placeholder="School/College" style={{ ...inputStyle, borderColor: showErrors && errors.INTER_COLLEGE_NAME ? '#ef4444' : '#93c5fd' }} />
                           {showErrors && errors.INTER_COLLEGE_NAME && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.INTER_COLLEGE_NAME}</p>}
                        </td>
                        <td style={{ padding: '6px' }}>
                          
                          <input type="text" name="INTER_BOARD"  ref={(el) => registerRef('INTER_BOARD', el)} value={formData.INTER_BOARD || ''} onChange={handleInputChange} placeholder="University/Board" style={{ ...inputStyle, borderColor: showErrors && errors.INTER_BOARD ? '#ef4444' : '#93c5fd' }} />
                          {showErrors && errors.INTER_BOARD && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.INTER_BOARD}</p>}
                        </td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <input type="number" name="INTER_MARKS" ref={(el) => registerRef('INTER_MARKS', el)} value={formData.INTER_MARKS} onChange={handleInputChange} placeholder="%" style={{ ...inputStyle, width: '70px', textAlign: 'center', borderColor: showErrors && errors.INTER_MARKS ? '#ef4444' : '#93c5fd' }} />
                          {showErrors && errors.INTER_MARKS && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.INTER_MARKS}</p>}

                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="date" name="INTER_PASSED_YEAR" value={formData.INTER_PASSED_YEAR || ''} onChange={handleInputChange} style={{ ...inputStyle, borderColor: showErrors && errors.INTER_PASSED_YEAR ? '#ef4444' : '#93c5fd' }} />
                           {showErrors && errors.INTER_PASSED_YEAR && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.INTER_PASSED_YEAR}</p>}
                        </td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <TableFileUpload name="INTER_FILENAME" onChange={handleFileChange} onRemove={handleRemoveFile} onOpenFile={openFile}  isPending={isPending} selectedFile={formData.INTER_FILENAME} error={showErrors ? errors.INTER_FILENAME : ''} />
                        </td>
                      </tr>

                      {/* Graduation */}
                      <tr style={{ background: '#ffffff' }}>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <span style={{ display: 'inline-block', width: '150px', padding: '5px 8px', background: '#e0edff', border: '1px solid #93c5fd', borderRadius: '16px', fontSize: '11px', fontWeight: '600', color: '#1d4ed8' }}>
                            Degree/B.Tech (UG) <span style={{ color: '#ef4444' }}>*</span>
                          </span>
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="text" name="GRAD_COLLEGE_NAME"  ref={(el) => registerRef('GRAD_COLLEGE_NAME', el)} value={formData.GRAD_COLLEGE_NAME} onChange={handleInputChange} placeholder="College" style={{ ...inputStyle, borderColor: showErrors && errors.GRAD_COLLEGE_NAME ? '#ef4444' : '#93c5fd' }} />
                {showErrors && errors.GRAD_COLLEGE_NAME && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.GRAD_COLLEGE_NAME}</p>}
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="text" name="DEGREE_UNIVERSITY" ref={(el) => registerRef('DEGREE_UNIVERSITY', el)}     value={formData.DEGREE_UNIVERSITY || ''} onChange={handleInputChange} placeholder="University" style={{ ...inputStyle, borderColor: showErrors && errors.DEGREE_UNIVERSITY ? '#ef4444' : '#93c5fd' }} />
                {showErrors && errors.DEGREE_UNIVERSITY && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.DEGREE_UNIVERSITY}</p>}


                        </td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <input type="number" name="BTECH_MARKS"   ref={(el) => registerRef('BTECH_MARKS', el)} value={formData.BTECH_MARKS} onChange={handleInputChange} placeholder="%" style={{ ...inputStyle, width: '70px', textAlign: 'center', borderColor: showErrors && errors.BTECH_MARKS ? '#ef4444' : '#93c5fd' }} />
                {showErrors && errors.BTECH_MARKS && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.BTECH_MARKS}</p>}


                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="date" name="DEGREE_PASSED_YEAR" ref={(el) => registerRef('DEGREE_PASSED_YEAR', el)} value={formData.DEGREE_PASSED_YEAR || ''} onChange={handleInputChange} style={{ ...inputStyle, borderColor: showErrors && errors.DEGREE_PASSED_YEAR ? '#ef4444' : '#93c5fd' }} />
                {showErrors && errors.DEGREE_PASSED_YEAR && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.DEGREE_PASSED_YEAR}</p>}


                        </td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <TableFileUpload name="BTECH_FILENAME" onChange={handleFileChange} onRemove={handleRemoveFile} onOpenFile={openFile}  isPending={isPending}  selectedFile={formData.BTECH_FILENAME} error={showErrors ? errors.BTECH_FILENAME : ''} />
                        </td>
                      </tr>

                      {/* PG (Optional) */}
                      <tr style={{ background: '#f9f9f9' }}>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <span style={{ display: 'inline-block', width: '150px', padding: '5px 8px', background: '#e0edff', border: '1px solid #93c5fd', borderRadius: '16px', fontSize: '11px', fontWeight: '600', color: '#1d4ed8' }}>
                            PG (Optional)
                          </span>
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="text" name="PG_COLLEGE_NAME" value={formData.PG_COLLEGE_NAME} onChange={handleInputChange} placeholder="College" style={inputStyle} />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="text" name="PG_UNIVERSITY" value={formData.PG_UNIVERSITY || ''} onChange={handleInputChange} placeholder="University" style={inputStyle} />
                        </td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <input type="number" name="PG_MARKS" value={formData.PG_MARKS} onChange={handleInputChange} placeholder="%" style={{ ...inputStyle, width: '70px', textAlign: 'center' }} />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="date" name="PG_PASSED_YEAR" value={formData.PG_PASSED_YEAR || ''} onChange={handleInputChange} style={inputStyle} />
                        </td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <TableFileUpload name="PG_FILENAME" onChange={handleFileChange} onRemove={handleRemoveFile} onOpenFile={openFile} isPending={isPending}  selectedFile={formData.PG_FILENAME} />
                        </td>
                      </tr>


                      <tr style={{ background: '#f9f9f9' }}>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <span style={{ display: 'inline-block', width: '150px', padding: '5px 8px', background: '#e0edff', border: '1px solid #93c5fd', borderRadius: '16px', fontSize: '11px', fontWeight: '600', color: '#1d4ed8' }}>
                            PHD
                          </span>
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="text" name="PHD_COLLEGE_NAME" value={formData.PHD_COLLEGE_NAME} onChange={handleInputChange} placeholder="College" style={inputStyle} />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="text" name="PHD_UNIVERSITY" value={formData.PHD_UNIVERSITY || ''} onChange={handleInputChange} placeholder="University" style={inputStyle} />
                        </td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <input type="number" name="PHD_MARKS" value={formData.PHD_MARKS} onChange={handleInputChange} placeholder="%" style={{ ...inputStyle, width: '70px', textAlign: 'center' }} />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="date" name="PHD_PASSED_YEAR" value={formData.PHD_PASSED_YEAR || ''} onChange={handleInputChange} style={inputStyle} />
                        </td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <TableFileUpload name="PHD_FILENAME" onChange={handleFileChange} onOpenFile={openFile}  isPending={isPending} onRemove={handleRemoveFile} selectedFile={formData.PHD_FILENAME} />
                        </td>
                      </tr>

                      {/* Others */}
                      <tr style={{ background: '#ffffff' }}>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <span style={{ display: 'inline-block', width: '150px', padding: '5px 8px', background: '#e0edff', border: '1px solid #93c5fd', borderRadius: '16px', fontSize: '11px', fontWeight: '600', color: '#1d4ed8' }}>
                            Others
                          </span>
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="text" name="OTHER_COLLEGE_NAME" value={formData.OTHER_COLLEGE_NAME} onChange={handleInputChange} placeholder="College" style={inputStyle} />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="text" name="OTHER_UNIVERSITY" value={formData.OTHER_UNIVERSITY || ''} onChange={handleInputChange} placeholder="University" style={inputStyle} />
                        </td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <input type="number" name="OTHER_MARKS" value={formData.OTHER_MARKS} onChange={handleInputChange} placeholder="%" style={{ ...inputStyle, width: '70px', textAlign: 'center' }} />
                        </td>
                        <td style={{ padding: '6px' }}>
                          <input type="date" name="OTHER_PASSED_YEAR" value={formData.OTHER_PASSED_YEAR || ''} onChange={handleInputChange} style={inputStyle} />
                        </td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <TableFileUpload name="OTHER_FILENAME" onChange={handleFileChange} onOpenFile={openFile} isPending={isPending}  onRemove={handleRemoveFile} selectedFile={formData.OTHER_FILENAME} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div> </div>
            )}
          </div>

          {/* ================= EXPERIENCE DETAILS ================= */}
          <div style={{
            background: 'linear-gradient(160deg, #ffffff 0%, #feffff 40%, #fbfbfb 100%)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(30,64,175,0.08), 0 8px 32px rgba(59,130,246,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
            padding: '14px',
            border: '1.5px solid rgba(147,197,253,0.6)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* decorative elements */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #1e40af 0%, #2563eb 25%, #3b82f6 50%, #0ea5e9 75%, #06b6d4 100%)', borderRadius: '12px 12px 0 0' }} />
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(147,197,253,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-30px', left: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(186,230,253,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />

         <div className="btn-row" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px', marginBottom: '10px', flexWrap: 'wrap', padding: '15px 0' }}>
              <h2 style={{ ...sectionHeading, margin: 0, fontSize: '13px', fontWeight: '800', letterSpacing: '0.6px', textTransform: 'uppercase', background: 'linear-gradient(90deg, #1e3a8a, #1d4ed8, #0284c7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={16} color="#1e40af" />
                Experience Details
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
               
                <button type="button" onClick={() => toggleSection('experience')} style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: '6px', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', boxShadow: '0 2px 6px rgba(37,99,235,0.35)' }}>
                  {openSections.experience ? '▲' : '▼'}

                </button>
                 {!isPending && (
                  <button type="button" onClick={addExperience} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', background: 'linear-gradient(135deg, #1e40af, #2563eb)', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700', boxShadow: '0 2px 6px rgba(37,99,235,0.35)', transition: 'all 0.2s', letterSpacing: '0.3px' }}>
                    <Plus size={14} /> Add
                  </button>)}
              </div>
            </div>
            <div style={{ pointerEvents: isPending ? 'none' : 'auto', opacity: isPending ? 0.85 : 1 }}>
              {openSections.experience && experiences.map((exp, index) => (
                <div key={exp.id} style={{ marginBottom: '10px', padding: '10px', border: '1.5px solid rgba(147,197,253,0.5)', borderRadius: '10px', background: exp.isCurrent ? 'linear-gradient(135deg, #fdfdfd 0%, #ffffff 60%, #ffffff 100%)' : 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)', boxShadow: exp.isCurrent ? '0 2px 8px rgba(37,99,235,0.10), inset 0 1px 0 rgba(255,255,255,0.8)' : '0 1px 4px rgba(147,197,253,0.15)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', background: exp.isCurrent ? 'linear-gradient(to bottom, #1e40af, #3b82f6)' : 'linear-gradient(to bottom, #93c5fd, #bfdbfe)', borderRadius: '10px 0 0 10px' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingLeft: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 10px', background: exp.isCurrent ? 'rgba(37,99,235,0.10)' : 'rgba(147,197,253,0.20)', border: `1.5px solid ${exp.isCurrent ? 'rgba(59,130,246,0.35)' : 'rgba(147,197,253,0.5)'}`, borderRadius: '20px', fontSize: '11px', fontWeight: '700', color: exp.isCurrent ? '#1d4ed8' : '#3b82f6', letterSpacing: '0.3px' }}>
                        {exp.isCurrent ? 'Current Company' : `Previous Company`}
                      </span>
                    </div>
                    {experiences.length > 1 && (
                      <button type="button" onClick={() => removeExperience(exp?.EMP_COMP_ID)} style={{ color: '#ef4444', background: 'rgba(254,226,226,0.6)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', cursor: 'pointer', padding: '3px 6px', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginBottom: '8px', paddingLeft: '6px' }}>
             <InputField label={<>Company Name <span style={{ color: '#ef4444' }}>*</span></>} name={`exp_${exp.id}_COMPANY_NAME`} value={exp.COMPANY_NAME}  inputRef={(el) => registerRef(`exp_${exp.id}_COMPANY_NAME`, el)}  onChange={(e) => handleExperienceChange(exp.id, 'COMPANY_NAME', e.target.value)} error={showErrors ? errors[`exp_${exp.id}_COMPANY_NAME`] : ''}/>
                    <InputField label={<>Designation <span style={{ color: '#ef4444' }}>*</span></>} name={`exp_${exp.id}_DESIGNATION`} value={exp.DESIGNATION}  inputRef={(el) => registerRef(`exp_${exp.id}_DESIGNATION`, el)} onChange={(e) => handleExperienceChange(exp.id, 'DESIGNATION', e.target.value)} error={showErrors ? errors[`exp_${exp.id}_DESIGNATION`] : ''} />
                   <InputField
    label={<>From Date <span style={{ color: '#ef4444' }}>*</span></>}
    name={`exp_${exp.id}_FROM_DATE`}
    type="date"
    value={exp.FROM_DATE}

      inputRef={(el) => registerRef(`exp_${exp.id}_FROM_DATE`, el)}
    max={new Date().toISOString().split('T')[0]}  // ✅ cannot select future date
    onChange={(e) => handleExperienceChange(exp.id, 'FROM_DATE', e.target.value)}
    error={showErrors ? errors[`exp_${exp.id}_FROM_DATE`] : ''}
/>

<InputField
    label={<>To Date <span style={{ color: '#ef4444' }}>*</span></>}
    name={`exp_${exp.id}_TO_DATE`}
    type="date"
    value={exp.TO_DATE}
       inputRef={(el) => registerRef(`exp_${exp.id}_TO_DATE`, el)}
    min={exp.FROM_DATE || ''}                      // ✅ cannot select before From Date
    max={new Date().toISOString().split('T')[0]}   // ✅ cannot select future date
    onChange={(e) => handleExperienceChange(exp.id, 'TO_DATE', e.target.value)}
    error={showErrors ? errors[`exp_${exp.id}_TO_DATE`] : ''}
/>  <InputField label="Duration" name={`exp_${exp.id}_DURATION`} value={exp.DURATION} disabled />
                    {exp.isCurrent && (
                      <InputField label={<>Notice Period (Days) <span style={{ color: '#ef4444' }}>*</span></>} name={`exp_${exp.id}_NOTICE_PERIOD`} type="number" value={exp.NOTICE_PERIOD} onChange={(e) => handleExperienceChange(exp.id, 'NOTICE_PERIOD', e.target.value)}    inputRef={(el) => registerRef(`exp_${exp.id}_NOTICE_PERIOD`, el)} error={showErrors ? errors[`exp_${exp.id}_NOTICE_PERIOD`] : ''} />
                    )}
                    {exp.isCurrent && (
                      <>
                        <InputField label={<>Current CTC <span style={{ color: '#ef4444' }}>*</span></>} name="CURRENT_CTC" type="number" value={formData.CURRENT_CTC} onChange={handleInputChange}     inputRef={(el) => registerRef('CURRENT_CTC', el)} error={showErrors ? errors.CURRENT_CTC : ''} />
                        <InputField label={<>Expected CTC <span style={{ color: '#ef4444' }}>*</span></>} name="EXP_CTC" type="number" value={formData.EXP_CTC} onChange={handleInputChange}   inputRef={(el) => registerRef('EXP_CTC', el)} error={showErrors ? errors.EXP_CTC : ''} />
                        <InputField label={<>Total Experience (years) <span style={{ color: '#ef4444' }}>*</span></>} name="TOTAL_EXP" type="number" value={formData.TOTAL_EXP} onChange={handleInputChange}    inputRef={(el) => registerRef('TOTAL_EXP', el)} error={showErrors ? errors.TOTAL_EXP : ''} />
                      </>
                    )}
                  </div>

                  {exp.isCurrent && (
                    <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', padding: '8px 10px', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(252, 252, 252, 0.7) 100%)', borderRadius: '8px', border: '1.5px dashed #93c5fd', boxShadow: 'inset 0 1px 3px rgba(147,197,253,0.10)' }}>
                      <div style={{ gridColumn: '1 / -1', fontSize: '10px', fontWeight: '700', color: '#0f3f8b', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '1px', paddingBottom: '3px', borderBottom: '1px solid rgba(147,197,253,0.4)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileUp size={13} color="#0f3f8b" />
                        Document Uploads
                      </div>

                      <FileUpload label={<>Pay Slips (6 ms) <span style={{ color: '#ef4444' }}>*</span></>} name="payslips" onChange={handleFileChange}  onOpenFile={openFile} isPending={isPending} onRemove={handleRemoveFile} selectedFile={formData.payslips}   error={showErrors ? errors.payslips : ''}  />

                      <FileUpload label="Offer Letter" name="offer_letter" onChange={handleFileChange} onOpenFile={openFile} isPending={isPending} onRemove={handleRemoveFile} selectedFile={formData?.offer_letter} />
                      <FileUpload label="Experience Letter" name="exp_letter" onChange={handleFileChange} onOpenFile={openFile} isPending={isPending} onRemove={handleRemoveFile} selectedFile={formData?.exp_letter} />

                      <FileUpload label="Relieving Letter" name="relieving_letter" onChange={handleFileChange} onOpenFile={openFile} isPending={isPending} onRemove={handleRemoveFile} selectedFile={formData?.relieving_letter} />
                      <FileUpload label={<>Bank Statements (3 ms) <span style={{ color: '#ef4444' }}>*</span></>} name="bank_statements" onChange={handleFileChange} onOpenFile={openFile} isPending={isPending} onRemove={handleRemoveFile} selectedFile={formData?.bank_statements} maxSize="500kb"   error={showErrors ? errors.bank_statements : ''} />
                    </div>
                  )}
                </div>
              ))}
            </div></div>


        </form>
{!isPending && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          marginTop: '25px',
          marginBottom: '10px',
          flexWrap: 'wrap',
          padding: '15px 0'
        }}>
          {/* Submit Button */}
          <button
            type="button"
            onClick={() => {
              const fakeEvent = { preventDefault: () => { } };
              handleSubmit(fakeEvent);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 35px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#fff',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              boxShadow: '0 4px 8px rgba(5,150,105,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 12px rgba(5,150,105,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 8px rgba(5,150,105,0.3)';
            }}
          >
            <Send size={16} /> Submit Form
          </button>

          {/* Save Draft Button */}
          <button
            type="button"
            onClick={handleDraft}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 30px',
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
              color: '#fff',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              boxShadow: '0 4px 8px rgba(37,99,235,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 12px rgba(37,99,235,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 8px rgba(37,99,235,0.3)';
            }}
          >
            <FileUp size={16} /> Save Draft
          </button>

          {/* Preview Button */}
          <button
            type="button"
            onClick={async () => {
  let photoBase64 = null;
  if (formData.PHOTO instanceof File) {
    photoBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(formData.PHOTO);
    });
  } else if (typeof formData.PHOTO === 'string') {
    photoBase64 = formData.PHOTO;
  }

  const previewData = {
    formData: { ...formData, PHOTO_BASE64: photoBase64 },
    experiences,
    sameAsPermanent,
  };

  localStorage.setItem("previewData", JSON.stringify(previewData));

  const base = window.location.origin + "/react/hrmprocess/PreviewPage";
  window.open(base, "_blank");
}}

             
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 30px',
              background: 'linear-gradient(135deg, #6b7280 0%, #8b5cf6 100%)',
              color: '#fff',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              boxShadow: '0 4px 8px rgba(139,92,246,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 12px rgba(139,92,246,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 8px rgba(139,92,246,0.3)';
            }}
          >
            <Info size={16} /> Preview
          </button>

        </div>)}
      </div>

    </div>
  );
};

// ================= HELPER COMPONENTS =================
const InputField = ({ label, name, type = "text", value, onChange, error, disabled = false, maxLength, placeholder,min,max,  inputRef }) => (
  <div>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '3px' }}>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
          ref={inputRef}
      maxLength={maxLength}
      placeholder={placeholder}
        min={min}
      max={max}
      style={{
        width: '100%',
        padding: '2px 8px',
        height: '28px',
        border: `1.5px solid ${error ? '#ef4444' : '#1976e2'}`,
        borderRadius: '6px',
        fontSize: '12px',
        background: disabled ? '#e9ecef' : '#ffffff',
        color: disabled ? '#495057' : '#1e3a8a',
        cursor: disabled ? 'not-allowed' : 'text',
        outline: 'none',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
        transition: 'border-color 0.2s'
      }}
      onFocus={(e) => !disabled && !error && (e.target.style.borderColor = '#206ae0')}
      onBlur={(e) => !disabled && !error && (e.target.style.borderColor = '#93c5fd')}
    />
    {error && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px', fontWeight: '500' }}>{error}</p>}
  </div>
);

export default RecruitmentForm;



