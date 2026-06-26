"use client";

import { motion } from "framer-motion";
import { MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Reveal, SectionWrapper } from "./ambient";
import { Badge } from "@/components/ui/badge";
import { HOST_VENUES, CITY_LABELS } from "@/lib/mock-data";

interface Host {
  name: string;
  tagline: string;
  city: string;
  vibe: string;
  nights: number;
  initials: string;
  gradient: string;
}

const HOSTS: Host[] = [
  {
    name: "VOID Collective",
    tagline: "Concrete bunkers, strobe purity, all-night techno.",
    city: "Mumbai",
    vibe: "Techno · DnB",
    nights: 47,
    initials: "VC",
    gradient: "#C6A769",
  },
  {
    name: "Sunrise Society",
    tagline: "Rooftop grooves, golden-hour house, vinyl only.",
    city: "Goa",
    vibe: "House · Disco",
    nights: 22,
    initials: "SS",
    gradient: "#C6A769",
  },
  {
    name: "Subterra Sounds",
    tagline: "Bass-heavy warehouse nights and modular experiments.",
    city: "Bangalore",
    vibe: "DnB · Experimental",
    nights: 31,
    initials: "Sb",
    gradient: "#C6A769",
  },
];

export function HostsSection() {
  // Pull a few venues for the venues grid
  const venues = HOST_VENUES.slice(0, 6);

  return (
    <SectionWrapper id="hosts">
      <Reveal className="mb-10 flex flex-col items-center text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          The Hosts
        </span>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold sm:text-4xl">
          Collectives, not <span className="text-primary font-display">promoters.</span>
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Every host on 10s Only is vetted, residents-first, and accountable to
          the room. No outsourced nights, no random line-ups.
        </p>
      </Reveal>

      {/* Host cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {HOSTS.map((h, i) => (
          <Reveal key={h.name} delay={i * 0.08}>
            <motion.article
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="border border-border bg-card group relative h-full overflow-hidden rounded-2xl p-6"
            >
              {/* Hover halo */}
              <div
                aria-hidden
                className="absolute -right-10 -top-10 size-40 rounded-full opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
                style={{ background: h.gradient }}
              />

              <div className="flex items-start justify-between gap-3">
                <div
                  className="grid size-14 place-items-center rounded-2xl font-display text-xl font-bold text-white shadow-lg"
                  style={{ background: h.gradient }}
                >
                  {h.initials}
                </div>
                <Badge
                  variant="outline"
                  className="border-primary/40 bg-primary/10 text-primary"
                >
                  <ShieldCheck className="size-3" /> Verified
                </Badge>
              </div>

              <h3 className="mt-5 font-display text-xl font-bold text-foreground">
                {h.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {h.tagline}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5 text-primary" />
                  {h.city}
                </span>
                <span className="text-foreground/70">{h.vibe}</span>
                <span className="text-foreground/70">{h.nights} nights</span>
              </div>
            </motion.article>
          </Reveal>
        ))}
      </div>

      {/* Venues grid */}
      <Reveal delay={0.1} className="mt-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Featured venues
            </h3>
            <p className="text-sm text-muted-foreground">
              The physical rooms behind the nights.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {venues.map((v) => (
            <motion.div
              key={v.id}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="group relative overflow-hidden rounded-xl border border-border"
            >
              <img
                src={v.photo}
                alt={`${v.name} venue`}
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2.5">
                <p className="truncate font-display text-xs font-bold text-white">
                  {v.name}
                </p>
                <p className="truncate text-[10px] text-white/70">
                  {CITY_LABELS[v.city]} · cap {v.capacity}
                </p>
              </div>
              {v.verified ? (
                <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-primary/90 text-black">
                  <ShieldCheck className="size-3" />
                </span>
              ) : null}
            </motion.div>
          ))}
        </div>
      </Reveal>

      {/* CTA */}
      <Reveal delay={0.15} className="mt-12">
        <div className="border border-border bg-card relative overflow-hidden rounded-2xl p-6 sm:p-8">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-64 rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255,0,122,0.6), transparent 60%)",
            }}
          />
          <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display text-xl font-bold sm:text-2xl">
                Run nights, not promotions.
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Apply to host. Get vetted. Bring your collective to the room.
              </p>
            </div>
            <a
              href="/become-host"
              className="glass-button-outline inline-flex items-center gap-2 text-sm"
            >
              Become a host
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
      </Reveal>
    </SectionWrapper>
  );
}
