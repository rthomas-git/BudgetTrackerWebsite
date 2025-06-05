"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
}

interface NotepadProps {
  notes: Note[]
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
}

export function Notepad({ notes, onEdit, onDelete }: NotepadProps) {
  return (
    <ScrollArea className="h-[calc(100vh-200px)] pr-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {notes.map((note) => (
          <Card key={note.id} className="flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle className="text-lg">{note.title}</CardTitle>
              <CardDescription>{new Date(note.createdAt).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
              <p className="text-sm line-clamp-4">{note.content}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="icon" onClick={() => onEdit(note)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => onDelete(note.id)}>
                <Trash className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}
