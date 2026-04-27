"use client";
import React, { useState } from "react";
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
import { FileSpreadsheet, Settings } from "lucide-react";
import { exportToExcel } from "@/utils/exportToExcel";
import CustomPagination from "@/components/ui/custom-pagination";

export default function PatientwiseCollectionReportPage() {
  const [clinicName, setClinicName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [patientName, setPatientName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data matching the screenshot
  // Mock data matching the screenshot
  const [reportData, setReportData] = useState([
    {
      id: 1,
      clinic: "Vile Parle",
      doctor: "Dr.Riddhi Rathi",
      patientCode: "P115356",
      patientName: "Sikander Chohan",
      mobile: "9619676685",
      grandAmount: "9000.00",
      paidAmount: "3000.00",
      pendingAmount: "6000.00",
      mode: "Cash",
    },
    {
      id: 2,
      clinic: "Vasai West",
      doctor: "Dr.Zoya A",
      patientCode: "P50914",
      patientName: "sakina khan",
      mobile: "9503238769",
      grandAmount: "2000.00",
      paidAmount: "2000.00",
      pendingAmount: "0.00",
      mode: "Cash",
    },
    {
        id: 3,
        clinic: "Kalyan",
        doctor: "Dr.MADHU PAWAR",
        patientCode: "P114782",
        patientName: "Ruby Pathak",
        mobile: "8369398705",
        grandAmount: "3000.00",
        paidAmount: "2000.00",
        pendingAmount: "1000.00",
        mode: "Cash",
    },
    {
        id: 4,
        clinic: "Mayur Vihar",
        doctor: "Dr.Apurva Vaidya",
        patientCode: "P115355",
        patientName: "kavita goyal",
        mobile: "9811944408",
        grandAmount: "70000.00",
        paidAmount: "5000.00",
        pendingAmount: "65000.00",
        mode: "UPI",
    },
    {
        id: 5,
        clinic: "Vile Parle",
        doctor: "Dr.Riddhi Rathi",
        patientCode: "P115354",
        patientName: "Sabrina Mitha",
        mobile: "8291441547",
        grandAmount: "5000.00",
        paidAmount: "5000.00",
        pendingAmount: "0.00",
        mode: "Cash",
    },
     {
        id: 6,
        clinic: "Vile Parle",
        doctor: "Dr.Riddhi Rathi",
        patientCode: "P115354",
        patientName: "Sabrina Mitha",
        mobile: "8291441547",
        grandAmount: "500.00",
        paidAmount: "500.00",
        pendingAmount: "0.00",
        mode: "Cash",
    },
     {
        id: 7,
        clinic: "Vile Parle",
        doctor: "Dr.Riddhi Rathi",
        patientCode: "P21937",
        patientName: "RAKSHIT K S",
        mobile: "9820651623",
        grandAmount: "2500.00",
        paidAmount: "2500.00",
        pendingAmount: "0.00",
        mode: "Cash",
    },
     {
        id: 8,
        clinic: "Rohini",
        doctor: "Dr.Apurva Vaidya",
        patientCode: "P96019",
        patientName: "Gaurav bhatt",
        mobile: "9716319856",
        grandAmount: "2000.00",
        paidAmount: "2000.00",
        pendingAmount: "0.00",
        mode: "UPI",
    },
     {
        id: 9,
        clinic: "Goregaon East",
        doctor: "Dr.Prajakta Durgawale",
        patientCode: "P115352",
        patientName: "pream singh",
        mobile: "8369394987",
        grandAmount: "3000.00",
        paidAmount: "3000.00",
        pendingAmount: "0.00",
        mode: "UPI",
    },
     {
        id: 10,
        clinic: "Wadgaon Sheri",
        doctor: "Dr.Dhanashree Shinde",
        patientCode: "P113777",
        patientName: "veena more",
        mobile: "7039931983",
        grandAmount: "1138.00",
        paidAmount: "1138.00",
        pendingAmount: "0.00",
        mode: "UPI",
    },
  ]);

  // Filter Data
  const filteredData = reportData.filter((item) => {
      const matchesClinic = !clinicName || clinicName === "all" || item.clinic.toLowerCase() === clinicName.toLowerCase();
      const matchesDoctor = item.doctor.toLowerCase().includes(doctorName.toLowerCase());
      const matchesPatient = item.patientName.toLowerCase().includes(patientName.toLowerCase());
      
      let matchesDate = true;
      if (fromDate) matchesDate = matchesDate && new Date(item.date) >= new Date(fromDate);
      if (toDate) matchesDate = matchesDate && new Date(item.date) <= new Date(toDate);

      return matchesClinic && matchesDoctor && matchesPatient && matchesDate;
  });
    
    const handleClear = () => {
      setClinicName("");
      setDoctorName("");
      setPatientName("");
      setFromDate("");
      setToDate("");
      setCurrentPage(1);
    }

  const handleExport = () => {
    exportToExcel(filteredData, "Patientwise_Collection_Report");
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalAmount = filteredData.reduce((acc, curr) => acc + parseFloat(curr.paidAmount || 0), 0);

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#18122B] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        
          <FileSpreadsheet className="w-5 h-5 font-bold text-medivardaan-teal uppercase tracking-wid" />
        
        <h1 className="text-xl font-bold text-medivardaan-teal uppercase">
          PATIENTWISE COLLECTION REPORT
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-end bg-white dark:bg-[#393053] p-4 rounded-lg border border-gray-200 dark:border-[#443C68]/50 font-normal">
        {/* Clinic Name (Required) */}
        <div className="w-full md:w-1/6 space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-white/75">
             Clinic Name <span className="text-red-500">*</span>
          </label>
           <Select value={clinicName} onValueChange={setClinicName}>
            <SelectTrigger className="h-10 border-gray-300 dark:border-[#635985]/40 text-gray-900 dark:text-white bg-white dark:bg-[#443C68]">
                <SelectValue placeholder="-- Select Clinic --" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Clinics</SelectItem>
                <SelectItem value="vashi">Vashi</SelectItem>
                <SelectItem value="andheri">Andheri</SelectItem>
                <SelectItem value="borivali">Borivali</SelectItem>
            </SelectContent>
            </Select>
        </div>

         {/* Doctor */}
         <div className="w-full md:w-1/6 space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-white/75">
            Doctor
          </label>
           <Input
            placeholder=""
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            className="h-10 border-gray-300 dark:border-[#635985]/40 text-gray-900 dark:text-white bg-white dark:bg-[#443C68]"
          />
        </div>

        {/* Patient Name */}
        <div className="w-full md:w-1/6 space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-white/75">
            Patient Name
          </label>
           <Input
            placeholder="Type Patient Name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="h-10 border-gray-300 dark:border-[#635985]/40 text-gray-900 dark:text-white bg-white dark:bg-[#443C68]"
          />
        </div>

        {/* From Date */}
        <div className="w-full md:w-1/6 space-y-1">
           <label className="text-sm font-medium text-gray-700 dark:text-white/75">
            From Date
          </label>
           <Input
            type="date"
            placeholder="From Date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-10 border-gray-300 dark:border-[#635985]/40 text-gray-900 dark:text-white bg-white dark:bg-[#443C68]"
          />
        </div>

        {/* To Date */}
        <div className="w-full md:w-1/6 space-y-1">
           <label className="text-sm font-medium text-gray-700 dark:text-white/75">
            To Date
          </label>
           <Input
            type="date"
            placeholder="To Date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-10 border-gray-300 dark:border-[#635985]/40 text-gray-900 dark:text-white bg-white dark:bg-[#443C68]"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 w-full md:w-auto">
          <Button className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white shadow-sm transition-colors px-6 h-10 w-full md:w-auto transition-colors">
            Search
          </Button>
           <Button
             onClick={handleClear}
             className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white shadow-sm transition-colors px-6 h-10 w-full md:w-auto transition-colors"
          >
            Clear
          </Button>
        </div>
      </div>

       {/* Total Count */}
       <div className="flex justify-end pr-2">
         <span className="font-semibold text-gray-600 dark:text-white/60 text-sm">Amount : {totalAmount.toFixed(2)}</span>
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-[#443C68]/50 rounded-t-lg overflow-hidden">
        <Table>
          <TableHeader >
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[60px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">
                Sr. No.
              </TableHead>
              <TableHead className="font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">
                Clinic Name
              </TableHead>
              <TableHead className="font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">
                Doctor Name
              </TableHead>
               <TableHead className="font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">
                Patient Code
              </TableHead>
              <TableHead className="font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">
                Patient Name
              </TableHead>
              <TableHead className="font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">
                Mobile No.
              </TableHead>
              <TableHead className="font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">
                Grand Amount
              </TableHead>
              <TableHead className="font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">
                Paid Amount
              </TableHead>
              <TableHead className="font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">
                Pending Amount
              </TableHead>
              <TableHead className="font-bold text-gray-800 dark:text-white/90">
                Payment Mode
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
                currentItems.map((row, index) => (
                <TableRow
                    key={row.id}
                    className="hover:bg-gray-50 dark:bg-[#18122B] dark:hover:bg-[#393053]/50 border-b border-gray-200 dark:border-[#443C68]/50"
                >
                    <TableCell className="font-medium text-gray-600 dark:text-white/75 border-r border-gray-200 dark:border-[#443C68]/50 py-3">
                    {indexOfFirstItem + index + 1}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/75 border-r border-gray-200 dark:border-[#443C68]/50 py-3">
                    {row.clinic}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/75 border-r border-gray-200 dark:border-[#443C68]/50 py-3">
                    {row.doctor}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/75 border-r border-gray-200 dark:border-[#443C68]/50 py-3">
                    {row.patientCode}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/75 border-r border-gray-200 dark:border-[#443C68]/50 py-3">
                    {row.patientName}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/75 border-r border-gray-200 dark:border-[#443C68]/50 py-3">
                    {row.mobile}
                    </TableCell>
                   <TableCell className="text-gray-600 dark:text-white/75 border-r border-gray-200 dark:border-[#443C68]/50 py-3">
                    {row.grandAmount}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/75 border-r border-gray-200 dark:border-[#443C68]/50 py-3">
                    {row.paidAmount}
                    </TableCell>
                     <TableCell className="text-gray-600 dark:text-white/75 border-r border-gray-200 dark:border-[#443C68]/50 py-3">
                    {row.pendingAmount}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/75 py-3">
                    {row.mode}
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                     <TableCell colSpan={10} className="text-center py-4 text-gray-500 dark:text-white/50">No matching records found</TableCell>
                </TableRow>
            )}
             {currentItems.length > 0 && (
                <TableRow className="border-b border-gray-200 dark:border-[#443C68]/50 bg-gray-50 dark:bg-[#393053]/30">
                    <TableCell colSpan={7} className="border-r border-gray-200 dark:border-[#443C68]/50 py-3 text-right pr-4 font-bold text-gray-700 dark:text-white/75">
                        Total
                    </TableCell>
                    <TableCell className="font-bold text-gray-700 dark:text-white/75 py-3 border-r border-gray-200 dark:border-[#443C68]/50">
                        {totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell colSpan={2}></TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
      </div>
      
       {/* Footer / Pagination / Export */}
      <div className="flex justify-between items-center mt-4">
        {/* Excel Export */}
        <div className="cursor-pointer" onClick={handleExport} title="Download Excel">
           <div className="w-8 h-8 flex items-center justify-center bg-green-700 hover:bg-green-800 text-white rounded shadow transition-colors">
            <FileSpreadsheet className="w-5 h-5" />
           </div>
        </div>
        
        {/* Pagination component */}
        <CustomPagination 
            totalItems={filteredData.length} 
            itemsPerPage={itemsPerPage} 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
}
