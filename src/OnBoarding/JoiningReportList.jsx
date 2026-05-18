



import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Chip, TextField, InputAdornment, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../Config/Config.jsx';
import DocUpload from './DocUpload.jsx';
import History from './History.jsx';
import Swal from 'sweetalert2';
import { FilePen } from 'lucide-react';
import JoiningReportForm from './JoiningReportForm.jsx';
import axiosInstance from '../Config/axiosConfig.jsx';

const JoiningReportList = () => {
  const [joiningData, setJoiningData] = useState([]);
const [savedRows, setSavedRows] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

  const [selectedRow, setSelectedRow] = useState(null);
  const [openDocModal, setOpenDocModal] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
const [openReportModal, setOpenReportModal] = useState(false);

    const [joiningDates, setJoiningDates] = useState({});

  const navigate = useNavigate();
  const [Token, useToken] = useState(() => {
    const userToken = JSON.parse(localStorage.getItem('userInfo'));
    return userToken ? userToken : null;
  })

  //----------------------------JoiningDataStart------------------------//
  const joinData = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/emp-verify-data`,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${Token?.token}`,
          },
        }
      );


      const apiData = response.data.data;

  


const formattedRows = apiData
  .filter(item => {
    const hasJoiningDate =
      item.onBoarding == "1" || item.onBoarding == "2";

    return hasJoiningDate;
  })
  .map((item, index) => ({
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
hrEvaluationFile:item?.hrEvaluationFile,
  

    joining_status: 'Joined',
    offer_letter: item.OfferLetterFlag ?? '',
    bgv_status: item.verification_status ?? '',
    documents_status: item.overallDocments_aprvl === '1' ? 'Complete' : 'Pending',
    current_stage: item.CURRENT_TASK,
    hr_owner: item.CURRENT_USER,
    created_at: item.created_at,
    fullData: item,
  }));


      console.log("Filtered formattedRows (with joining dates):", apiData);
      setJoiningData(formattedRows);
      setFilteredData(formattedRows);
    } catch (error) {
      console.error("Error in fetching joining data", error);
    }
  };



  useEffect(() => {
    if (Token?.token) {
      joinData();
    }
  }, [Token?.token]);




  const handleReportClick = (rowData) => {
  setSelectedRow(rowData);
  setOpenReportModal(true); 
};
const handleCloseReportModal = () => {
  setOpenReportModal(false);
  setSelectedRow(null);
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

  

  const handleDocUploadClick = (rowData) => {
    setSelectedRow(rowData);
    setOpenDocModal(true);
  };

  const handleHistoryClick = (rowData) => {
    setSelectedRow(rowData);
    setOpenHistoryModal(true);
  };

  const handleCloseModal = () => {
    setOpenDocModal(false);
    setSelectedRow(null);
     
  };

  const handleCloseHistoryModal = () => {
    setOpenHistoryModal(false);
    setSelectedRow(null);
  };

  const handleDocApprovalClick = (rowData) => {
    navigate('/DocApproval', { state: { rowData } });
  };


const handleJoiningDateChange = (caseId, value) => {
  setJoiningDates((prev) => ({
    ...prev,
    [caseId]: value,
  }));

  // 🔥 mark as not saved when user edits again
  setSavedRows((prev) => ({
    ...prev,
    [caseId]: false,
  }));
};

  const handleViewOfferLetter = async (user) => {

  try {


    const payload = {
      CHILD_CASEID: user.CHILD_CASEID,
       joiningDate: date_only,
    };

    const response = await axiosInstance.post(
      `${API_BASE_URL}/join-Date-updt`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${Token.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );


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



const handleSaveJoiningDate = async (user) => {
  try {
    const caseId = user.CHILD_CASEID;

    const payload = {
      CHILD_CASEID: caseId,
      joiningDate:
        joiningDates[caseId] ||
        (user.joining_date ? user.joining_date.split('T')[0] : ''),
    };

    await axiosInstance.post(
      `${API_BASE_URL}/join-Date-updt`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${Token.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    Swal.fire({
      icon: "success",
      title: "Saved",
      text: "Joining date updated successfully",
    });

    // ✅ mark as saved
    setSavedRows((prev) => ({
      ...prev,
      [caseId]: true,
    }));

  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error?.response?.data?.message || "Update failed",
    });
  }
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
  field: 'joiningreport',
  headerName: 'Joining Report',
  flex: 0.5,
  minWidth: 120,
  sortable: false,
  renderCell: (params) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        size="small"
        variant="contained"
        startIcon={<FilePen size={13} strokeWidth={2} />}
        onClick={() => handleReportClick(params.row)}
        sx={{
          fontSize: '10px',
          padding: '4px 10px',
          borderRadius: '8px',
          textTransform: 'capitalize',
          backgroundColor: '#0ea5e9',
          fontWeight: 600,
          boxShadow: '0 2px 4px rgba(14, 165, 233, 0.2)',
          '&:hover': {
            backgroundColor: '#0284c7',
            boxShadow: '0 4px 6px rgba(14, 165, 233, 0.3)',
            transform: 'translateY(-1px)',
          },
        }}
      >
        Click Here
      </Button>
    </Box>
  ),
},
  

   {
      field: 'history',
      headerName: 'History',
      flex: 1,
      minWidth: 140,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<HistoryIcon />}
            onClick={() => handleHistoryClick(params.row)}
            sx={{
              fontSize: '10px',
              padding: '4px 10px',
              borderRadius: '8px',
              textTransform: 'capitalize',
              backgroundColor: '#8b5cf6',
              fontWeight: 600,
              boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)',
              '&:hover': {
                backgroundColor: '#7c3aed',
                boxShadow: '0 4px 6px rgba(139, 92, 246, 0.3)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            View
          </Button>
        </Box>
      ),
    },


      {
      field: 'doc_upload',
      headerName: 'Doc Upload',
      flex: 0.8,
      minWidth: 100,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          startIcon={<DescriptionIcon />}
          onClick={() => handleDocUploadClick(params.row)}
          sx={{
            fontSize: '10px',
            padding: '4px 10px',
            borderRadius: '8px',
            textTransform: 'capitalize',
            backgroundColor: '#10b981',
            fontWeight: 600,
            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
            '&:hover': {
              backgroundColor: '#059669',
              boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          View
        </Button>
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

            ...(hasTypePlant
            ? [{
                field: 'TYPE_PLANT',
                headerName: 'Type Plant',
                minWidth: 150,
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
      field: 'location',
      headerName: 'Location',
      flex: 1.2,
      minWidth: 140,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },
{
  field: 'joining_date',
  headerName: 'Joining Date',
  flex: 1,
  minWidth: 200,
  renderCell: (params) => {
    const caseId = params.row.CHILD_CASEID;

    return (
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%' }}>
        
        <TextField
          size="small"
          type="date"
          value={
            joiningDates[caseId] ??
            (params.row.joining_date
              ? params.row.joining_date.split('T')[0]
              : '')
          }
          onChange={(e) =>
            handleJoiningDateChange(caseId, e.target.value)
          }
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              fontSize: '12px',
              height: '32px',
            },
          }}
        />

  <Button
  variant="contained"
  size="small"
  onClick={() => handleSaveJoiningDate(params.row)}
  sx={{
    borderRadius: '999px',
    height: '24px',
    minWidth: 'unset',
    px: '9px',
    fontSize: '11px',
    textTransform: 'none',
    border: 'none',
    boxShadow: 'none',
    transition: 'all 0.15s',
    background: savedRows[caseId] ? '#22c55e' : '#156ee2', // green or blue
    '&:hover': {
      background: savedRows[caseId] ? '#16a34a' : '#0f5bd1',
      boxShadow: 'none',
    },
    '&:disabled': {
      background: '#cbd5e1',
      color: '#fff',
    },
  }}
>
  {savedRows[caseId] ? 'Saved' : 'Save'}
</Button>
      </div>
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

    // {
    //   field: 'documents_status',
    //   headerName: 'Docs Status',
    //   flex: 0.8,
    //   minWidth: 100,
    //   renderCell: (params) => (
    //     <Chip
    //       size="small"
    //       label={params.value}
    //       sx={{
    //         backgroundColor: params.value === 'Complete' ? '#10b981' : '#f59e0b',
    //         color: 'white',
    //         fontWeight: 600,
    //         fontSize: '11px',
    //         height: '24px',
    //       }}
    //     />
    //   ),
    // },

   

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
              {filteredData.length} joining reports
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

      {/* DocUpload Modal */}
   {/* DocUpload Modal */}
{openDocModal && selectedRow && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: '20px'
  }}>
    <div style={{
      background: 'white',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '1000px',
      maxHeight: '90vh',
      overflow: 'auto',
      position: 'relative'
    }}>
      <DocUpload
        rowData={selectedRow}
        onClose={() => {
          setOpenDocModal(false);
          // Refresh the table data when modal closes
          joinData();
        }}
        refreshTable={joinData}
        Report="JoiningReportList"
      />
    </div>
  </div>
)}
{openReportModal && selectedRow && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: '20px'
  }}>
    <div style={{
      background: 'white',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '1000px',
      maxHeight: '90vh',
      overflow: 'auto',
      position: 'relative'
    }}>
      {/* Close Button */}
      <button
        onClick={handleCloseReportModal}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          border: 'none',
          background: '#ef4444',
          fontSize: '18px',
          cursor: 'pointer',
          color: '#fff',
          zIndex: 10,
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
        }}
      >
        ×
      </button>

    
      <JoiningReportForm
        rowData={selectedRow}
        onClose={handleCloseReportModal}
      
      />
    </div>
  </div>
)}
      {/* History Modal */}
      {openHistoryModal && selectedRow && (
        <History
          open={openHistoryModal}
          onClose={handleCloseHistoryModal}
          data={selectedRow.fullData}
          onStatusChange={() => {
            // Refresh data after status change
            joinData();
          }}
        />
      )}
    </Box>
  );
};

export default JoiningReportList;