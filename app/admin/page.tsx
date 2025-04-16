"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, Download, FileText, Filter, MapPin, Phone, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Booking {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  seatId: string
  pcLabel: string
  floor: number
  startTime: string
  endTime: string
  status: "pending" | "approved" | "rejected" | "completed"
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [floorFilter, setFloorFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
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

  useEffect(() => {
    // Apply filters
    let result = [...bookings]

    if (floorFilter !== "all") {
      result = result.filter((booking) => booking.floor === Number.parseInt(floorFilter))
    }

    if (statusFilter !== "all") {
      result = result.filter((booking) => booking.status === statusFilter)
    }

    setFilteredBookings(result)
  }, [bookings, floorFilter, statusFilter])

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
          userEmail: "john@sitpune.edu.in",
          userPhone: "9876543210",
          seatId: "5-2-3",
          pcLabel: "PC9",
          floor: 5,
          startTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
          endTime: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
          status: "approved",
        },
        {
          id: "2",
          userId: "user2",
          userName: "Jane Smith",
          userEmail: "jane@sitpune.edu.in",
          userPhone: "9876543211",
          seatId: "4-1-2",
          pcLabel: "NVIDIA-2",
          floor: 4,
          startTime: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
          endTime: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
          status: "pending",
        },
        {
          id: "3",
          userId: "user3",
          userName: "Bob Johnson",
          userEmail: "bob@sitpune.edu.in",
          userPhone: "9876543212",
          seatId: "5-4-1",
          pcLabel: "PC19",
          floor: 5,
          startTime: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          endTime: new Date(Date.now() - 86400000).toISOString(), // yesterday
          status: "completed",
        },
        {
          id: "4",
          userId: "user4",
          userName: "Alice Brown",
          userEmail: "alice@sitpune.edu.in",
          userPhone: "9876543213",
          seatId: "5-1-6",
          pcLabel: "PC6",
          floor: 5,
          startTime: new Date(Date.now() + 345600000).toISOString(), // 4 days from now
          endTime: new Date(Date.now() + 1209600000).toISOString(), // 14 days from now
          status: "pending",
        },
      ]

      setBookings(demoBookings)
      setFilteredBookings(demoBookings)
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

      const updatedBookings = bookings.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking))

      setBookings(updatedBookings)

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

  const exportBookingsCSV = () => {
    // Create CSV content
    const headers = ["Name", "Email", "Phone", "Floor", "Seat", "Start Time", "End Time", "Status"]
    const rows = filteredBookings.map((booking) => [
      booking.userName,
      booking.userEmail,
      booking.userPhone,
      booking.floor,
      booking.pcLabel,
      formatDate(booking.startTime),
      formatDate(booking.endTime),
      booking.status,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `bookings-export-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: "Bookings have been exported to CSV",
    })
  }

  if (!isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Manage all workstation bookings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            User Dashboard
          </Button>
          <Button onClick={exportBookingsCSV} className="bg-red-600 hover:bg-red-700">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
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
              <TabsTrigger value="stats">Statistics</TabsTrigger>
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
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1 text-gray-500" />
                                  <h3 className="font-medium">{booking.userName}</h3>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  Floor {booking.floor}, {booking.pcLabel}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatDate(booking.startTime)}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {formatDate(booking.endTime)}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {booking.userPhone}
                                </div>
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
                                <Button
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking.id, "approved")}
                                  className="bg-red-600 hover:bg-red-700"
                                >
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
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Filters:</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <Select value={floorFilter} onValueChange={setFloorFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Floor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Floors</SelectItem>
                          <SelectItem value="4">4th Floor</SelectItem>
                          <SelectItem value="5">5th Floor</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1 text-gray-500" />
                                <h3 className="font-medium">{booking.userName}</h3>
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="h-4 w-4 mr-1" />
                                Floor {booking.floor}, {booking.pcLabel}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(booking.startTime)}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatDate(booking.endTime)}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Phone className="h-4 w-4 mr-1" />
                                {booking.userPhone}
                              </div>
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
                                <Button
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking.id, "approved")}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Approve
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center py-8 text-gray-500">No bookings found with the selected filters</p>
                  )}
                </TabsContent>

                <TabsContent value="stats">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600">
                            {bookings.filter((b) => b.status === "pending").length}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Pending Approvals</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600">
                            {
                              bookings.filter((b) => b.status === "approved" && new Date(b.startTime) > new Date())
                                .length
                            }
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Upcoming Bookings</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600">
                            {bookings.filter((b) => b.status === "completed").length}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Completed Bookings</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Bookings by Floor</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span>4th Floor (NVIDIA)</span>
                            <div className="flex items-center">
                              <div className="w-40 bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-red-600 h-2.5 rounded-full"
                                  style={{
                                    width: `${(bookings.filter((b) => b.floor === 4).length / bookings.length) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm">{bookings.filter((b) => b.floor === 4).length}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>5th Floor (Regular)</span>
                            <div className="flex items-center">
                              <div className="w-40 bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-red-600 h-2.5 rounded-full"
                                  style={{
                                    width: `${(bookings.filter((b) => b.floor === 5).length / bookings.length) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm">{bookings.filter((b) => b.floor === 5).length}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Bookings by Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                              Pending
                            </span>
                            <span className="font-medium">{bookings.filter((b) => b.status === "pending").length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                              Approved
                            </span>
                            <span className="font-medium">
                              {bookings.filter((b) => b.status === "approved").length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                              Rejected
                            </span>
                            <span className="font-medium">
                              {bookings.filter((b) => b.status === "rejected").length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                              Completed
                            </span>
                            <span className="font-medium">
                              {bookings.filter((b) => b.status === "completed").length}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <div className="flex items-center text-sm text-gray-500">
            <FileText className="h-4 w-4 mr-2" />
            Total bookings: {bookings.length}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
