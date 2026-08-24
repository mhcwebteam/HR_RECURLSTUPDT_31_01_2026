


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
// ------------------------------------------added by rajakumari.m on 22-08-2026------------------------------
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import BadgeIcon from '@mui/icons-material/Badge';
// ---------------------------------------------------ended------------------------------------------------------

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

// -----------------------added by rajakumari.m on 22-08-2026 ------------------------
const [panelModalOpen, setPanelModalOpen] = useState(false);
const [panelRow, setPanelRow] = useState(null);
// ------------------------------------------------ended-------------------------------



  const [token] = useState(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    return userInfo ? userInfo : null;
  });

console.log(token,"tokjennnnnnnnnnnnnnnnn");



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
 CURRENT_USER: item.CURRENT_USER,  
    SUBMITTED_DATE: item.created_at,
    PANEL_DATA: item.PANEL_DATA || item.PANEL_MEMBERS || [], // added by rajakumari.m on 22-08-2026-----------
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
   
// ------------------------------------added by rajakumari.m on 22-08-2026-------------------------------------------------------
{
  field: "PanelData",
  headerName: "Panel Data",
  flex: 1,
  minWidth: 130,
  sortable: false,
  renderCell: (params) => (
    <Button
      variant="outlined"
      size="small"
      startIcon={<GroupsIcon sx={{ fontSize: 16 }} />}
      onClick={() => {
        setPanelRow(params.row);
        setPanelModalOpen(true);
      }}
      sx={{
        textTransform: 'none',
        fontSize: '10px',
        fontWeight: 600,
        borderColor: '#14b8a6',
        color: '#0f766e',
        padding: '4px 10px',
        borderRadius: '6px',
        backgroundColor: '#f0fdfa',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: '#0f766e',
          color: 'white',
          borderColor: '#0f766e',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 10px rgba(15, 118, 110, 0.4)',
        },
      }}
    >
      Click Here
    </Button>
  ),
},

// -------------------------------------------------------ended------------------------------------------------------------




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
  const isDisabled =
    token?.username !== params.row.CURRENT_USER || params.row.CUR_STATUS == 'TO_DO'
    params.row.HR === "Approved";

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
        "&.Mui-disabled": {
          backgroundColor: "#c7cbe0",
          color: "#f3f4f6",
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
{/* -------------------- Panel Data Modal added by rajakumari.m on 22-08-2026 -------------------- */}
{/* -------------------- Panel Data Modal (Enhanced) -------------------- */}
<Dialog
  open={panelModalOpen}
  onClose={() => setPanelModalOpen(false)}
  fullWidth
  maxWidth="sm"
  PaperProps={{
    sx: {
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      overflow: 'hidden',
      animation: 'modalPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      '@keyframes modalPop': {
        from: { opacity: 0, transform: 'scale(0.94)' },
        to: { opacity: 1, transform: 'scale(1)' },
      },
    },
  }}
>
 <DialogTitle
  sx={{
    background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    py: 1,        // reduced from 1.8
    px: 2,        // reduced from 2.5
    minHeight: 'auto',
  }}
