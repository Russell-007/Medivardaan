"use client";

import { useState, useEffect } from "react";
import { Calendar, Check, Loader2, Search, X } from "lucide-react";
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
import {
  getAppointments,
  normalizeAppointment,
  normalizeAppointmentStatus,
} from "@/api/appointments";
import { Pagination } from "@/components/Pagination";
import { Card, CardContent } from "@/components/ui/card";
import { TableWrapper } from "@/components/shared/TableWrapper";
import { useClinics } from "@/hooks/useClinics";
import { useDoctors } from "@/hooks/useDoctors";

export default function AllAppointmentsListPage() {
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [visitorName, setVisitorName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [selectedClinic, setSelectedClinic] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Master Data Hooks
  const { data: clinics = [], isLoading: loadingClinics } = useClinics();
  const { data: doctors = [], isLoading: loadingDoctors } = useDoctors();

  // Fetch Appointments
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        Mode: "1",
        DoctorID:
          selectedDoctor !== "all" && selectedDoctor !== "0"
            ? selectedDoctor
            : undefined,
      };

      const data = await getAppointments(params);
      const appointmentList = Array.isArray(data)
        ? data
        : data?.data || data?.appointments || [];

      setAppointments(Array.isArray(appointmentList) ? appointmentList : []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err.message);
      setAppointments([]);
      setError("Failed to load appointments from the API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleApprove = async (appointmentId) => {
    try {
      // Optimistic UI Update
      const updatedAppointments = appointments.map((apt) =>
        apt.AppointmentID === appointmentId ||
        apt.appointmentId === appointmentId ||
        apt.id === appointmentId
          ? { ...apt, Status: "approved", status: "approved" }
          : apt,
      );
      setAppointments(updatedAppointments);

      // Find the appointment to update backend (if needed)
      // Note: Assuming upsertAppointment handles status update.
      // We might need to fetch the full object first or send just ID and Status if API supports it.
      // For now, let's keep it client-side optimistic + filter logic working.

      // If API integration is strictly required, uncomment below:
      /*
        const aptToUpdate = appointments.find(a => a.AppointmentID === appointmentId);
        if (aptToUpdate) {
            await upsertAppointment({ ...aptToUpdate, Status: 'approved' });
        }
        */

      console.log("Approved:", appointmentId);
    } catch (error) {
      console.error("Failed to approve:", error);
      // Revert on error would go here
    }
  };

  const handleReject = async (appointmentId) => {
    try {
      // Optimistic UI Update
      const updatedAppointments = appointments.map((apt) =>
        apt.AppointmentID === appointmentId ||
        apt.appointmentId === appointmentId ||
        apt.id === appointmentId
          ? { ...apt, Status: "rejected", status: "rejected" }
          : apt,
      );
      setAppointments(updatedAppointments);

      console.log("Rejected:", appointmentId);
    } catch (error) {
      console.error("Failed to reject:", error);
    }
  };

  const handleSearch = () => {
    fetchAppointments();
    setCurrentPage(1);
  };

  const doctorLookup = new Map(
    doctors.map((doctor) => [
      String(doctor.doctorID || doctor.DoctorID || ""),
      doctor.name || doctor.doctorName || doctor.DoctorName || "",
    ]),
  );

  const clinicLookup = new Map(
    clinics.map((clinic) => [
      String(clinic.clinicID || clinic.ClinicID || ""),
      clinic.clinicName || clinic.ClinicName || "",
    ]),
  );

  const normalizedAppointments = appointments.map((appointment) => {
    const normalized = normalizeAppointment(appointment);
    const appointmentId =
      appointment.AppointmentID ||
      appointment.appointmentId ||
      appointment.id ||
      null;
    const doctorId = appointment.doctorID || appointment.DoctorID || null;
    const clinicId = appointment.clinicID || appointment.ClinicID || null;
    const clinicName =
      appointment.clinicName ||
      appointment.ClinicName ||
      clinicLookup.get(String(clinicId || "")) ||
      "N/A";
    const doctorName =
      normalized.doctor ||
      doctorLookup.get(String(doctorId || "")) ||
      (doctorId ? `Dr. ID ${doctorId}` : "N/A");
    const rawDate = normalized.appointmentDate || "";
    const parsedDate = rawDate ? new Date(rawDate) : null;

    return {
      ...appointment,
      ...normalized,
      id: appointmentId,
      doctorId: doctorId ? String(doctorId) : "",
      clinicId: clinicId ? String(clinicId) : "",
      clinicName,
      doctorName,
      mobileNo: normalized.mobileNo || appointment.mobileNo1 || "",
      date:
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? parsedDate.toLocaleDateString()
          : "N/A",
      dateValue:
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? new Date(
              parsedDate.getFullYear(),
              parsedDate.getMonth(),
              parsedDate.getDate(),
            )
          : null,
      time:
        appointment.TimeSlot ||
        appointment.AppointmentTime ||
        appointment.appointmentTime ||
        appointment.startTime ||
        "N/A",
      status: normalizeAppointmentStatus(
        appointment.status ??
          appointment.Status ??
          appointment.appointmentStatus ??
          appointment.AppointmentStatus,
        appointment.isPatientsConfirmed ?? appointment.IsPatientsConfirmed,
      ),
    };
  });

  // Client-side Filtering
  const filteredAppointments = normalizedAppointments.filter((apt) => {
    // 1. Approval Filter
    if (approvalFilter !== "all") {
      const status = apt.status;
      if (approvalFilter === "approve" && status !== "approved") return false;
      if (approvalFilter === "reject" && status !== "rejected") return false;
    }

    // 2. Name Search
    if (visitorName) {
      const term = visitorName.toLowerCase();
      const name = (apt.patientName || "").toLowerCase();
      const docName = (apt.doctorName || "").toLowerCase();
      if (!name.includes(term) && !docName.includes(term)) return false;
    }

    // 3. Mobile Search
    if (mobileNo) {
      const term = String(mobileNo);
      const mobile = String(apt.mobileNo || "");
      if (!mobile.includes(term)) return false;
    }

    // 4. Clinic Filter
    if (selectedClinic !== "all") {
      const clinic = (apt.clinicName || "").toLowerCase();
      if (!clinic.includes(selectedClinic.toLowerCase())) return false;
    }

    // 5. Date Range Filter
    if (fromDate || toDate) {
      if (!apt.dateValue) return false;
      const checkDate = apt.dateValue;

      if (fromDate) {
        const fDate = new Date(fromDate);
        const fromCheck = new Date(
          fDate.getFullYear(),
          fDate.getMonth(),
          fDate.getDate(),
        );
        if (checkDate < fromCheck) return false;
      }

      if (toDate) {
        const tDate = new Date(toDate);
        const toCheck = new Date(
          tDate.getFullYear(),
          tDate.getMonth(),
          tDate.getDate(),
        );
        if (checkDate > toCheck) return false;
      }
    }

    return true;
  });

  // Client-side Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAppointments.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#18122B] pb-8 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-[#443C68]/50">
          <div className="p-2 rounded-lg bg-primary/10 dark:bg-white/15">
            <Calendar className="w-5 h-5 text-primary dark:text-[#3aaecb]" />
          </div>
          <h1 className="text-xl font-bold text-medivardaan-teal uppercase tracking-wide">
            All Appointment List
          </h1>
        </div>

        <Card className="border border-gray-200 dark:border-[#443C68]/50 shadow-sm bg-white dark:bg-[#18122B]">
          <CardContent className="p-6">
            {/* Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80 dark:text-white/75">
                  Visitor Name
                </Label>
                <Input
                  placeholder="Search by name..."
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="h-10 w-full bg-white dark:bg-[#18122B] border-gray-300 dark:border-[#635985]/40"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80">
                  Mobile Number
                </Label>
                <Input
                  placeholder="Search by mobile..."
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  className="h-10 w-full bg-white dark:bg-[#18122B] border-gray-300 dark:border-[#635985]/40"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80">
                  Clinic
                </Label>
                <Select
                  value={selectedClinic}
                  onValueChange={setSelectedClinic}
                >
                  <SelectTrigger className="h-10 w-full bg-white dark:bg-[#18122B] border-gray-300 dark:border-[#635985]/40">
                    <SelectValue placeholder="Select Clinic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clinics</SelectItem>
                    {loadingClinics ? (
                      <SelectItem value="loading" disabled>
                        Loading clinics...
                      </SelectItem>
                    ) : clinics.length > 0 ? (
                      Array.from(
                        new Map(clinics.map((c) => [c.clinicName, c])).values(),
                      ).map((c, index) => (
                        <SelectItem
                          key={`clinic-${c.clinicID || index}-${c.clinicName}`}
                          value={c.clinicName.toLowerCase()}
                        >
                          {c.clinicName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        No clinics available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground/80">
                  Doctor
                </Label>
                <Select
                  value={selectedDoctor}
                  onValueChange={setSelectedDoctor}
                >
                  <SelectTrigger className="h-10 w-full bg-white dark:bg-[#18122B] border-gray-300 dark:border-[#635985]/40">
                    <SelectValue placeholder="Select Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {loadingDoctors ? (
                      <SelectItem value="loading" disabled>
                        Loading doctors...
                      </SelectItem>
                    ) : doctors.length > 0 ? (
                      Array.from(
                        new Map(doctors.map((d) => [d.name, d])).values(),
                      ).map((doc, index) => (
                        <SelectItem
                          key={`doc-${doc.doctorID || index}-${doc.name}`}
                          value={String(doc.doctorID || doc.DoctorID)}
                        >
                          {doc.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        No doctors available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Radio Buttons and Date Filters */}
            <div className="flex flex-col lg:flex-row items-end gap-6 mb-8">
              <div className="flex gap-6 items-center flex-grow">
                <div className="flex items-center space-x-2 bg-gray-50 dark:bg-[#18122B]/50 p-2 rounded-lg border border-gray-200 dark:border-[#443C68]/50">
                  <label className="flex items-center gap-2 cursor-pointer px-3 py-1 hover:bg-gray-100 dark:bg-[#393053] dark:hover:bg-[#393053] rounded-md transition-colors">
                    <input
                      type="radio"
                      name="approvalStatus"
                      value="all"
                      checked={approvalFilter === "all"}
                      onChange={(e) => setApprovalFilter(e.target.value)}
                      className="w-4 h-4 cursor-pointer accent-primary"
                    />
                    <span className="text-sm font-medium">All</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer px-3 py-1 hover:bg-gray-100 dark:bg-[#393053] dark:hover:bg-[#393053] rounded-md transition-colors">
                    <input
                      type="radio"
                      name="approvalStatus"
                      value="approve"
                      checked={approvalFilter === "approve"}
                      onChange={(e) => setApprovalFilter(e.target.value)}
                      className="w-4 h-4 cursor-pointer accent-primary"
                    />
                    <span className="text-sm font-medium">Approved</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer px-3 py-1 hover:bg-gray-100 dark:bg-[#393053] dark:hover:bg-[#393053] rounded-md transition-colors">
                    <input
                      type="radio"
                      name="approvalStatus"
                      value="reject"
                      checked={approvalFilter === "reject"}
                      onChange={(e) => setApprovalFilter(e.target.value)}
                      className="w-4 h-4 cursor-pointer accent-primary"
                    />
                    <span className="text-sm font-medium">Rejected</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 w-full lg:w-auto">
                <div className="space-y-2 w-full sm:w-40">
                  <Label className="text-sm font-medium text-foreground/80">
                    From Date
                  </Label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-10 w-full bg-white dark:bg-[#18122B] border-gray-300 dark:border-[#635985]/40"
                  />
                </div>

                <div className="space-y-2 w-full sm:w-40">
                  <Label className="text-sm font-medium text-foreground/80">
                    To Date
                  </Label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-10 w-full bg-white dark:bg-[#18122B] border-gray-300 dark:border-[#635985]/40"
                  />
                </div>
              </div>

              <Button
                onClick={handleSearch}
                className="h-10 bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white shadow-sm transition-colors px-8"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Appointments Table */}
            <TableWrapper>
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
                  Loading appointments...
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">{error}</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left">
                        Sr. No.
                      </th>
                      <th className="px-4 py-3 text-left">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left">
                        Doctor Name
                      </th>
                      <th className="px-4 py-3 text-left">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left">
                        Time
                      </th>
                      <th className="px-4 py-3 text-center">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((appointment, index) => (
                        <tr
                          key={appointment.id || index}
                          
                        >
                          <td className="px-4 py-3 text-sm">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {appointment.patientName || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {appointment.doctorName}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {appointment.date}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {appointment.time}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center">
                              {appointment.status === "approved" ? (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Approved
                                </span>
                              ) : appointment.status === "rejected" ? (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                                  <X className="w-3 h-3" />
                                  Rejected
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                  {appointment.status}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleApprove(appointment.id)}
                                className="p-1.5 rounded-full bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(appointment.id)}
                                className="p-1.5 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
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
                          No appointments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </TableWrapper>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
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
