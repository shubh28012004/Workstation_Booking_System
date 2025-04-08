import { compare, hash } from "bcryptjs"

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword)
}

// Simplified token generation without JWT
export function generateToken(user: any): string {
  // In a real app, we would use JWT
  // For simulation, we'll just base64 encode the user object
  return Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    }),
  ).toString("base64")
}

export function verifyToken(token: string): any {
  try {
    // Decode the base64 token
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())

    // Check if token is expired
    if (decoded.exp < Date.now()) {
      return null
    }

    return decoded
  } catch (error) {
    return null
  }
}
