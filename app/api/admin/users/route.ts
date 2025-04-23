import { NextResponse } from "next/server"
import { mysqlAuth } from "@/lib/db/mysql-simulation"
import { getSessionUser } from "@/lib/session/session-manager"

export async function GET(request: Request) {
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

    // In a real implementation, you would fetch users from your database
    // For now, we'll use a simulated function that returns all users
    const users = await mysqlAuth.getAllUsers()

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
