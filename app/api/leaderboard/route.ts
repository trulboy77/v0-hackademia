import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "all-time"
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let dateFilter = ""
    const now = new Date()

    switch (timeframe) {
      case "this-week":
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
        dateFilter = `AND us.created_at >= '${weekStart.toISOString()}'`
        break
      case "this-month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        dateFilter = `AND us.created_at >= '${monthStart.toISOString()}'`
        break
      case "this-year":
        const yearStart = new Date(now.getFullYear(), 0, 1)
        dateFilter = `AND us.created_at >= '${yearStart.toISOString()}'`
        break
    }

    // Get leaderboard with user stats
    const { data: leaderboard, error } = await supabase.rpc("get_leaderboard", {
      time_filter: dateFilter,
      result_limit: limit,
    })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
    }

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("Leaderboard fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
