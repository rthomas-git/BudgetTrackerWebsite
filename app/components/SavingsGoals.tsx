"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function SavingsGoals() {
  const [goals /* setGoals */] = useState([
    // Removed setGoals
    { name: "Emergency Fund", target: 10000, current: 5000 },
    { name: "Vacation", target: 5000, current: 2000 },
    { name: "New Car", target: 20000, current: 8000 },
  ])

  return (
    <div className="space-y-4">
      {goals.map((goal, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{goal.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={(goal.current / goal.target) * 100} />
            <div className="mt-2 flex justify-between text-sm">
              <span>${goal.current}</span>
              <span>${goal.target}</span>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button>Add Savings Goal</Button>
    </div>
  )
}
