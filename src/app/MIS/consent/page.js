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
import { Settings, Pencil, Eye, Trash2, User } from "lucide-react";
import { TableWrapper } from "@/components/shared/TableWrapper";

export default function ConsentPage() {
  const [filters, setFilters] = useState({
    patientName: "",
    clinic: "",
    fromDate: "",
    toDate: "",
  });

  // Mock Data
  const consentData = [
    {
      id: 1,
      date: "16-09-2025",
      clinic: "ADAJAN",
      name: "NIKITA RANE",
      treatment: "DENTAL IMPLANT-ALPHA BIO",
      guardian: "Ronak Shaikh",
      mobile: "8899999999",
    },
    {
      id: 2,
      date: "16-09-2025",
      clinic: "ADAJAN",
      name: "Nikita Kathimanda",
      treatment: "DENTAL IMPLANTS - NOBLE-BIOCARE ACTIVE",
      guardian: "Ronak Patel",
      mobile: "8899999999",
    },
    {
      id: 3,
      date: "22-09-2025",
      clinic: "ADAJAN",
      name: "mehul RanaTEST",
      treatment: "DENTAL IMPLANTS - BIOLINE",
      guardian: "Ronak Patel",
      mobile: "8899999999",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 text-primary mb-8 border-b border-border pb-4">
        <User className="w-5 h-5 text-medivardaan-teal dark:text-medivardaan-purple" />
        <h1 className="text-xl font-bold tracking-tight text-medivardaan-teal dark:text-medivardaan-purple uppercase">
          Consent Details List
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
                setFilters({ ...filters, patientName: e.target.value })
              }
              className="bg-background w-full"
            />
          </div>

          <div className="space-y-2">
            <Select
              value={filters.clinic}
              onValueChange={(v) => setFilters({ ...filters, clinic: v })}
            >
              <SelectTrigger className="bg-background w-full">
                <SelectValue placeholder="-- Select Clinic --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADAJAN">ADAJAN</SelectItem>
                <SelectItem value="Karve Road">Karve Road</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters({ ...filters, fromDate: e.target.value })
              }
              className="bg-background w-full"
            />
          </div>

          <div className="space-y-2">
            <Input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
              className="bg-background w-full"
            />
          </div>

          <div className="space-y-2">
            <Button className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white shadow-sm transition-colors px-6 w-full">
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Total Count & Add Button */}
      <div className="flex justify-between items-center">
        <Button className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white shadow-sm transition-colors px-6">
          Add New Consent
        </Button>
        <div className="font-semibold text-foreground">
          Total : {consentData.length}
        </div>
      </div>

      {/* Table */}
      <TableWrapper>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-0">
            <thead >
              <tr>
                <th className="p-4 w-16">Sr. No.</th>
                <th className="p-4 w-32">Date</th>
                <th className="p-4 w-32">Clinic Name</th>
                <th className="p-4">Name</th>
                <th className="p-4 min-w-[200px]">Treatment Name</th>
                <th className="p-4">Guardian Name</th>
                <th className="p-4">Guardian Mobile</th>
                <th className="p-4 text-center w-24">#</th>
              </tr>
            </thead>
            <tbody >
              {consentData.map((row) => (
                <tr
                  key={row.id}
                  
                >
                  <td className="p-4 font-medium text-foreground">{row.id}</td>
                  <td className="p-4 text-foreground">{row.date}</td>
                  <td className="p-4 text-foreground">{row.clinic}</td>
                  <td className="p-4 text-foreground">{row.name}</td>
                  <td className="p-4 text-foreground">{row.treatment}</td>
                  <td className="p-4 text-foreground">{row.guardian}</td>
                  <td className="p-4 text-foreground">{row.mobile}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-white/60 dark:hover:text-blue-400">
                        <Pencil className="w-4 h-4 border border-gray-400 dark:border-white/40 rounded p-[1px]" />
                      </button>
                      <button className="text-gray-600 dark:text-white/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Eye className="w-4 h-4 border border-gray-400 dark:border-white/40 rounded p-[1px]" />
                      </button>
                      <button className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-white/60 dark:hover:text-red-400">
                        <Trash2 className="w-4 h-4 border border-gray-400 dark:border-white/40 rounded p-[1px]" />
                      </button>
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
