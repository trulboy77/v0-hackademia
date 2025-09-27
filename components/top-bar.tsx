"use client"

import { useState, useEffect } from "react"
import { LiveClock } from "./live-clock"
import { ActiveApps } from "./active-apps"
import { SettingsPanel } from "./settings-panel"
import { createClient } from "@/lib/supabase/client"

interface TopBarProps {
  activeWindows?: Array<{
    id: string
    appId: string
    title: string
    isMinimized: boolean
  }>
  onAppClick?: (windowId: string) => void
}

export function TopBar({ activeWindows = [], onAppClick }: TopBarProps) {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // Convert windows to active apps format
  const activeApps = activeWindows.map((window) => ({
    id: window.id,
    name: window.title,
    icon: getIconForApp(window.title),
    isMinimized: window.isMinimized,
  }))

  const handleAppClick = (appId: string) => {
    onAppClick?.(appId)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-2 h-12">
        {/* Left: Logo and Active Apps */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-sm">H</span>
            </div>
            <span className="font-bold text-primary glow-text hidden sm:block">HACKADEMIA.UZ</span>
          </div>

          <div className="hidden md:block">
            <ActiveApps apps={activeApps} onAppClick={handleAppClick} />
          </div>
        </div>

        {/* Center: Live Clock */}
        <div className="flex-1 flex justify-center">
          <LiveClock />
        </div>

        {/* Right: Settings */}
        <div className="flex items-center gap-4">
          <SettingsPanel user={user} />
        </div>
      </div>
    </div>
  )
}

function getIconForApp(appName: string): string {
  const iconMap: Record<string, string> = {
    Terminal: "terminal",
    "File Manager": "folder",
    "Code Editor": "code",
    Browser: "globe",
    Settings: "settings",
    Calculator: "calculator",
    Notes: "file-text",
    "Music Player": "music",
  }

  return iconMap[appName] || "terminal"
}
