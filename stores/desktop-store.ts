import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface DesktopApp {
  id: string
  name: string
  icon: string
  position: { x: number; y: number }
  userId?: string
}

export interface OpenWindow {
  id: string
  appId: string
  title: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
}

interface DesktopState {
  apps: DesktopApp[]
  windows: OpenWindow[]
  nextZIndex: number
  desktopSnapToGrid: boolean
  desktopGridSize: number
  showDesktopGrid: boolean
  autoArrangeIcons: boolean

  // App actions
  setApps: (apps: DesktopApp[]) => void
  updateAppPosition: (appId: string, position: { x: number; y: number }) => void
  addApp: (app: DesktopApp) => void
  removeApp: (appId: string) => void

  // Window actions
  openWindow: (app: DesktopApp) => void
  closeWindow: (windowId: string) => void
  minimizeWindow: (windowId: string) => void
  maximizeWindow: (windowId: string) => void
  focusWindow: (windowId: string) => void
  updateWindowPosition: (windowId: string, position: { x: number; y: number }) => void
  updateWindowSize: (windowId: string, size: { width: number; height: number }) => void

  // Desktop grid actions
  setDesktopSnapToGrid: (enabled: boolean) => void
  setDesktopGridSize: (size: number) => void
  setShowDesktopGrid: (show: boolean) => void
  setAutoArrangeIcons: (enabled: boolean) => void
  arrangeIconsInGrid: () => void
  snapIconToGrid: (position: { x: number; y: number }) => { x: number; y: number }

  // Utility actions
  getActiveWindows: () => OpenWindow[]
  getWindowByAppId: (appId: string) => OpenWindow | undefined
  clearAllWindows: () => void
}

export const useDesktopStore = create<DesktopState>()(
  persist(
    (set, get) => ({
      apps: [],
      windows: [],
      nextZIndex: 1,
      desktopSnapToGrid: false,
      desktopGridSize: 100,
      showDesktopGrid: false,
      autoArrangeIcons: false,

      // App actions
      setApps: (apps) => set({ apps }),

      updateAppPosition: (appId, position) => {
        const { desktopSnapToGrid } = get()
        const finalPosition = desktopSnapToGrid ? get().snapIconToGrid(position) : position

        set((state) => ({
          apps: state.apps.map((app) => (app.id === appId ? { ...app, position: finalPosition } : app)),
        }))
      },

      addApp: (app) =>
        set((state) => ({
          apps: [...state.apps, app],
        })),

      removeApp: (appId) =>
        set((state) => ({
          apps: state.apps.filter((app) => app.id !== appId),
          windows: state.windows.filter((window) => window.appId !== appId),
        })),

      // Window actions
      openWindow: (app) =>
        set((state) => {
          // Check if window already exists
          const existingWindow = state.windows.find((w) => w.appId === app.id)
          if (existingWindow) {
            // Focus existing window
            return {
              windows: state.windows.map((w) =>
                w.id === existingWindow.id ? { ...w, zIndex: state.nextZIndex, isMinimized: false } : w,
              ),
              nextZIndex: state.nextZIndex + 1,
            }
          }

          // Create new window
          const newWindow: OpenWindow = {
            id: `window-${Date.now()}`,
            appId: app.id,
            title: app.name,
            position: {
              x: 100 + state.windows.length * 30,
              y: 100 + state.windows.length * 30,
            },
            size: { width: 800, height: 600 },
            isMinimized: false,
            isMaximized: false,
            zIndex: state.nextZIndex,
          }

          return {
            windows: [...state.windows, newWindow],
            nextZIndex: state.nextZIndex + 1,
          }
        }),

      closeWindow: (windowId) =>
        set((state) => ({
          windows: state.windows.filter((w) => w.id !== windowId),
        })),

      minimizeWindow: (windowId) =>
        set((state) => ({
          windows: state.windows.map((w) => (w.id === windowId ? { ...w, isMinimized: true } : w)),
        })),

      maximizeWindow: (windowId) =>
        set((state) => ({
          windows: state.windows.map((w) => (w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w)),
        })),

      focusWindow: (windowId) =>
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === windowId ? { ...w, zIndex: state.nextZIndex, isMinimized: false } : w,
          ),
          nextZIndex: state.nextZIndex + 1,
        })),

      updateWindowPosition: (windowId, position) =>
        set((state) => ({
          windows: state.windows.map((w) => (w.id === windowId ? { ...w, position } : w)),
        })),

      updateWindowSize: (windowId, size) =>
        set((state) => ({
          windows: state.windows.map((w) => (w.id === windowId ? { ...w, size } : w)),
        })),

      // Desktop grid actions
      setDesktopSnapToGrid: (enabled) => set({ desktopSnapToGrid: enabled }),

      setDesktopGridSize: (size) => set({ desktopGridSize: Math.max(50, Math.min(200, size)) }),

      setShowDesktopGrid: (show) => set({ showDesktopGrid: show }),

      setAutoArrangeIcons: (enabled) => {
        set({ autoArrangeIcons: enabled })
        if (enabled) {
          get().arrangeIconsInGrid()
        }
      },

      arrangeIconsInGrid: () => {
        const { apps, desktopGridSize } = get()
        const iconsPerRow = Math.floor((window.innerWidth - 100) / desktopGridSize)

        const arrangedApps = apps.map((app, index) => {
          const row = Math.floor(index / iconsPerRow)
          const col = index % iconsPerRow

          return {
            ...app,
            position: {
              x: 50 + col * desktopGridSize,
              y: 50 + row * desktopGridSize,
            },
          }
        })

        set({ apps: arrangedApps })
      },

      snapIconToGrid: (position) => {
        const { desktopGridSize } = get()
        return {
          x: Math.round(position.x / desktopGridSize) * desktopGridSize,
          y: Math.round(position.y / desktopGridSize) * desktopGridSize,
        }
      },

      // Utility actions
      getActiveWindows: () => get().windows.filter((w) => !w.isMinimized),

      getWindowByAppId: (appId) => get().windows.find((w) => w.appId === appId),

      clearAllWindows: () => set({ windows: [], nextZIndex: 1 }),
    }),
    {
      name: "hackademia-desktop",
      partialize: (state) => ({
        apps: state.apps,
        desktopSnapToGrid: state.desktopSnapToGrid,
        desktopGridSize: state.desktopGridSize,
        showDesktopGrid: state.showDesktopGrid,
        autoArrangeIcons: state.autoArrangeIcons,
      }),
    },
  ),
)
