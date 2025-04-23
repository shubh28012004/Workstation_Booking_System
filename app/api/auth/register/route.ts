import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth/auth-utils"
import { mysqlAuth } from "@/lib/db/mysql-simulation"

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate SIT email domain
    const sitEmailRegex = /^[a-zA-Z0-9._%+-]+@sitpune\.edu\.in$/
    if (!sitEmailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Only @sitpune.edu.in email addresses are allowed",
        },
        { status: 400 },
      )
    }

    try {
      // Check if user already exists by trying to validate credentials
      const existingUser = await mysqlAuth.validateCredentials(email, "")

      if (existingUser) {
        return NextResponse.json({ error: "User already exists" }, { status: 409 })
      }
    } catch (error) {
      // If there's an error checking for existing user, continue with registration
      console.error("Error checking for existing user:", error)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user in MySQL
    await mysqlAuth.createUser({
      name,
      email,
      password: hashedPassword,
      role: "user",
      phone: phone || "",
    })

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
