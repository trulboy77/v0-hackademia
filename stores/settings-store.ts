import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Theme } from "@/types/theme"

interface SettingsState {
  // Theme settings
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void

  // Notification settings
  notifications: boolean
  setNotifications: (enabled: boolean) => void

  // Desktop settings
  showMatrixBackground: boolean
  showScanLine: boolean
  setShowMatrixBackground: (show: boolean) => void
  setShowScanLine: (show: boolean) => void

  // System settings
  autoSave: boolean
  soundEnabled: boolean
  setAutoSave: (enabled: boolean) => void
  setSoundEnabled: (enabled: boolean) => void

  // Window settings
  defaultWindowSize: { width: number; height: number }
  setDefaultWindowSize: (size: { width: number; height: number }) => void

  // Reset all settings
  resetSettings: () => void
}

const defaultSettings = {
  theme: "dark" as Theme,
  notifications: true,
  showMatrixBackground: true,
  showScanLine: true,
  autoSave: true,
  soundEnabled: false,
  defaultWindowSize: { width: 800, height: 600 },
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      // Theme actions
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.setAttribute("data-theme", theme)
      },

      toggleTheme: () => {
        const themes: Theme[] = ["dark", "light", "cyberpunk-neon", "cyberpunk-orange"]
        const currentIndex = themes.indexOf(get().theme)
        const nextIndex = (currentIndex + 1) % themes.length
        const newTheme = themes[nextIndex]

        set({ theme: newTheme })
        document.documentElement.setAttribute("data-theme", newTheme)
      },

      // Notification actions
      setNotifications: (notifications) => set({ notifications }),

      // Desktop actions
      setShowMatrixBackground: (showMatrixBackground) => set({ showMatrixBackground }),
      setShowScanLine: (showScanLine) => set({ showScanLine }),

      // System actions
      setAutoSave: (autoSave) => set({ autoSave }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),

      // Window actions
      setDefaultWindowSize: (defaultWindowSize) => set({ defaultWindowSize }),

      // Reset
      resetSettings: () => {
        set(defaultSettings)
        document.documentElement.setAttribute("data-theme", defaultSettings.theme)
      },
    }),
    {
      name: "hackademia-settings",
    },
  ),
)
