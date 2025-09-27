import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const threadId = params.id

    // Delete all posts in the thread first (due to foreign key constraints)
    await supabase.from("forum_posts").delete().eq("thread_id", threadId)

    // Then delete the thread
    const { error } = await supabase.from("forum_threads").delete().eq("id", threadId)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete thread" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to delete thread" }, { status: 500 })
  }
}
