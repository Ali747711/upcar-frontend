import { NavLink } from "react-router-dom"
import {
  FilePlus2,
  LayoutGrid,
  LogOut,
  Moon,
  PanelLeftClose,
  Sun,
  User as UserIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/hooks/useAuth"

const NAV_ITEMS = [
  { to: "/", label: "Documents", icon: LayoutGrid, end: true },
  { to: "/documents/new", label: "New Document", icon: FilePlus2, end: false },
] as const

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun data-icon="inline-start" />
      ) : (
        <Moon data-icon="inline-start" />
      )}
      {isDark ? "Light mode" : "Dark mode"}
    </Button>
  )
}

interface SidebarContentProps {
  onNavItemClick?: () => void
  onCollapse?: () => void
}

export function SidebarContent({
  onNavItemClick,
  onCollapse,
}: SidebarContentProps) {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3 px-1">
          <div className="flex size-9 items-center justify-center overflow-hidden rounded-xl shadow-lg">
            <img
              src="/logo.png"
              alt="Upcar Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Upcar</p>
            <p className="text-xs text-muted-foreground">Parts Studio</p>
          </div>
        </div>
        {onCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavItemClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                isActive && "bg-primary/10 text-foreground hover:bg-primary/10"
              )
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t p-3">
        {user && (
          <div className="mb-2 px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <UserIcon className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {user.name || "User"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={logout}
        >
          <LogOut data-icon="inline-start" />
          Log out
        </Button>
      </div>
    </div>
  )
}

interface SidebarProps {
  onCollapse: () => void
}

export function Sidebar({ onCollapse }: SidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
      <SidebarContent onCollapse={onCollapse} />
    </aside>
  )
}
