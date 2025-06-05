"use client"

import type React from "react"

import { createContext, useState, useContext, type ReactNode, useEffect, useCallback } from "react"
import * as storageUtils from "@/utils/storage"

// Define storage keys directly in this file to avoid import issues
const STORAGE_KEYS = {
  BUDGET_CATEGORIES: "budgetcraft-budget-categories",
  SPENDING_CATEGORIES: "budgetcraft-spending-categories",
  INCOME: "budgetcraft-income",
  CATEGORY_COLORS: "budgetcraft-category-colors",
  BUDGET_COLORS: "budgetcraft-budget-colors",
}

// Update the BudgetCategory interface to include amount
export interface BudgetCategory {
  name: string
  percentage: number
  amount: number | string
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

// Add color mappings to the context interface
interface BudgetContextType {
  budgetCategories: BudgetCategory[]
  setBudgetCategories: React.Dispatch<React.SetStateAction<BudgetCategory[]>>
  spendingCategories: SpendingCategory[]
  setSpendingCategories: React.Dispatch<React.SetStateAction<SpendingCategory[]>>
  income: number
  setIncome: React.Dispatch<React.SetStateAction<number>>
  expenses?: Expense[]
  categoryColors: { [key: string]: string }
  setCategoryColors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
  budgetColors: { [key: string]: string }
  setBudgetColors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
  updateCategoryColor: (categoryName: string, color: string) => void
  updateBudgetColor: (categoryName: string, color: string) => void
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

export const useBudgetContext = () => {
  const context = useContext(BudgetContext)
  if (!context) {
    throw new Error("useBudgetContext must be used within a BudgetProvider")
  }
  return context
}

// Default values
const DEFAULT_BUDGET_CATEGORIES: BudgetCategory[] = [
  { name: "Needs", percentage: 50, amount: 2500, spent: 0, color: "#FFBB28" },
  { name: "Wants", percentage: 30, amount: 1500, spent: 0, color: "#00C49F" },
  { name: "Savings", percentage: 20, amount: 1000, spent: 0, color: "#4169E1" },
]

const DEFAULT_SPENDING_CATEGORIES: SpendingCategory[] = [
  { name: "Food", color: "#FF6B6B" },
  { name: "Rent", color: "#4ECDC4" },
  { name: "Transportation", color: "#45B7D1" },
  { name: "Utilities", color: "#FFA07A" },
  { name: "Entertainment", color: "#98D8C8" },
]

const DEFAULT_INCOME = 5000

// Default color mappings
const DEFAULT_CATEGORY_COLORS = {
  Food: "#FF6B6B",
  Rent: "#4ECDC4",
  Transportation: "#45B7D1",
  Utilities: "#FFA07A",
  Entertainment: "#98D8C8",
  Income: "#82ca9d",
  Remaining: "#D3D3D3",
  "Over Budget": "#FF4136",
}

const DEFAULT_BUDGET_COLORS = {
  Needs: "#FFBB28",
  Wants: "#00C49F",
  Savings: "#4169E1",
}

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Check if localStorage is available
  const storageAvailable = typeof window !== "undefined" && storageUtils.isStorageAvailable()

  // Initialize state with default values
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(DEFAULT_BUDGET_CATEGORIES)
  const [spendingCategories, setSpendingCategories] = useState<SpendingCategory[]>(DEFAULT_SPENDING_CATEGORIES)
  const [income, setIncome] = useState(DEFAULT_INCOME)
  const [categoryColors, setCategoryColors] = useState<{ [key: string]: string }>(DEFAULT_CATEGORY_COLORS)
  const [budgetColors, setBudgetColors] = useState<{ [key: string]: string }>(DEFAULT_BUDGET_COLORS)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Helper functions to update colors
  const updateCategoryColor = useCallback((categoryName: string, color: string) => {
    setCategoryColors((prev) => ({
      ...prev,
      [categoryName]: color,
    }))
  }, [])

  const updateBudgetColor = useCallback((categoryName: string, color: string) => {
    setBudgetColors((prev) => ({
      ...prev,
      [categoryName]: color,
    }))
  }, [])

