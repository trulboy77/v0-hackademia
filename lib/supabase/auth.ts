import { createClient } from "./client"
import { createClient as createServerClient } from "./server"

export const auth = {
  // Sign up with email and password
  async signUp(email: string, password: string, displayName?: string) {
    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        data: {
          display_name: displayName || email.split("@")[0],
        },
      },
    })

    return { data, error }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { data, error }
  },

  // Sign out
  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current session
  async getSession() {
    const supabase = createClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    return { session, error }
  },

  // Get current user
  async getUser() {
    const supabase = createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    return { user, error }
  },

  // Reset password
  async resetPassword(email: string) {
    const supabase = createClient()

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/reset-password`,
    })

    return { data, error }
  },

  // Update password
  async updatePassword(password: string) {
    const supabase = createClient()

    const { data, error } = await supabase.auth.updateUser({
      password,
    })

    return { data, error }
  },

  // Server-side auth check
  async getServerUser() {
    const supabase = await createServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    return { user, error }
  },
}
