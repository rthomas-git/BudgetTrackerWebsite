"use client"

import type React from "react"
import { useState } from "react"
import { type Note, NoteType } from "../types"
import CheckboxNoteEditor from "./CheckboxNoteEditor"
import BudgetListNoteEditor from "./BudgetListNoteEditor"
import SimpleNoteEditor from "./SimpleNoteEditor"

interface JournalNoteEditorProps {
  note: Note
  onUpdate: (updatedNote: Note) => void
}

const JournalNoteEditor: React.FC<JournalNoteEditorProps> = ({ note, onUpdate }) => {
  const [title, setTitle] = useState(note.title)

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
    onUpdate({ ...note, title: event.target.value })
  }

  const renderNoteEditor = () => {
    switch (note.type) {
      case NoteType.CHECKBOX:
        return <CheckboxNoteEditor note={note} onUpdate={onUpdate} />
      case NoteType.BUDGET_LIST:
        return <BudgetListNoteEditor note={note} onUpdate={onUpdate} />
      default:
        return <SimpleNoteEditor note={note} onUpdate={onUpdate} />
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Title"
        className="w-full p-2 border rounded"
      />
      {renderNoteEditor()}
    </div>
  )
}

export default JournalNoteEditor

