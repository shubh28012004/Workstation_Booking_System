"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Info } from "lucide-react"

interface FloorSelectorProps {
  onFloorSelect: (floor: number) => void
}

export default function FloorSelector({ onFloorSelect }: FloorSelectorProps) {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)

  const handleFloorSelect = (floor: number) => {
    setSelectedFloor(floor)
    onFloorSelect(floor)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Select Floor</CardTitle>
        <CardDescription>Choose which floor you want to book a workstation on</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Button
          variant={selectedFloor === 4 ? "default" : "outline"}
          className={`h-24 text-lg ${selectedFloor === 4 ? "bg-red-600 hover:bg-red-700" : "border-red-600 text-red-600 hover:bg-red-50"}`}
          onClick={() => handleFloorSelect(4)}
        >
          4th Floor
          <span className="block text-xs mt-1">NVIDIA Workstation</span>
          <span className="block text-xs mt-1">6 Seats</span>
        </Button>
        <Button
          variant={selectedFloor === 5 ? "default" : "outline"}
          className={`h-24 text-lg ${selectedFloor === 5 ? "bg-red-600 hover:bg-red-700" : "border-red-600 text-red-600 hover:bg-red-50"}`}
          onClick={() => handleFloorSelect(5)}
        >
          5th Floor
          <span className="block text-xs mt-1">Regular Workstation</span>
          <span className="block text-xs mt-1">48 Seats</span>
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/rules" className="flex items-center text-sm text-gray-500 hover:text-red-600">
          <Info className="h-4 w-4 mr-1" />
          View booking rules for each floor
        </Link>
      </CardFooter>
    </Card>
  )
}
