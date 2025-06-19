import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

interface CreateDoctorData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  specialization: string
  licenseNumber: string
  hospitalAffiliation: string
  profileImage?: string
  availability?: {
    [key: string]: {
      available: boolean
      startTime: string
      endTime: string
    }
  }
}

export const doctorService = {
  async createDoctor(doctorData: CreateDoctorData, currentUserEmail: string, currentUserPassword: string) {
    // Store current user info
    const currentUser = auth.currentUser

    try {
      // Create the doctor account
      const { user: newDoctor } = await createUserWithEmailAndPassword(auth, doctorData.email, doctorData.password)

      // Create doctor profile in Firestore
      const doctorProfile = {
        uid: newDoctor.uid,
        email: doctorData.email,
        role: "doctor",
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        phone: doctorData.phone || "",
        specialization: doctorData.specialization,
        licenseNumber: doctorData.licenseNumber,
        hospitalAffiliation: doctorData.hospitalAffiliation,
        profileImage: doctorData.profileImage || "",
        availability: doctorData.availability || {},
      }

      await setDoc(doc(db, "userProfiles", newDoctor.uid), doctorProfile)

      // Sign out the newly created doctor account
      await signOut(auth)

      // Sign back in as the original admin user
      if (currentUserEmail && currentUserPassword) {
        await signInWithEmailAndPassword(auth, currentUserEmail, currentUserPassword)
      }

      return newDoctor.uid
    } catch (error) {
      // If something goes wrong, try to sign back in as admin
      try {
        if (currentUserEmail && currentUserPassword) {
          await signInWithEmailAndPassword(auth, currentUserEmail, currentUserPassword)
        }
      } catch (signInError) {
        console.error("Failed to sign back in as admin:", signInError)
      }
      throw error
    }
  },
}
