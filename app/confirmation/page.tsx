"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const seatId = searchParams.get("seatId")
  const floor = searchParams.get("floor")
  const start = searchParams.get("start")
  const end = searchParams.get("end")

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)

    // If no booking data in URL, redirect to book page
    if (!seatId || !floor || !start || !end) {
      router.push("/book")
    }
  }, [seatId, floor, start, end, router])

  if (!seatId || !floor || !start || !end) {
    return null // Will redirect in useEffect
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  const startDate = new Date(start)
  const endDate = new Date(end)
  const durationInDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  const requiresApproval = durationInDays > 4

  const parsedPcLabel =
    seatId?.includes("-") && seatId.split("-")[2] ? `PC${seatId.split("-")[2]}` : seatId || "Unknown"

  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold">Booking {requiresApproval ? "Requested" : "Confirmed"}</h1>
        <p className="text-gray-500 mt-2">
          {requiresApproval
            ? "Your booking request has been submitted for approval"
            : "Your workstation has been booked successfully"}
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
          <CardDescription>
            {requiresApproval ? "Your booking requires admin approval" : "Your booking is confirmed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Floor</p>
              <p>{floor}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Seat</p>
              <p>{parsedPcLabel}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Start Time</p>
            <p>{formatDate(start)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">End Time</p>
            <p>{formatDate(end)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className={requiresApproval ? "text-yellow-600" : "text-green-600"}>
              {requiresApproval ? "Pending Approval" : "Confirmed"}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            View Dashboard
          </Button>
          <Button onClick={() => router.push("/book")}>Book Another</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
