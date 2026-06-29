"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// AmbientBackground — fixed neon blobs + faint grid
// ---------------------------------------------------------------------------

export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Party video backdrop */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        poster="/hero-bg.jpg"
      >
        <source src="/party-bg.mp4" type="video/mp4" />
        {/* Falls back to the poster image if video can't play */}
      </video>
      {/* Dark wash over the video so foreground text stays legible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.60) 35%, rgba(10,10,10,0.82) 100%)",
        }}
      />

      {/* Three drifting neon blobs */}
      <div
        className="neon-blob animate-blob-1"
        style={{
          width: 560,
          height: 560,
          top: "-12%",
          left: "-8%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,0,122,0.55), transparent 60%)",
        }}
      />
      <div
        className="neon-blob animate-blob-2"
        style={{
          width: 620,
          height: 620,
          top: "10%",
          right: "-10%",
          background:
            "radial-gradient(circle at 70% 30%, rgba(104,0,255,0.45), transparent 60%)",
        }}
      />
      <div
        className="neon-blob animate-blob-3"
        style={{
          width: 520,
          height: 520,
          bottom: "-15%",
          left: "30%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,229,255,0.32), transparent 60%)",
        }}
      />

      {/* Faint grid overlay */}
      <div className="grid-bg absolute inset-0 opacity-60" />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SectionWrapper — consistent vertical rhythm + max-width container
// ---------------------------------------------------------------------------

export function SectionWrapper({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        "py-16 sm:py-20 lg:py-24",
        className
      )}
    >
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Reveal — framer-motion scroll reveal
// ---------------------------------------------------------------------------

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "li" | "span";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <MotionTag
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}
