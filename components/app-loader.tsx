"use client"

import { lazy, Suspense } from "react"
import { Loader2 } from "lucide-react"

const CTFChallenges = lazy(() => import("./apps/ctf-challenges").then((mod) => ({ default: mod.CTFChallenges })))
const Community = lazy(() => import("./apps/community").then((mod) => ({ default: mod.Community })))
const MyProfile = lazy(() => import("./apps/my-profile").then((mod) => ({ default: mod.MyProfile })))
const Library = lazy(() => import("./apps/library").then((mod) => ({ default: mod.Library })))
const LearningHub = lazy(() => import("./apps/learning-hub").then((mod) => ({ default: mod.LearningHub })))
const Leaderboard = lazy(() => import("./apps/leaderboard").then((mod) => ({ default: mod.Leaderboard })))
const Kurslar = lazy(() => import("./apps/kurslar").then((mod) => ({ default: mod.Kurslar })))

interface AppLoaderProps {
  appName: string
  appId: string
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <div className="text-sm text-muted-foreground">Loading application...</div>
    </div>
  </div>
)

export function AppLoader({ appName, appId }: AppLoaderProps) {
  const renderApp = () => {
    switch (appName) {
      case "CTF Challenges":
        return <CTFChallenges />
      case "Community":
        return <Community />
      case "My Profile":
        return <MyProfile />
      case "Library":
        return <Library />
      case "Learning Hub":
        return <LearningHub />
      case "Leaderboard":
        return <Leaderboard />
      case "Kurslar":
        return <Kurslar />
      case "Terminal":
        return (
          <div className="p-4 bg-black text-green-400 font-mono h-full">
            <div className="mb-2">Hackademia Terminal v1.0</div>
            <div className="mb-2">Type 'help' for available commands</div>
            <div className="flex items-center">
              <span className="text-green-500">user@hackademia:~$</span>
              <span className="ml-2 animate-pulse">█</span>
            </div>
          </div>
        )
      case "File Manager":
        return (
          <div className="p-4 h-full">
            <div className="grid grid-cols-4 gap-4">
              {["Documents", "Downloads", "Pictures", "Videos", "Music", "Desktop", "Projects", "Archive"].map(
                (folder) => (
                  <div
                    key={folder}
                    className="flex flex-col items-center p-4 hover:bg-accent rounded-lg cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-2">📁</div>
                    <span className="text-sm">{folder}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        )
      case "Code Editor":
        return (
          <div className="p-4 bg-gray-900 text-gray-100 font-mono h-full">
            <div className="mb-4 text-sm text-gray-400">// Welcome to Hackademia Code Editor</div>
            <div className="text-blue-400">function</div>
            <div className="ml-4 text-yellow-400">hackTheMatrix</div>
            <div className="text-white">() {`{`}</div>
            <div className="ml-8 text-green-400">console.log('Welcome to the Matrix');</div>
            <div className="text-white">{`}`}</div>
          </div>
        )
      default:
        return (
          <div className="p-8 flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">🚧</div>
              <div className="text-lg font-medium mb-2">{appName}</div>
              <div className="text-muted-foreground">Application under development</div>
            </div>
          </div>
        )
    }
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="h-full">{renderApp()}</div>
    </Suspense>
  )
}
