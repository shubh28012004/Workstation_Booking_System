// PostgreSQL models (for authentication)
export interface User {
  id: string
  email: string
  password: string // Hashed
  name: string
  role: "user" | "admin"
  createdAt: Date
  updatedAt: Date
}

// MongoDB models (for booking data)
export interface Seat {
  id: string
  floor: number
  row: number
  seatNumber: number
  isReserved: boolean
  reservedFor?: string // e.g., "SCAAI", "Other Departments"
}

export interface Booking {
  id: string
  userId: string
  seatId: string
  floor: number
  startTime: Date
  endTime: Date
  status: "pending" | "approved" | "rejected" | "completed"
  requiresApproval: boolean
  createdAt: Date
  updatedAt: Date
}
