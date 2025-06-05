"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash } from "lucide-react"

interface Goal {
  id: number
  title: string
  targetDate: string
  progress: number
}

export function GoalList() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState({ title: "", targetDate: "", progress: 0 })
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const addGoal = () => {
    if (newGoal.title && newGoal.targetDate) {
      setGoals([...goals, { ...newGoal, id: Date.now() }])
      setNewGoal({ title: "", targetDate: "", progress: 0 })
    }
  }

  const updateGoal = () => {
    if (editingGoal) {
      setGoals(goals.map((goal) => (goal.id === editingGoal.id ? editingGoal : goal)))
      setEditingGoal(null)
    }
  }

  const deleteGoal = (id: number) => {
    setGoals(goals.filter((goal) => goal.id !== id))
  }

  return (
    <div className="space-y-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Goal
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
            <DialogDescription>Create a new goal with a target date.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="targetDate" className="text-right">
                Target Date
              </Label>
              <Input
                id="targetDate"
                type="date"
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addGoal}>Add Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {goals.map((goal) => (
        <Card key={goal.id}>
          <CardHeader>
            <CardTitle>{goal.title}</CardTitle>
            <CardDescription>Target Date: {goal.targetDate}</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={goal.progress} className="w-full" />
            <p className="text-sm text-gray-500 mt-2">Progress: {goal.progress}%</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setEditingGoal(goal)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Goal</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="edit-title"
                      value={editingGoal?.title}
                      onChange={(e) => setEditingGoal(editingGoal ? { ...editingGoal, title: e.target.value } : null)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-targetDate" className="text-right">
                      Target Date
                    </Label>
                    <Input
                      id="edit-targetDate"
                      type="date"
                      value={editingGoal?.targetDate}
                      onChange={(e) =>
                        setEditingGoal(editingGoal ? { ...editingGoal, targetDate: e.target.value } : null)
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-progress" className="text-right">
                      Progress
                    </Label>
                    <Input
                      id="edit-progress"
                      type="number"
                      min="0"
                      max="100"
                      value={editingGoal?.progress}
                      onChange={(e) =>
                        setEditingGoal(editingGoal ? { ...editingGoal, progress: Number(e.target.value) } : null)
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={updateGoal}>Update Goal</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" onClick={() => deleteGoal(goal.id)}>
              <Trash className="mr-2 h-4 w-4" /> Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
