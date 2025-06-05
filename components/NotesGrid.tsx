"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Pin, PinOff, Edit2, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label" // Import Label component
import Masonry from "react-masonry-css"
import "./NotesGrid.css"

// Define storage keys and utilities directly in this file
const STORAGE_KEYS = {
  NOTES: "budgetcraft-notes",
  TAGS: "budgetcraft-tags",
}

// Helper functions for localStorage
const saveToStorage = <T,>(key: string, data: T): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error)
    }
  }
}

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window !== "undefined") {
    try {
      const storedValue = localStorage.getItem(key)
      return storedValue ? JSON.parse(storedValue) : defaultValue
    } catch (error) {
      console.error(`Error retrieving from localStorage (${key}):`, error)
      return defaultValue
    }
  }
  return defaultValue
}

interface Note {
  id: number
  title: string
  content: string
  color: string
  isPinned: boolean
  type: "text" | "checkbox" | "bullet-list" | "number-list" | "budget-list"
  tags: string[]
  keyValuePairs?: { key: string; value: string }[]
}

const COLORS = [
  "#ffffff",
  "#f28b82",
  "#fbbc04",
  "#fff475",
  "#ccff90",
  "#a7ffeb",
  "#cbf0f8",
  "#aecbfa",
  "#d7aefb",
  "#fdcfe8",
  "#e6c9a8",
  "#e8eaed",
]

