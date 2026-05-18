import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Chip, TextField, InputAdornment } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../Config/Config.jsx';
import Swal from 'sweetalert2';
import axiosInstance from '../Config/axiosConfig.jsx';
import { SendIcon } from 'lucide-react';

const OnBoardEmployeeList = () => {
  const [joiningData, setJoiningData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

  const [joiningDates, setJoiningDates] = useState({});
  const [empidValues, setEmpidValues] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [editingRows, setEditingRows] = useState({});

  const navigate = useNavigate();
  const [Token, useToken] = useState(() => {
    const userToken = JSON.parse(localStorage.getItem('userInfo'));
    return userToken ? userToken : null;
  })

  // Load saved EMP IDs from localStorage on component mount
  useEffect(() => {
    const savedEmpIds = localStorage.getItem('tempEmpIds');
    if (savedEmpIds) {
      setEmpidValues(JSON.parse(savedEmpIds));
    }
  }, []);

  // Save EMP IDs to localStorage whenever they change (temporary storage)
  useEffect(() => {
    if (Object.keys(empidValues).length > 0) {
      localStorage.setItem('tempEmpIds', JSON.stringify(empidValues));
    }
  }, [empidValues]);

  //----------------------------JoiningDataStart------------------------//
  const joinData = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/emp-verify-data`,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${Token.token}`,
          },
        }
      );

      const apiData = response.data.data;

      const formattedRows = apiData
        .filter(item => {
          const hasJoiningDate = item.onBoarding == "4"
          return hasJoiningDate;
        })
        .map((item, index) => {
          // Check if EMP_ID exists in database - this determines if final submitted
          const hasEmpIdInDb = item?.EMP_ID && item?.EMP_ID.trim() !== '';
          
          return {
            id: item.verification_id || index,
            CHILD_CASEID: item.child_caseid,
            employee_name: item.name,
            email: item.email,
            phone: item.phone_number,
            department: item.DEPT,
            location: item.PLANT,
            joining_date: item.joiningDate,
            current_ctc: item.CURRENT_CTC,
            expected_ctc: item.EXP_CTC,
            offered_ctc: item.OFFER_CTC ?? '',
            TYPE_PLANT: item?.TYPE_PLANT,
            GROUP_CODE: item?.GROUP_CODE,
            SUB_CODE: item?.SUB_CODE,
            SUB_POST: item?.SUB_POST,
            DESIG: item.DESIG || 'N/A',
            MANPOWER_DESG: item.MANPOWER_DESG || 'N/A',
            RECRUIT_CYCLE: item?.RECRUIT_CYCLE,
            hrEvaluationFile: item?.hrEvaluationFile,
            joining_status: 'Joined',
            offer_letter: item.OfferLetterFlag ?? '',
            bgv_status: item.verification_status ?? '',
            documents_status: item.overallDocments_aprvl === '1' ? 'Complete' : 'Pending',
            current_stage: item.CURRENT_TASK,
            hr_owner: item.CURRENT_USER,
            created_at: item.created_at,
            fullData: item,
            EMP_ID: item?.EMP_ID || '',
            isFinalSubmitted: hasEmpIdInDb // TRUE if EMP_ID exists in database
          };
        });

      console.log("Filtered formattedRows:", formattedRows);
      setJoiningData(formattedRows);
      setFilteredData(formattedRows);
      
    } catch (error) {
      console.error("Error in fetching joining data", error);
    }
  };

  useEffect(() => {
    if (Token.token) {
      joinData();
    }
  }, [Token.token]);

  const handleEmpIdChange = (rowId, value) => {
    setEmpidValues((prev) => ({
      ...prev,
      [rowId]: value
    }));
  };

  // Handle Edit button click
  const handleEditClick = (rowId) => {
    setEditingRows({});
    setEditingRows(prev => ({ ...prev, [rowId]: true }));
    const currentRow = filteredData.find(row => row.id === rowId);
    const currentValue = currentRow?.EMP_ID || '';
    setEmpidValues(prev => ({
      ...prev,
      [rowId]: currentValue
    }));
  };

  // Handle Cancel button click
  const handleCancelEdit = (rowId) => {
    setEditingRows(prev => {
      const newState = { ...prev };
      delete newState[rowId];
      return newState;
    });
    setEmpidValues(prev => {
      const newState = { ...prev };
      delete newState[rowId];
      return newState;
    });
  };

  // Save to localStorage only (NO API CALL)
  const handleSaveToLocalStorage = (rowId, rowData) => {
    const empId = empidValues[rowId];
    
    const validFormat = /^[a-zA-Z0-9/-]+$/.test(empId);
    
    if (!empId || empId.trim() === "") {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter EMP ID',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (!validFormat) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'EMP ID can only contain letters, numbers, forward slash (/) and hyphen (-)',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    
    // Update local state with the EMP ID value
    const updatedData = filteredData.map(item => 
      item.id === rowId ? { ...item, EMP_ID: empId } : item
    );
    setFilteredData(updatedData);
    setJoiningData(updatedData);
    
    // Exit edit mode
    setEditingRows(prev => {
      const newState = { ...prev };
      delete newState[rowId];
      return newState;
    });
    
    Swal.fire({
      icon: 'success',
      title: 'Saved Locally!',
      text: 'EMP ID saved to local storage. Click Final Submit to permanently save.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Final Submit - Permanently save EMP ID to database
  const handleFinalSubmit = async (rowId, rowData) => {
    try {
      const empId = rowData.EMP_ID || empidValues[rowId];
      
      if (!empId || empId.trim() === "") {
        Swal.fire({
          icon: 'warning',
          title: 'Validation Error',
          text: 'Please enter and save EMP ID before final submission',
          confirmButtonColor: '#3085d6'
        });
        return;
      }

      // Check if already final submitted (EMP_ID already exists in DB)
      if (rowData.isFinalSubmitted) {
        Swal.fire({
          icon: 'info',
          title: 'Already Submitted',
          text: `EMP ID ${empId} has already been final submitted`,
          confirmButtonColor: '#3085d6'
        });
        return;
      }

      const result = await Swal.fire({
        title: 'Confirm Final Submission',
        text: `Are you sure you want to final submit EMP ID: ${empId}? After submission, you cannot edit this EMP ID.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#059669',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Final Submit',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        setIsSaving(true);

        const formData = new FormData();
        formData.append("CHILD_CASEID", rowData?.CHILD_CASEID || "");
        formData.append("EMP_ID", empId);
        formData.append("onBoarding", "4");
        
        const response = await axiosInstance.post(
          `${API_BASE_URL}/on-board-Store`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${Token.token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response?.data?.success || response.status == 200) {
          // Update local data
          const updatedData = filteredData.map(item => 
            item.id === rowId ? { ...item, EMP_ID: empId, isFinalSubmitted: true } : item
          );
          setFilteredData(updatedData);
          setJoiningData(updatedData);
          
          // Remove from temporary localStorage
          setEmpidValues(prev => {
            const newState = { ...prev };
            delete newState[rowId];
            return newState;
          });
          
          // Exit edit mode
          setEditingRows(prev => {
            const newState = { ...prev };
            delete newState[rowId];
            return newState;
          });
          
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: "EMP ID Final Submitted Successfully",
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          throw new Error(response?.data?.message || "Failed to submit");
        }
      }
    } catch (error) {
      console.log("FINAL SUBMIT ERROR:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error?.response?.data?.message || error.message || "Something went wrong",
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setSearchText(searchValue);
    setPaginationModel(prev => ({ ...prev, page: 0 }));

    if (!searchValue) {
      setFilteredData(joiningData);
      return;
    }

    const filtered = joiningData.filter(row => {
      const search = searchValue.toLowerCase();
      return (
        (row.CHILD_CASEID && row.CHILD_CASEID.toLowerCase().includes(search)) ||
        (row.employee_name && row.employee_name.toLowerCase().includes(search)) ||
        (row.email && row.email.toLowerCase().includes(search)) ||
        (row.phone && row.phone.toLowerCase().includes(search)) ||
        (row.department && row.department.toLowerCase().includes(search)) ||
        (row.location && row.location.toLowerCase().includes(search)) ||
        (row.hr_owner && row.hr_owner.toLowerCase().includes(search))
      );
    });
    setFilteredData(filtered);
  };

  const handleJoiningDateChange = (caseId, value) => {
    setJoiningDates(prev => ({
      ...prev,
      [caseId]: value,
    }));
  };

  const hasTypePlant = filteredData?.some(row => row.TYPE_PLANT);
  const recCycle = filteredData?.some(row => row.RECRUIT_CYCLE);

  const columns = [
    {
      field: 'SNO',
      headerName: 'S.NO',
      flex: 0.5,
      minWidth: 70,
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
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 500, color: '#1f2937' }}>
          {params.value}
        </Box>
      ),
    },
    ...(hasTypePlant ? [{
      field: 'TYPE_PLANT',
      headerName: 'Type Plant',
      flex: 1.2,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    }] : []),
    ...(recCycle ? [{
      field: 'RECRUIT_CYCLE',
      headerName: 'Emp Level',
      flex: 1.2,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    }] : []),
    {
      field: 'employee_name',
      headerName: 'Employee Name',
      flex: 1.2,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontWeight: 500 }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.5,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'department',
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
      field: 'MANPOWER_DESG',
      headerName: 'M.Designation',
      flex: 1.2,
      minWidth: 130,
      renderCell: (params) => {
        const subCode = params.row.SUB_CODE;
        const value = params.value || 'N/A';
        return (
          <Box sx={{
            color: '#374151',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
          }}>
            {subCode ? `${subCode} - ${value}` : value}
          </Box>
        );
      },
    },
    {
      field: 'DESIG',
      headerName: 'Designation',
      flex: 1.2,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontSize: '12px' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1.2,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'EMP_ID',
      headerName: 'Emp ID',
      width: 320,
      renderCell: (params) => {
        const rowId = params.row.id;
        const hasSavedValue = params.row.EMP_ID && params.row.EMP_ID.trim() !== '';
        const isEditing = editingRows[rowId];
        const isFinalSubmitted = params.row.isFinalSubmitted;

        // If final submitted (EMP_ID exists in DB), show read-only EMP ID
        if (isFinalSubmitted) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  color: '#10b981',
                  backgroundColor: '#f0fdf4',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  border: '1px solid #bbf7d0'
                }}
              >
                {params.row.EMP_ID}
              </Typography>
            </Box>
          );
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} key={`emp-id-${rowId}-${isEditing}`}>
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
                  {params.row.EMP_ID}
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
                  value={empidValues[rowId] !== undefined ? empidValues[rowId] : params.row.EMP_ID || ""}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setEmpidValues(prev => ({
                      ...prev,
                      [rowId]: newValue === undefined ? '' : newValue
                    }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveToLocalStorage(rowId, params.row);
                    }
                  }}
                  size="small"
                  placeholder="Enter EMP ID"
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
                    width: '130px',
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
                  onClick={() => handleSaveToLocalStorage(rowId, params.row)}
                  disabled={isSaving || !empidValues[rowId] || empidValues[rowId].trim() === ""}
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
  field: 'joining_date',
  headerName: 'Joining Date',
  flex: 1,
  minWidth: 110,
  renderCell: (params) => {
    const formattedDate = params.row.joining_date
      ? new Date(params.row.joining_date).toLocaleDateString('en-GB')
      : '';

    return (
      <TextField
        size="small"
        type="text"
        disabled
        value={formattedDate} // DD-MM-YYYY
        sx={{
          width: '100%',
          '& .MuiOutlinedInput-root': {
            fontSize: '12px',
            height: '32px',
          },
        }}
      />
    );
  },
},
    {
      field: 'joining_status',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value}
          sx={{
            backgroundColor: params.value === 'Joined' ? '#10b981' : '#ef4444',
            color: 'white',
            fontWeight: 600,
            fontSize: '11px',
            height: '24px',
          }}
        />
      ),
    },
    {
      field: 'finalSubmit',
      headerName: 'Final Submit',
      flex: 0.8,
      minWidth: 130,
      renderCell: (params) => {
        const rowId = params.row.id;
        const isFinalSubmitted = params.row.isFinalSubmitted;
        const hasEmpId = params.row.EMP_ID && params.row.EMP_ID.trim() !== '';
        
        // If final submitted (EMP_ID exists in DB), show "Submitted" chip permanently
        if (isFinalSubmitted) {
          return (
            <Chip
              size="small"
              label="Submitted"
              sx={{
                backgroundColor: '#10b981',
                color: 'white',
                fontWeight: 600,
                fontSize: '10px',
                height: '25px',
              }}
            />
          );
        }
        
        // Otherwise show Submit button (enabled only if EMP ID is entered)
        return (
        <Button
    size="small"
    variant="contained"
    
    onClick={() => handleFinalSubmit(rowId, params.row)}
    disabled={!hasEmpId || isSaving}
    sx={{
      borderRadius: '999px',
      height: '24px',
      minWidth: 'unset',
      px: '10px',
      fontSize: '11px',
      textTransform: 'none',
      background: '#8b5cf6',        // ✅ purple bg
      boxShadow: 'none',
      transition: 'all 0.15s',
      '&:hover': {
        background: '#7c3aed',      // ✅ darker purple on hover
        boxShadow: '0 0 0 2px #c4b5fd',
        transform: 'translateY(-1px)',
      },
      '&:active': {
        transform: 'scale(0.96)',
      },
      '&.Mui-disabled': {
        background: '#cbd5e1',      // ✅ grey when disabled
        color: '#fff',
        boxShadow: 'none',
      },
    }}
  >
    Submit
  </Button>
        );
      }
    },
  ];

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
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ flex: 1, maxWidth: '400px' }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search joining reports..."
              value={searchText}
              onChange={handleSearch}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#667eea', fontSize: '20px' }} />
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{
              color: '#64748b',
              minWidth: 'fit-content',
              fontWeight: 500,
              fontSize: '13px'
            }}>
              {filteredData.length} onBoarding List
            </Typography>
          </Box>
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
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50]}
            rowHeight={42}
            columnHeaderHeight={44}
            disableRowSelectionOnClick
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
    </Box>
  );
};

export default OnBoardEmployeeList;