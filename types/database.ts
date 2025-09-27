export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      desktop_apps: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          position_x: number
          position_y: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon: string
          position_x?: number
          position_y?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          position_x?: number
          position_y?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      windows: {
        Row: {
          id: string
          user_id: string
          app_id: string
          title: string
          position_x: number
          position_y: number
          width: number
          height: number
          is_minimized: boolean
          is_maximized: boolean
          z_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          app_id: string
          title: string
          position_x?: number
          position_y?: number
          width?: number
          height?: number
          is_minimized?: boolean
          is_maximized?: boolean
          z_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          app_id?: string
          title?: string
          position_x?: number
          position_y?: number
          width?: number
          height?: number
          is_minimized?: boolean
          is_maximized?: boolean
          z_index?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
