"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label as UILabel } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useBudgetContext } from "@/contexts/BudgetContext"
import type { Expense } from "./ExpenseList"
import { Edit } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Export these for backward compatibility, but they'll now be managed by context
export const CATEGORY_COLORS = {
  Food: "#0088FE",
  Rent: "#00C49F",
  Transportation: "#FFBB28",
  Utilities: "#FF8042",
  Entertainment: "#8884D8",
  Income: "#82ca9d",
  Remaining: "#D3D3D3",
  "Over Budget": "#FF4136",
}

export const BUDGET_COLORS = {
  Needs: "#FFBB28",
  Wants: "#00C49F",
  Savings: "#4169E1",
}

interface ExpensePieChartProps {
  expenses: Expense[]
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <text x={cx} y={cy - 25} textAnchor="middle" fill={fill} fontSize="20px" fontWeight="bold">
        {payload.name}
      </text>
      <text x={cx} y={cy + 5} textAnchor="middle" fill={fill} fontSize="18px">
        ${value.toFixed(2)}
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" fill={fill} fontSize="16px">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  )
}

const renderLegend = (props: any) => {
  const { payload } = props

  return (
    <ul className="list-none p-0">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${entry.value}-${index}`} className="flex items-center mb-2">
          <span className="inline-block w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: entry.color }}></span>
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  )
}

export default function ExpensePieChart({ expenses }: ExpensePieChartProps) {
  const { income, setIncome, categoryColors, budgetColors } = useBudgetContext()
  const [isEditingIncome, setIsEditingIncome] = useState(false)
  const [newIncome, setNewIncome] = useState(income.toString())
  const [activeIndex, setActiveIndex] = useState(0)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [forceUpdate, setForceUpdate] = useState(0)

  // This effect will run whenever expenses or colors change
  useEffect(() => {
    // Force a re-render of the chart
    setForceUpdate((prev) => prev + 1)
    console.log("ExpensePieChart: Forcing update due to expenses or colors change")
  }, [expenses, categoryColors, budgetColors])

  const { totalExpenses, chartData } = useMemo(() => {
    console.log("ExpensePieChart: Recalculating chart data")
    console.log("Current expenses:", expenses)
    console.log("Current categoryColors:", categoryColors)

    // Create a fresh copy of the expenses by category
    const expensesByCategory = expenses.reduce(
      (acc, expense) => {
        if (expense.category in acc) {
          acc[expense.category] += expense.amount
        } else {
          acc[expense.category] = expense.amount
        }
        return acc
      },
      {} as Record<string, number>,
    )

    console.log("Expenses by category:", expensesByCategory)

    const total = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0)
    const remaining = income - total

    const data = Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value,
      percentage: (value / income) * 100,
    }))

    // Add remaining amount or over budget amount to chart data
    if (remaining >= 0) {
      data.push({
        name: "Remaining",
        value: remaining,
        percentage: (remaining / income) * 100,
      })
    } else {
      data.push({
        name: "Over Budget",
        value: Math.abs(remaining),
        percentage: (Math.abs(remaining) / income) * 100,
        fill: categoryColors["Over Budget"] || "#FF4136",
      })
    }

    console.log("Chart data:", data)
    return { totalExpenses: total, chartData: data }
  }, [expenses, income, forceUpdate, categoryColors])

  const remainingIncome = income - totalExpenses

  const handleIncomeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const updatedIncome = Number.parseFloat(newIncome)
    if (!isNaN(updatedIncome) && updatedIncome >= 0) {
      setIncome(updatedIncome)
      setIsEditingIncome(false)
    }
  }

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  return (
    <div className={`flex flex-col ${isMobile ? "" : "md:flex-row"}`}>
      <div className={`${isMobile ? "w-full" : "w-1/3 pr-4"} flex flex-col justify-center mb-4 md:mb-0`}>
        <Card className="mb-4 bg-card dark:bg-black">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-base md:text-lg">Income</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0 relative">
            <p className="text-xl md:text-2xl font-bold">${formatNumber(income)}</p>
            <Dialog open={isEditingIncome} onOpenChange={setIsEditingIncome}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute bottom-2 right-2">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Income</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleIncomeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <UILabel htmlFor="income">Income</UILabel>
                    <Input
                      id="income"
                      type="number"
                      value={newIncome}
                      onChange={(e) => setNewIncome(e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <Button type="submit">Save</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        <Card className="mb-4 bg-card dark:bg-black">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-base md:text-lg">Expenses</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <p className="text-xl md:text-2xl font-bold text-red-600">${formatNumber(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card dark:bg-black">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-base md:text-lg">{remainingIncome >= 0 ? "Remaining" : "Over Budget"}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <p
              className={`text-xl md:text-2xl font-bold ${
                remainingIncome > 200 ? "text-green-600" : remainingIncome >= 0 ? "text-yellow-400" : "text-red-600"
              }`}
            >
              ${formatNumber(Math.abs(remainingIncome))}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className={`${isMobile ? "w-full h-[300px]" : "w-2/3 h-[500px]"} relative`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              key={`pie-${forceUpdate}`}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? 70 : 120}
              outerRadius={isMobile ? 100 : 160}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={onPieEnter}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}-${index}-${forceUpdate}`}
                  fill={entry.fill || categoryColors[entry.name] || "#000000"}
                />
              ))}
            </Pie>
            <Legend
              key={`legend-${forceUpdate}`}
              layout="vertical"
              align="right"
              verticalAlign="middle"
              content={renderLegend}
              wrapperStyle={isMobile ? { fontSize: "12px" } : {}}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
