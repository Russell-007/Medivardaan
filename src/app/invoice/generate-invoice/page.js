"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Plus, Receipt, Trash2, User, Stethoscope, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { TableWrapper } from "@/components/shared/TableWrapper";
import { useClinics } from "@/hooks/useClinics";
import { addInvoice } from "@/api/invoices";

const TREATMENT_OPTIONS = [
  { id: 93, name: "Aligner Consultation", toothNo: "12", unit: 8, cost: 20000 },
  { id: 30, name: "Consultation", toothNo: "Full Mouth", unit: 1, cost: 1500 },
  { id: 167, name: "X-Ray", toothNo: "No Tooth", unit: 1, cost: 480 },
  { id: 101, name: "Scaling", toothNo: "Full Mouth", unit: 1, cost: 2500 },
  { id: 102, name: "Root Canal", toothNo: "26", unit: 1, cost: 4500 },
];

const createEmptyRow = (id) => ({
  id,
  treatmentId: "",
  toothNo: "",
  unit: 1,
  cost: 0,
  discount: 0,
  tax: 0,
});

const normalizePatient = (patient = {}) => {
  const patientId = patient.patientID || patient.PatientID || patient.patientId || patient.id || null;
  const firstName = patient.firstName || patient.fristName || patient.FirstName || "";
  const lastName = patient.lastName || patient.LastName || "";
  return {
    patientId,
    patientName: `${firstName} ${lastName}`.trim(),
    clinicId: patient.clinicID || patient.ClinicID || patient.clinicId || "",
    clinicName: patient.clinicName || patient.ClinicName || "",
    patientCode: patient.patientCode || patient.PatientCode || (patientId ? `P-${patientId}` : "N/A"),
  };
};

