"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SeatNotification {
  id: string
  message: string
  timestamp: Date
}

export default function SeatNotificationSystem() {
  const [notifications, setNotifications] = useState<SeatNotification[]>([])
  const [lastCancellationTime, setLastCancellationTime] = useState<number>(0)
  const { toast } = useToast()

  // Poll for new cancellations
  useEffect(() => {
    const checkForCancellations = async () => {
      try {
        const response = await fetch(`/api/notifications/cancellations?since=${lastCancellationTime}`)

        if (response.ok) {
          const data = await response.json()

          if (data.cancellations && data.cancellations.length > 0) {
            // Update last cancellation time
            const latestTimestamp = Math.max(...data.cancellations.map((c: any) => new Date(c.timestamp).getTime()))
            setLastCancellationTime(latestTimestamp)

            // Create notifications for each cancellation
            const newNotifications = data.cancellations.map((cancellation: any) => ({
              id: `notification-${Date.now()}-${Math.random()}`,
              message: `Seat ${cancellation.pcLabel} on Floor ${cancellation.floor} is now available!`,
              timestamp: new Date(),
            }))

            // Add new notifications
            setNotifications((prev) => [...newNotifications, ...prev])

            // Show toast for each new cancellation
            newNotifications.forEach((notification: { message: any }) => {
              toast({
                title: "Seat Available",
                description: notification.message,
              })
            })
          }
        }
      } catch (error) {
        console.error("Error checking for cancellations:", error)
      }
    }

    // Initialize with current timestamp
    if (lastCancellationTime === 0) {
      setLastCancellationTime(Date.now())
    }

    // Poll every 10 seconds
    const interval = setInterval(checkForCancellations, 10000)

    return () => clearInterval(interval)
  }, [lastCancellationTime, toast])

  // Remove notification after 5 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications((prev) => prev.slice(0, -1))
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [notifications])

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-green-100 border border-green-200 text-green-800 rounded-lg p-4 shadow-md flex justify-between items-start"
        >
          <div>
            <p className="font-medium">{notification.message}</p>
            <p className="text-xs mt-1">{notification.timestamp.toLocaleTimeString()}</p>
          </div>
          <button onClick={() => removeNotification(notification.id)} className="text-green-600 hover:text-green-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
