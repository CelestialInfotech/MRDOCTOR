import { NextResponse } from "next/server"
import { initializeSampleData } from "@/lib/firebase-service"

export async function POST() {
  try {
    await initializeSampleData()
    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
  }
}
