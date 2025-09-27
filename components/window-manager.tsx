"use client"

import { useEffect, useCallback } from "react"
import { Window } from "./window"
import { Dock } from "./dock"
import { AppLoader } from "./app-loader"
import { useDesktopStore } from "@/stores/desktop-store"
import { useWindowManagerStore } from "@/stores/window-manager-store"

interface WindowManagerProps {
  apps: Array<{
    id: string
    name: string
    icon: string
    position: { x: number; y: number }
  }>
}

export function WindowManager({ apps }: WindowManagerProps) {
  const { windows, closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPosition, updateWindowSize } =
    useDesktopStore()

  const { snapToGrid, gridSize, enableWindowSnapping, dockPosition, showDock, fullscreenWindow, setFullscreenWindow } =
    useWindowManagerStore()

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + Tab for window switching
      if (e.altKey && e.key === "Tab") {
        e.preventDefault()
        const activeWindows = windows.filter((w) => !w.isMinimized)
        if (activeWindows.length > 1) {
          const currentIndex = activeWindows.findIndex(
            (w) => w.zIndex === Math.max(...activeWindows.map((win) => win.zIndex)),
          )
          const nextIndex = (currentIndex + 1) % activeWindows.length
          focusWindow(activeWindows[nextIndex].id)
        }
      }

      // F11 for fullscreen toggle
      if (e.key === "F11") {
        e.preventDefault()
        const topWindow = windows.filter((w) => !w.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0]

        if (topWindow) {
          if (fullscreenWindow === topWindow.id) {
            setFullscreenWindow(null)
          } else {
            setFullscreenWindow(topWindow.id)
          }
        }
      }

      // Ctrl + W to close active window
      if (e.ctrlKey && e.key === "w") {
        e.preventDefault()
        const topWindow = windows.filter((w) => !w.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0]

        if (topWindow) {
          closeWindow(topWindow.id)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [windows, focusWindow, closeWindow, fullscreenWindow, setFullscreenWindow])

  // Snap window to grid
  const snapWindowToGrid = useCallback(
    (windowId: string, position: { x: number; y: number }) => {
      if (!snapToGrid || !enableWindowSnapping) {
        updateWindowPosition(windowId, position)
        return
      }

      const snappedX = Math.round(position.x / gridSize) * gridSize
      const snappedY = Math.round(position.y / gridSize) * gridSize

      updateWindowPosition(windowId, { x: snappedX, y: snappedY })
    },
    [snapToGrid, enableWindowSnapping, gridSize, updateWindowPosition],
  )

  // Handle window position updates with snapping
  const handleWindowPositionChange = useCallback(
    (windowId: string, position: { x: number; y: number }) => {
      snapWindowToGrid(windowId, position)
    },
    [snapWindowToGrid],
  )

  // Handle window size updates with constraints
  const handleWindowSizeChange = useCallback(
    (windowId: string, size: { width: number; height: number }) => {
      // Ensure minimum size
      const constrainedSize = {
        width: Math.max(300, size.width),
        height: Math.max(200, size.height),
      }

      updateWindowSize(windowId, constrainedSize)
    },
    [updateWindowSize],
  )

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(
    (windowId: string) => {
      if (fullscreenWindow === windowId) {
        setFullscreenWindow(null)
      } else {
        setFullscreenWindow(windowId)
      }
    },
    [fullscreenWindow, setFullscreenWindow],
  )

  const renderWindowContent = (window: any) => {
    const app = apps.find((a) => a.id === window.appId)
    return <AppLoader appName={app?.name || "Unknown"} appId={window.appId} />
  }

  const visibleWindows = windows.filter((w) => !w.isMinimized)
  const minimizedWindows = windows.filter((w) => w.isMinimized)

  return (
    <>
      {/* Render visible windows */}
      {visibleWindows.map((window) => {
        const isFullscreen = fullscreenWindow === window.id

        return (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            initialPosition={window.position}
            initialSize={window.size}
            isMaximized={window.isMaximized || isFullscreen}
            isFullscreen={isFullscreen}
            zIndex={window.zIndex}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
            onMaximize={() => maximizeWindow(window.id)}
            onFullscreen={() => handleFullscreenToggle(window.id)}
            onFocus={() => focusWindow(window.id)}
            onPositionChange={(position) => handleWindowPositionChange(window.id, position)}
            onSizeChange={(size) => handleWindowSizeChange(window.id, size)}
            snapToGrid={snapToGrid && enableWindowSnapping}
            gridSize={gridSize}
          >
            {renderWindowContent(window)}
          </Window>
        )
      })}

      {/* Render dock for minimized windows */}
      {showDock && minimizedWindows.length > 0 && (
        <Dock
          windows={minimizedWindows.map((w) => ({
            id: w.id,
            appId: w.appId,
            title: w.title,
            icon: apps.find((a) => a.id === w.appId)?.icon || "window",
          }))}
          position={dockPosition}
          onWindowRestore={focusWindow}
          onWindowClose={closeWindow}
        />
      )}
    </>
  )
}
