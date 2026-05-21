import React, { useState, useMemo, useEffect, useContext } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Paper, Modal, IconButton, Typography, Button, CircularProgress, TextField, InputAdornment, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import 'sweetalert2/dist/sweetalert2.min.css';
import SearchIcon from '@mui/icons-material/Search';
import { Doughnut } from 'react-chartjs-2';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaChartPie } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend, } from 'chart.js';
import DataFlow from "../Components/DataFlow.jsx"

import { ArrowLeftIcon, BriefcaseIcon, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../Config/Config.jsx';

import ManPowerView from '../Components/ManPowerView.jsx';
import axiosInstance from '../Config/axiosConfig.jsx';

ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

const RecruitmentMail = () => {
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
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {})
  const [HrData, setHrData] = useState([]);

  // Load saved emails from localStorage on component mount
  const loadSavedEmails = () => {
    const savedEmails = localStorage.getItem(`recruitment_emails_${userToken?.Email || 'default'}`);
    if (savedEmails) {
      return JSON.parse(savedEmails);
    }
    return {};
  };

  const [emailInputs, setEmailInputs] = useState(() => loadSavedEmails());
  const [submitting, setSubmitting] = useState({});

  // Save emails to localStorage whenever emailInputs changes
  useEffect(() => {
    if (userToken?.Email) {
      localStorage.setItem(
        `recruitment_emails_${userToken.Email}`, 
        JSON.stringify(emailInputs)
      );
    }
  }, [emailInputs, userToken?.Email]);

useEffect(() => {
  if (!userToken?.token) return;

  const Recuritment = async () => {
    try {

      
      const response = await axiosInstance.get(
        `${API_BASE_URL}/task-Assign-GtDta`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${userToken.token}`,
          },
        }
      );


    

      setHrData(response.data);
      console.log("NOTE FOR APPROVAL API DATA:", response.data);
    } catch (err) {
      console.error("Error fetching approval data", err);
    }
  };

  Recuritment();
}, [userToken?.token]);


useEffect(() => {
  if (Array.isArray(HrData?.TaskAssignmentData)) {
  

    const filtered = HrData.TaskAssignmentData


      .filter(row => {
   

        return (
             row.actionStatus == "new" && row.verifyEmail !== "sent"
        );
      })
      .map((row, index) => ({
        ...row,
        id: row.case_id || `row_${index}`,
      }));

    setData(filtered);
    
    // Preserve existing emails when setting filtered data
    setFilteredData(prevFiltered => {
      // If this is the first load, use the filtered data with saved emails
      if (prevFiltered.length === 0) {
        return filtered.map(row => ({
          ...row,
          // Check if we have a saved email for this case
          savedEmail: emailInputs[row.CHILD_CASEID] || null
        }));
      }
      
      // Otherwise, merge existing emails with new data
      const emailMap = new Map();
      prevFiltered.forEach(row => {
        if (row.savedEmail || emailInputs[row.CHILD_CASEID]) {
          emailMap.set(row.CHILD_CASEID, row.savedEmail || emailInputs[row.CHILD_CASEID]);
        }
      });
      
      return filtered.map(row => ({
        ...row,
        savedEmail: emailMap.get(row.CHILD_CASEID) || emailInputs[row.CHILD_CASEID] || null
      }));
    });
  } else {
    setData([]);
    setFilteredData([]);
  }

  setLoading(false);
}, [HrData]);

useEffect(() => {
  if (!userToken.token) navigate('/');
}, [navigate, userToken?.token]);

 

  const handleEmailChange = (caseId, email) => {
    setEmailInputs(prev => ({
      ...prev,
      [caseId]: email
    }));
    
    // Also update the filteredData to reflect the email
    setFilteredData(prev => 
      prev.map(row => 
        row.CHILD_CASEID === caseId 
          ? { ...row, savedEmail: email }
          : row
      )
    );
  };

  const handleSubmitEmail = async (caseId, rowData) => {
  const email = emailInputs[caseId];
  if (!email) {
    Swal.fire('Error', 'Please enter email', 'error');
    return;
  }

  if (!validateEmail(email)) {
    Swal.fire('Error', 'Please enter a valid email address', 'error');
    return;
  }

  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to send the Recruitment form link to ${email}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Send Email',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
  });

  if (!result.isConfirmed) {
    return;
  }

  setSubmitting(prev => ({ ...prev, [caseId]: true }));

  const payload2 = {
    email: email,
    child_caseId: caseId,
    hrEmail: userToken?.Email
  }

  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/emp-email`,
      payload2,
      {
        headers: {
          Authorization: `Bearer ${userToken.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (response.data) {
      Swal.fire({
        title: 'Success!',
        icon: "success",
        text: 'Recruitment form link sent to employee email!',
        timer: 1500,
        showConfirmButton: false,
      });

      setFilteredData(prev =>
        prev.map(row =>
          row.CHILD_CASEID === caseId
            ? { ...row, StatusTrack: "WIP", verifyEmail: "sent", savedEmail: email }
            : row
        )
      );
      
      // Keep email in localStorage
      // Already saved via useEffect
    }
  } catch (error) {
    console.error('Email send error:', error);
    Swal.fire('Error', 'Failed to send email', 'error');
  } finally {
    setSubmitting(prev => ({ ...prev, [caseId]: false }));
  }
};

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleOpenManpower = async (rowData, type) => {
    setSelectedRowData(rowData);
    setProcessAndCaseIdData({
      processname: rowData.PROCESSNAME,
      caseId: row.CASEID,
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


   const hasTypePlant = HrData?.TaskAssignmentData?.some(row => row.TYPE_PLANT);

  const recCycle = HrData?.TaskAssignmentData?.some(row => row.RECRUIT_CYCLE);

  const columns = [
    {
      field: 'SNO',
      headerName: 'S.NO',
      flex: 0.5,
      minWidth: 50,
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
      minWidth: 100,
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
        flex: 1.2,
            minWidth: 80,
        renderCell: (params) => (
          <Box sx={{ color: '#374151' }}>
            {params.value}
          </Box>
        ),
      }]
    : []),

  // ✅ MUST be array
  ...(recCycle
    ? [{
        field: 'RECRUIT_CYCLE',
        headerName: 'Emp Level',
        flex: 1.2,
            minWidth: 120,
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
      headerName: 'Plant',
      flex: 1.2,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },
{
  field: 'DEPT',
  headerName: 'Dept',
  flex: 1,
  minWidth: 140,
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
  headerName: 'Desig/Position',
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
      field: 'RAISER',
      headerName: 'Raiser',
      flex: 1,
      minWidth: 90,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'RAISER_DATE',
      headerName: 'Raiser Dt',
      flex: 1,
      minWidth: 80,
     renderCell: (params) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';

    const parts = dateStr.split('/');
    if (parts.length !== 3) return '';

    const [day, month, year] = parts;

    return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
  };

  return (
    <Box sx={{ color: '#6b7280' }}>
      {formatDate(params.value)}
    </Box>
  );
}
    },
    
    {
      field: 'ACTION_STATUS',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 90,
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
          Shortlisted
        </Button>
      ),
    },
    {
  field: 'verifyEmail',
  headerName: 'Mail Status',
  flex: 0.8,
  minWidth: 120,
  renderCell: (params) => {
    const status = params.row.StatusTrack;

    return (
      <Button
        variant="contained"
        size="small"
        sx={{
          background: status == "WIP" ? '#10b981' : '#522952',
          color: 'white',
          fontSize: '11px',
          padding: '3px 10px',
          borderRadius: '4px',
          textTransform: 'capitalize',
          fontWeight: 600,
          minWidth: 'auto',
          boxShadow: 'none',
        }}
      >
        {status ? 'Email Sent' : 'Pending'}
      </Button>
    );
  },
},
    {
      field: 'USER_EMAIL',
      headerName: 'User Email',
      flex: 1.5,
      minWidth: 180,
      renderCell: (params) => {
        // Use saved email from emailInputs or from row data
        const currentEmail = emailInputs[params.row.CHILD_CASEID] || params.row.savedEmail || '';
        return (
          <Tooltip 
            title={currentEmail || 'No email entered'} 
            arrow 
            placement="top"
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: '#1f2937',
                  fontSize: '12px',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  '& .MuiTooltip-arrow': {
                    color: '#1f2937',
                  },
                },
              },
            }}
          >
            <TextField
              size="small"
              type="email"
              placeholder="Enter email address"
              value={currentEmail}
              onChange={(e) => handleEmailChange(params.row.CHILD_CASEID, e.target.value)}
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
          </Tooltip>
        );
      },
    },
    {
      field: 'ACTIONS',
      headerName: 'Actions',
      flex: 1,
      minWidth: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const isSubmitting = submitting[params.row.CHILD_CASEID] || false;
        const email = emailInputs[params.row.CHILD_CASEID] || params.row.savedEmail || '';
        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => handleSubmitEmail(params.row.CHILD_CASEID, params.row)}
            disabled={isSubmitting || !email}
            sx={{
              background: isSubmitting
                ? '#9ca3af'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              fontSize: '10px',
              padding: '4px 10px',
              borderRadius: '6px',
              textTransform: 'capitalize',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
              minWidth: '90px',
              '&:hover': {
                background: isSubmitting
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                transform: isSubmitting ? 'none' : 'translateY(-1px)',
                boxShadow: isSubmitting ? 'none' : '0 4px 10px rgba(16, 185, 129, 0.4)',
              },
              '&:disabled': {
                background: '#9ca3af',
                color: '#e5e7eb',
              }
            }}
          >
            {isSubmitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CircularProgress size={12} sx={{ color: 'white' }} />
                Sending...
              </Box>
            ) : (
              'Send Email'
            )}
          </Button>
        );
      },
    },
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

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Box sx={{
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "12px",
    }}>
     
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
            getRowId={(row) => row.task_assignment_id}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50]}
            rowHeight={40}
            loading={loading}
            columnHeaderHeight={40}
            slots={{
              loadingOverlay: () => (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50px',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    zIndex: 10,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                    <Typography sx={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>
                      Loading...
                    </Typography>
                  </Box>
                </Box>
              ),
            }}
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
     

      {/* Manpower Modal */}
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
              Case ID: {selectedRowData?.CASEID} | Process: {selectedRowData?.PROCESSNAME}
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
            {processCaseId.type === "view" ? (
              <DataFlow
                processname={processCaseId.processname ?? ""}
                caseId={processCaseId.caseId ?? ""}
                mode={processCaseId.type ?? ""}
              />
            ) : (
              <ManPowerView caseId={processCaseId.caseId ?? ""} />
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default RecruitmentMail;