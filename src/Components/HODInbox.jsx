


import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Paper, Modal, IconButton, Typography, Button, CircularProgress, TextField, InputAdornment, Tooltip, Menu, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import 'sweetalert2/dist/sweetalert2.min.css';
import SearchIcon from '@mui/icons-material/Search';
import { ArrowLeftIcon, BriefcaseIcon, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../Config/Config.jsx';

const AssignToMenu = ({ row, hrEmployees, userToken, onAssignmentComplete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedName, setSelectedName] = useState('');


  
  const handleClick = (event) => {
    event.stopPropagation(); 
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };


  const handleSelect = async (employee) => {
    
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Are you sure you want to assign ${employee.Emp_Name} to HR?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
  });

  
  if (!result.isConfirmed) return;

  try {
    const response = await axios.post(
      `${API_BASE_URL}/task-Assign-StoreData`,
      {
        case_id: row.CHILD_CASEID,
        assigned_to: employee.Emp_Name,
        legacy_id: employee.Legacy_Id,
        current_task: "HR",
        status: "Pending",
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${userToken.token}`,
        },
      }
    );

    const message =
      response.data?.message || `Case assigned to ${employee.Emp_Name}`;

    setSelectedName(employee.Emp_Name);
    handleClose();

    // ✅ Success alert
    await Swal.fire({
      icon: "success",
      title: "Assigned!",
      text: message,
      timer: 1500,
      showConfirmButton: false,
    });

    // ✅ Refresh parent data
    if (onAssignmentComplete) {
      await onAssignmentComplete();
    }
  } catch (error) {
    console.error("Assignment failed:", error.response?.data || error);

    Swal.fire({
      title: 'Error',
      text: error.response?.data?.message || 'Assignment failed',
      icon: 'error',
      confirmButtonColor: '#ef4444',
    });
  }
};

  
  return (
    <div>
      <Button
        variant="contained"
        size="small"
        onClick={handleClick}
        sx={{
          background: '#667eea',
          color: 'white',
          fontSize: '11px',
          padding: '4px 12px',
          borderRadius: '6px',
          textTransform: 'none',
          minWidth: '100px',
          '&:hover': {
            background: '#5a67d8',
          }
        }}
      >
        {selectedName || 'Assign To'} ▼
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxHeight: '200px',
            overflow: 'auto',
            minWidth: '200px',
          }
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {hrEmployees && hrEmployees.length > 0 ? (
          hrEmployees.map((employee, index) => (
            <MenuItem 
              key={`${employee.Emp_Name}_${index}_${row.CHILD_CASEID}`}
              onClick={() => handleSelect(employee)}
              sx={{
                fontSize: '12px',
                padding: '6px 16px',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                }
              }}
            >
              {employee.Emp_Name} ({employee.Legacy_Id})
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled sx={{ fontSize: '12px', padding: '6px 16px' }}>
            <CircularProgress size={14} sx={{ mr: 1 }} />
            Loading...
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

const HODInbox = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [manpowerOpen, setManPowerOpen] = useState(false);
  const [processCaseId, setProcessAndCaseIdData] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  const [emailInputs, setEmailInputs] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [hrData, setHrData] = useState([]);
  const [hrEmployees, setHrEmployees] = useState([]);

  // Fetch HR employees list
  useEffect(() => {
    if (!userToken?.token) return;

    const fetchHrEmployees = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/mhc-hr-list`,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${userToken.token}`,
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
  }, [userToken?.token]);

  const onBoarding = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/hr_requisition_list`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${userToken.token}`,
          },
        }
      );

      setHrData(response.data.data);
      console.log("NOTE FOR APPROVAL API DATA:", response.data);
    } catch (err) {
      console.error("Error fetching approval data", err);
    }
  };

  useEffect(() => {
    if (!userToken?.token) return;
    onBoarding();
  }, [userToken?.token]);

  const handleEmailChange = (caseId, email) => {
    setEmailInputs(prev => ({
      ...prev,
      [caseId]: email
    }));
  };

  // const handleSubmitEmail = async (caseId, rowData) => {
  //   const email = emailInputs[caseId];
  //   if (!email) {
  //     Swal.fire('Error', 'Please enter email', 'error');
  //     return;
  //   }

  //   if (!validateEmail(email)) {
  //     Swal.fire('Error', 'Please enter a valid email address', 'error');
  //     return;
  //   }

  //   const result = await Swal.fire({
  //     title: 'Are you sure?',
  //     text: `Do you want to send the onboarding form link to ${email}?`,
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes, Send Email',
  //     cancelButtonText: 'Cancel',
  //     confirmButtonColor: '#10b981',
  //     cancelButtonColor: '#6b7280',
  //   });

  //   if (!result.isConfirmed) {
  //     return;
  //   }

  //   setSubmitting(prev => ({ ...prev, [caseId]: true }));


  //   const payload2 = {
  //     email: email,
  //     child_caseId: caseId,
  //   }

  //   try {
  //     const response = await axios.post(
  //       `${API_BASE_URL}/emp-email`,
  //       payload2,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${userToken.token}`,
  //           "Content-Type": "application/json",
  //           Accept: "application/json",
  //         },
  //       }
  //     );
   

  //     if (response.data) {
   

  //             await Swal.fire({
  //                     icon: "success",
  //                     text: 'Onboarding form link sent to employee email!',
                    
  //                     timer: 1500,
  //                     showConfirmButton: false,
  //                   });
  //       setEmailInputs(prev => ({ ...prev, [caseId]: '' }));

        
  //     }
  //   } catch (error) {
  //     console.error('Email send error:', error);
  //     Swal.fire('Error', 'Failed to send email', 'error');
  //   } finally {
  //     setSubmitting(prev => ({ ...prev, [caseId]: false }));
  //   }
  // };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleOpenManpower = async (rowData, type) => {
    setSelectedRowData(rowData);
    setProcessAndCaseIdData({
      processname: rowData.PROCESSNAME,
      caseId: rowData.CHILD_CASEID,
      type: type
    });
    setManPowerOpen(true);
  };

  const handleCloseModal = () => {
    setManPowerOpen(false);
    setSelectedRowData(null);
  };

  const statusCounts = useMemo(() => {
    const counts = {
      total: filteredData.length,
      completed: 0,
      pending: 0,
      rejected: 0
    };
    filteredData.forEach(row => {
      const status = row.ACTION_STATUS?.toLowerCase();
      if (status === 'completed') {
        counts.completed++;
      } else if (status === 'pending' || status === 'to_do') {
        counts.pending++;
      } else if (status === 'rejected') {
        counts.rejected++;
      }
    });
    return counts;
  }, [filteredData]);

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
      field: 'CASEID',
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
      field: 'CHILD_CASEID',
      headerName: 'CHILD CASEID',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 500, color: '#1f2937' }}>
          {params.value}
        </Box>
      ),
    },

     {
      field: 'PLANT',
      headerName: 'Plant',
      flex: 1.2,
      minWidth: 140,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'DEPT',
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
      headerName: 'Designation',
      flex: 1.2,
      minWidth: 130,
      renderCell: (params) => (
        <Box sx={{
          color: '#374151',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
        }}>
          {params.value || 'N/A'}
        </Box>
      ),
    },
    {
      field: 'RAISER',
      headerName: 'Raiser',
      flex: 1,
      minWidth: 110,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'RAISER_DATE',
      headerName: 'Raiser Date',
      flex: 1,
      minWidth: 110,
      renderCell: (params) => (
        <Box sx={{ color: '#6b7280' }}>
          {params.value ? new Date(params.value).toLocaleDateString('en-GB') : ''}
        </Box>
      ),
    },
   
 
    {
      field: 'ACTION_STATUS',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          sx={{
            background: '#10b981',
            color: 'white',
            fontSize: '11px',
            padding: '3px 10px',
            borderRadius: '4px',
            textTransform: 'capitalize',
            fontWeight: 600,
            minWidth: 'auto',
            boxShadow: 'none',
            '&:hover': {
              background: '#059669',
              boxShadow: 'none',
            },
          }}
        >
          Approved
        </Button>
      ),
    },
    {
      field: 'ACTIONS',
      headerName: 'Actions',
      flex: 1,
      minWidth: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <AssignToMenu 
          row={params.row}
          hrEmployees={hrEmployees}
          userToken={userToken}
          onAssignmentComplete={onBoarding}
        />
      ),
    }
  ];

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '1200px',
    bgcolor: '#ffffff',
    border: 'none',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    p: 0,
    maxHeight: '80vh',
    overflow: 'hidden'
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
        <Box sx={{
          width: "100%",
          borderRadius: "10px",
          overflow: "hidden",
          border: "1px solid #dfe5f1ff",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        }}>
          <DataGrid
            rows={hrData}
            columns={columns}
            getRowId={(row) => `${row.SNO}_${row.CHILD_CASEID}`}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50]}
            rowHeight={42}
            columnHeaderHeight={44}
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

      <Modal open={manpowerOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Box sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}>
            <Typography variant="h6" sx={{
              fontWeight: 600,
              fontSize: '16px',
              flex: 1,
              textAlign: 'center',
            }}>
              Case ID: {selectedRowData?.CHILD_CASEID} 
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
                ml: 1,
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{
            padding: '20px',
            maxHeight: 'calc(80vh - 80px)',
            overflowY: 'auto',
            backgroundColor: '#f8fafc',
          }}>
            <Typography>Case details would be shown here</Typography>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default HODInbox;