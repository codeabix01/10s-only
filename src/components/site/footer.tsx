"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/30 py-8 mt-auto">
      <div className="mx-auto max-w-container px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Left */}
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted font-sans font-semibold">
            Curated{" "}
            <span className="text-border mx-1.5">|</span>
            Vetted{" "}
            <span className="text-border mx-1.5">|</span>
            Exclusive
          </p>

          {/* Center: 10 circle logo */}
          <Link
            href="/"
            className="grid size-10 place-items-center rounded-full border-2 border-primary hover:opacity-80 transition-opacity"
            aria-label="10s Only home"
          >
            <span className="font-display text-sm font-bold leading-none text-primary">10</span>
          </Link>

          {/* Right */}
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted font-sans font-semibold">
            Be Real.{" "}
            <span className="text-border mx-1.5">·</span>
            Be Respectful.{" "}
            <span className="text-border mx-1.5">·</span>
            Belong.
          </p>
        </div>
      </div>
    </footer>
  );
}
