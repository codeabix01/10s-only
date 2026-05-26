import { Gender, createActor } from "@/backend";
import type { UserProfile } from "@/backend";
import { NeonCard } from "@/components/NeonCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  useAddAdmin,
  useAddInviteCode,
  useAdminGalleryPhotos,
  useAdminListConfessions,
  useAdminStats,
  useApproveApplication,
  useBroadcastToApprovedGuests,
  useDeleteUser,
  useGetRegisteredUsers,
  useInviteCodes,
  useListAdmins,
  useListApplications,
  useRejectApplication,
  useRemoveAdmin,
  useResendApprovalEmail,
  useTotalUserCount,
} from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import type { ApplicationView } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { Principal } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Image,
  Key,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  Plus,
  QrCode,
  Radio,
  Send,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  UserX,
  Users,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ── helpers ──────────────────────────────────────────────────────────────────
function formatDate(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatus(app: ApplicationView): "pending" | "approved" | "rejected" {
  const s = app.status;
  // Backend returns ApplicationStatus as a plain string enum value
  if (typeof s === "string") {
    if (s === "approved") return "approved";
    if (s === "rejected") return "rejected";
    return "pending";
  }
  // Fallback: handle legacy Motoko variant object shape {approved: null} etc.
  if (typeof s === "object" && s !== null) {
    if ("approved" in (s as Record<string, unknown>)) return "approved";
    if ("rejected" in (s as Record<string, unknown>)) return "rejected";
  }
  return "pending";
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
  glow: _glow,
  glowColor,
  ocid,
}: StatCardProps) {
  const borderColorMap: Record<string, string> = {
    "rgba(104,0,255,0.4)": "border-l-violet-500",
    "rgba(52,211,153,0.4)": "border-l-emerald-400",
    "rgba(251,191,36,0.4)": "border-l-yellow-400",
    "rgba(239,68,68,0.4)": "border-l-red-400",
    "rgba(96,165,250,0.4)": "border-l-blue-400",
  };
  const borderClass = borderColorMap[glowColor] ?? "border-l-primary";
  return (
    <div
      className={cn(
        "relative bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 border-l-4",
        borderClass,
      )}
      data-ocid={ocid}
    >
      <div className="absolute top-3 right-3 opacity-40">{icon}</div>
      <p className="text-3xl font-display font-bold text-foreground leading-none mb-1.5">
        {value !== undefined ? value.toString() : "—"}
      </p>
      <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest">
        {label}
      </p>
    </div>
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

// ── Gender Badge ─────────────────────────────────────────────────────────────
function GenderBadge({ gender }: { gender?: Gender }) {
  if (!gender) return null;
  const map: Record<Gender, { label: string; style: string }> = {
    [Gender.male]: {
      label: "Male",
      style: "border-cyan-400/50 text-cyan-300 bg-cyan-400/10",
    },
    [Gender.female]: {
      label: "Female",
      style: "border-fuchsia-400/50 text-fuchsia-300 bg-fuchsia-400/10",
    },
    [Gender.other]: {
      label: "Other",
      style: "border-violet-400/50 text-violet-300 bg-violet-400/10",
    },
  };
  const entry = map[gender];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-mono uppercase tracking-wider",
        entry.style,
      )}
    >
      {entry.label}
    </span>
  );
}

