"use client"

import type React from "react"
import { useState } from "react"
import type { Note } from "../types"

interface SimpleNoteEditorProps {
  note: Note
  onUpdate: (updatedNote: Note) => void
}

const SimpleNoteEditor: React.FC<SimpleNoteEditorProps> = ({ note, onUpdate }) => {
  const [content, setContent] = useState(note.content || "")

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
    onUpdate({ ...note, content: event.target.value })
  }

  return (
    <textarea
      value={content}
      onChange={handleContentChange}
      placeholder="Note content"
      className="w-full p-2 border rounded h-40"
    />
  )
}

export default SimpleNoteEditor