  // Function to save all data to localStorage
  const saveAllData = useCallback(() => {
    if (!storageAvailable) return

    storageUtils.saveToStorage(STORAGE_KEYS.BUDGET_CATEGORIES, budgetCategories)
    storageUtils.saveToStorage(STORAGE_KEYS.SPENDING_CATEGORIES, spendingCategories)
    storageUtils.saveToStorage(STORAGE_KEYS.INCOME, income)
    storageUtils.saveToStorage(STORAGE_KEYS.CATEGORY_COLORS, categoryColors)
    storageUtils.saveToStorage(STORAGE_KEYS.BUDGET_COLORS, budgetColors)
  }, [budgetCategories, spendingCategories, income, categoryColors, budgetColors, storageAvailable])

  // Load data from localStorage on initial render
  useEffect(() => {
    if (!storageAvailable) return

    try {
      const savedBudgetCategories = storageUtils.getFromStorage<BudgetCategory[]>(
        STORAGE_KEYS.BUDGET_CATEGORIES,
        DEFAULT_BUDGET_CATEGORIES,
      )

      const savedSpendingCategories = storageUtils.getFromStorage<SpendingCategory[]>(
        STORAGE_KEYS.SPENDING_CATEGORIES,
        DEFAULT_SPENDING_CATEGORIES,
      )

      const savedIncome = storageUtils.getFromStorage<number>(STORAGE_KEYS.INCOME, DEFAULT_INCOME)

      const savedCategoryColors = storageUtils.getFromStorage<{ [key: string]: string }>(
        STORAGE_KEYS.CATEGORY_COLORS,
        DEFAULT_CATEGORY_COLORS,
      )

      const savedBudgetColors = storageUtils.getFromStorage<{ [key: string]: string }>(
        STORAGE_KEYS.BUDGET_COLORS,
        DEFAULT_BUDGET_COLORS,
      )

      setBudgetCategories(savedBudgetCategories)
      setSpendingCategories(savedSpendingCategories)
      setIncome(savedIncome)
      setCategoryColors(savedCategoryColors)
      setBudgetColors(savedBudgetColors)
      setDataLoaded(true)
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
      // Fall back to defaults if there's an error
      setBudgetCategories(DEFAULT_BUDGET_CATEGORIES)
      setSpendingCategories(DEFAULT_SPENDING_CATEGORIES)
      setIncome(DEFAULT_INCOME)
      setCategoryColors(DEFAULT_CATEGORY_COLORS)
      setBudgetColors(DEFAULT_BUDGET_COLORS)
    }
  }, [storageAvailable])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!dataLoaded || !storageAvailable) return

    const saveTimeout = setTimeout(() => {
      saveAllData()
    }, 500) // Debounce saves to avoid excessive writes

    return () => clearTimeout(saveTimeout)
  }, [
    budgetCategories,
    spendingCategories,
    income,
    categoryColors,
    budgetColors,
    dataLoaded,
    saveAllData,
    storageAvailable,
  ])

  // Save data before the window unloads (page close/refresh)
  useEffect(() => {
    if (!storageAvailable) return

    const handleBeforeUnload = () => {
      saveAllData()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [saveAllData, storageAvailable])

  // Sync colors with category changes
  useEffect(() => {
    // Update category colors when spending categories change
    const newCategoryColors = { ...categoryColors }
    spendingCategories.forEach((category) => {
      newCategoryColors[category.name] = category.color
    })
    setCategoryColors(newCategoryColors)
  }, [spendingCategories])

  useEffect(() => {
    // Update budget colors when budget categories change
    const newBudgetColors = { ...budgetColors }
    budgetCategories.forEach((category) => {
      newBudgetColors[category.name] = category.color
    })
    setBudgetColors(newBudgetColors)
  }, [budgetCategories])

  return (
    <BudgetContext.Provider
      value={{
        budgetCategories,
        setBudgetCategories,
        spendingCategories,
        setSpendingCategories,
        income,
        setIncome,
        categoryColors,
        setCategoryColors,
        budgetColors,
        setBudgetColors,
        updateCategoryColor,
        updateBudgetColor,
      }}
    >
      {children}
    </BudgetContext.Provider>
  )
}
