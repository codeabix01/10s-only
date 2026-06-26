"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  MapPin,
  CalendarDays,
  Users2,
  Clock,
  ArrowUpRight,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { eventsApi } from "@/lib/api-client";
import { CITY_LABELS, VIBE_LABELS } from "@/lib/mock-data";
import { getSafeEventCover, getVibeColor } from "@/lib/event-covers";
import type { EventVibe, ProposedEvent } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/ambient";
import { cn } from "@/lib/utils";

interface EventsSectionProps {
  onSelectEvent?: (event: ProposedEvent) => void;
  onApplyToJoin?: () => void;
  preview?: boolean;
}

const VIBE_QUICK_FILTERS: { value: EventVibe | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "techno", label: "Techno" },
  { value: "house", label: "House" },
  { value: "hip-hop", label: "Hip-Hop" },
  { value: "ambient", label: "Ambient" },
  { value: "drum-and-bass", label: "Drum & Bass" },
  { value: "experimental", label: "Experimental" },
];

const VISIBILITY_FILTERS: { value: "all" | "members" | "public"; label: string }[] = [
  { value: "all", label: "All Events" },
  { value: "members", label: "Members Only" },
  { value: "public", label: "Public" },
];

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatEventTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function capacityPct(e: ProposedEvent): number {
  if (e.capacity <= 0) return 0;
  return Math.min(100, Math.round((e.ticketsSold / e.capacity) * 100));
}

