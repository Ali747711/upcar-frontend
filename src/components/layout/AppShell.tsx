import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Menu, PanelLeftOpen } from "lucide-react"

import { cn } from "@/lib/utils"

import { Sidebar, SidebarContent } from "@/components/layout/Sidebar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

/** Two-column SaaS shell: persistent sidebar + scrollable content area. */
export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-svh bg-muted/30">
      {/* Desktop Sidebar — hidden when collapsed */}
      {sidebarOpen && <Sidebar onCollapse={() => setSidebarOpen(false)} />}

      {/* Floating reopen button — desktop only, visible when sidebar is collapsed */}
      {!sidebarOpen && (
        <Button
          variant="outline"
          size="icon"
          aria-label="Open sidebar"
          className="fixed top-2 left-2 z-30 hidden lg:flex"
          onClick={() => setSidebarOpen(true)}
        >
          <PanelLeftOpen className="size-4" />
        </Button>
      )}

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          !sidebarOpen && "lg:pl-12"
        )}
      >
        {/* Mobile Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background px-6 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="size-5" />
                <span className="sr-only">Toggle navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <SidebarContent onNavItemClick={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center overflow-hidden rounded-lg shadow-sm">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-sm font-semibold">Upcar</span>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
