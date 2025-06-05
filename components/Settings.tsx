"use client"
import { useState } from "react"
import { SettingsIcon, HelpCircle, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { useBudgetContext } from "@/contexts/BudgetContext"

// Define the same storage key used in the main app
const STORAGE_KEYS = {
  EXPENSES: "budgetcraft-expenses",
}

// Helper function to get data from localStorage
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

// Define the Expense interface
interface Expense {
  id: number
  date: string
  description: string
  amount: number
  category: string
  budgetCategory: string
  notes?: string
}

export function Settings() {
  const [helpOpen, setHelpOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { budgetCategories, income } = useBudgetContext()

  const generatePDF = () => {
    setIsGenerating(true)

    try {
      // Get expenses directly from localStorage (same as Dashboard does)
      const expenses = getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, [])

      console.log("PDF Generation - Data loaded:", {
        income,
        expensesCount: expenses.length,
        budgetCategoriesCount: budgetCategories.length,
        expenses: expenses,
        budgetCategories: budgetCategories,
      })

      const doc = new jsPDF()
      let currentY = 20

      // Title
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("Monthly Financial Summary", 105, currentY, { align: "center" })
      currentY += 15

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, currentY, { align: "center" })
      currentY += 20

      // Calculate totals
      const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
      const remaining = (income || 0) - totalExpenses

      console.log("PDF Generation - Calculations:", {
        totalExpenses,
        remaining,
        income,
      })

      // Financial Overview
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Financial Overview", 20, currentY)
      currentY += 15

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")

      // Income
      doc.text(`Total Income:`, 20, currentY)
      doc.setFont("helvetica", "bold")
      doc.text(`$${(income || 0).toFixed(2)}`, 80, currentY)
      currentY += 8

      // Expenses
      doc.setFont("helvetica", "normal")
      doc.text(`Total Expenses:`, 20, currentY)
      doc.setFont("helvetica", "bold")
      doc.text(`$${totalExpenses.toFixed(2)}`, 80, currentY)
      currentY += 8

      // Remaining/Over Budget
      doc.setFont("helvetica", "normal")
      if (remaining >= 0) {
        doc.text(`Remaining Budget:`, 20, currentY)
        doc.setTextColor(0, 128, 0)
        doc.setFont("helvetica", "bold")
        doc.text(`$${remaining.toFixed(2)}`, 80, currentY)
      } else {
        doc.text(`Over Budget:`, 20, currentY)
        doc.setTextColor(255, 0, 0)
        doc.setFont("helvetica", "bold")
        doc.text(`$${Math.abs(remaining).toFixed(2)}`, 80, currentY)
      }
      doc.setTextColor(0, 0, 0)
      currentY += 20

      // Calculate category spending
      const categoryTotals = {}
      expenses.forEach((expense) => {
        const category = expense.category || "Uncategorized"
        categoryTotals[category] = (categoryTotals[category] || 0) + (expense.amount || 0)
      })

      console.log("PDF Generation - Category totals:", categoryTotals)

      // Top 3 Categories
      const topCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3)

      if (topCategories.length > 0) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(16)
        doc.text("Top 3 Spending Categories", 20, currentY)
        currentY += 15

        doc.setFont("helvetica", "normal")
        doc.setFontSize(12)
        topCategories.forEach(([category, amount], index) => {
          const percentage = totalExpenses > 0 ? (((amount as number) / totalExpenses) * 100).toFixed(1) : "0"
          doc.text(`${index + 1}. ${category}: $${(amount as number).toFixed(2)} (${percentage}%)`, 25, currentY)
          currentY += 8
        })
        currentY += 15
      }

      // Budget Categories Table
      if (budgetCategories.length > 0) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(16)
        doc.text("Budget Allocation", 20, currentY)
        currentY += 10

        const budgetData = budgetCategories.map((cat) => {
          const allocated = ((income || 0) * (cat.percentage || 0)) / 100
          const spent = expenses
            .filter((e) => e.budgetCategory === cat.name)
            .reduce((sum, e) => sum + (e.amount || 0), 0)
          const remaining = allocated - spent

          return [
            cat.name || "Unnamed",
            `${(cat.percentage || 0).toFixed(1)}%`,
            `$${allocated.toFixed(2)}`,
            `$${spent.toFixed(2)}`,
            remaining >= 0 ? `$${remaining.toFixed(2)}` : `-$${Math.abs(remaining).toFixed(2)}`,
          ]
        })

        autoTable(doc, {
          startY: currentY,
          head: [["Budget Category", "%", "Allocated", "Spent", "Remaining"]],
          body: budgetData,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255] },
          margin: { left: 20, right: 20 },
        })

        currentY = (doc as any).lastAutoTable.finalY + 15
      }

      // All Categories Table
      if (Object.keys(categoryTotals).length > 0) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(16)
        doc.text("All Spending Categories", 20, currentY)
        currentY += 10

        const categoryData = Object.entries(categoryTotals)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .map(([category, amount]) => [
            category,
            `$${(amount as number).toFixed(2)}`,
            totalExpenses > 0 ? `${(((amount as number) / totalExpenses) * 100).toFixed(1)}%` : "0%",
          ])

        autoTable(doc, {
          startY: currentY,
          head: [["Category", "Amount", "% of Total"]],
          body: categoryData,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255] },
          margin: { left: 20, right: 20 },
        })

        currentY = (doc as any).lastAutoTable.finalY + 15
      }

      // Start new page for expenses list
      doc.addPage()
      currentY = 20

      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.text("All Expenses", 20, currentY)
      currentY += 15

      if (expenses.length > 0) {
        // Sort expenses by date (most recent first)
        const sortedExpenses = [...expenses].sort((a, b) => {
          const dateA = new Date(a.date || "1970-01-01")
          const dateB = new Date(b.date || "1970-01-01")
          return dateB.getTime() - dateA.getTime()
        })

        const expenseData = sortedExpenses.map((exp) => [
          exp.date || "No Date",
          exp.description || "No Description",
          exp.category || "Uncategorized",
          exp.budgetCategory || "Unassigned",
          `$${(exp.amount || 0).toFixed(2)}`,
        ])

        autoTable(doc, {
          startY: currentY,
          head: [["Date", "Description", "Category", "Budget Category", "Amount"]],
          body: expenseData,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255] },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 50 },
            2: { cellWidth: 35 },
            3: { cellWidth: 35 },
            4: { cellWidth: 25 },
          },
          margin: { left: 20, right: 20 },
        })
      } else {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(12)
        doc.text("No expenses recorded for this period.", 20, currentY)
      }

      // Add page numbers
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: "center" })
      }

      // Save the PDF
      const fileName = `financial_summary_${new Date().toISOString().slice(0, 10)}.pdf`
      doc.save(fileName)

      console.log("PDF generated successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <SettingsIcon className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setProfileOpen(true)}>Profile Settings</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setNotificationsOpen(true)}>Notification Preferences</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={generatePDF} disabled={isGenerating}>
            <FileDown className="mr-2 h-4 w-4" />
            <span>{isGenerating ? "Generating..." : "Download Financial Summary"}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setHelpOpen(true)}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Help Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Need Help?</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-6 text-center">
            <p className="text-lg font-medium">Just refresh the page lol</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Settings Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-6 text-center">
            <p className="text-lg font-medium">This isn't setup yet lol</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Preferences Dialog */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Notification Preferences</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-6 text-center">
            <p className="text-lg font-medium">This isn't setup yet lol</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
