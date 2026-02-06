





import { useState, useEffect, useContext, useMemo } from 'react';

import axios from 'axios';

import { API_BASE_URL } from '../Config/Config.jsx';

import CandidateApprovalFileModal from './CandidateApprovalFileModal.jsx';

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

  CircularProgress

} from '@mui/material';

import {

  Search,

  CheckCircle,

  Cancel,

  Visibility,

  Refresh

} from '@mui/icons-material';

import { DataGrid } from '@mui/x-data-grid';

import { ContextData } from '../Context/ContextData';

import CandidateStackDetailsModal from './CandidateStackDetailsModal';
import Swal from 'sweetalert2';



const CandidateApproval = () => {

  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState('all');

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [submitting, setSubmitting] = useState({});

  const { personalData } = useContext(ContextData);

  const [candidgetData, setCandidAprvlData] = useState([]);

  const [token, userToken] = useState(() => {

    const authToken = JSON.parse(localStorage.getItem("userInfo"));

    return authToken ? authToken : null

  })

  const [fileModalOpen, setFileModalOpen] = useState(false);

  const [selectedFileUrl, setSelectedFileUrl] = useState(null);




  

  const candidAprvlGetData = async () => {

    try {

      const candidData = await axios.get(

        `${API_BASE_URL}/get-cand-aprvl`,

        {

          headers:

          {

            Accept: "application/json",

            Authorization: `Bearer ${token?.token}`,

          },

        }

      );

      const apiData = candidData?.data?.candidVerifiedData;

      // 🔥 normalize to array

      setCandidAprvlData(

        Array.isArray(apiData) ? apiData : [apiData]

      );

   

    } catch (err) {

      console.error(

        "Error In Getting Candid Approval Data:",

        err.response?.data || err.message

      );

    }

  };



  //------------------UseEffect----------------------//

  useEffect(() => {

    if (token?.token) {

      candidAprvlGetData();

    }

  }, [token]);


 



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
 setSubmitting(prev => ({ ...prev, [row.CHILD_CASEID]: true }));



    const payload = {

      CHILD_CASEID: row.CHILD_CASEID,
    };

    const response = await axios.post(
      `${API_BASE_URL}/candToNoteAprvl`,
      payload,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token?.token}`,
        },
      }
    );



    await Swal.fire({
      icon: "success",
      title: "Moved Successfully!",
      text: `The row is moved to the next approval stage`,
      timer: 1500,
      showConfirmButton: false,
    });

    if(candidAprvlGetData) {

  await   candidAprvlGetData()
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



  const filteredData = useMemo(() => {

    if (!candidgetData || candidgetData?.length === 0) return [];


    let result = candidgetData.filter(user =>

      user.candidate_aprvl_stage == null 

    



    );

 



    // 2. Search Term Filter

    if (searchTerm) {

      result = result.filter(user =>

      (user.NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||

        user.EMAIL?.toLowerCase().includes(searchTerm.toLowerCase()))

      );

    }



    // 3. Status Filter

    if (statusFilter !== 'all') {

      result = result.filter(user => user.CANDID_APPROVAL_STATUS === statusFilter);

    }




    // Final Map

    return result.map((item, index) => ({

      id: item.id || `row-${index}`,

      SNO: index + 1,

      CHILD_CASEID: item.CHILD_CASEID || 'N/A',

      PLANT: item.PLANT || 'N/A',

      NAME: item.NAME || 'N/A',

      EMAIL: item.EMAIL || 'N/A',

      DEPT: item.DEPT || 'N/A',

      // Ikkada NULL unte frontend lo 'Pending' chupinchadam safe

      STATUS: item.CANDID_APPROVAL_STATUS || 'pending',

      REMARKS: item.CANDID_REMARKS || 'No remarks',

      CANDID_APPROVAL_STATUS: item.CANDID_APPROVAL_STATUS || 'pending',

      CANDID_REMARKS: item.CANDID_REMARKS || 'No remarks',

      cand_aprvl_file: item.cand_aprvl_file,

      candidate_aprvl_stage: item.candidate_aprvl_stage

    }));

  }, [candidgetData, searchTerm, statusFilter]);




  const getStatusChip = (status) => {

    const statusValue = status?.toLowerCase();

    const config = {

      verified: { color: '#10b981' },

      pending: { color: '#f59e0b' },

      rejected: { color: '#ef4444' },

      uploaded: { color: '#3b82f6' },

      'not uploaded': { color: '#6b7280' }

    };

    const { color, icon } = config[statusValue] || config.pending;

    return (

      <Box sx={{

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        height: '100%'

      }}>

        <Box sx={{

          color: '#ffffff',

          backgroundColor: color,

          padding: '4px 10px',

          borderRadius: '6px',

          fontSize: '10px',

          height: '25px',

          fontWeight: 600,

          textTransform: 'capitalize',

          display: 'flex',

          alignItems: 'center',

          gap: '4px'

        }}>

          {icon}

          {statusValue?.charAt(0).toUpperCase() + statusValue?.slice(1) || 'Pending'}

        </Box>

      </Box>

    );

  };



  const handleViewDetails = (user) => {

    if (!user.cand_aprvl_file) {

      alert("No file uploaded");

      return;

    }

    setSelectedFileUrl(user.cand_aprvl_file);

    setFileModalOpen(true);

  };



  const handleStatusChange = (updateData) => {

    console.log('Status updated:', updateData);

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

      field: 'PLANT',

      headerName: 'Plant Name',

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

      field: 'NAME',

      headerName: 'Name',

      flex: 1,

      minWidth: 140,

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

      field: 'CANDID_APPROVAL_STATUS',

      headerName: 'Candidate Status',

      flex: 0.9,

      minWidth: 120,

      renderCell: (params) => getStatusChip(params.value),

    },

    {

      field: 'CANDID_REMARKS',

      headerName: 'Remarks',

      flex: 1,

      minWidth: 120,

      renderCell: (params) => (

        <Box sx={{ color: '#6b7280', fontSize: '12px' }}>

          {params.value}

        </Box>

      ),

    },

    {

      field: 'View',

      headerName: 'View Details',

      width: 100,

      sortable: false,

      renderCell: (params) => (

        <Tooltip title="View Details">

          <IconButton

            size="small"

            onClick={() => handleViewDetails(params.row)}

            sx={{

              color: '#3b82f6',

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

      field: 'ACTIONS',

      headerName: 'Actions',

      flex: 1,

      minWidth: 110,

      sortable: false,

      filterable: false,

      renderCell: (params) => {

        const isSubmitting = submitting[params.row.CASEID] || false;

        return (

          <Button

            variant="contained"

            size="small"

        onClick={() => handleMoveNextTab(params.row)}

     


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

              'Move to Next Tab'

            )}

          </Button>

        );

      },

    },

  ], [submitting]);



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

              placeholder="Search name, email..."

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

            {filteredData.length} candidate approvals

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

          rowHeight={40}

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



      <CandidateApprovalFileModal

        open={fileModalOpen}

        onClose={() => setFileModalOpen(false)}

        fileUrl={selectedFileUrl}

      />



      <CandidateStackDetailsModal

        open={modalOpen}

        onClose={() => setModalOpen(false)}

        data={selectedUser}

        onStatusChange={handleStatusChange}
           note = ""
      />

    </Box>

  );

};



export default CandidateApproval;