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
        email: "admin@sitpune.edu.in",
        password: adminPassword,
        role: "admin",
        phone: "9876543210",
        department: "Computer Science",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Regular User",
        email: "user@sitpune.edu.in",
        password: userPassword,
        role: "user",
        phone: "9876543211",
        department: "Information Technology",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]
  }

  // Create seats if empty
  if (seats.length === 0) {
    // Generate 5th floor seats with PC labels - 6 rows starting from PC2
    let pcCounter = 2
    for (let row = 1; row <= 6; row++) {
      for (let seatNumber = 1; seatNumber <= 6; seatNumber++) {
        const isLastRow = row === 6
        const isLeftSide = seatNumber <= 3
        const pcLabel = `PC${pcCounter}`
        pcCounter++

        // Last row special reservations
        const isReserved = isLastRow && ((isLeftSide && "Other Departments") || (!isLeftSide && "SCAAI"))

        seats.push({
          id: `5-${row}-${seatNumber}`,
          floor: 5,
          row,
          seatNumber,
          pcLabel,
          isReserved: !!isReserved,
          reservedFor: isReserved || undefined,
        })
      }
    }

    // Generate 4th floor seats - only 3 PCs
    for (let seatNumber = 1; seatNumber <= 3; seatNumber++) {
      seats.push({
        id: `4-1-${seatNumber}`,
        floor: 4,
        row: 1,
        seatNumber,
        pcLabel: `PC${seatNumber}`,
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

  getAll: () => {
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      department: user.department,
    }))
  },

  findById: (id: string) => {
    return users.find((user) => user.id === id)
  },

  update: (id: string, data: any) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
      users[index] = { ...users[index], ...data, updated_at: new Date() }
      return users[index]
    }
    return null
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

    // Simulate MongoDB save
    console.log("MongoDB: Saving booking to database", newBooking)

    // Simulate email notification
    simulateEmailNotification(newBooking)

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

  // Get bookings with user details
  getBookingsWithUserDetails: () => {
    return bookings.map((booking) => {
      const user = users.find((u) => u.id === booking.userId)
      const seat = seats.find((s) => s.id === booking.seatId)

      return {
        ...booking,
        userName: user ? user.name : "Unknown",
        userEmail: user ? user.email : "Unknown",
        userPhone: user ? user.phone : "Unknown",
        pcLabel: seat ? seat.pcLabel : "Unknown",
      }
    })
  },

  // Get active bookings for a seat
  getActiveBookingForSeat: (seatId: string) => {
    const now = new Date()
    return bookings.find(
      (booking) =>
        booking.seatId === seatId &&
        booking.status === "approved" &&
        new Date(booking.startTime) <= now &&
        new Date(booking.endTime) >= now,
    )
  },
}

// Helper to get seat with booking info
export const getSeatWithBookingInfo = (seatId: string) => {
  const seat = seatDb.findById(seatId)
  if (!seat) return null

  const activeBooking = bookingDb.getActiveBookingForSeat(seatId)
  if (!activeBooking) return seat

  const user = users.find((u) => u.id === activeBooking.userId)

  return {
    ...seat,
    isBooked: true,
    booking: {
      ...activeBooking,
      userName: user ? user.name : "Unknown",
      userPhone: user ? user.phone : "Unknown",
      duration:
        Math.ceil(
          (new Date(activeBooking.endTime).getTime() - new Date(activeBooking.startTime).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + " days",
    },
  }
}

// Simulate email notification
function simulateEmailNotification(booking: any) {
  const user = users.find((u) => u.id === booking.userId)
  const seat = seats.find((s) => s.id === booking.seatId)

  if (!user || !seat) return

  console.log("===== EMAIL NOTIFICATION SIMULATION =====")
  console.log("From: noreply@sitpune.edu.in")
  console.log(`To: ${user.email}`)
  console.log("Subject: Workstation Booking Confirmation")
  console.log("Body:")
  console.log(`Dear ${user.name},`)
  console.log(`Your booking for ${seat.pcLabel} on floor ${booking.floor} has been ${booking.status}.`)
  console.log(`Booking Details:`)
  console.log(`- Start Time: ${new Date(booking.startTime).toLocaleString()}`)
  console.log(`- End Time: ${new Date(booking.endTime).toLocaleString()}`)
  console.log(`- Status: ${booking.status}`)
  console.log("Thank you for using BOOK MY DESK!")
  console.log("===== END EMAIL SIMULATION =====")
}
