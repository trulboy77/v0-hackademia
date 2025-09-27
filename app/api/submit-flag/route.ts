import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createHash } from "crypto"
import { rateLimit } from "@/lib/rate-limit"

// Rate limiting: 5 attempts per minute per user per challenge
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 unique tokens per interval
})

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

    const { challengeId, flag } = await request.json()

    if (!challengeId || !flag) {
      return NextResponse.json({ error: "Challenge ID and flag are required" }, { status: 400 })
    }

    // Rate limiting check
    const identifier = `${user.id}-${challengeId}`
    try {
      await limiter.check(5, identifier) // 5 requests per minute per user per challenge
    } catch {
      return NextResponse.json(
        {
          error: "Too many attempts. Please wait before trying again.",
        },
        { status: 429 },
      )
    }

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .select("id, flag_hash, points, title")
      .eq("id", challengeId)
      .single()

    if (challengeError || !challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    // Hash the submitted flag
    const submittedFlagHash = createHash("sha256").update(flag.trim()).digest("hex")

    // Check if flag is correct
    const isCorrect = submittedFlagHash === challenge.flag_hash

    if (!isCorrect) {
      // Log failed attempt
      await supabase.from("solves").insert({
        user_id: user.id,
        challenge_id: challengeId,
        submitted_flag: submittedFlagHash,
        is_correct: false,
        submitted_at: new Date().toISOString(),
      })

      return NextResponse.json(
        {
          success: false,
          message: "Incorrect flag. Try again!",
        },
        { status: 200 },
      )
    }

    // Check if user already solved this challenge
    const { data: existingSolve } = await supabase
      .from("solves")
      .select("id")
      .eq("user_id", user.id)
      .eq("challenge_id", challengeId)
      .eq("is_correct", true)
      .single()

    if (existingSolve) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already solved this challenge!",
        },
        { status: 200 },
      )
    }

    // Record successful solve
    const { error: solveError } = await supabase.from("solves").insert({
      user_id: user.id,
      challenge_id: challengeId,
      submitted_flag: submittedFlagHash,
      is_correct: true,
      submitted_at: new Date().toISOString(),
    })

    if (solveError) {
      console.error("Error recording solve:", solveError)
      return NextResponse.json({ error: "Failed to record solve" }, { status: 500 })
    }

    // Update user rating (add points)
    const { error: ratingError } = await supabase.rpc("update_user_rating", {
      user_id: user.id,
      points_to_add: challenge.points,
    })

    if (ratingError) {
      console.error("Error updating rating:", ratingError)
    }

    // Create notification for user
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "challenge_solved",
      title: "Challenge Solved!",
      message: `Congratulations! You solved "${challenge.title}" and earned ${challenge.points} points.`,
      data: { challengeId, points: challenge.points },
    })

    return NextResponse.json({
      success: true,
      message: `Correct! You earned ${challenge.points} points.`,
      points: challenge.points,
    })
  } catch (error) {
    console.error("Flag submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
