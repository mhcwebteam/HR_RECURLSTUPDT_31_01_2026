
import { useState, useEffect, useMemo } from 'react';
import {
  Search, Eye, TrendingUp, Users, FileText, ChevronLeft, ChevronRight,
  Filter, Download, RefreshCw, DollarSign,
   ClipboardCheck, FileSignature
} from 'lucide-react';
import { API_BASE_URL } from '../Config/Config';
import { useNavigate } from 'react-router-dom';
import ManPowerView from './ManPowerView';
import { ClipboardList, Mail, ShieldCheck, BadgeDollarSign, UserCheck,  FileBadge, CircleCheckBig } from 'lucide-react';
const HrInbox = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [processFilter, setProcessFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [hrData, setHrData] = useState([]);
const [isModalOpen, setIsModalOpen] = useState(false);
 const [selectedCaseId, setSelectedCaseId] = useState(null);

 console.log("gggggggggggg",hrData);

  const navigate = useNavigate();

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

const hrAprvlFetchData = async () => {
  if (!token) {
    console.warn('No token found');
    return;
  }
  try {
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/hr-Aprvl-Data`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();

    console.log("API Response:", data);
    setHrData(data?.hrApprovalData || data?.HrAprvlData || []);
    
   
    if (data.counts) {
  
      console.log("Counts from API:", data.counts);
    }
  } catch (err) {
    console.error('Error fetching HR approvals', err);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    if (token) {
      hrAprvlFetchData();
    }
  }, [token]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, processFilter]);
  const handleViewDetails = (row) => {
    if (!row?.Recruit_Process) return;
    navigate(`/RecruitmentProcess?process=${row.Recruit_Process}`);
  };

  const filteredRows = useMemo(() => {
    let data = [...hrData];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (row) =>
          (row.Child_CaseId || '').toLowerCase().includes(term) ||
          (row.Recruit_Process || '').toLowerCase().includes(term)
      );
    }
    if (processFilter !== 'all') {
      data = data.filter((row) => {
        const process = (row.Recruit_Process || '').toLowerCase();
        return process.includes(processFilter.toLowerCase());
      });
    }
    return data;
  }, [hrData, searchTerm, processFilter]);

  

const stats = useMemo(() => {
  return {
    total: hrData.length,
 
    Actions:  hrData.filter(i =>
  (i.Recruit_Process || '').toLowerCase().includes('actions')
).length,

    recruitmentMail: hrData.filter((i) =>
      (i.Recruit_Process || '').toLowerCase().includes('recruitment mail')
  
    ).length,

    verification: hrData.filter((i) =>
      (i.Recruit_Process || '').toLowerCase().includes('verification')
    ).length,
    salaryStackup: hrData.filter((i) =>
      (i.Recruit_Process || '').toLowerCase().includes('salary stack') ||
      (i.Recruit_Process || '').toLowerCase().includes('salary')
    ).length,
    candidateApproval: hrData.filter((i) =>
      (i.Recruit_Process || '').toLowerCase().includes('candidate approval')
    ).length,
    noteForApproval: hrData.filter((i) =>
      (i.Recruit_Process || '').toLowerCase().includes('note for approval')
    ).length,
    offerLetter: hrData.filter((i) =>
      (i.Recruit_Process || '').toLowerCase().includes('offer letter')
    ).length,

   offerApproved: hrData.filter((i) =>
  (i.Recruit_Process || '').toLowerCase().includes('offer approved')
).length,
  };
}, [hrData]);

 
  const paginatedRows = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRows.length / pageSize);
  const safeTotalPages = Math.max(1, totalPages);

  // Add this helper function after the getStageLabel function
 const getProcessStyle = (process) => {
  if (!process) return 'bg-gray-100 text-gray-700 border border-gray-200';

  const processLower = process.toLowerCase();


    if (processLower.includes('Actions')) {
    return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-300';
  }

  if (processLower.includes('candidate approval')) {
    return 'bg-gradient-to-r from-rose-100 to-rose-50 text-rose-700 border border-rose-300';
  }
  if (processLower.includes('salary stack') || processLower.includes('salary')) {
    return 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border border-purple-300';
  }
  if (processLower.includes('verification')) {
    return 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 border border-orange-300';
  }
  // Change this line to include "hr recruitment"
  if (processLower.includes('recruitment mail')) {
    return 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-300';
  }
  if (processLower.includes('note for approval')) {
    return 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-300';
  }
  if (processLower.includes('offer letter')) {
    return 'bg-gradient-to-r from-sky-100 to-sky-50 text-sky-700 border border-sky-300';
  }

    if (processLower.includes('offer approved')) {
    return 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border border-yellow-300';
  }

  // Default color for other processes
  return 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 border border-slate-300';
};

const hasTypePlant = hrData.some(row => row.TYPE_PLANT);

  const recCycle = hrData.some(row => row.RECRUIT_CYCLE);

 const tdStyle = "px-1 py-1 text-[11px] text-gray-800 font-medium";
 

  return (
    <div className="min-h-screen bg-white" style={{ paddingLeft: '5px' }}>
      <div className="w-full px-1 py-0.1">
        {/* Header Section - Compressed */}
        <div className="mb-2"> 
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Header Section */}
            <div className="w-full px-1 py-0.1">
              {/* Header Section */}
              <div className="mb-1">
                <div className="bg-gradient-to-r from-purple-50 to-white rounded-lg px-4 py-2 shadow-sm border border-purple-200 flex justify-center items-center w-full">
                  <h1 className="text-xl font-bold" style={{ color: '#49225b' }}>
                    HR Approval Inbox
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Enhanced */}

       <div className="grid grid-cols-1 md:grid-cols-8 gap-2 mb-3">
  <StatCard
    title="Actions"
    value={stats.Actions}
    icon={<ClipboardList className="w-5 h-5" />}
    color="blue"
  />
  <StatCard
    title="Recruitment Mail"
    value={stats.recruitmentMail}
    icon={<Mail className="w-5 h-5" />}
    color="green"
  />
  <StatCard
    title="Verification"
    value={stats.verification}
    icon={<ShieldCheck className="w-5 h-5" />}
    color="orange"
  />
  <StatCard
    title="Salary Stackup"
    value={stats.salaryStackup}
    icon={<BadgeDollarSign className="w-5 h-5" />}
    color="purple"
  />
  <StatCard
    title="Candidate Aprvl"
    value={stats.candidateApproval}
    icon={<UserCheck className="w-5 h-5" />}
    color="rose"
  />
  <StatCard
    title="Note for Approval"
    value={stats.noteForApproval}
    icon={<FileText className="w-5 h-5" />}
    color="emerald"
  />
  <StatCard
    title="Offer Letter"
    value={stats.offerLetter}
    icon={<FileBadge className="w-5 h-5" />}
    color="sky"
  />
  <StatCard
    title="Offer Approved"
    value={stats.offerApproved}
    icon={<CircleCheckBig className="w-5 h-5" />}
    color="yellow"
  />
</div>

        {/* Main Table Card - Enhanced */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-gray-300 transition-all duration-300">
          {/* Filters Bar - Enhanced */}
          <div className="px-4 py-3 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Case ID or Recruitment Process..."
                  className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-xs hover:border-blue-300 hover:shadow-md bg-white"
                />
              </div>

              <div className="flex gap-2">
                <div className="relative group">
                  <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  <select
                    value={processFilter}
                    onChange={(e) => setProcessFilter(e.target.value)}
                    className="pl-8 pr-7 py-2 border-2 border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer text-xs font-medium hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <option value="all">All Processes</option>
                        <option value="all">Actions</option>
                    <option value="recruitment mail">Recruitment Mail</option>
                    <option value="verification">Verification</option>
                    <option value="salary">Salary Stackup</option>
                    <option value="candidate approval">Candidate Approval</option>
                    <option value="note for approval">Note for Approval</option>
                    <option value="offer letter">Offer Letter</option>
                     <option value="Offer Approved">Offer Approved</option>
                  </select>
                </div>

                <div className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-xs font-semibold text-blue-700">
                    {filteredRows.length} {filteredRows.length === 1 ? 'Result' : 'Results'}
                  </span>
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
          </div>

          {/* Table Content - Enhanced */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-gray-600 text-sm font-medium">Loading approvals...</p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
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
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-100 via-blue-50 to-gray-100 border-b-2 border-gray-300">
                      {[
                        { key: 'sno', label: 'S.No', width: 'w-8' },
                        
                           { key: 'Action', label: 'Action', width: 'w-10' },
                        { key: 'caseId', label: 'Case ID', width: 'w-20' },
                        { key: 'plant', label: 'Plant', width: 'w-60' },
                        ...(hasTypePlant ? [{ key: 'typeofplant', label: 'Type of Plant', width: 'w-32' }] : []),
...(recCycle ? [{ key: 'Recruitcycle', label: 'Recruit cycle', width: 'w-32' }] : []),
                        { key: 'department', label: 'Department', width: 'w-32' },
                         { key: 'designation', label: 'Desig/Position', width: 'w-46' },
                        { key: 'created', label: 'Created', width: 'w-26' },
                        { key: 'updated', label: 'Updated', width: 'w-26' },
                        { key: 'process', label: 'Recruitment Process', width: 'w-46' },
                      ].map((col) => (
                        <th
                          key={col.key}
                          className={`${col.width} px-0.5 py-1.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider`}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedRows.map((row, index) => (
                      <tr
                        key={row.all_apprvls_hr_Id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-blue-50 transition-all duration-200 group hover:shadow-md"
                      >
                        <td className={tdStyle}>
                          {currentPage * pageSize + index + 1}
                        </td>

                        
                        <td className={tdStyle}>
  <button
    onClick={() => handleViewClick(row?.Child_CaseId)} 
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
                            {row.Child_CaseId || ''}
                          </span>
                        </td>
                     <td className={tdStyle}>
                          <span className="text-xs text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                            {row.PLANT || ''}
                          </span>
                        </td>
                       

                       {hasTypePlant && (
  <td className={tdStyle}>
    <span className="text-xs text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
      {row.TYPE_PLANT || ''}
    </span>
  </td>
)}

{/* Recruit Cycle - only show if any row has RECRUIT_CYCLE */}
{recCycle && (
     <td className={tdStyle}>
    <span className="text-xs text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
      {row.RECRUIT_CYCLE || ''}
    </span>
  </td>
)}
                       {/* ✅ FIXED - proper table cell for department */}
   <td className={tdStyle}>
  <span className="text-xs text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
    {row.GROUP_CODE ? `${row.GROUP_CODE} - ${row.DEPT}` : row.DEPT || ''}
  </span>
</td>
   <td className={tdStyle}>
  <span className="text-xs text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
    {row.SUB_CODE ? `${row.SUB_CODE} - ${row.MANPOWER_DESG}` : row.MANPOWER_DESG || 'N/A'}
  </span>
</td>
                        {/* <td className="px-3 py-2">
                          <span className="text-xs font-bold text-gray-900 ">
                            {row.designation || 'N/A'}
                          </span>
                        </td> */}

   <td className={tdStyle}>
                          {row.created_at
                            ? new Date(row.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                            : ''}
                        </td>
   <td className={tdStyle}>
                          {row.updated_at
                            ? new Date(row.updated_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                            : ''}
                        </td>
                   <td className={tdStyle}>
  <button
    onClick={() => handleViewDetails(row)}
    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 cursor-pointer ${getProcessStyle(row.Recruit_Process)}`}
    title="click here"
  >
    {/* Add this line to change "HR Recruitment" to "Recruitment Mail" */}
    {row.Recruit_Process === "Recruitment Mail" ? "Recruitment Mail" : row.Recruit_Process || ''}
  </button>
</td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Enhanced */}
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
                      <option value={5} > 5 per page</option>
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
    orange: {
      bgGradient: 'from-orange-50 via-orange-100 to-orange-50',
      text: 'text-orange-700',
      iconBg: 'from-orange-100 to-orange-200',
      border: 'border-orange-200',
      hoverBorder: 'hover:border-orange-400',
      hoverShadow: 'hover:shadow-orange-200/50'
    },
    pink: {
      bgGradient: 'from-pink-50 via-pink-100 to-pink-50',
      text: 'text-pink-700',
      iconBg: 'from-pink-100 to-pink-200',
      border: 'border-pink-200',
      hoverBorder: 'hover:border-pink-400',
      hoverShadow: 'hover:shadow-pink-200/50'
    },
    cyan: {
      bgGradient: 'from-cyan-50 via-cyan-100 to-cyan-50',
      text: 'text-cyan-700',
      iconBg: 'from-cyan-100 to-cyan-200',
      border: 'border-cyan-200',
      hoverBorder: 'hover:border-cyan-400',
      hoverShadow: 'hover:shadow-cyan-200/50'
    },
    indigo: {
      bgGradient: 'from-indigo-50 via-indigo-100 to-indigo-50',
      text: 'text-indigo-700',
      iconBg: 'from-indigo-100 to-indigo-200',
      border: 'border-indigo-200',
      hoverBorder: 'hover:border-indigo-400',
      hoverShadow: 'hover:shadow-indigo-200/50'
    },

    green: {
  bgGradient: 'from-green-50 via-green-100 to-green-50',
  text: 'text-green-700',
  iconBg: 'from-green-100 to-green-200',
  border: 'border-green-200',
  hoverBorder: 'hover:border-green-400',
  hoverShadow: 'hover:shadow-green-200/50'
},
rose: {
    bgGradient: 'from-rose-50 via-rose-100 to-rose-50',
    text: 'text-rose-700',
    iconBg: 'from-rose-100 to-rose-200',
    border: 'border-rose-200',
    hoverBorder: 'hover:border-rose-400',
    hoverShadow: 'hover:shadow-rose-200/50'
  },
  sky: {
    bgGradient: 'from-sky-50 via-sky-100 to-sky-50',
    text: 'text-sky-700',
    iconBg: 'from-sky-100 to-sky-200',
    border: 'border-sky-200',
    hoverBorder: 'hover:border-sky-400',
    hoverShadow: 'hover:shadow-sky-200/50'
  },
  yellow: {
    bgGradient: 'from-yellow-50 via-yellow-100 to-yellow-50',
    text: 'text-yellow-700',
    iconBg: 'from-yellow-100 to-yellow-200',
    border: 'border-yellow-200',
    hoverBorder: 'hover:border-yellow-400',
    hoverShadow: 'hover:shadow-yellow-200/50'
  },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <>
   
    <div className={`bg-gradient-to-br ${colors.bgGradient} rounded-xl p-2 border-2 ${colors.border} ${colors.hoverBorder} shadow-md hover:shadow-xl ${colors.hoverShadow} transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 cursor-pointer group`}>
      {/* Change p-3 to p-2 */}

      {/* Title - First Row */}
      <p className={`text-xs font-bold ${colors.text} mb-1`}>{title}</p>
      {/* Change mb-2 to mb-1 */}

      {/* Count and Icon - Second Row */}
      <div className="flex items-center justify-between gap-2">
        <div className={`bg-gradient-to-br ${colors.iconBg} rounded-lg p-1 shadow-sm flex-1 text-center`}>
          {/* Change p-1.5 to p-1 */}
          <p className={`text-base font-bold ${colors.text}`}>
            {/* Change text-lg to text-base */}
            {value}
          </p>
        </div>
        <div className={`bg-gradient-to-br ${colors.iconBg} rounded-lg p-1.5 shadow-sm`}>
          {/* Change p-2 to p-1.5 */}
          <div className={colors.text}>{icon}</div>
        </div>
      </div>
    </div>

    </>
  );
};

export default HrInbox;




















