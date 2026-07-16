import { type ReactNode, useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Trophy, Building2, Mail, Calendar, Users, GraduationCap,
  Briefcase, Megaphone, Award, FileText, FileStack, BarChart3, Settings,
  Menu, Moon, Sun, LogOut, User as UserIcon, ShieldCheck,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/interactup-logo.png.asset.json";

type Item = { label: string; to: string; icon: React.ComponentType<{ className?: string }> };

const NAV: Item[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Sponsors", to: "/sponsors", icon: Trophy },
  { label: "Companies", to: "/companies", icon: Building2 },
  { label: "Outreach", to: "/outreach", icon: Mail },
  { label: "Events", to: "/manage-events", icon: Calendar },
  { label: "Community", to: "/community", icon: Users },
  { label: "Mentors", to: "/mentors", icon: GraduationCap },
  { label: "Internships", to: "/internships", icon: Briefcase },
  { label: "Marketing", to: "/marketing", icon: Megaphone },
  { label: "Certificates", to: "/certificates", icon: Award },
  { label: "Documents", to: "/documents", icon: FileText },
  { label: "Templates", to: "/templates", icon: FileStack },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAdmin } = useAuth();
  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-4 h-14 flex items-center gap-2 border-b border-sidebar-border">
        <div className="size-7 rounded-md bg-accent text-accent-foreground grid place-items-center">
          <Sparkles className="size-4" strokeWidth={2.5} />
        </div>
        <span className="font-display font-semibold tracking-tight text-sm">InteractUp OS</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-sidebar-border space-y-0.5">
          {isAdmin && (
            <Link
              to="/users"
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors",
                pathname.startsWith("/users")
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/40"
              )}
            >
              <ShieldCheck className="size-4" />
              <span>Users</span>
            </Link>
          )}
          <Link
            to="/settings"
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors",
              pathname.startsWith("/settings")
                ? "bg-accent text-accent-foreground font-medium"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/40"
            )}
          >
            <Settings className="size-4" />
            <span>Settings</span>
          </Link>
        </div>
      </nav>

      <div className="p-3 border-t border-sidebar-border text-[11px] text-muted-foreground">
        v0.1 · Phase 1
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.email ?? "U").slice(0, 2).toUpperCase();
  const primaryRole = roles[0] ?? "member";

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 border-r border-border shrink-0">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 border-b border-border flex items-center gap-2 px-3 md:px-5 bg-background/80 backdrop-blur sticky top-0 z-30">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <div className="size-7 rounded-full bg-accent text-accent-foreground grid place-items-center text-xs font-semibold">
                  {initials}
                </div>
                <span className="hidden sm:block text-sm font-medium max-w-[140px] truncate">
                  {user?.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="text-sm font-medium truncate">{user?.email}</div>
                <div className="text-xs text-muted-foreground capitalize">{primaryRole.replace("_", " ")}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                <UserIcon className="size-4 mr-2" /> Profile & Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/auth", replace: true });
                }}
              >
                <LogOut className="size-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
