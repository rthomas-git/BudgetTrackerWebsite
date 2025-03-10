"use client"

import type React from "react"

import "./globals.css"
import { Inter } from "next/font/google"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Home, Book, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Settings } from "@/components/Settings"
import { useState, useEffect } from "react"
import { BudgetProvider } from "@/contexts/BudgetContext"

const inter = Inter({ subsets: ["latin"] })

function getCurrentMonthAndYear() {
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
  const now = new Date()
  return `${months[now.getMonth()]} ${now.getFullYear()}`
}

function NavItem({ href, icon: Icon, children }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      className={cn("h-10", isActive && "bg-black text-white hover:bg-black/90")}
      asChild
    >
      <Link href={href}>
        <Icon className="mr-2 h-4 w-4" />
        {children}
      </Link>
    </Button>
  )
}

const PathNameWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  return children(pathname)
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [currentMonthAndYear, setCurrentMonthAndYear] = useState("")

  useEffect(() => {
    setCurrentMonthAndYear(getCurrentMonthAndYear())
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <BudgetProvider>
          <PathNameWrapper>
            {(pathname) => (
              <div className="flex flex-col h-screen bg-background text-foreground">
                <header className="border-b">
                  <div className="container mx-auto px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h1 className="text-2xl font-bold">BudgetCraft.</h1>
                      <nav className="flex space-x-2">
                        <NavItem href="/" icon={Home}>
                          Overview
                        </NavItem>
                        <NavItem href="/journal" icon={Book}>
                          My Journal
                        </NavItem>
                        <NavItem href="/tools" icon={Wrench}>
                          Tools
                        </NavItem>
                      </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Settings />
                    </div>
                  </div>
                </header>
                <main className="flex-1 overflow-auto">
                  <div className="container mx-auto px-4 py-6">
                    <div className="mb-6">
                      <h1 className="text-3xl font-bold">
                        {pathname === "/journal"
                          ? "My Journal"
                          : pathname === "/tools"
                            ? "Financial Tools"
                            : "Financial Overview"}
                      </h1>
                      <p className="text-xl text-muted-foreground mt-2">{currentMonthAndYear}</p>
                    </div>
                    {children}
                  </div>
                </main>
              </div>
            )}
          </PathNameWrapper>
        </BudgetProvider>
      </body>
    </html>
  )
}

