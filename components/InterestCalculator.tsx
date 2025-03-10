"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InterestCalculatorProps {
  onClose: () => void
}

export default function InterestCalculator({ onClose }: InterestCalculatorProps) {
  const [principal, setPrincipal] = useState(1000)
  const [rate, setRate] = useState(5)
  const [time, setTime] = useState(1)
  const [isCompound, setIsCompound] = useState(false)
  const [compoundFrequency, setCompoundFrequency] = useState("annually")
  const [result, setResult] = useState(0)

  const calculateInterest = () => {
    let interestAmount = 0
    if (isCompound) {
      const n = getCompoundFrequency(compoundFrequency)
      interestAmount = principal * Math.pow(1 + rate / (100 * n), n * time) - principal
    } else {
      interestAmount = (principal * rate * time) / 100
    }
    setResult(interestAmount)
  }

  const getCompoundFrequency = (frequency: string): number => {
    switch (frequency) {
      case "annually":
        return 1
      case "semi-annually":
        return 2
      case "quarterly":
        return 4
      case "monthly":
        return 12
      case "daily":
        return 365
      default:
        return 1
    }
  }

  return (
    <Card className="w-80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Interest Calculator</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          X
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principal">Principal Amount</Label>
            <Input
              id="principal"
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Interest Rate (%)</Label>
            <Slider id="rate" min={0} max={20} step={0.1} value={[rate]} onValueChange={(value) => setRate(value[0])} />
            <div className="text-right text-sm text-muted-foreground">{rate.toFixed(1)}%</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time (years)</Label>
            <Input id="time" type="number" value={time} onChange={(e) => setTime(Number(e.target.value))} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="compound" checked={isCompound} onCheckedChange={setIsCompound} />
            <Label htmlFor="compound">Compound Interest</Label>
          </div>
          {isCompound && (
            <div className="space-y-2">
              <Label htmlFor="compoundFrequency">Compound Frequency</Label>
              <Select value={compoundFrequency} onValueChange={setCompoundFrequency}>
                <SelectTrigger id="compoundFrequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="semi-annually">Semi-annually</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Interest Amount</Label>
            <div className="text-2xl font-bold">${result.toFixed(2)}</div>
          </div>
          <div className="space-y-2">
            <Label>Total Amount</Label>
            <div className="text-2xl font-bold">${(principal + result).toFixed(2)}</div>
          </div>
          <Button onClick={calculateInterest} className="w-full mt-4">
            Calculate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

