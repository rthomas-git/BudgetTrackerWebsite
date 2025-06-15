"use client"

import { DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

import type React from "react"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useBudgetContext } from "@/contexts/BudgetContext"
import { ChevronUp, ChevronDown, MoreHorizontal, Trash2, Filter, Plus, Edit, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import "./ExpenseList.css"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { TableRow } from "@/components/ui/table"

const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export interface Expense {
  id: number
  date: string
  description: string
  amount: number
  category: string
  budgetCategory: string
  notes?: string
}

// Update the ExpenseListProps interface to include the activeTab prop
interface ExpenseListProps {
  expenses: Expense[]
  onUpdateExpense: (updatedExpense: Expense) => void
  onReorderExpenses: (reorderedExpenses: Expense[]) => void
  onClearExpenses: () => void
  onImportCSV: (file: File) => void
  highlightCategory: "expense" | "budget"
  categories: string[]
  onCategoryChange: (categories: string[]) => void
  activeTab?: "spending" | "budget" // Make it optional for backward compatibility
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

// Mobile expense card component
function ExpenseCard({
  expense,
  index,
  highlightCategory,
  onEdit,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  categoryColors,
  budgetColors,
}: {
  expense: Expense
  index: number
  highlightCategory: "expense" | "budget"
  onEdit: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
  categoryColors: { [key: string]: string }
  budgetColors: { [key: string]: string }
}) {
  return (
    <Card className="mb-2" onClick={onEdit}>
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-sm">{expense.description}</h3>
            <p className="text-xs text-muted-foreground">{expense.date}</p>
          </div>
          <div className="flex flex-col">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onMoveUp()
              }}
              disabled={isFirst}
              className="h-6 w-6"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onMoveDown()
              }}
              disabled={isLast}
              className="h-6 w-6"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <Badge
            variant="outline"
            style={{
              backgroundColor:
                highlightCategory === "expense"
                  ? categoryColors[expense.category] || "#CCCCCC"
                  : budgetColors[expense.budgetCategory] || "#CCCCCC",
              color: "#000000",
              borderColor:
                highlightCategory === "expense"
                  ? categoryColors[expense.category] || "#CCCCCC"
                  : budgetColors[expense.budgetCategory] || "#CCCCCC",
            }}
          >
            {highlightCategory === "expense" ? expense.category : expense.budgetCategory}
          </Badge>
          <span className="font-semibold text-red-600">${formatNumber(expense.amount)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Then update the function signature to destructure the new prop
export default function ExpenseList({
  expenses,
  onUpdateExpense,
  onReorderExpenses,
  onClearExpenses,
  onImportCSV,
  highlightCategory,
  categories,
  onCategoryChange,
  activeTab = "spending", // Default value for backward compatibility
}: ExpenseListProps) {
  // Add this at the beginning of the ExpenseList component, right after the props destructuring
  console.log("ExpenseList received expenses:", expenses)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
  const {
    budgetCategories = [],
    setBudgetCategories,
    spendingCategories: contextSpendingCategories = [],
    setSpendingCategories,
    income = 0,
    categoryColors,
    budgetColors,
    updateCategoryColor,
    updateBudgetColor,
  } = useBudgetContext()

  // Add a state to track if we need to force update
  const [forceUpdate, setForceUpdate] = useState(0)

  // Keep a local copy of expenses for comparison
  const [localExpenses, setLocalExpenses] = useState<Expense[]>([])

  // Update local expenses when props change
  useEffect(() => {
    setLocalExpenses(expenses)
  }, [expenses])

  // Ensure we have default spending categories if none are provided from context
  const [spendingCategories, setLocalSpendingCategories] = useState(() => {
    if (contextSpendingCategories && contextSpendingCategories.length > 0) {
      return contextSpendingCategories
    }

    // Default categories with colors
    return [
      { name: "Food", color: "#FF6B6B" },
      { name: "Rent", color: "#4ECDC4" },
      { name: "Transportation", color: "#45B7D1" },
      { name: "Utilities", color: "#FFA07A" },
      { name: "Entertainment", color: "#98D8C8" },
    ]
  })

  // Update the setSpendingCategories function to also update colors in context
  const updateSpendingCategories = (newCategories: any[], oldCategories = spendingCategories) => {
    console.log("Updating spending categories:", { newCategories, oldCategories })

    // Check for category name changes
    const nameChanges = {}

    // Loop through old categories and check if names have changed
    oldCategories.forEach((oldCat) => {
      if (!oldCat || !oldCat.name) return // Add null check

      const newCat = newCategories.find(
        (cat) =>
          // Add null checks
          cat &&
          cat.name &&
          oldCat.color &&
          // If we find a category with the same index but different name
          cat.color === oldCat.color &&
          cat.name !== oldCat.name,
      )

      if (newCat && newCat.name) {
        console.log(`Category name changed: ${oldCat.name} -> ${newCat.name}`)
        nameChanges[oldCat.name] = newCat.name
      }
    })

    // If there are name changes, update all expenses with the old category names
    if (Object.keys(nameChanges).length > 0) {
      console.log("Updating expenses with new category names:", nameChanges)

      const updatedExpenses = expenses.map((expense) => {
        if (!expense || !expense.category) return expense // Add null check

        if (nameChanges[expense.category]) {
          console.log(`Updating expense category: ${expense.category} -> ${nameChanges[expense.category]}`)
          return { ...expense, category: nameChanges[expense.category] }
        }
        return expense
      })

      // Update expenses
      onReorderExpenses(updatedExpenses)

      // Update colors in context for old->new name mappings
      Object.entries(nameChanges).forEach(([oldName, newName]) => {
        if (oldName && newName) {
          // Add null check
          const oldColor = categoryColors[oldName]
          if (oldColor) {
            updateCategoryColor(newName, oldColor)
          }
        }
      })
    }

    // Update the context state
    setSpendingCategories(newCategories)
    // Update the local state
    setLocalSpendingCategories(newCategories)

    // Update colors in context for all categories
    newCategories.forEach((category) => {
      if (category && category.name && category.color) {
        // Add null check
        updateCategoryColor(category.name, category.color)
      }
    })

    // Show a confirmation toast
    toast({
      title: "Categories updated",
      description: "Your spending categories have been saved.",
    })
  }

  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("All")
  const [filterMinAmount, setFilterMinAmount] = useState("")
  const [filterMaxAmount, setFilterMaxAmount] = useState("")
  const [appliedFilters, setAppliedFilters] = useState({
    category: "All",
    minAmount: "",
    maxAmount: "",
  })
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false)
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)
  const [newSpendingCategoryName, setNewSpendingCategoryName] = useState("")
  const [newBudgetCategoryName, setNewBudgetCategoryName] = useState("")
  const [newBudgetCategoryPercentage, setNewBudgetCategoryPercentage] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState(colorPalette[0])
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [newSpendingCategoryColor, setNewSpendingCategoryColor] = useState(colorPalette[0])
  const [newBudgetCategoryColor, setNewBudgetCategoryColor] = useState(colorPalette[0])
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingExpense) return

    const formData = new FormData(event.currentTarget)
    const updatedExpense: Expense = {
      ...editingExpense,
      date: formData.get("date") as string,
      description: formData.get("description") as string,
      amount: Number(formData.get("amount")),
      category: formData.get("category") as string,
      budgetCategory: formData.get("budgetCategory") as string,
      notes: formData.get("notes") as string,
    }

    onUpdateExpense(updatedExpense)
    setEditingExpense(null)
  }

  const handleDeleteExpense = (expenseToDelete?: Expense) => {
    const targetExpense = expenseToDelete || editingExpense
    if (targetExpense) {
      const updatedExpenses = expenses.filter((expense) => expense.id !== targetExpense.id)
      onReorderExpenses(updatedExpenses)
      setEditingExpense(null)
    }
  }

  const moveExpense = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= expenses.length) return

    const newExpenses = [...expenses]
    const [removed] = newExpenses.splice(index, 1)
    newExpenses.splice(newIndex, 0, removed)
    onReorderExpenses(newExpenses)
  }

  const getRowStyle = (expense: Expense, isHovered: boolean) => {
    // Remove the background color styling
    return {
      transition: "background-color 0.3s ease-in-out",
      // We'll use the default hover state from the TableRow component
    }
  }

  const getBadgeStyle = (color: string) => {
    return {
      backgroundColor: color || "#CCCCCC",
      color: "#000000",
      borderColor: color || "#CCCCCC",
      transition: "all 0.3s ease-in-out",
    }
  }

  const handleClearExpenses = () => {
    onClearExpenses()
    setClearConfirmOpen(false)
  }

  const handleImportCSV = (file: File) => {
    setImportDialogOpen(true)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportDialogOpen(true)
      // Reset the input value so the same file can be selected again
      event.target.value = ""
    }
  }

  const applyFilters = () => {
    setAppliedFilters({
      category: filterCategory,
      minAmount: filterMinAmount,
      maxAmount: filterMaxAmount,
    })
    setIsFilterPopoverOpen(false)
  }

  const filteredExpenses = expenses.filter((expense) => {
    // Add null check
    if (!expense) return false

    const matchesSearch =
      (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (expense.category && expense.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (expense.budgetCategory && expense.budgetCategory.toLowerCase().includes(searchTerm.toLowerCase()))

    // Update this line to check the appropriate category field based on highlightCategory
    const matchesCategory =
      appliedFilters.category === "All" ||
      (highlightCategory === "expense"
        ? expense.category === appliedFilters.category
        : expense.budgetCategory === appliedFilters.category)

    const matchesMinAmount = !appliedFilters.minAmount || expense.amount >= Number.parseFloat(appliedFilters.minAmount)
    const matchesMaxAmount = !appliedFilters.maxAmount || expense.amount <= Number.parseFloat(appliedFilters.maxAmount)
    return matchesSearch && matchesCategory && matchesMinAmount && matchesMaxAmount
  })

  const handleCategoryChange = (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      const updatedCategories = [...categories, newCategory]
      onCategoryChange(updatedCategories)
    }
  }

  const handleAddCategory = (type: "spending" | "budget") => {
    if (type === "spending") {
      if (newSpendingCategoryName && newSpendingCategoryColor) {
        const newCategories = [
          ...spendingCategories,
          { name: newSpendingCategoryName, color: newSpendingCategoryColor },
        ]
        updateSpendingCategories(newCategories)

        // Add to categories list for dropdown
        if (!categories.includes(newSpendingCategoryName)) {
          onCategoryChange([...categories, newSpendingCategoryName])
        }

        setNewSpendingCategoryName("")
        setNewSpendingCategoryColor(colorPalette[0])
      } else {
        // Show an error or alert if name is missing
        if (!newSpendingCategoryName) {
          alert("Please enter a category name")
        }
      }
    } else {
      if (newBudgetCategoryName && newBudgetCategoryColor && newBudgetCategoryPercentage) {
        // Allow "." as input but treat it as 0 for calculations
        const newAmount = newBudgetCategoryPercentage === "." ? 0 : Number.parseFloat(newBudgetCategoryPercentage) || 0

        // Calculate percentage based on amount
        const newPercentage = (newAmount / income) * 100

        const currentTotal = budgetCategories.reduce((sum, cat) => {
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
          } else {
            // If amount is not defined, calculate from percentage
            catAmount = (cat.percentage / 100) * income
          }
          return sum + catAmount
        }, 0)

        if (currentTotal + newAmount <= income) {
          const newCategory = {
            name: newBudgetCategoryName,
            color: newBudgetCategoryColor,
            amount: newBudgetCategoryPercentage, // Store the raw input for amount
            percentage: newPercentage, // Store the calculated percentage
            spent: 0,
          }

          setBudgetCategories([...budgetCategories, newCategory])
          updateBudgetColor(newBudgetCategoryName, newBudgetCategoryColor)

          setNewBudgetCategoryName("")
          setNewBudgetCategoryColor(colorPalette[0])
          setNewBudgetCategoryPercentage("")
        } else {
          alert("Total budget allocation cannot exceed income")
        }
      }
    }
  }

  const handleDeleteCategory = (type: "spending" | "budget", name: string) => {
    if (type === "spending") {
      const newCategories = spendingCategories.filter((cat) => cat.name !== name)
      updateSpendingCategories(newCategories)
    } else {
      setBudgetCategories(budgetCategories.filter((cat) => cat.name !== name))
    }
  }

  // This is the key function that needs to be fixed
  const handleUpdateBudgetCategory = (index: number, updatedCategory: any) => {
    const newCategories = [...budgetCategories]

    // Check if the category name has changed - make this more explicit
    const oldCategory = newCategories[index]
    const nameChanged = oldCategory.name !== updatedCategory.name

    console.log("Budget category update:", {
      oldName: oldCategory.name,
      newName: updatedCategory.name,
      nameChanged,
    })

    // Store the raw input value
    newCategories[index] = updatedCategory

    // Calculate total allocated amount
    const totalAmount = newCategories.reduce((sum, cat) => {
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
      } else {
        // If amount is not defined, calculate from percentage
        catAmount = (cat.percentage / 100) * income
      }

      return sum + catAmount
    }, 0)

    if (totalAmount <= income) {
      // If the name has changed, update all expenses with the old category name
      if (nameChanged) {
        console.log("Updating expenses with new budget category name:", oldCategory.name, "->", updatedCategory.name)

        // Create a new array of expenses with the updated budget category name
        const updatedExpenses = expenses.map((expense) => {
          if (expense.budgetCategory === oldCategory.name) {
            console.log(
              `Updating expense: ${expense.description} from ${expense.budgetCategory} to ${updatedCategory.name}`,
            )
            // Create a new expense object with the updated budget category
            return { ...expense, budgetCategory: updatedCategory.name }
          }
          return expense
        })

        // Log the updated expenses for debugging
        console.log("Original expenses:", expenses)
        console.log("Updated expenses:", updatedExpenses)

        // Update expenses in the parent component
        onReorderExpenses(updatedExpenses)

        // Update budget colors in context
        if (oldCategory.name && updatedCategory.name) {
          updateBudgetColor(updatedCategory.name, updatedCategory.color)
        }

        // Force a re-render
        setForceUpdate((prev) => prev + 1)
      }

      setBudgetCategories(newCategories)
      if (updatedCategory.name) {
        updateBudgetColor(updatedCategory.name, updatedCategory.color)
      }

      // Notify the user about the current allocation
      const totalPercentage = (totalAmount / income) * 100
      if (totalAmount < income) {
        toast({
          title: nameChanged ? "Category renamed and updated" : "Category updated",
          description: `Total allocation is now $${totalAmount.toFixed(2)} (${totalPercentage.toFixed(1)}%)`,
        })
      } else {
        toast({
          title: nameChanged ? "Category renamed and updated" : "Category updated",
          description: "Total allocation is now 100% of income",
        })
      }

      // If name changed, force another update after a short delay
      if (nameChanged) {
        setTimeout(() => {
          // Force another update to ensure the UI reflects the changes
          setForceUpdate((prev) => prev + 1)

          // Double-check that expenses were updated correctly
          const checkExpenses = expenses.filter((expense) => expense.budgetCategory === oldCategory.name)
          if (checkExpenses.length > 0) {
            console.log("Found expenses still using old category name:", checkExpenses)

            // Try updating expenses again
            const fixedExpenses = expenses.map((expense) => {
              if (expense.budgetCategory === oldCategory.name) {
                return { ...expense, budgetCategory: updatedCategory.name }
              }
              return expense
            })

            onReorderExpenses(fixedExpenses)
          }
        }, 100)
      }
    } else {
      toast({
        title: "Error",
        description: "Total budget allocation cannot exceed income",
        variant: "destructive",
      })
    }
  }

  const ColorPicker = ({
    selectedColor,
    onColorChange,
  }: { selectedColor: string; onColorChange: (color: string) => void }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[100px] p-0">
          <div className="w-full h-full flex items-center justify-between px-2">
            <div className="w-6 h-6 rounded-md border" style={{ backgroundColor: selectedColor || "#CCCCCC" }} />
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px]">
        <div className="space-y-4">
          <div>
            <Label htmlFor="custom-color" className="text-sm font-medium">
              Pick a Color
            </Label>
            <div className="flex items-center space-x-2 mt-2">
              <Input
                id="custom-color"
                type="color"
                value={selectedColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-16 h-8 p-1 border rounded cursor-pointer"
              />
              <Input
                type="text"
                value={selectedColor}
                onChange={(e) => {
                  const value = e.target.value
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === "") {
                    onColorChange(value)
                  }
                }}
                placeholder="#000000"
                className="flex-1 text-sm"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )

  useEffect(() => {
    setFilterCategory("All")
    setAppliedFilters({
      ...appliedFilters,
      category: "All",
    })
  }, [highlightCategory])

  // Add this useEffect to force a re-render when expenses change
  useEffect(() => {
    // This effect will run whenever expenses change
    console.log("Expenses updated:", expenses)
  }, [expenses, budgetCategories, searchTerm, appliedFilters, highlightCategory, forceUpdate])

  // Add a specific effect to force re-render when budget categories change
  useEffect(() => {
    if (highlightCategory === "budget") {
      console.log("Budget categories changed, forcing re-render of expenses table")
      // Force a re-render by incrementing the forceUpdate counter
      setForceUpdate((prev) => prev + 1)
    }
  }, [budgetCategories, highlightCategory])

  // Add this effect to check if expenses need updating when budget categories change
  useEffect(() => {
    // Check if any expenses have budget categories that don't exist anymore
    const needsUpdate = expenses.some((expense) => {
      return !budgetCategories.some((cat) => cat.name === expense.budgetCategory)
    })

    if (needsUpdate) {
      console.log("Found expenses with outdated budget categories, updating...")

      // Update expenses with valid budget categories
      const updatedExpenses = expenses.map((expense) => {
        const categoryExists = budgetCategories.some((cat) => cat.name === expense.budgetCategory)

        if (!categoryExists && budgetCategories.length > 0) {
          // Use the first available budget category
          return { ...expense, budgetCategory: budgetCategories[0].name }
        }

        return expense
      })

      onReorderExpenses(updatedExpenses)
    }
  }, [budgetCategories])

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-2 md:py-4 px-2 md:px-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-0">Expenses</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
          <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="mr-2 mb-2 md:mb-0">
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
              {/* Keep the existing dialog content */}
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Manage Categories</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-8 flex-grow overflow-hidden">
                <div className="overflow-y-auto pr-2 h-full flex flex-col">
                  <h3 className="font-semibold mb-4 text-lg sticky top-0 bg-background z-10 py-2">
                    Spending Categories
                  </h3>
                  <div className="space-y-4 flex-grow overflow-y-auto">
                    {spendingCategories
                      .filter((cat) => cat && cat.name)
                      .map((category, index) => (
                        <div key={index} className="flex items-center space-x-2 bg-secondary p-2 rounded-md">
                          {editingCategoryId === `spending-${index}` ? (
                            <>
                              <Input
                                value={category.name}
                                onChange={(e) => {
                                  const updatedCategories = [...spendingCategories]
                                  const oldName = updatedCategories[index].name
                                  updatedCategories[index].name = e.target.value

                                  // Update expenses with the new category name
                                  if (oldName !== e.target.value) {
                                    const updatedExpenses = expenses.map((expense) => {
                                      if (expense.category === oldName) {
                                        return { ...expense, category: e.target.value }
                                      }
                                      return expense
                                    })

                                    // Update colors in context
                                    if (categoryColors[oldName]) {
                                      updateCategoryColor(e.target.value, categoryColors[oldName])
                                    }

                                    // Update expenses
                                    onReorderExpenses(updatedExpenses)
                                  }

                                  // Update categories
                                  updateSpendingCategories(updatedCategories)
                                }}
                                className="flex-grow"
                              />
                              <ColorPicker
                                selectedColor={category.color || "#CCCCCC"}
                                onColorChange={(color) => {
                                  const updatedCategories = [...spendingCategories]
                                  updatedCategories[index].color = color
                                  updateSpendingCategories(updatedCategories)
                                  if (category.name) {
                                    updateCategoryColor(category.name, color)
                                  }
                                }}
                              />
                              <Button variant="ghost" size="sm" onClick={() => setEditingCategoryId(null)}>
                                <Check className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <div
                                className="w-5 h-5 rounded-md border flex-shrink-0"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span className="flex-grow">{category.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingCategoryId(`spending-${index}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCategory("spending", category.name)}
                              >
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
                        value={newSpendingCategoryName}
                        onChange={(e) => setNewSpendingCategoryName(e.target.value)}
                        className="flex-grow"
                      />
                      <ColorPicker
                        selectedColor={newSpendingCategoryColor}
                        onColorChange={setNewSpendingCategoryColor}
                      />
                    </div>
                    <Button onClick={() => handleAddCategory("spending")} className="mt-2 w-full">
                      Add Spending Category
                    </Button>
                  </div>
                </div>
                <div className="overflow-y-auto pr-2 h-full flex flex-col">
                  <h3 className="font-semibold mb-4 text-lg sticky top-0 bg-background z-10 py-2">Budget Categories</h3>
                  <div className="space-y-4 flex-grow overflow-y-auto">
                    {budgetCategories
                      .filter((cat) => cat && cat.name)
                      .map((category, index) => (
                        <div key={index} className="flex items-center space-x-2 bg-secondary p-2 rounded-md">
                          {editingCategoryId === `budget-${index}` ? (
                            <>
                              <div className="flex flex-col space-y-2 w-full">
                                <div className="flex items-center space-x-2">
                                  <Input
                                    value={category.name}
                                    onChange={(e) => {
                                      const updatedCategories = [...budgetCategories]
                                      const oldName = updatedCategories[index].name
                                      updatedCategories[index].name = e.target.value

                                      // Create a new updated category object
                                      const updatedCategory = {
                                        ...category,
                                        name: e.target.value,
                                      }

                                      // Update the budget category with the new name
                                      handleUpdateBudgetCategory(index, updatedCategory)
                                    }}
                                    className="flex-grow"
                                    placeholder="Category Name"
                                  />
                                  <ColorPicker
                                    selectedColor={category.color}
                                    onColorChange={(color) => {
                                      const updatedCategory = { ...category, color: color }
                                      handleUpdateBudgetCategory(index, updatedCategory)
                                    }}
                                  />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Input
                                    type="text"
                                    inputMode="decimal"
                                    value={
                                      typeof category.amount === "undefined"
                                        ? category.percentage.toString()
                                        : category.amount.toString()
                                    }
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/[^0-9.]/g, "")

                                      // Calculate percentage based on amount
                                      const amount = value === "" || value === "." ? 0 : Number(value)
                                      const percentage = (amount / income) * 100

                                      // Allow any input including just "."
                                      const updatedCategory = {
                                        ...category,
                                        amount: value,
                                        percentage: percentage,
                                      }
                                      handleUpdateBudgetCategory(index, updatedCategory)
                                    }}
                                    className="w-full"
                                    placeholder="Amount"
                                  />
                                  <Button variant="ghost" size="sm" onClick={() => setEditingCategoryId(null)}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div
                                className="w-5 h-5 rounded-md border flex-shrink-0"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span className="flex-grow">{category.name}</span>
                              <span className="mr-2">
                                $
                                {typeof category.amount !== "undefined"
                                  ? typeof category.amount === "string"
                                    ? category.amount
                                    : formatNumber(category.amount)
                                  : formatNumber((category.percentage / 100) * income)}{" "}
                                ({category.percentage.toFixed(1)}%)
                              </span>
                              <Button variant="ghost" size="sm" onClick={() => setEditingCategoryId(`budget-${index}`)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCategory("budget", category.name)}
                              >
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
                          inputMode="decimal"
                          placeholder="0"
                          value={newBudgetCategoryPercentage}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.]/g, "")

                            // Allow any input including just "."
                            setNewBudgetCategoryPercentage(value)
                          }}
                          className="w-16 pr-6"
                        />
                        <span className="absolute right-2">$</span>
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
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
          <div className="flex space-x-2">
            <Popover open={isFilterPopoverOpen} onOpenChange={setIsFilterPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Filter Expenses</h4>
                    <p className="text-sm text-muted-foreground">Narrow down expenses by category and amount range.</p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="category">Category</Label>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Categories</SelectItem>
                          {highlightCategory === "expense"
                            ? spendingCategories
                                .filter((cat) => cat && cat.name)
                                .map((category) => (
                                  <SelectItem key={category.name} value={category.name}>
                                    {category.name}
                                  </SelectItem>
                                ))
                            : budgetCategories
                                .filter((cat) => cat && cat.name)
                                .map((category) => (
                                  <SelectItem key={category.name} value={category.name}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="minAmount">Min Amount</Label>
                      <Input
                        id="minAmount"
                        type="number"
                        value={filterMinAmount}
                        onChange={(e) => setFilterMinAmount(e.target.value)}
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="maxAmount">Max Amount</Label>
                      <Input
                        id="maxAmount"
                        type="number"
                        value={filterMaxAmount}
                        onChange={(e) => setFilterMaxAmount(e.target.value)}
                        className="col-span-2 h-8"
                      />
                    </div>
                  </div>
                  <Button onClick={applyFilters}>Apply Filters</Button>
                </div>
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setClearConfirmOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Clear List</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setImportDialogOpen
                  }}
                >
                  <span>Import CSV</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {console.log("Filtered expenses:", filteredExpenses.length)}
            {filteredExpenses.map((expense, index) => (
              <TableRow
                key={`expense-${expense.id}-${expense.date}-${expense.amount}-${forceUpdate}`}
                onClick={() => setEditingExpense(expense)}
                onMouseEnter={() => setHoveredRow(expense.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className="cursor-pointer hover:bg-muted/50"
                style={getRowStyle(expense, hoveredRow === expense.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex flex-col items-center space-y-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveExpense(index, "up")
                      }}
                      disabled={index === 0}
                      className="h-6 w-6"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveExpense(index, "down")
                      }}
                      disabled={index === filteredExpenses.length - 1}
                      className="h-6 w-6"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge variant="outline" style={getBadgeStyle(categoryColors[expense.category] || "#CCCCCC")}>
                    {expense.category}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge variant="outline" style={getBadgeStyle(budgetColors[expense.budgetCategory] || "#CCCCCC")}>
                    {expense.budgetCategory}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                  ${formatNumber(expense.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingExpense(expense)
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpenseToDelete(expense)
                          setDeleteConfirmOpen(true)
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={editingExpense !== null} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input id="date" name="date" defaultValue={editingExpense?.date} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={editingExpense?.description}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  name="amount"
                  defaultValue={editingExpense?.amount}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select onValueChange={(value) => handleCategoryChange(value)} defaultValue={editingExpense?.category}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {spendingCategories
                      .filter((cat) => cat && cat.name)
                      .map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budgetCategory" className="text-right">
                  Budget Category
                </Label>
                <Select defaultValue={editingExpense?.budgetCategory} onValueChange={() => {}}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select budget category" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetCategories
                      .filter((cat) => cat && cat.name)
                      .map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input id="notes" name="notes" defaultValue={editingExpense?.notes} className="col-span-3" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="submit">Save changes</Button>
              <Button variant="destructive" onClick={() => handleDeleteExpense()}>
                Delete
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Clear Expenses</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all expenses? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setClearConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearExpenses}>
              Clear
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={importDialogOpen} onOpenChange={() => setImportDialogOpen(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import CSV</DialogTitle>
            <DialogDescription>Select a CSV file to import expenses.</DialogDescription>
          </DialogHeader>
          <Input type="file" accept=".csv" onChange={handleFileUpload} />
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteConfirmOpen(false)
                setExpenseToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (expenseToDelete) {
                  handleDeleteExpense(expenseToDelete)
                }
                setDeleteConfirmOpen(false)
                setExpenseToDelete(null)
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
