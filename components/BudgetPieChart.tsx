"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts"
import type { BudgetCategory } from "./BudgetAllocation"
import { BUDGET_COLORS } from "./ExpensePieChart"

const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface BudgetPieChartProps {
  budgetCategories: BudgetCategory[]
  income: number
}

export default function BudgetPieChart({ budgetCategories, income }: BudgetPieChartProps) {
  // Removed useTheme import and usage
  // Removed currentTheme state and its usage

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={budgetCategories}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="percentage"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {budgetCategories.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={BUDGET_COLORS[entry.name] || "#8884d8"} />
            ))}
            <Label
              content={({ viewBox: { cx, cy } }) => (
                <text
                  x={cx}
                  y={cy}
                  fill="#000000" // Removed conditional rendering based on theme
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  <tspan x={cx} dy="-1em" fontSize="1.2em" fontWeight="bold">
                    Income
                  </tspan>
                  <tspan x={cx} dy="1.5em" fontSize="1.5em">
                    ${formatNumber(income)}
                  </tspan>
                </text>
              )}
              position="center"
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

