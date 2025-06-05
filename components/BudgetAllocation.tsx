"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useBudgetContext } from "@/contexts/BudgetContext"
import type { Expense } from "./ExpenseList"
import BudgetProgressBars from "./BudgetProgressBars"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import BudgetPieChartModal from "./BudgetPieChartModal"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { BUDGET_COLORS } from "./ExpensePieChart"

export interface BudgetCategory {
  name: string
  percentage: number
  spent: number
  color?: string
  amount?: number
}

const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function BudgetAllocation({ expenses }: { expenses: Expense[] }) {
  const { budgetCategories, setBudgetCategories, income, setIncome } = useBudgetContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCategory, setNewCategory] = useState<{
    name: string
    amount: number | string
    percentage: number
    color: string
  }>({
    name: "",
    amount: 0,
    percentage: 0,
    color: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random color
  })
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [selectedCategory, setSelectedCategory] = useState(null)

  // Add this useEffect near the beginning of the component
  useEffect(() => {
    // Force a re-render when BUDGET_COLORS changes
    // This ensures the chart updates when category names are changed
    const forceUpdate = () => {
      // Using a state update to trigger re-render
      // If you have any state in this component, you can use it here
      // Otherwise, you can add a dummy state just for this purpose
      if (typeof setSelectedCategory === "function") {
        setSelectedCategory((prev) => prev)
      }
    }
    forceUpdate()
  }, [BUDGET_COLORS])

  const calculateTotalAllocatedAmount = () => {
    return budgetCategories.reduce((sum, category) => {
      let amount = 0

      if (typeof category.amount === "string") {
        // Handle "." as 0 for calculations
        if (category.amount === ".") {
          amount = 0
        } else {
          // Try to parse the string as a float
          const parsed = Number.parseFloat(category.amount)
          amount = isNaN(parsed) ? 0 : parsed
        }
      } else if (typeof category.amount === "number") {
        amount = category.amount
      }

      return sum + amount
    }, 0)
  }

  const totalAllocated = budgetCategories.reduce((sum, category) => {
    let percentage = 0

    if (typeof category.percentage === "string") {
      // Handle "." as 0 for calculations
      if (category.percentage === ".") {
        percentage = 0
      } else {
        // Try to parse the string as a float
        const parsed = Number.parseFloat(category.percentage)
        percentage = isNaN(parsed) ? 0 : parsed
      }
    } else if (typeof category.percentage === "number") {
      percentage = category.percentage
    }

    return sum + percentage
  }, 0)

  // Update the handleUpdateCategory function to handle amount-based updates
  const handleUpdateCategory = (index: number, updatedCategory: BudgetCategory) => {
    const newCategories = [...budgetCategories]

    // Get the amount value
    let amount = 0
    if (typeof updatedCategory.amount === "string") {
      if (updatedCategory.amount === ".") {
        amount = 0
      } else {
        amount = Number.parseFloat(updatedCategory.amount)
        if (isNaN(amount)) amount = 0
      }
    } else if (typeof updatedCategory.amount === "number") {
      amount = updatedCategory.amount
    }

    // Calculate the percentage based on the amount
    const percentage = (amount / income) * 100

    // Update both amount and percentage
    updatedCategory.percentage = percentage
    newCategories[index] = updatedCategory

    // Calculate the total allocated amount after the update
    const newTotal = newCategories.reduce((sum, cat) => {
      let catAmount = 0
      if (typeof cat.amount === "string") {
        if (cat.amount === ".") {
          catAmount = 0
        } else {
          catAmount = Number.parseFloat(cat.amount)
          if (isNaN(catAmount)) catAmount = 0
        }
      } else if (typeof cat.amount === "number") {
        catAmount = cat.amount
      }
      return sum + catAmount
    }, 0)

    // Only update if the total is not over income
    if (newTotal <= income) {
      setBudgetCategories(newCategories)
      toast({
        title: "Category updated",
        description: "Your budget category has been updated successfully.",
      })
    } else {
      // You could show an error message here
      toast({
        title: "Error",
        description: "Total budget allocation cannot exceed income",
        variant: "destructive",
      })
    }
  }

  const handleAddCategory = () => {
    if (newCategory.name) {
      // Handle the case where amount is just "."
      let amount = 0
      let percentage = 0

      if (typeof newCategory.amount === "string") {
        if (newCategory.amount === ".") {
          amount = 0
        } else {
          amount = Number.parseFloat(newCategory.amount.toString())
        }
      } else {
        amount = newCategory.amount
      }

      if (isNaN(amount) || amount < 0) {
        toast({
          title: "Error",
          description: "Amount must be a valid number",
          variant: "destructive",
        })
        return
      }

      // Calculate percentage based on amount
      percentage = (amount / income) * 100

      const newTotal = calculateTotalAllocatedAmount() + amount
      if (newTotal > income) {
        toast({
          title: "Error",
          description: "Total budget allocation cannot exceed income",
          variant: "destructive",
        })
        return
      }

      const updatedCategories = [
        ...budgetCategories,
        {
          name: newCategory.name,
          amount: newCategory.amount, // Store the raw input
          percentage: percentage, // Store the calculated percentage
          spent: 0,
          color: newCategory.color,
        },
      ]

      setBudgetCategories(updatedCategories)

      toast({
        title: "Category added",
        description: `Your new budget category has been added successfully. Total allocation is now $${newTotal.toFixed(2)}`,
      })

      // Reset the form
      setNewCategory({
        name: "",
        amount: 0,
        percentage: 0,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      })

      setIsModalOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Budget Allocation</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">View Chart</Button>
          </DialogTrigger>
          <BudgetPieChartModal budgetCategories={budgetCategories} income={income} />
        </Dialog>
      </div>

      {totalAllocated !== 100 && (
        <p className="text-sm text-red-500">Warning: Total allocation is {totalAllocated}% (should be 100%)</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BudgetProgressBars
          income={income}
          budgetCategories={budgetCategories}
          expenses={expenses}
          onUpdateCategory={handleUpdateCategory}
        />

        {/* Add Budget Card */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <div className="border border-dashed rounded-lg shadow-sm p-2 md:p-3 h-[110px] md:h-[130px] flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <Plus className="h-6 w-6 mb-2 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Add Budget Category</p>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Budget Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-category-name">Category Name</Label>
                <Input
                  id="new-category-name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g., Housing, Food, Transportation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-category-amount">
                  Amount ($) - {formatNumber(income - calculateTotalAllocatedAmount())} available
                </Label>
                <Input
                  id="new-category-amount"
                  type="text"
                  inputMode="decimal"
                  value={newCategory.amount === 0 ? "" : newCategory.amount.toString()}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "")
                    // Allow any input including just "."
                    setNewCategory({
                      ...newCategory,
                      amount: value === "" ? 0 : value,
                      // Calculate percentage based on amount
                      percentage: value === "" || value === "." ? 0 : (Number(value) / income) * 100,
                    })
                  }}
                  placeholder="e.g., 500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-category-color">Color</Label>
                <Input
                  id="new-category-color"
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory}>Add Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
