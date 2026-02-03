

// import React, { useState, useEffect } from 'react';
// import { Box, Paper, Typography, Button, Chip, TextField, InputAdornment } from '@mui/material';
// import { DataGrid } from '@mui/x-data-grid';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import EditIcon from '@mui/icons-material/Edit';
// import SearchIcon from '@mui/icons-material/Search';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { API_BASE_URL } from '../Config/Config.jsx';
// import DocUpload from './DocUpload.jsx';
// import History from './History.jsx';

// const JoiningReportList = () => {
//   const [joiningData, setJoiningData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [searchText, setSearchText] = useState('');
//   const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

//   const [selectedRow, setSelectedRow] = useState(null);
//   const [openDocModal, setOpenDocModal] = useState(false);
//   const [openHistoryModal, setOpenHistoryModal] = useState(false);

//   const navigate = useNavigate();
//   const [Token, useToken] = useState(() => {
//     const userToken = JSON.parse(localStorage.getItem('userInfo'));
//     return userToken ? userToken : null;
//   })

//   //----------------------------JoiningDataStart------------------------//
// const joinData = async () => {
//   try {
//     const response = await axios.get(
//       `${API_BASE_URL}/emp-verify-data`,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "Accept": "application/json",
//           "Authorization": `Bearer ${Token.token}`,
//         },
//       }
//     );

    
//     const apiData = response.data.data;

//     console.log(apiData,": API Data");

//     // Filter only items with valid joining dates
//     const formattedRows = apiData
//       .filter(item => {
//         // Check if joiningDate exists and is not null/empty
//         const hasJoiningDate = item.joiningDate && 
//                               item.joiningDate !== '' && 
//                               item.joiningDate !== null &&
//                               item.joiningDate !== undefined &&
//                               item.joiningDate !== 'null';
        
//         // Also check if it's a valid date string (not just whitespace)
//         const isValidDateString = item.joiningDate && 
//                                  item.joiningDate.toString().trim() !== '';
        
//         return hasJoiningDate && isValidDateString;
//       })
//       .map((item, index) => ({
//         id: item.verification_id || index,
//         CHILD_CASEID: item.child_caseid,
//         employee_name: item.name,
//         email: item.email,
//         phone: item.phone_number,
//         department: item.DEPT,
//         location: item.PLANT,
//         joining_date: item.joiningDate,
//         current_ctc: item.CURRENT_CTC,
//         expected_ctc: item.EXP_CTC,
//         offered_ctc: item.OFFER_CTC ?? 'Pending',
//         joining_status: 'Joined',
//         offer_letter: item.OfferLetterFlag ?? 'Pending',
//         bgv_status: item.verification_status ?? 'Pending',
//         documents_status: item.overallDocments_aprvl === '1' ? 'Complete' : 'Pending',
//         current_stage: item.CURRENT_TASK,
//         hr_owner: item.CURRENT_USER,
//         created_at: item.created_at,
//         // Store the entire item for History modal
//         fullData: item,
//       }));
    
//     console.log("Filtered formattedRows (with joining dates):", formattedRows);
//     setJoiningData(formattedRows);
//     setFilteredData(formattedRows);
//   } catch (error) {
//     console.error("Error in fetching joining data", error);
//   }
// };

//   useEffect(() => {
//     if (Token.token) {
//       joinData();
//     }
//   }, [Token.token]);

//   const handleSearch = (e) => {
//     const searchValue = e.target.value;
//     setSearchText(searchValue);
//     setPaginationModel(prev => ({ ...prev, page: 0 }));

//     if (!searchValue) {
//       setFilteredData(joiningData);
//       return;
//     }

//     const filtered = joiningData.filter(row => {
//       const search = searchValue.toLowerCase();
//       return (
//         (row.CHILD_CASEID && row.CHILD_CASEID.toLowerCase().includes(search)) ||
//         (row.employee_name && row.employee_name.toLowerCase().includes(search)) ||
//         (row.email && row.email.toLowerCase().includes(search)) ||
//         (row.phone && row.phone.toLowerCase().includes(search)) ||
//         (row.department && row.department.toLowerCase().includes(search)) ||
//         (row.location && row.location.toLowerCase().includes(search)) ||
//         (row.hr_owner && row.hr_owner.toLowerCase().includes(search))
//       );
//     });
//     setFilteredData(filtered);
//   };

//   const handleDocUploadClick = (rowData) => {
//     setSelectedRow(rowData);
//     setOpenDocModal(true);
//   };

//   const handleHistoryClick = (rowData) => {
//     setSelectedRow(rowData);
//     setOpenHistoryModal(true);
//   };

