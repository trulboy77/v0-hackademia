"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Flag, Trophy, Users, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Challenge {
  id: string
  title: string
  description: string
  category: string
  difficulty: "Easy" | "Medium" | "Hard"
  points: number
  solves: number
  solved_by_user: boolean
  created_at: string
}

export function CTFChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [flagInput, setFlagInput] = useState("")
  const [activeTab, setActiveTab] = useState("list")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      const response = await fetch("/api/challenges")
      if (response.ok) {
        const data = await response.json()
        setChallenges(data.challenges || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to load challenges",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching challenges:", error)
      toast({
        title: "Error",
        description: "Failed to load challenges",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredChallenges = challenges.filter(
    (challenge) =>
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmitFlag = async () => {
    if (!selectedChallenge || !flagInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a flag",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/submit-flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId: selectedChallenge.id,
          flag: flagInput.trim(),
        }),
      })

      const data = await response.json()

      if (response.status === 429) {
        toast({
          title: "Rate Limited",
          description: data.error,
          variant: "destructive",
        })
        return
      }

      if (data.success) {
        toast({
          title: "Correct Flag! 🎉",
          description: data.message,
          variant: "default",
        })

        // Update the challenge as solved
        setChallenges((prev) =>
          prev.map((c) => (c.id === selectedChallenge.id ? { ...c, solved_by_user: true, solves: c.solves + 1 } : c)),
        )

        // Update selected challenge
        setSelectedChallenge((prev) => (prev ? { ...prev, solved_by_user: true } : null))

        setFlagInput("")
      } else {
        toast({
          title: "Incorrect Flag",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting flag:", error)
      toast({
        title: "Error",
        description: "Failed to submit flag. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Hard":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  if (loading) {
    return (
      <div className="h-full bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full bg-background text-foreground">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Challenges</TabsTrigger>
          <TabsTrigger value="challenge">Challenge</TabsTrigger>
          <TabsTrigger value="submit">Submit Flag</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="h-full p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="grid gap-4 max-h-96 overflow-y-auto">
            {filteredChallenges.map((challenge) => (
              <Card
                key={challenge.id}
                className={`cursor-pointer hover:bg-accent/50 transition-colors ${
                  challenge.solved_by_user ? "border-green-500/50 bg-green-500/5" : ""
                }`}
                onClick={() => {
                  setSelectedChallenge(challenge)
                  setActiveTab("challenge")
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      {challenge.solved_by_user && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </div>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>{challenge.difficulty}</Badge>
                  </div>
                  <CardDescription>{challenge.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Trophy className="w-4 h-4 mr-1 text-primary" />
                        {challenge.points} pts
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-muted-foreground" />
                        {challenge.solves} solves
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenge" className="h-full p-4">
          {selectedChallenge ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold">{selectedChallenge.title}</h2>
                  {selectedChallenge.solved_by_user && <CheckCircle className="w-6 h-6 text-green-500" />}
                </div>
                <Badge className={getDifficultyColor(selectedChallenge.difficulty)}>
                  {selectedChallenge.difficulty}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-primary" />
                  {selectedChallenge.points} points
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                  {selectedChallenge.solves} solves
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{selectedChallenge.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Challenge Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      📁 challenge.zip (Download)
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      🔗 Remote Server: nc challenge.hackademia.uz 1337
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={() => setActiveTab("submit")}
                className="w-full"
                disabled={selectedChallenge.solved_by_user}
              >
                {selectedChallenge.solved_by_user ? "Already Solved" : "Submit Flag"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select a challenge to view details</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="submit" className="h-full p-4">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Submit Flag</h2>

            {selectedChallenge && (
              <Card className={selectedChallenge.solved_by_user ? "border-green-500/50 bg-green-500/5" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{selectedChallenge.title}</span>
                        {selectedChallenge.solved_by_user && <CheckCircle className="w-5 h-5 text-green-500" />}
                      </CardTitle>
                      <CardDescription>
                        {selectedChallenge.points} points • {selectedChallenge.category}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            {selectedChallenge?.solved_by_user ? (
              <Card className="border-green-500/50 bg-green-500/5">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-green-500">Challenge Solved!</h3>
                    <p className="text-muted-foreground">You have already solved this challenge.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Flag</label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="flag{your_flag_here}"
                      value={flagInput}
                      onChange={(e) => setFlagInput(e.target.value)}
                      className="flex-1 font-mono"
                      disabled={submitting}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !submitting) {
                          handleSubmitFlag()
                        }
                      }}
                    />
                    <Button
                      onClick={handleSubmitFlag}
                      className="flex items-center"
                      disabled={submitting || !flagInput.trim()}
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Flag className="w-4 h-4 mr-2" />
                      )}
                      Submit
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>• Flags are case-sensitive</p>
                  <p>• Format: flag{`{content}`}</p>
                  <p>• Rate limited: 5 attempts per minute</p>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
