import {
  LayoutDashboard, Users, Dumbbell, BarChart3, FileText, Trophy, Activity, Settings,
  CalendarDays, PenTool, CreditCard, Wallet, type LucideIcon,
} from "lucide-react"

/**
 * One list for both menus (sidebar and phone bar), so they cannot drift apart.
 * `main` items are always visible; `more` items live in a collapsed group.
 * Nothing here removes a page: every route still works from its URL.
 */
export type NavKey =
  | "dashboard" | "players" | "calendar" | "matches" | "paymentsNav"
  | "activities" | "health" | "tactics" | "financesNav" | "charts" | "reports" | "settings"

export interface NavItem {
  href: string
  icon: LucideIcon
  label: NavKey
  adminOnly: boolean
  badge?: string
}

export const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "dashboard", adminOnly: false },
  { href: "/players", icon: Users, label: "players", adminOnly: false },
  { href: "/calendar", icon: CalendarDays, label: "calendar", adminOnly: false },
  { href: "/matches", icon: Trophy, label: "matches", adminOnly: false },
  { href: "/payments", icon: CreditCard, label: "paymentsNav", adminOnly: true },
]

export const MORE_NAV: NavItem[] = [
  { href: "/activities", icon: Dumbbell, label: "activities", adminOnly: false },
  { href: "/health", icon: Activity, label: "health", adminOnly: false, badge: "LIVE" },
  { href: "/tactics", icon: PenTool, label: "tactics", adminOnly: false },
  { href: "/finances", icon: Wallet, label: "financesNav", adminOnly: true },
  { href: "/charts", icon: BarChart3, label: "charts", adminOnly: true },
  { href: "/reports", icon: FileText, label: "reports", adminOnly: true },
]

export const SETTINGS_NAV: NavItem = { href: "/settings", icon: Settings, label: "settings", adminOnly: true }

export const visibleTo = (items: NavItem[], isAssistant: boolean) =>
  items.filter(i => !isAssistant || !i.adminOnly)