//   const handleCloseModal = () => {
//     setOpenDocModal(false);
//     setSelectedRow(null);
//   };

//   const handleCloseHistoryModal = () => {
//     setOpenHistoryModal(false);
//     setSelectedRow(null);
//   };

//   const handleDocApprovalClick = (rowData) => {
//     navigate('/DocApproval', { state: { rowData } });
//   };

//   console.log()

//   const columns = [
//     {
//       field: 'SNO',
//       headerName: 'S.NO',
//       flex: 0.5,
//       minWidth: 70,
//       sortable: false,
//       filterable: false,
//       renderCell: (params) => (
//         <Box sx={{ fontWeight: 600, color: '#374151' }}>
//           {params.api.getAllRowIds().indexOf(params.id) + 1}
//         </Box>
//       ),
//     },

//     {
//       field: 'doc_upload',
//       headerName: 'Doc Upload',
//       flex: 0.8,
//       minWidth: 100,
//       sortable: false,
//       renderCell: (params) => (
//         <Button
//           size="small"
//           variant="outlined"
//           startIcon={<VisibilityIcon />}
//           onClick={() => handleDocUploadClick(params.row)}
//           sx={{
//             fontSize: '10px',
//             padding: '4px 8px',
//             borderRadius: '6px',
//             textTransform: 'capitalize',
//             borderColor: '#667eea',
//             color: '#667eea',
//             '&:hover': {
//               borderColor: '#5a67d8',
//               backgroundColor: 'rgba(102, 126, 234, 0.04)',
//             },
//           }}
//         >
//           View
//         </Button>
//       ),
//     },


    
//     {
//       field: 'CHILD_CASEID',
//       headerName: 'Case ID',
//       flex: 1,
//       minWidth: 120,
//       renderCell: (params) => (
//         <Box sx={{ fontWeight: 500, color: '#1f2937' }}>
//           {params.value}
//         </Box>
//       ),
//     },
//     {
//       field: 'employee_name',
//       headerName: 'Employee Name',
//       flex: 1.2,
//       minWidth: 150,
//       renderCell: (params) => (
//         <Box sx={{ color: '#374151', fontWeight: 500 }}>
//           {params.value}
//         </Box>
//       ),
//     },
//     {
//       field: 'email',
//       headerName: 'Email',
//       flex: 1.5,
//       minWidth: 180,
//       renderCell: (params) => (
//         <Box sx={{ color: '#374151' }}>
//           {params.value}
//         </Box>
//       ),
//     },
//     {
//       field: 'phone',
//       headerName: 'Phone',
//       flex: 1,
//       minWidth: 120,
//       renderCell: (params) => (
//         <Box sx={{ color: '#374151' }}>
//           {params.value}
//         </Box>
//       ),
//     },
//     {
//       field: 'department',
//       headerName: 'Department',
//       flex: 1,
//       minWidth: 120,
//       renderCell: (params) => (
//         <Box sx={{ color: '#374151', fontWeight: 500 }}>
//           {params.value}
//         </Box>
//       ),
//     },
//     {
//       field: 'location',
//       headerName: 'Location',
//       flex: 1.2,
//       minWidth: 140,
//       renderCell: (params) => (
//         <Box sx={{ color: '#374151' }}>
//           {params.value}
//         </Box>
//       ),
//     },
//     {
//       field: 'joining_date',
//       headerName: 'Joining Date',
//       flex: 1,
//       minWidth: 110,
//       renderCell: (params) => (
//         <Box sx={{ color: '#6b7280' }}>
//           {params.value}
//         </Box>
//       ),
//     },
//     {
//       field: 'joining_status',
//       headerName: 'Status',
//       flex: 0.8,
//       minWidth: 100,
//       renderCell: (params) => (
//         <Chip
//           size="small"
//           label={params.value}
//           sx={{
//             backgroundColor: params.value === 'Joined' ? '#10b981' : '#ef4444',
//             color: 'white',
//             fontWeight: 600,
//             fontSize: '11px',
//             height: '24px',
//           }}
//         />
//       ),
//     },

//     {
//       field: 'documents_status',
//       headerName: 'Docs Status',
//       flex: 0.8,
//       minWidth: 100,
//       renderCell: (params) => (
//         <Chip
//           size="small"
//           label={params.value}
//           sx={{
//             backgroundColor: params.value === 'Complete' ? '#10b981' : '#f59e0b',
//             color: 'white',
//             fontWeight: 600,
//             fontSize: '11px',
//             height: '24px',
//           }}
//         />
//       ),
//     },

