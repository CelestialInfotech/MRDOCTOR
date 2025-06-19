"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Stethoscope, Calendar, Clock, Edit, ArrowLeft, UserX, UserCheck } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { doctorService, type Doctor } from "@/lib/firebase-service"
import { Loader2 } from "lucide-react"

export default function DoctorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const fetchDoctor = async () => {
      if (params.id) {
        try {
          const doctorData = await doctorService.getById(params.id as string)
          setDoctor(doctorData)
        } catch (error) {
          console.error("Error fetching doctor:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchDoctor()
  }, [params.id])

  const handleDeactivate = async () => {
    if (!doctor?.id) return

    setActionLoading(true)
    try {
      await doctorService.deactivate(doctor.id)
      setDoctor({ ...doctor, isActive: false })
    } catch (error) {
      console.error("Error deactivating doctor:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleActivate = async () => {
    if (!doctor?.id) return

    setActionLoading(true)
    try {
      await doctorService.activate(doctor.id)
      setDoctor({ ...doctor, isActive: true })
    } catch (error) {
      console.error("Error activating doctor:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const getAvailableDays = (availability?: Doctor["availability"]) => {
    if (!availability) return []

    return Object.entries(availability)
      .filter(([_, schedule]) => schedule.available)
      .map(([day, schedule]) => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      }))
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ProtectedRoute>
    )
  }

  if (!doctor) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Doctor Not Found</h3>
              <p className="text-gray-600 mb-4">The requested doctor profile could not be found.</p>
              <Button onClick={() => router.push("/doctors")}>Back to Doctors</Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  const availableDays = getAvailableDays(doctor.availability)

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" onClick={() => router.push("/doctors")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Doctors
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">Doctor Profile</h1>
                <p className="text-gray-600 mt-1">View and manage doctor information</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push(`/doctors/${doctor.id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                {doctor.isActive ? (
                  <Button variant="destructive" onClick={handleDeactivate} disabled={actionLoading}>
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UserX className="h-4 w-4 mr-2" />
                    )}
                    Deactivate
                  </Button>
                ) : (
                  <Button variant="default" onClick={handleActivate} disabled={actionLoading}>
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UserCheck className="h-4 w-4 mr-2" />
                    )}
                    Activate
                  </Button>
                )}
              </div>
            </div>

            {/* Profile Card */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-6">
                  {doctor.profileImage ? (
                    <img
                      src={doctor.profileImage || "/placeholder.svg"}
                      alt={`${doctor.firstName} ${doctor.lastName}`}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-2xl">
                      {doctor.firstName} {doctor.lastName}
                    </CardTitle>
                    <CardDescription className="text-lg mt-1">{doctor.specialization}</CardDescription>
                    <div className="flex gap-2 mt-3">
                      <Badge className="bg-blue-100 text-blue-800">{doctor.specialization}</Badge>
                      <Badge variant={doctor.isActive ? "default" : "destructive"}>
                        {doctor.isActive ? "Active" : "Inactive"}
                      </Badge>
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
                    <p className="text-gray-900">{doctor.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{doctor.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Doctor ID</label>
                    <p className="text-gray-900 font-mono text-sm">{doctor.uid}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Specialization</label>
                    <p className="text-gray-900">{doctor.specialization}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">License Number</label>
                    <p className="text-gray-900">{doctor.licenseNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Hospital Affiliation</label>
                    <p className="text-gray-900">{doctor.hospitalAffiliation}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Availability Schedule */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Availability Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableDays.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableDays.map((schedule, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="font-medium text-gray-900">{schedule.day}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No availability schedule set</p>
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
