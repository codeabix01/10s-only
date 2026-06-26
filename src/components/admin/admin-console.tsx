"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell as RCell,
} from "recharts";
import {
  Users2,
  CalendarDays,
  IndianRupee,
  Activity,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ListPlus,
  Building2,
  MapPin,
  TrendingUp,
  BadgeCheck,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  applicationsApi,
  eventsApi,
  adminApi,
  hostAppApi,
} from "@/lib/api-client";
import { CITY_LABELS, VIBE_LABELS } from "@/lib/mock-data";
import { getSafeEventCover } from "@/lib/event-covers";
import { toast } from "sonner";
import type {
  Application,
  City,
  CityStat,
  HostApplication,
  ProposedEvent,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Stat tile
// ---------------------------------------------------------------------------

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users2;
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
// Member Approvals
// ---------------------------------------------------------------------------

function MemberApprovalsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "applications"],
    queryFn: () => applicationsApi.list(),
  });

  const review = useMutation({
    mutationFn: ({
      id,
      decision,
      note,
    }: {
      id: string;
      decision: "approved" | "rejected" | "waitlisted";
      note?: string;
    }) => applicationsApi.review(id, decision, note),
    onSuccess: (_app, vars) => {
      toast.success(`Application ${vars.decision}`, {
        description: `${vars.id.toUpperCase()} marked ${vars.decision}.`,
      });
      qc.invalidateQueries({ queryKey: ["admin", "applications"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed"),
  });

  if (isLoading) return <Loading />;
  const apps = (data ?? []).filter((a) => a.status === "pending");
  if (apps.length === 0)
    return <EmptyState label="No pending member applications." />;

  return (
    <div className="space-y-3">
      {apps.map((a) => (
        <MemberAppCard key={a.id} app={a} onReview={review.mutate} busy={review.isPending} />
      ))}
    </div>
  );
}

function MemberAppCard({
  app,
  onReview,
  busy,
}: {
  app: Application;
  onReview: (input: {
    id: string;
    decision: "approved" | "rejected" | "waitlisted";
    note?: string;
  }) => void;
  busy: boolean;
}) {
  const [note, setNote] = useState("");
  const appAny = app as Application & {
    fullName?: string;
    emailOrPhone?: string;
    city?: string;
  };
  const contact = appAny.emailOrPhone ?? "";
  const fallbackName = appAny.fullName || "Unknown member";
  const fallbackHandle =
    (contact.split("@")[0] || fallbackName)
      .replace(/[^a-z0-9._-]/gi, "")
      .toLowerCase() || "member";
  const fallbackCity =
    (typeof appAny.city === "string" ? (appAny.city as City) : undefined) ??
    "mumbai";
  const answerCount = Array.isArray(appAny.answers) ? appAny.answers.length : 0;
  const applicant = app.user ?? {
    id: app.userId,
    name: fallbackName,
    handle: fallbackHandle,
    email: contact.includes("@") ? contact : "",
    phone: contact.includes("@") ? undefined : contact,
    avatar: "",
    role: "member" as const,
    city: fallbackCity,
    joinedAt: app.submittedAt,
    verified: false,
  };
  return (
    <Card className="border border-border bg-card rounded-2xl">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="size-12 ring-1 ring-white/15">
              {applicant.avatar ? (
                <AvatarImage src={applicant.avatar} alt={applicant.name} />
              ) : null}
              <AvatarFallback className="bg-primary/20 text-xs font-bold text-primary">
                {applicant.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-display text-base font-bold">{applicant.name}</p>
              <p className="text-xs text-muted-foreground">
                @{applicant.handle} · {CITY_LABELS[applicant.city]} ·{" "}
                {new Date(app.submittedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge className="border border-primary/40 bg-primary/10 text-primary">
                  <Activity className="size-3" />
                  Vibe {app.vibeAlignment}%
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {answerCount} answers
                </span>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-64">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Reviewer note (optional)
            </Label>
            <Textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why this decision?"
              className="glass-input mt-1 text-xs"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            disabled={busy}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
            onClick={() => onReview({ id: app.id, decision: "approved", note })}
          >
            <CheckCircle2 className="size-3.5" /> Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            className="gap-1.5 border-[#ff6b00]/40 text-[#ff6b00]"
            onClick={() => onReview({ id: app.id, decision: "waitlisted", note })}
          >
            <Clock className="size-3.5" /> Waitlist
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            className="gap-1.5 border-[#ff3b3b]/40 text-[#ff3b3b]"
            onClick={() => onReview({ id: app.id, decision: "rejected", note })}
          >
            <XCircle className="size-3.5" /> Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Event Approvals
// ---------------------------------------------------------------------------

function EventApprovalsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "pending-events"],
    queryFn: () => eventsApi.pending(),
  });

  const approve = useMutation({
    mutationFn: (id: string) => eventsApi.approveEvent(id),
    onSuccess: (e) => {
      toast.success("Event approved", { description: `"${e.title}" is now live.` });
      qc.invalidateQueries({ queryKey: ["admin", "pending-events"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed"),
  });
  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      eventsApi.rejectEvent(id, reason),
    onSuccess: (e) => {
      toast.success("Event rejected", { description: `"${e.title}"` });
      qc.invalidateQueries({ queryKey: ["admin", "pending-events"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed"),
  });

  if (isLoading) return <Loading />;
  const pending = (data ?? []).filter(
    (e) => e.status === "draft" || e.status === "pending"
  );
  if (pending.length === 0)
    return <EmptyState label="No pending events to review." />;

  return (
    <div className="space-y-3">
      {pending.map((e) => (
        <PendingEventCard
          key={e.id}
          event={e}
          onApprove={(id) => approve.mutate(id)}
          onReject={(id, reason) => reject.mutate({ id, reason })}
          busy={approve.isPending || reject.isPending}
        />
      ))}
    </div>
  );
}

function PendingEventCard({
  event,
  onApprove,
  onReject,
  busy,
}: {
  event: ProposedEvent;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  busy: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <Card className="border border-border bg-card rounded-2xl">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row">
          <img
            src={getSafeEventCover(event.cover, event.vibe, event.title, event.city)}
            alt={event.title}
            className="aspect-[16/9] w-full rounded-xl object-cover sm:w-48"
          />
          <div className="flex-1">
            <p className="font-display text-base font-bold">{event.title}</p>
            <p className="text-xs text-muted-foreground">
              by {event.hostName} · {CITY_LABELS[event.city]} ·{" "}
              {VIBE_LABELS[event.vibe]}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
              <span>{new Date(event.startsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              <span>·</span>
              <span>Cap {event.capacity}</span>
              <span>·</span>
              <span>₹{event.price.toLocaleString("en-IN")}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-foreground/75">
              {event.description}
            </p>
            <div className="mt-3">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Rejection reason (if any)
              </Label>
              <Textarea
                rows={1}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why reject?"
                className="glass-input mt-1 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            disabled={busy}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
            onClick={() => onApprove(event.id)}
          >
            <CheckCircle2 className="size-3.5" /> Approve & list
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            className="gap-1.5 border-[#ff3b3b]/40 text-[#ff3b3b]"
            onClick={() => onReject(event.id, reason || "Does not meet guidelines")}
          >
            <XCircle className="size-3.5" /> Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Host Applications
// ---------------------------------------------------------------------------

function HostApplicationsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "host-applications"],
    queryFn: () => hostAppApi.list(),
  });

  const review = useMutation({
    mutationFn: ({
      id,
      decision,
      note,
    }: {
      id: string;
      decision: "approved" | "rejected" | "revision";
      note?: string;
    }) => hostAppApi.review(id, decision, note),
    onSuccess: (a, vars) => {
      toast.success(`Host ${vars.decision}`, {
        description: `${a.collectiveName} marked ${vars.decision}.`,
      });
      qc.invalidateQueries({ queryKey: ["admin", "host-applications"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed"),
  });

  if (isLoading) return <Loading />;
  const apps = (data ?? []).filter(
    (a) => a.status === "pending" || a.status === "revision"
  );
  if (apps.length === 0)
    return <EmptyState label="No pending host applications." />;

  return (
    <div className="space-y-3">
      {apps.map((a) => (
        <HostAppCard key={a.id} app={a} onReview={review.mutate} busy={review.isPending} />
      ))}
    </div>
  );
}

function HostAppCard({
  app,
  onReview,
  busy,
}: {
  app: HostApplication;
  onReview: (input: {
    id: string;
    decision: "approved" | "rejected" | "revision";
    note?: string;
  }) => void;
  busy: boolean;
}) {
  const [note, setNote] = useState(app.reviewerNote ?? "");
  const appAny = app as HostApplication & {
    userName?: string;
    userEmail?: string;
    crewName?: string;
  };
  const collectiveName = app.collectiveName || appAny.crewName || "Host collective";
  const applicantName = appAny.user?.name || appAny.userName || app.collectiveName;
  const applicantAvatar = appAny.user?.avatar || "";
  return (
    <Card className="border border-border bg-card rounded-2xl">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="size-12 ring-1 ring-white/15">
              {applicantAvatar ? (
                <AvatarImage src={applicantAvatar} alt={applicantName} />
              ) : null}
              <AvatarFallback className="bg-primary/20 text-xs font-bold text-primary">
                {collectiveName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-display text-base font-bold">{collectiveName}</p>
              <p className="text-xs text-muted-foreground">
                {applicantName} · {CITY_LABELS[app.city]} ·{" "}
                {new Date(app.submittedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
              <p className="mt-2 line-clamp-2 text-xs text-foreground/80">
                {app.bio}
              </p>
              <div className="mt-2">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Portfolio
                </Label>
                <ul className="mt-1 space-y-0.5">
                  {app.portfolio.map((p, i) => (
                    <li key={i} className="text-[11px] text-foreground/75">
                      · {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {app.socialLinks.map((s, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="border-white/15 bg-white/5 text-[11px]"
                  >
                    {s.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Reviewer note
          </Label>
          <Textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Conditions, comments, next steps…"
            className="glass-input mt-1 text-xs"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            disabled={busy}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
            onClick={() => onReview({ id: app.id, decision: "approved", note })}
          >
            <BadgeCheck className="size-3.5" /> Approve & upgrade
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            className="gap-1.5 border-[#ff6b00]/40 text-[#ff6b00]"
            onClick={() => onReview({ id: app.id, decision: "revision", note })}
          >
            <ListPlus className="size-3.5" /> Request revision
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            className="gap-1.5 border-[#ff3b3b]/40 text-[#ff3b3b]"
            onClick={() => onReview({ id: app.id, decision: "rejected", note })}
          >
            <XCircle className="size-3.5" /> Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Platform Stats
// ---------------------------------------------------------------------------

function PlatformStatsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.stats(),
  });
  if (isLoading) return <Loading />;
  if (!data) return <EmptyState label="No stats available." />;
  const members = Number(data.totalMembers ?? 0);
  const hosts = Number(data.totalHosts ?? 0);
  const events = Number(data.totalEvents ?? 0);
  const revenue = Number(data.totalRevenue ?? 0);
  const ticketsSold = Number(data.ticketsSold ?? 0);
  const pendingApps = Number(data.pendingApplications ?? 0);
  const pendingEvents = Number(data.pendingEvents ?? 0);
  const avgAlignment = Number(data.avgAlignment ?? 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Users2} label="Members" value={members.toLocaleString("en-IN")} accent="#C6A769" />
        <StatTile icon={Building2} label="Hosts" value={String(hosts)} accent="#A89878" />
        <StatTile icon={CalendarDays} label="Events" value={String(events)} accent="#C6A769" />
        <StatTile icon={IndianRupee} label="Revenue" value={`₹${(revenue / 100000).toFixed(2)}L`} accent="#A89878" />
        <StatTile icon={Activity} label="Tickets sold" value={ticketsSold.toLocaleString("en-IN")} accent="#C6A769" />
        <StatTile icon={Clock} label="Pending apps" value={String(pendingApps)} accent="#C6A769" />
        <StatTile icon={Clock} label="Pending events" value={String(pendingEvents)} accent="#8C3B3B" />
        <StatTile icon={TrendingUp} label="Avg alignment" value={`${avgAlignment}%`} accent="#C6A769" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// City Health
// ---------------------------------------------------------------------------

const CITY_COLORS: Record<City, string> = {
  mumbai: "#C6A769",
  delhi: "#A89878",
  bangalore: "#C6A769",
  goa: "#A89878",
  pune: "#ff6b9d",
  hyderabad: "#7d1aff",
};

function CityHealthTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "city-stats"],
    queryFn: () => adminApi.cityStats(),
  });
  if (isLoading) return <Loading />;
  const stats: CityStat[] = data ?? [];
  if (stats.length === 0) return <EmptyState label="No city stats yet." />;

  return (
    <div className="space-y-5">
      <Card className="border border-border bg-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Revenue by city</CardTitle>
          <CardDescription>
            Where the money comes from, in INR.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="city"
                  stroke="rgba(245,245,247,0.5)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => CITY_LABELS[v as City] ?? v}
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
                  labelFormatter={(l) => CITY_LABELS[l as City] ?? l}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {stats.map((s) => (
                    <RCell key={s.city} fill={CITY_COLORS[s.city]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.city} className="border border-border bg-card rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" style={{ color: CITY_COLORS[s.city] }} />
                  <span className="font-display text-base font-bold">
                    {CITY_LABELS[s.city]}
                  </span>
                </div>
                <span
                  className="size-2 rounded-full"
                  style={{
                    background: CITY_COLORS[s.city],
                    boxShadow: `0 0 12px ${CITY_COLORS[s.city]}`,
                  }}
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Events
                  </div>
                  <div className="font-display text-lg font-bold">{s.events}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Members
                  </div>
                  <div className="font-display text-lg font-bold">{s.members}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Revenue
                  </div>
                  <div className="font-display text-lg font-bold">
                    ₹{(s.revenue / 1000).toFixed(0)}k
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Loading() {
  return (
    <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> Loading…
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="border border-border bg-card rounded-2xl p-8 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Admin Console
// ---------------------------------------------------------------------------

export function AdminConsole() {
  const [tab, setTab] = useState("members");

  return (
    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className="grid size-10 place-items-center rounded-xl text-white"
            style={{
              background: "#C6A769",
              boxShadow: "0 0 18px rgba(0,229,255,0.45)",
            }}
          >
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              Admin Console
            </h1>
            <p className="text-sm text-muted-foreground">
              Vetting, approvals, platform health
            </p>
          </div>
        </div>
        <Badge className="border border-primary/40 bg-primary/10 text-primary">
          Operations
        </Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList className="bg-card border border-border h-auto flex-wrap gap-1 rounded-2xl p-1.5">
          <TabsTrigger value="members" className="gap-1.5 rounded-xl px-3 py-1.5">
            <Users2 className="size-4" /> Member Approvals
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1.5 rounded-xl px-3 py-1.5">
            <CalendarDays className="size-4" /> Event Approvals
          </TabsTrigger>
          <TabsTrigger value="hosts" className="gap-1.5 rounded-xl px-3 py-1.5">
            <Building2 className="size-4" /> Host Applications
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5 rounded-xl px-3 py-1.5">
            <Activity className="size-4" /> Platform Stats
          </TabsTrigger>
          <TabsTrigger value="cities" className="gap-1.5 rounded-xl px-3 py-1.5">
            <MapPin className="size-4" /> City Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <MemberApprovalsTab />
        </TabsContent>
        <TabsContent value="events">
          <EventApprovalsTab />
        </TabsContent>
        <TabsContent value="hosts">
          <HostApplicationsTab />
        </TabsContent>
        <TabsContent value="stats">
          <PlatformStatsTab />
        </TabsContent>
        <TabsContent value="cities">
          <CityHealthTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
