"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ExpensePieChart from "@/components/ExpensePieChart"
import ExpenseList, { type Expense } from "@/components/ExpenseList"
import AddExpenseForm from "@/components/AddExpenseForm"
import BudgetAllocation from "@/components/BudgetAllocation"
import { BudgetProvider, useBudgetContext } from "@/contexts/BudgetContext"
import { motion, AnimatePresence } from "framer-motion"
import Papa from "papaparse"
import { format } from "date-fns"
import { ArrowUpIcon, ArrowDownIcon, Lightbulb } from "lucide-react"
import FinancialPerformanceChart from "@/components/FinancialPerformanceChart"
import { ExpandableCalculator } from "@/components/ExpandableCalculator"
import { useMediaQuery } from "@/hooks/use-media-query"

// Define storage keys and utilities directly in this file
const STORAGE_KEYS = {
  EXPENSES: "budgetcraft-expenses",
  ACTIVE_TAB: "budgetcraft-active-tab",
  SPENDING_CATEGORIES: "budgetcraft-spending-categories",
}

// Helper functions for localStorage
const saveToStorage = <T,>(key: string, data: T): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error)
    }
  }
}

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window !== "undefined") {
    try {
      const storedValue = localStorage.getItem(key)
      return storedValue ? JSON.parse(storedValue) : defaultValue
    } catch (error) {
      console.error(`Error retrieving from localStorage (${key}):`, error)
      return defaultValue
    }
  }
  return defaultValue
}

type Tab = "spending" | "budget"

