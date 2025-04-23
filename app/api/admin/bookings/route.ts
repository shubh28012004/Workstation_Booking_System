import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db/mongodb"
import { getSessionUser } from "@/lib/session/session-manager"

export async function GET(request: Request) {
  try {
    // Get the current session user
    const sessionUser = await getSessionUser(request)

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (sessionUser.email !== "adminbmd@sitpune.edu.in" && sessionUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const floor = searchParams.get("floor")

    // Build query
    const query: any = {}

    if (status) {
      query.status = status
    }

    if (floor) {
      query.floor = Number.parseInt(floor)
    }

    // Get bookings collection
    const bookingsCollection = await getCollection("bookings")

    // Get all bookings
    const bookings = await bookingsCollection.find(query).sort({ startTime: 1 }).toArray()

    console.log(`Found ${bookings.length} bookings`) // Debug log

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching admin bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
