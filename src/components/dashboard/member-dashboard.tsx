"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  Moon,
  Ticket as TicketIcon,
  Sparkles,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Heart,
  Crown,
  ArrowRight,
  QrCode,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ticketsApi } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-store";
import { CITY_LABELS, VIBE_LABELS, CONFESSIONS, EVENTS } from "@/lib/mock-data";
import { getSafeEventCover } from "@/lib/event-covers";
import { UpcomingEventNotification } from "@/components/events/upcoming-event-notification";
import type { Ticket } from "@/lib/types";

// ---------------------------------------------------------------------------
// Stat tile
// ---------------------------------------------------------------------------

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Award;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card className="border border-border bg-card overflow-hidden rounded-2xl">
      <CardContent className="p-5">
        <div
          className="grid size-10 place-items-center rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${accent}22, transparent)`,
            boxShadow: `inset 0 0 18px ${accent}33`,
          }}
        >
          <Icon className="size-5" style={{ color: accent }} />
        </div>
        <div className="mt-4 font-display text-2xl font-bold">{value}</div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Ticket card with QR
// ---------------------------------------------------------------------------

function FakeQR({ payload }: { payload: string }) {
  const size = 19;
  const cells: boolean[] = [];
  let h = 0;
  for (let i = 0; i < payload.length; i++) {
    h = (h << 5) - h + payload.charCodeAt(i);
    h |= 0;
  }
  let s = Math.abs(h) + 1;
  const rng = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < size * size; i++) cells.push(rng() > 0.5);
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gap: 1,
        background: "#ffffff",
        padding: 6,
        borderRadius: 8,
      }}
      aria-label={`QR code ${payload}`}
    >
      {cells.map((on, i) => (
        <div
          key={i}
          style={{
            background: on ? "#000000" : "#ffffff",
            aspectRatio: "1 / 1",
          }}
        />
      ))}
    </div>
  );
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <div className="border border-border bg-card relative overflow-hidden rounded-2xl p-4">
      {/* Notch accents */}
      <div className="absolute -left-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-black" />
      <div className="absolute -right-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-black" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <img
            src={getSafeEventCover(ticket.event.cover, ticket.event.vibe, ticket.event.title, ticket.event.city)}
            alt={ticket.event.title}
            className="size-14 rounded-xl object-cover"
          />
          <div>
            <p className="font-display text-base font-bold leading-tight">
              {ticket.event.title}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {CITY_LABELS[ticket.event.city]} ·{" "}
              {VIBE_LABELS[ticket.event.vibe]}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {new Date(ticket.event.startsAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden w-28 sm:block">
            <FakeQR payload={ticket.qrCode} />
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Ticket
            </div>
            <div className="font-mono text-xs text-foreground">
              {ticket.qrCode}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              Seat
            </div>
            <div className="text-xs text-foreground">
              {ticket.seat ?? "General admission"}
            </div>
            <Badge className="mt-2 border border-primary/40 bg-primary/10 text-[10px] text-primary">
              {ticket.status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Member dashboard
// ---------------------------------------------------------------------------

export function MemberDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["member", "tickets", user?.id],
    queryFn: () => ticketsApi.mine(user?.id ?? "guest"),
    enabled: !!user,
  });

  // Loyalty calc — derived from tickets count
  const ticketsCount = tickets?.length ?? 0;
  const nightsAttended = Math.max(1, ticketsCount + 3); // mock baseline
  const loyalty = user?.vibeAlignment ?? 87;
  const tier = loyalty >= 90 ? "Founding" : loyalty >= 75 ? "Resident" : "Newcomer";

  return (
    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Upcoming event notification */}
      {tickets && tickets.length > 0 && (
        <UpcomingEventNotification
          ticket={
            tickets.find((t) => {
              const now = new Date().getTime();
              const eventTime = new Date(t.event.startsAt).getTime();
              return eventTime > now && eventTime - now <= 24 * 60 * 60 * 1000;
            }) || null
          }
        />
      )}
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-12 ring-1 ring-white/15">
            {user?.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : null}
            <AvatarFallback className="bg-primary/20 text-sm font-bold text-primary">
              {user?.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              Welcome, {user?.name?.split(" ")[0] ?? "Member"}
            </h1>
            <p className="text-sm text-muted-foreground">
              @{user?.handle} · {user?.city ? CITY_LABELS[user.city] : ""}
            </p>
          </div>
        </div>
        <Button
          size="lg"
          className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold "
          onClick={() => router.push("/become-host")}
        >
          <Crown className="size-4" />
          Become a Host
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={Award}
          label="Loyalty"
          value={`${loyalty}%`}
          accent="#C6A769"
        />
        <StatTile
          icon={Moon}
          label="Nights attended"
          value={String(nightsAttended)}
          accent="#A89878"
        />
        <StatTile
          icon={TicketIcon}
          label="Active tickets"
          value={String(ticketsCount)}
          accent="#C6A769"
        />
        <StatTile
          icon={Sparkles}
          label="Tier"
          value={tier}
          accent="#A89878"
        />
      </div>

      {/* Loyalty progress */}
      <Card className="border border-border bg-card mt-5 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Crown className="size-4 text-primary" />
              Tier progress
            </span>
            <Badge className="border border-primary/40 bg-primary/10 text-primary">
              {tier}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress
            value={loyalty}
            className="h-2.5"
            style={
              {
                background: "rgba(255,255,255,0.08)",
                "--progress-foreground":
                  "linear-gradient(90deg, #C6A769, #A89878)",
              } as React.CSSProperties
            }
          />
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Newcomer</span>
            <span>Resident</span>
            <span>Founding</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Tickets list */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Your tickets</h2>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-primary"
              onClick={() => router.push("/events")}
            >
              Browse more
              <ArrowRight className="size-3.5" />
            </Button>
          </div>

          {isLoading ? (
            <div className="border border-border bg-card rounded-2xl p-8 text-center text-sm text-muted-foreground">
              Loading tickets…
            </div>
          ) : tickets && tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets.map((t) => (
                <TicketCard key={t.id} ticket={t} />
              ))}
            </div>
          ) : (
            <div className="border border-border bg-card rounded-2xl p-8 text-center">
              <QrCode className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No active tickets yet.
              </p>
              <Button
                variant="ghost"
                className="mt-3 gap-1 text-primary"
                onClick={() => router.push("/events")}
              >
                Find a night
                <ArrowUpRight className="size-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Recent nights + perks */}
        <div className="space-y-5">
          {/* Recent nights */}
          <Card className="border border-border bg-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Recent nights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {EVENTS.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 p-2"
                  >
                    <img
                      src={e.cover}
                      alt={e.title}
                      className="size-10 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {e.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(e.startsAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        · {CITY_LABELS[e.city]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Perks */}
          <Card className="border border-border bg-card overflow-hidden rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">
                <Sparkles className="mr-1 inline size-4 text-primary" />
                Your perks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {[
                  "Priority access to members-only nights",
                  "Skip the line at all VOID Collective events",
                  "Free confessions wall post per night",
                  "Early-bird pricing 24h before public",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-2 text-foreground/85">
                    <Heart className="mt-0.5 size-3.5 text-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Confessions preview */}
          <Card className="border border-border bg-card rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="size-4 text-secondary" />
                Wall
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {CONFESSIONS.slice(0, 2).map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-white/5 bg-white/3 p-3 text-xs"
                  >
                    <p className="line-clamp-3 text-foreground/80">{c.body}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-2.5" />
                        {CITY_LABELS[c.city]}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="size-2.5 text-primary" />
                        {c.hearts}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
