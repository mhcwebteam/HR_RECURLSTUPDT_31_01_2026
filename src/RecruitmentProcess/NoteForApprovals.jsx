


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
 const [ personalData,setPersonalData] = useState([]);


  console.log("personaaaaaaaaaaaaaaa",personalData);


  const [token] = useState(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    return userInfo ? userInfo : null;
  });





   const EmpVerify = async () => {
 

  try {
    const response = await axios.get(
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
    const res = await axios.get(
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
      };
    


            const response = await axios.post(
        `${API_BASE_URL}/assign-approver`,
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
  if (token?.Emp_Category === "HR") {
    result = result.filter(item => {
      // Keep records where at least one approval is pending
      return !(
        item.DIRECTOR == "Approved" &&
        item.HR == "Approved" &&
        item.EVC == "Approved"
      );
    });
  }
  
  if (searchTerm) {
    result = result.filter(
      (item) =>
        item.FIRST_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.EMAIL?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.CHILD_CASEID?.includes(searchTerm)
    );
  }
  
  if (statusFilter !== "all") {
    result = result.filter(
      (item) => item.status?.toLowerCase() === statusFilter
    );
  }
  
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
     DEPT: item.DEPT,
    SUBMITTED_DATE: item.created_at,
  }));
}, [noteAprvlData, searchTerm, statusFilter, token?.Emp_Category]);

  /* -------------------- FILTERED DATA -------------------- */
  // const filteredData = useMemo(() => {
  //   if (!Array.isArray(noteAprvlData)) return [];
  //   let result = [...noteAprvlData];
  //   if (searchTerm) {
  //     result = result.filter(
  //       (item) =>
  //         item.FIRST_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         item.EMAIL?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         item.CHILD_CASEID?.includes(searchTerm)
  //     );
  //   }
  //   if (statusFilter !== "all") {
  //     result = result.filter(
  //       (item) => item.status?.toLowerCase() === statusFilter
  //     );
  //   }
  //   return result.map((item, index) => ({
  //     id: item.verification_id, // REQUIRED BY DATAGRID
  //     SNO: index + 1,
  //     CHILD_CASEID: item.CHILD_CASEID,
  //     PLANT: item.PLANT,
  //      FIRST_NAME: `${item.FIRST_NAME} ${item.LAST_NAME}`,
  //     EMAIL: item.EMAIL,
  //     PHONE_NUMBER: item.PHONE_NUMBER,
  //     DEPT: item.DEPT,
  //     CURRENT_CTC: item.CURRENT_CTC,
  //     EXP_CTC: item.EXP_CTC,
  //     OFFER_CTC: item.OFFER_CTC,
  //     HR: item.HR,
  //     DIRECTOR: item.DIRECTOR,
  //     EVC: item.EVC,
  //     STATUS: item.status,
  //     SUBMITTED_DATE: item.created_at,
  //   }));
  // }, [noteAprvlData, searchTerm, statusFilter]);

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

  /* ------------------------- COLUMNS -------------------- */
  const columns = [
    { 
      field: "SNO", 
      headerName: "S.NO", 
      flex: 0.5,
      minWidth: 70,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600, color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },



    {
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
    },

    
    { 
      field: "CHILD_CASEID", 
      headerName: "Case ID", 
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
      field: "REVID", 
      headerName: "REVID", 
      flex: 1,
      minWidth: 130,
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
      minWidth: 120,
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
       field: 'DESIG',
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
      field: "HR", 
      headerName: "HR", 
      flex: 1.2,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontSize: '12px' }}>
          {params.value}
        </Box>
      ),
    },
    { 
      field: "DIRECTOR", 
      headerName: "DIRECTOR", 
      flex: 1.2,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontSize: '12px' }}>
          {params.value}
        </Box>
      ),
    },
    { 
      field: "EVC", 
      headerName: "EVC", 
      flex: 1.2,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontSize: '12px' }}>
          {params.value}
        </Box>
      ),
    },

    {
      field: "CURRENT_CTC",
      headerName: "Current CTC",
      width: 110,
      renderCell: (params) => (
        <Box sx={{ color: '#059669', fontWeight: 600, fontSize: '12px' }}>
          ₹{params.value ?? 0}
        </Box>
      ),
    },
    {
      field: "EXP_CTC",
      headerName: "Expected CTC",
      width: 120,
      renderCell: (params) => (
        <Box sx={{ color: '#059669', fontWeight: 600, fontSize: '12px' }}>
          ₹{params.value ?? 0}
        </Box>
      ),
    },
    {
      field: "OFFER_CTC",
      headerName: "Offer CTC",
      width: 110,
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
      minWidth: 120,
      renderCell: (params) => getStatusChip(params.value),
    },
   

token?.Emp_Category == "HR" && {
  field: "APPROVER",
  headerName: "Send For Approval",
  flex: 1.3,
  minWidth: 180,
  sortable: false,
  renderCell: (params) => {
    // Hide dropdown if HR is approved
    if (params.row.HR === "Approved") {
      return null; 
    }

    return (
      <TextField
        select
        size="small"
        fullWidth
        value={params.row.APPROVER ?? ""}
        onChange={(e) => assignApprover(params.row, e.target.value)}
        SelectProps={{ displayEmpty: true }}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: '12px',
            height: '32px',
            '& fieldset': { borderColor: '#d1d5db' },
            '&:hover fieldset': { borderColor: '#667eea' },
            '&.Mui-focused fieldset': { borderColor: '#667eea' },
          },
        }}
      >
        <MenuItem value="" disabled>
          <em>Select Approver</em>
        </MenuItem>
        <MenuItem value="HOD">HOD</MenuItem>
        <MenuItem value="DIRECTOR">Director</MenuItem>
        <MenuItem value="EVC">EVC</MenuItem>
      </TextField>
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
      <Paper sx={{
        width: '100%',
        padding: 2,
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e2e8f0',
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
      </Paper>

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