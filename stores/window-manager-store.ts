import { create } from "zustand"
import { persist } from "zustand/middleware"

interface WindowManagerState {
  // Grid and snapping
  snapToGrid: boolean
  gridSize: number
  enableWindowSnapping: boolean

  // Dock settings
  dockPosition: "bottom" | "left" | "right" | "top"
  showDock: boolean
  dockAutoHide: boolean

  // Fullscreen
  fullscreenWindow: string | null

  // Window management
  cascadeOffset: number
  defaultWindowSize: { width: number; height: number }

  // Actions
  setSnapToGrid: (enabled: boolean) => void
  setGridSize: (size: number) => void
  setEnableWindowSnapping: (enabled: boolean) => void
  setDockPosition: (position: "bottom" | "left" | "right" | "top") => void
  setShowDock: (show: boolean) => void
  setDockAutoHide: (autoHide: boolean) => void
  setFullscreenWindow: (windowId: string | null) => void
  setCascadeOffset: (offset: number) => void
  setDefaultWindowSize: (size: { width: number; height: number }) => void

  // Utility functions
  getNextCascadePosition: (windowCount: number) => { x: number; y: number }
  resetToDefaults: () => void
}

const defaultState = {
  snapToGrid: false,
  gridSize: 20,
  enableWindowSnapping: true,
  dockPosition: "bottom" as const,
  showDock: true,
  dockAutoHide: false,
  fullscreenWindow: null,
  cascadeOffset: 30,
  defaultWindowSize: { width: 800, height: 600 },
}

export const useWindowManagerStore = create<WindowManagerState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // Actions
      setSnapToGrid: (enabled) => set({ snapToGrid: enabled }),
      setGridSize: (size) => set({ gridSize: Math.max(10, Math.min(50, size)) }),
      setEnableWindowSnapping: (enabled) => set({ enableWindowSnapping: enabled }),
      setDockPosition: (position) => set({ dockPosition: position }),
      setShowDock: (show) => set({ showDock: show }),
      setDockAutoHide: (autoHide) => set({ dockAutoHide: autoHide }),
      setFullscreenWindow: (windowId) => set({ fullscreenWindow: windowId }),
      setCascadeOffset: (offset) => set({ cascadeOffset: Math.max(10, Math.min(100, offset)) }),
      setDefaultWindowSize: (size) =>
        set({
          defaultWindowSize: {
            width: Math.max(300, size.width),
            height: Math.max(200, size.height),
          },
        }),

      // Utility functions
      getNextCascadePosition: (windowCount) => {
        const { cascadeOffset } = get()
        return {
          x: 100 + windowCount * cascadeOffset,
          y: 100 + windowCount * cascadeOffset,
        }
      },

      resetToDefaults: () => set(defaultState),
    }),
    {
      name: "hackademia-window-manager",
      partialize: (state) => ({
        snapToGrid: state.snapToGrid,
        gridSize: state.gridSize,
        enableWindowSnapping: state.enableWindowSnapping,
        dockPosition: state.dockPosition,
        showDock: state.showDock,
        dockAutoHide: state.dockAutoHide,
        cascadeOffset: state.cascadeOffset,
        defaultWindowSize: state.defaultWindowSize,
      }),
    },
  ),
)
