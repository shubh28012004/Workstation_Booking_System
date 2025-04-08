import { Pool } from "pg"
import { MongoClient } from "mongodb"
import { hashPassword } from "../lib/auth/auth-utils"
import { v4 as uuidv4 } from "uuid"

// This script initializes the databases with sample data
async function initDatabases() {
  // Initialize PostgreSQL
  const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  })

  try {
    // Create users table
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )
    `)

    // Create admin user
    const adminId = uuidv4()
    const adminPassword = await hashPassword("admin123")

    // Check if admin exists
    const adminExists = await pgPool.query("SELECT * FROM users WHERE email = $1", ["admin@example.com"])

    if (adminExists.rows.length === 0) {
      await pgPool.query(
        "INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [adminId, "Admin User", "admin@example.com", adminPassword, "admin", new Date(), new Date()],
      )
      console.log("Admin user created")
    }

    // Create regular user
    const userId = uuidv4()
    const userPassword = await hashPassword("user123")

    // Check if user exists
    const userExists = await pgPool.query("SELECT * FROM users WHERE email = $1", ["user@example.com"])

    if (userExists.rows.length === 0) {
      await pgPool.query(
        "INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [userId, "Regular User", "user@example.com", userPassword, "user", new Date(), new Date()],
      )
      console.log("Regular user created")
    }

    console.log("PostgreSQL initialized successfully")
  } catch (error) {
    console.error("Error initializing PostgreSQL:", error)
  } finally {
    await pgPool.end()
  }

  // Initialize MongoDB
  const mongoClient = new MongoClient(process.env.MONGODB_URI || "")

  try {
    await mongoClient.connect()
    const db = mongoClient.db("workstation-booking")

    // Create seats collection
    const seatsCollection = db.collection("seats")

    // Check if seats collection is empty
    const seatsCount = await seatsCollection.countDocuments()

    if (seatsCount === 0) {
      // Generate 5th floor seats
      const fifthFloorSeats = []

      for (let row = 1; row <= 8; row++) {
        for (let seatNumber = 1; seatNumber <= 6; seatNumber++) {
          const isLastRow = row === 8
          const isLeftSide = seatNumber <= 3

          // Last row special reservations
          const isReserved = isLastRow && ((isLeftSide && "Other Departments") || (!isLeftSide && "SCAAI"))

          fifthFloorSeats.push({
            id: `5-${row}-${seatNumber}`,
            floor: 5,
            row,
            seatNumber,
            isReserved: !!isReserved,
            reservedFor: isReserved ? (isReserved as string) : undefined,
          })
        }
      }

      // Generate 4th floor seats
      const fourthFloorSeats = []

      for (let seatNumber = 1; seatNumber <= 6; seatNumber++) {
        fourthFloorSeats.push({
          id: `4-1-${seatNumber}`,
          floor: 4,
          row: 1,
          seatNumber,
          isReserved: false,
        })
      }

      // Insert all seats
      await seatsCollection.insertMany([...fifthFloorSeats, ...fourthFloorSeats])
      console.log("Seats created")
    }

    // Create bookings collection
    const bookingsCollection = db.collection("bookings")

    // Create indexes
    await bookingsCollection.createIndex({ userId: 1 })
    await bookingsCollection.createIndex({ seatId: 1 })
    await bookingsCollection.createIndex({ startTime: 1, endTime: 1 })
    await bookingsCollection.createIndex({ status: 1 })

    console.log("MongoDB initialized successfully")
  } catch (error) {
    console.error("Error initializing MongoDB:", error)
  } finally {
    await mongoClient.close()
  }
}

// Run the initialization
initDatabases()
  .then(() => console.log("Database initialization complete"))
  .catch(console.error)
