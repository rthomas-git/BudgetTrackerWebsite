"use client"

import { useMemo, useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { DialogContent } from "@/components/ui/dialog"
import { useBudgetContext } from "@/contexts/BudgetContext"

interface BudgetPieChartModalProps {
  budgetCategories: any[]
  income: number
}

export default function BudgetPieChartModal({ budgetCategories, income }: BudgetPieChartModalProps) {
  const { budgetColors } = useBudgetContext()
  const [forceUpdate, setForceUpdate] = useState(0)

  // This effect will run whenever budgetCategories or colors change
  useEffect(() => {
    // Force a re-render of the chart
    setForceUpdate((prev) => prev + 1)
  }, [budgetCategories, budgetColors])

  const data = useMemo(() => {
    return budgetCategories.map((category) => {
      let amount = 0
      if (typeof category.amount === "string") {
        if (category.amount === ".") {
          amount = 0
        } else {
          amount = Number.parseFloat(category.amount)
          if (isNaN(amount)) amount = 0
        }
      } else if (typeof category.amount === "number") {
        amount = category.amount
      } else {
        // If amount is not defined, calculate from percentage
        amount = (category.percentage / 100) * income
      }

      return {
        name: category.name,
        value: amount,
        percentage: category.percentage,
        color: category.color || budgetColors[category.name] || "#CCCCCC",
      }
    })
  }, [budgetCategories, income, forceUpdate, budgetColors])

  const COLORS = useMemo(() => {
    return budgetCategories.map((category) => category.color || budgetColors[category.name] || "#CCCCCC")
  }, [budgetCategories, forceUpdate, budgetColors])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">${payload[0].value.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">{payload[0].payload.percentage.toFixed(1)}% of income</p>
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="14px"
        fontWeight="bold"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    )
  }

  return (
    <DialogContent className="sm:max-w-[700px] h-[500px]">
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              key={`pie-${forceUpdate}`}
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={180}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${entry.name}-${index}-${forceUpdate}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend key={`legend-${forceUpdate}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </DialogContent>
  )
}
