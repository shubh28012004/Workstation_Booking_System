import { NextResponse } from "next/server"
import { seatDb } from "@/lib/db/db-simulation"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const floor = searchParams.get("floor")

    const filter = floor ? { floor } : {}
    const seats = seatDb.findAll(filter)

    return NextResponse.json(seats)
  } catch (error) {
    console.error("Error fetching seats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
