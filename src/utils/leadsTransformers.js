/**
 * Leads Data Transformation Utilities
 * Handles transformation between UI forms and API data formats
 */

/**
 * Clinic ID mapping
 */
const CLINIC_ID_MAP = {
  'Panvel': 1,
  'Pune': 2,
  'Mumbai': 3,
  'Nashik': 4,
};

/**
 * Lead Source mapping
 */
const LEAD_SOURCE_MAP = {
  'google': 1,
  'facebook': 2,
  'instagram': 3,
  'justdial': 4,
  'referral': 5,
  'walkin': 6,
};

/**
 * Transform form data to API format
 * @param {Object} formData - Form data from the UI
 * @returns {Object} Transformed data for API
 */
export const transformFormDataToAPI = (formData) => {
  return {
    // Converted to PascalCase for .NET standards, with redundant fallbacks
    EnquiryID: formData.enquiryID || 0,
    enquiryID: formData.enquiryID || 0, // Fallback
    
    // Use dynamic ClinicID if available, else fallback to map or default
    ClinicID: formData.clinicID ? Number(formData.clinicID) : (formData.clinicName ? (CLINIC_ID_MAP[formData.clinicName] || 1) : 1),
    ClinicName: formData.clinicName || "",
    
    SourceID: formData.leadSource ? LEAD_SOURCE_MAP[formData.leadSource] : 0,
    RoleID: 0,
    EnquiryNo: formData.leadNo || "",
    EnquiryDate: formData.leadDate ? new Date(formData.leadDate).toISOString() : new Date().toISOString(),
    FirstName: formData.firstName || "",
    LastName: formData.lastName || "",
    DateBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : new Date().toISOString(),
    Age: String(formData.age || "0"),
    Gender: formData.gender ? (formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)) : "Male",
    Address: formData.address || "",
    CountryID: 0,
    StateID: 0,
    CityID: 0,
    Area: formData.area || "",
    Email: formData.email || "",
    // Send multiple variants to ensure backend catches one
    MobileNo: formData.mobileNo1 || "",
    Mobile: formData.mobileNo1 || "",
    PhoneNo1: formData.mobileNo1 || "",
    mobile: formData.mobileNo1 || "",
    Telephone: formData.mobileNo2 || "",
    Status: formData.patientFollowup ? (formData.patientFollowup.charAt(0).toUpperCase() + formData.patientFollowup.slice(1)) : "Patient",
    status: formData.patientFollowup ? (formData.patientFollowup.charAt(0).toUpperCase() + formData.patientFollowup.slice(1)) : "Patient",
    PatientFollowup: formData.patientFollowup ? (formData.patientFollowup.charAt(0).toUpperCase() + formData.patientFollowup.slice(1)) : "Patient",
    patientFollowup: formData.patientFollowup ? (formData.patientFollowup.charAt(0).toUpperCase() + formData.patientFollowup.slice(1)) : "Patient",
    EnquiryStatus: formData.patientFollowup ? (formData.patientFollowup.charAt(0).toUpperCase() + formData.patientFollowup.slice(1)) : "Patient",
    LeadStatus: formData.patientFollowup ? (formData.patientFollowup.charAt(0).toUpperCase() + formData.patientFollowup.slice(1)) : "Patient", 
    
    // Numeric Status IDs (Guessing 1=Patient, 2=Followup)
    StatusID: (formData.patientFollowup === 'followup') ? 2 : 1,
    statusID: (formData.patientFollowup === 'followup') ? 2 : 1,
    LeadStatusID: (formData.patientFollowup === 'followup') ? 2 : 1,
    
    FollowupDate: new Date().toISOString(),
    InterestLevel: String(formData.interestLevel || "1"),
    InterestLevelCode: String(formData.interestLevel || "1"),
    CreatedBy: 0, // TODO: Get from auth context
    ReceivedByEmpID: 0,
    
    // Use dynamic AssignToEmpID
    // Use dynamic AssignToEmpID - Safe Parse
    AssignToEmpID: (formData.assignToEmpID && !isNaN(Number(formData.assignToEmpID))) ? Number(formData.assignToEmpID) : 0,
    TelecallerToEmpID: 0,
    
    Conversation: formData.conversationDetails || "",
    TreatmentID: 0,
    ModifiedBy: 0,
    IsActive: true,
    PatientStatus: formData.patientStatus ? (formData.patientStatus.charAt(0).toUpperCase() + formData.patientStatus.slice(1)) : "Co-operative", 
    PStatus: formData.patientStatus ? (formData.patientStatus.charAt(0).toUpperCase() + formData.patientStatus.slice(1)) : "Co-operative",
    pstatus: formData.patientStatus ? (formData.patientStatus.charAt(0).toUpperCase() + formData.patientStatus.slice(1)) : "Co-operative",
    Mode: formData.enquiryID ? 2 : 1 // 1 = Insert, 2 = Update
  };
};

