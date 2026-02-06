





import React, { useContext, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Upload, User, Mail, Phone, Briefcase, BookOpen, Award, Plus, Trash2 } from 'lucide-react';
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
    DOB: '',
    GENDER: '',
    MARITAL_STATUS: '',
    LANGUAGES_KNOWN: '',
    DEPT: '',
    ADDRESS: '',
    AADHAR_NUM: '',
    PAN_NUM: '',
    SSC_SCHOOL_NAME: '',
    SSC_MARKS: '',
    INTER_COLLEGE_NAME: '',
    INTER_MARKS: '',
    GRAD_COLLEGE_NAME: '',
    BTECH_MARKS: '',
    PG_COLLEGE_NAME: '',
    PG_MARKS: '',
    AADHAR_PATH: null,
    PAN_PATH: null,
    '10TH_FILENAME': null,
    INTER_FILENAME: null,
    BTECH_FILENAME: null,
    PG_FILENAME: null,
    PHOTO: null,
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
      EXP_LETTER: null,
      BANK_STATEMENTS: [],
      isCurrent: true
    }
  ]);

  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [HrData, setHrData] = useState([]);

  const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};

  useEffect(() => {

if(!userToken.token) return null

    const Recuritment = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/task-Assign-GtDta`,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
               Authorization: `Bearer ${userToken.token}`,
            },
          }
        );

  

        setHrData(response.data)
        console.log("NOTE FOR APPROVAL API DATA:", response.data);
      } catch (err) {
        console.error("Error fetching approval data", err);
      }
    };

    Recuritment();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (showErrors && errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  useEffect(() => {
    if (HrData?.TaskAssignmentData && HrData?.TaskAssignmentData?.length > 0 && case_Id) {
      var hr = HrData?.TaskAssignmentData?.find((ele) => ele.CHILD_CASEID === case_Id);
      if (hr) {
        setFormData((prev) => ({
          ...prev,
          PLANT: hr.PLANT || "",
          CHILD_CASEID: hr.CHILD_CASEID || case_Id,
          DEPT: hr.DEPT
        }));
      }
    }
  }, [HrData?.TaskAssignmentData, case_Id]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (showErrors && errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    const maxSizeRegular = 2 * 1024 * 1024;
    const maxSizePayslips = 4 * 1024 * 1024;

    const file = files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      Swal.fire({
        title: "Invalid File Type",
        text: "Only PDF files are allowed",
        icon: "error",
      });
      e.target.value = '';
      return;
    }

    const maxSize = (name === 'PAYSLIPS' || name === 'BANK_STATEMENTS') ? maxSizePayslips : maxSizeRegular;

    if (file.size > maxSize) {
      Swal.fire({
        title: "File Too Large",
        text: `File size must be less than ${maxSize === maxSizePayslips ? '4MB' : '2MB'}`,
        icon: "error",
      });
      e.target.value = '';
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: file
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

    // Basic Information Validation
    if (!formData.FIRST_NAME || formData.FIRST_NAME.trim() === "") {
      newErrors.FIRST_NAME = "First Name is required";
    }
    if (!formData.LAST_NAME || formData.LAST_NAME.trim() === "") {
      newErrors.LAST_NAME = "Last Name is required";
    }
    if (!formData.GENDER || formData.GENDER.trim() === "") {
      newErrors.GENDER = "Gender is required";
    }
    if (!formData.MARITAL_STATUS || formData.MARITAL_STATUS.trim() === "") {
      newErrors.MARITAL_STATUS = "Marital Status is required";
    }
    // ✅ FIXED: Changed to check string instead of array
    if (!formData.LANGUAGES_KNOWN || formData.LANGUAGES_KNOWN.trim() === "") {
      newErrors.LANGUAGES_KNOWN = "Languages Known is required";
    }

    if (!formData.EMAIL || formData.EMAIL.trim() === "") {
      newErrors.EMAIL = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.EMAIL)) {
      newErrors.EMAIL = "Invalid email format";
    }

    if (!formData.PHONE_NUMBER || formData.PHONE_NUMBER.trim() === "") {
      newErrors.PHONE_NUMBER = "Phone Number is required";
    } else if (formData.PHONE_NUMBER.length !== 10) {
      newErrors.PHONE_NUMBER = "Phone number must be 10 digits";
    }

    if (!formData.DOB || formData.DOB.trim() === "") {
      newErrors.DOB = "Date of Birth is required";
    }

    if (!formData.ADDRESS || formData.ADDRESS.trim() === "") {
      newErrors.ADDRESS = "Address is required";
    }

    if (!formData.AADHAR_NUM || formData.AADHAR_NUM.trim() === "") {
      newErrors.AADHAR_NUM = "Aadhaar Number is required";
    } else if (formData.AADHAR_NUM.length !== 12) {
      newErrors.AADHAR_NUM = "Aadhaar must be 12 digits";
    }

    if (!formData.PAN_NUM || formData.PAN_NUM.trim() === "") {
      newErrors.PAN_NUM = "PAN Number is required";
    }

    if (!formData.AADHAR_PATH) {
      newErrors.AADHAR_PATH = "Aadhaar Card is required";
    }
    if (!formData.PAN_PATH) {
      newErrors.PAN_PATH = "PAN Card is required";
    }
    if (!formData.PHOTO) {
      newErrors.PHOTO = "Photo is required";
    }

    // Education Validation
    if (!formData.SSC_SCHOOL_NAME || formData.SSC_SCHOOL_NAME.trim() === "") {
      newErrors.SSC_SCHOOL_NAME = "SSC School is required";
    }
    if (!formData.SSC_MARKS || formData.SSC_MARKS.toString().trim() === "") {
      newErrors.SSC_MARKS = "SSC Marks is required";
    }
    if (!formData.INTER_COLLEGE_NAME || formData.INTER_COLLEGE_NAME.trim() === "") {
      newErrors.INTER_COLLEGE_NAME = "Intermediate College is required";
    }
    if (!formData.INTER_MARKS || formData.INTER_MARKS.toString().trim() === "") {
      newErrors.INTER_MARKS = "Inter Marks is required";
    }
    if (!formData.GRAD_COLLEGE_NAME || formData.GRAD_COLLEGE_NAME.trim() === "") {
      newErrors.GRAD_COLLEGE_NAME = "Degree/B.tech College is required";
    }
    if (!formData.BTECH_MARKS || formData.BTECH_MARKS.toString().trim() === "") {
      newErrors.BTECH_MARKS = "B.tech/Degree Marks is required";
    }

    if (!formData['10TH_FILENAME']) {
      newErrors['10TH_FILENAME'] = "10th Marksheet is required";
    }
    if (!formData.INTER_FILENAME) {
      newErrors.INTER_FILENAME = "Inter Marksheet is required";
    }
    if (!formData.BTECH_FILENAME) {
      newErrors.BTECH_FILENAME = "B.tech/Degree is required";
    }

    // Experience Validation
    experiences.forEach((exp, index) => {
      if (!exp.COMPANY_NAME || exp.COMPANY_NAME.trim() === "") {
        newErrors[`exp_${exp.id}_COMPANY_NAME`] = "Company Name is required";
      }
      if (!exp.DESIGNATION || exp.DESIGNATION.trim() === "") {
        newErrors[`exp_${exp.id}_DESIGNATION`] = "Designation is required";
      }
      if (!exp.FROM_DATE || exp.FROM_DATE.trim() === "") {
        newErrors[`exp_${exp.id}_FROM_DATE`] = "From Date is required";
      }
      if (!exp.TO_DATE || exp.TO_DATE.trim() === "") {
        newErrors[`exp_${exp.id}_TO_DATE`] = "To Date is required";
      }

      if (exp.isCurrent) {
        if (!exp.NOTICE_PERIOD || exp.NOTICE_PERIOD.toString().trim() === "") {
          newErrors[`exp_${exp.id}_NOTICE_PERIOD`] = "Notice Period is required";
        }
        if (!exp.PAYSLIPS || (Array.isArray(exp.PAYSLIPS) && exp.PAYSLIPS.length === 0)) {
          newErrors[`exp_${exp.id}_PAYSLIPS`] = "Pay Slips (3 months) is required";
        }
        if (!exp.BANK_STATEMENTS || (Array.isArray(exp.BANK_STATEMENTS) && exp.BANK_STATEMENTS.length === 0)) {
          newErrors[`exp_${exp.id}_BANK_STATEMENTS`] = "Bank Statements (3 months) is required";
        }
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

      console.log("Validation Errors:", validationErrors); 

      const firstErrorField = document.querySelector('.border-red-500');
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
  // ✅ IF USER CLICKS "NO", STOP EXECUTION
  if (!result.isConfirmed) {
    return;
  }



    try {
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

          experienceObj.payslips = [];
          if (exp.PAYSLIPS && Array.isArray(exp.PAYSLIPS)) {
            exp.PAYSLIPS.forEach((file, fileIndex) => {
              if (file instanceof File) {
                experienceObj.payslips.push({
                  filename: file.name
                });
              }
            });
          }

          if (exp.BANK_STATEMENTS && Array.isArray(exp.BANK_STATEMENTS) && exp.BANK_STATEMENTS.length > 0) {
            const bankStatementFile = exp.BANK_STATEMENTS[0];
            if (bankStatementFile instanceof File) {
              experienceObj.bank_statements = bankStatementFile.name;
            }
          } else {
            experienceObj.bank_statements = "";
          }

          if (exp.RELIEVING_LETTER instanceof File) {
            experienceObj.relieving_letter = exp.RELIEVING_LETTER.name;
          } else {
            experienceObj.relieving_letter = "";
          }

          if (exp.EXP_LETTER instanceof File) {
            experienceObj.exp_letter = exp.EXP_LETTER.name;
          } else {
            experienceObj.exp_letter = "";
          }
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


      // if (response.data.success) {
    

      //       await Swal.fire({
            
      //         title: "Success",
      //         text: "Data saved successfully",
      //         timer: 500,
      //         showConfirmButton: false,
      //       });

        
      //   resetForm();
      // } else {
      //   await Swal.fire("Failed", response.data.message, "error");
      // }
    } catch (error) {
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
      DOB: '',
      GENDER: '',
      MARITAL_STATUS: '',
      LANGUAGES_KNOWN: '',
      DEPT: '',
      ADDRESS: '',
      AADHAR_NUM: '',
      PAN_NUM: '',
      SSC_SCHOOL_NAME: '',
      SSC_MARKS: '',
      INTER_COLLEGE_NAME: '',
      INTER_MARKS: '',
      GRAD_COLLEGE_NAME: '',
      BTECH_MARKS: '',
      PG_COLLEGE_NAME: '',
      PG_MARKS: '',
      AADHAR_PATH: null,
      PAN_PATH: null,
      '10TH_FILENAME': null,
      INTER_FILENAME: null,
      BTECH_FILENAME: null,
      PG_FILENAME: null,
      PHOTO: null,
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
        EXP_LETTER: null,
        BANK_STATEMENTS: [],
        isCurrent: true
      }
    ]);
    setErrors({});
    setShowErrors(false);
  };

  return (
    <div className="max-w-7xl w-full mx-auto p-4 rounded-lg shadow-lg border border-gray-200 bg-gradient-to-br from-pink-50 via-gray-50 to-gray-50">
      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ================= BASIC INFORMATION ================= */}
          <div className="bg-white rounded-md shadow p-4 border-l-4 border-blue-500">
            <h2 className="text-lg font-bold mb-3">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <InputField
                label="Child Case ID"
                name="CHILD_CASEID"
                value={formData.CHILD_CASEID}
                onChange={handleInputChange}
                disabled
              />

              <InputField
                label="Plant"
                name="PLANT"
                value={formData.PLANT}
                onChange={handleInputChange}
                disabled
              />

              <InputField
                label="Department"
                name="DEPT"
                value={formData.DEPT}
                onChange={handleInputChange}
                disabled
              />

              <InputField
                label={<>First Name (As Per Aadhar) <span className="text-red-500">*</span></>}
                name="FIRST_NAME"
                value={formData.FIRST_NAME}
                onChange={handleInputChange}
                error={showErrors ? errors.FIRST_NAME : ''}
              />

              <InputField
                label={<>Last Name (As Per Aadhar) <span className="text-red-500">*</span></>}
                name="LAST_NAME"
                value={formData.LAST_NAME}
                onChange={handleInputChange}
                error={showErrors ? errors.LAST_NAME : ''}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="GENDER"
                  value={formData.GENDER}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${showErrors && errors.GENDER ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {showErrors && errors.GENDER && (
                  <p className="text-red-500 text-xs mt-1">{errors.GENDER}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marital Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="MARITAL_STATUS"
                  value={formData.MARITAL_STATUS}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${showErrors && errors.MARITAL_STATUS ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Status</option>
                  <option value="Married">Married</option>
                  <option value="Unmarried">Unmarried</option>
                </select>
                {showErrors && errors.MARITAL_STATUS && (
                  <p className="text-red-500 text-xs mt-1">{errors.MARITAL_STATUS}</p>
                )}
              </div>

              <InputField
                label={<>Languages Known <span className="text-red-500">*</span></>}
                name="LANGUAGES_KNOWN"
                value={formData.LANGUAGES_KNOWN}
                onChange={handleInputChange}
                placeholder="e.g. English, Telugu, Hindi"
                error={showErrors ? errors.LANGUAGES_KNOWN : ''}
              />

              <InputField
                label={<>Email <span className="text-red-500">*</span></>}
                name="EMAIL"
                type="email"
                value={formData.EMAIL}
                onChange={handleInputChange}
                error={showErrors ? errors.EMAIL : ''}
              />

              <InputField
                label={<>Phone Number <span className="text-red-500">*</span></>}
                name="PHONE_NUMBER"
                value={formData.PHONE_NUMBER}
                maxLength={10}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 10) {
                    handleInputChange({
                      target: { name: "PHONE_NUMBER", value: val },
                    });
                  }
                }}
                error={showErrors ? errors.PHONE_NUMBER : ''}
              />

              <InputField
                label={<>Date of Birth <span className="text-red-500">*</span></>}
                name="DOB"
                type="date"
                value={formData.DOB}
                onChange={handleInputChange}
                error={showErrors ? errors.DOB : ''}
              />

              <InputField
                label={<>Aadhaar Number <span className="text-red-500">*</span></>}
                name="AADHAR_NUM"
                value={formData.AADHAR_NUM}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 12) {
                    handleInputChange({
                      target: { name: "AADHAR_NUM", value: val },
                    });
                  }
                }}
                error={showErrors ? errors.AADHAR_NUM : ''}
              />

              <InputField
                label={<>PAN Number <span className="text-red-500">*</span></>}
                name="PAN_NUM"
                value={formData.PAN_NUM}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  if (val.length <= 10) {
                    handleInputChange({
                      target: { name: "PAN_NUM", value: val },
                    });
                  }
                }}
                error={showErrors ? errors.PAN_NUM : ''}
              />

              <div className="lg:col-span-2 md:col-span-2 col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="ADDRESS"
                  value={formData.ADDRESS}
                  onChange={handleInputChange}
                  rows={2}
                  className={`w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${showErrors && errors.ADDRESS ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {showErrors && errors.ADDRESS && (
                  <p className="text-red-500 text-xs mt-1">{errors.ADDRESS}</p>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <FileUpload
                label={<>Aadhaar Card <span className="text-red-500">*</span></>}
                name="AADHAR_PATH"
                onChange={handleFileChange}
                error={showErrors ? errors.AADHAR_PATH : ''}
              />
              <FileUpload
                label={<>PAN Card <span className="text-red-500">*</span></>}
                name="PAN_PATH"
                onChange={handleFileChange}
                error={showErrors ? errors.PAN_PATH : ''}
              />
              <FileUpload
                label={<>Photo <span className="text-red-500">*</span></>}
                name="PHOTO"
                onChange={handleFileChange}
                error={showErrors ? errors.PHOTO : ''}
              />
            </div>
          </div>

          {/* ================= EDUCATION DETAILS ================= */}
          <div className="bg-white rounded-md shadow p-4 border-l-4 border-purple-500">
            <h2 className="text-lg font-bold mb-3">Education Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <InputField
                label={<>SSC School <span className="text-red-500">*</span></>}
                name="SSC_SCHOOL_NAME"
                value={formData.SSC_SCHOOL_NAME}
                onChange={handleInputChange}
                error={showErrors ? errors.SSC_SCHOOL_NAME : ''}
              />
              <InputField
                label={<>SSC Marks <span className="text-red-500">*</span></>}
                name="SSC_MARKS"
                type="number"
                value={formData.SSC_MARKS}
                onChange={handleInputChange}
                error={showErrors ? errors.SSC_MARKS : ''}
              />
              <InputField
                label={<>Intermediate College <span className="text-red-500">*</span></>}
                name="INTER_COLLEGE_NAME"
                value={formData.INTER_COLLEGE_NAME}
                onChange={handleInputChange}
                error={showErrors ? errors.INTER_COLLEGE_NAME : ''}
              />
              <InputField
                label={<>Inter Marks <span className="text-red-500">*</span></>}
                name="INTER_MARKS"
                type="number"
                value={formData.INTER_MARKS}
                onChange={handleInputChange}
                error={showErrors ? errors.INTER_MARKS : ''}
              />
              <InputField
                label={<>Degree/B.tech College <span className="text-red-500">*</span></>}
                name="GRAD_COLLEGE_NAME"
                value={formData.GRAD_COLLEGE_NAME}
                onChange={handleInputChange}
                error={showErrors ? errors.GRAD_COLLEGE_NAME : ''}
              />
              <InputField
                label={<>B.tech/Degree Marks <span className="text-red-500">*</span></>}
                name="BTECH_MARKS"
                type="number"
                value={formData.BTECH_MARKS}
                onChange={handleInputChange}
                error={showErrors ? errors.BTECH_MARKS : ''}
              />
              <InputField
                label="PG College"
                name="PG_COLLEGE_NAME"
                value={formData.PG_COLLEGE_NAME}
                onChange={handleInputChange}
              />
              <InputField
                label="PG Marks"
                name="PG_MARKS"
                type="number"
                value={formData.PG_MARKS}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <FileUpload
                label={<>10th Marksheet <span className="text-red-500">*</span></>}
                name="10TH_FILENAME"
                onChange={handleFileChange}
                error={showErrors ? errors['10TH_FILENAME'] : ''}
              />
              <FileUpload
                label={<>Inter Marksheet <span className="text-red-500">*</span></>}
                name="INTER_FILENAME"
                onChange={handleFileChange}
                error={showErrors ? errors.INTER_FILENAME : ''}
              />
              <FileUpload
                label={<>B.tech/Degree <span className="text-red-500">*</span></>}
                name="BTECH_FILENAME"
                onChange={handleFileChange}
                error={showErrors ? errors.BTECH_FILENAME : ''}
              />
              <FileUpload
                label="PG Certificate"
                name="PG_FILENAME"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* ================= EXPERIENCE & SALARY ================= */}
          <div className="bg-white rounded-md shadow p-4 border-l-4 border-green-500">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">Experience Details</h2>
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {experiences.map((exp, index) => (
              <div key={exp.id} className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {exp.isCurrent ? 'Current Company' : `Previous Company ${index}`}
                  </h3>
                  {experiences.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  <InputField
                    label={<>{exp.isCurrent ? 'Current' : 'Previous'} Company <span className="text-red-500">*</span></>}
                    name={`exp_${exp.id}_COMPANY_NAME`}
                    value={exp.COMPANY_NAME}
                    onChange={(e) => handleExperienceChange(exp.id, 'COMPANY_NAME', e.target.value)}
                    error={showErrors ? errors[`exp_${exp.id}_COMPANY_NAME`] : ''}
                  />
                  <InputField
                    label={<>Designation <span className="text-red-500">*</span></>}
                    name={`exp_${exp.id}_DESIGNATION`}
                    value={exp.DESIGNATION}
                    onChange={(e) => handleExperienceChange(exp.id, 'DESIGNATION', e.target.value)}
                    error={showErrors ? errors[`exp_${exp.id}_DESIGNATION`] : ''}
                  />
                  <InputField
                    label={<>From Date <span className="text-red-500">*</span></>}
                    name={`exp_${exp.id}_FROM_DATE`}
                    type="date"
                    value={exp.FROM_DATE}
                    onChange={(e) => handleExperienceChange(exp.id, 'FROM_DATE', e.target.value)}
                    error={showErrors ? errors[`exp_${exp.id}_FROM_DATE`] : ''}
                  />
                  <InputField
                    label={<>To Date {exp.isCurrent ? '(Current Date)' : ''} <span className="text-red-500">*</span></>}
                    name={`exp_${exp.id}_TO_DATE`}
                    type="date"
                    value={exp.TO_DATE}
                    onChange={(e) => handleExperienceChange(exp.id, 'TO_DATE', e.target.value)}
                    error={showErrors ? errors[`exp_${exp.id}_TO_DATE`] : ''}
                    disabled={exp.isCurrent}
                  />
                  <InputField
                    label="Duration(In Months)"
                    name={`exp_${exp.id}_DURATION`}
                    value={exp.DURATION}
                    disabled
                  />
                  {exp.isCurrent && (
                    <InputField
                      label={<>Notice Period (Days) <span className="text-red-500">*</span></>}
                      name={`exp_${exp.id}_NOTICE_PERIOD`}
                      type="number"
                      value={exp.NOTICE_PERIOD}
                      onChange={(e) => handleExperienceChange(exp.id, 'NOTICE_PERIOD', e.target.value)}
                      error={showErrors ? errors[`exp_${exp.id}_NOTICE_PERIOD`] : ''}
                    />
                  )}


         <InputField
                label={<>CURRENT CTC<span className="text-red-500">*</span></>}
                name="CURRENT_CTC"
                type="number"
                value={formData.CURRENT_CTC}
                onChange={handleInputChange}
                error={showErrors ? errors.CURRENT_CTC : ''}
              />


   <InputField
                label={<>EXP CTC<span className="text-red-500">*</span></>}
                name="EXP_CTC"
                type="number"
                value={formData.EXP_CTC}
                onChange={handleInputChange}
                error={showErrors ? errors.EXP_CTC : ''}
              />





                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {exp.isCurrent && (
                    <>
                      <ExperienceFileUpload
                        label={<>Pay Slips (3 months) <span className="text-red-500">*</span></>}
                        name={`exp_${exp.id}_PAYSLIPS`}
                        onChange={(e) => handleExperienceFileChange(exp.id, 'PAYSLIPS', e)}
                        multiple={true}
                        maxSize="4MB"
                        error={showErrors ? errors[`exp_${exp.id}_PAYSLIPS`] : ''}
                      />
                      <ExperienceFileUpload
                        label="Relieving Letter"
                        name={`exp_${exp.id}_RELIEVING_LETTER`}
                        onChange={(e) => handleExperienceFileChange(exp.id, 'RELIEVING_LETTER', e)}
                      />
                      <ExperienceFileUpload
                        label="Experience Letter"
                        name={`exp_${exp.id}_EXP_LETTER`}
                        onChange={(e) => handleExperienceFileChange(exp.id, 'EXP_LETTER', e)}
                      />
                      <ExperienceFileUpload
                        label={<>Bank Statements (3 months) <span className="text-red-500">*</span></>}
                        name={`exp_${exp.id}_BANK_STATEMENTS`}
                        onChange={(e) => handleExperienceFileChange(exp.id, 'BANK_STATEMENTS', e)}
                        multiple={true}
                        maxSize="4MB"
                        error={showErrors ? errors[`exp_${exp.id}_BANK_STATEMENTS`] : ''}
                      />
                    </>
                  )}
                </div>
              </div>
            ))}

          </div>

          {/* ================= ACTION BUTTONS ================= */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition text-sm"
            >
              Reset
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
            >
              Submit Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, name, type = "text", value, onChange, error, disabled = false, maxLength, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      maxLength={maxLength}
      placeholder={placeholder}
      className={`w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${disabled ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
        } ${error ? 'border-red-500' : 'border-gray-300'}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const FileUpload = ({ label, name, onChange, multiple = false, error }) => {
  const [fileName, setFileName] = useState('No file chosen');
const [file, setFile] = useState("");
    
  const maxSize = name === 'PAYSLIPS' || name === 'BANK_STATEMENTS' ? '4MB' : '2MB';

  const handleChange = (e) => {

      const files = e.target.files;
 

 setFile(files[0]);
    setFileName(e.target.files?.length > 0 ? `${e.target.files.length} file(s) selected` : 'No file chosen');
    onChange(e);
  };




  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="file"
          name={name}
          accept="application/pdf"
          onChange={handleChange}
          multiple={multiple}
          className="hidden"
        />
        <span className={`px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 font-medium text-sm ${error ? 'border border-red-500' : ''
          }`}>
          Choose File
        </span>
     
         {/* {file && (
  <p className="mt-1 text-xs text-gray-600 truncate">
    {file.name}
  </p>
)} */}
      </label>
      {/* <p className="text-gray-500 text-xs mt-0.5">PDF only, max {maxSize}</p> */}
      {  file && <p className="text-gray-500 text-xs mt-1">{file.name}</p>}
    </div>
  );
};

const ExperienceFileUpload = ({ label, name, onChange, multiple = false, maxSize = '2MB', error }) => {
  const [fileName, setFileName] = useState('No file chosen');

  const handleChange = (e) => {
    setFileName(e.target.files?.length > 0 ? `${e.target.files.length} file(s) selected` : 'No file chosen');
    onChange(e);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="file"
          name={name}
          accept="application/pdf"
          onChange={handleChange}
          multiple={multiple}
          className="hidden"
        />
        <span className={`px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 font-medium text-sm ${error ? 'border border-red-500' : ''
          }`}>
          Choose File
        </span>
        <span className="text-gray-600 text-xs truncate">{fileName}</span>
      </label>
      <p className="text-gray-500 text-xs mt-0.5">PDF only, max {maxSize}</p>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default RecruitmentForm;