import { collection, doc, getDocs, getDoc, addDoc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

// Types
export interface Patient {
  id?: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  gender: "male" | "female" | "other"
  age: number
  weight?: number
  dateOfBirth?: Date
  address?: string
  medicalHistory?: string
  createdAt: Date
  updatedAt: Date
}

export interface Doctor {
  id?: string
  uid?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  specialization: string
  licenseNumber: string
  hospitalAffiliation: string
  profileImage?: string
  availability?: Record<string, { available: boolean; startTime: string; endTime: string }>
  isActive?: boolean
  createdAt: Date
}

export interface Appointment {
  id?: string
  patientId: string
  doctorId: string
  appointmentDate: Date
  appointmentTime: string
  durationMinutes: number
  status: "scheduled" | "completed" | "cancelled" | "no-show" | "in-progress" | "rescheduled"
  reason?: string
  notes?: string
  aiAgentBooking: boolean
  createdAt: Date
  updatedAt: Date
  // Consultation fields
  consultationNotes?: string
  diagnosis?: string
  prescription?: string
  followUpInstructions?: string
  consultationStartedAt?: Date
  completedAt?: Date
  // Cancellation fields
  cancellationReason?: string
  cancelledAt?: Date
  notifyPatient?: boolean
  // Reschedule fields
  rescheduleReason?: string
  rescheduledAt?: Date
  // No-show fields
  noShowAt?: Date
}

export interface PatientInteraction {
  id?: string
  patientId: string
  interactionType: string
  interactionDate: Date
  notes: string
  followUpRequired: boolean
  followUpDate?: Date
}

// Helper function to safely convert Firestore data
function safeToDate(timestamp: any): Date {
  if (!timestamp) return new Date()
  if (timestamp.toDate && typeof timestamp.toDate === "function") {
    return timestamp.toDate()
  }
  if (timestamp instanceof Date) {
    return timestamp
  }
  return new Date(timestamp)
}

// Helper function to handle Firebase errors
function handleFirebaseError(error: any, operation: string) {
  console.error(`Firebase error in ${operation}:`, error)

  if (error.code === "unavailable") {
    throw new Error(`Unable to connect to the database. Please check your internet connection.`)
  } else if (error.code === "permission-denied") {
    throw new Error(`Access denied. Please check your permissions.`)
  } else if (error.code === "not-found") {
    throw new Error(`Requested data not found.`)
  } else {
    throw new Error(`${operation} failed. Please try again.`)
  }
}

// Add timeout wrapper for Firebase operations
function withTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Operation timeout")), timeoutMs)),
  ])
}

