"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function InitializePage() {
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect to dashboard since initialization is no longer needed
    router.push("/dashboard")
  }, [router])

  const initializeData = async () => {
    setIsInitializing(true)
    setError(null)

    try {
      const response = await fetch("/api/initialize", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to initialize data")
      }

      setIsInitialized(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Database className="h-6 w-6" />
            Initialize Database
          </CardTitle>
          <CardDescription>Set up your Firebase database with sample data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isInitialized && !error && (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Click the button below to initialize your database with sample doctors, patients, and appointments.
              </p>
              <Button onClick={initializeData} disabled={isInitializing} className="w-full">
                {isInitializing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  "Initialize Database"
                )}
              </Button>
            </div>
          )}

          {isInitialized && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                <span className="font-semibold">Database Initialized!</span>
              </div>
              <p className="text-sm text-gray-600">
                Your database has been set up with sample data. You can now use the appointment booking system.
              </p>
              <Button asChild className="w-full">
                <a href="/">Go to Dashboard</a>
              </Button>
            </div>
          )}

          {error && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-red-600">
                <AlertCircle className="h-6 w-6" />
                <span className="font-semibold">Error</span>
              </div>
              <p className="text-sm text-red-600">{error}</p>
              <Button onClick={initializeData} variant="outline" className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
