

import { useState, useEffect, useMemo, useRef} from 'react'; //added by rajakumari.m on 29-07-2026
import { createPortal } from 'react-dom'; // added by rajakumari.m on 29-07-2026
import { Search, Eye, TrendingUp, Users, FileText, ChevronLeft, ChevronRight, Filter, Download, RefreshCw, UserCheck, ClipboardList, Clock, UserCog, ChevronDown, Check, User } from 'lucide-react';// added by rajakumari.m on 30-07-2026
import { API_BASE_URL } from '../Config/Config';
import { useNavigate } from 'react-router-dom';
import ManPowerView from './ManPowerView';
import axiosInstance from '../Config/axiosConfig';
import Swal from 'sweetalert2';
const STICKY_LEFT = { sno: 0, action: 50, caseId: 140, plant: 250 };//added by rajakumari.m on 30-07-2026
const AssignedTasks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState([]);
  const navigate = useNavigate();
const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
const [hrEmployees, setHrEmployees] = useState([]); // added by rajakumari.m on 29-07-2026
const [selectedRowIds, setSelectedRowIds] = useState(new Set());// added by rajakumari.m on 30-07-2026
const [bulkReassignOpen, setBulkReassignOpen] = useState(false); // added by rajakumari.m on 30-07-2026
const [reassignConfirm, setReassignConfirm] = useState(null); //  added by rajakumari.m on 29-07-2026
const [reassignSuccess, setReassignSuccess] = useState(null); // added by rajakumari.m on 29-07-2026

const [showOnboardModal, setShowOnboardModal] = useState(false); //added by ajith 31/07/2026
const [selectedRow, setSelectedRow] = useState(null);//added by ajith 31/07/2026
const [joiningDate, setJoiningDate] = useState('');//added by ajith 31/07/2026
const [remarks, setRemarks] = useState('');//added by ajith 31/07/2026
const [formError, setFormError] = useState('');//added by ajith 31/07/2026

  const [desig, setDesig] = useState([]);
  // const token = useMemo(() => {
  //   const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
  //   return info?.token;
  // }, []);
  // ---------------added by rajakumari.m 0n 29-07-2026---------------------
  const userInfo = useMemo(() => {
  return JSON.parse(localStorage.getItem('userInfo') || '{}');
}, []);

const token = useMemo(() => userInfo?.token, [userInfo]);


const isAdmin = useMemo(() => {
  const role = (userInfo?.role || userInfo?.Emp_Category || userInfo?.emp_category || '').toString().toLowerCase();
  return role === 'admin';
}, [userInfo]);

//added by ajith 31/07/2026
// const handleOnboardSubmit = async () => {
//   if (!joiningDate || !remarks.trim()) {
//     setFormError("Joining date and remarks are both required.");
//     return;
//   }
//   console.log("casssssssssss",selectedRow);

//   try {
//     const response = await axiosInstance.post(
//       `${API_BASE_URL}/candidate-onboarding`,
//       {
//         case_Id: selectedRow?.CHILD_CASEID, // Change to your primary key
//         joiningDate: joiningDate,
//         Candidate_Remarks: remarks
//       }
//     );

//     if (response.data.success) {
//       Swal.fire({
//         icon: "success",
//         title: "Success",
//         text: "Candidate moved to onboarding successfully.",
//       });

//       setShowOnboardModal(false);

//       // Refresh table
//             fetchTaskAssignments();
//     }
//   } catch (error) {
//     console.error(error);

//     Swal.fire({
//       icon: "error",
//       title: "Error",
//       text: "Failed to update onboarding.",
//     });
//   }
// };


