"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Volume2, VolumeX, MessageCircle, Send, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Comment {
  id: string
  content: string
  timestamp: number
  created_at: string
  profiles: {
    username: string
    full_name: string
    avatar_url?: string
  }
}

interface VideoPlayerProps {
  videoUrl: string
  lessonId: string
  title: string
}

export function VideoPlayer({ videoUrl, lessonId, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [showComments, setShowComments] = useState(false)
  const [loading, setLoading] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchComments()
  }, [lessonId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/learning/lessons/${lessonId}/comments`)
      if (response.ok) {
        const { comments } = await response.json()
        setComments(comments)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp
      setCurrentTime(timestamp)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      setLoading(true)
      const response = await fetch(`/api/learning/lessons/${lessonId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          timestamp: Math.floor(currentTime),
        }),
      })

      if (response.ok) {
        const { comment } = await response.json()
        setComments([...comments, comment])
        setNewComment("")
        toast({
          title: "Success",
          description: "Comment added successfully",
        })
      } else {
        const { error } = await response.json()
        toast({
          title: "Error",
          description: error || "Failed to add comment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getCommentsAtTime = (time: number) => {
    return comments.filter(
      (comment) => Math.abs(comment.timestamp - time) <= 5, // 5 second window
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full aspect-video"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center space-x-4">
                <Button size="sm" variant="ghost" onClick={handlePlayPause}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                <Button size="sm" variant="ghost" onClick={handleMute}>
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>

                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <Button size="sm" variant="ghost" onClick={() => setShowComments(!showComments)}>
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Timestamped Comments Overlay */}
            {getCommentsAtTime(currentTime).map((comment) => (
              <div key={comment.id} className="absolute top-4 right-4 bg-black/80 text-white p-2 rounded-lg max-w-xs">
                <div className="text-xs text-gray-300 mb-1">
                  {comment.profiles.username} at {formatTime(comment.timestamp)}
                </div>
                <div className="text-sm">{comment.content}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      {showComments && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Timestamped Comments ({comments.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Comment */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Comment at {formatTime(currentTime)}</span>
              </div>
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Add a comment at this timestamp..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddComment} disabled={loading || !newComment.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 p-3 bg-accent/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{comment.profiles.username}</span>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/20"
                        onClick={() => handleSeek(comment.timestamp)}
                      >
                        {formatTime(comment.timestamp)}
                      </Badge>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">No comments yet. Be the first to add one!</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
