import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/images/symbiosis-logo.png"
          alt="Symbiosis Institute of Technology"
          width={120}
          height={120}
          className="mb-4"
        />
      </div>

      <div className="max-w-3xl text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block text-red-600">BOOK MY DESK</span>
          <span className="block text-2xl mt-2">Workstation Booking System</span>
        </h1>
        <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
          Book workstations on the 4th and 5th floors easily. View availability in real-time and manage your bookings.
        </p>
        <div className="mt-5 sm:mt-8 sm:flex sm:justify-center">
          <div className="rounded-md shadow">
            <Link href="/book">
              <Button size="lg" className="w-full bg-red-600 hover:bg-red-700">
                Book a Workstation
              </Button>
            </Link>
          </div>
          <div className="mt-3 sm:mt-0 sm:ml-3">
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full border-red-600 text-red-600 hover:bg-red-50">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>5th Floor Workstation</CardTitle>
            <CardDescription>Regular workstations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              6 rows × 6 seats (36 total). PC labels start from PC2. Last row has special reservations for other
              departments and SCAAI.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/book?floor=5" className="w-full">
              <Button variant="outline" className="w-full border-red-600 text-red-600 hover:bg-red-50">
                Book 5th Floor
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4th Floor Workstation</CardTitle>
            <CardDescription>NVIDIA workstations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              3 high-performance workstations (PC1, PC2, PC3) available for specialized computing tasks and research.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/book?floor=4" className="w-full">
              <Button variant="outline" className="w-full border-red-600 text-red-600 hover:bg-red-50">
                Book 4th Floor
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Rules</CardTitle>
            <CardDescription>Important information</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-500 space-y-2 list-disc pl-5">
              <li>Bookings longer than 4 days require admin approval</li>
              <li>Reserved seats are not available for general booking</li>
              <li>Cancellations must be made at least 24 hours in advance</li>
              <li>Only @sitpune.edu.in email addresses are allowed to register</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/rules" className="w-full">
              <Button variant="outline" className="w-full border-red-600 text-red-600 hover:bg-red-50">
                View All Rules
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
