"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Bot, Home, LogOut, User, Stethoscope } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { userProfile, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  // Don't show navigation on login/register pages
  if (pathname === "/login" || pathname === "/register" || pathname === "/unauthorized") {
    return null
  }

  // Don't show navigation if no user profile (not authenticated)
  if (!userProfile) {
    return null
  }

  // Admin navigation items
  const adminNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/appointments", label: "Appointments", icon: Calendar },
    { href: "/patients", label: "Patients", icon: Users },
    { href: "/doctors", label: "Doctors", icon: Stethoscope },
    { href: "/ai-agent", label: "AI Agent", icon: Bot },
  ]

  // Doctor navigation items
  const doctorNavItems = [
    { href: "/doctor/dashboard", label: "Dashboard", icon: Home },
    { href: "/doctor/appointments", label: "My Appointments", icon: Calendar },
    { href: "/doctor/patients", label: "My Patients", icon: Users },
  ]

  const navItems = userProfile?.role === "admin" ? adminNavItems : doctorNavItems

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              href={userProfile?.role === "admin" ? "/dashboard" : "/doctor/dashboard"}
              className="text-xl font-bold text-gray-900"
            >
              MedBook AI
            </Link>
            <div className="flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button variant={isActive ? "default" : "ghost"} size="sm" className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {userProfile?.firstName} {userProfile?.lastName}
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
                  {userProfile?.role}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
