import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // For now, let's disable auth middleware to fix the import error
  // This can be re-enabled once Supabase is properly configured
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
