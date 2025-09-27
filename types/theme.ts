export type Theme = "dark" | "light" | "cyberpunk-neon" | "cyberpunk-orange"

export interface ThemeConfig {
  name: string
  displayName: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
  }
}

export const THEMES: Record<Theme, ThemeConfig> = {
  dark: {
    name: "dark",
    displayName: "Matrix Dark",
    description: "Classic hacker terminal theme",
    colors: {
      primary: "#00ff00",
      secondary: "#003300",
      accent: "#00cc00",
      background: "#000000",
      foreground: "#00ff00",
    },
  },
  light: {
    name: "light",
    displayName: "Light Mode",
    description: "Clean light interface",
    colors: {
      primary: "#006600",
      secondary: "#f5f5f5",
      accent: "#00aa00",
      background: "#ffffff",
      foreground: "#333333",
    },
  },
  "cyberpunk-neon": {
    name: "cyberpunk-neon",
    displayName: "Cyberpunk Neon",
    description: "Pink and cyan neon aesthetics",
    colors: {
      primary: "#ff00ff",
      secondary: "#330033",
      accent: "#00ffff",
      background: "#1a0d1a",
      foreground: "#ff00ff",
    },
  },
  "cyberpunk-orange": {
    name: "cyberpunk-orange",
    displayName: "Cyberpunk Orange",
    description: "Orange and cyan retro-futurism",
    colors: {
      primary: "#ff6600",
      secondary: "#331100",
      accent: "#00ffff",
      background: "#1a0f0d",
      foreground: "#ff9933",
    },
  },
}
