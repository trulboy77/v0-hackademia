"use client"

import { useState } from "react"
import { Settings, Bell, User, LogOut, ChevronDown } from "lucide-react"
import { ThemeSwitcher } from "./theme-switcher"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SettingsPanelProps {
  user?: {
    email?: string
    user_metadata?: {
      username?: string
      full_name?: string
    }
  }
}

export function SettingsPanel({ user }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email || "User"

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors border border-border"
      >
        <Settings className="w-4 h-4" />
        <span className="text-sm font-medium hidden md:block">{displayName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-30 glow-border">
            <div className="p-4">
              {/* User Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{displayName}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </div>

              {/* Settings Sections */}
              <div className="py-4 space-y-4">
                {/* Theme Settings */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">APPEARANCE</div>
                  <ThemeSwitcher />
                </div>

                {/* Notifications */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">NOTIFICATIONS</div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`flex items-center justify-between w-full p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${
                      notifications ? "bg-accent/50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4" />
                      <span className="text-sm">System Notifications</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        notifications ? "bg-primary border-primary" : "border-border"
                      }`}
                    >
                      {notifications && <div className="w-2 h-2 bg-primary-foreground rounded-full m-0.5" />}
                    </div>
                  </button>
                </div>

                {/* System Info */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">SYSTEM</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span>Hackademia v1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime:</span>
                      <span>24:07:15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Memory:</span>
                      <span>2.1GB / 8GB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <div className="pt-4 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full p-3 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
