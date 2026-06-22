




import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Chip, TextField, InputAdornment, Tooltip, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Divider, IconButton, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../Config/Config.jsx';
import DocUpload from './DocUpload.jsx';
import History from './History.jsx';
import Swal from 'sweetalert2';
import MediDocUpload from './MediDocUpload.jsx';
import { CircleX, CloudUploadIcon, GroupIcon, Users } from 'lucide-react';
import axiosInstance from '../Config/axiosConfig.jsx';

const Mediclaim = () => {
  const [joiningData, setJoiningData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

  const [selectedRow, setSelectedRow] = useState(null);
  const [openDocModal, setOpenDocModal] = useState(false);
  const [openFamilyModal, setFamilyModal] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [joiningDates, setJoiningDates] = useState({});
  const [savedRows, setSavedRows] = useState({});
const [familyFormData, setFamilyFormData] = useState({
  spouseName: '',
  spouseDob: '', // Added spouse date of birth
  daughters: [],  // each daughter: { name: '', dob: '', file: null }
  sons: [],       // each son: { name: '', dob: '', file: null }
});

const [fileErrors, setFileErrors] = useState({
  spouse: '',
  daughters: [],
  sons: []
});


const [familyLoading, setFamilyLoading] = useState(false);

  const navigate = useNavigate();
  const [Token, useToken] = useState(() => {
    const userToken = JSON.parse(localStorage.getItem('userInfo'));
    return userToken ? userToken : null;
  })

// Add Daughter
const addDaughter = () => {
  setFamilyFormData(prev => ({
    ...prev,
    daughters: [...prev.daughters, { name: '', dob: '', file: null }]
  }));
};

// Update Daughter
const updateDaughter = (index, field, value) => {
  const updatedDaughters = [...familyFormData.daughters];
  updatedDaughters[index][field] = value;
  setFamilyFormData({
    ...familyFormData,
    daughters: updatedDaughters
  });
};

// Remove Daughter
const removeDaughter = (index) => {
  const updatedDaughters = familyFormData.daughters.filter((_, i) => i !== index);
  setFamilyFormData({
    ...familyFormData,
    daughters: updatedDaughters
  });
};

// Add Son
const addSon = () => {
  setFamilyFormData(prev => ({
    ...prev,
    sons: [...prev.sons, { name: '', dob: '', file: null }]
  }));
};

// Update Son
const updateSon = (index, field, value) => {
  const updatedSons = [...familyFormData.sons];
  updatedSons[index][field] = value;
  setFamilyFormData({
    ...familyFormData,
    sons: updatedSons
  });
};

console.log(familyFormData,"fa444444444444444");

// Remove Son
const removeSon = (index) => {
  const updatedSons = familyFormData.sons.filter((_, i) => i !== index);
  setFamilyFormData({
    ...familyFormData,
    sons: updatedSons
  });
};

// Handle File Selection
const handleFileSelect = (event, type, index) => {
  const file = event.target.files[0];
  const error = validateFileType(file);

  if (type === 'daughter') {
    let errors = [...fileErrors.daughters];

    if (error) {
      errors[index] = error;
      setFileErrors(prev => ({ ...prev, daughters: errors }));
      return;
    }

    errors[index] = '';
    setFileErrors(prev => ({ ...prev, daughters: errors }));

    const updated = [...familyFormData.daughters];
    updated[index].file = file;

    setFamilyFormData({ ...familyFormData, daughters: updated });
  }

  if (type === 'son') {
    let errors = [...fileErrors.sons];

    if (error) {
      errors[index] = error;
      setFileErrors(prev => ({ ...prev, sons: errors }));
      return;
    }

    errors[index] = '';
    setFileErrors(prev => ({ ...prev, sons: errors }));

    const updated = [...familyFormData.sons];
    updated[index].file = file;

    setFamilyFormData({ ...familyFormData, sons: updated });
  }
};

// Reset Family Form
const resetFamilyForm = () => {
  setFamilyFormData({
    spouseName: '',
    spouseDob: '',
    spouseFile: null,
    daughters: [],
    sons: [],
  });

  setFileErrors({
    spouse: '',
    daughters: [],
    sons: []
  });
};


const handleFamilySubmit = async () => {
  console.log("=== handleFamilySubmit START ===");
  console.log("selectedRow:", selectedRow);
  console.log("familyFormData:", familyFormData);
  
  if (!selectedRow || !selectedRow.CHILD_CASEID) {
    console.error("ERROR: No selected row");
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No employee selected. Please try again.',
    });
    return;
  }
  
  const confirmResult = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to submit family details?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Submit',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    customClass: {
      container: 'swal2-container-custom'
    },
    didOpen: () => {
      const swalContainer = document.querySelector('.swal2-container');
      if (swalContainer) {
        swalContainer.style.zIndex = '9999';
      }
    }
  });
  
  if (!confirmResult.isConfirmed) {
    return;
  }

  setFamilyLoading(true);

  try {
    const formData = new FormData();
    formData.append('CHILD_CASEID', selectedRow?.CHILD_CASEID || '');
    formData.append('onBoarding', 1);
    
    // Get existing data from backend
    const existingDaughters = selectedRow?.fullData?.daughters_data || [];
    const existingSons = selectedRow?.fullData?.sons_data || [];
    
    // Get IDs (document_id) of existing records
    const existingDaughterIds = existingDaughters.map(d => d.document_id).filter(id => id);
    const existingSonIds = existingSons.map(s => s.document_id).filter(id => id);
    
    // Get current daughter IDs from form
    const currentDaughterIds = familyFormData.daughters
      .map(d => d.document_id || d.id)
      .filter(id => id);
    
    const currentSonIds = familyFormData.sons
      .map(s => s.document_id || s.id)
      .filter(id => id);
    
    // Find deleted IDs
    const deletedDaughterIds = existingDaughterIds.filter(id => !currentDaughterIds.includes(id));
    const deletedSonIds = existingSonIds.filter(id => !currentSonIds.includes(id));
    

    // Send deleted IDs to backend as JSON string
    if (deletedDaughterIds.length > 0) {
      formData.append('deleted_daughter_ids', JSON.stringify(deletedDaughterIds));
      console.log("Deleting daughters with document_ids:", deletedDaughterIds);
    }
    
    if (deletedSonIds.length > 0) {
      formData.append('deleted_son_ids', JSON.stringify(deletedSonIds));
      console.log("Deleting sons with document_ids:", deletedSonIds);
    }
    
    // Handle spouse data
    const existingSpouseName = selectedRow?.fullData?.spouse_name || '';
    const existingSpouseDob = selectedRow?.fullData?.spouse_dob || '';
    
    if (familyFormData.spouseName && familyFormData.spouseName !== existingSpouseName) {
      formData.append('spouse_name', familyFormData.spouseName);
      console.log("Updating spouse_name:", familyFormData.spouseName);
    } else if (familyFormData.spouseName === '' && existingSpouseName) {
      // If spouse name is cleared, send empty to delete
      formData.append('spouse_name', '');
     
    }
    
    if (familyFormData.spouseDob && familyFormData.spouseDob !== existingSpouseDob) {
      formData.append('spouse_dob', familyFormData.spouseDob);
      console.log("Updating spouse_dob:", familyFormData.spouseDob);
    } else if (familyFormData.spouseDob === '' && existingSpouseDob) {
      formData.append('spouse_dob', '');
      console.log("Removing spouse DOB");
    }
    
    if (familyFormData.spouseFile) {
      formData.append('spouseFile', familyFormData.spouseFile);
      console.log("Adding spouseFile:", familyFormData.spouseFile.name);
    }
    
    // Process Daughters
    const validDaughters = familyFormData.daughters.filter(d => d.name && d.name.trim() !== '');
    console.log("Valid daughters count:", validDaughters.length);
    formData.append('daughters_count', validDaughters.length);
    
    validDaughters.forEach((daughter, index) => {
      // Send document_id if exists (for update)
      if (daughter.document_id || daughter.id) {
        formData.append(`daughter_${index + 1}_document_id`, daughter.document_id || daughter.id);
      }
      formData.append(`daughter_${index + 1}_name`, daughter.name);
      formData.append(`daughter_${index + 1}_dob`, daughter.dob || '');
      if (daughter.file) {
        formData.append(`daughter_${index + 1}_document`, daughter.file);
      }
      if (daughter.order) {
        formData.append(`daughter_${index + 1}_order`, daughter.order);
      }
      console.log(`Added daughter ${index + 1}:`, daughter.name, `(ID: ${daughter.document_id || daughter.id || 'New'})`);
    });
    
    // Process Sons
    const validSons = familyFormData.sons.filter(s => s.name && s.name.trim() !== '');
    console.log("Valid sons count:", validSons.length);
    formData.append('sons_count', validSons.length);
    
    validSons.forEach((son, index) => {
      // Send document_id if exists (for update)
      if (son.document_id || son.id) {
        formData.append(`son_${index + 1}_document_id`, son.document_id || son.id);
      }
      formData.append(`son_${index + 1}_name`, son.name);
      formData.append(`son_${index + 1}_dob`, son.dob || '');
      if (son.file) {
        formData.append(`son_${index + 1}_document`, son.file);
      }
      if (son.order) {
        formData.append(`son_${index + 1}_order`, son.order);
      }
      console.log(`Added son ${index + 1}:`, son.name, `(ID: ${son.document_id || son.id || 'New'})`);
    });
    
    console.log("Making API call to:", `${API_BASE_URL}/on-board-Store`);
    
    const response = await axiosInstance.post(
      `${API_BASE_URL}/on-board-Store`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${Token.token}`,
        },
      }
    );
    
    console.log("API Response:", response.data);
    
    if (response.data.success || response.data.message) {
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: response.data.message || 'Family details saved successfully',
        timer: 2000,
        showConfirmButton: false,
      });

      // resetFamilyForm();
      // setSelectedRow(null);
      setFamilyModal(false);
      await joinData(); // Refresh table data
    } else {
      throw new Error(response.data.message || 'Failed to save');
    }
    
  } catch (error) {
    console.error("ERROR in handleFamilySubmit:", error);
    console.error("Error response:", error.response);
    
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || error.message || 'Something went wrong',
    });
  } finally {
    setFamilyLoading(false);
  }
};






// Close Family Modal
const handleCloseFamilyModal = () => {
  setFamilyModal(false);
  setSelectedRow(null);
  resetFamilyForm();
};

// Handle family form changes
const handleFamilyChange = (e) => {
  setFamilyFormData({
    ...familyFormData,
    [e.target.name]: e.target.value
  });
};

// Handle Spouse File Selection
const handleSpouseFileSelect = (event) => {
  const file = event.target.files[0];
  const error = validateFileType(file);

  if (error) {
    setFileErrors(prev => ({ ...prev, spouse: error }));
    return;
  }

  setFileErrors(prev => ({ ...prev, spouse: '' }));

  setFamilyFormData({
    ...familyFormData,
    spouseFile: file
  });
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
const handleFamilyUploadClick = (rowData) => {
  setSelectedRow(rowData);
  
  // Pre-populate form with existing data including document_id as id
  const existingDaughters = (rowData.fullData?.daughters_data || []).map(daughter => ({
    id: daughter.document_id || daughter.id, // Map document_id to id
    document_id: daughter.document_id,
    name: daughter.name || '',
    dob: daughter.dob || '',
    
    file: null,
    order: daughter.order || 1
  }));
  
  const existingSons = (rowData.fullData?.sons_data || []).map(son => ({
    id: son.document_id || son.id, // Map document_id to id
    document_id: son.document_id,
    name: son.name || '',
    dob: son.dob || '',
    file: null,
    order: son.order || 1
  }));
  
  setFamilyFormData({
    spouseName: rowData.fullData?.spouse_name || '',
    spouseDob: rowData.fullData?.spouse_dob || '',
    spouseFile: null,
    daughters: existingDaughters,
    sons: existingSons,
  });
  
  setFileErrors({ spouse: '', daughters: [], sons: [] });
  setFamilyModal(true);
};


// const handleFamilyUploadClick = (rowData) => {
//   setSelectedRow(rowData);

//   // ✅ Always reset first
//   setFamilyFormData({
//     spouseName: '',
//     spouseDob: '',
//     spouseFile: null,
//     daughters: [],
//     sons: [],
//   });

//   setFileErrors({ spouse: '', daughters: [], sons: [] });
//   setFamilyModal(true);
// };
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
    setJoiningDates(prev => ({
      ...prev,
      [caseId]: value,
    }));
  };

  const handleOfferLterEmail = async (rowData) => {
    try {
      const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "You want to Send this Mail",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Send",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#2563eb",
      });
      if (!confirm.isConfirmed) return;

      const date_only = joiningDates ? Object.values(joiningDates)[0] : null;

      const payload = {
        CHILD_CASEID: rowData.CHILD_CASEID,
        EMAIL: rowData.email,
        joiningDate: date_only,
      }

      const ofrMailSend = await axios.post(`${API_BASE_URL}/ofr-ltr-issue-mail`, payload, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${Token.token}`
        }
      })

      if (ofrMailSend.data.message) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Mail Sent successfully",
          timer: 1500,
          showConfirmButton: false,
        });
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

