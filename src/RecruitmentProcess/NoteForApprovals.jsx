


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



  const [token] = useState(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    return userInfo ? userInfo : null;
  });



  
  /* ---------------------------------------API CALL -------------------------------------*/
  const noteFrAprvlData = async () => {
    try {
      const res = await axios.get(
        // "http://172.20.0.9/laravel/myhomedashboardMRF/api/getNt-aprvl-data",

         `${API_BASE_URL}/getNt-aprvl-data`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token?.token}`,
          },
        }
      );

      console.log("NOTE FOR APPROVAL API DATA:", res);
      setNoteAprvlData(res.data.VerifyData || []);


    } catch (err) {
      console.error("Error fetching approval data", err);
    }
  };

  /*-----------------------------ApprovalS---------------------------------------------*/



const handleNtFrApprove = async (row) => {


  alert(1222222222222);

  try {
    // 🔵 Loading Swal
    Swal.fire({
      title: "Processing...",
      text: "Please wait while approving",
      allowOutsideClick: false,
      //didOpen: () => Swal.showLoading(),
    });

    // 🔵 Approve API
    // await axios.post(
    //   `${API_BASE_URL}/Note-For-AprvlUpdt`,
    //   { caseId: row.CHILD_CASEID },
    //   {
    //     headers: {
    //       Accept: "application/json",
    //       Authorization: `Bearer ${token.token}`,
    //     },
    //   }
    // );

    // 🟢 Success Swal (WAIT till shown)
    await Swal.fire({
      icon: "success",
      title: "Approved Successfully",
      text: "Note for approval updated successfully",
      timer: 500,
      showConfirmButton: false,
    });

    // 🟢 Refresh table data AFTER Swal
    // await noteFrAprvlData();

    // 🟢 Close modal
    setApproveModalOpen(false);

  } catch (err) {
    console.error("Error In Update Note For Aprvl", err);

    Swal.fire({
      icon: "error",
      title: "Approval Failed",
      text: err.response?.data?.message || "Something went wrong. Please try again.",
    });
  }
};

 


  useEffect(() => {
    if (token?.token) {
      noteFrAprvlData();
    }
  }, [token]);
  
 
  const assignApprover = async (row, role) => {
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

      noteFrAprvlData(); // refresh list
    } catch (err) {
      console.error("Approver Assign Error", err);
      alert("Failed to assign approver");
    }
  };

  /* -------------------- FILTERED DATA -------------------- */
  const filteredData = useMemo(() => {
    if (!Array.isArray(noteAprvlData)) return [];
    let result = [...noteAprvlData];
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
      id: item.verification_id, // REQUIRED BY DATAGRID
      SNO: index + 1,
      CHILD_CASEID: item.CHILD_CASEID,
      PLANT: item.PLANT,
      FIRST_NAME: item.FIRST_NAME,
      EMAIL: item.EMAIL,
      PHONE_NUMBER: item.PHONE_NUMBER,
      DEPT: item.DEPT,
      CURRENT_CTC: item.CURRENT_CTC,
      EXP_CTC: item.EXP_CTC,
      OFFER_CTC: item.OFFER_CTC,
      HR: item.HR,
      DIRECTOR: item.DIRECTOR,
      EVC: item.EVC,
      STATUS: item.status,
      SUBMITTED_DATE: item.created_at,
    }));
  }, [noteAprvlData, searchTerm, statusFilter]);

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
          {statusValue || "pending"}
        </Box>
      </Box>
    );
  };

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
      field: "APPROVE_ACTION",
      headerName: "Approve",
      flex: 0.9,
      minWidth: 100,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            setApproveRow(params.row);
            setApproveModalOpen(true);
          }}
          sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            fontSize: '10px',
            padding: '4px 10px',
            borderRadius: '6px',
            textTransform: 'capitalize',
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4)',
            },
          }}
        >
          Approve
        </Button>
      ),
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
    {
      field: "View",
      headerName: "View",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={() => {
              setSelectedUser(params.row);
              setModalOpen(true);
            }}
            sx={{
              color: '#3b82f6',
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

token?.Is_Employee === 2 &&
    {
      field: "APPROVER",
      headerName: "Send For Approval",
      flex: 1.3,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => (
        <TextField
          select
          size="small"
          fullWidth
          value={params.row.APPROVER ?? ""}
          onChange={(e) => assignApprover(params.row, e.target.value)}
          SelectProps={{
            displayEmpty: true,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '12px',
              height: '32px',
              '& fieldset': {
                borderColor: '#d1d5db',
              },
              '&:hover fieldset': {
                borderColor: '#667eea',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#667eea',
              },
            },
          }}
        >
          <MenuItem value="" disabled>
            <em>Select Approver</em>
          </MenuItem>
          <MenuItem value="HOD"> HOD</MenuItem>
          <MenuItem value="DIRECTOR">Director</MenuItem>
          <MenuItem value="EVC">EVC</MenuItem>
        </TextField>
      ),
    }
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
        
        {/* Compact Search bar matching RecruitmentMail */}
        {/* <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1, maxWidth: '400px' }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search name, email, case ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#667eea', fontSize: '20px' }} />
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
          
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                height: '38px',
                fontSize: '13px',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                },
              },
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
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="verified">Verified</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          
          <Typography variant="body2" sx={{
            color: '#64748b',
            minWidth: 'fit-content',
            fontWeight: 500,
            fontSize: '13px'
          }}>
            {filteredData.length} note approvals
          </Typography>
        </Box> */}

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
           rowHeight={30}
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
      />
    </Box>
  );
};

export default NoteForApprovals;