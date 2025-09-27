import { createClient } from "./client"
import { createClient as createServerClient } from "./server"
import type { Database } from "./types"

type Tables = Database["public"]["Tables"]
type Challenge = Tables["challenges"]["Row"]
type User = Tables["users"]["Row"]
type Solve = Tables["solves"]["Row"]
type Writeup = Tables["writeups"]["Row"]
type ForumThread = Tables["forum_threads"]["Row"]
type ForumPost = Tables["forum_posts"]["Row"]
type Notification = Tables["notifications"]["Row"]

// Client-side queries
export const clientQueries = {
  // Get current user profile
  async getCurrentUser() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

    return profile
  },

  // Get challenges
  async getChallenges(category?: string) {
    const supabase = createClient()
    let query = supabase.from("challenges").select("*").eq("is_active", true).order("created_at", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Get user solves
  async getUserSolves(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("solves")
      .select(`
        *,
        challenges (
          id,
          title,
          category,
          difficulty,
          points
        )
      `)
      .eq("user_id", userId)
      .order("solved_at", { ascending: false })

    return { data, error }
  },

  // Submit flag for challenge
  async submitFlag(challengeId: string, flag: string) {
    const supabase = createClient()
    const { data, error } = await supabase.rpc("submit_solve", {
      challenge_id: challengeId,
      submitted_flag: flag,
    })

    return { data, error }
  },

  // Get leaderboard
  async getLeaderboard(limit = 10) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("users")
      .select("id, display_name, rating")
      .order("rating", { ascending: false })
      .limit(limit)

    return { data, error }
  },

  // Get writeups
  async getWriteups(challengeId?: string) {
    const supabase = createClient()
    let query = supabase
      .from("writeups")
      .select(`
        *,
        users (
          id,
          display_name
        ),
        challenges (
          id,
          title,
          category
        )
      `)
      .eq("is_published", true)
      .order("created_at", { ascending: false })

    if (challengeId) {
      query = query.eq("challenge_id", challengeId)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Get forum threads
  async getForumThreads(category?: string) {
    const supabase = createClient()
    let query = supabase
      .from("forum_threads")
      .select(`
        *,
        users (
          id,
          display_name
        )
      `)
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Get forum posts for a thread
  async getForumPosts(threadId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("forum_posts")
      .select(`
        *,
        users (
          id,
          display_name,
          rating
        )
      `)
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true })

    return { data, error }
  },

  // Get user notifications
  async getNotifications() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    return { data, error }
  },

  // Mark notification as read
  async markNotificationRead(notificationId: string) {
    const supabase = createClient()
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

    return { error }
  },

  // Create writeup
  async createWriteup(challengeId: string, title: string, content: string) {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("writeups")
      .insert({
        user_id: user.id,
        challenge_id: challengeId,
        title,
        content,
        is_published: false,
      })
      .select()
      .single()

    return { data, error }
  },

  // Create forum thread
  async createForumThread(title: string, category: string) {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("forum_threads")
      .insert({
        title,
        category,
        created_by: user.id,
      })
      .select()
      .single()

    return { data, error }
  },

  // Create forum post
  async createForumPost(threadId: string, content: string) {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("forum_posts")
      .insert({
        thread_id: threadId,
        content,
        created_by: user.id,
      })
      .select()
      .single()

    return { data, error }
  },
}

// Server-side queries (for use in Server Components and API routes)
export const serverQueries = {
  // Get current user profile (server-side)
  async getCurrentUser() {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

    return profile
  },

  // Admin function to create challenge
  async createChallenge(challenge: Omit<Tables["challenges"]["Insert"], "id" | "created_at" | "updated_at">) {
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("challenges").insert(challenge).select().single()

    return { data, error }
  },

  // Admin function to update challenge
  async updateChallenge(id: string, updates: Tables["challenges"]["Update"]) {
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("challenges").update(updates).eq("id", id).select().single()

    return { data, error }
  },
}
