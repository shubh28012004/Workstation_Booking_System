import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const floor = searchParams.get("floor")

    if (!floor) {
      return NextResponse.json({ error: "Floor parameter is required" }, { status: 400 })
    }

    // Get seats collection
    const seatsCollection = await getCollection("seats")

    // Find seats for the specified floor
    const seats = await seatsCollection.find({ floor: Number.parseInt(floor) }).toArray()

    // Get bookings collection to check for active bookings
    const bookingsCollection = await getCollection("bookings")
    const now = new Date()

    // Get all active bookings
    const activeBookings = await bookingsCollection
      .find({
        status: { $in: ["approved", "pending"] },
        startTime: { $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }, // Include upcoming bookings for next 7 days
        endTime: { $gte: now },
      })
      .toArray()

    // Map bookings to seats
    const seatsWithBookings = seats.map((seat) => {
      const seatBookings = activeBookings.filter((booking) => booking.seatId === seat.id)

      return {
        ...seat,
        isBooked: seatBookings.length > 0,
        bookings: seatBookings.map((booking) => ({
          id: booking._id,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          userId: booking.userId,
        })),
      }
    })

    return NextResponse.json(seatsWithBookings)
  } catch (error) {
    console.error("Error fetching seats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
