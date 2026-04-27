"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Settings, Trash2, Plus } from "lucide-react"
import { TableWrapper } from "@/components/shared/TableWrapper"

const TREATMENT_OPTIONS = [
    { id: "t1", name: "Consultation", cost: 500 },
    { id: "t2", name: "Scaling", cost: 1500 },
    { id: "t3", name: "Root Canal", cost: 3500 },
    { id: "t4", name: "Extraction", cost: 1000 },
    { id: "t5", name: "Filling", cost: 800 },
    { id: "t6", name: "Whitening", cost: 5000 },
]

export default function GenerateInvoicePage() {
  const [patientName, setPatientName] = useState("Dilip bhai Makwana")
  const [clinicName, setClinicName] = useState("")
  const [doctorName, setDoctorName] = useState("")
  const [consultationDate, setConsultationDate] = useState("2025-12-24")
  
  const [rows, setRows] = useState([
    { id: 1, treatmentId: "", cost: 0, discount: 0 }
  ])

  const [totals, setTotals] = useState({
      totalCost: 0,
      totalDiscount: 0,
      totalTax: 0,
      grandTotal: 0
  })

  // Calculations
  useEffect(() => {
    const cost = rows.reduce((acc, row) => acc + (Number(row.cost) || 0), 0)
    const discount = rows.reduce((acc, row) => acc + (Number(row.discount) || 0), 0)
    const tax = 0 // Assuming 0 for now or add tax logic
    const grand = cost - discount + tax

    setTotals({
        totalCost: cost,
        totalDiscount: discount,
        totalTax: tax,
        grandTotal: grand > 0 ? grand : 0
    })
  }, [rows])

  const handleTreatmentChange = (id, treatmentId) => {
    const treatment = TREATMENT_OPTIONS.find(t => t.id === treatmentId)
    setRows(rows.map(row => 
        row.id === id ? { ...row, treatmentId, cost: treatment ? treatment.cost : 0 } : row
    ))
  }

  const handleDiscountChange = (id, discount) => {
    setRows(rows.map(row => 
        row.id === id ? { ...row, discount: discount } : row
    ))
  }

  const addRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1
    setRows([...rows, { id: newId, treatmentId: "", cost: 0, discount: 0 }])
  }

  const deleteRow = (id) => {
    if(rows.length > 1) {
        setRows(rows.filter(row => row.id !== id))
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 text-primary mb-4 border-b border-border pb-4">
        <Settings className="w-5 h-5 text-medivardaan-teal" />
        <h1 className="text-xl font-bold tracking-tight text-medivardaan-teal uppercase">Generate Invoice</h1>
      </div>

      {/* Info Form */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Patient Name</label>
                <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} className="bg-background h-10" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Clinic Name</label>
                 <Select value={clinicName} onValueChange={setClinicName}>
                  <SelectTrigger className="bg-background h-10">
                    <SelectValue placeholder="-- Select Clinic --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Karve Road">Karve Road</SelectItem>
                    <SelectItem value="KALYAN NAGAR">KALYAN NAGAR</SelectItem>
                  </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Doctor Name</label>
                 <Select value={doctorName} onValueChange={setDoctorName}>
                  <SelectTrigger className="bg-background h-10">
                    <SelectValue placeholder="-- Select --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Smith">Dr. Smith</SelectItem>
                    <SelectItem value="Dr. Jane">Dr. Jane</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                 <label className="text-sm font-medium text-muted-foreground">Consultation Date</label>
                <Input type="date" value={consultationDate} onChange={(e) => setConsultationDate(e.target.value)} className="bg-background h-10" />
            </div>
         </div>
      </div>

      {/* Dynamic Table */}
      <TableWrapper>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-0">
                <thead >
                    <tr>
                        <th className="p-4 font-semibold w-[5%] text-center border-b border-border">Sr.No</th>
                        <th className="p-4 font-semibold w-[35%] border-b border-border">Treatment</th>
                        <th className="p-4 font-semibold w-[25%] border-b border-border">Cost</th>
                        <th className="p-4 font-semibold w-[25%] border-b border-border">Discount</th>
                        <th className="p-4 font-semibold w-[10%] text-center border-b border-border">Action</th>
                    </tr>
                </thead>
                <tbody >
                    {rows.map((row, index) => (
                        <tr key={row.id} >
                            <td className="p-4 text-center text-muted-foreground">{index + 1}</td>
                            <td className="p-4">
                                <Select value={row.treatmentId} onValueChange={(v) => handleTreatmentChange(row.id, v)}>
                                  <SelectTrigger className="bg-card w-full">
                                    <SelectValue placeholder="--- Select ---" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TREATMENT_OPTIONS.map(opt => (
                                        <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                            </td>
                            <td className="p-4">
                                <Input readOnly value={row.cost} className="bg-muted/50 w-full" />
                            </td>
                            <td className="p-4">
                                <Input type="number" value={row.discount} onChange={(e) => handleDiscountChange(row.id, e.target.value)} className="bg-card w-full" />
                            </td>
                            <td className="p-4 text-center">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => deleteRow(row.id)}
                                    className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-white/60 dark:hover:text-red-400"
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
            <Button onClick={addRow} className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white shadow-sm transition-colors">
                <Plus className="w-4 h-4 mr-2" /> Add New Row
            </Button>
        </div>
      </TableWrapper>

      {/* Totals Section */}
      <div className="bg-card rounded-xl p-8 border border-border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
            <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase mb-1">Total Cost (₹)</p>
                <p className="text-xl font-bold text-foreground">{totals.totalCost}</p>
            </div>
            <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase mb-1">Total Discount (₹)</p>
                <p className="text-xl font-bold text-foreground">{totals.totalDiscount}</p>
            </div>
            <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase mb-1">Total Tax (₹)</p>
                 <p className="text-xl font-bold text-foreground">{totals.totalTax}</p>
            </div>
            <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase mb-1">Grand Total (₹)</p>
                 <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totals.grandTotal}</p>
            </div>
        </div>
      </div>

      {/* Action Buttons */}
       <div className="flex justify-center gap-4 py-6">
            <Button className="bg-primary hover:bg-[#0b5c7a] dark:bg-medivardaan-purple dark:hover:bg-[#786bb0] text-white shadow-sm transition-colors px-10 shadow-lg">
                Submit
            </Button>
            <Button className="bg-primary hover:bg-primary text-white px-10 shadow-lg">
                Cancel
            </Button>
       </div>

    </div>
  )
}
