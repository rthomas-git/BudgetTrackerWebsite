"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { YearTimeline } from "@/components/YearTimeline"
import { MoneyTips } from "@/components/MoneyTips"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Notepad } from "@/components/NotesGrid"
import { JournalExpandableActions } from "@/components/JournalExpandableActions"
import type { Goal } from "@/components/Goal"

export default function JournalPage() {
  const [goalProgress, setGoalProgress] = useState({
    completed: 0,
    inProgress: 0,
  })
  const [goals, setGoals] = useState<{ [month: string]: Goal[] }>({})

  return (
    <div className="container mx-auto p-4 space-y-6 relative">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center rounded-lg">
        <h2 className="text-4xl font-bold text-white mb-2">Coming Soon</h2>
        <p className="text-white/80 text-lg">We're working on something amazing!</p>
      </div>

      {/* Original content (dimmed by overlay) */}
      <Tabs defaultValue="journal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="journal"
            className="data-[state=active]:bg-black data-[state=active]:text-white rounded-md"
          >
            Goals
          </TabsTrigger>
          <TabsTrigger
            value="notepad"
            className="data-[state=active]:bg-black data-[state=active]:text-white rounded-md"
          >
            Notepad
          </TabsTrigger>
        </TabsList>
        <TabsContent value="journal">
          <Card>
            <CardContent className="pt-6">
              <YearTimeline
                goalProgress={goalProgress}
                setGoalProgress={setGoalProgress}
                goals={goals}
                setGoals={setGoals}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notepad">
          <Card>
            <CardContent className="pt-6">
              <Notepad />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent>
          <MoneyTips />
        </CardContent>
      </Card>

      <JournalExpandableActions />
    </div>
  )
}

