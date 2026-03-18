



import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../Config/Config.jsx';
import axios from 'axios';
import {
  Paper, Box, Typography, IconButton, Tooltip, TextField,
  InputAdornment, MenuItem, Button, CircularProgress, Snackbar,
  Alert, Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Search, CheckCircle, Cancel, Visibility, Refresh, Close, BadgeOutlined, CommentOutlined, EventAvailable, EventNote } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import SalaryStackDetailsModal from './SalaryStackDetailsModal';
import { CirclePlus, Info, UndoDot } from 'lucide-react';
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
   const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
   const [selectedRejectedRow, setSelectedRejectedRow] = useState(null);
  const [loading, setLoading] = useState(true); // overall loading state
  const [token, setToken] = useState(() => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  });

  console.log("stackupDatastackupDatastackupData",stackupData);

const fetchAllData = async () => {
  if (!token?.token) return;

  setLoading(true);
  try {
    const deptRes = await axios.get(`${API_BASE_URL}/employee-dept`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token.token}`,
      },
    });

    const designations =
      deptRes.data?.employeeData?.map(item => item.DESIGNATION) || [];

    setDesig(designations);

    const salaryRes = await axios.get(
      `${API_BASE_URL}/salaryStackGetData`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token.token}`,
        },
      }
    );


