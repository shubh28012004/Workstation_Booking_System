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
  row: number
  seatNumber: number
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

export default function SeatMap({ floor, onSeatSelect }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
  const [selectedSeatDetails, setSelectedSeatDetails] = useState<Seat | null>(null)
  const [showSeatDetails, setShowSeatDetails] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchSeats() {
      try {
        setLoading(true)
        // In a real app, we would fetch from the API
        // const response = await fetch(`/api/seats?floor=${floor}`);
        // const data = await response.json();

        // For demo purposes, we'll generate seats
        const generatedSeats: Seat[] = []

        if (floor === 5) {
          // 5th floor: 8 rows x 6 seats with PC labels
          let pcCounter = 1
          for (let row = 1; row <= 8; row++) {
            for (let seatNumber = 1; seatNumber <= 6; seatNumber++) {
              const isLastRow = row === 8
              const isLeftSide = seatNumber <= 3
              const pcLabel = `PC${pcCounter}`
              pcCounter++

              // Last row special reservations
              const isReserved = isLastRow && ((isLeftSide && "Other Departments") || (!isLeftSide && "SCAAI"))

              // Randomly generate booking info for some seats
              const isBooked = !isReserved && Math.random() > 0.7
              let booking = undefined

              if (isBooked) {
                booking = {
                  userName: `User ${Math.floor(Math.random() * 100)}`,
                  userPhone: `98765${Math.floor(Math.random() * 10000)
                    .toString()
                    .padStart(5, "0")}`,
                  duration: `${Math.floor(Math.random() * 4) + 1} days`,
                }
              }

              generatedSeats.push({
                id: `5-${row}-${seatNumber}`,
                floor: 5,
                row,
                seatNumber,
                pcLabel,
                isReserved: !!isReserved,
                reservedFor: isReserved ? (isReserved as string) : undefined,
                isBooked,
                booking,
              })
            }
          }
        } else if (floor === 4) {
          // 4th floor: 6 NVIDIA seats
          for (let seatNumber = 1; seatNumber <= 6; seatNumber++) {
            // Randomly generate booking info for some seats
            const isBooked = Math.random() > 0.7
            let booking = undefined

            if (isBooked) {
              booking = {
                userName: `User ${Math.floor(Math.random() * 100)}`,
                userPhone: `98765${Math.floor(Math.random() * 10000)
                  .toString()
                  .padStart(5, "0")}`,
                duration: `${Math.floor(Math.random() * 4) + 1} days`,
              }
            }

            generatedSeats.push({
              id: `4-1-${seatNumber}`,
              floor: 4,
              row: 1,
              seatNumber,
              pcLabel: `NVIDIA-${seatNumber}`,
              isReserved: false,
              isBooked,
              booking,
            })
          }
        }

        setSeats(generatedSeats)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load seats",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSeats()
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
            {Array.from({ length: floor === 5 ? 48 : 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
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
            {floor === 5 ? "Regular workstation with 48 seats" : "NVIDIA workstation with 6 seats"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {floor === 5 ? (
            // 5th floor layout: 8 rows x 6 seats
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, rowIndex) => {
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
            // 4th floor layout: 6 NVIDIA seats
            <div className="space-y-4">
              <div className="flex justify-center space-x-4">
                <div className="flex-shrink-0 w-8 flex items-center justify-center">NVIDIA</div>
                <div className="grid grid-cols-6 gap-2 flex-grow">
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
