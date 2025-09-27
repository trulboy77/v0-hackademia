import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const status = searchParams.get("status") || "approved"

    let query = supabase
      .from("library_resources")
      .select(`
        *,
        profiles:uploaded_by (
          username,
          full_name
        )
      `)
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    const { data: resources, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 })
    }

    return NextResponse.json({ resources })
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 })
  }
}
