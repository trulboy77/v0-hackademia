"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { getIconComponent } from "@/lib/icons"

interface DockWindow {
  id: string
  appId: string
  title: string
  icon: string
}

interface DockProps {
  windows: DockWindow[]
  position: "bottom" | "left" | "right" | "top"
  onWindowRestore: (windowId: string) => void
  onWindowClose: (windowId: string) => void
}

export function Dock({ windows, position, onWindowRestore, onWindowClose }: DockProps) {
  const [hoveredWindow, setHoveredWindow] = useState<string | null>(null)

  const getDockClasses = () => {
    const baseClasses =
      "fixed bg-secondary/90 backdrop-blur-sm border border-border rounded-lg shadow-lg z-50 transition-all duration-200"

    switch (position) {
      case "bottom":
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2 flex flex-row gap-2 px-3 py-2`
      case "left":
        return `${baseClasses} left-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 px-2 py-3`
      case "right":
        return `${baseClasses} right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 px-2 py-3`
      case "top":
        return `${baseClasses} top-16 left-1/2 transform -translate-x-1/2 flex flex-row gap-2 px-3 py-2`
      default:
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2 flex flex-row gap-2 px-3 py-2`
    }
  }

  const getItemClasses = (windowId: string) => {
    const baseClasses =
      "relative group flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 cursor-pointer"
    const hoverClasses = "hover:bg-accent hover:scale-110"
    const activeClasses = hoveredWindow === windowId ? "bg-accent scale-110" : "bg-background/50"

    return `${baseClasses} ${hoverClasses} ${activeClasses}`
  }

  return (
    <div className={getDockClasses()}>
      {windows.map((window) => {
        const IconComponent = getIconComponent(window.icon)

        return (
          <div
            key={window.id}
            className={getItemClasses(window.id)}
            onMouseEnter={() => setHoveredWindow(window.id)}
            onMouseLeave={() => setHoveredWindow(null)}
            onClick={() => onWindowRestore(window.id)}
          >
            <IconComponent className="w-6 h-6 text-foreground" />

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {window.title}
              </div>
            </div>

            {/* Close button on hover */}
            <button
              className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:scale-110"
              onClick={(e) => {
                e.stopPropagation()
                onWindowClose(window.id)
              }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
