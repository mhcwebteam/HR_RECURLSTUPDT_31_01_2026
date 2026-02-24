




import React, { useContext, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Upload, User, Mail, Phone, Briefcase, BookOpen, Award, Plus, Trash2, GraduationCap, Info, FileUp, RotateCcw, Send } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from "../Config/Config"
import { ContextData } from '../Context/ContextData';
import { useParams } from 'react-router-dom';

const RecruitmentForm = () => {
  const { case_Id } = useParams();
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
    // Permanent Address
    HNO: '',
    CITY: '',
    MANDAL: '',
    DISTRICT: '',
    STATE: '',
    PINCODE: '',
    // Present Address
    PRESENT_HNO: '',
    PRESENT_CITY: '',
    PRESENT_MANDAL: '',
    PRESENT_DISTRICT: '',
    PRESENT_STATE: '',
    PRESENT_PINCODE: '',
    // IDs
    AADHAR_NUM: '',
    PAN_NUM: '',
    UAN_NUM: '',
    UAN_FILE: null,
    DOB_ASPER_ADHAR: '',
    ESI_NUM: '',
    SRC_TYPE: '',
    SRC_REFER_NAME: '',
    EMER_CONTACT_NUM: '',
    PASSPORT_NUMBER: '',
    PASSPORT_EXPIRY: '',
    DRIVING_LICENCE: '',
    DRIVING_LICENCE_EXPIRY: '',
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
    PAN_PATH: null,
    PHOTO: null,
    RESUME_UPLOAD: null,
    // CTC
    CURRENT_CTC: '',
    EXP_CTC: '',
    AGE: "",
  });

  const [sameAsPermanent, setSameAsPermanent] = useState(null); // null = no selection
  const [openSections, setOpenSections] = useState({
    basicInfo: true,
    education: false,
    experience: false
  });
  const [experiences, setExperiences] = useState([
    {
      id: Date.now(),
      COMPANY_NAME: '',
      DESIGNATION: '',
      FROM_DATE: '',
      TO_DATE: (() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })(),
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

  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};

  useEffect(() => {
    if (userToken?.Emp_Id) {
      setFormData((prev) => ({
        ...prev,
        PLANT: userToken?.Manpower?.PLANT || "",
        CHILD_CASEID: userToken?.Manpower?.CHILD_CASEID,
        DEPT: userToken?.Manpower?.DEPT
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
    const { name, value } = e.target;

    if (name === "DOB_ASPER_ADHAR") {
      const age = calculateAge(value);
      setFormData((prev) => ({
        ...prev,
        DOB_ASPER_ADHAR: value,
        AGE: age,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (showErrors && errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (showErrors && errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    const maxSizeRegular = 2 * 1024 * 1024;
    const maxSizePayslips = 4 * 1024 * 1024;

    const file = files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      Swal.fire({ title: "Invalid File Type", text: "Only PDF files are allowed", icon: "error" });
      e.target.value = '';
      return;
    }

    const maxSize = (name === 'PAYSLIPS' || name === 'BANK_STATEMENTS') ? maxSizePayslips : maxSizeRegular;

    if (file.size > maxSize) {
      Swal.fire({ title: "File Too Large", text: `File size must be less than ${maxSize === maxSizePayslips ? '4MB' : '2MB'}`, icon: "error" });
      e.target.value = '';
      return;
    }

    setFormData(prev => ({ ...prev, [name]: file }));
  };

  const handleRemoveFile = (name) => {
    setFormData(prev => ({ ...prev, [name]: null }));
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleExperienceChange = (id, field, value) => {
    setExperiences(prev => prev.map(exp => {
      if (exp.id === id) {
        const updated = { ...exp, [field]: value };

        if (exp.isCurrent && field === 'FROM_DATE') {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          updated.TO_DATE = `${year}-${month}-${day}`;
        }

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
              if (days > 0) {
                const roundedMonths = totalMonths + 1;
                updated.DURATION = `${roundedMonths} (${totalMonths} months ${days} days)`;
              } else {
                updated.DURATION = totalMonths.toString();
              }
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

  const handleExperienceFileChange = (id, field, e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxSize = (field === 'PAYSLIPS' || field === 'BANK_STATEMENTS') ? 4 * 1024 * 1024 : 2 * 1024 * 1024;
    const isMultiple = field === 'PAYSLIPS' || field === 'BANK_STATEMENTS';

    if (isMultiple) {
      const validFiles = [];
      const invalidFiles = [];

      Array.from(files).forEach(file => {
        if (file.type !== 'application/pdf') {
          invalidFiles.push(`${file.name} - Only PDF files are allowed`);
          return;
        }
        if (file.size > maxSize) {
          invalidFiles.push(`${file.name} - File size must be less than 4MB`);
          return;
        }
        validFiles.push(file);
      });

      if (invalidFiles.length > 0) {
        Swal.fire({
          title: "Invalid Files",
          html: `<ul style="text-align:left">${invalidFiles.map(err => `<li>• ${err}</li>`).join("")}</ul>`,
          icon: "error",
        });
        e.target.value = '';
        return;
      }

      setExperiences(prev => prev.map(exp =>
        exp.id === id ? {
          ...exp,
          [field]: [...(exp[field] || []), ...validFiles]
        } : exp
      ));
    } else {
      const file = files[0];

      if (file.type !== 'application/pdf') {
        Swal.fire({
          title: "Invalid File Type",
          text: "Only PDF files are allowed",
          icon: "error",
        });
        e.target.value = '';
        return;
      }

      if (file.size > maxSize) {
        Swal.fire({
          title: "File Too Large",
          text: "File size must be less than 2MB",
          icon: "error",
        });
        e.target.value = '';
        return;
      }

      setExperiences(prev => prev.map(exp =>
        exp.id === id ? { ...exp, [field]: file } : exp
      ));
    }

    if (showErrors && errors[`exp_${id}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`exp_${id}_${field}`];
        return newErrors;
      });
    }
  };

  const handleExperienceRemoveFile = (id, field, index = null) => {
    setExperiences(prev => prev.map(exp => {
      if (exp.id !== id) return exp;
      if (index !== null && Array.isArray(exp[field])) {
        return { ...exp, [field]: exp[field].filter((_, i) => i !== index) };
      } else {
        return { ...exp, [field]: field === 'PAYSLIPS' || field === 'BANK_STATEMENTS' ? [] : null };
      }
    }));
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
      RELIEVING_LETTER: null,
      OFFER_LETTER: null,
      EXP_LETTER: null,
      BANK_STATEMENTS: [],
      isCurrent: false
    }]);
  };

  const removeExperience = (id) => {
    if (experiences.length === 1) {
      Swal.fire({
        title: "Cannot Remove",
        text: "At least one experience entry is required",
        icon: "warning",
      });
      return;
    }
    setExperiences(prev => prev.filter(exp => exp.id !== id));
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic fields
    if (!formData.FIRST_NAME?.trim()) newErrors.FIRST_NAME = "First Name is required";
    // if (!formData.LAST_NAME?.trim()) newErrors.LAST_NAME = "Last Name is required";
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

    // Permanent Address
    if (!formData.HNO?.trim()) newErrors.HNO = "House No/Street is required";
    if (!formData.CITY?.trim()) newErrors.CITY = "City is required";
    if (!formData.MANDAL?.trim()) newErrors.MANDAL = "Mandal is required";
    if (!formData.DISTRICT?.trim()) newErrors.DISTRICT = "District is required";
    if (!formData.STATE?.trim()) newErrors.STATE = "State is required";
    if (!formData.PINCODE?.trim()) newErrors.PINCODE = "Pincode is required";

    // Present Address – only required if not same as permanent
    if (sameAsPermanent !== true) {
      if (!formData.PRESENT_HNO?.trim()) newErrors.PRESENT_HNO = "House No/Street is required";
      if (!formData.PRESENT_CITY?.trim()) newErrors.PRESENT_CITY = "City is required";
      if (!formData.PRESENT_MANDAL?.trim()) newErrors.PRESENT_MANDAL = "Mandal is required";
      if (!formData.PRESENT_DISTRICT?.trim()) newErrors.PRESENT_DISTRICT = "District is required";
      if (!formData.PRESENT_STATE?.trim()) newErrors.PRESENT_STATE = "State is required";
      if (!formData.PRESENT_PINCODE?.trim()) newErrors.PRESENT_PINCODE = "Pincode is required";
    }

    // ID proofs
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
    if (formData.PASSPORT_NUMBER?.trim() && !formData.PASSPORT_EXPIRY) {
      newErrors.PASSPORT_EXPIRY = "Passport Expiry date is required";
    }
    if (formData.DRIVING_LICENCE?.trim() && !formData.DRIVING_LICENCE_EXPIRY) {
      newErrors.DRIVING_LICENCE_EXPIRY = "Licence Expiry date is required";
    }

    // Education (mandatory)
    if (!formData.SSC_SCHOOL_NAME?.trim()) newErrors.SSC_SCHOOL_NAME = "SSC School is required";
    if (!formData.SSC_MARKS?.toString().trim()) newErrors.SSC_MARKS = "SSC Marks is required";
    if (!formData['10TH_FILENAME']) newErrors['10TH_FILENAME'] = "10th Marksheet is required";

    if (!formData.INTER_COLLEGE_NAME?.trim()) newErrors.INTER_COLLEGE_NAME = "Intermediate College is required";
    if (!formData.INTER_MARKS?.toString().trim()) newErrors.INTER_MARKS = "Inter Marks is required";
    if (!formData.INTER_FILENAME) newErrors.INTER_FILENAME = "Inter Marksheet is required";

    if (!formData.GRAD_COLLEGE_NAME?.trim()) newErrors.GRAD_COLLEGE_NAME = "Degree/B.Tech College is required";
    if (!formData.BTECH_MARKS?.toString().trim()) newErrors.BTECH_MARKS = "B.Tech/Degree Marks is required";
    if (!formData.BTECH_FILENAME) newErrors.BTECH_FILENAME = "B.Tech/Degree Marksheet is required";

    // File uploads
    if (!formData.AADHAR_PATH) newErrors.AADHAR_PATH = "Aadhaar Card is required";
    if (!formData.PAN_PATH) newErrors.PAN_PATH = "PAN Card is required";
    if (!formData.PHOTO) newErrors.PHOTO = "Photo is required";
    if (!formData.RESUME_UPLOAD) newErrors.RESUME_UPLOAD = "Resume is required";

    // CTC
    if (!formData.CURRENT_CTC?.toString().trim()) newErrors.CURRENT_CTC = "Current CTC is required";
    if (!formData.EXP_CTC?.toString().trim()) newErrors.EXP_CTC = "Expected CTC is required";

    // Experience
    experiences.forEach((exp) => {
      if (!exp.COMPANY_NAME?.trim()) newErrors[`exp_${exp.id}_COMPANY_NAME`] = "Company Name is required";
      if (!exp.DESIGNATION?.trim()) newErrors[`exp_${exp.id}_DESIGNATION`] = "Designation is required";
      if (!exp.FROM_DATE) newErrors[`exp_${exp.id}_FROM_DATE`] = "From Date is required";
      if (!exp.TO_DATE) newErrors[`exp_${exp.id}_TO_DATE`] = "To Date is required";

      if (exp.isCurrent) {
        if (!exp.NOTICE_PERIOD?.toString().trim()) newErrors[`exp_${exp.id}_NOTICE_PERIOD`] = "Notice Period is required";
        if (!exp.PAYSLIPS?.length) newErrors[`exp_${exp.id}_PAYSLIPS`] = "Pay Slips (6 months) is required";
        if (!exp.BANK_STATEMENTS?.length) newErrors[`exp_${exp.id}_BANK_STATEMENTS`] = "Bank Statements (3 months) is required";
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setShowErrors(true);

      const firstErrorField = document.querySelector('[style*="border-color: #ef4444"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      Swal.fire({
        title: "Validation Error",
        text: "Please fill all required fields correctly",
        icon: "error",
      });
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

    try {
      Swal.fire({
        title: "Processing...",
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (!value) return;
        if (value instanceof File) {
          data.append(key, value);
        } else {
          data.append(key, String(value));
        }
      });

      const experiencesArray = experiences.map((exp, index) => {
        const experienceObj = {
          companyname: exp.COMPANY_NAME || '',
          designation: exp.DESIGNATION || '',
          fromdate: exp.FROM_DATE || '',
          todate: exp.TO_DATE || '',
          duration: exp.DURATION || '',
          currentCTC: exp.CURRENT_CTC || '',
          expectedCTC: exp.EXP_CTC || '',
          stage: index,
          isCurrent: exp.isCurrent || false
        };

        if (exp.isCurrent) {
          experienceObj.noticePeriod = exp.NOTICE_PERIOD || '';
          experienceObj.payslips = exp.PAYSLIPS?.map(f => ({ filename: f.name })) || [];
          experienceObj.bank_statements = exp.BANK_STATEMENTS?.[0]?.name || "";
          experienceObj.relieving_letter = exp.RELIEVING_LETTER?.name || "";
          experienceObj.offer_letter = exp.OFFER_LETTER?.name || "";
          experienceObj.exp_letter = exp.EXP_LETTER?.name || "";
        }

        return experienceObj;
      });

      data.append('experiences', JSON.stringify(experiencesArray));

      const response = await axios.post(
        `${API_BASE_URL}/recruitStore`,
        data,
        {
          headers: {
            Authorization: `Bearer ${userToken.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.close();

      if (response.data.success) {
        await Swal.fire({
          title: "Success",
          text: "Recruitment data updated successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        resetForm();
      } else {
        await Swal.fire("Failed", response.data.message, "error");
      }
    } catch (error) {
      Swal.close();
      console.error(error);
      await Swal.fire(
        "Error",
        error.response?.data?.message || "Something went wrong",
        "error"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      CHILD_CASEID: '',
      PLANT: '',
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
      AADHAR_NUM: '',
      PAN_NUM: '',
      UAN_NUM: '',
      UAN_FILE: null,
      DOB_ASPER_ADHAR: '',
      ESI_NUM: '',
      SRC_TYPE: '',
      SRC_REFER_NAME: '',
      EMER_CONTACT_NUM: '',
      PASSPORT_NUMBER: '',
      PASSPORT_EXPIRY: '',
      DRIVING_LICENCE: '',
      DRIVING_LICENCE_EXPIRY: '',
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
      PAN_PATH: null,
      PHOTO: null,
      RESUME_UPLOAD: null,
      CURRENT_CTC: '',
      EXP_CTC: '',
      AGE: '',
    });
    setExperiences([
      {
        id: Date.now(),
        COMPANY_NAME: '',
        DESIGNATION: '',
        FROM_DATE: '',
        TO_DATE: (() => {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        })(),
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

  // Table file upload component for education rows
  const TableFileUpload = ({ name, onChange, onRemove, selectedFile, error }) => {
    const inputRef = React.useRef();

    const handleChange = (e) => {
      onChange(e);
    };

    const handleRemove = () => {
      if (inputRef.current) inputRef.current.value = '';
      onRemove(name);
    };

    return (
      <div>
        <label style={{ cursor: 'pointer' }}>
          <input
            ref={inputRef}
            type="file"
            name={name}
            accept="application/pdf"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
          <span
            style={{
              padding: '4px 8px',
              background: selectedFile ? '#10b981' : '#3b82f6',
              color: 'white',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: '600',
              display: 'inline-block',
              cursor: 'pointer'
            }}
          >
            {selectedFile ? '📎 File' : '📁 Upload'}
          </span>
        </label>

        {selectedFile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <span style={{ fontSize: '9px', color: '#1e40af', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedFile.name}
            </span>
            <button
              type="button"
              onClick={handleRemove}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '9px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              ✕
            </button>
          </div>
        )}
        {error && <p style={{ color: '#ef4444', fontSize: '9px', marginTop: '2px' }}>{error}</p>}
      </div>
    );
  };

  return (
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
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

          {/* ================= BASIC INFORMATION ================= */}
          <div style={{
            background: 'linear-gradient(160deg, #fafafa 0%, #ffffff 40%, #ffffff 100%)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(30,64,175,0.08), 0 8px 32px rgba(59,130,246,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
            padding: '8px',
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
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

            {openSections.basicInfo && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px' }}>
                  <InputField label="Child Case ID" name="CHILD_CASEID" value={formData.CHILD_CASEID} onChange={handleInputChange} disabled />
                  <InputField label="Plant" name="PLANT" value={formData.PLANT} onChange={handleInputChange} disabled />
                  <InputField label="Department" name="DEPT" value={formData.DEPT} onChange={handleInputChange} disabled />
                  <InputField label={<>Name <span style={{ color: '#ef4444' }}>*</span></>} name="FIRST_NAME" value={formData.FIRST_NAME} onChange={handleInputChange} error={showErrors ? errors.FIRST_NAME : ''} placeholder="As per Aadhar"/>
                  {/* <InputField label={<>Last Name <span style={{ color: '#ef4444' }}>*</span></>} name="LAST_NAME" value={formData.LAST_NAME} onChange={handleInputChange} error={showErrors ? errors.LAST_NAME : ''} /> */}

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>
                      Gender <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select name="GENDER" value={formData.GENDER} onChange={handleInputChange} style={{
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
                    <select name="MARITAL_STATUS" value={formData.MARITAL_STATUS} onChange={handleInputChange} style={{
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

                  <InputField label={<>Languages Known <span style={{ color: '#ef4444' }}>*</span></>} name="LANG_KNOWN" value={formData.LANG_KNOWN} onChange={handleInputChange} placeholder="e.g. English, Telugu" error={showErrors ? errors.LANG_KNOWN : ''} />
                  <InputField label={<>Mother Tongue <span style={{ color: '#ef4444' }}>*</span></>} name="MOTHER_TONGUE" value={formData.MOTHER_TONGUE} onChange={handleInputChange} error={showErrors ? errors.MOTHER_TONGUE : ''} />

                  <InputField label={<>Email <span style={{ color: '#ef4444' }}>*</span></>} name="EMAIL" type="email" value={formData.EMAIL} onChange={handleInputChange} error={showErrors ? errors.EMAIL : ''} />
                  <InputField label={<>Phone Number <span style={{ color: '#ef4444' }}>*</span></>} name="PHONE_NUMBER" value={formData.PHONE_NUMBER} maxLength={10} onChange={(e) => { const val = e.target.value.replace(/\D/g, ""); if (val.length <= 10) { handleInputChange({ target: { name: "PHONE_NUMBER", value: val } }); } }} error={showErrors ? errors.PHONE_NUMBER : ''} />
                  <InputField label={<>Emergency Contact <span style={{ color: '#ef4444' }}>*</span></>} name="EMER_CONTACT_NUM" value={formData.EMER_CONTACT_NUM} maxLength={10} onChange={(e) => { const val = e.target.value.replace(/\D/g, ""); if (val.length <= 10) { handleInputChange({ target: { name: "EMER_CONTACT_NUM", value: val } }); } }} error={showErrors ? errors.EMER_CONTACT_NUM : ''} />

                  <InputField label={<>DOB (as per original) <span style={{ color: '#ef4444' }}>*</span></>} name="ORIGINAL_DOB" type="date" value={formData.ORIGINAL_DOB} onChange={handleInputChange} error={showErrors ? errors.ORIGINAL_DOB : ''} />
                  <InputField label={<>DOB (as per Aadhar) <span style={{ color: '#ef4444' }}>*</span></>} name="DOB_ASPER_ADHAR" type="date" value={formData.DOB_ASPER_ADHAR} onChange={handleInputChange} error={showErrors ? errors.DOB_ASPER_ADHAR : ''} />
                  <InputField label="Age" name="AGE" value={formData.AGE} disabled />

                  <InputField label={<>Aadhaar Number <span style={{ color: "#ef4444" }}>*</span></>} name="AADHAR_NUM" value={formData.AADHAR_NUM} maxLength={12} onChange={(e) => { let val = e.target.value.replace(/\s/g, "").replace(/[^0-9]/g, ""); if (val.length <= 12) handleInputChange({ target: { name: "AADHAR_NUM", value: val } }); }} error={showErrors ? errors.AADHAR_NUM : ""} />
                  <InputField label={<>PAN Number <span style={{ color: "#ef4444" }}>*</span></>} name="PAN_NUM" value={formData.PAN_NUM} maxLength={10} onChange={(e) => { let val = e.target.value.toUpperCase().replace(/\s/g, "").replace(/[^A-Z0-9]/g, ""); if (val.length <= 10) handleInputChange({ target: { name: "PAN_NUM", value: val } }); }} error={showErrors ? errors.PAN_NUM : ""} />
                  <InputField label={<>UAN Number <span style={{ color: "#ef4444" }}>*</span></>} name="UAN_NUM" value={formData.UAN_NUM} maxLength={12} onChange={(e) => { let val = e.target.value.replace(/\s/g, "").replace(/[^0-9]/g, ""); if (val.length <= 12) handleInputChange({ target: { name: "UAN_NUM", value: val } }); }} error={showErrors ? errors.UAN_NUM : ""} />

                  {(formData.UAN_NUM || '').length === 12 && (
                    <FileUpload label={<>UAN Document <span style={{ color: '#ef4444' }}>*</span></>} name="UAN_FILE" onChange={handleFileChange} onRemove={handleRemoveFile} selectedFile={formData.UAN_FILE} error={showErrors ? errors.UAN_FILE : ''} />
                  )}

                  <InputField label={<>ESI Number <span style={{ color: "#ef4444" }}>*</span></>} name="ESI_NUM" value={formData.ESI_NUM} maxLength={10} onChange={(e) => { let val = e.target.value.replace(/\s/g, "").replace(/[^0-9]/g, ""); if (val.length <= 10) handleInputChange({ target: { name: "ESI_NUM", value: val } }); }} error={showErrors ? errors.ESI_NUM : ""} />

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>
                      Source <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select name="SRC_TYPE" value={formData.SRC_TYPE} onChange={handleInputChange} style={{
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
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>
                        Reference Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input type="text" name="SRC_REFER_NAME" value={formData.SRC_REFER_NAME || ''} onChange={handleInputChange} placeholder="Enter reference name"
                        style={{ width: '100%', padding: '2px 8px', height: '28px', boxSizing: 'border-box', border: `1.5px solid ${showErrors && errors.SRC_REFER_NAME ? "#ef4444" : "#1974db"}`, borderRadius: '6px', fontSize: '12px', outline: 'none', background: '#ffffff', color: '#1e3a8a' }}
                      />
                      {showErrors && errors.SRC_REFER_NAME && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.SRC_REFER_NAME}</p>}
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>
                      Blood Group
                    </label>
                    <select name="BLOOD_GROUP" value={formData.BLOOD_GROUP} onChange={handleInputChange} style={{
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

                  <InputField label="Passport Number" name="PASSPORT_NUMBER" value={formData.PASSPORT_NUMBER} maxLength={9} onChange={(e) => { let val = e.target.value.toUpperCase().replace(/\s/g, "").replace(/[^A-Z0-9]/g, ""); if (val.length <= 10) handleInputChange({ target: { name: "PASSPORT_NUMBER", value: val } }); }} error={showErrors ? errors.PASSPORT_NUMBER : ""} />

                  {(formData.PASSPORT_NUMBER || '').length > 0 && (
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>
                        Passport Expiry Date <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input type="date" name="PASSPORT_EXPIRY" value={formData.PASSPORT_EXPIRY || ''} onChange={handleInputChange}
                        style={{ width: '100%', padding: '2px 8px', height: '28px', boxSizing: 'border-box', border: `1.5px solid ${showErrors && errors.PASSPORT_EXPIRY ? '#ef4444' : '#207ce6'}`, borderRadius: '6px', fontSize: '12px', outline: 'none', background: '#ffffff' }}
                      />
                      {showErrors && errors.PASSPORT_EXPIRY && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.PASSPORT_EXPIRY}</p>}
                    </div>
                  )}

                  <InputField label="Driving Licence Number" name="DRIVING_LICENCE" value={formData.DRIVING_LICENCE} maxLength={16} onChange={(e) => { const val = e.target.value.toUpperCase(); if (val.length <= 16) handleInputChange({ target: { name: "DRIVING_LICENCE", value: val } }); }} error={showErrors ? errors.DRIVING_LICENCE : ''} />

                  {(formData.DRIVING_LICENCE || '').length > 0 && (
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>
                        Driving Licence Expiry Date <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input type="date" name="DRIVING_LICENCE_EXPIRY" value={formData.DRIVING_LICENCE_EXPIRY || ''} onChange={handleInputChange}
                        style={{ width: '100%', padding: '2px 8px', height: '28px', boxSizing: 'border-box', border: `1.5px solid ${showErrors && errors.DRIVING_LICENCE_EXPIRY ? '#ef4444' : '#2078dd'}`, borderRadius: '6px', fontSize: '12px', outline: 'none', background: '#ffffff' }}
                      />
                      {showErrors && errors.DRIVING_LICENCE_EXPIRY && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '1px' }}>{errors.DRIVING_LICENCE_EXPIRY}</p>}
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
                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                      {[
                        { name: 'HNO', label: 'H.No / Street', err: errors.HNO },
                        { name: 'CITY', label: 'City', err: errors.CITY },
                        { name: 'MANDAL', label: 'Mandal', err: errors.MANDAL },
                        { name: 'DISTRICT', label: 'District', err: errors.DISTRICT },
                        { name: 'STATE', label: 'State', err: errors.STATE },
                        { name: 'PINCODE', label: 'Pincode', err: errors.PINCODE },
                      ].map(f => (
                        <div key={f.name} style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>{f.label}</label>
                          <input
                            name={f.name}
                            value={formData[f.name]}
                            onChange={handleInputChange}
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
                        name="sameAddress"
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
                        name="sameAddress"
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
                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                      {[
                        { name: 'PRESENT_HNO', label: 'H.No / Street', err: errors.PRESENT_HNO },
                        { name: 'PRESENT_CITY', label: 'City', err: errors.PRESENT_CITY },
                        { name: 'PRESENT_MANDAL', label: 'Mandal', err: errors.PRESENT_MANDAL },
                        { name: 'PRESENT_DISTRICT', label: 'District', err: errors.PRESENT_DISTRICT },
                        { name: 'PRESENT_STATE', label: 'State', err: errors.PRESENT_STATE },
                        { name: 'PRESENT_PINCODE', label: 'Pincode', err: errors.PRESENT_PINCODE },
                      ].map(f => (
                        <div key={f.name} style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#1e40af', marginBottom: '2px' }}>{f.label}</label>
                          <input
                            name={f.name}
                            value={formData[f.name]}
                            onChange={handleInputChange}
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
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px',
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
                  <FileUpload label={<>Aadhaar Card <span style={{ color: '#ef4444' }}>*</span></>} name="AADHAR_PATH" onChange={handleFileChange} onRemove={handleRemoveFile} selectedFile={formData.AADHAR_PATH} error={showErrors ? errors.AADHAR_PATH : ''} />
                  <FileUpload label={<>Resume Upload with sign <span style={{ color: '#ef4444' }}>*</span></>} name="RESUME_UPLOAD" onChange={handleFileChange} onRemove={handleRemoveFile} selectedFile={formData.RESUME_UPLOAD} error={showErrors ? errors.RESUME_UPLOAD : ''} />
                  <FileUpload label={<>PAN Card <span style={{ color: '#ef4444' }}>*</span></>} name="PAN_PATH" onChange={handleFileChange} onRemove={handleRemoveFile} selectedFile={formData.PAN_PATH} error={showErrors ? errors.PAN_PATH : ''} />
                  <FileUpload label={<>Photo <span style={{ color: '#ef4444' }}>*</span></>} name="PHOTO" onChange={handleFileChange} onRemove={handleRemoveFile} selectedFile={formData.PHOTO} error={showErrors ? errors.PHOTO : ''} />
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
            position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
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
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', tableLayout: 'fixed' }}>
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
                        <input type="text" name="SSC_SCHOOL_NAME" value={formData.SSC_SCHOOL_NAME} onChange={handleInputChange} placeholder="School/College" style={{ ...inputStyle, borderColor: showErrors && errors.SSC_SCHOOL_NAME ? '#ef4444' : '#93c5fd' }} />
                      </td>
                      <td style={{ padding: '6px' }}>
                        <input type="text" name="SSC_BOARD" value={formData.SSC_BOARD || ''} onChange={handleInputChange} placeholder="University/Board" style={{ ...inputStyle, borderColor: showErrors && errors.SSC_BOARD ? '#ef4444' : '#93c5fd' }} />
                      </td>
                      <td style={{ padding: '6px', textAlign: 'center' }}>
                        <input type="number" name="SSC_MARKS" value={formData.SSC_MARKS} onChange={handleInputChange} placeholder="%" style={{ ...inputStyle, width: '70px', textAlign: 'center', borderColor: showErrors && errors.SSC_MARKS ? '#ef4444' : '#93c5fd' }} />
                      </td>
                      <td style={{ padding: '6px' }}>
                        <input type="date" name="SSC_PASSED_YEAR" value={formData.SSC_PASSED_YEAR || ''} onChange={handleInputChange} style={{ ...inputStyle, borderColor: showErrors && errors.SSC_PASSED_YEAR ? '#ef4444' : '#93c5fd' }} />
                      </td>
                      <td style={{ padding: '6px', textAlign: 'center' }}>
                        <TableFileUpload name="10TH_FILENAME" onChange={handleFileChange} onRemove={handleRemoveFile} selectedFile={formData['10TH_FILENAME']} error={showErrors ? errors['10TH_FILENAME'] : ''} />
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
                        <input type="text" name="INTER_COLLEGE_NAME" value={formData.INTER_COLLEGE_NAME} onChange={handleInputChange} placeholder="School/College" style={{ ...inputStyle, borderColor: showErrors && errors.INTER_COLLEGE_NAME ? '#ef4444' : '#93c5fd' }} />
                      </td>
                      <td style={{ padding: '6px' }}>
                        <input type="text" name="INTER_BOARD" value={formData.INTER_BOARD || ''} onChange={handleInputChange} placeholder="University/Board" style={{ ...inputStyle, borderColor: showErrors && errors.INTER_BOARD ? '#ef4444' : '#93c5fd' }} />
                      </td>
                      <td style={{ padding: '6px', textAlign: 'center' }}>
                        <input type="number" name="INTER_MARKS" value={formData.INTER_MARKS} onChange={handleInputChange} placeholder="%" style={{ ...inputStyle, width: '70px', textAlign: 'center', borderColor: showErrors && errors.INTER_MARKS ? '#ef4444' : '#93c5fd' }} />
                      </td>
                      <td style={{ padding: '6px' }}>
                        <input type="date" name="INTER_PASSED_YEAR" value={formData.INTER_PASSED_YEAR || ''} onChange={handleInputChange} style={{ ...inputStyle, borderColor: showErrors && errors.INTER_PASSED_YEAR ? '#ef4444' : '#93c5fd' }} />
                      </td>
                      <td style={{ padding: '6px', textAlign: 'center' }}>
                        <TableFileUpload name="INTER_FILENAME" onChange={handleFileChange} onRemove={handleRemoveFile} selectedFile={formData.INTER_FILENAME} error={showErrors ? errors.INTER_FILENAME : ''} />
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
                        <input type="text" name="GRAD_COLLEGE_NAME" value={formData.GRAD_COLLEGE_NAME} onChange={handleInputChange} placeholder="College" style={{ ...inputStyle, borderColor: showErrors && errors.GRAD_COLLEGE_NAME ? '#ef4444' : '#93c5fd' }} />
                      </td>
                      <td style={{ padding: '6px' }}>
                        <input type="text" name="DEGREE_UNIVERSITY" value={formData.DEGREE_UNIVERSITY || ''} onChange={handleInputChange} placeholder="University" style={{ ...inputStyle, borderColor: showErrors && errors.DEGREE_UNIVERSITY ? '#ef4444' : '#93c5fd' }} />
                      </td>
                      <td style={{ padding: '6px', textAlign: 'center' }}>
                        <input type="number" name="BTECH_MARKS" value={formData.BTECH_MARKS} onChange={handleInputChange} placeholder="%" style={{ ...inputStyle, width: '70px', textAlign: 'center', borderColor: showErrors && errors.BTECH_MARKS ? '#ef4444' : '#93c5fd' }} />
                      </td>
                      <td style={{ padding: '6px' }}>
                        <input type="date" name="DEGREE_PASSED_YEAR" value={formData.DEGREE_PASSED_YEAR || ''} onChange={handleInputChange} style={{ ...inputStyle, borderColor: showErrors && errors.DEGREE_PASSED_YEAR ? '#ef4444' : '#93c5fd' }} />
                      </td>
                      <td style={{ padding: '6px', textAlign: 'center' }}>
                        <TableFileUpload name="BTECH_FILENAME" onChange={handleFileChange} onRemove={handleRemoveFile} selectedFile={formData.BTECH_FILENAME} error={showErrors ? errors.BTECH_FILENAME : ''} />
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
                        <TableFileUpload name="PG_FILENAME" onChange={handleFileChange} onRemove={handleRemoveFile} selectedFile={formData.PG_FILENAME} />
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
                        <TableFileUpload name="PHD_FILENAME" onChange={handleFileChange} onRemove={handleRemoveFile} selectedFile={formData.PHD_FILENAME} />
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
                        <TableFileUpload name="OTHER_FILENAME" onChange={handleFileChange} onRemove={handleRemoveFile} selectedFile={formData.OTHER_FILENAME} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 style={{ ...sectionHeading, margin: 0, fontSize: '13px', fontWeight: '800', letterSpacing: '0.6px', textTransform: 'uppercase', background: 'linear-gradient(90deg, #1e3a8a, #1d4ed8, #0284c7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={16} color="#1e40af" />
                Experience Details
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button type="button" onClick={addExperience} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', background: 'linear-gradient(135deg, #1e40af, #2563eb)', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700', boxShadow: '0 2px 6px rgba(37,99,235,0.35)', transition: 'all 0.2s', letterSpacing: '0.3px' }}>
                  <Plus size={14} /> Add
                </button>
                <button type="button" onClick={() => toggleSection('experience')} style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: '6px', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', boxShadow: '0 2px 6px rgba(37,99,235,0.35)' }}>
                  {openSections.experience ? '▲' : '▼'}
                </button>
              </div>
            </div>

            {openSections.experience && experiences.map((exp, index) => (
              <div key={exp.id} style={{ marginBottom: '10px', padding: '10px', border: '1.5px solid rgba(147,197,253,0.5)', borderRadius: '10px', background: exp.isCurrent ? 'linear-gradient(135deg, #fdfdfd 0%, #ffffff 60%, #ffffff 100%)' : 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)', boxShadow: exp.isCurrent ? '0 2px 8px rgba(37,99,235,0.10), inset 0 1px 0 rgba(255,255,255,0.8)' : '0 1px 4px rgba(147,197,253,0.15)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', background: exp.isCurrent ? 'linear-gradient(to bottom, #1e40af, #3b82f6)' : 'linear-gradient(to bottom, #93c5fd, #bfdbfe)', borderRadius: '10px 0 0 10px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingLeft: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 10px', background: exp.isCurrent ? 'rgba(37,99,235,0.10)' : 'rgba(147,197,253,0.20)', border: `1.5px solid ${exp.isCurrent ? 'rgba(59,130,246,0.35)' : 'rgba(147,197,253,0.5)'}`, borderRadius: '20px', fontSize: '11px', fontWeight: '700', color: exp.isCurrent ? '#1d4ed8' : '#3b82f6', letterSpacing: '0.3px' }}>
                      {exp.isCurrent ? 'Current Company' : `Previous Company ${index}`}
                    </span>
                  </div>
                  {experiences.length > 1 && (
                    <button type="button" onClick={() => removeExperience(exp.id)} style={{ color: '#ef4444', background: 'rgba(254,226,226,0.6)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', cursor: 'pointer', padding: '3px 6px', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginBottom: '8px', paddingLeft: '6px' }}>
                  <InputField label={<>Company Name <span style={{ color: '#ef4444' }}>*</span></>} name={`exp_${exp.id}_COMPANY_NAME`} value={exp.COMPANY_NAME} onChange={(e) => handleExperienceChange(exp.id, 'COMPANY_NAME', e.target.value)} error={showErrors ? errors[`exp_${exp.id}_COMPANY_NAME`] : ''} />
                  <InputField label={<>Designation <span style={{ color: '#ef4444' }}>*</span></>} name={`exp_${exp.id}_DESIGNATION`} value={exp.DESIGNATION} onChange={(e) => handleExperienceChange(exp.id, 'DESIGNATION', e.target.value)} error={showErrors ? errors[`exp_${exp.id}_DESIGNATION`] : ''} />
                  <InputField label={<>From Date <span style={{ color: '#ef4444' }}>*</span></>} name={`exp_${exp.id}_FROM_DATE`} type="date" value={exp.FROM_DATE} onChange={(e) => handleExperienceChange(exp.id, 'FROM_DATE', e.target.value)} error={showErrors ? errors[`exp_${exp.id}_FROM_DATE`] : ''} />
                  <InputField label={<>To Date {exp.isCurrent ? '(Current)' : ''} <span style={{ color: '#ef4444' }}>*</span></>} name={`exp_${exp.id}_TO_DATE`} type="date" value={exp.TO_DATE} onChange={(e) => handleExperienceChange(exp.id, 'TO_DATE', e.target.value)} error={showErrors ? errors[`exp_${exp.id}_TO_DATE`] : ''}/>
                  <InputField label="Duration" name={`exp_${exp.id}_DURATION`} value={exp.DURATION} disabled />
                  {exp.isCurrent && (
                    <InputField label={<>Notice Period (Days) <span style={{ color: '#ef4444' }}>*</span></>} name={`exp_${exp.id}_NOTICE_PERIOD`} type="number" value={exp.NOTICE_PERIOD} onChange={(e) => handleExperienceChange(exp.id, 'NOTICE_PERIOD', e.target.value)} error={showErrors ? errors[`exp_${exp.id}_NOTICE_PERIOD`] : ''} />
                  )}
                  {exp.isCurrent && (
                    <>
                      <InputField label={<>Current CTC <span style={{ color: '#ef4444' }}>*</span></>} name="CURRENT_CTC" type="number" value={formData.CURRENT_CTC} onChange={handleInputChange} error={showErrors ? errors.CURRENT_CTC : ''} />
                      <InputField label={<>Expected CTC <span style={{ color: '#ef4444' }}>*</span></>} name="EXP_CTC" type="number" value={formData.EXP_CTC} onChange={handleInputChange} error={showErrors ? errors.EXP_CTC : ''} />
                      <InputField label={<>Total Experience <span style={{ color: '#ef4444' }}>*</span></>} name="TOTAL_EXP" type="number" value={formData.TOTAL_EXP} onChange={handleInputChange} error={showErrors ? errors.TOTAL_EXP : ''} />
                    </>
                  )}
                </div>

                {exp.isCurrent && (
                  <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', padding: '8px 10px', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(252, 252, 252, 0.7) 100%)', borderRadius: '8px', border: '1.5px dashed #93c5fd', boxShadow: 'inset 0 1px 3px rgba(147,197,253,0.10)' }}>
                    <div style={{ gridColumn: '1 / -1', fontSize: '10px', fontWeight: '700', color: '#0f3f8b', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '1px', paddingBottom: '3px', borderBottom: '1px solid rgba(147,197,253,0.4)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileUp size={13} color="#0f3f8b" />
                      Document Uploads
                    </div>
                    <ExperienceFileUpload label={<>Pay Slips (6 months) <span style={{ color: '#ef4444' }}>*</span></>} name={`exp_${exp.id}_PAYSLIPS`} onChange={(e) => handleExperienceFileChange(exp.id, 'PAYSLIPS', e)} onRemove={(index) => handleExperienceRemoveFile(exp.id, 'PAYSLIPS', index)} multiple={true} maxSize="4MB" error={showErrors ? errors[`exp_${exp.id}_PAYSLIPS`] : ''} selectedFiles={exp.PAYSLIPS || []} />
                    <ExperienceFileUpload label="Offer Letter" name={`exp_${exp.id}_OFFER_LETTER`} onChange={(e) => handleExperienceFileChange(exp.id, 'OFFER_LETTER', e)} onRemove={() => handleExperienceRemoveFile(exp.id, 'OFFER_LETTER')} selectedFiles={exp.OFFER_LETTER ? [exp.OFFER_LETTER] : []} />
                    <ExperienceFileUpload label="Relieving Letter" name={`exp_${exp.id}_RELIEVING_LETTER`} onChange={(e) => handleExperienceFileChange(exp.id, 'RELIEVING_LETTER', e)} onRemove={() => handleExperienceRemoveFile(exp.id, 'RELIEVING_LETTER')} selectedFiles={exp.RELIEVING_LETTER ? [exp.RELIEVING_LETTER] : []} />
                    <ExperienceFileUpload label="Experience Letter" name={`exp_${exp.id}_EXP_LETTER`} onChange={(e) => handleExperienceFileChange(exp.id, 'EXP_LETTER', e)} onRemove={() => handleExperienceRemoveFile(exp.id, 'EXP_LETTER')} selectedFiles={exp.EXP_LETTER ? [exp.EXP_LETTER] : []} />
                    <ExperienceFileUpload label={<>Bank Statements (3 months) <span style={{ color: '#ef4444' }}>*</span></>} name={`exp_${exp.id}_BANK_STATEMENTS`} onChange={(e) => handleExperienceFileChange(exp.id, 'BANK_STATEMENTS', e)} onRemove={(index) => handleExperienceRemoveFile(exp.id, 'BANK_STATEMENTS', index)} multiple={true} maxSize="4MB" error={showErrors ? errors[`exp_${exp.id}_BANK_STATEMENTS`] : ''} selectedFiles={exp.BANK_STATEMENTS || []} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ================= ACTION BUTTONS ================= */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button type="button" onClick={resetForm} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', color: '#475569', borderRadius: '8px', border: '1.5px solid #cbd5e1', cursor: 'pointer', fontSize: '12px', fontWeight: '700', letterSpacing: '0.3px', boxShadow: '0 1px 4px rgba(100,116,139,0.12)', transition: 'all 0.2s' }}>
              <RotateCcw size={13} /> Reset
            </button>
            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 20px', background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700', letterSpacing: '0.3px', boxShadow: '0 2px 8px rgba(37,99,235,0.35), 0 1px 2px rgba(30,64,175,0.2)', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
              <Send size={13} /> Submit Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ================= HELPER COMPONENTS =================
const InputField = ({ label, name, type = "text", value, onChange, error, disabled = false, maxLength, placeholder }) => (
  <div>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '3px' }}>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      maxLength={maxLength}
      placeholder={placeholder}
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

const FileUpload = ({ label, name, onChange, onRemove, multiple = false, error, selectedFile }) => {
  const inputRef = React.useRef();
  const handleChange = (e) => onChange(e);
  const handleRemove = () => { if (inputRef.current) inputRef.current.value = ''; onRemove(name); };
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '3px' }}>{label}</label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
        <input ref={inputRef} type="file" name={name} accept="application/pdf" onChange={handleChange} multiple={multiple} style={{ display: 'none' }} />
        <span style={{ padding: '5px 10px', background: 'linear-gradient(to right, #dbeafe, #bfdbfe)', color: '#1e40af', borderRadius: '6px', fontWeight: '600', fontSize: '11px', border: error ? '2px solid #ef4444' : '2px solid #bfdbfe', transition: 'all 0.2s' }}>
          Choose File
        </span>
      </label>
      {selectedFile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
          <p style={{ color: '#1e40af', fontSize: '10px', fontWeight: '500', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{selectedFile.name}</p>
          <button type="button" onClick={handleRemove} style={{ background: '#c84141', color: '#f6efef', border: 'none', borderRadius: '50%', width: '14px', height: '14px', fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1, padding: 0 }}>✕</button>
        </div>
      )}
      {error && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px', fontWeight: '500' }}>{error}</p>}
    </div>
  );
};

const ExperienceFileUpload = ({ label, name, onChange, onRemove, multiple = false, maxSize = '2MB', error, selectedFiles = [] }) => {
  const inputRef = React.useRef();
  const handleChange = (e) => onChange(e);
  const handleRemoveSingle = () => { if (inputRef.current) inputRef.current.value = ''; onRemove(); };
  const handleRemoveMultiple = (index) => onRemove(index);
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '3px' }}>{label}</label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
        <input ref={inputRef} type="file" name={name} accept="application/pdf" onChange={handleChange} multiple={multiple} style={{ display: 'none' }} />
        <span style={{ padding: '5px 10px', background: 'linear-gradient(to right, #dbeafe, #bfdbfe)', color: '#1e40af', borderRadius: '6px', fontWeight: '600', fontSize: '11px', border: error ? '2px solid #ef4444' : '2px solid #bfdbfe', transition: 'all 0.2s' }}>
          Choose File
        </span>
      </label>
      {multiple && selectedFiles.length > 0 && (
        <div style={{ marginTop: '3px' }}>
          {selectedFiles.map((file, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <p style={{ color: '#1e40af', fontSize: '10px', fontWeight: '500', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{file.name}</p>
              <button type="button" onClick={() => handleRemoveMultiple(index)} style={{ background: '#c84141', color: '#f6efef', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1, padding: 0 }}>✕</button>
            </div>
          ))}
        </div>
      )}
      {!multiple && selectedFiles && (selectedFiles.name || (Array.isArray(selectedFiles) && selectedFiles.length > 0)) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
          <p style={{ color: '#1e40af', fontSize: '10px', fontWeight: '500', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{selectedFiles.name || selectedFiles[0]?.name}</p>
          <button type="button" onClick={handleRemoveSingle} style={{ background: '#c84141', color: '#f6efef', border: 'none', borderRadius: '50%', width: '14px', height: '14px', fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1, padding: 0 }}>✕</button>
        </div>
      )}
      <p style={{ color: '#6b7280', fontSize: '10px', marginTop: '2px' }}>PDF only, max {maxSize}</p>
      {error && <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px', fontWeight: '500' }}>{error}</p>}
    </div>
  );
};

export default RecruitmentForm;
