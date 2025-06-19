"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Phone, Calendar, MessageSquare, FileText, Loader2, AlertCircle } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { appointmentService, patientService } from "@/lib/firebase-service"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function DoctorPatientsPage() {
  const { userProfile } = useAuth()
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const fetchDoctorPatients = async () => {
    if (!userProfile?.uid) {
      setError("Doctor ID not found. Please log in again.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Get all appointments and filter for this doctor
      const allAppointments = await appointmentService.getAll()
      const doctorAppointments = allAppointments.filter((apt) => apt.doctorId === userProfile.uid)

      // Get unique patient IDs for this doctor
      const uniquePatientIds = [...new Set(doctorAppointments.map((apt) => apt.patientId))]

      // Get patient details and appointment stats
      const patientsWithStats = []

      for (const patientId of uniquePatientIds) {
        const patient = await patientService.getById(patientId)
        if (patient) {
          const patientAppointments = doctorAppointments.filter((apt) => apt.patientId === patientId)
          const lastAppointment = patientAppointments.sort(
            (a, b) => b.appointmentDate.getTime() - a.appointmentDate.getTime(),
          )[0]
          const nextAppointment = patientAppointments
            .filter((apt) => apt.appointmentDate >= new Date() && apt.status === "scheduled")
            .sort((a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime())[0]

          patientsWithStats.push({
            ...patient,
            appointmentCount: patientAppointments.length,
            lastAppointment: lastAppointment?.appointmentDate,
            nextAppointment: nextAppointment?.appointmentDate,
            completedAppointments: patientAppointments.filter((apt) => apt.status === "completed").length,
          })
        }
      }

      // Sort by next appointment date, then by last appointment date
      const sortedPatients = patientsWithStats.sort((a, b) => {
        if (a.nextAppointment && b.nextAppointment) {
          return a.nextAppointment.getTime() - b.nextAppointment.getTime()
        }
        if (a.nextAppointment) return -1
        if (b.nextAppointment) return 1
        if (a.lastAppointment && b.lastAppointment) {
          return b.lastAppointment.getTime() - a.lastAppointment.getTime()
        }
        return 0
      })

      setPatients(sortedPatients)
    } catch (error) {
      console.error("Error fetching doctor patients:", error)
      setError("Failed to load patients. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userProfile?.uid) {
      fetchDoctorPatients()
    }
  }, [userProfile])

  const handleRetry = () => {
    fetchDoctorPatients()
  }

  const handleViewProfile = (patientId: string) => {
    router.push(`/patients/${patientId}`)
  }

  const handleScheduleAppointment = (patientId: string) => {
    router.push(`/doctor/appointments/new?patientId=${patientId}`)
  }

  const handleContact = (patient: any) => {
    if (patient?.phone) {
      window.open(`tel:${patient.phone}`, "_blank")
    } else if (patient?.email) {
      window.open(`mailto:${patient.email}`, "_blank")
    } else {
      alert("No contact information available for this patient")
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your patients...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
                <p className="text-gray-600 mt-2">
                  Patients under your care
                  {userProfile && (
                    <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Dr. {userProfile.firstName} {userProfile.lastName}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => router.push("/doctor/patients/new")}>
                  <User className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
                {error && (
                  <Button onClick={handleRetry} variant="outline" size="sm">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">Error Loading Patients</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                  <Button onClick={handleRetry} variant="outline" size="sm">
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Patients List */}
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
                        {patient.gender?.charAt(0).toUpperCase() + patient.gender?.slice(1)}, Age: {patient.age}
                        {patient.weight && ` • Weight: ${patient.weight} kg`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {patient.appointmentCount} Total Visits
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {patient.completedAppointments} Completed
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
                          <Phone className="h-3 w-3" />
                          {patient.phone || "Not provided"}
                        </p>
                        {patient.email && <p className="text-sm text-gray-600">Email: {patient.email}</p>}
                        {patient.dateOfBirth && (
                          <p className="text-sm text-gray-600">DOB: {patient.dateOfBirth.toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Appointment History</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          Last visit: {patient.lastAppointment ? patient.lastAppointment.toLocaleDateString() : "Never"}
                        </p>
                        {patient.nextAppointment && (
                          <p className="text-sm text-green-600 font-medium">
                            Next: {patient.nextAppointment.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Patient Since</h4>
                      <p className="text-sm text-gray-600">{patient.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>

                  {patient.medicalHistory && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-1">Medical History</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {patient.medicalHistory.length > 200
                          ? patient.medicalHistory.substring(0, 200) + "..."
                          : patient.medicalHistory}
                      </p>
                    </div>
                  )}

                  {patient.address && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-1">Address</h4>
                      <p className="text-sm text-gray-600">{patient.address}</p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" onClick={() => handleViewProfile(patient.id)}>
                      <FileText className="h-3 w-3 mr-1" />
                      View Full Profile
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleScheduleAppointment(patient.id)}>
                      <Calendar className="h-3 w-3 mr-1" />
                      Schedule Appointment
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleContact(patient)}>
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {patients.length === 0 && !loading && !error && (
            <Card>
              <CardContent className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
                <p className="text-gray-600 mb-4">
                  You don't have any patients assigned yet
                  {userProfile && (
                    <span className="block text-sm mt-2">
                      Logged in as: Dr. {userProfile.firstName} {userProfile.lastName} ({userProfile.specialization})
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Debug Info (remove in production) */}
          {process.env.NODE_ENV === "development" && userProfile && (
            <Card className="mt-8 border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <h4 className="font-semibold text-yellow-800 mb-2">Debug Info (Development Only)</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p>
                    <strong>Doctor UID:</strong> {userProfile.uid}
                  </p>
                  <p>
                    <strong>Doctor Name:</strong> {userProfile.firstName} {userProfile.lastName}
                  </p>
                  <p>
                    <strong>Specialization:</strong> {userProfile.specialization}
                  </p>
                  <p>
                    <strong>Total Patients Found:</strong> {patients.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
