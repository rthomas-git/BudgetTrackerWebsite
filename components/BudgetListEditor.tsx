"use client"

import type React from "react"
import { useState } from "react"

interface BudgetItem {
  key: string
  value: string
}

const BudgetListEditor: React.FC = () => {
  const [budgetList, setBudgetList] = useState<BudgetItem[]>([])

  const handleAddKeyValuePair = () => {
    setBudgetList([...budgetList, { key: "", value: "" }])
  }

  return (
    <div>
      {budgetList.map((item, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Key"
            value={item.key}
            onChange={(e) => {
              const newBudgetList = [...budgetList]
              newBudgetList[index].key = e.target.value
              setBudgetList(newBudgetList)
            }}
          />
          <input
            type="text"
            placeholder="Value"
            value={item.value}
            onChange={(e) => {
              const newBudgetList = [...budgetList]
              newBudgetList[index].value = e.target.value
              setBudgetList(newBudgetList)
            }}
          />
        </div>
      ))}
      <button
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleAddKeyValuePair}
      >
        Add Key-Value Pair
      </button>
    </div>
  )
}

export default BudgetListEditor
