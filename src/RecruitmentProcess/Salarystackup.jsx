
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { API_BASE_URL } from '../Config/Config.jsx';
import axios from 'axios'; import { Paper, Box, Typography, IconButton, Tooltip, TextField, InputAdornment, MenuItem, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Search, CheckCircle, Cancel, Visibility, Refresh } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { ContextData } from '../Context/ContextData';
import VerificationDetailsModal from './VerificationDetailsModal';
import SalaryStackDetailsModal from './SalaryStackDetailsModal';
import { CirclePlus } from 'lucide-react';
import Swal from 'sweetalert2';

const Salarystackup = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState({});
  const { personalData } = useContext(ContextData);

  const [savingOfferCtc, setSavingOfferCtc] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [stackupData, setStackupData] = useState([]);
  // Change from string to object to store offer CTC for each row
  const [offerCtcValues, setOfferCtcValues] = useState({});
  const [confirmedOffers, setConfirmedOffers] = useState({});
  const [token, setToken] = useState(() => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  });








  useEffect(() => {
    if (stackupData?.salaryStackUpGetData && stackupData?.salaryStackUpGetData?.length > 0) {
      setOfferCtcValues(stackupData?.salaryStackUpGetData[0].offer_ctc || '');
    }
  }, [personalData]);

  
  const fetchData = async () => {

    try {
      const response = await axios.get(`${API_BASE_URL}/salaryStackGetData`, {
        headers:
        {
          "Content-Type": "application/json",
          Accept: 'application/json',
          Authorization: `Bearer ${token.token}`
        }
      });


      const responseData = response.data;


      console.log("responseDataresponseDataresponseData22222222",responseData);
  

      setStackupData(responseData);
    }
    catch (error) {
      console.error("Error fetching data. Using mock:", error);
    }
    finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    if (token.token) {
      fetchData()
    }
  }, [token?.token])

  
