import { v4 as uuidv4 } from "uuid"
import { hashPassword } from "../auth/auth-utils"

// In-memory database simulation
let users: any[] = []
const seats: any[] = []
const bookings: any[] = []

// Initialize with some data
export async function initializeDatabase() {
  // Create users if empty
  if (users.length === 0) {
    const adminPassword = await hashPassword("admin123")
    const userPassword = await hashPassword("user123")

    users = [
      {
        id: uuidv4(),
        name: "Admin User",
        email: "admin@example.com",
        password: adminPassword,
        role: "admin",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Regular User",
        email: "user@example.com",
        password: userPassword,
        role: "user",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]
  }

  // Create seats if empty
  if (seats.length === 0) {
    // Generate 5th floor seats
    for (let row = 1; row <= 8; row++) {
      for (let seatNumber = 1; seatNumber <= 6; seatNumber++) {
        const isLastRow = row === 8
        const isLeftSide = seatNumber <= 3

        // Last row special reservations
        const isReserved = isLastRow && ((isLeftSide && "Other Departments") || (!isLeftSide && "SCAAI"))

        seats.push({
          id: `5-${row}-${seatNumber}`,
          floor: 5,
          row,
          seatNumber,
          isReserved: !!isReserved,
          reservedFor: isReserved || undefined,
        })
      }
    }

    // Generate 4th floor seats
    for (let seatNumber = 1; seatNumber <= 6; seatNumber++) {
      seats.push({
        id: `4-1-${seatNumber}`,
        floor: 4,
        row: 1,
        seatNumber,
        isReserved: false,
      })
    }
  }
}

// Initialize the database
initializeDatabase()

// User operations
export const userDb = {
  findByEmail: (email: string) => {
    return users.find((user) => user.email === email)
  },

  create: async (userData: any) => {
    const newUser = {
      id: uuidv4(),
      ...userData,
      created_at: new Date(),
      updated_at: new Date(),
    }
    users.push(newUser)
    return newUser
  },
}

// Seat operations
export const seatDb = {
  findAll: (filter: any = {}) => {
    return seats.filter((seat) => {
      if (filter.floor && seat.floor !== Number(filter.floor)) {
        return false
      }
      return true
    })
  },

  findById: (id: string) => {
    return seats.find((seat) => seat.id === id)
  },
}

// Booking operations
export const bookingDb = {
  create: (bookingData: any) => {
    const newBooking = {
      id: uuidv4(),
      ...bookingData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    bookings.push(newBooking)
    return newBooking
  },

  findByUserId: (userId: string) => {
    return bookings.filter((booking) => booking.userId === userId)
  },

  findAll: () => {
    return bookings
  },

  findById: (id: string) => {
    return bookings.find((booking) => booking.id === id)
  },

  update: (id: string, data: any) => {
    const index = bookings.findIndex((booking) => booking.id === id)
    if (index !== -1) {
      bookings[index] = { ...bookings[index], ...data, updatedAt: new Date() }
      return bookings[index]
    }
    return null
  },

  delete: (id: string) => {
    const index = bookings.findIndex((booking) => booking.id === id)
    if (index !== -1) {
      const deleted = bookings[index]
      bookings.splice(index, 1)
      return deleted
    }
    return null
  },

  findOverlapping: (seatId: string, startTime: Date, endTime: Date) => {
    return bookings.find(
      (booking) =>
        booking.seatId === seatId &&
        booking.status !== "rejected" &&
        ((new Date(booking.startTime) <= startTime && new Date(booking.endTime) >= startTime) ||
          (new Date(booking.startTime) <= endTime && new Date(booking.endTime) >= endTime) ||
          (new Date(booking.startTime) >= startTime && new Date(booking.endTime) <= endTime)),
    )
  },
}
