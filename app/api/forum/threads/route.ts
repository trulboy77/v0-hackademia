import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    let query = supabase
      .from("forum_threads")
      .select(`
        id,
        title,
        content,
        category,
        is_pinned,
        created_at,
        updated_at,
        author:users!author_id(id, username, avatar_url),
        posts:forum_posts(count),
        votes:thread_votes(vote_type),
        user_vote:thread_votes!thread_id(vote_type)
      `)
      .eq("is_active", true)

    if (category) {
      query = query.eq("category", category)
    }

    const { data: threads, error } = await query
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching threads:", error)
      return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 })
    }

    // Process threads to calculate vote scores and user votes
    const processedThreads = threads?.map((thread) => {
      const upvotes = thread.votes?.filter((v: any) => v.vote_type === "upvote").length || 0
      const downvotes = thread.votes?.filter((v: any) => v.vote_type === "downvote").length || 0
      const userVote = thread.user_vote?.find((v: any) => v.user_id === user.id)?.vote_type || null

      return {
        id: thread.id,
        title: thread.title,
        content: thread.content,
        category: thread.category,
        is_pinned: thread.is_pinned,
        created_at: thread.created_at,
        updated_at: thread.updated_at,
        author: thread.author,
        post_count: thread.posts?.[0]?.count || 0,
        upvotes,
        downvotes,
        score: upvotes - downvotes,
        user_vote: userVote,
      }
    })

    return NextResponse.json({ threads: processedThreads })
  } catch (error) {
    console.error("Forum threads API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, category } = await request.json()

    if (!title || !content || !category) {
      return NextResponse.json({ error: "Title, content, and category are required" }, { status: 400 })
    }

    if (title.length > 200) {
      return NextResponse.json({ error: "Title too long (max 200 characters)" }, { status: 400 })
    }

    if (content.length > 10000) {
      return NextResponse.json({ error: "Content too long (max 10000 characters)" }, { status: 400 })
    }

    const { data: thread, error } = await supabase
      .from("forum_threads")
      .insert({
        title: title.trim(),
        content: content.trim(),
        category,
        author_id: user.id,
      })
      .select(`
        id,
        title,
        content,
        category,
        is_pinned,
        created_at,
        updated_at,
        author:users!author_id(id, username, avatar_url)
      `)
      .single()

    if (error) {
      console.error("Error creating thread:", error)
      return NextResponse.json({ error: "Failed to create thread" }, { status: 500 })
    }

    return NextResponse.json({ thread })
  } catch (error) {
    console.error("Create thread error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
