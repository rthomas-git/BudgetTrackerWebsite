"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { format, subMonths } from "date-fns"
import { TrendingUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Mock data - replace this with actual data from your state or API
const generateMockData = () => {
  const today = new Date()
  return Array.from({ length: 3 }, (_, i) => {
    const date = subMonths(today, 2 - i)
    const income = Math.round(4000 + Math.random() * 2000)
    const expenses = Math.round(3000 + Math.random() * 1500)
    return {
      month: format(date, "MMM yyyy"),
      income: income,
      expenses: expenses,
      budget: income, // Updated: Added budget field
    }
  })
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
}

export default function FinancialPerformanceChart() {
  const [data] = useState(generateMockData())
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md">
          <p className="font-bold">{label}</p>
          {payload.map((pld: any) => (
            <p key={pld.name} style={{ color: pld.color }}>
              {pld.name}: {formatCurrency(pld.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">3-Month Summary</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => setIsDialogOpen(true)} aria-label="Show graph">
              <TrendingUp className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>3-Month Financial Performance</DialogTitle>
            </DialogHeader>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="income" name="Budget" stroke="#8884d8" activeDot={{ r: 8 }} />{" "}
                  {/* Updated: Changed dataKey to budget and added name */}
                  <Line type="monotone" dataKey="expenses" name="Spending" stroke="#82ca9d" />{" "}
                  {/* Updated: Added name */}
                  {/* <Line type="monotone" dataKey="savings" stroke="#ffc658" /> */} {/* Removed savings line */}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm font-semibold">
          <span>Month</span>
          <span>Spending</span> {/* Updated: Changed to Spending */}
        </div>
        {data.map((month, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span>{month.month}</span>
            <span className={month.expenses > month.budget ? "text-red-500" : "text-green-500"}>
              {" "}
              {/* Updated: Added conditional class */}
              {formatCurrency(month.expenses)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
