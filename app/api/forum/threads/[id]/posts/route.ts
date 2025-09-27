import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: posts, error } = await supabase
      .from("forum_posts")
      .select(`
        id,
        content,
        created_at,
        updated_at,
        is_edited,
        author:users!author_id(id, username, avatar_url),
        votes:post_votes(vote_type),
        user_vote:post_votes!post_id(vote_type)
      `)
      .eq("thread_id", params.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching posts:", error)
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
    }

    // Process posts to calculate vote scores
    const processedPosts = posts?.map((post) => {
      const upvotes = post.votes?.filter((v: any) => v.vote_type === "upvote").length || 0
      const downvotes = post.votes?.filter((v: any) => v.vote_type === "downvote").length || 0
      const userVote = post.user_vote?.find((v: any) => v.user_id === user.id)?.vote_type || null

      return {
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        updated_at: post.updated_at,
        is_edited: post.is_edited,
        author: post.author,
        upvotes,
        downvotes,
        score: upvotes - downvotes,
        user_vote: userVote,
      }
    })

    return NextResponse.json({ posts: processedPosts })
  } catch (error) {
    console.error("Forum posts API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    if (content.length > 10000) {
      return NextResponse.json({ error: "Content too long (max 10000 characters)" }, { status: 400 })
    }

    // Check if thread exists
    const { data: thread, error: threadError } = await supabase
      .from("forum_threads")
      .select("id")
      .eq("id", params.id)
      .eq("is_active", true)
      .single()

    if (threadError || !thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    const { data: post, error } = await supabase
      .from("forum_posts")
      .insert({
        thread_id: params.id,
        content: content.trim(),
        author_id: user.id,
      })
      .select(`
        id,
        content,
        created_at,
        updated_at,
        is_edited,
        author:users!author_id(id, username, avatar_url)
      `)
      .single()

    if (error) {
      console.error("Error creating post:", error)
      return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
    }

    // Update thread's updated_at timestamp
    await supabase.from("forum_threads").update({ updated_at: new Date().toISOString() }).eq("id", params.id)

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Create post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
