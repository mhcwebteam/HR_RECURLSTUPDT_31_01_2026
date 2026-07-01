


import React, { useState, useEffect, useContext, useMemo } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import {
  Paper,
  Box,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem, 
  Grid, 
  Chip, 
  Typography
} from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckIcon from '@mui/icons-material/Check';
import {
  Search,
  CheckCircle,
  Cancel,
  Visibility,
  Refresh,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { ContextData } from "../Context/ContextData";
import CandidateStackDetailsModal from "./CandidateStackDetailsModal";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { API_BASE_URL } from "../Config/Config";
import axiosInstance from "../Config/axiosConfig";
import HRMView from "./HRMView";


/* ===================================================== */

const NoteForApprovals = () => {
  /* -------------------- STATE -------------------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [noteAprvlData, setNoteAprvlData] = useState([]);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveRow, setApproveRow] = useState(null);
  const [approveOpen, setApproveOpen] = useState(false);
  // Add these state variables with your other state declarations
const [flowModalOpen, setFlowModalOpen] = useState(false);
 const [ personalData,setPersonalData] = useState([]);





  const [token] = useState(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    return userInfo ? userInfo : null;
  });





   const EmpVerify = async () => {
 

  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/emp-verify-drftdata`,
      {
  headers: { Authorization: `Bearer ${token.token}` },
      }
    );





  setPersonalData(response.data?.data);



  } catch (err) {
    console.error("Error fetching verify data", err);
  
  }
};

useEffect(() => {
  EmpVerify();
}, [token?.token]);





  
const noteFrAprvlData = async () => {
  try {
    const res = await axiosInstance.get(
      `${API_BASE_URL}/getNt-aprvl-data`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token?.token}`,
        },
      }
    );

    const verifyData = res?.data?.VerifyData;

 
 setNoteAprvlData(verifyData);


    console.log("verifyDataverifyDataverifyData",verifyData);

  } catch (err) {
    console.error("Error fetching approval data", err);
  }
};



  useEffect(() => {
    if (token?.token) {
      noteFrAprvlData();
    }
  }, [token]);
  


  
 
  const assignApprover = async (row, role) => {
console.log(row,"rowwwwwwwwwwwwww");
  const result = await Swal.fire({
    title: 'Confirm Approver Assignment',
    text: `Are you sure you want to send this to ${role} for approval?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, Send!',
    cancelButtonText: 'Cancel'
  });

  // ✅ IF USER CLICKS "NO", STOP EXECUTION
  if (!result.isConfirmed) {
    return;
  }

    try {
      const payload = {
        child_case_id: row.CHILD_CASEID,
        verification_id: row.id,
        approver_role: role,
         dept: row?.DEPT,
         
      };
    


            const response = await axiosInstance.post(
        `${API_BASE_URL}/assign-approval-flow`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token.token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );


      await Swal.fire({
      icon: 'success',
      title: 'Assigned!',
      text: `Successfully sent to ${role} for approval`,
      timer: 1500,
      showConfirmButton: false,
    });

      
if(noteFrAprvlData) {
  await noteFrAprvlData();
}
  
    } catch (err) {

      console.error("Approver Assign Error", err);
    await Swal.fire({
      icon: 'error',
      title: 'Assignment Failed',
      text: err.response?.data?.message || 'Failed to assign approver',
      confirmButtonColor: '#ef4444',
    });
    }
  };

  const filteredData = useMemo(() => {
  if (!Array.isArray(noteAprvlData)) return [];
  let result = [...noteAprvlData];
  
  // For HR users, filter out records where all approvals are complete
  

  
  return result.map((item, index) => ({
    id: item.verification_id,
    SNO: index + 1,
    CHILD_CASEID: item.CHILD_CASEID,
    PLANT: item.PLANT,
    FIRST_NAME: `${item.FIRST_NAME || ''} ${item.LAST_NAME || ''}`.trim(),
    EMAIL: item.EMAIL,
    PHONE_NUMBER: item.PHONE_NUMBER,
    DEPT: item.DEPT,
    CURRENT_CTC: item.CURRENT_CTC,
    EXP_CTC: item.EXP_CTC,
    OFFER_CTC: item.OFFER_CTC,

    MANPOWER_DESG: item.MANPOWER_DESG,
TYPE_PLANT: item?.TYPE_PLANT,
GROUP_CODE: item?.GROUP_CODE,
SUB_CODE: item?.SUB_CODE,
SUB_POST: item?.SUB_POST,

RECRUIT_CYCLE: item?.RECRUIT_CYCLE,

    HR: item.HR,
    DIRECTOR: item.DIRECTOR,
    HOD: item.HOD,
    EVC: item.EVC,
    STATUS: item.status,
    REVID: item.CUR_REV_ID,
     DESIG: item.DESIG,

    SUBMITTED_DATE: item.created_at,
  }));
}, [noteAprvlData, searchTerm, statusFilter, token?.Emp_Category]);


// const getCurrentStep = (row) => {
//   if (row.HR !== "Approved") return "HR";
//   if (row.DIRECTOR !== "Approved") return "DIRECTOR";
//   if (row.EVC !== "Approved") return "EVC";
//   return null;
// };


// const getStatusBadge = (row, role) => {
//   const currentStep = getCurrentStep(row);

//   let type = "";

//   if (row[role] === "Approved") {
//     type = "approved";
//   } else if (currentStep === role) {
//     type = "wip";
//   } else {
//     type = "pending";
//   }

//   const style =
//     type === "approved"
//       ? { bg: "#10b981", color: "#fff", text: "Approved", icon: "✓" }
//       : type === "wip"
//       ? { bg: "#3b82f6", color: "#fff", text: "WIP", icon: "⚡" }
//       : { bg: "#f59e0b", color: "#fff", text: "Pending", icon: "⏳" };

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         backgroundColor: style.bg,
//         color: style.color,
//         fontSize: "10px",
//         fontWeight: 600,
//         height: "25px",
//         minWidth: "80px",
//         borderRadius: "6px",
//         gap: "4px",
//         px: 1.5,
//         boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//         textTransform: "capitalize",
//       }}
//     >
//       <span>{style.icon}</span>
//       <span>{style.text}</span>
//     </Box>
//   );
// };

 

  /* -------------------- STATUS CHIP -------------------- */
  const getStatusChip = (status) => {
    const statusValue = status?.toLowerCase();
    const config = {
      verified: { color: "#10b981" },
      pending: { color: "#f59e0b"  },
      rejected: { color: "#ef4444" },
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
          backgroundColor: color,
          color: "#fff",
          padding: '4px 10px',
          height: '25px', 
          borderRadius: "6px",
          fontSize: "10px",
          fontWeight: 600,
          textTransform: 'capitalize',
          display: "flex",
          alignItems: "center",
          gap: '4px',
        }}>
          {icon}
          {statusValue || ""}
        </Box>
      </Box>
    );
  };

   const hasTypePlant = noteAprvlData?.some(row => row.TYPE_PLANT);

  const recCycle = noteAprvlData?.some(row => row.RECRUIT_CYCLE);

  const HR = token?.Emp_Category;

  console.log("hrrrrrrrrrrrrrr",HR);





  /* ------------------------- COLUMNS -------------------- */
  const columns = [
    { 
      field: "SNO", 
      headerName: "S.NO", 
      flex: 0.5,
      minWidth: 50,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600, color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },



   ...(token?.Emp_Category !== "HR" ? [{
    field: "View",
    headerName: "Action",
    width: 80,
    sortable: false,
    renderCell: (params) => (
      <Button
        variant="contained"
        size="small"
        onClick={() => {
          setSelectedUser(params.row);
          setModalOpen(true);
        }}
        sx={{
          background: 'linear-gradient(135deg, #16a211 0%, #239a11 100%)',
          color: 'white',
          fontSize: '8px',
          fontWeight: 700,
          padding: '6px 8px',
          borderRadius: '5px',
          textTransform: 'uppercase',
          boxShadow: '0 2px 6px rgba(60, 157, 89, 0.3)',
          minWidth: '70px',
          '&:hover': {
            background: 'linear-gradient(135deg, #066332 0%, #1b780a 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 10px rgba(59, 130, 246, 0.4)',
          },
        }}
      >
        Approve
      </Button>
    )
  }] : []),

    
    { 
      field: "CHILD_CASEID", 
      headerName: "Case ID", 
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
                 minWidth: 80,
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
      field: "REVID", 
      headerName: "Rev ID", 
      flex: 1,
      minWidth: 60,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 500, color: '#1f2937' }}>
        {params.value || "00"} 
        </Box>
      ),
    },


    { 
      field: "PLANT", 
      headerName: "Plant", 
      flex: 1.5,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },


    { 
      field: "FIRST_NAME", 
      headerName: "Candidate Name", 
      flex: 1.2,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600, color: '#1f2937' }}>
          {params.value}
        </Box>
      ),
    },


    { 
      field: "EMAIL", 
      headerName: "Email", 
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontSize: '12px' }}>
          {params.value}
        </Box>
      ),
    },
        { 
      field: "PHONE_NUMBER", 
      headerName: "Phone", 
      flex: 0.9,
      minWidth: 100,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontWeight: 500 }}>
          {params.value}
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
      field: "CURRENT_CTC",
      headerName: "Current CTC",
      width: 100,
      renderCell: (params) => (
        <Box sx={{ color: '#059669', fontWeight: 600, fontSize: '12px' }}>
          ₹{params.value ?? 0}
        </Box>
      ),
    },
    {
      field: "EXP_CTC",
      headerName: "Expected CTC",
      width: 100,
      renderCell: (params) => (
        <Box sx={{ color: '#059669', fontWeight: 600, fontSize: '12px' }}>
          ₹{params.value ?? 0}
        </Box>
      ),
    },
    {
      field: "OFFER_CTC",
      headerName: "Offer CTC",
      width: 100,
      renderCell: (params) => (
        <Box sx={{ color: '#dc2626', fontWeight: 600, fontSize: '12px' }}>
          ₹{params.value ?? 0}
        </Box>
      ),
    },
    {
      field: "STATUS",
      headerName: "Overall Status",
      flex: 0.9,
      minWidth: 80,
      renderCell: (params) => getStatusChip(params.value),
    },
   

    // Add this column to your columns array in NoteForApprovals.js

