"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  PlusCircle,
  TrendingUp,
  Users2,
  Ticket as TicketIcon,
  IndianRupee,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Send,
  Navigation,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventsApi, hostApi, type EventCreateInput } from "@/lib/api-client";
import { CITY_LABELS, VIBE_LABELS } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";
import type { City, EventVibe, LedgerEntry, ProposedEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Stat tile
// ---------------------------------------------------------------------------

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
  delta,
}: {
  icon: typeof Users2;
  label: string;
  value: string;
  accent: string;
  delta?: string;
}) {
  return (
    <Card className="border border-border bg-card overflow-hidden rounded-2xl">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div
            className="grid size-10 place-items-center rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${accent}22, transparent)`,
              boxShadow: `inset 0 0 18px ${accent}33`,
            }}
          >
            <Icon className="size-5" style={{ color: accent }} />
          </div>
          {delta ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-primary">
              <TrendingUp className="size-3" />
              {delta}
            </span>
          ) : null}
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
// Revenue chart data
// ---------------------------------------------------------------------------

function buildRevenueSeries(ledger: LedgerEntry[]) {
  // Group revenue entries by date (yyyy-mm-dd)
  const map = new Map<string, number>();
  for (const l of ledger) {
    if (l.type === "revenue") {
      map.set(l.date, (map.get(l.date) ?? 0) + l.amount);
    }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([date, amount]) => ({
      date: date.slice(5),
      revenue: amount,
    }));
}

// ---------------------------------------------------------------------------
// Overview tab
// ---------------------------------------------------------------------------

