import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/auth-utils"
import { getCollection } from "@/lib/db/mongodb"
import { ObjectId } from "mongodb"
import { sendStatusUpdateNotification } from "@/lib/email/email-services"
import { mysqlAuth } from "@/lib/db/mysql-simulation"

export async function PATCH(request: Request) {
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

    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ error: "Booking ID and status are required" }, { status: 400 })
    }

    // Validate status
    if (!["approved", "rejected", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Get bookings collection
    const bookingsCollection = await getCollection("bookings")

    // Find the booking
    const booking = await bookingsCollection.findOne({ _id: new ObjectId(id) })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Update booking status
    await bookingsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { status, updatedAt: new Date() } })

    // Get user and seat details for email
    const user = await mysqlAuth.getUserById(booking.userId)

    // Get seats collection
    const seatsCollection = await getCollection("seats")
    const seat = await seatsCollection.findOne({ id: booking.seatId })

    // Send email notification
    if (user && seat) {
      try {
        await sendStatusUpdateNotification({ ...booking, status }, user, seat)
      } catch (emailError) {
        console.error("Error sending status update email:", emailError)
        // Continue even if email fails
      }
    }

    return NextResponse.json({
      message: `Booking status updated to ${status}`,
      booking: { ...booking, status },
    })
  } catch (error) {
    console.error("Error updating booking status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
