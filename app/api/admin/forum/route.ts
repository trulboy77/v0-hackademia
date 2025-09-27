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

    const { data: threads, error } = await supabase
      .from("forum_threads")
      .select(`
        *,
        posts:forum_posts(count),
        created_by:created_by (
          display_name
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 })
    }

    // Transform the data to include post counts
    const threadsWithCounts = threads.map((thread) => ({
      ...thread,
      posts_count: thread.posts[0]?.count || 0,
    }))

    return NextResponse.json({ threads: threadsWithCounts })
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 })
  }
}