// Patient Services
export const patientService = {
  async getAll(): Promise<Patient[]> {
    try {
      const querySnapshot = await withTimeout(getDocs(collection(db, "patients")))
      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          gender: data.gender || "other",
          age: data.age || 0,
          weight: data.weight || undefined,
          address: data.address || "",
          medicalHistory: data.medicalHistory || "",
          createdAt: safeToDate(data.createdAt),
          updatedAt: safeToDate(data.updatedAt),
          dateOfBirth: data.dateOfBirth ? safeToDate(data.dateOfBirth) : undefined,
        } as Patient
      })
    } catch (error) {
      handleFirebaseError(error, "fetching patients")
      return []
    }
  },

  async getById(id: string): Promise<Patient | null> {
    try {
      const docRef = doc(db, "patients", id)
      const docSnap = await withTimeout(getDoc(docRef))
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          gender: data.gender || "other",
          age: data.age || 0,
          weight: data.weight || undefined,
          address: data.address || "",
          medicalHistory: data.medicalHistory || "",
          createdAt: safeToDate(data.createdAt),
          updatedAt: safeToDate(data.updatedAt),
          dateOfBirth: data.dateOfBirth ? safeToDate(data.dateOfBirth) : undefined,
        } as Patient
      }
      return null
    } catch (error) {
      console.error("Error fetching patient:", error)
      return null
    }
  },

  async getByEmail(email: string): Promise<Patient | null> {
    try {
      const querySnapshot = await withTimeout(getDocs(collection(db, "patients")))

      for (const doc of querySnapshot.docs) {
        const data = doc.data()
        if (data.email === email) {
          return {
            id: doc.id,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            gender: data.gender || "other",
            age: data.age || 0,
            weight: data.weight || undefined,
            address: data.address || "",
            medicalHistory: data.medicalHistory || "",
            createdAt: safeToDate(data.createdAt),
            updatedAt: safeToDate(data.updatedAt),
            dateOfBirth: data.dateOfBirth ? safeToDate(data.dateOfBirth) : undefined,
          } as Patient
        }
      }

      return null
    } catch (error) {
      console.error("Error fetching patient by email:", error)
      return null
    }
  },

  async create(patient: Omit<Patient, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const now = Timestamp.now()
      const docRef = await withTimeout(
        addDoc(collection(db, "patients"), {
          firstName: patient.firstName || "",
          lastName: patient.lastName || "",
          email: patient.email || "",
          phone: patient.phone || "",
          gender: patient.gender || "other",
          age: patient.age || 0,
          weight: patient.weight || null,
          address: patient.address || "",
          medicalHistory: patient.medicalHistory || "",
          dateOfBirth: patient.dateOfBirth ? Timestamp.fromDate(patient.dateOfBirth) : null,
          createdAt: now,
          updatedAt: now,
        }),
      )
      return docRef.id
    } catch (error) {
      handleFirebaseError(error, "creating patient")
      throw error
    }
  },

  async update(id: string, updates: Partial<Patient>): Promise<void> {
    try {
      const docRef = doc(db, "patients", id)
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      }
      if (updates.dateOfBirth) {
        updateData.dateOfBirth = Timestamp.fromDate(updates.dateOfBirth)
      }
      await withTimeout(updateDoc(docRef, updateData))
    } catch (error) {
      handleFirebaseError(error, "updating patient")
      throw error
    }
  },
}

// Doctor Services
export const doctorService = {
  async getAll(): Promise<Doctor[]> {
    try {
      const querySnapshot = await withTimeout(getDocs(collection(db, "userProfiles")))
      const doctors: Doctor[] = []

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data()
        if (data.role === "doctor" && data.isActive !== false) {
          doctors.push({
            id: doc.id,
            uid: data.uid || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            specialization: data.specialization || "",
            licenseNumber: data.licenseNumber || "",
            hospitalAffiliation: data.hospitalAffiliation || "",
            profileImage: data.profileImage || "",
            availability: data.availability || {},
            isActive: data.isActive !== false,
            createdAt: safeToDate(data.createdAt),
          })
        }
      })

      return doctors
    } catch (error) {
      handleFirebaseError(error, "fetching doctors")
      return []
    }
  },

  async getAllIncludingInactive(): Promise<Doctor[]> {
    try {
      const querySnapshot = await withTimeout(getDocs(collection(db, "userProfiles")))
      const doctors: Doctor[] = []

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data()
        if (data.role === "doctor") {
          doctors.push({
            id: doc.id,
            uid: data.uid || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            specialization: data.specialization || "",
            licenseNumber: data.licenseNumber || "",
            hospitalAffiliation: data.hospitalAffiliation || "",
            profileImage: data.profileImage || "",
            availability: data.availability || {},
            isActive: data.isActive !== false,
            createdAt: safeToDate(data.createdAt),
          })
        }
      })

      return doctors
    } catch (error) {
      handleFirebaseError(error, "fetching doctors")
      return []
    }
  },

  async getActiveOnly(): Promise<Doctor[]> {
    try {
      const allDoctors = await this.getAllIncludingInactive()
      return allDoctors.filter((doctor) => doctor.isActive !== false)
    } catch (error) {
      console.error("Error fetching active doctors:", error)
      return []
    }
  },

  async getById(id: string): Promise<Doctor | null> {
    try {
      const docRef = doc(db, "userProfiles", id)
      const docSnap = await withTimeout(getDoc(docRef))
      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data.role === "doctor") {
          return {
            id: docSnap.id,
            uid: data.uid || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            specialization: data.specialization || "",
            licenseNumber: data.licenseNumber || "",
            hospitalAffiliation: data.hospitalAffiliation || "",
            profileImage: data.profileImage || "",
            availability: data.availability || {},
            isActive: data.isActive !== false,
            createdAt: safeToDate(data.createdAt),
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error fetching doctor:", error)
      return null
    }
  },

  async update(id: string, updates: Partial<Doctor>): Promise<void> {
    try {
      const docRef = doc(db, "userProfiles", id)
      await withTimeout(
        updateDoc(docRef, {
          ...updates,
          updatedAt: Timestamp.now(),
        }),
      )
    } catch (error) {
      handleFirebaseError(error, "updating doctor")
      throw error
    }
  },

  async deactivate(id: string): Promise<void> {
    try {
      const docRef = doc(db, "userProfiles", id)
      await withTimeout(
        updateDoc(docRef, {
          isActive: false,
          updatedAt: Timestamp.now(),
        }),
      )
    } catch (error) {
      handleFirebaseError(error, "deactivating doctor")
      throw error
    }
  },

  async activate(id: string): Promise<void> {
    try {
      const docRef = doc(db, "userProfiles", id)
      await withTimeout(
        updateDoc(docRef, {
          isActive: true,
          updatedAt: Timestamp.now(),
        }),
      )
    } catch (error) {
      handleFirebaseError(error, "activating doctor")
      throw error
    }
  },
}

