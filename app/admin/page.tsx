"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

interface Booking {
  id: string
  userId: string
  userName: string
  seatId: string
  floor: number
  startTime: string
  endTime: string
  status: "pending" | "approved" | "rejected" | "completed"
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in and is admin
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      router.push("/auth")
      return
    }

    const user = JSON.parse(userStr)
    if (user.role !== "admin") {
      router.push("/dashboard")
      return
    }

    setIsAdmin(true)
    fetchBookings()
  }, [router])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      // In a real app, we would fetch from the API
      // const token = localStorage.getItem('token');
      // const response = await fetch('/api/admin/bookings', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // const data = await response.json();

      // For demo purposes, we'll generate bookings
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const demoBookings: Booking[] = [
        {
          id: "1",
          userId: "user1",
          userName: "John Doe",
          seatId: "5-2-3",
          floor: 5,
          startTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
          endTime: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
          status: "approved",
        },
        {
          id: "2",
          userId: "user2",
          userName: "Jane Smith",
          seatId: "4-1-2",
          floor: 4,
          startTime: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
          endTime: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
          status: "pending",
        },
        {
          id: "3",
          userId: "user3",
          userName: "Bob Johnson",
          seatId: "5-4-1",
          floor: 5,
          startTime: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          endTime: new Date(Date.now() - 86400000).toISOString(), // yesterday
          status: "completed",
        },
        {
          id: "4",
          userId: "user4",
          userName: "Alice Brown",
          seatId: "5-1-6",
          floor: 5,
          startTime: new Date(Date.now() + 345600000).toISOString(), // 4 days from now
          endTime: new Date(Date.now() + 1209600000).toISOString(), // 14 days from now
          status: "pending",
        },
      ]

      setBookings(demoBookings)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: "approved" | "rejected") => {
    try {
      // In a real app, we would call the API
      // const token = localStorage.getItem('token');
      // const response = await fetch(`/api/admin/bookings/${bookingId}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ status })
      // });

      // if (!response.ok) {
      //   const data = await response.json();
      //   throw new Error(data.error || 'Update failed');
      // }

      // For demo purposes, we'll simulate update
      await new Promise((resolve) => setTimeout(resolve, 500))

      setBookings(bookings.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)))

      toast({
        title: `Booking ${status}`,
        description: `The booking has been ${status} successfully`,
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
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

  if (!isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => router.push("/dashboard")}>User Dashboard</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>Manage workstation bookings for all users</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending Approval</TabsTrigger>
              <TabsTrigger value="all">All Bookings</TabsTrigger>
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
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 w-[80px]" />
                          <Skeleton className="h-8 w-[80px]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="pending" className="space-y-4">
                  {bookings.filter((b) => b.status === "pending").length > 0 ? (
                    bookings
                      .filter((b) => b.status === "pending")
                      .map((booking) => (
                        <Card key={booking.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                              <div>
                                <h3 className="font-medium">
                                  {booking.userName} - Floor {booking.floor}, Seat {booking.seatId.split("-")[2]}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
                                </p>
                                <div className="mt-2">{getStatusBadge(booking.status)}</div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking.id, "rejected")}
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  Reject
                                </Button>
                                <Button size="sm" onClick={() => updateBookingStatus(booking.id, "approved")}>
                                  Approve
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <p className="text-center py-8 text-gray-500">No bookings pending approval</p>
                  )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                  {bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div>
                              <h3 className="font-medium">
                                {booking.userName} - Floor {booking.floor}, Seat {booking.seatId.split("-")[2]}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
                              </p>
                              <div className="mt-2">{getStatusBadge(booking.status)}</div>
                            </div>
                            {booking.status === "pending" && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking.id, "rejected")}
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  Reject
                                </Button>
                                <Button size="sm" onClick={() => updateBookingStatus(booking.id, "approved")}>
                                  Approve
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center py-8 text-gray-500">No bookings found</p>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
