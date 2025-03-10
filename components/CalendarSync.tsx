"use client"

import { useState } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

import "react-big-calendar/lib/css/react-big-calendar.css"

moment.locale("en-GB")
const localizer = momentLocalizer(moment)

interface Goal {
  id: string
  title: string
  description: string
  completed: boolean
  category: string
  month: string
  targetDate: string
}

interface CalendarSyncProps {
  goals: { [month: string]: Goal[] }
}

export function CalendarSync({ goals }: CalendarSyncProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const formatGoalsForCalendar = () => {
    return Object.values(goals)
      .flat()
      .map((goal) => ({
        title: goal.title,
        start: new Date(goal.targetDate),
        end: new Date(goal.targetDate),
        allDay: true,
      }))
  }

  const handleSync = async () => {
    setIsSyncing(true)
    // Simulating API call to sync with calendar
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSyncing(false)
    setIsOpen(false)
    toast({
      title: "Goals Synced",
      description: "Your goals have been successfully synced with your calendar.",
    })
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Sync Goals with Calendar</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Sync Goals with Calendar</DialogTitle>
            <DialogDescription>
              Review your goals and sync them with your calendar. This will add your goal target dates to your connected
              calendar.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[400px] mt-4">
            <Calendar
              localizer={localizer}
              events={formatGoalsForCalendar()}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Sync with Calendar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

