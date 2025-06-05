"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_COLORS } from "./ExpensePieChart"
import { useTheme } from "next-themes"

const transactions = [
  { id: 1, date: "2023-06-01", description: "Grocery Shopping", amount: -75.5, category: "Food" },
  { id: 2, date: "2023-06-02", description: "Salary", amount: 3000, category: "Income" },
  { id: 3, date: "2023-06-03", description: "Electric Bill", amount: -120, category: "Utilities" },
  { id: 4, date: "2023-06-04", description: "Movie Tickets", amount: -30, category: "Entertainment" },
  { id: 5, date: "2023-06-05", description: "Gas", amount: -45, category: "Transportation" },
  { id: 6, date: "2023-06-06", description: "Rent Payment", amount: -1000, category: "Rent" },
]

export default function TransactionList() {
  const { theme } = useTheme()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Category</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow
            key={transaction.id}
            style={{ backgroundColor: `${CATEGORY_COLORS[transaction.category]}${theme === "dark" ? "40" : "20"}` }}
          >
            <TableCell>{transaction.date}</TableCell>
            <TableCell>{transaction.description}</TableCell>
            <TableCell className={transaction.amount > 0 ? "text-green-600" : "text-red-600"}>
              ${Math.abs(transaction.amount).toFixed(2)}
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                style={{
                  backgroundColor: CATEGORY_COLORS[transaction.category],
                  color: theme === "dark" ? "#000000" : "#FFFFFF",
                  borderColor: CATEGORY_COLORS[transaction.category],
                }}
              >
                {transaction.category}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
