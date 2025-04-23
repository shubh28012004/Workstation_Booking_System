"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, Download, FileText, Filter, MapPin, Phone, User, Users, Mail, Building } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUserContext } from "@/context/user-context"

interface Booking {
  _id: string
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

interface AdminDashboardUser {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  department?: string
  created_at?: string
}

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<AdminDashboardUser[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [floorFilter, setFloorFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUserContext()

  useEffect(() => {
    // Check if user is logged in and is admin
    if (!user) {
      router.push("/auth")
      return
    }

    if (user.email !== "adminbmd@sitpune.edu.in") {
      router.push("/dashboard")
      return
    }

    fetchBookings()
    fetchUsers()
  }, [router, user])

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

      // Get user from context instead of localStorage token
      if (!user || user.email !== "adminbmd@sitpune.edu.in") {
        setLoading(false)
        return
      }

      // Fetch bookings from API with credentials included
      const response = await fetch("/api/admin/bookings", {
        credentials: "include", // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error("Failed to fetch bookings")
      }

      const data = await response.json()
      console.log("Fetched bookings:", data) // Debug log
      setBookings(data)
      setFilteredBookings(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      })
      console.error("Error fetching admin bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      // Fetch users with credentials included
      const response = await fetch("/api/admin/users", {
        credentials: "include", // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    }
  }

  const updateBookingStatus = async (bookingId: string, status: "approved" | "rejected") => {
    try {
      // Call the API with credentials included
      const response = await fetch("/api/admin/bookings/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({ id: bookingId, status }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Update failed")
      }

      // Refresh bookings after update
      fetchBookings()

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

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!user || user.email !== "adminbmd@sitpune.edu.in") {
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

      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Bookings that require admin approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.filter((b) => b.status === "pending").length > 0 ? (
                  bookings
                    .filter((b) => b.status === "pending")
                    .map((booking) => (
                      <Card key={booking._id}>
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
                                onClick={() => updateBookingStatus(booking._id, "rejected")}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(booking._id, "approved")}
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>Manage workstation bookings for all users</CardDescription>
            </CardHeader>
            <CardContent>
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

              <div className="space-y-4">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <Card key={booking._id}>
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
                                onClick={() => updateBookingStatus(booking._id, "rejected")}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(booking._id, "approved")}
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
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <div className="flex items-center text-sm text-gray-500">
                <FileText className="h-4 w-4 mr-2" />
                Total bookings: {filteredBookings.length}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.length > 0 ? (
                  users.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1 text-gray-500" />
                              <h3 className="font-medium">{user.name}</h3>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="h-4 w-4 mr-1" />
                              {user.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-4 w-4 mr-1" />
                              {user.phone || "Not provided"}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Building className="h-4 w-4 mr-1" />
                              {user.department || "Not specified"}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              Registered: {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setStatusFilter("all")
                                setFilteredBookings(bookings.filter((b) => b.userId === user.id))
                                const element = document.querySelector('[data-value="all"]')
                                if (element instanceof HTMLElement) {
                                  element.click()
                                }
                              }}
                            >
                              View Bookings
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center py-8 text-gray-500">No users found</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-2" />
                Total users: {users.length}
              </div>
            </CardFooter>
          </Card>
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
                    {bookings.filter((b) => b.status === "approved" && new Date(b.startTime) > new Date()).length}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Upcoming Bookings</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{users.length}</div>
                  <p className="text-sm text-gray-500 mt-1">Registered Users</p>
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
                    <span className="font-medium">{bookings.filter((b) => b.status === "approved").length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      Rejected
                    </span>
                    <span className="font-medium">{bookings.filter((b) => b.status === "rejected").length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                      Completed
                    </span>
                    <span className="font-medium">{bookings.filter((b) => b.status === "completed").length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
