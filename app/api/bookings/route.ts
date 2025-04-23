import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session/session-manager"
import { getCollection } from "@/lib/db/mongodb"

export async function GET(request: Request) {
  try {
    // Get the current session user
    const sessionUser = await getSessionUser(request)

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const floor = searchParams.get("floor")
    const userId = searchParams.get("userId")

    // Build query
    const query: any = {}

    // Only filter by userId if explicitly requested
    // This ensures all bookings are returned by default for global visibility
    if (userId) {
      query.userId = userId
    }

    if (status) {
      query.status = status
    }

    if (floor) {
      query.floor = Number.parseInt(floor)
    }

    // Get bookings collection
    const bookingsCollection = await getCollection("bookings")

    // Get bookings
    const bookings = await bookingsCollection.find(query).sort({ startTime: 1 }).toArray()

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
