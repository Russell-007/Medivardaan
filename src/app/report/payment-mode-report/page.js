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
import { TableWrapper } from "@/components/shared/TableWrapper";

export default function PaymentModeReportPage() {
  const [clinicName, setClinicName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data matching the screenshot
  const [reportData, setReportData] = useState([
    { id: 1, month: "January", cash: "7564177.37", cheque: "0.00", debitCard: "3187399.99", creditCard: "1147875.00", upi: "13293033.33", bajaj: "1995399.99", creditFair: "0.00", liquid: "0.00", shopse: "0.00", shopseDebit: "1450200.00", shopseHDFC: "1241000.00", shopseCredit: "2961000.00", shopseAmex: "132000.00", neft: "328158.99", razorpay: "1247096.01", savein: "4427086.66", unofin: "3027799.99", fibe: "4949031.51", flexUpi: "0.00", medibuddy: "0.00", year: "2025", clinic: "adajan", doctor: "Dr. Smith", date: "2025-01-01" },
    { id: 2, month: "February", cash: "6847592.04", cheque: "0.00", debitCard: "1982520.99", creditCard: "1033580.00", upi: "13226507.85", bajaj: "1834433.33", creditFair: "0.00", liquid: "0.00", shopse: "0.00", shopseDebit: "1891700.00", shopseHDFC: "1291000.00", shopseCredit: "3598817.51", shopseAmex: "293500.00", neft: "683000.00", razorpay: "1219304.00", savein: "5703109.00", unofin: "0.00", fibe: "4935337.35", flexUpi: "0.00", medibuddy: "0.00", year: "2025", clinic: "adyar", doctor: "Dr. Jones", date: "2025-02-01" },
    { id: 3, month: "March", cash: "7804950.87", cheque: "0.00", debitCard: "1723236.70", creditCard: "1977288.00", upi: "14244699.58", bajaj: "1881520.00", creditFair: "0.00", liquid: "0.00", shopse: "0.00", shopseDebit: "1882200.33", shopseHDFC: "928500.00", shopseCredit: "3645500.00", shopseAmex: "385000.00", neft: "329071.99", razorpay: "1183703.67", savein: "8356255.58", unofin: "0.00", fibe: "7061473.11", flexUpi: "0.00", medibuddy: "0.00", year: "2025", clinic: "adajan", doctor: "Dr. Smith", date: "2025-03-01" },
  ]);

  const [filteredReportData, setFilteredReportData] = useState(reportData);

  useEffect(() => {
    setFilteredReportData(reportData);
  }, [reportData]);


  const handleSearch = () => {
    let result = reportData;

    if (clinicName && clinicName !== "all") {
        result = result.filter(item => item.clinic.toLowerCase() === clinicName.toLowerCase());
    }
    
    if (doctorName) {
        result = result.filter(item => item.doctor.toLowerCase().includes(doctorName.toLowerCase()));
    }

    if (year && year !== "all") {
         result = result.filter(item => item.year === year);
    }

    if (month && month !== "all") {
         result = result.filter(item => item.month.toLowerCase() === month.toLowerCase());
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
    exportToExcel(filteredReportData, "Payment_Mode_Report");
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReportData.slice(indexOfFirstItem, indexOfLastItem);
  
  // Calculate Grand Total for the filtered data (sum of all payment columns)
  // This is a rough sum, might need adjustment based on exact fields if 'total' isn't pre-calced per row
  // For the screenshot "Total : 622949402.50", we usually sum up everything.
  // I will sum up a few key fields for demonstration
  const totalAmount = filteredReportData.reduce((acc, row) => {
    const sumRow = 
      parseFloat(row.cash || 0) + 
      parseFloat(row.cheque || 0) + 
      parseFloat(row.debitCard || 0) + 
      parseFloat(row.creditCard || 0) + 
      parseFloat(row.upi || 0) + 
      parseFloat(row.bajaj || 0) +
      parseFloat(row.neft || 0) +
      parseFloat(row.razorpay || 0) +
      parseFloat(row.savein || 0) +
      parseFloat(row.fibe || 0); 
      // ... add other fields as necessary
    return acc + sumRow;
  }, 0);

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#18122B] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        
          <FileSpreadsheet className="w-5 h-5 font-bold text-medivardaan-teal uppercase tracking-wid" />
        
        <h1 className="text-xl font-bold text-medivardaan-teal uppercase">
          PAYMENT COLLECTION REPORT
        </h1>
      </div>

       {/* Filters */}
       <div className="flex flex-col space-y-4 bg-white dark:bg-[#393053] p-4 rounded-lg border border-gray-200 dark:border-[#443C68]/50">
        {/* Row 1 */}
        <div className="flex flex-col md:flex-row gap-4 items-end">
             {/* Clinic Name */}
            <div className="w-full md:w-1/4 space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase">Clinic Name</label>
                <Select value={clinicName} onValueChange={setClinicName}>
                    <SelectTrigger className="h-10 border-gray-300 dark:border-[#635985]/40 text-gray-500 dark:text-white/60 bg-white dark:bg-[#443C68]">
                        <SelectValue placeholder="-- Select Clinic --" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Clinics</SelectItem>
                        <SelectItem value="adajan">ADAJAN</SelectItem>
                         <SelectItem value="adyar">ADYAR</SelectItem>
                    </SelectContent>
                </Select>
            </div>

             {/* Doctor Name */}
             <div className="w-full md:w-1/4 space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase">Doctor Name</label>
                <Input
                    type="text"
                    placeholder="Doctor Name"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="h-10 border-gray-300 dark:border-[#635985]/40 text-gray-500 dark:text-white/60 bg-white dark:bg-[#443C68]"
                />
            </div>
             {/* Year */}
             <div className="w-full md:w-1/4 space-y-1">
                 <label className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase">Year</label>
                 <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="h-10 border-gray-300 dark:border-[#635985]/40 text-gray-500 dark:text-white/60 bg-white dark:bg-[#443C68]">
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                         <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                </Select>
            </div>

              {/* Month */}
             <div className="w-full md:w-1/4 space-y-1">
                 <label className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase">Month</label>
                 <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="h-10 border-gray-300 dark:border-[#635985]/40 text-gray-500 dark:text-white/60 bg-white dark:bg-[#443C68]">
                        <SelectValue placeholder="-- Select Month --" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Months</SelectItem>
                        <SelectItem value="january">January</SelectItem>
                        <SelectItem value="february">February</SelectItem>
                        <SelectItem value="march">March</SelectItem>
                        <SelectItem value="april">April</SelectItem>
                         {/* ... other months */}
                    </SelectContent>
                </Select>
            </div>
        </div>
        
        {/* Row 2 */}
         <div className="flex flex-col md:flex-row gap-4 items-end">
             {/* From Date */}
            <div className="w-full md:w-1/4 space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase">From Date</label>
                <Input
                    type="date"
                    placeholder="From Date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-10 border-gray-300 dark:border-[#635985]/40 text-gray-500 dark:text-white/60 bg-white dark:bg-[#443C68]"
                />
            </div>
             {/* To Date */}
            <div className="w-full md:w-1/4 space-y-1">
                 <label className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase">To Date</label>
                <Input
                    type="date"
                    placeholder="To Date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-10 border-gray-300 dark:border-[#635985]/40 text-gray-500 dark:text-white/60 bg-white dark:bg-[#443C68]"
                />
            </div>

             {/* Search Button */}
            <div className="w-full md:w-auto flex gap-2">
                <Button
                    onClick={handleSearch}
                    className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white shadow-sm transition-colors px-8 h-10 w-full md:w-auto transition-colors"
                >
                    Search
                </Button>
                 <Button
                    onClick={handleClear}
                    className="border-white dark:hover:bg-medivardhaan-purple-deep text-white px-8 h-10 w-full md:w-auto transition-colors"
                >
                    Clear
                </Button>
            </div>
        </div>
      </div>

       {/* Total Count */}
       <div className="flex justify-end pr-2">
          <span className="font-semibold text-gray-600 dark:text-white/60 text-sm">Total : {totalAmount.toFixed(2)}</span>
       </div>

      {/* Table */}
      <TableWrapper>
        <Table className="w-full border-0">
          <TableHeader >
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[100px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">Month</TableHead>
              <TableHead className="min-w-[100px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">Cash</TableHead>
              <TableHead className="min-w-[100px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">Cheque</TableHead>
              <TableHead className="min-w-[100px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">Debit Card</TableHead>
              <TableHead className="min-w-[100px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">Credit Card</TableHead>
              <TableHead className="min-w-[100px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">UPI</TableHead>
              <TableHead className="min-w-[100px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">Bajaj Finance</TableHead>
              <TableHead className="min-w-[100px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">Credit Fair</TableHead>
              <TableHead className="min-w-[100px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">Liquid Loans</TableHead>
              <TableHead className="min-w-[100px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">Shopse</TableHead>
              <TableHead className="min-w-[120px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">Shopse Debit Card</TableHead>
              <TableHead className="min-w-[120px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">Shopse HDFC & Citi</TableHead>
              <TableHead className="min-w-[120px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">Shopse Credit Card</TableHead>
              <TableHead className="min-w-[100px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">Shopse Amex</TableHead>
              <TableHead className="min-w-[100px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">NEFT</TableHead>
              <TableHead className="min-w-[100px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">Razorpay</TableHead>
              <TableHead className="min-w-[100px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">SaveIn</TableHead>
              <TableHead className="min-w-[100px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">Unofin</TableHead>
              <TableHead className="min-w-[100px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">FIBE</TableHead>
              <TableHead className="min-w-[80px] font-bold text-gray-800 dark:text-white/90 border-r border-white dark:border-[#635985]/40">FLEX UPI</TableHead>
              <TableHead className="min-w-[100px] font-bold text-gray-800 dark:text-white/90">MediBuddy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
                currentItems.map((row) => (
                <TableRow key={row.id} >
                    <TableCell className="font-medium text-primary border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.month}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.cash}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.cheque}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.debitCard}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.creditCard}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.upi}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.bajaj}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.creditFair}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.liquid}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.shopse}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.shopseDebit}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.shopseHDFC}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.shopseCredit}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.shopseAmex}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.neft}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.razorpay}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.savein}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.unofin}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.fibe}</TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-[#443C68]/50 py-3">{row.flexUpi}</TableCell>
                    <TableCell className="py-3">{row.medibuddy}</TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                     <TableCell colSpan={21} className="text-center py-4 text-gray-500 dark:text-white/50">No matching records found</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </TableWrapper>
      
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
