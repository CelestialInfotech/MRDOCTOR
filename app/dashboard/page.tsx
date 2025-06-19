"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, UserCheck, Bot, TrendingUp, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { appointmentService, patientService, doctorService } from "@/lib/firebase-service"

interface DashboardStats {
  upcomingAppointments: number
  totalPatients: number
  totalDoctors: number
  aiBookings: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    totalPatients: 0,
    totalDoctors: 0,
    aiBookings: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 10000))

      const dataPromise = Promise.all([
        appointmentService.getUpcoming(),
        patientService.getAll(),
        doctorService.getActiveOnly(),
        appointmentService.getAIBookings(30),
      ])

      const [upcomingAppointments, patients, activeDoctors, aiBookings] = (await Promise.race([
        dataPromise,
        timeoutPromise,
      ])) as [number, any[], any[], number]

      setStats({
        upcomingAppointments,
        totalPatients: patients.length,
        totalDoctors: activeDoctors.length,
        aiBookings,
      })

      // Load recent AI bookings for activity
      try {
        const recentAIBookings = await appointmentService.getRecentAIBookings(3)
        setRecentActivity(recentAIBookings)
      } catch (activityError) {
        console.warn("Could not load recent activity:", activityError)
        setRecentActivity([])
      }
    } catch (error: any) {
      console.error("Error loading dashboard data:", error)

      if (error.code === "unavailable" || error.message === "Request timeout") {
        setError("Unable to connect to the database. Please check your internet connection and try again.")
      } else {
        setError("Failed to load dashboard data. Please try refreshing the page.")
      }

      // Set default values when there's an error
      setStats({
        upcomingAppointments: 0,
        totalPatients: 0,
        totalDoctors: 0,
        aiBookings: 0,
      })
      setRecentActivity([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleRetry = () => {
    loadDashboardData()
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
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
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">Manage appointments, patients, and doctors with AI-powered booking</p>
              </div>
              {error && (
                <Button onClick={handleRetry} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
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
                    <p className="text-red-800 font-medium">Connection Error</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                  <Button onClick={handleRetry} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className={error ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
                <p className="text-xs text-muted-foreground">From today onwards</p>
              </CardContent>
            </Card>

            <Card className={error ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPatients}</div>
                <p className="text-xs text-muted-foreground">Registered in system</p>
              </CardContent>
            </Card>

            <Card className={error ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDoctors}</div>
                <p className="text-xs text-muted-foreground">Available for booking</p>
              </CardContent>
            </Card>

            <Card className={error ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Bookings (30d)</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.aiBookings}</div>
                <p className="text-xs text-muted-foreground">Booked via AI agent</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointments
                </CardTitle>
                <CardDescription>Manage and schedule appointments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/appointments">
                  <Button className="w-full">View All Appointments</Button>
                </Link>
                <Link href="/appointments/new">
                  <Button variant="outline" className="w-full">
                    Book New Appointment
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Patient Management
                </CardTitle>
                <CardDescription>CRM for patient relationships</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/patients">
                  <Button className="w-full">Manage Patients</Button>
                </Link>
                <Link href="/patients/new">
                  <Button variant="outline" className="w-full">
                    Add New Patient
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Agent Integration
                </CardTitle>
                <CardDescription>Connect with your AI booking agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/ai-agent">
                  <Button className="w-full">AI Agent Dashboard</Button>
                </Link>
                <Link href="/ai-agent/settings">
                  <Button variant="outline" className="w-full">
                    Agent Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className={error ? "opacity-60" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest appointments and patient interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!error && recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Bot className="h-4 w-4 text-purple-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">AI agent booking completed</p>
                        <p className="text-xs text-gray-600">
                          {activity.patient?.firstName || "Unknown"} {activity.patient?.lastName || "Patient"} with{" "}
                          {activity.doctor?.firstName || "Unknown"} {activity.doctor?.lastName || "Doctor"} -{" "}
                          {activity.appointmentDate?.toLocaleDateString() || "Unknown date"} at{" "}
                          {activity.appointmentTime || "Unknown time"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {error ? (
                      <>
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Unable to load recent activity</p>
                        <p className="text-sm">Please check your connection and try again</p>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No recent activity to display</p>
                        <p className="text-sm">Activity will appear here as you use the system</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