//     {
//       field: 'history',
//       headerName: 'History',
//       flex: 1,
//       minWidth: 140,
//       sortable: false,
//       renderCell: (params) => (
//         <Box sx={{ display: 'flex', gap: 1 }}>
//           <Button
//             size="small"
//             variant="outlined"
//             startIcon={<VisibilityIcon />}
//             onClick={() => handleHistoryClick(params.row)}
//             sx={{
//               fontSize: '10px',
//               padding: '4px 8px',
//               borderRadius: '6px',
//               textTransform: 'capitalize',
//               borderColor: '#667eea',
//               color: '#667eea',
//               '&:hover': {
//                 borderColor: '#5a67d8',
//                 backgroundColor: 'rgba(102, 126, 234, 0.04)',
//               },
//             }}
//           >
//             View
//           </Button>
//         </Box>
//       ),
//     },

//   ];

//   return (
//     <Box sx={{
//       maxWidth: "1400px",
//       margin: "0 auto",
//       padding: "12px",
//     }}>
//       <Paper sx={{
//         width: '100%',
//         padding: 2,
//         borderRadius: '12px',
//         background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
//         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
//         border: '1px solid #e2e8f0',
//       }}>
//         {/* Search bar and Add button */}
//         {/* <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
//           <Box sx={{ flex: 1, maxWidth: '400px' }}>
//             <TextField
//               variant="outlined"
//               size="small"
//               placeholder="Search joining reports..."
//               value={searchText}
//               onChange={handleSearch}
//               fullWidth
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <SearchIcon sx={{ color: '#667eea', fontSize: '20px' }} />
//                   </InputAdornment>
//                 ),
//                 sx: {
//                   borderRadius: '10px',
//                   backgroundColor: '#f8fafc',
//                   height: '38px',
//                   fontSize: '13px',
//                   '&:hover': {
//                     backgroundColor: '#f1f5f9',
//                   },
//                   '&.Mui-focused': {
//                     backgroundColor: '#ffffff',
//                   }
//                 }
//               }}
//               sx={{
//                 "& .MuiOutlinedInput-root": {
//                   "& fieldset": {
//                     borderColor: "#cedef2ff",
//                   },
//                   "&:hover fieldset": {
//                     borderColor: "#d1d6ebff",
//                   },
//                   "&.Mui-focused fieldset": {
//                     borderColor: "#667eea",
//                   },
//                 },
//               }}
//             />
//           </Box>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//             <Typography variant="body2" sx={{
//               color: '#64748b',
//               minWidth: 'fit-content',
//               fontWeight: 500,
//               fontSize: '13px'
//             }}>
//               {filteredData.length} joining reports
//             </Typography>
//             <Button
//               variant="contained"
//               sx={{
//                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                 color: 'white',
//                 fontSize: '12px',
//                 padding: '6px 16px',
//                 borderRadius: '8px',
//                 textTransform: 'capitalize',
//                 fontWeight: 600,
//                 boxShadow: '0 2px 6px rgba(102, 126, 234, 0.3)',
//                 '&:hover': {
//                   background: 'linear-gradient(135deg, #5a67d8 0%, #6a42a0 100%)',
//                   transform: 'translateY(-1px)',
//                   boxShadow: '0 4px 10px rgba(102, 126, 234, 0.4)',
//                 },
//               }}
//             >
//               + Add Joining
//             </Button>
//           </Box>
//         </Box> */}

//         <Box sx={{
//           width: "100%",
//           borderRadius: "10px",
//           overflow: "hidden",
//           border: "1px solid #dfe5f1ff",
//           boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
//         }}>
//           <DataGrid
//             rows={filteredData}
//             columns={columns}
//             paginationModel={paginationModel}
//             onPaginationModelChange={setPaginationModel}
//             pageSizeOptions={[10, 20, 50]}
//             rowHeight={42}
//             columnHeaderHeight={44}
//             disableRowSelectionOnClick
//             sx={{
//               border: "none",
//               "& .MuiDataGrid-columnHeaders": {
//                 borderBottom: "2px solid #e2e8f0",
//               },
//               "& .MuiDataGrid-columnHeader": {
//                 fontWeight: 600,
//                 fontSize: "13px",
//                 color: "#1e293b",
//                 backgroundColor: "rgba(188, 198, 238, 0.5)",
//                 borderRight: "1px solid #e2e8f0",
//               },
//               "& .MuiDataGrid-cell": {
//                 borderBottom: "1px solid #f1f5f9",
//                 borderRight: "1px solid #f1f5f9",
//                 fontSize: "12px",
//                 color: "#374151",
//                 padding: "0 8px",
//                 display: "flex",
//                 alignItems: "center",
//               },
//               "& .MuiDataGrid-row:hover": {
//                 backgroundColor: "#f0f9ff",
//                 cursor: "pointer",
//               },
//               "& .MuiDataGrid-footerContainer": {
//                 borderTop: "1px solid #e2e8f0",
//                 backgroundColor: "#f8fafc",
//                 minHeight: "48px",
//               },
//             }}
//           />
//         </Box>
//       </Paper>