// Appointment Services
export const appointmentService = {
  async getAll(): Promise<(Appointment & { patient: Patient | null; doctor: Doctor | null })[]> {
    try {
      const querySnapshot = await withTimeout(getDocs(collection(db, "appointments")))
      const appointments = []

      for (const docSnap of querySnapshot.docs) {
        try {
          const appointmentData = docSnap.data()

          // Safely get patient and doctor data
          const patient = appointmentData.patientId ? await patientService.getById(appointmentData.patientId) : null
          const doctor = appointmentData.doctorId ? await doctorService.getById(appointmentData.doctorId) : null

          appointments.push({
            id: docSnap.id,
            patientId: appointmentData.patientId || "",
            doctorId: appointmentData.doctorId || "",
            appointmentDate: safeToDate(appointmentData.appointmentDate),
            appointmentTime: appointmentData.appointmentTime || "",
            durationMinutes: appointmentData.durationMinutes || 30,
            status: appointmentData.status || "scheduled",
            reason: appointmentData.reason || "",
            notes: appointmentData.notes || "",
            aiAgentBooking: appointmentData.aiAgentBooking || false,
            createdAt: safeToDate(appointmentData.createdAt),
            updatedAt: safeToDate(appointmentData.updatedAt),
            // Consultation fields
            consultationNotes: appointmentData.consultationNotes || "",
            diagnosis: appointmentData.diagnosis || "",
            prescription: appointmentData.prescription || "",
            followUpInstructions: appointmentData.followUpInstructions || "",
            consultationStartedAt: appointmentData.consultationStartedAt
              ? safeToDate(appointmentData.consultationStartedAt)
              : undefined,
            completedAt: appointmentData.completedAt ? safeToDate(appointmentData.completedAt) : undefined,
            // Cancellation fields
            cancellationReason: appointmentData.cancellationReason || "",
            cancelledAt: appointmentData.cancelledAt ? safeToDate(appointmentData.cancelledAt) : undefined,
            notifyPatient: appointmentData.notifyPatient || false,
            // Reschedule fields
            rescheduleReason: appointmentData.rescheduleReason || "",
            rescheduledAt: appointmentData.rescheduledAt ? safeToDate(appointmentData.rescheduledAt) : undefined,
            // No-show fields
            noShowAt: appointmentData.noShowAt ? safeToDate(appointmentData.noShowAt) : undefined,
            patient,
            doctor,
          })
        } catch (error) {
          console.error("Error processing appointment:", error)
          // Continue with other appointments
        }
      }

      return appointments.sort((a, b) => b.appointmentDate.getTime() - a.appointmentDate.getTime())
    } catch (error) {
      handleFirebaseError(error, "fetching appointments")
      return []
    }
  },

  async getUpcoming(): Promise<number> {
    try {
      const querySnapshot = await withTimeout(getDocs(collection(db, "appointments")))
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      let count = 0
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data()
        const appointmentDate = safeToDate(data.appointmentDate)
        if (appointmentDate >= today && data.status !== "cancelled") {
          count++
        }
      })

      return count
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error)
      return 0
    }
  },

  async getAIBookings(days = 30): Promise<number> {
    try {
      const querySnapshot = await withTimeout(getDocs(collection(db, "appointments")))
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - days)

      let count = 0
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data()
        const appointmentDate = safeToDate(data.appointmentDate)
        if (data.aiAgentBooking === true && appointmentDate >= pastDate) {
          count++
        }
      })

      return count
    } catch (error) {
      console.error("Error fetching AI bookings:", error)
      return 0
    }
  },

  async getRecentAIBookings(
    limitCount = 5,
  ): Promise<(Appointment & { patient: Patient | null; doctor: Doctor | null })[]> {
    try {
      const querySnapshot = await withTimeout(getDocs(collection(db, "appointments")))
      const aiAppointments = []

      for (const docSnap of querySnapshot.docs) {
        try {
          const appointmentData = docSnap.data()

          if (appointmentData.aiAgentBooking === true) {
            const patient = appointmentData.patientId ? await patientService.getById(appointmentData.patientId) : null
            const doctor = appointmentData.doctorId ? await doctorService.getById(appointmentData.doctorId) : null

            aiAppointments.push({
              id: docSnap.id,
              patientId: appointmentData.patientId || "",
              doctorId: appointmentData.doctorId || "",
              appointmentDate: safeToDate(appointmentData.appointmentDate),
              appointmentTime: appointmentData.appointmentTime || "",
              durationMinutes: appointmentData.durationMinutes || 30,
              status: appointmentData.status || "scheduled",
              reason: appointmentData.reason || "",
              notes: appointmentData.notes || "",
              aiAgentBooking: appointmentData.aiAgentBooking || false,
              createdAt: safeToDate(appointmentData.createdAt),
              updatedAt: safeToDate(appointmentData.updatedAt),
              consultationNotes: appointmentData.consultationNotes || "",
              diagnosis: appointmentData.diagnosis || "",
              prescription: appointmentData.prescription || "",
              followUpInstructions: appointmentData.followUpInstructions || "",
              patient,
              doctor,
            })
          }
        } catch (error) {
          console.error("Error processing AI appointment:", error)
          // Continue with other appointments
        }
      }

      return aiAppointments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limitCount)
    } catch (error) {
      console.error("Error fetching recent AI bookings:", error)
      return []
    }
  },

  async create(appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const now = Timestamp.now()
      const docRef = await withTimeout(
        addDoc(collection(db, "appointments"), {
          patientId: appointment.patientId || "",
          doctorId: appointment.doctorId || "",
          appointmentDate: Timestamp.fromDate(appointment.appointmentDate),
          appointmentTime: appointment.appointmentTime || "",
          durationMinutes: appointment.durationMinutes || 30,
          status: appointment.status || "scheduled",
          reason: appointment.reason || "",
          notes: appointment.notes || "",
          aiAgentBooking: appointment.aiAgentBooking || false,
          createdAt: now,
          updatedAt: now,
        }),
      )
      return docRef.id
    } catch (error) {
      handleFirebaseError(error, "creating appointment")
      throw error
    }
  },

  async update(id: string, updates: Partial<Appointment>): Promise<void> {
    try {
      const docRef = doc(db, "appointments", id)
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      }

      // Convert Date objects to Timestamps
      if (updates.appointmentDate) {
        updateData.appointmentDate = Timestamp.fromDate(updates.appointmentDate)
      }
      if (updates.consultationStartedAt) {
        updateData.consultationStartedAt = Timestamp.fromDate(updates.consultationStartedAt)
      }
      if (updates.completedAt) {
        updateData.completedAt = Timestamp.fromDate(updates.completedAt)
      }
      if (updates.cancelledAt) {
        updateData.cancelledAt = Timestamp.fromDate(updates.cancelledAt)
      }
      if (updates.rescheduledAt) {
        updateData.rescheduledAt = Timestamp.fromDate(updates.rescheduledAt)
      }
      if (updates.noShowAt) {
        updateData.noShowAt = Timestamp.fromDate(updates.noShowAt)
      }

      await withTimeout(updateDoc(docRef, updateData))
    } catch (error) {
      handleFirebaseError(error, "updating appointment")
      throw error
    }
  },

  async checkConflict(doctorId: string, appointmentDate: Date, appointmentTime: string): Promise<boolean> {
    try {
      const querySnapshot = await withTimeout(getDocs(collection(db, "appointments")))
      const targetDateString = appointmentDate.toDateString()

      for (const doc of querySnapshot.docs) {
        const data = doc.data()
        const docDate = safeToDate(data.appointmentDate)

        if (
          data.doctorId === doctorId &&
          docDate.toDateString() === targetDateString &&
          data.appointmentTime === appointmentTime &&
          data.status !== "cancelled"
        ) {
          return true
        }
      }

      return false
    } catch (error) {
      console.error("Error checking appointment conflict:", error)
      return false
    }
  },
}

