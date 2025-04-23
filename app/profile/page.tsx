"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, MapPin, Phone, Mail, Building, User, Edit } from "lucide-react"
import { useUserContext } from "@/context/user-context"

interface Booking {
  id: string
  seatId: string
  pcLabel: string
  floor: number
  startTime: string
  endTime: string
  status: "pending" | "approved" | "rejected" | "completed"
}

export default function ProfilePage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { user: contextUser, isLoading } = useUserContext()

  // Update the useEffect hook to use the UserContext
  useEffect(() => {
    // Check if user is logged in using the UserContext
    if (!isLoading) {
      if (contextUser) {
        setUser(contextUser)
        fetchBookings()
      } else {
        router.push("/auth")
      }
    }
  }, [contextUser, isLoading, router])

  // Add this new function to fetch user profile data:
  const fetchUserProfile = async () => {
    try {
      // In a real app, we would fetch from the API
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }

      const userData = await response.json()
      setUser(userData)
    } catch (error) {
      console.error("Error fetching user profile:", error)
      // Fallback to localStorage if API fails
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }
  }

  const fetchBookings = async () => {
    try {
      setLoading(true)
      // In a real app, we would fetch from the API
      // const token = localStorage.getItem('token');
      // const response = await fetch('/api/bookings', {
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
          seatId: "5-2-3",
          pcLabel: "PC9",
          floor: 5,
          startTime: new Date(Date.now() + 86400000).toISOString(), // tomorrow
          endTime: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
          status: "approved",
        },
        {
          id: "2",
          seatId: "4-1-2",
          pcLabel: "PC2",
          floor: 4,
          startTime: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
          endTime: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
          status: "pending",
        },
        {
          id: "3",
          seatId: "5-4-1",
          pcLabel: "PC19",
          floor: 5,
          startTime: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          endTime: new Date(Date.now() - 86400000).toISOString(), // yesterday
          status: "completed",
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

  if (loading || isLoading) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="space-y-4 flex-1">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">User Profile</CardTitle>
          <CardDescription>Your personal information and account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32">
                <AvatarImage
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="mt-4">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.role === "admin" ? "Administrator" : "Regular User"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{user.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{user.department || "Computer Science"}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">
                    Account created: {new Date(user.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
          <CardDescription>Your past and upcoming bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="all">All Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {bookings.filter((b) => new Date(b.startTime) > new Date()).length > 0 ? (
                bookings
                  .filter((b) => new Date(b.startTime) > new Date())
                  .map((booking) => (
                    <Card key={booking.id}>
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
                <p className="text-center py-8 text-gray-500">You don't have any upcoming bookings</p>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {bookings.filter((b) => new Date(b.endTime) < new Date()).length > 0 ? (
                bookings
                  .filter((b) => new Date(b.endTime) < new Date())
                  .map((booking) => (
                    <Card key={booking.id}>
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

            <TabsContent value="all" className="space-y-4">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <Card key={booking.id}>
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
                <p className="text-center py-8 text-gray-500">You don't have any bookings</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
