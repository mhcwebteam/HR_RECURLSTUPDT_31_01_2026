


import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Paper, Modal, IconButton, Typography, Button, CircularProgress, TextField, InputAdornment, Tooltip, Menu, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import 'sweetalert2/dist/sweetalert2.min.css';
import SearchIcon from '@mui/icons-material/Search';
import { ArrowLeftIcon, BriefcaseIcon, RefreshCw,ChevronRight, UserPlus, PauseCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../Config/Config.jsx';
import axiosInstance from '../Config/axiosConfig.jsx';

const AssignToMenu = ({ row, hrEmployees, userToken, onAssignmentComplete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [assignAnchorEl, setAssignAnchorEl] = useState(null);

  const currentStatus = row.status;
  const currentAssignee = row.assigned_to;

  const getButtonConfig = () => {
    if (currentStatus === 'Cancelled') return { label: 'Cancelled', color: '#dc2626' };
    if (currentStatus === 'Hold') return { label: 'On Hold', color: '#f59e0b' };
    if (currentAssignee) return { label: currentAssignee, color: '#10b981' };
    return { label: 'Assign To', color: '#667eea' };
  };

  const { label, color } = getButtonConfig();

  const handleMainClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };
  const handleMainClose = () => setAnchorEl(null);

  const handleAssignSubClick = (event) => {
    event.stopPropagation();
    setAssignAnchorEl(event.currentTarget);
  };
  const handleAssignSubClose = () => setAssignAnchorEl(null);

  const callApi = async (payload, successTitle, fallbackText) => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/task-Assign-StoreData`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${userToken.token}`,
          },
        }
      );

      await Swal.fire({
        icon: 'success',
        title: successTitle,
        text: response.data?.message || fallbackText,
        timer: 1500,
        showConfirmButton: false,
      });

      if (onAssignmentComplete) {
        await onAssignmentComplete();
      }
    } catch (error) {
      console.error('Action failed:', error.response?.data || error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Action failed',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleAssign = async (employee) => {
    handleAssignSubClose();
    handleMainClose();

    const result = await Swal.fire({
      title: 'Confirm Assignment?',
      text: `Are you sure you want to assign ${employee.EMP_NAME} to HR?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1e40af',
      cancelButtonColor: '#dc2626',
      confirmButtonText: '✓ Yes',
      cancelButtonText: '✕ Cancel',
      customClass: { container: 'swal-on-top' },
      didOpen: () => { document.querySelector('.swal-on-top').style.zIndex = 99999; },
      allowOutsideClick: false,
    });
    if (!result.isConfirmed) return;

    await callApi(
      {
        case_id: row.CHILD_CASEID,
        action: 'assign',
        assigned_to: employee.EMP_NAME,
        legacy_id: employee.EMP_ID,
        current_task: 'HR',
      },
      'Assigned!',
      `CaseID assigned to ${employee.EMP_NAME}`
    );
  };

 
  const handleHold = async () => {
  handleMainClose();

  const result = await Swal.fire({
    title: '',
    html: `
      <div class="text-left font-sans">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div>
            <div class="text-base font-bold text-slate-800 leading-tight">
              Hold CaseID: <span class="text-amber-600">${row.CHILD_CASEID} ?</span>
            </div>
            <div class="text-xs text-slate-400">You can assign or cancel it later</div>
          </div>
        </div>

        <label class="block mt-4 mb-1.5 text-xs font-semibold text-slate-700">
          Remarks <span class="text-amber-600">*</span>
        </label>
        <textarea
          id="hold-remarks"
          rows="1"
          placeholder="Enter reason for hold..."
          class="w-full box-border resize-y min-h-[42px] max-h-40 px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition"
          oninput="this.style.height='auto'; this.style.height=this.scrollHeight+'px'; document.getElementById('hold-remarks-error').classList.add('hidden');"
        ></textarea>
        <div id="hold-remarks-error" class="hidden mt-1.5 text-xs font-medium text-amber-600">
          Remarks are required to hold this CaseID
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Hold CaseID',
    cancelButtonText: 'Cancel',
    buttonsStyling: false,
    reverseButtons: true,
    focusConfirm: false,
    customClass: {
      container: 'swal-on-top',
      popup: 'rounded-2xl px-6 pt-5 pb-4',
      confirmButton: 'bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition',
      cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold px-5 py-2.5 rounded-lg transition',
      actions: 'gap-2.5 mt-4',
    },
    didOpen: () => {
      const container = document.querySelector('.swal-on-top');
      if (container) container.style.zIndex = 99999;
      document.getElementById('hold-remarks')?.focus();
    },
    preConfirm: () => {
      const value = document.getElementById('hold-remarks')?.value?.trim();
      if (!value) {
        document.getElementById('hold-remarks-error')?.classList.remove('hidden');
        return false;
      }
      return value;
    },
    allowOutsideClick: false,
  });

  if (!result.isConfirmed) return;

  await callApi(
    { case_id: row.CHILD_CASEID, action: 'hold', hr_assigned_remarks: result.value },
    'On Hold',
    'CaseID put on hold'
  );
};


const handleCancel = async () => {
  handleMainClose();

  const result = await Swal.fire({
    title: '',
    html: `
      <div class="text-left font-sans">
        <div id="cancel-form-content">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div>
              <div class="text-base font-bold text-slate-800 leading-tight">
                Cancel this CaseID: <span class="text-red-600">${row.CHILD_CASEID} ?</span>
              </div>
              <div class="text-xs text-slate-400">This action cannot be undone</div>
            </div>
          </div>

          <label class="block mt-4 mb-1.5 text-xs font-semibold text-slate-700">
            Remarks <span class="text-red-600">*</span>
          </label>
          <textarea
            id="cancel-remarks"
            rows="1"
            placeholder="Enter reason for cancellation..."
            class="w-full box-border resize-y min-h-[42px] max-h-40 px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition disabled:bg-slate-50 disabled:text-slate-400"
            oninput="this.style.height='auto'; this.style.height=this.scrollHeight+'px'; document.getElementById('cancel-remarks-error').classList.add('hidden');"
          ></textarea>
          <div id="cancel-remarks-error" class="hidden mt-1.5 text-xs font-medium text-red-600">
            Remarks are required to cancel this caseId
          </div>
        </div>

        <div id="cancel-loading" class="hidden flex-col items-center justify-center py-6">
          <svg class="animate-spin h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <div class="mt-3 text-sm font-medium text-slate-600">Cancelling case, please wait...</div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Cancel CaseID',
    cancelButtonText: 'Back',
    buttonsStyling: false,
    reverseButtons: true,
    focusConfirm: false,
    allowOutsideClick: () => !Swal.isLoading(),
    allowEscapeKey: () => !Swal.isLoading(),
    customClass: {
      container: 'swal-on-top',
      popup: 'rounded-2xl px-6 pt-5 pb-4',
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed',
      cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed',
      actions: 'gap-2.5 mt-4',
    },
    didOpen: () => {
      const container = document.querySelector('.swal-on-top');
      if (container) container.style.zIndex = 99999;
      document.getElementById('cancel-remarks')?.focus();
    },
    preConfirm: async () => {
      const value = document.getElementById('cancel-remarks')?.value?.trim();
      if (!value) {
        document.getElementById('cancel-remarks-error')?.classList.remove('hidden');
        return false;
      }

      // Switch UI into loading state
      const formContent = document.getElementById('cancel-form-content');
      const loadingBlock = document.getElementById('cancel-loading');
      const confirmBtn = Swal.getConfirmButton();
      const cancelBtn = Swal.getCancelButton();

      formContent?.classList.add('hidden');
      loadingBlock?.classList.remove('hidden');
      loadingBlock?.classList.add('flex');
      confirmBtn?.setAttribute('disabled', 'true');
      cancelBtn?.setAttribute('disabled', 'true');

      try {
        const response = await axiosInstance.post(
          `${API_BASE_URL}/task-Assign-StoreData`,
          { case_id: row.CHILD_CASEID, action: 'cancel', hr_assigned_remarks: value },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${userToken.token}`,
            },
          }
        );
        return response.data?.message || 'CaseID cancelled';
      } catch (error) {
        // Revert UI back to form so user can retry
        formContent?.classList.remove('hidden');
        loadingBlock?.classList.add('hidden');
        loadingBlock?.classList.remove('flex');
        confirmBtn?.removeAttribute('disabled');
        cancelBtn?.removeAttribute('disabled');

        Swal.showValidationMessage(
          error.response?.data?.message || 'Failed to cancel caseID'
        );
        return false;
      }
    },
  });

  if (!result.isConfirmed) return;

  await Swal.fire({
    icon: 'success',
    title: 'Cancelled',
    text: result.value,
    timer: 1500,
    showConfirmButton: false,
  });

  if (onAssignmentComplete) {
    await onAssignmentComplete();
  }
};

  return (
    <div>
      <Button
        variant="contained"
        size="small"
        onClick={handleMainClick}
        sx={{
          background: color,
          color: 'white',
          fontSize: '11px',
          padding: '4px 12px',
          borderRadius: '6px',
          textTransform: 'none',
          minWidth: '100px',
          '&:hover': { background: color, opacity: 0.9 },
        }}
      >
        {label} ▼
      </Button>

<Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleMainClose}
  PaperProps={{
    sx: {
      mt: 1,
      borderRadius: '10px',
      minWidth: '190px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    },
  }}
  onClick={(e) => e.stopPropagation()}
>
  <MenuItem
    onClick={handleAssignSubClick}
    sx={{
      fontSize: '12.5px',
      fontWeight: 500,
      py: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      color: '#374151',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <UserPlus size={15} color="#667eea" />
      Assign to HR
    </Box>
    <ChevronRight size={14} color="#9ca3af" />
  </MenuItem>

  <MenuItem
    onClick={handleHold}
    sx={{
      fontSize: '12.5px',
      fontWeight: 500,
      py: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      color: '#d97706',
    }}
  >
    <PauseCircle size={15} />
    Hold
  </MenuItem>

  <MenuItem
    onClick={handleCancel}
    sx={{
      fontSize: '12.5px',
      fontWeight: 500,
      py: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      color: '#dc2626',
    }}
  >
    <XCircle size={15} />
    Cancel
  </MenuItem>
</Menu>

      <Menu
        anchorEl={assignAnchorEl}
        open={Boolean(assignAnchorEl)}
        onClose={handleAssignSubClose}
        PaperProps={{ sx: { mt: 1, borderRadius: '8px', maxHeight: '200px', overflow: 'auto', minWidth: '200px' } }}
        onClick={(e) => e.stopPropagation()}
      >
        {hrEmployees && hrEmployees.length > 0 ? (
          hrEmployees.map((employee, index) => (
            <MenuItem
              key={`${employee.EMP_NAME}_${index}_${row.CHILD_CASEID}`}
              onClick={() => handleAssign(employee)}
              sx={{ fontSize: '12px', padding: '6px 16px' }}
            >
              {employee.EMP_NAME} ({employee.EMP_ID})
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
        const response = await axiosInstance.get(
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
      const response = await axiosInstance.get(
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

  




  const handleCloseModal = () => {
    setManPowerOpen(false);
    setSelectedRowData(null);
  };


  const hasTypePlant = hrData.some(row => row.TYPE_PLANT);

  const recCycle = hrData.some(row => row.RECRUIT_CYCLE);

  

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
      field: 'CASEID',
      headerName: 'CaseID',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 500, color: '#1f2937' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'CHILD_CASEID',
      headerName: 'Child CaseID',
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
      minWidth: 250,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },

  ...(hasTypePlant
    ? [{
        field: 'TYPE_PLANT',
        headerName: 'Type of Plants',
        flex: 1.2,
        minWidth: 110,
        renderCell: (params) => (
          <Box sx={{ color: '#374151' }}>
            {params.value}
          </Box>
        ),
      }]
    : []),

     ...(recCycle
    ? [{
        field: 'RECRUIT_CYCLE',
        headerName: 'Emp Level',
        flex: 1.2,
        minWidth: 140,
        renderCell: (params) => (
          <Box sx={{ color: '#374151' }}>
            {params.value}
          </Box>
        ),
      }]
    : []),



 


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
  field: "MANPOWER_DESG",
  headerName: "Designation",
  flex: 1.2,
  minWidth: 130,
  renderCell: (params) => {
    const subCode = params.row.SUB_CODE;
    const subPost = params.row.SUB_POST;
    const designation = params.value;

    const displayValue =
      subPost && subPost !== "N/A"
        ? subPost
        : designation || "N/A";

    return (
      <Box
        sx={{
          color: "#374151",
          padding: "2px 8px",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        {subCode ? `${subCode} - ${displayValue}` : displayValue}
      </Box>
    );
  },
},


    {
      field: 'RAISER',
      headerName: 'Raiser',
      flex: 1,
      minWidth: 180,
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
      minWidth: 90,
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
      field: 'CUR_USR',
      headerName: 'Final Approval Name',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },

       {
      field: 'CUR_USR_DESIGNATION',
      headerName: 'Final Approval Desig',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },



{
  field: "approvedDate",
  headerName: "Final Approval Date",
  flex: 1,
  minWidth: 140,
  renderCell: (params) => {
    const value = params.row.EVC_DATE || params.row.SR_MGMT_DATE || params.row.SP_DATE;

    if (!value) return "";

    const date = value.split(" ")[0]; // e.g. 2026-07-08
    const [year, month, day] = date.split("-");

    return (
      <Box sx={{ color: "#374151" }}>
        {`${day}-${month}-${year}`}
      </Box>
    );
  },
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
    },

    
       {
      field: 'hr_assigned_status',
      headerName: 'Hold Status',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },

       
       {
      field: 'hr_assigned_remarks',
      headerName: 'Hold Remarks',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },

    {
      field: 'Hold_Date',
      headerName: 'Hold Date',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
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
  border: "1px solid #e2e8f0",

  "& .MuiDataGrid-columnHeaders": {
    borderBottom: "1px solid #e2e8f0",
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
            <Typography>CaseID details would be shown here</Typography>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};


export default React.memo(HODInbox);



