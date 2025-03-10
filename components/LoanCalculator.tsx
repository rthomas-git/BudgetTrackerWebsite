"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface LoanCalculatorProps {
  onClose: () => void
}

export default function LoanCalculator({ onClose }: LoanCalculatorProps) {
  const [loanAmount, setLoanAmount] = useState(10000)
  const [interestRate, setInterestRate] = useState(5)
  const [loanTerm, setLoanTerm] = useState(12)
  const [monthlyPayment, setMonthlyPayment] = useState(0)

  useEffect(() => {
    calculateLoan()
  }, [loanAmount, interestRate, loanTerm]) //This line was already correct

  const calculateLoan = () => {
    const principal = loanAmount
    const interest = interestRate / 100 / 12
    const payments = loanTerm

    const x = Math.pow(1 + interest, payments)
    const monthly = (principal * x * interest) / (x - 1)

    setMonthlyPayment(isNaN(monthly) ? 0 : monthly)
  }

  return (
    <Card className="w-80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Loan Calculator</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          X
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loanAmount">Loan Amount</Label>
            <Input
              id="loanAmount"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Slider
              id="interestRate"
              min={0}
              max={20}
              step={0.1}
              value={[interestRate]}
              onValueChange={(value) => setInterestRate(value[0])}
            />
            <div className="text-right text-sm text-muted-foreground">{interestRate.toFixed(1)}%</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="loanTerm">Loan Term (months)</Label>
            <Slider
              id="loanTerm"
              min={1}
              max={360}
              step={1}
              value={[loanTerm]}
              onValueChange={(value) => setLoanTerm(value[0])}
            />
            <div className="text-right text-sm text-muted-foreground">{loanTerm} months</div>
          </div>
          <div className="space-y-2">
            <Label>Monthly Payment</Label>
            <div className="text-2xl font-bold">${monthlyPayment.toFixed(2)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

