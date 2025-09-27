"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "@/hooks/use-theme"

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Matrix characters
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"
    const charArray = chars.split("")

    const fontSize = 14
    const columns = canvas.width / fontSize

    // Array to store y position of each column
    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = 1
    }

    // Get theme colors
    const getThemeColor = () => {
      switch (theme) {
        case "cyberpunk-neon":
          return "#ff00ff"
        case "cyberpunk-orange":
          return "#ff6600"
        case "light":
          return "#006600"
        default:
          return "#00ff00"
      }
    }

    const draw = () => {
      // Black background with slight transparency for trail effect
      ctx.fillStyle = theme === "light" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Set text properties
      ctx.fillStyle = getThemeColor()
      ctx.font = `${fontSize}px monospace`

      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        // Reset drop to top randomly
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, 50)

    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-10"
      style={{ background: "transparent" }}
    />
  )
}
