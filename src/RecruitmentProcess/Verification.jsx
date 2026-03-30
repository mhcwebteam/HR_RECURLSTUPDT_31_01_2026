

import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Cancel,
  Visibility,
  Refresh
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { ContextData } from '../Context/ContextData';
import VerificationDetailsModal from './VerificationDetailsModal';
import axios from 'axios';
import { API_BASE_URL } from '../Config/Config';
import Swal from 'sweetalert2';

const Verification = () => 
{
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});


const [personalData, setPersonalData] = useState([]);




 const EmpVerify = async () => {
  if (!userToken?.token) return;

  try {
    const response = await axios.get(
      `${API_BASE_URL}/emp-verify-data`,
      {
        headers: { Authorization: `Bearer ${userToken.token}` },
      }
    );

    
console.log(response,"submitOnly");
  
    const submitOnly = (response.data?.data || []).filter(
      (item) => item.status?.toLowerCase() == "submit"
    );

 

    setPersonalData(submitOnly);

    console.log("Filtered submit data:", submitOnly);

  } catch (err) {
    console.error("Error fetching verify data", err);
    setPersonalData([]);
  }
};

useEffect(() => {
  EmpVerify();
}, [userToken?.token]);


  
  const filteredData = useMemo(() => 
  {
    if (!personalData || personalData.length === 0) return [];
    let result = [...personalData];
    console.log("resrrrrrrrrrrrrrrrrrrrrrr",result);



    result = result.filter(item => item.verification_status !== "1");


    if (searchTerm) {
      result = result.filter(user =>
        (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.child_caseid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter !== 'all') 
    {
      result = result.filter(user => user.status === statusFilter);
    }


   
  
   
   return result.map((item, index) => ({
  id: item.id || `row-${index}`,
  SNO: index + 1,

  // Basic
  Verification_Id: item.Verification_Id,
  CHILD_CASEID: item.child_caseid || 'N/A',
  PLANT: item.PLANT || 'N/A',
  NAME: item.name || 'N/A',
  EMAIL: item.email || 'N/A',
  DEPT: item.DEPT || 'N/A',
  DESIG: item.DESIG || 'N/A',
  MANPOWER_DESG: item.MANPOWER_DESG || 'N/A',
  GENDER: item.GENDER || 'N/A',
  MARITAL_STATUS: item.MARITAL_STATUS || 'N/A',
SRC_REFER_DEPT: item.SRC_REFER_DEPT || 'N/A',
  PHONE_NUMBER: item.phone_number || 'N/A',
  EMER_CONTACT_NUM: item.EMER_CONTACT_NUM || 'N/A',
DRIVING_LICENSE_EXPIRY: item.DDRIVING_LICENSE_EXPIRY || 'N/A',

TYPE_PLANT: item?.TYPE_PLANT,
SUB_CODE: item?.SUB_CODE,
SUB_POST: item?.SUB_POST,

RECRUIT_CYCLE: item?.RECRUIT_CYCLE,  // ✅ ADD THIS


DRIVING_LICENSE: item.DRIVING_LICENSE || 'N/A',
  REVID: item.CUR_REV_ID || '00',

  // DOB & Personal
  ORIGINAL_DOB: item.ORIGINAL_DOB || 'N/A',
  DOB_ASPER_ADHAR: item.DOB_ASPER_ADHAR || 'N/A',
  AGE: item.AGE || 'N/A',
  BLOOD_GROUP: item.BLOOD_GROUP || item.BLOOD_GRP || 'N/A',
  LANG_KNOWN: item.LANG_KNOWN || 'N/A',
  MOTHER_TONGUE: item.MOTHER_TONGUE || 'N/A',
HIGHEST_QUA: item.HIGHEST_QUA, 
  // IDs
  AADHAR_NUMBER: item.aadhar_number
 || 'N/A',
  PAN_NUM: item.pan_number || 'N/A',
  UAN_NUM: item.UAN_NUM || item.UAN_NUMBER || 'N/A',
  ESI_NUM: item.ESI_NUM || item.ESINO || 'N/A',

GROUP_CODE: item?.GROUP_CODE,


RECRUIT_CYCLE: item?.RECRUIT_CYCLE,

  // Passport & Driving
  PASSPORT_NUMBER: item.PASSPORT_NUMBER || item.PASSPORT_NUM || 'N/A',
  PASSPORT_EXPIRY: item.PASSPORT_EXPIRY || item.PASS_EXPIR_DATE || 'N/A',

  DRIVING_LICENSE_EXPIRY: item.DRIVING_LICENSE_EXPIRY || item.DRIVING_EXPIRE_DATE || 'N/A',

    STARTDATE:  item.STARTDATE,

        address_status  : item?.address_status,

  // Address - Permanent
  HNO: item.HNO || 'N/A',
  CITY: item.CITY || 'N/A',
  MANDAL: item.MANDAL || 'N/A',
  DISTRICT: item.DISTRICT || 'N/A',
  STATE: item.STATE || 'N/A',
  PINCODE: item.PINCODE || 'N/A',

  // Address - Present
  PRESENT_HNO: item.PRESENT_HNO || 'N/A',
  PRESENT_CITY: item.PRESENT_CITY || 'N/A',
  PRESENT_MANDAL: item.PRESENT_MANDAL || 'N/A',
  PRESENT_DISTRICT: item.PRESENT_DISTRICT || 'N/A',
  PRESENT_STATE: item.PRESENT_STATE || 'N/A',
  PRESENT_PINCODE: item.PRESENT_PINCODE || 'N/A',

  // Education - SSC
  SSC_BOARD: item.SSC_BOARD || 'N/A',
  SSC_SCHOOL_NAME: item.SSC_SCHOOL_NAME || 'N/A',
  SSC_PASSED_YEAR: item.SSC_PASSED_YEAR || 'N/A',
  SSC_MARKS: item.ssc_marks || 'N/A',

  // Education - Inter
  INTER_BOARD: item.INTER_BOARD || 'N/A',
  INTER_COLLEGE_NAME: item.INTER_COLLEGE_NAME || 'N/A',
  INTER_PASSED_YEAR: item.INTER_PASSED_YEAR || 'N/A',
  INTER_MARKS: item.inter_marks || 'N/A',

  // Graduation
  GRAD_COLLEGE_NAME: item.GRAD_COLLEGE_NAME || 'N/A',
  DEGREE_UNIVERSITY: item.DEGREE_UNIVERSITY || 'N/A',
  DEGREE_PASSED_YEAR: item.DEGREE_PASSED_YEAR || 'N/A',
  BTECH_MARKS: item.btech_marks || 'N/A',

  // PG
  PG_COLLEGE_NAME: item.PG_COLLEGE_NAME || 'N/A',
  PG_UNIVERSITY: item.PG_UNIVERSITY || 'N/A',
  PG_PASSED_YEAR: item.PG_PASSED_YEAR || 'N/A',
  PG_MARKS: item.pg_marks || 'N/A',

  // PHD
  PHD_COLLEGE_NAME: item.PHD_COLLEGE_NAME || 'N/A',
  PHD_UNIVERSITY: item.PHD_UNIVERSITY || 'N/A',
  PHD_PASSED_YEAR: item.PHD_PASSED_YEAR || 'N/A',
  PHD_MARKS: item.PHD_MARKS || 'N/A',

  // Other Education
  OTHER_COLLEGE_NAME: item.OTHER_COLLEGE_NAME || 'N/A',
  OTHER_UNIVERSITY: item.OTHER_UNIVERSITY || 'N/A',
  OTHER_PASSED_YEAR: item.OTHER_PASSED_YEAR || 'N/A',
  OTHER_MARKS: item.OTHER_MARKS || 'N/A',

  // Experience & Salary
  TOTAL_EXP: item.TOTAL_EXP || 'N/A',
  CURRENT_CTC: item.current_ctc || 'N/A',
  EXP_CTC: item.expected_ctc || 'N/A',
  OFFER_CTC: item.offer_ctc || 'N/A',
  PERCENTOF_HIKE: item.PERCENTOF_HIKE || 'N/A',
  NOTICE_PERIOD: item.notice_period || 'N/A',

  // Source
  SRC_TYPE: item.SRC_TYPE || 'N/A',
  SRC_REFER_NAME: item.SRC_REFER_NAME || 'N/A',
  SRC_REFER_DEPT: item.SRC_REFER_DEPT || 'N/A',

  // Meta
  STATUS: item.status || 'N/A',
  verification_status: item.verification_status || 'N/A',
  submitted_date: item.created_at || 'N/A',

  // Extra
  documents: item.documents || {},
  experienceData: item.experienceData || {}
}));
  }, [personalData, searchTerm, statusFilter]);
  const getStatusChip = (status) => {
    
    const config = {
      verified: { color: '#10b981'},
      pending:  { color: '#f59e0b' },
      rejected: { color: '#ef4444'},
      uploaded: { color: '#3b82f6'},
      'not uploaded': { color: '#6b7280'}
    };
    const { color, icon } = config[status] || config.pending;
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
      }}>
        <Box sx={{
          color: '#ffffff',
          backgroundColor: color,
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'capitalize',
          display: 'flex',
          height: '25px',
          alignItems: 'center',
          gap: '4px'
        }}>
          {icon}
          {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
        </Box>
      </Box>
    );
  };
  const handleViewDetails = (user) => {


    setSelectedUser(user);
    setModalOpen(true);
  };
  const handleStatusChange = async (updateData) => {
    const result = await Swal.fire({
    title: "Confirm Status Change",
    text: "Are you sure you want to update the verification status?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Update!",
    cancelButtonText: "No, Cancel"
  });

  // ✅ IF USER CLICKS "NO", STOP EXECUTION
  if (!result.isConfirmed) {
    return;
  }
    setPersonalData(prevData => 
    prevData.map(item => 
      item.child_caseid === updateData.id 
        ? { ...item, verification_status: "1" } 
        : item
    )
  );



  await Swal.fire({
    title: "Updated!",
    text: "Verification status updated successfully",
    icon: "success",
    timer: 1500,
    showConfirmButton: false,
  });
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-GB');
    } catch {
      return dateString;
    }
  };
  const formatNumber = (value) => {
    if (!value || value === 'N/A') return 'N/A';
    return value.toString();
  };

    const hasTypePlant = personalData?.some(row => row.TYPE_PLANT);

    console.log("ttttt44444444440",hasTypePlant);

  

  const recCycle = personalData?.some(row => row.RECRUIT_CYCLE);

    console.log("6666666666666", recCycle);
  const columns = useMemo(() => [
    {
      field: 'SNO',
      headerName: 'S.NO',
      flex: 0.5,
minWidth: 50,
      sortable: false,
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
        <Box sx={{ color: '#1f2937', fontWeight: 500 }}>
          {params.value}
        </Box>
      ),
    },

            ...(hasTypePlant
        ? [{
            field: 'TYPE_PLANT',
            headerName: 'Type Plant',
            flex: 1.2,
            minWidth:80,
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
            minWidth:100,
            renderCell: (params) => (
              <Box sx={{ color: '#374151' }}>
                {params.value}
              </Box>
            ),
          }]
        : []),

{
  field: 'REVID',  // Change from 'CUR_REV_ID' to 'REVID'
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
      field: 'NAME',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600, color: '#1f2937'}}>
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
  field: 'DEPT',
  headerName: 'Dept',
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
  headerName: 'Desig/Position',
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
      
        }}
      >
        {subCode ? `${subCode} - ${value}` : value}
      </Box>
    );
  },
},

    {
      field: 'PHONE_NUMBER',
      headerName: 'Phone',
      flex:0.8,
    minWidth: 80,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontWeight: 500 }}>
          {formatNumber(params.value)}
        </Box>
      ),
    },

    {
      field: 'SSC_MARKS',
      headerName: 'SSC%',
      width: 60,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontWeight: 600, fontSize: '12px' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'INTER_MARKS',
      headerName: 'Inter%',
      width: 60,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontWeight: 600, fontSize: '12px' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'BTECH_MARKS',
      headerName: 'BTech/Degree%',
      width: 130,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontWeight: 600, fontSize: '12px' }}>
          {params.value}
        </Box>
      ),
    },
      {
      field: 'PG_MARKS',
      headerName: 'PG%',
      width: 60,
      renderCell: (params) => (
        <Box sx={{ color: '#374151', fontWeight: 600, fontSize: '12px' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'CURRENT_CTC',
      headerName: 'Curr CTC',
      width: 80,
      renderCell: (params) => (
        <Box sx={{ color: '#059669', fontWeight: 600, fontSize: '12px' }}>
          ₹{formatNumber(params.value)}L
        </Box>
      ),
    },
    {
      field: 'EXP_CTC',
      headerName: 'Exp CTC',
      width: 80,
      renderCell: (params) => (
        <Box sx={{ color: '#dc2626', fontWeight: 600, fontSize: '12px' }}>
          ₹{formatNumber(params.value)}L
        </Box>
      ),
    },

    {
      field: 'submitted_date',
      headerName: 'Submitted',
      width: 80,
      renderCell: (params) => (
        <Box sx={{ color: '#6b7280',  fontSize: '11px' }}>
          {formatDate(params.value)}
        </Box>
      ),
    },




    
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={() => handleViewDetails(params.row)}
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
    }
  ], []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading verification data...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "12px",
      
      }}
    >
  
        
       

        {filteredData.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: '#6b7280' }}>
            <Typography variant="h6">No data found</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {personalData?.length === 0 ? 'No verification records available' : 'No records match your search criteria'}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #dfe5f1ff",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >


            <DataGrid
              rows={filteredData}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 20, 50]}
              rowHeight={40}
              columnHeaderHeight={40}



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
                  borderBottom: "1px solid #e2e8f0",
                  borderRight: "1px solid #e2e8f0",
                  fontSize: "12px",
                  color: "#374151",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#f0f9ff",
                  cursor: "pointer",
                },
                "& .MuiDataGrid-footerContainer": {
                  borderTop: "1px solid #e2e8f0",
                  backgroundColor: "#f0f7fa",
                },
              }}
            />
          </Box>
        )}
      
      
      <VerificationDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={selectedUser}
        setSelectedUser = {setSelectedUser}
        onStatusChange={handleStatusChange}
        refersh = {EmpVerify}
      />
    </Box>
  );
};

export default Verification;