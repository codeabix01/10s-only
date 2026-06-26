"use client";

import { useState, useCallback, type ReactNode } from "react";
import { AmbientBackground } from "./ambient";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { LoginModal } from "@/components/auth/login-modal";

interface SiteLayoutProps {
  children: ReactNode;
  /** Pass false on auth pages where a navbar-driven login modal isn't needed. */
  showLoginModal?: boolean;
  /** Hide footer (e.g. dashboard pages sometimes prefer chrome-less layouts). */
  showFooter?: boolean;
}

export function SiteLayout({
  children,
  showLoginModal = true,
  showFooter = true,
}: SiteLayoutProps) {
  const [loginOpen, setLoginOpen] = useState(false);
  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  return (
    <div className="relative flex min-h-screen flex-col">
      <AmbientBackground />
      <Navbar onLoginClick={openLogin} />
      <main className="relative z-10 flex-1">{children}</main>
      {showFooter ? <Footer /> : null}
      {showLoginModal ? (
        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} onClose={closeLogin} />
      ) : null}
    </div>
  );
}
