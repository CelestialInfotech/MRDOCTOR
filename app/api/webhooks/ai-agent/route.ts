import { type NextRequest, NextResponse } from "next/server"
import { doctorService, appointmentService } from "@/lib/firebase-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle different types of AI agent events
    const { eventType, data } = body

    switch (eventType) {
      case "appointment_request":
        return await handleAppointmentRequest(data)
      case "patient_inquiry":
        return await handlePatientInquiry(data)
      case "availability_check":
        return await handleAvailabilityCheck(data)
      default:
        return NextResponse.json({ error: "Unknown event type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleAppointmentRequest(data: any) {
  const { patientInfo, preferredDoctor, preferredDate, preferredTime, reason } = data

  // Find available doctors if no specific doctor is requested
  let availableDoctors = []
  if (!preferredDoctor) {
    const allDoctors = await doctorService.getAll()
    const allAppointments = await appointmentService.getAll()

    availableDoctors = allDoctors.filter((doctor) => {
      return !allAppointments.some(
        (apt) =>
          apt.doctorId === doctor.id &&
          apt.appointmentDate.toDateString() === new Date(preferredDate).toDateString() &&
          apt.appointmentTime === preferredTime &&
          apt.status !== "cancelled",
      )
    })
  }

  return NextResponse.json({
    success: true,
    availableDoctors,
    suggestedTimes: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  })
}

async function handlePatientInquiry(data: any) {
  // Handle general patient inquiries
  const { patientEmail, inquiryType, message } = data

  // This would typically log the interaction
  // Implementation depends on your specific requirements

  return NextResponse.json({
    success: true,
    message: "Inquiry logged successfully",
  })
}

async function handleAvailabilityCheck(data: any) {
  // Check doctor availability
  const { doctorId, date } = data

  const allAppointments = await appointmentService.getAll()
  const doctorAppointments = allAppointments.filter(
    (apt) =>
      apt.doctorId === doctorId &&
      apt.appointmentDate.toDateString() === new Date(date).toDateString() &&
      apt.status !== "cancelled",
  )

  const bookedTimes = doctorAppointments.map((apt) => apt.appointmentTime)
  const allTimes = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ]
  const availableTimes = allTimes.filter((time) => !bookedTimes.includes(time))

  return NextResponse.json({
    success: true,
    availableTimes,
    bookedTimes,
  })
}
