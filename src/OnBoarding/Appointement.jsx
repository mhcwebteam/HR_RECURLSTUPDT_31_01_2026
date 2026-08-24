import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Chip, TextField, InputAdornment, Tooltip, Modal, IconButton, Divider, FormControlLabel, Checkbox, Alert, Dialog, DialogContent, DialogActions, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../Config/Config.jsx';
import DocUpload from './DocUpload.jsx';
import History from './History.jsx';
import Swal from 'sweetalert2';
import JoiningReportForm from './JoiningReportForm.jsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import DescriptionIcon from '@mui/icons-material/Description';
import { CheckCircle2, Download } from 'lucide-react';
import axiosInstance from '../Config/axiosConfig.jsx';
import dayjs from 'dayjs';

import { Close } from '@mui/icons-material';
import myHomeHead from "../../src/assets/myHomeHeader.jpg"

const AppointmentLetter = () => {
  const [joiningData, setJoiningData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

  const [selectedRow, setSelectedRow] = useState(null);
  const [openDocModal, setOpenDocModal] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);
  const [openAppointmentModal, setOpenAppointmentModal] = useState(false);
  const [appointmentLetterData, setAppointmentLetterData] = useState(null);

  const [accepted, setAccepted] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [joiningDates, setJoiningDates] = useState({});
const [submittedDetails, setSubmittedDetails] = useState({});

const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

const [plants, setPlants] = useState([]);
const [selectedPlant, setSelectedPlant] = useState("");

const [formData, setFormData] = useState({
  reporting_to: '',
  probation: '',
});


  const navigate = useNavigate();
  const [Token, useToken] = useState(() => {
    const userToken = JSON.parse(localStorage.getItem('userInfo'));
    return userToken ? userToken : null;
  })



  
const companyCode = "TTPL";
const plantCode = "APTL"; // Example

const currentDate = new Date();

const currentMonth = currentDate.toLocaleString("en-US", {
  month: "long",
});
const currentDay = String(currentDate.getDate()).padStart(2, "0");
const currentYear = currentDate.getFullYear();
const nextYear = currentYear + 1;

const refNo = `${appointmentLetterData?.Company || ""}/${plantCode}/${currentMonth} - ${joiningData?.[0]?.REFNO}/F10/${currentYear} - ${nextYear}`;






  //----------------------------JoiningDataStart------------------------//
  const joinData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/emp-verify-data`,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${Token.token}`,
          },
        }
      );

      const apiData = response.data.data;

      const formattedRows = apiData
        .filter(item => {
          const hasJoiningDate = item.onBoarding === "3"
          return hasJoiningDate;
        })
        .map((item, index) => ({
          id: item.verification_id || index,
          CHILD_CASEID: item.child_caseid,
          employee_name: item.name,
          email: item.email,
          phone: item.phone_number,
          department: item.DEPT,
          location: item.PLANT,
          ONBOARD_PLANT:item?.ONBOARD_PLANT,
          joining_date: item.joiningDate,
          current_ctc: item.CURRENT_CTC,
          expected_ctc: item.EXP_CTC,
          offered_ctc: item.OFFER_CTC ?? '',
          TYPE_PLANT: item?.TYPE_PLANT,
          GROUP_CODE: item?.GROUP_CODE,
          SUB_CODE: item?.SUB_CODE,
          SUB_POST: item?.SUB_POST,
          DESIG: item.DESIG || 'N/A',
          MANPOWER_DESG: item.MANPOWER_DESG || 'N/A',
          RECRUIT_CYCLE: item?.RECRUIT_CYCLE,
          hrEvaluationFile: item?.hrEvaluationFile,
          joining_status: 'Joined',
          offer_letter: item.OfferLetterFlag ?? '',
          bgv_status: item.verification_status ?? '',
          documents_status: item.overallDocments_aprvl === '1' ? 'Complete' : 'Pending',
          current_stage: item.CURRENT_TASK,
          hr_owner: item.CURRENT_USER,
          created_at: item.created_at,
          fullData: item,
          REFNO: item?.REF_NO,
        //    appointmentDetailsFilled: !!(
        //   item.ONBOARD_PLANT && 
        //   item.REPORTING_TO && 
        //   item.PROBITION
        // ),
        
        // Store the existing data for pre-filling the form
        existingDetails: {
          ONBOARD_PLANT: item.ONBOARD_PLANT || '',
          REPORTING_TO: item.REPORTING_TO || '',
          PROBITION: item.PROBITION || ''
        },
        }));

  
      setJoiningData(formattedRows);
      setFilteredData(formattedRows);
    } catch (error) {
      console.error("Error in fetching joining data", error);
    }
  };

  useEffect(() => {
    if (Token.token) {
      joinData();
    }
  }, [Token.token]);



  // Function to convert number to words
  const convertToWords = (amount) => {
    if (!amount || amount === 'Not Specified') return 'Not Specified';
    const numStr = amount.toString().replace(/[^0-9]/g, '');
    if (!numStr) return 'Zero Rupees Only';
    const num = parseInt(numStr);
    
    const getWords = (n) => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + getWords(n % 100) : '');
      if (n < 100000) return getWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + getWords(n % 1000) : '');
      if (n < 10000000) return getWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + getWords(n % 100000) : '');
      return getWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + getWords(n % 10000000) : '');
    };
    
    const result = getWords(num);
    return result ? result + ' Rupees Only' : 'Zero Rupees Only';
  };

