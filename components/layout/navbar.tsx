"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUserContext } from "@/context/user-context"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout, isLoading } = useUserContext()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
    router.push("/")
  }

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Book Seat", path: "/book" },
    { name: "Rules", path: "/rules" },
    { name: "Contact Us", path: "/contact-us" },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                src="/images/symbiosis-logo.png"
                alt="Symbiosis Institute of Technology"
                width={80}
                height={80}
                className="mr-3"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-red-600">BOOK MY DESK</span>
                <span className="text-xs text-gray-500">Workstation Booking System</span>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.path
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {user && user.role === "admin" && (
              <Link
                href="/admin-dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/admin-dashboard"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex md:items-center">
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/profile"
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        pathname === "/profile"
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {user.name}
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link href="/auth">
                    <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700">
                      Login
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.path
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={closeMenu}
              >
                {item.name}
              </Link>
            ))}
            {user && user.role === "admin" && (
              <Link
                href="/admin-dashboard"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === "/admin-dashboard"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={closeMenu}
              >
                Admin
              </Link>
            )}
            {user && (
              <Link
                href="/profile"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === "/profile"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={closeMenu}
              >
                Profile
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {!isLoading && (
              <>
                {user ? (
                  <div className="px-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">{user.name}</div>
                        <div className="text-sm font-medium text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleLogout()
                        closeMenu()
                      }}
                      className="flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="px-4">
                    <Link href="/auth" onClick={closeMenu}>
                      <Button variant="default" size="sm" className="w-full bg-red-600 hover:bg-red-700">
                        Login
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
