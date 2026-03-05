




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
  Chip
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
import {API_BASE_URL} from '../Config/Config.jsx';
import OfferLetterModal from './OfferLetterModal';
import { Info, UndoDot } from 'lucide-react';

const OfferLetter = () => {
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
 const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

 const [selectedRejectedRow, setSelectedRejectedRow] = useState(null);

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
  

    const handleViewRejectedDetails = (row) => {
    setSelectedRejectedRow(row);
    setDetailsDialogOpen(true);
  };


 
  const handleOfferLterEmail=async(rowData)=>


  {
    try

    {
      const date_only = joiningDates[rowData.CHILD_CASEID];
    
    if (!date_only) {
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select a joining date before sending the offer letter.',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    // 🔵 Show confirmation dialog
    const confirm = await Swal.fire({
      title: "Confirm Send Email",
      text: `Send offer letter to ${rowData.FIRST_NAME} ${rowData.LAST_NAME}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Send Email",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    // Show loading state
    Swal.fire({
      title: 'Sending Email...',
      text: 'Please wait while we send the offer letter',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
   




        const  payload =
        {
          CHILD_CASEID:rowData.CHILD_CASEID,
          EMAIL     :rowData.EMAIL,
          joiningDate: date_only,
        }

        
      const ofrMailSend = await axios.post(`${API_BASE_URL}/ofr-ltr-issue-mail`,payload,
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
      text: `Offer letter has been sent to ${rowData.EMAIL}`,

      timer: 1500,
      showConfirmButton: false,
    });

    if(fetchOfrData) {
     await  fetchOfrData()
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
  
  //---------------Fetch the Offer Letter from Api--------------//
  const fetchOfrData = async()=>

   
  {

    try
    {
      const ofrdata = await axios.get(`${API_BASE_URL}/offer-issue-list`,
      {
        headers:
        {
            "Accept"       : "application/json",
            "Authorization": `Bearer ${token.token}`,
        }
      })
      setOfferLetterData(ofrdata.data.evcVerifiedData || []);


  console.log(ofrdata,"ofr55555555555555555555");

    }
    catch(err)
    {
      console.error("Error In Fetching Offer List");
    }
  }
  
  //useEffect Calling here ----
useEffect(() => {
  if (token?.token) {
    fetchOfrData();
  }
}, [token?.token]);





  const handleViewOfferLetter = async (user) => {

  try {



 const date_only = joiningDates[user.CHILD_CASEID];


    const payload = {
      CHILD_CASEID: user.CHILD_CASEID,
       joiningDate: date_only,
    };

    const response = await axios.post(
      `${API_BASE_URL}/join-Date-updt`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );


setOfferLetterOpen(true);
    

setSelectedCandidate({ ...user });

  } catch (error) {
    console.error('Assign approver failed:', error);

    await Swal.fire({
      icon: 'error',
      title: 'Something went wrong',
      text:
        error?.response?.data?.message ||
        'Unable to assign approver. Please try again.',
    });
  } finally {
    
  //  setOfferLetterOpen(false);
  }
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


      const handleMoveNextTab = async (row) => {


  try {

     const result = await Swal.fire({
      title: 'Confirm Move',
      text: `Move to the next approval stage?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Move',
      cancelButtonText: 'Cancel'
    });

    // If user cancelled, stop here
    if (!result.isConfirmed) {
      return;
    }
//  setSubmitting(prev => ({ ...prev, [row.CHILD_CASEID]: true }));




    const payload = {
        CHILD_CASEID: row?.CHILD_CASEID,
        RevisionTrackStatus:"Offer Letter"
    
      };

      const response = await axios.post(
       `${API_BASE_URL}/delete-verification-case`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token.token}`,
            "Content-Type": "application/json",
          },
        }
      );



    await Swal.fire({
      icon: "success",
      title: "Moved Successfully!",
      text: `The row is moved to the action tab`,
      timer: 1500,
      showConfirmButton: false,
    });

    if(fetchOfrData) {

  await   fetchOfrData()
    }

  

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

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-GB');
    } catch {
      return dateString;
    }
  };

  const formatNumber = (value) => {
    if (!value || value === 'N/A') return 'N/A';
    return value.toString();
  };

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


          {
                    field: 'CUR_REV_ID',
                    headerName: 'REVID',
                    flex: 1,
                    minWidth: 110,
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
}
,

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


    { field: 'DEPT', headerName: 'Department', flex: 1, minWidth: 120,
  renderCell: (params) => <Box sx={{ color: '#374151', fontWeight: 500 }}>
    {formatNumber(params.value)}</Box> },

    
    {
      field: 'DESIG',
      headerName: 'Designation',
      flex: 1,
      minWidth: 130,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontWeight: 500, fontSize: '12px' }}>
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
      field: 'Date of Joining',
      headerName: 'Date of Joining',
      flex: 1.3,
      minWidth: 170,
      renderCell: (params) => (
        <TextField
          size="small"
          type="date"
          placeholder="Enter Date"
          value={joiningDates[params.row.CHILD_CASEID] || ''}
          onChange={(e) => handleJoiningDateChange(params.row.CHILD_CASEID, e.target.value)}
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
      ),
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
          onClick={() => handleViewRejectedDetails(params.row)}
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

// ofrLetterStatus


 {
      field: 'ofrLetterStatus',
      headerName: 'C.Status',
      width: 100,
      sortable: false,
      renderCell: (params) => (
       <Box sx={{ color: '#374151', fontWeight: 500, fontSize: '12px' }}>
          {params.value}
        </Box>
      ),
    },


       {
  field: 'History',
  headerName: 'History',
  flex: 0.5,
  minWidth: 70,
  sortable: false,
  filterable: false,
  renderCell: (params) => {
    return (
      <Tooltip title="View History">
        <IconButton
          size="small"
          onClick={() => handleViewRejectedDetails(params.row)} // Fixed: arrow function
          sx={{
            padding: '4px',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
            },
          }}
        >
          <UndoDot fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  },
},


      {
   
         field: 'ACTIONTAB',
   
         headerName: 'Action Tab',
   
         flex: 1,
   
         minWidth: 110,
   
         sortable: false,
   
         filterable: false,
   
         renderCell: (params) => {
   
           // const isSubmitting = submitting[params.row.CASEID] || false;
   
           return (
   
             <Button
   
               variant="contained"
   
               size="small"
   
           onClick={() => handleMoveNextTab(params.row)}
   
        
   
   
               sx={{
   
                 // background: isSubmitting
   
                 //   ? '#9ca3af'
   
                 //   : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
   
                 color: 'white',
   
                 fontSize: '9px',
   
                 padding: '4px 10px',
   
                 borderRadius: '6px',
   
                 textTransform: 'capitalize',
   
                 boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
   
                 minWidth: '90px',
   
                 // '&:hover': {
   
                 //   background: isSubmitting
   
                 //     ? '#9ca3af'
   
                 //     : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
   
                 //   transform: isSubmitting ? 'none' : 'translateY(-1px)',
   
                 //   boxShadow: isSubmitting ? 'none' : '0 4px 10px rgba(16, 185, 129, 0.4)',
   
                 // },
   
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


       


       

    {
  field: 'actions',
  headerName: 'Actions',
  width: 120,
  sortable: false,
  renderCell: (params) => (
    <Tooltip title="Send Email">
      <Button
        size="small"
        variant="contained"
        onClick={() => handleOfferLterEmail(params.row)}
        sx={{
          backgroundColor: '#10b981',
          textTransform: 'none',
          fontSize: '12px',
          '&:hover': {
            backgroundColor: '#059669',
          },
        }}
      >
        Send Email
      </Button>
    </Tooltip>
  ),
}
  ], [joiningDates]);


    const RejectedDetailsDialog = ({ open, onClose, data }) => {
    if (!data) return null;
    
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          bgcolor: '#ef4444', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Info /> Rejected Candidate Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', borderBottom: '1px solid #e5e7eb', pb: 1 }}>
              <Typography sx={{ width: '150px', fontWeight: 600, color: '#4b5563' }}>Case ID:</Typography>
              <Typography sx={{ color: '#111827' }}>{data.CHILD_CASEID}</Typography>
            </Box>
         
      
            <Box sx={{ display: 'flex', borderBottom: '1px solid #e5e7eb', pb: 1 }}>
              <Typography sx={{ width: '150px', fontWeight: 600, color: '#4b5563' }}>Candidate Status:</Typography>
              <Typography sx={{ color: '#111827', fontStyle: 'italic' }}>
                {data?.ofrLetterStatus || 'No remarks provided'}
              </Typography>
            </Box>
       
            <Box sx={{ display: 'flex', borderBottom: '1px solid #e5e7eb', pb: 1 }}>
              <Typography sx={{ width: '150px', fontWeight: 600, color: '#4b5563' }}>Candidate Remarks:</Typography>
              <Typography sx={{ color: '#111827', fontStyle: 'italic' }}>
                {data?.cand_aprvl_remarks
 || 'No remarks provided'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', borderBottom: '1px solid #e5e7eb', pb: 1 }}>
              <Typography sx={{ width: '150px', fontWeight: 600, color: '#4b5563' }}>Joining Date:</Typography>
              <Typography sx={{ color: '#111827' }}>
                {data.joiningDate ? new Date(data.joiningDate).toLocaleDateString('en-GB') : 'Not set'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', borderBottom: '1px solid #e5e7eb', pb: 1 }}>
              <Typography sx={{ width: '150px', fontWeight: 600, color: '#4b5563' }}>Modify Date:</Typography>
              <Typography sx={{ color: '#111827' }}>
                {data.modifyDate ? new Date(data.modifyDate).toLocaleDateString('en-GB') : 'Not set'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
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
        
        {/* Compact Search bar matching RecruitmentMail */}
        {/* <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1, maxWidth: '400px' }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search name, email, case ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#667eea', fontSize: '20px' }} />
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
          
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                height: '38px',
                fontSize: '13px',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                },
              },
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
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="verified">Verified</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          
          <Typography variant="body2" sx={{
            color: '#64748b',
            minWidth: 'fit-content',
            fontWeight: 500,
            fontSize: '13px'
          }}>
            {filteredData.length} offer letters
          </Typography>
        </Box> */}

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

            columnVisibilityModel={{
  ACTIONTAB: filteredData?.some(
    (row) => row?.ofrLetterStatus?.trim().toLowerCase() == "reject"
  ) || false,


}}
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
      </Paper>

      <OfferLetterModal
        open={offerLetterOpen}
        onClose={() => setOfferLetterOpen(false)}
        candidate={selectedCandidate}
      />

       <RejectedDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        data={selectedRejectedRow}
      />
    </Box>
  );
};

export default OfferLetter;