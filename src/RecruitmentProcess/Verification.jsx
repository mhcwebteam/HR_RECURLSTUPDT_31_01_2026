

import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
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
import VerificationDetailsModal from './VerificationDetailsModal';
import axios from 'axios';
import { API_BASE_URL } from '../Config/Config';
import Swal from 'sweetalert2';

const Verification = () => 
{
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});


const [personalData, setPersonalData] = useState([]);




  const EmpVerify = async () => {
    if (!userToken?.token) return;

 
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-verify-data`, {
        headers: { Authorization: `Bearer ${userToken.token}` },
      });

      console.log("ressssssssssssss",response.data.data);
      setPersonalData(response.data?.data || []);
    } catch (err) {
      console.error("Error fetching verify data", err);
      setPersonalData([]);
    }
  };

  useEffect(() => {
    EmpVerify(); // Call EmpVerify within useEffect
  }, [userToken?.token]);


  
  const filteredData = useMemo(() => 
  {
    if (!personalData || personalData.length === 0) return [];
    let result = [...personalData];



    result = result.filter(item => item.verification_status !== "1");


    if (searchTerm) {
      result = result.filter(user =>
        (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.child_caseid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter !== 'all') 
    {
      result = result.filter(user => user.status === statusFilter);
    }

   
    return result.map((item, index) => ({
      id: item.id || `row-${index}`,
      SNO: index + 1,
      Verification_Id: item.Verification_Id,
      CHILD_CASEID: item.child_caseid || 'N/A',
      PLANT: item.plant || 'N/A', 
      NAME: item.name || 'N/A',
      EMAIL: item.email || 'N/A',
      ADDRESS: item.address || 'N/A',
      DEPT: item.DEPT || "N/A",
      PHONE_NUMBER: item.phone_number || 'N/A',
      DOB: item.dob || 'N/A',
      AADHAR_NUM: item.aadhar_number || 'N/A',
   STATUS: item.status,
         verification_status: item.verification_status,
      PAN_NUM: item.pan_number || 'N/A',
      SSC_MARKS: item.ssc_marks || 'N/A',
      INTER_MARKS: item.inter_marks || 'N/A',
      BTECH_MARKS: item.btech_marks || 'N/A',
      PG_MARKS: item.pg_marks || 'N/A',
      CURRENT_CTC: item.current_ctc || 'N/A',
      EXP_CTC: item.expected_ctc || 'N/A',
      OFFER_CTC: item.offer_ctc || 'N/A',
      NOTICE_PERIOD: item.notice_period || 'N/A',
      PREVIOUS_COMPANY: item.previous_company || 'N/A',
      DURATION: item.duration || 'N/A',
      remarks: item.remarks || 'No remarks',
      submitted_date: item.created_at || 'N/A',
      documents: item.documents || {},
 experienceData: item.experienceData || {}

    }));
  }, [personalData, searchTerm, statusFilter]);
  const getStatusChip = (status) => {
    
    const config = {
      verified: { color: '#10b981'},
      pending:  { color: '#f59e0b' },
      rejected: { color: '#ef4444'},
      uploaded: { color: '#3b82f6'},
      'not uploaded': { color: '#6b7280'}
    };
    const { color, icon } = config[status] || config.pending;
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
          fontWeight: 600,
          textTransform: 'capitalize',
          display: 'flex',
          height: '25px',
          alignItems: 'center',
          gap: '4px'
        }}>
          {icon}
          {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
        </Box>
      </Box>
    );
  };
  const handleViewDetails = (user) => {


    setSelectedUser(user);
    setModalOpen(true);
  };
  const handleStatusChange = async (updateData) => {
    const result = await Swal.fire({
    title: "Confirm Status Change",
    text: "Are you sure you want to update the verification status?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Update!",
    cancelButtonText: "No, Cancel"
  });

  // ✅ IF USER CLICKS "NO", STOP EXECUTION
  if (!result.isConfirmed) {
    return;
  }
    setPersonalData(prevData => 
    prevData.map(item => 
      item.child_caseid === updateData.id 
        ? { ...item, verification_status: "1" } 
        : item
    )
  );



  await Swal.fire({
    title: "Updated!",
    text: "Verification status updated successfully",
    icon: "success",
    timer: 1500,
    showConfirmButton: false,
  });
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
        <Box sx={{ color: '#1f2937', fontWeight: 500 }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'NAME',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600, color: '#1f2937'}}>
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
      field: 'DEPT',
      headerName: 'Department',
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
      headerName: 'Phone',
      flex:0.8,
    minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontWeight: 500 }}>
          {formatNumber(params.value)}
        </Box>
      ),
    },
    {
      field: 'AADHAR_NUM',
      headerName: 'Aadhar',
       flex:1,
    minWidth: 130,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontFamily: 'monospace', fontSize: '11px' }}>
          {formatNumber(params.value)}
        </Box>
      ),
    },
    {
      field: 'SSC_MARKS',
      headerName: 'SSC %',
      width: 80,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontWeight: 600, fontSize: '12px' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'INTER_MARKS',
      headerName: 'Inter %',
      width: 80,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontWeight: 600, fontSize: '12px' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'BTECH_MARKS',
      headerName: 'BTech/Degree %',
      width: 130,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontWeight: 600, fontSize: '12px' }}>
          {params.value}
        </Box>
      ),
    },
      {
      field: 'PG_MARKS',
      headerName: 'PG %',
      width: 80,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontWeight: 600, fontSize: '12px' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'CURRENT_CTC',
      headerName: 'Curr CTC',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ color: '#059669', fontWeight: 600, fontSize: '12px' }}>
          ₹{formatNumber(params.value)}L
        </Box>
      ),
    },
    {
      field: 'EXP_CTC',
      headerName: 'Exp CTC',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ color: '#dc2626', fontWeight: 600, fontSize: '12px' }}>
          ₹{formatNumber(params.value)}L
        </Box>
      ),
    },
    // {
    //   field: 'OFFER_CTC',
    //   headerName: 'Offer CTC',
    //   width: 100,
    //   renderCell: (params) => (
    //     <Box sx={{ color: '#7c3aed', display: 'flex', alignItems: 'center', height: '100%', fontWeight: 600, fontSize: '12px' }}>
    //       ₹{formatNumber(params.value)}L
    //     </Box>
    //   ),
    // },
    {
      field: 'STATUS',
      headerName: 'Status',
      minWidth:110,
      flex:0.8,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: 'submitted_date',
      headerName: 'Submitted',
      width: 110,
      renderCell: (params) => (
        <Box sx={{ color: '#6b7280',  fontSize: '11px' }}>
          {formatDate(params.value)}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
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
    }
  ], []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading verification data...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "12px",
      
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
        
       

        {filteredData.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: '#6b7280' }}>
            <Typography variant="h6">No data found</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {personalData?.length === 0 ? 'No verification records available' : 'No records match your search criteria'}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #dfe5f1ff",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >


            <DataGrid
              rows={filteredData}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 20, 50]}
              rowHeight={40}
              columnHeaderHeight={50}
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
                  borderBottom: "1px solid #e2e8f0",
                  borderRight: "1px solid #e2e8f0",
                  fontSize: "12px",
                  color: "#374151",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#f0f9ff",
                  cursor: "pointer",
                },
                "& .MuiDataGrid-footerContainer": {
                  borderTop: "1px solid #e2e8f0",
                  backgroundColor: "#f0f7fa",
                },
              }}
            />
          </Box>
        )}
      </Paper>
      
      <VerificationDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={selectedUser}
        setSelectedUser = {setSelectedUser}
        onStatusChange={handleStatusChange}
        refersh = {EmpVerify}
      />
    </Box>
  );
};

export default Verification;