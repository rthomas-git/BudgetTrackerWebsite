"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CalculatorIcon } from "lucide-react"
import Calculator from "@/components/Calculator"

export function SimpleCalculator() {
  const [showCalculator, setShowCalculator] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button className="rounded-full w-12 h-12 p-0 shadow-lg" onClick={() => setShowCalculator(!showCalculator)}>
        <CalculatorIcon className="h-6 w-6" />
      </Button>
      {showCalculator && (
        <div className="absolute bottom-16 right-0">
          <Calculator onClose={() => setShowCalculator(false)} />
        </div>
      )}
    </div>
  )
}
