import { NextResponse } from "next/server"
import { verifyPassword } from "@/lib/auth/auth-utils"
import { mysqlAuth } from "@/lib/db/mysql-simulation"
import { createSession } from "@/lib/session/session-manager"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
    }

    // Special case for admin login
    if (email === "adminbmd@sitpune.edu.in" && password === "admin123") {
      // Create admin session
      const adminUser = {
        id: "admin-id",
        name: "Admin User",
        email: "adminbmd@sitpune.edu.in",
        role: "admin",
        phone: "",
      }

      await createSession(adminUser)

      return NextResponse.json({
        user: adminUser,
      })
    }

    // Find user in MySQL database
    const user = await mysqlAuth.validateCredentials(email, password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create session
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
    }

    await createSession(sessionUser)

    // Return user info
    return NextResponse.json({
      user: sessionUser,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
