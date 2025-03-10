"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, CheckCircle2, Circle, Edit, Trash2, Calendar } from "lucide-react"
import { format } from "date-fns"
import confetti from "canvas-confetti"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Goal {
  id: string
  title: string
  description: string
  completed: boolean
  category: string
  month: string
  targetDate: string
}

interface MonthGoals {
  [key: string]: Goal[]
}

interface YearTimelineProps {
  goals: MonthGoals
  setGoals: React.Dispatch<React.SetStateAction<MonthGoals>>
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const categories = ["Personal", "Professional", "Financial", "Health"]

const categoryColors: { [key: string]: string } = {
  Personal: "bg-blue-500",
  Professional: "bg-green-500",
  Financial: "bg-yellow-500",
  Health: "bg-red-500",
}

type ViewMode = "monthly" | "12months"

export function YearTimeline({ goals, setGoals }: YearTimelineProps) {
  const [viewMode, setViewMode] = useState<"monthly" | "12months">("monthly")
  const [selectedMonth, setSelectedMonth] = useState<string>(months[new Date().getMonth()])
  const [newGoal, setNewGoal] = useState<Omit<Goal, "id">>({
    title: "",
    description: "",
    completed: false,
    category: "Personal",
    month: selectedMonth,
    targetDate: format(new Date(), "yyyy-MM-dd"),
  })
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const handleAddGoal = () => {
    if (newGoal.title) {
      const updatedGoals = { ...goals }
      const newGoalWithId: Goal = {
        ...newGoal,
        id: Date.now().toString(),
      }

      if (!updatedGoals[newGoal.month]) {
        updatedGoals[newGoal.month] = []
      }
      updatedGoals[newGoal.month].push(newGoalWithId)
      setGoals(updatedGoals)
      setNewGoal({
        title: "",
        description: "",
        completed: false,
        category: "Personal",
        month: selectedMonth,
        targetDate: format(new Date(), "yyyy-MM-dd"),
      })
      setIsAddingGoal(false)
    }
  }

  const handleToggleCompletion = (monthKey: string, goalId: string) => {
    const updatedGoals = { ...goals }
    const goalIndex = updatedGoals[monthKey].findIndex((goal) => goal.id === goalId)
    if (goalIndex !== -1) {
      updatedGoals[monthKey][goalIndex].completed = !updatedGoals[monthKey][goalIndex].completed
      setGoals(updatedGoals)

      if (updatedGoals[monthKey][goalIndex].completed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    }
  }

  const handleEditGoal = () => {
    if (editingGoal) {
      const updatedGoals = { ...goals }
      const goalIndex = updatedGoals[editingGoal.month].findIndex((goal) => goal.id === editingGoal.id)
      if (goalIndex !== -1) {
        updatedGoals[editingGoal.month][goalIndex] = editingGoal
        setGoals(updatedGoals)
        setEditingGoal(null)
      }
    }
  }

  const handleDeleteGoal = () => {
    if (editingGoal) {
      const updatedGoals = { ...goals }
      updatedGoals[editingGoal.month] = updatedGoals[editingGoal.month].filter((goal) => goal.id !== editingGoal.id)
      setGoals(updatedGoals)
      setEditingGoal(null)
    }
  }

  const renderGoalCard = (goal: Goal) => (
    <Card key={goal.id} className="mb-4 hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className={`w-3 h-3 rounded-full mr-2 ${categoryColors[goal.category]}`}></span>
          {goal.title}

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setEditingGoal(goal)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleToggleCompletion(goal.month, goal.id)}>
              {goal.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-blue-500" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
        <p className="text-xs text-muted-foreground">Target Date: {goal.targetDate}</p>
        {viewMode !== "monthly" && <p className="text-xs text-muted-foreground mt-1">{goal.month}</p>}
      </CardContent>
    </Card>
  )

  const getVisibleMonths = () => {
    if (viewMode === "monthly") {
      return [selectedMonth]
    } else {
      return months
    }
  }

  const renderGoals = (isCompleted: boolean) => {
    const visibleMonths = getVisibleMonths()
    const filteredGoals = visibleMonths.flatMap((month) =>
      (goals[month] || []).filter((goal) => goal.completed === isCompleted),
    )

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{isCompleted ? "Completed Goals" : "In Progress"}</h3>
        {filteredGoals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No goals {isCompleted ? "completed" : "in progress"} yet.</p>
        ) : (
          filteredGoals.map(renderGoalCard)
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span>{viewMode === "monthly" ? `${selectedMonth} Goals` : "Full Year Goals"}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    {viewMode === "monthly" ? selectedMonth : "Full Year"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Choose a month</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {months.map((month) => (
                    <DropdownMenuRadioItem
                      key={month}
                      value={month}
                      onSelect={() => {
                        setSelectedMonth(month)
                        setViewMode("monthly")
                      }}
                    >
                      {month}
                    </DropdownMenuRadioItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioItem value="full-year" onSelect={() => setViewMode("12months")}>
                    Full Year
                  </DropdownMenuRadioItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setIsAddingGoal(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Goal
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-4 rounded-md">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-black data-[state=active]:text-white rounded-md"
              >
                All
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-black data-[state=active]:text-white rounded-md"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            {["all", ...categories].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-6">
                {renderGoals(false)}
                {renderGoals(true)}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Entry Title</Label>
              <Input
                id="title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="Enter your goal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="Describe your goal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select value={newGoal.month} onValueChange={(value) => setNewGoal({ ...newGoal, month: value })}>
                <SelectTrigger id="month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
              />
            </div>
            <Button onClick={handleAddGoal}>Add Goal</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Entry Title</Label>
              <Input
                id="edit-title"
                value={editingGoal?.title || ""}
                onChange={(e) => setEditingGoal(editingGoal ? { ...editingGoal, title: e.target.value } : null)}
                placeholder="Enter your goal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editingGoal?.description || ""}
                onChange={(e) => setEditingGoal(editingGoal ? { ...editingGoal, description: e.target.value } : null)}
                placeholder="Describe your goal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={editingGoal?.category || ""}
                onValueChange={(value) => setEditingGoal(editingGoal ? { ...editingGoal, category: value } : null)}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-month">Month</Label>
              <Select
                value={editingGoal?.month || ""}
                onValueChange={(value) => setEditingGoal(editingGoal ? { ...editingGoal, month: value } : null)}
              >
                <SelectTrigger id="edit-month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-targetDate">Target Date</Label>
              <Input
                id="edit-targetDate"
                type="date"
                value={editingGoal?.targetDate || ""}
                onChange={(e) => setEditingGoal(editingGoal ? { ...editingGoal, targetDate: e.target.value } : null)}
              />
            </div>
            <div className="flex justify-between">
              <Button onClick={handleEditGoal}>Save Changes</Button>
              <Button variant="destructive" onClick={handleDeleteGoal}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Goal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

