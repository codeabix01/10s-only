import { NeonCard } from "@/components/NeonCard";
import { Button } from "@/components/ui/button";
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
      "Your application is in the queue. The committee reviews applications manually. Stay close — decisions are made fast.",
  },
  approved: {
    label: "APPROVED",
    emoji: "✅",
    glow: "cyan",
    color: "oklch(0.75 0.30 145)",
    message:
      "You're officially on the list. Access your exclusive portal, your entry ticket, and everything that comes with it.",
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

  useEffect(() => {
    // Try URL param first, then localStorage
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

  if (!resolved || isLoading) {
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
        className="min-h-screen flex items-center justify-center px-4"
        data-ocid="status.page"
      >
        <NeonCard
          glow="purple"
          className="max-w-sm w-full p-8 text-center space-y-5"
        >
          <p className="text-4xl">🎟️</p>
          <h2 className="font-display font-bold text-xl text-foreground">
            No Application Found
          </h2>
          <p className="text-sm text-muted-foreground font-body leading-relaxed">
            We couldn't find an application ID. Apply now to get on the list.
          </p>
          <Button
            type="button"
            asChild
            data-ocid="status.apply_button"
            className="w-full font-display font-bold tracking-wide"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.22 290), oklch(0.55 0.25 315))",
              boxShadow: "0 0 16px oklch(0.65 0.22 290 / 0.3)",
            }}
          >
            <Link to="/apply">APPLY NOW</Link>
          </Button>
        </NeonCard>
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
                className="space-y-3"
              >
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
                <p className="text-xs text-muted-foreground font-body">
                  Your exclusive ticket and event access awaits
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
                  <Link to="/">BACK TO HOME</Link>
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
