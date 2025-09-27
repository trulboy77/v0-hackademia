import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    // Check if message exists and belongs to user
    const { data: existingMessage, error: fetchError } = await supabase
      .from("messages")
      .select("id, user_id, created_at")
      .eq("id", params.id)
      .single()

    if (fetchError || !existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    if (existingMessage.user_id !== user.id) {
      return NextResponse.json({ error: "Not authorized to edit this message" }, { status: 403 })
    }

    // Check if message is within 5 minute edit window
    const messageTime = new Date(existingMessage.created_at).getTime()
    const now = new Date().getTime()
    const fiveMinutes = 5 * 60 * 1000

    if (now - messageTime > fiveMinutes) {
      return NextResponse.json({ error: "Message can only be edited within 5 minutes" }, { status: 400 })
    }

    const { data: message, error } = await supabase
      .from("messages")
      .update({
        content: content.trim(),
        is_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select(`
        id,
        content,
        created_at,
        updated_at,
        is_edited,
        user:users!user_id(id, username, avatar_url)
      `)
      .single()

    if (error) {
      console.error("Error updating message:", error)
      return NextResponse.json({ error: "Failed to update message" }, { status: 500 })
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Update message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if message exists and belongs to user
    const { data: existingMessage, error: fetchError } = await supabase
      .from("messages")
      .select("id, user_id, created_at")
      .eq("id", params.id)
      .single()

    if (fetchError || !existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    if (existingMessage.user_id !== user.id) {
      return NextResponse.json({ error: "Not authorized to delete this message" }, { status: 403 })
    }

    // Check if message is within 5 minute delete window
    const messageTime = new Date(existingMessage.created_at).getTime()
    const now = new Date().getTime()
    const fiveMinutes = 5 * 60 * 1000

    if (now - messageTime > fiveMinutes) {
      return NextResponse.json({ error: "Message can only be deleted within 5 minutes" }, { status: 400 })
    }

    const { error } = await supabase.from("messages").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting message:", error)
      return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