// Patient Interaction Services
export const patientInteractionService = {
  async create(interaction: Omit<PatientInteraction, "id" | "interactionDate">): Promise<string> {
    try {
      const docRef = await withTimeout(
        addDoc(collection(db, "patientInteractions"), {
          patientId: interaction.patientId || "",
          interactionType: interaction.interactionType || "",
          notes: interaction.notes || "",
          followUpRequired: interaction.followUpRequired || false,
          interactionDate: Timestamp.now(),
          followUpDate: interaction.followUpDate ? Timestamp.fromDate(interaction.followUpDate) : null,
        }),
      )
      return docRef.id
    } catch (error) {
      handleFirebaseError(error, "creating patient interaction")
      throw error
    }
  },

  async getByPatientId(patientId: string): Promise<PatientInteraction[]> {
    try {
      const querySnapshot = await withTimeout(getDocs(collection(db, "patientInteractions")))
      const interactions: PatientInteraction[] = []

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data()
        if (data.patientId === patientId) {
          interactions.push({
            id: doc.id,
            patientId: data.patientId || "",
            interactionType: data.interactionType || "",
            notes: data.notes || "",
            followUpRequired: data.followUpRequired || false,
            interactionDate: safeToDate(data.interactionDate),
            followUpDate: data.followUpDate ? safeToDate(data.followUpDate) : undefined,
          } as PatientInteraction)
        }
      })

      return interactions.sort((a, b) => b.interactionDate.getTime() - a.interactionDate.getTime())
    } catch (error) {
      console.error("Error fetching patient interactions:", error)
      return []
    }
  },
}

