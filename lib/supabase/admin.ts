import { createClient as createServerClient } from "./server"
import type { Database } from "./types"

type Tables = Database["public"]["Tables"]

// Admin utilities (only for use in API routes with proper auth checks)
export const adminQueries = {
  // Create a new challenge with flag hashing
  async createChallenge(
    title: string,
    description: string,
    category: string,
    difficulty: "easy" | "medium" | "hard" | "expert",
    flag: string,
    points = 100,
    hints: string[] = [],
    files: string[] = [],
  ) {
    const supabase = await createServerClient()

    // Hash the flag
    const { data: hashedFlag, error: hashError } = await supabase.rpc("hash_flag", {
      flag_text: flag,
    })

    if (hashError) return { data: null, error: hashError }

    const { data, error } = await supabase
      .from("challenges")
      .insert({
        title,
        description,
        category,
        difficulty,
        points,
        flag_hash: hashedFlag,
        hints,
        files,
        is_active: true,
      })
      .select()
      .single()

    return { data, error }
  },

  // Update user role
  async updateUserRole(userId: string, role: "user" | "admin") {
    const supabase = await createServerClient()

    const { data, error } = await supabase.from("users").update({ role }).eq("id", userId).select().single()

    return { data, error }
  },

  // Get all users (admin only)
  async getAllUsers() {
    const supabase = await createServerClient()

    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    return { data, error }
  },

  // Get challenge statistics
  async getChallengeStats(challengeId: string) {
    const supabase = await createServerClient()

    const { data: solves, error: solvesError } = await supabase
      .from("solves")
      .select("id")
      .eq("challenge_id", challengeId)

    if (solvesError) return { data: null, error: solvesError }

    const { data: writeups, error: writeupsError } = await supabase
      .from("writeups")
      .select("id")
      .eq("challenge_id", challengeId)
      .eq("is_published", true)

    if (writeupsError) return { data: null, error: writeupsError }

    return {
      data: {
        solves: solves.length,
        writeups: writeups.length,
      },
      error: null,
    }
  },

  // Deactivate challenge
  async deactivateChallenge(challengeId: string) {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("challenges")
      .update({ is_active: false })
      .eq("id", challengeId)
      .select()
      .single()

    return { data, error }
  },
}
