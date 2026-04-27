"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, User } from "lucide-react";
import { TableWrapper } from "@/components/shared/TableWrapper";

export default function RepeatPatientReportPage() {
  const [filters, setFilters] = useState({
    clinic: "",
    doctorName: "",
    fromDate: "2025-12-24",
    toDate: "2025-12-24",
  });

  // Mock Data
  const reportData = [
    {
      srNo: 1,
      patientNo: "P113628",
      name: "Neha Jawalkar",
      mobile: "7823846589",
      date: "24-Dec-2025",
      clinic: "Karve Road",
    },
    {
      srNo: 2,
      patientNo: "P114022",
      name: "Sumathi Rajkumar",
      mobile: "8095939042",
      date: "24-Dec-2025",
      clinic: "KALYAN NAGAR",
    },
    {
      srNo: 3,
      patientNo: "P114020",
      name: "Naresh Palkar",
      mobile: "8380020865",
      date: "24-Dec-2025",
      clinic: "Karve Road",
    },
    {
      srNo: 4,
      patientNo: "P48725",
      name: "lalit nagda",
      mobile: "9867943770",
      date: "24-Dec-2025",
      clinic: "Goregaon West",
    },
    {
      srNo: 5,
      patientNo: "P113928",
      name: "Abhishek jayaraman J",
      mobile: "9969374545",
      date: "24-Dec-2025",
      clinic: "TRICHY",
    },
    {
      srNo: 6,
      patientNo: "P113965",
      name: "Tanya Madhani",
      mobile: "2487788628",
      date: "23-Dec-2025",
      clinic: "Vile-Parle east",
    },
    {
      srNo: 7,
      patientNo: "P113936",
      name: "Fatima Banu",
      mobile: "6006836346",
      date: "23-Dec-2025",
      clinic: "Hoodi",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 text-primary mb-8 border-b border-border pb-4">
        <User className="w-5 h-5 text-medivardaan-teal" />
        <h1 className="text-xl font-bold tracking-tight text-medivardaan-teal uppercase">
          Repeat Patient Report
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        {/* Responsive Grid: 1 col mobile, 2 col tablet, 5 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <Select
              value={filters.clinic}
              onValueChange={(v) => setFilters({ ...filters, clinic: v })}
            >
              <SelectTrigger className="bg-background border-input w-full">
                <SelectValue placeholder="-- Select Clinic --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Karve Road">Karve Road</SelectItem>
                <SelectItem value="KALYAN NAGAR">KALYAN NAGAR</SelectItem>
                <SelectItem value="Goregaon West">Goregaon West</SelectItem>
                <SelectItem value="TRICHY">TRICHY</SelectItem>
                <SelectItem value="Vile-Parle east">Vile-Parle east</SelectItem>
                <SelectItem value="Hoodi">Hoodi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Doctor Name"
              value={filters.doctorName}
              onChange={(e) =>
                setFilters({ ...filters, doctorName: e.target.value })
              }
              className="bg-background border-input w-full"
            />
          </div>

          <div className="space-y-2">
            <Input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters({ ...filters, fromDate: e.target.value })
              }
              className="bg-background border-input w-full"
            />
          </div>

          <div className="space-y-2">
            <Input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
              className="bg-background border-input w-full"
            />
          </div>

          <Button className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white shadow-sm transition-colors w-full">
            Search
          </Button>
        </div>
      </div>

      {/* Total Count */}
      <div className="flex justify-end font-semibold text-foreground">
        Total : {reportData.length}
      </div>

      {/* Table */}
      <TableWrapper>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-0">
            <thead >
              <tr>
                <th className="p-4 w-16">Sr No.</th>
                <th className="p-4">Patient No</th>
                <th className="p-4">Patient Name</th>
                <th className="p-4 hidden md:table-cell">Mobile No</th>
                <th className="p-4 hidden md:table-cell">Date</th>
                <th className="p-4 hidden md:table-cell">Clinic</th>
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
                  <td className="p-4 font-medium text-primary dark:text-white">
                    {row.patientNo}
                  </td>
                  <td className="p-4">{row.name}</td>
                  <td className="p-4 hidden md:table-cell">{row.mobile}</td>
                  <td className="p-4 hidden md:table-cell">{row.date}</td>
                  <td className="p-4 hidden md:table-cell">{row.clinic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  );
}
