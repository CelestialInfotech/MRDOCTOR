"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export default function UnauthorizedPage() {
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription>Your account is not authorized to access this system</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Please contact your system administrator to get proper access to the MedBook AI system, or sign in with an
            authorized account.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleLogout}>Sign Out & Try Again</Button>
            <Link href="/login">
              <Button variant="outline">Back to Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
