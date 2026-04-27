"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Stethoscope, FileText, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableWrapper } from "@/components/shared/TableWrapper";

export default function VisitorPage() {
  const [filters, setFilters] = useState({
    clinic: "",
    patientName: "",
    patientNo: "",
    mobileNo: "",
    fromDate: "",
    toDate: "",
  });

  // Mock Data
  const reportData = [
    {
      srNo: 1,
      patientNo: "P111067",
      name: "Dilip bhai Makwana",
      mobile: "7802848821",
      regDate: "30-Oct-2025",
    },
    {
      srNo: 2,
      patientNo: "P110898",
      name: "Nency Sitapara",
      mobile: "9898548612",
      regDate: "29-Oct-2025",
    },
    {
      srNo: 3,
      patientNo: "P110852",
      name: "Dipak Patel",
      mobile: "9861332888",
      regDate: "28-Oct-2025",
    },
    {
      srNo: 4,
      patientNo: "P110809",
      name: "Sakina Talvari",
      mobile: "9173686783",
      regDate: "27-Oct-2025",
    },
    {
      srNo: 5,
      patientNo: "P110787",
      name: "Pravina Thakkar",
      mobile: "9033710111",
      regDate: "27-Oct-2025",
    },
    {
      srNo: 6,
      patientNo: "P110629",
      name: "Raju Bhutiya",
      mobile: "9327083933",
      regDate: "24-Oct-2025",
    },
    {
      srNo: 7,
      patientNo: "P110565",
      name: "Deepthi",
      mobile: "9164028402",
      regDate: "23-Oct-2025",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 text-primary mb-8 border-b border-border pb-4">
        <User className="w-5 h-5 text-medivardaan-teal" />
        <h1 className="text-xl font-bold tracking-tight text-medivardaan-teal uppercase">
          Visitor
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Input
              placeholder="Patient Name"
              value={filters.patientName}
              onChange={(e) =>
                handleFilterChange("patientName", e.target.value)
              }
              className="bg-background border-input w-full"
            />
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Patient No"
              value={filters.patientNo}
              onChange={(e) => handleFilterChange("patientNo", e.target.value)}
              className="bg-background border-input w-full"
            />
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Mobile No"
              value={filters.mobileNo}
              onChange={(e) => handleFilterChange("mobileNo", e.target.value)}
              className="bg-background border-input w-full"
            />
          </div>

          <div className="space-y-2">
            <Select
              value={filters.clinic}
              onValueChange={(v) => handleFilterChange("clinic", v)}
            >
              <SelectTrigger className="bg-background border-input w-full">
                <SelectValue placeholder="-- Select Clinic --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Karve Road">Karve Road</SelectItem>
                <SelectItem value="KALYAN NAGAR">KALYAN NAGAR</SelectItem>
                <SelectItem value="Ramdaspeth">Ramdaspeth</SelectItem>
                <SelectItem value="Vytilla">Vytilla</SelectItem>
                <SelectItem value="Ambernath">Ambernath</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Input
              type="date"
              placeholder="From Date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              className="bg-background border-input w-full"
            />
          </div>

          <div className="space-y-2">
            <Input
              type="date"
              placeholder="To Date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange("toDate", e.target.value)}
              className="bg-background border-input w-full"
            />
          </div>

          <div className="space-y-2">
            <Button className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white shadow-sm transition-colors w-full">
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Total Count */}
      <div className="flex justify-end font-semibold text-foreground">
        Total : {94}
      </div>

      {/* Table */}
      <TableWrapper>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead >
              <tr>
                <th className="p-4 w-16">Sr. No.</th>
                <th className="p-4">Patient No</th>
                <th className="p-4">Name</th>
                <th className="p-4 hidden md:table-cell">Mobile No</th>
                <th className="p-4 hidden md:table-cell">Registration Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody >
              {reportData.map((row) => (
                <tr
                  key={row.srNo}
                  
                >
                  <td className="p-4 font-medium text-foreground">
                    {row.srNo}
                  </td>
                  {/* Plain Text Patient ID as requested */}
                  <td className="p-4 font-bold text-primary dark:text-white">
                    {row.patientNo}
                  </td>
                  <td className="p-4 text-foreground">{row.name}</td>
                  <td className="p-4 hidden md:table-cell text-foreground">
                    {row.mobile}
                  </td>
                  <td className="p-4 hidden md:table-cell text-foreground">
                    {row.regDate}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-row gap-2 justify-center items-center">
                      <TooltipProvider>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Link href="/MIS/consultation">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 dark:border-blue-800"
                              >
                                <Stethoscope className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Consultation</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Link href="/MIS/generate-invoice">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/30 dark:border-green-800"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Generate Invoice</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  );
}
