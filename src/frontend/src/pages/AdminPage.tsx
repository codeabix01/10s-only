import { NeonCard } from "@/components/NeonCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  useAddInviteCode,
  useAdminStats,
  useApproveApplication,
  useInviteCodes,
  useListApplications,
  useRejectApplication,
} from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import type { ApplicationView } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Plus,
  QrCode,
  UserCheck,
  UserX,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────
function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatus(app: ApplicationView): "pending" | "approved" | "rejected" {
  if ("approved" in app.status) return "approved";
  if ("rejected" in app.status) return "rejected";
  return "pending";
}

// ── safe URL helper ──────────────────────────────────────────────────────────
function safeGetURL(photo: unknown): string | null {
  try {
    if (
      !photo ||
      typeof (photo as { getDirectURL?: unknown }).getDirectURL !== "function"
    )
      return null;
    const url = (photo as { getDirectURL: () => string }).getDirectURL();
    return typeof url === "string" && url.length > 0 ? url : null;
  } catch {
    return null;
  }
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: bigint | undefined;
  icon: React.ReactNode;
  glow: "purple" | "cyan" | "magenta" | "none";
  glowColor: string;
  ocid: string;
}

function StatCard({
  label,
  value,
  icon,
  glow,
  glowColor,
  ocid,
}: StatCardProps) {
  return (
    <NeonCard
      glow={glow}
      className="p-4 flex items-center gap-4"
      data-ocid={ocid}
      style={{
        boxShadow: value !== undefined ? `0 0 24px ${glowColor}` : undefined,
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${glowColor}22` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-muted-foreground text-xs uppercase tracking-widest font-mono">
          {label}
        </p>
        <p className="text-foreground text-2xl font-display font-bold">
          {value !== undefined ? value.toString() : "—"}
        </p>
      </div>
    </NeonCard>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({
  status,
}: { status: "pending" | "approved" | "rejected" }) {
  const map = {
    pending: "border-yellow-400/50 text-yellow-300 bg-yellow-400/10",
    approved: "border-emerald-400/50 text-emerald-300 bg-emerald-400/10",
    rejected: "border-destructive/50 text-red-300 bg-destructive/10",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-mono uppercase tracking-wider",
        map[status],
      )}
    >
      {status}
    </span>
  );
}

// ── QR Modal ──────────────────────────────────────────────────────────────────
function QRModal({
  token,
  name,
  onClose,
}: { token: string; name: string; onClose: () => void }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(token)}&bgcolor=0a0a12&color=00fff0&qzone=2`;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        data-ocid="admin.qr.dialog"
      >
        {/* backdrop */}
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          tabIndex={-1}
          role="presentation"
        />
        <motion.div
          className="relative z-10 w-full max-w-xs"
          initial={{ scale: 0.85, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.85, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <NeonCard glow="cyan" className="p-6 text-center">
            <button
              type="button"
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              onClick={onClose}
              aria-label="Close QR modal"
              data-ocid="admin.qr.close_button"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">
              Entry Pass
            </p>
            <p className="text-foreground font-display font-bold mb-4 truncate">
              {name}
            </p>
            <div className="flex justify-center">
              <img
                src={qrUrl}
                alt={`QR code for ${name}`}
                width={250}
                height={250}
                className="rounded-lg border border-accent/30"
              />
            </div>
            <p className="mt-4 text-xs text-muted-foreground font-mono break-all">
              {token}
            </p>
          </NeonCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Application Card ──────────────────────────────────────────────────────────
function ApplicationCard({
  app,
  index,
}: {
  app: ApplicationView;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [qrTarget, setQrTarget] = useState<string | null>(null);
  const approve = useApproveApplication();
  const reject = useRejectApplication();
  const status = getStatus(app);
  const isPending = status === "pending";
  const isApproved = status === "approved";

  const approvingThis = approve.isPending;
  const rejectingThis = reject.isPending;

  return (
    <>
      {qrTarget && (
        <QRModal
          token={qrTarget}
          name={app.name}
          onClose={() => setQrTarget(null)}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        data-ocid={`admin.app.item.${index + 1}`}
      >
        <NeonCard
          glow={
            status === "approved"
              ? "cyan"
              : status === "rejected"
                ? "none"
                : "purple"
          }
          className="overflow-hidden"
        >
          {/* main row */}
          <button
            type="button"
            className="w-full p-4 text-left flex items-start gap-3"
            onClick={() => setExpanded((p) => !p)}
            aria-expanded={expanded}
            data-ocid={`admin.app.expand.${index + 1}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-display font-semibold text-foreground truncate">
                  {app.name}
                </span>
                <StatusBadge status={status} />
                {app.plusOne && (
                  <span className="text-xs font-mono text-accent border border-accent/30 rounded-full px-2 py-0.5 bg-accent/10">
                    +1
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                @{app.instagramHandle}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {app.email}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground font-mono hidden sm:block">
                {formatDate(app.submittedAt)}
              </span>
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </button>

          {/* expanded details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-border/20 pt-3 space-y-3">
                  {/* detail fields */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">
                        Phone
                      </p>
                      <p className="text-foreground">{app.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">
                        Invite Code
                      </p>
                      <p className="text-foreground font-mono">
                        {app.inviteCode}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground font-mono mb-1">
                        Submitted
                      </p>
                      <p className="text-foreground">
                        {formatDate(app.submittedAt)}
                      </p>
                    </div>
                  </div>

                  {/* photos */}
                  {(app.photos ?? []).length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground font-mono mb-2">
                        Photos ({app.photos.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(app.photos ?? []).map((photo, pi) => {
                          const url = safeGetURL(photo);
                          if (!url)
                            return (
                              <div
                                key={`${app.id}-broken-${pi}`}
                                className="w-16 h-16 rounded-lg border border-border/30 bg-muted/20 flex items-center justify-center"
                                title="Photo unavailable"
                              >
                                <span className="text-muted-foreground text-xs font-mono">
                                  ?
                                </span>
                              </div>
                            );
                          return (
                            <a
                              key={`${app.id}-photo-${url}`}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={url}
                                alt={`Submission ${pi + 1}`}
                                className="w-16 h-16 object-cover rounded-lg border border-border/30 hover:border-accent/50 transition-colors"
                                onError={(e) => {
                                  (
                                    e.currentTarget as HTMLImageElement
                                  ).style.display = "none";
                                }}
                              />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* actions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {isPending && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          disabled={approvingThis || rejectingThis}
                          onClick={() => approve.mutate(app.id)}
                          className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/30 hover:border-emerald-400 transition-all"
                          data-ocid={`admin.app.approve_button.${index + 1}`}
                        >
                          {approvingThis ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={approvingThis || rejectingThis}
                          onClick={() => reject.mutate(app.id)}
                          className="bg-red-500/20 border border-red-400/50 text-red-300 hover:bg-red-500/30 hover:border-red-400 transition-all"
                          data-ocid={`admin.app.reject_button.${index + 1}`}
                        >
                          {rejectingThis ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          Reject
                        </Button>
                      </>
                    )}
                    {isApproved && app.qrToken && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setQrTarget(app.qrToken!)}
                        className="bg-accent/20 border border-accent/50 text-accent hover:bg-accent/30 hover:border-accent transition-all"
                        data-ocid={`admin.app.view_qr_button.${index + 1}`}
                      >
                        <QrCode className="w-3 h-3 mr-1" />
                        View QR
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </NeonCard>
      </motion.div>
    </>
  );
}

// ── Skeleton Rows ─────────────────────────────────────────────────────────────
function AppSkeleton() {
  return (
    <div className="space-y-3" data-ocid="admin.apps.loading_state">
      {[1, 2, 3, 4].map((i) => (
        <NeonCard key={i} glow="none" className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-32 bg-muted/40" />
                <Skeleton className="h-5 w-16 rounded-full bg-muted/40" />
              </div>
              <Skeleton className="h-4 w-24 bg-muted/30" />
              <Skeleton className="h-4 w-40 bg-muted/20" />
            </div>
            <Skeleton className="h-4 w-16 bg-muted/30" />
          </div>
        </NeonCard>
      ))}
    </div>
  );
}

// ── Invite Codes Tab ──────────────────────────────────────────────────────────
function InviteCodesPanel() {
  const { data: codes = [], isLoading } = useInviteCodes();
  const addCode = useAddInviteCode();
  const [newCode, setNewCode] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newCode.trim();
    if (!trimmed) return;
    addCode.mutate(trimmed, {
      onSuccess: () => setNewCode(""),
    });
  }

  return (
    <div className="space-y-6" data-ocid="admin.invite_codes.panel">
      {/* add form */}
      <NeonCard glow="purple" className="p-4">
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">
          Add New Code
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="e.g. VIP2025"
            className="font-mono bg-background/40 border-border/40 text-foreground placeholder:text-muted-foreground/50 flex-1"
            aria-label="New invite code"
            data-ocid="admin.invite_codes.input"
          />
          <Button
            type="submit"
            disabled={!newCode.trim() || addCode.isPending}
            className="bg-primary/80 hover:bg-primary transition-all"
            data-ocid="admin.invite_codes.add_button"
          >
            {addCode.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        </form>
      </NeonCard>

      {/* codes list */}
      <div>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">
          Active Codes ({codes.length})
        </p>
        {isLoading ? (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full bg-muted/40" />
            ))}
          </div>
        ) : codes.length === 0 ? (
          <NeonCard
            glow="none"
            className="p-6 text-center"
            data-ocid="admin.invite_codes.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              No invite codes yet. Add the first one above.
            </p>
          </NeonCard>
        ) : (
          <div className="flex flex-wrap gap-2">
            {codes.map((code, i) => (
              <motion.span
                key={code}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                data-ocid={`admin.invite_codes.item.${i + 1}`}
                className="inline-flex items-center px-3 py-1.5 rounded-full font-mono text-sm bg-card/30 border border-primary/30 text-primary backdrop-blur-sm hover:border-primary/60 transition-colors"
              >
                {code}
              </motion.span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();
  const { isConnected, isAdmin } = useAuth();
  const { data: stats } = useAdminStats();
  const {
    data: applications = [],
    isLoading: appsLoading,
    error: appsError,
  } = useListApplications();
  const [activeTab, setActiveTab] = useState<"applications" | "invite-codes">(
    "applications",
  );

  // Guard: not connected → redirect home
  if (!isConnected) {
    navigate({ to: "/" });
    return null;
  }

  // Guard: connected but not admin
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <NeonCard
          glow="magenta"
          className="p-8 max-w-sm"
          data-ocid="admin.access_denied"
        >
          <XCircle className="w-10 h-10 text-secondary mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-foreground mb-2">
            Admin Access Required
          </h2>
          <p className="text-muted-foreground text-sm">
            You don't have permission to view this page.
          </p>
        </NeonCard>
      </div>
    );
  }

  return (
    <div
      className="max-w-3xl mx-auto px-4 py-8 space-y-8"
      data-ocid="admin.page"
    >
      {/* header */}
      <div>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">
          Control Room
        </p>
        <h1 className="text-3xl font-display font-bold text-foreground">
          <span className="text-primary">Admin</span> Dashboard
        </h1>
      </div>

      {/* stats bar */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        data-ocid="admin.stats.section"
      >
        <StatCard
          label="Total"
          value={stats?.total}
          icon={<Users className="w-5 h-5 text-primary" />}
          glow="purple"
          glowColor="rgba(104,0,255,0.4)"
          ocid="admin.stats.total"
        />
        <StatCard
          label="Approved"
          value={stats?.approved}
          icon={<UserCheck className="w-5 h-5 text-emerald-400" />}
          glow="cyan"
          glowColor="rgba(52,211,153,0.4)"
          ocid="admin.stats.approved"
        />
        <StatCard
          label="Pending"
          value={stats?.pending}
          icon={<Clock className="w-5 h-5 text-yellow-400" />}
          glow="none"
          glowColor="rgba(251,191,36,0.4)"
          ocid="admin.stats.pending"
        />
        <StatCard
          label="Rejected"
          value={stats?.rejected}
          icon={<UserX className="w-5 h-5 text-red-400" />}
          glow="magenta"
          glowColor="rgba(239,68,68,0.4)"
          ocid="admin.stats.rejected"
        />
      </div>

      {/* tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl bg-card/20 backdrop-blur-sm border border-border/20"
        data-ocid="admin.tabs"
      >
        {(["applications", "invite-codes"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            data-ocid={`admin.tab.${tab}`}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-mono uppercase tracking-wider transition-all duration-200",
              activeTab === tab
                ? "bg-primary/80 text-foreground shadow-[0_0_16px_rgba(104,0,255,0.5)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab === "applications" ? "Applications" : "Invite Codes"}
          </button>
        ))}
      </div>

      {/* tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "applications" ? (
          <motion.div
            key="applications"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            data-ocid="admin.apps.section"
          >
            {appsLoading ? (
              <AppSkeleton />
            ) : appsError ? (
              <NeonCard
                glow="none"
                className="p-6 text-center"
                data-ocid="admin.apps.error_state"
              >
                <p className="text-destructive-foreground text-sm">
                  Failed to load applications. Please refresh.
                </p>
              </NeonCard>
            ) : applications.length === 0 ? (
              <NeonCard
                glow="none"
                className="p-8 text-center"
                data-ocid="admin.apps.empty_state"
              >
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No applications yet.</p>
              </NeonCard>
            ) : (
              <div className="space-y-3">
                {applications.map((app, i) => (
                  <ApplicationCard
                    key={app.id.toString()}
                    app={app}
                    index={i}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="invite-codes"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <InviteCodesPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
