"use client"

import { useDesktopStore } from "@/stores/desktop-store"

export function DesktopGridOverlay() {
  const { showDesktopGrid, desktopGridSize, desktopSnapToGrid } = useDesktopStore()

  if (!showDesktopGrid || !desktopSnapToGrid) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none opacity-10 z-0"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)
        `,
        backgroundSize: `${desktopGridSize}px ${desktopGridSize}px`,
        top: "48px", // Account for top bar
      }}
    />
  )
}
