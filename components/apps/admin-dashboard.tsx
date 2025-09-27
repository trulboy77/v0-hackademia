"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import {
  Shield,
  Users,
  Flag,
  BookOpen,
  MessageSquare,
  Plus,
  Trash2,
  Ban,
  CheckCircle,
  Eye,
  EyeOff,
  Settings,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Activity,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Challenge {
  id: string
  title: string
  description: string
  category: string
  difficulty: "easy" | "medium" | "hard" | "expert"
  points: number
  is_active: boolean
  solves_count: number
  created_at: string
}

interface User {
  id: string
  email: string
  display_name: string
  role: "user" | "admin"
  rating: number
  is_banned: boolean
  created_at: string
  last_active: string
}

interface ForumThread {
  id: string
  title: string
  category: string
  is_pinned: boolean
  is_locked: boolean
  posts_count: number
  created_by: {
    display_name: string
  }
  created_at: string
}

interface Analytics {
  total_users: number
  new_users_today: number
  active_users: number
  total_challenges: number
  total_solves: number
  total_threads: number
  total_courses: number
}

const categories = [
  "Web Security",
  "Binary Exploitation",
  "System Security",
  "Cryptography",
  "Forensics",
  "Reverse Engineering",
  "Network Security",
  "Mobile Security",
]