const formatCurrency = (value) =>
  `₹ ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function GenerateInvoicePage() {
  const [formData, setFormData] = useState({
    patientId: "",
    clinicId: "",
    doctorId: "",
    paymentDate: new Date().toISOString().split("T")[0],
    treatmentType: "Other",
  });
  const [rows, setRows] = useState([createEmptyRow(1)]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: clinics = [] } = useClinics();
  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ["generate-invoice-patients"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/Patient/GetAllPatients?PageSize=200", {
          cache: "no-store",
        });

        if (!response.ok) {
          return [];
        }

        const payload = await response.json();
        const data = Array.isArray(payload)
          ? payload
          : (payload?.data || payload?.result || []);

        return Array.isArray(data) ? data.map(normalizePatient) : [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
  const { data: doctors = [] } = useQuery({
    queryKey: ["generate-invoice-doctors", formData.clinicId],
    queryFn: async () => {
      try {
        const query = formData.clinicId ? `?ClinicID=${formData.clinicId}` : "";
        const response = await fetch(`/api/Doctor/search${query}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          return [];
        }
        const payload = await response.json();
        if (!Array.isArray(payload)) {
          return [];
        }
        return payload.map((doctor, index) => ({
          doctorID: doctor.doctorID || doctor.DoctorID || 0,
          clinicID: doctor.clinicID || doctor.ClinicID || "",
          name: `${doctor.title || ""} ${doctor.firstName || doctor.FirstName || ""} ${doctor.lastName || doctor.LastName || ""}`.trim() || `Doctor ${index + 1}`,
        }));
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const selectedPatient = useMemo(
    () => patients.find((patient) => String(patient.patientId) === String(formData.patientId)) || null,
    [patients, formData.patientId]
  );

  useEffect(() => {
    if (selectedPatient?.clinicId && !formData.clinicId) {
      setFormData((prev) => ({
        ...prev,
        clinicId: String(selectedPatient.clinicId),
      }));
    }
  }, [selectedPatient, formData.clinicId]);

  const totals = useMemo(() => {
    const totalCost = rows.reduce((sum, row) => sum + Number(row.cost || 0), 0);
    const totalDiscount = rows.reduce((sum, row) => sum + Number(row.discount || 0), 0);
    const totalTax = rows.reduce((sum, row) => sum + Number(row.tax || 0), 0);
    const grandTotal = Math.max(totalCost - totalDiscount + totalTax, 0);
    return { totalCost, totalDiscount, totalTax, grandTotal };
  }, [rows]);

  const filteredDoctors = useMemo(() => doctors, [doctors]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRowChange = (rowId, field, value) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        if (field !== "treatmentId") {
          return { ...row, [field]: value };
        }

        const treatment = TREATMENT_OPTIONS.find((item) => String(item.id) === String(value));
        return {
          ...row,
          treatmentId: value,
          toothNo: treatment?.toothNo || "",
          unit: treatment?.unit || 1,
          cost: treatment?.cost || 0,
        };
      })
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow((prev.at(-1)?.id || 0) + 1)]);
  };

  const deleteRow = (rowId) => {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.id !== rowId)));
  };

  const handleSubmit = async () => {
    if (!formData.patientId || !formData.clinicId || !formData.doctorId) {
      toast.error("Please select patient, clinic, and doctor.");
      return;
    }

    const validRows = rows.filter((row) => row.treatmentId && Number(row.cost) > 0);
    if (validRows.length === 0) {
      toast.error("Please add at least one treatment row.");
      return;
    }

    setIsSubmitting(true);
    try {
      for (const row of validRows) {
        const cost = Number(row.cost || 0);
        const discount = Number(row.discount || 0);
        const tax = Number(row.tax || 0);
        const netAmount = Math.max(cost - discount, 0);

        const payload = {
          invoiceID: 0,
          patientID: Number(formData.patientId),
          clinicID: Number(formData.clinicId),
          doctorID: Number(formData.doctorId),
          treatmentID: Number(row.treatmentId),
          toothNo: row.toothNo || "No Tooth",
          unit: Number(row.unit || 1),
          cost,
          discount,
          tax,
          totalCost: cost,
          totalDiscount: netAmount,
          totalCostAmount: discount,
          totalTax: tax,
          grandTotal: netAmount + tax,
          payDate: new Date(formData.paymentDate).toISOString(),
          payMode: formData.treatmentType,
          statusOfTretment: formData.treatmentType,
        };

        await addInvoice(payload);
      }

      toast.success("Invoice generated successfully.");
      setFormData({
        patientId: "",
        clinicId: "",
        doctorId: "",
        paymentDate: new Date().toISOString().split("T")[0],
        treatmentType: "Other",
      });
      setRows([createEmptyRow(1)]);
    } catch (error) {
      toast.error(error?.response?.data?.Message || "Failed to generate invoice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6 space-y-8 min-h-screen bg-white dark:bg-[#18122B]">
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-[#443C68]/50 pb-4">
        <Receipt className="w-5 h-5 text-medivardaan-teal" />
        <h1 className="text-xl font-bold text-medivardaan-teal uppercase tracking-wide">
          Generate Invoice
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-gray-200 dark:border-[#443C68]/50 shadow-sm bg-white dark:bg-[#18122B]">
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-white/75 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500 dark:text-white/50" /> Patient Name
                  </Label>
                  <Select
                    value={formData.patientId}
                    onValueChange={(value) => handleFormChange("patientId", value)}
                  >
                    <SelectTrigger className="h-10 bg-white dark:bg-[#443C68] border-gray-300 dark:border-[#635985]/40">
                      <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Select Patient"} />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.patientId} value={String(patient.patientId)}>
                          {patient.patientName || patient.patientCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-white/75 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500 dark:text-white/50" /> Payment Date
                  </Label>
                  <Input
                    type="date"
                    className="h-10 bg-white dark:bg-[#443C68] border-gray-300 dark:border-[#635985]/40"
                    value={formData.paymentDate}
                    onChange={(e) => handleFormChange("paymentDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-white/75 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-gray-500 dark:text-white/50" /> Clinic Name
                  </Label>
                  <Select
                    value={formData.clinicId}
                    onValueChange={(value) => handleFormChange("clinicId", value)}
                  >
                    <SelectTrigger className="h-10 bg-white dark:bg-[#443C68] border-gray-300 dark:border-[#635985]/40">
                      <SelectValue placeholder="Select Clinic" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinics.map((clinic) => (
                        <SelectItem
                          key={clinic.clinicID || clinic.clinicId}
                          value={String(clinic.clinicID || clinic.clinicId)}
                        >
                          {clinic.clinicName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-white/75 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500 dark:text-white/50" /> Doctor Name
                  </Label>
                  <Select
                    value={formData.doctorId}
                    onValueChange={(value) => handleFormChange("doctorId", value)}
                  >
                    <SelectTrigger className="h-10 bg-white dark:bg-[#443C68] border-gray-300 dark:border-[#635985]/40">
                      <SelectValue placeholder="Select Doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDoctors.map((doctor) => (
                        <SelectItem
                          key={doctor.doctorID}
                          value={String(doctor.doctorID)}
                        >
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-white/75 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500 dark:text-white/50" /> Treatment Type
                </Label>
                <div className="bg-gray-50 dark:bg-[#443C68]/30 p-4 rounded-lg border border-gray-200 dark:border-[#635985]/40">
                  <RadioGroup
                    value={formData.treatmentType}
                    className="flex items-center gap-8"
                    onValueChange={(value) => handleFormChange("treatmentType", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Aligner" id="aligner" />
                      <Label htmlFor="aligner" className="cursor-pointer">Aligner</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Other" id="other" />
                      <Label htmlFor="other" className="cursor-pointer">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          <TableWrapper>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-0">
                <thead >
                  <tr>
                    <th className="p-4 font-semibold text-center border-b border-border">Sr.No</th>
                    <th className="p-4 font-semibold border-b border-border">Treatment</th>
                    <th className="p-4 font-semibold border-b border-border">Tooth No</th>
                    <th className="p-4 font-semibold border-b border-border">Unit</th>
                    <th className="p-4 font-semibold border-b border-border">Cost</th>
                    <th className="p-4 font-semibold border-b border-border">Discount</th>
                    <th className="p-4 font-semibold border-b border-border">Tax</th>
                    <th className="p-4 font-semibold text-center border-b border-border">Action</th>
                  </tr>
                </thead>
                <tbody >
                  {rows.map((row, index) => (
                    <tr key={row.id} >
                      <td className="p-4 text-center text-muted-foreground">{index + 1}</td>
                      <td className="p-4">
                        <Select
                          value={String(row.treatmentId)}
                          onValueChange={(value) => handleRowChange(row.id, "treatmentId", value)}
                        >
                          <SelectTrigger className="bg-card w-full">
                            <SelectValue placeholder="Select treatment" />
                          </SelectTrigger>
                          <SelectContent>
                            {TREATMENT_OPTIONS.map((option) => (
                              <SelectItem key={option.id} value={String(option.id)}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4">
                        <Input
                          value={row.toothNo}
                          onChange={(e) => handleRowChange(row.id, "toothNo", e.target.value)}
                          className="bg-card w-full"
                        />
                      </td>
                      <td className="p-4">
                        <Input
                          type="number"
                          min="1"
                          value={row.unit}
                          onChange={(e) => handleRowChange(row.id, "unit", e.target.value)}
                          className="bg-card w-full"
                        />
                      </td>
                      <td className="p-4">
                        <Input
                          type="number"
                          value={row.cost}
                          onChange={(e) => handleRowChange(row.id, "cost", e.target.value)}
                          className="bg-card w-full"
                        />
                      </td>
                      <td className="p-4">
                        <Input
                          type="number"
                          value={row.discount}
                          onChange={(e) => handleRowChange(row.id, "discount", e.target.value)}
                          className="bg-card w-full"
                        />
                      </td>
                      <td className="p-4">
                        <Input
                          type="number"
                          value={row.tax}
                          onChange={(e) => handleRowChange(row.id, "tax", e.target.value)}
                          className="bg-card w-full"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRow(row.id)}
                          disabled={rows.length === 1}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-background border-t border-border flex justify-end">
              <Button onClick={addRow} className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white">
                <Plus className="w-4 h-4 mr-2" /> Add New Row
              </Button>
            </div>
          </TableWrapper>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-[#E8F8F5] dark:bg-[#393053] border-none shadow-sm relative overflow-hidden">
            <CardContent className="p-6 space-y-6 relative z-10">
              <h3 className="text-lg font-bold text-teal-800 dark:text-white/50 border-b border-teal-200 dark:border-[#443C68]/50 pb-2 mb-4">
                Invoice Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>Total Cost</span>
                  <span className="font-mono text-base">{formatCurrency(totals.totalCost)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>Total Discount</span>
                  <span className="font-mono text-red-600 dark:text-red-400 text-base">
                    - {formatCurrency(totals.totalDiscount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>Total Tax</span>
                  <span className="font-mono text-base">{formatCurrency(totals.totalTax)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-teal-200 dark:border-[#443C68]/50 mt-4">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold uppercase tracking-wider">Grand Total</span>
                  <span className="text-3xl font-bold text-teal-700 dark:text-[#635985]">
                    {formatCurrency(totals.grandTotal)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white font-bold py-3 mt-6"
              >
                {isSubmitting ? "Generating..." : "Generate Invoice"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
