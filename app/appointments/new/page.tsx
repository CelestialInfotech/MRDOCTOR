"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, User } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ProtectedRoute } from "@/components/protected-route"
import { patientService, doctorService, appointmentService } from "@/lib/firebase-service"
import type { Patient, Doctor } from "@/lib/firebase-service"

export default function NewAppointmentPage() {
  const searchParams = useSearchParams()
  const preselectedPatientId = searchParams.get("patientId")

  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const [formData, setFormData] = useState({
    patientId: preselectedPatientId || "",
    doctorId: "",
    appointmentTime: "",
    reason: "",
    notes: "",
  })
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only show active doctors for appointment booking
        const [patientsData, doctorsData] = await Promise.all([
          patientService.getAll(),
          doctorService.getActiveOnly(), // Only active doctors for booking
        ])
        setPatients(patientsData)
        setDoctors(doctorsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return

    setLoading(true)
    try {
      // Create the appointment
      const appointmentId = await appointmentService.create({
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        appointmentDate: date,
        appointmentTime: formData.appointmentTime,
        durationMinutes: 30,
        status: "scheduled",
        reason: formData.reason,
        notes: formData.notes,
        aiAgentBooking: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // The appointment is automatically linked to the doctor through doctorId
      // No additional action needed - the doctor can see it in their appointments

      router.push("/appointments")
    } catch (error) {
      console.error("Error creating appointment:", error)
    } finally {
      setLoading(false)
    }
  }

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ]

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Book New Appointment</CardTitle>
                <CardDescription>Schedule a new appointment for a patient</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient</Label>
                    <Select
                      value={formData.patientId}
                      onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id!}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {patient.firstName} {patient.lastName} - {patient.email || patient.phone || "No contact"}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor">Doctor</Label>
                    <Select
                      value={formData.doctorId}
                      onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id!}>
                            Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Appointment Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Appointment Time</Label>
                    <Select
                      value={formData.appointmentTime}
                      onValueChange={(value) => setFormData({ ...formData, appointmentTime: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Visit</Label>
                    <Input
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="e.g., Regular checkup, Follow-up visit"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes or instructions"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={
                        loading || !date || !formData.patientId || !formData.doctorId || !formData.appointmentTime
                      }
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        "Book Appointment"
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
