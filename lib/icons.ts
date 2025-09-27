import {
  Terminal,
  Folder,
  Code,
  Globe,
  Settings,
  Calculator,
  FileText,
  Music,
  AppWindow as Window,
  User,
  Shield,
  Trophy,
  BookOpen,
  MessageSquare,
  Bell,
  Mail,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Star,
  Heart,
  Flag,
  Target,
  Award,
  type LucideIcon,
} from "lucide-react"

// Icon mapping for the application
const iconMap: Record<string, LucideIcon> = {
  // Desktop apps
  terminal: Terminal,
  folder: Folder,
  code: Code,
  globe: Globe,
  settings: Settings,
  calculator: Calculator,
  "file-text": FileText,
  music: Music,
  window: Window,

  // User and profile icons
  user: User,
  shield: Shield,
  trophy: Trophy,

  // Content and learning icons
  "book-open": BookOpen,
  target: Target,
  award: Award,
  flag: Flag,

  // Communication icons
  "message-square": MessageSquare,
  bell: Bell,
  mail: Mail,

  // Action icons
  search: Search,
  plus: Plus,
  edit: Edit,
  "trash-2": Trash2,
  eye: Eye,
  "eye-off": EyeOff,
  lock: Lock,
  unlock: Unlock,
  star: Star,
  heart: Heart,
}

/**
 * Get the appropriate Lucide React icon component for a given icon name
 * @param iconName - The string name of the icon
 * @returns The corresponding Lucide React icon component
 */
export function getIconComponent(iconName: string): LucideIcon {
  return iconMap[iconName] || Terminal // Default to Terminal icon if not found
}

/**
 * Get all available icon names
 * @returns Array of available icon name strings
 */
export function getAvailableIcons(): string[] {
  return Object.keys(iconMap)
}

/**
 * Check if an icon name exists in the icon map
 * @param iconName - The icon name to check
 * @returns Boolean indicating if the icon exists
 */
export function hasIcon(iconName: string): boolean {
  return iconName in iconMap
}
