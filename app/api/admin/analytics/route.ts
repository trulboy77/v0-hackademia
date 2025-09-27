import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Get analytics data
    const [
      { count: totalUsers },
      { count: newUsersToday },
      { count: activeUsers },
      { count: totalChallenges },
      { count: totalSolves },
      { count: totalThreads },
      { count: totalCourses },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date().toISOString().split("T")[0]),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("last_active", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("challenges").select("*", { count: "exact", head: true }),
      supabase.from("solves").select("*", { count: "exact", head: true }),
      supabase.from("forum_threads").select("*", { count: "exact", head: true }),
      supabase.from("courses").select("*", { count: "exact", head: true }),
    ])

    const analytics = {
      total_users: totalUsers || 0,
      new_users_today: newUsersToday || 0,
      active_users: activeUsers || 0,
      total_challenges: totalChallenges || 0,
      total_solves: totalSolves || 0,
      total_threads: totalThreads || 0,
      total_courses: totalCourses || 0,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
