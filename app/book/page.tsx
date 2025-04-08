"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import FloorSelector from "@/components/booking/floor-selector"
import SeatMap from "@/components/booking/seat-map"
import BookingForm from "@/components/booking/booking-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function BookPage() {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)

    // Check if floor is specified in URL
    const floorParam = searchParams.get("floor")
    if (floorParam) {
      setSelectedFloor(Number.parseInt(floorParam))
    }
  }, [searchParams])

  const handleFloorSelect = (floor: number) => {
    setSelectedFloor(floor)
    setSelectedSeat(null)
    router.push(`/book?floor=${floor}`)
  }

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeat(seatId)
  }

  if (!isLoggedIn) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Login Required</CardTitle>
          <CardDescription>You need to be logged in to book a workstation</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => router.push("/auth")}>Go to Login</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Book a Workstation</h1>

      {!selectedFloor && <FloorSelector onFloorSelect={handleFloorSelect} />}

      {selectedFloor && !selectedSeat && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Select a Seat</h2>
            <Button variant="outline" onClick={() => setSelectedFloor(null)}>
              Change Floor
            </Button>
          </div>
          <SeatMap floor={selectedFloor} onSeatSelect={handleSeatSelect} />
        </div>
      )}

      {selectedFloor && selectedSeat && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Book Your Seat</h2>
            <Button variant="outline" onClick={() => setSelectedSeat(null)}>
              Change Seat
            </Button>
          </div>
          <BookingForm seatId={selectedSeat} floor={selectedFloor} />
        </div>
      )}
    </div>
  )
}
