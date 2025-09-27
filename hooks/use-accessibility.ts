"use client"

import { useState, useEffect } from "react"

interface AccessibilitySettings {
  highContrast: boolean
  reducedMotion: boolean
  fontSize: "small" | "medium" | "large"
  screenReader: boolean
}

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    reducedMotion: false,
    fontSize: "medium",
    screenReader: false,
  })

  useEffect(() => {
    // Check for system preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const prefersHighContrast = window.matchMedia("(prefers-contrast: high)").matches

    // Check for screen reader
    const hasScreenReader =
      window.navigator.userAgent.includes("NVDA") ||
      window.navigator.userAgent.includes("JAWS") ||
      window.speechSynthesis !== undefined

    setSettings((prev) => ({
      ...prev,
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast,
      screenReader: hasScreenReader,
    }))

    // Load saved preferences
    const saved = localStorage.getItem("accessibility-settings")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings((prev) => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error("Failed to parse accessibility settings:", error)
      }
    }
  }, [])

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem("accessibility-settings", JSON.stringify(updated))

      // Apply theme changes
      if (updated.highContrast) {
        document.documentElement.setAttribute("data-theme", "high-contrast")
      }

      // Apply font size changes
      document.documentElement.style.fontSize = {
        small: "14px",
        medium: "16px",
        large: "18px",
      }[updated.fontSize]

      return updated
    })
  }

  return { settings, updateSettings }
}
