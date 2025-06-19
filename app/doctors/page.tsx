"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Mail,
  Phone,
  Plus,
  Stethoscope,
  Building,
  Loader2,
  Clock,
  Calendar,
  Eye,
  Edit,
  UserX,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { doctorService, type Doctor } from "@/lib/firebase-service"

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Use getAllIncludingInactive so admins can see and manage all doctors
        const doctorData = await doctorService.getAllIncludingInactive()
        setDoctors(doctorData)
      } catch (error) {
        console.error("Error fetching doctors:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  const getAvailableDays = (availability?: Doctor["availability"]) => {
    if (!availability) return "Not set"

    const availableDays = Object.entries(availability)
      .filter(([_, schedule]) => schedule.available)
      .map(([day, _]) => day.charAt(0).toUpperCase() + day.slice(1))

    return availableDays.length > 0 ? availableDays.join(", ") : "Not available"
  }

  const getWorkingHours = (availability?: Doctor["availability"]) => {
    if (!availability) return "Not set"

    const workingDays = Object.entries(availability).filter(([_, schedule]) => schedule.available)
    if (workingDays.length === 0) return "Not available"

    const firstDay = workingDays[0][1]
    return `${firstDay.startTime} - ${firstDay.endTime}`
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

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doctors Management</h1>
              <p className="text-gray-600 mt-2">Manage registered doctor accounts</p>
            </div>
            <Link href="/doctors/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Doctor
              </Button>
            </Link>
          </div>

          <div className="grid gap-6">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      {doctor.profileImage ? (
                        <img
                          src={doctor.profileImage || "/placeholder.svg"}
                          alt={`${doctor.firstName} ${doctor.lastName}`}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {doctor.firstName} {doctor.lastName}
                        </CardTitle>
                        <CardDescription className="mt-1">Doctor ID: {doctor.uid}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-100 text-blue-800">{doctor.specialization}</Badge>
                      <Badge variant={doctor.isActive ? "default" : "destructive"}>
                        {doctor.isActive ? "Active" : "Inactive"}
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
                          <Mail className="h-3 w-3" />
                          {doctor.email}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {doctor.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Professional Details</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Stethoscope className="h-3 w-3" />
                          License: {doctor.licenseNumber}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Building className="h-3 w-3" />
                          {doctor.hospitalAffiliation}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Availability</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {getAvailableDays(doctor.availability)}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {getWorkingHours(doctor.availability)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/doctors/${doctor.id}`)}>
                      <Eye className="h-3 w-3 mr-1" />
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/doctors/${doctor.id}/edit`)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/doctors/${doctor.id}`)}>
                      <UserX className="h-3 w-3 mr-1" />
                      {doctor.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {doctors.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors registered</h3>
                <p className="text-gray-600 mb-4">Start by adding doctors to the system</p>
                <Link href="/doctors/new">
                  <Button>Add First Doctor</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
