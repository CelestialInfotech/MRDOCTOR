import { type NextRequest, NextResponse } from "next/server"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter required" }, { status: 400 })
    }

    // Get all user profiles to find the one with matching email
    const querySnapshot = await getDocs(collection(db, "userProfiles"))
    let userProfile = null

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data()
      if (data.email === email) {
        userProfile = { id: doc.id, ...data }
      }
    })

    return NextResponse.json({
      found: !!userProfile,
      profile: userProfile,
      totalProfiles: querySnapshot.docs.length,
    })
  } catch (error) {
    console.error("Error checking user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
