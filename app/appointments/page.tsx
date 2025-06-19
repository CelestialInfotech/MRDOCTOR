import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Phone, Mail, Plus } from "lucide-react"
import Link from "next/link"
import { appointmentService } from "@/lib/firebase-service"

function getStatusColor(status: string) {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-800"
    case "completed":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    case "no-show":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

async function getAppointments() {
  try {
    const appointments = await appointmentService.getAll()
    return appointments
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return []
  }
}

export default async function AppointmentsPage() {
  const appointments = await getAppointments()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-2">Manage all patient appointments</p>
          </div>
          <Link href="/appointments/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Book New Appointment
            </Button>
          </Link>
        </div>

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
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Doctor Information</h4>
                    <p className="text-sm text-gray-600">
                      {appointment.doctor?.firstName || "Unknown"} {appointment.doctor?.lastName || "Doctor"}
                    </p>
                    <p className="text-sm text-gray-500">{appointment.doctor?.specialization || "No specialization"}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Patient Contact</h4>
                    <div className="space-y-1">
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
                </div>
                {appointment.reason && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-1">Reason for Visit</h4>
                    <p className="text-sm text-gray-600">{appointment.reason}</p>
                  </div>
                )}
                {appointment.notes && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-1">Notes</h4>
                    <p className="text-sm text-gray-600">{appointment.notes}</p>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    Reschedule
                  </Button>
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {appointments.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600 mb-4">Get started by booking your first appointment</p>
              <Link href="/appointments/new">
                <Button>Book New Appointment</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
