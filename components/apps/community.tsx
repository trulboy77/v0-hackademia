"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Send, Pin, ThumbsUp, ThumbsDown, Plus, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/stores/auth-store"
import { formatDistanceToNow } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface ForumThread {
  id: string
  title: string
  category: string
  is_pinned: boolean
  is_locked: boolean
  created_by: string
  created_at: string
  updated_at: string
  user: {
    id: string
    display_name: string
    avatar_url?: string
  }
  _count: {
    posts: number
  }
  latest_post?: {
    created_at: string
    user: {
      display_name: string
    }
  }
  user_vote?: "upvote" | "downvote"
  upvotes: number
  downvotes: number
}

interface ForumPost {
  id: string
  content: string
  created_by: string
  created_at: string
  updated_at: string
  user: {
    id: string
    display_name: string
    avatar_url?: string
    role: string
  }
  user_vote?: "upvote" | "downvote"
  upvotes: number
  downvotes: number
  is_edited?: boolean
}

const CATEGORIES = ["General", "Tutorials", "Writeups", "Questions", "Announcements", "CTF Discussion"]

export default function Community() {
  const [activeTab, setActiveTab] = useState("chat")
  const [forumView, setForumView] = useState<"threads" | "posts">("threads")
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [isCreateThreadOpen, setIsCreateThreadOpen] = useState(false)
  const [newThreadTitle, setNewThreadTitle] = useState("")
  const [newThreadCategory, setNewThreadCategory] = useState("general")
  const [newThreadContent, setNewThreadContent] = useState("")
  const [newPostContent, setNewPostContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { user } = useAuthStore()
  const supabase = createClient()

  const fetchThreads = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/forum/threads")
      if (response.ok) {
        const data = await response.json()
        setThreads(data.threads || [])
      }
    } catch (error) {
      console.error("Error fetching threads:", error)
      toast({
        title: "Error",
        description: "Failed to load forum threads",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async (threadId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/forum/threads/${threadId}/posts`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateThread = async () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/forum/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newThreadTitle.trim(),
          content: newThreadContent.trim(),
          category: newThreadCategory,
        }),
      })

      if (response.ok) {
        setNewThreadTitle("")
        setNewThreadContent("")
        setNewThreadCategory("general")
        setIsCreateThreadOpen(false)
        fetchThreads()
        toast({
          title: "Success",
          description: "Thread created successfully",
        })
      } else {
        const data = await response.json()
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create thread",
        variant: "destructive",
      })
    }
  }

  const handleCreatePost = async () => {
    if (!selectedThread || !newPostContent.trim()) return

    try {
      const response = await fetch(`/api/forum/threads/${selectedThread.id}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPostContent.trim() }),
      })

      if (response.ok) {
        setNewPostContent("")
        fetchPosts(selectedThread.id)
        toast({
          title: "Success",
          description: "Reply posted successfully",
        })
      } else {
        const data = await response.json()
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post reply",
        variant: "destructive",
      })
    }
  }

  const handleVote = async (itemType: "thread" | "post", itemId: string, voteType: "upvote" | "downvote") => {
    try {
      const response = await fetch("/api/forum/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, itemId, voteType }),
      })

      if (response.ok) {
        // Refresh data
        if (itemType === "thread") {
          fetchThreads()
        } else {
          fetchPosts(selectedThread!.id)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to vote",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    // Placeholder for sendMessage function implementation
    setNewMessage("")
    setSending(false)
  }

  const handleEditMessage = async (messageId: string) => {
    if (!editingContent.trim()) return

    // Placeholder for editMessage function implementation
    setEditingMessageId(null)
    setEditingContent("")
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      // Placeholder for deleteMessage function implementation
    }
  }

  const startEditing = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId)
    setEditingContent(currentContent)
  }

  const cancelEditing = () => {
    setEditingMessageId(null)
    setEditingContent("")
  }

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  const canEditOrDelete = (message: any) => {
    if (!user || message.user.id !== user.id) return false

    const messageTime = new Date(message.created_at).getTime()
    const now = new Date().getTime()
    const fiveMinutes = 5 * 60 * 1000

    return now - messageTime <= fiveMinutes
  }

  useEffect(() => {
    fetchThreads()

    // Set up real-time subscription for new threads
    const threadsChannel = supabase
      .channel("forum_threads")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "forum_threads",
        },
        (payload) => {
          console.log("[v0] New thread created:", payload)
          fetchThreads() // Refresh threads list
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(threadsChannel)
    }
  }, [])

  useEffect(() => {
    if (selectedThread && forumView === "posts") {
      fetchPosts(selectedThread.id)
    }
  }, [selectedThread, forumView])

  useEffect(() => {
    // Placeholder for scrollToBottom function implementation
  }, [threads, posts])

  if (loading && activeTab === "forum") {
    return (
      <div className="h-full bg-background text-foreground flex items-center justify-center">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 animate-spin">{/* Placeholder for Loader component */}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-background text-foreground">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">Live Chat</TabsTrigger>
          <TabsTrigger value="forum">Forum</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="h-full p-4 flex flex-col">
          {/* Placeholder for chat content */}
        </TabsContent>

        <TabsContent value="forum" className="h-full p-4 space-y-4">
          {forumView === "threads" ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Forum Threads</h2>
                <Dialog open={isCreateThreadOpen} onOpenChange={setIsCreateThreadOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Thread
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Thread</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Title</Label>
                        <Input
                          value={newThreadTitle}
                          onChange={(e) => setNewThreadTitle(e.target.value)}
                          placeholder="Enter thread title..."
                          maxLength={200}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Category</Label>
                        <Input
                          value={newThreadCategory}
                          onChange={(e) => setNewThreadCategory(e.target.value)}
                          placeholder="Select category"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Content (Markdown supported)</Label>
                        <Textarea
                          value={newThreadContent}
                          onChange={(e) => setNewThreadContent(e.target.value)}
                          placeholder="Write your thread content... You can use markdown formatting."
                          className="min-h-32"
                          maxLength={10000}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateThreadOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateThread}>Create Thread</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-8 h-8 animate-spin">{/* Placeholder for Loader component */}</div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {threads.map((thread) => (
                    <Card
                      key={thread.id}
                      className="hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedThread(thread)
                        setForumView("posts")
                      }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            {thread.is_pinned && <Pin className="w-4 h-4 text-primary" />}
                            <CardTitle className="text-lg">{thread.title}</CardTitle>
                          </div>
                          <Badge variant="outline">{thread.category}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={thread.user.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{thread.user.display_name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            by {thread.user.display_name} • {formatTime(thread.created_at)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {thread._count.posts} replies
                            </span>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 px-2 ${thread.user_vote === "upvote" ? "text-green-500" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleVote("thread", thread.id, "upvote")
                                }}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                {thread.upvotes}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 px-2 ${thread.user_vote === "downvote" ? "text-red-500" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleVote("thread", thread.id, "downvote")
                                }}
                              >
                                <ThumbsDown className="w-4 h-4" />
                                {thread.downvotes}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setForumView("threads")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Threads
                </Button>
                <div>
                  <h2 className="text-xl font-bold">{selectedThread?.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    by {selectedThread?.user.display_name} • {selectedThread && formatTime(selectedThread.created_at)}
                  </p>
                </div>
              </div>

              {selectedThread && (
                <Card>
                  <CardContent className="pt-6">
                    <MarkdownRenderer content={selectedThread.content} />
                    <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 px-3 ${selectedThread.user_vote === "upvote" ? "text-green-500" : ""}`}
                          onClick={() => handleVote("thread", selectedThread.id, "upvote")}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {selectedThread.upvotes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 px-3 ${selectedThread.user_vote === "downvote" ? "text-red-500" : ""}`}
                          onClick={() => handleVote("thread", selectedThread.id, "downvote")}
                        >
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          {selectedThread.downvotes}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-8 h-8 animate-spin">{/* Placeholder for Loader component */}</div>
                </div>
              ) : (
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {posts.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={post.user.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{post.user.display_name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-sm">{post.user.display_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(post.created_at)}
                                {post.is_edited && <span className="ml-1 italic">(edited)</span>}
                              </span>
                            </div>
                            <MarkdownRenderer content={post.content} />
                            <div className="flex items-center space-x-1 mt-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 px-2 ${post.user_vote === "upvote" ? "text-green-500" : ""}`}
                                onClick={() => handleVote("post", post.id, "upvote")}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                {post.upvotes}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 px-2 ${post.user_vote === "downvote" ? "text-red-500" : ""}`}
                                onClick={() => handleVote("post", post.id, "downvote")}
                              >
                                <ThumbsDown className="w-3 h-3" />
                                {post.downvotes}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Reply (Markdown supported)</Label>
                    <Textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Write your reply... You can use markdown formatting."
                      className="min-h-24"
                      maxLength={10000}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                        <Send className="w-4 h-4 mr-2" />
                        Post Reply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
