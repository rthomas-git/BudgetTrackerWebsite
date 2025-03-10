"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function BudgetPlanner() {
  const [budgets, setBudgets] = useState([
    { category: "Food", amount: 500, spent: 300 },
    { category: "Transportation", amount: 200, spent: 150 },
    { category: "Entertainment", amount: 100, spent: 80 },
  ])

  return (
    <div className="space-y-4">
      {budgets.map((budget, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between">
            <span>{budget.category}</span>
            <span>
              ${budget.spent} / ${budget.amount}
            </span>
          </div>
          <Progress value={(budget.spent / budget.amount) * 100} />
        </div>
      ))}
      <Button>Add Budget Category</Button>
    </div>
  )
}

