"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"

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

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      setIsLoading(true)

      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        } catch {
          localStorage.removeItem("user")
        }
      }

      const response = await fetch("/api/auth/session", {
        credentials: "include", // Must include cookies for session validation
      })

      if (response.ok) {
        const data = await response.json()
        if (data.authenticated && data.user) {
          setUser(data.user)
          localStorage.setItem("user", JSON.stringify(data.user))
        } else {
          setUser(null)
          localStorage.removeItem("user")
        }
      } else {
        if (!storedUser) setUser(null)
      }
    } catch (error) {
      console.error("Session check failed:", error)
      if (!localStorage.getItem("user")) {
        setUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (err) {
      console.error("Logout failed:", err)
    } finally {
      localStorage.removeItem("user")
      setUser(null)
    }
  }

  return (
    <UserContext.Provider
      value={{ user, setUser, isLoading, logout, checkSession }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider")
  }
  return context
}

export const useUser = useUserContext