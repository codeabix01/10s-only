"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  X,
  MapPin,
  CalendarDays,
  Clock,
  Users2,
  Building2,
  Heart,
  Quote,
  Lock,
  ArrowRight,
  Ticket as TicketIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { confessionsApi } from "@/lib/api-client";
import { CITY_LABELS, VIBE_LABELS } from "@/lib/mock-data";
import { getSafeEventCover, getVibeColor } from "@/lib/event-covers";
import type { ConfessionView, ProposedEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EventDetailModalProps {
  event: ProposedEvent | null;
  onClose: () => void;
  onReserve?: (event: ProposedEvent) => void;
  onApplyToJoin?: () => void;
}

function MetaCell({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-border bg-card rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function ConfessionWall({ vibe }: { vibe: ProposedEvent["vibe"] }) {
  const { data, isLoading } = useQuery({
    queryKey: ["confessions", vibe],
    queryFn: () => confessionsApi.list(),
  });

  const confessions: ConfessionView[] = (data ?? []).filter(
    (c) => c.vibe === vibe
  );

  if (isLoading) {
    return (
      <div className="text-xs text-muted-foreground">Loading confessions…</div>
    );
  }

  if (confessions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white/5 p-4 text-xs text-muted-foreground">
        No confessions for this vibe yet. Be the first.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {confessions.slice(0, 4).map((c) => (
        <div
          key={c.id}
          className="border border-border bg-card relative rounded-xl p-4 text-sm text-foreground/90"
        >
          <Quote
            className="absolute right-3 top-3 size-4 text-primary/40"
            aria-hidden
          />
          <p className="line-clamp-4 leading-relaxed">{c.body}</p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" />
              {CITY_LABELS[c.city]}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="size-3 text-primary" />
              {c.hearts}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EventDetailModal({
  event,
  onClose,
  onReserve,
  onApplyToJoin,
}: EventDetailModalProps) {
  const [revealed, setRevealed] = useState(false);

  if (!event) return null;

  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  const accent = getVibeColor(event.vibe);
  const cover = getSafeEventCover(event.cover, event.vibe, event.title, event.city);
  const pct =
    event.capacity > 0
      ? Math.min(100, Math.round((event.ticketsSold / event.capacity) * 100))
      : 0;
  const soldOut = event.status === "soldout" || pct >= 100;
  const isPrivate = event.visibility === "private";
  const isMembers = event.visibility === "members";

  return (
    <Dialog open={!!event} onOpenChange={(o) => !o && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/70 backdrop-blur-sm" />
        <DialogContent
          showCloseButton={false}
          className="border border-border bg-card flex h-[94vh] w-full flex-col overflow-hidden border-border bg-black/85 p-0 sm:max-w-3xl"
        >
          {/* Header cover */}
          <div className="relative">
            <img
              src={cover}
              alt={event.cover ? `${event.title} cover` : event.title}
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-border bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
            >
              <X className="size-4" />
            </button>

            {/* Header content */}
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge
                  className="border-none text-white"
                  style={{
                    background: `linear-gradient(135deg, ${accent}cc, ${accent}66)`,
                    boxShadow: `0 0 18px ${accent}55`,
                  }}
                >
                  {VIBE_LABELS[event.vibe] ?? VIBE_LABELS.techno}
                </Badge>
                {isMembers ? (
                  <Badge className="border border-primary/40 bg-primary/10 text-primary">
                    Members only
                  </Badge>
                ) : null}
                {isPrivate ? (
                  <Badge className="border border-primary/40 bg-primary/10 text-secondary">
                    Private
                  </Badge>
                ) : null}
                {soldOut ? (
                  <Badge className="border border-[#ff3b3b]/40 bg-[#ff3b3b]/20 text-destructive">
                    Sold out
                  </Badge>
                ) : null}
              </div>
              <h2 className="font-display text-2xl font-bold text-white drop-shadow sm:text-3xl">
                {event.title}
              </h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-white/80">
                by <span className="font-semibold">{event.hostName}</span>
              </p>
            </div>
          </div>

          {/* Body */}
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-5 p-5 sm:p-6">
              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetaCell
                  icon={CalendarDays}
                  label="Date"
                  value={start.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                />
                <MetaCell
                  icon={Clock}
                  label="Time"
                  value={`${start.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })} – ${end.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}`}
                />
                <MetaCell
                  icon={MapPin}
                  label="City"
                  value={CITY_LABELS[event.city]}
                />
                <MetaCell
                  icon={Users2}
                  label="Capacity"
                  value={`${event.ticketsSold}/${event.capacity}`}
                />
              </div>

              {/* Venue reveal */}
              <div className="border border-border bg-card rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-primary" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      Venue
                    </span>
                  </div>
                  {!revealed ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 text-primary"
                      onClick={() => setRevealed(true)}
                    >
                      <Lock className="size-3" />
                      Reveal
                    </Button>
                  ) : null}
                </div>
                <div className="mt-2">
                  {revealed ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="font-display text-lg font-bold text-foreground">
                        {event.venue}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.address}
                      </p>
                    </motion.div>
                  ) : (
                    <p className="font-mono text-sm text-muted-foreground">
                      ••••• ••••• ••••• — revealed on reserve
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  About this night
                </h3>
                <p className="text-sm leading-relaxed text-foreground/85">
                  {event.description}
                </p>
              </div>

              {/* Lineup */}
              {event.lineup ? (
                <div>
                  <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Lineup
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.lineup && event.lineup.length > 0
                      ? event.lineup
                          .split("·")
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .map((artist, i) => (
                            <Badge
                              key={`${artist}-${i}`}
                              variant="outline"
                              className="border-border bg-white/5 px-3 py-1 text-foreground"
                            >
                              {artist}
                            </Badge>
                          ))
                      : null}
                  </div>
                </div>
              ) : null}

              {/* Capacity meter */}
              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="uppercase tracking-wider">Capacity</span>
                  <span>{pct}% full · {event.capacity - event.ticketsSold} left</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background:
                        pct >= 90
                          ? "#C6A769"
                          : "#C6A769",
                    }}
                  />
                </div>
              </div>

              {/* Confessions wall */}
              <div>
                <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Wall · anonymous confessions
                </h3>
                <ConfessionWall vibe={event.vibe} />
              </div>
            </div>
          </ScrollArea>

          {/* Footer CTA */}
          <div className="sticky bottom-0 border-t border-border bg-black/80 p-4 backdrop-blur sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-display text-xl font-bold text-foreground">
                  ₹{event.price.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  incl. platform fee &amp; GST · members-only pricing
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                {onApplyToJoin ? (
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={onApplyToJoin}
                  >
                    Not a member? Apply →
                  </Button>
                ) : null}
                <Button
                  size="lg"
                  disabled={soldOut}
                  className={cn(
                    "h-11 gap-2 rounded-xl font-sans font-semibold",
                    soldOut
                      ? "bg-white/10 text-muted-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={() => onReserve?.(event)}
                >
                  {soldOut ? (
                    <>
                      <Lock className="size-4" />
                      Sold out
                    </>
                  ) : (
                    <>
                      <TicketIcon className="size-4" />
                      Reserve spot
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
