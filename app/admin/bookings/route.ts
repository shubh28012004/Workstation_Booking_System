import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/auth-utils"
import { getCollection } from "@/lib/db/mongodb"

export async function GET(request: Request) {
  try {
    // Get token from header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== "admin") {
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

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching admin bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