function OverviewTab({
  events,
  ledger,
}: {
  events: ProposedEvent[];
  ledger: LedgerEntry[];
}) {
  const totalRevenue = ledger
    .filter((l) => l.type === "revenue")
    .reduce((a, b) => a + b.amount, 0);
  const totalTickets = events.reduce((a, e) => a + e.ticketsSold, 0);
  const liveCount = events.filter((e) => e.status === "live").length;
  const pendingCount = events.filter(
    (e) => e.status === "draft" || e.status === "pending"
  ).length;
  const series = buildRevenueSeries(ledger);

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={IndianRupee}
          label="Total revenue"
          value={`₹${(totalRevenue / 1000).toFixed(1)}k`}
          accent="#C6A769"
          delta="+12%"
        />
        <StatTile
          icon={TicketIcon}
          label="Tickets sold"
          value={totalTickets.toLocaleString("en-IN")}
          accent="#C6A769"
          delta="+8%"
        />
        <StatTile
          icon={CalendarDays}
          label="Live events"
          value={String(liveCount)}
          accent="#A89878"
        />
        <StatTile
          icon={Clock}
          label="Pending review"
          value={String(pendingCount)}
          accent="#A89878"
        />
      </div>

      {/* Revenue chart */}
      <Card className="border border-border bg-card rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="size-4 text-primary" />
            Revenue · last 8 entries
          </CardTitle>
          <CardDescription>
            Daily ticket revenue across all your nights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C6A769" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#C6A769" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="rgba(245,245,247,0.5)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(245,245,247,0.5)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <RTooltip
                  contentStyle={{
                    background: "rgba(0,0,0,0.92)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                  formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C6A769"
                  strokeWidth={2}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card className="border border-border bg-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Recent ledger activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ledger.slice(0, 6).map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/3 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground/90">{l.description}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {l.date} · {l.reference}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 border-border",
                    l.type === "revenue" && "border-primary/40 text-primary",
                    l.type === "payout" && "border-primary/40 text-secondary",
                    l.type === "refund" && "border-[#ff3b3b]/40 text-destructive",
                    l.type === "expense" && "border-primary/40 text-primary"
                  )}
                >
                  {l.type}
                </Badge>
                <span
                  className={cn(
                    "shrink-0 font-mono text-sm",
                    l.type === "revenue" ? "text-primary" : "text-foreground/80"
                  )}
                >
                  {l.type === "revenue" ? "+" : "−"}₹{l.amount.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// My events tab
// ---------------------------------------------------------------------------

function MyEventsTab({ events }: { events: ProposedEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="border border-border bg-card rounded-2xl p-8 text-center text-sm text-muted-foreground">
        You haven&apos;t created any events yet. Use the Create Event tab.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {events.map((e) => {
        const pct =
          e.capacity > 0
            ? Math.min(100, Math.round((e.ticketsSold / e.capacity) * 100))
            : 0;
        const isPending = e.status === "draft" || e.status === "pending";
        return (
          <div
            key={e.id}
            className="border border-border bg-card flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <img
                src={e.cover}
                alt={e.title}
                className="size-14 rounded-xl object-cover"
              />
              <div>
                <p className="font-display text-sm font-bold text-foreground">
                  {e.title}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {CITY_LABELS[e.city]} · {VIBE_LABELS[e.vibe]} ·{" "}
                  {new Date(e.startsAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <div className="text-sm font-semibold">{e.ticketsSold}/{e.capacity}</div>
                <div className="text-[11px] text-muted-foreground">{pct}% sold</div>
              </div>
              {isPending ? (
                <Badge className="border border-[#ff6b00]/40 bg-[#ff6b00]/15 text-amber-600">
                  <Clock className="size-3" />
                  Pending review
                </Badge>
              ) : e.status === "live" ? (
                <Badge className="border border-primary/40 bg-primary/15 text-primary">
                  <CheckCircle2 className="size-3" />
                  Listed
                </Badge>
              ) : e.status === "soldout" ? (
                <Badge className="border border-[#ff3b3b]/40 bg-[#ff3b3b]/15 text-destructive">
                  Sold out
                </Badge>
              ) : (
                <Badge className="border border-border bg-white/5 text-muted-foreground">
                  {e.status}
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ledger tab
// ---------------------------------------------------------------------------

function LedgerTab({ ledger }: { ledger: LedgerEntry[] }) {
  const totalRev = ledger
    .filter((l) => l.type === "revenue")
    .reduce((a, b) => a + b.amount, 0);
  const totalPayout = ledger
    .filter((l) => l.type === "payout")
    .reduce((a, b) => a + b.amount, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={IndianRupee} label="Revenue" value={`₹${(totalRev / 1000).toFixed(1)}k`} accent="#C6A769" />
        <StatTile icon={Users2} label="Payouts" value={`₹${(totalPayout / 1000).toFixed(1)}k`} accent="#A89878" />
        <StatTile icon={Activity} label="Entries" value={String(ledger.length)} accent="#C6A769" />
        <StatTile icon={TrendingUp} label="Net" value={`₹${((totalRev - totalPayout) / 1000).toFixed(1)}k`} accent="#A89878" />
      </div>

      <Card className="border border-border bg-card overflow-hidden rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">All entries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-black/70 backdrop-blur">
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((l) => (
                  <tr
                    key={l.id}
                    className="border-t border-white/5 hover:bg-white/3"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-muted-foreground">
                      {l.date}
                    </td>
                    <td className="px-4 py-2.5 text-foreground/90">
                      {l.description}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-border",
                          l.type === "revenue" && "border-primary/40 text-primary",
                          l.type === "payout" && "border-primary/40 text-secondary",
                          l.type === "refund" && "border-[#ff3b3b]/40 text-destructive",
                          l.type === "expense" && "border-primary/40 text-primary"
                        )}
                      >
                        {l.type}
                      </Badge>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right font-mono",
                        l.type === "revenue" ? "text-primary" : "text-foreground/80"
                      )}
                    >
                      {l.type === "revenue" ? "+" : "−"}₹{l.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create event tab
// ---------------------------------------------------------------------------

function CreateEventTab({ hostId, hostName }: { hostId: string; hostName: string }) {
  const qc = useQueryClient();
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [form, setForm] = useState<EventCreateInput>({
    hostId,
    hostName,
    title: "",
    vibe: "techno",
    city: "mumbai",
    venue: "",
    address: "",
    startsAt: "",
    endsAt: "",
    capacity: 200,
    price: 1500,
    description: "",
    lineup: "",
    visibility: "members",
    latitude: 0,
    longitude: 0,
  });

  function pinVenueLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        update({ latitude, longitude });
        // Reverse geocode for a human label
        let label = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address;
          label = [addr?.road, addr?.suburb ?? addr?.neighbourhood, addr?.city ?? addr?.town]
            .filter(Boolean)
            .join(", ") || label;
        } catch { /* keep coordinate fallback */ }
        setLocationLabel(label);
        setGpsLoading(false);
        toast.success("Venue location pinned.");
      },
      () => {
        setGpsLoading(false);
        toast.error("Location permission denied. Please enable it and try again.");
      }
    );
  }

  const mutation = useMutation({
    mutationFn: (input: EventCreateInput) => eventsApi.create(input),
    onSuccess: (evt) => {
      toast.success("Event submitted", {
        description: `"${evt.title}" is pending admin review.`,
      });
      qc.invalidateQueries({ queryKey: ["host", "events", hostId] });
      setLocationLabel(null);
      setForm((f) => ({
        ...f,
        title: "",
        venue: "",
        address: "",
        startsAt: "",
        endsAt: "",
        description: "",
        lineup: "",
        latitude: 0,
        longitude: 0,
      }));
    },
    onError: (err) => {
      toast.error("Failed to submit", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    },
  });

  const update = (patch: Partial<EventCreateInput>) =>
    setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.venue.trim() || !form.startsAt) {
      toast.error("Fill in title, venue, and start time.");
      return;
    }
    if (!form.latitude || !form.longitude) {
      toast.error("Pin the venue location using GPS before submitting.");
      return;
    }
    mutation.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Event title
          </Label>
          <Input
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="BUNKER 018 — Closing Night"
            className="glass-input h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Vibe</Label>
          <Select value={form.vibe} onValueChange={(v) => update({ vibe: v as EventVibe })}>
            <SelectTrigger className="glass-input h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(VIBE_LABELS) as EventVibe[]).map((v) => (
                <SelectItem key={v} value={v}>
                  {VIBE_LABELS[v]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">City</Label>
          <Select value={form.city} onValueChange={(v) => update({ city: v as City })}>
            <SelectTrigger className="glass-input h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CITY_LABELS) as City[]).map((c) => (
                <SelectItem key={c} value={c}>
                  {CITY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Venue</Label>
          <Input
            value={form.venue}
            onChange={(e) => update({ venue: e.target.value })}
            placeholder="Subterrain Bunker"
            className="glass-input h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Address</Label>
          <Input
            value={form.address}
            onChange={(e) => update({ address: e.target.value })}
            placeholder="Lower Parel, Mumbai"
            className="glass-input h-11"
          />
        </div>

        {/* GPS location — mandatory */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Venue location <span className="text-destructive">*</span>
          </Label>
          <button
            type="button"
            onClick={pinVenueLocation}
            disabled={gpsLoading}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border px-4 h-11 text-sm font-sans font-medium transition-all",
              locationLabel
                ? "border-primary/50 bg-primary/5 text-primary"
                : "border-border bg-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
          >
            {gpsLoading ? (
              <Loader2 className="size-4 animate-spin shrink-0" />
            ) : locationLabel ? (
              <CheckCircle className="size-4 shrink-0 text-primary" />
            ) : (
              <Navigation className="size-4 shrink-0" />
            )}
            <span className="truncate">
              {gpsLoading
                ? "Detecting location…"
                : locationLabel
                ? locationLabel
                : "Pin venue location using GPS"}
            </span>
            {!locationLabel && !gpsLoading && (
              <MapPin className="size-4 shrink-0 ml-auto opacity-50" />
            )}
          </button>
          {!locationLabel && (
            <p className="text-[11px] text-muted-foreground">
              Required — used to show this event in nearby discovery.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Doors open</Label>
          <Input
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => update({ startsAt: e.target.value })}
            className="glass-input h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Doors close</Label>
          <Input
            type="datetime-local"
            value={form.endsAt}
            onChange={(e) => update({ endsAt: e.target.value })}
            className="glass-input h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Capacity</Label>
          <Input
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => update({ capacity: Number(e.target.value) })}
            className="glass-input h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Price (₹)</Label>
          <Input
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => update({ price: Number(e.target.value) })}
            className="glass-input h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Visibility</Label>
          <Select
            value={form.visibility}
            onValueChange={(v) =>
              update({ visibility: v as EventCreateInput["visibility"] })
            }
          >
            <SelectTrigger className="glass-input h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="members">Members only</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Lineup</Label>
          <Input
            value={form.lineup}
            onChange={(e) => update({ lineup: e.target.value })}
            placeholder="VOID b2b PARALLAX · RHEA K · [closer TBA]"
            className="glass-input h-11"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="Eight hours, one room, no phones…"
            className="glass-input"
          />
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
        <span className="font-semibold text-primary">Heads up:</span> New events
        are saved as <span className="font-mono">draft</span> and submitted for
        admin review. Once approved, they&apos;ll appear in the public listing.
      </div>

      <Separator className="bg-white/10" />

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Drafts are visible to admins only.
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Submit for review
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Host portal
// ---------------------------------------------------------------------------

export function HostPortal() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");

  const hostId = user?.id ?? "usr_void_collective";
  const hostName = user?.hostCollective ?? user?.name ?? "VOID Collective";

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["host", "events", hostId],
    queryFn: () => eventsApi.byHost(hostId),
  });

  const { data: ledger, isLoading: ledgerLoading } = useQuery({
    queryKey: ["host", "ledger"],
    queryFn: () => hostApi.ledger(),
  });

  return (
    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="grid size-10 place-items-center rounded-xl font-display text-lg font-bold text-white"
              style={{
                background: "#C6A769",
              }}
            >
              {hostName.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold sm:text-3xl">
                Host Portal
              </h1>
              <p className="text-sm text-muted-foreground">{hostName}</p>
            </div>
          </div>
        </div>
        <Badge className="border border-primary/40 bg-primary/10 text-primary">
          <CheckCircle2 className="size-3" /> Verified host
        </Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList className="border border-border bg-card h-auto flex-wrap gap-1 rounded-2xl p-1.5">
          <TabsTrigger value="overview" className="gap-1.5 rounded-xl px-3 py-1.5">
            <LayoutDashboard className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1.5 rounded-xl px-3 py-1.5">
            <CalendarDays className="size-4" />
            My events
          </TabsTrigger>
          <TabsTrigger value="ledger" className="gap-1.5 rounded-xl px-3 py-1.5">
            <BookOpen className="size-4" />
            Ledger
          </TabsTrigger>
          <TabsTrigger value="create" className="gap-1.5 rounded-xl px-3 py-1.5">
            <PlusCircle className="size-4" />
            Create event
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {eventsLoading || ledgerLoading ? (
            <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : (
            <OverviewTab events={events ?? []} ledger={ledger ?? []} />
          )}
        </TabsContent>

        <TabsContent value="events">
          {eventsLoading ? (
            <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : (
            <MyEventsTab events={events ?? []} />
          )}
        </TabsContent>

        <TabsContent value="ledger">
          {ledgerLoading ? (
            <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : (
            <LedgerTab ledger={ledger ?? []} />
          )}
        </TabsContent>

        <TabsContent value="create">
          <Card className="border border-border bg-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Create a new event</CardTitle>
              <CardDescription>
                Fill the form. We&apos;ll auto-generate a holographic cover.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateEventTab hostId={hostId} hostName={hostName} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
