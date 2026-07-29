import { API_BASE_URL } from "../Config/Config";

// ============================================================
// 🔐 HELPER FUNCTIONS
// ============================================================

const getAuthHeaders = () => {
  const userToken = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const token = userToken.token || userToken.access_token || userToken.api_token;
  
  return {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
};

const getFormDataHeaders = () => {
  const headers = getAuthHeaders();
  delete headers["Content-Type"];
  return headers;
};

// ============================================================
// 🚀 MASTER API - SINGLE ENTRY POINT
// ============================================================

/**
 * 🎯 Master API - Handles ALL Verification Controller operations
 * 
 * @param {string} action - The action to perform
 * @param {object|FormData} data - Payload data
 * @param {boolean} isFormData - Whether payload is FormData
 * @returns {Promise<object>} - API response
 */
export const masterApi = async (action, data = null, isFormData = false) => {
  try {
    const headers = isFormData ? getFormDataHeaders() : getAuthHeaders();
    
    let body;
    if (isFormData && data instanceof FormData) {
      data.append('action', action);
      body = data;
    } else if (isFormData) {
      const fd = new FormData();
      fd.append('action', action);
      Object.entries(data || {}).forEach(([key, val]) => {
        if (val !== null && val !== undefined) {
          fd.append(key, val instanceof File ? val : JSON.stringify(val));
        }
      });
      body = fd;
    } else {
      body = JSON.stringify({ action, ...(data || {}) });
    }

    const response = await fetch(`${API_BASE_URL}/verification-master`, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
    
  } catch (error) {
    console.error(`❌ ${action} failed:`, error);
    return { 
      success: false, 
      message: error.message || 'API call failed',
      error: error 
    };
  }
};

// ============================================================
// 📋 VERIFICATION CONTROLLER APIS - ALL ACTIONS
// ============================================================

// ===================== VERIFICATION DATA =====================
export const getVerifications = (data) => masterApi('getVerifications', data);
export const getTaskAssignmentGetData = (data) => masterApi('getTaskAssignmentGetData', data);



export const getEmpVerificationData = (data) => masterApi('getEmpVerificationData', data);
export const getEmpVerificationDraftData = (data) => masterApi('getEmpVerificationDraftData', data);
export const recruitStore = (data, isFormData = true) => masterApi('recruitStore', data, isFormData);
export const onBoardingStore = (data, isFormData = true) => masterApi('onBoardingStore', data, isFormData);

// ===================== EMAIL =====================
export const sendEmployeeEmail = (data) => masterApi('sendEmployeeEmail', data);
export const sendCandidateApprovalEmail = (data) => masterApi('sendCandidateApprovalEmail', data);
export const sendOfferLetterEmail = (data) => masterApi('sendOfferLetterEmail', data);

// ===================== STATUS UPDATES =====================
export const updateVerificationStatus = (data, isFormData = true) => masterApi('updateVerificationStatus', data, isFormData);
export const updateCandidateApproval = (data, isFormData = true) => masterApi('updateCandidateApproval', data, isFormData);
export const updateOfferStatus = (data, isFormData = true) => masterApi('updateOfferStatus', data, isFormData);
export const updateOfferCTC = (data) => masterApi('updateOfferCTC', data);
export const updateJoiningDate = (data) => masterApi('updateJoiningDate', data);

// ===================== SALARY =====================
export const submitSalaryBreakup = (data) => masterApi('submitSalaryBreakup', data);
export const getSalaryStackData = (data) => masterApi('getSalaryStackData', data);

// ===================== CANDIDATE APPROVAL =====================
export const getCandidateApprovalData = (data) => masterApi('getCandidateApprovalData', data);
export const moveToNoteApproval = (data) => masterApi('moveToNoteApproval', data);

// ===================== NOTE FOR APPROVAL =====================
export const getNoteForApprovalData = (data) => masterApi('getNoteForApprovalData', data);
export const getNoteForApprovalMRFData = (data) => masterApi('getNoteForApprovalMRFData', data);
export const updateNoteForApproval = (data) => masterApi('updateNoteForApproval', data);
export const assignApprover = (data) => masterApi('assignApprover', data);
export const hrApproveRequest = (data) => masterApi('hrApproveRequest', data);
export const getApprovalFlow = (data) => masterApi('getApprovalFlow', data);
export const updateApprovalFlow = (data) => masterApi('updateApprovalFlow', data);

// ===================== OFFER LETTER =====================
export const getOfferLetterIssueList = (data) => masterApi('getOfferLetterIssueList', data);
export const getOfferLetterApprovedList = (data) => masterApi('getOfferLetterApprovedList', data);

// ===================== DOCUMENTS =====================
export const verifyDocumentStatus = (data) => masterApi('verifyDocumentStatus', data);
export const uploadVerificationDocument = (data, isFormData = true) => masterApi('uploadVerificationDocument', data, isFormData);
export const uploadHREvaluationFile = (data, isFormData = true) => masterApi('uploadHREvaluationFile', data, isFormData);

// ===================== TASK =====================
export const storeTaskAssignment = (data) => masterApi('storeTaskAssignment', data);
export const getTaskAssignmentData = (data) => masterApi('getTaskAssignmentData', data);
export const getOverallTaskAssignment = (data) => masterApi('getOverallTaskAssignment', data);
export const moveActionsToRecruitment = (data) => masterApi('moveActionsToRecruitment', data);

// ===================== ONBOARDING & TRANSFER =====================
export const moveToOnboarding = (data) => masterApi('moveToOnboarding', data);
export const storeOnboardingDetails = (data) => masterApi('storeOnboardingDetails', data);
export const storeEmployeeTransfer = (data) => masterApi('storeEmployeeTransfer', data);
export const getEmployeeTransferData = (data) => masterApi('getEmployeeTransferData', data);
export const getHRTransferDropdown = (data) => masterApi('getHRTransferDropdown', data);
export const getHodsUnderHrs = (data) => masterApi('getHodsUnderHrs', data);

// ===================== HR =====================
export const getMhcHrList = (data) => masterApi('getMhcHrList', data);
export const getEmployeeAccessVerification = (data) => masterApi('getEmployeeAccessVerification', data);
export const getCandidateStages = (data) => masterApi('getCandidateStages', data);
export const deleteEmployeeExperience = (data) => masterApi('deleteEmployeeExperience', data);
export const getZmmPlants = (data) => masterApi('getZmmPlants', data);

// ===================== DASHBOARD =====================
export const getHRAprrovalData = (data) => masterApi('getHRAprrovalData', data);
export const getHRMDashboardCount = (data) => masterApi('getHRMDashboardCount', data);
export const getMRFRevisionHistory = (data) => masterApi('getMRFRevisionHistory', data);

// ===================== SIDEBAR =====================
export const saveSidebarRoutes = (data) => masterApi('saveSidebarRoutes', data);
export const getSidebarData = (data) => masterApi('getSidebarData', data);

// ===================== HISTORY & DELETION =====================
export const deleteVerificationCase = (data) => masterApi('deleteVerificationCase', data);
export const getVerificationHistory = (data) => masterApi('getVerificationHistory', data);

// ===================== HOD =====================
export const getHrNames = (data) => masterApi('getHrNames', data);
export const getCaseIdsByHr = (data) => masterApi('getCaseIdsByHr', data);
export const getHrRequisitionList = (data) => masterApi('getHrRequisitionList', data);

// ============================================================
// 📦 EXPORT ALL FUNCTIONS
// ============================================================

export default {
  masterApi,
  getVerifications,
  getTaskAssignmentGetData,
  getEmpVerificationData,
  getEmpVerificationDraftData,
  recruitStore,
  onBoardingStore,
  sendEmployeeEmail,
  sendCandidateApprovalEmail,
  sendOfferLetterEmail,
  updateVerificationStatus,
  updateCandidateApproval,
  updateOfferStatus,
  updateOfferCTC,
  updateJoiningDate,
  submitSalaryBreakup,
  getSalaryStackData,
  getCandidateApprovalData,
  moveToNoteApproval,
  getNoteForApprovalData,
  getNoteForApprovalMRFData,
  updateNoteForApproval,
  assignApprover,
  hrApproveRequest,
  getApprovalFlow,
  updateApprovalFlow,
  getOfferLetterIssueList,
  getOfferLetterApprovedList,
  verifyDocumentStatus,
  uploadVerificationDocument,
  uploadHREvaluationFile,
  storeTaskAssignment,
  getTaskAssignmentData,
  getOverallTaskAssignment,
  moveActionsToRecruitment,
  moveToOnboarding,
  storeOnboardingDetails,
  storeEmployeeTransfer,
  getEmployeeTransferData,
  getHRTransferDropdown,
  getHodsUnderHrs,
  getMhcHrList,
  getEmployeeAccessVerification,
  getCandidateStages,
  deleteEmployeeExperience,
  getZmmPlants,
  getHRAprrovalData,
  getHRMDashboardCount,
  getMRFRevisionHistory,
  saveSidebarRoutes,
  getSidebarData,
  deleteVerificationCase,
  getVerificationHistory,
  getHrNames,
  getCaseIdsByHr,
  getHrRequisitionList
};