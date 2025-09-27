"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, TrendingUp, Calendar, Target, Star, Zap, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LeaderboardEntry {
  id: string
  rank: number
  username: string
  full_name: string
  avatar_url?: string
  total_points: number
  challenges_solved: number
  rating: number
  country?: string
  last_active: string
  rank_change?: number
  monthly_points?: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  category: string
  earned_at?: string
  profiles?: {
    username: string
    full_name: string
  }
}

interface UserStats {
  rank: number
  total_points: number
  challenges_solved: number
  rating: number
  achievements_count: number
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("global")
  const [timeframe, setTimeframe] = useState("all-time")
  const { toast } = useToast()

  useEffect(() => {
    fetchLeaderboard()
    fetchUserStats()
  }, [timeframe])

  useEffect(() => {
    if (activeTab === "achievements") {
      fetchAchievements()
    }
  }, [activeTab])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append("timeframe", timeframe)
      params.append("limit", "50")

      const response = await fetch(`/api/leaderboard?${params}`)
      if (response.ok) {
        const { leaderboard } = await response.json()
        setLeaderboard(leaderboard)
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      toast({
        title: "Error",
        description: "Failed to load leaderboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAchievements = async () => {
    try {
      const response = await fetch("/api/leaderboard/achievements")
      if (response.ok) {
        const { achievements } = await response.json()
        setAchievements(achievements)
      }
    } catch (error) {
      console.error("Error fetching achievements:", error)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch("/api/leaderboard/user-stats")
      if (response.ok) {
        const { userStats } = await response.json()
        setUserStats(userStats)
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">#{rank}</span>
    }
  }

  const getTrendIcon = (change?: number) => {
    if (!change) return null
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-400" />
    } else if (change < 0) {
      return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
    }
    return null
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      case "rare":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "epic":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "legendary":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return "now"
  }

  return (
    <div className="h-full bg-background text-foreground">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="profile">My Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="h-full p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Global Leaderboard</h1>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm"
            >
              <option value="all-time">All Time</option>
              <option value="this-year">This Year</option>
              <option value="this-month">This Month</option>
              <option value="this-week">This Week</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading leaderboard...</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {leaderboard.map((entry) => (
                <Card key={entry.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(entry.rank)}
                        {getTrendIcon(entry.rank_change)}
                      </div>

                      <Avatar className="w-10 h-10">
                        <AvatarImage src={entry.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {entry.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{entry.full_name}</span>
                          <span className="text-sm text-muted-foreground">@{entry.username}</span>
                          {entry.country && <span>{entry.country}</span>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Last active {formatLastActive(entry.last_active)}
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-center">
                            <div className="font-bold text-primary">{entry.total_points.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Points</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{entry.challenges_solved}</div>
                            <div className="text-xs text-muted-foreground">Solved</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{entry.rating}</div>
                            <div className="text-xs text-muted-foreground">Rating</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {leaderboard.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No leaderboard data available.</div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="monthly" className="h-full p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Monthly Champions</h2>
            <Badge variant="outline">
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {leaderboard.slice(0, 3).map((entry, index) => (
              <Card key={entry.id} className="text-center">
                <CardHeader className="pb-2">
                  <div className="flex justify-center mb-2">{getRankIcon(index + 1)}</div>
                  <Avatar className="w-16 h-16 mx-auto">
                    <AvatarImage src={entry.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {entry.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg">{entry.full_name}</CardTitle>
                  <CardDescription>@{entry.username}</CardDescription>
                  <div className="mt-2 text-sm">
                    <div className="font-bold text-primary">
                      {(entry.monthly_points || entry.total_points).toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">points this month</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Monthly Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{leaderboard.length}</div>
                  <div className="text-muted-foreground">Active Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {leaderboard.reduce((sum, entry) => sum + entry.challenges_solved, 0)}
                  </div>
                  <div className="text-muted-foreground">Total Solves</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="h-full p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Achievements</h2>
            <Badge variant="outline">{achievements.length} recent</Badge>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {achievements.map((achievement) => (
              <Card key={`${achievement.id}-${achievement.earned_at}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <CardDescription>{achievement.description}</CardDescription>
                    </div>
                    <Badge className={getRarityColor(achievement.rarity)}>{achievement.rarity}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {achievement.earned_at && achievement.profiles && (
                      <>
                        Earned by {achievement.profiles.username} • {formatLastActive(achievement.earned_at)}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {achievements.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No recent achievements to display.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="profile" className="h-full p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">My Statistics</h2>
            <Button onClick={fetchUserStats} size="sm" variant="outline">
              Refresh
            </Button>
          </div>

          {userStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Crown className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold text-primary">#{userStats.rank}</div>
                    <div className="text-sm text-muted-foreground">Global Rank</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-primary">{userStats.total_points.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Points</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-primary">{userStats.challenges_solved}</div>
                    <div className="text-sm text-muted-foreground">Challenges Solved</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-primary">{userStats.rating}</div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Achievements Earned</span>
                      <Badge variant="secondary">{userStats.achievements_count}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Points per Challenge</span>
                      <Badge variant="secondary">
                        {userStats.challenges_solved > 0
                          ? Math.round(userStats.total_points / userStats.challenges_solved)
                          : 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Sign in to view your statistics.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
