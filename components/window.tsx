"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { X, Minus, Square, Maximize2, Maximize } from "lucide-react"

interface WindowProps {
  id: string
  title: string
  children: React.ReactNode
  initialPosition?: { x: number; y: number }
  initialSize?: { width: number; height: number }
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onFullscreen?: () => void
  isMaximized?: boolean
  isFullscreen?: boolean
  zIndex: number
  onFocus: () => void
  onPositionChange?: (position: { x: number; y: number }) => void
  onSizeChange?: (size: { width: number; height: number }) => void
  snapToGrid?: boolean
  gridSize?: number
}

export function Window({
  id,
  title,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 800, height: 600 },
  onClose,
  onMinimize,
  onMaximize,
  onFullscreen,
  isMaximized = false,
  isFullscreen = false,
  zIndex,
  onFocus,
  onPositionChange,
  onSizeChange,
  snapToGrid = false,
  gridSize = 20,
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [lastNormalState, setLastNormalState] = useState({ position: initialPosition, size: initialSize })

  const windowRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // Update position and size when props change
  useEffect(() => {
    if (!isDragging && !isResizing) {
      setPosition(initialPosition)
      setSize(initialSize)
    }
  }, [initialPosition, initialSize, isDragging, isResizing])

  // Save normal state before maximizing/fullscreen
  useEffect(() => {
    if (!isMaximized && !isFullscreen) {
      setLastNormalState({ position, size })
    }
  }, [position, size, isMaximized, isFullscreen])

  const snapPosition = useCallback(
    (pos: { x: number; y: number }) => {
      if (!snapToGrid) return pos

      return {
        x: Math.round(pos.x / gridSize) * gridSize,
        y: Math.round(pos.y / gridSize) * gridSize,
      }
    },
    [snapToGrid, gridSize],
  )

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (isMaximized || isFullscreen) return

    e.preventDefault()
    setIsDragging(true)
    onFocus()

    const rect = windowRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      // Constrain to viewport
      const maxX = window.innerWidth - size.width
      const maxY = window.innerHeight - size.height

      const constrainedPos = {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      }

      const snappedPos = snapPosition(constrainedPos)
      setPosition(snappedPos)
      onPositionChange?.(snappedPos)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isMaximized || isFullscreen) return

    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    onFocus()

    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    })

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y

      const newWidth = Math.max(300, resizeStart.width + deltaX)
      const newHeight = Math.max(200, resizeStart.height + deltaY)

      // Constrain to viewport
      const maxWidth = window.innerWidth - position.x
      const maxHeight = window.innerHeight - position.y

      const constrainedSize = {
        width: Math.min(newWidth, maxWidth),
        height: Math.min(newHeight, maxHeight),
      }

      setSize(constrainedSize)
      onSizeChange?.(constrainedSize)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Handle double-click to maximize
  const handleHeaderDoubleClick = () => {
    onMaximize()
  }

  const getWindowStyle = () => {
    if (isFullscreen) {
      return {
        position: "fixed" as const,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: zIndex + 1000, // Ensure fullscreen is always on top
      }
    }

    if (isMaximized) {
      return {
        position: "fixed" as const,
        top: 48, // Account for top bar
        left: 0,
        width: "100vw",
        height: "calc(100vh - 48px)",
        zIndex,
      }
    }

    return {
      position: "absolute" as const,
      left: position.x,
      top: position.y,
      width: size.width,
      height: size.height,
      zIndex,
    }
  }

  return (
    <div
      ref={windowRef}
      className={`bg-card border border-border rounded-lg shadow-2xl overflow-hidden transition-all ${
        isDragging || isResizing ? "select-none" : ""
      } ${isFullscreen ? "" : "glow-border"}`}
      style={getWindowStyle()}
      onClick={onFocus}
    >
      {/* Window Header */}
      <div
        ref={headerRef}
        className="flex items-center justify-between px-4 py-2 bg-secondary border-b border-border cursor-move"
        onMouseDown={handleHeaderMouseDown}
        onDoubleClick={handleHeaderDoubleClick}
      >
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-foreground truncate">{title}</div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMinimize()
            }}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Minimize"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMaximize()
            }}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-accent hover:text-accent-foreground transition-colors"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <Square className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
          {onFullscreen && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onFullscreen()
              }}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-accent hover:text-accent-foreground transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              <Maximize className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive hover:text-destructive-foreground transition-colors"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-auto" style={{ height: "calc(100% - 40px)" }}>
        {children}
      </div>

      {/* Resize Handle */}
      {!isMaximized && !isFullscreen && (
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" onMouseDown={handleResizeMouseDown}>
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-border" />
        </div>
      )}

      {/* Grid overlay when snapping */}
      {snapToGrid && (isDragging || isResizing) && (
        <div
          className="fixed inset-0 pointer-events-none opacity-20 z-50"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        />
      )}
    </div>
  )
}
