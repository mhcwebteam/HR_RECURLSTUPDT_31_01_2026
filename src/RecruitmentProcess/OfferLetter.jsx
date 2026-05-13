




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
  DialogActions,
  DialogTitle
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Cancel,
  Visibility,
  Refresh,
  Download,
  Close,
  BadgeOutlined,
  CommentOutlined,
  EventAvailable,
  EventNote
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { ContextData } from '../Context/ContextData';
import {API_BASE_URL} from '../Config/Config.jsx';
import OfferLetterModal from './OfferLetterModal';
import { Info, UndoDot } from 'lucide-react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import axiosInstance from '../Config/axiosConfig.jsx';
dayjs.extend(customParseFormat);


const OfferLetter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState({});
  const [joiningDates, setJoiningDates] = useState({});
  const [offerLetterOpen, setOfferLetterOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [ofrList,setOfferLetterData]=useState([]);
 const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

 const [selectedRejectedRow, setSelectedRejectedRow] = useState(null);


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


    const handleViewRejectedDetails = (row) => {
    setSelectedRejectedRow(row);
    setDetailsDialogOpen(true);
  };






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





    const payload = {
        CHILD_CASEID: row?.CHILD_CASEID,
        RevisionTrackStatus:"Offer Letter",
          deletecase: "02"
    
      };

      const response = await axiosInstance.post(
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
      text: `The row is moved to the action tab`,
      timer: 1500,
      showConfirmButton: false,
    });

    if(fetchOfrData) {

  await   fetchOfrData()
    }

  


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

  
 
  const handleOfferLterEmail=async(rowData) =>

  {
    try

    {
      const date_only = joiningDates[rowData.CHILD_CASEID];
    
    if (!date_only) {
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select a joining date before sending the offer letter.',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    // 🔵 Show confirmation dialog
    const confirm = await Swal.fire({
      title: "Confirm Send Email",
      text: `Send offer letter to ${rowData.FIRST_NAME}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Send Email",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    // Show loading state
    Swal.fire({
      title: 'Sending Email...',
      text: 'Please wait while we send the offer letter',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
   


        const  payload =
        {
          CHILD_CASEID:rowData.CHILD_CASEID,
          EMAIL     :rowData.EMAIL,
          // joiningDate: date_only,
          joiningDate: dayjs(date_only, "DD-MM-YYYY").format("YYYY-MM-DD")
        }

        
      const ofrMailSend = await axiosInstance.post(`${API_BASE_URL}/ofr-ltr-issue-mail`,payload,
        {
        headers:
        {
           "Content-Type" :"application/json",
           "Accept"       :"application/json",
           "Authorization":`Bearer ${token.token}`
         }})

       
      if (ofrMailSend.data.message) 
        {
       

    await Swal.fire({
      icon: "success",
      title: "Success",
      text: `Offer letter has been sent to ${rowData.EMAIL}`,

      timer: 1500,
      showConfirmButton: false,
    });

    if(fetchOfrData) {
     await  fetchOfrData()
    }

           
         } else {

           await Swal.fire("Failed", response.data.message, "error");

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
    const ofrdata = await axiosInstance.get(`${API_BASE_URL}/offer-issue-list`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token.token}`,
      }
    });
    const list = ofrdata.data.evcVerifiedData || [];

      const filtered = list.filter(
      (item) =>
        item.HR == "Approved" &&
        item.DIRECTOR == "Approved" &&
        item.EVC == "Approved"
    );

    setOfferLetterData(filtered);

   
   const prefilled = {};
    list.forEach((item) => {
      const rawDate = item.JOINING_DATE || item.joiningDate || item.JOIN_DATE || item.DOJ;
      if (rawDate) {
        try {
          const date = new Date(rawDate);
          if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const formatted = `${day}-${month}-${year}`;
            prefilled[item.CHILD_CASEID] = formatted;
          } else {
            // If the date is already in DD-MM-YYYY format, keep it as is
            prefilled[item.CHILD_CASEID] = rawDate;
          }
        } catch (e) {
          prefilled[item.CHILD_CASEID] = rawDate;
        }
      }
    });

    setJoiningDates(prefilled);

  } catch (err) {
    console.error("Error In Fetching Offer List");
  }
};

  
  

