"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings, Eye } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { upsertLead, getLeadById } from "@/api/leads";
import { transformFormDataToAPI } from "@/utils/leadsTransformers";
import { useClinics, useDoctorTypes } from "@/hooks/useMasterData";
import { useDoctors } from "@/hooks/useDoctors";
import { PageHeader } from "@/components/shared/PageHeader";

const LEAD_CLINIC_OVERRIDES_KEY = "leadClinicOverrides";

export default function AddLeadFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('id');
  const mode = searchParams.get('mode') || 'create'; // 'create', 'edit', 'view'
  const isViewMode = mode === 'view';

  const [loading, setLoading] = useState(false);

  // Master Data
  const { data: clinics = [] } = useClinics();
  const { data: doctors = [] } = useDoctors(); // Fetch all doctors
  
  // Filter doctors for assignment (optional logic)
  const assignableDoctors = doctors;

  const [formData, setFormData] = useState({
    enquiryID: 0,
    leadNo: "",
    leadDate: new Date().toISOString().split('T')[0],
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    age: "",
    gender: "male",
    email: "",
    address: "",
    area: "",
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    leadSource: "",
    mobileNo1: "",
    mobileNo2: "",
    contactType: "doctors",
    clinicID: "", // Replaces clinicName
    assignToEmpID: "", // Replaces assignTo string
    patientFollowup: "patient",
    interestLevel: "1",
    patientStatus: "cooperative",
    conversationDetails: "",
    leadFor: "",
  });

  // Fetch lead data if in edit/view mode
  React.useEffect(() => {
    if (leadId) {
      fetchLeadDetails(leadId);
    }
  }, [leadId]);

  const fetchLeadDetails = async (id) => {
    try {
      setLoading(true);
      const data = await getLeadById(id);
      if (data) {
        const extractedID = data.EnquiryID || data.enquiryID || data.LeadID || data.leadID || data.id || 0;
        
        setFormData(prev => ({
          ...prev,
          enquiryID: extractedID,
          leadNo: `E${extractedID}`,
          leadDate: (data.leadDate || data.LeadDate) ? new Date(data.leadDate || data.LeadDate).toISOString().split('T')[0] : prev.leadDate,
          firstName: data.firstName || data.FirstName || "",
          lastName: data.lastName || data.LastName || "",
          dateOfBirth: (data.dateBirth || data.DateBirth || data.dateOfBirth) ? new Date(data.dateBirth || data.DateBirth || data.dateOfBirth).toISOString().split('T')[0] : "",
          age: data.age || data.Age || "",
          gender: (data.gender || data.Gender || "male").toLowerCase(),
          email: data.emailid || data.Emailid || data.email || "",
          address: data.address || data.Address || "",
          area: data.area || data.Area || "",
          country: "India", 
          state: "Maharashtra",
          city: "Mumbai",
          leadSource: (data.sourceName || data.SourceName || "").toLowerCase() || "", 
          mobileNo1: data.phoneNo1 || data.PhoneNo1 || data.mobile || "",
          mobileNo2: data.telephone || data.Telephone || "",
          contactType: "doctors", 
          
          clinicID: (data.clinicID || data.ClinicID || "").toString(),
          assignToEmpID: (data.assignToEmpID || data.AssignToEmpID || "").toString(),
          
          patientFollowup: (data.patientFollowup || data.PatientFollowup || "patient").toLowerCase(),
          interestLevel: String(data.interestLevel || data.InterestLevel || "1"),
          patientStatus: (data.pstatus || data.PatientStatus || "cooperative").toLowerCase(),
          conversationDetails: data.conversation || data.Conversation || "",
          leadFor: "", 
        }));
      }
    } catch (error) {
      console.error("Failed to fetch lead details:", error);
      alert("Failed to load lead details.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (isViewMode) return; 

    if (field === "dateOfBirth") {
      let calculatedAge = formData.age;
      if (value) {
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        calculatedAge = age >= 0 ? age.toString() : "";
      }
      setFormData((prev) => ({ ...prev, dateOfBirth: value, age: calculatedAge }));
      return;
    }

    if (field === "mobileNo1" || field === "mobileNo2") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 10) return;
      setFormData((prev) => ({ ...prev, [field]: numericValue }));
      return;
    }

    if (field === "clinicID") {
        const selectedClinic = clinics.find(c => String(c.clinicId || c.id) === String(value));
        setFormData(prev => ({ 
            ...prev, 
            clinicID: value,
            clinicName: selectedClinic ? (selectedClinic.clinicName || selectedClinic.name) : ""
        }));
        return;
    }
    
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate mandatory fields
    const mandatoryFields = {
      firstName: "First Name",
      leadSource: "Lead Source",
      mobileNo1: "Mobile No 1",
      clinicID: "Clinic",
      assignToEmpID: "Assign To",
      leadFor: "Lead For",
      email: "Email"
    };

    const missingFields = [];
    Object.entries(mandatoryFields).forEach(([field, label]) => {
      if (!formData[field] || String(formData[field]).trim() === "") {
        missingFields.push(label);
      }
    });

    if (missingFields.length > 0) {
      alert(`Please fill in the following mandatory fields:\n- ${missingFields.join('\n- ')}`);
      return;
    }

    if (formData.mobileNo1.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const apiData = transformFormDataToAPI(formData);
      console.log('Transformed API data:', apiData);

      const response = await upsertLead(apiData);
      console.log("Lead upsert response:", response);

      if (typeof window !== "undefined") {
        const clinicName =
          formData.clinicName ||
          clinics.find(
            (clinic) =>
              String(clinic.clinicId || clinic.id) === String(formData.clinicID),
          )?.clinicName ||
          "";

        const existingOverrides = JSON.parse(
          window.localStorage.getItem(LEAD_CLINIC_OVERRIDES_KEY) || "[]",
        );

        const nextOverride = {
          name: `${formData.firstName || ""} ${formData.lastName || ""}`.trim().toLowerCase(),
          mobileNo: formData.mobileNo1 || "",
          clinicID: String(formData.clinicID || ""),
          clinicName,
          updatedAt: Date.now(),
        };

        const dedupedOverrides = [
          nextOverride,
          ...existingOverrides.filter(
            (item) =>
              !(
                item.mobileNo === nextOverride.mobileNo &&
                item.name === nextOverride.name
              ),
          ),
        ].slice(0, 50);

        window.localStorage.setItem(
          LEAD_CLINIC_OVERRIDES_KEY,
          JSON.stringify(dedupedOverrides),
        );
      }

      const isMock = response.isMockData || false;
      const actionText = mode === 'edit' ? "updated" : "added";
      const successMessage = isMock
        ? `Lead ${actionText} successfully! (Mock Data)`
        : `Lead ${actionText} successfully!`;

      alert(successMessage);
      router.push("/enquiry/new-enquiry");
    } catch (error) {
      console.error("Error submitting lead:", error);
      let errorMessage = error.message;
      if (error.response && error.response.data) {
          errorMessage = typeof error.response.data === 'object' 
            ? (error.response.data.message || error.response.data.error || JSON.stringify(error.response.data))
            : error.response.data;
      }
      alert(`Failed to ${mode === 'edit' ? 'update' : 'add'} lead: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/enquiry/new-enquiry");
  };

  // helper to get name from ID
  const getClinicName = (id) => clinics.find(c => String(c.clinicId || c.id) === String(id))?.clinicName || "Unknown";
  const getDoctorName = (id) => doctors.find(d => String(d.doctorID || d.srNo) === String(id))?.name || "Unknown";

  if (isViewMode) {
    return (
      <div className="w-full p-6 space-y-6 bg-white dark:bg-[#18122B] min-h-screen">
        {/* Header */}
      <PageHeader 
        title="VIEW LEAD DETAILS" 
        icon={Eye} 
      />

        <Card className="border-t-4 border-t-primary shadow-md">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                   <div className="text-gray-500 dark:text-white/50">Lead No:</div>
                   <div className="font-medium">{formData.leadNo}</div>
                   
                   <div className="text-gray-500 dark:text-white/50">Full Name:</div>
                   <div className="font-medium">{formData.firstName} {formData.lastName}</div>
                   
                   <div className="text-gray-500 dark:text-white/50">Age / Gender:</div>
                   <div className="font-medium capitalize">{formData.age} / {formData.gender}</div>
                   
                   <div className="text-gray-500 dark:text-white/50">Date of Birth:</div>
                   <div className="font-medium">{formData.dateOfBirth || '-'}</div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary border-b pb-2">Contact Details</h3>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                   <div className="text-gray-500 dark:text-white/50">Mobile 1:</div>
                   <div className="font-medium">{formData.mobileNo1}</div>
                   
                   <div className="text-gray-500 dark:text-white/50">Mobile 2:</div>
                   <div className="font-medium">{formData.mobileNo2 || '-'}</div>
                   
                   <div className="text-gray-500 dark:text-white/50">Email:</div>
                   <div className="font-medium">{formData.email || '-'}</div>
                   
                   <div className="text-gray-500 dark:text-white/50">Address:</div>
                   <div className="font-medium">{formData.address || '-'}</div>
                   
                   <div className="text-gray-500 dark:text-white/50">Area/City:</div>
                   <div className="font-medium">{formData.area}, {formData.city}</div>
                </div>
              </div>

              {/* Lead Source & Assignment */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary border-b pb-2">Assignment</h3>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                   <div className="text-gray-500 dark:text-white/50">Clinic:</div>
                   <div className="font-medium text-primary00">{getClinicName(formData.clinicID)}</div>
                   
                   <div className="text-gray-500 dark:text-white/50">Assigned To:</div>
                   <div className="font-medium">{getDoctorName(formData.assignToEmpID)}</div>
                   
                   <div className="text-gray-500 dark:text-white/50">Lead Source:</div>
                   <div className="font-medium capitalize">{formData.leadSource}</div>
                   
                   <div className="text-gray-500 dark:text-white/50">Lead Date:</div>
                   <div className="font-medium">{formData.leadDate}</div>
                </div>
              </div>

              {/* Status & Followup (Full Width) */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4 mt-4">
                <h3 className="font-semibold text-lg text-primary border-b pb-2">Status & Follow-up</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                   <div>
                      <div className="text-gray-500 dark:text-white/50 mb-1">Interest Level:</div>
                      <div className="flex gap-2">
                         {[1, 2, 3].map(level => (
                           <span key={level} className={`px-3 py-1 rounded-full text-xs font-bold border ${String(formData.interestLevel) === String(level) ? 'bg-primary text-white border-primary' : 'bg-gray-100 dark:bg-[#393053] text-gray-400 border-gray-200 dark:border-[#443C68]/50'}`}>
                             Level {level}
                           </span>
                         ))}
                      </div>
                   </div>
                   
                   <div>
                      <div className="text-gray-500 dark:text-white/50 mb-1">Patient Status:</div>
                      <div className="font-medium capitalize px-3 py-1 bg-green-50 text-green-700 inline-block rounded-md">
                        {formData.patientStatus.replace('-', ' ')}
                      </div>
                   </div>
                   
                   <div>
                      <div className="text-gray-500 dark:text-white/50 mb-1">Follow-up Type:</div>
                      <div className="font-medium capitalize">{formData.patientFollowup}</div>
                   </div>
                   
                   <div className="md:col-span-3 mt-2">
                       <div className="text-gray-500 dark:text-white/50 mb-1">Conversation Details:</div>
                       <div className="p-3 bg-gray-50 dark:bg-[#393053] rounded-md border border-gray-100 dark:border-[#443C68]/50 text-gray-700 dark:text-white/75 leading-relaxed italic">
                         {formData.conversationDetails || 'No conversation details recorded.'}
                       </div>
                   </div>
                </div>
              </div>

            </div>
            
            <div className="flex justify-center mt-8 pt-6 border-t">
               <Button onClick={handleCancel} className="bg-gray-600 hover:bg-gray-700 text-white min-w-[150px]">
                 Back to List
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6 bg-white dark:bg-[#18122B] min-h-screen">
      {/* Header */}
      <PageHeader 
        title={mode === 'create' ? 'ADD LEAD' : 'EDIT LEAD'} 
        icon={Settings} 
      />

      {/* Form */}
      <Card className="border-gray-200 dark:border-[#443C68]/50">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Lead No and Lead Date */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="leadNo">Lead No.</Label>
                <Input id="leadNo" value={formData.leadNo} readOnly className="w-full h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadDate">Lead Date</Label>
                <Input id="leadDate" type="date" value={formData.leadDate} onChange={(e) => handleInputChange("leadDate", e.target.value)} className="w-full h-10" />
              </div>
            </div>

            {/* Row 2: First Name and Last Name */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                <Input id="firstName" placeholder="First Name" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} required className="w-full h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Enter Last Name" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} className="w-full h-10" />
              </div>
            </div>

            {/* Row 3: Date of Birth and Age */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange("dateOfBirth", e.target.value)} className="w-full h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" value={formData.age} onChange={(e) => handleInputChange("age", e.target.value)} className="w-full h-10" />
              </div>
            </div>

            {/* Row 4: Gender and Email */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)} className="flex gap-6">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="male" id="male" /><Label htmlFor="male">Male</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="female" id="female" /><Label htmlFor="female">Female</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input id="email" type="email" placeholder="Enter Email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="w-full h-10" />
              </div>
            </div>

            {/* Row 5: Address and Area */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" placeholder="Enter Address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} rows={3} className="resize-none w-full" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Textarea id="area" placeholder="Enter Area" value={formData.area} onChange={(e) => handleInputChange("area", e.target.value)} rows={3} className="resize-none w-full" />
              </div>
            </div>

            {/* Row 6: Country and State */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                  <SelectTrigger className="w-full h-10"><SelectValue placeholder="Select Country" /></SelectTrigger>
                  <SelectContent><SelectItem value="India">India</SelectItem><SelectItem value="USA">USA</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                  <SelectTrigger className="w-full h-10"><SelectValue placeholder="Select State" /></SelectTrigger>
                  <SelectContent><SelectItem value="Maharashtra">Maharashtra</SelectItem><SelectItem value="Gujarat">Gujarat</SelectItem></SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 7: City and Lead Source */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                  <SelectTrigger className="w-full h-10"><SelectValue placeholder="Select City" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Pune">Pune</SelectItem>
                    <SelectItem value="Panvel">Panvel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadSource">Lead Source <span className="text-red-500">*</span></Label>
                <Select value={formData.leadSource} onValueChange={(value) => handleInputChange("leadSource", value)}>
                  <SelectTrigger className="w-full h-10"><SelectValue placeholder="--- Select Source ---" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="justdial">JustDial</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="walkin">Walk-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 8: Mobile No 1 and Mobile No 2 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="mobileNo1">Mobile No 1. <span className="text-red-500">*</span></Label>
                <Input id="mobileNo1" type="tel" placeholder="Enter Mobile" value={formData.mobileNo1} onChange={(e) => handleInputChange("mobileNo1", e.target.value)} required className="w-full h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileNo2">Mobile No 2.</Label>
                <Input id="mobileNo2" type="tel" placeholder="Enter Telephone" value={formData.mobileNo2} onChange={(e) => handleInputChange("mobileNo2", e.target.value)} className="w-full h-10" />
              </div>
            </div>

            {/* Row 9: Contact Type and Clinic Name (Now Dynamic) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Contact Type</Label>
                <RadioGroup value={formData.contactType} onValueChange={(value) => handleInputChange("contactType", value)} className="flex gap-6">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="doctors" id="doctors" /><Label htmlFor="doctors">Doctors</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="telecaller" id="telecaller" /><Label htmlFor="telecaller">Telecaller</Label></div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicID">Clinic Name <span className="text-red-500">*</span></Label>
                <Select value={formData.clinicID} onValueChange={(value) => handleInputChange("clinicID", value)}>
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Select Clinic" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinics && clinics.map(clinic => (
                          <SelectItem key={clinic.clinicId || clinic.id} value={(clinic.clinicId || clinic.id).toString()}>
                              {clinic.clinicName || clinic.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 10: Assign To (Now Dynamic) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="assignToEmpID">Assign To <span className="text-red-500">*</span></Label>
                <Select value={formData.assignToEmpID} onValueChange={(value) => handleInputChange("assignToEmpID", value)}>
                  <SelectTrigger className="w-full h-10"><SelectValue placeholder="--- Select ---" /></SelectTrigger>
                  <SelectContent>
                     {assignableDoctors && assignableDoctors.length > 0 ? assignableDoctors.map(doc => (
                         <SelectItem key={doc.doctorID || doc.srNo} value={(doc.doctorID || doc.srNo).toString()}>
                             {doc.name}
                         </SelectItem>
                     )) : <SelectItem value="none" disabled>No Doctors Available</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Patient / Followup <span className="text-red-500">*</span></Label>
                <RadioGroup value={formData.patientFollowup} onValueChange={(value) => handleInputChange("patientFollowup", value)} className="flex gap-6">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="patient" id="patient" /><Label htmlFor="patient">Patient</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="followup" id="followup" /><Label htmlFor="followup">Followup</Label></div>
                </RadioGroup>
              </div>
            </div>

            {/* Row 11: Interest Level and Conversation Details */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Interest Level <span className="text-red-500">*</span></Label>
                <RadioGroup value={formData.interestLevel} onValueChange={(value) => handleInputChange("interestLevel", value)} className="flex gap-4">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="1" id="level1" /><Label htmlFor="level1">1</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="2" id="level2" /><Label htmlFor="level2">2</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="3" id="level3" /><Label htmlFor="level3">3</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conversationDetails">Conversation details</Label>
                <Textarea id="conversationDetails" placeholder="Enter conversation details" value={formData.conversationDetails} onChange={(e) => handleInputChange("conversationDetails", e.target.value)} rows={3} className="resize-none w-full" />
              </div>
            </div>

            {/* Row 12: Patient Status and Enquiry For */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Patient Status</Label>
                <RadioGroup value={formData.patientStatus} onValueChange={(value) => handleInputChange("patientStatus", value)} className="flex gap-6">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="less-cooperative" id="less-cooperative" /><Label htmlFor="less-cooperative">Less Co-operative</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="cooperative" id="cooperative" /><Label htmlFor="cooperative">Co-operative</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="very-cooperative" id="very-cooperative" /><Label htmlFor="very-cooperative">Very Co-operative</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadFor">Lead For <span className="text-red-500">*</span></Label>
                <Select value={formData.leadFor} onValueChange={(value) => handleInputChange("leadFor", value)}>
                  <SelectTrigger className="w-full h-10"><SelectValue placeholder="-- Select Treatment--" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physiotherapy">Physiotherapy</SelectItem>
                    <SelectItem value="consultation">General Consultation</SelectItem>
                    <SelectItem value="treatment">Specialized Treatment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 pt-6">
              {!isViewMode && (
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white shadow-sm transition-colors px-8 h-10 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? "Submitting..." : mode === 'edit' ? "Update" : "Submit"}
                </Button>
              )}
              <Button type="button" onClick={handleCancel} variant="outline" className="border-primary00 text-gray-700 dark:text-white/75 hover:bg-gray-50 dark:bg-[#18122B] dark:hover:bg-[#393053] px-8 h-10">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
