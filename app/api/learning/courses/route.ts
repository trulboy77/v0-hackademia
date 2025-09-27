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
    const category = searchParams.get("category")
    const level = searchParams.get("level")

    let query = supabase
      .from("courses")
      .select(`
        *,
        lessons:course_lessons(
          id,
          title,
          description,
          video_url,
          duration,
          order_index,
          is_free
        ),
        enrollments:course_enrollments(
          id,
          progress,
          completed_at
        )
      `)
      .eq("is_published", true)
      .order("created_at", { ascending: false })

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (level && level !== "all") {
      query = query.eq("level", level)
    }

    const { data: courses, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
    }

    return NextResponse.json({ courses })
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}
