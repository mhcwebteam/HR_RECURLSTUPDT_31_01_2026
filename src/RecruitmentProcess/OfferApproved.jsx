


import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Chip,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Cancel,
  Visibility,
  Refresh,
  Download
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { ContextData } from '../Context/ContextData';
import {API_BASE_URL, API_BASE_URLss} from '../Config/Config.jsx';
import OfferLetterModal from './OfferLetterModal';
import axiosInstance from '../Config/axiosConfig.jsx';
import dayjs from 'dayjs';
import HRMView from './HRMView.jsx';

const OfferApproved = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState({});
  const [joiningDates, setJoiningDates] = useState({});
  const [offerLetterOpen, setOfferLetterOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [ofrList, setOfferLetterData] = useState([]);
  const [flowModalOpen, setFlowModalOpen] = useState(false);
  // State for REF_NUMBER editing
  const [editingRows, setEditingRows] = useState({});
  const [refNumberValues, setRefNumberValues] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  // State for MHC HR List
  const [hrEmployees, setHrEmployees] = useState([]);
 const [selectedHR, setSelectedHR] = useState(hrEmployees[0]?.EMP_ID || "");

  const [isHRDialogOpen, setIsHRDialogOpen] = useState(false);
  const [currentRowData, setCurrentRowData] = useState(null);

  const [token] = useState(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    return userInfo ? userInfo : null;
  });

  const handleJoiningDateChange = (caseId, date) => {
    setJoiningDates(prev => ({
      ...prev,
      [caseId]: date
    }));
  };


  useEffect(() => {
  if (hrEmployees.length > 0 && !selectedHR) {
    setSelectedHR(hrEmployees[0].EMP_ID);
  }
}, [hrEmployees, selectedHR]);
  
  // Handle edit click for REF_NUMBER
  const handleEditClick = (rowId) => {
    setEditingRows(prev => ({ ...prev, [rowId]: true }));
    const row = ofrList.find(item => item.CHILD_CASEID === rowId);
    if (row) {
      setRefNumberValues(prev => ({
        ...prev,
        [rowId]: row.REF_NUMBER || ''
      }));
    }
  };

  // Handle cancel edit for REF_NUMBER
  const handleCancelEdit = (rowId) => {
    setEditingRows(prev => ({ ...prev, [rowId]: false }));
    setRefNumberValues(prev => {
      const newValues = { ...prev };
      delete newValues[rowId];
      return newValues;
    });
  };

  // Save REF_NUMBER to local state
  const handleSaveRefNumber = async (rowId, rowData) => {
    const refNumber = refNumberValues[rowId];
    
    if (!refNumber || refNumber.trim() === "") {
      await Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a valid Reference Number",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Update local state
      setOfferLetterData(prevData => 
        prevData.map(item => 
          item.CHILD_CASEID === rowId 
            ? { ...item, REF_NUMBER: refNumber }
            : item
        )
      );
      
      // Exit edit mode
      setEditingRows(prev => ({ ...prev, [rowId]: false }));
      
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Reference Number saved successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error saving reference number:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save reference number",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!token?.token) return;

    const fetchHrEmployees = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}/mhc-hr-list`,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token?.token}`,
            },
          }
        );

        const hrList = response.data?.hrDropDownListData || [];
        setHrEmployees(hrList);
        console.log("HR Employees List:", hrList);
      } catch (err) {
        console.error("Error fetching HR employees list", err);
      }
    };

    fetchHrEmployees();
  }, [token?.token]);

  const handleOfferLterEmail = async (rowData) => {
    try {
      // Get the REF_NUMBER from state
      const refNumber = refNumberValues[rowData.CHILD_CASEID] || rowData.REF_NUMBER;
      
      if (!refNumber || refNumber.trim() === "") {
        await Swal.fire({
          icon: "warning",
          title: "Validation Error",
          text: "Please add Reference Number before moving to onboarding",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      // Open HR selection dialog instead of simple confirmation
      setCurrentRowData(rowData);
      setSelectedHR('');
      setIsHRDialogOpen(true);

    } catch (error) {
      console.error(error);
      await Swal.fire(
        "Error",
        error.response?.data?.message || "Something went wrong",
        "error"
      );
    }
  };

  // Handle HR selection confirmation
  // const handleConfirmMoveToOnboarding = async () => {
  //  const selectedHrObject = hrEmployees.find(hr => hr.EMP_ID === selectedHR);
  // console.log("Selected HR Object:", selectedHrObject);
  // console.log("Selected HR Name:", selectedHrObject?.EMP_NAME);
    
  //   if (!selectedHR) {
  //     await Swal.fire({
  //       icon: "warning",
  //       title: "Validation Error",
  //       text: "Please select an MHC HR before proceeding",
  //       confirmButtonColor: "#2563eb",
  //     });
  //     return;
  //   }

  //   try {
  //     const refNumber = refNumberValues[currentRowData.CHILD_CASEID] || currentRowData.REF_NUMBER;
      
  //     const payload = {
  //       CHILD_CASEID: currentRowData.CHILD_CASEID,
  //       REF_NO: refNumber,
  //       reassign_to: selectedHrObject?.EMP_NAME,
  //       prevassign_to: token.employee,
  //     };
      
  //     console.log("Payload being sent:", payload);
      
  //     // Uncomment when backend is ready
  //     const ofrMailSend = await axiosInstance.post(`${API_BASE_URL}/move-To-OnBoard`, payload, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Accept": "application/json",
  //         "Authorization": `Bearer ${token.token}`
  //       }
  //     });

  //     if (ofrMailSend.data.message) {
  //       await Swal.fire({
  //         icon: "success",
  //         title: "Success",
  //         text: "Successfully moved to OnBoarding!",
  //         timer: 1500,
  //         showConfirmButton: false,
  //       });

  //       setIsHRDialogOpen(false);
  //       setSelectedHR('');
  //       setCurrentRowData(null);

  //       if (fetchOfrData) {
  //         await fetchOfrData();
  //       }
  //     } else {
  //       await Swal.fire("Failed", ofrMailSend.data.message, "error");
  //     }
      
  //     // For testing - show success
  //     await Swal.fire({
  //       icon: "success",
  //       title: "Success",
  //       text: `Moved to OnBoarding with HR: ${selectedHR}`,
  //       timer: 1500,
  //       showConfirmButton: false,
  //     });

  //     setIsHRDialogOpen(false);
  //     setSelectedHR('');
  //     setCurrentRowData(null);

  //   } catch (error) {
  //     console.error(error);
  //     await Swal.fire(
  //       "Error",
  //       error.response?.data?.message || "Something went wrong",
  //       "error"
  //     );
  //   }
  // };

const handleConfirmMoveToOnboarding = async () => {
  const selectedHrObject = hrEmployees.find(
    (hr) => hr.EMP_ID === selectedHR
  );

  if (!selectedHR) {
    return Swal.fire({
      icon: "warning",
      title: "Validation Error",
      text: "Please select an MHC HR before proceeding",
      confirmButtonColor: "#2563eb",
    });
  }

  // Confirmation Popup
  const confirmResult = await Swal.fire({
    title: "Move to Onboarding?",
    text: "Are you sure you want to move this candidate to onboarding?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Submit",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#10b981",
    cancelButtonColor: "#6b7280",
    customClass: {
      container: "swal2-container-custom",
    },
    didOpen: () => {
      const swalContainer = document.querySelector(".swal2-container");
      if (swalContainer) {
        swalContainer.style.zIndex = "9999";
      }
    },
  });

  if (!confirmResult.isConfirmed) return;

  try {
    // Loading Popup
    Swal.fire({
      title: "Moving Candidate...",
      text: "Please wait...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      customClass: {
        container: "swal2-container-custom",
      },
      didOpen: () => {
        const swalContainer = document.querySelector(".swal2-container");
        if (swalContainer) {
          swalContainer.style.zIndex = "9999";
        }

        Swal.showLoading();
      },
    });

    const refNumber =
      refNumberValues[currentRowData.CHILD_CASEID] ||
      currentRowData.REF_NUMBER;

    const payload = {
      CHILD_CASEID: currentRowData.CHILD_CASEID,
      REF_NO: refNumber,
      reassign_to: selectedHrObject?.EMP_NAME,
      prevassign_to: token.employee,
    };

    const response = await axiosInstance.post(
      `${API_BASE_URL}/move-To-OnBoard`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token.token}`,
        },
      }
    );

    Swal.close();

    if (response.data.success) {
      
 await Swal.fire({
    icon: "success",
    title: "Success",
    text: "Candidate moved to Onboarding successfully.",
    showConfirmButton: false, // Hide OK button
    timer: 2000,              // Auto close after 2 seconds
    timerProgressBar: true,
    customClass: {
      container: "swal2-container-custom",
    },
    didOpen: () => {
      const swalContainer = document.querySelector(".swal2-container");
      if (swalContainer) {
        swalContainer.style.zIndex = "9999";
      }
    },
  });


      setIsHRDialogOpen(false);
      setSelectedHR("");
      setCurrentRowData(null);

      if (fetchOfrData) {
        await fetchOfrData();
      }
    } else {
      await Swal.fire({
        icon: "error",
        title: "Failed",
        text: response.data.message || "Failed to move candidate.",
        confirmButtonColor: "#ef4444",
      });
    }
  } catch (error) {
    Swal.close();

    await Swal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.message || "Something went wrong.",
      confirmButtonColor: "#ef4444",
    });
  }
};

  const fetchOfrData = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/ofr-aprvl-issue-lst`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.token}`,
          },
        }
      );

      setOfferLetterData(response.data?.candidAcptdOfr ?? []);
    } catch (err) {
      console.error("Error in fetching offer list:", err);
    }
  };

  useEffect(() => {
    if (token?.token) {
      fetchOfrData();
    }
  }, [token?.token]);

  const handleViewOfferLetter = (user) => {
    setOfferLetterOpen(true);
    setSelectedCandidate({
      ...user,
    });
  };

  const filteredData = useMemo(() => {
    if (!ofrList || ofrList.length === 0) return [];
    let result = [...ofrList];
    
    if (searchTerm) {
      result = result.filter(
        (item) =>
          item.NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.EMAIL?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.CHILD_CASEID?.includes(searchTerm)
      );
    }
    
    if (statusFilter !== "all") {
      result = result.filter(
        (item) => item.STATUS?.toLowerCase() === statusFilter
      );
    }
    
    return result.map((item, index) => ({
      ...item,
      SNO: index + 1,
    }));
  }, [ofrList, searchTerm, statusFilter]);

  const getStatusChip = (status) => {
    const statusValue = status?.toLowerCase();
    const config = {
      verified: { color: '#10b981' },
      pending:  { color: '#f59e0b' },
      rejected: { color: '#ef4444' },
      uploaded: { color: '#3b82f6' },
      approved: { color: '#10b981' },
      'not uploaded': { color: '#6b7280' }
    };
    const { color } = config[statusValue] || config.pending;
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}>
        <Box sx={{
          color: '#ffffff',
          backgroundColor: color,
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'capitalize',
          lineHeight: 1.2,
          height: '25px',
          display: 'flex',
          alignItems: 'center',
        }}>
          {statusValue?.charAt(0).toUpperCase() + statusValue?.slice(1) || 'Pending'}
        </Box>
      </Box>
    );
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    let [day, month, year] = dateStr.split('-');
    day = day.padStart(2, '0');
    month = month.padStart(2, '0');
    return new Date(`${year}-${month}-${day}`);
  };

  const formatNumber = (value) => {
    if (!value || value === 'N/A') return 'N/A';
    return value.toString();
  };

  const hasTypePlant = ofrList?.some(row => row.TYPE_PLANT);
  const recCycle = ofrList?.some(row => row.RECRUIT_CYCLE);

  const columns = useMemo(() => [
    {
      field: 'SNO',
      headerName: 'S.NO',
      flex: 0.5,
      minWidth: 70,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600, color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'CHILD_CASEID',
      headerName: 'Case ID',
      flex: 1,
      minWidth: 130,
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
          minWidth: 100,
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
          minWidth: 100,
          flex: 1.2,
          renderCell: (params) => (
            <Box sx={{ color: '#374151' }}>
              {params.value}
            </Box>
          ),
        }]
      : []),
    {
      field: 'CUR_REV_ID',
      headerName: 'Rev ID',
      flex: 1,
      minWidth: 60,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value || "00"} 
        </Box>
      ),
    },
    {
      field: 'PLANT',
      headerName: 'Plant Name',
      flex: 1.5,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'FIRST_NAME',
      headerName: 'Name',
      flex: 1,
      minWidth: 140,
      valueGetter: (value, row) =>
        `${row?.FIRST_NAME ?? ''} ${row?.LAST_NAME ?? ''}`,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600, color: '#1f2937' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'EMAIL',
      headerName: 'Email',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontSize: '12px' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'PHONE_NUMBER',
      headerName: 'Phone Number',
      flex: 0.9,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontWeight: 500 }}>
          {formatNumber(params.value)}
        </Box>
      ),
    },
    {
      field: 'DEPT',
      headerName: 'Department',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        const groupCode = params.row.GROUP_CODE;
        const dept = params.value;
        return (
          <Box sx={{ color: '#374151', fontWeight: 500 }}>
            {groupCode ? `${groupCode} - ${dept}` : dept}
          </Box>
        );
      },
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
      field: 'CURRENT_CTC',
      headerName: 'Current CTC',
      width: 110,
      renderCell: (params) => {
        const formattedValue = params.value
          ? Number(params.value).toLocaleString('en-IN')
          : '0';
        return (
          <Box sx={{ color: '#059669', fontWeight: 600, fontSize: '12px' }}>
            ₹{formattedValue}
          </Box>
        );
      },
    },
    {
      field: 'EXP_CTC',
      headerName: 'Expected CTC',
      width: 120,
      renderCell: (params) => {
        const formattedValue = params.value
          ? Number(params.value).toLocaleString('en-IN')
          : '0';
        return (
          <Box sx={{ color: '#059669', fontWeight: 600, fontSize: '12px' }}>
            ₹{formattedValue}
          </Box>
        );
      },
    },
    {
      field: 'OFFER_CTC',
      headerName: 'Offer CTC',
      width: 110,
      renderCell: (params) => {
        const formattedValue = params.value
          ? Number(params.value).toLocaleString('en-IN')
          : '0';
        return (
          <Box sx={{ color: '#dc2626', fontWeight: 600, fontSize: '12px' }}>
            ₹{formattedValue}
          </Box>
        );
      },
    },
    {
      field: 'CUR_STATUS',
      headerName: 'Approval Status',
      flex: 0.9,
      minWidth: 120,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: "viewFlow",
      headerName: "NFA Flow",
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setSelectedUser(params.row);
            setFlowModalOpen(true);
          }}
          sx={{
            textTransform: 'none',
            fontSize: '10px',
            fontWeight: 600,
            borderColor: '#667eea',
            color: '#667eea',
            padding: '4px 12px',
            borderRadius: '6px',
            '&:hover': {
              backgroundColor: '#667eea',
              color: 'white',
              borderColor: '#667eea',
            },
          }}
        >
          View Flow
        </Button>
      ),
    },
    {
      field: 'joiningDate',
      headerName: 'Date of Joining',
      flex: 1.3,
      minWidth: 170,
      renderCell: (params) => {
        return params.value
          ? dayjs(params.value).format("DD-MM-YYYY")
          : "—";
      },
    },
    {
      field: 'View',
      headerName: 'View Offer',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="View Offer Letter">
          <IconButton
            size="small"
            onClick={() => handleViewOfferLetter(params.row)}
            sx={{
              color: '#3b82f6',
              padding: '4px', 
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
              },
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: "candidOfrLtrSigned",
      headerName: "C.ofrLtrSigned",
      width: 150,
      sortable: false,
      renderCell: (params) => {
        if (!params.value) return "-";
        const fileUrl = `${API_BASE_URLss}/candid_apprvl/${params.value}`;
        const fileName = params.value.split("_").pop();
        return (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#1e40af",
              fontSize: "12px",
              textDecoration: "underline",
              cursor: "pointer"
            }}
          >
            {fileName}
          </a>
        );
      }
    },
    {
      field: 'REF_NUMBER',
      headerName: 'Ref Number',
      width: 280,
      renderCell: (params) => {
        const rowId = params.row.CHILD_CASEID;
        const hasSavedValue = params.row.REF_NUMBER && params.row.REF_NUMBER.trim() !== '';
        const isEditing = editingRows[rowId];

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} key={`ref-number-${rowId}-${isEditing}`}>
            {hasSavedValue && !isEditing ? (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                width: '100%',
                gap: 1
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    color: '#1e293b',
                    backgroundColor: '#f1f5f9',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    flex: 1
                  }}
                >
                  {params.row.REF_NUMBER}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleEditClick(rowId)}
                  disabled={isSaving}
                  sx={{
                    borderRadius: '999px',
                    height: '24px',
                    minWidth: 'unset',
                    px: '9px',
                    fontSize: '11px',
                    textTransform: 'none',
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    border: 'none',
                    boxShadow: 'none',
                    transition: 'all 0.15s',
                    '&:hover': {
                      background: '#bfdbfe',
                      boxShadow: '0 0 0 2px #93c5fd',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': { transform: 'scale(0.96)' },
                  }}
                >
                  Edit
                </Button>
              </Box>
            ) : (
              <>
                <TextField
                  key={`textfield-${rowId}`}
                  value={refNumberValues[rowId] !== undefined ? refNumberValues[rowId] : params.row.REF_NUMBER || ""}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setRefNumberValues(prev => ({
                      ...prev,
                      [rowId]: newValue === undefined ? '' : newValue
                    }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveRefNumber(rowId, params.row);
                    }
                  }}
                  size="small"
                  placeholder="Enter Reference Number"
                  type="text"
                  disabled={isSaving}
                  autoFocus={isEditing}
                  onClick={(e) => e.stopPropagation()}
                  InputProps={{
                    sx: {
                      '& .MuiInputBase-input': {
                        fontSize: '12px',
                        padding: '8px 12px',
                      }
                    }
                  }}
                  sx={{
                    width: '150px',
                    '& .MuiOutlinedInput-root': {
                      height: '35px',
                      fontSize: '12px',
                      '& fieldset': {
                        borderColor: '#d1d5db',
                      },
                      '&:hover fieldset': {
                        borderColor: '#3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#3b82f6',
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleSaveRefNumber(rowId, params.row)}
                  disabled={isSaving || !refNumberValues[rowId] || refNumberValues[rowId].trim() === ""}
                  sx={{
                    borderRadius: '999px',
                    height: '24px',
                    minWidth: 'unset',
                    px: '9px',
                    fontSize: '11px',
                    textTransform: 'none',
                    background: '#156ee2',
                    border: 'none',
                    boxShadow: 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  Save
                </Button>
                {hasSavedValue && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleCancelEdit(rowId)}
                    disabled={isSaving}
                    sx={{
                      borderRadius: '999px',
                      height: '24px',
                      minWidth: 'unset',
                      px: '9px',
                      fontSize: '11px',
                      textTransform: 'none',
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: 'none',
                      boxShadow: 'none',
                      transition: 'all 0.15s',
                      '&:hover': {
                        background: '#fecaca',
                        boxShadow: '0 0 0 2px #fca5a5',
                        transform: 'translateY(-1px)',
                      },
                      '&:active': { transform: 'scale(0.96)' },
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </>
            )}
          </Box>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params) => {
        const hasRefNumber = params.row.REF_NUMBER && params.row.REF_NUMBER.trim() !== '';
        
        return (
          <Tooltip title={!hasRefNumber ? "Please add Reference Number first (Click Edit button)" : "Move to Onboarding"}>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleOfferLterEmail(params.row)}
              disabled={!hasRefNumber}
              sx={{
                backgroundColor: !hasRefNumber ? '#9ca3af' : '#10b981',
                textTransform: 'none',
                fontSize: '9px',
                '&:hover': {
                  backgroundColor: !hasRefNumber ? '#9ca3af' : '#059669',
                },
              }}
            >
              {!hasRefNumber ? "Add Ref No First" : "Move To Onboarding"}
            </Button>
          </Tooltip>
        );
      }
    }
  ], [ofrList, editingRows, refNumberValues, isSaving, joiningDates]);

  return (
    <Box sx={{
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "12px",
    }}>
      {/* Single HR Selection Dialog - Fixed Version */}
      <Dialog
        open={isHRDialogOpen}
        onClose={() => {
          setIsHRDialogOpen(false);
          setSelectedHR('');
          setCurrentRowData(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            background: 'linear-gradient(to bottom, #ffffff, #fafbfc)',
          }
        }}
      >
        {/* Header with gradient */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px 28px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
            <svg width="120" height="120" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </Box>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: 'white',
            fontSize: '1.25rem',
            letterSpacing: '0.5px'
          }}>
            🚀 Move to Onboarding
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.9)',
            mt: 0.5,
            fontSize: '0.875rem'
          }}>
            Assign MHC HR to manage the onboarding process
          </Typography>
        </Box>

        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                  {/* <Typography variant="caption" color="textSecondary">
                  Case ID: {currentRowData.CHILD_CASEID}
                </Typography> */}
            <Box>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 600,
                color: '#1e293b',
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <span style={{ color: '#ef4444' }}>*</span> Select OnBoarding HR
              </Typography>
              
          

              <FormControl fullWidth>
                <Select
                  value={selectedHR}
                  onChange={(e) => {
                    console.log("Selected value:", e.target.value);
                    setSelectedHR(e.target.value);
                  }}
                  displayEmpty
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    '& .MuiSelect-select': {
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.95rem',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e2e8f0',
                      borderWidth: 2,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                  }}
                  renderValue={(selected) => {
                    if (!selected) {
                      return <Typography color="textSecondary">Choose an HR representative</Typography>;
                    }
                    const selectedHr = hrEmployees.find(hr => hr.EMP_ID === selected);

                    console.log("Selected HR object in render:", selectedHr);
                    if (!selectedHr) return <Typography>Loading...</Typography>;
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 28, 
                          height: 28, 
                          borderRadius: '50%', 
                          bgcolor: '#667eea20',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#667eea">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {selectedHr?.EMP_NAME}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {selectedHr?.EMP_ID}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }}
                >
                  <MenuItem disabled value="">
                    <Typography color="textSecondary">Choose an HR representative</Typography>
                  </MenuItem>
                  {hrEmployees.map((hr) => (
                    <MenuItem 
                      key={hr.EMP_ID} 
                      value={hr.EMP_ID}
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          bgcolor: '#f1f5f9',
                        },
                        '&.Mui-selected': {
                          bgcolor: '#667eea10',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Box sx={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: '50%', 
                          bgcolor: '#667eea15',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#667eea">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a202c' }}>
                            {hr.EMP_NAME}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ID: {hr.EMP_ID}
                          </Typography>
                        </Box>
                        {selectedHR === hr.EMP_ID && (
                          <Box sx={{ color: '#667eea' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                            </svg>
                          </Box>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {!selectedHR && (
                <Typography variant="caption" sx={{ 
                  color: '#ef4444',
                  mt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}>
                  <span>⚠</span> Please select an HR to proceed
                </Typography>
              )}
            </Box>

        
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          px: 3, 
          py: 2.5,
          borderTop: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
          gap: 1.5
        }}>
          <Button
            onClick={() => {
              setIsHRDialogOpen(false);
              setSelectedHR('');
              setCurrentRowData(null);
            }}
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#64748b',
              borderColor: '#e2e8f0',
              px: 3,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                borderColor: '#cbd5e1',
                bgcolor: '#f1f5f9',
              }
            }}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleConfirmMoveToOnboarding}
            variant="contained"
            disabled={!selectedHR}
            startIcon={selectedHR ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> : null}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              px: 4,
              py: 1,
              borderRadius: 2,
              background: selectedHR 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : '#9ca3af',
              boxShadow: selectedHR ? '0 4px 15px rgba(16, 185, 129, 0.4)' : 'none',
              '&:hover': {
                background: selectedHR 
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  : '#9ca3af',
                boxShadow: selectedHR ? '0 6px 20px rgba(16, 185, 129, 0.4)' : 'none',
              },
              '&.Mui-disabled': {
                bgcolor: '#9ca3af',
                color: '#e5e7eb',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {selectedHR ? 'Confirm & Move' : 'Select HR First'}
          </Button>
        </DialogActions>
      </Dialog>

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
          getRowId={(row) => row.CHILD_CASEID}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          rowHeight={40}
          columnHeaderHeight={42}
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
              padding: "0 6px", 
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f1f5f9",
              borderRight: "1px solid #f1f5f9",
              fontSize: "12px",
              color: "#374151",
              padding: "0 6px", 
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

      <Dialog
        open={flowModalOpen}
        onClose={() => setFlowModalOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Approval Flow Details
            </Typography>
            <Chip 
              label={selectedUser?.CHILD_CASEID || ''}
              size="small"
              sx={{ 
                backgroundColor: '#667eea',
                color: 'white',
                fontWeight: 500,
                fontSize: '10px'
              }}
            />
          </Box>
          <IconButton 
            onClick={() => setFlowModalOpen(false)}
            sx={{ 
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
          >
            {/* <CloseIcon /> */}
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ py: 3 }}>
          <HRMView 
            ID={selectedUser?.CHILD_CASEID || selectedUser?.id}
            isMaximized={true}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setFlowModalOpen(false)}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 300,
              backgroundColor: '#667eea',
              '&:hover': { backgroundColor: '#5563d6' }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <OfferLetterModal
        open={offerLetterOpen}
        onClose={() => setOfferLetterOpen(false)}
        candidate={selectedCandidate}
      />
    </Box>
  );
};

export default OfferApproved;