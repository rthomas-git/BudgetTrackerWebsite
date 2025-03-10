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

export function Settings() {
  const [helpOpen, setHelpOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { budgetCategories, income, expenses = [] } = useBudgetContext()

  const generatePDF = () => {
    setIsGenerating(true)
    const doc = new jsPDF()
    let currentY = 15

    // Title page
    doc.setFontSize(24)
    doc.text("Financial Report", 105, currentY, { align: "center" })
    currentY += 10

    doc.setFontSize(14)
    doc.text("Generated on: " + new Date().toLocaleDateString(), 105, currentY, { align: "center" })
    currentY += 20

    // Overview Section
    doc.setFontSize(18)
    doc.text("Financial Overview", 20, currentY)
    currentY += 10

    doc.setFontSize(12)
    doc.text(`Total Income: $${income.toFixed(2)}`, 20, currentY)
    currentY += 8

    const totalExpenses = expenses ? expenses.reduce((sum, expense) => sum + expense.amount, 0) : 0
    doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 20, currentY)
    currentY += 8

    const remaining = income - totalExpenses
    doc.text(`Remaining: $${remaining.toFixed(2)}`, 20, currentY)
    currentY += 15

    // Budget Categories Section
    doc.setFontSize(18)
    doc.text("Budget Allocation", 20, currentY)
    currentY += 10

    const budgetData = budgetCategories.map((cat) => [
      cat.name,
      `${cat.percentage}%`,
      `$${((income * cat.percentage) / 100).toFixed(2)}`,
      `$${(expenses && expenses.filter((e) => e.budgetCategory === cat.name).reduce((sum, e) => sum + e.amount, 0)).toFixed(2)}`,
    ])

    autoTable(doc, {
      startY: currentY,
      head: [["Category", "Percentage", "Allocated", "Spent"]],
      body: budgetData,
    })

    currentY = (doc as any).lastAutoTable.finalY + 15

    // Expense Categories Section
    doc.setFontSize(18)
    doc.text("Spending Categories", 20, currentY)
    currentY += 10

    // Group expenses by category
    const expensesByCategory = {}
    if (expenses) {
      expenses.forEach((expense) => {
        if (!expensesByCategory[expense.category]) {
          expensesByCategory[expense.category] = 0
        }
        expensesByCategory[expense.category] += expense.amount
      })
    }

    const categoryData = Object.entries(expensesByCategory).map(([category, amount]) => [
      category,
      `$${(amount as number).toFixed(2)}`,
      totalExpenses > 0 ? `${(((amount as number) / totalExpenses) * 100).toFixed(1)}%` : "0%",
    ])

    autoTable(doc, {
      startY: currentY,
      head: [["Category", "Amount", "Percentage"]],
      body: categoryData,
    })

    currentY = (doc as any).lastAutoTable.finalY + 15

    // Detailed Expenses Section
    doc.addPage()
    doc.setFontSize(18)
    doc.text("Detailed Expenses", 20, 20)

    const expenseData = expenses
      ? expenses.map((exp) => [
          exp.date,
          exp.description,
          exp.category,
          exp.budgetCategory,
          `$${exp.amount.toFixed(2)}`,
        ])
      : []

    autoTable(doc, {
      startY: 30,
      head: [["Date", "Description", "Category", "Budget Category", "Amount"]],
      body: expenseData,
    })

    // Save the PDF
    doc.save("financial_report.pdf")
    setIsGenerating(false)
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
            <span>Download Financial Summary</span>
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

