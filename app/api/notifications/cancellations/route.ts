import { NextResponse } from "next/server"

// This is a simulated cancellation log for demo purposes
// In a real app, you would store cancellations in the database
const cancellationLog: any[] = []

// Add a cancellation to the log
export function addCancellation(cancellation: any) {
  cancellation.timestamp = new Date()
  cancellationLog.push(cancellation)

  // Keep only the last 50 cancellations
  if (cancellationLog.length > 50) {
    cancellationLog.shift()
  }
}

export async function GET(request: Request) {
  try {
    // Get the 'since' query parameter
    const { searchParams } = new URL(request.url)
    const sinceParam = searchParams.get("since")

    // Parse the 'since' timestamp
    const since = sinceParam ? Number(sinceParam) : 0

    // Filter cancellations that occurred after the 'since' timestamp
    const recentCancellations = cancellationLog.filter(
      (cancellation) => new Date(cancellation.timestamp).getTime() > since,
    )

    return NextResponse.json({ cancellations: recentCancellations })
  } catch (error) {
    console.error("Error fetching cancellations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
