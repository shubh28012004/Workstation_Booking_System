import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session/session-manager"
import { getCollection } from "@/lib/db/mongodb"
import { mysqlAuth } from "@/lib/db/mysql-simulation"
import { sendBookingConfirmationEmail } from "@/lib/email/email-services"

export async function POST(request: Request) {
  try {
    // Get the current session user
    const sessionUser = await getSessionUser(request)

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { seatId, floor, startTime, endTime } = await request.json()

    // Validate input
    if (!seatId || !floor || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get seats collection to check if seat exists and is not reserved
    const seatsCollection = await getCollection("seats")

    // Check if seat exists in the database
    const seat = await seatsCollection.findOne({ id: seatId })

    // If seat doesn't exist in DB, create a virtual seat object using the provided seatId
    const virtualSeat = seat || {
      id: seatId,
      pcLabel: seatId, // Use the exact seatId as pcLabel
      floor: Number(floor),
      isReserved: false,
      row: null,
      seatNumber: null,
    }

    // Check if seat is reserved
    if (virtualSeat.isReserved) {
      return NextResponse.json({ error: "This seat is reserved and cannot be booked" }, { status: 400 })
    }

    // Get bookings collection
    const bookingsCollection = await getCollection("bookings")

    // Check if seat is already booked for the requested time
    const start = new Date(startTime)
    const end = new Date(endTime)

    const existingBooking = await bookingsCollection.findOne({
      seatId,
      status: { $in: ["approved", "pending"] },
      $or: [
        { startTime: { $lte: start }, endTime: { $gte: start } },
        { startTime: { $lte: end }, endTime: { $gte: end } },
        { startTime: { $gte: start }, endTime: { $lte: end } },
      ],
    })

    if (existingBooking) {
      return NextResponse.json({ error: "Seat already booked for this time" }, { status: 409 })
    }

    // Calculate duration in days
    const durationInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)

    // Determine if approval is required (> 4 days)
    const requiresApproval = durationInDays > 4

    // Get user details from MySQL
    const user = await mysqlAuth.getUserById(sessionUser.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create booking with the exact seatId and pcLabel from the seat
    const booking = {
      userId: sessionUser.id,
      seatId, // Use the exact seatId as provided
      floor: Number(floor),
      startTime: start,
      endTime: end,
      status: requiresApproval ? "pending" : "approved",
      requiresApproval,
      createdAt: new Date(),
      updatedAt: new Date(),
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone || "",
      pcLabel: virtualSeat.pcLabel, // Use the pcLabel from the seat or virtual seat
    }

    const result = await bookingsCollection.insertOne(booking)

    // Send email notification
    try {
      await sendBookingConfirmationEmail(booking, user, virtualSeat)
    } catch (emailError) {
      console.error("Error sending email:", emailError)
      // Continue even if email fails
    }

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
        booking: {
          ...booking,
          id: result.insertedId,
        },
        message: requiresApproval ? "Booking request submitted for approval" : "Booking confirmed successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json({ error: "Failed to book seat" }, { status: 500 })
  }
}
