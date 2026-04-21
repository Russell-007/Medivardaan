"use client";

import React, { useState, useEffect,Loader2 } from "react";
import { Settings, FileSpreadsheet, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import CustomPagination from "@/components/ui/custom-pagination";
import { getAppointmentsReport } from "@/api/appointments";
import { useClinics } from "@/hooks/useClinics";
import { useDoctors } from "@/hooks/useDoctors";

export default function AppointmentsReportPage() {
  const [clinic, setClinic] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Adjust as needed

  // Master Data
  const { data: clinics = [], isLoading: loadingClinics } = useClinics();

  // Async Data Fetching
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const params = {
           FromDate: fromDate,
           ToDate: toDate,
           ClinicName: clinic !== 'all' ? clinic : '',
           Status: status,
           SearchText: visitorName,
        };
        // Clean empty params
        Object.keys(params).forEach(key => !params[key] && delete params[key]);

        const response = await getAppointmentsReport(params);
        setAppointments(Array.isArray(response) ? response : (response?.data || response?.appointments || []));
    } catch (err) {
        console.error(err);
        setError("Failed to load appointments report.");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
     fetchData();
  }, []);

  const handleSearch = () => {
     setCurrentPage(1);
     fetchData();
  };

  // Filter Logic (Simple implementation)
  const filteredAppointments = appointments.filter(apt => {
     const aptName = apt.name || apt.patientName || "";
     const aptClinic = apt.clinic || apt.clinicName || "";
     const aptStatus = apt.status || apt.appointmentStatus || "";

     const matchClinic = (clinic && clinic !== 'all') ? aptClinic.toLowerCase() === clinic.toLowerCase() : true; 
     const matchName = visitorName ? aptName.toLowerCase().includes(visitorName.toLowerCase()) : true;
     const matchStatus = status ? aptStatus.toLowerCase() === status.toLowerCase() : true;
     return matchName && matchClinic && matchStatus; 
  });


  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-6 bg-white dark:bg-[#18122B] min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-[#443C68]/50 pb-4">
        <Calendar className="w-5 h-5 text-primary animate-spin-slow" />
        <h1 className="text-lg font-bold text-medivardaan-teal uppercase tracking-wide">
          APPOINTMENT LIST
        </h1>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={clinic} onValueChange={setClinic}>
            <SelectTrigger className="bg-white dark:bg-[#393053] border-gray-300 dark:border-[#443C68]/50">
              <SelectValue placeholder="--- Select Clinic ---" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clinics</SelectItem>
              {loadingClinics ? (
                  <SelectItem value="loading" disabled>Loading clinics...</SelectItem>
              ) : clinics.length > 0 ? (
                  Array.from(new Map(clinics.map(c => [c.clinicName, c])).values()).map((c, index) => (
                      <SelectItem key={`clinic-${c.clinicID || index}-${c.clinicName}`} value={c.clinicName}>
                          {c.clinicName}
                      </SelectItem>
                  ))
              ) : (
                  <SelectItem value="no-data" disabled>No clinics available</SelectItem>
              )}
            </SelectContent>
          </Select>

          <Input
            placeholder="Visitor Name"
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            className="bg-white dark:bg-[#393053] border-gray-300 dark:border-[#443C68]/50"
          />

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="bg-white dark:bg-[#393053] border-gray-300 dark:border-[#443C68]/50">
              <SelectValue placeholder="--- Select Status ---" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input
            type="date"
            placeholder="From Date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-white dark:bg-[#393053] border-gray-300 dark:border-[#443C68]/50"
          />

          <Input
            type="date"
            placeholder="To Date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-white dark:bg-[#393053] border-gray-300 dark:border-[#443C68]/50"
          />

          <div>
            <Button onClick={handleSearch} className="bg-medivardaan-blue hover:bg-medivardaan-blue-light dark:bg-medivardaan-purple dark:hover:bg-medivardaan-purple-dark text-white px-8 font-medium shadow-sm transition-all w-full md:w-auto">
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-[#443C68]/50 rounded-t-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-[#E8F8F5] dark:bg-[#393053]">
            <TableRow className="hover:bg-[#E8F8F5] dark:hover:bg-[#443C68]/50 border-gray-200 dark:border-[#443C68]/50">
              <TableHead className="font-bold text-gray-700 dark:text-white/75">Sr. No.</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-white/75">Name</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-white/75">Mobile No</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-white/75">Clinic Name</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-white/75">Doctor Name</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-white/75">Date</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-white/75">Time</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-white/75">BookedBy</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-white/75">Appointment Status</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-white/75">Visit Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={10} className="text-center py-8">
                   <p className="text-sm text-gray-500 mt-2">Loading appointments...</p>
                 </TableCell>
               </TableRow>
            ) : error ? (
               <TableRow>
                 <TableCell colSpan={10} className="text-center py-8 text-red-500">
                   {error}
                 </TableCell>
               </TableRow>
            ) : currentItems.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                   No appointments found
                 </TableCell>
               </TableRow>
            ) : currentItems.map((item, index) => (
              <TableRow key={item.id || item.appointmentID || index} >
                <TableCell className="dark:text-white/75">{indexOfFirstItem + index + 1}</TableCell>
                <TableCell className="dark:text-white/75">{item.name || item.firstName || "N/A"}</TableCell>
                <TableCell className="dark:text-white/75">{item.mobile || item.mobileNo1 || "N/A"}</TableCell>
                <TableCell className="dark:text-white/75">{item.clinic || item.clinicName || "N/A"}</TableCell>
                <TableCell className="dark:text-white/75">{item.doctor || item.doctorName || "N/A"}</TableCell>
                <TableCell className="dark:text-white/75">{item.date || item.startDate || "N/A"}</TableCell>
                <TableCell className="dark:text-white/75">{item.time || item.appointmentTime || "N/A"}</TableCell>
                <TableCell className="dark:text-white/75">{item.bookedBy || item.createdBy || "N/A"}</TableCell>
                <TableCell className="dark:text-white/75">{item.status || item.appointmentStatus || "N/A"}</TableCell>
                <TableCell className="dark:text-white/75">{item.visitStatus || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer / Pagination/Export */}
      <div className="flex justify-between items-center pt-2">
        <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700">
          <FileSpreadsheet className="w-8 h-8" />
        </Button>
         <CustomPagination 
            totalItems={filteredAppointments.length} 
            itemsPerPage={itemsPerPage} 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
}
