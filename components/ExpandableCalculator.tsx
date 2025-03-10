"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp, X, CalculatorIcon, Percent } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Calculator from "@/components/Calculator"
import InterestCalculator from "@/components/InterestCalculator"

export function ExpandableCalculator() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeCalculator, setActiveCalculator] = useState<"standard" | "interest" | null>(null)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      setActiveCalculator(null)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-2 flex flex-col space-y-2"
          >
            <Button
              className="rounded-full w-12 h-12 p-0 shadow-lg bg-black text-white hover:bg-black/90"
              onClick={() => setActiveCalculator("standard")}
            >
              <CalculatorIcon className="h-6 w-6" />
            </Button>
            <Button
              className="rounded-full w-12 h-12 p-0 shadow-lg bg-black text-white hover:bg-black/90"
              onClick={() => setActiveCalculator("interest")}
            >
              <Percent className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        className="rounded-full w-12 h-12 p-0 shadow-lg bg-black text-white hover:bg-black/90"
        onClick={toggleExpand}
      >
        {isExpanded ? <X className="h-6 w-6" /> : <ChevronUp className="h-6 w-6" />}
      </Button>
      {activeCalculator === "standard" && (
        <div className="absolute bottom-16 right-0">
          <Calculator onClose={() => setActiveCalculator(null)} />
        </div>
      )}
      {activeCalculator === "interest" && (
        <div className="absolute bottom-16 right-0">
          <InterestCalculator onClose={() => setActiveCalculator(null)} />
        </div>
      )}
    </div>
  )
}

