"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function TransactionForm() {
  const [/* transactionType */ , setTransactionType] = useState("expense") // Removed transactionType

  return (
    <form className="space-y-4">
      <Select onValueChange={setTransactionType}>
        <SelectTrigger>
          <SelectValue placeholder="Transaction Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
        </SelectContent>
      </Select>
      <Input type="number" placeholder="Amount" />
      <Input type="text" placeholder="Category" />
      <Textarea placeholder="Notes" />
      <Input type="file" accept="image/*" />
      <Button type="submit">Add Transaction</Button>
    </form>
  )
}
