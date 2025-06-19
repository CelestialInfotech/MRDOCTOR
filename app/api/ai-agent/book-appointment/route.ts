import { type NextRequest, NextResponse } from "next/server"
import { patientService, doctorService, appointmentService, patientInteractionService } from "@/lib/firebase-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { patientInfo, doctorId, appointmentDate, appointmentTime, reason } = body

    if (!patientInfo || !doctorId || !appointmentDate || !appointmentTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if patient exists, if not create one
    let patient = await patientService.getByEmail(patientInfo.email)

    if (!patient) {
      // Create new patient - update to use new fields
      const patientId = await patientService.create({
        firstName: patientInfo.firstName,
        lastName: patientInfo.lastName,
        phone: patientInfo.phone || undefined,
        gender: patientInfo.gender || "other",
        age: patientInfo.age || 0,
        weight: patientInfo.weight || undefined,
        dateOfBirth: patientInfo.dateOfBirth ? new Date(patientInfo.dateOfBirth) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      patient = await patientService.getById(patientId)
    }

    // Check doctor exists
    const doctor = await doctorService.getById(doctorId)
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    // Check for conflicting appointments
    const hasConflict = await appointmentService.checkConflict(doctorId, new Date(appointmentDate), appointmentTime)

    if (hasConflict) {
      return NextResponse.json({ error: "Time slot not available" }, { status: 409 })
    }

    // Create the appointment
    const appointmentId = await appointmentService.create({
      patientId: patient!.id!,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      durationMinutes: 30,
      status: "scheduled",
      reason: reason || undefined,
      aiAgentBooking: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Log the interaction
    await patientInteractionService.create({
      patientId: patient!.id!,
      interactionType: "ai_booking",
      notes: "Appointment booked via AI agent",
      followUpRequired: false,
    })

    return NextResponse.json({
      success: true,
      appointmentId,
      patient,
      doctor,
    })
  } catch (error) {
    console.error("Error booking appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
