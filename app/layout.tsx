import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MedBook AI - Medical Appointment System",
  description: "AI-powered appointment booking system for doctors and hospitals",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ConditionalNavigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

function ConditionalNavigation() {
  // This would need to be a client component to use useAuth
  // For now, we'll show navigation on all pages except login/register
  return <Navigation />
}
