"use client"

import { useEffect } from "react"
import { DesktopIcon } from "./desktop-icon"
import { TopBar } from "./top-bar"
import { MatrixBackground } from "./matrix-background"
import { ScanLine } from "./scan-line"
import { WindowManager } from "./window-manager"
import { DesktopGridOverlay } from "./desktop-grid-overlay"
import { DesktopSettingsPanel } from "./desktop-settings-panel"
import { createClient } from "@/lib/supabase/client"
import { useDesktopStore } from "@/stores/desktop-store"
import { useAuthStore } from "@/stores/auth-store"
import { useSettingsStore } from "@/stores/settings-store"
import { useNotificationStore } from "@/stores/notification-store"

const defaultApps = [
  { id: "1", name: "Terminal", icon: "terminal", position: { x: 50, y: 50 } },
  { id: "2", name: "File Manager", icon: "folder", position: { x: 150, y: 50 } },
  { id: "3", name: "Code Editor", icon: "code", position: { x: 250, y: 50 } },
  { id: "4", name: "CTF Challenges", icon: "flag", position: { x: 350, y: 50 } },
  { id: "5", name: "Community", icon: "users", position: { x: 450, y: 50 } },
  { id: "6", name: "My Profile", icon: "user", position: { x: 50, y: 150 } },
  { id: "7", name: "Library", icon: "book", position: { x: 150, y: 150 } },
  { id: "8", name: "Learning Hub", icon: "graduation-cap", position: { x: 250, y: 150 } },
  { id: "9", name: "Leaderboard", icon: "trophy", position: { x: 350, y: 150 } },
  { id: "10", name: "Kurslar", icon: "school", position: { x: 450, y: 150 } },
]

export function Desktop() {
  const { user, setUser } = useAuthStore()
  const { apps, windows, setApps, updateAppPosition, openWindow, focusWindow } = useDesktopStore()
  const { showMatrixBackground, showScanLine } = useSettingsStore()
  const { addNotification } = useNotificationStore()

  const supabase = createClient()

  // Load user and apps on mount
  useEffect(() => {
    const loadUserAndApps = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)

      if (user) {
        const { data: userApps } = await supabase
          .from("desktop_apps")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)

        if (userApps && userApps.length > 0) {
          const formattedApps = userApps.map((app) => ({
            id: app.id,
            name: app.name,
            icon: app.icon,
            position: { x: app.position_x, y: app.position_y },
            userId: user.id,
          }))
          setApps(formattedApps)
        } else {
          // Set default apps if no user apps found
          setApps(defaultApps)
        }

        // Welcome notification
        addNotification({
          title: "Welcome to Hackademia",
          message: `Hello ${user.user_metadata?.full_name || user.email}! System initialized.`,
          type: "success",
        })
      } else {
        setApps(defaultApps)
      }
    }

    loadUserAndApps()
  }, [supabase, setUser, setApps, addNotification])

  const handleIconDoubleClick = (app: any) => {
    openWindow(app)
  }

  const handleIconPositionChange = async (appId: string, position: { x: number; y: number }) => {
    updateAppPosition(appId, position)

    // Update position in database if user is logged in
    if (user) {
      const { error } = await supabase
        .from("desktop_apps")
        .update({
          position_x: position.x,
          position_y: position.y,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appId)
        .eq("user_id", user.id)

      if (error) {
        addNotification({
          title: "Save Error",
          message: "Failed to save app position",
          type: "error",
        })
      }
    }
  }

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {showMatrixBackground && <MatrixBackground />}
      {showScanLine && <ScanLine />}

      <DesktopGridOverlay />

      <TopBar
        activeWindows={windows.map((w) => ({
          id: w.id,
          appId: w.appId,
          title: w.title,
          isMinimized: w.isMinimized,
        }))}
        onAppClick={focusWindow}
      />

      <DesktopSettingsPanel />

      <div className="pt-12 h-full">
        {/* Desktop Icons */}
        {apps.map((app) => (
          <DesktopIcon
            key={app.id}
            id={app.id}
            name={app.name}
            icon={app.icon}
            position={app.position}
            onDoubleClick={() => handleIconDoubleClick(app)}
            onPositionChange={(position) => handleIconPositionChange(app.id, position)}
          />
        ))}

        {/* Windows */}
        <WindowManager apps={apps} />
      </div>
    </div>
  )
}