function DashboardContent() {
  const { income, budgetCategories } = useBudgetContext()
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 1,
      date: "2023-07-01",
      description: "Grocery Shopping",
      amount: 75.5,
      category: "Food",
      budgetCategory: "Needs",
    },
    {
      id: 2,
      date: "2023-07-03",
      description: "Electric Bill",
      amount: 120,
      category: "Utilities",
      budgetCategory: "Needs",
    },
    {
      id: 3,
      date: "2023-07-04",
      description: "Movie Tickets",
      amount: 30,
      category: "Entertainment",
      budgetCategory: "Wants",
    },
    { id: 4, date: "2023-07-05", description: "Gas", amount: 45, category: "Transportation", budgetCategory: "Needs" },
    { id: 5, date: "2023-07-06", description: "Rent Payment", amount: 1000, category: "Rent", budgetCategory: "Needs" },
    { id: 6, date: "2023-07-10", description: "Dining Out", amount: 60, category: "Food", budgetCategory: "Wants" },
    {
      id: 7,
      date: "2023-07-15",
      description: "Internet Bill",
      amount: 80,
      category: "Utilities",
      budgetCategory: "Needs",
    },
  ])

  const [activeTab, setActiveTab] = useState<Tab>("spending")
  const [categories, setCategories] = useState<string[]>([
    "Food",
    "Rent",
    "Transportation",
    "Utilities",
    "Entertainment",
    "Shopping",
  ])

  const isMobile = useMediaQuery("(max-width: 768px)")

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedExpenses = getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, [
      {
        id: 1,
        date: "2023-07-01",
        description: "Grocery Shopping",
        amount: 75.5,
        category: "Food",
        budgetCategory: "Needs",
      },
      {
        id: 2,
        date: "2023-07-03",
        description: "Electric Bill",
        amount: 120,
        category: "Utilities",
        budgetCategory: "Needs",
      },
      {
        id: 3,
        date: "2023-07-04",
        description: "Movie Tickets",
        amount: 30,
        category: "Entertainment",
        budgetCategory: "Wants",
      },
      {
        id: 4,
        date: "2023-07-05",
        description: "Gas",
        amount: 45,
        category: "Transportation",
        budgetCategory: "Needs",
      },
      {
        id: 5,
        date: "2023-07-06",
        description: "Rent Payment",
        amount: 1000,
        category: "Rent",
        budgetCategory: "Needs",
      },
      { id: 6, date: "2023-07-10", description: "Dining Out", amount: 60, category: "Food", budgetCategory: "Wants" },
      {
        id: 7,
        date: "2023-07-15",
        description: "Internet Bill",
        amount: 80,
        category: "Utilities",
        budgetCategory: "Needs",
      },
    ])

    const savedActiveTab = getFromStorage<Tab>(STORAGE_KEYS.ACTIVE_TAB, "spending")

    const savedCategories = getFromStorage<string[]>(STORAGE_KEYS.SPENDING_CATEGORIES, [
      "Food",
      "Rent",
      "Transportation",
      "Utilities",
      "Entertainment",
      "Shopping",
    ])

    setExpenses(savedExpenses)
    setActiveTab(savedActiveTab)
    setCategories(savedCategories)
  }, [])

  // Save expenses to localStorage when they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EXPENSES, expenses)
  }, [expenses])

  // Save active tab to localStorage when it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACTIVE_TAB, activeTab)
  }, [activeTab])

  // Save categories to localStorage when they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SPENDING_CATEGORIES, categories)
  }, [categories])

  // Add this effect to update expenses when budget categories change
  useEffect(() => {
    // This will run whenever budgetCategories changes
    console.log("Budget categories changed, checking if expenses need updating")

    // Create a map of old category names to new ones
    const categoryNameMap = new Map<string, string>()

    // Check if any expenses have budget categories that don't exist anymore
    const updatedExpenses = expenses.map((expense) => {
      // Check if this expense's budget category still exists
      const categoryExists = budgetCategories.some((cat) => cat.name === expense.budgetCategory)

      if (!categoryExists) {
        console.log(`Budget category ${expense.budgetCategory} no longer exists for expense ${expense.description}`)

        // Try to find a matching category by looking at the first letter
        const firstLetter = expense.budgetCategory.charAt(0)
        const possibleMatch = budgetCategories.find((cat) => cat.name.charAt(0) === firstLetter)

        if (possibleMatch) {
          console.log(`Updating expense ${expense.description} from ${expense.budgetCategory} to ${possibleMatch.name}`)
          return { ...expense, budgetCategory: possibleMatch.name }
        }

        // If no match found, use the first category
        if (budgetCategories.length > 0) {
          console.log(
            `Updating expense ${expense.description} from ${expense.budgetCategory} to ${budgetCategories[0].name}`,
          )
          return { ...expense, budgetCategory: budgetCategories[0].name }
        }
      }

      return expense
    })

    // Only update if there were changes
    if (JSON.stringify(updatedExpenses) !== JSON.stringify(expenses)) {
      console.log("Updating expenses with new budget categories")
      setExpenses(updatedExpenses)
    }
  }, [budgetCategories])

  const handleUpdateExpense = (updatedExpense: Expense) => {
    setExpenses((prevExpenses) =>
      prevExpenses.map((expense) => (expense.id === updatedExpense.id ? updatedExpense : expense)),
    )
  }

  const handleReorderExpenses = useCallback((reorderedExpenses: Expense[]) => {
    console.log("Reordering expenses:", reorderedExpenses)
    setExpenses(reorderedExpenses)
  }, [])

  const handleClearExpenses = () => {
    setExpenses([])
  }

  const handleAddExpense = (newExpense: Omit<Expense, "id">) => {
    const expenseWithId: Expense = {
      ...newExpense,
      id: Date.now(), // Use timestamp as a simple unique id
    }

    console.log("Adding new expense:", expenseWithId)

    setExpenses((prevExpenses) => {
      const updatedExpenses = [...prevExpenses, expenseWithId]
      console.log("Updated expenses array:", updatedExpenses)
      return updatedExpenses
    })
  }

  const handleImportCSV = (file: File) => {
    Papa.parse(file, {
      complete: (results) => {
        const newExpenses: Expense[] = results.data
          .filter((row: any) => row.date && row.description && row.amount)
          .map((row: any, index: number) => ({
            id: Date.now() + index,
            date: row.date,
            description: row.description,
            amount: Number.parseFloat(row.amount),
            category: row.category || "Uncategorized",
            budgetCategory: row.budgetCategory || "Uncategorized",
            notes: row.notes || "",
          }))
        setExpenses((prevExpenses) => [...prevExpenses, ...newExpenses])
      },
      header: true,
      skipEmptyLines: true,
    })
  }

  const handleCategoryChange = (newCategories: string[]) => {
    setCategories(newCategories)
  }

  const spotlightData = {
    totalSpent: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    monthlyBudget: income,
    overBudget: expenses.reduce((sum, expense) => sum + expense.amount, 0) - income,
    topCategory: (() => {
      const categoryTotals = expenses.reduce(
        (acc, expense) => {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount
          return acc
        },
        {} as Record<string, number>,
      )
      const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
      return topCategory ? { name: topCategory[0], amount: topCategory[1] } : null
    })(),
    savingsGoal: 1000,
    savedAmount: 750,
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl flex items-center">
            <Lightbulb className="w-5 h-5 md:w-6 md:h-6 mr-2 text-yellow-500" />
            {format(new Date(), "MMMM")} Spotlight
          </CardTitle>
          <CardDescription>Key insights from your spending this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Card className="col-span-1">
              <CardHeader className="p-3 md:p-4">
                <CardTitle className="text-base md:text-lg flex items-center justify-between">
                  Total Spending
                  {spotlightData.overBudget > 0 ? (
                    <ArrowUpIcon className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0">
                <div className="text-xl md:text-2xl font-bold mb-1 md:mb-2">
                  $
                  {spotlightData.totalSpent.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <p className="text-sm md:text-base text-muted-foreground mb-2 md:mb-4">
                  Budget: $
                  {spotlightData.monthlyBudget.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                {spotlightData.overBudget > 0 ? (
                  <p className="text-xs md:text-sm text-red-500">
                    Over budget by $
                    {spotlightData.overBudget.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                ) : (
                  <p className="text-xs md:text-sm text-green-500">
                    Under budget by $
                    {(-spotlightData.overBudget).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader className="p-3 md:p-4">
                <CardTitle className="text-base md:text-lg flex items-center justify-between">
                  Top Expense Category
                  <ArrowUpIcon className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0">
                <div className="text-xl md:text-2xl font-bold mb-1 md:mb-2">
                  {spotlightData.topCategory?.name || "N/A"}
                </div>
                <p className="text-sm md:text-base text-muted-foreground mb-2 md:mb-4">
                  $
                  {spotlightData.topCategory?.amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00"}{" "}
                  spent
                </p>
                <p className="text-xs md:text-sm">
                  This category represents{" "}
                  {spotlightData.topCategory
                    ? ((spotlightData.topCategory.amount / spotlightData.totalSpent) * 100).toFixed(1)
                    : "0"}
                  % of your total spending
                </p>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader className="p-3 md:p-4">
                <CardTitle className="text-base md:text-lg">Financial Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0 h-[120px] md:h-auto">
                <FinancialPerformanceChart />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card">
        <CardContent className="pt-4">
          <div className="flex mb-4">
            <Button
              variant={activeTab === "spending" ? "default" : "outline"}
              onClick={() => setActiveTab("spending")}
              className={`flex-1 rounded-r-none ${
                activeTab === "spending" ? "bg-black text-white hover:bg-black/90" : ""
              }`}
            >
              Spending Summary
            </Button>
            <Button
              variant={activeTab === "budget" ? "default" : "outline"}
              onClick={() => setActiveTab("budget")}
              className={`flex-1 rounded-l-none ${
                activeTab === "budget" ? "bg-black text-white hover:bg-black/90" : ""
              }`}
            >
              Budget
            </Button>
          </div>
          <div className="relative overflow-hidden" style={{ minHeight: isMobile ? "400px" : "500px" }}>
            <AnimatePresence initial={false}>
              {activeTab === "spending" && (
                <motion.div
                  key="spending"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                  className="absolute top-0 left-0 w-full h-full"
                >
                  <ExpensePieChart expenses={expenses} />
                </motion.div>
              )}
              {activeTab === "budget" && (
                <motion.div
                  key="budget"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                  className="absolute top-0 left-0 w-full h-full"
                >
                  <BudgetAllocation expenses={expenses} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card">
        <CardContent>
          <ExpenseList
            expenses={expenses}
            onUpdateExpense={handleUpdateExpense}
            onReorderExpenses={handleReorderExpenses}
            onClearExpenses={handleClearExpenses}
            onImportCSV={handleImportCSV}
            highlightCategory={activeTab === "spending" ? "expense" : "budget"}
            categories={categories}
            onCategoryChange={handleCategoryChange}
            activeTab={activeTab}
          />
        </CardContent>
        <div className="p-4 md:p-6 pt-0">
          <AddExpenseForm onAddExpense={handleAddExpense} categories={categories} />
        </div>
      </Card>
      <ExpandableCalculator />
    </div>
  )
}

export default function Dashboard() {
  return (
    <BudgetProvider>
      <DashboardContent />
    </BudgetProvider>
  )
}
