"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, User } from "lucide-react";
import { TableWrapper } from "@/components/shared/TableWrapper";

export default function PatientMergeDeletePage() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [showSelection, setShowSelection] = useState(false);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 text-primary mb-8 border-b border-border pb-4">
        <User className="w-5 h-5 text-medivardaan-teal" />
        <h1 className="text-xl font-bold tracking-tight text-medivardaan-teal uppercase">
          Patients Merge And Delete
        </h1>
      </div>

      {/* Search Section */}
      <div className="bg-card rounded-xl p-6 shadow-md border border-border/50">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Search Patient
        </label>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-3 w-full md:max-w-xl">
            <Input
              placeholder="Enter Mobile Number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="h-10 uppercase tracking-wide bg-background"
            />
            <Button className="h-10 bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white shadow-sm transition-colors px-6 shadow-sm">
              Search
            </Button>
          </div>
          <div className="text-sm font-medium text-muted-foreground bg-muted/30 px-4 py-2 rounded-md">
            Total Records:{" "}
            <span className="text-foreground font-bold ml-1">0</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-card rounded-xl border border-border/50 shadow-md min-h-[400px] flex flex-col overflow-hidden">
        {/* Action Toolbar */}
        <div className="py-4 px-6 bg-muted/20 border-b border-border flex justify-center sticky top-0 bg-opacity-95 backdrop-blur">
          {!showSelection ? (
            <Button
              onClick={() => setShowSelection(true)}
              className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardan-purple dark:hover:bg-[#7165A8] text-white px-8 shadow-sm transition-all hover:scale-105"
            >
              Select Patients to Merge
            </Button>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              Select records below to Proceed
            </span>
          )}
        </div>

        {/* content */}
        <div className="flex-grow p-6">
          {!showSelection ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4 min-h-[300px]">
              <Settings className="w-16 h-16 stroke-1" />
              <p className="text-lg">
                Search and Select patients to begin merging
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
              {/* Left Side: Keep */}
              <div className="flex flex-col h-full rounded-lg border border-border overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4 bg-green-50/50 dark:bg-green-900/10 border-b border-green-100 dark:border-green-900/20">
                  <h3 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Primary Record (To Keep)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select the final patient record to retain
                  </p>
                </div>
                <div className="p-6 flex-grow flex items-center justify-center bg-gray-50/50 dark:bg-transparent">
                  <div className="text-center text-muted-foreground">
                    <span className="block text-sm">
                      No Primary Record Selected
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Merge */}
              <div className="flex flex-col h-full rounded-lg border border-border overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4 bg-orange-50/50 dark:bg-orange-900/10 border-b border-orange-100 dark:border-orange-900/20">
                  <h3 className="font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Secondary Records (To Merge)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select records to merge into primary
                  </p>
                </div>
                <TableWrapper className="flex-grow rounded-none border-0 shadow-none border-t border-border">
                  <table className="w-full text-sm text-left border-0">
                    <thead >
                      <tr>
                        <th className="p-3 font-medium">Sr. No.</th>
                        <th className="p-3 font-medium">Patient Id</th>
                        <th className="p-3 font-medium">Name</th>
                        <th className="p-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          colSpan={4}
                          className="p-8 text-center text-muted-foreground italic border-0"
                        >
                          No records available for merging
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </TableWrapper>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {showSelection && (
          <div className="p-6 bg-muted/20 border-t border-border flex justify-end gap-3 animated-in slide-in-from-bottom-2">
            <Button
              variant="outline"
              onClick={() => setShowSelection(false)}
              className="border-primary/30 text-primary hover:bg-primary/10 hover:text-[#0b5c7a]"
            >
              Cancel
            </Button>
            <Button className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white shadow-sm transition-colors px-8 shadow-sm">
              Confirm Merge
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