>
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box
      sx={{
        width: 30,          // reduced from 38
        height: 30,         // reduced from 38
        borderRadius: '9px',
        bgcolor: 'rgba(255,255,255,0.16)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <GroupsIcon sx={{ fontSize: 16 }} />
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: '13px', lineHeight: 1.15 }}>
        Interview Panel
      </Typography>
      <Typography sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.2 }}>
        Case ID: <span style={{ color: '#ccfbf1', fontWeight: 600 }}>{panelRow?.CHILD_CASEID || 'N/A'}</span>
      </Typography>
    </Box>
  </Box>

  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
    {Array.isArray(panelRow?.PANEL_DATA) && panelRow.PANEL_DATA.length > 0 && (
      <Chip
        size="small"
        label={`${panelRow.PANEL_DATA.length} Member${panelRow.PANEL_DATA.length > 1 ? 's' : ''}`}
        sx={{
          height: 19,       // reduced from 22
          fontSize: 9.5,
          fontWeight: 700,
          bgcolor: 'rgba(255,255,255,0.16)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
      />
    )}
    <IconButton
      onClick={() => setPanelModalOpen(false)}
      size="small"
      sx={{
        color: '#fff',
        width: 26,          // added compact sizing
        height: 26,
        bgcolor: 'rgba(255,255,255,0.14)',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.26)' },
      }}
    >
      <CloseIcon sx={{ fontSize: 15 }} />
    </IconButton>
  </Box>
</DialogTitle>

  {/* BODY */}
 <DialogContent
  dividers={false}
  sx={{
    pt: '16px !important',   // forces gap even if MUI resets it
    pb: 2,
    px: 2,
    bgcolor: '#f8fafc',
    maxHeight: '60vh',
    '&::-webkit-scrollbar': { width: '5px' },
    '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: '6px' },
  }}
>
    {Array.isArray(panelRow?.PANEL_DATA) && panelRow.PANEL_DATA.length > 0 ? (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {panelRow.PANEL_DATA.map((member, idx) => {
          const initials = (member?.panel_name || '?')
            .trim()
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase())
            .join('');

          return (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.4,
                bgcolor: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                px: 1.6,
                py: 1.2,
                opacity: 0,
                animation: `fadeSlideIn 0.35s ease ${idx * 0.08}s forwards`,
                transition: 'all 0.2s ease',
                '@keyframes fadeSlideIn': {
                  from: { opacity: 0, transform: 'translateY(8px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
                '&:hover': {
                  borderColor: '#14b8a6',
                  boxShadow: '0 6px 18px rgba(20, 184, 166, 0.18)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {/* Avatar with gradient + initials */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(15, 118, 110, 0.3)',
                }}
              >
                {initials || <PersonIcon fontSize="small" />}
              </Box>

              {/* Name + meta */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: '#1e293b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {member?.panel_name || 'N/A'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.3, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <BadgeIcon sx={{ fontSize: 12, color: '#0f766e' }} />
                    <Typography sx={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>
                      {member?.designation || '—'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Department pill */}
              <Chip
                size="small"
                label={member?.department || 'N/A'}
                sx={{
                  height: 22,
                  fontSize: 10.5,
                  fontWeight: 600,
                  bgcolor: '#f0fdfa',
                  color: '#0f766e',
                  border: '1px solid #99f6e4',
                  flexShrink: 0,
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            </Box>
          );
        })}
      </Box>
    ) : (
      <Box
        sx={{
          textAlign: 'center',
          py: 5,
          color: '#9ca3af',
          animation: 'fadeSlideIn 0.3s ease forwards',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '14px',
            bgcolor: '#f1f5f9',
            border: '2px dashed #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5,
          }}
        >
          <GroupsIcon sx={{ fontSize: 26, opacity: 0.5 }} />
        </Box>
        <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#475569' }}>
          No Panel Assigned
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: '#94a3b8', mt: 0.3 }}>
          Panel details for this case haven't been added yet.
        </Typography>
      </Box>
    )}
  </DialogContent>

  {/* FOOTER */}
  <DialogActions sx={{ px: 2.5, py: 1.4, bgcolor: '#fff', borderTop: '1px solid #e2e8f0' }}>
    <Button
      onClick={() => setPanelModalOpen(false)}
      size="small"
      sx={{
        px: 2.5,
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'none',
        background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
        color: '#fff',
        boxShadow: '0 3px 12px rgba(15,118,110,0.35)',
        '&:hover': {
          boxShadow: '0 5px 16px rgba(15,118,110,0.5)',
          transform: 'translateY(-1px)',
        },
        transition: 'all 0.18s',
      }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>
{/* --------------------------------------------ended--------------------------------------------- */}
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