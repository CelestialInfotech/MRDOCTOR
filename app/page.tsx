"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, UserCheck, Bot, Phone, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import { appointmentService, patientService, doctorService } from "@/lib/firebase-service"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

async function getDashboardStats() {
  try {
    const [upcomingAppointments, patients, doctors, aiBookings] = await Promise.all([
      appointmentService.getUpcoming(),
      patientService.getAll(),
      doctorService.getAll(),
      appointmentService.getAIBookings(30),
    ])

    return {
      upcomingAppointments,
      totalPatients: patients.length,
      totalDoctors: doctors.length,
      aiBookings,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      upcomingAppointments: 0,
      totalPatients: 0,
      totalDoctors: 0,
      aiBookings: 0,
    }
  }
}

export default function HomePage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user, redirect to login
        router.push("/login")
      } else if (userProfile) {
        // User has profile, redirect based on role
        if (userProfile.role === "admin") {
          router.push("/dashboard")
        } else if (userProfile.role === "doctor") {
          router.push("/doctor/dashboard")
        }
      }
      // Remove the unauthorized redirect - just wait for profile to load
    }
  }, [user, userProfile, loading, router])

  useEffect(() => {
    const fetchStats = async () => {
      const statsData = await getDashboardStats()
      setStats(statsData)
    }

    fetchStats()
  }, [])

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Medical Appointment System</h1>
          <p className="text-gray-600 mt-2">Manage appointments, patients, and doctors with AI-powered booking</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
              <p className="text-xs text-muted-foreground">From today onwards</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Registered in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDoctors}</div>
              <p className="text-xs text-muted-foreground">Available for booking</p>
            </CardContent>
          </Card>

          <Card>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest appointments and patient interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New appointment scheduled</p>
                  <p className="text-xs text-gray-600">John Smith with Dr. Johnson - Dec 20, 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Phone className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Patient interaction logged</p>
                  <p className="text-xs text-gray-600">Maria Garcia called for appointment reschedule</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Bot className="h-4 w-4 text-purple-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">AI agent booking completed</p>
                  <p className="text-xs text-gray-600">David Wilson booked via AI agent - Dec 22, 11:00 AM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
