



import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../Config/Config.jsx';
import axios from 'axios';
import {
  Paper, Box, Typography, IconButton, Tooltip, TextField,
  InputAdornment, MenuItem, Button, CircularProgress, Snackbar,
  Alert, Autocomplete
} from '@mui/material';
import { Search, CheckCircle, Cancel, Visibility, Refresh } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
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
  const [approvedRows, setApprovedRows] = useState({});
  const [savingOfferCtc, setSavingOfferCtc] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [stackupData, setStackupData] = useState([]);
  const [offerCtcValues, setOfferCtcValues] = useState({});
  const [confirmedOffers, setConfirmedOffers] = useState({});
  const [desig, setDesig] = useState([]);
  const [loading, setLoading] = useState(true); // overall loading state
  const [token, setToken] = useState(() => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  });

  // Fetch all data sequentially: first designations, then salary data
  useEffect(() => {
    const fetchAllData = async () => {
      if (!token?.token) return;
      setLoading(true);
      try {
        // 1. Fetch designations first
        const deptRes = await axios.get(`${API_BASE_URL}/employee-dept`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token.token}`,
          },
        });
        const designations = deptRes.data?.employeeData?.map(item => item.DESIGNATION) || [];
        setDesig(designations);

        // 2. Fetch salary stack data
        const salaryRes = await axios.get(`${API_BASE_URL}/salaryStackGetData`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token.token}`,
          },
        });
        console.log(salaryRes,"tyyyyyyyyyyyyyyyy");
        setStackupData(salaryRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbar({ open: true, message: 'Failed to load data', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token?.token]);

  // Filtered data (exclude accepted candidates)
  const filteredData = useMemo(() => {
    if (!stackupData?.salaryStackUpGetData || stackupData.salaryStackUpGetData.length === 0) {
      return [];
    }

    let result = [...stackupData.salaryStackUpGetData];

    // Remove accepted candidates
    result = result.filter(item => item.cand_aprvl_status !== 'Accept');

    // Search filter
    if (searchTerm) {
      result = result.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
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

 

  // Handle designation change (local only; you may want to persist via API)
  const handleDesignationChange = (rowId, newValue) => {
    setStackupData(prev => ({
      ...prev,
      salaryStackUpGetData: prev.salaryStackUpGetData.map(item =>
        item.verification_id === rowId ? { ...item, DESIG: newValue } : item
      )
    }));
  };

  // Handle Offer CTC change
  const handleOfferCtcChange = (rowId, value) => {
    setOfferCtcValues(prev => ({ ...prev, [rowId]: value }));
  };

  // Save Offer CTC
  const handleSaveOfferCtc = async (rowId, row) => {
    const typedValue = offerCtcValues[rowId];
    if (!typedValue || typedValue === '0') {
      setSnackbar({ open: true, message: 'Please enter a valid amount', severity: 'error' });
      return;
    }

    setSavingOfferCtc(prev => ({ ...prev, [rowId]: true }));

    // Optimistic update
    setConfirmedOffers(prev => ({ ...prev, [rowId]: typedValue }));
    setStackupData(prev => ({
      ...prev,
      salaryStackUpGetData: prev.salaryStackUpGetData.map(item =>
        item.verification_id === rowId ? { ...item, offer_ctc: typedValue } : item
      )
    }));

    // Here you would normally call an API to persist the offer CTC
    // For example:
    // try {
    //   await axios.post(`${API_BASE_URL}/update-offer-ctc`, { child_caseid: row.CHILD_CASEID, offerCtc: typedValue }, { headers });
    //   setSnackbar({ open: true, message: 'Offer CTC saved', severity: 'success' });
    // } catch (error) {
    //   setSnackbar({ open: true, message: 'Save failed', severity: 'error' });
    // } finally {
    //   setSavingOfferCtc(prev => ({ ...prev, [rowId]: false }));
    // }

    // Simulate success
    setTimeout(() => {
      setSavingOfferCtc(prev => ({ ...prev, [rowId]: false }));
      setSnackbar({ open: true, message: `Offer CTC ₹${Number(typedValue).toLocaleString('en-IN')} saved!`, severity: 'success' });
    }, 500);
  };

  // Send email
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

    if (!result.isConfirmed) return;

    Swal.fire({
      title: 'Sending Email...',
      text: 'Please wait while we send the approval email.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/cand-aprvl-email`,
        { case_id: row.CHILD_CASEID, email: row.EMAIL, name: row.NAME },
        { headers: { Accept: "application/json", Authorization: `Bearer ${token.token}` } }
      );

      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'Email Sent!', text: response.data.message, timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire({ icon: 'error', title: 'Submission Failed', text: response.data.error || 'Something went wrong' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Submission Failed', text: error.response?.data?.error || error.message });
    }
  };

  // View details (opens modal)
  const handleViewDetails = (row) => {
    const currentOfferValue = confirmedOffers[row.id] || offerCtcValues[row.id] || row.offer_ctc;
    setSelectedUser({ ...row, OFFER_CTC: currentOfferValue });
    setModalOpen(true);
  };

  // Status chip helper
  const getStatusChip = (status) => {
    const statusValue = status?.toLowerCase();
    const config = {
      verified: { color: '#10b981' },
      pending: { color: '#f59e0b' },
      rejected: { color: '#ef4444' },
      uploaded: { color: '#3b82f6' },
      'not uploaded': { color: '#6b7280' }
    };
    const { color } = config[statusValue] || config.pending;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Box sx={{ color: '#ffffff', backgroundColor: color, padding: '4px 10px', borderRadius: '6px', fontSize: '10px', height: '25px', fontWeight: 600, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {statusValue?.charAt(0).toUpperCase() + statusValue?.slice(1) || 'Pending'}
        </Box>
      </Box>
    );
  };

  // Format helpers
  const formatNumber = (value) => (value && value !== 'N/A' ? value.toString() : 'N/A');

  // Handle status change from modal
  const handleStatusChange = (updateData) => {
    if (updateData.status === 'approved') {
      setApprovedRows(prev => ({ ...prev, [updateData.id]: true }));
    }
    if (updateData.offer_ctc && updateData.id) {
      setConfirmedOffers(prev => ({ ...prev, [updateData.id]: updateData.offer_ctc }));
      setOfferCtcValues(prev => ({ ...prev, [updateData.id]: updateData.offer_ctc }));
      setStackupData(prev => ({
        ...prev,
        salaryStackUpGetData: prev.salaryStackUpGetData.map(item =>
          item.verification_id === updateData.id ? { ...item, offer_ctc: updateData.offer_ctc, status: updateData.status } : item
        )
      }));
    }
  };

  // Columns definition
  const columns = useMemo(() => [
    { field: 'SNO', headerName: 'S.NO', flex: 0.5, minWidth: 70, renderCell: (params) => <Box sx={{ fontWeight: 600, color: '#374151' }}>{params.value}</Box> },
    { field: 'CHILD_CASEID', headerName: 'Case ID', flex: 1, minWidth: 130, renderCell: (params) => <Box sx={{ fontWeight: 500, color: '#1f2937' }}>{params.value}</Box> },
    { field: 'PLANT', headerName: 'Plant Name', flex: 1.2, minWidth: 160, renderCell: (params) => <Box sx={{ color: '#374151' }}>{params.value}</Box> },
    { field: 'NAME', headerName: 'Name', flex: 1, minWidth: 140, renderCell: (params) => <Box sx={{ fontWeight: 600, color: '#1f2937' }}>{params.value}</Box> },
    { field: 'EMAIL', headerName: 'Email', flex: 1.5, minWidth: 200, renderCell: (params) => <Box sx={{ color: '#374151', fontSize: '12px' }}>{params.value}</Box> },
    { field: 'PHONE_NUMBER', headerName: 'Phone Number', flex: 0.9, minWidth: 120, renderCell: (params) => <Box sx={{ color: '#374151', fontWeight: 500 }}>{formatNumber(params.value)}</Box> },
    { field: 'DEPT', headerName: 'Department', flex: 1, minWidth: 120, renderCell: (params) => <Box sx={{ color: '#374151', fontWeight: 500 }}>{formatNumber(params.value)}</Box> },
    {
      field: 'DESIG',
      headerName: 'Offer Designation',
      flex: 1,
    
      minWidth: 200,
      renderCell: (params) => {
        const rowId = params.row.id;
        const currentValue = params.row.DESIG || '';

        return (
          <Autocomplete
            size="small"
            options={desig}
            value={currentValue}
            onChange={(event, newValue) => handleDesignationChange(rowId, newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select Designation"
                sx={{
                  '& .MuiOutlinedInput-root': { height: '35px', fontSize: '12px', marginTop:'5px' }
                }}
              />
            )}
            sx={{ width: '100%' }}
            disableClearable
          />
        );
      },
    },
    {
      field: 'CURRENT_CTC',
      headerName: 'Current CTC',
      width: 110,
      renderCell: (params) => {
        const val = params.value ? Number(params.value).toLocaleString('en-IN') : '0';
        return <Box sx={{ color: '#059669', fontWeight: 600, fontSize: '12px' }}>₹{val}</Box>;
      },
    },
    {
      field: 'EXP_CTC',
      headerName: 'Expected CTC',
      width: 120,
      renderCell: (params) => {
        const val = params.value ? Number(params.value).toLocaleString('en-IN') : '0';
        return <Box sx={{ color: '#059669', fontWeight: 600, fontSize: '12px' }}>₹{val}</Box>;
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

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              value={offerCtcValues[rowId] || ''}
              onChange={(e) => handleOfferCtcChange(rowId, e.target.value)}
              size="small"
              placeholder="Enter Amount"
              type="number"
              disabled={isSaving}
              sx={{ width: '130px', '& .MuiOutlinedInput-root': { height: '35px', fontSize: '12px' } }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={() => handleSaveOfferCtc(rowId, params.row)}
              disabled={isSaving || !offerCtcValues[rowId]}
              sx={{
                backgroundColor: '#059669', minWidth: '60px', height: '35px',
                '&:hover': { backgroundColor: '#047857' },
                '&:disabled': { backgroundColor: '#9ca3af' }
              }}
            >
              {isSaving ? <CircularProgress size={16} sx={{ color: 'white' }} /> : 'Save'}
            </Button>
          </Box>
        );
      }
    },
   {
  field:'PERCENTOF_HIKE',
  headerName: 'Hike %',
  flex: 0.9,
  minWidth: 120,
  renderCell: (params) => {
    const rowId = params.row.id;
    const currentCtc = Number(params.row.CURRENT_CTC || 0);

    const offerCtc =
      confirmedOffers[rowId]
        ? Number(confirmedOffers[rowId])
        : Number(params.row.OFFER_CTC || 0);

    if (!currentCtc || !offerCtc) {
      return (
        <Box sx={{ fontSize: '12px', color: '#9ca3af' }}>-</Box>
      );
    }

    const hike = ((offerCtc - currentCtc) / currentCtc) * 100;
    const isPositive = hike >= 0;

    // Optional: update the row data itself
    params.row.PERCENTOF_HIKE = hike.toFixed(2);

    return (
      <Box
        sx={{
          fontSize: '13px',
          fontWeight: 600,
          color: isPositive ? '#10b981' : '#ef4444'
        }}
      >
        {hike.toFixed(2)}%
      </Box>
    );
  }
},
    { field: 'status', headerName: 'Salary Status', flex: 0.9, minWidth: 120, renderCell: (params) => getStatusChip(params.value) },
    {
      field: 'create',
      headerName: 'Create',
      width: 80,
      sortable: false,
      renderCell: (params) => {
        const rowId = params.row.id;
        const dbValue = params.row.OFFER_CTC;
        const localSavedValue = confirmedOffers[rowId];
        const hasOfferCTC = (dbValue && dbValue !== 'N/A' && dbValue !== '0') || localSavedValue;
        if (!hasOfferCTC) return null;
        return (
          <Tooltip title="Create">
            <IconButton size="small" onClick={() => handleViewDetails(params.row)} sx={{ color: '#3b82f6', '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.1)' } }}>
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
        const isApproved = approvedRows[params.row.id] || false;
        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => handleSendEmail(params.row)}
            disabled={isSubmitting || !isApproved}
            sx={{
              background: (isSubmitting || !isApproved) ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white', fontSize: '10px', padding: '4px 10px', borderRadius: '6px', textTransform: 'capitalize',
              boxShadow: isApproved ? '0 2px 6px rgba(16, 185, 129, 0.3)' : 'none', minWidth: '90px',
              '&:hover': { background: (isSubmitting || !isApproved) ? '#9ca3af' : 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
              '&:disabled': { background: '#9ca3af', color: '#e5e7eb' }
            }}
          >
            {isSubmitting ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CircularProgress size={12} sx={{ color: 'white' }} />Sending...</Box> : 'Send Email'}
          </Button>
        );
      },
    },
  ], [offerCtcValues, submitting, savingOfferCtc, confirmedOffers, approvedRows, desig]);

  // Show loading spinner until both data sets are ready
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "1400px", margin: "0 auto", padding: "12px" }}>
      <Paper sx={{ width: '100%', padding: 2, borderRadius: '12px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', border: '1px solid #e2e8f0' }}>
     

        <Box sx={{ width: "100%", borderRadius: "10px", overflow: "hidden", border: "1px solid #dfe5f1ff", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",  }}>
    <DataGrid
            rows={filteredData}
            columns={columns}
            getRowId={(row) => row.verification_id}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50]}
            rowHeight={50}
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

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Salarystackup;



