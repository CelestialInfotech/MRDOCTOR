"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login since registration is not allowed for general users
    router.push("/login")
  }, [router])

  return null

  // const searchParams = useSearchParams()
  // const defaultRole = (searchParams.get("role") as "admin" | "doctor") || "admin"

  // const [formData, setFormData] = useState({
  //   email: "",
  //   password: "",
  //   confirmPassword: "",
  //   firstName: "",
  //   lastName: "",
  //   phone: "",
  //   role: defaultRole,
  //   specialization: "",
  //   licenseNumber: "",
  //   hospitalAffiliation: "",
  // })
  // const [loading, setLoading] = useState(false)
  // const [error, setError] = useState("")
  // const { signUp } = useAuth()

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setLoading(true)
  //   setError("")

  //   if (formData.password !== formData.confirmPassword) {
  //     setError("Passwords do not match")
  //     setLoading(false)
  //     return
  //   }

  //   if (formData.password.length < 6) {
  //     setError("Password must be at least 6 characters long")
  //     setLoading(false)
  //     return
  //   }

  //   // Validate required fields for doctors
  //   if (formData.role === "doctor") {
  //     if (!formData.specialization.trim()) {
  //       setError("Specialization is required for doctors")
  //       setLoading(false)
  //       return
  //     }
  //     if (!formData.licenseNumber.trim()) {
  //       setError("License number is required for doctors")
  //       setLoading(false)
  //       return
  //     }
  //     if (!formData.hospitalAffiliation.trim()) {
  //       setError("Hospital affiliation is required for doctors")
  //       setLoading(false)
  //       return
  //     }
  //   }

  //   try {
  //     await signUp(formData.email, formData.password, {
  //       email: formData.email,
  //       firstName: formData.firstName,
  //       lastName: formData.lastName,
  //       phone: formData.phone,
  //       role: formData.role,
  //       specialization: formData.role === "doctor" ? formData.specialization : undefined,
  //       licenseNumber: formData.role === "doctor" ? formData.licenseNumber : undefined,
  //       hospitalAffiliation: formData.role === "doctor" ? formData.hospitalAffiliation : undefined,
  //     })
  //     router.push("/dashboard")
  //   } catch (error: any) {
  //     console.error("Registration error:", error)
  //     if (error.code === "auth/email-already-in-use") {
  //       setError("An account with this email already exists")
  //     } else if (error.code === "auth/weak-password") {
  //       setError("Password is too weak")
  //     } else if (error.code === "auth/invalid-email") {
  //       setError("Invalid email address")
  //     } else {
  //       setError(error.message || "Registration failed. Please try again.")
  //     }
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // const handleInputChange = (field: string, value: string) => {
  //   setFormData((prev) => ({ ...prev, [field]: value }))
  // }

  // return (
  //   <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  //     <Card className="w-full max-w-md">
  //       <CardHeader className="text-center">
  //         <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
  //         <CardDescription>Register for MedBook AI</CardDescription>
  //       </CardHeader>
  //       <CardContent>
  //         <form onSubmit={handleSubmit} className="space-y-4">
  //           <div className="grid grid-cols-2 gap-4">
  //             <div className="space-y-2">
  //               <Label htmlFor="firstName">First Name</Label>
  //               <Input
  //                 id="firstName"
  //                 value={formData.firstName}
  //                 onChange={(e) => handleInputChange("firstName", e.target.value)}
  //                 required
  //               />
  //             </div>
  //             <div className="space-y-2">
  //               <Label htmlFor="lastName">Last Name</Label>
  //               <Input
  //                 id="lastName"
  //                 value={formData.lastName}
  //                 onChange={(e) => handleInputChange("lastName", e.target.value)}
  //                 required
  //               />
  //             </div>
  //           </div>

  //           <div className="space-y-2">
  //             <Label htmlFor="email">Email</Label>
  //             <Input
  //               id="email"
  //               type="email"
  //               value={formData.email}
  //               onChange={(e) => handleInputChange("email", e.target.value)}
  //               required
  //             />
  //           </div>

  //           <div className="space-y-2">
  //             <Label htmlFor="phone">Phone</Label>
  //             <Input
  //               id="phone"
  //               type="tel"
  //               value={formData.phone}
  //               onChange={(e) => handleInputChange("phone", e.target.value)}
  //             />
  //           </div>

  //           <div className="space-y-2">
  //             <Label htmlFor="role">Role</Label>
  //             <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
  //               <SelectTrigger>
  //                 <SelectValue />
  //               </SelectTrigger>
  //               <SelectContent>
  //                 <SelectItem value="admin">Admin</SelectItem>
  //                 <SelectItem value="doctor">Doctor</SelectItem>
  //               </SelectContent>
  //             </Select>
  //           </div>

  //           {formData.role === "doctor" && (
  //             <>
  //               <div className="space-y-2">
  //                 <Label htmlFor="specialization">Specialization</Label>
  //                 <Input
  //                   id="specialization"
  //                   value={formData.specialization}
  //                   onChange={(e) => handleInputChange("specialization", e.target.value)}
  //                   required
  //                 />
  //               </div>
  //               <div className="space-y-2">
  //                 <Label htmlFor="licenseNumber">License Number</Label>
  //                 <Input
  //                   id="licenseNumber"
  //                   value={formData.licenseNumber}
  //                   onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
  //                   required
  //                 />
  //               </div>
  //               <div className="space-y-2">
  //                 <Label htmlFor="hospitalAffiliation">Hospital Affiliation</Label>
  //                 <Input
  //                   id="hospitalAffiliation"
  //                   value={formData.hospitalAffiliation}
  //                   onChange={(e) => handleInputChange("hospitalAffiliation", e.target.value)}
  //                   required
  //                 />
  //               </div>
  //             </>
  //           )}

  //           <div className="space-y-2">
  //             <Label htmlFor="password">Password</Label>
  //             <Input
  //               id="password"
  //               type="password"
  //               value={formData.password}
  //               onChange={(e) => handleInputChange("password", e.target.value)}
  //               required
  //             />
  //           </div>

  //           <div className="space-y-2">
  //             <Label htmlFor="confirmPassword">Confirm Password</Label>
  //             <Input
  //               id="confirmPassword"
  //               type="password"
  //               value={formData.confirmPassword}
  //               onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
  //               required
  //             />
  //           </div>

  //           <FormError error={error} />

  //           <Button type="submit" className="w-full" disabled={loading}>
  //             {loading ? (
  //               <>
  //                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
  //                 Creating Account...
  //               </>
  //             ) : (
  //               "Create Account"
  //             )}
  //           </Button>
  //         </form>

  //         <div className="mt-6 text-center">
  //           <p className="text-sm text-gray-600">
  //             Already have an account?{" "}
  //             <Link href="/login" className="text-blue-600 hover:underline">
  //               Sign in
  //             </Link>
  //           </p>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   </div>
  // )
}
