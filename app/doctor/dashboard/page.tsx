"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Clock, CheckCircle, FileText, TrendingUp, Loader2, AlertCircle } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { appointmentService } from "@/lib/firebase-service"
import { useAuth } from "@/lib/auth-context"

export default function DoctorDashboard() {
  const { userProfile } = useAuth()
  const [stats, setStats] = useState({
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedThisMonth: 0,
    totalPatients: 0,
    todaySchedule: [] as any[],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDoctorStats = async () => {
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

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)

      const todayAppointments = doctorAppointments.filter(
        (apt) => apt.appointmentDate.toDateString() === today.toDateString() && apt.status === "scheduled",
      )

      const upcomingAppointments = doctorAppointments.filter(
        (apt) => apt.appointmentDate >= today && apt.appointmentDate <= nextWeek && apt.status === "scheduled",
      )

      const completedThisMonth = doctorAppointments.filter((apt) => {
        const appointmentMonth = apt.appointmentDate.getMonth()
        const appointmentYear = apt.appointmentDate.getFullYear()
        const currentMonth = today.getMonth()
        const currentYear = today.getFullYear()
        return appointmentMonth === currentMonth && appointmentYear === currentYear && apt.status === "completed"
      })

      const uniquePatients = new Set(doctorAppointments.map((apt) => apt.patientId)).size

      // Get today's schedule
      const todaySchedule = todayAppointments
        .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
        .slice(0, 5) // Show first 5 appointments

      setStats({
        todayAppointments: todayAppointments.length,
        upcomingAppointments: upcomingAppointments.length,
        completedThisMonth: completedThisMonth.length,
        totalPatients: uniquePatients,
        todaySchedule,
      })
    } catch (error) {
      console.error("Error fetching doctor stats:", error)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userProfile?.uid) {
      fetchDoctorStats()
    }
  }, [userProfile])

  const handleRetry = () => {
    fetchDoctorStats()
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
                <p className="text-gray-600 mt-2">
                  Welcome back! Here's your schedule overview
                  {userProfile && (
                    <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Dr. {userProfile.firstName} {userProfile.lastName}
                    </span>
                  )}
                </p>
              </div>
              {error && (
                <button onClick={handleRetry} className="text-red-600 hover:text-red-800">
                  <AlertCircle className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">Error Loading Dashboard</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                  <button onClick={handleRetry} className="text-red-600 hover:text-red-800 text-sm underline">
                    Retry
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className={error ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayAppointments}</div>
                <p className="text-xs text-muted-foreground">Scheduled for today</p>
              </CardContent>
            </Card>

            <Card className={error ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming (7 days)</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
                <p className="text-xs text-muted-foreground">Next 7 days</p>
              </CardContent>
            </Card>

            <Card className={error ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPatients}</div>
                <p className="text-xs text-muted-foreground">Under your care</p>
              </CardContent>
            </Card>

            <Card className={error ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedThisMonth}</div>
                <p className="text-xs text-muted-foreground">Appointments completed</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Today's Schedule */}
            <Card className={error ? "opacity-60" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>Your appointments for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.todaySchedule.length > 0 ? (
                    stats.todaySchedule.map((appointment, index) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {appointment.patient?.firstName || "Unknown"} {appointment.patient?.lastName || "Patient"}
                          </p>
                          <p className="text-sm text-gray-600">{appointment.reason || "Consultation"}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{appointment.appointmentTime}</p>
                          <p className="text-sm text-gray-600">{appointment.durationMinutes || 30} min</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No appointments scheduled for today</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">View All Appointments</p>
                      <p className="text-sm text-gray-600">See your complete schedule</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Users className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">My Patients</p>
                      <p className="text-sm text-gray-600">Manage patient records</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Medical Records</p>
                      <p className="text-sm text-gray-600">Access patient files</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Update Availability</p>
                      <p className="text-sm text-gray-600">Manage your schedule</p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

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
                    <strong>Role:</strong> {userProfile.role}
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
