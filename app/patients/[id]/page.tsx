"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Edit, ArrowLeft, Loader2 } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { patientService, appointmentService, type Patient } from "@/lib/firebase-service"

export default function PatientProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatientData = async () => {
      if (params.id) {
        try {
          const patientData = await patientService.getById(params.id as string)
          setPatient(patientData)

          if (patientData) {
            const allAppointments = await appointmentService.getAll()
            const patientAppointments = allAppointments.filter((apt) => apt.patientId === patientData.id)
            setAppointments(patientAppointments)
          }
        } catch (error) {
          console.error("Error fetching patient:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchPatientData()
  }, [params.id])

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ProtectedRoute>
    )
  }

  if (!patient) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient Not Found</h3>
              <p className="text-gray-600 mb-4">The requested patient profile could not be found.</p>
              <Button onClick={() => router.push("/patients")}>Back to Patients</Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" onClick={() => router.push("/patients")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patients
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">Patient Profile</h1>
                <p className="text-gray-600 mt-1">View and manage patient information</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push(`/patients/${patient.id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button onClick={() => router.push(`/appointments/new?patientId=${patient.id}`)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </div>
            </div>

            {/* Profile Card */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">
                      {patient.firstName} {patient.lastName}
                    </CardTitle>
                    <CardDescription className="text-lg mt-1">
                      {patient.gender?.charAt(0).toUpperCase() + patient.gender?.slice(1)}, Age: {patient.age}
                    </CardDescription>
                    <div className="flex gap-2 mt-3">
                      <Badge className="bg-blue-100 text-blue-800">{appointments.length} Appointments</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{patient.email || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{patient.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">{patient.address || "Not provided"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Medical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-gray-900">
                      {patient.dateOfBirth ? patient.dateOfBirth.toLocaleDateString() : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Weight</label>
                    <p className="text-gray-900">{patient.weight ? `${patient.weight} kg` : "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Medical History</label>
                    <p className="text-gray-900">{patient.medicalHistory || "No medical history recorded"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Appointment History */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{appointment.doctor?.specialization}</p>
                            <p className="text-sm text-gray-600">
                              {appointment.appointmentDate.toLocaleDateString()} at {appointment.appointmentTime}
                            </p>
                            {appointment.reason && (
                              <p className="text-sm text-gray-600 mt-1">Reason: {appointment.reason}</p>
                            )}
                          </div>
                          <Badge variant={appointment.status === "completed" ? "default" : "outline"}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No appointments found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
