"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  content: string
  created_at: string
  updated_at: string
  is_edited: boolean
  user: {
    id: string
    username: string
    avatar_url?: string
  }
}

export function useRealtimeMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [onlineUsers, setOnlineUsers] = useState(0)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial messages
    fetchMessages()

    // Set up real-time subscription for messages
    const messagesChannel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          console.log("[v0] New message received:", payload)
          // Fetch the complete message with user data
          fetchNewMessage(payload.new.id)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          console.log("[v0] Message updated:", payload)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id
                ? { ...msg, content: payload.new.content, is_edited: payload.new.is_edited }
                : msg,
            ),
          )
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          console.log("[v0] Message deleted:", payload)
          setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id))
        },
      )
      .subscribe()

    // Set up presence tracking for online users
    const presenceChannel = supabase
      .channel("online-users")
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState()
        setOnlineUsers(Object.keys(state).length)
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("[v0] User joined:", key, newPresences)
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("[v0] User left:", key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user) {
            await presenceChannel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            })
          }
        }
      })

    return () => {
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(presenceChannel)
    }
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages?limit=50")
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchNewMessage = async (messageId: string) => {
    try {
      const { data: message, error } = await supabase
        .from("messages")
        .select(`
          id,
          content,
          created_at,
          updated_at,
          is_edited,
          user:users!user_id(id, username, avatar_url)
        `)
        .eq("id", messageId)
        .single()

      if (!error && message) {
        setMessages((prev) => [...prev, message])
      }
    } catch (error) {
      console.error("Error fetching new message:", error)
    }
  }

  const sendMessage = async (content: string) => {
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send message")
      }

      return true
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      })
      return false
    }
  }

  const editMessage = async (messageId: string, content: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to edit message")
      }

      return true
    } catch (error) {
      console.error("Error editing message:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to edit message",
        variant: "destructive",
      })
      return false
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete message")
      }

      return true
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete message",
        variant: "destructive",
      })
      return false
    }
  }

  return {
    messages,
    loading,
    onlineUsers,
    sendMessage,
    editMessage,
    deleteMessage,
  }
}
