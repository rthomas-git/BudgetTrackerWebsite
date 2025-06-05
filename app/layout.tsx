import type React from "react"
import ClientLayout from "./clientLayout"

export const metadata = {
  title: "Financial Overview",
  description: "Track your income, expenses, and savings goals",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'