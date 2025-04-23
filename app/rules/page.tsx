import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Workstation Booking Rules</h1>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="general">General Rules</TabsTrigger>
          <TabsTrigger value="floor5">5th Floor</TabsTrigger>
          <TabsTrigger value="floor4">4th Floor</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Booking Rules</CardTitle>
              <CardDescription>These rules apply to all workstation bookings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Access Control</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Only users with <strong>@sitpune.edu.in</strong> email addresses can register and book workstations
                  </li>
                  <li>One active booking per user at a time</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Booking Duration</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Standard bookings can be made for up to 4 days</li>
                  <li>Bookings longer than 4 days require admin approval</li>
                  <li>Assistance can be done using our 24/7 live chatbot</li>
                  <li>For any further queries email us on BookMyDeskSIT@gmail.com</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Queue System</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>If a seat is occupied, users can join a queue for that seat</li>
                  <li>Users will be notified when the seat becomes available</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="floor5">
          <Card>
            <CardHeader>
              <CardTitle>5th Floor - General Workstation Rules</CardTitle>
              <CardDescription>Rules specific to the 5th floor workstations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Seat Labeling</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Seats are labeled PC1 through PC48</li>
                  <li>Total: 8 rows × 6 seats = 48 seats</li>
                  <li>Seat numbering continues row-wise (left to right)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Reserved Seats</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Last row (PC43-PC48) has special reservations:</li>
                  <li>PC43-PC45 → Reserved for Other Departments</li>
                  <li>PC46-PC48 → Reserved for SCAAI</li>
                  <li>These seats cannot be booked by regular users</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Usage Guidelines</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>General purpose workstations for regular computing tasks</li>
                  <li>Suitable for programming, web browsing, document editing, etc.</li>
                  <li>Please log out when your session is complete</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="floor4">
          <Card>
            <CardHeader>
              <CardTitle>4th Floor - NVIDIA Workstation Rules</CardTitle>
              <CardDescription>Rules specific to the 4th floor NVIDIA workstations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Seat Labeling</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Seats are labeled NVIDIA-1 through NVIDIA-6</li>
                  <li>Total: 6 high-performance workstations</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Usage Guidelines</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>NVIDIA workstations are for specialized computing tasks only</li>
                  <li>Suitable for AI/ML training, 3D rendering, simulation, etc.</li>
                  <li>Do not use for general computing tasks that can be done on 5th floor</li>
                  <li>Save your work frequently and clean up temporary files</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Software Usage</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>CUDA toolkit and related libraries are pre-installed</li>
                  <li>Do not uninstall or modify system software</li>
                  <li>For software installation requests, contact the admin</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-center">
        <Link href="/book">
          <Button className="bg-red-600 hover:bg-red-700">Book a Workstation</Button>
        </Link>
      </div>
    </div>
  )
}
