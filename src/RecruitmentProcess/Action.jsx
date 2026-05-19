




import React, { useState, useMemo, useEffect, useContext } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Modal, Autocomplete,IconButton, FormControl, Typography, Button, Paper, Grid, CircularProgress, TextField, InputAdornment, Tooltip, Select, MenuItem, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import 'sweetalert2/dist/sweetalert2.min.css';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend, } from 'chart.js';
import DataFlow from "../Components/DataFlow.jsx"
import { ArrowLeftIcon, BadgeIcon, BriefcaseIcon, CircleAlert, DeleteIcon, InfoIcon, PersonStandingIcon, PhoneIcon, RefreshCw, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../Config/Config.jsx';
import ManPowerView from '../Components/ManPowerView.jsx';
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TransferLetterModal from './TransferLetterModal .jsx';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

import axiosInstance from '../Config/axiosConfig.jsx'

ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

const Actions = () => {
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
    const [selectedPlant, setSelectedPlant] = useState("");

    const [remarks, setRemarks] = useState("");
    const [HrData, setHrData] = useState([]);

    const [emailInputs, setEmailInputs] = useState({});
    const [submitting, setSubmitting] = useState({});
    const [actionTypeSelections, setActionTypeSelections] = useState({});
    const [employeeData, setEmployeeData] = useState([]);
    const [selectedEmpId, setSelectedEmpId] = useState("");

    const [transferOpen, setTransferOpen] = useState(false);
    const [transferRowData, setTransferRowData] = useState(null);
    const [designationData, setDesignationData] = useState([]);
    const [selectedDesignation, setSelectedDesignation] = useState("");
const [letterOpen, setLetterOpen] = useState(false);
    const [plantList, setplantList] = useState([]);
const [transferDate, setTransferDate] = useState('');

const [historyOpen, setHistoryOpen] = useState(false);
const [historyData, setHistoryData] = useState([]);
const [documentUploads, setDocumentUploads] = useState({});
const [uploadingDoc, setUploadingDoc] = useState({});

const [uploadedDocs, setUploadedDocs] = useState({}); 


const [fileError, setFileError] = useState("");


    const [transferData, setTransferData] = useState({
        selectedPlant: '',
        newCaseId: '',
        newDesignation: '',
        newDepartment: '',
    });

    const handleTransferChange = (field, value) => {
        setTransferData(prev => ({
            ...prev,
            [field]: value
        }));
    };




    const handleHistory = async () => {

            const response = await axiosInstance.get(
                    `${API_BASE_URL}/empTrsferGetDt`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            Authorization: `Bearer ${userToken.token}`,
                        },
                    }
                );


    }

    const Employee = async () => {
        try {
            const response = await axiosInstance.get(
                `${API_BASE_URL}/employee-data`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${userToken.token}`,
                    },
                }
            );

            

       

            setEmployeeData(response.data);
        
        } catch (err) {
            console.error("Error fetching employee data", err);
        }
    };

    useEffect(() => {
        Employee()
    }, [userToken.token]);

    const Employee1 = async () => {
        try {
            const response = await axiosInstance.get(
                `${API_BASE_URL}/employee-dept`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${userToken.token}`,
                    },
                }
            );

            setDesignationData(response.data);
        } catch (err) {
            console.error("Error fetching employee data", err);
        }
    };

    useEffect(() => {
        Employee1()
    }, [userToken.token]);

    const selectedEmployee = useMemo(() => {
        if (!selectedEmpId || !Array.isArray(employeeData?.employeeData)) return null;

        return employeeData?.employeeData.find(
            (emp) => String(emp.EMP_ID) == String(selectedEmpId)
        );
    }, [selectedEmpId, employeeData?.employeeData]);


    console.log(selectedEmployee,"teeeeeeeeeee");

    

    const selectedDesignationDept = useMemo(() => {
        if (!selectedDesignation || !Array.isArray(designationData?.employeeData)) return "";

        const found = designationData?.employeeData?.find(
            (item) => item.DESIGNATION == selectedDesignation
        );

        return found?.DEPT || "";
    }, [selectedDesignation, designationData?.employeeData]);

   

    const handleConfirmTransfer = async () => {

        const confirm = await Swal.fire({
            title: 'Confirm Transfer?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1e40af',
            cancelButtonColor: '#dc2626',
            confirmButtonText: '✓ Yes, Transfer',
            cancelButtonText: '✕ Cancel',
            customClass: { container: 'swal-on-top' },
            didOpen: () => { document.querySelector('.swal-on-top').style.zIndex = 99999; },
            allowOutsideClick: false,
        });

        if (!confirm.isConfirmed) return;

    

        const payload = {
            case_id: transferRowData?.CHILD_CASEID || "",
            EMP_ID: selectedEmpId || "",
            to_plant:transferRowData?.PLANT || "",
            transfer_date: transferDate,
            new_department: transferRowData?.DEPT || "",
            new_designation: transferRowData?.JOB_TIT || "",
            remarks: remarks || "",
            
        };



        try {
            const response = await axiosInstance.post(
                `${API_BASE_URL}/empTrsferStr`,
                payload,
                {
                   headers: {
                        Authorization: `Bearer ${userToken.token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            );

   
        
            if (response?.data?.status == 201) {
   
         Swal.fire({
          icon: 'success',
          title: 'Transfer Successful!',
              text: response?.data?.message,
          timer: 1500,
          showConfirmButton: false,
        });
              handleClose();
              
Recuritment()
             




            }



               
            
            else {
              
                await Swal.fire({
                    icon: 'error',
                    title: 'Failed!',
                    text: response?.data?.message || 'Something went wrong',
                    showConfirmButton: false,
                    timer: 2500,
                    customClass: { container: 'swal-on-top' },
                    didOpen: () => {
                        document.querySelector('.swal-on-top').style.zIndex = 99999;
                    },
                });
            }
        } catch (error) {
            console.error('Transfer error:', error);
            Swal.fire({
                title: 'Transfer Failed',
                text: error.response?.data?.message || 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#dc2626',
            });
        }
    };

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
 
    

    useEffect(() => {
        if (!userToken?.token) return;
        Recuritment();
    }, [userToken?.token]);

    useEffect(() => {
        if (Array.isArray(HrData?.TaskAssignmentData)) {
         

        const filtered = (HrData?.TaskAssignmentData || [])
    .filter(row => row.actionStatus == null && row.transfer == null)
    .map((row, index) => ({
        ...row,
        id: row.case_id || `row_${index}`,
    }));

setData(filtered);
setFilteredData(filtered);

            
        } else {
            setData([]);
            setFilteredData([]);
        }
        setLoading(false);
    }, [HrData]);

    useEffect(() => {
        if (!userToken.token) navigate('/');
    }, [navigate, userToken?.token]);

   





const handleFileSelect = (caseId, file) => {
  if (!file) return;

  // ❌ Only PDF check
  if (file.type !== "application/pdf") {
    Swal.fire({
      icon: "error",
      title: "Invalid File",
      text: "Only PDF files are allowed",
      confirmButtonColor: "#2563eb",
    });
    return;
  }

  // ❌ File size check
  if (file.size > 1 * 1024 * 1024) {
    Swal.fire({
      icon: "error",
      title: "File Too Large",
      text: "File size must be less than 1MB",
      confirmButtonColor: "#2563eb",
    });
    return;
  }

  // ✅ If valid
  setDocumentUploads(prev => ({
    ...prev,
    [caseId]: file
  }));
};






const handleActionTypeChange = (caseId, value, rowData) => {
    // Set the selected value first
    setActionTypeSelections(prev => ({ ...prev, [caseId]: value }));

    if (value === 'New') {
        // ✅ Document validation only for "New" action
        if (!uploadedDocs[caseId]) {
            Swal.fire({
                icon: 'warning',
                title: 'File Required',
                text: 'Please upload and save the document before proceeding.',
                confirmButtonColor: '#1e40af',
            });
            // Reset selection
            setActionTypeSelections(prev => ({ ...prev, [caseId]: '' }));
            return;
        }

        const payload = { CHILD_CASEID: caseId };

        Swal.fire({
            title: 'Are you sure?',
            html: `Do you want to move <span style="color: #28a745; font-weight: bold;">Case ID ${caseId}</span> to Recruitment Mail?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, move it!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axiosInstance.post(
                        `${API_BASE_URL}/actns-Frm-Recruits`,
                        payload,
                        {
                            headers: {
                                Authorization: `Bearer ${userToken.token}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    await Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: response.data.message || 'Case moved to Recruitment Mail successfully!',
                        timer: 1500,
                        showConfirmButton: false,
                    });

                    setData(prevData => prevData.filter(item => item.case_id !== caseId));
                    setFilteredData(prevData => prevData.filter(item => item.case_id !== caseId));

                } catch (err) {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Error Action Form',
                        confirmButtonColor: '#ef4444'
                    });
                }
            } else {
                // Reset dropdown if cancelled
                setActionTypeSelections(prev => ({ ...prev, [caseId]: '' }));
            }
        });

    } else if (value === 'Transfer') {
        // ✅ No file check – directly open transfer modal
        setTransferRowData(rowData);
        setTransferOpen(true);
    }
  }
















const handleDocumentUpload = async (caseId) => {


    const file = documentUploads[caseId];
    if (!file) {
        Swal.fire({
            icon: 'warning',
            title: 'No File Selected',
            text: 'Please select a file first',
        });
        return;
    }

    // Confirm upload
    const result = await Swal.fire({
        title: 'Confirm Upload',
        text: `Do you want to Save "${file.name}" for Case ID: ${caseId}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Save!',
    });

    if (!result.isConfirmed) return;

    try {
        // Create FormData
        const formData = new FormData();
        formData.append('caseId', caseId);
        formData.append('hrEvaldocument', file);

  


                for (let pair of formData.entries()) {
            if (pair[1] instanceof File) {
  
                console.log('   - Name:', pair[1].name);
                console.log('   - Type:', pair[1].type);
                console.log('   - Size:', pair[1].size, 'bytes');
                console.log('   - Last Modified:', new Date(pair[1].lastModified).toLocaleString());
            } else {
                console.log(pair[0] + ':', pair[1]);
            }
        }

        // Dummy API call - Replace with your actual API endpoint
        const response = await axiosInstance.post(
            `${API_BASE_URL}/hr-Evalu-File-Updt`, // Replace with your actual endpoint
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userToken.token}`,
                },
            }
        );

        // Handle success
        if (response.data.success || response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: 'Upload Successful!',
                text: 'Document uploaded successfully',
                timer: 1500,
                showConfirmButton: false,
            });

    
const fileURL = URL.createObjectURL(file);
setUploadedDocs(prev => ({ ...prev, [caseId]: fileURL }));
  
            // Clear the uploaded file
      
        }
    } catch (error) {
        console.error('Upload error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: error.response?.data?.message || 'Something went wrong. Please try again.',
        });
    } finally {
        setUploadingDoc(prev => ({ ...prev, [caseId]: false }));
    }
};



  

    useEffect(() => {
        axios
            .get("http://192.168.8.91:8084/inactive/phpapi/plant_api.php")
            .then((res) => {
                setplantList(res.data);
            })
            .catch((err) => {
                console.error("Failed to fetch plant data", err);
            });
    }, []);

    const handleClose = () => {
        setTransferOpen(false);
        setSelectedEmpId('');
        setSelectedPlant('');
        setSelectedDesignation('');
        setRemarks('');
        setTransferRowData(null);
        setTransferData({
            selectedPlant: '',
            newCaseId: '',
            newDesignation: '',
            newDepartment: '',
        });
        if (transferRowData?.CHILD_CASEID) {
            setActionTypeSelections(prev => ({ ...prev, [transferRowData.CHILD_CASEID]: '' }));
        }
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
            text: `Do you want to send the onboarding form link to ${email}?`,
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
                    text: 'Onboarding form link sent to employee email!',
                    timer: 1500,
                    showConfirmButton: false,
                });

                setEmailInputs(prev => ({ ...prev, [caseId]: '' }));

                setData(prevData => prevData.filter(row => row.CHILD_CASEID !== caseId));
                setFilteredData(prevData => prevData.filter(row => row.CHILD_CASEID !== caseId));

                setHrData(prevHrData => ({
                    ...prevHrData,
                    TaskAssignmentData: prevHrData.TaskAssignmentData?.map(row =>
                        row.CHILD_CASEID === caseId
                            ? { ...row, verifyEmail: 'sent' }
                            : row
                    )
                }));
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
            caseId: rowData.CASEID,
            type: type
        });
        setManPowerOpen(true);
    };

    const handleCloseModal = () => {
        setManPowerOpen(false);
        setSelectedRowData(null);
    };


    const handleHistoryClick = async (caseId) => {

      
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/vrfy-Rjct-Hsty-Data/${caseId}`,
      {
        headers: {
          Authorization: `Bearer ${userToken.token}`,
        },
      }
    );

    console.log("History Data:", response.data);

    // Save data to state
    setHistoryData(response?.data?.verifyHistoryData || []);

    // Open modal
    setHistoryOpen(true);

  } catch (error) {
    console.error("History fetch error:", error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch history data",
    });
  }
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


const Hr = HrData?.TaskAssignmentData || [];

console.log("hrrrrrrrrrrrrrrrr",Hr);

const hasTypePlant = Hr.some(row => row.TYPE_PLANT);
const recCycle = Hr.some(row => row.RECRUIT_CYCLE);
const history = Hr.some(row => row.CUR_REV_ID != null);



console.log("historyhistoryhistoryhistory",history);


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
        minWidth:80,
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
          minWidth:120,
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
            field: 'PLANT',
            headerName: 'Plant',
            flex: 1.2,
            minWidth: 160,
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
         minWidth: 160,
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
              
               }}
             >
               {subCode ? `${subCode} - ${value}` : value}
             </Box>
           );
         },
       },


   {
  field: 'DOCUMENT_UPLOAD',
  headerName: 'Interview Evalulation Form',
  flex: 1.5,
  minWidth: 210,
  sortable: false,
  filterable: false,
  renderCell: (params) => {
  const caseId = params.row.CHILD_CASEID;
  const selectedFile = documentUploads[caseId];
  const isUploading = uploadingDoc[caseId];
  const savedFileURL = uploadedDocs[caseId]; // now a URL string, not boolean

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, width: '100%' }}>

      <input
        type="file"
        id={`file-${caseId}`}
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(caseId, e.target.files[0])}
        accept=".pdf,.jpg,.jpeg,.png"
      />

    {/* 👁️ Eye Icon — appears after file is saved */}
{savedFileURL && typeof savedFileURL === 'string' && (
  <Tooltip title="View Document" arrow>
    <IconButton
      size="small"
      onClick={() => window.open(savedFileURL, '_blank')}
      sx={{
        width: 18,
        height: 28,
        borderRadius: '6px',
        bgcolor: '#eff6ff',
        border: '1px solid #bfdbfe',
        color: '#0a772a',
        flexShrink: 0,
        padding: 0,
        '&:hover': {
          bgcolor: '#dbeafe',
          borderColor: '#60a5fa',
        },
      }}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </IconButton>
  </Tooltip>
)}
      {/* Choose File Button */}
      <label htmlFor={`file-${caseId}`} style={{ flex: 1 }}>
        <Button
          component="span"
          variant="outlined"
          size="small"
          startIcon={<span style={{ fontSize: '10px' }}>{selectedFile ? '📎' : '📁'}</span>}
          sx={{
            width: '100%',
            fontSize: '11px',
            padding: '4px 8px',
            textTransform: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            backgroundColor: selectedFile ? '#f0fdf4' : '#f8faff',
            borderColor: selectedFile ? '#22c55e' : '#93c5fd',
            color: selectedFile ? '#15803d' : '#1e2022d8',
            '&:hover': {
              backgroundColor: selectedFile ? '#dcfce7' : '#eff6ff',
              borderColor: selectedFile ? '#16a34a' : '#60a5fa',
            },
          }}
        >
          {selectedFile
            ? selectedFile.name.length > 12
              ? selectedFile.name.substring(0, 12) + '...'
              : selectedFile.name
            : 'Choose File'}
        </Button>
      </label>

      {/* Save Button */}
      {selectedFile && (
        <Button
          size="small"
          variant="contained"
          disabled={isUploading || !!savedFileURL}
          onClick={() => handleDocumentUpload(caseId)}
          sx={{
            minWidth: '45px',
            fontSize: '9px',
            padding: '4px 10px',
            textTransform: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            background: savedFileURL
              ? '#16a34a'
              : isUploading
                ? '#bdbdbd'
                : 'linear-gradient(135deg, #1e40af, #2563eb)',
            boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
            '&:disabled': {
              background: savedFileURL ? '#16a34a' : '#e5e7eb',
              color: 'white',
            },
          }}
        >
          {isUploading ? (
            <CircularProgress size={13} sx={{ color: 'white' }} />
          ) : savedFileURL ? (
            '✅ Saved'
          ) : (
            '💾 Save'
          )}
        </Button>
      )}


    </Box>
  );
},
},

