import { NeonCard } from "@/components/NeonCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useApplicationStatus } from "@/hooks/useBackend";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

type StatusState = "pending" | "approved" | "rejected";

const STATUS_CONFIG: Record<
  StatusState,
  {
    label: string;
    emoji: string;
    glow: "purple" | "cyan" | "magenta";
    color: string;
    message: string;
  }
> = {
  pending: {
    label: "PENDING REVIEW",
    emoji: "⏳",
    glow: "purple",
    color: "oklch(0.65 0.22 290)",
    message:
      "Your application is in the queue. The committee reviews every application personally — stay close, decisions are made quickly.",
  },
  approved: {
    label: "APPROVED",
    emoji: "✅",
    glow: "cyan",
    color: "oklch(0.75 0.30 145)",
    message:
      "You're officially on the list. Head to your exclusive portal to access your entry ticket and everything that comes with it.",
  },
  rejected: {
    label: "NOT THIS TIME",
    emoji: "🚫",
    glow: "magenta",
    color: "oklch(0.55 0.22 25)",
    message:
      "Your application wasn't accepted for this event. Keep watching — the next one might be yours.",
  },
};

export default function StatusPage() {
  const navigate = useNavigate();
  const [appId, setAppId] = useState<bigint | null>(null);
  const [resolved, setResolved] = useState(false);
  const [lookupValue, setLookupValue] = useState("");
  const [lookupError, setLookupError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramId = params.get("id");
    const stored = localStorage.getItem("applicationId");
    const raw = paramId || stored;
    if (raw) {
      try {
        setAppId(BigInt(raw));
      } catch {
        // invalid id
      }
    }
    setResolved(true);
  }, []);

  const { data: statusData, isLoading } = useApplicationStatus(appId);

  const statusKey = statusData?.[0] as StatusState | undefined;
  const config = statusKey ? STATUS_CONFIG[statusKey] : null;

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const val = lookupValue.trim();
    if (!val) {
      setLookupError("Enter your application ID to check status");
      return;
    }
    // Try parsing as numeric ID
    const numeric = val.replace(/^#/, "");
    try {
      const parsed = BigInt(numeric);
      setLookupError("");
      setAppId(parsed);
    } catch {
      setLookupError(
        "Invalid application ID — enter the number from your confirmation",
      );
    }
  }

  if (!resolved || (appId !== null && isLoading)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="status.loading_state"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
          <p className="text-muted-foreground font-display text-sm tracking-widest">
            CHECKING STATUS…
          </p>
        </div>
      </div>
    );
  }

  if (!appId) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-16"
        data-ocid="status.page"
      >
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 overflow-hidden"
        >
          <div className="absolute top-[-20%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-secondary/6 blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="w-full max-w-sm space-y-5"
        >
          <NeonCard glow="purple" className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-4xl">🎟️</p>
              <h2 className="font-display font-bold text-xl text-foreground">
                Check Your Status
              </h2>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Enter the application ID from your confirmation to see your
                status.
              </p>
            </div>
            <form onSubmit={handleLookup} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="lookup-id"
                  className="text-xs font-display tracking-[0.15em] uppercase text-muted-foreground"
                >
                  Application ID
                </Label>
                <Input
                  id="lookup-id"
                  value={lookupValue}
                  onChange={(e) => {
                    setLookupValue(e.target.value);
                    if (lookupError) setLookupError("");
                  }}
                  placeholder="e.g. 000042"
                  className="bg-card/20 border-border/40 text-foreground placeholder:text-muted-foreground/40 h-12 font-mono text-base"
                  autoComplete="off"
                  data-ocid="status.lookup_input"
                />
                {lookupError && (
                  <p
                    className="text-xs text-destructive font-body flex items-center gap-1.5"
                    data-ocid="status.lookup_field_error"
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                    {lookupError}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full font-display font-bold tracking-wide text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.22 290), oklch(0.55 0.25 315))",
                  boxShadow: "0 0 16px oklch(0.65 0.22 290 / 0.3)",
                }}
                data-ocid="status.lookup_submit_button"
              >
                Check Status
              </Button>
            </form>
            <div className="border-t border-border/30 pt-4 text-center">
              <p className="text-xs text-muted-foreground font-body mb-3">
                Don't have an application yet?
              </p>
              <Button
                type="button"
                variant="outline"
                asChild
                className="w-full border-border/40 text-muted-foreground hover:border-primary/40 font-display text-sm"
                data-ocid="status.apply_button"
              >
                <a href="/apply">APPLY NOW</a>
              </Button>
            </div>
          </NeonCard>
        </motion.div>
      </div>
    );
  }

  if (!statusData || !config) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        data-ocid="status.error_state"
      >
        <NeonCard
          glow="none"
          className="max-w-sm w-full p-8 text-center space-y-4"
        >
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-6 w-40 mx-auto rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 mx-auto rounded" />
        </NeonCard>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      data-ocid="status.page"
    >
      <div className="w-full max-w-md space-y-6">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 overflow-hidden"
        >
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-10"
            style={{
              background: `radial-gradient(ellipse, ${config.color} 0%, transparent 70%)`,
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <NeonCard glow={config.glow} className="p-8 text-center space-y-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="text-6xl"
            >
              {config.emoji}
            </motion.div>

            <div className="space-y-2">
              <p className="text-xs font-display tracking-[0.4em] text-muted-foreground uppercase">
                Application Status
              </p>
              <motion.h1
                className="text-3xl font-display font-black tracking-tight"
                style={{
                  color: config.color,
                  filter: `drop-shadow(0 0 16px ${config.color})`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                data-ocid="status.status_label"
              >
                {config.label}
              </motion.h1>
            </div>

            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              {config.message}
            </p>

            {/* Divider */}
            <div className="border-t border-border/30" />

            {statusKey === "approved" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-5"
              >
                {/* ── YOUR ENTRY TICKET ── */}
                <div
                  className="rounded-2xl overflow-hidden border border-accent/30"
                  style={{
                    background:
                      "linear-gradient(160deg, oklch(0.12 0.04 200 / 0.95), oklch(0.08 0.02 220 / 0.98))",
                    boxShadow:
                      "0 0 40px oklch(0.7 0.2 200 / 0.15), inset 0 0 60px oklch(0.7 0.2 200 / 0.04)",
                  }}
                  data-ocid="status.entry_ticket"
                >
                  {/* ticket header */}
                  <div
                    className="px-5 pt-5 pb-3 border-b"
                    style={{
                      borderColor: "oklch(0.7 0.2 200 / 0.2)",
                      background:
                        "linear-gradient(90deg, oklch(0.7 0.2 200 / 0.08), transparent)",
                    }}
                  >
                    <p
                      className="text-xs font-mono uppercase tracking-[0.4em] mb-0.5"
                      style={{ color: "oklch(0.7 0.2 200 / 0.7)" }}
                    >
                      10s Only
                    </p>
                    <h2
                      className="font-display font-black text-2xl tracking-tight"
                      style={{
                        color: "oklch(0.85 0.18 70)",
                        textShadow: "0 0 20px oklch(0.85 0.18 70 / 0.5)",
                      }}
                    >
                      YOUR ENTRY TICKET
                    </h2>
                    <p
                      className="text-xs font-body mt-1"
                      style={{ color: "oklch(0.7 0.2 200 / 0.6)" }}
                    >
                      Saturday · 23 May 2026
                    </p>
                  </div>

                  {/* QR code */}
                  <div className="px-5 py-5 flex flex-col items-center gap-4">
                    {statusData?.[1] ? (
                      <div
                        className="rounded-xl overflow-hidden p-2"
                        style={{
                          background: "oklch(0.96 0 0)",
                          boxShadow: "0 0 32px oklch(0.7 0.2 200 / 0.3)",
                        }}
                      >
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(statusData[1] as string)}&bgcolor=f5f5f5&color=0a0a12&qzone=2`}
                          alt="Entry QR code"
                          width={220}
                          height={220}
                          className="block rounded-lg"
                          data-ocid="status.entry_qr"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-[220px] h-[220px] rounded-xl flex items-center justify-center"
                        style={{ background: "oklch(0.7 0.2 200 / 0.08)" }}
                      >
                        <p className="text-muted-foreground text-xs font-mono">
                          QR generating…
                        </p>
                      </div>
                    )}

                    {/* save reminder */}
                    <div
                      className="w-full rounded-xl px-4 py-3 text-center border"
                      style={{
                        background: "oklch(0.85 0.18 70 / 0.06)",
                        borderColor: "oklch(0.85 0.18 70 / 0.25)",
                      }}
                    >
                      <p
                        className="text-xs font-display font-semibold tracking-wide"
                        style={{ color: "oklch(0.85 0.18 70)" }}
                      >
                        📸 Screenshot &amp; save this ticket
                      </p>
                      <p
                        className="text-[11px] font-body mt-0.5"
                        style={{ color: "oklch(0.85 0.18 70 / 0.65)" }}
                      >
                        You'll need it at the door — don't lose it
                      </p>
                    </div>

                    {/* location card */}
                    <div
                      className="w-full rounded-xl px-4 py-3 flex items-start gap-3 border"
                      style={{
                        background: "oklch(0.7 0.2 200 / 0.06)",
                        borderColor: "oklch(0.7 0.2 200 / 0.2)",
                      }}
                    >
                      <span className="text-lg shrink-0 mt-0.5">📍</span>
                      <div>
                        <p
                          className="text-xs font-display font-bold tracking-wide"
                          style={{ color: "oklch(0.7 0.2 200)" }}
                        >
                          Location
                        </p>
                        <p
                          className="text-[12px] font-body mt-0.5 leading-relaxed"
                          style={{ color: "oklch(0.7 0.15 200 / 0.8)" }}
                        >
                          The exact address will be disclosed on your WhatsApp
                          number closer to the event.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* portal button */}
                <Button
                  type="button"
                  onClick={() => navigate({ to: "/portal" })}
                  data-ocid="status.portal_button"
                  className="w-full font-display font-bold tracking-wide text-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.75 0.30 145), oklch(0.65 0.25 165))",
                    boxShadow: "0 0 20px oklch(0.75 0.30 145 / 0.5)",
                  }}
                >
                  🎉 ENTER THE PORTAL
                </Button>
                <p className="text-xs text-muted-foreground font-body text-center">
                  Access quiz, confessions, gallery and more
                </p>
              </motion.div>
            ) : statusKey === "pending" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
                  <p className="text-xs font-display tracking-widest text-muted-foreground">
                    AWAITING DECISION
                  </p>
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
                </div>
                <p className="text-xs text-muted-foreground font-body">
                  Check back soon. Decisions are made quickly.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground font-body">
                  Think there's been a mistake?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  data-ocid="status.home_button"
                  className="w-full border-border/40 text-muted-foreground hover:border-primary/40 font-display text-sm"
                >
                  <a href="/">BACK TO HOME</a>
                </Button>
              </div>
            )}
          </NeonCard>
        </motion.div>

        {/* Application ID reference */}
        {appId && (
          <p
            className="text-center text-xs font-mono text-muted-foreground/40"
            data-ocid="status.app_id"
          >
            APP #{appId.toString().padStart(6, "0")}
          </p>
        )}
      </div>
    </div>
  );
}
