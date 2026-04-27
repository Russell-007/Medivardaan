"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDoctors } from "@/hooks/useDoctors";
import { useUpsertDoctor, useDeleteDoctor } from "@/hooks/useDoctorMutations";
import { getDoctorById } from "@/api/doctor";
import { transformAPItoForm } from "@/utils/doctorTransformers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Eye,
  Edit,
  Calendar,
  X,  
  Trash2,
  Clock,
  Search,
  Loader2,
  Stethoscope,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import axios from "axios";
import CustomPagination from "@/components/ui/custom-pagination";
import { validateMobile, validateEmail } from "@/utils/validation";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableWrapper } from "@/components/shared/TableWrapper";
import {
  useClinics,
  useSpecialities,
  useDoctorTypes,
} from "@/hooks/useMasterData";

export default function DoctorRegistrationPage() {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [filters, setFilters] = useState({
    doctorName: "",
    mobileNo: "",
    doctorID: "",
    panel: "all",
  });

  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: doctors = [], isLoading, error, refetch } = useDoctors();
  const mutation = useUpsertDoctor();
  const deleteMutation = useDeleteDoctor();

  // Master Data Hooks
  const { data: clinics = [], isLoading: isClinicsLoading } = useClinics();
  const { data: specialities = [], isLoading: isSpecialitiesLoading } =
    useSpecialities();
  const { data: doctorTypes = [], isLoading: isTypesLoading } =
    useDoctorTypes();

  const [formData, setFormData] = useState({
    clinicID: "",
    doctorTypeID: "",
    date: new Date().toISOString().split("T")[0],
    title: "Dr.",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "male",
    addressLine1: "",
    addressLine2: "",
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    areaPin: "",
    mobileNo1: "",
    mobileNo2: "",
    email: "",
    bloodGroup: "",
    inTime: "",
    outTime: "",
    educationList: [],
    currentEducation: {
      degree: "",
      board: "",
      upload: null,
    },
    specialityID: "", // Replaces object of booleans
    profilePhoto: null,
    adharCardNo: "",
    adharCardImage: null,
    panCardNo: "",
    panCardImage: null,
    registrationNo: "",
    certificateImage: null,
    indemnityPolicyNo: "",
    indemnityPolicyImage: null,
  });

  const handleInputChange = (field, value) => {
    let newErrors = { ...errors };

    if (field === "mobileNo1" || field === "mobileNo2") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 10) return;

      const validation = validateMobile(numericValue);
      if (
        !validation.isValid &&
        numericValue.length > 0 &&
        numericValue.length !== 10
      ) {
        newErrors[field] = "Please enter a valid 10-digit contact number.";
      } else {
        delete newErrors[field];
      }

      setFormData((prev) => ({
        ...prev,
        [field]: numericValue,
      }));
      setErrors(newErrors);
      return;
    }

    if (field === "email") {
      const validation = validateEmail(value);
      if (!validation.isValid && value.length > 0) {
        if (validation.message) newErrors[field] = validation.message;
      } else {
        delete newErrors[field];
      }
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors(newErrors);
  };

  const handleEducationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      currentEducation: {
        ...prev.currentEducation,
        [field]: value,
      },
    }));
  };

  // Replaces handleSpecialityChange boolean logic
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleEducationChange("upload", file);
    }
  };

  const handleDocumentUpload = (field, file) => {
    if (file) {
      handleInputChange(field, file);
    }
  };

  const handleNext = () => {
    if (activeTab === "personal") {
      setActiveTab("education");
    } else if (activeTab === "education") {
      setActiveTab("documents");
    }
  };

  const uploadFile = async (file) => {
    if (!file) return null;
    const uploadData = new FormData();
    uploadData.append("file", file);
    try {
      const res = await axios.post("/api/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.url;
    } catch (e) {
      console.error("Upload failed", e);
      return null;
    }
  };

  const isFormValid = () => {
    const hasMandatory =
      formData.clinicID &&
      formData.firstName &&
      formData.lastName &&
      formData.mobileNo1 &&
      formData.email;
    const mobileValid = formData.mobileNo1.length === 10;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const hasErrors = Object.keys(errors).length > 0;
    return hasMandatory && !hasErrors && mobileValid && emailValid;
  };

  const handleFormSubmit = async () => {
    if (!isFormValid()) {
      alert(
        "Please fix the validation errors and ensure all mandatory fields are filled.",
      );
      return;
    }

    // 1. Upload Files
    const profileUrl = await uploadFile(formData.profilePhoto);
    const adharUrl = await uploadFile(formData.adharCardImage);
    const panUrl = await uploadFile(formData.panCardImage);
    const regUrl = await uploadFile(formData.certificateImage);
    const indemnityUrl = await uploadFile(formData.indemnityPolicyImage);

    let deg1Url = null;
    let deg2Url = null;
    let basicDegree = formData.currentEducation.degree;

    if (formData.educationList.length > 0) {
      const edu1 = formData.educationList[0];
      deg1Url = await uploadFile(edu1.upload);
      basicDegree = edu1.degree;

      if (formData.educationList.length > 1) {
        const edu2 = formData.educationList[1];
        deg2Url = await uploadFile(edu2.upload);
      }
    } else if (formData.currentEducation.degree) {
      deg1Url = await uploadFile(formData.currentEducation.upload);
    }

    const dataForTransformer = {
      ...formData,
      profileImageUrl: profileUrl,
      adharCardImageUrl: adharUrl,
      panCardImageUrl: panUrl,
      registrationImageUrl: regUrl,
      identityPolicyImageUrl: indemnityUrl,
      degreeUpload1: deg1Url,
      degreeUpload2: deg2Url,
      basicDegree: basicDegree,
    };

    mutation.mutate(dataForTransformer, {
      onSuccess: (data) => {
        const isUpdate = formData.doctorID && formData.doctorID > 0;
        let finalDoctorID = isUpdate ? formData.doctorID : "N/A";
        const actionStr = isUpdate ? "updated" : "added";
        alert(`Doctor ${actionStr} successfully!` + (finalDoctorID !== "N/A" ? ` Doctor ID: ${finalDoctorID}` : ""));
        refetch();
        setFormData({
          clinicID: "",
          doctorTypeID: "",
          date: new Date().toISOString().split("T")[0],
          title: "Dr.",
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          gender: "male",
          addressLine1: "",
          addressLine2: "",
          country: "India",
          state: "Maharashtra",
          city: "Mumbai",
          areaPin: "",
          mobileNo1: "",
          mobileNo2: "",
          email: "",
          bloodGroup: "",
          inTime: "",
          outTime: "",
          educationList: [],
          currentEducation: { degree: "", board: "", upload: null },
          specialityID: "",
          profilePhoto: null,
          adharCardNo: "",
          adharCardImage: null,
          panCardNo: "",
          panCardImage: null,
          registrationNo: "",
          certificateImage: null,
          indemnityPolicyNo: "",
          indemnityPolicyImage: null,
        });
        setShowAddForm(false);
        setActiveTab("personal");
        setErrors({});
      },
      onError: (error) => {
        alert(`Failed to add doctor: ${error.message}`);
      },
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = async (doctor) => {
    try {
      const doctorID = doctor.doctorID;
      if (!doctorID) return;
      const apiData = await getDoctorById(doctorID);
      if (apiData) {
        // Note: We need to ensure transformAPItoForm returns updated structure with IDs
        const formDataFromApi = transformAPItoForm(apiData);
        if (formDataFromApi) {
          setFormData(formDataFromApi);
          setShowAddForm(true);
          setActiveTab("personal");
          setErrors({});
        }
      }
    } catch (error) {
      console.error("Failed to fetch details", error);
    }
  };

  const handleDelete = (doctor) => {
    if (window.confirm(`Are you sure you want to delete ${doctor.name}?`)) {
      deleteMutation.mutate(doctor.doctorID, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  const filteredDoctors = doctors
    .map((doctor) => {
      // Resolve clinicName from local clinics list since the API only returns clinicID
      const matchedClinic = clinics.find(
        (c) => String(c.clinicID || c.clinicId) === String(doctor.clinicID)
      );
      return {
        ...doctor,
        clinicName: matchedClinic ? (matchedClinic.clinicName || matchedClinic.name) : (doctor.clinicName || "Unknown"),
      };
    })
    .filter((doctor) => {
      const searchTerm = filters.doctorName ? filters.doctorName.toLowerCase() : "";
      
      const matchesSearch =
        !searchTerm ||
        (doctor.name && doctor.name.toLowerCase().includes(searchTerm)) ||
        (doctor.doctorID && doctor.doctorID.toString().includes(searchTerm)) ||
        (doctor.mobileNo && doctor.mobileNo.includes(searchTerm));
        
      const matchesPanel = 
        filters.panel === "all" || 
        (doctor.clinicID && doctor.clinicID.toString() === filters.panel);

      return matchesSearch && matchesPanel;
    })
    .sort((a, b) => (b.doctorID || 0) - (a.doctorID || 0));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedDoctors = filteredDoctors.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  return (
    <div className="p-6 bg-white dark:bg-[#18122B] min-h-screen space-y-6">
      <PageHeader
        title="DOCTOR"
        icon={Stethoscope}
        count={filteredDoctors.length}
      />

      {showAddForm && (
        <Card className="border-2 border-primary/20 dark:border-white/20 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-primary dark:text-medivardaan-purple">
                {formData.doctorID ? "Edit Doctor" : "Add New Doctor"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="hover:bg-gray-100 dark:bg-[#393053] dark:hover:bg-[#393053]"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-2 mb-6">
              <Label htmlFor="clinicID" className="text-sm font-medium">
                Clinic Name{" "}
                <span className="text-destructive dark:text-white/50">*</span>
              </Label>
              <Select
                value={formData.clinicID ? formData.clinicID.toString() : ""}
                onValueChange={(value) => handleInputChange("clinicID", value)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isClinicsLoading ? "Loading..." : "Select Clinic"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {clinics && clinics.length > 0 ? (
                    clinics.map((clinic) => (
                      <SelectItem
                        key={clinic.clinicId || clinic.id}
                        value={
                          clinic.clinicId
                            ? clinic.clinicId.toString()
                            : clinic.id.toString()
                        }
                      >
                        {clinic.clinicName || clinic.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No Clinics Available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 bg-gray-100 dark:bg-[#393053] ">
                <TabsTrigger
                  value="personal"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Personal Information
                </TabsTrigger>
                <TabsTrigger
                  value="education"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Education
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Documents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Doctor Type</Label>
                    <Select
                      value={
                        formData.doctorTypeID
                          ? formData.doctorTypeID.toString()
                          : ""
                      }
                      onValueChange={(value) =>
                        handleInputChange("doctorTypeID", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Doctor Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctorTypes && doctorTypes.length > 0 ? (
                          doctorTypes.map((type) => (
                            <SelectItem
                              key={type.doctorTypeId || type.id}
                              value={
                                type.doctorTypeId
                                  ? type.doctorTypeId.toString()
                                  : type.id.toString()
                              }
                            >
                              {type.typeName || type.name}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="1">
                              Full-Time Consultant
                            </SelectItem>
                            <SelectItem value="2">
                              Part-Time Consultant
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        handleInputChange("date", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Title</Label>
                    <Select
                      value={formData.title}
                      onValueChange={(value) =>
                        handleInputChange("title", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dr.">Dr.</SelectItem>
                        <SelectItem value="Mr.">Mr.</SelectItem>
                        <SelectItem value="Ms.">Ms.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Other personal fields remain the same, just reusing logic */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date Of Birth</Label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Gender</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) =>
                        handleInputChange("gender", value)
                      }
                      className="flex gap-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Address Line 1</Label>
                    <Textarea
                      value={formData.addressLine1}
                      onChange={(e) =>
                        handleInputChange("addressLine1", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address Line 2</Label>
                    <Textarea
                      value={formData.addressLine2}
                      onChange={(e) =>
                        handleInputChange("addressLine2", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        handleInputChange("country", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="USA">USA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) =>
                        handleInputChange("state", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="Delhi">Delhi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) =>
                        handleInputChange("city", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mumbai">Mumbai</SelectItem>
                        <SelectItem value="Pune">Pune</SelectItem>
                        <SelectItem value="Nashik">Nashik</SelectItem>
                        <SelectItem value="Panvel">Panvel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Area Pin</Label>
                    <Input
                      value={formData.areaPin}
                      onChange={(e) =>
                        handleInputChange("areaPin", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Mobile No 1 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={formData.mobileNo1}
                      onChange={(e) =>
                        handleInputChange("mobileNo1", e.target.value)
                      }
                      maxLength={10}
                      className={errors.mobileNo1 ? "border-destructive" : ""}
                    />
                    {errors.mobileNo1 && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.mobileNo1}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile No 2</Label>
                    <Input
                      value={formData.mobileNo2}
                      onChange={(e) =>
                        handleInputChange("mobileNo2", e.target.value)
                      }
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Group</Label>
                    <Input
                      value={formData.bloodGroup}
                      onChange={(e) =>
                        handleInputChange("bloodGroup", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>
                      In Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="time"
                      value={formData.inTime}
                      onChange={(e) =>
                        handleInputChange("inTime", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Out Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="time"
                      value={formData.outTime}
                      onChange={(e) =>
                        handleInputChange("outTime", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleNext}
                    className="bg-primary text-white"
                  >
                    Next
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="education" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Degree</Label>
                    <Input
                      value={formData.currentEducation.degree}
                      onChange={(e) =>
                        handleEducationChange("degree", e.target.value)
                      }
                      placeholder="BDS"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Board</Label>
                    <Input
                      value={formData.currentEducation.board}
                      onChange={(e) =>
                        handleEducationChange("board", e.target.value)
                      }
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Upload</Label>
                    <Input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </div>
                  <div className="space-y-2">
                    {formData.currentEducation.upload && (
                      <div className="text-xs">File Selected</div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <h3 className="text-lg font-semibold">Speciality</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Specialization
                      </Label>
                      <Select
                        value={
                          formData.specialityID
                            ? formData.specialityID.toString()
                            : ""
                        }
                        onValueChange={(value) =>
                          handleInputChange("specialityID", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Speciality" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialities && specialities.length > 0 ? (
                            specialities.map((spec) => (
                              <SelectItem
                                key={spec.specialityId || spec.id}
                                value={
                                  spec.specialityId
                                    ? spec.specialityId.toString()
                                    : spec.id.toString()
                                }
                              >
                                {spec.specialityName || spec.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No Specialities Loaded
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <Button
                    onClick={handleNext}
                    className="bg-primary text-white"
                  >
                    Next
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6 mt-6">
                {[
                  "profilePhoto",
                  "adharCardImage",
                  "panCardImage",
                  "certificateImage",
                  "indemnityPolicyImage",
                ].map((docField) => (
                  <div
                    key={docField}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
                  >
                    <Label className="text-sm font-medium capitalize">
                      {docField.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <Input
                      type="file"
                      onChange={(e) =>
                        handleDocumentUpload(docField, e.target.files[0])
                      }
                      accept="image/*,.pdf"
                    />
                    <div>
                      {formData[docField] ? (
                        <span className="text-green-600 text-xs">Selected</span>
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex justify-center gap-4 pt-6">
                  <Button
                    onClick={handleFormSubmit}
                    disabled={mutation.isPending || !isFormValid()}
                    className="bg-primary text-white px-8"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* List View - Search and Table */}
      {!showAddForm && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
            <div className="flex-1 w-full md:max-w-2xl flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search Doctor by Name, ID, or Mobile..."
                  value={filters.doctorName}
                  onChange={(e) =>
                    handleFilterChange("doctorName", e.target.value)
                  }
                  className="pl-9 bg-white dark:bg-[#393053]"
                />
              </div>
              <Select
                value={filters.panel}
                onValueChange={(value) => handleFilterChange("panel", value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Clinics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clinics</SelectItem>
                  {clinics &&
                    clinics.map((clinic) => (
                      <SelectItem
                        key={clinic.clinicId || clinic.id}
                        value={(clinic.clinicId || clinic.id).toString()}
                      >
                        {clinic.clinicName || clinic.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white shadow-sm transition-colors whitespace-nowrap"
              >
                + Add New
              </Button>
            </div>
          </div>

          <TableWrapper>
            <Table className="border-0">
              <TableHeader >
                <TableRow>
                  <TableHead className="font-bold">
                    Dr ID
                  </TableHead>
                  <TableHead className="font-bold">
                    Name
                  </TableHead>
                  <TableHead className="font-bold">
                    Mobile
                  </TableHead>
                  <TableHead className="font-bold">
                    Clinic
                  </TableHead>
                  <TableHead className="font-bold text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Spinner className="mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : paginatedDoctors.length > 0 ? (
                  paginatedDoctors.map((doctor) => (
                    <TableRow key={doctor.doctorID}>
                      <TableCell>{doctor.doctorID}</TableCell>
                      <TableCell className="font-medium">
                        {doctor.name}
                      </TableCell>
                      <TableCell>{doctor.mobileNo}</TableCell>
                      <TableCell>{doctor.clinicName}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-white/60 dark:hover:text-blue-400"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(doctor)}
                          >
                            <Edit className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-white/60 dark:hover:text-red-400"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(doctor)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-gray-500 dark:text-white/50"
                    >
                      No doctors found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableWrapper>
          <div className="flex justify-end pt-4">
            <CustomPagination
              totalItems={filteredDoctors.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
