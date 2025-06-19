"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, Clock, User } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ProtectedRoute } from "@/components/protected-route"
import { patientService, doctorService, appointmentService } from "@/lib/firebase-service"
import type { Doctor } from "@/lib/firebase-service"

export default function NewPatientPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [appointmentDate, setAppointmentDate] = useState<Date>()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    age: "",
    weight: "",
    address: "",
    medicalHistory: "",
    // Appointment fields
    doctorId: "",
    appointmentTime: "",
    reason: "",
    notes: "",
  })
  const [dateOfBirth, setDateOfBirth] = useState<Date>()
  const router = useRouter()

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsData = await doctorService.getActiveOnly()
        setDoctors(doctorsData)
      } catch (error) {
        console.error("Error fetching doctors:", error)
      }
    }
    fetchDoctors()
  }, [])

  const checkDoctorAvailability = async (doctorId: string, date: Date) => {
    if (!doctorId || !date) return

    setCheckingAvailability(true)
    try {
      // Get all appointments for this doctor on this date
      const allAppointments = await appointmentService.getAll()
      const doctorAppointments = allAppointments.filter(
        (apt) =>
          apt.doctorId === doctorId &&
          apt.appointmentDate.toDateString() === date.toDateString() &&
          apt.status !== "cancelled",
      )

      const bookedTimes = doctorAppointments.map((apt) => apt.appointmentTime)

      // All possible time slots
      const allTimeSlots = [
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

      // Filter out booked times
      const available = allTimeSlots.filter((time) => !bookedTimes.includes(time))

      // Check doctor's availability for the selected day
      const selectedDoctor = doctors.find((d) => d.id === doctorId)
      if (selectedDoctor?.availability) {
        const dayName = date
          .toLocaleDateString("en-US", {
            weekday: "long",
          })
          .toLowerCase() as keyof typeof selectedDoctor.availability

        const daySchedule = selectedDoctor.availability[dayName]

        if (!daySchedule?.available) {
          setAvailableSlots([])
          return
        }

        // Filter slots based on doctor's working hours
        const workingSlots = available.filter((time) => {
          return time >= daySchedule.startTime && time <= daySchedule.endTime
        })

        setAvailableSlots(workingSlots)
      } else {
        setAvailableSlots(available)
      }
    } catch (error) {
      console.error("Error checking availability:", error)
      setAvailableSlots([])
    } finally {
      setCheckingAvailability(false)
    }
  }

  useEffect(() => {
    if (formData.doctorId && appointmentDate) {
      checkDoctorAvailability(formData.doctorId, appointmentDate)
    }
  }, [formData.doctorId, appointmentDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create the patient
      const patientId = await patientService.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        gender: formData.gender as "male" | "female" | "other",
        age: Number.parseInt(formData.age),
        weight: formData.weight ? Number.parseFloat(formData.weight) : undefined,
        dateOfBirth,
        address: formData.address,
        medicalHistory: formData.medicalHistory,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Create appointment if doctor and time are selected
      if (formData.doctorId && appointmentDate && formData.appointmentTime) {
        await appointmentService.create({
          patientId,
          doctorId: formData.doctorId,
          appointmentDate,
          appointmentTime: formData.appointmentTime,
          durationMinutes: 30,
          status: "scheduled",
          reason: formData.reason || "Initial consultation",
          notes: formData.notes,
          aiAgentBooking: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      router.push("/patients")
    } catch (error) {
      console.error("Error creating patient:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Add New Patient</CardTitle>
                <CardDescription>Register a new patient and optionally schedule an appointment</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Patient Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Patient Information</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender *</Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age *</Label>
                        <Input
                          id="age"
                          type="number"
                          min="0"
                          max="150"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          placeholder="e.g., 70.5"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateOfBirth && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={dateOfBirth} onSelect={setDateOfBirth} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Full address"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medicalHistory">Medical History</Label>
                      <Textarea
                        id="medicalHistory"
                        value={formData.medicalHistory}
                        onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                        placeholder="Previous conditions, allergies, medications, etc."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Appointment Scheduling (Optional) */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Schedule Appointment (Optional)</h3>

                    <div className="space-y-2">
                      <Label htmlFor="doctor">Select Doctor</Label>
                      <Select
                        value={formData.doctorId}
                        onValueChange={(value) => {
                          setFormData({ ...formData, doctorId: value, appointmentTime: "" })
                          setAvailableSlots([])
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a doctor (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id!}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.doctorId && (
                      <>
                        <div className="space-y-2">
                          <Label>Appointment Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !appointmentDate && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {appointmentDate ? format(appointmentDate, "PPP") : <span>Pick appointment date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={appointmentDate}
                                onSelect={(date) => {
                                  setAppointmentDate(date)
                                  setFormData({ ...formData, appointmentTime: "" })
                                }}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {appointmentDate && (
                          <div className="space-y-2">
                            <Label htmlFor="appointmentTime">Available Time Slots</Label>
                            {checkingAvailability ? (
                              <div className="flex items-center gap-2 p-4 border rounded-lg">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm text-gray-600">Checking availability...</span>
                              </div>
                            ) : availableSlots.length > 0 ? (
                              <div className="grid grid-cols-4 gap-2">
                                {availableSlots.map((slot) => (
                                  <Button
                                    key={slot}
                                    type="button"
                                    variant={formData.appointmentTime === slot ? "default" : "outline"}
                                    className="h-10"
                                    onClick={() => setFormData({ ...formData, appointmentTime: slot })}
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    {slot}
                                  </Button>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 border rounded-lg text-center text-gray-500">
                                <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                <p>No available slots for this date</p>
                                <p className="text-sm">Please select a different date</p>
                              </div>
                            )}
                          </div>
                        )}

                        {formData.appointmentTime && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="reason">Reason for Visit</Label>
                              <Input
                                id="reason"
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="e.g., Initial consultation, Regular checkup"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="notes">Appointment Notes</Label>
                              <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Additional notes for the appointment"
                                rows={2}
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={
                        loading || !formData.firstName || !formData.lastName || !formData.gender || !formData.age
                      }
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding Patient...
                        </>
                      ) : formData.doctorId && formData.appointmentTime ? (
                        "Add Patient & Schedule Appointment"
                      ) : (
                        "Add Patient"
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
