"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ("admin" | "doctor")[]
  redirectTo?: string
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/login" }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo)
        return
      }

      // If user exists but no profile found, redirect to unauthorized
      if (user && !userProfile) {
        router.push("/unauthorized")
        return
      }

      // Check roles if specified
      if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
        router.push("/unauthorized")
        return
      }
    }
  }, [user, userProfile, loading, router, allowedRoles, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!userProfile) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    return null
  }

  return <>{children}</>
}
