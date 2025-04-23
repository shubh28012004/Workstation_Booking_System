import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db/mongodb"
import { ObjectId } from "mongodb"
import { sendStatusUpdateNotification, sendApprovalEmail, sendRejectionEmail } from "@/lib/email/email-services"
import { mysqlAuth } from "@/lib/db/mysql-simulation"
import { getSessionUser } from "@/lib/session/session-manager"

export async function PATCH(request: Request) {
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

    // Send email notification based on status
    if (user && seat) {
      try {
        if (status === "approved") {
          await sendApprovalEmail({ ...booking, status }, user, seat)
        } else if (status === "rejected") {
          await sendRejectionEmail({ ...booking, status }, user, seat)
        } else {
          await sendStatusUpdateNotification({ ...booking, status }, user, seat)
        }
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