const handleOnboardSubmit = async () => {
  
  if (!joiningDate || !remarks.trim()) {
    setFormError("Joining date and remarks are both required.");
    return;
  }

  const result = await Swal.fire({
    title: "Are you sure?",
    text: "Do you want to move this candidate to onboarding?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Move",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#16a34a",
    cancelButtonColor: "#d33",
  });

  if (!result.isConfirmed) return;

  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/candidate-onboarding`,
      {
        case_Id: selectedRow?.CHILD_CASEID,
        joiningDate: joiningDate,
        Candidate_Remarks: remarks,
      }
    );

    if (response.data.success) {
      // Refresh table
      await fetchTaskAssignments();

      // Close onboarding popup
      setShowOnboardModal(false);

      // Success alert
 Swal.fire({
  icon: "success",
  title: "Success",
  text: "Candidate moved to onboarding successfully.",
  timer: 2000,          // 2 seconds
  showConfirmButton: false,
  timerProgressBar: true,
});
    }
  } catch (error) {
    console.error(error);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to move candidate to onboarding.",
    });
  }
};


const toggleRowSelect = (id) => {
  setSelectedRowIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
};
// ----------------------------------------------------------------

   const handleViewClick = (caseId) => {
    setSelectedCaseId(caseId);
    setIsModalOpen(true);
  };

  // const handleCloseModal = () => {
  //   setIsModalOpen(false);
  //   setSelectedCaseId(null);
  // };
// added by rajakumari.m on 29-07-2026
const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCaseId(null);
  };
// added by rajakumari.m on 29-07-2026
const handleReassign = async () => {
  if (!reassignConfirm) return;
  const { rows, employee } = reassignConfirm;
  setReassignConfirm(null);
  try {
    await Promise.all(
      rows.map((row) =>
        fetch(`${API_BASE_URL}/hr-reassign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
      body: JSON.stringify({
        case_id: row.case_id,
        reassign_to: reassignConfirm?.employee?.EMP_NAME,
        reassign_by: userInfo?.employee,
        prevassign_to: row.assigned_to,
        prevassign_by: row.assigned_by,
        reassign_status: userInfo?.Emp_Category,
       }),
        })
      )
    );
    fetchTaskAssignments();
    setSelectedRowIds(new Set());
    setReassignSuccess({ count: rows.length, empName: employee.EMP_NAME });
  } catch (err) {
    console.error('Reassign error', err);
  }
};
  // -----------------------------------------------

// added by rajakumari.m on 29-07-2026 
// added by rajakumari.m on 29-07-2026 — auto-close success popup after 1 second
useEffect(() => {
  if (!reassignSuccess) return;
  const timer = setTimeout(() => {
    setReassignSuccess(null);
  }, 1000);
  return () => clearTimeout(timer);
}, [reassignSuccess]);