// ── User Card ─────────────────────────────────────────────────────────────────
function UserCard({
  user,
  index,
  onRefetch,
}: {
  user: UserProfile;
  index: number;
  onRefetch?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const deleteUserMutation = useDeleteUser();
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      data-ocid={`admin.user.item.${index + 1}`}
    >
      <NeonCard glow="purple" className="overflow-hidden">
        <button
          type="button"
          className="w-full p-4 text-left flex items-center gap-3"
          onClick={() => setExpanded((p) => !p)}
          aria-expanded={expanded}
          data-ocid={`admin.user.expand.${index + 1}`}
        >
          {user.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border border-primary/30 shrink-0"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-display font-bold"
              style={{
                background: "oklch(0.65 0.22 290 / 0.3)",
                border: "1px solid oklch(0.65 0.22 290 / 0.4)",
                color: "oklch(0.9 0.1 290)",
              }}
            >
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="font-display font-semibold text-foreground truncate">
                {user.name}
              </span>
              <GenderBadge gender={user.gender} />
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {user.instagramHandle
                ? `@${user.instagramHandle}`
                : user.emailOrPhone}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground font-mono hidden sm:block">
              {formatDate(user.createdAt)}
            </span>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-border/20 pt-3 space-y-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">
                      Email / Phone
                    </p>
                    <p className="text-foreground truncate">
                      {user.emailOrPhone}
                    </p>
                  </div>
                  {user.city && (
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">
                        City
                      </p>
                      <p className="text-foreground">{user.city}</p>
                    </div>
                  )}
                  {user.bio && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground font-mono mb-1">
                        Bio
                      </p>
                      <p className="text-foreground text-sm">{user.bio}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">
                      Joined
                    </p>
                    <p className="text-foreground">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                  {user.linkedApplicationId && (
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">
                        Application ID
                      </p>
                      <p className="text-foreground font-mono text-xs">
                        {user.linkedApplicationId}
                      </p>
                    </div>
                  )}
                </div>
                <div className="pt-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={deleteUserMutation.isPending}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Delete this user? This cannot be undone.",
                        )
                      ) {
                        deleteUserMutation.mutate(user.emailOrPhone, {
                          onSuccess: () => {
                            toast.success("User deleted.");
                            onRefetch?.();
                          },
                          onError: (err) => {
                            toast.error(
                              err instanceof Error
                                ? err.message
                                : "Failed to delete user",
                            );
                          },
                        });
                      }
                    }}
                    className="bg-red-500/20 border border-red-400/50 text-red-300 hover:bg-red-500/30 hover:border-red-400 transition-all"
                    data-ocid={`admin.user.delete_button.${index + 1}`}
                  >
                    {deleteUserMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <Trash2 className="w-3 h-3 mr-1" />
                    )}
                    Delete User
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </NeonCard>
    </motion.div>
  );
}

