"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

interface UserProfile {
  uid: string
  email: string
  role: "admin" | "doctor"
  firstName: string
  lastName: string
  phone?: string
  specialization?: string
  licenseNumber?: string
  hospitalAffiliation?: string
  profileImage?: string
  availability?: {
    [key: string]: {
      available: boolean
      startTime: string
      endTime: string
    }
  }
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, profile: Omit<UserProfile, "uid">) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        try {
          const profileDoc = await getDoc(doc(db, "userProfiles", user.uid))
          if (profileDoc.exists()) {
            const profileData = profileDoc.data() as UserProfile
            setUserProfile(profileData)
          } else {
            // Don't create default profile - user needs proper profile
            setUserProfile(null)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
          setUserProfile(null)
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, profile: Omit<UserProfile, "uid">) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)

    const userProfile: Record<string, any> = {
      uid: user.uid,
      email: profile.email,
      role: profile.role,
      firstName: profile.firstName,
      lastName: profile.lastName,
    }

    if (profile.phone && profile.phone.trim()) {
      userProfile.phone = profile.phone
    }

    if (profile.role === "doctor") {
      if (profile.specialization && profile.specialization.trim()) {
        userProfile.specialization = profile.specialization
      }
      if (profile.licenseNumber && profile.licenseNumber.trim()) {
        userProfile.licenseNumber = profile.licenseNumber
      }
      if (profile.hospitalAffiliation && profile.hospitalAffiliation.trim()) {
        userProfile.hospitalAffiliation = profile.hospitalAffiliation
      }
      if (profile.profileImage) {
        userProfile.profileImage = profile.profileImage
      }
      if (profile.availability) {
        userProfile.availability = profile.availability
      }
    }

    await setDoc(doc(db, "userProfiles", user.uid), userProfile)
  }

  const logout = async () => {
    await signOut(auth)
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
