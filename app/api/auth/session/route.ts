import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session/session-manager"

export async function GET(request: Request) {
  try {
    // Get the current session user
    const user = await getSessionUser(request)

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user,
    })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ error: "Internal server error", authenticated: false }, { status: 500 })
  }
}
