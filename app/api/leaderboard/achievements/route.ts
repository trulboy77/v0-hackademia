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

    // Get recent achievements
    const { data: achievements, error } = await supabase
      .from("user_achievements")
      .select(`
        *,
        achievements:achievement_id (
          id,
          title,
          description,
          icon,
          rarity,
          category
        ),
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .order("earned_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 })
    }

    // Get achievement statistics
    const { data: stats, error: statsError } = await supabase.from("achievements").select(`
        category,
        count:user_achievements(count)
      `)

    if (statsError) {
      console.error("Stats error:", statsError)
    }

    return NextResponse.json({
      achievements,
      stats: stats || [],
    })
  } catch (error) {
    console.error("Achievements fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 })
  }
}