function EventCard({
  event,
  onSelect,
}: {
  event: ProposedEvent;
  onSelect?: (e: ProposedEvent) => void;
}) {
  const pct = capacityPct(event);
  const soldOut = event.status === "soldout" || pct >= 100;
  const accent = getVibeColor(event.vibe);
  const cover = getSafeEventCover(event.cover, event.vibe, event.title, event.city);

  return (
    <motion.button
      type="button"
      onClick={() => onSelect?.(event)}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 250, damping: 30 }}
      className="group relative block w-full h-[480px] overflow-hidden rounded-2xl border border-border bg-card text-left shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* Cover - 65% of card height */}
      <div className="relative overflow-hidden h-[312px]">
        <img
          src={cover}
          alt={event.cover ? `${event.title} cover` : event.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

        {/* Top row badges */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Badge
            className="border-none text-foreground font-sans font-semibold text-xs"
            style={{
              background: `${accent}25`,
              color: accent,
            }}
          >
            {VIBE_LABELS[event.vibe] ?? VIBE_LABELS.techno}
          </Badge>
          {soldOut ? (
            <Badge className="border border-destructive/50 bg-destructive/15 text-destructive font-sans font-semibold text-xs">
              Sold out
            </Badge>
          ) : event.visibility === "members" ? (
            <Badge className="border border-primary/40 bg-primary/15 text-primary font-sans font-semibold text-xs">
              Members
            </Badge>
          ) : event.visibility === "private" ? (
            <Badge className="border border-muted/50 bg-muted/15 text-muted font-sans font-semibold text-xs">
              Private
            </Badge>
          ) : (
            <Badge className="border border-border bg-background/80 text-foreground/80 backdrop-blur font-sans font-semibold text-xs">
              Public
            </Badge>
          )}
        </div>

        {/* Bottom meta on cover */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="font-display text-3xl font-bold leading-tight text-foreground drop-shadow tracking-tight">
            {event.title}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-foreground/85 font-sans font-normal">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" />
              {CITY_LABELS[event.city]}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {formatEventDate(event.startsAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Body - 35% of card height */}
      <div className="p-5 border-t border-border flex flex-col justify-between h-[168px]">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="min-w-0">
              <p className="truncate text-xs text-muted font-sans font-normal">
                {event.venue} · {event.hostName}
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted font-sans font-normal">
                <Clock className="size-3.5" />
                {formatEventTime(event.startsAt)}
              </p>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl font-bold text-primary tracking-tight">
                ₹{event.price.toLocaleString("en-IN")}
              </div>
              <div className="text-xs uppercase tracking-widest text-muted font-sans font-normal">
                per ticket
              </div>
            </div>
          </div>

          {/* Capacity bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted font-sans font-normal mb-2">
              <span className="inline-flex items-center gap-1">
                <Users2 className="size-4" />
                {event.ticketsSold}/{event.capacity} in
              </span>
              <span className="font-semibold">{pct}% full</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${pct}%`,
                  background: accent,
                }}
              />
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted font-sans font-semibold">View details</span>
          <span className="grid size-9 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary transition-all duration-200 group-hover:border-primary/60 group-hover:bg-primary/20">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export function EventsSection({
  onSelectEvent,
  onApplyToJoin,
  preview = false,
}: EventsSectionProps) {
  const [vibe, setVibe] = useState<EventVibe | "all">("all");
  const [visibility, setVisibility] = useState<"all" | "members" | "public">("all");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events", "list", vibe],
    queryFn: () =>
      eventsApi.list({
        vibe: vibe === "all" ? undefined : vibe,
      }),
  });

  const events = useMemo(() => {
    const raw = data ?? [];
    if (visibility === "all") return raw;
    return raw.filter((e) => e.visibility === visibility);
  }, [data, visibility]);

  const visibleEvents = preview ? events.slice(0, 3) : events;

  return (
    <section
      id="events"
      className={cn(
        "relative z-10 mx-auto w-full px-6 sm:px-8 lg:px-12",
        preview ? "py-16 sm:py-20" : "py-12 sm:py-16"
      )}
    >
      <div className="mx-auto max-w-container">
        {/* Heading — only on home page preview */}
        {preview && (
          <Reveal className="mb-12 flex flex-col items-center text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Upcoming nights
            </span>
            <h2 className="mt-4 max-w-3xl font-display text-5xl sm:text-6xl font-bold">
              The room is <span className="text-primary">open.</span>
            </h2>
          </Reveal>
        )}

      {/* Compact filter bar — only on standalone events page */}
      {!preview ? (
        <Reveal delay={0.05} className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-border/50">
            {/* Left: visibility filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {VISIBILITY_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setVisibility(f.value)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-sans font-medium tracking-wide transition-all",
                    visibility === f.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-secondary hover:text-foreground hover:border-primary/30"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {/* Right: vibe filters + filter icon */}
            <div className="flex items-center gap-2 flex-wrap">
              {VIBE_QUICK_FILTERS.filter((v) => v.value !== "all").map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setVibe(vibe === v.value ? "all" : v.value)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-sans font-medium tracking-wide transition-all",
                    vibe === v.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-secondary hover:text-foreground hover:border-primary/30"
                  )}
                >
                  {v.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setVibe("all"); setVisibility("all"); }}
                className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-sans font-medium text-secondary hover:text-foreground hover:border-primary/30 transition-all"
              >
                <SlidersHorizontal className="size-3.5" />
                Filter
              </button>
            </div>
          </div>
        </Reveal>
      ) : null}

      {/* Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-base text-muted font-sans">Loading nights…</p>
        </div>
      ) : isError ? (
        <div className="border border-border bg-card rounded-2xl p-12 text-center">
          <p className="text-base text-destructive font-sans">
            {error instanceof Error ? error.message : "Failed to load events."}
          </p>
        </div>
      ) : visibleEvents.length === 0 ? (
        <div className="border border-border bg-card rounded-2xl p-12 text-center">
          <p className="text-base text-muted font-sans mb-6">
            No nights match these filters yet.
          </p>
          {onApplyToJoin ? (
            <Button
              variant="ghost"
              className="text-primary font-semibold"
              onClick={onApplyToJoin}
            >
              Apply to join instead →
            </Button>
          ) : null}
        </div>
      ) : (
        <div
          className={cn(
            "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3",
            preview ? "lg:grid-cols-3" : "lg:grid-cols-3"
          )}
        >
          {visibleEvents.map((e, i) => (
            <Reveal key={e.id} delay={(i % 3) * 0.08}>
              <EventCard event={e} onSelect={onSelectEvent} />
            </Reveal>
          ))}
        </div>
      )}
      </div>
    </section>
  );
}