console.log(salaryRes,"66666666666688888888888888888");

    setStackupData(salaryRes.data);
  } catch (error) {
    console.error("Error fetching data:", error);
    setSnackbar({
      open: true,
      message: "Failed to load data",
      severity: "error",
    });
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  fetchAllData();
}, [token?.token]);




  const filteredData = useMemo(() => {
    if (!stackupData?.salaryStackUpGetData || stackupData.salaryStackUpGetData.length === 0) {
      return [];
    }

    let result = [...stackupData.salaryStackUpGetData];

    



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
    // setTimeout(() => {
    //   setSavingOfferCtc(prev => ({ ...prev, [rowId]: false }));
    //   setSnackbar({ open: true, message: `Offer CTC ₹${Number(typedValue).toLocaleString('en-IN')} saved!`, severity: 'success' });
    // }, 500);
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


      const handleViewRejectedDetails = (row) => {
    setSelectedRejectedRow(row);
    setDetailsDialogOpen(true);
  };

    const handleMoveNextTab = async (row) => {


  try {

     const result = await Swal.fire({
      title: 'Confirm Move',
      text: `Move to the action stage?`,
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
        RevisionTrackStatus: "Salary Stack Up"
    
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
      text: `The row is moved to the Action stage`,
      timer: 1500,
      showConfirmButton: false,
    });

    if(fetchAllData) {

  await   fetchAllData()
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
    if (updateData.status === 'pending') {
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

  console.log("ttttttttttttttttt",stackupData?.salaryStackUpGetData)

      const hasTypePlant = stackupData?.salaryStackUpGetData?.some(row => row.TYPE_PLANT);

  const recCycle = stackupData?.salaryStackUpGetData?.some(row => row.RECRUIT_CYCLE);


 



  // Columns definition
  const columns = useMemo(() => [
    { field: 'SNO', headerName: 'S.NO', flex: 0.5, minWidth: 70, renderCell: (params) => <Box sx={{ fontWeight: 600, color: '#374151' }}>{params.value}</Box> },
    { field: 'CHILD_CASEID', headerName: 'Case ID', flex: 1, minWidth: 130, renderCell: (params) => <Box sx={{ fontWeight: 500, color: '#1f2937' }}>{params.value}</Box> },

       ...(hasTypePlant
        ? [{
            field: 'TYPE_PLANT',
            headerName: 'Type Plant',
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
                    headerName: 'REVID',
                    flex: 1,
                    minWidth: 110,
                    renderCell: (params) => (
                        <Box sx={{ color: '#374151' }}>
                             {params.value || "00"} 
                        </Box>
                    ),
                },
    
    { field: 'PLANT', headerName: 'Plant Name', flex: 1.2, minWidth: 160, renderCell: (params) => <Box sx={{ color: '#374151' }}>{params.value}</Box> },
    { field: 'NAME', headerName: 'Name', flex: 1, minWidth: 140, renderCell: (params) => <Box sx={{ fontWeight: 600, color: '#1f2937' }}>{params.value}</Box> },
    { field: 'EMAIL', headerName: 'Email', flex: 1.5, minWidth: 200, renderCell: (params) => <Box sx={{ color: '#374151', fontSize: '12px' }}>{params.value}</Box> },
    { field: 'PHONE_NUMBER', headerName: 'Phone Number', flex: 0.9, minWidth: 120, renderCell: (params) => <Box sx={{ color: '#374151', fontWeight: 500 }}>{formatNumber(params.value)}</Box> },
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
  headerName: 'Designation',
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
              '& .MuiOutlinedInput-root': { 
                height: '35px', 
                fontSize: '12px', 
                marginTop: '5px',
                fontWeight: 500,
                fontFamily: 'Arial, Helvetica, sans-serif',
                color: '#374151'
              },
              '& .MuiInputBase-input': {
                fontSize: '12px',
                fontWeight: 500,
                fontFamily: 'Arial, Helvetica, sans-serif',
                color: '#374151',
                padding: '8px'
              }
            }}
          />
        )}
        sx={{ 
          width: '100%',
          '& .MuiAutocomplete-inputRoot': {
            fontSize: '12px',
            fontWeight: 500,
            fontFamily: 'Arial, Helvetica, sans-serif',
            color: '#374151'
          }
        }}
        disableClearable
        // Customize dropdown to match cell styles
        componentsProps={{
          paper: {
            sx: {
              fontSize: '12px',
              fontFamily: 'Arial, Helvetica, sans-serif',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              borderRadius: '4px',
              marginTop: '2px',
              '& .MuiAutocomplete-listbox': {
                padding: '4px 0',
                '& .MuiAutocomplete-option': {
                  fontSize: '12px',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  fontWeight: 500,
                  color: '#374151',
                  minHeight: '32px',
                  padding: '6px 12px',
                  '&:hover': {
                    backgroundColor: '#f3f4f6'
                  },
                  '&[aria-selected="true"]': {
                    backgroundColor: '#e5e7eb',
                    fontWeight: 600
                  }
                }
              }
            }
          }
        }}
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
    { field: 'cand_aprvl_status',  headerName: 'C.Salary Status', flex: 0.9, minWidth: 120, renderCell: (params) => getStatusChip(params.value) },
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
  field: 'History',
  headerName: 'C.History',
  flex: 0.6,
  minWidth: 100,
  sortable: false,
  filterable: false,
  renderCell: (params) => {
    return (
      <Button
        variant="contained"
        size="small"
        onClick={() => handleViewRejectedDetails(params.row)}
        sx={{
          backgroundColor: '#3b82f6',
          textTransform: 'capitalize',
          fontSize: '11px',
          padding: '3px 10px',
          borderRadius: '6px',
          '&:hover': {
            backgroundColor: '#2563eb',
          },
        }}
      >
        History
      </Button>
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


      const RejectedDetailsDialog = ({ open, onClose, data }) => {
      if (!data) return null;
      
      return (
       <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(115,93,201,0.2), 0 6px 20px rgba(0,0,0,0.08)',
      }
    }}
  >
    {/* HEADER */}
    <Box sx={{
      background: 'linear-gradient(135deg, #3b2790 0%, #735dc9 60%, #9b7fe8 100%)',
      px: 3, pt: 2.5, pb: 2.8,
      position: 'relative', overflow: 'hidden',
    }}>
      <Box sx={{ position: 'absolute', top: -28, right: -28, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -20, right: 80, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
  
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          
          <Typography sx={{ fontSize: '17px', fontWeight: 700, color: 'white', lineHeight: 1.25 }}>
        <Info /> {data?.cand_aprvl_status} Candidate Details
          </Typography>
          <Typography sx={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.6)', mt: 0.4 }}>
            Case ID &nbsp;·&nbsp; <strong style={{ color: 'rgba(255,255,255,0.92)' }}>{data?.CHILD_CASEID || '—'}</strong>
          </Typography>
        </Box>
        <IconButton
          onClick={onClose} size="small"
          sx={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.1)', width: 28, height: 28,
                '&:hover': { background: 'rgba(255,255,255,0.2)', color: 'white' } }}
        >
          <Close sx={{ fontSize: 15 }} />
        </IconButton>
      </Box>
    </Box>
  
    {/* BODY */}
    <DialogContent sx={{ p: 0, background: '#fff' }}>
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.1 }}>
  
        {/* Status */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: '9px 12px', borderRadius: '10px', background: '#735dc908', border: '1px solid #735dc91a', transition: 'all 0.15s', '&:hover': { background: '#735dc912', borderColor: '#735dc933', transform: 'translateX(2px)' } }}>
          <Box sx={{ width: 30, height: 30, borderRadius: '8px', background: '#735dc918', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BadgeOutlined sx={{ fontSize: 15, color: '#735dc9' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.55px', color: '#9ca3af', mb: '2px' }}>Candidate Status</Typography>
            <Typography sx={{ fontSize: '13px', fontWeight: 500, color: data?.cand_aprvl_status ? '#111827' : '#c4c4c4', fontStyle: data?.ofrLetterStatus ? 'normal' : 'italic' }}>
          {data?.cand_aprvl_status || ''} 
            </Typography>
          </Box>
        </Box>
  
        {/* Remarks */}
      { data?.cand_aprvl_status == "Modify" &&     <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: '9px 12px', borderRadius: '10px', background: '#0ea5e908', border: '1px solid #0ea5e91a', transition: 'all 0.15s', '&:hover': { background: '#0ea5e912', borderColor: '#0ea5e933', transform: 'translateX(2px)' } }}>
          <Box sx={{ width: 30, height: 30, borderRadius: '8px', background: '#0ea5e918', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CommentOutlined sx={{ fontSize: 15, color: '#0ea5e9' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.55px', color: '#9ca3af', mb: '2px' }}>Candidate Exp Salary</Typography>
            <Typography sx={{ fontSize: '13px', fontWeight: 500, color: data?.CandidSalaryModify ? '#111827' : '#c4c4c4', fontStyle: data?.CandidSalaryModify ? 'normal' : 'italic' }}>
              {data?.CandidSalaryModify || ''}
            </Typography>
          </Box>
        </Box>
      }
        {/* Dates side by side */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: '9px 12px', borderRadius: '10px', background: '#10b98108', border: '1px solid #10b9811a', transition: 'all 0.15s', '&:hover': { background: '#10b98112', transform: 'translateX(2px)' } }}>
            <Box sx={{ width: 30, height: 30, borderRadius: '8px', background: '#10b98118', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <EventAvailable sx={{ fontSize: 15, color: '#10b981' }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.55px', color: '#9ca3af', mb: '2px' }}>Candidate Remarks</Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: 500, color: data?.joiningDate ? '#111827' : '#c4c4c4', fontStyle: data?.joiningDate ? 'normal' : 'italic' }}>
{data?.cand_aprvl_remarks || ''}
              </Typography>
            </Box>
          </Box>
        </Box>
  
      </Box>
    </DialogContent>
  
    {/* FOOTER */}
    <DialogActions sx={{ px: 2.5, py: 1.8, background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
      <Button
        onClick={onClose}
        variant="contained"
        sx={{
          background: 'linear-gradient(135deg, #3b2790, #735dc9)',
          borderRadius: '8px', textTransform: 'none',
          fontWeight: 600, fontSize: '13px', px: 3, py: '7px',
          boxShadow: '0 4px 14px rgba(115,93,201,0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2e1e73, #5e4ab5)',
            boxShadow: '0 6px 20px rgba(115,93,201,0.45)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.15s ease',
        }}
      >
        Close
      </Button>
    </DialogActions>
  </Dialog>
  
      );
    };
  


//      const RejectedDetailsDialog = ({ open, onClose, data }) => {
//     if (!data) return null;
    
//     return (
//       <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//         <DialogTitle sx={{ 
//           bgcolor: '#735dc9', 
//           color: 'white',
//           display: 'flex',
//           alignItems: 'center',
//           gap: 1
//         }}>
//           <Info /> {data?.cand_aprvl_status} Candidate Details
//         </DialogTitle>
//         <DialogContent sx={{ mt: 2 }}>
//           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//             <Box sx={{ display: 'flex', borderBottom: '1px solid #e5e7eb', pb: 1 }}>
//               <Typography sx={{ width: '150px', fontWeight: 600, color: '#4b5563' }}>Case ID:</Typography>
//               <Typography sx={{ color: '#111827' }}>{data.CHILD_CASEID}</Typography>
//             </Box>
         
      
//             <Box sx={{ display: 'flex', borderBottom: '1px solid #e5e7eb', pb: 1 }}>
//               <Typography sx={{ width: '150px', fontWeight: 600, color: '#4b5563' }}>Candidate Status:</Typography>
//               <Typography sx={{ color: '#111827', fontStyle: 'italic' }}>
//                 {data?.cand_aprvl_status || ''}
//               </Typography>
//             </Box>

//                  { data?.cand_aprvl_status == "Modify" &&   <Box sx={{ display: 'flex', borderBottom: '1px solid #e5e7eb', pb: 1 }}>
//               <Typography sx={{ width: '150px', fontWeight: 600, color: '#4b5563' }}>Candidate Exp Salary:</Typography>
//               <Typography sx={{ color: '#111827' }}>
//                 {data?.CandidSalaryModify}
//               </Typography>
//             </Box>}
     
       
//             <Box sx={{ display: 'flex', borderBottom: '1px solid #e5e7eb', pb: 1 }}>
//               <Typography sx={{ width: '150px', fontWeight: 600, color: '#4b5563' }}>Candidate Remarks:</Typography>
//               <Typography sx={{ color: '#111827', fontStyle: 'italic' }}>
//                 {data?.cand_aprvl_remarks
//  || 'No remarks provided'}
//               </Typography>
//             </Box>
   
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={onClose} variant="contained" color="primary">
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>
//     );
//   };

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

            
columnVisibilityModel={{
  ACTIONTAB: filteredData?.some((row) => {
    const status = row.cand_aprvl_status?.trim().toLowerCase();
    return status === "reject";
  }) || false,

  History: filteredData?.some((row) => {
    const status = row.cand_aprvl_status?.trim().toLowerCase();
    return status == "reject" || status == "modify";
  }) || false,
}}




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

             <RejectedDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        data={selectedRejectedRow}
      />
    </Box>
  );
};

export default Salarystackup;







