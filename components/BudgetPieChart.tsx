"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBudgetContext } from "@/contexts/BudgetContext"
import { BUDGET_COLORS } from "./ExpensePieChart"

const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

export default function BudgetPieChart() {
  const { budgetCategories, income } = useBudgetContext()
  const [forceUpdate, setForceUpdate] = useState(0)

  // Use a ref to track category names for comparison
  const prevCategoryNamesRef = useRef<string[]>([])

  // Check if category names have changed
  useEffect(() => {
    const currentCategoryNames = budgetCategories.map((cat) => cat.name)
    const prevCategoryNames = prevCategoryNamesRef.current

    // Check if arrays are different
    const hasChanged =
      currentCategoryNames.length !== prevCategoryNames.length ||
      currentCategoryNames.some((name, i) => name !== prevCategoryNames[i])

    if (hasChanged) {
      // Force a re-render of the chart
      setForceUpdate((prev) => prev + 1)
      prevCategoryNamesRef.current = currentCategoryNames
    }
  }, [budgetCategories])

  const chartData = useMemo(() => {
    return budgetCategories.map((category) => {
      const amount =
        typeof category.amount === "string" ? Number.parseFloat(category.amount) || 0 : category.amount || 0

      return {
        name: category.name,
        value: amount,
        percentage: category.percentage,
        color: category.color,
      }
    })
  }, [budgetCategories, forceUpdate])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Budget Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                key={`pie-${forceUpdate}`}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}-${index}-${forceUpdate}`}
                    fill={entry.color || BUDGET_COLORS[entry.name] || "#000000"}
                  />
                ))}
              </Pie>
              <Legend
                key={`legend-${forceUpdate}`}
                layout="vertical"
                align="right"
                verticalAlign="middle"
                content={renderLegend}
              />
              <Tooltip
                formatter={(value: number) => [
                  `$${formatNumber(value)} (${((value / income) * 100).toFixed(1)}%)`,
                  "Amount",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