useEffect(() => {
  if (token?.token) {
    fetchOfrData();
  }
}, [token?.token]);



  const handleViewOfferLetter = async (user) => {

  try {

 const date_only = joiningDates[user.CHILD_CASEID];

    const payload = {
      CHILD_CASEID: user.CHILD_CASEID,
       joiningDate: date_only,
    };

    const response = await axiosInstance.post(
      `${API_BASE_URL}/join-Date-updt`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );



setOfferLetterOpen(true);
    

setSelectedCandidate({ ...user });

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

console.log("uuuuuuuuuuuuuuuuuuuuuuuuuuu",ofrList);


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
        padding: '4px 10px',  // Reduced vertical padding
        borderRadius: '6px',
        fontSize: '10px',  // Smaller font
        fontWeight: 600,
        textTransform: 'capitalize',
        lineHeight: 1.2,  // Tighter line height
        height: '25px',  // Fixed small height
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

  const handleStatusChange = (updateData) => {
    console.log('Status updated:', updateData);
  };

  const formatDate = (dateStr) => {
  return dayjs(dateStr, "DD-MM-YYYY").toDate();
};

// const formatDate = (dateStr) => {
//   if (!dateStr) return null;

//   let [day, month, year] = dateStr.split('-');

//   // ✅ Ensure 2-digit format
//   day = day.padStart(2, '0');
//   month = month.padStart(2, '0');

//   return new Date(`${day}-${month}-${year}`);
// };

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
      minWidth: 50,
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
      minWidth: 100,
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
                    flex: 1.2,
                    minWidth: 100,
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
                    minWidth: 100,
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
}
,

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
      headerName: 'Phone No',
      flex: 0.9,
      minWidth: 100,
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
      width: 100,
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
      width: 100,
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
      width: 100,
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
      width: 100,
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
  field: 'Date of Joining',
  headerName: 'Date of Joining',
  flex: 1.1,
  minWidth: 140,
  renderCell: (params) => (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        format="DD-MM-YYYY"
        reduceAnimations

        value={
          joiningDates[params.row.CHILD_CASEID]
            ? dayjs(joiningDates[params.row.CHILD_CASEID], 'DD-MM-YYYY', true)
            : null
        }

        // ✅ ONLY update state when valid (no lag)
        onChange={(newValue) => {
          if (!newValue) {
            handleJoiningDateChange(params.row.CHILD_CASEID, '');
            return;
          }

          if (newValue.isValid()) {
            handleJoiningDateChange(
              params.row.CHILD_CASEID,
              newValue.format('DD-MM-YYYY')
            );
          }
        }}

        // ❌ IMPORTANT: do nothing here to avoid lag
        onInputChange={() => {}}

        slotProps={{
          // ✅ Action buttons
          actionBar: {
            actions: ['clear', 'today'],
            sx: {
              '& button': {
                fontSize: '10px',
                padding: '2px 6px',
              },
            },
          },

          // ✅ POPPER (compact + no gap + aligned)
          popper: {
            sx: {
              '& .MuiPaper-root': {
                padding: '2px',
              },

              '& .MuiPickersLayout-root': {
                height: 'auto',
              },
              '& .MuiPickersLayout-contentWrapper': {
                height: 'auto',
              },

              '& .MuiDateCalendar-root': {
                width: '220px',
                height: '220px',
                margin: 0,
              },

              '& .MuiDayCalendar-header': {
                display: 'flex',
                justifyContent: 'space-between',
              },

              '& .MuiDayCalendar-weekContainer': {
                display: 'flex',
                justifyContent: 'space-between',
                margin: 0,
              },

              '& .MuiDayCalendar-monthContainer': {
                margin: 0,
              },

              '& .MuiPickersLayout-actionBar': {
                marginTop: '2px',
                padding: '2px 4px',
              },
            },
          },

          // ✅ SMALL DAY CELLS
          day: {
            sx: {
              width: 24,
              height: 24,
              fontSize: '10px',
              margin: '1px',
            },
          },

          // ✅ HEADER
          calendarHeader: {
            sx: {
              minHeight: '30px',
              '& .MuiTypography-root': {
                fontSize: '12px',
              },
              '& .MuiIconButton-root': {
                padding: '4px',
              },
            },
          },

          // ✅ INPUT FIELD
          textField: {
            size: 'small',
            fullWidth: true,
            InputProps: {
              sx: {
                height: 28,
                fontSize: '10px',
                padding: '0 6px',
              },
            },
            inputProps: {
              placeholder: 'DD-MM-YYYY',
              style: {
                padding: '4px 6px',
                fontSize: '10px',
              },
            },
            sx: {
              '& .MuiOutlinedInput-root': {
                height: 28,
                fontSize: '10px',
              },
              '& .MuiInputBase-input': {
                padding: '4px 6px',
              },
              '& .MuiSvgIcon-root': {
                fontSize: '16px',
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  ),
},
   
    {
      field: 'View',
      headerName: 'View Offer',
      width: 100,
      sortable: false,

renderCell: (params) => {
  const caseId = params.row.CHILD_CASEID;
  const hasDate = joiningDates?.[caseId];

  console.log(hasDate, "frrrrrrrrrrrrrrr");

  if (!hasDate) return null;

  return (   // ✅ THIS WAS MISSING
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
  );
}
    },

        {
      field: 'ofrLetterStatus',
      headerName: 'C.Status',
      flex: 0.9,
      minWidth: 120,
      renderCell: (params) => getStatusChip(params.value),
    },


     {
  
        field: 'ACTIONTAB',
  
        headerName: 'Action Tab',
  
        flex: 1,
  
        minWidth: 110,
  
        sortable: false,
  
        filterable: false,
  
        renderCell: (params) => {
  
           const status = params.row.ofrLetterStatus?.trim().toLowerCase();

    // ❌ Hide button for non-reject rows
    if (status !== "reject") return null;

  
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
  field: 'History',
  headerName: 'C.History',
  flex: 0.6,
  minWidth: 100,
  sortable: false,
  filterable: false,
  renderCell: (params) => {
              const status = params.row.ofrLetterStatus?.trim().toLowerCase();

 if (!["reject", "modify"].includes(status)) return null;


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
  field: 'actions',
  headerName: 'Actions',
  width: 120,
  sortable: false,
  renderCell: (params) => (
    <Tooltip title="Send Email">
      <Button
        size="small"
        variant="contained"
        onClick={() => handleOfferLterEmail(params.row)}
        sx={{
          backgroundColor: '#10b981',
          textTransform: 'none',
          fontSize: '12px',
          '&:hover': {
            backgroundColor: '#059669',
          },
        }}
      >
        Send Email
      </Button>
    </Tooltip>
  ),
}
  ], [joiningDates]);



  


      const RejectedDetailsDialog = ({ open, onClose, data }) => {

        console.log("gggggggggggg",data);
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
          {data?.ofrLetterStatus || 'Offer Letter'} Candidate Details
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
          <Typography sx={{ fontSize: '13px', fontWeight: 500, color: data?.ofrLetterStatus ? '#111827' : '#c4c4c4', fontStyle: data?.ofrLetterStatus ? 'normal' : 'italic' }}>
            {data?.ofrLetterStatus || 'Not provided'}
          </Typography>
        </Box>
      </Box>

      {/* Remarks */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: '9px 12px', borderRadius: '10px', background: '#0ea5e908', border: '1px solid #0ea5e91a', transition: 'all 0.15s', '&:hover': { background: '#0ea5e912', borderColor: '#0ea5e933', transform: 'translateX(2px)' } }}>
        <Box sx={{ width: 30, height: 30, borderRadius: '8px', background: '#0ea5e918', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CommentOutlined sx={{ fontSize: 15, color: '#0ea5e9' }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.55px', color: '#9ca3af', mb: '2px' }}>Candidate Remarks</Typography>
          <Typography sx={{ fontSize: '13px', fontWeight: 500, color: data?.ofrLetterRemarks ? '#111827' : '#c4c4c4', fontStyle: data?.ofrLetterRemarks ? 'normal' : 'italic' }}>
            {data?.ofrLetterRemarks || 'No remarks provided'}
          </Typography>
        </Box>
      </Box>

      {/* Dates side by side */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: '9px 12px', borderRadius: '10px', background: '#10b98108', border: '1px solid #10b9811a', transition: 'all 0.15s', '&:hover': { background: '#10b98112', transform: 'translateX(2px)' } }}>
          <Box sx={{ width: 30, height: 30, borderRadius: '8px', background: '#10b98118', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <EventAvailable sx={{ fontSize: 15, color: '#10b981' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.55px', color: '#9ca3af', mb: '2px' }}>Joining Date</Typography>
            <Typography sx={{ fontSize: '13px', fontWeight: 500, color: data?.joiningDate ? '#111827' : '#c4c4c4', fontStyle: data?.joiningDate ? 'normal' : 'italic' }}>

   {data?.joiningDate
    ? dayjs(data.joiningDate).format("DD/MM/YYYY")
    : "Not set"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: '9px 12px', borderRadius: '10px', background: '#f59e0b08', border: '1px solid #f59e0b1a', transition: 'all 0.15s', '&:hover': { background: '#f59e0b12', transform: 'translateX(2px)' } }}>
          <Box sx={{ width: 30, height: 30, borderRadius: '8px', background: '#f59e0b18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <EventNote sx={{ fontSize: 15, color: '#f59e0b' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.55px', color: '#9ca3af', mb: '2px' }}>Requested Join Date</Typography>
        <Typography
  sx={{
    fontSize: '13px',
    fontWeight: 500,
    color: data?.Candid_Reqstd_Join_date ? '#111827' : '#c4c4c4',
    fontStyle: data?.Candid_Reqstd_Join_date ? 'normal' : 'italic'
  }}
>
   {data?.Candid_Reqstd_Join_date
    ? dayjs(data.Candid_Reqstd_Join_date).format("DD/MM/YYYY")
    : "Not set"}
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

            columnVisibilityModel={{
  ACTIONTAB: filteredData?.some((row) => {
    const status = row.ofrLetterStatus?.trim().toLowerCase();
    return status == "reject";
  }) || false,

  History: filteredData?.some((row) => {
    const status = row.ofrLetterStatus?.trim().toLowerCase();
    return status == "reject" || status == "modify";
  }) || false,
}}
        rowHeight={40}
            columnHeaderHeight={42}
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": 
              {
                borderBottom: "2px solid #e2e8f0",
              },
              "& .MuiDataGrid-columnHeader": 
              {
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

                 <RejectedDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        data={selectedRejectedRow}
      />
    </Box>
  );
};

export default OfferLetter;





