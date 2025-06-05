"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function RecurringTransactions() {
  const [recurringTransactions /* setRecurringTransactions */] = useState([
    // Removed setRecurringTransactions
    { description: "Salary", amount: 3000, type: "income", frequency: "Monthly" },
    { description: "Rent", amount: 1000, type: "expense", frequency: "Monthly" },
    { description: "Netflix", amount: 15, type: "expense", frequency: "Monthly" },
  ])

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recurringTransactions.map((transaction, index) => (
            <TableRow key={index}>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>${transaction.amount}</TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell>{transaction.frequency}</TableCell>
              <TableCell>
                <Switch />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button>Add Recurring Transaction</Button>
    </div>
  )
}
