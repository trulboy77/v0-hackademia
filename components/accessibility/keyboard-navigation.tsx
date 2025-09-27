"use client"

import { useEffect } from "react"

export function KeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + M: Focus main content
      if (event.altKey && event.key === "m") {
        event.preventDefault()
        const mainContent = document.getElementById("main-content")
        mainContent?.focus()
      }

      // Alt + N: Focus navigation
      if (event.altKey && event.key === "n") {
        event.preventDefault()
        const navigation = document.querySelector('[role="navigation"]')
        if (navigation instanceof HTMLElement) {
          navigation.focus()
        }
      }

      // Escape: Close modals/dialogs
      if (event.key === "Escape") {
        const openDialog = document.querySelector('[role="dialog"][aria-hidden="false"]')
        if (openDialog) {
          const closeButton = openDialog.querySelector('[aria-label*="close"], [aria-label*="Close"]')
          if (closeButton instanceof HTMLElement) {
            closeButton.click()
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return null
}
