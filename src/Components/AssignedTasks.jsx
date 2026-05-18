import { useState, useEffect, useMemo } from 'react';
import { Search, Eye, TrendingUp, Users, FileText, ChevronLeft, ChevronRight, Filter, Download, RefreshCw, UserCheck, ClipboardList, Clock } from 'lucide-react';
import { API_BASE_URL } from '../Config/Config';
import { useNavigate } from 'react-router-dom';
import ManPowerView from './ManPowerView';

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

  console.log("seeeeeeeeeeeeee",selectedCaseId)
  const token = useMemo(() => {
    const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return info?.token;
  }, []);


   const handleViewClick = (caseId) => {
    setSelectedCaseId(caseId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCaseId(null);
  };

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
    if (statusFilter !== 'all') {
      data = data.filter((row) => row.status === statusFilter);
    }
    return data;
  }, [taskData, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: taskData.length,
      pending: taskData.filter((i) => i.status === 'Pending').length,
      completed: taskData.filter((i) => i.status === 'Completed').length,
    };
  }, [taskData]);

  const paginatedRows = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRows.length / pageSize);
  const safeTotalPages = Math.max(1, totalPages);

  const getStatusStyle = (status) => {
    if (!status) return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-300';
    if (status === 'Pending') return 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border border-amber-300';
    if (status === 'Completed') return 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-300';
    if (status === 'In Progress') return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-300';
    return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-300';
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <StatCard
            title="Total Assigned"
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
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>

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
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-gray-100 via-blue-50 to-gray-100 border-b-2 border-gray-300">
                      {[
                        { key: 'sno', label: 'S.No', width: 'w-5' },
                        { key: 'Action', label: 'Action', width: 'w-8' },
                        { key: 'caseId', label: 'Case ID', width: 'w-20' },
                        { key: 'plant', label: 'Plant', width: 'w-56' },
                         { key: 'department', label: 'Dept', width: 'w-25' },
                       { key: 'designation', label: 'Desig/Position', width: 'w-40' },
                        { key: 'assignedBy', label: 'Assigned By', width: 'w-30' },
                        { key: 'assignedTo', label: 'Assigned To', width: 'w-30' },
                        { key: 'status', label: 'Status', width: 'w-30' },
                        { key: 'assignedDate', label: 'Assigned Date', width: 'w-30' },
                      ].map((col) => (
                        <th
                          key={col.key}
                          className={`${col.width} px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider`}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedRows.map((row, index) => (
                      <tr
                        key={row.task_assignment_id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-blue-50 transition-all duration-200 group hover:shadow-md"
                      >
                        <td className={tdStyle}>
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
                        </td>
                       <td className={tdStyle}>
                         <span>
    {row.GROUP_CODE 
      ? `${row.GROUP_CODE} - ${row.DEPT || ''}` 
      : (row.DEPT || '')}
  </span>
                        </td>
                 <td className={tdStyle}>
  <span >
    {row.SUB_CODE 
      ? `${row.SUB_CODE} - ${row.MANPOWER_DESG || 'N/A'}`
      : (row.MANPOWER_DESG || 'N/A')}
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
                         <td className={tdStyle}>
                          <button
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 cursor-pointer ${getStatusStyle(row.status)}`}
                          >
                            {row.status || ''}
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
    <div className={`bg-gradient-to-br ${colors.iconBg} rounded-lg px-30 py-1 shadow-sm`}>
      <p className={`text-sm font-bold ${colors.text}`}>
        {value}
      </p>
    </div>

    {/* Icon */}
    <div className={`bg-gradient-to-br ${colors.iconBg} rounded-lg p-1.5 shadow-sm`}>
      <div className={colors.text}>{icon}</div>
    </div>

  </div>
</div>
  );
};

export default AssignedTasks;