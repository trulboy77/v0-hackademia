import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@supabase/supabase-js"

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isLoading: false }),
    }),
    {
      name: "hackademia-auth",
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
