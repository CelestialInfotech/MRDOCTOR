"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Phone, Calendar, Plus, MessageSquare, Edit, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { patientService, appointmentService } from "@/lib/firebase-service"
import { ProtectedRoute } from "@/components/protected-route"

interface PatientWithStats {
  id?: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  gender: "male" | "female" | "other"
  age: number
  weight?: number
  dateOfBirth?: Date
  address?: string
  medicalHistory?: string
  createdAt: Date
  updatedAt: Date
  appointmentCount: number
  lastAppointment?: Date
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const getPatientsWithStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const patientsData = await patientService.getAll()
      const allAppointments = await appointmentService.getAll()

      const patientsWithStats = patientsData.map((patient) => {
        const patientAppointments = allAppointments.filter((apt) => apt.patientId === patient.id)
        const lastAppointment = patientAppointments.sort(
          (a, b) => b.appointmentDate.getTime() - a.appointmentDate.getTime(),
        )[0]

        return {
          ...patient,
          appointmentCount: patientAppointments.length,
          lastAppointment: lastAppointment?.appointmentDate,
        }
      })

      setPatients(patientsWithStats)
    } catch (error) {
      console.error("Error fetching patients with stats:", error)
      setError("Failed to load patients. Please try again.")
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getPatientsWithStats()
  }, [])

  const handleViewProfile = (patientId: string) => {
    router.push(`/patients/${patientId}`)
  }

  const handleBookAppointment = (patientId: string) => {
    router.push(`/appointments/new?patientId=${patientId}`)
  }

  const handleContact = (patient: PatientWithStats) => {
    if (patient.phone) {
      window.open(`tel:${patient.phone}`, "_blank")
    } else if (patient.email) {
      window.open(`mailto:${patient.email}`, "_blank")
    } else {
      alert("No contact information available for this patient")
    }
  }

  const handleEdit = (patientId: string) => {
    router.push(`/patients/${patientId}/edit`)
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading patients...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
              <p className="text-gray-600 mt-2">CRM for managing patient relationships</p>
            </div>
            <Link href="/patients/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Patient
              </Button>
            </Link>
          </div>

          {error && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">Error</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                  <Button onClick={getPatientsWithStats} variant="outline" size="sm">
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6">
            {patients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {patient.firstName} {patient.lastName}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Patient since {patient.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {patient.appointmentCount} Appointments
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold mb-2">Contact Information</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {patient.gender?.charAt(0).toUpperCase() + patient.gender?.slice(1)}, Age: {patient.age}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {patient.phone || "Not provided"}
                        </p>
                        {patient.email && <p className="text-sm text-gray-600">Email: {patient.email}</p>}
                        {patient.weight && <p className="text-sm text-gray-600">Weight: {patient.weight} kg</p>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Activity Summary</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">Total Appointments: {patient.appointmentCount}</p>
                        <p className="text-sm text-gray-600">
                          Last visit: {patient.lastAppointment ? patient.lastAppointment.toLocaleDateString() : "Never"}
                        </p>
                        {patient.dateOfBirth && (
                          <p className="text-sm text-gray-600">DOB: {patient.dateOfBirth.toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Medical Information</h4>
                      <p className="text-sm text-gray-600">
                        {patient.medicalHistory
                          ? patient.medicalHistory.length > 100
                            ? patient.medicalHistory.substring(0, 100) + "..."
                            : patient.medicalHistory
                          : "No medical history recorded"}
                      </p>
                    </div>
                  </div>

                  {patient.address && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-1">Address</h4>
                      <p className="text-sm text-gray-600">{patient.address}</p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => handleViewProfile(patient.id!)}>
                      <Eye className="h-3 w-3 mr-1" />
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBookAppointment(patient.id!)}>
                      <Calendar className="h-3 w-3 mr-1" />
                      Book Appointment
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleContact(patient)}>
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Contact
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(patient.id!)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {patients.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
                <p className="text-gray-600 mb-4">Start building your patient database</p>
                <Link href="/patients/new">
                  <Button>Add First Patient</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
