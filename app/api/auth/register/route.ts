import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth/auth-utils"
import { userDb } from "@/lib/db/db-simulation"

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

    // Check if user already exists
    const existingUser = userDb.findByEmail(email)

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    await userDb.create({
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
