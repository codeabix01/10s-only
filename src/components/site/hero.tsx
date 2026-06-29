"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Users2,
  Moon,
  Star,
  Lock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EVENTS, CITY_LABELS, VIBE_LABELS } from "@/lib/mock-data";
import { getSafeEventCover } from "@/lib/event-covers";
import { useLoginModal } from "./site-layout";

const HERO_STATS = [
  { label: "Members", value: "2,876", icon: Users2 },
  { label: "Nights thrown", value: "184", icon: Moon },
  { label: "Cities live", value: "8", icon: MapPin },
];

function FeaturedCard() {
  const featured = EVENTS.find((e) => e.status === "live") ?? EVENTS[0];
  const date = new Date(featured.startsAt);
  const cover = getSafeEventCover(featured.cover, featured.vibe, featured.title, featured.city);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="w-full max-w-[420px] overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
    >
      <div className="relative h-[240px] overflow-hidden">
        <img src={cover} alt={featured.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
      </div>
      <div className="px-6 pb-5 pt-5">
        <div className="flex items-center justify-between">
          <Badge className="border border-primary/50 bg-transparent text-primary font-sans font-semibold uppercase tracking-widest text-[10px] px-3 py-1">
            <Star className="size-2.5 mr-1 fill-primary" />
            Featured
          </Badge>
          <Badge className="border border-border bg-transparent text-secondary font-sans font-semibold uppercase tracking-widest text-[10px] px-3 py-1">
            {VIBE_LABELS[featured.vibe]}
          </Badge>
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold text-foreground tracking-tight leading-snug">
          {featured.title}
        </h3>
        <p className="mt-1.5 text-xs font-sans font-semibold uppercase tracking-[0.2em] text-primary">
          {featured.venue}
        </p>
        <div className="mt-4 flex items-center gap-5 text-sm text-secondary font-sans">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-primary/70" />
            {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 text-primary/70" />
            {CITY_LABELS[featured.city]}
          </span>
        </div>
        <div className="my-4 h-px bg-border" />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="size-7 rounded-full border-2 border-card"
                  style={{ background: i === 0 ? "#8B6B3A" : i === 1 ? "#5A4A30" : "#3A3020" }}
                />
              ))}
            </div>
            <span className="text-xs text-secondary font-sans font-medium">
              +{featured.ticketsSold} going
            </span>
          </div>
          <Button
            size="sm"
            className="gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold text-xs px-5 h-8"
          >
            View Details
            <ArrowRight className="size-3" />
          </Button>
        </div>
        <p className="mt-4 pt-4 border-t border-border text-[9px] uppercase tracking-[0.22em] text-muted/60 font-sans font-medium">
          Sealed at the door &nbsp;·&nbsp; {featured.hostName} &nbsp;·&nbsp; Members Only
        </p>
      </div>
    </motion.div>
  );
}

function UpcomingNights() {
  const upcoming = EVENTS.slice(0, 4);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="mt-10"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] uppercase tracking-[0.28em] text-primary font-sans font-semibold">
          Upcoming Nights
        </span>
        <div className="flex items-center gap-1">
          <button type="button" className="grid size-7 place-items-center rounded-full border border-border text-muted hover:text-foreground hover:border-primary/40 transition-all" aria-label="Previous">
            <ChevronRight className="size-3.5 rotate-180" />
          </button>
          <button type="button" className="grid size-7 place-items-center rounded-full border border-border text-muted hover:text-foreground hover:border-primary/40 transition-all" aria-label="Next">
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {upcoming.map((e) => {
          const d = new Date(e.startsAt);
          const cover = getSafeEventCover(e.cover, e.vibe, e.title, e.city);
          return (
            <div key={e.id} className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-all cursor-pointer">
              <div className="size-11 shrink-0 overflow-hidden rounded-lg">
                <img src={cover} alt={e.title} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-primary">
                  {d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }).toUpperCase()}
                </p>
                <p className="mt-0.5 truncate text-xs font-display font-bold text-foreground leading-snug">
                  {e.title.split("—")[0].trim()}
                </p>
                <p className="text-[10px] text-muted font-sans truncate">{CITY_LABELS[e.city]}</p>
              </div>
              <ChevronRight className="size-3.5 text-muted/50 group-hover:text-primary transition-colors shrink-0" />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function Hero({ onLoginClick }: { onLoginClick?: () => void }) {
  const router = useRouter();
  const openLogin = useLoginModal();
  const handleSignIn = onLoginClick ?? openLogin;

  return (
    <section className="relative z-10 mx-auto w-full px-6 pt-16 pb-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_420px] lg:items-start">
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="border-primary/40 bg-primary/8 px-3 py-1.5 text-primary font-sans font-semibold uppercase tracking-[0.2em] text-[10px] w-fit gap-1.5"
              >
                <Lock className="size-3" />
                Members Only · Underground
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-6 font-display text-6xl sm:text-7xl lg:text-8xl font-bold leading-[0.92] tracking-tight text-foreground"
            >
              The room you
              <br />
              <em className="not-italic italic text-primary">weren&apos;t</em>{" "}
              invited to.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-md text-base leading-relaxed text-secondary font-sans font-normal"
            >
              10s Only is a vetted collective of night-crafters. We curate vibe-matched parties across India — techno bunkers, Goa rooftops, modular sound baths. Apply, get matched, show up.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button
                className="h-12 gap-2 rounded-full bg-primary text-primary-foreground px-8 hover:bg-primary/90 transition-all duration-200 font-sans font-semibold text-sm uppercase tracking-widest"
                onClick={() => router.push("/apply")}
              >
                Apply Now
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="h-12 gap-2 rounded-full border-border bg-transparent text-foreground hover:bg-foreground/5 transition-all duration-200 font-sans font-medium text-sm uppercase tracking-widest"
                onClick={() => router.push("/events")}
              >
                <CalendarDays className="size-4" />
                See Events
              </Button>
              <span className="text-sm font-sans text-secondary">
                Already dancing?{" "}
                <button
                  type="button"
                  className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
                  onClick={handleSignIn}
                >
                  Sign in
                </button>
              </span>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-10 grid grid-cols-3 gap-4"
            >
              {HERO_STATS.map((s) => (
                <div key={s.label} className="border border-border bg-card rounded-xl p-4">
                  <s.icon className="size-4 text-primary mb-2" />
                  <dd className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-none">
                    {s.value}
                  </dd>
                  <dt className="text-[10px] uppercase tracking-widest text-secondary mt-2 font-sans font-semibold">
                    {s.label}
                  </dt>
                </div>
              ))}
            </motion.dl>

            <UpcomingNights />
          </div>

          <div className="flex justify-center lg:justify-end lg:pt-4">
            <FeaturedCard />
          </div>
        </div>
      </div>
    </section>
  );
}