const difficulties = ["easy", "medium", "hard", "expert"]

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [createChallengeOpen, setCreateChallengeOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([fetchAnalytics(), fetchChallenges(), fetchUsers(), fetchThreads()])
    } catch (error) {
      console.error("Error fetching admin data:", error)
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

  const fetchChallenges = async () => {
    try {
      const response = await fetch("/api/admin/challenges")
      if (response.ok) {
        const { challenges } = await response.json()
        setChallenges(challenges)
      }
    } catch (error) {
      console.error("Error fetching challenges:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const { users } = await response.json()
        setUsers(users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchThreads = async () => {
    try {
      const response = await fetch("/api/admin/forum")
      if (response.ok) {
        const { threads } = await response.json()
        setThreads(threads)
      }
    } catch (error) {
      console.error("Error fetching threads:", error)
    }
  }

  const handleCreateChallenge = async (formData: FormData) => {
    try {
      const challengeData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        difficulty: formData.get("difficulty") as string,
        points: Number.parseInt(formData.get("points") as string) || 100,
        flag: formData.get("flag") as string,
        hints: (formData.get("hints") as string)?.split("\n").filter((h) => h.trim()) || [],
        is_active: formData.get("is_active") === "on",
      }

      const response = await fetch("/api/admin/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(challengeData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Challenge created successfully",
        })
        setCreateChallengeOpen(false)
        fetchChallenges()
      } else {
        const { error } = await response.json()
        toast({
          title: "Error",
          description: error || "Failed to create challenge",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating challenge:", error)
      toast({
        title: "Error",
        description: "Failed to create challenge",
        variant: "destructive",
      })
    }
  }

  const handleToggleChallenge = async (challengeId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/challenges/${challengeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: isActive }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Challenge ${isActive ? "activated" : "deactivated"}`,
        })
        fetchChallenges()
      } else {
        const { error } = await response.json()
        toast({
          title: "Error",
          description: error || "Failed to update challenge",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating challenge:", error)
      toast({
        title: "Error",
        description: "Failed to update challenge",
        variant: "destructive",
      })
    }
  }

  const handleBanUser = async (userId: string, banned: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${banned ? "banned" : "unbanned"} successfully`,
        })
        fetchUsers()
      } else {
        const { error } = await response.json()
        toast({
          title: "Error",
          description: error || "Failed to update user status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteThread = async (threadId: string) => {
    try {
      const response = await fetch(`/api/admin/forum/${threadId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Thread deleted successfully",
        })
        fetchThreads()
      } else {
        const { error } = await response.json()
        toast({
          title: "Error",
          description: error || "Failed to delete thread",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting thread:", error)
      toast({
        title: "Error",
        description: "Failed to delete thread",
        variant: "destructive",
      })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "hard":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "expert":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Shield className="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-background text-foreground">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="challenges">CTF</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="h-full p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center">
              <Shield className="w-6 h-6 mr-2" />
              Admin Dashboard
            </h1>
            <Badge variant="outline">System Status: Operational</Badge>
          </div>

          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-primary">{analytics.total_users}</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                  <div className="text-xs text-green-400 mt-1">+{analytics.new_users_today} today</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Activity className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-primary">{analytics.active_users}</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                  <div className="text-xs text-muted-foreground mt-1">Last 24h</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Flag className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-primary">{analytics.total_challenges}</div>
                  <div className="text-sm text-muted-foreground">Challenges</div>
                  <div className="text-xs text-blue-400 mt-1">{analytics.total_solves} solves</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-primary">{analytics.total_courses}</div>
                  <div className="text-sm text-muted-foreground">Courses</div>
                  <div className="text-xs text-purple-400 mt-1">{analytics.total_threads} forum threads</div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New user registrations</span>
                    <Badge variant="secondary">+12 today</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Challenge solves</span>
                    <Badge variant="secondary">+45 today</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Forum posts</span>
                    <Badge variant="secondary">+23 today</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Course enrollments</span>
                    <Badge variant="secondary">+8 today</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rate limit violations</span>
                    <Badge variant="destructive">3 today</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Failed login attempts</span>
                    <Badge variant="destructive">15 today</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reported content</span>
                    <Badge variant="outline">2 pending</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System health</span>
                    <Badge variant="default">All systems operational</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="h-full p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">CTF Challenge Management</h2>
            <Dialog open={createChallengeOpen} onOpenChange={setCreateChallengeOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Challenge
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Challenge</DialogTitle>
                  <DialogDescription>Create a new CTF challenge for users to solve.</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleCreateChallenge(formData)
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="title">Challenge Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select name="difficulty" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map((difficulty) => (
                            <SelectItem key={difficulty} value={difficulty}>
                              {difficulty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="points">Points</Label>
                    <Input id="points" name="points" type="number" defaultValue="100" />
                  </div>
                  <div>
                    <Label htmlFor="flag">Flag</Label>
                    <Input id="flag" name="flag" required placeholder="hackademia{...}" />
                  </div>
                  <div>
                    <Label htmlFor="hints">Hints (one per line)</Label>
                    <Textarea id="hints" name="hints" placeholder="Hint 1&#10;Hint 2&#10;..." />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="is_active" name="is_active" defaultChecked />
                    <Label htmlFor="is_active">Activate immediately</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setCreateChallengeOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Challenge</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{challenge.title}</h3>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>{challenge.difficulty}</Badge>
                        <Badge variant="secondary">{challenge.points} pts</Badge>
                        {challenge.is_active ? (
                          <Badge variant="default">
                            <Eye className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{challenge.category}</span>
                        <span>{challenge.solves_count} solves</span>
                        <span>Created {new Date(challenge.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleChallenge(challenge.id, !challenge.is_active)}
                      >
                        {challenge.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Challenge</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{challenge.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="h-full p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">User Management</h2>
            <div className="flex space-x-2">
              <Input placeholder="Search users..." className="w-64" />
              <Button variant="outline">
                <UserCheck className="w-4 h-4 mr-2" />
                Export Users
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{user.display_name}</h3>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                        {user.is_banned && (
                          <Badge variant="destructive">
                            <Ban className="w-3 h-3 mr-1" />
                            Banned
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Rating: {user.rating}</span>
                        <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                        <span>Last active {new Date(user.last_active).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={user.is_banned ? "default" : "destructive"}
                        onClick={() => handleBanUser(user.id, !user.is_banned)}
                      >
                        {user.is_banned ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Unban
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 mr-1" />
                            Ban
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="community" className="h-full p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Community Management</h2>
            <div className="flex space-x-2">
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Moderate Chat
              </Button>
              <Button variant="outline">
                <Flag className="w-4 h-4 mr-2" />
                Review Reports
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {threads.map((thread) => (
              <Card key={thread.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{thread.title}</h3>
                        <Badge variant="secondary">{thread.category}</Badge>
                        {thread.is_pinned && <Badge variant="default">Pinned</Badge>}
                        {thread.is_locked && <Badge variant="destructive">Locked</Badge>}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>by {thread.created_by.display_name}</span>
                        <span>{thread.posts_count} posts</span>
                        <span>Created {new Date(thread.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Thread</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{thread.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteThread(thread.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="h-full p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Security & System Settings</h2>
            <Badge variant="default">Security Level: High</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Features</CardTitle>
                <CardDescription>Current security configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>HTTPS Enforcement</span>
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>HSTS Headers</span>
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Content Security Policy</span>
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rate Limiting</span>
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Input Validation</span>
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Server-side
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Row Level Security</span>
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enabled
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting</CardTitle>
                <CardDescription>API endpoint protection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Authentication endpoints</span>
                  <Badge variant="outline">5 req/min</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Flag submission</span>
                  <Badge variant="outline">10 req/min</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>File uploads</span>
                  <Badge variant="outline">3 req/min</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>API calls</span>
                  <Badge variant="outline">100 req/min</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Chat messages</span>
                  <Badge variant="outline">20 req/min</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Security</CardTitle>
                <CardDescription>Data protection status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Flag encryption</span>
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Hashed
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>User data encryption</span>
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    At rest
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Connection encryption</span>
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    TLS 1.3
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Backup encryption</span>
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    AES-256
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Monitoring</CardTitle>
                <CardDescription>Real-time security alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Failed login attempts</span>
                  <Badge variant="destructive">15 today</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rate limit violations</span>
                  <Badge variant="destructive">3 today</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Suspicious activity</span>
                  <Badge variant="outline">0 today</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>System uptime</span>
                  <Badge variant="default">99.9%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
