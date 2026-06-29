"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Search,
  X,
  CalendarDays,
  Users2,
  Clock,
  ArrowUpRight,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { eventsApi } from "@/lib/api-client";
import { CITY_LABELS, VIBE_LABELS } from "@/lib/mock-data";
import { getSafeEventCover, getVibeColor } from "@/lib/event-covers";
import type { EventVibe, ProposedEvent } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/ambient";
import { cn } from "@/lib/utils";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

async function geocodeQuery(q: string): Promise<NominatimResult[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=0`,
    { headers: { "Accept-Language": "en" } }
  );
  return res.json();
}

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
  const [radius, setRadius] = useState(25);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Location search bar state
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch Nominatim suggestions debounced
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchInput.trim().length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const results = await geocodeQuery(searchInput);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
      finally { setSuggestionsLoading(false); }
    }, 350);
  }, [searchInput]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function detectGps() {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        // Reverse geocode to get a human-readable label
        let label = "Current location";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address;
          label = addr?.suburb ?? addr?.city_district ?? addr?.city ?? addr?.state ?? "Current location";
        } catch { /* keep default label */ }
        setUserLocation({ lat, lng, label });
        setSearchInput(label);
        setShowSuggestions(false);
        setGpsLoading(false);
      },
      () => setGpsLoading(false)
    );
  }

  function selectSuggestion(s: NominatimResult) {
    const shortLabel = s.display_name.split(",").slice(0, 2).join(", ");
    setUserLocation({ lat: parseFloat(s.lat), lng: parseFloat(s.lon), label: shortLabel });
    setSearchInput(shortLabel);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  function clearLocation() {
    setUserLocation(null);
    setSearchInput("");
    setSuggestions([]);
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: userLocation
      ? ["events", "nearby", userLocation.lat, userLocation.lng, radius]
      : ["events", "list", vibe],
    queryFn: () =>
      userLocation
        ? eventsApi.nearby({ lat: userLocation.lat, lng: userLocation.lng, radius })
        : eventsApi.list({ vibe: vibe === "all" ? undefined : vibe }),
  });

  const events = useMemo(() => {
    const raw = data ?? [];
    const byVisibility = visibility === "all" ? raw : raw.filter((e) => e.visibility === visibility);
    if (userLocation && vibe !== "all") return byVisibility.filter((e) => e.vibe === vibe);
    return byVisibility;
  }, [data, visibility, userLocation, vibe]);

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

      {/* Filter bar — only on standalone events page */}
      {!preview ? (
        <Reveal delay={0.05} className="mb-8">
          <div className="flex flex-col gap-5 pb-6 border-b border-border/50">

            {/* ── Location search bar ── */}
            <div ref={searchRef} className="relative">
              <div className={cn(
                "flex items-center gap-2 rounded-xl border bg-card px-4 py-3 transition-colors",
                showSuggestions ? "border-primary/60" : "border-border hover:border-primary/30"
              )}>
                <MapPin className="size-4 shrink-0 text-primary" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search area, city or neighbourhood…"
                  className="flex-1 bg-transparent text-sm font-sans text-foreground placeholder:text-muted outline-none min-w-0"
                />
                {suggestionsLoading && <Loader2 className="size-4 shrink-0 text-muted animate-spin" />}
                {searchInput && !suggestionsLoading && (
                  <button type="button" onClick={clearLocation} className="text-muted hover:text-foreground transition-colors">
                    <X className="size-4" />
                  </button>
                )}
                <div className="h-4 w-px bg-border mx-1 shrink-0" />
                <button
                  type="button"
                  onClick={detectGps}
                  disabled={gpsLoading}
                  title="Use my current location"
                  className={cn(
                    "flex items-center gap-1.5 shrink-0 text-xs font-sans font-semibold transition-colors",
                    gpsLoading ? "text-muted" : "text-primary hover:text-primary/80"
                  )}
                >
                  {gpsLoading
                    ? <Loader2 className="size-3.5 animate-spin" />
                    : <Navigation className="size-3.5" />}
                  <span className="hidden sm:inline">{gpsLoading ? "Detecting…" : "Use GPS"}</span>
                </button>
              </div>

              {/* Suggestions dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
                  >
                    {suggestions.map((s, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onMouseDown={() => selectSuggestion(s)}
                          className="flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-primary/5 transition-colors border-b border-border/50 last:border-0"
                        >
                          <Search className="size-3.5 mt-0.5 shrink-0 text-muted" />
                          <span className="text-sm font-sans text-foreground line-clamp-1">
                            {s.display_name}
                          </span>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* ── Distance slider — shown only when a location is set ── */}
            {userLocation && (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-muted font-sans whitespace-nowrap">
                  Showing parties within{" "}
                  <span className="text-foreground font-semibold">{radius} km</span>
                  {" "}of{" "}
                  <span className="text-primary font-semibold">{userLocation.label}</span>
                </span>
                <Slider
                  min={1}
                  max={100}
                  step={1}
                  value={[radius]}
                  onValueChange={([v]) => setRadius(v)}
                  className="w-40 sm:w-56"
                />
              </div>
            )}

            {/* ── Vibe + visibility filter chips ── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
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
                  onClick={() => { setVibe("all"); setVisibility("all"); clearLocation(); }}
                  className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-sans font-medium text-secondary hover:text-foreground hover:border-primary/30 transition-all"
                >
                  <SlidersHorizontal className="size-3.5" />
                  Reset
                </button>
              </div>
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
