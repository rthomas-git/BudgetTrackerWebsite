"use client"

import type React from "react"

import { useMemo, useState, useEffect } from "react"
import BudgetProgressBars from "@/components/BudgetProgressBars"
import type { Expense } from "./ExpenseList"
import { useBudgetContext } from "@/contexts/BudgetContext"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Edit, Check, PieChart } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import BudgetPieChartModal from "./BudgetPieChartModal"

interface BudgetAllocationProps {
  expenses: Expense[]
}

const colorPalette = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#FFBB28",
  "#00C49F",
  "#4169E1",
  "#F06292",
  "#81C784",
  "#FFD54F",
  "#9575CD",
]

const ITEMS_PER_PAGE = 9

export default function BudgetAllocation({ expenses }: BudgetAllocationProps) {
  const { budgetCategories, setBudgetCategories, income, setIncome } = useBudgetContext()
  const [openEditBudget, setOpenEditBudget] = useState(false)
  const [error, setError] = useState("")
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [newBudgetCategoryName, setNewBudgetCategoryName] = useState("")
  const [newBudgetCategoryPercentage, setNewBudgetCategoryPercentage] = useState("")
  const [newBudgetCategoryColor, setNewBudgetCategoryColor] = useState(colorPalette[0])
  const [currentPage, setCurrentPage] = useState(0)

  // Load current page from localStorage
  useEffect(() => {
    const savedPage = localStorage.getItem("budgetAllocationPage")
    if (savedPage) {
      setCurrentPage(Number.parseInt(savedPage, 10))
    }
  }, [])

  // Save current page to localStorage
  useEffect(() => {
    localStorage.setItem("budgetAllocationPage", currentPage.toString())
  }, [currentPage])

  // Calculate total pages including an extra page for the "Add Budget" button if needed
  const totalPages = Math.ceil((budgetCategories.length + 1) / ITEMS_PER_PAGE)

  // Auto-navigate to the next page when the current page is full
  useEffect(() => {
    const currentPageItemCount = budgetCategories.length - currentPage * ITEMS_PER_PAGE
    if (currentPageItemCount > ITEMS_PER_PAGE && currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }, [budgetCategories.length, currentPage, totalPages])

  // Ensure current page is valid when categories are deleted
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1)
    }
  }, [totalPages, currentPage])

  const updatedBudgetCategories = useMemo(() => {
    const spentByCategory = expenses.reduce(
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

    return budgetCategories.map((category) => ({
      ...category,
      spent: spentByCategory[category.name] || 0,
    }))
  }, [expenses, budgetCategories])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newIncome = Number(formData.get("income"))
    setIncome(newIncome)
    setOpenEditBudget(false)
  }

  const handleUpdateBudgetCategory = (index: number, updatedCategory: any) => {
    const newCategories = [...budgetCategories]
    newCategories[index] = updatedCategory
    const totalPercentage = newCategories.reduce((sum, cat) => sum + cat.percentage, 0)
    if (totalPercentage <= 100) {
      setBudgetCategories(newCategories)
    } else {
      setError("Total percentage cannot exceed 100%")
    }
  }

  const handleDeleteCategory = (type: string, name?: string) => {
    if (type === "budget") {
      const newCategories = budgetCategories.filter((cat) => cat.name !== name)
      setBudgetCategories(newCategories)
    }
  }

  const handleAddCategory = (type: string) => {
    if (type === "budget" && newBudgetCategoryName && newBudgetCategoryColor && newBudgetCategoryPercentage) {
      const newPercentage = Number.parseFloat(newBudgetCategoryPercentage)
      const currentTotal = budgetCategories.reduce((sum, cat) => sum + cat.percentage, 0)
      if (currentTotal + newPercentage <= 100) {
        setBudgetCategories([
          ...budgetCategories,
          {
            name: newBudgetCategoryName,
            color: newBudgetCategoryColor,
            percentage: newPercentage,
            spent: 0,
          },
        ])
        setNewBudgetCategoryName("")
        setNewBudgetCategoryColor(colorPalette[0])
        setNewBudgetCategoryPercentage("")
      } else {
        setError("Total percentage cannot exceed 100%")
      }
    }
  }

  // Check if we should show the "Add Budget" button on the current page
  const shouldShowAddButton = () => {
    const startIndex = currentPage * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    // Show the button if we're on the last page with items or if there's space on the current page
    return (
      budgetCategories.length < endIndex ||
      (currentPage === Math.floor(budgetCategories.length / ITEMS_PER_PAGE) &&
        budgetCategories.length % ITEMS_PER_PAGE !== 0)
    )
  }

  const ColorPicker = ({
    selectedColor,
    onColorChange,
  }: { selectedColor: string; onColorChange: (color: string) => void }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[100px] p-0">
          <div className="w-full h-full flex items-center justify-between px-2">
            <div className="w-6 h-6 rounded-md" style={{ backgroundColor: selectedColor }} />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px]">
        <div className="grid grid-cols-6 gap-2">
          {colorPalette.map((color) => (
            <Button
              key={color}
              variant="outline"
              className="w-10 h-10 p-0 rounded-md transition-all duration-200 hover:scale-110 relative"
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
            >
              {color.toLowerCase() === selectedColor.toLowerCase() && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-6 w-6 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" />
                </div>
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )

  return (
    <div className="space-y-4 relative z-20">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Budget Allocation</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <PieChart className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <BudgetPieChartModal budgetCategories={budgetCategories} income={income} />
          </Dialog>
        </div>
        {totalPages > 1 && (
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }).map((_, index) => (
              <Button
                key={index}
                variant={currentPage === index ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setCurrentPage(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        )}
      </div>
      <div className="relative">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(ITEMS_PER_PAGE)].map((_, index) => {
            const categoryIndex = currentPage * ITEMS_PER_PAGE + index
            const category = updatedBudgetCategories[categoryIndex]

            if (category) {
              return (
                <BudgetProgressBars
                  key={category.name}
                  income={income}
                  budgetCategories={[category]}
                  expenses={expenses}
                />
              )
            } else if (
              shouldShowAddButton() &&
              index === budgetCategories.length % ITEMS_PER_PAGE &&
              budgetCategories.length < (currentPage + 1) * ITEMS_PER_PAGE
            ) {
              return (
                <Button
                  key="add-budget"
                  variant="outline"
                  className="h-[130px] w-full border-dashed border-2 flex flex-col items-center justify-center col-span-1"
                  onClick={() => setOpenEditBudget(true)}
                >
                  <Plus className="h-6 w-6 mb-2" />
                  <span>Add Budget</span>
                </Button>
              )
            } else {
              return <div key={`empty-${index}`} className="h-[130px]"></div>
            }
          })}
        </div>
      </div>
      <Dialog open={openEditBudget} onOpenChange={setOpenEditBudget}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Manage Budget Categories</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="space-y-4 flex-grow overflow-y-auto pr-2 max-h-[300px]">
                {budgetCategories.map((category, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-secondary p-2 rounded-md">
                    {editingCategoryId === `budget-${index}` ? (
                      <>
                        <Input
                          value={category.name}
                          onChange={(e) => {
                            const updatedCategory = { ...category, name: e.target.value }
                            handleUpdateBudgetCategory(index, updatedCategory)
                          }}
                          className="flex-grow"
                        />
                        <ColorPicker
                          selectedColor={category.color}
                          onColorChange={(color) => {
                            const updatedCategory = { ...category, color: color }
                            handleUpdateBudgetCategory(index, updatedCategory)
                          }}
                        />
                        <Input
                          type="number"
                          value={category.percentage}
                          onChange={(e) => {
                            const updatedCategory = {
                              ...category,
                              percentage: Number.parseFloat(e.target.value) || 0,
                            }
                            handleUpdateBudgetCategory(index, updatedCategory)
                          }}
                          className="w-20"
                        />
                        <span>%</span>
                        <Button variant="ghost" size="sm" onClick={() => setEditingCategoryId(null)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 rounded-md" style={{ backgroundColor: category.color }}></div>
                        <span className="flex-grow">{category.name}</span>
                        <span className="mr-2">{category.percentage}%</span>
                        <Button variant="ghost" size="sm" onClick={() => setEditingCategoryId(`budget-${index}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory("budget", category.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="sticky bottom-0 bg-background pt-4 border-t mt-4">
                <h3 className="font-semibold mb-4 text-lg">Add New Category</h3>
                <div className="mt-4 flex items-center gap-4">
                  <Input
                    placeholder="New Category"
                    value={newBudgetCategoryName}
                    onChange={(e) => setNewBudgetCategoryName(e.target.value)}
                    className="flex-grow"
                  />
                  <div className="flex items-center w-24 relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      value={newBudgetCategoryPercentage}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "")
                        const numValue = Number.parseInt(value, 10)
                        if (!isNaN(numValue) && numValue <= 100) {
                          setNewBudgetCategoryPercentage(value)
                        } else if (isNaN(numValue)) {
                          setNewBudgetCategoryPercentage("")
                        }
                      }}
                      className="w-16 pr-6"
                    />
                    <span className="absolute right-2">%</span>
                  </div>
                  <ColorPicker selectedColor={newBudgetCategoryColor} onColorChange={setNewBudgetCategoryColor} />
                </div>
                <Button onClick={() => handleAddCategory("budget")} className="mt-2 w-full">
                  Add Budget Category
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