/**
 * Transform API response to display format
 * @param {Object} apiLead - Lead data from API
 * @returns {Object} Transformed data for display
 */
export const transformAPILeadToDisplay = (apiLead) => {
  const clinicId =
    apiLead.clinicID ||
    apiLead.ClinicID ||
    apiLead.clinicId ||
    apiLead.ClinicId ||
    apiLead.branchID ||
    apiLead.BranchID;

  const sourceId =
    apiLead.leadSourceID ||
    apiLead.LeadSourceID ||
    apiLead.leadSourceId ||
    apiLead.LeadSourceId ||
    apiLead.SourceID ||
    apiLead.sourceID ||
    apiLead.SourceId ||
    apiLead.sourceId;

  return {
    srNo: apiLead.leadID || apiLead.LeadID || apiLead.EnquiryID || apiLead.enquiryID,
    leadNo: apiLead.leadNo || apiLead.LeadNo || apiLead.EnquiryNo || apiLead.enquiryNo || `E${apiLead.leadID || apiLead.LeadID || apiLead.EnquiryID || apiLead.enquiryID}`,
    name: `${apiLead.firstName || apiLead.FirstName || ''} ${apiLead.lastName || apiLead.LastName || ''}`.trim(),
    mobileNo: apiLead.phoneNo1 || apiLead.PhoneNo1 || apiLead.MobileNo || apiLead.mobileNo || apiLead.Mobile || apiLead.mobile || '',
    clinicID: clinicId,
    clinicName:
      apiLead.clinicName ||
      apiLead.ClinicName ||
      apiLead.clinic ||
      apiLead.Clinic ||
      apiLead.strClinicName ||
      apiLead.branchName ||
      apiLead.BranchName ||
      getClinicNameFromID(clinicId),
    sourceName:
      apiLead.sourceName ||
      apiLead.SourceName ||
      apiLead.leadSource ||
      apiLead.LeadSource ||
      apiLead.source ||
      apiLead.Source ||
      getSourceNameFromID(sourceId),
    status: apiLead.patientFollowup || apiLead.PatientFollowup || apiLead.Status || apiLead.status || 'Patient',
    date: formatDate(apiLead.leadDate || apiLead.LeadDate || apiLead.EnquiryDate || apiLead.enquiryDate || apiLead.createdDate),
    email: apiLead.emailid || apiLead.Emailid || apiLead.email || apiLead.Email || '',
  };
};

/**
 * Get clinic name from ID
 * @param {number} clinicID - Clinic ID
 * @returns {string} Clinic name
 */
const getClinicNameFromID = (clinicID) => {
  const reverseMap = Object.entries(CLINIC_ID_MAP).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {});
  return reverseMap[clinicID] || 'Unknown';
};

/**
 * Get source name from ID
 * @param {number} sourceID - Source ID
 * @returns {string} Source name
 */
const getSourceNameFromID = (sourceID) => {
  const reverseMap = {
    1: 'Google',
    2: 'Facebook',
    3: 'Instagram',
    4: 'Justdial',
    5: 'Reference',
    6: 'Walk-in',
  };
  return reverseMap[sourceID] || 'Unknown';
};

/**
 * Format date to DD-MMM-YYYY
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Normalize lead data for consistent handling
 * @param {Object} leadData - Raw lead data
 * @returns {Object} Normalized lead data
 */
export const normalizeLeadData = (leadData) => {
  if (!leadData) return null;

  return {
    leadID: leadData.leadID || leadData.LeadID || null,
    firstName: leadData.firstName || leadData.FirstName || '',
    lastName: leadData.lastName || leadData.LastName || '',
    mobileNo: leadData.phoneNo1 || leadData.PhoneNo1 || '',
    email: leadData.emailid || leadData.Emailid || '',
    clinicID: leadData.clinicID || leadData.ClinicID || null,
    leadSourceID: leadData.leadSourceID || leadData.LeadSourceID || null,
  };
};
