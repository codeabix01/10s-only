"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ShieldCheck, UserCircle2, Hexagon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import { authApi } from "@/lib/api-client";
import type { UserRole } from "@/lib/types";

// ---------------------------------------------------------------------------
// Nav link model
// ---------------------------------------------------------------------------

interface NavLink {
  label: string;
  href: string;
}

const PRIMARY_LINKS: NavLink[] = [
  { label: "Events", href: "/events" },
  { label: "Apply", href: "/apply" },
  { label: "Hosts", href: "/#hosts" },
  { label: "Manifesto", href: "/#manifesto" },
];

// Map role -> dashboard path (used to dedup role-aware entries)
const ROLE_DASHBOARD: Record<UserRole, string> = {
  member: "/member",
  host: "/host",
  admin: "/admin",
};

const ROLE_LABEL: Record<UserRole, string> = {
  member: "Dashboard",
  host: "Host Portal",
  admin: "Admin Console",
};

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------

export function Navbar({ onLoginClick }: { onLoginClick?: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // Use a Map to dedupe role-aware links — if a host is also authed, we never
  // want "Sign in" and "Host Portal" to both appear with the same href.
  const roleLinks = new Map<string, { label: string; href: string; icon: typeof ShieldCheck }>();
  if (isAuthenticated && user) {
    roleLinks.set(ROLE_DASHBOARD[user.role], {
      label: ROLE_LABEL[user.role],
      href: ROLE_DASHBOARD[user.role],
      icon: user.role === "admin" ? ShieldCheck : user.role === "host" ? Hexagon : UserCircle2,
    });
  }

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <header className="w-full z-40 border-b border-border/30">
      <div className="mx-auto max-w-container px-6 sm:px-8 lg:px-12">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 font-bold tracking-tight group hover:opacity-80 transition-opacity shrink-0"
            aria-label="10s Only home"
          >
          <span className="grid size-9 place-items-center rounded-full border-2 border-primary">
            <span className="font-display text-sm font-bold leading-none text-primary">10</span>
          </span>
          <span className="hidden sm:inline">
            <span className="font-display text-base font-bold text-primary tracking-tight">10s Only</span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-sans font-medium text-secondary transition-all duration-200 hover:text-foreground hover:bg-primary/10",
                isActive(link.href) && "text-foreground bg-primary/15"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated && user ? (
            <>
              {Array.from(roleLinks.values()).map((rl) => (
                <Button
                  key={rl.href}
                  asChild
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-muted-foreground font-sans font-medium hover:text-foreground hover:bg-white/8 transition-all duration-200"
                >
                  <Link href={rl.href}>
                    <rl.icon className="size-4" />
                    {rl.label}
                  </Link>
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                className="text-secondary font-sans font-medium hover:text-foreground hover:bg-primary/10 transition-all duration-200"
                onClick={logout}
              >
                Sign out
              </Button>
              <Link
                href={ROLE_DASHBOARD[user.role]}
                aria-label={`Open ${ROLE_LABEL[user.role]}`}
                className="ml-1 transition-transform duration-200 hover:scale-105"
              >
                <Avatar className="size-8 ring-1 ring-border transition-all duration-200 hover:ring-primary/40">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="bg-primary text-background text-[10px] font-bold">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="text-secondary hover:text-foreground"
                onClick={onLoginClick}
              >
                Sign in
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
              >
                <Link href="/apply">Apply Now</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>
      </div>

      {/* Mobile panel */}
      {open ? (
        <div className="mx-auto mt-2 max-w-7xl px-3 md:hidden">
          <nav
            aria-label="Mobile"
            className="border border-border bg-card flex flex-col gap-1 rounded-2xl p-3"
          >
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  isActive(link.href) && "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-white/10" />
            {isAuthenticated && user ? (
              <>
                {Array.from(roleLinks.values()).map((rl) => (
                  <Link
                    key={rl.href}
                    href={rl.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  >
                    <rl.icon className="size-4" />
                    {rl.label}
                  </Link>
                ))}
                <button
                  onClick={async () => {
                    try {
                      await authApi.signOut();
                    } finally {
                      logout();
                      setOpen(false);
                    }
                  }}
                  className="rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  onLoginClick?.();
                }}
                className="rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground"
              >
                Sign in
              </button>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
