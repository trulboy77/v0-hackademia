"use client"

import { useState, useEffect } from "react"

export function LiveClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="text-center font-mono">
      <div className="text-lg font-bold text-primary glow-text">{formatTime(time)}</div>
      <div className="text-xs text-muted-foreground">{formatDate(time)}</div>
    </div>
  )
}
