import { NextResponse } from "next/server"
import { getDocs, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(req: Request) {
  const data = await req.json()
  const type = data.type

  if (type === "availability_check") {
    return handleAvailabilityCheck(data)
  }

  return NextResponse.json({
    success: false,
    message: "Unknown type",
  })
}

async function handleAvailabilityCheck(data: any) {
  // Check doctor availability
  const { doctorId, date } = data

  const querySnapshot = await getDocs(collection(db, "appointments"))
  const targetDate = new Date(date)

  const bookedTimes: string[] = []

  querySnapshot.docs.forEach((doc) => {
    const appointmentData = doc.data()
    const appointmentDate = appointmentData.appointmentDate?.toDate()

    if (
      appointmentData.doctorId === doctorId &&
      appointmentDate?.toDateString() === targetDate.toDateString() &&
      appointmentData.status !== "cancelled"
    ) {
      bookedTimes.push(appointmentData.appointmentTime)
    }
  })

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
