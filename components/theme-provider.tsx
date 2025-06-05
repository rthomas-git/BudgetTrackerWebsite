"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

// Define theme storage key directly in this file
const THEME_STORAGE_KEY = "budgetcraft-theme"

// Update the ThemeProvider component to use our localStorage key
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider storageKey={THEME_STORAGE_KEY} {...props}>
      {children}
    </NextThemesProvider>
  )
}
