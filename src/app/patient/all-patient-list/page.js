"use client";

import { useState, useEffect } from "react";
import { User, Search, Eye, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/Pagination";
import { Card, CardContent } from "@/components/ui/card";
import { TableWrapper } from "@/components/shared/TableWrapper";
import { patientService } from "@/api/patient";

export default function AllPatientListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Fetch Patients
  const fetchPatients = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.getAllPatients();

      console.log("Fetched patients data:", data);

      let apiPatients = [];
      if (Array.isArray(data)) {
        apiPatients = data;
      } else if (data && Array.isArray(data.data)) {
        // Handle wrapped response (e.g. { data: [...], ... })
        apiPatients = data.data;
      } else if (data && Array.isArray(data.result)) {
        // Handle another common wrapped response pattern
        apiPatients = data.result;
      } else {
        console.warn("API returned empty or invalid data structure:", data);
      }

      // --- MOCK PERSISTENCE INTEGRATION ---
      // Read locally registered patients that the backend demo environment didn't persist
      try {
        const localData = localStorage.getItem('demo_new_patients');
        if (localData) {
          const localPatients = JSON.parse(localData);
          // Prepend the local ones so they appear first!
          apiPatients = [...localPatients, ...apiPatients];
        }
      } catch (err) {
        console.error("Failed to parse local dummy patients", err);
      }

      setPatients(apiPatients);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      setError("Failed to load patients. Please try again later.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(currentPage);
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPatients(1);
  };

  // Client-side Filtering (on the fetched page)
  const filteredPatients = patients.filter((patient) => {
    // 1. Search Term (Name / Mobile / Email)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const firstName =
        patient.firstName || patient.fristName || patient.FirstName || "";
      const lastName = patient.lastName || patient.LastName || "";
      const name = (firstName + " " + lastName).toLowerCase();
      const mobile = String(
        patient.mobile || patient.MobileNo || "",
      ).toLowerCase();
      const email = String(patient.email || patient.Email || "").toLowerCase();

      if (
        !name.includes(term) &&
        !mobile.includes(term) &&
        !email.includes(term)
      ) {
        return false;
      }
    }

    // 2. City Filter
    if (selectedCity !== "all") {
      const city = (
        patient.cityName ||
        patient.city ||
        patient.CityName ||
        patient.City ||
        patient.address ||
        ""
      ).toLowerCase();
      if (!city.includes(selectedCity.toLowerCase())) return false;
    }

    return true;
  });

  // Server-side Pagination Logic mimicking Leads page
  const currentItems = filteredPatients;
  // Arbitrary total pages as API does not return count, mimicking leads page strategy
  const totalPages = 1000;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchPatients(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#18122B] pb-8 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-[#443C68]/50">
          <div className="p-2 rounded-lg bg-primary/10 dark:bg-medivardaan-purple/20">
            <User className="w-5 h-5 text-primary dark:text-medivardaan-purple" />
          </div>
          <h1 className="text-xl font-bold text-medivardaan-teal uppercase tracking-wide">
            All Patient List
          </h1>
        </div>

        <Card className="border border-gray-200 dark:border-[#443C68]/50 shadow-sm bg-white dark:bg-[#18122B]">
          <CardContent className="p-6">
            {/* Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium text-foreground/80 dark:text-white/75">
                  Search
                </Label>
                <Input
                  placeholder="Search by Name, Mobile or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-full bg-white dark:bg-[#18122B] border-gray-300 dark:border-[#635985]/40"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  className="h-10 bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white px-8 shadow-sm w-full transition-colors"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Patients Table */}
            <TableWrapper>
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading patients...
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">{error}</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr >
                      <th className="px-4 py-3 text-left">
                        Sr. No.
                      </th>
                      <th className="px-4 py-3 text-left">
                        Patient Name
                      </th>
                      <th className="px-4 py-3 text-left">
                        Mobile No.
                      </th>
                      <th className="px-4 py-3 text-left">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left">
                        Age/Gender
                      </th>
                      <th className="px-4 py-3 text-left">
                        City
                      </th>
                      <th className="px-4 py-3 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((patient, index) => (
                        <tr
                          key={patient.patientID || patient.PatientID || index}
                          
                        >
                          <td className="px-4 py-3 text-sm">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {patient.firstName ||
                              patient.fristName ||
                              patient.FirstName}{" "}
                            {patient.lastName || patient.LastName}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {patient.mobile || patient.MobileNo || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {patient.email || patient.Email || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {patient.age || patient.Age
                              ? `${patient.age || patient.Age} Y`
                              : ""}
                            {(patient.age || patient.Age) &&
                            (patient.gender || patient.Gender)
                              ? " / "
                              : ""}
                            {patient.gender || patient.Gender || ""}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {patient.cityName ||
                              patient.city ||
                              patient.CityName ||
                              patient.City ||
                              patient.address ||
                              "N/A"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-white/60 dark:hover:text-blue-400 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center py-12 text-muted-foreground"
                        >
                          No patients found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </TableWrapper>

            {/* Pagination Controls */}
            {!loading && (
              <div className="flex justify-end mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
