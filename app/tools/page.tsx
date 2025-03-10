"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import InvestmentCalculator from "@/components/InvestmentCalculator"
import { useState } from "react"
import { CalculatorIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Calculator from "@/components/Calculator"

export default function ToolsPage() {
  const [showCalculator, setShowCalculator] = useState(false)
  return (
    <div className="container mx-auto p-4 space-y-6 relative min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Investment Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <InvestmentCalculator />
        </CardContent>
      </Card>

      <div className="fixed bottom-4 right-4 z-50">
        <Button
          className="rounded-full w-12 h-12 p-0 shadow-lg bg-black text-white hover:bg-black/90"
          onClick={() => setShowCalculator(!showCalculator)}
        >
          <CalculatorIcon className="h-6 w-4" />
        </Button>
        {showCalculator && (
          <div className="absolute bottom-16 right-0">
            <Calculator onClose={() => setShowCalculator(false)} />
          </div>
        )}
      </div>
    </div>
  )
}