export function Notepad() {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    color: COLORS[0],
    type: "text" as const,
    tags: [],
    listItems: [""],
    keyValuePairs: [{ key: "", value: "" }],
  })
  const emptyNote: Note = { id: 0, title: "", content: "", color: COLORS[0], isPinned: false, type: "text", tags: [] }
  const [editingNote, setEditingNote] = useState<Note>(emptyNote)
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false)
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [editingTagName, setEditingTagName] = useState<string | null>(null)

  useEffect(() => {
    const savedNotes = getFromStorage<Note[]>(STORAGE_KEYS.NOTES, [])
    const savedTags = getFromStorage<string[]>(STORAGE_KEYS.TAGS, [])

    setNotes(savedNotes)
    setTags(savedTags)
  }, [])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.NOTES, notes)
  }, [notes])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TAGS, tags)
  }, [tags])

  const addNote = () => {
    if (
      newNote.title ||
      newNote.content ||
      newNote.listItems.some((item) => item.trim() !== "") ||
      newNote.keyValuePairs.some((pair) => pair.key.trim() !== "" || pair.value.trim() !== "")
    ) {
      let content = newNote.content
      if (newNote.type === "checkbox" || newNote.type === "bullet-list" || newNote.type === "number-list") {
        content = newNote.listItems.join("\n")
      } else if (newNote.type === "budget-list") {
        content = JSON.stringify(newNote.keyValuePairs)
      }
      setNotes([...notes, { ...newNote, id: Date.now(), isPinned: false, content }])
      setNewNote({
        title: "",
        content: "",
        color: COLORS[0],
        type: "text",
        tags: [],
        listItems: [""],
        keyValuePairs: [{ key: "", value: "" }],
      })
      setIsAddNoteOpen(false)
    }
  }

  const updateNote = () => {
    if (editingNote.id !== 0) {
      setNotes(notes.map((note) => (note.id === editingNote.id ? editingNote : note)))
      setEditingNote(emptyNote)
      setIsEditNoteOpen(false)
    }
  }

  const deleteNote = (id: number) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  const togglePin = (id: number) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, isPinned: !note.isPinned } : note)))
  }

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
    setNotes(
      notes.map((note) => ({
        ...note,
        tags: note.tags.filter((tag) => tag !== tagToRemove),
      })),
    )
  }

  const editTag = (oldTag: string, newTag: string) => {
    if (newTag && newTag !== oldTag) {
      const updatedTags = tags.map((tag) => (tag === oldTag ? newTag : tag))
      setTags(updatedTags)
      setNotes(
        notes.map((note) => ({
          ...note,
          tags: note.tags.map((tag) => (tag === oldTag ? newTag : tag)),
        })),
      )
      if (selectedTag === oldTag) {
        setSelectedTag(newTag)
      }
    } else if (!newTag) {
      deleteTag(oldTag)
    }
  }

  const deleteTag = (tagToDelete: string) => {
    setTags(tags.filter((tag) => tag !== tagToDelete))
    setNotes(
      notes.map((note) => ({
        ...note,
        tags: note.tags.includes(tagToDelete) ? note.tags.filter((tag) => tag !== tagToDelete) : note.tags,
      })),
    )
    if (selectedTag === tagToDelete) {
      setSelectedTag(null)
    }
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag =
      selectedTag === null ||
      (selectedTag === "pinned" ? note.isPinned : note.tags.includes(selectedTag) || note.tags.length === 0)
    return matchesSearch && matchesTag
  })

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Notepad</h2>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select
            value={selectedTag || "all"}
            onValueChange={(value) => setSelectedTag(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter notes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pinned">Pinned</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Note</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Note Title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
                {newNote.type === "budget-list" && (
                  <div className="space-y-2">
                    {newNote.keyValuePairs.map((pair, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder="Key"
                          value={pair.key}
                          onChange={(e) => {
                            const newPairs = [...newNote.keyValuePairs]
                            newPairs[index].key = e.target.value
                            setNewNote({ ...newNote, keyValuePairs: newPairs })
                          }}
                        />
                        <Input
                          placeholder="Value"
                          type="number"
                          value={pair.value}
                          onChange={(e) => {
                            const newPairs = [...newNote.keyValuePairs]
                            newPairs[index].value = e.target.value
                            setNewNote({ ...newNote, keyValuePairs: newPairs })
                          }}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newPairs = newNote.keyValuePairs.filter((_, i) => i !== index)
                            setNewNote({ ...newNote, keyValuePairs: newPairs })
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={() =>
                        setNewNote({ ...newNote, keyValuePairs: [...newNote.keyValuePairs, { key: "", value: "" }] })
                      }
                    >
                      Add Item
                    </Button>
                    <div className="mt-2">
                      <Label>Total</Label>
                      <div className="text-lg font-semibold">
                        ${newNote.keyValuePairs.reduce((sum, pair) => sum + Number(pair.value || 0), 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
                {newNote.type === "text" ? (
                  <Textarea
                    placeholder="Note Content"
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  />
                ) : (
                  <div className="space-y-2">
                    {newNote.listItems.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {newNote.type === "checkbox" && <Checkbox id={`item-${index}`} />}
                        {newNote.type === "bullet-list" && <span className="text-xl">•</span>}
                        {newNote.type === "number-list" && <span className="text-sm font-medium">{index + 1}.</span>}
                        <Input
                          value={item}
                          onChange={(e) => {
                            const newItems = [...newNote.listItems]
                            newItems[index] = e.target.value
                            setNewNote({ ...newNote, listItems: newItems })
                          }}
                        />
                      </div>
                    ))}
                    <Button onClick={() => setNewNote({ ...newNote, listItems: [...newNote.listItems, ""] })}>
                      Add Item
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full border-2 ${newNote.color === color ? "border-black" : "border-transparent"}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewNote({ ...newNote, color })}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={newNote.type === "text" ? "default" : "outline"}
                    onClick={() => setNewNote({ ...newNote, type: "text" })}
                  >
                    Text
                  </Button>
                  <Button
                    variant={newNote.type === "checkbox" ? "default" : "outline"}
                    onClick={() => setNewNote({ ...newNote, type: "checkbox", content: "", listItems: [""] })}
                  >
                    Checkbox
                  </Button>
                  <Button
                    variant={newNote.type === "bullet-list" ? "default" : "outline"}
                    onClick={() => setNewNote({ ...newNote, type: "bullet-list", content: "", listItems: [""] })}
                  >
                    Bullet List
                  </Button>
                  <Button
                    variant={newNote.type === "number-list" ? "default" : "outline"}
                    onClick={() => setNewNote({ ...newNote, type: "number-list", content: "", listItems: [""] })}
                  >
                    Number List
                  </Button>
                  <Button
                    variant={newNote.type === "budget-list" ? "default" : "outline"}
                    onClick={() =>
                      setNewNote({
                        ...newNote,
                        type: "budget-list",
                        content: "",
                        listItems: [""],
                        keyValuePairs: [{ key: "", value: "" }],
                      })
                    }
                  >
                    Budget List
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={newNote.tags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          if (newNote.tags.includes(tag)) {
                            setNewNote({ ...newNote, tags: newNote.tags.filter((t) => t !== tag) })
                          } else {
                            setNewNote({ ...newNote, tags: [...newNote.tags, tag] })
                          }
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input placeholder="New tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} />
                    <Button onClick={addTag}>Add Tag</Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addNote}>Add Note</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {selectedTag === null ? "All Notes" : selectedTag === "pinned" ? "Pinned Notes" : `${selectedTag} Notes`}
        </h3>
        {selectedTag && selectedTag !== "pinned" && (
          <div className="flex items-center space-x-2">
            {editingTagName !== null ? (
              <>
                <Input
                  value={editingTagName}
                  onChange={(e) => setEditingTagName(e.target.value)}
                  className="w-32"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (editingTagName && editingTagName !== selectedTag) {
                        editTag(selectedTag, editingTagName)
                        setSelectedTag(editingTagName)
                      }
                      setEditingTagName(null)
                    } else if (e.key === "Escape") {
                      setEditingTagName(null)
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (editingTagName && editingTagName !== selectedTag) {
                      editTag(selectedTag, editingTagName)
                      setSelectedTag(editingTagName)
                    }
                    setEditingTagName(null)
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setEditingTagName(selectedTag)}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteTag(selectedTag)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {filteredNotes.map((note) => (
          <div key={note.id}>
            <NoteCard
              note={note}
              onEdit={() => {
                setEditingNote({ ...note })
                setIsEditNoteOpen(true)
              }}
              onDelete={deleteNote}
              onTogglePin={togglePin}
            />
          </div>
        ))}
      </Masonry>

      <Dialog open={isEditNoteOpen} onOpenChange={setIsEditNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Note Title"
              value={editingNote.title}
              onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
            />
            {editingNote.type === "text" ? (
              <Textarea
                placeholder="Note Content"
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
              />
            ) : (
              <div className="space-y-2">
                {editingNote.content.split("\n").map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox id={`edit-item-${index}`} />
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newContent = editingNote.content.split("\n")
                        newContent[index] = e.target.value
                        setEditingNote({ ...editingNote, content: newContent.join("\n") })
                      }}
                    />
                  </div>
                ))}
                <Button onClick={() => setEditingNote({ ...editingNote, content: editingNote.content + "\n" })}>
                  Add Item
                </Button>
              </div>
            )}
            {editingNote.type === "budget-list" && (
              <div className="space-y-2">
                {JSON.parse(editingNote.content).map((pair: { key: string; value: string }, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder="Key"
                      value={pair.key}
                      onChange={(e) => {
                        const newContent = JSON.parse(editingNote.content)
                        newContent[index].key = e.target.value
                        setEditingNote({ ...editingNote, content: JSON.stringify(newContent) })
                      }}
                    />
                    <Input
                      placeholder="Value"
                      value={pair.value}
                      onChange={(e) => {
                        const newContent = JSON.parse(editingNote.content)
                        newContent[index].value = e.target.value
                        setEditingNote({ ...editingNote, content: JSON.stringify(newContent) })
                      }}
                    />
                  </div>
                ))}
                <Button
                  onClick={() => {
                    const newContent = JSON.parse(editingNote.content)
                    newContent.push({ key: "", value: "" })
                    setEditingNote({ ...editingNote, content: JSON.stringify(newContent) })
                  }}
                >
                  Add Key-Value Pair
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 ${editingNote.color === color ? "border-black" : "border-transparent"}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setEditingNote({ ...editingNote, color })}
                />
              ))}
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={editingNote.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (editingNote.tags.includes(tag)) {
                        setEditingNote({ ...editingNote, tags: editingNote.tags.filter((t) => t !== tag) })
                      } else {
                        setEditingNote({ ...editingNote, tags: [...editingNote.tags, tag] })
                      }
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <Input placeholder="New tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} />
                <Button onClick={addTag}>Add Tag</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={updateNote}>Update Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}: { note: Note; onEdit: () => void; onDelete: (id: number) => void; onTogglePin: (id: number) => void }) {
  return (
    <Card style={{ backgroundColor: note.color }}>
      <CardContent className="pt-6 break-words">
        <h3 className="font-semibold mb-2">{note.title}</h3>
        {note.type === "text" ? (
          <p className="text-sm whitespace-pre-wrap break-words">{note.content}</p>
        ) : note.type === "budget-list" ? (
          <div className="space-y-1 break-words">
            {JSON.parse(note.content).map((pair: { key: string; value: string }, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="font-medium break-words">{pair.key}:</span>
                <span className="break-words">${Number(pair.value).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-1 mt-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>Total:</span>
                <span>
                  $
                  {JSON.parse(note.content)
                    .reduce((sum: number, pair: { value: string }) => sum + Number(pair.value || 0), 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="break-words">
            {note.content.split("\n").map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                {note.type === "checkbox" && <Checkbox id={`note-${note.id}-item-${index}`} />}
                {note.type === "bullet-list" && <span className="text-xl">•</span>}
                {note.type === "number-list" && <span className="text-sm font-medium">{index + 1}.</span>}
                <span className="text-sm break-words">{item}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="ghost" size="icon" onClick={() => onTogglePin(note.id)}>
          {note.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(note.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