{
  field: "viewFlow",
  headerName: "NFA Flow",
  flex: 1,
  minWidth: 120,
  sortable: false,
  renderCell: (params) => (
    <Button
      variant="outlined"
      size="small"
      onClick={() => {
        setSelectedUser(params.row);
        setFlowModalOpen(true);
      }}
      sx={{
        textTransform: 'none',
        fontSize: '10px',
        fontWeight: 600,
        borderColor: '#667eea',
        color: '#667eea',
        padding: '4px 12px',
        borderRadius: '6px',
        '&:hover': {
          backgroundColor: '#667eea',
          color: 'white',
          borderColor: '#667eea',
        },
      }}
    >
      View Flow
    </Button>
  ),
},




token?.Emp_Category === "HR" && {
  field: "APPROVER",
  headerName: "Send For Approval",
  flex: 1.3,
  minWidth: 180,
  sortable: false,
  renderCell: (params) => {
    const isDisabled = params.row.HR === "Approved";

    return (
      <Button
        variant="contained"
        size="small"
        fullWidth
        disabled={isDisabled}
        onClick={() => assignApprover(params.row, "HR")}
        sx={{
          textTransform: "none",
          fontSize: "10px",
          height: "24px",
          width: "120px",
          backgroundColor: "#667eea",
          "&:hover": {
            backgroundColor: "#5563d6",
          },
        }}
      >
        Send For Approval
      </Button>
    );
  },
},

  ];

  /* -------------------- JSX -------------------- */
  return (
    <Box sx={{
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "12px",
    }}>

        
      
        {/* DataGrid */}
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
      

      {/**--------------------------------------------ApprovalModal Here --------------------------------------**/}
      <Dialog
        open={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Approve Candidate
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3 }}>
          {/* Candidate Information Card */}
          <Box
            sx={{
              bgcolor: 'grey.50',
              borderRadius: 1.5,
              p: 2,
              mb: 3,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Case ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {approveRow?.CHILD_CASEID}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Candidate Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {approveRow?.FIRST_NAME}
                  
                  {/* || approveRow?.LAST_NAME} */}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Current Status
                </Typography>
                <Chip
                  label={approveRow?.STATUS}
                  size="small"
                  sx={{
                    mt: 0.5,
                    fontWeight: 500,
                    bgcolor: 'info.lighter',
                    color: 'info.dark'
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Remarks Input */}
          <TextField
            label="Approval Remarks"
            placeholder="Enter your approval comments or notes..."
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'success.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'success.main',
                }
              }
            }}
          />

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            * These remarks will be recorded with the approval
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setApproveModalOpen(false)}
            variant="outlined"
            color="inherit"
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              borderColor: 'grey.300',
              '&:hover': {
                borderColor: 'grey.400',
                bgcolor: 'grey.50'
              }
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={() => handleNtFrApprove(approveRow)}
            startIcon={<CheckIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            Confirm Approval
          </Button>
        </DialogActions>
      </Dialog>
      {/**-----------------------------------------------End ApprovalModal Here --------------------------------------------------**/}
      {/* HRM Approval Flow Modal */}
<Dialog
  open={flowModalOpen}
  onClose={() => setFlowModalOpen(false)}
  fullWidth
  maxWidth="md"
  PaperProps={{
    sx: {
      borderRadius: 2,
      maxHeight: '90vh',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
    }
  }}
>
  <DialogTitle sx={{ 
    pb: 1,
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
        Approval Flow Details
      </Typography>
      <Chip 
        label={selectedUser?.CHILD_CASEID || ''}
        size="small"
        sx={{ 
          backgroundColor: '#667eea',
          color: 'white',
          fontWeight: 500,
          fontSize: '10px'
        }}
      />
    </Box>
    <IconButton 
      onClick={() => setFlowModalOpen(false)}
      sx={{ 
        color: '#6b7280',
        '&:hover': { backgroundColor: '#f3f4f6' }
      }}
    >
      {/* <CloseIcon /> */}
    </IconButton>
  </DialogTitle>
  
  <DialogContent dividers sx={{ py: 3 }}>
    <HRMView 
      ID={selectedUser?.CHILD_CASEID || selectedUser?.id}
      isMaximized={true}
    />
  </DialogContent>
  
  <DialogActions sx={{ px: 3, py: 2 }}>
    <Button
      onClick={() => setFlowModalOpen(false)}
      variant="contained"
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        backgroundColor: '#667eea',
        '&:hover': { backgroundColor: '#5563d6' }
      }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>

      <CandidateStackDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={selectedUser}
         onStatusChange = ""
         note = {noteAprvlData}
         personalData = {personalData}
      />
    </Box>
  );
};

export default NoteForApprovals;