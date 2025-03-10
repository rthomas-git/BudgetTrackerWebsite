"use client"

import type React from "react"

import { useMemo } from "react"
import { BUDGET_COLORS } from "./ExpensePieChart"
import type { Expense } from "./ExpenseList"
import { Progress } from "@/components/ui/progress"

const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface BudgetCategory {
  name: string
  percentage: number
  spent: number
  color?: string
}

interface BudgetProgressBarsProps {
  income: number
  budgetCategories: BudgetCategory[]
  expenses: Expense[]
}

export default function BudgetProgressBars({ income, budgetCategories, expenses }: BudgetProgressBarsProps) {
  const categoryExpenses = useMemo(() => {
    return expenses.reduce(
      (acc, expense) => {
        if (expense.budgetCategory in acc) {
          acc[expense.budgetCategory] += expense.amount
        } else {
          acc[expense.budgetCategory] = expense.amount
        }
        return acc
      },
      {} as Record<string, number>,
    )
  }, [expenses])

  const getProgressColor = (progress: number, defaultColor: string) => {
    if (progress > 100) return "var(--destructive)"
    if (progress > 85) return "var(--warning, orange)"
    return defaultColor
  }

  return (
    <>
      {budgetCategories.map((item) => {
        const budgeted = (item.percentage / 100) * income
        const spent = categoryExpenses[item.name] || 0
        const remaining = budgeted - spent
        const progress = budgeted > 0 ? (spent / budgeted) * 100 : 0

        return (
          <div key={item.name} className="border rounded-lg shadow-sm p-3 h-[130px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: item.color || BUDGET_COLORS[item.name] || "#000000" }}
                />
                <h3 className="font-semibold text-base truncate">{item.name}</h3>
              </div>
              <span className="text-sm font-medium">{item.percentage}%</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Spent: ${formatNumber(spent)}</span>
                <span>Budget: ${formatNumber(budgeted)}</span>
              </div>
              <Progress
                value={progress}
                className="h-1.5"
                style={
                  {
                    "--progress-background": getProgressColor(
                      progress,
                      item.color || BUDGET_COLORS[item.name] || "#000000",
                    ),
                  } as React.CSSProperties
                }
              />
              <div className="flex justify-between text-sm">
                <span className={remaining >= 0 ? "text-green-600" : "text-red-600"}>
                  ${formatNumber(Math.abs(remaining))} {remaining >= 0 ? "left" : "over"}
                </span>
                <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

