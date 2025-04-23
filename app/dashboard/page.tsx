"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Calendar, Clock, MapPin } from "lucide-react"
import { useUserContext } from "@/context/user-context"

interface Booking {
  _id: string
  id?: string
  seatId: string
  pcLabel: string
  floor: number
  startTime: string
  endTime: string
  status: "pending" | "approved" | "rejected" | "completed"
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading } = useUserContext()

  useEffect(() => {
    // Check if user is logged in
    if (!isLoading) {
      if (user) {
        fetchUserBookings()
      } else {
        router.push("/auth")
      }
    }
  }, [user, isLoading, router])

  // Fetch bookings for the current user
  const fetchUserBookings = async () => {
    try {
      setLoading(true)

      // Fetch user's bookings from API
      const response = await fetch("/api/bookings/user", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch bookings")
      }

      const data = await response.json()
      setBookings(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      })
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  // Cancel a booking
  const cancelBooking = async (bookingId: string) => {
    try {
      // Call the API to cancel booking
      const response = await fetch(`/api/bookings/cancel?id=${bookingId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Cancellation failed")
      }

      // Remove the booking from state
      setBookings(bookings.filter((booking) => (booking._id || booking.id) !== bookingId))

      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully",
      })

      // Refresh bookings list to ensure UI is updated
      fetchUserBookings()
    } catch (error) {
      toast({
        title: "Cancellation failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
      console.error("Cancellation error:", error)
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>
      case "pending":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
      case "rejected":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>
      case "completed":
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Completed</span>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Skeleton className="h-[400px] w-full max-w-3xl rounded-lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Login Required</CardTitle>
          <CardDescription>You need to be logged in to view your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => router.push("/auth")} className="bg-red-600 hover:bg-red-700">
            Go to Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/rules">
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
              View Rules
            </Button>
          </Link>
          <Button onClick={() => router.push("/book")} className="bg-red-600 hover:bg-red-700">
            Book a Workstation
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Bookings</CardTitle>
          <CardDescription>Manage your workstation bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="floor">By Floor</TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                        <Skeleton className="h-8 w-[100px]" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="upcoming" className="space-y-4">
                  {bookings.filter((b) => b.status === "approved" && new Date(b.startTime) > new Date()).length > 0 ? (
                    bookings
                      .filter((b) => b.status === "approved" && new Date(b.startTime) > new Date())
                      .map((booking) => (
                        <Card key={booking._id || booking.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <h3 className="font-medium flex items-center">
                                  <MapPin className="h-4 w-4 mr-1 text-red-600" />
                                  Floor {booking.floor}, {booking.pcLabel}
                                </h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatDate(booking.startTime)}
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {formatDate(booking.endTime)}
                                </div>
                                <div className="mt-2">{getStatusBadge(booking.status)}</div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelBooking(booking._id || booking.id || "")}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                Cancel
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <p className="text-center py-8 text-gray-500">You don't have any upcoming bookings</p>
                  )}
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                  {bookings.filter((b) => b.status === "pending").length > 0 ? (
                    bookings
                      .filter((b) => b.status === "pending")
                      .map((booking) => (
                        <Card key={booking._id || booking.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <h3 className="font-medium flex items-center">
                                  <MapPin className="h-4 w-4 mr-1 text-red-600" />
                                  Floor {booking.floor}, {booking.pcLabel}
                                </h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatDate(booking.startTime)}
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {formatDate(booking.endTime)}
                                </div>
                                <div className="mt-2">{getStatusBadge(booking.status)}</div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelBooking(booking._id || booking.id || "")}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                Cancel
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <p className="text-center py-8 text-gray-500">You don't have any pending bookings</p>
                  )}
                </TabsContent>

                <TabsContent value="past" className="space-y-4">
                  {bookings.filter(
                    (b) => b.status === "completed" || (b.status === "approved" && new Date(b.endTime) < new Date()),
                  ).length > 0 ? (
                    bookings
                      .filter(
                        (b) =>
                          b.status === "completed" || (b.status === "approved" && new Date(b.endTime) < new Date()),
                      )
                      .map((booking) => (
                        <Card key={booking._id || booking.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <h3 className="font-medium flex items-center">
                                  <MapPin className="h-4 w-4 mr-1 text-red-600" />
                                  Floor {booking.floor}, {booking.pcLabel}
                                </h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatDate(booking.startTime)}
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {formatDate(booking.endTime)}
                                </div>
                                <div className="mt-2">{getStatusBadge(booking.status)}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <p className="text-center py-8 text-gray-500">You don't have any past bookings</p>
                  )}
                </TabsContent>

                <TabsContent value="floor" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">5th Floor Bookings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {bookings.filter((b) => b.floor === 5).length > 0 ? (
                          <div className="space-y-2">
                            {bookings
                              .filter((b) => b.floor === 5)
                              .map((booking) => (
                                <div
                                  key={booking._id || booking.id}
                                  className="p-2 border rounded flex justify-between items-center"
                                >
                                  <div>
                                    <div className="font-medium">{booking.pcLabel}</div>
                                    <div className="text-xs text-gray-500">
                                      {formatDate(booking.startTime).split(",")[0]}
                                    </div>
                                  </div>
                                  {getStatusBadge(booking.status)}
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-center py-4 text-gray-500">No 5th floor bookings</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">4th Floor Bookings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {bookings.filter((b) => b.floor === 4).length > 0 ? (
                          <div className="space-y-2">
                            {bookings
                              .filter((b) => b.floor === 4)
                              .map((booking) => (
                                <div
                                  key={booking._id || booking.id}
                                  className="p-2 border rounded flex justify-between items-center"
                                >
                                  <div>
                                    <div className="font-medium">{booking.pcLabel}</div>
                                    <div className="text-xs text-gray-500">
                                      {formatDate(booking.startTime).split(",")[0]}
                                    </div>
                                  </div>
                                  {getStatusBadge(booking.status)}
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-center py-4 text-gray-500">No 4th floor bookings</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
