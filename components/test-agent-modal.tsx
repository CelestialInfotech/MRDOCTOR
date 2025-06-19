"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, User, Send, X } from "lucide-react"
import { doctorService, appointmentService, patientService } from "@/lib/firebase-service"

interface Message {
  id: string
  type: "user" | "agent"
  content: string
  timestamp: Date
}

interface TestAgentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface BookingSession {
  step: "initial" | "doctor_selected" | "patient_info" | "date_time" | "confirmation"
  selectedDoctor?: any
  patientInfo?: {
    firstName: string
    lastName: string
    email: string
    phone: string
    age?: number
    gender?: string
  }
  selectedDate?: string
  selectedTime?: string
  reason?: string
}

export function TestAgentModal({ open, onOpenChange }: TestAgentModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "agent",
      content:
        "Hello! I'm your AI medical assistant. I can help you book appointments, check doctor availability, and answer questions about our services. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [bookingSession, setBookingSession] = useState<BookingSession>({ step: "initial" })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Generate 15-minute time slots
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 17 && minute > 0) break // Stop at 5:00 PM
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        slots.push({ value: timeString, display: displayTime })
      }
    }
    return slots
  }

  // Check if time slot is available
  const checkSlotAvailability = async (doctorId: string, date: string, time: string) => {
    try {
      const appointments = await appointmentService.getAll()
      const targetDate = new Date(date)

      const conflictingAppointment = appointments.find((apt) => {
        const aptDate = new Date(apt.appointmentDate)
        return (
          apt.doctorId === doctorId &&
          aptDate.toDateString() === targetDate.toDateString() &&
          apt.appointmentTime === time &&
          apt.status !== "cancelled"
        )
      })

      return !conflictingAppointment
    } catch (error) {
      console.error("Error checking slot availability:", error)
      return false
    }
  }

  // Get available slots for a doctor on a specific date
  const getAvailableSlots = async (doctorId: string, date: string) => {
    const allSlots = generateTimeSlots()
    const availableSlots = []

    for (const slot of allSlots) {
      const isAvailable = await checkSlotAvailability(doctorId, date, slot.value)
      if (isAvailable) {
        availableSlots.push(slot)
      }
    }

    return availableSlots
  }

  // Create or find patient
  const createOrFindPatient = async (patientInfo: any) => {
    try {
      // First try to find existing patient by email
      if (patientInfo.email) {
        const existingPatient = await patientService.getByEmail(patientInfo.email)
        if (existingPatient) {
          return existingPatient
        }
      }

      // Create new patient
      const patientId = await patientService.create({
        firstName: patientInfo.firstName,
        lastName: patientInfo.lastName,
        email: patientInfo.email || "",
        phone: patientInfo.phone || "",
        gender: patientInfo.gender || "other",
        age: patientInfo.age || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      return await patientService.getById(patientId)
    } catch (error) {
      console.error("Error creating/finding patient:", error)
      throw error
    }
  }

  // Book appointment
  const bookAppointment = async (session: BookingSession) => {
    try {
      if (!session.selectedDoctor || !session.patientInfo || !session.selectedDate || !session.selectedTime) {
        throw new Error("Missing required booking information")
      }

      // Check slot availability one more time
      const isAvailable = await checkSlotAvailability(
        session.selectedDoctor.id,
        session.selectedDate,
        session.selectedTime,
      )

      if (!isAvailable) {
        throw new Error("SLOT_UNAVAILABLE")
      }

      // Create or find patient
      const patient = await createOrFindPatient(session.patientInfo)
      if (!patient) {
        throw new Error("Failed to create patient record")
      }

      // Create appointment
      const appointmentId = await appointmentService.create({
        patientId: patient.id!,
        doctorId: session.selectedDoctor.id,
        appointmentDate: new Date(session.selectedDate),
        appointmentTime: session.selectedTime,
        durationMinutes: 15,
        status: "scheduled",
        reason: session.reason || "General consultation",
        aiAgentBooking: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      return { appointmentId, patient }
    } catch (error) {
      console.error("Error booking appointment:", error)
      throw error
    }
  }

  const getAgentResponse = async (userMessage: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1500))

    const msg = userMessage.toLowerCase()

    try {
      // Handle booking flow
      if (bookingSession.step !== "initial") {
        return await handleBookingFlow(userMessage)
      }

      // Check doctor availability
      if (msg.includes("doctor") || msg.includes("available") || msg.includes("schedule")) {
        const doctors = await doctorService.getAll()
        if (doctors.length === 0) {
          return "I'm sorry, but I couldn't retrieve doctor information at the moment. Please try again later or contact our office directly."
        }

        let response = "Here are our available doctors:\n\n"
        doctors.slice(0, 5).forEach((doctor, index) => {
          response += `**${index + 1}. Dr. ${doctor.firstName} ${doctor.lastName}** - ${doctor.specialization}\n`
          response += `   📧 ${doctor.email}\n`
          if (doctor.phone) response += `   📞 ${doctor.phone}\n`
          response += `   🏥 ${doctor.hospitalAffiliation}\n\n`
        })

        if (doctors.length > 5) {
          response += `And ${doctors.length - 5} more doctors available.\n\n`
        }

        response += "Would you like to book an appointment with any of these doctors?"
        return response
      }

      // Start booking process
      if (msg.includes("book") || msg.includes("appointment") || msg.includes("schedule")) {
        const doctors = await doctorService.getAll()
        if (doctors.length === 0) {
          return "I'm sorry, but I couldn't retrieve doctor information for booking. Please try again later."
        }

        setBookingSession({ step: "doctor_selected" })

        let response = "I'd be happy to help you book an appointment! 📅\n\n"
        response += "**Available Doctors:**\n"
        doctors.slice(0, 5).forEach((doctor, index) => {
          response += `**${index + 1}.** Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialization}\n`
        })

        response +=
          "\nPlease tell me which doctor you'd like to see by saying their name or number (e.g., 'Dr. Johnson' or 'Doctor 1')."
        return response
      }

      // Check appointments
      if (msg.includes("my appointment") || msg.includes("check appointment")) {
        const appointments = await appointmentService.getAll()
        const recentAppointments = appointments.slice(0, 3)

        if (recentAppointments.length === 0) {
          return "I don't see any recent appointments in our system. Would you like to book a new appointment?"
        }

        let response = "Here are some recent appointments from our system:\n\n"
        recentAppointments.forEach((apt, index) => {
          response += `**Appointment ${index + 1}:**\n`
          response += `• Patient: ${apt.patient?.firstName || "N/A"} ${apt.patient?.lastName || ""}\n`
          response += `• Doctor: ${apt.doctor?.firstName || "N/A"} ${apt.doctor?.lastName || ""}\n`
          response += `• Date: ${apt.appointmentDate.toLocaleDateString()}\n`
          response += `• Time: ${apt.appointmentTime}\n`
          response += `• Status: ${apt.status}\n\n`
        })

        response += "To check your specific appointment, please provide your full name and appointment date."
        return response
      }

      // Cancel appointment
      if (msg.includes("cancel")) {
        const appointments = await appointmentService.getAll()
        const upcomingAppointments = appointments
          .filter((apt) => apt.appointmentDate > new Date() && apt.status === "scheduled")
          .slice(0, 3)

        let response = "I can help you cancel your appointment. 🗓️\n\n"

        if (upcomingAppointments.length > 0) {
          response += "Here are some upcoming appointments that can be cancelled:\n\n"
          upcomingAppointments.forEach((apt, index) => {
            response += `**${index + 1}.** ${apt.patient?.firstName || "Patient"} with Dr. ${apt.doctor?.firstName || "Doctor"} ${apt.doctor?.lastName || ""}\n`
            response += `   📅 ${apt.appointmentDate.toLocaleDateString()} at ${apt.appointmentTime}\n\n`
          })
        }

        response += "To cancel your appointment, please provide:\n"
        response += "• Your full name\n"
        response += "• Appointment date and time\n"
        response += "• Doctor's name\n\n"
        response += "I'll cancel it and send you a confirmation."

        return response
      }

      // Reschedule appointment
      if (msg.includes("reschedule") || msg.includes("change")) {
        const appointments = await appointmentService.getAll()
        const upcomingAppointments = appointments
          .filter((apt) => apt.appointmentDate > new Date() && apt.status === "scheduled")
          .slice(0, 3)

        let response = "I'll help you reschedule your appointment! 🔄\n\n"

        if (upcomingAppointments.length > 0) {
          response += "Here are some upcoming appointments that can be rescheduled:\n\n"
          upcomingAppointments.forEach((apt, index) => {
            response += `**${index + 1}.** ${apt.patient?.firstName || "Patient"} with Dr. ${apt.doctor?.firstName || "Doctor"} ${apt.doctor?.lastName || ""}\n`
            response += `   📅 ${apt.appointmentDate.toLocaleDateString()} at ${apt.appointmentTime}\n\n`
          })
        }

        response += "To reschedule, please tell me:\n"
        response += "• Your current appointment details\n"
        response += "• Your preferred new date and time\n\n"
        response += "I'll check availability and confirm the new time."

        return response
      }

      // Statistics
      if (msg.includes("stats") || msg.includes("statistics") || msg.includes("how many")) {
        const [doctors, appointments, patients] = await Promise.all([
          doctorService.getAll(),
          appointmentService.getAll(),
          patientService.getAll(),
        ])

        const upcomingAppointments = appointments.filter((apt) => apt.appointmentDate > new Date())
        const completedAppointments = appointments.filter((apt) => apt.status === "completed")

        let response = "📊 **Current System Statistics:**\n\n"
        response += `👨‍⚕️ **Doctors:** ${doctors.length} active doctors\n`
        response += `👥 **Patients:** ${patients.length} registered patients\n`
        response += `📅 **Total Appointments:** ${appointments.length}\n`
        response += `⏰ **Upcoming Appointments:** ${upcomingAppointments.length}\n`
        response += `✅ **Completed Appointments:** ${completedAppointments.length}\n\n`

        if (doctors.length > 0) {
          response += "**Top Specializations:**\n"
          const specializations = doctors.reduce((acc: any, doctor) => {
            acc[doctor.specialization] = (acc[doctor.specialization] || 0) + 1
            return acc
          }, {})

          Object.entries(specializations)
            .slice(0, 3)
            .forEach(([spec, count]) => {
              response += `• ${spec}: ${count} doctor${count !== 1 ? "s" : ""}\n`
            })
        }

        return response
      }

      // Greetings
      if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
        const doctors = await doctorService.getAll()
        return `Hello! Great to meet you! 😊\n\nI'm here to help with all your medical appointment needs. We currently have ${doctors.length} doctors available across various specializations.\n\nWhat can I do for you today?`
      }

      // Default response with real data
      const doctors = await doctorService.getAll()
      const appointments = await appointmentService.getAll()

      return `I'm here to help! 🏥\n\nI can assist you with:\n• Booking appointments (${doctors.length} doctors available)\n• Checking appointment status (${appointments.length} total appointments)\n• Rescheduling or cancelling appointments\n• Finding doctor information\n• Answering questions about our services\n\nCould you tell me more about what you need assistance with?`
    } catch (error) {
      console.error("Error fetching data:", error)
      return "I'm sorry, I'm having trouble accessing our system right now. Please try again in a moment, or contact our office directly for immediate assistance."
    }
  }

  const handleBookingFlow = async (userMessage: string): Promise<string> => {
    const msg = userMessage.toLowerCase()

    try {
      switch (bookingSession.step) {
        case "doctor_selected": {
          const doctors = await doctorService.getAll()
          let selectedDoctor = null

          // Try to match doctor by name or number
          if (msg.includes("dr.") || msg.includes("doctor")) {
            selectedDoctor = doctors.find((doctor) => {
              const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase()
              return msg.includes(fullName) || msg.includes(doctor.lastName.toLowerCase())
            })
          } else {
            // Try to match by number
            const numberMatch = msg.match(/\d+/)
            if (numberMatch) {
              const index = Number.parseInt(numberMatch[0]) - 1
              if (index >= 0 && index < doctors.length) {
                selectedDoctor = doctors[index]
              }
            }
          }

          if (!selectedDoctor) {
            return "I couldn't identify which doctor you'd like to see. Please specify the doctor's name or number from the list above."
          }

          setBookingSession({ ...bookingSession, step: "patient_info", selectedDoctor })

          return `Great! You've selected **Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}** (${selectedDoctor.specialization}).\n\nNow I need your information to book the appointment:\n\n• **Full Name** (First and Last)\n• **Email Address**\n• **Phone Number**\n• **Age** (optional)\n• **Gender** (optional)\n\nPlease provide your full name and email to start.`
        }

        case "patient_info": {
          // Parse patient information from message
          const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
          const phoneRegex = /[+]?[1-9]?[\d\s\-$$$$]{10,}/
          const ageRegex = /\b(\d{1,3})\s*(years?|yrs?|y\.o\.?|age)\b/i

          const email = userMessage.match(emailRegex)?.[0]
          const phone = userMessage.match(phoneRegex)?.[0]
          const ageMatch = userMessage.match(ageRegex)
          const age = ageMatch ? Number.parseInt(ageMatch[1]) : undefined

          // Extract name (assume first part before email/phone is name)
          let name = userMessage.replace(emailRegex, "").replace(phoneRegex, "").trim()
          if (ageMatch) name = name.replace(ageRegex, "").trim()

          const nameParts = name.split(/\s+/)
          const firstName = nameParts[0] || ""
          const lastName = nameParts.slice(1).join(" ") || ""

          if (!firstName || !email) {
            return "I need at least your full name and email address. Please provide both in your message.\n\nExample: 'John Smith john@email.com 555-123-4567'"
          }

          const patientInfo = {
            firstName,
            lastName,
            email,
            phone: phone || "",
            age,
            gender: msg.includes("male") ? "male" : msg.includes("female") ? "female" : "other",
          }

          setBookingSession({ ...bookingSession, step: "date_time", patientInfo })

          return `Perfect! I have your information:\n• **Name:** ${firstName} ${lastName}\n• **Email:** ${email}\n• **Phone:** ${phone || "Not provided"}\n\nNow, please tell me your preferred date and time for the appointment.\n\n**Format:** Please use format like "January 15, 2024 at 2:00 PM" or "2024-01-15 14:00"\n\n**Available hours:** 9:00 AM - 5:00 PM (15-minute slots)\n**Example:** "Tomorrow at 10:30 AM" or "Next Monday at 2:15 PM"`
        }

        case "date_time": {
          // Parse date and time from message
          let selectedDate = ""
          let selectedTime = ""

          // Try to parse various date formats
          const dateRegex = /(\d{4}-\d{2}-\d{2})|(\w+\s+\d{1,2},?\s+\d{4})|(\d{1,2}\/\d{1,2}\/\d{4})/
          const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/

          const dateMatch = userMessage.match(dateRegex)
          const timeMatch = userMessage.match(timeRegex)

          if (dateMatch && timeMatch) {
            // Parse date
            if (dateMatch[1]) {
              // YYYY-MM-DD format
              selectedDate = dateMatch[1]
            } else if (dateMatch[2]) {
              // Month DD, YYYY format
              selectedDate = new Date(dateMatch[2]).toISOString().split("T")[0]
            } else if (dateMatch[3]) {
              // MM/DD/YYYY format
              const parts = dateMatch[3].split("/")
              selectedDate = `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`
            }

            // Parse time
            let hour = Number.parseInt(timeMatch[1])
            const minute = Number.parseInt(timeMatch[2])
            const ampm = timeMatch[3]?.toLowerCase()

            if (ampm === "pm" && hour !== 12) hour += 12
            if (ampm === "am" && hour === 12) hour = 0

            selectedTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
          } else {
            return "I couldn't understand the date and time format. Please use a clear format like:\n\n• 'January 15, 2024 at 2:30 PM'\n• '2024-01-15 14:30'\n• 'Tomorrow at 10:15 AM'\n\nPlease try again with a specific date and time."
          }

          // Validate date is in the future
          const appointmentDate = new Date(selectedDate)
          if (appointmentDate <= new Date()) {
            return "The appointment date must be in the future. Please select a date from tomorrow onwards."
          }

          // Check if time is within business hours and 15-minute intervals
          const [hours, minutes] = selectedTime.split(":").map(Number)
          if (hours < 9 || hours >= 17 || (hours === 17 && minutes > 0)) {
            return "Appointments are only available between 9:00 AM and 5:00 PM. Please select a time within these hours."
          }

          if (minutes % 15 !== 0) {
            return "Appointments are scheduled in 15-minute intervals. Please select a time like 9:00, 9:15, 9:30, 9:45, etc."
          }

          // Check slot availability
          const isAvailable = await checkSlotAvailability(bookingSession.selectedDoctor!.id, selectedDate, selectedTime)

          if (!isAvailable) {
            // Get available slots for that day
            const availableSlots = await getAvailableSlots(bookingSession.selectedDoctor!.id, selectedDate)

            let response = `❌ **Sorry, that time slot is already booked!**\n\n`
            response += `The ${selectedTime} slot on ${appointmentDate.toLocaleDateString()} is not available.\n\n`

            if (availableSlots.length > 0) {
              response += `**Available slots for ${appointmentDate.toLocaleDateString()}:**\n`
              availableSlots.slice(0, 8).forEach((slot) => {
                response += `• ${slot.display}\n`
              })

              if (availableSlots.length > 8) {
                response += `• And ${availableSlots.length - 8} more slots available\n`
              }

              response += `\nPlease select one of these available times.`
            } else {
              response += `No slots are available on ${appointmentDate.toLocaleDateString()}. Please choose a different date.`
            }

            return response
          }

          setBookingSession({ ...bookingSession, step: "confirmation", selectedDate, selectedTime })

          const displayTime = new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })

          return `✅ **Great! That time slot is available.**\n\n**Appointment Summary:**\n• **Doctor:** Dr. ${bookingSession.selectedDoctor!.firstName} ${bookingSession.selectedDoctor!.lastName}\n• **Specialization:** ${bookingSession.selectedDoctor!.specialization}\n• **Patient:** ${bookingSession.patientInfo!.firstName} ${bookingSession.patientInfo!.lastName}\n• **Date:** ${appointmentDate.toLocaleDateString()}\n• **Time:** ${displayTime}\n\nWould you like to confirm this appointment? (Type 'yes' to confirm or 'no' to cancel)`
        }

        case "confirmation": {
          if (msg.includes("yes") || msg.includes("confirm")) {
            try {
              const result = await bookAppointment(bookingSession)

              // Reset booking session
              setBookingSession({ step: "initial" })

              return `🎉 **Appointment Successfully Booked!**\n\n**Confirmation Details:**\n• **Appointment ID:** ${result.appointmentId}\n• **Patient:** ${result.patient?.firstName} ${result.patient?.lastName}\n• **Doctor:** Dr. ${bookingSession.selectedDoctor!.firstName} ${bookingSession.selectedDoctor!.lastName}\n• **Date:** ${new Date(bookingSession.selectedDate!).toLocaleDateString()}\n• **Time:** ${new Date(`2000-01-01T${bookingSession.selectedTime!}`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}\n\n📧 A confirmation email will be sent to ${bookingSession.patientInfo!.email}\n📱 You'll receive an SMS reminder 24 hours before your appointment.\n\nIs there anything else I can help you with?`
            } catch (error: any) {
              if (error.message === "SLOT_UNAVAILABLE") {
                setBookingSession({ ...bookingSession, step: "date_time" })
                return "❌ **Sorry, that time slot was just booked by someone else!**\n\nPlease select a different date and time for your appointment."
              }

              setBookingSession({ step: "initial" })
              return "❌ **Sorry, there was an error booking your appointment.**\n\nPlease try again or contact our office directly. The error has been logged for our technical team."
            }
          } else if (msg.includes("no") || msg.includes("cancel")) {
            setBookingSession({ step: "initial" })
            return "No problem! Your appointment booking has been cancelled. Feel free to start over anytime by saying 'book appointment'. Is there anything else I can help you with?"
          } else {
            return "Please type 'yes' to confirm the appointment or 'no' to cancel."
          }
        }

        default:
          setBookingSession({ step: "initial" })
          return "Something went wrong with the booking process. Let's start over. How can I help you today?"
      }
    } catch (error) {
      console.error("Error in booking flow:", error)
      setBookingSession({ step: "initial" })
      return "Sorry, there was an error processing your request. Please try again or contact our support team."
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    try {
      const response = await getAgentResponse(userMessage.content)

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "agent",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, agentMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "agent",
        content: "Sorry, I'm having trouble responding right now. Please try again or contact our support team.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[500px] p-0 flex flex-col" hideCloseButton>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-600 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-sm">AI Medical Assistant</h3>
              <p className="text-xs text-gray-500">
                {bookingSession.step !== "initial" ? "Booking in progress..." : "Online"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "agent" && (
                  <Avatar className="h-6 w-6 mt-1">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      <Bot className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[75%] ${message.type === "user" ? "order-1" : ""}`}>
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {message.type === "user" && (
                  <Avatar className="h-6 w-6 mt-1">
                    <AvatarFallback className="bg-gray-400 text-white text-xs">
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start">
                <Avatar className="h-6 w-6 mt-1">
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    <Bot className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                bookingSession.step === "doctor_selected"
                  ? "Select doctor by name or number..."
                  : bookingSession.step === "patient_info"
                    ? "Enter your name and email..."
                    : bookingSession.step === "date_time"
                      ? "Enter preferred date and time..."
                      : bookingSession.step === "confirmation"
                        ? "Type 'yes' to confirm..."
                        : "Type your message..."
              }
              disabled={isTyping}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={isTyping || !inputMessage.trim()} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
