import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Moon, Sun, LogIn, LayoutDashboard } from "lucide-react";
import logoAsset from "@/assets/interactup-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

export function PublicTopbar() {
  const { theme, toggle } = useTheme();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl h-full px-4 md:px-6 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoAsset.url} alt="InteractUp" className="size-8 object-contain dark:invert" />
          <span className="font-display font-semibold tracking-tight text-sm">InteractUp</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          <Link to="/events" className="px-3 py-1.5 text-sm rounded-md hover:bg-muted">Events</Link>
          <Link to="/verify" className="px-3 py-1.5 text-sm rounded-md hover:bg-muted">Verify</Link>
          <Link to="/city-club" className="px-3 py-1.5 text-sm rounded-md hover:bg-muted">City club</Link>
        </nav>

        <div className="flex-1" />

        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {mounted && theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        {!loading && (user ? (
          <Link to="/dashboard">
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <LayoutDashboard className="size-4 mr-1.5" /> Dashboard
            </Button>
          </Link>
        ) : (
          <Link to="/auth">
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <LogIn className="size-4 mr-1.5" /> Sign in
            </Button>
          </Link>
        ))}
      </div>
    </header>
  );
}
