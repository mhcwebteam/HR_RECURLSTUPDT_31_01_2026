




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
  DialogActions
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
  const [ofrList,setOfferLetterData]=useState([]);






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
  
 
  const handleOfferLterEmail=async (rowData)  =>


  {
    try
    {
      const confirm = await Swal.fire({
          title: "Are you sure?",
          text: "You want to Move OnBoarding?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, Send",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#2563eb",
        });
        if (!confirm.isConfirmed) return;

        const  payload =
        {
          CHILD_CASEID: rowData.CHILD_CASEID,
       

       
        }
      const ofrMailSend = await axiosInstance.post(`${API_BASE_URL}/move-To-OnBoard`,payload,
        {
        headers:
        {
           "Content-Type" :"application/json",
           "Accept"       :"application/json",
           "Authorization":`Bearer ${token.token}`
         }})

      
      if (ofrMailSend.data.message) 
        {
       

    await Swal.fire({
      icon: "success",
      title: "Success",
      text: "Move to OnBoarding!",
      timer: 1500,
      showConfirmButton: false,
    });

    if(fetchOfrData) {
      await fetchOfrData()
    }
           
         } else {
           await Swal.fire("Failed", response.data.message, "error");
         }
       } catch (error) {
         console.error(error);
         await Swal.fire(
           "Error",
           error.response?.data?.message || "Something went wrong",
           "error"
         );
       }
  }
  

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



  const handleViewOfferLetter = (user) => 
  {
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
        padding: '4px 10px',  // Reduced vertical padding
        borderRadius: '6px',
        fontSize: '10px',  // Smaller font
        fontWeight: 600,
        textTransform: 'capitalize',
        lineHeight: 1.2,  // Tighter line height
        height: '25px',  // Fixed small height
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

  const handleStatusChange = (updateData) => {
    console.log('Status updated:', updateData);
  };


  const formatDate = (dateStr) => {
  if (!dateStr) return null;

  let [day, month, year] = dateStr.split('-');

  // ✅ Ensure 2-digit format
  day = day.padStart(2, '0');
  month = month.padStart(2, '0');

  return new Date(`${year}-${month}-${day}`);
};


  const formatNumber = (value) => {
    if (!value || value === 'N/A') return 'N/A';
    return value.toString();
  };

console.log("fgfff",ofrList);

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
                
                  // ✅ MUST be array
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
      field: 'HR',
      headerName: 'HR',
      width: 100,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: 'DIRECTOR',
      headerName: 'DIRECTOR',
      width: 110,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: 'EVC',
      headerName: 'EVC',
      width: 100,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: 'STATUS',
      headerName: 'Overall Status',
      flex: 0.9,
      minWidth: 120,
      renderCell: (params) => getStatusChip(params.value),
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
}

,
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
  field: 'actions',
  headerName: 'Actions',
  width: 120,
  sortable: false,
  renderCell: (params) => (
    <Tooltip title="Move to Onboarding">
      <Button
        size="small"
        variant="contained"
        onClick={() => handleOfferLterEmail(params.row)}
        sx={{
          backgroundColor: '#10b981',
          textTransform: 'none',
          fontSize: '9px',
          '&:hover': {
            backgroundColor: '#059669',
          },
        }}
      >
    Move To Onboarding
      </Button>
    </Tooltip>
  ),
}
  ], [joiningDates]);

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
            paginationModel={paginationModel}
            getRowId={(row) => row.CHILD_CASEID}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50]}
        rowHeight={40}
            columnHeaderHeight={42}
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": 
              {
                borderBottom: "2px solid #e2e8f0",
              },
              "& .MuiDataGrid-columnHeader": 
              {
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
     

      <OfferLetterModal
        open={offerLetterOpen}
        onClose={() => setOfferLetterOpen(false)}
        candidate={selectedCandidate}
      />
    </Box>
  );
};

export default OfferApproved;