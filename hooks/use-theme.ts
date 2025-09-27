"use client"

import { useEffect, useState } from "react"
import type { Theme } from "@/types/theme"
import { useTheme } from "@/hooks/use-theme"

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    // Get theme from localStorage or default to dark
    const savedTheme = localStorage.getItem("hackademia-theme") as Theme
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute("data-theme", savedTheme)
    } else {
      document.documentElement.setAttribute("data-theme", "dark")
    }
  }, [])

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem("hackademia-theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  return {
    theme,
    setTheme: changeTheme,
    themes: ["dark", "light", "cyberpunk-neon", "cyberpunk-orange"] as const,
  }
}
