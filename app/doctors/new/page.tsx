"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Upload, X } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { doctorService } from "@/lib/doctor-service"

const daysOfWeek = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
]

export default function NewDoctorPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [adminPassword, setAdminPassword] = useState("")
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    licenseNumber: "",
    hospitalAffiliation: "",
  })
  const [availability, setAvailability] = useState({
    monday: { available: false, startTime: "09:00", endTime: "17:00" },
    tuesday: { available: false, startTime: "09:00", endTime: "17:00" },
    wednesday: { available: false, startTime: "09:00", endTime: "17:00" },
    thursday: { available: false, startTime: "09:00", endTime: "17:00" },
    friday: { available: false, startTime: "09:00", endTime: "17:00" },
    saturday: { available: false, startTime: "09:00", endTime: "17:00" },
    sunday: { available: false, startTime: "09:00", endTime: "17:00" },
  })
  const router = useRouter()
  const { userProfile } = useAuth()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setProfileImage(null)
  }

  const handleAvailabilityChange = (day: string, field: string, value: any) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    // Show password prompt for admin verification
    setShowPasswordPrompt(true)
  }

  const handleCreateDoctor = async () => {
    if (!adminPassword) {
      setError("Admin password is required to create doctor accounts")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await doctorService.createDoctor(
        {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          specialization: formData.specialization,
          licenseNumber: formData.licenseNumber,
          hospitalAffiliation: formData.hospitalAffiliation,
          profileImage: profileImage || undefined,
          availability,
        },
        userProfile?.email || "",
        adminPassword,
      )

      setSuccess("Doctor account created successfully!")
      setShowPasswordPrompt(false)
      setAdminPassword("")

      setTimeout(() => {
        router.push("/doctors")
      }, 2000)
    } catch (error: any) {
      console.error("Error creating doctor:", error)
      if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists")
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak")
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address")
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect admin password")
      } else if (error.code === "auth/invalid-credential") {
        setError("Invalid admin credentials")
      } else {
        setError(error.message || "Failed to create doctor account")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Add New Doctor</CardTitle>
                <CardDescription>Register a new doctor in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {!showPasswordPrompt ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Image Upload */}
                    <div className="space-y-2">
                      <Label>Profile Image</Label>
                      <div className="flex items-center gap-4">
                        {profileImage ? (
                          <div className="relative">
                            <img
                              src={profileImage || "/placeholder.svg"}
                              alt="Profile preview"
                              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                            <Upload className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="profile-image"
                          />
                          <Label htmlFor="profile-image" className="cursor-pointer">
                            <Button type="button" variant="outline" asChild>
                              <span>Upload Image</span>
                            </Button>
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hospitalAffiliation">Hospital Affiliation</Label>
                      <Input
                        id="hospitalAffiliation"
                        value={formData.hospitalAffiliation}
                        onChange={(e) => setFormData({ ...formData, hospitalAffiliation: e.target.value })}
                        required
                      />
                    </div>

                    {/* Availability Schedule */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Availability Schedule</Label>
                      <div className="space-y-3">
                        {daysOfWeek.map((day) => (
                          <div key={day.id} className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className="flex items-center space-x-2 min-w-[120px]">
                              <Checkbox
                                id={day.id}
                                checked={availability[day.id as keyof typeof availability].available}
                                onCheckedChange={(checked) => handleAvailabilityChange(day.id, "available", checked)}
                              />
                              <Label htmlFor={day.id} className="font-medium">
                                {day.label}
                              </Label>
                            </div>
                            {availability[day.id as keyof typeof availability].available && (
                              <div className="flex items-center gap-2">
                                <Label className="text-sm">From:</Label>
                                <Input
                                  type="time"
                                  value={availability[day.id as keyof typeof availability].startTime}
                                  onChange={(e) => handleAvailabilityChange(day.id, "startTime", e.target.value)}
                                  className="w-32"
                                />
                                <Label className="text-sm">To:</Label>
                                <Input
                                  type="time"
                                  value={availability[day.id as keyof typeof availability].endTime}
                                  onChange={(e) => handleAvailabilityChange(day.id, "endTime", e.target.value)}
                                  className="w-32"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <FormError error={error} />

                    <div className="flex gap-4">
                      <Button type="submit" disabled={loading}>
                        Create Doctor Account
                      </Button>
                      <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Admin Verification Required</h3>
                      <p className="text-gray-600 mb-4">
                        Please enter your admin password to create the doctor account
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminPassword">Your Admin Password</Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    <FormError error={error} />
                    <FormSuccess message={success} />

                    <div className="flex gap-4">
                      <Button onClick={handleCreateDoctor} disabled={loading || !adminPassword}>
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating Doctor...
                          </>
                        ) : (
                          "Create Doctor Account"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowPasswordPrompt(false)
                          setAdminPassword("")
                          setError("")
                        }}
                      >
                        Back
                      </Button>
                    </div>
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
