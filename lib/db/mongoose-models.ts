import mongoose from "mongoose"

// Define the booking schema
const bookingSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  floor: {
    type: Number,
    required: true,
  },
  seat: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in days
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  userName: String,
  userEmail: String,
  userPhone: String,
  pcLabel: String,
})

// Create the model (only if mongoose is available)
const BookingModel = mongoose.models.Booking || mongoose.model("Booking", bookingSchema)

export { BookingModel }

// Type definition for TypeScript
export interface IBooking {
  user_id: string
  floor: number
  seat: string
  duration: number
  status: "pending" | "approved" | "rejected" | "completed"
  timestamp: Date
  startTime: Date
  endTime: Date
  userName?: string
  userEmail?: string
  userPhone?: string
  pcLabel?: string
}
