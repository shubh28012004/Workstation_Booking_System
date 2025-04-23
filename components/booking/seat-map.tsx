"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Lock, Info } from "lucide-react"

interface SeatMapProps {
  floor: number
  onSeatSelect: (seatId: string) => void
}

interface Seat {
  id: string
  floor: number
  row: number | null
  seatNumber: number | null
  pcLabel: string
  isReserved: boolean
  reservedFor?: string
  isBooked?: boolean
  booking?: {
    userName: string
    userPhone: string
    duration: string
  }
}

interface Booking {
  _id: string
  seatId: string
  userId: string
  floor: number
  startTime: string
  endTime: string
  status: string
  userName: string
  userPhone: string
  pcLabel: string
}

export default function SeatMap({ floor, onSeatSelect }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
  const [selectedSeatDetails, setSelectedSeatDetails] = useState<Seat | null>(null)
  const [showSeatDetails, setShowSeatDetails] = useState(false)
  const { toast } = useToast()

  // Generate static seat layout based on floor
  const generateStaticSeatLayout = (floorNumber: number): Seat[] => {
    const staticSeats: Seat[] = []

    if (floorNumber === 5) {
      // 5th floor: 6 rows × 6 seats (PC2 to PC37)
      let pcCounter = 2 // Start from PC2

      for (let row = 1; row <= 6; row++) {
        for (let seatNumber = 1; seatNumber <= 6; seatNumber++) {
          const isLastRow = row === 6
          const isLeftSide = seatNumber <= 3
          const pcLabel = `PC${pcCounter}`

          // Last row special reservations
          const isReserved = isLastRow
          const reservedFor = isLastRow ? (isLeftSide ? "Other Departments" : "SCAAI") : undefined

          staticSeats.push({
            id: pcLabel, // Use pcLabel as the ID for consistency
            floor: 5,
            row,
            seatNumber,
            pcLabel,
            isReserved: isReserved,
            reservedFor: reservedFor,
          })

          pcCounter++
        }
      }
    } else if (floorNumber === 4) {
      // 4th floor: 3 PCs (PC1, PC2, PC3)
      for (let seatNumber = 1; seatNumber <= 3; seatNumber++) {
        const pcLabel = `PC${seatNumber}`
        staticSeats.push({
          id: pcLabel, // Use pcLabel as the ID for consistency
          floor: 4,
          row: 1,
          seatNumber,
          pcLabel,
          isReserved: false,
        })
      }
    }

    return staticSeats
  }

  // Fetch all bookings to show global seat status
  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?floor=${floor}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch bookings")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching bookings:", error)
      return []
    }
  }

  useEffect(() => {
    async function loadSeatMap() {
      try {
        setLoading(true)

        // Generate static seat layout
        const staticLayout = generateStaticSeatLayout(floor)

        // Fetch all bookings (not filtered by user)
        const bookingsData = await fetchBookings()

        // Current date for checking active bookings
        const now = new Date()

        // Filter for active and upcoming bookings (both approved and pending)
        const activeBookings = bookingsData.filter(
          (booking: Booking) =>
            (booking.status === "approved" || booking.status === "pending") && new Date(booking.endTime) >= now,
        )

        console.log("Active bookings:", activeBookings)

        // Merge bookings with static layout
        const seatsWithBookings = staticLayout.map((seat) => {
          // Find active booking for this seat - match by pcLabel or id
          const activeBooking = activeBookings.find(
            (booking: Booking) =>
              (booking.seatId === seat.id || booking.pcLabel === seat.pcLabel) && new Date(booking.endTime) >= now,
          )

          if (activeBooking) {
            console.log(`Seat ${seat.id} is booked by ${activeBooking.userName}`)
            // Calculate duration in days
            const startDate = new Date(activeBooking.startTime)
            const endDate = new Date(activeBooking.endTime)
            const durationInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

            return {
              ...seat,
              isBooked: true,
              booking: {
                userName: activeBooking.userName || "Unknown",
                userPhone: activeBooking.userPhone || "Not provided",
                duration: `${durationInDays} days`,
              },
            }
          }

          return seat
        })

        setSeats(seatsWithBookings)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load seats or bookings",
          variant: "destructive",
        })
        console.error("Error loading seat map:", error)

        // Even if there's an error, still set the static layout
        setSeats(generateStaticSeatLayout(floor))
      } finally {
        setLoading(false)
      }
    }

    loadSeatMap()
  }, [floor, toast])

  const handleSeatClick = (seat: Seat) => {
    if (seat.isReserved) {
      toast({
        title: "Seat unavailable",
        description: `This seat is reserved for ${seat.reservedFor}`,
        variant: "destructive",
      })
      return
    }

    if (seat.isBooked) {
      // Show seat details dialog
      setSelectedSeatDetails(seat)
      setShowSeatDetails(true)
      return
    }

    setSelectedSeat(seat.id)
    onSeatSelect(seat.id)
  }

  const getSeatColor = (seat: Seat) => {
    if (seat.id === selectedSeat) return "bg-blue-500 text-white hover:bg-blue-600"
    if (seat.isReserved) {
      if (seat.reservedFor === "SCAAI") return "bg-purple-200 text-purple-800 cursor-not-allowed"
      return "bg-yellow-200 text-yellow-800 cursor-not-allowed"
    }
    if (seat.isBooked) return "bg-red-200 text-red-800 hover:bg-red-300"
    return "bg-green-100 text-green-800 hover:bg-green-200"
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Loading Seats</CardTitle>
          <CardDescription>Please wait while we load the seat map</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: floor === 5 ? 36 : 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">{floor}th Floor Seat Map</CardTitle>
          <CardDescription>
            {floor === 5 ? "Regular workstation with 36 seats" : "NVIDIA workstation with 3 seats"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {floor === 5 ? (
            // 5th floor layout: 6 rows x 6 seats
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, rowIndex) => {
                const rowNumber = rowIndex + 1
                const rowSeats = seats.filter((seat) => seat.row === rowNumber)

                return (
                  <div key={rowNumber} className="flex justify-center space-x-4">
                    <div className="flex-shrink-0 w-8 flex items-center justify-center">Row {rowNumber}</div>
                    <div className="grid grid-cols-6 gap-2 flex-grow">
                      {rowSeats.map((seat) => (
                        <Button
                          key={seat.id}
                          variant="outline"
                          className={`h-14 ${getSeatColor(seat)}`}
                          onClick={() => handleSeatClick(seat)}
                        >
                          {seat.isReserved ? <Lock className="h-3 w-3 mr-1" /> : null}
                          <span className="text-sm font-medium">{seat.pcLabel}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              })}
              <div className="flex flex-wrap justify-center mt-8 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-200 rounded"></div>
                  <span className="text-sm">Booked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                  <span className="text-sm">Other Departments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-200 rounded"></div>
                  <span className="text-sm">SCAAI</span>
                </div>
              </div>
            </div>
          ) : (
            // 4th floor layout: 3 PCs
            <div className="space-y-4">
              <div className="flex justify-center space-x-4">
                <div className="flex-shrink-0 w-8 flex items-center justify-center">NVIDIA</div>
                <div className="grid grid-cols-3 gap-4 flex-grow">
                  {seats.map((seat) => (
                    <Button
                      key={seat.id}
                      variant="outline"
                      className={`h-14 ${getSeatColor(seat)}`}
                      onClick={() => handleSeatClick(seat)}
                    >
                      <span className="text-sm font-medium">{seat.pcLabel}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex justify-center mt-8 space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-200 rounded"></div>
                  <span className="text-sm">Booked</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seat Details Dialog */}
      <Dialog open={showSeatDetails} onOpenChange={setShowSeatDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seat Information</DialogTitle>
            <DialogDescription>Details for {selectedSeatDetails?.pcLabel}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSeatDetails?.booking ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">User:</div>
                  <div>{selectedSeatDetails.booking.userName}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">Phone:</div>
                  <div>{selectedSeatDetails.booking.userPhone}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">Duration:</div>
                  <div>{selectedSeatDetails.booking.duration}</div>
                </div>
                <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                  <Info className="h-4 w-4 mr-1" />
                  This seat is currently booked
                </div>
              </>
            ) : (
              <div className="text-center py-4">No booking information available</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
