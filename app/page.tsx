"use client"

import { MatrixBackground } from "@/components/matrix-background"
import { ScanLine } from "@/components/scan-line"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useTheme } from "@/hooks/use-theme"
import Link from "next/link"

export default function HomePage() {
  const { theme } = useTheme()

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <MatrixBackground />
      <ScanLine />

      {/* Theme switcher in top right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeSwitcher />
      </div>

      <div className="relative z-10 flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold text-primary glow-text">HACKADEMIA.UZ</h1>
          <p className="text-xl text-muted-foreground mb-8">{">"} Initializing Matrix Interface...</p>
          <div className="mb-8 text-primary terminal-cursor text-lg">System Loading</div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors glow-border"
            >
              Access Terminal
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 bg-secondary text-secondary-foreground border border-border rounded-md hover:bg-secondary/80 transition-colors"
            >
              Request Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
