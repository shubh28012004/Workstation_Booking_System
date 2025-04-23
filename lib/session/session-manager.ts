// Session management without JWT
import { cookies } from "next/headers"
import { mysqlAuth } from "@/lib/db/mysql-simulation"

// Session duration in milliseconds (7 days)
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000

export interface SessionUser {
  id: string
  name: string
  email: string
  role: string
  phone?: string
}

// Create a session for a user
export async function createSession(user: SessionUser): Promise<string> {
  // Generate a unique session ID
  const sessionId = crypto.randomUUID()

  // Store session in a cookie
  const expires = new Date(Date.now() + SESSION_DURATION)

  // In a real app, you would store this in a database
  // For this demo, we'll use cookies directly
  ;(await
        // In a real app, you would store this in a database
        // For this demo, we'll use cookies directly
        cookies()).set({
    name: "session_id",
    value: sessionId,
    expires,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  // Store user info in a separate cookie (for client access)
  ;(await
        // Store user info in a separate cookie (for client access)
        cookies()).set({
    name: "user_info",
    value: JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }),
    expires,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return sessionId
}

// Update the getSessionUser function to properly check session cookies
export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  // Get the session cookie from the request
  const cookieHeader = request.headers.get("cookie")
  if (!cookieHeader) return null

  // Parse cookies
  const cookies = parseCookies(cookieHeader)
  const sessionId = cookies["session_id"]
  const userInfo = cookies["user_info"]

  if (!sessionId || !userInfo) return null

  try {
    // Parse user info
    const user = JSON.parse(decodeURIComponent(userInfo))

    // In a production app, you would validate the session ID against a database
    // For this demo, we'll just check if the user exists in the database
    const dbUser = await mysqlAuth.getUserById(user.id)

    // Special case for admin user which might not be in the database
    if (user.email === "adminbmd@sitpune.edu.in" && user.role === "admin") {
      return user as SessionUser
    }

    if (!dbUser) return null

    return user as SessionUser
  } catch (error) {
    console.error("Error parsing session user:", error)
    return null
  }
}

// Helper to parse cookies from header
function parseCookies(cookieHeader: string): Record<string, string> {
  return cookieHeader.split(";").reduce(
    (cookies, cookie) => {
      const [name, value] = cookie.trim().split("=")
      cookies[name] = decodeURIComponent(value)
      return cookies
    },
    {} as Record<string, string>,
  )
}

// Clear the session
export async function clearSession() {
  (await cookies()).delete("session_id")
  ;(await cookies()).delete("user_info")
}