{



    field: 'HISTORY',
    headerName: 'History',
    flex: 0.8,
    minWidth: 200,
   renderCell: (params) => {

  // Hide button if status is null OR CUR_REV_ID is null
  if (params.row.status == null || params.row.CUR_REV_ID == null) {
    return null;
  }

  return (
    <Button
      variant="outlined"
      size="small"
      sx={{
        background: '#1848d8',
        color: 'white',
        fontSize: '11px',
        padding: '3px 30px',
        borderRadius: '4px',
        textTransform: 'capitalize',
        fontWeight: 600,
        minWidth: 'auto',
        boxShadow: 'none',
        '&:hover': {
          background: '#052c96',
          boxShadow: 'none',
        },
      }}
      onClick={() => handleHistoryClick(params.row.CHILD_CASEID)}
    >
      History
    </Button>
  );
}
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
                    Shortlisted
                </Button>
            ),
        },



        {
            field: 'ACTIONS',
            headerName: 'Actions',
            flex: 1.2,
            minWidth: 140,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const selectedValue = actionTypeSelections[params.row.CHILD_CASEID] || '';
                return (
                    <FormControl size="small" sx={{ width: '100%' }}>
                        <Select
                            value={selectedValue}
                            onChange={(e) => handleActionTypeChange(params.row.CHILD_CASEID, e.target.value, params.row)}
                            displayEmpty
                            sx={{
                                height: '32px',
                                fontSize: '12px',
                                borderRadius: '6px',
                                backgroundColor: selectedValue ?
                                    (selectedValue === 'New' ? '#ecfdf5' : '#fff7ed') :
                                    '#f9fafb',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: selectedValue ?
                                        (selectedValue === 'New' ? '#10b981' : '#f97316') :
                                        '#d1d5db',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: selectedValue ?
                                        (selectedValue === 'New' ? '#059669' : '#ea580c') :
                                        '#9ca3af',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: selectedValue ?
                                        (selectedValue === 'New' ? '#10b981' : '#f97316') :
                                        '#667eea',
                                },
                                '& .MuiSelect-select': {
                                    padding: '6px 12px',
                                    fontWeight: selectedValue ? 600 : 400,
                                    color: selectedValue ?
                                        (selectedValue === 'New' ? '#047857' : '#c2410c') :
                                        '#6b7280',
                                },
                            }}
                        >
                            <MenuItem value="" sx={{ fontSize: '12px', color: '#9ca3af' }}>
                                Select Action
                            </MenuItem>
                            <MenuItem
                                value="New"
                                sx={{
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    color: '#047857',
                                    '&:hover': {
                                        backgroundColor: '#ecfdf5',
                                    },
                                }}
                            >
                                🆕 New
                            </MenuItem>
                            <MenuItem
                                value="Transfer"
                                sx={{
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    color: '#c2410c',
                                    '&:hover': {
                                        backgroundColor: '#fff7ed',
                                    },
                                }}
                            >
                                🔄 Transfer
                            </MenuItem>
                        </Select>
                    </FormControl>
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
        <>
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
  rowHeight={50}
  loading={loading}
  columnHeaderHeight={44}

// columnVisibilityModel={{
//   HISTORY: filteredData?.some(
//     (row) => row.status?.trim().toLowerCase() == "reject"
//   ) || false,

//    REVID: filteredData?.some(
//       (row) => row.status?.trim().toLowerCase() == "reject"
//     ) || false

// }}

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

            {/* Transfer Modal - FIXED with stable dimensions */}
  <Modal open={transferOpen} onClose={handleClose}>
  <Box sx={{
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 820, height: 'auto', maxHeight: '85vh',
    bgcolor: '#f8fafc', borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
  }}>

    {/* HEADER */}
    <Box sx={{
      background: 'linear-gradient(135deg, #0b3392 0%, #6c86d9 100%)',
      px: 2, py: 1, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', flexShrink: 0,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Box sx={{
          width: 30, height: 30, borderRadius: '14px',
          bgcolor: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', flexShrink: 0,
        }}>🔄</Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#fff', lineHeight: 1.2 }}>
            Employee Transfer Form
          </Typography>
          <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
            Child CaseID: <span style={{ color: '#93c5fd', fontWeight: 600 }}>{transferRowData?.CHILD_CASEID || 'N/A'}</span>
          </Typography>
        </Box>
      </Box>
      <IconButton onClick={handleClose} size="small" sx={{
        color: '#fff', bgcolor: 'rgba(255,255,255,0.1)',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, flexShrink: 0,
      }}>
        <CloseIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>

    {/* SCROLLABLE BODY */}
    <Box sx={{
      p: 1.5, overflowY: 'auto', flex: 1,
      display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0,
      '&::-webkit-scrollbar': { width: '5px' },
      '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '6px' },
    }}>

      {/* BLOCK 1 — Current Info */}
      <Box sx={{ bgcolor: '#fff', borderRadius: '10px', overflow: 'hidden', border: '2px solid #e2e8f0', flexShrink: 0 }}>
        <Box sx={{
          px: 2, py: 1,
          background: 'linear-gradient(90deg, #f0fdf4, #a6efc0)',
          borderBottom: '1px solid #bbf7d0',
          display: 'flex', alignItems: 'center', gap: 1,
        }}>
          <Box sx={{ width: 26, height: 26, borderRadius: '7px', background: 'linear-gradient(135deg, #eff0ef, #f0f7f3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' ,border: '1px solid #15803d'}}>🏢</Box>
          <Box sx={{ width: 3, height: 14, bgcolor: '#16a34a', borderRadius: '2px' }} />
          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Current Info</Typography>
        </Box>
       <Box sx={{ p: 1 }}>
  <Grid container spacing={0.5}>
    <Grid item xs={2}>
      <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>Child CaseID</Typography>
      <TextField fullWidth size="small" value={transferRowData?.CHILD_CASEID || 'N/A'} InputProps={{ readOnly: true }}
        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', borderRadius: '8px', fontSize: '12px', height: '30px',width: '120px', '& fieldset': { borderColor: '#e2e8f0' } } }} />
    </Grid>
    <Grid item xs={6}>
      <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>To Plant</Typography>
      <TextField fullWidth size="small" value={transferRowData?.PLANT || 'N/A'} InputProps={{ readOnly: true }}
        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', borderRadius: '8px', fontSize: '12px', height: '30px',width: '320px', '& fieldset': { borderColor: '#e2e8f0' } } }} />
    </Grid>
    <Grid item xs={2}>
      <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>Designation</Typography>
      <TextField fullWidth size="small" value={transferRowData?.JOB_TIT || 'N/A'} InputProps={{ readOnly: true }}
        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', borderRadius: '8px', fontSize: '12px', height: '30px',width: '160px', '& fieldset': { borderColor: '#e2e8f0' } } }} />
    </Grid>
    <Grid item xs={2}>
      <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>Department</Typography>
      <TextField fullWidth size="small" value={transferRowData?.DEPT || 'N/A'} InputProps={{ readOnly: true }}
        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', borderRadius: '8px', fontSize: '12px', height: '30px', '& fieldset': { borderColor: '#e2e8f0' } } }} />
    </Grid>
    
  </Grid>
</Box>
      </Box>

      {/* BLOCK 2 — Current Employee Details (FULL WIDTH) */}
{transferRowData && (
  <Box sx={{ width: '100%', bgcolor: '#fff', borderRadius: '10px', overflow: 'hidden', border: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
    
    {/* HEADER - REDUCE HERE: Decrease padding */}
    <Box sx={{
      px: 2, 
      py: 0.5,  // REDUCE: Changed from py: 1 to py: 0.5
      background: 'linear-gradient(90deg, #eff6ff, #bdd3ef)',
      borderBottom: '1px solid #bfdbfe', 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1
    }}>
      {/* REDUCE HERE: Make icon smaller */}
      <Box sx={{ 
        width: 22,  // REDUCE: from 26 to 22
        height: 22, // REDUCE: from 26 to 22
        borderRadius: '6px', // REDUCE: from 7px to 6px
        background: 'linear-gradient(135deg, #eff1f5, #f2f3f6)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '11px', // REDUCE: from 13px to 11px
        border: '1px solid #1d4ed8' 
      }}>👤</Box>
      
      {/* REDUCE HERE: Make divider smaller */}
      <Box sx={{ 
        width: 2,    // REDUCE: from 3 to 2
        height: 12,  // REDUCE: from 14 to 12
        bgcolor: '#2563eb', 
        borderRadius: '2px' 
      }} />
      
      {/* REDUCE HERE: Make text smaller */}
      <Typography sx={{ 
        fontSize: '10px',  // REDUCE: from 11px to 10px
        fontWeight: 700, 
        color: '#1d4ed8', 
        textTransform: 'uppercase', 
        letterSpacing: '0.4px'  // REDUCE: from 0.6px to 0.4px
      }}>
        Transfer Project Details
      </Typography>
    </Box>
    
    {/* MAIN CONTENT - REDUCE HERE: Decrease padding */}
    <Box sx={{ 
      p: 0.5  // REDUCE: from p: 2 to p: 1.5
    }}>

      {/* Row 1: Employee ID + Plant */}
      <Box sx={{ display: 'flex', gap: 2, mb: 0.5 }}>
        
        {/* Employee ID */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* REDUCE HERE: Decrease label bottom margin */}
          <Typography sx={{ 
            fontSize: '11px', 
            fontWeight: 600, 
            color: '#475569', 
            mb: 0.2  // REDUCE: from mb: 0.5 to mb: 0.2
          }}>
            Employee ID <span style={{ color: '#ef4444' }}>*</span>
          </Typography>

          {/* Autocomplete height already 30px - keep as is */}
          <Autocomplete
            size="small"
            fullWidth
            popupIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}

            options={Array.isArray(employeeData?.employeeData) ? employeeData.employeeData : []}
            getOptionLabel={(option) => option ? `${option.EMP_ID} — ${option.EMP_NAME}` : ""}
            value={selectedEmpId ? employeeData?.employeeData?.find(emp => emp.EMP_ID === selectedEmpId) || null : null}
            onChange={(event, newValue) => setSelectedEmpId(newValue ? newValue.EMP_ID : "")}
            isOptionEqualToValue={(option, value) => option.EMP_ID === value?.EMP_ID}
            noOptionsText="No employees found"
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select or Search Employee"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <SearchIcon sx={{ fontSize: 14, color: '#94a3b8', mr: 0.5 }} /> {/* REDUCE: from 16 to 14 */}
                      {params.InputProps.startAdornment}
                    </>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8fafc',
                    borderRadius: '8px',
                    fontSize: '12px',
                    height: '28px', // REDUCE: from 30px to 28px
                    paddingLeft: '4px',
                    '& fieldset': { borderColor: '#cbd5e1' },
                    '&:hover fieldset': { borderColor: '#2563eb' },
                    '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: '2px' },
                  }
                }}
              />
            )}
          />
        </Box>

        {/* Plant */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* REDUCE HERE: Decrease label bottom margin */}
          <Typography sx={{ 
            fontSize: '11px', 
            fontWeight: 600, 
            color: '#475569', 
            mb: 0.2  // REDUCE: from mb: 0.5 to mb: 0.2
          }}> From Plant</Typography>
          
          {/* REDUCE HERE: Decrease TextField height */}
          <TextField 
            fullWidth 
            size="small" 
            value={selectedEmpId && selectedEmployee ? selectedEmployee.SITE_LOC || 'N/A' : ''} 
            InputProps={{ readOnly: true }}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                width: '100%', 
                bgcolor: '#f0f9ff', 
                borderRadius: '8px', 
                fontSize: '12px', 
                height: '28px',  // REDUCE: from 30px to 28px
                '& fieldset': { borderColor: '#bae6fd' } 
              } 
            }} 
          />
        </Box>
      </Box>

      {/* Row 2: Designation + Department + Transfer Date */}
      <Box sx={{ minHeight: 90 }}> {/* REDUCE: from 105 to 90 */}
        {selectedEmpId && selectedEmployee && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            
            {/* Designation */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* REDUCE HERE: Decrease label bottom margin */}
              <Typography sx={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                color: '#475569', 
                mb: 0.2  // REDUCE: from mb: 0.5 to mb: 0.2
              }}>Designation</Typography>
              
              {/* REDUCE HERE: Decrease TextField height */}
              <TextField 
                fullWidth 
                size="small" 
                value={selectedEmployee.DESIGNATION || selectedEmployee.MANPOWER_DESG || 'N/A'} 
                InputProps={{ readOnly: true }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    bgcolor: '#f0f9ff', 
                    borderRadius: '8px', 
                    fontSize: '12px', 
                    height: '28px',  // REDUCE: from 30px to 28px
                    '& fieldset': { borderColor: '#bae6fd' } 
                  } 
                }} 
              />
            </Box>
            
            {/* Department */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* REDUCE HERE: Decrease label bottom margin */}
              <Typography sx={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                color: '#475569', 
                mb: 0.2  // REDUCE: from mb: 0.5 to mb: 0.2
              }}>Department</Typography>
              
              {/* REDUCE HERE: Decrease TextField height */}
              <TextField 
                fullWidth 
                size="small" 
                value={selectedEmployee.DEPT || 'N/A'} 
                InputProps={{ readOnly: true }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    bgcolor: '#f0f9ff', 
                    borderRadius: '8px', 
                    fontSize: '12px', 
                    height: '28px',  // REDUCE: from 30px to 28px
                    '& fieldset': { borderColor: '#bae6fd' } 
                  } 
                }} 
              />
            </Box>
          </Box>
          
        )}
        {/* Row 3: Transfer Date */}
<Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
  <Box sx={{ width: '34%' }}>
    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.2 }}>
      Transfer Date <span style={{ color: '#ef4444' }}>*</span>
    </Typography>
    <TextField 
      fullWidth 
      size="small" 
      type="date"
      value={transferDate || ''} 
      onChange={(e) => setTransferDate(e.target.value)}
      sx={{ 
        '& .MuiOutlinedInput-root': { 
          bgcolor: '#ffffff', 
          borderRadius: '8px', 
          fontSize: '12px', 
          height: '28px',
          '& fieldset': { borderColor: '#77aef2' },
          '&:hover fieldset': { borderColor: '#2563eb' },
          '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: '2px' }
        } 
      }} 
    />
  </Box>
</Box>
      </Box>
    </Box>
  </Box>
)}
      {/* BLOCK 3 — Remarks */}
     <Box sx={{ bgcolor: '#ffffff', borderRadius: '10px', overflow: 'hidden', border: '2px solid #e2e8f0', flexShrink: 0 }}>
  <Box sx={{
    px: 2, py: 1, background: 'linear-gradient(90deg, #ede9fe, #d7cff4)',
    borderBottom: '1px solid #e9d5ff', display: 'flex', alignItems: 'center', gap: 1,
  }}>
    <Box sx={{ width: 26, height: 26, borderRadius: '7px', background: 'linear-gradient(135deg, #f8f7f9, #fefdfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', border: '1px solid #9333ea', }}>📝</Box>
    <Box sx={{ width: 3, height: 14, bgcolor: '#8413ed', borderRadius: '2px' }} />
    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#7e22ce', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
      Remarks <span style={{ color: '#ef4444' }}>*</span>
    </Typography>
  </Box>
  <Box sx={{ p: 2 }}>
    <TextField 
      fullWidth 
      multiline 
      rows={2} 
      size="small" 
      value={remarks} 
      onChange={(e) => setRemarks(e.target.value)}
      placeholder="Enter any remarks or comments..."
      required
      error={!remarks && remarks !== ''}
      helperText={!remarks && remarks !== '' ? 'Remarks is required' : ''}
      sx={{ 
        '& .MuiOutlinedInput-root': { 
          bgcolor: '#faf5ff', 
          borderRadius: '8px', 
          fontSize: '13px', 
          '& fieldset': { borderColor: '#e9d5ff' }, 
          '&:hover fieldset': { borderColor: '#9333ea' }, 
          '&.Mui-focused fieldset': { borderColor: '#9333ea', borderWidth: '2px' },
          '&.Mui-error fieldset': { borderColor: '#ef4444' }
        } 
      }} 
    />
  </Box>
