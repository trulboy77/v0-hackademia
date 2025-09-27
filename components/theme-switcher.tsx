"use client"

import { useState } from "react"
import { useTheme } from "@/hooks/use-theme"
import { THEMES, type Theme } from "@/types/theme"
import { Palette, ChevronDown } from "lucide-react"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const currentTheme = THEMES[theme]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors border border-border"
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium">{currentTheme.displayName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-20 glow-border">
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">SELECT THEME</div>
              {Object.entries(THEMES).map(([key, themeConfig]) => (
                <button
                  key={key}
                  onClick={() => {
                    setTheme(key as Theme)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-start gap-3 p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${
                    theme === key ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                      {theme === key && <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{themeConfig.displayName}</div>
                    <div className="text-xs text-muted-foreground mt-1">{themeConfig.description}</div>
                    <div className="flex gap-1 mt-2">
                      {Object.entries(themeConfig.colors)
                        .slice(0, 4)
                        .map(([colorKey, colorValue]) => (
                          <div
                            key={colorKey}
                            className="w-3 h-3 rounded-full border border-border"
                            style={{ backgroundColor: colorValue }}
                          />
                        ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