;

  
const handleAppointmentClick = (rowData) => {
 
  
  // Reset acceptance status when opening new appointment letter
  setAccepted(false);
  
  let companyDesc = 'My Home Constructions';
  let plantCodeOnly = '';
    let companyCode = "MHCPL";
  // Get plant value from PLANT or location
  const plantValue = rowData.fullData.ONBOARD_PLANT || rowData.fullData?.PLANT
  console.log("Plant value:", plantValue);
  
  if (plantValue) {
    // Extract numeric code
    const match = plantValue.match(/^(\d+)/);
    console.log("Match result:", match);

    
    
    if (match) {
      plantCodeOnly = match[1]; // This will be "2158"
      console.log("Plant code extracted:", plantCodeOnly);
      
      // FIRST: Try to find by plant_code (NOT BUKRS)
      const selectedPlantObj = plants.find(p => String(p.plant_code) == String(plantCodeOnly));
      console.log("Selected plant from API (by plant_code):", selectedPlantObj);

      if (selectedPlantObj) {
  companyDesc = selectedPlantObj.COMP_CODE_DESC || companyDesc;

  switch (String(selectedPlantObj.BUKRS)) {
    case "2000":
      companyCode = "MHCPL";
      break;
    case "2050":
      companyCode = "MHCTD";
      break;
    case "2100":
      companyCode = "ASDPL";
      break;
    case "2150":
      companyCode = "MHIPL";
      break;
    case "2250":
      companyCode = "HDPL";
      break;
    case "2350":
      companyCode = "TTPL";
      break;
    case "3100":
      companyCode = "MHPSPL";
      break;
    default:
      companyCode = "MHCPL";
  }
}
console.log("Company Code:", companyCode);


      
      if (selectedPlantObj && selectedPlantObj.COMP_CODE_DESC) {
        // Use COMP_CODE_DESC from API
        companyDesc = selectedPlantObj.COMP_CODE_DESC;
        console.log("Company description from API:", companyDesc);
      } else {
        // If not found by plant_code, try by BUKRS as fallback
        const byBUKRS = plants.find(p => String(p.BUKRS) === String(plantCodeOnly));
        if (byBUKRS && byBUKRS.COMP_CODE_DESC) {
          companyDesc = byBUKRS.COMP_CODE_DESC;
          console.log("Company description from API (by BUKRS):", companyDesc);
        } else {
          // Use default if nothing found
          companyDesc = 'My Home Constructions';
          console.log("Using default company description");
        }
      }
    }
  }
  
  console.log("Final companyDesc:", companyDesc);
  
  // Generate appointment letter data from row data
  const appointmentData = {
    reference_no_App: `HR/APPT/${new Date().getFullYear()}/${rowData.CHILD_CASEID}`,
    DO_App: new Date().toLocaleDateString('en-GB'),
    Name_of_the_candidate: rowData.employee_name,
    Address_of_The_CandidateP1: `
      ${rowData.fullData?.PRESENT_HNO || ''},
      ${rowData.fullData?.PRESENT_CITY || ''},
      ${rowData.fullData?.PRESENT_MANDAL || ''},
      ${rowData.fullData?.PRESENT_DISTRICT || ''},
      ${rowData.fullData?.PRESENT_STATE || ''} - 
      ${rowData.fullData?.PRESENT_PINCODE || ''}
    `.replace(/\s+/g, ' ').trim(),
    Designation: rowData?.DESIG !== 'N/A' ? rowData.DESIG : rowData?.MANPOWER_DESG || 'Not Specified',
    DO_Offer: rowData.fullData?.offer_date || new Date().toLocaleDateString('en-GB'),
    Location: rowData.location,
    Reporting_to: rowData.fullData?.REPORTING_TO || 'HOD',
    offer_ctc: rowData?.fullData?.offer_ctc,
    CTC_in_words: convertToWords(rowData?.fullData?.offer_ctc || rowData.current_ctc || '0'),
    Probation: rowData?.fullData?.PROBITION,
    Company: plantCodeOnly,
    CompanyName: plantValue,
    email: rowData.email,
    phone: rowData.phone,
    caseId: rowData.CHILD_CASEID,
    date: rowData.joining_date,
    CompanyCode: rowData?.COMP_CODE_DESC,
    companyDesc: companyDesc, // This will be "My Home Infra Pvt Ltd"
    plantCode: plantCodeOnly,
      Company: companyCode,
  };
  
  console.log("Final appointment data:", appointmentData);
  
  setAppointmentLetterData(appointmentData);
  setOpenAppointmentModal(true);
};
//   const handleAppointmentClick = (rowData) => {
    
//   let companyDesc = '';
//   let plantCodeOnly = '';
  
//  console.log("rowwwwwwwwwwwww", rowData);
//   console.log("Current plants data:", plants);
//   if (rowData.fullData?.PLANT) {
//     // ONBOARD_PLANT format: "2000-My Home Constructions HO" or "2000 - My Home Constructions HO"
//     const match = rowData.fullData.PLANT.match(/^(\d+)/);

//     console.log(match,"77777777777");
//     if (match) {
//       plantCodeOnly = match[1]; // This will be "2000"
//       const selectedPlantObj = plants.find(p => p.BUKRS === plantCodeOnly);

//       console.log("selectedPlantObj",selectedPlantObj);
//       if (selectedPlantObj) {
//         companyDesc = selectedPlantObj.COMP_CODE_DESC || 'My Home Constructions';
//       }
//     }
//   }
//   console.log(companyDesc,"plantCodeOnlyplantCodeOnlyplantCodeOnly",plantCodeOnly)



//     setAccepted(false);
    
//     // Generate appointment letter data from row data
//     const appointmentData = {
//       reference_no_App: `HR/APPT/${new Date().getFullYear()}/${rowData.CHILD_CASEID}`,
//       DO_App: new Date().toLocaleDateString('en-GB'),
//       Name_of_the_candidate: rowData.employee_name,
//     Address_of_The_CandidateP1: `
//   ${rowData.fullData?.PRESENT_HNO || ''},
//   ${rowData.fullData?.PRESENT_CITY || ''},
//   ${rowData.fullData?.PRESENT_MANDAL || ''},
//   ${rowData.fullData?.PRESENT_DISTRICT || ''},
//   ${rowData.fullData?.PRESENT_STATE || ''} - 
//   ${rowData.fullData?.PRESENT_PINCODE || ''}
// `.replace(/\s+/g, ' ').trim(),
// Designation:
//   rowData?.DESIG !== 'N/A'
//     ? rowData.DESIG
//     : rowData?.MANPOWER_DESG || 'Not Specified',

//       DO_Offer: rowData.fullData?.offer_date || new Date().toLocaleDateString('en-GB'),
//       Location:   rowData.location,

//       Reporting_to: rowData.fullData?.REPORTING_TO || 'HOD',
//       offer_ctc: rowData?.fullData?.offer_ctc,
//       CTC_in_words: convertToWords(rowData?.fullData?.offer_ctc || rowData.current_ctc || '0'),
//       Probation: rowData?.fullData?.PROBITION,
//       Company: rowData?.fullData?.ONBOARD_PLANT,
//       email: rowData.email,
//       phone: rowData.phone,
//       caseId: rowData.CHILD_CASEID,
//       date:rowData.joining_date,
//           companyDesc: companyDesc, // This will have "MyHome Constructions P Lt"
//     plantCode: plantCodeOnly, 

