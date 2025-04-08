"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface BookingFormProps {
  seatId: string
  floor: number
}

export default function BookingForm({ seatId, floor }: BookingFormProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate dates
      const start = new Date(`${startDate}T${startTime}`)
      const end = new Date(`${endDate}T${endTime}`)

      if (start >= end) {
        throw new Error("End time must be after start time")
      }

      if (start < new Date()) {
        throw new Error("Start time cannot be in the past")
      }

      // Get token from localStorage
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/auth")
        return
      }

      // In a real app, we would call the API
      // const response = await fetch('/api/book', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({
      //     seatId,
      //     floor,
      //     startTime: start.toISOString(),
      //     endTime: end.toISOString()
      //   })
      // });

      // const data = await response.json();

      // if (!response.ok) {
      //   throw new Error(data.error || 'Booking failed');
      // }

      // For demo purposes, we'll simulate a successful booking
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Calculate duration in days
      const durationInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      const requiresApproval = durationInDays > 4

      toast({
        title: "Booking successful",
        description: requiresApproval
          ? "Your booking request has been submitted for approval"
          : "Your seat has been booked successfully",
      })

      // Redirect to confirmation page
      router.push(`/confirmation?seatId=${seatId}&floor=${floor}&start=${start.toISOString()}&end=${end.toISOString()}`)
    } catch (error) {
      toast({
        title: "Booking failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-xl">Book Workstation</CardTitle>
          <CardDescription>
            Floor {floor}, Seat ID: {seatId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            <p>Note: Bookings longer than 4 days require admin approval.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
            {isLoading ? "Processing..." : "Book Seat"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
