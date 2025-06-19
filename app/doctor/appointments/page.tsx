// "use client"

// import { Button } from "@/components/ui/button"
// import { Calendar } from "lucide-react"
// import { useRouter } from "next/navigation"

// export default function DoctorAppointmentsPage() {
//   const router = useRouter()

//   return (
//     <div>
//       <h1>Doctor Appointments</h1>
//       <Button onClick={() => router.push("/doctor/appointments/new")}>
//         <Calendar className="h-4 w-4 mr-2" />
//         Add Appointment
//       </Button>
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Phone, Mail, FileText, Loader2, AlertCircle } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { appointmentService } from "@/lib/firebase-service"
import { useAuth } from "@/lib/auth-context"
import { ConsultationModal } from "@/components/consultation-modal"
import { RescheduleModal } from "@/components/reschedule-modal"
import { CancelAppointmentModal } from "@/components/cancel-appointment-modal"
import { ContactPatientModal } from "@/components/contact-patient-modal"
import { useRouter } from "next/navigation"
import { ViewNotesModal } from "@/components/view-notes-modal"

function getStatusColor(status: string) {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-800"
    case "in-progress":
      return "bg-yellow-100 text-yellow-800"
    case "completed":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    case "rescheduled":
      return "bg-purple-100 text-purple-800"
    case "no-show":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function DoctorAppointmentsPage() {
  const { userProfile } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Modal states
  const [consultationModal, setConsultationModal] = useState({ isOpen: false, appointment: null })
  const [rescheduleModal, setRescheduleModal] = useState({ isOpen: false, appointment: null })
  const [cancelModal, setCancelModal] = useState({ isOpen: false, appointment: null })
  const [contactModal, setContactModal] = useState({ isOpen: false, appointment: null })
  const [viewNotesModal, setViewNotesModal] = useState({ isOpen: false, appointment: null })

  const fetchDoctorAppointments = async () => {
    if (!userProfile?.uid) {
      setError("Doctor ID not found. Please log in again.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const allAppointments = await appointmentService.getAll()
      const doctorAppointments = allAppointments.filter((apt) => apt.doctorId === userProfile.uid)

      const sortedAppointments = doctorAppointments.sort((a, b) => {
        const dateA = new Date(a.appointmentDate)
        const dateB = new Date(b.appointmentDate)
        return dateB.getTime() - dateA.getTime()
      })

      setAppointments(sortedAppointments)
    } catch (error) {
      console.error("Error fetching doctor appointments:", error)
      setError("Failed to load appointments. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userProfile?.uid) {
      fetchDoctorAppointments()
    }
  }, [userProfile])

  const handleRetry = () => {
    fetchDoctorAppointments()
  }

  const handleStartConsultation = (appointment: any) => {
    setConsultationModal({ isOpen: true, appointment })
  }

  const handleCompleteConsultation = async (
    notes: string,
    diagnosis: string,
    prescription: string,
    followUp: string,
  ) => {
    try {
      await appointmentService.update(consultationModal.appointment.id, {
        status: "completed",
        completedAt: new Date(),
        consultationNotes: notes,
        diagnosis,
        prescription,
        followUpInstructions: followUp,
      })

      await fetchDoctorAppointments()
      setConsultationModal({ isOpen: false, appointment: null })
    } catch (error) {
      console.error("Error completing consultation:", error)
      throw error
    }
  }

  const handleReschedule = (appointment: any) => {
    setRescheduleModal({ isOpen: true, appointment })
  }

  const handleRescheduleConfirm = async (newDate: Date, newTime: string, reason: string) => {
    try {
      await appointmentService.update(rescheduleModal.appointment.id, {
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: "rescheduled",
        rescheduleReason: reason,
        rescheduledAt: new Date(),
      })

      await fetchDoctorAppointments()
      setRescheduleModal({ isOpen: false, appointment: null })
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      throw error
    }
  }

  const handleCancel = (appointment: any) => {
    setCancelModal({ isOpen: true, appointment })
  }

  const handleCancelConfirm = async (reason: string, notifyPatient: boolean) => {
    try {
      await appointmentService.update(cancelModal.appointment.id, {
        status: "cancelled",
        cancellationReason: reason,
        cancelledAt: new Date(),
        notifyPatient,
      })

      await fetchDoctorAppointments()
      setCancelModal({ isOpen: false, appointment: null })
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      throw error
    }
  }

  const handleContactPatient = (appointment: any) => {
    setContactModal({ isOpen: true, appointment })
  }

  const handleMarkNoShow = async (appointmentId: string) => {
    if (confirm("Mark this appointment as No-Show?")) {
      try {
        await appointmentService.update(appointmentId, {
          status: "no-show",
          noShowAt: new Date(),
        })

        await fetchDoctorAppointments()
      } catch (error) {
        console.error("Error marking no-show:", error)
        alert("Failed to update appointment. Please try again.")
      }
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your appointments...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                <p className="text-gray-600 mt-2">
                  Manage your scheduled appointments
                  {userProfile && (
                    <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Dr. {userProfile.firstName} {userProfile.lastName}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
              <Button onClick={() => router.push("/doctor/appointments/new")}>
                <Calendar className="h-4 w-4 mr-2" />
                    Add Appointment
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
                    <p className="text-red-800 font-medium">Error Loading Appointments</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                  <Button onClick={handleRetry} variant="outline" size="sm">
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appointments List */}
          <div className="grid gap-6">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {appointment.patient?.firstName || "Unknown"} {appointment.patient?.lastName || "Patient"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {appointment.appointmentDate ? appointment.appointmentDate.toLocaleDateString() : "No date"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {appointment.appointmentTime || "No time"}
                        </span>
                        <span className="text-sm text-gray-500">{appointment.durationMinutes || 30} minutes</span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(appointment.status || "scheduled")}>
                        {appointment.status || "scheduled"}
                      </Badge>
                      {appointment.aiAgentBooking && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          AI Booked
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold mb-2">Patient Information</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {appointment.patient?.gender?.charAt(0).toUpperCase() + appointment.patient?.gender?.slice(1)}
                          , Age: {appointment.patient?.age || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {appointment.patient?.email || "No email"}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {appointment.patient?.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Appointment Details</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <strong>Reason:</strong> {appointment.reason || "Not specified"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Duration:</strong> {appointment.durationMinutes || 30} minutes
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Booked:</strong> {appointment.createdAt?.toLocaleDateString() || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {appointment.patient?.medicalHistory && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-1">Medical History</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {appointment.patient.medicalHistory}
                      </p>
                    </div>
                  )}

                  {appointment.consultationNotes && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-1">Consultation Notes</h4>
                      <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                        {appointment.consultationNotes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {appointment.status === "scheduled" && (
                      <>
                        <Button size="sm" onClick={() => handleStartConsultation(appointment)}>
                          <FileText className="h-3 w-3 mr-1" />
                          Start Consultation
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleReschedule(appointment)}>
                          Reschedule
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleCancel(appointment)}>
                          Cancel
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleMarkNoShow(appointment.id)}>
                          Mark No-Show
                        </Button>
                      </>
                    )}
                    {appointment.status === "in-progress" && (
                      <>
                        <Button size="sm" onClick={() => handleStartConsultation(appointment)}>
                          <FileText className="h-3 w-3 mr-1" />
                          Complete Consultation
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleCancel(appointment)}>
                          Cancel
                        </Button>
                      </>
                    )}
                    {appointment.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewNotesModal({ isOpen: true, appointment })}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        View Notes
                      </Button>
                    )}
                    {appointment.status === "rescheduled" && (
                      <>
                        <Button size="sm" onClick={() => handleStartConsultation(appointment)}>
                          <FileText className="h-3 w-3 mr-1" />
                          Start Consultation
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleReschedule(appointment)}>
                          Reschedule Again
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleCancel(appointment)}>
                          Cancel
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleContactPatient(appointment)}>
                      <Phone className="h-3 w-3 mr-1" />
                      Contact Patient
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {appointments.length === 0 && !loading && !error && (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-600 mb-4">
                  You don't have any appointments scheduled
                  {userProfile && (
                    <span className="block text-sm mt-2">
                      Logged in as: Dr. {userProfile.firstName} {userProfile.lastName} ({userProfile.specialization})
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConsultationModal
        isOpen={consultationModal.isOpen}
        onClose={() => setConsultationModal({ isOpen: false, appointment: null })}
        appointment={consultationModal.appointment}
        onComplete={handleCompleteConsultation}
      />

      <RescheduleModal
        isOpen={rescheduleModal.isOpen}
        onClose={() => setRescheduleModal({ isOpen: false, appointment: null })}
        appointment={rescheduleModal.appointment}
        onReschedule={handleRescheduleConfirm}
      />

      <CancelAppointmentModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, appointment: null })}
        appointment={cancelModal.appointment}
        onCancel={handleCancelConfirm}
      />

      <ContactPatientModal
        isOpen={contactModal.isOpen}
        onClose={() => setContactModal({ isOpen: false, appointment: null })}
        appointment={contactModal.appointment}
        doctorProfile={userProfile}
      />

      <ViewNotesModal
        isOpen={viewNotesModal.isOpen}
        onClose={() => setViewNotesModal({ isOpen: false, appointment: null })}
        appointment={viewNotesModal.appointment}
      />
    </ProtectedRoute>
  )
}