"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CATEGORY_COLORS, BUDGET_COLORS } from "./ExpensePieChart"
import { useBudgetContext } from "@/contexts/BudgetContext"
import {
  ChevronUp,
  ChevronDown,
  FileText,
  MoreHorizontal,
  Trash2,
  Upload,
  Filter,
  Plus,
  Edit,
  Check,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import "./ExpenseList.css"

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

interface ExpenseListProps {
  expenses: Expense[]
  onUpdateExpense: (updatedExpense: Expense) => void
  onReorderExpenses: (reorderedExpenses: Expense[]) => void
  onClearExpenses: () => void
  onImportCSV: (file: File) => void
  highlightCategory: "expense" | "budget"
  categories: string[]
  onCategoryChange: (categories: string[]) => void
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

export default function ExpenseList({
  expenses,
  onUpdateExpense,
  onReorderExpenses,
  onClearExpenses,
  onImportCSV,
  highlightCategory,
  categories,
  onCategoryChange,
}: ExpenseListProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const {
    budgetCategories = [],
    setBudgetCategories,
    spendingCategories = [],
    setSpendingCategories,
  } = useBudgetContext()
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
      backgroundColor: color,
      color: "#000000",
      borderColor: color,
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
    const matchesSearch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.budgetCategory.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = appliedFilters.category === "All" || expense.category === appliedFilters.category
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
        setSpendingCategories([
          ...spendingCategories,
          { name: newSpendingCategoryName, color: newSpendingCategoryColor },
        ])
        CATEGORY_COLORS[newSpendingCategoryName] = newSpendingCategoryColor
        setNewSpendingCategoryName("")
        setNewSpendingCategoryColor(colorPalette[0])
      }
    } else {
      if (newBudgetCategoryName && newBudgetCategoryColor && newBudgetCategoryPercentage) {
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
          BUDGET_COLORS[newBudgetCategoryName] = newBudgetCategoryColor
          setNewBudgetCategoryName("")
          setNewBudgetCategoryColor(colorPalette[0])
          setNewBudgetCategoryPercentage("")
        } else {
          alert("Total percentage cannot exceed 100%")
        }
      }
    }
  }

  const handleDeleteCategory = (type: "spending" | "budget", name: string) => {
    if (type === "spending") {
      setSpendingCategories(spendingCategories.filter((cat) => cat.name !== name))
      delete CATEGORY_COLORS[name]
    } else {
      setBudgetCategories(budgetCategories.filter((cat) => cat.name !== name))
      delete BUDGET_COLORS[name]
    }
  }

  const handleUpdateBudgetCategory = (index: number, updatedCategory: any) => {
    const newCategories = [...budgetCategories]
    newCategories[index] = updatedCategory
    const totalPercentage = newCategories.reduce((sum, cat) => sum + cat.percentage, 0)
    if (totalPercentage <= 100) {
      setBudgetCategories(newCategories)
      BUDGET_COLORS[updatedCategory.name] = updatedCategory.color
    } else {
      alert("Total percentage cannot exceed 100%")
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
            <div className="w-6 h-6 rounded-md" style={{ backgroundColor: selectedColor }} />
            <ChevronDown className="h-4 w-4" />
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
    <>
      <div className="flex justify-between items-center py-4 px-6">
        <h2 className="text-2xl font-bold">Expenses</h2>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
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
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
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
              <Button variant="ghost" size="icon">
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
                  setImportDialogOpen(true)
                  // Remove the line that clicks the file input
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                <span>Import CSV</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="w-full overflow-hidden rounded-lg border border-border">
        <Table className="expense-table">
          <TableHeader>
            <TableRow className="hover:bg-background">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead className="w-[300px]">Description</TableHead>
              <TableHead className="w-[120px]">Amount</TableHead>
              <TableHead className="w-[300px] relative">
                <div className="flex justify-between items-center">
                  <span className="pl-8">
                    {highlightCategory === "expense" ? "Spending Category" : "Budget Category"}
                  </span>
                  <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 mr-2">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Manage Categories</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-8 flex-grow overflow-hidden">
                        <div className="overflow-y-auto pr-2 h-full flex flex-col">
                          <h3 className="font-semibold mb-4 text-lg sticky top-0 bg-background z-10 py-2">
                            Spending Categories
                          </h3>
                          <div className="space-y-4 flex-grow overflow-y-auto">
                            {spendingCategories.map((category, index) => (
                              <div key={index} className="flex items-center space-x-2 bg-secondary p-2 rounded-md">
                                {editingCategoryId === `spending-${index}` ? (
                                  <>
                                    <Input
                                      value={category.name}
                                      onChange={(e) => {
                                        const updatedCategories = [...spendingCategories]
                                        updatedCategories[index].name = e.target.value
                                        setSpendingCategories(updatedCategories)
                                      }}
                                      className="flex-grow"
                                    />
                                    <ColorPicker
                                      selectedColor={category.color}
                                      onColorChange={(color) => {
                                        const updatedCategories = [...spendingCategories]
                                        updatedCategories[index].color = color
                                        setSpendingCategories(updatedCategories)
                                        CATEGORY_COLORS[category.name] = color
                                      }}
                                    />
                                    <Button variant="ghost" size="sm" onClick={() => setEditingCategoryId(null)}>
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <div
                                      className="w-4 h-4 rounded-md"
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
                          <h3 className="font-semibold mb-4 text-lg sticky top-0 bg-background z-10 py-2">
                            Budget Categories
                          </h3>
                          <div className="space-y-4 flex-grow overflow-y-auto">
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
                                    <div
                                      className="w-4 h-4 rounded-md"
                                      style={{ backgroundColor: category.color }}
                                    ></div>
                                    <span className="flex-grow">{category.name}</span>
                                    <span className="mr-2">{category.percentage}%</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingCategoryId(`budget-${index}`)}
                                    >
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
                              <ColorPicker
                                selectedColor={newBudgetCategoryColor}
                                onColorChange={setNewBudgetCategoryColor}
                              />
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
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.map((expense, index) => (
              <TableRow
                key={expense.id}
                onClick={() => setEditingExpense(expense)}
                onMouseEnter={() => setHoveredRow(expense.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className="cursor-pointer hover:bg-muted/50"
                style={getRowStyle(expense, hoveredRow === expense.id)}
              >
                <TableCell className="w-[50px]">
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveExpense(index, "up")
                      }}
                      disabled={index === 0}
                      className="h-6 w-6 text-black hover:text-black/90"
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
                      className="h-6 w-6 text-black hover:text-black/90"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="relative">
                  <span>{expense.date}</span>
                </TableCell>
                <TableCell className="relative pl-4">
                  <span>{expense.description}</span>
                  {expense.notes && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FileText className="inline-block ml-2 h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={5}>
                          <p className="max-w-xs break-words">{expense.notes}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
                <TableCell className="relative text-red-600">
                  <span>${formatNumber(expense.amount)}</span>
                </TableCell>
                <TableCell className="relative">
                  <div className="px-8">
                    <Badge
                      variant="outline"
                      style={getBadgeStyle(
                        highlightCategory === "expense"
                          ? CATEGORY_COLORS[expense.category]
                          : BUDGET_COLORS[expense.budgetCategory],
                      )}
                    >
                      {highlightCategory === "expense" ? expense.category : expense.budgetCategory}
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" defaultValue={editingExpense?.date} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" defaultValue={editingExpense?.description} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                defaultValue={editingExpense?.amount}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Spending Category</Label>
              <Select name="category" defaultValue={editingExpense?.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select spending category" />
                </SelectTrigger>
                <SelectContent>
                  {spendingCategories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetCategory">Budget Category</Label>
              <Select name="budgetCategory" defaultValue={editingExpense?.budgetCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget category" />
                </SelectTrigger>
                <SelectContent>
                  {budgetCategories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Comments (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={editingExpense?.notes}
                placeholder="Add any additional comments here"
              />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Expense List</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all expenses? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearExpenses}>
              Clear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import CSV</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-6 text-center">
            <p className="text-lg font-medium">This doesn't work yet lol</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

