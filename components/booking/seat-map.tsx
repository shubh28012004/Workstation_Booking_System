"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

interface SeatMapProps {
  floor: number
  onSeatSelect: (seatId: string) => void
}

interface Seat {
  id: string
  floor: number
  row: number
  seatNumber: number
  isReserved: boolean
  reservedFor?: string
  isBooked?: boolean
}

export default function SeatMap({ floor, onSeatSelect }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
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
          // 5th floor: 8 rows x 6 seats
          for (let row = 1; row <= 8; row++) {
            for (let seatNumber = 1; seatNumber <= 6; seatNumber++) {
              const isLastRow = row === 8
              const isLeftSide = seatNumber <= 3

              // Last row special reservations
              const isReserved = isLastRow && ((isLeftSide && "Other Departments") || (!isLeftSide && "SCAAI"))

              generatedSeats.push({
                id: `5-${row}-${seatNumber}`,
                floor: 5,
                row,
                seatNumber,
                isReserved: !!isReserved,
                reservedFor: isReserved ? (isReserved as string) : undefined,
                isBooked: Math.random() > 0.7, // Randomly mark some seats as booked
              })
            }
          }
        } else if (floor === 4) {
          // 4th floor: 6 NVIDIA seats
          for (let seatNumber = 1; seatNumber <= 6; seatNumber++) {
            generatedSeats.push({
              id: `4-1-${seatNumber}`,
              floor: 4,
              row: 1,
              seatNumber,
              isReserved: false,
              isBooked: Math.random() > 0.7, // Randomly mark some seats as booked
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

  const handleSeatClick = (seatId: string, isReserved: boolean, isBooked: boolean | undefined) => {
    if (isReserved || isBooked) {
      toast({
        title: "Seat unavailable",
        description: isReserved ? "This seat is reserved for special use" : "This seat is already booked",
        variant: "destructive",
      })
      return
    }

    setSelectedSeat(seatId)
    onSeatSelect(seatId)
  }

  const getSeatColor = (seat: Seat) => {
    if (seat.id === selectedSeat) return "bg-blue-500 text-white hover:bg-blue-600"
    if (seat.isReserved) {
      if (seat.reservedFor === "SCAAI") return "bg-purple-200 text-purple-800 cursor-not-allowed"
      return "bg-yellow-200 text-yellow-800 cursor-not-allowed"
    }
    if (seat.isBooked) return "bg-red-200 text-red-800 cursor-not-allowed"
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
                        className={`h-12 ${getSeatColor(seat)}`}
                        onClick={() => handleSeatClick(seat.id, seat.isReserved, seat.isBooked)}
                      >
                        {seat.seatNumber}
                      </Button>
                    ))}
                  </div>
                </div>
              )
            })}
            <div className="flex justify-center mt-8 space-x-4">
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
                    className={`h-12 ${getSeatColor(seat)}`}
                    onClick={() => handleSeatClick(seat.id, seat.isReserved, seat.isBooked)}
                  >
                    {seat.seatNumber}
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
  )
}
