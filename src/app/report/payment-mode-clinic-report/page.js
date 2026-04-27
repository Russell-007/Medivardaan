"use client";
import React, { useState, useEffect } from "react";
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

export default function PaymentModeClinicReportPage() {
  const [clinicName, setClinicName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [reportData, setReportData] = useState([
     {
      id: 1,
      clinic: "Vashi",
      city: "Navi Mumbai",
      year: "2024",
      month: "March",
      bankDeposit: "5000",
      cash: "2000",
      card: "1000",
      paytm: "500",
      bajajFinance: "0",
      total: "8500",
      doctor: "Dr. Smith", // Added for filtering
      date: "2024-03-15" // Added for date filtering
    },
     {
      id: 2,
      clinic: "Andheri",
      city: "Mumbai",
      year: "2024",
      month: "March",
      bankDeposit: "4000",
      cash: "3000",
      card: "2000",
      paytm: "1000",
      bajajFinance: "500",
      total: "10500",
      doctor: "Dr. Jones",
      date: "2024-03-20"
    },
    {
        id: 3,
        clinic: "Borivali",
        city: "Mumbai",
        year: "2024",
        month: "April",
        bankDeposit: "6000",
        cash: "4000",
        card: "0",
        paytm: "0",
        bajajFinance: "0",
        total: "10000",
        doctor: "Dr. Smith",
        date: "2024-04-10"
      },
       {
        id: 4,
        clinic: "Vashi",
        city: "Navi Mumbai",
        year: "2023",
        month: "December",
        bankDeposit: "5500",
        cash: "2500",
        card: "1500",
        paytm: "500",
        bajajFinance: "0",
        total: "10000",
        doctor: "Dr. Wilson",
        date: "2023-12-05"
      },
  ]);

  const [filteredReportData, setFilteredReportData] = useState(reportData);

    useEffect(() => {
        setFilteredReportData(reportData);
    }, [reportData]);

  const handleSearch = () => {
        let result = reportData;

        if (clinicName && clinicName !== "all") {
            const searchStr = clinicName.toLowerCase().replace(/_/g, " ");
            result = result.filter(item => {
                 const cVal = item.clinic.toLowerCase();
                 const selectedNormalized = clinicName.toLowerCase().replace(/_/g, " ");
                 return cVal.includes(selectedNormalized) || selectedNormalized.includes(cVal);
            });
        }
        
        if (doctorName) {
            result = result.filter(item => item.doctor.toLowerCase().includes(doctorName.toLowerCase()));
        }

        if (year && year !== "all") {
             result = result.filter(item => item.year === year);
        }

        if (month && month !== "all") {
             const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
             const selectedMonthIndex = parseInt(month) - 1;
             if (selectedMonthIndex >= 0 && selectedMonthIndex < 12) {
                 const selectedMonthName = monthNames[selectedMonthIndex];
                 result = result.filter(item => item.month.toLowerCase() === selectedMonthName);
             }
        }

        if (fromDate) {
           result = result.filter(item => new Date(item.date) >= new Date(fromDate));
        }
        
        if (toDate) {
             result = result.filter(item => new Date(item.date) <= new Date(toDate));
        }

        setFilteredReportData(result);
        setCurrentPage(1);
  };
    
    const handleClear = () => {
      setClinicName("");
      setDoctorName("");
      setYear("");
      setMonth("");
      setFromDate("");
      setToDate("");
      setFilteredReportData(reportData);
      setCurrentPage(1);
    }

  const handleExport = () => {
    exportToExcel(filteredReportData, "Payment_Mode_Clinic_Report");
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReportData.slice(indexOfFirstItem, indexOfLastItem);

  const calculateTotal = (key) => filteredReportData.reduce((acc, curr) => acc + parseFloat(curr[key] || 0), 0);
  
  const totalBankDeposit = calculateTotal('bankDeposit');
  const totalCash = calculateTotal('cash');
  const totalCard = calculateTotal('card');
  const totalPaytm = calculateTotal('paytm');
  const totalBajaj = calculateTotal('bajajFinance');
  const totalAmount = calculateTotal('total');

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#18122B] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        
          <FileSpreadsheet className="w-5 h-5 font-bold text-medivardaan-teal uppercase tracking-wid" />
        
        <h1 className="text-xl font-bold text-medivardaan-teal uppercase">
          PAYMENT MODE CLINIC REPORT
        </h1>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end bg-white dark:bg-[#393053] p-4 rounded-lg border border-gray-200 dark:border-[#443C68]/50 font-normal">
        {/* Clinic Name (Required) */}
        <div className="space-y-1">
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
         <div className="space-y-1">
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
        
        {/* Year */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-white/75">
            Year
          </label>
           <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="h-10 border-gray-300 dark:border-[#635985]/40 text-gray-900 dark:text-white bg-white dark:bg-[#443C68]">
                <SelectValue placeholder="-- Select --" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2019">2019</SelectItem>
                <SelectItem value="2020">2020</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
            </Select>
        </div>

        {/* Month */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-white/75">
            Month
          </label>
           <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="h-10 border-gray-300 dark:border-[#635985]/40 text-gray-900 dark:text-white bg-white dark:bg-[#443C68]">
                <SelectValue placeholder="-- Select --" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value="1">January</SelectItem>
                <SelectItem value="2">February</SelectItem>
                <SelectItem value="3">March</SelectItem>
                <SelectItem value="4">April</SelectItem>
                <SelectItem value="5">May</SelectItem>
                <SelectItem value="6">June</SelectItem>
                <SelectItem value="7">July</SelectItem>
                <SelectItem value="8">August</SelectItem>
                <SelectItem value="9">September</SelectItem>
                <SelectItem value="10">October</SelectItem>
                <SelectItem value="11">November</SelectItem>
                <SelectItem value="12">December</SelectItem>
            </SelectContent>
            </Select>
        </div>


        {/* From Date */}
        <div className="space-y-1">
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
        <div className="space-y-1">
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
        <div className="flex gap-2">
          <Button
             onClick={handleSearch}
            className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white shadow-sm transition-colors flex-1 h-10 transition-colors"
          >
            Search
          </Button>
           <Button
             onClick={handleClear}
              className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white shadow-sm transition-colors flex-1 h-10 transition-colors"
          >
            Clear
          </Button>
        </div>
      </div>

       {/* Total Count */}
      <div className="flex justify-end pr-2">
         <span className="font-semibold text-gray-600 dark:text-white/60 text-sm">Total : {totalAmount.toFixed(0)}</span>
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-[#443C68]/50 rounded-t-lg overflow-hidden">
        <Table>
          <TableHeader >
            <TableRow >
              <TableHead className="w-[60px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">
                Sr. No.
              </TableHead>
              <TableHead className="font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">
                Clinic Name
              </TableHead>
              <TableHead className="font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">
                City
              </TableHead>
              <TableHead className="font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">
                Year
              </TableHead>
              <TableHead className="font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">
                Month
              </TableHead>
              <TableHead className="font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40 text-right">
                Bank Deposit Amount
              </TableHead>
              <TableHead className="font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40 text-right">
                Cash Amount
              </TableHead>
               <TableHead className="font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40 text-right">
                Card Amount
              </TableHead>
              <TableHead className="font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40 text-right">
                Paytm Amount
              </TableHead>
              <TableHead className="font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40 text-right">
                Bajaj Finance
              </TableHead>
               <TableHead className="font-bold text-gray-800 dark:text-white/90 text-right">
                 Total
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
                    {row.city}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/75 border-r border-gray-200 dark:border-[#443C68]/50 py-3">
                    {row.year}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/75 border-r border-gray-200 dark:border-[#443C68]/50 py-3">
                    {row.month}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/75 border-r border-gray-200 dark:border-[#443C68]/50 py-3 text-right">
                    {row.bankDeposit}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/75 border-r border-gray-200 dark:border-[#443C68]/50 py-3 text-right">
                    {row.cash}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/75 border-r border-gray-200 dark:border-[#443C68]/50 py-3 text-right">
                    {row.card}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/75 border-r border-gray-200 dark:border-[#443C68]/50 py-3 text-right">
                    {row.paytm}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/75 border-r border-gray-200 dark:border-[#443C68]/50 py-3 text-right">
                    {row.bajajFinance}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/75 py-3 text-right">
                    {row.total}
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                     <TableCell colSpan={11} className="text-center py-4 text-gray-500 dark:text-white/50">No matching records found</TableCell>
                </TableRow>
            )}
             {currentItems.length > 0 && (
                <TableRow className="border-b border-gray-200 dark:border-[#443C68]/50 bg-gray-50 dark:bg-[#393053]/30">
                    <TableCell colSpan={5} className="border-r border-gray-200 dark:border-[#443C68]/50 py-3 text-right pr-4 font-bold text-gray-700 dark:text-white/75">
                        Total
                    </TableCell>
                    <TableCell className="font-bold text-gray-700 dark:text-white/75 py-3 text-right">
                        {totalBankDeposit.toFixed(0)}
                    </TableCell>
                    <TableCell className="font-bold text-gray-700 dark:text-white/75 py-3 text-right">
                        {totalCash.toFixed(0)}
                    </TableCell>
                    <TableCell className="font-bold text-gray-700 dark:text-white/75 py-3 text-right">
                        {totalCard.toFixed(0)}
                    </TableCell>
                    <TableCell className="font-bold text-gray-700 dark:text-white/75 py-3 text-right">
                        {totalPaytm.toFixed(0)}
                    </TableCell>
                    <TableCell className="font-bold text-gray-700 dark:text-white/75 py-3 text-right">
                        {totalBajaj.toFixed(0)}
                    </TableCell>
                     <TableCell className="font-bold text-gray-700 dark:text-white/75 py-3 text-right">
                        {totalAmount.toFixed(0)}
                    </TableCell>
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
            totalItems={filteredReportData.length} 
            itemsPerPage={itemsPerPage} 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
}
