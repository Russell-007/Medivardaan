"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, User } from "lucide-react";
import { TableWrapper } from "@/components/shared/TableWrapper";

export default function PatientClinicTransferPage() {
  const [filters, setFilters] = useState({
    clinic: "",
    patientName: "",
    patientNo: "",
    mobileNo: "",
    fromDate: "",
    toDate: "",
    targetClinic: "",
  });

  // Mock Data
  const reportData = [
    {
      srNo: 1,
      patientNo: "P114022",
      casePaperNo: "64232",
      name: "Sumathi Rajkumar",
      mobile: "8095939042",
      regDate: "24-Dec-2025",
      clinic: "KALYAN NAGAR",
    },
    {
      srNo: 2,
      patientNo: "P114021",
      casePaperNo: "",
      name: "Kanara Chaudhari",
      mobile: "9969361250",
      regDate: "24-Dec-2025",
      clinic: "Karve Road",
    },
    {
      srNo: 3,
      patientNo: "P114020",
      casePaperNo: "",
      name: "Naresh Palkar",
      mobile: "8380020865",
      regDate: "24-Dec-2025",
      clinic: "Karve Road",
    },
    {
      srNo: 4,
      patientNo: "P114019",
      casePaperNo: "",
      name: "Kuldeep Modanwal",
      mobile: "9284793237",
      regDate: "24-Dec-2025",
      clinic: "Karve Road",
    },
    {
      srNo: 5,
      patientNo: "P114018",
      casePaperNo: "",
      name: "Saket Panchbhai",
      mobile: "8793773670",
      regDate: "23-Dec-2025",
      clinic: "Ramdaspeth",
    },
    {
      srNo: 6,
      patientNo: "P114017",
      casePaperNo: "72757",
      name: "fathima iqbal",
      mobile: "8129345611",
      regDate: "23-Dec-2025",
      clinic: "Vytilla",
    },
    {
      srNo: 7,
      patientNo: "P114016",
      casePaperNo: "72755",
      name: "safin sadique",
      mobile: "7025453333",
      regDate: "05-Dec-2025",
      clinic: "Vytilla",
    },
    {
      srNo: 8,
      patientNo: "P114015",
      casePaperNo: "72758",
      name: "greenmol v a",
      mobile: "9633379889",
      regDate: "05-Dec-2025",
      clinic: "Vytilla",
    },
    {
      srNo: 9,
      patientNo: "P114014",
      casePaperNo: "71465",
      name: "siddharth raut",
      mobile: "9284275756",
      regDate: "23-Dec-2025",
      clinic: "Ambernath",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 text-primary mb-8 border-b border-border pb-4">
        <User className="w-5 h-5 text-medivardaan-teal" />
        <h1 className="text-xl font-bold tracking-tight text-medivardaan-teal uppercase">
          Patient Clinic Transfer
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
                <SelectItem value="Ramdaspeth">Ramdaspeth</SelectItem>
                <SelectItem value="Vytilla">Vytilla</SelectItem>
                <SelectItem value="Ambernath">Ambernath</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Patient Name"
              value={filters.patientName}
              onChange={(e) =>
                setFilters({ ...filters, patientName: e.target.value })
              }
              className="bg-background border-input w-full"
            />
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Patient No"
              value={filters.patientNo}
              onChange={(e) =>
                setFilters({ ...filters, patientNo: e.target.value })
              }
              className="bg-background border-input w-full"
            />
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Mobile No"
              value={filters.mobileNo}
              onChange={(e) =>
                setFilters({ ...filters, mobileNo: e.target.value })
              }
              className="bg-background border-input w-full"
            />
          </div>

          <div className="space-y-2">
            <Input
              type="date"
              placeholder="From Date"
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
              placeholder="To Date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
              className="bg-background border-input w-full"
            />
          </div>

          <Button className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white w-full shadow-sm transition-colors">
            Search
          </Button>
        </div>
      </div>

      {/* Total Count */}
      <div className="flex justify-end font-semibold text-foreground">
        Total : {110685}
      </div>

      {/* Table */}
      <TableWrapper>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-0">
            <thead >
              <tr>
                <th className="p-4 w-10">
                  <Checkbox />
                </th>
                <th className="p-4 w-16">Sr. No.</th>
                <th className="p-4">Patient No</th>
                <th className="p-4">Case Paper No.</th>
                <th className="p-4">Name</th>
                <th className="p-4 hidden md:table-cell">Mobile No</th>
                <th className="p-4 hidden md:table-cell">Registration Date</th>
                <th className="p-4 hidden md:table-cell">Clinic Name</th>
              </tr>
            </thead>
            <tbody >
              {reportData.map((row) => (
                <tr
                  key={row.srNo}
                  
                >
                  <td className="p-4">
                    <Checkbox />
                  </td>
                  <td className="p-4 font-medium text-foreground">
                    {row.srNo}
                  </td>
                  <td className="p-4 font-medium text-primary">
                    {row.patientNo}
                  </td>
                  <td className="p-4 text-foreground">
                    {row.casePaperNo || ""}
                  </td>
                  <td className="p-4 text-foreground">{row.name}</td>
                  <td className="p-4 hidden md:table-cell text-foreground">
                    {row.mobile}
                  </td>
                  <td className="p-4 hidden md:table-cell text-foreground">
                    {row.regDate}
                  </td>
                  <td className="p-4 hidden md:table-cell text-foreground">
                    {row.clinic}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableWrapper>

      {/* Transfer Action Section */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm mt-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-1/3">
            <Select
              value={filters.targetClinic}
              onValueChange={(v) => setFilters({ ...filters, targetClinic: v })}
            >
              <SelectTrigger className="bg-background border-input w-full">
                <SelectValue placeholder="-- Select Target Clinic --" />
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

          <div className="flex justify-center w-full md:w-auto">
            <Button className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white px-12 shadow-sm transition-colors">
              Submit
            </Button>
          </div>

          {/* Spacer for centering if needed, or just let them spread */}
          <div className="hidden md:block w-1/3"></div>
        </div>
      </div>
    </div>
  );
}