// ── Users Panel ───────────────────────────────────────────────────────────────
function UsersPanel() {
  const { data: users = [], isLoading } = useGetRegisteredUsers();
  const [genderFilter, setGenderFilter] = useState<"all" | Gender>("all");

  const filtered =
    genderFilter === "all"
      ? users
      : users.filter((u) => u.gender === genderFilter);

  return (
    <div className="space-y-4" data-ocid="admin.users.section">
      {/* gender filter */}
      <div
        className="flex gap-1 p-1 rounded-xl bg-card/20 backdrop-blur-sm border border-border/20"
        data-ocid="admin.users.gender_filter"
      >
        {(["all", Gender.male, Gender.female, Gender.other] as const).map(
          (g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenderFilter(g)}
              data-ocid={`admin.users.filter.${g}`}
              className={cn(
                "flex-1 py-1.5 px-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 capitalize",
                genderFilter === g
                  ? "bg-primary/80 text-foreground shadow-[0_0_16px_rgba(104,0,255,0.5)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {g}
            </button>
          ),
        )}
      </div>

      <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
        {filtered.length} registered member{filtered.length !== 1 ? "s" : ""}
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton
              key={`skeleton-user-${i}`}
              className="h-16 w-full rounded-xl"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <NeonCard
          glow="none"
          className="p-8 text-center"
          data-ocid="admin.users.empty_state"
        >
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            No registered members yet.
          </p>
        </NeonCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((u, i) => (
            <UserCard
              key={u.id.toString()}
              user={u}
              index={i}
              onRefetch={() => {}}
            />
          ))}
        </div>
      )}
    </div>
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
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const approve = useApproveApplication();
  const reject = useRejectApplication();
  const resendEmail = useResendApprovalEmail();
  const status = getStatus(app);
  const isPending = status === "pending";
  const isApproved = status === "approved";

  const approvingThis = approve.isPending;
  const rejectingThis = reject.isPending;

  function handleResendEmail() {
    setResendMsg(null);
    resendEmail.mutate(app.id, {
      onSuccess: () => {
        setResendMsg("sent");
        toast.success("Approval email resent!");
        setTimeout(() => setResendMsg(null), 4000);
      },
      onError: (err) => {
        setResendMsg("error");
        toast.error(
          err instanceof Error ? err.message : "Failed to resend email",
        );
        setTimeout(() => setResendMsg(null), 4000);
      },
    });
  }

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
                <span
                  className="text-[11px] font-mono font-bold tracking-widest shrink-0"
                  style={{
                    color: "oklch(0.68 0.27 305)",
                    textShadow: "0 0 10px oklch(0.68 0.27 305 / 0.5)",
                  }}
                  data-ocid={`admin.app.id.${index + 1}`}
                >
                  #{app.id.toString().padStart(6, "0")}
                </span>
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
                {app.instagramHandle}
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
                  {app.photos.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground font-mono mb-2">
                        Photos ({app.photos.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {app.photos.map((photo, pi) => (
                          <a
                            key={photo.getDirectURL()}
                            href={photo.getDirectURL()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={photo.getDirectURL()}
                              alt={`Submission ${pi + 1}`}
                              className="w-16 h-16 object-cover rounded-lg border border-border/30 hover:border-accent/50 transition-colors"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* actions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {isPending && (
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
                    )}
                    {(isPending || isApproved) && (
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
                        {isApproved ? "Revoke" : "Reject"}
                      </Button>
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
                    {isApproved && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={resendEmail.isPending}
                        onClick={handleResendEmail}
                        className="bg-yellow-500/10 border border-yellow-400/40 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-400/70 transition-all"
                        data-ocid={`admin.app.resend_email_button.${index + 1}`}
                      >
                        {resendEmail.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          <Mail className="w-3 h-3 mr-1" />
                        )}
                        {resendMsg === "sent"
                          ? "Email sent!"
                          : resendMsg === "error"
                            ? "Failed"
                            : "Resend Email"}
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
        <NeonCard key={`skeleton-app-${i}`} glow="none" className="p-4">
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
          Add New Invite Code
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
          Active Invite Codes ({codes.length})
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
              No invite codes yet. Create your first code above.
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

// ── Admins Panel ─────────────────────────────────────────────────────────────
function AdminsPanel({
  currentPrincipal,
}: { currentPrincipal: Principal | null }) {
  const { data: admins = [], isLoading, error } = useListAdmins();
  const addAdmin = useAddAdmin();
  const removeAdmin = useRemoveAdmin();
  const [newPrincipal, setNewPrincipal] = useState("");
  const [addError, setAddError] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newPrincipal.trim();
    if (!trimmed) return;
    setAddError("");
    let principal: Principal;
    try {
      principal = Principal.fromText(trimmed);
    } catch {
      setAddError("Invalid principal ID format.");
      return;
    }
    addAdmin.mutate(principal, {
      onSuccess: () => setNewPrincipal(""),
      onError: (err) =>
        setAddError(err instanceof Error ? err.message : "Failed to add admin"),
    });
  }

  return (
    <div className="space-y-6" data-ocid="admin.admins.panel">
      {/* add form */}
      <NeonCard glow="cyan" className="p-4">
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">
          Add New Admin
        </p>
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={newPrincipal}
            onChange={(e) => {
              setNewPrincipal(e.target.value);
              setAddError("");
            }}
            placeholder="Paste principal ID (e.g. aaaaa-aa)"
            className="font-mono text-xs bg-background/40 border-border/40 text-foreground placeholder:text-muted-foreground/50 flex-1"
            aria-label="New admin principal"
            data-ocid="admin.admins.input"
          />
          <Button
            type="submit"
            disabled={!newPrincipal.trim() || addAdmin.isPending}
            className="bg-accent/80 hover:bg-accent transition-all border border-accent/40"
            data-ocid="admin.admins.add_button"
          >
            {addAdmin.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        </form>
        {addError && (
          <p
            className="text-destructive text-xs font-mono mt-2"
            data-ocid="admin.admins.error_state"
          >
            {addError}
          </p>
        )}
      </NeonCard>

      {/* admins list */}
      <div>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">
          Current Admins ({isLoading ? "…" : admins.length})
        </p>
        {isLoading ? (
          <div className="space-y-2" data-ocid="admin.admins.loading_state">
            {[1, 2].map((i) => (
              <NeonCard key={i} glow="none" className="p-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg bg-muted/40" />
                  <Skeleton className="h-4 flex-1 bg-muted/30" />
                  <Skeleton className="h-8 w-16 rounded-lg bg-muted/20" />
                </div>
              </NeonCard>
            ))}
          </div>
        ) : error ? (
          <NeonCard
            glow="none"
            className="p-6 text-center"
            data-ocid="admin.admins.error_state"
          >
            <p className="text-destructive text-sm">Failed to load admins.</p>
          </NeonCard>
        ) : admins.length === 0 ? (
          <NeonCard
            glow="none"
            className="p-6 text-center"
            data-ocid="admin.admins.empty_state"
          >
            <p className="text-muted-foreground text-sm">No admins found.</p>
          </NeonCard>
        ) : (
          <div className="space-y-2">
            {admins.map((admin, i) => {
              const isSelf =
                currentPrincipal !== null &&
                admin.toString() === currentPrincipal.toString();
              return (
                <motion.div
                  key={admin.toString()}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-ocid={`admin.admins.item.${i + 1}`}
                >
                  <NeonCard
                    glow={isSelf ? "cyan" : "none"}
                    className="p-3 flex items-center gap-3"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: isSelf
                          ? "oklch(0.7 0.2 200 / 0.15)"
                          : "oklch(0.68 0.27 305 / 0.1)",
                      }}
                    >
                      <Shield
                        className="w-4 h-4"
                        style={{
                          color: isSelf
                            ? "oklch(0.7 0.2 200)"
                            : "oklch(0.68 0.27 305)",
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-foreground truncate">
                        {admin.toString()}
                      </p>
                      {isSelf && (
                        <p
                          className="text-[10px] font-mono tracking-widest"
                          style={{ color: "oklch(0.7 0.2 200)" }}
                        >
                          YOU
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={isSelf || removeAdmin.isPending}
                      onClick={() => removeAdmin.mutate(admin)}
                      title={isSelf ? "Cannot remove yourself" : "Remove admin"}
                      className={cn(
                        "shrink-0 transition-all",
                        isSelf
                          ? "opacity-30 cursor-not-allowed"
                          : "text-red-400 hover:text-red-300 hover:bg-red-400/10 border border-red-400/20 hover:border-red-400/40",
                      )}
                      data-ocid={`admin.admins.delete_button.${i + 1}`}
                    >
                      {removeAdmin.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </NeonCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Broadcast Panel ─────────────────────────────────────────────────────────
function BroadcastPanel({ approvedCount }: { approvedCount?: bigint }) {
  const broadcast = useBroadcastToApprovedGuests();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sentCount, setSentCount] = useState<bigint | null>(null);
  const [broadcastError, setBroadcastError] = useState("");

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setBroadcastError("");
    setSentCount(null);
    const trimSubject = subject.trim();
    const trimMessage = message.trim();
    if (!trimSubject || !trimMessage) {
      setBroadcastError("Subject and message are required.");
      return;
    }
    broadcast.mutate(
      { subject: trimSubject, message: trimMessage },
      {
        onSuccess: (count) => {
          setSentCount(count);
          setSubject("");
          setMessage("");
          toast.success(`Message sent to ${count.toString()} approved guests!`);
        },
        onError: (err) => {
          setBroadcastError(
            err instanceof Error ? err.message : "Failed to broadcast message.",
          );
        },
      },
    );
  }

  return (
    <div className="space-y-6" data-ocid="admin.broadcast.panel">
      <NeonCard glow="cyan" className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "oklch(0.7 0.2 200 / 0.15)" }}
          >
            <MessageSquare
              className="w-4 h-4"
              style={{ color: "oklch(0.7 0.2 200)" }}
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
              Broadcast Message
            </p>
            <p className="text-xs text-muted-foreground/60 font-body">
              Send to all{" "}
              <span className="text-emerald-300 font-mono">
                {approvedCount !== undefined ? approvedCount.toString() : "–"}
              </span>{" "}
              approved guests
            </p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="broadcast-subject"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground"
            >
              Subject
            </label>
            <input
              id="broadcast-subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setBroadcastError("");
              }}
              placeholder="e.g. Event Night — Final Details"
              className="w-full h-10 px-3 rounded-lg bg-background/40 border border-border/40 text-foreground placeholder:text-muted-foreground/40 font-body text-sm focus:outline-none focus:border-accent/60 transition-colors"
              data-ocid="admin.broadcast.subject_input"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="broadcast-message"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground"
            >
              Message
            </label>
            <textarea
              id="broadcast-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setBroadcastError("");
              }}
              placeholder="Write your message here…"
              rows={5}
              className="w-full px-3 py-2 rounded-lg bg-background/40 border border-border/40 text-foreground placeholder:text-muted-foreground/40 font-body text-sm leading-relaxed focus:outline-none focus:border-accent/60 transition-colors resize-none"
              data-ocid="admin.broadcast.textarea"
            />
          </div>

          {broadcastError && (
            <p
              className="text-xs text-destructive font-mono"
              data-ocid="admin.broadcast.error_state"
            >
              {broadcastError}
            </p>
          )}

          {sentCount !== null && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-mono text-emerald-300 flex items-center gap-1.5"
              data-ocid="admin.broadcast.success_state"
            >
              <CheckCircle className="w-3 h-3" />
              Sent to {sentCount.toString()} guests
            </motion.p>
          )}

          <Button
            type="submit"
            disabled={broadcast.isPending || !subject.trim() || !message.trim()}
            className="w-full font-display font-bold tracking-wide text-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.7 0.2 200), oklch(0.65 0.22 225))",
              boxShadow: "0 0 16px oklch(0.7 0.2 200 / 0.3)",
            }}
            data-ocid="admin.broadcast.submit_button"
          >
            {broadcast.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Sending…
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send to All Approved Guests
              </>
            )}
          </Button>
        </form>
      </NeonCard>
    </div>
  );
}

// ── Gallery Panel ──────────────────────────────────────────────────────────────
function GalleryPanel() {
  const { actor } = useActor(createActor);
  const { photos, loading, refetch } = useAdminGalleryPhotos();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getPhotoUrl = (
    photo: { getDirectURL?: () => string } | null | undefined,
  ): string => {
    return photo?.getDirectURL?.() ?? "";
  };

  const approve = async (id: string) => {
    if (!actor) return;
    setActionLoading(`${id}-approve`);
    await (actor as any).adminApproveGalleryPhoto(id);
    setActionLoading(null);
    refetch();
  };

  const reject = async (id: string) => {
    if (!actor) return;
    setActionLoading(`${id}-reject`);
    await (actor as any).adminRejectGalleryPhoto(id);
    setActionLoading(null);
    refetch();
  };

  const pending = photos.filter((p: any) => !p.approved);
  const approved = photos.filter((p: any) => p.approved);

  if (loading)
    return (
      <div className="text-white/40 text-center py-12">Loading gallery...</div>
    );

  return (
    <div className="space-y-8" data-ocid="admin.gallery.section">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Pending Approval ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p
            className="text-muted-foreground text-sm"
            data-ocid="admin.gallery.pending.empty_state"
          >
            No photos pending approval.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {pending.map((photo: any, i: number) => (
              <div
                key={photo.id}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-200"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={getPhotoUrl(photo.photo)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 space-y-2">
                  {photo.caption?.[0] && (
                    <p className="text-muted-foreground text-xs truncate">
                      {photo.caption[0]}
                    </p>
                  )}
                  <p className="text-muted-foreground/50 text-xs">
                    {photo.uploaderPrincipal?.toString?.()?.slice(0, 12)}...
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => approve(photo.id)}
                      disabled={actionLoading === `${photo.id}-approve`}
                      className="flex-1 py-1.5 text-xs font-medium bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/20 rounded-lg transition-colors disabled:opacity-40"
                      data-ocid={`admin.gallery.approve_button.${i + 1}`}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => reject(photo.id)}
                      disabled={actionLoading === `${photo.id}-reject`}
                      className="flex-1 py-1.5 text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/20 rounded-lg transition-colors disabled:opacity-40"
                      data-ocid={`admin.gallery.reject_button.${i + 1}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Live Gallery ({approved.length})
        </h3>
        {approved.length === 0 ? (
          <p
            className="text-muted-foreground text-sm"
            data-ocid="admin.gallery.approved.empty_state"
          >
            No approved photos yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {approved.map((photo: any, i: number) => (
              <div
                key={photo.id}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-200"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={getPhotoUrl(photo.photo)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 space-y-2">
                  {photo.caption?.[0] && (
                    <p className="text-muted-foreground text-xs truncate">
                      {photo.caption[0]}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => reject(photo.id)}
                    disabled={actionLoading === `${photo.id}-reject`}
                    className="w-full py-1.5 text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/20 rounded-lg transition-colors disabled:opacity-40"
                    data-ocid={`admin.gallery.remove_button.${i + 1}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Admin Confessions Panel ──────────────────────────────────────────────────
function AdminConfessionsPanel() {
  const { actor } = useActor(createActor);
  const { confessions, loading, refetch } = useAdminListConfessions();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  async function handleApprove(id: number) {
    if (!actor) return;
    setApprovingId(id);
    try {
      await (
        actor as unknown as Record<string, (id: bigint) => Promise<unknown>>
      ).adminApproveConfession(BigInt(id));
      toast.success("Confession approved.");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to approve");
    } finally {
      setApprovingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!actor) return;
    if (!window.confirm("Delete this confession? This cannot be undone."))
      return;
    setDeletingId(id);
    try {
      await (
        actor as unknown as Record<string, (id: bigint) => Promise<unknown>>
      ).adminDeleteConfession(BigInt(id));
      toast.success("Confession deleted.");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading)
    return (
      <div className="space-y-3" data-ocid="admin.confessions.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={`skel-conf-${i}`} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );

  if (confessions.length === 0)
    return (
      <NeonCard
        glow="none"
        className="p-8 text-center"
        data-ocid="admin.confessions.empty_state"
      >
        <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No confessions yet.</p>
      </NeonCard>
    );

  return (
    <div className="space-y-3" data-ocid="admin.confessions.section">
      <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
        {confessions.length} confession{confessions.length !== 1 ? "s" : ""}
      </p>
      {confessions.map(
        (
          c: {
            id: number;
            text: string;
            approved: boolean;
            submittedAt?: bigint;
            createdAt?: bigint;
          },
          i: number,
        ) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            data-ocid={`admin.confessions.item.${i + 1}`}
          >
            <NeonCard
              glow={c.approved ? "cyan" : "none"}
              className="p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-foreground text-sm leading-relaxed flex-1">
                  {c.text}
                </p>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-mono uppercase tracking-wider shrink-0",
                    c.approved
                      ? "border-emerald-400/50 text-emerald-300 bg-emerald-400/10"
                      : "border-yellow-400/50 text-yellow-300 bg-yellow-400/10",
                  )}
                >
                  {c.approved ? "Approved" : "Pending"}
                </span>
              </div>
              {(c.submittedAt ?? c.createdAt) && (
                <p className="text-xs text-muted-foreground font-mono">
                  {formatDate((c.submittedAt ?? c.createdAt) as bigint)}
                </p>
              )}
              <div className="flex gap-2">
                {!c.approved && (
                  <button
                    type="button"
                    onClick={() => handleApprove(c.id)}
                    disabled={approvingId === c.id}
                    className="flex-1 py-1.5 text-xs font-medium bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/20 rounded-lg transition-colors disabled:opacity-40"
                    data-ocid={`admin.confessions.approve_button.${i + 1}`}
                  >
                    {approvingId === c.id ? (
                      <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                    ) : (
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                    )}
                    Approve
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  className="flex-1 py-1.5 text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/20 rounded-lg transition-colors disabled:opacity-40"
                  data-ocid={`admin.confessions.delete_button.${i + 1}`}
                >
                  {deletingId === c.id ? (
                    <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                  ) : (
                    <Trash2 className="w-3 h-3 inline mr-1" />
                  )}
                  Delete
                </button>
              </div>
            </NeonCard>
          </motion.div>
        ),
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();
  const { isConnected, isAdmin, identity } = useAuth();
  const { data: stats } = useAdminStats();
  const { data: totalUsers } = useTotalUserCount();
  const {
    data: applications = [],
    isLoading: appsLoading,
    error: appsError,
  } = useListApplications();
  const [activeTab, setActiveTab] = useState<
    | "applications"
    | "broadcast"
    | "invite-codes"
    | "admins"
    | "users"
    | "gallery"
    | "confessions"
  >("applications");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");

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
            You don't have permission to access this page.
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-1">
            Control Room
          </p>
          <h1 className="text-3xl font-display font-bold text-foreground">
            <span className="text-primary">Admin</span> Dashboard
          </h1>
        </div>
        <div className="shrink-0 mt-1 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
            Live
          </span>
        </div>
      </div>

      {/* stats bar */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
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
        <StatCard
          label="Registered Users"
          value={totalUsers}
          icon={<User className="w-5 h-5 text-blue-400" />}
          glow="cyan"
          glowColor="rgba(96,165,250,0.4)"
          ocid="admin.stats.registered_users"
        />
      </div>

      {/* tabs */}
      <div className="overflow-x-auto -mx-4 px-4" data-ocid="admin.tabs">
        <div className="flex min-w-max border-b border-white/10">
          {(
            [
              {
                key: "applications",
                label: "Applications",
                icon: <BarChart2 className="w-3.5 h-3.5" />,
              },
              {
                key: "broadcast",
                label: "Broadcast",
                icon: <Radio className="w-3.5 h-3.5" />,
              },
              {
                key: "invite-codes",
                label: "Invite Codes",
                icon: <Key className="w-3.5 h-3.5" />,
              },
              {
                key: "admins",
                label: "Admins",
                icon: <ShieldCheck className="w-3.5 h-3.5" />,
              },
              {
                key: "users",
                label: "Users",
                icon: <UsersRound className="w-3.5 h-3.5" />,
              },
              {
                key: "gallery",
                label: "Gallery",
                icon: <Image className="w-3.5 h-3.5" />,
              },
              {
                key: "confessions",
                label: "Confessions",
                icon: <MessageCircle className="w-3.5 h-3.5" />,
              },
            ] as const
          ).map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              data-ocid={`admin.tab.${key}`}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-xs font-mono uppercase tracking-wider transition-all duration-200 whitespace-nowrap border-b-2 -mb-px",
                activeTab === key
                  ? "border-pink-500 text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-white/20",
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "broadcast" ? (
          <motion.div
            key="broadcast"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Broadcast Message
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                Send an announcement to all approved guests
              </p>
              <div className="mt-4 h-px bg-white/10" />
            </div>
            <BroadcastPanel approvedCount={stats?.approved} />
          </motion.div>
        ) : activeTab === "admins" ? (
          <motion.div
            key="admins"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Admin Management
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                Add or remove admin principals with full control access
              </p>
              <div className="mt-4 h-px bg-white/10" />
            </div>
            <AdminsPanel
              currentPrincipal={
                isConnected ? (identity?.getPrincipal() ?? null) : null
              }
            />
          </motion.div>
        ) : activeTab === "applications" ? (
          <motion.div
            key="applications"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            data-ocid="admin.apps.section"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Applications
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                Review, approve, or reject event access requests
              </p>
              <div className="mt-4 h-px bg-white/10" />
            </div>
            {/* Status filter tabs */}
            {!appsLoading && !appsError && (
              <div
                className="flex gap-1 p-1 rounded-xl bg-card/20 backdrop-blur-sm border border-border/20 mb-4"
                data-ocid="admin.apps.filter.tabs"
              >
                {(
                  [
                    {
                      key: "pending",
                      label: "Pending",
                      color: "text-yellow-300",
                    },
                    {
                      key: "approved",
                      label: "Approved",
                      color: "text-emerald-300",
                    },
                    {
                      key: "rejected",
                      label: "Rejected",
                      color: "text-red-300",
                    },
                    { key: "all", label: "All", color: "text-foreground" },
                  ] as const
                ).map(({ key, label, color }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatusFilter(key)}
                    data-ocid={`admin.apps.filter.${key}`}
                    className={cn(
                      "flex-1 py-1.5 px-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200",
                      statusFilter === key
                        ? cn(
                            "bg-card/60 border border-border/40 shadow-[0_0_10px_rgba(104,0,255,0.3)]",
                            color,
                          )
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {(() => {
              const filtered =
                statusFilter === "all"
                  ? applications
                  : applications.filter(
                      (app) => getStatus(app) === statusFilter,
                    );
              return appsLoading ? (
                <AppSkeleton />
              ) : appsError ? (
                <NeonCard
                  glow="none"
                  className="p-6 text-center"
                  data-ocid="admin.apps.error_state"
                >
                  <p className="text-destructive text-sm">
                    Failed to load applications. Please refresh the page.
                  </p>
                </NeonCard>
              ) : applications.length === 0 ? (
                <NeonCard
                  glow="none"
                  className="p-8 text-center"
                  data-ocid="admin.apps.empty_state"
                >
                  <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No applications yet — share your invite codes to get
                    started.
                  </p>
                </NeonCard>
              ) : filtered.length === 0 ? (
                <NeonCard
                  glow="none"
                  className="p-8 text-center"
                  data-ocid="admin.apps.filter.empty_state"
                >
                  <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No {statusFilter !== "all" ? statusFilter : ""}{" "}
                    applications.
                  </p>
                </NeonCard>
              ) : (
                <div className="space-y-3">
                  {filtered.map((app, i) => (
                    <ApplicationCard
                      key={app.id.toString()}
                      app={app}
                      index={i}
                    />
                  ))}
                </div>
              );
            })()}
          </motion.div>
        ) : activeTab === "users" ? (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Registered Members
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                Browse and manage all registered user accounts
              </p>
              <div className="mt-4 h-px bg-white/10" />
            </div>
            <UsersPanel />
          </motion.div>
        ) : activeTab === "gallery" ? (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Party Gallery
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                Moderate member-uploaded photos before they go live
              </p>
              <div className="mt-4 h-px bg-white/10" />
            </div>
            <GalleryPanel />
          </motion.div>
        ) : activeTab === "confessions" ? (
          <motion.div
            key="confessions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Confession Wall
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                Approve or remove anonymous confessions from the public wall
              </p>
              <div className="mt-4 h-px bg-white/10" />
            </div>
            <AdminConfessionsPanel />
          </motion.div>
        ) : (
          <motion.div
            key="invite-codes"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Invite Codes
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                Generate and manage access codes for exclusive entry
              </p>
              <div className="mt-4 h-px bg-white/10" />
            </div>
            <InviteCodesPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
