import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/auth-utils"
import { seatDb, bookingDb } from "@/lib/db/db-simulation"

export async function POST(request: Request) {
  try {
    // Get token from header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { seatId, floor, startTime, endTime } = await request.json()

    // Validate input
    if (!seatId || !floor || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if seat exists
    const seat = seatDb.findById(seatId)
    if (!seat) {
      return NextResponse.json({ error: "Seat not found" }, { status: 404 })
    }

    // Check if seat is already booked for the requested time
    const existingBooking = bookingDb.findOverlapping(seatId, new Date(startTime), new Date(endTime))

    if (existingBooking) {
      return NextResponse.json({ error: "Seat already booked for this time" }, { status: 409 })
    }

    // Calculate duration in days
    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)

    // Determine if approval is required (> 4 days)
    const requiresApproval = durationInDays > 4

    // Create booking
    const booking = bookingDb.create({
      userId: decoded.id,
      seatId,
      floor,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: requiresApproval ? "pending" : "approved",
      requiresApproval,
    })

    return NextResponse.json({ message: "Booking created successfully", booking }, { status: 201 })
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
