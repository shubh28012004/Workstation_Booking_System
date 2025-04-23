import { NextResponse } from "next/server"
import { clearSession } from "@/lib/session/session-manager"

export async function POST() {
  try {
    // Clear the session
    clearSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
