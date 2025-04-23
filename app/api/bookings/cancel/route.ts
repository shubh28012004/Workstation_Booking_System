import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session/session-manager"
import { getCollection } from "@/lib/db/mongodb"
import { ObjectId } from "mongodb"
import { sendCancellationEmail } from "@/lib/email/email-services"
import { mysqlAuth } from "@/lib/db/mysql-simulation"
import { addCancellation } from "@/app/api/notifications/cancellations/route"

export async function DELETE(request: Request) {
  try {
    // Get the current session user
    const sessionUser = await getSessionUser(request)

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get booking ID from URL
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("id")

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: "Invalid booking ID format" }, { status: 400 })
    }

    // Get bookings collection
    const bookingsCollection = await getCollection("bookings")

    // Find the booking
    const booking = await bookingsCollection.findOne({
      _id: new ObjectId(bookingId),
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if user owns this booking or is an admin
    if (booking.userId !== sessionUser.id && sessionUser.role !== "admin") {
      return NextResponse.json({ error: "Not authorized to cancel this booking" }, { status: 403 })
    }

    // Delete the booking
    const result = await bookingsCollection.deleteOne({ _id: new ObjectId(bookingId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 })
    }

    // Get user and seat details for email
    const user = await mysqlAuth.getUserById(booking.userId)

    // Get seats collection
    const seatsCollection = await getCollection("seats")
    const seat = await seatsCollection.findOne({ id: booking.seatId })

    // Send cancellation email notification
    if (user && seat) {
      try {
        await sendCancellationEmail(booking, user, seat)
      } catch (emailError) {
        console.error("Error sending cancellation email:", emailError)
        // Continue even if email fails
      }
    }

    // Log the cancellation for the notification system
    addCancellation({
      seatId: booking.seatId,
      pcLabel: seat ? seat.pcLabel : booking.seatId,
      floor: booking.floor,
      timestamp: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Booking canceled successfully",
      bookingId: bookingId,
    })
  } catch (error) {
    console.error("Error canceling booking:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
