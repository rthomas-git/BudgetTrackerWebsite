"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ResponsiveContainer, Tooltip } from "recharts"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ScrollArea } from "@/components/ui/scroll-area"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

export default function InvestmentCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(1000)
  const [monthlyContribution, setMonthlyContribution] = useState(100)
  const [years, setYears] = useState(10)
  const [interestRate, setInterestRate] = useState(7)
  const [projectedValue, setProjectedValue] = useState(0)
  const [accumulationSchedule, setAccumulationSchedule] = useState<
    { year: number; value: number; interest: number; contributions: number }[]
  >([])

  const calculateInvestment = () => {
    const monthlyRate = interestRate / 100 / 12
    const months = years * 12
    let total = initialInvestment
    const yearlyData = []
    let totalContributions = initialInvestment
    let totalInterest = 0

    for (let i = 0; i <= months; i++) {
      if (i % 12 === 0) {
        yearlyData.push({
          year: i / 12,
          value: total,
          interest: totalInterest,
          contributions: totalContributions,
          startingAmount: initialInvestment,
          additionalContributions: totalContributions - initialInvestment,
        })
      }
      total += monthlyContribution
      totalContributions += monthlyContribution
      const monthlyInterest = total * monthlyRate
      total += monthlyInterest
      totalInterest += monthlyInterest
    }

    setProjectedValue(total)
    setAccumulationSchedule(yearlyData)
  }

  useEffect(() => {
    calculateInvestment()
  }, [initialInvestment, monthlyContribution, years, interestRate])

  const pieChartData = [
    { name: "Starting Amount", value: initialInvestment },
    {
      name: "Total Contributions",
      value: accumulationSchedule[accumulationSchedule.length - 1]?.contributions - initialInvestment || 0,
    },
    { name: "Total Interest", value: accumulationSchedule[accumulationSchedule.length - 1]?.interest || 0 },
  ]

  return (
    <div className="grid grid-cols-3 gap-6">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Investment Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="initialInvestment">Initial Investment</Label>
              <Input
                id="initialInvestment"
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
              <Input
                id="monthlyContribution"
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="years">Investment Period (Years)</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  id="years"
                  min={1}
                  max={100}
                  step={1}
                  value={[years]}
                  onValueChange={(value) => setYears(value[0])}
                  className="flex-grow"
                />
                <Input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  id="interestRate"
                  min={0}
                  max={20}
                  step={0.1}
                  value={[interestRate]}
                  onValueChange={(value) => setInterestRate(value[0])}
                  className="flex-grow"
                />
                <Input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Projected Investment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-bold">End Balance:</span>
                <span className="font-bold">{formatCurrency(projectedValue)}</span>
              </div>
              <div className="flex justify-between">
                <span>Starting Amount:</span>
                <span>{formatCurrency(initialInvestment)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Contributions:</span>
                <span>{formatCurrency(accumulationSchedule[accumulationSchedule.length - 1]?.contributions || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Interest:</span>
                <span>{formatCurrency(accumulationSchedule[accumulationSchedule.length - 1]?.interest || 0)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Annual Accumulation Schedule</h4>
                <ScrollArea className="h-[200px]">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-2 text-xs">Year</th>
                        <th className="text-right p-2 text-xs">Total Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accumulationSchedule.map((item) => (
                        <tr key={item.year} className="text-xs">
                          <td className="text-left p-2">{item.year}</td>
                          <td className="text-right p-2">{formatCurrency(item.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Growth Visualization</h4>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={accumulationSchedule} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                      <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), "Amount"]}
                        labelFormatter={(label) => `Year ${label}`}
                      />
                      <Bar dataKey="startingAmount" name="Starting Amount" stackId="a" fill={COLORS[0]} />
                      <Bar dataKey="additionalContributions" name="Contributions" stackId="a" fill={COLORS[1]} />
                      <Bar dataKey="interest" name="Interest" stackId="a" fill={COLORS[2]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

