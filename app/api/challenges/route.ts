import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")

    let query = supabase
      .from("challenges")
      .select(`
        id,
        title,
        description,
        category,
        difficulty,
        points,
        created_at,
        solves:solves!challenge_id(count),
        user_solved:solves!challenge_id(id, user_id)
      `)
      .eq("is_active", true)

    if (category) {
      query = query.eq("category", category)
    }

    if (difficulty) {
      query = query.eq("difficulty", difficulty)
    }

    const { data: challenges, error } = await query.order("points", { ascending: true })

    if (error) {
      console.error("Error fetching challenges:", error)
      return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 })
    }

    // Process challenges to add solve count and user solve status
    const processedChallenges = challenges?.map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      difficulty: challenge.difficulty,
      points: challenge.points,
      created_at: challenge.created_at,
      solves: challenge.solves?.[0]?.count || 0,
      solved_by_user: challenge.user_solved?.some((solve: any) => solve.user_id === user.id) || false,
    }))

    return NextResponse.json({ challenges: processedChallenges })
  } catch (error) {
    console.error("Challenges API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userError || userData?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, category, difficulty, points, flag, hints, files } = body

    if (!title || !description || !flag) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Hash the flag
    const { data: hashedFlag, error: hashError } = await supabase.rpc("hash_flag", { flag_text: flag })

    if (hashError) {
      return NextResponse.json({ error: "Failed to process flag" }, { status: 500 })
    }

    // Insert challenge
    const { data: challenge, error: insertError } = await supabase
      .from("challenges")
      .insert({
        title,
        description,
        category: category || "General",
        difficulty: difficulty || "easy",
        points: points || 100,
        flag_hash: hashedFlag,
        hints: hints || [],
        files: files || [],
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating challenge:", insertError)
      return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 })
    }

    return NextResponse.json({ challenge }, { status: 201 })
  } catch (error) {
    console.error("Challenge creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export default async function handler(req: any, res: any) {
  const request = new NextRequest(req.url || "http://localhost:3000", {
    method: req.method,
    headers: req.headers,
    body: req.body ? JSON.stringify(req.body) : undefined,
  })

  let response: NextResponse

  switch (req.method) {
    case "GET":
      response = await GET(request)
      break
    case "POST":
      response = await POST(request)
      break
    default:
      response = NextResponse.json({ error: "Method not allowed" }, { status: 405 })
  }

  // Convert NextResponse to traditional response format for tests
  const data = await response.json()
  res.status(response.status).json(data)
}
