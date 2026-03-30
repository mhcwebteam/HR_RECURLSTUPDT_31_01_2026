
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import CurrentDateField from "../ManpowerComponent/CurrentDateField";
import { Typography, Button, CircularProgress, } from "@mui/material";
import { ArrowLeftIcon, BriefcaseIcon, CalendarCheck, CalendarCheck2, CalendarIcon, CheckCircleIcon, UserIcon } from "lucide-react";
import { AcademicCapIcon, BuildingOfficeIcon, DocumentTextIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../Config/Config';

function ManPowerView({ caseId, onClose }) {

 
  const navigate = useNavigate();
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  const [attempted, setAttempted] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentTask, setCurrentTask] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    plant: "", caseid: "", rdate: "", requestor: "", rmail_id: "", department: "",
    jobtype: "", recruitmentcycle: "", Position: "", qualf: "", exyear: "",
    hiringfor: "", reportingto: "", req_pers: "", tecskill: "", soft_skill: "",
    jdesc: "", uremarks: "", remarks: "", approve: "", hodremarks: "",
  });
  const [showPopup, setShowPopup] = useState(true);
  const [modalType, setModalType] = useState("");
  const [deptdesigndata, setDeptDesign] = useState({ empDept: '', empDesignation: '' });

  useEffect(() => {
    const uid = userToken.Emp_Id;
    axios.get(`http://192.168.8.91:8084/inactive/phpapi/get_empdetails.php?uid=${uid}`)
      .then((res) => {
        if (res.data.status === "success") {
          const user = res.data.user;
          setDeptDesign({ empDept: user.dept, empDesignation: user.designation });
        }
      })
      .catch((err) => { console.error("Failed to fetch user data", err); });
  }, []);

  useEffect(() => {
    const fetchFormData = async () => {
      if (!caseId || !userToken.token) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/manpower-data/${caseId}`, {
          headers: { Authorization: `Bearer ${userToken.token}` },
        });
        if (response.data) {
          console.log("ressssssssssssssssss",response.data);
          setFormData(prev => ({ ...prev, ...response.data, caseid: response.data.CHILD_CASEID }));
          if (response.data.CUR_TASK) setCurrentTask(response.data.CUR_TASK);
        }
      } catch (error) {
        console.error("Failed to fetch form data:", error);
      }
    };
    fetchFormData();
  }, [caseId, userToken.token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getDynamicRemarksKey = (task) => {
    if (task && typeof task === "string" && task.trim() !== "") {
      return `${task.toLowerCase().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, '')}remarks`;
    }
    return "default_gm_remarks";
  };
  const remarksFieldKey = getDynamicRemarksKey(currentTask);

  const getFieldClass = (fieldName) => {
    const baseClass = `w-full px-2 py-1 text-xs border rounded-md transition-all duration-200
      focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-500
      placeholder:text-gray-400 hover:border-gray-400`;

    const requiredFields = [remarksFieldKey, 'approve'];
    const isReadOnly = [
      'plant', 'caseid', 'rdate', 'requestor', 'rmail_id', 'department',
      'jobtype', 'recruitmentcycle', 'Position', 'qualf', 'exyear',
      'hiringfor', 'reportingto', 'req_pers', 'tecskill', 'soft_skill',
      'jdesc', 'uremarks', 'hodremarks'
    ].includes(fieldName);

    const hasError = (errors[fieldName] || (attempted && requiredFields.includes(fieldName) &&
      (!formData[fieldName] || formData[fieldName].trim() === ''))) && !isReadOnly;

    if (hasError) return `${baseClass} border-red-400 bg-red-50 focus:ring-red-100 focus:border-red-500`;
    if (isReadOnly) return `${baseClass} bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed`;
    return `${baseClass} border-gray-200`;
  };

  const CustomDateField = () => (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-0.5 flex items-center gap-1">
        <CalendarIcon className="w-3 h-3" />
        Date <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="rdate"
        value={formData.rdate || new Date().toLocaleDateString()}
        readOnly
        className={getFieldClass("rdate")}
      />
    </div>
  );

  return (
    <>
      {showPopup &&
        <div className="min-h-screen p-2">
          <div className="max-w-7xl w-full mx-auto">

            {/* Sticky Header */}
            <div className="sticky top-0 z-50 bg-white rounded-lg shadow-lg px-3 py-1.5 border border-gray-100 mb-1.5">
              <div className="relative flex items-center justify-between">
                <div className="flex-1"></div>
                <h1 className="flex items-center text-sm font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  <BriefcaseIcon className="w-4 h-4 text-purple-600 mr-1.5" />
                  Manpower Requisition View Form
                </h1>
                <div className="flex-1 flex justify-end">
                  <button
                    onClick={onClose}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-500 text-gray-600 hover:text-white text-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                    aria-label="Close"
                  >×</button>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-1.5 rounded-xl shadow-2xl border border-gray-200">
              <form className="space-y-1.5" noValidate>

                {/* Card 1: Basic Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-xl shadow-sm p-2 border-2 border-pink-200"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="p-1 bg-white rounded-md">
                      <UserIcon className="w-3.5 h-3.5 text-pink-600" />
                    </div>
                    <h2 className="text-sm font-bold text-pink-800">Basic Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5 flex items-center gap-1">
                        <BuildingOfficeIcon className="w-3 h-3" />
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input type="text" name="plant" value={formData.PLANT} readOnly className={getFieldClass("plant")} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5 flex items-center gap-1">
                        <DocumentTextIcon className="w-3 h-3" />
                        Case ID
                      </label>
                      <input type="text" name="caseid" value={formData.caseid} readOnly className={getFieldClass("caseid")} />
                    </div>
                    <div><CustomDateField /></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5 mt-1.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">Requestor</label>
                      <input type="text" name="requestor" value={formData.RAISER} readOnly className={getFieldClass("requestor")} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">Department</label>
                      <input type="text" name="requestor" value={deptdesigndata.empDept} readOnly className={getFieldClass("requestor")} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">Designation</label>
                      <input type="text" name="rmail_id" value={deptdesigndata.empDesignation} readOnly className={getFieldClass("rmail_id")} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">Requestor Email</label>
                      <input type="email" name="rmail_id" value={formData.REQ_MAIL} readOnly className={getFieldClass("rmail_id")} />
                    </div>
                  </div>
                </motion.div>

                {/* Card 2: Job Requisition Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl shadow-sm p-2 border-2 border-blue-200"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="p-1 bg-white rounded-md">
                      <BriefcaseIcon className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <h2 className="text-sm font-bold text-blue-800">Job Requisition Details</h2>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-1.5 mb-1.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">Requestor Department <span className="text-red-500">*</span></label>
                      <input type="text" name="department" value={formData.DEPT} readOnly className={getFieldClass("department")} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">Required for Job Title <span className="text-red-500">*</span></label>
                      <input type="text" name="jobtype" value={formData.MANPOWER_DESG} readOnly className={getFieldClass("jobtype")} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">Employee Level</label>
                      <input type="text" name="recruitmentcycle" value={formData.RECRUIT_CYCLE} readOnly className={getFieldClass("recruitmentcycle")} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">Type of Employment</label>
                      <input type="text" name="Position" value={formData.POSITION} readOnly className={getFieldClass("Position")} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">Qualification <span className="text-red-500">*</span></label>
                      <input type="text" name="qualf" value={formData.EDUCATION} readOnly className={getFieldClass("qualf")} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">Experience in Years <span className="text-red-500">*</span></label>
                      <input type="text" name="exyear" value={formData.EXP} readOnly className={getFieldClass("exyear")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">Hiring For</label>
                      <input type="text" name="hiringfor" value={formData.RECRUIT_FOR} readOnly className={getFieldClass("hiringfor")} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">Reporting To</label>
                      <input type="text" name="reportingto" value={formData.REPORTING} readOnly className={getFieldClass("reportingto")} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">Required Persons <span className="text-red-500">*</span></label>
                      <input type="text" name="req_pers" value={formData.NUM_REQUIRE} readOnly className={getFieldClass("req_pers")} />
                    </div>
                  </div>
                </motion.div>

                {/* Card 3: Required Skills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-xl shadow-sm p-2 border-2 border-green-200"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="p-1 bg-white rounded-md">
                      <AcademicCapIcon className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <h2 className="text-sm font-bold text-green-800">Required Skills</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mb-1.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">Technical Skills <span className="text-red-500">*</span></label>
                      <textarea name="tecskill" value={formData.TECH_SKILLS} rows="1" maxLength="100" readOnly className={getFieldClass("tecskill")}></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">Soft Skills <span className="text-red-500">*</span></label>
                      <textarea name="soft_skill" value={formData.SOFT_SKILLS} rows="1" maxLength="100" readOnly className={getFieldClass("soft_skill")}></textarea>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">Job Description <span className="text-red-500">*</span></label>
                      <textarea name="jdesc" value={formData.JOB_DESC} rows="1" maxLength="100" readOnly className={getFieldClass("jdesc")}></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-0.5">User Remarks <span className="text-red-500">*</span></label>
                      <textarea name="uremarks" value={formData.REMARKS} rows="1" maxLength="100" readOnly className={getFieldClass("uremarks")}></textarea>
                    </div>
                  </div>
                </motion.div>

                {/* Card 4: Job Details Table */}
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-xl shadow-sm p-2 border-2 border-purple-200"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="p-1 bg-white rounded-md">
                        <CalendarIcon className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                      <h2 className="text-sm font-bold text-purple-800">Job Details</h2>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">S.No</th>
                            <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">Job Title</th>
                            <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">Req By Date</th>
                          </tr>
                        </thead>
                         <tbody>
  {[formData].map((job, index) => (
    <tr key={index} className="border border-gray-200">
      <td className="px-2 py-1 text-xs text-gray-900 border-b border-r border-gray-200">
        {index + 1}
      </td>
      <td className="px-2 py-1 text-xs text-gray-900 border-b border-r border-gray-200">
        {job.JOB_TIT}
      </td>
      <td className="px-2 py-1 text-xs text-gray-900 border-b border-r border-gray-200">
        {job.REQ_BY_DT}
      </td>
    </tr>
  ))}
</tbody>
                      </table>
                    </div>
                  </motion.div>

                  {/* Approvals Section */}
                  <motion.div>
                    {(formData?.GM_STATUS || formData?.PRJ_STATUS || formData?.FUNC_STATUS ||
                      formData?.SP_STATUS || formData?.EVC_STATUS || formData?.HO_HOD_STATUS) && (
                        <div className="rounded-xl shadow-sm p-2 border-2 border-yellow-200 mt-1.5">
                          <div className="mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="p-1 bg-white rounded-md">
                                <CalendarCheck className="w-3.5 h-3.5 text-yellow-600" />
                              </div>
                              <h2 className="text-sm font-bold text-yellow-800">Approvals</h2>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {formData?.GM_STATUS && (
                              <div>
                                <label className="block mb-0.5 text-gray-700 text-xs font-semibold">GM:</label>
                                <textarea value={formData?.GM_REM} rows="1" maxLength="100" readOnly className={getFieldClass("tecskill")} />
                              </div>
                            )}
                            {formData?.PRJ_STATUS && (
                              <div>
                                <label className="block mb-0.5 text-gray-700 text-xs font-semibold">PRJ_HEAD:</label>
                                <textarea value={formData?.PRJ_REM} rows="1" maxLength="100" readOnly className={getFieldClass("soft_skill")} />
                              </div>
                            )}
                            {formData?.FUNC_STATUS && (
                              <div>
                                <label className="block mb-0.5 text-gray-700 text-xs font-semibold">FUNC_HEAD:</label>
                                <textarea value={formData?.FUNC_REM} rows="1" maxLength="100" readOnly className={getFieldClass("soft_skill")} />
                              </div>
                            )}
                            {formData?.SP_STATUS && (
                              <div>
                                <label className="block mb-0.5 text-gray-700 text-xs font-semibold">SP:</label>
                                <textarea value={formData?.SP_REM} rows="1" maxLength="100" readOnly className={getFieldClass("soft_skill")} />
                              </div>
                            )}
                            {formData?.EVC_STATUS && (
                              <div>
                                <label className="block mb-0.5 text-gray-700 text-xs font-semibold">EVC:</label>
                                <textarea value={formData?.EVC_REM} rows="1" maxLength="100" readOnly className={getFieldClass("soft_skill")} />
                              </div>
                            )}
                            {formData?.HO_HOD_STATUS && (
                              <div>
                                <label className="block mb-0.5 text-gray-700 text-xs font-semibold">HOD:</label>
                                <textarea value={formData?.HO_HOD_REM} rows="1" maxLength="100" readOnly className={getFieldClass("tecskill")} />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </motion.div>
                </AnimatePresence>
              </form>
            </div>
          </div>
        </div>
      }
    </>
  );
}

export default ManPowerView;