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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's current stats and rank
    const { data: userStats, error } = await supabase.rpc("get_user_rank", {
      user_uuid: user.id,
    })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 })
    }

    // Get user's recent achievements
    const { data: recentAchievements, error: achievementsError } = await supabase
      .from("user_achievements")
      .select(`
        *,
        achievements:achievement_id (
          title,
          description,
          icon,
          rarity
        )
      `)
      .eq("user_id", user.id)
      .order("earned_at", { ascending: false })
      .limit(5)

    if (achievementsError) {
      console.error("Achievements error:", achievementsError)
    }

    return NextResponse.json({
      userStats: userStats?.[0] || null,
      recentAchievements: recentAchievements || [],
    })
  } catch (error) {
    console.error("User stats fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 })
  }
}
