"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Trophy, Settings, Calendar, Target } from "lucide-react"

interface UserProfile {
  id: string
  username: string
  email: string
  fullName: string
  avatar?: string
  joinDate: Date
  lastActive: Date
  rating: number
  rank: string
  totalPoints: number
  challengesSolved: number
  achievements: Achievement[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: Date
  rarity: "common" | "rare" | "epic" | "legendary"
}

const mockProfile: UserProfile = {
  id: "1",
  username: "cyber_warrior",
  email: "user@hackademia.uz",
  fullName: "John Doe",
  joinDate: new Date("2024-01-15"),
  lastActive: new Date(),
  rating: 1337,
  rank: "Elite Hacker",
  totalPoints: 2850,
  challengesSolved: 23,
  achievements: [
    {
      id: "1",
      title: "First Blood",
      description: "Solved your first challenge",
      icon: "🩸",
      unlockedAt: new Date("2024-01-16"),
      rarity: "common",
    },
    {
      id: "2",
      title: "SQL Ninja",
      description: "Mastered SQL injection techniques",
      icon: "🥷",
      unlockedAt: new Date("2024-02-10"),
      rarity: "rare",
    },
    {
      id: "3",
      title: "Binary Beast",
      description: "Conquered 10 binary exploitation challenges",
      icon: "🦾",
      unlockedAt: new Date("2024-03-05"),
      rarity: "epic",
    },
  ],
}

export function MyProfile() {
  const [profile, setProfile] = useState<UserProfile>(mockProfile)
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: profile.fullName,
    username: profile.username,
  })

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

  const handleSaveProfile = () => {
    setProfile({
      ...profile,
      fullName: editForm.fullName,
      username: editForm.username,
    })
    setIsEditing(false)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getNextRankProgress = () => {
    const currentPoints = profile.totalPoints
    const nextRankPoints = 3000
    return (currentPoints / nextRankPoints) * 100
  }

  return (
    <div className="h-full bg-background text-foreground">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="h-full p-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">
                    {profile.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{profile.fullName}</CardTitle>
                  <CardDescription>@{profile.username}</CardDescription>
                  <Badge className="mt-2" variant="outline">
                    {profile.rank}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{profile.rating}</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-primary" />
                  Total Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.totalPoints.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Target className="w-4 h-4 mr-2 text-primary" />
                  Challenges Solved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.challengesSolved}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Progress to Next Rank</CardTitle>
              <CardDescription>Master Hacker (3000 points)</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={getNextRankProgress()} className="mb-2" />
              <div className="text-sm text-muted-foreground">{3000 - profile.totalPoints} points remaining</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joined:</span>
                <span>{formatDate(profile.joinDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Active:</span>
                <span>{formatDate(profile.lastActive)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{profile.email}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="h-full p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Achievements</h2>
            <Badge variant="outline">{profile.achievements.length} unlocked</Badge>
          </div>

          <div className="grid gap-4 max-h-96 overflow-y-auto">
            {profile.achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <CardDescription>{achievement.description}</CardDescription>
                    </div>
                    <Badge className={getRarityColor(achievement.rarity)}>{achievement.rarity}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">Unlocked on {formatDate(achievement.unlockedAt)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="h-full p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="p-2 bg-muted rounded">{profile.fullName}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <div className="p-2 bg-muted rounded">@{profile.username}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="p-2 bg-muted rounded">{profile.email}</div>
                  </div>
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Show Profile to Others</div>
                  <div className="text-sm text-muted-foreground">Allow other users to view your profile</div>
                </div>
                <Button variant="outline" size="sm">
                  Toggle
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Show Achievements</div>
                  <div className="text-sm text-muted-foreground">Display your achievements publicly</div>
                </div>
                <Button variant="outline" size="sm">
                  Toggle
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
