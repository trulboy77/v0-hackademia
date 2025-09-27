"use client"

import type React from "react"
import { useState, useRef } from "react"
import { getIconComponent } from "@/lib/icons"
import { useDesktopStore } from "@/stores/desktop-store"

interface DesktopIconProps {
  id: string
  name: string
  icon: string
  position: { x: number; y: number }
  onDoubleClick: () => void
  onPositionChange: (position: { x: number; y: number }) => void
}

export function DesktopIcon({ id, name, icon, position, onDoubleClick, onPositionChange }: DesktopIconProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isSelected, setIsSelected] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const clickTimeoutRef = useRef<NodeJS.Timeout>()

  const { desktopSnapToGrid, snapIconToGrid } = useDesktopStore()

  const IconComponent = getIconComponent(icon)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setIsSelected(true)

    const rect = dragRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y

        // Constrain to viewport
        const maxX = window.innerWidth - 80
        const maxY = window.innerHeight - 80

        const constrainedPosition = {
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        }

        const finalPosition = desktopSnapToGrid ? snapIconToGrid(constrainedPosition) : constrainedPosition
        onPositionChange(finalPosition)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = undefined
      // Double click
      onDoubleClick()
    } else {
      // Single click
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = undefined
        setIsSelected(true)
      }, 300)
    }
  }

  const handleBlur = () => {
    setIsSelected(false)
  }

  return (
    <div
      ref={dragRef}
      className={`absolute flex flex-col items-center cursor-pointer select-none transition-transform ${
        isDragging ? "scale-110 z-50" : "hover:scale-105"
      } ${isSelected ? "z-10" : ""}`}
      style={{
        left: position.x,
        top: position.y,
        width: "80px",
        height: "80px",
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onBlur={handleBlur}
      tabIndex={0}
    >
      <div
        className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all ${
          isSelected
            ? "bg-primary/20 border-2 border-primary glow-border"
            : "bg-secondary/50 border border-border hover:bg-secondary/70"
        }`}
      >
        <IconComponent className="w-6 h-6 text-foreground" />
      </div>
      <span
        className={`mt-1 text-xs text-center max-w-full truncate transition-colors ${
          isSelected ? "text-primary glow-text" : "text-foreground"
        }`}
      >
        {name}
      </span>
    </div>
  )
}
