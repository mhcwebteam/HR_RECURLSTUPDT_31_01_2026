import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Chip, TextField, InputAdornment, Tooltip, Modal, IconButton, Divider, FormControlLabel, Checkbox, Alert } from '@mui/material';
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

  const navigate = useNavigate();
  const [Token, useToken] = useState(() => {
    const userToken = JSON.parse(localStorage.getItem('userInfo'));
    return userToken ? userToken : null;
  })

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
        }));

      console.log("Filtered formattedRows (with joining dates):", apiData);
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

  const handleAppointmentClick = (rowData) => {
    // Reset acceptance status when opening new appointment letter
    setAccepted(false);
    
    // Generate appointment letter data from row data
    const appointmentData = {
      reference_no_App: `HR/APPT/${new Date().getFullYear()}/${rowData.CHILD_CASEID}`,
      DO_App: new Date().toLocaleDateString('en-GB'),
      Name_of_the_candidate: rowData.employee_name,
      Address_of_The_CandidateP1: rowData.fullData?.current_address || 'Not Provided',
      Designation: rowData.DESIG || rowData.MANPOWER_DESG || 'Not Specified',
      DO_Offer: rowData.fullData?.offer_date || new Date().toLocaleDateString('en-GB'),
      Location: rowData.location,
      Reporting_to: rowData.fullData?.reporting_to || 'HOD',
      CTC_Lpa: rowData.offered_ctc || rowData.current_ctc || 'Not Specified',
      CTC_in_words: convertToWords(rowData.offered_ctc || rowData.current_ctc || '0'),
      Probation: '6 months',
      Company: 'Company Name',
      email: rowData.email,
      phone: rowData.phone,
      caseId: rowData.CHILD_CASEID,
      date:rowData.joining_date,
    };
    
    setAppointmentLetterData(appointmentData);
    setOpenAppointmentModal(true);
  };

  const handleCloseAppointmentModal = () => {
    setOpenAppointmentModal(false);
    setAppointmentLetterData(null);
    setAccepted(false);
  };

  const generatePDF = async () => {
    if (!accepted) {
      Swal.fire({
        icon: 'warning',
        title: 'Acceptance Required',
        text: 'Please accept the terms and conditions before downloading the appointment letter.',
        confirmButtonColor: '#667eea',
      });
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      const element = document.getElementById('appointment-letter-content');
      if (!element) {
        throw new Error('Appointment letter content not found');
      }

      // Use html2canvas with better settings for quality
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      });
      
      const imgWidth = 190; // mm (A4 width minus margins)
      const pageHeight = 277; // mm (A4 height minus margins)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 10, position + 10, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 10, position + 10, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Appointment_Letter_${appointmentLetterData.reference_no_App}.pdf`);
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Appointment letter downloaded successfully!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'PDF Generation Failed',
        text: 'Error generating PDF. Please try again.',
        confirmButtonColor: '#667eea',
      });
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
      minWidth: 130,
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
      minWidth: 110,
      renderCell: (params) => {
        const caseId = params.row.CHILD_CASEID;
        return (
          <TextField
            size="small"
            type="date"
            value={
              joiningDates[caseId] ??
              (params.row.joining_date
                ? params.row.joining_date.split('T')[0]
                : '')
            }
            onChange={(e) =>
              handleJoiningDateChange(caseId, e.target.value)
            }
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                fontSize: '12px',
                height: '32px',
                '& fieldset': {
                  borderColor: '#d1d5db',
                },
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                },
              },
            }}
          />
        );
      },
    },
    {
      field: 'joining_status',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value}
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
        <Tooltip title="View Appointment Letter">
          <IconButton
            size="small"
            onClick={() => handleAppointmentClick(params.row)}
            sx={{
              color: '#667eea',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
              },
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
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
    <Box sx={{
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "12px",
    }}>
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
              Appointment Letter
            </Typography>
            <IconButton onClick={handleCloseAppointmentModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box id="appointment-letter-content" sx={{ fontFamily: "'Times New Roman', serif", lineHeight: 1.6, p: 2 }}>
            {/* Header with Reference Number */}
            <Typography variant="body1" sx={{ textAlign: 'right', mb: 2 }}>
              <strong>Ref No:</strong> {appointmentLetterData?.reference_no_App}
            </Typography>
            
        <Typography variant="body1" sx={{ textAlign: 'right', mb: 4 }}>
  <strong>Date:</strong>{" "}
  {appointmentLetterData?.date
    ? new Date(appointmentLetterData.date).toLocaleDateString('en-GB')
    : ''}
</Typography>

            {/* Recipient Address */}
            <Typography variant="body1" sx={{ mb: 1 }}>To,</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {appointmentLetterData?.Name_of_the_candidate},
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              {appointmentLetterData?.Address_of_The_CandidateP1}
            </Typography>

            {/* Title */}
            <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold' }}>
              LETTER OF APPOINTMENT AS {appointmentLetterData?.Designation?.toUpperCase()}
            </Typography>

            {/* Salutation */}
            <Typography variant="body1" sx={{ mb: 4 }}>
              Dear {appointmentLetterData?.Name_of_the_candidate},
            </Typography>

            {/* Introduction */}
            <Typography variant="body1" sx={{ mb: 4 }}>
              With reference to our offer letter dated: {appointmentLetterData?.DO_Offer}, we are pleased to appoint you as <strong>{appointmentLetterData?.Designation}</strong> at <strong>"{appointmentLetterData?.Location}"</strong>. Your employment will be governed by the following terms and conditions:
            </Typography>

            {/* Terms and Conditions */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>1. Date of Appointment:</Typography>
                <Typography variant="body1" sx={{ pl: 2 }}>
                  Your date of commencement on job is from {appointmentLetterData?.date
    ? new Date(appointmentLetterData.date).toLocaleDateString('en-GB')
    : ''}.
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>2. Place of Posting & Transfer:</Typography>
                <Typography variant="body1" sx={{ pl: 2 }}>
                  Your initial place of posting will be at our {appointmentLetterData?.Location}. The Company reserves its right to transfer your services to any of its Sites / Subsidiaries / Associates / Offices at any place existing at present or which may be established in future.
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>3. Reporting:</Typography>
                <Typography variant="body1" sx={{ pl: 2 }}>
                  You will report to {appointmentLetterData?.Reporting_to} or any other authority assigned by Management from time to time.
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>4. Remuneration:</Typography>
                <Typography variant="body1" sx={{ pl: 2 }}>
                  You will be paid ₹{appointmentLetterData?.CTC_Lpa} ({appointmentLetterData?.CTC_in_words}) per annum, which will be subject to the statutory deductions as per the Company's policy and Government norms.
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>5. Probation:</Typography>
                <Typography variant="body1" sx={{ pl: 2 }}>
                  You will be on probation for a period of {appointmentLetterData?.Probation} from the date of your joining and will continue to be so unless your services are confirmed in writing.
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>6. Reference Checks:</Typography>
                <Typography variant="body1" sx={{ pl: 2 }}>
                  Your employment is subject to the obtaining or receiving satisfactory responses from the reference checks conducted by the company.
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>7. General:</Typography>
                <Typography variant="body1" sx={{ pl: 2 }}>
                  a) You will be eligible for Leaves/Weekly Offs/National & Festival Holidays as may be announced by the Company from time to time.<br />
                  b) If at any stage, during the tenure of your services, it is found that the information furnished by you, regarding your age, educational qualifications, and previous experience is false; your services will be terminated without any notice.<br />
                  c) You shall inform the Company about the changes in personal information, if any, like change in residential address, acquiring higher qualifications etc. from time to time.<br />
                  d) During the period of employment with the Company, you will be in whole-time service of the Company and shall not engage or associate yourself directly / indirectly or in any other manner whatsoever.
                </Typography>
              </Box>
            </Box>

            {/* Signature Section */}
            <Box sx={{ mt: 6 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    For {appointmentLetterData?.Company}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 4, fontWeight: 'bold' }}>
                    Sudeep Kumar K
                  </Typography>
                  <Typography variant="body1">Vice President - HR</Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Divider sx={{ width: 200, mb: 2 }} />
                  <Typography variant="body1">Signature of the Employee</Typography>
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
                    <Typography variant="body1">
                      I have read and understood all the above terms and conditions of the Appointment Letter and the same are acceptable to me.
                    </Typography>
                  }
                />
              </Box>

              {accepted && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Terms accepted on   {appointmentLetterData?.date
    ? new Date(appointmentLetterData.date).toLocaleDateString('en-GB')
    : ''}
                </Alert>
              )}
            </Box>
          </Box>

       <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200 flex-wrap">

  {/* DOWNLOAD BUTTON (PRIMARY) */}

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
      Appoinment Letter
  </button>

  {/* CLOSE BUTTON (SECONDARY) */}

  {/* VERIFY & SUBMIT (SUCCESS) */}
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