</Box>
    </Box>
<TransferLetterModal 
  open={letterOpen} 
  onClose={() => setLetterOpen(false)}
  employeeData={{
    name: selectedEmployee?.EMP_NAME || '',
    empId: selectedEmployee?.EMP_ID || '',
    designation: selectedEmployee?.DESIGNATION || '',
    fromProject: transferRowData?.SITE_LOC || '',
    toProject: transferRowData?.PLANT || '',
    selectedToProject:selectedEmployee?.SITE_LOC || '',
    remarks: remarks || '', // Add remarks to the letter data
    effectiveDate: transferDate ? new Date(transferDate).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }).replace(/(\d+)/, (d) => {
      const j = d % 10, k = d % 100;
      if (j === 1 && k !== 11) return d + 'st';
      if (j === 2 && k !== 12) return d + 'nd';
      if (j === 3 && k !== 13) return d + 'rd';
      return d + 'th';
    }) : '01st Sep, 2025',
    letterDate: new Date().toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).replace(/(\d+)/, (d) => {
      const j = d % 10, k = d % 100;
      if (j === 1 && k !== 11) return d + 'st';
      if (j === 2 && k !== 12) return d + 'nd';
      if (j === 3 && k !== 13) return d + 'rd';
      return d + 'th';
    })
  }}
