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

    const { data: challenges, error } = await supabase
      .from("challenges")
      .select(`
        *,
        solves:solves(count)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 })
    }

    // Transform the data to include solve counts
    const challengesWithCounts = challenges.map((challenge) => ({
      ...challenge,
      solves_count: challenge.solves[0]?.count || 0,
    }))

    return NextResponse.json({ challenges: challengesWithCounts })
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { title, description, category, difficulty, points, flag, hints, is_active } = await request.json()

    if (!title || !description || !category || !difficulty || !flag) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: challenge, error } = await supabase.rpc("create_challenge_admin", {
      p_title: title,
      p_description: description,
      p_category: category,
      p_difficulty: difficulty,
      p_points: points || 100,
      p_flag: flag,
      p_hints: hints || [],
      p_is_active: is_active || false,
      p_created_by: user.id,
    })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 })
    }

    return NextResponse.json({ challenge })
  } catch (error) {
    console.error("Challenge creation error:", error)
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 })
  }
}
