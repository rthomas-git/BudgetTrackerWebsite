"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { Badge } from "@/app/components/ui/badge"

const transactions = [
  { id: 1, date: "2023-06-01", description: "Grocery Shopping", amount: -75.5, category: "Food" },
  { id: 2, date: "2023-06-02", description: "Salary", amount: 3000, category: "Income" },
  { id: 3, date: "2023-06-03", description: "Electric Bill", amount: -120, category: "Utilities" },
  { id: 4, date: "2023-06-04", description: "Movie Tickets", amount: -30, category: "Entertainment" },
  { id: 5, date: "2023-06-05", description: "Gas", amount: -45, category: "Transportation" },
]

export default function TransactionList() {
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
          <TableRow key={transaction.id}>
            <TableCell>{transaction.date}</TableCell>
            <TableCell>{transaction.description}</TableCell>
            <TableCell className={transaction.amount > 0 ? "text-green-600" : "text-red-600"}>
              ${Math.abs(transaction.amount).toFixed(2)}
            </TableCell>
            <TableCell>
              <Badge variant={transaction.amount > 0 ? "default" : "secondary"}>{transaction.category}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