useEffect(() => {
  if (!token) return;
  const fetchHrEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/mhc-hr-list`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHrEmployees(data?.hrDropDownListData || []);
    } catch (err) {
      console.error('Error fetching HR employees list', err);
    }
  };
  fetchHrEmployees();
}, [token]);
const ReassignDropdown = ({ row, hrEmployees, isOpen, onToggle, onSelect }) => {
  const btnRef = useRef(null);
  const listRef = useRef(null);
  const [coords, setCoords] = useState(null);

  const computePosition = (measuredHeight) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const dropdownWidth = 250;
    const dropdownHeight = measuredHeight || listRef.current?.offsetHeight || 40;
    const openUpward = window.innerHeight - rect.bottom < dropdownHeight + 8;

    let left = rect.right - dropdownWidth;
    left = Math.max(8, Math.min(left, window.innerWidth - dropdownWidth - 8));

    setCoords({
      top: openUpward ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
      left,
    });
  };

  // Rough position so the list can mount
  useEffect(() => {
    if (!isOpen) {
      setCoords(null);
      return;
    }
    computePosition();
    window.addEventListener('scroll', computePosition, true);
    window.addEventListener('resize', computePosition);
    return () => {
      window.removeEventListener('scroll', computePosition, true);
      window.removeEventListener('resize', computePosition);
    };
  }, [isOpen]);

  // Watches the list's REAL rendered size and repositions the instant it's known
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect?.height;
      if (height) computePosition(height);
    });
    ro.observe(listRef.current);
    return () => ro.disconnect();
  }, [isOpen, coords]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold
                   bg-gradient-to-r from-violet-100 to-purple-50 text-violet-700
                   border border-violet-200 shadow-sm hover:shadow-md hover:scale-105
                   transition-all duration-200 cursor-pointer"
      >
        <UserCog className="w-3.5 h-3.5" />
        Reassign
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && coords && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => onToggle()} />
          <div
            ref={listRef}
            style={{ top: coords.top, left: coords.left, width: 250, position: 'fixed' }}
            className="max-h-56 overflow-y-auto thin-scroll bg-white rounded-lg
                       shadow-xl border border-gray-200 z-[9999] py-1"
          >
            {hrEmployees.length > 0 ? (
              hrEmployees.map((emp, idx) => (
                <button
                  key={`${emp.EMP_ID}_${idx}`}
                  onClick={() => onSelect(emp)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700
                             hover:bg-violet-50 hover:text-violet-700 transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="flex-1 truncate">
                    {emp.EMP_NAME} <span className="text-gray-400">({emp.EMP_ID})</span>
                  </span>
                  {row.assigned_to === emp.EMP_NAME && (
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-gray-400">Loading HR list...</div>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};
//------------------------------------------------------------------------------------------------------------------------------------

  const fetchTaskAssignments = async () => {
    if (!token) {
      console.warn('No token found');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/overAll-TskAs-GetDt`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();

      console.log('Task Assignment Data:', data);
      setTaskData(data?.TaskAsgnDt || []);
    } catch (err) {
      console.error('Error fetching task assignments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTaskAssignments();
    }
  }, [token]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter]);






  const fetchAllData = async () => {
    if (!token?.token) return;
  
    setLoading(true);
    try {
      const deptRes = await axiosInstance.get(`${API_BASE_URL}/employee-dept`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token.token}`,
        },
      });
  
  const designations =
    deptRes.data?.employeeData
      ?.map(item => item.DESIGNATION?.trim())
      ?.filter(d => d);
  
  const sortedDesignations = [...new Set(designations)].sort((a, b) =>
    a.localeCompare(b)
  );
  
  setDesig(sortedDesignations);
  
    
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbar({
        open: true,
        message: "Failed to load data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAllData();
  }, [token?.token]);

  const handleViewDetails = (row) => {
    if (!row?.case_id) return;
    navigate(`/TaskDetails?caseId=${row.case_id}`);
  };

  const filteredRows = useMemo(() => {
    let data = [...taskData];
   if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (row) =>
          (row.case_id || '').toLowerCase().includes(term) ||
          (row.assigned_to || '').toLowerCase().includes(term) ||
          (row.assigned_by || '').toLowerCase().includes(term) ||
          (row.current_task || '').toLowerCase().includes(term)
      );
    }
    //added by 25/07/2026
if (statusFilter !== 'all') {
  data = data.filter((row) => {
    if (statusFilter === "Completed") {
      return row.status === "Completed" || row.status === "Offer Approved";
    }
    return row.status === statusFilter;
  });
}
    return data;
  }, [taskData, searchTerm, statusFilter]);



  console.log("hiiiiiiiiiii",
  [...new Set(taskData.map(item => item.status))]
);

  //added by 25/07

const pendingStages = [
  "Actions",
  "Recruitment Mail",
  "Verification",
  "Salary Stack Up",
  "Candidate Approval",
  "Note For Approval",
  "Offer Letter",
];



const stats = useMemo(() => {
  const completedCount = taskData.filter(
    row => row.status === "Completed" || row.status === "Offer Approved"
  ).length;

  const holdCount = taskData.filter(
    row => row.status === "Hold"
  ).length;

  const cancelledCount = taskData.filter(
    row => row.status === "Cancelled"
  ).length;

  return {
    total: taskData.length,
    completed: completedCount,
    pending: taskData.length - completedCount - holdCount - cancelledCount,
    hold: holdCount,
    cancelled: cancelledCount,
  };
}, [taskData]);
  const paginatedRows = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRows.length / pageSize);
  const safeTotalPages = Math.max(1, totalPages);
const getStatusStyle = (status) => {
  const styles = {
    "Actions":
      "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-300",

    "Recruitment Mail":
      "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-300",

    "Verification":
      "bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 border border-orange-300",

    "Salary Stack Up":
      "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border border-purple-300",

    "Candidate Approval":
      "bg-gradient-to-r from-rose-100 to-rose-50 text-rose-700 border border-rose-300",

    "Note For Approval":
      "bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-300",

    "Offer Letter":
      "bg-gradient-to-r from-sky-100 to-sky-50 text-sky-700 border border-sky-300",



    "Completed":
      "bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-300",

    "Pending":
      "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-300"
  };

  return styles[status] || styles.Pending;
};


const tdStyle = "px-3 py-1 text-[11px] text-gray-800 font-medium";
  return (
    <div className="min-h-screen bg-white" style={{ paddingLeft: '5px' }}>
      <div className="w-full px-1 py-0.1">
        {/* Header Section */}
      <div className="mb-2">  {/* Change mb-5 to mb-2 */}
          <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Header Section */}
<div className="w-full px-1 py-0.1">
  {/* Header Section */}
  <div className="mb-1">
    <div className="bg-gradient-to-r from-purple-50 to-white rounded-lg px-4 py-2 shadow-sm border border-purple-200 flex justify-center items-center w-full">
      <h1 className="text-xl font-bold" style={{ color: '#49225b' }}>
       Assigned Tasks
      </h1>
    </div>
  </div>
 </div> </div>
        </div>

        {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
          <StatCard
            title="Total Tasks"
            value={stats.total}
            icon={<ClipboardList className="w-4 h-4" />}
            color="blue"
          />
          <StatCard
            title="Pending Tasks"
            value={stats.pending}
            icon={<Clock className="w-4 h-4" />}
            color="purple"
          />
          <StatCard
            title="Completed Tasks"
            value={stats.completed}
            icon={<UserCheck className="w-4 h-4" />}
            color="emerald"
          />
          <StatCard
  title="Hold Tasks"
  value={stats.hold}
  icon={<Clock className="w-4 h-4" />}
  color="yellow"
/>

<StatCard
  title="Cancelled Tasks"
  value={stats.cancelled}
  icon={<FileText className="w-4 h-4" />}
  color="red"
/>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-gray-300 transition-all duration-300">
          {/* Filters Bar */}
          <div className="px-4 py-3 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Case ID, Assigned To, Assigned By, or Task..."
                  className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-xs hover:border-blue-300 hover:shadow-md bg-white"
                />
              </div>

              <div className="flex gap-2">
                <div className="relative group">
                  <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
           <select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  className="pl-8 pr-7 py-2 border-2 border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer text-xs font-medium hover:border-blue-300 hover:shadow-md transition-all"
>
  <option value="all">All Stages</option>
  <option value="Actions">Actions</option>
  <option value="Recruitment Mail">Recruitment</option>
  <option value="Verification">Verification</option>
  <option value="Salary Stack Up">Salary Stack Up</option>
  <option value="Candidate Approval">Candidate Approval</option>
  <option value="Note For Approval">Note For Approval</option>
  <option value="Offer Letter">Offer Letter</option>
  <option value="Offer Approved">Offer Approved</option>
  <option value="Hold">Hold</option>
<option value="Cancelled">Cancelled</option>
</select>
                </div>
                {/*added by rajakumari.m on 30-07-2026----------------------------------------------  */}
{isAdmin && (
  <div className="relative">
    <button
      onClick={() => setBulkReassignOpen(o => !o)}
      disabled={selectedRowIds.size === 0}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
                 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm
                 hover:shadow-md hover:scale-105 transition-all duration-200
                 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      <UserCog className="w-3.5 h-3.5" />
      Reassign {selectedRowIds.size > 0 ? `(${selectedRowIds.size})` : ''}
      <ChevronDown className={`w-3 h-3 transition-transform ${bulkReassignOpen ? 'rotate-180' : ''}`} />
    </button>

    {bulkReassignOpen && selectedRowIds.size > 0 && (
      <>
        <div className="fixed inset-0 z-[9998]" onClick={() => setBulkReassignOpen(false)} />
        <div className="absolute right-0 top-full mt-1 w-64 max-h-56 overflow-y-auto thin-scroll
                        bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] py-1">
          {hrEmployees.length > 0 ? (
            hrEmployees.map((emp, idx) => (
              <button
                key={`${emp.EMP_ID}_${idx}`}
                onClick={() => {
                  setBulkReassignOpen(false);
                  const rows = taskData.filter(r => selectedRowIds.has(r.task_assignment_id));
                  setReassignConfirm({ rows, employee: emp });
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700
                           hover:bg-violet-50 hover:text-violet-700 transition-colors text-left"
              >
                <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="flex-1 truncate">
                  {emp.EMP_NAME} <span className="text-gray-400">({emp.EMP_ID})</span>
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-gray-400">Loading HR list...</div>
          )}
        </div>
      </>
    )}
  </div>
)}
{/* ------------------------------------------------------------------------------------------------------------- */}
                <div className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-xs font-semibold text-blue-700">
                    {filteredRows.length} {filteredRows.length === 1 ? 'Result' : 'Results'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center" style={{ height: '520px' }}>
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-gray-600 text-sm font-medium">Loading task assignments...</p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center" style={{ height: '520px' }}>
              <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mb-3 shadow-inner">
                <Search className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-900 font-semibold text-base mb-0.5">No results found</p>
              <p className="text-gray-600 text-sm">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
             <div className="overflow-x-auto">
              <table className="min-w-[2100px]">   {/* // changed w-full min-w-[1800px] to  by rajakumari.m on 29-07-2026 */}
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-gray-100 via-blue-50 to-gray-100 border-b-2 border-gray-300">
                      {[
                        // { key: 'sno', label: 'S.No', width: 'w-5' },
                        // { key: 'Action', label: 'Action', width: 'w-8' },
                        // { key: 'caseId', label: 'Case ID', width: 'w-20' },
                        // { key: 'plant', label: 'Plant', width: 'w-56' },
                        // added by rajakumari.m on 30-07-2026-----------------------------------------------------
 { key: 'sno', label: 'S.No', width: 'w-5', sticky: true, left: STICKY_LEFT.sno },
  { key: 'Action', label: 'Action', width: 'w-8', sticky: true, left: STICKY_LEFT.action },
  { key: 'caseId', label: 'Case ID', width: 'w-20', sticky: true, left: STICKY_LEFT.caseId },
  { key: 'plant', label: 'Plant', width: 'w-50', sticky: true, left: STICKY_LEFT.plant },

                        // ------------------------------------------------------------------------------------------
                         { key: 'department', label: 'Dept', width: 'w-25' },
                       { key: 'designation', label: 'Desig/Position', width: 'w-40' },
                       
                        { key: 'assignedBy', label: 'Assigned By', width: 'w-30' },
                        { key: 'assignedTo', label: 'Assigned To', width: 'w-30' },
                        { key: 'status', label: 'Status', width: 'w-30' },
                        { key: 'assignedDate', label: 'Assigned Date', width: 'w-30' },
                          { key: 'Hold_Date', label: 'Hold Date', width: 'w-30' },
                      { key: 'Cancel_Date', label: 'Cancel Date', width: 'w-30' },
      // added by ajit 0n 3007-2026-------------
                         ...(isAdmin ? [{ key: 'Move To OnBoarding', label: 'Move To OnBoarding', width: 'w-40' }] : []),
                      // added by rajakumari.m 0n 2907-2026-------------
                      ...(isAdmin ? [{ key: 'reassignSelect', label: 'Select', width: 'w-16' }] : []),
].map((col) => (
  <th
    key={col.key}
    style={col.sticky ? { left: col.left, position: 'sticky', zIndex: 20 } : undefined}
    className={`${col.width} px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider ${col.sticky ? 'bg-gray-100' : ''}`}
  >
    {col.label}
  </th>
))}
{/* -------------------------------------------------- */}
                    
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedRows.map((row, index) => (
                      <tr
                        key={row.task_assignment_id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-blue-50 transition-all duration-200 group hover:shadow-md"
                      >
                        {/* <td className={tdStyle}>
                          {currentPage * pageSize + index + 1}
                        </td>


                         <td className={tdStyle}>
  <button
    onClick={() => handleViewClick(row.case_id)} 
    className="inline-flex items-center gap-1.5 px-3 py-1 
               rounded-lg text-xs font-semibold 
               transition-all duration-200 shadow-sm 
               hover:shadow-md hover:scale-105 cursor-pointer
               bg-gradient-to-r from-blue-100 to-indigo-200
               text-indigo-700
               hover:from-blue-200 hover:to-indigo-300
               border border-indigo-200"
  >
    <Eye className="w-3.5 h-3.5" />
    View
  </button>
</td>
                       <td className={tdStyle}>
                          <span className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                            {row.case_id || ''}
                          </span>
                        </td>
                       <td className={tdStyle}>
                          <span className="text-xs font-bold text-gray-900">
                            {row.PLANT || ''}
                          </span>
                        </td> */}
                        {/* added by rajakumari.m on 30-07-2026------------------------------------- */}
{/* S.No */}
<td style={{ position: 'sticky', left: STICKY_LEFT.sno, zIndex: 10 }} className={`${tdStyle} bg-white group-hover:bg-blue-50`}>
  {currentPage * pageSize + index + 1}
</td>

{/* Action */}
<td style={{ position: 'sticky', left: STICKY_LEFT.action, zIndex: 10 }} className={`${tdStyle} bg-white group-hover:bg-blue-50`}>
  <button
    onClick={() => handleViewClick(row.case_id)}
    className="inline-flex items-center gap-1.5 px-3 py-1 
               rounded-lg text-xs font-semibold 
               transition-all duration-200 shadow-sm 
               hover:shadow-md hover:scale-105 cursor-pointer
               bg-gradient-to-r from-blue-100 to-indigo-200
               text-indigo-700
               hover:from-blue-200 hover:to-indigo-300
               border border-indigo-200"
  >
    <Eye className="w-3.5 h-3.5" />
    View
  </button>
</td>

{/* Case ID */}
<td style={{ position: 'sticky', left: STICKY_LEFT.caseId, zIndex: 10 }} className={`${tdStyle} bg-white group-hover:bg-blue-50`}>
  <span className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
    {row.case_id || ''}
  </span>
</td>

{/* Plant */}
<td style={{ position: 'sticky', left: STICKY_LEFT.plant, zIndex: 10 }} className={`${tdStyle} bg-white group-hover:bg-blue-50`}>
  <span className="text-xs font-bold text-gray-900">
    {row.PLANT || ''}
  </span>
</td>
                        {/* ------------------------------------------------------------------------- */}
                       <td className={tdStyle}>
                         <span>
    {row.GROUP_CODE 
      ? `${row.GROUP_CODE} - ${row.DEPT || ''}` 
      : (row.DEPT || '')}
  </span>
                        </td>
                 <td className={tdStyle}>
<span>
  {`${row.MANPOWER_DESG || row.SUB_POST || 'N/A'}`}
</span>

</td>
                        <td className={tdStyle}>
                          <span>
                            {row.assigned_by || ''}
                          </span>
                        </td>
                       <td className={tdStyle}>
                          <span>
                            {row.assigned_to || ''}
                          </span>
                        </td>
                   
{/* 
//added by 25/07 */}
<td className={tdStyle}>
<button
  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 cursor-pointer whitespace-nowrap ${
    getStatusStyle(row.status)
  }`}
>
  {row.status}
</button>
</td>
                        <td className="px-3 py-2 text-xs text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                          {row.assigned_date
                            ? new Date(row.assigned_date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                            : ''}
                        </td>

                               <td className={tdStyle}>
                          <span>
                            {row.Hold_Date || ''}
                          </span>
                        </td>

                        <td className={tdStyle}> 
                          <span> 
                            {row.Cancel_Date || ''} 
                          </span> 
                        </td>

<td className={tdStyle}>
  {row.status === "Verification" && (
    <button
      onClick={() => {
        setSelectedRow(row);
        setJoiningDate('');
        setRemarks('');
        setFormError('');
        setShowOnboardModal(true);
      }}
      className="px-2 py-1 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors"
    >
      Move to Onboarding
    </button>
  )}
</td>
                        {/* added by rajakumari.m on 29-07-2026 */}
{/* added by rajakumari.m on 29-07-2026 */}
{isAdmin && (
  <td className={tdStyle}>
    <input
      type="checkbox"
      checked={selectedRowIds.has(row.task_assignment_id)}
      onChange={() => toggleRowSelect(row.task_assignment_id)}
      className="w-4 h-4 accent-violet-600 cursor-pointer"
    />
  </td>
)}
{/* ------------------------------------------------------------------------------------------------------------------------- */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-700">
                      Showing{' '}
                      <span className="font-semibold text-blue-600">{currentPage * pageSize + 1}</span>
                      {' '}-{' '}
                      <span className="font-semibold text-blue-600">
                        {Math.min((currentPage + 1) * pageSize, filteredRows.length)}
                      </span>
                      {' '}of{' '}
                      <span className="font-semibold text-blue-600">{filteredRows.length}</span>
                    </span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(0);
                      }}
                      className="px-2.5 py-1 border-2 border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-blue-300 hover:shadow-md transition-all bg-white"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="inline-flex items-center justify-center w-8 h-8 border-2 border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>

                    <span className="text-xs text-gray-700 font-semibold px-2">
                      Page {currentPage + 1} of {safeTotalPages}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(safeTotalPages - 1, p + 1))
                      }
                      disabled={currentPage >= safeTotalPages - 1}
                      className="inline-flex items-center justify-center w-8 h-8 border-2 border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto relative">
     
      <ManPowerView caseId={selectedCaseId} onClose={handleCloseModal} />
    </div>
  </div>
)}
{/* added by ajith 31/07/2026 */}
{showOnboardModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <div className="mb-5">
 <h2 className="text-lg font-semibold text-purple-700">
  Move to Onboarding
</h2>
        {selectedRow?.Candidate_Name && (
          <p className="text-sm text-gray-500 mt-0.5">
            {selectedRow.Candidate_Name}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {/* Case ID - read only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Case ID
          </label>
          <input
            type="text"
            value={selectedRow?.CHILD_CASEID || ''}
            readOnly
            className="w-full border border-gray-200 bg-gray-50 text-gray-600 rounded-md px-3 py-2 text-sm cursor-not-allowed focus:outline-none"
          />
        </div>

        {/* Joining Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Joining Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={joiningDate}
            onChange={(e) => {
              setJoiningDate(e.target.value);
              setFormError('');
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks <span className="text-red-500">*</span>
          </label>
          <textarea
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              setFormError('');
            }}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none"
            placeholder="Enter remarks..."
          />
        </div>
      </div>

      {formError && (
        <p className="text-sm text-red-600 mt-3">{formError}</p>
      )}

      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={() => setShowOnboardModal(false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleOnboardSubmit}
          disabled={!joiningDate || !remarks.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}
{/* ----------------------------------------------------------------------------------------------------------------- */}
{reassignConfirm && (
  <div
    className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] flex items-center justify-center z-[10000] p-4 animate-[fadeIn_0.15s_ease-out]"
    onClick={() => setReassignConfirm(null)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 w-full max-w-md p-6 animate-[popIn_0.2s_ease-out]"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-purple-50 border border-violet-200 flex items-center justify-center shrink-0">
          <UserCog className="w-5 h-5 text-violet-600" />
        </div>
        <h2 className="text-sm font-bold text-gray-900">Confirm Reassignment</h2>
      </div>

      <p className="text-[13px] text-gray-600 leading-relaxed mb-6">
        You're about to reassign <span className="font-semibold text-gray-900">{reassignConfirm.rows.length}</span>{' '}
        selected case{reassignConfirm.rows.length > 1 ? 's' : ''} to{' '}
        <span className="font-semibold text-violet-700">{reassignConfirm.employee.EMP_NAME}</span>?
      </p>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setReassignConfirm(null)}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600
                     hover:bg-gray-50 hover:border-gray-300 transition-all duration-150"
        >
          Cancel
        </button>
        <button
          onClick={handleReassign}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white
                     bg-gradient-to-r from-violet-600 to-purple-600
                     hover:from-violet-700 hover:to-purple-700
                     shadow-sm hover:shadow-md hover:scale-[1.02]
                     transition-all duration-150"
        >
          Yes, Reassign
        </button>
      </div>
    </div>
  </div>
)}



{/* ----------------------------------------------------------------------------------------------------------------- */}
{reassignSuccess && (
  <div
    className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] flex items-center justify-center z-[10000] p-4 animate-[fadeIn_0.15s_ease-out]"
    onClick={() => setReassignSuccess(null)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 w-full max-w-md p-6 animate-[popIn_0.2s_ease-out] text-center"
    >
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
        <Check className="w-7 h-7 text-emerald-600" />
      </div>

      <h2 className="text-sm font-bold text-gray-900 mb-2">Reassigned Successfully</h2>

      <p className="text-[13px] text-gray-600 leading-relaxed">
        <span className="font-semibold text-gray-900">{reassignSuccess.count}</span> case
        {reassignSuccess.count > 1 ? 's have' : ' has'} been reassigned to{' '}
        <span className="font-semibold text-emerald-700">{reassignSuccess.empName}</span>.
      </p>
    </div>
  </div>
)}
{/* -------------------------------------------------------------------------------------------------------------------- */}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: {
      bgGradient: 'from-blue-50 via-blue-100 to-blue-50',
      text: 'text-blue-700',
      iconBg: 'from-blue-100 to-blue-200',
      border: 'border-blue-200',
      hoverBorder: 'hover:border-blue-400',
      hoverShadow: 'hover:shadow-blue-200/50'
    },
    purple: {
      bgGradient: 'from-purple-50 via-purple-100 to-purple-50',
      text: 'text-purple-700',
      iconBg: 'from-purple-100 to-purple-200',
      border: 'border-purple-200',
      hoverBorder: 'hover:border-purple-400',
      hoverShadow: 'hover:shadow-purple-200/50'
    },
    emerald: {
      bgGradient: 'from-emerald-50 via-emerald-100 to-emerald-50',
      text: 'text-emerald-700',
      iconBg: 'from-emerald-100 to-emerald-200',
      border: 'border-emerald-200',
      hoverBorder: 'hover:border-emerald-400',
      hoverShadow: 'hover:shadow-emerald-200/50'
    },
    yellow: {
  bgGradient: 'from-yellow-50 via-yellow-100 to-yellow-50',
  text: 'text-yellow-700',
  iconBg: 'from-yellow-100 to-yellow-200',
  border: 'border-yellow-200',
  hoverBorder: 'hover:border-yellow-400',
  hoverShadow: 'hover:shadow-yellow-200/50'
},

red: {
  bgGradient: 'from-red-50 via-red-100 to-red-50',
  text: 'text-red-700',
  iconBg: 'from-red-100 to-red-200',
  border: 'border-red-200',
  hoverBorder: 'hover:border-red-400',
  hoverShadow: 'hover:shadow-red-200/50'
}
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
   <div
  className={`bg-gradient-to-br ${colors.bgGradient} rounded-xl p-2 border-2 ${colors.border} ${colors.hoverBorder} shadow-md hover:shadow-xl ${colors.hoverShadow} transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 cursor-pointer group`}
>
  <div className="flex items-center justify-between gap-2">
    
    {/* Title */}
    <p className={`text-xs font-bold ${colors.text} flex-1`}>
      {title}
    </p>

    {/* Value */}
    {/* <div className={`bg-gradient-to-br ${colors.iconBg} rounded-lg px-30 py-1 shadow-sm`}> */}
      <p className={`text-sm font-bold ${colors.text}`}>
        {value}
      </p>
    {/* </div> */}

    {/* Icon */}
    <div className={`bg-gradient-to-br ${colors.iconBg} rounded-lg p-1.5 shadow-sm`}>
      <div className={colors.text}>{icon}</div>
    </div>

  </div>
</div>
  );
};
const scrollbarStyles = `
.thin-scroll::-webkit-scrollbar {
  width: 5px;
}
.thin-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.thin-scroll::-webkit-scrollbar-thumb {
  background-color: #c4b5fd;
  border-radius: 10px;
}
.thin-scroll {
  scrollbar-width: thin;
  scrollbar-color: #c4b5fd transparent;
}
`;
// place this near scrollbarStyles, outside any component
const popupStyles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('reassign-popup-style')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'reassign-popup-style';
  styleTag.innerHTML = popupStyles;
  document.head.appendChild(styleTag);
}
if (typeof document !== 'undefined' && !document.getElementById('reassign-thin-scroll-style')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'reassign-thin-scroll-style';
  styleTag.innerHTML = scrollbarStyles;
  document.head.appendChild(styleTag);
}

export default AssignedTasks;
