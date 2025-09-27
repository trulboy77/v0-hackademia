"use client"

import { Terminal, Folder, Code, Globe, Settings, Calculator, FileText, Music, type LucideIcon } from "lucide-react"

interface ActiveApp {
  id: string
  name: string
  icon: string
  isMinimized: boolean
}

interface ActiveAppsProps {
  apps: ActiveApp[]
  onAppClick: (appId: string) => void
}

const iconMap: Record<string, LucideIcon> = {
  terminal: Terminal,
  folder: Folder,
  code: Code,
  globe: Globe,
  settings: Settings,
  calculator: Calculator,
  "file-text": FileText,
  music: Music,
}

export function ActiveApps({ apps, onAppClick }: ActiveAppsProps) {
  if (apps.length === 0) {
    return <div className="text-xs text-muted-foreground">No active applications</div>
  }

  return (
    <div className="flex items-center gap-2">
      {apps.map((app) => {
        const IconComponent = iconMap[app.icon] || Terminal

        return (
          <button
            key={app.id}
            onClick={() => onAppClick(app.id)}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs transition-colors ${
              app.isMinimized
                ? "bg-muted text-muted-foreground hover:bg-muted/80"
                : "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
            }`}
            title={app.name}
          >
            <IconComponent className="w-3 h-3" />
            <span className="max-w-20 truncate">{app.name}</span>
          </button>
        )
      })}
    </div>
  )
}