//       {/* DocUpload Modal */}
//       {openDocModal && selectedRow && (
//         <div style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: 'rgba(0,0,0,0.5)',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           zIndex: 9999,
//           padding: '20px'
//         }}>
//           <div style={{
//             background: 'white',
//             borderRadius: '12px',
//             width: '90%',
//             maxWidth: '1000px',
//             maxHeight: '90vh',
//             overflow: 'auto',
//             position: 'relative'
//           }}>
//             <button
//               onClick={handleCloseModal}
//               style={{
//                 position: 'absolute',
//                 top: '15px',
//                 right: '15px',
//                 border: 'none',
//                 fontSize: '32px',
//                 cursor: 'pointer',
//                 color: '#ffffff',
//                 zIndex: 10,
//                 borderRadius: '50%',
//                 width: '40px',
//                 height: '40px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontWeight: 'bold',
//                 transition: 'all 0.2s'
//               }}
//             >
//               ×
//             </button>

//             <DocUpload
//               rowData={selectedRow}
//               onClose={handleCloseModal}
//             />
//           </div>
//         </div>
//       )}

//       {/* History Modal */}
//       {openHistoryModal && selectedRow && (
//         <History
//           open={openHistoryModal}
//           onClose={handleCloseHistoryModal}
//           data={selectedRow.fullData}
//           onStatusChange={() => {
//             // Refresh data after status change
//             joinData();
//           }}
//         />
//       )}
//     </Box>
//   );
// };

// export default JoiningReportList;



import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Chip, TextField, InputAdornment } from '@mui/material';
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

const JoiningReportList = () => {
  const [joiningData, setJoiningData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

  const [selectedRow, setSelectedRow] = useState(null);
  const [openDocModal, setOpenDocModal] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);

  const navigate = useNavigate();
  const [Token, useToken] = useState(() => {
    const userToken = JSON.parse(localStorage.getItem('userInfo'));
    return userToken ? userToken : null;
  })

  //----------------------------JoiningDataStart------------------------//
  const joinData = async () => {
    try {
      const response = await axios.get(
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

      console.log(apiData, ": API Data");

      // Filter only items with valid joining dates
      const formattedRows = apiData
        .filter(item => {
          // Check if joiningDate exists and is not null/empty
          const hasJoiningDate = item.joiningDate &&
            item.joiningDate !== '' &&
            item.joiningDate !== null &&
            item.joiningDate !== undefined &&
            item.joiningDate !== 'null';

          // Also check if it's a valid date string (not just whitespace)
          const isValidDateString = item.joiningDate &&
            item.joiningDate.toString().trim() !== '';

          return hasJoiningDate && isValidDateString;
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
          offered_ctc: item.OFFER_CTC ?? 'Pending',
          joining_status: 'Joined',
          offer_letter: item.OfferLetterFlag ?? 'Pending',
          bgv_status: item.verification_status ?? 'Pending',
          documents_status: item.overallDocments_aprvl === '1' ? 'Complete' : 'Pending',
          current_stage: item.CURRENT_TASK,
          hr_owner: item.CURRENT_USER,
          created_at: item.created_at,
          // Store the entire item for History modal
          fullData: item,
        }));

      console.log("Filtered formattedRows (with joining dates):", formattedRows);
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

  console.log()

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
      minWidth: 110,
      renderCell: (params) => (
        <Box sx={{ color: '#6b7280' }}>
          {params.value}
        </Box>
      ),
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
      field: 'documents_status',
      headerName: 'Docs Status',
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value}
          sx={{
            backgroundColor: params.value === 'Complete' ? '#10b981' : '#f59e0b',
            color: 'white',
            fontWeight: 600,
            fontSize: '11px',
            height: '24px',
          }}
        />
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
            {/* <button
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                border: 'none',
                fontSize: '32px',
                cursor: 'pointer',
                color: '#ffffff',
                zIndex: 10,
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              ×
            </button> */}

            <DocUpload
              rowData={selectedRow}
              onClose={handleCloseModal}
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