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
  const [ofrList, setOfferLetterData] = useState([]);

  // State for REF_NUMBER editing
  const [editingRows, setEditingRows] = useState({});
  const [refNumberValues, setRefNumberValues] = useState({});
  const [isSaving, setIsSaving] = useState(false);

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
  
  // Handle edit click for REF_NUMBER
  const handleEditClick = (rowId) => {
    setEditingRows(prev => ({ ...prev, [rowId]: true }));
    const row = ofrList.find(item => item.CHILD_CASEID === rowId);
    if (row) {
      setRefNumberValues(prev => ({
        ...prev,
        [rowId]: row.REF_NUMBER || ''
      }));
    }
  };

  // Handle cancel edit for REF_NUMBER
  const handleCancelEdit = (rowId) => {
    setEditingRows(prev => ({ ...prev, [rowId]: false }));
    setRefNumberValues(prev => {
      const newValues = { ...prev };
      delete newValues[rowId];
      return newValues;
    });
  };

  // Save REF_NUMBER to local state
  const handleSaveRefNumber = async (rowId, rowData) => {
    const refNumber = refNumberValues[rowId];
    
    if (!refNumber || refNumber.trim() === "") {
      await Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a valid Reference Number",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Update local state
      setOfferLetterData(prevData => 
        prevData.map(item => 
          item.CHILD_CASEID === rowId 
            ? { ...item, REF_NUMBER: refNumber }
            : item
        )
      );
      
      // Exit edit mode
      setEditingRows(prev => ({ ...prev, [rowId]: false }));
      
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Reference Number saved successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error saving reference number:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save reference number",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setIsSaving(false);
    }
  };
 
  const handleOfferLterEmail = async (rowData) => {
    try {
      const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "You want to Move to Onboarding?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Send",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#2563eb",
      });
      
      if (!confirm.isConfirmed) return;

      // Get the REF_NUMBER from state
      const refNumber = refNumberValues[rowData.CHILD_CASEID] || rowData.REF_NUMBER;
       console.log(refNumber,"hiuui")
      
      if (!refNumber || refNumber.trim() === "") {
        await Swal.fire({
          icon: "warning",
          title: "Validation Error",
          text: "Please add Reference Number before moving to onboarding",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

     

      const payload = {
        CHILD_CASEID: rowData.CHILD_CASEID,
        REF_NO: refNumber  // Send REF_NUMBER to backend
      }
      
      const ofrMailSend = await axiosInstance.post(`${API_BASE_URL}/move-To-OnBoard`, payload,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token.token}`
          }
        })

      if (ofrMailSend.data.message) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Move to OnBoarding!",
          timer: 1500,
          showConfirmButton: false,
        });

        if (fetchOfrData) {
          await fetchOfrData();
        }
      } else {
        await Swal.fire("Failed", ofrMailSend.data.message, "error");
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

  const handleViewOfferLetter = (user) => {
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
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'capitalize',
          lineHeight: 1.2,
          height: '25px',
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

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    let [day, month, year] = dateStr.split('-');
    day = day.padStart(2, '0');
    month = month.padStart(2, '0');
    return new Date(`${year}-${month}-${day}`);
  };

  const formatNumber = (value) => {
    if (!value || value === 'N/A') return 'N/A';
    return value.toString();
  };

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

        // NEW REF_NUMBER COLUMN - Replace EMP_ID with this
  
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
      field: 'REF_NUMBER',
      headerName: 'Ref Number',
      width: 280,
      renderCell: (params) => {
        const rowId = params.row.CHILD_CASEID;
        const hasSavedValue = params.row.REF_NUMBER && params.row.REF_NUMBER.trim() !== '';
        const isEditing = editingRows[rowId];

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} key={`ref-number-${rowId}-${isEditing}`}>
            {hasSavedValue && !isEditing ? (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                width: '100%',
                gap: 1
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    color: '#1e293b',
                    backgroundColor: '#f1f5f9',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    flex: 1
                  }}
                >
                  {params.row.REF_NUMBER}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleEditClick(rowId)}
                  disabled={isSaving}
                  sx={{
                    borderRadius: '999px',
                    height: '24px',
                    minWidth: 'unset',
                    px: '9px',
                    fontSize: '11px',
                    textTransform: 'none',
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    border: 'none',
                    boxShadow: 'none',
                    transition: 'all 0.15s',
                    '&:hover': {
                      background: '#bfdbfe',
                      boxShadow: '0 0 0 2px #93c5fd',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': { transform: 'scale(0.96)' },
                  }}
                >
                  Edit
                </Button>
              </Box>
            ) : (
              <>
                <TextField
                  key={`textfield-${rowId}`}
                  value={refNumberValues[rowId] !== undefined ? refNumberValues[rowId] : params.row.REF_NUMBER || ""}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setRefNumberValues(prev => ({
                      ...prev,
                      [rowId]: newValue === undefined ? '' : newValue
                    }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveRefNumber(rowId, params.row);
                    }
                  }}
                  size="small"
                  placeholder="Enter Reference Number"
                  type="text"
                  disabled={isSaving}
                  autoFocus={isEditing}
                  onClick={(e) => e.stopPropagation()}
                  InputProps={{
                    sx: {
                      '& .MuiInputBase-input': {
                        fontSize: '12px',
                        padding: '8px 12px',
                      }
                    }
                  }}
                  sx={{
                    width: '150px',
                    '& .MuiOutlinedInput-root': {
                      height: '35px',
                      fontSize: '12px',
                      '& fieldset': {
                        borderColor: '#d1d5db',
                      },
                      '&:hover fieldset': {
                        borderColor: '#3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#3b82f6',
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleSaveRefNumber(rowId, params.row)}
                  disabled={isSaving || !refNumberValues[rowId] || refNumberValues[rowId].trim() === ""}
                  sx={{
                    borderRadius: '999px',
                    height: '24px',
                    minWidth: 'unset',
                    px: '9px',
                    fontSize: '11px',
                    textTransform: 'none',
                    background: '#156ee2',
                    border: 'none',
                    boxShadow: 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  Save
                </Button>
                {hasSavedValue && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleCancelEdit(rowId)}
                    disabled={isSaving}
                    sx={{
                      borderRadius: '999px',
                      height: '24px',
                      minWidth: 'unset',
                      px: '9px',
                      fontSize: '11px',
                      textTransform: 'none',
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: 'none',
                      boxShadow: 'none',
                      transition: 'all 0.15s',
                      '&:hover': {
                        background: '#fecaca',
                        boxShadow: '0 0 0 2px #fca5a5',
                        transform: 'translateY(-1px)',
                      },
                      '&:active': { transform: 'scale(0.96)' },
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </>
            )}
          </Box>
        );
      }
    },
{
  field: 'actions',
  headerName: 'Actions',
  width: 180,  // Increased width to accommodate longer text
  sortable: false,
  renderCell: (params) => {
    // Check if REF_NUMBER exists (either saved or being edited)
    const hasRefNumber = params.row.REF_NUMBER && params.row.REF_NUMBER.trim() !== '';
    
    return (
      <Tooltip title={!hasRefNumber ? "Please add Reference Number first (Click Edit button)" : "Move to Onboarding"}>
        <Button
          size="small"
          variant="contained"
          onClick={() => handleOfferLterEmail(params.row)}
          disabled={!hasRefNumber}  // Disable button if no REF_NUMBER
          sx={{
            backgroundColor: !hasRefNumber ? '#9ca3af' : '#10b981',
            textTransform: 'none',
            fontSize: '9px',
            '&:hover': {
              backgroundColor: !hasRefNumber ? '#9ca3af' : '#059669',
            },
          }}
        >
          {!hasRefNumber ? "Add Ref No First" : "Move To Onboarding"}
        </Button>
      </Tooltip>
    );
  }
}
  ], [ofrList, editingRows, refNumberValues, isSaving,joiningDates]);

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
            "& .MuiDataGrid-columnHeaders": {
              borderBottom: "2px solid #e2e8f0",
            },
            "& .MuiDataGrid-columnHeader": {
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