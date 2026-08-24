


import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Chip, TextField, InputAdornment, Tooltip, Modal, IconButton, Divider, FormControlLabel, Checkbox, Alert, Dialog, DialogContent, DialogActions, MenuItem, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../Config/Config.jsx';
import DocUpload from './DocUpload.jsx';
import History from './History.jsx';
import Swal from 'sweetalert2';
import { FilePen } from 'lucide-react';
import JoiningReportForm from './JoiningReportForm.jsx';
import axiosInstance from '../Config/axiosConfig.jsx';
import { Close } from '@mui/icons-material';

const JoiningReportList = () => {
  const [joiningData, setJoiningData] = useState([]);
  const [savedRows, setSavedRows] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

  const [selectedRow, setSelectedRow] = useState(null);
  const [openDocModal, setOpenDocModal] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);

  const [joiningDates, setJoiningDates] = useState({});
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedPlant, setSelectedPlant] = useState("");
  const [plants, setPlants] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    reporting_to: '',
    probation: '',
    notice_period: "",

  });

  const [remarksModal, setRemarksModal] = useState({
  open: false,
  row: null,
  text: '',
  error: '',
});

  console.log("plaaaaaaaaaaa", plants);
  const navigate = useNavigate();
  const [Token, setToken] = useState(() => {
    const userToken = JSON.parse(localStorage.getItem('userInfo'));
    return userToken ? userToken : null;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get unique companies from plants
  const companies = plants.reduce((acc, plant) => {
    if (plant.BUKRS && !acc.some(item => item.BUKRS === plant.BUKRS)) {
      acc.push({
        BUKRS: plant.BUKRS,
        COMP_CODE_DESC: plant.COMP_CODE_DESC
      });
    }
    return acc;
  }, []);

  // Get filtered plants based on selected company
  const filteredPlants = selectedCompany 
    ? plants.filter(plant => plant.BUKRS === selectedCompany)
    : [];

  const zmmPlants = async () => {
    if (!Token?.token) return;

    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/zmm-plants`,
        {
          headers: { Authorization: `Bearer ${Token.token}` },
        }
      );

      setPlants(response.data.data);
      console.log(response.data, "plants response");
    } catch (err) {
      console.error("Error fetching plants", err);
    }
  };

  useEffect(() => {
    zmmPlants();
  }, []);

  // Reset company and plant when dialog closes
  const resetForm = () => {
    setFormData({
      reporting_to: "",
      probation: "",
      notice_period:"",
    });
    setSelectedCompany("");
    setSelectedPlant("");
    setSelectedRow(null);
  };

  const handleSubmit = async () => {
    // Find the selected plant object
    const selectedPlantObj = plants.find(
      (p) => p.plant_code === selectedPlant
    );

    if (!selectedPlantObj) {
      Swal.fire({
        icon: "error",
        title: "Please select a plant",
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

    const confirmResult = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to submit onboard details?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Submit',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#494b9b',
      cancelButtonColor: '#6b7280',
      customClass: { container: 'swal2-container-custom' },
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
      setSubmitLoading(true);

      const payload = {
        case_id: selectedRow?.CHILD_CASEID,
        REPORTING_TO: formData.reporting_to,
        PROBITION: formData.probation,
        NOTICEPERIOD:formData.notice_period,
        ONBOARD_PLANT: `${selectedPlantObj.plant_code}-${selectedPlantObj.plant_name}`,
        COMPANY  : `${selectedPlantObj.BUKRS}-${selectedPlantObj.COMP_CODE_DESC}`,
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

      if (response.data.status) {
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.data.message || "Onboard details submitted successfully!",
          timer: 2000,
          showConfirmButton: false,
        });

        resetForm();
        setDetailsDialogOpen(false);
        await joinData();
      } else {
        throw new Error(response.data.message || "Something went wrong");
      }

    } catch (error) {
      console.error("Submit error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || error.message || "Something went wrong",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  //----------------------------JoiningDataStart------------------------//
  const joinData = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/emp-verify-data`,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${Token?.token}`,
          },
        }
      );

      const apiData = response.data.data;

      const formattedRows = apiData
        .filter(item => {
          const hasJoiningDate = item.onBoarding == "1" || item.onBoarding == "2";
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
          REF_NO: item?.REF_NO,
          joining_updated_at: item?.joining_updated_at,
          joining_status: 'Joined',
          offer_letter: item.OfferLetterFlag ?? '',
          bgv_status: item.verification_status ?? '',
          documents_status: item.overallDocments_aprvl === '1' ? 'Complete' : 'Pending',
          current_stage: item.CURRENT_TASK,
          hr_owner: item.CURRENT_USER,
          created_at: item.created_at,
          fullData: item,
          appointmentDetailsFilled: !!(
            item.ONBOARD_PLANT &&
            item.REPORTING_TO &&
            item.PROBITION
          ),
          existingDetails: {
            ONBOARD_PLANT: item.ONBOARD_PLANT || '',
            REPORTING_TO: item.REPORTING_TO || '',
            PROBITION: item.PROBITION || ''
          },
        }));

      console.log("Filtered formattedRows (with joining dates):", apiData);
      setJoiningData(formattedRows);
      setFilteredData(formattedRows);
    } catch (error) {
      console.error("Error in fetching joining data", error);
    }
  };

  useEffect(() => {
    if (Token?.token) {
      joinData();
    }
  }, [Token?.token]);

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

  const handleCloseHistoryModal = () => {
    setOpenHistoryModal(false);
    setSelectedRow(null);
  };

  const handleJoiningDateChange = (caseId, value) => {
    setJoiningDates((prev) => ({
      ...prev,
      [caseId]: value,
    }));
    setSavedRows((prev) => ({
      ...prev,
      [caseId]: false,
    }));
  };

  const handleSaveJoiningDate = async (user) => {
    try {
      const caseId = user.CHILD_CASEID;
      const payload = {
        CHILD_CASEID: caseId,
        joiningDate: joiningDates[caseId] || (user.joining_date ? user.joining_date.split('T')[0] : ''),
      };

      await axiosInstance.post(
        `${API_BASE_URL}/join-Date-updt`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${Token.token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Joining date updated successfully",
      });

      setSavedRows((prev) => ({
        ...prev,
        [caseId]: true,
      }));

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Update failed",
      });
    }
  };


//   const handleMoveNextTab = async (row) => {
//   try {
//     // Step 1: Ask for mandatory remarks
//     const { value: remarks } = await Swal.fire({
//       title: 'Enter Remarks',
//       input: 'textarea',
//       inputLabel: 'Remarks',
//       inputPlaceholder: 'Type your remarks here...',
//       showCancelButton: true,
//       confirmButtonText: 'Next',
//       cancelButtonText: 'Cancel',
//       confirmButtonColor: '#10b981',
//       cancelButtonColor: '#6b7280',
//       inputValidator: (value) => {
//         if (!value || !value.trim()) {
//           return 'Remarks are mandatory!';
//         }
//       },
//     });

//     // If user cancelled the remarks prompt, stop here
//     if (!remarks) {
//       return;
//     }

//     // Step 2: Confirm the move
//     const result = await Swal.fire({
//       title: 'Confirm Move',
//       text: `Move to the action stage?`,
//       icon: 'question',
//       showCancelButton: true,
//       confirmButtonColor: '#10b981',
//       cancelButtonColor: '#6b7280',
//       confirmButtonText: 'Yes, Move',
//       cancelButtonText: 'Cancel'
//     });

//     if (!result.isConfirmed) {
//       return;
//     }

//     const payload = {
//       CHILD_CASEID: row?.CHILD_CASEID,
//       RevisionTrackStatus: "joining report",
//       remarks: remarks.trim(),
//       deletecase: "01"
//     };

//     const response = await axiosInstance.post(
//       `${API_BASE_URL}/delete-verification-case`,
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${Token.token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     await Swal.fire({
//       icon: "success",
//       title: "Moved Successfully!",
//       text: `The row is moved to the Action stage`,
//       timer: 1500,
//       showConfirmButton: false,
//     });

//     if (joinData) {
//       await joinData();
//     }

//     console.log("Response:", response.data);
//   } catch (error) {
//     await Swal.fire({
//       icon: 'error',
//       title: 'Error!',
//       text: error.response?.data?.message || 'Failed to move to next stage',
//       confirmButtonColor: '#ef4444'
//     });
//     console.error("Move next tab error:", error);
//   }
// };


const handleMoveNextTab = (row) => {
  setRemarksModal({ open: true, row, text: '', error: '' });
};

const handleRemarksChange = (e) => {
  const value = e.target.value;
  setRemarksModal((prev) => ({
    ...prev,
    text: value,
    error: value.trim() ? '' : prev.error,
  }));
};

const handleRemarksNext = async () => {
  if (!remarksModal.text.trim()) {
    setRemarksModal((prev) => ({ ...prev, error: 'Remarks are mandatory' }));
    return;
  }

  const row = remarksModal.row;
  const remarks = remarksModal.text.trim();
  setRemarksModal({ open: false, row: null, text: '', error: '' });

  const result = await Swal.fire({
    title: 'Confirm Move',
    text: `Move to the action stage?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, Move',
    cancelButtonText: 'Cancel'
  });

  if (!result.isConfirmed) return;

  try {
    const payload = {
      CHILD_CASEID: row?.CHILD_CASEID,
      RevisionTrackStatus: "joining report",
      remarks,
      deletecase: "01",
     
    };

    const response = await axiosInstance.post(
      `${API_BASE_URL}/delete-verification-case`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${Token.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    await Swal.fire({
      icon: "success",
      title: "Moved Successfully!",
      text: `The row is moved to the Action stage`,
      timer: 1500,
      showConfirmButton: false,
    });

    if (joinData) await joinData();
    console.log("Response:", response.data);
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: error.response?.data?.message || 'Failed to move to next stage',
      confirmButtonColor: '#ef4444'
    });
    console.error("Move next tab error:", error);
  }
};
  const handleViewRejectedDetails = (row) => {
    setSelectedRow(row);
    setFormData({
      reporting_to: row.existingDetails?.REPORTING_TO || '',
      probation: row.existingDetails?.PROBITION || '',
      notice_period:row.existingDetails?.NOTICEPERIOD ||'',

    });

    if (row.existingDetails?.ONBOARD_PLANT) {
      const plantCode = row.existingDetails.ONBOARD_PLANT.split('-')[0];
      setSelectedPlant(plantCode);
      // Also set the company
      const plant = plants.find(p => p.plant_code === plantCode);
      if (plant) {
        setSelectedCompany(plant.BUKRS);
      }
    } else {
      setSelectedCompany("");
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
      field: 'joiningreport',
      headerName: 'Joining Report',
      flex: 0.5,
      minWidth: 160,
      sortable: false,
      renderCell: (params) => (
        <Tooltip
          title={
            params.row.appointmentDetailsFilled
              ? "View Joining Report"
              : "Please fill appointment details first"
          }
        >
          <span>
            <Button
              size="small"
              variant="contained"
              onClick={() =>
                params.row.appointmentDetailsFilled &&
                handleReportClick(params.row)
              }
              disabled={!params.row.appointmentDetailsFilled}
              sx={{
                textTransform: 'capitalize',
                borderRadius: '8px',
                fontSize: '12px',
                px: 2,
                py: 0.5,
                backgroundColor: params.row.appointmentDetailsFilled
                  ? '#667eea'
                  : '#cbd5e1',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: params.row.appointmentDetailsFilled
                    ? '#5a67d8'
                    : '#cbd5e1',
                  boxShadow: 'none',
                },
              }}
            >
              Click Here
            </Button>
          </span>
        </Tooltip>
      ),
    },
    {
      field: 'Appoinment',
      headerName: 'Appoinment Details',
      flex: 0.6,
      minWidth: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => handleViewRejectedDetails(params.row)}
            sx={{
              backgroundColor: '#3b82f6',
              textTransform: 'capitalize',
              fontSize: '11px',
              padding: '3px 10px',
              borderRadius: '6px',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
            }}
          >
            details
          </Button>
        );
      },
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
    ...(hasTypePlant
      ? [{
        field: 'TYPE_PLANT',
        headerName: 'Type Plant',
        minWidth: 150,
        flex: 1.2,
        renderCell: (params) => (
          <Box sx={{ color: '#374151' }}>
            {params.value}
          </Box>
        ),
      }]
      : []),
    ...(recCycle
      ? [{
        field: 'RECRUIT_CYCLE',
        headerName: 'Emp Level',
        flex: 1.2,
        renderCell: (params) => (
          <Box sx={{ color: '#374151' }}>
            {params.value}
          </Box>
        ),
      }]
      : []),
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
          <Box
            sx={{
              color: '#374151',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
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
      minWidth: 200,
      renderCell: (params) => {
        const caseId = params.row.CHILD_CASEID;
        return (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%' }}>
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
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  fontSize: '12px',
                  height: '32px',
                },
              }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={() => handleSaveJoiningDate(params.row)}
              sx={{
                borderRadius: '999px',
                height: '24px',
                minWidth: 'unset',
                px: '9px',
                fontSize: '11px',
                textTransform: 'none',
                border: 'none',
                boxShadow: 'none',
                transition: 'all 0.15s',
                background: savedRows[caseId] ? '#22c55e' : '#156ee2',
                '&:hover': {
                  background: savedRows[caseId] ? '#16a34a' : '#0f5bd1',
                  boxShadow: 'none',
                },
                '&:disabled': {
                  background: '#cbd5e1',
                  color: '#fff',
                },
              }}
            >
              {savedRows[caseId] ? 'Saved' : 'Save'}
            </Button>
          </div>
        );
      },
    },
    {
      field: 'joining_status',
      headerName: 'Joining status',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          size="small"
          label="pending"
          sx={{
            backgroundColor: params.value === 'Pending' ? '#ef4444' : '#10b981',
            color: 'white',
            fontWeight: 600,
            fontSize: '11px',
            height: '24px',
          }}
        />
      ),
    },

        {
      
            field: 'ACTIONTAB',
      
            headerName: 'Action Tab',
      
            flex: 1,
      
            minWidth: 110,
      
            sortable: false,
      
            filterable: false,
      
            renderCell: (params) => {
      
               const status = params.row.ofrLetterStatus?.trim().toLowerCase();

    
      
              return (
      
                <Button
      
                  variant="contained"
      
                  size="small"
      
              onClick={() => handleMoveNextTab(params.row)}
      
                  sx={{
      
        
                    color: 'white',
      
                    fontSize: '9px',
      
                    padding: '4px 10px',
      
                    borderRadius: '6px',
      
                    textTransform: 'capitalize',
      
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
      
                    minWidth: '90px',
      
             
      
                    '&:disabled': {
      
                      background: '#9ca3af',
      
                      color: '#e5e7eb',
      
                    }
      
                  }}
      
                >
      
                    Move to ActionTab
      
               
      
                </Button>
      
              );
      
            },
      
          },


    
  ];

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
              {filteredData.length} joining reports
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
        onClose={() => {
          resetForm();
          setDetailsDialogOpen(false);
        }}
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
              onClick={() => {
                resetForm();
                setDetailsDialogOpen(false);
              }}
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
          {/* Company Dropdown */}
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                mb: 1,
              }}
            >
              Company Code <span style={{ color: 'red' }}>*</span>
            </Typography>

            <TextField
              select
              fullWidth
              size="small"
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                setSelectedPlant(""); // Reset plant when company changes
              }}
              placeholder="Select Company"
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (!selected) {
                    return (
                      <Typography sx={{ color: '#9ca3af', fontSize: '13px' }}>
                        Select Company
                      </Typography>
                    );
                  }
                  const selectedItem = companies.find((item) => item.BUKRS === selected);
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
              {companies.map((company) => (
                <MenuItem
                  key={company.BUKRS}
                  value={company.BUKRS}
                  sx={{
                    py: 1,
                    px: 1,
                  }}
                >
                  <Typography sx={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {company.BUKRS} - {company.COMP_CODE_DESC}
                  </Typography>
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Plant Dropdown - Shows only when company is selected */}
          {selectedCompany && (
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  mb: 1,
                }}
              >
                Plant <span style={{ color: 'red' }}>*</span>
              </Typography>

              <TextField
                select
                fullWidth
                size="small"
                value={selectedPlant}
                onChange={(e) => setSelectedPlant(e.target.value)}
                placeholder="Select Plant"
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <Typography sx={{ color: '#9ca3af', fontSize: '13px' }}>
                          Select Plant
                        </Typography>
                      );
                    }
                    const selectedItem = filteredPlants.find((p) => p.plant_code === selected);
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
                          {selectedItem?.plant_code} - {selectedItem?.plant_name}
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
                {filteredPlants.map((plant) => (
                  <MenuItem
                    key={plant.plant_code}
                    value={plant.plant_code}
                    sx={{
                      py: 1,
                      px: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {plant.plant_code} - {plant.plant_name}
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}

          {/* Reporting To and Probation - 2 Column Layout */}
        <Box
  sx={{
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: '1fr 1fr',
      md: '1fr 1fr 1fr',
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
      placeholder="e.g., 6 Months"
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

  {/* Notice Period */}
  <Box>
    <Typography
      sx={{
        fontSize: '13px',
        fontWeight: 600,
        color: '#374151',
        mb: 1,
      }}
    >
      📅 Notice Period <span style={{ color: 'red' }}>*</span>
    </Typography>

    <TextField
      fullWidth
      placeholder="e.g., 30 Days"
      name="notice_period"
      value={formData.notice_period}
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
            onClick={() => {
              resetForm();
              setDetailsDialogOpen(false);
            }}
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
            disabled={
              !selectedCompany ||
              !selectedPlant ||
              !formData.reporting_to ||
              !formData.probation ||
              !formData.notice_period ||
              submitLoading
            }
            startIcon={
              submitLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
            sx={{
              background: submitLoading
                ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                : 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
              textTransform: 'none',
              borderRadius: '14px',
              fontWeight: 700,
              px: 3.5,
              py: 1.1,
              fontSize: '13px',
              minWidth: '170px',
              letterSpacing: '0.3px',
              color: '#fff',
              boxShadow: submitLoading
                ? '0 4px 12px rgba(99,102,241,0.35)'
                : '0 8px 20px rgba(79,70,229,0.35)',
              transition: 'all 0.25s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #312e81 0%, #5b21b6 100%)',
                transform: 'translateY(-2px) scale(1.01)',
                boxShadow: '0 12px 24px rgba(79,70,229,0.45)',
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
              '&:disabled': {
                background: '#cbd5e1',
                color: '#f8fafc',
                boxShadow: 'none',
                cursor: 'not-allowed',
              },
            }}
          >
            {submitLoading ? 'Submitting Details...' : 'Submit Details'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DocUpload Modal */}
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
              onClose={() => {
                setOpenDocModal(false);
                joinData();
              }}
              refreshTable={joinData}
              Report="JoiningReportList"
            />
          </div>
        </div>
      )}

      {openReportModal && selectedRow && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
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
            <button
              onClick={handleCloseReportModal}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                border: 'none',
                background: '#ef4444',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#fff',
                zIndex: 10,
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              ×
            </button>

            <JoiningReportForm
              rowData={selectedRow}
              onClose={handleCloseReportModal}
            />
          </div>
        </div>
      )}
<Dialog
  open={remarksModal.open}
  onClose={() => setRemarksModal({ open: false, row: null, text: '', error: '' })}
  maxWidth="xs"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 24px 60px rgba(16,185,129,0.2), 0 6px 20px rgba(0,0,0,0.08)',
    },
  }}
>
  <Box
    sx={{
      background: 'linear-gradient(135deg, #059669 0%, #10b981 60%, #34d399 100%)',
      px: 2.5,
      py: 1.8,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <Typography sx={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>
      Add Remarks
    </Typography>
    <IconButton
      onClick={() => setRemarksModal({ open: false, row: null, text: '', error: '' })}
      size="small"
      sx={{ color: '#fff', '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' } }}
    >
      <Close sx={{ fontSize: 16 }} />
    </IconButton>
  </Box>

  <DialogContent sx={{ p: 2.5, pb: 1.5 }}>
    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#374151', mb: 0.8 }}>
      Remarks <span style={{ color: 'red' }}>*</span>
    </Typography>

    <TextField
      fullWidth
      multiline
      // minRows={3}
      // maxRows={5}
      autoFocus
      placeholder="Enter your remarks..."
      value={remarksModal.text}
      onChange={handleRemarksChange}
      error={!!remarksModal.error}
      // helperText={remarksModal.error || `${remarksModal.text.length}/250`}
      // inputProps={{ maxLength: 250 }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '10px',
          backgroundColor: '#fafafa',
          fontSize: '13px',
          '&:hover': {
            backgroundColor: '#f0fdf4',
            '& fieldset': { borderColor: '#10b981' },
          },
          '&.Mui-focused': {
            backgroundColor: '#ffffff',
            '& fieldset': { borderColor: '#10b981', borderWidth: '2px' },
          },
        },
        '& .MuiFormHelperText-root': { fontSize: '10.5px', textAlign: 'right', mx: 0 },
      }}
    />
  </DialogContent>

  <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #f1f5f9', gap: 1 }}>
    <Button
      onClick={() => setRemarksModal({ open: false, row: null, text: '', error: '' })}
      variant="outlined"
      size="small"
      sx={{
        textTransform: 'none',
        borderRadius: '8px',
        px: 2,
        fontSize: '12px',
        borderColor: '#e2e8f0',
        color: '#64748b',
        '&:hover': { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' },
      }}
    >
      Cancel
    </Button>
    <Button
      onClick={handleRemarksNext}
      variant="contained"
      size="small"
      sx={{
        textTransform: 'none',
        borderRadius: '8px',
        px: 2.5,
        fontSize: '12px',
        fontWeight: 600,
        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        boxShadow: '0 4px 10px rgba(16,185,129,0.3)',
        '&:hover': { background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' },
      }}
    >
      Next
    </Button>
  </DialogActions>
</Dialog>
      {/* History Modal */}
      {openHistoryModal && selectedRow && (
        <History
          open={openHistoryModal}
          onClose={handleCloseHistoryModal}
          data={selectedRow.fullData}
          onStatusChange={() => {
            joinData();
          }}
        />
      )}
    </Box>
  );
};

export default JoiningReportList;