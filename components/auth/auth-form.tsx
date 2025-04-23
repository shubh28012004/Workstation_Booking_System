"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUserContext } from "@/context/user-context"

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const [registerError, setRegisterError] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const { setUser } = useUserContext()

  const validateSITEmail = (email: string) => {
    const sitEmailRegex = /^[a-zA-Z0-9._%+-]+@sitpune\.edu\.in$/
    return sitEmailRegex.test(email)
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setEmailError("")
    setLoginSuccess(false)
    setLoginError("")

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Validate SIT email
    if (!validateSITEmail(email)) {
      setEmailError("Only @sitpune.edu.in email addresses are allowed")
      setIsLoading(false)
      return
    }

    // Check if trying to login as admin with the correct credentials
    const isAdminLogin = email === "adminbmd@sitpune.edu.in" && password === "admin123"

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important: include cookies in the request
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Set user in context
      setUser(data.user)

      // Also store in localStorage for immediate UI response on page loads
      localStorage.setItem("user", JSON.stringify(data.user))

      setLoginSuccess(true)

      toast({
        title: isAdminLogin ? "Admin login successful" : "Login successful",
        description: isAdminLogin ? "Welcome to the admin dashboard!" : "Welcome back!",
      })

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push(isAdminLogin ? "/admin-dashboard" : "/dashboard")
      }, 1500)
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Invalid credentials or server error")

      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setEmailError("")
    setRegisterSuccess(false)
    setRegisterError("")

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const phone = formData.get("phone") as string

    // Validate SIT email
    if (!validateSITEmail(email)) {
      setEmailError("Only @sitpune.edu.in email addresses are allowed")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setRegisterSuccess(true)

      toast({
        title: "Registration successful",
        description: "Please log in with your new account",
      })

      // Switch to login tab after a short delay
      setTimeout(() => {
        document.getElementById("login-tab")?.click()
      }, 1500)
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : "Registration failed. Try a different email.")

      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <Tabs defaultValue="login">
        <CardHeader>
          <CardTitle className="text-2xl text-center">BOOK MY DESK</CardTitle>
          <CardDescription className="text-center">Login or create an account to book workstations</CardDescription>
          <TabsList className="grid w-full grid-cols-2 mt-4">
            <TabsTrigger value="login" id="login-tab">
              Login
            </TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
        </CardHeader>
        <TabsContent value="login">
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {loginSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    Login successful! Redirecting to dashboard...
                  </AlertDescription>
                </Alert>
              )}

              {loginError && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">{loginError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="your.name@sitpune.edu.in" required />
                {emailError && (
                  <div className="flex items-center text-red-500 text-sm mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {emailError}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
        <TabsContent value="register">
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              {registerSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    Registration successful! Redirecting to login...
                  </AlertDescription>
                </Alert>
              )}

              {registerError && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">{registerError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="your.name@sitpune.edu.in" required />
                {emailError && (
                  <div className="flex items-center text-red-500 text-sm mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {emailError}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" placeholder="9876543210" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