const filteredData = useMemo(() => {
  if (!stackupData?.salaryStackUpGetData || stackupData.salaryStackUpGetData.length === 0) {
    return [];
  }

  let result = [...stackupData.salaryStackUpGetData];

  // 🔴 REMOVE accepted candidates
  result = result.filter(
    item => item.cand_aprvl_status !== 'Accept'
  );

  // 🔍 Search filter
  if (searchTerm) {
    result = result.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // 📌 Status filter
  if (statusFilter !== 'all') {
    result = result.filter(user => user.status === statusFilter);
  }

  return result.map((item, index) => ({
    ...item,
    id: item.verification_id,
    SNO: index + 1,
    OFFER_CTC: confirmedOffers[item.verification_id] || item.offer_ctc || 'N/A',
  }));
}, [stackupData, searchTerm, statusFilter, confirmedOffers]);


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

  const handleSendEmail = async (row) => {
    const result = await Swal.fire({
      title: 'Send Approval Email?',
      text: `Are you sure you want to send the approval email to ${row.EMAIL}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Send',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    });

    // ❌ If user clicks Cancel, stop here
    if (!result.isConfirmed) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/cand-aprvl-email`,
        {
          case_id: row.CHILD_CASEID,
          email: row.EMAIL,
          name: row.NAME,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.token}`,
          },
        }
      );

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Email Sent!',
        showConfirmButton: false, 
          text: response.data.message,
          confirmButtonColor: '#10b981',
        });


  //       if(fetchData) {
  // await fetchData()
  //       }

       
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: response.data.error || 'Something went wrong',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text:
          error.response?.data?.error ||
          error.message ||
          'Server error occurred',
      });
    }
  };

  const handleSaveOfferCtc = async (rowId, row) => {
    const typedValue = offerCtcValues[rowId];

    if (!typedValue || typedValue === '0') {
      setSnackbar({ open: true, message: 'Please enter a valid amount', severity: 'error' });
      return;
    }

    setSavingOfferCtc(prev => ({ ...prev, [rowId]: true }));

    const payload = {
      child_caseid: row.CHILD_CASEID,
      offerCtc: typedValue
    };

    try {
      // const response = await axios.post(
      //   `${API_BASE_URL}/Ofr-Ctc-Upt`, 
      //   payload, 
      //   {
      //     headers: {
      //       "Accept": "application/json",
      //       Authorization: `Bearer ${token.token}`
      //     },
      //   }
      // );

      // console.log('Offer CTC saved:', response.data);

      // Mark as confirmed after successful save
      setConfirmedOffers(prev => ({
        ...prev,
        [rowId]: typedValue
      }));

      setStackupData(prev => {
      if (!prev?.salaryStackUpGetData) return prev;
      
      return {
        ...prev,
        salaryStackUpGetData: prev.salaryStackUpGetData.map(item => {
          if (item.verification_id === rowId) {
            return {
              ...item,
              offer_ctc: typedValue
            };
          }
          return item;
        })
      };
    });

    setSnackbar({
      open: true,
      message: `Offer CTC ₹${Number(typedValue).toLocaleString('en-IN')} saved successfully!`,
      severity: 'success'
    });

  } catch (err) {
    console.error('Error saving Offer CTC:', err);
    setSnackbar({
      open: true,
      message: 'Error saving Offer CTC: ' + err.message,
      severity: 'error'
    });
  } finally {
    setSavingOfferCtc(prev => ({ ...prev, [rowId]: false }));
  }
  };


  const handleViewDetails = (row) => {

    const currentOfferValue = confirmedOffers[row.id] || offerCtcValues[row.id] || row.offer_ctc;
    const userDataWithOffer = {
      ...row,
      OFFER_CTC: currentOfferValue // Ikkada update chestunnam, so modal lo Null radu
    };

    setSelectedUser(userDataWithOffer);
    setModalOpen(true);
  };

 const handleStatusChange = (updateData) => {
  console.log('Status updated:', updateData);

  // Update the confirmed offers if offer_ctc is present in updateData
  if (updateData.offer_ctc && updateData.id) {
    setConfirmedOffers(prev => ({
      ...prev,
      [updateData.id]: updateData.offer_ctc
    }));

    // ✅ UPDATE: Also update offerCtcValues to show the saved value
    setOfferCtcValues(prev => ({
      ...prev,
      [updateData.id]: updateData.offer_ctc
    }));

    // ✅ NEW: Update the stackupData to reflect changes immediately
    setStackupData(prev => ({
      ...prev,
      salaryStackUpGetData: prev.salaryStackUpGetData.map(item => 
        item.verification_id === updateData.id 
          ? { ...item, offer_ctc: updateData.offer_ctc, status: updateData.status }
          : item
      )
    }));
  }
};

  // Handle Offer CTC change for specific row
  const handleOfferCtcChange = (rowId, value) => {
    setOfferCtcValues(prev => ({
      ...prev,
      [rowId]: value
    }));
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
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontWeight: 500 }}>
          {formatNumber(params.value)}
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
      width: 220,
      renderCell: (params) => {
        const rowId = params.row.id;
        const dbValue = params.row.OFFER_CTC;
        const localSavedValue = confirmedOffers[rowId];
        const isSaving = savingOfferCtc[rowId];

        // Check if value is locked (either from DB or locally saved)
        const isLocked = (dbValue && dbValue !== 'N/A' && dbValue !== '0') || localSavedValue;

        if (isLocked) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>
                ₹{Number(localSavedValue || dbValue).toLocaleString('en-IN')}
              </Typography>
              <CheckCircle sx={{ fontSize: '16px', color: '#10b981' }} />
            </Box>
          );
        }

        // Show input field if not locked
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              value={offerCtcValues[rowId] || ''}
              onChange={(e) => handleOfferCtcChange(rowId, e.target.value)}
              size="small"
              placeholder="Enter Amount"
              type="number"
              disabled={isSaving}
              sx={{
                width: '130px',
                '& .MuiOutlinedInput-root': {
                  height: '35px',
                  fontSize: '12px'
                }
              }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={() => handleSaveOfferCtc(rowId, params.row)}
              disabled={isSaving || !offerCtcValues[rowId]}
              sx={{
                backgroundColor: '#059669',
                minWidth: '60px',
                height: '35px',
                '&:hover': {
                  backgroundColor: '#047857'
                },
                '&:disabled': {
                  backgroundColor: '#9ca3af'
                }
              }}
            >
              {isSaving ? (
                <CircularProgress size={16} sx={{ color: 'white' }} />
              ) : (
                'Save'
              )}
            </Button>
          </Box>
        );
      }
    },
    {
      field: 'status',
      headerName: 'Salary Status',
      flex: 0.9,
      minWidth: 120,
      renderCell: (params) => getStatusChip(params.value),
    },

    {
  field: 'create',
  headerName: 'Create',
  width: 80,
  sortable: false,
  renderCell: (params) => {
    const rowId = params.row.id;
    const dbValue = params.row.OFFER_CTC;
    const localSavedValue = confirmedOffers[rowId];
    
    // ✅ Show create button only if offer CTC exists (either from DB or locally saved)
    const hasOfferCTC = (dbValue && dbValue !== 'N/A' && dbValue !== '0') || localSavedValue;
    
    if (!hasOfferCTC) {
      return null; // Don't show the button if no offer CTC is saved
    }
    
    return (
      <Tooltip title="Create">
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
          <CirclePlus fontSize="small" />
        </IconButton>
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
        const isSubmitting = submitting[params.row.CASEID] || false;
        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => handleSendEmail(params.row)}
            disabled={isSubmitting}
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
  ], [offerCtcValues, submitting, savingOfferCtc, confirmedOffers]);

  // Function to save all offer CTC values
  const handleSaveAllOfferCtc = async () => {
    try {
      const offersToSave = Object.entries(offerCtcValues).map(([id, value]) => ({
        id,
        offer_ctc: value
      }));

      console.log('Saving offer CTC values:', offersToSave);
      // Add your API call here to save the data
      // await axios.post(`${API_BASE_URL}/save-offer-ctc`, { offers: offersToSave });

      alert('Offer CTC values saved successfully!');
    } catch (error) {
      console.error('Error saving offer CTC:', error);
      alert('Failed to save offer CTC values');
    }
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

        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
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
            {filteredData.length} salary records
          </Typography>
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
            getRowId={(row) => row.verification_id}
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

      <SalaryStackDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={selectedUser}
        onStatusChange={handleStatusChange}
    
      />
    </Box>
  );
};

export default Salarystackup;