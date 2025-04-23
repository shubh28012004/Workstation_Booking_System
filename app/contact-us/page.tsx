"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, Send } from "lucide-react"

export default function ContactUsPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real implementation, you would send this data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Message sent",
        description: "Thank you for contacting us. We'll get back to you soon.",
      })

      // Reset form
      setName("")
      setEmail("")
      setMessage("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Contact Lab Administrator</CardTitle>
            <CardDescription>Fill out the form below to get in touch with us</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Other ways to reach us</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4">
              <Mail className="h-6 w-6 text-red-600 mt-1" />
              <div>
                <h3 className="font-medium">Email Us</h3>
                <p className="text-sm text-gray-500 mt-1">For general inquiries or support:</p>
                <a href="mailto:BookMyDeskSIT@gmail.com" className="text-red-600 hover:underline mt-1 inline-block">
                  BookMyDeskSIT@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Phone className="h-6 w-6 text-red-600 mt-1" />
              <div>
                <h3 className="font-medium">Phone Support</h3>
                <p className="text-sm text-gray-500 mt-1">Available Monday to Friday, 9am to 5pm:</p>
                <p className="mt-1">+91 020-12345678</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mt-6">
              <h3 className="font-medium mb-2">Visit Us</h3>
              <p className="text-sm text-gray-500">
                Symbiosis Institute of Technology
                <br />
                Lavale, Pune, Maharashtra 412115
                <br />
                India
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
