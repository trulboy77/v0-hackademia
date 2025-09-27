export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          rating: number
          role: "user" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          rating?: number
          role?: "user" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          rating?: number
          role?: "user" | "admin"
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
      challenges: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          difficulty: "easy" | "medium" | "hard" | "expert"
          points: number
          flag_hash: string
          hints: any[]
          files: any[]
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          difficulty: "easy" | "medium" | "hard" | "expert"
          points?: number
          flag_hash: string
          hints?: any[]
          files?: any[]
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          difficulty?: "easy" | "medium" | "hard" | "expert"
          points?: number
          flag_hash?: string
          hints?: any[]
          files?: any[]
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      solves: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          solved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          solved_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          solved_at?: string
        }
      }
      writeups: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          title: string
          content: string
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          title: string
          content: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          title?: string
          content?: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          content: any
          difficulty: "beginner" | "intermediate" | "advanced"
          is_published: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          content: any
          difficulty: "beginner" | "intermediate" | "advanced"
          is_published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          content?: any
          difficulty?: "beginner" | "intermediate" | "advanced"
          is_published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      forum_threads: {
        Row: {
          id: string
          title: string
          category: string
          is_pinned: boolean
          is_locked: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          category: string
          is_pinned?: boolean
          is_locked?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string
          is_pinned?: boolean
          is_locked?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      forum_posts: {
        Row: {
          id: string
          thread_id: string
          content: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          content: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          content?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          subject: string | null
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          subject?: string | null
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          subject?: string | null
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: any
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: any
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: any
          is_read?: boolean
          created_at?: string
        }
      }
      library_resources: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          file_url: string
          file_name: string
          file_size: number
          file_type: string
          uploaded_by: string
          status: "pending" | "approved" | "rejected"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          file_url: string
          file_name: string
          file_size: number
          file_type: string
          uploaded_by: string
          status?: "pending" | "approved" | "rejected"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          file_url?: string
          file_name?: string
          file_size?: number
          file_type?: string
          uploaded_by?: string
          status?: "pending" | "approved" | "rejected"
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      hash_flag: {
        Args: { flag_text: string }
        Returns: string
      }
      verify_flag: {
        Args: { challenge_id: string; submitted_flag: string }
        Returns: boolean
      }
      submit_solve: {
        Args: { challenge_id: string; submitted_flag: string }
        Returns: any
      }
      create_notification: {
        Args: {
          target_user_id: string
          notification_type: string
          notification_title: string
          notification_message: string
          notification_data?: any
        }
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      update_user_rating: {
        Args: { user_id: string; points_to_add: number }
        Returns: void
      }
    }
  }
}