//     };
    
//     setAppointmentLetterData(appointmentData);
//     setOpenAppointmentModal(true);
//   };

  const handleCloseAppointmentModal = () => {
    setOpenAppointmentModal(false);
    setAppointmentLetterData(null);
    setAccepted(false);
  };


  // ── helper: finds a blank (white) pixel row near the ideal cut ──
const findSafeBreak = (canvas, idealY, searchRange = 100) => {
  const ctx = canvas.getContext('2d');

  const isBlankRow = (y) => {
    if (y <= 0 || y >= canvas.height) return false;
    const pixels = ctx.getImageData(0, y, canvas.width, 1).data;
    for (let x = 0; x < pixels.length; x += 4) {
      if (pixels[x] < 240 || pixels[x + 1] < 240 || pixels[x + 2] < 240) {
        return false; // found a non-white pixel → has text
      }
    }
    return true; // fully white row → safe to cut here
  };

  // Search upward first (don't push content forward unnecessarily)
  for (let y = Math.floor(idealY); y >= Math.max(0, idealY - searchRange); y--) {
    if (isBlankRow(y)) return y;
  }
  // Fallback: search downward
  for (let y = Math.floor(idealY); y <= Math.min(canvas.height, idealY + searchRange); y++) {
    if (isBlankRow(y)) return y;
  }

  return Math.floor(idealY); // no blank row found → use ideal cut
};

const generatePDF = async () => {
  if (!accepted) return;
  setIsGeneratingPDF(true);

  try {
    const element = document.getElementById('appointment-letter-content');

    // Temporarily unlock element height so html2canvas captures everything
    const prev = {
      height:    element.style.height,
      overflow:  element.style.overflow,
      maxHeight: element.style.maxHeight,
    };
    element.style.height    = 'auto';
    element.style.overflow  = 'visible';
    element.style.maxHeight = 'none';

    const canvas = await html2canvas(element, {
      scale:       2,
      useCORS:     true,
      logging:     false,
      backgroundColor: '#ffffff',
      windowWidth:  element.scrollWidth,
      windowHeight: element.scrollHeight,
      scrollY:      0,
    });

    // Restore styles
    element.style.height    = prev.height;
    element.style.overflow  = prev.overflow;
    element.style.maxHeight = prev.maxHeight;

    const pdf           = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pdfWidth      = pdf.internal.pageSize.getWidth();   // 210 mm
    const pdfHeight     = pdf.internal.pageSize.getHeight();  // 297 mm
    const margin        = 12;
    const printW        = pdfWidth  - margin * 2;             // 186 mm
    const printH        = pdfHeight - margin * 2;             // 273 mm
    const pxPerMm       = canvas.width / printW;
    const pageHeightPx  = printH * pxPerMm;                   // canvas px per page

    let srcY        = 0;
    let isFirstPage = true;

    while (srcY < canvas.height) {
      const idealCut = srcY + pageHeightPx;

      // Last page → take everything remaining
      const cutY = idealCut >= canvas.height
        ? canvas.height
        : findSafeBreak(canvas, idealCut);

      const slicePx = cutY - srcY;
      if (slicePx <= 0) break; // safety guard

      // Draw slice onto a temp canvas
      const pageCanvas      = document.createElement('canvas');
      pageCanvas.width      = canvas.width;
      pageCanvas.height     = Math.ceil(slicePx);
      const ctx             = pageCanvas.getContext('2d');
      ctx.fillStyle         = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        canvas,
        0, srcY,  canvas.width, slicePx,   // source
        0, 0,     canvas.width, slicePx    // destination
      );

      const imgData       = pageCanvas.toDataURL('image/jpeg', 0.98);
      const sliceHeightMm = slicePx / pxPerMm;

      if (!isFirstPage) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, margin, printW, sliceHeightMm);

      srcY        = cutY;
      isFirstPage = false;
    }

    pdf.save(`Appointment_Letter_${appointmentLetterData?.reference_no_App}.pdf`);

  } catch (error) {
    console.error('PDF generation error:', error);
  } finally {
    setIsGeneratingPDF(false);
  }
};



  const handleReportClick = (rowData) => {
    setSelectedRow(rowData);
    setOpenReportModal(true);
  };

  const handleCloseReportModal = () => {
    setOpenReportModal(false);
    setSelectedRow(null);
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setSearchText(searchValue);
    setPaginationModel(prev => ({ ...prev, page: 0 }));

    if (!searchValue) {
      setFilteredData(joiningData);
      return;
    }

    const filtered = joiningData.filter(row => {
      const search = searchValue.toLowerCase();
      return (
        (row.CHILD_CASEID && row.CHILD_CASEID.toLowerCase().includes(search)) ||
        (row.employee_name && row.employee_name.toLowerCase().includes(search)) ||
        (row.email && row.email.toLowerCase().includes(search)) ||
        (row.phone && row.phone.toLowerCase().includes(search)) ||
        (row.department && row.department.toLowerCase().includes(search)) ||
        (row.location && row.location.toLowerCase().includes(search)) ||
        (row.hr_owner && row.hr_owner.toLowerCase().includes(search))
      );
    });
    setFilteredData(filtered);
  };

  const handleDocUploadClick = (rowData) => {
    setSelectedRow(rowData);
    setOpenDocModal(true);
  };

  const handleHistoryClick = (rowData) => {
    setSelectedRow(rowData);
    setOpenHistoryModal(true);
  };

  const handleCloseModal = () => {
    setOpenDocModal(false);
    setSelectedRow(null);
  };

  const handleCloseHistoryModal = () => {
    setOpenHistoryModal(false);
    setSelectedRow(null);
  };

  const handleJoiningDateChange = (caseId, value) => {
    setJoiningDates(prev => ({
      ...prev,
      [caseId]: value,
    }));
  };

