"use client"

import { useTheme } from "@/hooks/use-theme"

export function ScanLine() {
  const { theme } = useTheme()

  const getScanLineColor = () => {
    switch (theme) {
      case "cyberpunk-neon":
        return "bg-gradient-to-r from-transparent via-pink-500 to-transparent"
      case "cyberpunk-orange":
        return "bg-gradient-to-r from-transparent via-orange-500 to-transparent"
      case "light":
        return "bg-gradient-to-r from-transparent via-green-600 to-transparent"
      default:
        return "bg-gradient-to-r from-transparent via-green-500 to-transparent"
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <div
        className={`absolute top-0 left-0 w-full h-0.5 ${getScanLineColor()} opacity-30 animate-scan-line`}
        style={{
          animationDuration: "3s",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}
      />
    </div>
  )
}
