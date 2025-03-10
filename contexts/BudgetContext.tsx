"use client"

import type React from "react"
import { createContext, useState, useContext, type ReactNode, useEffect } from "react"

export const BUDGET_COLORS: { [key: string]: string } = {
  Needs: "#FFBB28",
  Wants: "#00C49F",
  Savings: "#4169E1",
}

export interface BudgetCategory {
  name: string
  percentage: number
  spent: number
  color: string
}

interface SpendingCategory {
  name: string
  color: string
}

interface Expense {
  id: string
  amount: number
  description: string
  categoryId: string
  date: Date
}

// Update the BudgetContextType interface to include expenses
interface BudgetContextType {
  budgetCategories: BudgetCategory[]
  setBudgetCategories: React.Dispatch<React.SetStateAction<BudgetCategory[]>>
  spendingCategories: SpendingCategory[]
  setSpendingCategories: React.Dispatch<React.SetStateAction<SpendingCategory[]>>
  income: number
  setIncome: React.Dispatch<React.SetStateAction<number>>
  expenses?: Expense[] // Add this line to make expenses optional
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

export const useBudgetContext = () => {
  const context = useContext(BudgetContext)
  if (!context) {
    throw new Error("useBudgetContext must be used within a BudgetProvider")
  }
  return context
}

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    { name: "Needs", percentage: 50, spent: 0, color: BUDGET_COLORS["Needs"] || "#FFBB28" },
    { name: "Wants", percentage: 30, spent: 0, color: BUDGET_COLORS["Wants"] || "#00C49F" },
    { name: "Savings", percentage: 20, spent: 0, color: BUDGET_COLORS["Savings"] || "#4169E1" },
  ])
  const [spendingCategories, setSpendingCategories] = useState<SpendingCategory[]>([
    { name: "Food", color: "#FF6B6B" },
    { name: "Rent", color: "#4ECDC4" },
    { name: "Transportation", color: "#45B7D1" },
    { name: "Utilities", color: "#FFA07A" },
    { name: "Entertainment", color: "#98D8C8" },
  ])
  const [income, setIncome] = useState(5000)

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedBudgetCategories = localStorage.getItem("budgetCategories")
    const savedSpendingCategories = localStorage.getItem("spendingCategories")
    const savedIncome = localStorage.getItem("income")

    if (savedBudgetCategories) {
      setBudgetCategories(JSON.parse(savedBudgetCategories))
    }
    if (savedSpendingCategories) {
      setSpendingCategories(JSON.parse(savedSpendingCategories))
    }
    if (savedIncome) {
      setIncome(Number(savedIncome))
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("budgetCategories", JSON.stringify(budgetCategories))
  }, [budgetCategories])

  useEffect(() => {
    localStorage.setItem("spendingCategories", JSON.stringify(spendingCategories))
  }, [spendingCategories])

  useEffect(() => {
    localStorage.setItem("income", income.toString())
  }, [income])

  return (
    <BudgetContext.Provider
      value={{
        budgetCategories,
        setBudgetCategories,
        spendingCategories,
        setSpendingCategories,
        income,
        setIncome,
      }}
    >
      {children}
    </BudgetContext.Provider>
  )
}