// Initialize sample data function
export async function initializeSampleData() {
  try {
    // Check if data already exists
    const patientsSnapshot = await withTimeout(getDocs(collection(db, "patients")))
    if (patientsSnapshot.docs.length > 0) {
      console.log("Sample data already exists")
      return
    }

    // Create sample patients
    const samplePatients = [
      {
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@email.com",
        phone: "+1234567890",
        gender: "male" as const,
        age: 35,
        weight: 75.5,
        address: "123 Main St, City, State 12345",
        medicalHistory: "No known allergies. Previous surgery: Appendectomy (2018)",
      },
      {
        firstName: "Maria",
        lastName: "Garcia",
        email: "maria.garcia@email.com",
        phone: "+1234567891",
        gender: "female" as const,
        age: 28,
        weight: 62.0,
        address: "456 Oak Ave, City, State 12345",
        medicalHistory: "Allergic to penicillin. Diabetes Type 2",
      },
      {
        firstName: "David",
        lastName: "Wilson",
        email: "david.wilson@email.com",
        phone: "+1234567892",
        gender: "male" as const,
        age: 42,
        weight: 80.2,
        address: "789 Pine St, City, State 12345",
        medicalHistory: "Hypertension, taking medication",
      },
    ]

    for (const patient of samplePatients) {
      await patientService.create({
        ...patient,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    console.log("Sample data initialized successfully")
  } catch (error) {
    handleFirebaseError(error, "initializing sample data")
    throw error
  }
}
