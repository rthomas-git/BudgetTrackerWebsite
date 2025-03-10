"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { Expense } from "./ExpenseList"
import { CATEGORY_COLORS } from "./ExpensePieChart"
import { useBudgetContext } from "@/contexts/BudgetContext"
import { useTheme } from "next-themes"

interface BarGraphProps {
  expenses: Expense[]
}

export default function BarGraph({ expenses }: BarGraphProps) {
  const { income } = useBudgetContext()
  const { resolvedTheme } = useTheme()

  const data = Object.entries(
    expenses.reduce(
      (acc, expense) => {
        if (expense.category in acc) {
          acc[expense.category] += expense.amount
        } else {
          acc[expense.category] = expense.amount
        }
        return acc
      },
      {} as Record<string, number>,
    ),
  ).map(([name, value]) => ({ name, amount: value }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: resolvedTheme === "dark" ? "#FFFFFF" : "#000000" }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          domain={[0, income]}
          tickFormatter={(value) => `$${value}`}
          tick={{ fill: resolvedTheme === "dark" ? "#FFFFFF" : "#000000" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: resolvedTheme === "dark" ? "#333" : "#fff",
            border: "none",
            borderRadius: "4px",
          }}
          labelStyle={{ color: resolvedTheme === "dark" ? "#fff" : "#333" }}
          itemStyle={{ color: resolvedTheme === "dark" ? "#fff" : "#333" }}
          formatter={(value) => `$${Number(value).toFixed(2)}`}
          labelFormatter={(label) => `${label}`}
        />
        <Bar dataKey="amount">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || "#8884d8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

