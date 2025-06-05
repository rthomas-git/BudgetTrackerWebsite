"use client"

import type React from "react"

import "./globals.css"
import { Inter } from "next/font/google"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Home, Book, Wrench, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Settings } from "@/components/Settings"
import { useState, useEffect } from "react"
import { BudgetProvider } from "@/contexts/BudgetContext"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

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

function NavItem({ href, icon: Icon, children, onClick = null }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      className={cn("h-10 w-full justify-start", isActive && "bg-black text-white hover:bg-black/90")}
      asChild
      onClick={onClick}
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setCurrentMonthAndYear(getCurrentMonthAndYear())

    // Check if we're on mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <BudgetProvider>
          <PathNameWrapper>
            {(pathname) => (
              <div className="flex flex-col h-screen bg-background text-foreground">
                <header className="border-b">
                  <div className="flex items-center justify-between w-full px-4 py-2">
                    <div className="flex items-center">
                      <h1 className="text-xl md:text-2xl font-bold">BudgetCraft.</h1>

                      {/* Desktop Navigation */}
                      <nav className="hidden md:flex ml-4 space-x-2">
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

                      {/* Mobile Navigation */}
                      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild className="md:hidden ml-2">
                          <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                          <div className="py-4">
                            <h2 className="text-lg font-bold mb-4">Menu</h2>
                            <div className="space-y-2">
                              <NavItem href="/" icon={Home} onClick={() => setIsMobileMenuOpen(false)}>
                                Overview
                              </NavItem>
                              <NavItem href="/journal" icon={Book} onClick={() => setIsMobileMenuOpen(false)}>
                                My Journal
                              </NavItem>
                              <NavItem href="/tools" icon={Wrench} onClick={() => setIsMobileMenuOpen(false)}>
                                Tools
                              </NavItem>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </div>
                    <div>
                      <Settings />
                    </div>
                  </div>
                </header>
                <main className="flex-1 overflow-auto">
                  <div className="max-w-[1920px] w-full mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6">
                    <div className="mb-4 md:mb-6">
                      <h1 className="text-2xl md:text-3xl font-bold">
                        {pathname === "/journal"
                          ? "My Journal"
                          : pathname === "/tools"
                            ? "Financial Tools"
                            : "Financial Overview"}
                      </h1>
                      <p className="text-lg md:text-xl text-muted-foreground mt-1 md:mt-2">{currentMonthAndYear}</p>
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
