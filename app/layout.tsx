import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import Image from "next/image"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/layout/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "BOOK MY DESK - Workstation Booking System",
  description: "Book college workstations easily",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
          <footer className="bg-white border-t py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-center">
                <Image
                  src="/images/symbiosis-logo.png"
                  alt="Symbiosis Institute of Technology"
                  width={100}
                  height={100}
                  className="mb-2"
                />
                <p className="text-center text-sm text-gray-500">
                  &copy; {new Date().getFullYear()} BOOK MY DESK - Workstation Booking System
                </p>
                <p className="text-center text-sm text-gray-500 mt-1">Website created by Team Symbiosis</p>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
