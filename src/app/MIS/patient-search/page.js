"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Edit, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { patientService } from "@/api/patient";
import CustomPagination from "@/components/ui/custom-pagination";
import { TableWrapper } from "@/components/shared/TableWrapper";

export default function PatientSearchPage() {
  const router = useRouter();

  // Real clinic list sourced from the backend database (ClinicID → ClinicName)
  const CLINICS = [
    { id: 4,   name: "Andheri West (Juhu)" },
    { id: 86,  name: "Andheri East (takshila)" },
    { id: 45,  name: "Airoli" },
    { id: 122, name: "Badlapur" },
    { id: 1,   name: "Borivali" },
    { id: 16,  name: "Chembur East" },
    { id: 2,   name: "Dadar West" },
    { id: 35,  name: "Dombivali East" },
    { id: 6,   name: "Goregaon East" },
    { id: 98,  name: "Goregaon West" },
    { id: 128, name: "Gurgaon" },
    { id: 44,  name: "Kalyan" },
    { id: 39,  name: "Kharghar" },
    { id: 15,  name: "Mulund" },
    { id: 176, name: "Palava" },
    { id: 113, name: "Pimpri" },
    { id: 33,  name: "Thane West" },
    { id: 18,  name: "Vile-Parle East" },
    { id: 47,  name: "Vasai West" },
    { id: 209, name: "Wadala" },
  ];

  const [searchForm, setSearchForm] = useState({
    firstName: "",
    lastName: "",
    mobileNo: "",
    clinic: "",
    fromDate: "",
    toDate: "",
  });

  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch all patients on mount
  useEffect(() => {
    fetchAllPatients();
  }, []);

  const fetchAllPatients = async () => {
    try {
      setIsLoading(true);

      const queryParams = {
        PageNumber: 1,
        // Backend ignores filters, so we pull a large set to filter client-side
        PageSize: 1000,
      };

      const data = await patientService.getAllPatients(queryParams);
      let list = Array.isArray(data) ? data : data?.data || [];

      // --- MOCK PERSISTENCE INTEGRATION ---
      try {
        const localData = localStorage.getItem('demo_new_patients');
        if (localData) {
          const localPatients = JSON.parse(localData);
          list = [...localPatients, ...list];
        }
      } catch (err) {
        console.error("Failed to parse local dummy patients", err);
      }

      setAllPatients(list);
      setFilteredPatients(list);
      setTotalItems(list.length);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Perform client-side filtering whenever form values change
  useEffect(() => {
    let result = allPatients;

    if (searchForm.firstName) {
      const q = searchForm.firstName.toLowerCase();
      result = result.filter((p) =>
        (p.fristName || p.firstName || p.FirstName || "").toLowerCase().includes(q)
      );
    }
    if (searchForm.lastName) {
      const q = searchForm.lastName.toLowerCase();
      result = result.filter((p) =>
        (p.lastName || p.LastName || "").toLowerCase().includes(q)
      );
    }
    if (searchForm.mobileNo) {
      const q = searchForm.mobileNo;
      result = result.filter((p) =>
        String(p.mobile || p.mobileNo || p.MobileNo || "").includes(q)
      );
    }
    if (searchForm.clinic && searchForm.clinic !== "all") {
      result = result.filter((p) => String(p.clinicID) === searchForm.clinic);
    }
    if (searchForm.fromDate) {
      const from = new Date(searchForm.fromDate).getTime();
      result = result.filter((p) => {
        const d = p.registrationDate || p.createdDate;
        if (!d) return false;
        return new Date(d).getTime() >= from;
      });
    }
    if (searchForm.toDate) {
      const to = new Date(searchForm.toDate).getTime();
      result = result.filter((p) => {
        const d = p.registrationDate || p.createdDate;
        if (!d) return false;
        // Include the full day
        return new Date(d).getTime() <= to + 86400000;
      });
    }

    setFilteredPatients(result);
    setTotalItems(result.length);
    setCurrentPage(1); // Optional: reset page on active filter changes
  }, [searchForm, allPatients]);

  const displayedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function handleSearchChange(e) {
    setSearchForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  function handleSearch() {
    // Current pagination is reset dynamically in effect, 
    // but a manually triggered re-fetch could also sit here
    setCurrentPage(1);
  }

  function handleViewConsultation(patient) {
    // Use correct ID field from API
    const id = patient.patientID || patient.id || patient.PatientID;
    router.push(`/MIS/consultation?patientId=${id}`);
  }

  function handleEditPatient(patient) {
    // Use correct ID field from API
    const id = patient.patientID || patient.id || patient.PatientID;
    console.log("Navigating to edit page for patient:", id);
    router.push(`/MIS/patient-edit?patientId=${id}`);
  }

  function handleExcelUpload() {
    console.log("Excel upload clicked");
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#18122B] pb-8 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2 text-primary mb-8 border-b border-border pb-4">
          <User className="w-5 h-5 text-medivardaan-teal" />
          <h1 className="text-xl font-bold tracking-tight text-medivardaan-teal uppercase">
            Patient Search
          </h1>
        </div>

        <Card className="border border-gray-200 dark:border-[#443C68]/50 shadow-sm bg-white dark:bg-[#18122B]">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Input
                  name="firstName"
                  placeholder="First Name"
                  value={searchForm.firstName}
                  onChange={handleSearchChange}
                  className="bg-white dark:bg-[#18122B] border-gray-300 dark:border-[#635985]/40"
                />
              </div>
              <div className="space-y-2">
                <Input
                  name="lastName"
                  placeholder="Last Name"
                  value={searchForm.lastName}
                  onChange={handleSearchChange}
                  className="bg-white dark:bg-[#18122B] border-gray-300 dark:border-[#635985]/40"
                />
              </div>
              <div className="space-y-2">
                <Input
                  name="mobileNo"
                  placeholder="Mobile No"
                  value={searchForm.mobileNo}
                  onChange={handleSearchChange}
                  className="bg-white dark:bg-[#18122B] border-gray-300 dark:border-[#635985]/40"
                />
              </div>
              <div className="space-y-2">
                <Select
                  value={searchForm.clinic}
                  onValueChange={(value) =>
                    setSearchForm({ ...searchForm, clinic: value })
                  }
                >
                  <SelectTrigger className="bg-white dark:bg-[#18122B] border-gray-300 dark:border-[#635985]/40">
                    <SelectValue placeholder="-- Select Clinic --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clinics</SelectItem>
                    {CLINICS.map((clinic) => (
                      <SelectItem key={clinic.id} value={String(clinic.id)}>
                        {clinic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Input
                  type="date"
                  name="fromDate"
                  placeholder="From Date"
                  value={searchForm.fromDate}
                  onChange={handleSearchChange}
                  className="bg-white dark:bg-[#18122B] border-gray-300 dark:border-[#635985]/40"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="date"
                  name="toDate"
                  placeholder="To Date"
                  value={searchForm.toDate}
                  onChange={handleSearchChange}
                  className="bg-white dark:bg-[#18122B] border-gray-300 dark:border-[#635985]/40"
                />
              </div>
              <div className="flex gap-2 items-end">
                <Button
                  onClick={handleSearch}
                  className="h-10 bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white px-8 shadow-sm transition-colors w-full md:w-auto"
                >
                  Search
                </Button>
                <Button
                  onClick={handleExcelUpload}
                  variant="outline"
                  className="h-10 border-gray-300 dark:border-[#635985]/40 text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-[#393053] px-6 shadow-sm w-full md:w-auto transition-colors"
                >
                  Excel upload
                </Button>
              </div>
            </div>

            {/* Patient List Table */}
            <TableWrapper className="mt-6">
              <div className="flex justify-end p-2 border-b border-gray-200 dark:border-[#443C68]/50">
                <p className="text-sm text-gray-500 dark:text-white/70">
                  Total: <span className="font-semibold">{totalItems}</span>
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr >
                      <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-white/90 whitespace-nowrap">
                        Sr. No.
                      </th>
                      <th className="px-4 py-3 text-left">
                        Case Paper No.
                      </th>
                      <th className="px-4 py-3 text-left">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left">
                        Mobile No
                      </th>
                      <th className="px-4 py-3 text-left">
                        Registration Date
                      </th>
                      <th className="px-4 py-3 text-left">
                        Clinic Name
                      </th>
                      <th className="px-4 py-3 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="p-8 text-center text-gray-500 dark:text-white/50"
                        >
                          Loading...
                        </td>
                      </tr>
                    ) : displayedPatients.length > 0 ? (
                      displayedPatients.map((patient, index) => (
                        <tr
                          key={patient.id}
                          
                        >
                          <td className="p-3 text-sm">
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>
                          <td className="px-4 py-3">
                            {patient.patientCode || patient.casePaperNo || "-"}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {/* Handle typo in API response 'fristName' */}
                            {patient.fristName || patient.firstName
                              ? `${patient.fristName || patient.firstName} ${patient.lastName || ""}`
                              : patient.name || "-"}
                          </td>
                          <td className="px-4 py-3">
                            {patient.mobile || patient.mobileNo || "-"}
                          </td>
                          <td className="px-4 py-3">
                            {patient.registrationDate
                              ? new Date(
                                  patient.registrationDate,
                                ).toLocaleDateString("en-GB")
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            {patient.clinicName || patient.ClinicName || "-"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewConsultation(patient)}
                                className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-white/60 dark:hover:text-blue-400 transition-colors"
                                title="View Consultation"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditPatient(patient)}
                                className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-white/60 dark:hover:text-blue-400"
                                title="Edit Patient Details"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="p-8 text-center text-gray-500 dark:text-white/60"
                        >
                          No patients found. Try adjusting your Search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <CustomPagination
                totalItems={totalItems}
                itemsPerPage={pageSize}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </TableWrapper>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
