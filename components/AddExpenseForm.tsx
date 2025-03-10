"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useBudgetContext } from "@/contexts/BudgetContext"
import { Textarea } from "@/components/ui/textarea"

interface Expense {
  id: string
  description: string
  amount: number
  date: string
  category: string
  budgetCategory: string
  notes?: string
}

interface AddExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, "id">) => void
  categories: string[]
}

const expenseCategories = ["Food", "Rent", "Utilities", "Transportation", "Entertainment"]

export default function AddExpenseForm({ onAddExpense, categories }: AddExpenseFormProps) {
  const [open, setOpen] = useState(false)
  const [expenseCategory, setExpenseCategory] = useState("")
  const [budgetCategory, setBudgetCategory] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const { toast } = useToast()
  const { budgetCategories } = useBudgetContext()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const description = formData.get("description") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const date = formData.get("date") as string
    const notes = formData.get("notes") as string

    const newErrors: { [key: string]: string } = {}
    if (!description) newErrors.description = "Description is required"
    if (isNaN(amount) || amount <= 0) newErrors.amount = "Valid amount is required"
    if (!expenseCategory) newErrors.expenseCategory = "Spending category is required"
    if (!budgetCategory) newErrors.budgetCategory = "Budget category is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onAddExpense({
      description,
      amount,
      date: date || undefined,
      category: expenseCategory,
      budgetCategory,
      notes: notes || undefined,
    })

    toast({
      title: "Expense added",
      description: "Your expense has been successfully added.",
    })

    setOpen(false)
    setErrors({})
    setExpenseCategory("")
    setBudgetCategory("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-black text-white hover:bg-black/90">Add Expense</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Enter description" />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" step="0.01" placeholder="Enter amount" />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date (Optional)</Label>
            <Input id="date" name="date" type="date" />
            {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expenseCategory">Spending Category</Label>
              <Select name="expenseCategory" onValueChange={setExpenseCategory} value={expenseCategory}>
                <SelectTrigger id="expenseCategory">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.expenseCategory && <p className="text-red-500 text-sm">{errors.expenseCategory}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetCategory">Budget Category</Label>
              <Select name="budgetCategory" onValueChange={setBudgetCategory} value={budgetCategory}>
                <SelectTrigger id="budgetCategory">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {budgetCategories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.budgetCategory && <p className="text-red-500 text-sm">{errors.budgetCategory}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Comments (Optional)</Label>
            <Textarea id="notes" name="notes" placeholder="Add any additional comments here" />
          </div>
          <Button type="submit" className="w-full bg-black text-white hover:bg-black/90">
            Add Expense
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

