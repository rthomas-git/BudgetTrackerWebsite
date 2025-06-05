"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function InterestCalculator({ onClose }: { onClose: () => void }) {
  const [principal, setPrincipal] = useState(1000)
  const [rate, setRate] = useState(5)
  const [time, setTime] = useState(1)
  const [interest, setInterest] = useState(0)

  useEffect(() => {
    calculateInterest()
  }, [principal, rate, time])

  const calculateInterest = () => {
    const calculatedInterest = (principal * rate * time) / 100
    setInterest(calculatedInterest)
  }

  return (
    <Card className="w-80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Interest Calculator</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principal">Principal Amount ($)</Label>
            <Input
              id="principal"
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Slider
              id="interestRate"
              min={0}
              max={20}
              step={0.1}
              value={[rate]}
              onValueChange={(value) => setRate(value[0])}
            />
            <div className="text-right text-sm text-muted-foreground">{rate.toFixed(1)}%</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time (Years)</Label>
            <Input id="time" type="number" value={time} onChange={(e) => setTime(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Interest</Label>
            <div className="text-2xl font-bold">${interest.toFixed(2)}</div>
          </div>
          <Button className="w-full bg-black text-white hover:bg-black/90" onClick={calculateInterest}>
            Calculate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
