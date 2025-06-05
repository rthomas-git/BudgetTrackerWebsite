"use client"

import type React from "react"
import { useState } from "react"
import type { Note } from "../types"

interface CheckboxNoteEditorProps {
  note: Note
  onUpdate: (updatedNote: Note) => void
}

const CheckboxNoteEditor: React.FC<CheckboxNoteEditorProps> = ({ note, onUpdate }) => {
  const [checkboxItems, setCheckboxItems] = useState(note.checkboxItems || [])

  const handleCheckboxItemChange = (index: number, value: string) => {
    const updatedItems = [...checkboxItems]
    updatedItems[index] = { ...updatedItems[index], text: value }
    setCheckboxItems(updatedItems)
    onUpdate({ ...note, checkboxItems: updatedItems })
  }

  const handleCheckboxToggle = (index: number) => {
    const updatedItems = [...checkboxItems]
    updatedItems[index] = { ...updatedItems[index], checked: !updatedItems[index].checked }
    setCheckboxItems(updatedItems)
    onUpdate({ ...note, checkboxItems: updatedItems })
  }

  const handleAddCheckboxItem = () => {
    const updatedItems = [...checkboxItems, { text: "", checked: false }]
    setCheckboxItems(updatedItems)
    onUpdate({ ...note, checkboxItems: updatedItems })
  }

  const handleRemoveCheckboxItem = (index: number) => {
    const updatedItems = checkboxItems.filter((_, i) => i !== index)
    setCheckboxItems(updatedItems)
    onUpdate({ ...note, checkboxItems: updatedItems })
  }

  return (
    <div className="space-y-4">
      {checkboxItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => handleCheckboxToggle(index)}
            className="form-checkbox h-5 w-5"
          />
          <input
            type="text"
            value={item.text}
            onChange={(e) => handleCheckboxItemChange(index, e.target.value)}
            placeholder="Checkbox item"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={() => handleRemoveCheckboxItem(index)}
            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Remove
          </button>
        </div>
      ))}
      <button onClick={handleAddCheckboxItem} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Add Checkbox Item
      </button>
    </div>
  )
}

export default CheckboxNoteEditor
