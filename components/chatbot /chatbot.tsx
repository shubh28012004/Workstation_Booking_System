"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Minimize2, Maximize2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your BOOK MY DESK assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Predefined responses for simulation
  const predefinedResponses: Record<string, string> = {
    hello: "Hello! How can I assist you with booking a workstation today?",
    hi: "Hi there! How can I help you with your workstation booking?",
    help: "I can help you with booking workstations, checking availability, and answering questions about the system. What would you like to know?",
    book: "To book a workstation, go to the 'Book Seat' page, select your preferred floor, choose an available seat, and set your booking time.",
    cancel:
      "You can cancel your booking from your dashboard. Go to the 'Dashboard' page, find your booking, and click the 'Cancel' button.",
    floor:
      "We have workstations on the 4th floor (NVIDIA workstations) and 5th floor (regular workstations). Which one are you interested in?",
    rules:
      "The main rules are: bookings longer than 4 days require admin approval, reserved seats are not available for general booking, and cancellations must be made at least 24 hours in advance.",
    contact: "For technical support, please contact the IT department at it@sitpune.edu.in or call 020-12345678.",
    thanks: "You're welcome! Feel free to ask if you need any more assistance.",
    "thank you": "You're welcome! Is there anything else I can help you with?",
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Update the handleSendMessage function to use the real chatbot API
  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    try {
      // Call the chatbot API
      const response = await fetch("https://1f21-103-68-38-66.ngrok-free.app/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_query: input,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from chatbot")
      }

      const data = await response.json()

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.answer || "I'm sorry, I couldn't process your request at this time.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Chatbot API error:", error)

      // Add fallback bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting to my knowledge base. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const toggleChatbot = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button onClick={toggleChatbot} className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700 shadow-lg">
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className={`w-80 shadow-lg transition-all duration-200 ${isMinimized ? "h-14" : "h-96"}`}>
          <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0 border-b">
            <CardTitle className="text-sm font-medium">BOOK MY DESK Assistant</CardTitle>
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleMinimize}>
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleChatbot}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          {!isMinimized && (
            <>
              <CardContent className="p-3 overflow-y-auto h-[calc(100%-7rem)]">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === "user" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {message.sender === "bot" && (
                          <div className="flex items-center mb-1">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src="/images/symbiosis-logo.png" />
                              <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-semibold">Assistant</span>
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1 text-right">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              <CardFooter className="p-3 pt-0">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={handleSendMessage} className="bg-red-600 hover:bg-red-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </div>
  )
}