const handleSubmit = async () => {
  const selectedPlantObj = plants.find(
    (p) => p.BUKRS === selectedPlant
  );

  if (!selectedPlantObj) {
    Swal.fire({
      icon: "error",
      title: "Select plant first",
    });
    return;
  }

  if (!selectedRow?.CHILD_CASEID) {
    Swal.fire({
      icon: "error",
      title: "Case ID missing",
    });
    return;
  }

  // ✅ Confirmation Alert

    const confirmResult = await Swal.fire({
    title: 'Are you sure?',
   text: "Do you want to submit onboard details?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Submit',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#494b9b',
    cancelButtonColor: '#6b7280',
    customClass: {
      container: 'swal2-container-custom'
    },
    didOpen: () => {
      const swalContainer = document.querySelector('.swal2-container');
      if (swalContainer) {
        swalContainer.style.zIndex = '9999';
      }
    }
  });
  
  if (!confirmResult.isConfirmed) {
    return;
  }

  try {
    const payload = {
      case_id: selectedRow?.CHILD_CASEID,
      REPORTING_TO: formData.reporting_to,
      PROBITION: formData.probation,
      ONBOARD_PLANT: `${selectedPlantObj.BUKRS}-${selectedPlantObj.COMP_CODE_DESC}`,
      assigned_to: Token?.employee,
    };

    const response = await axiosInstance.post(
      `${API_BASE_URL}/onboard-details`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${Token.token}`,
        },
      }
    );

    // ✅ Success Alert
    if (response.data.status) {
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: response.data.message,
        timer: 2000,
        showConfirmButton: false,
      });

      // Reset fields
      setFormData({
        reporting_to: "",
        probation: "",
      });

      setSelectedPlant("");
      setSelectedRow(null);

      // Close dialog
      setDetailsDialogOpen(false);

      // Refresh data
      joinData();
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong",
    });
  }
};

  const handleSubmitAppointment = async () => {
  if (!accepted) {
    Swal.fire({
      icon: 'warning',
      title: 'Acceptance Required',
      text: 'Please accept the terms and conditions before submitting.',
      confirmButtonColor: '#667eea',
    });
    return;
  }

  setIsGeneratingPDF(true);
  
  try {
    // Step 1: Generate PDF from the appointment letter content
    const element = document.getElementById('appointment-letter-content');
    if (!element) {
      throw new Error('Appointment letter content not found');
    }

  

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });
    
    // Convert canvas to blob
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    });
    
    const imgWidth = 190;
    const pageHeight = 277;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 10, position + 10, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = position - pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 10, position + 10, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Convert PDF to Blob
    const pdfBlob = pdf.output('blob');
    const pdfFile = new File([pdfBlob], `Appointment_Letter_${appointmentLetterData?.reference_no_App}.pdf`, { type: 'application/pdf' });

    // Step 2: Upload to backend
    const formData = new FormData();
    formData.append('CHILD_CASEID', appointmentLetterData?.caseId);
    formData.append('appointment_letter', pdfFile); 
      formData.append('onBoarding', 3); // Using the apiKey from your DocUpload component

    Swal.fire({
      title: 'Submitting...',
      text: 'Please wait while we upload the appointment letter',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

     
    const response = await axiosInstance.post(
      `${API_BASE_URL}/on-board-Store`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${Token.token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response.data.success) {
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Appointment letter submitted and verified successfully!',
        timer: 2000,
        showConfirmButton: false,
      });


        await joinData()
      
      // Close modal and refresh data
      handleCloseAppointmentModal();
      
  
      // Optional: Show additional success message
      Swal.fire({
        icon: 'success',
        title: 'Completed!',
        text: 'Employee onboarding process completed successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      throw new Error(response.data.message || 'Submission failed');
    }
    
  } catch (error) {
    console.error('Error submitting appointment letter:', error);
    Swal.fire({
      icon: 'error',
      title: 'Submission Failed',
      text: error.response?.data?.message || error.message || 'Error generating or uploading PDF',
      confirmButtonColor: '#667eea',
    });
  } finally {
    setIsGeneratingPDF(false);
  }
};

const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};


  const zmmPlants = async () => {
    if (!Token?.token) return;

    try {
        const response = await axiosInstance.get(
            `${API_BASE_URL}/zmm-plants`,
            {
                headers: { Authorization: `Bearer ${Token.token}` },
            }
        );

        setPlants(response.data.data); // ✅ store data here

        console.log(response.data, "plants response");

    } catch (err) {
        console.error("Error fetching plants", err);
    }
};

    useEffect(() => {
zmmPlants()
    },[])



const handleViewRejectedDetails = (row) => {
  setSelectedRow(row);

  setFormData({
    reporting_to: row.existingDetails?.REPORTING_TO || '',
    probation: row.existingDetails?.PROBITION || '',
  });

  // Also pre-select the plant if exists
  if (row.existingDetails?.ONBOARD_PLANT) {
    // Extract BUKRS from "2400-My Home Prop Dev Pvt Ltd"
    const plantCode = row.existingDetails.ONBOARD_PLANT.split('-')[0];
    setSelectedPlant(plantCode);
  } else {
    setSelectedPlant("");
  }

  setDetailsDialogOpen(true);
};

  const hasTypePlant = filteredData?.some(row => row.TYPE_PLANT);
  const recCycle = filteredData?.some(row => row.RECRUIT_CYCLE);

  const columns = [
    {
      field: 'SNO',
      headerName: 'S.NO',
      flex: 0.5,
      minWidth: 70,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600, color: '#374151' }}>
          {params.api.getAllRowIds().indexOf(params.id) + 1}
        </Box>
      ),
    },
    {
      field: 'CHILD_CASEID',
      headerName: 'Case ID',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 500, color: '#1f2937' }}>
          {params.value}
        </Box>
      ),
    },


       {
          field: 'doc_upload',
          headerName: 'Doc Upload',
          flex: 0.8,
          minWidth: 100,
          sortable: false,
          renderCell: (params) => (
            <Button
              size="small"
              variant="contained"
              startIcon={<DescriptionIcon />}
              onClick={() => handleDocUploadClick(params.row)}
              sx={{
                fontSize: '10px',
                padding: '4px 10px',
                borderRadius: '8px',
                textTransform: 'capitalize',
                backgroundColor: '#10b981',
                fontWeight: 600,
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                '&:hover': {
                  backgroundColor: '#059669',
                  boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              View
            </Button>
          ),
        },
    ...(hasTypePlant ? [{
      field: 'TYPE_PLANT',
      headerName: 'Type Plant',
      flex: 1.2,
            minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    }] : []),
    ...(recCycle ? [{
      field: 'RECRUIT_CYCLE',
      headerName: 'Emp Level',
      flex: 1.2,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    }] : []),
    {
      field: 'employee_name',
      headerName: 'Employee Name',
      flex: 1.2,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontWeight: 500 }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.5,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontWeight: 500 }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'MANPOWER_DESG',
      headerName: 'M.Designation',
      flex: 1.2,
      minWidth: 130,
      renderCell: (params) => {
        const subCode = params.row.SUB_CODE;
        const value = params.value || 'N/A';
        return (
          <Box sx={{
            color: '#374151',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
          }}>
            {subCode ? `${subCode} - ${value}` : value}
          </Box>
        );
      },
    },
    {
      field: 'DESIG',
      headerName: 'Designation',
      flex: 1.2,
      minWidth: 140,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontSize: '12px' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1.2,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },
    
            {
          field: 'ONBOARD_PLANT',
          headerName: 'Required Location',
          flex: 1.2,
          minWidth: 140,
          renderCell: (params) => (
            <Box sx={{ color: '#374151' }}>
              {params.value}
            </Box>
          ),
        },
  {
    field: 'joining_date',
    headerName: 'Joining Date',
    flex: 1,
    minWidth: 120,
    renderCell: (params) => {
      const formattedDate = params.row.joining_date
        ? new Date(params.row.joining_date).toLocaleDateString('en-GB')
        : '';
  
      return (
        <TextField
          size="small"
          type="text"
          disabled
          value={formattedDate} // DD-MM-YYYY
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-root': {
              fontSize: '12px',
              height: '32px',
            },
          }}
        />
      );
    },
  },
  //      {
  //   field: 'Appoinment',
  //   headerName: 'Appoinment Details',
  //   flex: 0.6,
  //   minWidth: 140,
  //   sortable: false,
  //   filterable: false,
  //   renderCell: (params) => {
    
  
  
  //     return (
  //       <Button
  //         variant="contained"
  //         size="small"
  //        onClick={() => handleViewRejectedDetails(params.row)}
  //         sx={{
  //           backgroundColor: '#3b82f6',
  //           textTransform: 'capitalize',
  //           fontSize: '11px',
  //           padding: '3px 10px',
  //           borderRadius: '6px',
  //           '&:hover': {
  //             backgroundColor: '#2563eb',
  //           },
  //         }}
  //       >
  //         details
  //       </Button>
  //     );
  //   },
  // },
    {
      field: 'joining_status',
      headerName: 'Appoinment Status',
      flex: 0.8,
      minWidth: 130,
      renderCell: (params) => (
        <Chip
          size="small"
          label= "pending"
          sx={{
            backgroundColor: params.value === 'Joined' ? '#10b981' : '#ef4444',
            color: 'white',
            fontWeight: 600,
            fontSize: '11px',
            height: '24px',
          }}
        />
      ),
    },
  {
  field: 'Appointment',
  headerName: 'Appointment',
  flex: 0.8,
  minWidth: 100,
  renderCell: (params) => (
    // <Tooltip 
    //   title={params.row.appointmentDetailsFilled 
    //     ? "View Appointment Letter" 
    //     : "Please fill appointment details first"}
    // >
      <IconButton
        size="small"
      onClick={() =>  handleAppointmentClick(params.row)}

        // disabled={!params.row.appointmentDetailsFilled}
        sx={{
          color: '#667eea',
          '&:hover': {
            backgroundColor: 
           'rgba(102, 126, 234, 0.1)' 
          
          },
        }}
      >
        <VisibilityIcon fontSize="small" />
      </IconButton>
    // </Tooltip>
  ),
},


 
  ];

  // Modal style
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '1000px',
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: '12px',
    overflow: 'auto',
    p: 3,
  };

  return (
<Box



  sx={{
    

      maxWidth: "1400px",
  minHeight: "297mm",
  backgroundColor: "#fff",
  fontSize: "12px",
  lineHeight: 1.5,
  overflow: "hidden",

}}
>
      <Paper sx={{
        width: '100%',
        padding: 2,
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e2e8f0',
      }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ flex: 1, maxWidth: '400px' }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search joining reports..."
              value={searchText}
              onChange={handleSearch}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#667eea', fontSize: '20px' }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  height: '38px',
                  fontSize: '13px',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                  }
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#cedef2ff",
                  },
                  "&:hover fieldset": {
                    borderColor: "#d1d6ebff",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#667eea",
                  },
                },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{
              color: '#64748b',
              minWidth: 'fit-content',
              fontWeight: 500,
              fontSize: '13px'
            }}>
              {filteredData.length} Appoinments
            </Typography>
          </Box>
        </Box>

        <Box sx={{
          width: "100%",
          borderRadius: "10px",
          overflow: "hidden",
          border: "1px solid #dfe5f1ff",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        }}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50]}
            rowHeight={42}
            columnHeaderHeight={44}
            disableRowSelectionOnClick
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": {
                borderBottom: "2px solid #e2e8f0",
              },
              "& .MuiDataGrid-columnHeader": {
                fontWeight: 600,
                fontSize: "13px",
                color: "#1e293b",
                backgroundColor: "rgba(188, 198, 238, 0.5)",
                borderRight: "1px solid #e2e8f0",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #f1f5f9",
                borderRight: "1px solid #f1f5f9",
                fontSize: "12px",
                color: "#374151",
                padding: "0 8px",
                display: "flex",
                alignItems: "center",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f0f9ff",
                cursor: "pointer",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                minHeight: "48px",
              },
            }}
          />



        </Box>
      </Paper>

  <Dialog
  open={detailsDialogOpen}
  onClose={() => setDetailsDialogOpen(false)}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 24px 60px rgba(115,93,201,0.2), 0 6px 20px rgba(0,0,0,0.08)',
    },
  }}
>
  {/* HEADER */}
  <Box
    sx={{
      background: 'linear-gradient(135deg, #3b2790 0%, #735dc9 60%, #9b7fe8 100%)',
      px: 3,
      pt: 2.5,
      pb: 2.8,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: -28,
        right: -28,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
      }}
    />

    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.3px',
          }}
        >
          Appointment Details
        </Typography>

      </Box>

      <IconButton
        onClick={() => setDetailsDialogOpen(false)}
        size="small"
        sx={{
          color: '#fff',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        <Close sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  </Box>

  {/* BODY */}
  <DialogContent sx={{ p: 3 }}>
    {/* Plant / Company Code Dropdown - Improved */}
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1,
        }}
      >
   <Typography
  sx={{
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
  }}
>
  Plant / Company Code{' '}
  <span style={{ color: 'red' }}>*</span>
</Typography>
        
      </Box>

      <TextField
        select
        fullWidth
        size="small"
        value={selectedPlant}
        onChange={(e) => setSelectedPlant(e.target.value)}
        placeholder="Select Plant / Company"
        SelectProps={{
          displayEmpty: true,
          renderValue: (selected) => {
            if (!selected) {
              return (
                <Typography sx={{ color: '#9ca3af', fontSize: '13px' }}>
                  Select Plant / Company 
                </Typography>
              );
            }
            const selectedItem = plants.find((item) => item.BUKRS === selected);
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                  }}
                />
                <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>
                  {selectedItem?.BUKRS} - {selectedItem?.COMP_CODE_DESC}
                </Typography>
              </Box>
            );
          },
          MenuProps: {
            PaperProps: {
              sx: {
                maxHeight: 300,
                borderRadius: '12px',
                mt: 1,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              },
            },
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#fafafa',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: '#f5f3ff',
              '& fieldset': {
                borderColor: '#735dc9',
              },
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              '& fieldset': {
                borderColor: '#735dc9',
                borderWidth: '2px',
              },
            },
          },
          '& .MuiSelect-select': {
            py: 1,
            display: 'flex',
            alignItems: 'center',
          },
        }}
      >
        {plants.map((item, index) => (
          <MenuItem
            key={index}
            value={item.BUKRS}
            sx={{
              py: 1,
              px: 1,
              borderBottom: index !== plants.length - 1 ? '1px solid #f1f5f9' : 'none',
              '&:hover': {
                backgroundColor: '#f5f3ff',
              },
              '&.Mui-selected': {
                backgroundColor: '#ede9fe',
                '&:hover': {
                  backgroundColor: '#ddd6fe',
                },
              },
            }}
          >
         <MenuItem key={index} value={item.BUKRS}>
  <Typography sx={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
    {item.BUKRS} - {item.COMP_CODE_DESC}
  </Typography>
</MenuItem>
          </MenuItem>
        ))}
      </TextField>
    </Box>

    {/* Reporting To and Probation - 2 Column Layout */}
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr 1fr',
        },
        gap: 2.5,
      }}
    >
      {/* Reporting To */}
      <Box>
        
        <Typography
          sx={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#374151',
            mb: 1,
          }}
        >
          👤 Reporting To <span style={{ color: 'red' }}>*</span>
        </Typography>

        <TextField
          fullWidth
          placeholder="e.g., John Smith"
          name="reporting_to"
          value={formData.reporting_to}
          onChange={handleChange}
          size="small"
          InputProps={{
            startAdornment: (
              <Box
                component="span"
                sx={{
                  color: '#9ca3af',
                  mr: 0.5,
                  fontSize: '16px',
                }}
              >
              
              </Box>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: '#fafafa',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: '#f5f3ff',
                '& fieldset': {
                  borderColor: '#735dc9',
                },
              },
              '&.Mui-focused': {
                backgroundColor: '#ffffff',
                '& fieldset': {
                  borderColor: '#735dc9',
                  borderWidth: '2px',
                },
              },
            },
          }}
        />
      </Box>

      {/* Probation Period */}
      <Box>
        <Typography
          sx={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#374151',
            mb: 1,
          }}
        >
           ⏱️ Probation Period <span style={{ color: 'red' }}>*</span>
        </Typography>

        <TextField
          fullWidth
          placeholder="e.g., 6 months"
          name="probation"
          value={formData.probation}
          onChange={handleChange}
          size="small"
        
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: '#fafafa',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: '#f5f3ff',
                '& fieldset': {
                  borderColor: '#735dc9',
                },
              },
              '&.Mui-focused': {
                backgroundColor: '#ffffff',
                '& fieldset': {
                  borderColor: '#735dc9',
                  borderWidth: '2px',
                },
              },
            },
          }}
        />
      </Box>
    </Box>

    {/* Optional: Help text */}
    <Typography
      sx={{
        fontSize: '11px',
        color: '#9ca3af',
        mt: 2,
        textAlign: 'center',
      }}
    >
      All fields are required for appointment letter generation
    </Typography>
  </DialogContent>

  {/* FOOTER */}
  <DialogActions
    sx={{
      px: 3,
      py: 2,
      borderTop: '1px solid #f1f5f9',
      gap: 1.5,
    }}
  >
    <Button
      onClick={() => setDetailsDialogOpen(false)}
      variant="outlined"
      sx={{
        textTransform: 'none',
        borderRadius: '10px',
        px: 3,
        py: 0.8,
        fontSize: '13px',
        fontWeight: 500,
        borderColor: '#e2e8f0',
        color: '#64748b',
        '&:hover': {
          borderColor: '#cbd5e1',
          backgroundColor: '#f8fafc',
        },
      }}
    >
      Cancel
    </Button>

    <Button
      onClick={handleSubmit}
      variant="contained"
      disabled={!selectedPlant || !formData.reporting_to || !formData.probation}
      sx={{
        background: 'linear-gradient(135deg, #2e3864, #283040)',
        textTransform: 'none',
        borderRadius: '10px',
        fontWeight: 600,
        px: 3,
        py: 0.8,
        fontSize: '13px',
        boxShadow: '0 2px 6px rgba(103, 100, 194, 0.3)',
        '&:hover': {
          background: 'linear-gradient(135deg, #23285c, #292581)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(25, 35, 99, 0.4)',
        },
        '&:disabled': {
          background: '#d1d5db',
          boxShadow: 'none',
        },
      }}
    >
      Submit Details
    </Button>
  </DialogActions>
</Dialog>

   {openDocModal && selectedRow && (
         <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           backgroundColor: 'rgba(0,0,0,0.5)',
           display: 'flex',
           justifyContent: 'center',
           alignItems: 'center',
           zIndex: 9999,
           padding: '20px'
         }}>
           <div style={{
             background: 'white',
             borderRadius: '12px',
             width: '90%',
             maxWidth: '1000px',
             maxHeight: '90vh',
             overflow: 'auto',
             position: 'relative'
           }}>
    
 
             <DocUpload
               rowData={selectedRow}
               onClose={handleCloseModal}
             refreshTable={joinData}
             Report = "Appointement"
             />
           </div>
         </div>
       )}
      {/* Appointment Letter Modal */}
      <Modal
        open={openAppointmentModal}
        onClose={handleCloseAppointmentModal}
        aria-labelledby="appointment-letter-modal"
      >
        <Box sx={modalStyle}>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #e2e8f0' }}>
    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
 
    </Typography>
    <IconButton onClick={handleCloseAppointmentModal} size="small">
      <CloseIcon />
    </IconButton>
  </Box>
  
  <Box id="appointment-letter-content" sx={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: 1.6, p: 2 }}>
    {/* Header with Reference Number */}
    {/* <Box sx={{ textAlign: 'right', mb: 2, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
      <strong>Ref No:</strong>{refNo}
    </Box>
    
    <Box sx={{ textAlign: 'right', mb: 4, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
      <strong>Date:</strong>{" "}
      {appointmentLetterData?.date
        ? new Date(appointmentLetterData.date).toLocaleDateString('en-GB')
        : ''}
    </Box> */}

 
    
 

      <Box sx={{ mb: 1, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>{refNo}</Box>
     <Box sx={{ mb: 1, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
  {new Date().toLocaleDateString('en-GB')}
</Box>
    <Box sx={{ mb: 1, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>To,</Box>
    <Box sx={{ mb: 1, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
      {appointmentLetterData?.Name_of_the_candidate},
    </Box>
    <Box sx={{ mb: 4, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
      {appointmentLetterData?.Address_of_The_CandidateP1}
    </Box>

    {/* Title */}
    <Box sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold', fontSize: '18px', fontFamily: 'Arial, sans-serif' }}>
      LETTER OF APPOINTMENT AS {appointmentLetterData?.Designation}
    </Box>

    {/* Salutation */}
    <Box sx={{ mb: 4, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
      Dear {appointmentLetterData?.Name_of_the_candidate},
    </Box>

    {/* Introduction */}
    <Box sx={{ mb: 4, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
      With reference to our offer letter dated: {appointmentLetterData?.DO_Offer}, we are pleased to appoint you as <strong>{appointmentLetterData?.Designation}</strong> at <strong>{appointmentLetterData?.CompanyName}</strong>. Your employment will be governed by the following terms and conditions:
    </Box>

    {/* Terms and Conditions */}
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>1. Date of Appointment:</Box>
        <Box sx={{ pl: 2, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
          Your date of commencement on job is from {appointmentLetterData?.date
            ? new Date(appointmentLetterData.date).toLocaleDateString('en-GB')
            : ''}.
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>2. Place of Posting & Transfer:</Box>
        <Box sx={{ pl: 2, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
          Your initial place of posting will be at our   <Box component="span" sx={{ fontWeight: "bold" }}>
    {appointmentLetterData?.Location}
  </Box>. The Company reserves its right to transfer your services to any of its Sites / Subsidiaries / Associates / Offices at any place existing at present or which may be established in future.
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>3. Reporting:</Box>
    <Box
  sx={{
    pl: 2,
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif'
  }}
>
  You will report to{' '}
  
  <Box component="span" sx={{ fontWeight: 'bold' }}>
    {appointmentLetterData?.Reporting_to}
  </Box>

  {' '}or any other authority assigned by Management from time to time.
</Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>4. Remuneration:</Box>
        <Box sx={{ pl: 2, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
          You will be paid ₹{appointmentLetterData?.offer_ctc} ({appointmentLetterData?.CTC_in_words}) per annum, which will be subject to the statutory deductions as per the Company's policy and Government norms.
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>5. Probation:</Box>
   <Box
  sx={{
    pl: 2,
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif'
  }}
>
  You will be on probation for a period of{' '}

  <Box component="span" sx={{ fontWeight: 'bold' }}>
    {appointmentLetterData?.Probation}
  </Box>

  {' '}from the date of your joining and will continue to be so unless your services are confirmed in writing.
</Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>6. Reference Checks:</Box>
        <Box sx={{ pl: 2, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
          Your employment is subject to the obtaining or receiving satisfactory responses from the reference checks conducted by the company.
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>7. General:</Box>
        <Box sx={{ pl: 2, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
          a) You will be eligible for Leaves/Weekly Offs/National & Festival Holidays as may be announced by the Company from time to time.<br />
          b) If at any stage, during the tenure of your services, it is found that the information furnished by you, regarding your age, educational qualifications, and previous experience is false; your services will be terminated without any notice.<br />
          c) You shall inform the Company about the changes in personal information, if any, like change in residential address, acquiring higher qualifications etc. from time to time.<br />
          d) During the period of employment with the Company, you will be in whole-time service of the Company and shall not engage or associate yourself directly / indirectly or in any other manner whatsoever.
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>8. Company's Property:</Box>
        <Box sx={{ pl: 2, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
          You will always maintain in good condition Company's property, which may be entrusted to you for official use during the course of your employment and shall return all such property to the Company prior to relinquishment of your charge, failing which the cost of the same will be recovered from you by the Company.
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>9. Service Rules and Procedure:</Box>
        <Box sx={{ pl: 2, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
          You will be governed by the service rules, regulations and such other practices, systems, policies and procedures such as office working hours. Leaves, Standing Orders and Other Service Conditions of the place of business of the Company as applicable and in force from time to time of the Company as notified and in force. Further, you shall follow in true spirit and abide by the Standard Operating Procedures of the Company.
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>10. Confidential Information:</Box>
        <Box sx={{ pl: 2, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
          During your period of employment, you have to maintain complete secrecy on projects which you will be working on, about clients and the Company. Any confidential information/ Data/ Drawings (Soft copy or hard copy) shall not be shared with anyone sharing of confidential information outside the Company will be considered as offense. Any breach of the above conditions will result in termination of employment with immediate effect and appropriate damages will be claimed accordingly.<br /><br />
          You will maintain strict confidential of the information which is provided or given to your access by the Employer during the term of your employment. Any breach of the same will result in breach of the terms of employment and the employer has right to take stringent action against you which might result taking appropriate criminal action. The Employer has a right to file a civil case as well as to recover the damages caused due to such breach by the Employee.<br /><br />
          The Employee agrees not to use or cause to be used for own benefit or for the benefit of any third parties or to disclose to any third party in any manner, directly or indirectly the information concerning to the internal organization or business structure of Employer or its customers, or the work assignments or capabilities of any officer or Employee, Proprietary Information, Customer's Confidential Information, trade secrets or any other Knowledge or information, except that which is public knowledge, or relating to the business of Employer or its customers at any time during or after Employee's terms of employment with Employer, without prior written consent of Employer.
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>11. Applicability of Company Policy:</Box>
        <Box sx={{ pl: 2, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
          The Company shall be entitled to make policy declarations from time to time pertaining to matters like leave entitlement, maternity leave, employees' benefits, working hours, transfer policies, etc., and may alter the same from time to time at its sole discretion. All such policy decisions of the Company shall be binding on you and shall override this Letter of Appointment to that extent.
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>12. Substance Abuse:</Box>
        <Box sx={{ pl: 2, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
          a) The Unauthorized possession, distribution, consumption, dispensing or misuse of substances (banned drugs, tobacco, gutka, pan masala etc.) and alcoholic beverages, are in violation of Company regulations and is prohibited.<br />
          b) Employees violating this policy will be subject to strict disciplinary action up to and including termination of employment.
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>13. Separation:</Box>
        <Box sx={{ pl: 2, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
          Your services are terminable by 1 month's notice or 1 month's gross salary during probation period and 2 months' notice or 2 months' gross salary in lieu on either side after completion of probation period.<br /><br />
          a) In case of notice by you intending the desire to leave the services, the Company shall have the option to accept the resignation with immediate effect and relieve you from the services with immediate effect, earlier than the expiry of the notice period given by you.<br /><br />
          b) No Notice is required for termination of services in case of any act of misconduct, Incompetence, poor work performance, incapability, failure to carry out reasonable instructions, redundancy, insubordination fraud theft or breach of any of the terms of employment implied or expressed on your part.<br /><br />
          c) In case if you quit employment or remain absent from duty without any notice before the expiry of the Notice Period, in lieu of notice you shall not only forfeit your salary by way of liquidated damages, Company shall also be entitled to deduct an appropriate amount of liquidated damages from or against any money found due to You by the Company on any account whatsoever.<br /><br />
          d) No notice period shall be required in cases where a transfer is denied, the existing assignment is completed, the project scope is reduced or modified by the concerned department, the project is handed over upon completion, or in any other situation involving suspension of work or reduction in scope.<br /><br />
          e) Any Information furnished by you in your Bio-Data and at the time of interview is found incorrect in our enquiry in future, your candidature will automatically be cancelled and your service through this appointment will stand terminated.<br /><br />
          f) In case you remain absent without prior permission or authorization or over stay leave for eight consecutive calendar days beyond the period of leave originally granted or subsequently extended it shall be deemed that you have vacated your employment in the company on your own accord without notice and the same shall be treated as abandonment of employment on your part.
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>14. Retirement:</Box>
        <Box sx={{ pl: 2, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
          You will retire on attaining the age of superannuation, which shall be 60 years, unless you are otherwise disqualified due to continued ill health, physical or mental disability.
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>15. Full and Final Settlement:</Box>
        <Box sx={{ pl: 2, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
          a) Handover of Charge: You shall properly hand over all the documents to your reporting manager or any other authority assigned by the company.<br /><br />
          b) Your dues, if any, shall be cleared after receiving the Company assets, No dues certificate from the Reporting Manager's and HOD's.
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>16. Jurisdiction:</Box>
        <Box sx={{ pl: 2, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
          All disputes shall be subject to the exclusive jurisdiction of Courts at Ranga Reddy District, Telangana.
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>17. Acceptance of our offer:</Box>
        <Box sx={{ pl: 2, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
          Please acknowledge the receipt of Appointment Order by signing and returning the duplicate copy.
        </Box>
     
      </Box>
         We welcome you and wish all success in your assignment with us
    </Box>
    Thanking you,

    {/* Signature Section */}
<Box sx={{ mt: 6 }}>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
    <Box sx={{ textAlign: 'center', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
      <Box sx={{ mb: 1, fontWeight: '600' }}>
        {appointmentLetterData?.companyDesc || 'My Home Constructions'}
      </Box>

      <Box sx={{ mb: 4, fontWeight: 'bold' }}>
        Sudeep Kumar K
      </Box>

      <Box>Vice President - HR</Box>
    </Box>

    <Box sx={{ textAlign: 'center', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
      <Divider sx={{ width: 200, mb: 2 }} />
      <Box>Signature of the Employee</Box>
    </Box>
  </Box>

  {/* Acceptance Checkbox */}
  <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1, mb: 3 }}>
    <FormControlLabel
      control={
        <Checkbox
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          color="primary"
        />
      }
      label={
        <Box sx={{ fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
          I have read and understood all the above terms and conditions of the
          Appointment Letter and the same are acceptable to me.
        </Box>
      }
    />
  </Box>

  {accepted && (
    <Alert
      severity="success"
      sx={{ mb: 2, fontSize: '14px', fontFamily: 'Arial, sans-serif' }}
    >
      Terms accepted on{' '}
      {appointmentLetterData?.date
        ? new Date(appointmentLetterData.date).toLocaleDateString('en-GB')
        : ''}
    </Alert>
  )}
</Box>
  </Box>

  <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200 flex-wrap">
    <button
      onClick={handleCloseAppointmentModal}
      className="px-6 py-2.5 rounded-lg font-semibold
      border border-indigo-500 text-indigo-600
      hover:bg-indigo-50 hover:-translate-y-0.5
      transition-all duration-200"
    >
      Close
    </button>

    <button
      onClick={generatePDF}
      disabled={!accepted || isGeneratingPDF}
      className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white
      bg-gradient-to-r from-indigo-500 to-indigo-600
      hover:from-indigo-600 hover:to-indigo-700
      hover:-translate-y-0.5 transition-all duration-200
      shadow-md hover:shadow-lg
      disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
    >
      <Download size={18} />
      Appointment Letter
    </button>

    <button
      onClick={handleSubmitAppointment}
      disabled={!accepted || isGeneratingPDF}
      className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white
      bg-gradient-to-r from-green-500 to-green-600
      hover:from-green-600 hover:to-green-700
      hover:-translate-y-0.5 transition-all duration-200
      shadow-md hover:shadow-lg
      disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
    >
      <CheckCircle2 size={18} />
      {isGeneratingPDF ? "Processing..." : "Verify & Submit"}
    </button>
  </div>
</Box>
      </Modal>


    </Box>
  );
};

export default AppointmentLetter;