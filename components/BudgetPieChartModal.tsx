import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import BudgetPieChart from "./BudgetPieChart"
import type { BudgetCategory } from "./BudgetAllocation"

interface BudgetPieChartModalProps {
  budgetCategories: BudgetCategory[]
  income: number
}

export default function BudgetPieChartModal({ budgetCategories, income }: BudgetPieChartModalProps) {
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Budget Allocation</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <BudgetPieChart budgetCategories={budgetCategories} income={income} />
      </div>
    </DialogContent>
  )
}

