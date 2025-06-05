"use client"

import type React from "react"
import { useState } from "react"
import type { Note } from "../types"

interface BudgetListNoteEditorProps {
  note: Note
  onUpdate: (updatedNote: Note) => void
}

const BudgetListNoteEditor: React.FC<BudgetListNoteEditorProps> = ({ note, onUpdate }) => {
  const [budgetList, setBudgetList] = useState(note.budgetList || [])

  const handleBudgetItemChange = (index: number, field: "key" | "value", value: string) => {
    const updatedBudgetList = [...budgetList]
    updatedBudgetList[index] = { ...updatedBudgetList[index], [field]: value }
    setBudgetList(updatedBudgetList)
    onUpdate({ ...note, budgetList: updatedBudgetList })
  }

  const handleAddBudgetItem = () => {
    const updatedBudgetList = [...budgetList, { key: "", value: "" }]
    setBudgetList(updatedBudgetList)
    onUpdate({ ...note, budgetList: updatedBudgetList })
  }

  const handleRemoveBudgetItem = (index: number) => {
    const updatedBudgetList = budgetList.filter((_, i) => i !== index)
    setBudgetList(updatedBudgetList)
    onUpdate({ ...note, budgetList: updatedBudgetList })
  }

  return (
    <div className="space-y-4">
      {budgetList.map((item, index) => (
        <div key={index} className="flex space-x-2">
          <input
            type="text"
            value={item.key}
            onChange={(e) => handleBudgetItemChange(index, "key", e.target.value)}
            placeholder="Key"
            className="flex-1 p-2 border rounded"
          />
          <input
            type="text"
            value={item.value}
            onChange={(e) => handleBudgetItemChange(index, "value", e.target.value)}
            placeholder="Value"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={() => handleRemoveBudgetItem(index)}
            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Remove
          </button>
        </div>
      ))}
      <button onClick={handleAddBudgetItem} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Add Key-Value Pair
      </button>
    </div>
  )
}

export default BudgetListNoteEditor
