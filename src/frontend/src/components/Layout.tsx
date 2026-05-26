import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserAuth } from "@/hooks/useUserAuth";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, X, Zap } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/", always: true },
  { label: "Apply", href: "/apply", always: true },
  { label: "My Status", href: "/status", always: true },
  { label: "Portal", href: "/portal", requiresApproved: true },
  { label: "Admin", href: "/admin", requiresAdmin: true },
] satisfies Array<{
  label: string;
  href: string;
  always?: boolean;
  requiresApproved?: boolean;
  requiresAdmin?: boolean;
}>;

export function Layout({ children }: { children: React.ReactNode }) {
  const { isConnected, isApproved, isAdmin, login, logout, loginStatus } =
    useAuth();
  const { userProfile, logout: userLogout } = useUserAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const navigate = useNavigate();

  const visibleLinks = NAV_LINKS.filter((link) => {
    if (link.always) return true;
    if (link.requiresAdmin) return isAdmin;
    if (link.requiresApproved)
      return (isConnected && isApproved) || !!userProfile;
    return true;
  });

  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-x-hidden">
      {/* Ambient background orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      >
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.22 290 / 0.6) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/3 -right-32 w-80 h-80 rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.25 315 / 0.6) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.68 0.27 305 / 0.5) 0%, transparent 70%)",
          }}
        />
        {/* Grain overlay */}
        <div className="absolute inset-0 grain" />
      </div>

      {/* Sticky Nav */}
      <header className="sticky top-0 z-50 border-b border-primary/20 backdrop-blur-xl bg-card/40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            data-ocid="nav.logo_link"
          >
            <Zap
              className="w-5 h-5 text-primary transition-smooth group-hover:text-accent"
              aria-hidden="true"
            />
            <span
              className="font-display font-bold text-xl tracking-tight"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.65 0.22 290), oklch(0.68 0.27 305), oklch(0.55 0.25 315))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 8px oklch(0.65 0.22 290 / 0.6))",
              }}
            >
              10s ONLY
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-ocid={`nav.${link.label.toLowerCase().replace(" ", "_")}_link`}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-display font-medium transition-smooth",
                  pathname === link.href
                    ? "text-primary bg-primary/10 border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {/* Regular user auth */}
            {userProfile ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs text-foreground"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.22 290), oklch(0.68 0.27 305))",
                    boxShadow: "0 0 10px oklch(0.65 0.22 290 / 0.4)",
                  }}
                  title={userProfile.name}
                >
                  {userProfile.name.slice(0, 2).toUpperCase()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    userLogout();
                    navigate({ to: "/login" });
                  }}
                  data-ocid="nav.user_logout_button"
                  className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60 transition-smooth font-display text-xs"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link
                to="/login"
                data-ocid="nav.signin_link"
                className="px-4 py-2 rounded-lg text-sm font-display font-medium border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60 transition-smooth"
              >
                Sign In
              </Link>
            )}
            {/* Admin / Internet Identity */}
            {isConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                data-ocid="nav.disconnect_button"
                className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60 transition-smooth font-display"
              >
                Disconnect
              </Button>
            ) : isAdmin ? null : (
              <Button
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="nav.connect_button"
                className="font-display font-semibold transition-smooth"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.22 290), oklch(0.55 0.25 315))",
                  boxShadow: "0 0 16px oklch(0.65 0.22 290 / 0.4)",
                }}
              >
                {isLoggingIn ? "Connecting…" : "Admin"}
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            data-ocid="nav.mobile_menu_toggle"
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-smooth"
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-primary/20 bg-card/60 backdrop-blur-xl px-4 py-4 flex flex-col gap-2">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                data-ocid={`nav.mobile_${link.label.toLowerCase().replace(" ", "_")}_link`}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-display font-medium transition-smooth",
                  pathname === link.href
                    ? "text-primary bg-primary/10 border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border/30 flex flex-col gap-2">
              {/* Regular user mobile auth */}
              {userProfile ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    userLogout();
                    setMenuOpen(false);
                    navigate({ to: "/login" });
                  }}
                  data-ocid="nav.mobile_user_logout_button"
                  className="w-full border-primary/30 text-primary hover:bg-primary/10 transition-smooth font-display text-xs"
                >
                  Sign Out ({userProfile.name.split(" ")[0]})
                </Button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.mobile_signin_link"
                  className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-display font-medium border border-primary/30 text-primary hover:bg-primary/10 transition-smooth"
                >
                  Sign In
                </Link>
              )}
              {/* Admin / II mobile */}
              {isConnected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  data-ocid="nav.mobile_disconnect_button"
                  className="w-full border-primary/30 text-primary hover:bg-primary/10 transition-smooth font-display"
                >
                  Disconnect
                </Button>
              ) : isAdmin ? null : (
                <Button
                  size="sm"
                  onClick={() => {
                    login();
                    setMenuOpen(false);
                  }}
                  disabled={isLoggingIn}
                  data-ocid="nav.mobile_connect_button"
                  className="w-full font-display font-semibold transition-smooth"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.22 290), oklch(0.55 0.25 315))",
                    boxShadow: "0 0 16px oklch(0.65 0.22 290 / 0.4)",
                  }}
                >
                  {isLoggingIn ? "Connecting…" : "Admin"}
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1">{children}</main>
    </div>
  );
}
