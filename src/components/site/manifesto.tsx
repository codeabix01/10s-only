"use client";

import { motion } from "framer-motion";
import { Music4, Smartphone, Users2, Moon } from "lucide-react";
import { Reveal, SectionWrapper } from "./ambient";

interface Pillar {
  icon: typeof Music4;
  title: string;
  body: string;
  accent: string;
}

const PILLARS: Pillar[] = [
  {
    icon: Music4,
    title: "Music first",
    body: "No bottle service, no selfie stages. The rig, the room, the music — in that order.",
    accent: "#C6A769",
  },
  {
    icon: Smartphone,
    title: "Phones sealed",
    body: "Stickers on the lens at the door. The night stays off the grid, where it belongs.",
    accent: "#C6A769",
  },
  {
    icon: Users2,
    title: "Curated, not crowded",
    body: "Every member is vibe-matched. We cap capacity. If you're in, you belong.",
    accent: "#A89878",
  },
  {
    icon: Moon,
    title: "Nights, not events",
    body: "We don't sell tickets — we throw nights. From doors-open to lights-on, curated end to end.",
    accent: "#A89878",
  },
];

export function Manifesto() {
  return (
    <SectionWrapper id="manifesto">
      <Reveal className="mb-10 flex flex-col items-center text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          The Manifesto
        </span>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold sm:text-4xl">
          Four rules. <span className="text-primary font-display">No exceptions.</span>
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          This isn&apos;t a club. It isn&apos;t a promoter. It&apos;s a
          collective that runs on a strict code — and you either vibe with it,
          or you don&apos;t.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="border border-border bg-card group relative h-full rounded-2xl p-6"
            >
              {/* Top accent glow */}
              <div
                aria-hidden
                className="absolute -inset-px -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60"
                style={{
                  background: `radial-gradient(circle at 30% 0%, ${p.accent}55, transparent 60%)`,
                }}
              />
              <div
                className="mb-5 grid size-12 place-items-center rounded-xl border border-border"
                style={{
                  background: `linear-gradient(135deg, ${p.accent}22, transparent)`,
                  boxShadow: `inset 0 0 22px ${p.accent}33`,
                }}
              >
                <p.icon
                  className="size-5"
                  style={{ color: p.accent }}
                  strokeWidth={1.75}
                />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.body}
              </p>

              <div
                className="mt-5 h-px w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                style={{
                  background: `linear-gradient(90deg, ${p.accent}, transparent)`,
                }}
              />
            </motion.div>
          </Reveal>
        ))}
      </div>
    </SectionWrapper>
  );
}
