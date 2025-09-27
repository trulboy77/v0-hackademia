import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

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

    const { type, itemType, itemId, voteType } = await request.json()

    if (!["thread", "post"].includes(itemType) || !["upvote", "downvote"].includes(voteType)) {
      return NextResponse.json({ error: "Invalid vote parameters" }, { status: 400 })
    }

    const table = itemType === "thread" ? "thread_votes" : "post_votes"
    const idColumn = itemType === "thread" ? "thread_id" : "post_id"

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from(table)
      .select("id, vote_type")
      .eq(idColumn, itemId)
      .eq("user_id", user.id)
      .single()

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking same vote type
        await supabase.from(table).delete().eq("id", existingVote.id)

        return NextResponse.json({ success: true, action: "removed" })
      } else {
        // Update vote type if different
        await supabase.from(table).update({ vote_type: voteType }).eq("id", existingVote.id)

        return NextResponse.json({ success: true, action: "updated" })
      }
    } else {
      // Create new vote
      await supabase.from(table).insert({
        [idColumn]: itemId,
        user_id: user.id,
        vote_type: voteType,
      })

      return NextResponse.json({ success: true, action: "created" })
    }
  } catch (error) {
    console.error("Vote error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
