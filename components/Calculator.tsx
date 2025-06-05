"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Percent, X } from "lucide-react"

export default function Calculator({ onClose }: { onClose: () => void }) {
  const [display, setDisplay] = useState("0")
  const [equation, setEquation] = useState("")
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const calculatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.x
        const dy = e.clientY - dragStart.y
        setPosition((prevPosition) => ({
          x: prevPosition.x + dx,
          y: prevPosition.y + dy,
        }))
        setDragStart({ x: e.clientX, y: e.clientY })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragStart])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    })
  }

  const handleClick = (value: string) => {
    if (display === "0" && value !== ".") {
      setDisplay(value)
    } else {
      setDisplay(display + value)
    }
    setEquation(equation + value)
  }

  const handleClear = () => {
    setDisplay("0")
    setEquation("")
  }

  const handleCalculate = () => {
    try {
      const result = eval(equation)
      setDisplay(result.toString())
      setEquation(result.toString())
    } catch (error) {
      setDisplay("Error")
    }
  }

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
      setEquation(equation.slice(0, -1))
    } else {
      setDisplay("0")
      setEquation("")
    }
  }

  const handlePercent = () => {
    try {
      const result = eval(equation) / 100
      setDisplay(result.toString())
      setEquation(result.toString())
    } catch (error) {
      setDisplay("Error")
    }
  }

  return (
    <div
      ref={calculatorRef}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      className="w-64 shadow-lg"
    >
      <Card>
        <CardHeader
          className="cursor-move p-2 flex flex-row items-center justify-between"
          onMouseDown={handleMouseDown}
        >
          <CardTitle className="text-sm">Calculator</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-2">
          <div className="bg-secondary p-2 mb-2 text-right rounded">{display}</div>
          <div className="grid grid-cols-4 gap-1">
            <Button variant="secondary" onClick={handleClear}>
              C
            </Button>
            <Button variant="secondary" onClick={handleBackspace}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" onClick={handlePercent}>
              <Percent className="h-4 w-4" />
            </Button>
            <Button variant="secondary" onClick={() => handleClick("/")}>
              ÷
            </Button>
            <Button variant="secondary" onClick={() => handleClick("7")}>
              7
            </Button>
            <Button variant="secondary" onClick={() => handleClick("8")}>
              8
            </Button>
            <Button variant="secondary" onClick={() => handleClick("9")}>
              9
            </Button>
            <Button variant="secondary" onClick={() => handleClick("*")}>
              ×
            </Button>
            <Button variant="secondary" onClick={() => handleClick("4")}>
              4
            </Button>
            <Button variant="secondary" onClick={() => handleClick("5")}>
              5
            </Button>
            <Button variant="secondary" onClick={() => handleClick("6")}>
              6
            </Button>
            <Button variant="secondary" onClick={() => handleClick("-")}>
              -
            </Button>
            <Button variant="secondary" onClick={() => handleClick("1")}>
              1
            </Button>
            <Button variant="secondary" onClick={() => handleClick("2")}>
              2
            </Button>
            <Button variant="secondary" onClick={() => handleClick("3")}>
              3
            </Button>
            <Button variant="secondary" onClick={() => handleClick("+")}>
              +
            </Button>
            <Button variant="secondary" onClick={() => handleClick("0")}>
              0
            </Button>
            <Button variant="secondary" onClick={() => handleClick(".")}>
              .
            </Button>
            <Button variant="default" className="col-span-2" onClick={handleCalculate}>
              =
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