const validateFileType = (file) => {
  const maxPhotoSize = 50 * 1024;

  if (!file) return 'No file selected';

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  if (!validTypes.includes(file.type)) {
    return 'Only JPG, JPEG, PNG allowed';
  }

  if (file.size > maxPhotoSize) {
    return `Max 50KB allowed (Current: ${(file.size / 1024).toFixed(1)}KB)`;
  }

  return '';
};

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

   

      const formattedRows = apiData
        .filter(item => {
         const hasJoiningDate = item.onBoarding == "1"  ||  item.onBoarding  == "2"

  const isNotVerified = item.onboarding_status !== "verified"; 
    // const isMedStatus = item.MED_STATUS ==  null || ""

  

    return hasJoiningDate && isNotVerified;
  })
        .map((item, index) => ({
          id: item.verification_id || index,
          CHILD_CASEID: item.child_caseid,
          employee_name: item.name,
          spouse_name: item.spouse_name,
            spouse_dob: item.spouse_dob,
          email: item.email,
          phone: item.phone_number,
          department: item.DEPT,
          location: item.PLANT,
        ONBOARD_PLANT:item?.ONBOARD_PLANT,
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
      field: 'doc_upload',
      headerName: 'Mediclaim Upload',
      flex: 0.8,
      minWidth: 140,
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
      minWidth: 120,
      flex: 1.2,
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
            minWidth: 120,
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
          <Box sx={{ color: '#374151', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
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
      minWidth: 220,
      renderCell: (params) => (
        <Box sx={{ color: '#374151' }}>
          {params.value}
        </Box>
      ),
    },

            {
          field: 'ONBOARD_PLANT',
          headerName: 'Required Location',
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
}
  ,  {
      field: 'familyUpload',
      headerName: 'Family Upload',
      flex: 1.2,
        minWidth: 140,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          startIcon={<Users className='w-4' />}
          onClick={() => handleFamilyUploadClick(params.row)}
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
          Upload
        </Button>
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
    // {
    //   field: 'actions',
    //   headerName: 'Actions',
    //   width: 120,
    //   sortable: false,
    //   renderCell: (params) => (
    //     <Tooltip title="Send Email">
    //       <Button
    //         size="small"
    //         variant="contained"
    //         onClick={() => handleOfferLterEmail(params.row)}
    //         sx={{
    //           backgroundColor: '#10b981',
    //           textTransform: 'none',
    //           fontSize: '12px',
    //           '&:hover': { backgroundColor: '#059669' },
    //         }}
    //       >
    //         Send Email
    //       </Button>
    //     </Tooltip>
    //   ),
    // }
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
                  '&:hover': { backgroundColor: '#f1f5f9' },
                  '&.Mui-focused': { backgroundColor: '#ffffff' }
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#cedef2ff" },
                  "&:hover fieldset": { borderColor: "#d1d6ebff" },
                  "&.Mui-focused fieldset": { borderColor: "#667eea" },
                },
              }}
            />
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

{openFamilyModal && selectedRow && (
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
    <Paper sx={{
      width: '100%',
      maxWidth: 600,
      maxHeight: '90vh',
      overflow: 'auto',
      borderRadius: '16px',
      position: 'relative'
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 1
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          👨‍👩‍👧‍👦 Family Details
        </Typography>
        <IconButton onClick={handleCloseFamilyModal} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Form Body */}
      <Box sx={{ padding: '24px' }}>
        {/* Employee Info */}
        <Box sx={{
          backgroundColor: '#f8fafc',
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Employee: <strong>{selectedRow?.employee_name || 'N/A'}</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Case ID: <strong>{selectedRow?.CHILD_CASEID || 'N/A'}</strong>
          </Typography>
        </Box>

        {/* Spouse Name with DOB and Upload */}
        <Box sx={{ marginBottom: '24px' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
            👰 Spouse Details
          </Typography>
         <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              sx={{ flex: 1, minWidth: '200px' }}
              label="Spouse Name"
              name="spouseName"
              value={familyFormData.spouseName}
              onChange={handleFamilyChange}
              placeholder="Enter spouse's full name"
              size="small"
              required
            />
            <TextField
              sx={{ flex: 1, minWidth: '150px' }}
              label="Date of Birth"
              name="spouseDob"
              type="date"
              value={familyFormData.spouseDob}
              onChange={handleFamilyChange}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <Button
              size="small"
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                borderColor: '#667eea',
                color: '#667eea',
                flexShrink: 0,
                '&:hover': {
                  borderColor: '#764ba2',
                  backgroundColor: '#f5f3ff'
                }
              }}
            >
              Upload
              <input
                type="file"
                hidden
              accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleSpouseFileSelect(e)}
              />
            </Button>
          </Box>
          {familyFormData.spouseFile && (
            <Typography variant="caption" sx={{ color: '#10b981', display: 'block', marginTop: '8px' }}>
              📄 {familyFormData.spouseFile.name.substring(0, 30)}
            </Typography>
          )}

          {fileErrors.spouse && (
  <Typography variant="caption" sx={{ color: 'red', display: 'block', mt: 1 }}>
    {fileErrors.spouse}
  </Typography>
)}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Daughters Section */}
        <Box sx={{ marginBottom: '24px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151' }}>
              👧 Daughters
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={addDaughter}
              sx={{
                textTransform: 'none',
                borderRadius: '20px',
                borderColor: '#10b981',
                color: '#10b981',
               '&:hover': {
                  borderColor: '#059669',
                  backgroundColor: '#f0fdf4'
                }
              }}
            >
              + Add Daughter
            </Button>
          </Box>

          {/* Dynamic Daughter Fields */}
      {familyFormData.daughters?.map((daughter, index) => (
  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative' }}>
    <IconButton
      onClick={() => removeDaughter(index)}
      size="small"
      sx={{
        position: 'absolute',
        top: -8,
        right: -5,
        color: '#ef4444',
        backgroundColor: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        '&:hover': {
          backgroundColor: '#fee2e2'
        }
      }}
    >
      <CircleX size={16} />
    </IconButton>
    
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      <TextField
        sx={{ flex: 1, minWidth: '180px' }}
        label={`Daughter ${index + 1} Name`}
        value={daughter.name}
        onChange={(e) => updateDaughter(index, 'name', e.target.value)}
        placeholder="Enter daughter's name"
        size="small"
      />
      <TextField
        sx={{ flex: 1, minWidth: '150px' }}
        label="Date of Birth"
        type="date"
        value={daughter.dob}
        onChange={(e) => updateDaughter(index, 'dob', e.target.value)}
        size="small"
        InputLabelProps={{ shrink: true }}
      />
      <Button
        size="small"
        variant="outlined"
        component="label"
        startIcon={<CloudUploadIcon />}
        sx={{
          textTransform: 'none',
          borderRadius: '8px',
          borderColor: '#667eea',
          color: '#667eea',
          '&:hover': {
            borderColor: '#764ba2',
            backgroundColor: '#f5f3ff'
          }
        }}
      >
        {daughter.file ? 'Change File' : 'Upload'}
        <input
          type="file"
          hidden
          accept="image/jpeg,image/jpg,image/png"
          onChange={(e) => handleFileSelect(e, 'daughter', index)}
        />
      </Button>
    </Box>

    {/* ========== FIXED: Show existing file or new file ========== */}
    {(daughter.file || daughter.document_id) && (
      <Box sx={{ marginTop: '8px' }}>
        {daughter.file ? (
          // Show newly selected file
          <Typography variant="caption" sx={{ color: '#10b981', display: 'block' }}>
            📄 New: {daughter.file.name.substring(0, 30)}
          </Typography>
        ) : daughter.document_id ? (
          // Show existing file from database
          <Typography variant="caption" sx={{ color: '#3b82f6', display: 'block' }}>
            📎 Existing file uploaded (ID: {daughter.document_id})
          </Typography>
        ) : null}
      </Box>
    )}

    {fileErrors.daughters[index] && (
      <Typography variant="caption" sx={{ color: 'red', mt: 1, display: 'block' }}>
        {fileErrors.daughters[index]}
      </Typography>
    )}
  </Box>
))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Sons Section */}
        <Box sx={{ marginBottom: '24px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151' }}>
              👦 Sons
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={addSon}
              sx={{
                textTransform: 'none',
                borderRadius: '20px',
                borderColor: '#10b981',
                color: '#10b981',
                '&:hover': {
                  borderColor: '#059669',
                  backgroundColor: '#f0fdf4'
                }
              }}
            >
              + Add Son
            </Button>
          </Box>

          {/* Dynamic Son Fields */}
      {familyFormData.sons?.map((son, index) => (
  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative' }}>
    <IconButton
      onClick={() => removeSon(index)}
      size="small"
      sx={{
        position: 'absolute',
        top: -8,
        right: -5,
        color: '#ef4444',
        backgroundColor: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        '&:hover': {
          backgroundColor: '#fee2e2'
        }
      }}
    >
      <CircleX size={16} />
    </IconButton>
    
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      <TextField
        sx={{ flex: 1, minWidth: '180px' }}
        label={`Son ${index + 1} Name`}
        value={son.name}
        onChange={(e) => updateSon(index, 'name', e.target.value)}
        placeholder="Enter son's name"
        size="small"
      />
      <TextField
        sx={{ flex: 1, minWidth: '150px' }}
        label="Date of Birth"
        type="date"
        value={son.dob}
        onChange={(e) => updateSon(index, 'dob', e.target.value)}
        size="small"
        InputLabelProps={{ shrink: true }}
      />
      <Button
        size="small"
        variant="outlined"
        component="label"
        startIcon={<CloudUploadIcon />}
        sx={{
          textTransform: 'none',
          borderRadius: '8px',
          borderColor: '#667eea',
          color: '#667eea',
          '&:hover': {
            borderColor: '#764ba2',
            backgroundColor: '#f5f3ff'
          }
        }}
      >
        {son.file ? 'Change File' : 'Upload'}
        <input
          type="file"
          hidden
          accept="image/jpeg,image/jpg,image/png"
          onChange={(e) => handleFileSelect(e, 'son', index)}
        />
      </Button>
    </Box>

    {/* Show existing file or new file */}
    {(son.file || son.document_id) && (
      <Box sx={{ marginTop: '8px' }}>
        {son.file ? (
          <Typography variant="caption" sx={{ color: '#10b981', display: 'block' }}>
            📄 New: {son.file.name.substring(0, 30)}
          </Typography>
        ) : son.document_id ? (
          <Typography variant="caption" sx={{ color: '#3b82f6', display: 'block' }}>
            📎 Existing file uploaded (ID: {son.document_id})
          </Typography>
        ) : null}
      </Box>
    )}

    {fileErrors.sons[index] && (
      <Typography variant="caption" sx={{ color: 'red', mt: 1, display: 'block' }}>
        {fileErrors.sons[index]}
      </Typography>
    )}
  </Box>
))}

          
          {(!familyFormData.sons || familyFormData.sons.length === 0) && (
            <Typography variant="body2" sx={{ color: '#9ca3af', textAlign: 'center', py: 2 }}>
              No sons added. Click "+ Add Son" to add.
            </Typography>
          )}
        </Box>



        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', marginTop: '16px' }}>
          <Button
            variant="outlined"
            onClick={handleCloseFamilyModal}
            sx={{ textTransform: 'none', borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleFamilySubmit}
            disabled={familyLoading}
            startIcon={familyLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              backgroundColor: '#10b981',
              '&:hover': { backgroundColor: '#059669' }
            }}
          >
            {familyLoading ? 'Saving...' : 'Save Family Details'}
          </Button>
        </Box>
      </Box>
    </Paper>
  </div>
)}

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
            <button
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
            </button>

            <MediDocUpload
              rowData={selectedRow}
              onClose={handleCloseModal}
                refreshTable={joinData}
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
            joinData();
          }}
        />
      )}
    </Box>
  );
};

export default Mediclaim;
