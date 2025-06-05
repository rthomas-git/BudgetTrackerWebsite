"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { BUDGET_COLORS } from "./ExpensePieChart"
import type { Expense } from "./ExpenseList"
import { Progress } from "@/components/ui/progress"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface BudgetCategory {
  name: string
  percentage: number
  spent: number
  color?: string
  amount?: number
}

interface BudgetProgressBarsProps {
  income: number
  budgetCategories: BudgetCategory[]
  expenses: Expense[]
  onUpdateCategory?: (index: number, updatedCategory: BudgetCategory) => void
}

export default function BudgetProgressBars({
  income,
  budgetCategories,
  expenses,
  onUpdateCategory,
}: BudgetProgressBarsProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [editingCategory, setEditingCategory] = useState<{ index: number; category: BudgetCategory } | null>(null)

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

  const handleEditCategory = (index: number, category: BudgetCategory) => {
    setEditingCategory({ index, category: { ...category } })
  }

  // Update the handleSaveCategory function to recalculate percentages based on amounts
  const handleSaveCategory = () => {
    if (editingCategory && onUpdateCategory) {
      // Get the amount value
      let amount = 0
      if (typeof editingCategory.category.amount === "string") {
        if (editingCategory.category.amount === ".") {
          amount = 0
        } else {
          amount = Number.parseFloat(editingCategory.category.amount)
          if (isNaN(amount)) amount = 0
        }
      } else if (typeof editingCategory.category.amount === "number") {
        amount = editingCategory.category.amount
      }

      // Calculate the percentage based on the amount
      const percentage = (amount / income) * 100

      // Create the updated category with both amount and calculated percentage
      const updatedCategory = {
        ...editingCategory.category,
        amount: editingCategory.category.amount,
        percentage: percentage,
      }

      onUpdateCategory(editingCategory.index, updatedCategory)
      setEditingCategory(null)
    }
  }

  return (
    <>
      {budgetCategories.map((item, index) => {
        const budgeted = (() => {
          let amount = 0

          if (typeof item.amount === "string") {
            // Handle "." as 0 for calculations
            if (item.amount === ".") {
              amount = 0
            } else {
              // Try to parse the string as a float
              const parsed = Number.parseFloat(item.amount)
              amount = isNaN(parsed) ? 0 : parsed
            }
          } else if (typeof item.amount === "number") {
            amount = item.amount
          }

          return amount
        })()
        const spent = categoryExpenses[item.name] || 0
        const remaining = budgeted - spent
        const progress = budgeted > 0 ? (spent / budgeted) * 100 : 0

        return (
          <div
            key={item.name}
            className="border rounded-lg shadow-sm p-2 md:p-3 h-[110px] md:h-[130px] flex flex-col justify-between relative cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => handleEditCategory(index, item)}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1 md:space-x-2">
                <div
                  className="w-2 h-2 md:w-3 md:h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: item.color || BUDGET_COLORS[item.name] || "#000000" }}
                />
                <h3 className="font-semibold text-sm md:text-base truncate">{item.name}</h3>
              </div>
              <span className="text-xs md:text-sm font-medium">{item.percentage.toFixed(1)}%</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="truncate">Spent: ${formatNumber(spent)}</span>
                <span>Budget: ${formatNumber(budgeted)}</span>
              </div>
              <Progress
                value={progress > 100 ? 100 : progress}
                className={`h-1 md:h-1.5 ${progress > 100 ? "bg-destructive/20" : ""}`}
                style={
                  {
                    "--progress-background":
                      progress > 100 ? "var(--destructive)" : item.color || BUDGET_COLORS[item.name] || "#000000",
                  } as React.CSSProperties
                }
              />
              <div className="flex justify-between text-xs md:text-sm">
                <span className={remaining >= 0 ? "text-green-600" : "text-red-600"}>
                  ${formatNumber(Math.abs(remaining))} {remaining >= 0 ? "left" : "over"}
                </span>
                <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )
      })}

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Budget Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={editingCategory?.category.name || ""}
                onChange={(e) =>
                  editingCategory &&
                  setEditingCategory({
                    ...editingCategory,
                    category: { ...editingCategory.category, name: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-amount">Amount ($)</Label>
              <Input
                id="category-amount"
                type="text"
                inputMode="decimal"
                value={editingCategory?.category.amount?.toString() || "0"}
                onChange={(e) => {
                  if (editingCategory) {
                    const value = e.target.value.replace(/[^0-9.]/g, "")
                    const newAmount = value === "" || value === "." ? 0 : Number.parseFloat(value)
                    const newPercentage = (newAmount / income) * 100

                    // Allow any input including just "."
                    setEditingCategory({
                      ...editingCategory,
                      category: {
                        ...editingCategory.category,
                        amount: value,
                        percentage: isNaN(newPercentage) ? 0 : newPercentage,
                      },
                    })
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-color">Color</Label>
              <Input
                id="category-color"
                type="color"
                value={
                  editingCategory?.category.color || BUDGET_COLORS[editingCategory?.category.name || ""] || "#000000"
                }
                onChange={(e) =>
                  editingCategory &&
                  setEditingCategory({
                    ...editingCategory,
                    category: { ...editingCategory.category, color: e.target.value },
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
