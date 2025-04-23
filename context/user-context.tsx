"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: string
  phone?: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkSession()
  }, [])

  // Update the checkSession function to properly handle session persistence
  const checkSession = async () => {
    try {
      setIsLoading(true)

      // First check if we have a user in localStorage (for immediate UI response)
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        } catch (e) {
          // Invalid JSON in localStorage
          localStorage.removeItem("user")
        }
      }

      // Then verify with the server (source of truth)
      const response = await fetch("/api/auth/session", {
        credentials: "include", // Important: include cookies in the request
      })

      if (response.ok) {
        const data = await response.json()
        if (data.authenticated && data.user) {
          // Update user state with server data
          setUser(data.user)
          // Update localStorage with the latest user data
          localStorage.setItem("user", JSON.stringify(data.user))
        } else {
          // Server says not authenticated, clear local state
          setUser(null)
          localStorage.removeItem("user")
        }
      } else {
        // Server error, but don't log out if we have local user data
        // This prevents logout on temporary server issues
        if (!storedUser) {
          setUser(null)
        }
      }
    } catch (error) {
      console.error("Error checking session:", error)
      // Don't clear user on network errors if we have local data
      // This prevents logout when offline
      if (!localStorage.getItem("user")) {
        setUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Update the logout function to properly clear the session
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Important: include cookies in the request
      })

      // Clear local storage and state
      localStorage.removeItem("user")
      localStorage.removeItem("token") // Remove any legacy token if it exists
      setUser(null)
    } catch (error) {
      console.error("Error logging out:", error)
      // Still clear local state even if server request fails
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      setUser(null)
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, logout, checkSession }}>{children}</UserContext.Provider>
  )
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider")
  }
  return context
}
