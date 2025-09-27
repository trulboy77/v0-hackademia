import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("course_id", params.id)
      .eq("user_id", user.id)
      .single()

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled in this course" }, { status: 400 })
    }

    // Create enrollment
    const { data: enrollment, error } = await supabase
      .from("course_enrollments")
      .insert({
        course_id: params.id,
        user_id: user.id,
        progress: 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to enroll in course" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Successfully enrolled in course",
      enrollment,
    })
  } catch (error) {
    console.error("Enrollment error:", error)
    return NextResponse.json({ error: "Failed to enroll in course" }, { status: 500 })
  }
}