/>
    {/* FOOTER */}
  <Box sx={{ px: 2.5, py: 1.2, bgcolor: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 1.2, flexShrink: 0 }}>
  
  <Button 
    onClick={() => {
      if (selectedEmpId  && transferDate && remarks.trim()) {
        setLetterOpen(true);
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Incomplete Data',
          text: 'Please select Employee, Plant, Transfer Date and enter Remarks first',
          timer: 2500,
          showConfirmButton: false
        });
      }
    }} 
    size="small" 
    startIcon={<span>📄</span>}
    disabled={!selectedEmpId || !transferDate || !remarks.trim()}
    sx={{ 
      px: 2.5, 
      borderRadius: '8px', 
      fontSize: '12px', 
      fontWeight: 600, 
      color: !selectedEmpId  || !transferDate || !remarks.trim() ? '#94a3b8' : '#1e40af', 
      border: '1px solid', 
      borderColor: !selectedEmpId  || !transferDate || !remarks.trim() ? '#e2e8f0' : '#bfdbfe', 
      bgcolor: !selectedEmpId  || !transferDate || !remarks.trim() ? '#f1f5f9' : '#eff6ff', 
      textTransform: 'none', 
      '&:hover': { 
        bgcolor: !selectedEmpId  || !transferDate || !remarks.trim() ? '#f1f5f9' : '#dbeafe' 
      }
    }}
  >
    Generate Transfer Letter
  </Button>
  
  <Button onClick={handleClose} size="small" startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
    sx={{ px: 2.5, borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#dc2626', border: '1px solid #fecaca', bgcolor: '#fef2f2', textTransform: 'none', '&:hover': { bgcolor: '#fee2e2', borderColor: '#ef4444' }, transition: 'all 0.2s ease' }}>
    Cancel
  </Button>
  
  <Button 
    onClick={handleConfirmTransfer} 
    disabled={!selectedEmpId  || !transferDate || !remarks.trim()} // Added all validations
    size="small"
    sx={{ px: 3, borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 100%)', color: '#fff', boxShadow: '0 3px 12px rgba(30,64,175,0.35)', '&:hover': { boxShadow: '0 5px 18px rgba(30,64,175,0.5)', transform: 'translateY(-1px)' }, '&:disabled': { background: '#e2e8f0', color: '#94a3b8', boxShadow: 'none' }, transition: 'all 0.18s' }}>
    ✓ Confirm Transfer
  </Button>
</Box>

  </Box>
</Modal>
        </Box>


  <Dialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          }
        }}
      >
        {/* HEADER */}
        <DialogTitle sx={{ m: 0, p: 0 }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #273a66 0%, #1e3a8a 60%, #2563eb 100%)',
            px: 2.5, py: 1.6,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
              <Box
                sx={{
                  width: 46,
                  height: 36,
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.13)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Trash2 size={18} color="white" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '14.5px', color: '#fff', lineHeight: 1.2 }}>
                  Deleted Records History
                </Typography>
                <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>
                  {historyData.length} record{historyData.length !== 1 ? 's' : ''} found
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setHistoryOpen(false)} size="small" sx={{
              color: '#fff', bgcolor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.18)',
              width: 28, height: 28,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
            }}>
              <CloseIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* BODY */}
        <DialogContent sx={{
          p: 0, bgcolor: '#f1f5f9',
          '&::-webkit-scrollbar': { width: '5px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: '6px' },
        }}>
          {historyData.length === 0 ? (
            <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 58, height: 58, borderRadius: '14px',
                background: '#e2e8f0', border: '2px dashed #cbd5e1',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
              }}>📭</Box>
              <Typography sx={{ fontWeight: 700, fontSize: '13.5px', color: '#475569' }}>No Records Found</Typography>
              <Typography sx={{ fontSize: '11.5px', color: '#94a3b8', textAlign: 'center', maxWidth: 220 }}>
                No deleted history records to display.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {historyData.map((item, index) => (
                <Box key={index} sx={{
                  borderRadius: '10px', overflow: 'hidden',
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                  animation: `fadeUp 0.22s ease ${index * 0.05}s both`,
                  '@keyframes fadeUp': {
                    from: { opacity: 0, transform: 'translateY(7px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}>

                  {/* Card top strip */}
                  <Box sx={{
                    px: 1.8, py: 0.8,
                    background: '#f8fafc',
                    borderBottom: '1px solid #e9eef5',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
                        Record #{index + 1}
                      </Typography>
                      <Box sx={{ width: '1px', height: 12, bgcolor: '#cbd5e1' }} />
                      <Typography sx={{ fontSize: '11px', color: '#64748b' }}>ID: {item.verifyDelete_Id}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.6 }}>
                      {[
                        { label: `Case: ${item.caseId}`, bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
                        { label: `Rev: ${item.revisionId}`, bg: '#f5f3ff', border: '#ddd6fe', color: '#6d28d9' },
                      ].map(({ label, bg, border, color }) => (
                        <Chip key={label} label={label} size="small" sx={{
                          height: '19px', fontSize: '10px', fontWeight: 600,
                          bgcolor: bg, border: `1px solid ${border}`, color,
                          borderRadius: '4px', '& .MuiChip-label': { px: 0.8 },
                        }} />
                      ))}
                    </Box>
                  </Box>

                  {/* 5-col field grid */}
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 0,
                    px: 0,
                  }}>
                    {[
                      { emoji: '🏷️', label: 'Case ID', value: item.caseId },
                      { emoji: '👤', label: 'Name', value: item.name },
                      { emoji: '✉️', label: 'Email', value: item.email },
                      { emoji: '📞', label: 'Phone', value: item.Phone },
                      { emoji: '🔏', label: 'Aadhar', value: item.Aadhar },
                      { emoji: '💳', label: 'PAN', value: item.Pan },
                     { 
  emoji: '📅', 
  label: 'Deleted At', 
  value: item.deleted_at 
    ? new Date(item.deleted_at).toLocaleDateString('en-GB') 
    : '' 
},
                      { emoji: '🚫', label: 'Rejected By', value: item.rejected_by },
                       { emoji: '📊', label: 'Revision Status', value: item.RevisionTrackStatus },

                      // { emoji: '🔁', label: 'Revision',    value: item.revisionId },
                      { emoji: '💬', label: 'Remarks', value: item.remarks },
                    ].map(({ emoji, label, value }, i) => (
                      <Box key={label} sx={{
                        px: 1.4, py: 1.1,
                        borderRight: i % 5 !== 4 ? '1px solid #f1f5f9' : 'none',
                        borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background 0.15s',
                        '&:hover': { bgcolor: '#f8fafc' },
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 0.4 }}>
                          <Typography sx={{ fontSize: '12px', lineHeight: 1 }}>{emoji}</Typography>
                          <Typography sx={{
                            fontSize: '9.5px', fontWeight: 700, color: '#94a3b8',
                            textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1,

                            
                          }}>{label}</Typography>
                        </Box>
                        <Typography sx={{
                          fontSize: '12px', fontWeight: 500, color: '#1e293b',
                          lineHeight: 1.35, wordBreak: 'break-word',
                          pl: '19px',
                        }}>
                          {value
                            ? value
                            : <span style={{ color: '#cbd5e1', fontStyle: 'italic', fontSize: '11px' }}>—</span>
                          }
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                </Box>
              ))}
            </Box>
          )}
        </DialogContent>

        {/* FOOTER */}
        <DialogActions sx={{
          px: 2, py: 1.2,
          bgcolor: '#fff',
          borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Typography sx={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
            {historyData.length > 0 ? `Showing ${historyData.length} record(s)` : 'Nothing to display'}
          </Typography>
          <Button
            onClick={() => setHistoryOpen(false)}
            startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
            variant="contained"
            sx={{
              minWidth: 95, borderRadius: '8px', fontSize: '12px',
              fontWeight: 700, textTransform: 'none',
              background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
              boxShadow: '0 3px 10px rgba(15,23,42,0.22)',
              px: 2, py: 0.75,
              '&:hover': {
                background: 'linear-gradient(135deg, #1e293b, #2563eb)',
                transform: 'translateY(-1px)',
                boxShadow: '0 5px 14px rgba(15,23,42,0.3)',
              },
              transition: 'all 0.18s',
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
</>
        
    );

    
    
};

export default Actions;
