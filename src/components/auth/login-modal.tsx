"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogIn, ArrowRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";
import type { UserRole } from "@/lib/types";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
}

type Stage = "input" | "otp" | "verifying";

const ROLE_DASHBOARD: Record<UserRole, string> = {
  member: "/member",
  host: "/host",
  admin: "/admin",
};


export function LoginModal({ open, onOpenChange, onClose }: LoginModalProps) {
  const router = useRouter();
  const { setSession, isAuthenticated } = useAuth();

  const [stage, setStage] = useState<Stage>("input");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const shouldRestoreSupabaseSession = () => {
    if (typeof window === "undefined") return false;
    const { search, hash } = window.location;
    return (
      /[?&](code|error|type)=/.test(search) ||
      /[?#](access_token|refresh_token|error|type)=/.test(hash)
    );
  };

  useEffect(() => {
    if (!open || isAuthenticated || !shouldRestoreSupabaseSession()) return;
    let cancelled = false;
    const loadSession = async () => {
      setStage("verifying");
      try {
        const session = await authApi.syncSupabaseSession();
        if (cancelled) return;
        if (session) {
          setSession(session.user, session.token);
          onOpenChange(false);
          onClose?.();
          const dest = ROLE_DASHBOARD[session.user.role];
          router.push(dest);
          return;
        }
        // Callback URL present but no session could be restored — fall back to
        // the sign-in form instead of leaving the user on a dead spinner.
        setStage("input");
      } catch (err) {
        if (cancelled) return;
        setStage("input");
        toast.error("Sign-in could not be completed", {
          description:
            err instanceof Error ? err.message : "Please try signing in again.",
        });
      }
    };
    loadSession();
    return () => {
      cancelled = true;
    };
  }, [open, isAuthenticated, onClose, onOpenChange, router, setSession]);

  // Reset internal state when modal closes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStage("input");
        setOtp("");
        setIdentifier("");
        setSubmitting(false);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = identifier.trim();
    if (!email) {
      toast.error("Enter your email to continue.");
      return;
    }
    setSubmitting(true);
    try {
      await authApi.requestOtp(email);
      setStage("otp");
      toast.success("OTP sent", {
        description: "Check your email for the verification code.",
      });
    } catch (err) {
      toast.error("Failed to send OTP", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    try {
      await authApi.googleSignIn();
    } catch (err) {
      toast.error("Google Sign-In failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
      setSubmitting(false);
    }
  };

  const handleSwitchAccount = async () => {
    setSubmitting(true);
    try {
      await authApi.signOut();
      setStage("input");
      setOtp("");
      toast.success("Signed out", {
        description: "You can now sign in with a different email.",
      });
    } catch (err) {
      toast.error("Could not clear the previous session", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (code: string) => {
    if (code.length !== 6) return;
    setStage("verifying");
    setSubmitting(true);
    try {
      const { user, token } = await authApi.login(identifier, code);
      setSession(user, token);
      toast.success(`Welcome, ${user.name}`, {
        description: `Signed in as ${user.role}.`,
      });
      onOpenChange(false);
      onClose?.();
      // Route to role-appropriate dashboard
      const dest = ROLE_DASHBOARD[user.role];
      setTimeout(() => router.push(dest), 100);
    } catch (err) {
      toast.error("Sign-in failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
      setStage("otp");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-border bg-card max-h-[92vh] w-full overflow-y-auto p-0 sm:max-w-md">
        <div className="relative">
          {/* Top accent line */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-px left-1/2 h-px w-2/3 -translate-x-1/2"
            style={{ background: "linear-gradient(90deg, transparent, #C6A769, transparent)" }}
          />

          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-6 text-left">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-full border-2 border-primary">
                  <KeyRound className="size-4 text-primary" />
                </span>
                <DialogTitle className="font-display text-xl font-bold">
                  Sign in to <span className="text-primary">10s Only</span>
                </DialogTitle>
              </div>
              <DialogDescription className="text-sm text-muted-foreground">
                {stage === "input"
                  ? "Use your email or continue with Google. We'll send a one-time code if you choose email."
                  : stage === "otp"
                  ? "Enter the 6-digit code we just sent to your email."
                  : "Verifying your code…"}
              </DialogDescription>
            </DialogHeader>

            {/* Stage: input */}
            {stage === "input" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <Button
                  type="button"
                  size="lg"
                  onClick={handleGoogleSignIn}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-foreground transition hover:border-white/20 hover:bg-white/10"
                >
                  <LogIn className="size-4" />
                  Continue with Google
                </Button>

                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  disabled={submitting}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Use a different account
                </button>

                <div className="relative py-4 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="relative bg-black px-3">or email OTP</span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="identifier" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="identifier"
                    type="email"
                    placeholder="you@10sonly.club"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="glass-input h-11"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
                >
                  Send code
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            ) : null}

            {/* Stage: OTP */}
            {stage === "otp" ? (
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Verification code
                  </Label>
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(v) => {
                      setOtp(v);
                      if (v.length === 6) handleVerify(v);
                    }}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="size-11 border-white/15 bg-white/5 text-lg font-bold text-foreground"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Code sent to the email you entered.
                  </p>
                </div>

                <Button
                  size="lg"
                  className="h-11 w-full gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
                  disabled={otp.length !== 6 || submitting}
                  onClick={() => handleVerify(otp)}
                >
                  Verify &amp; sign in
                  <ArrowRight className="size-4" />
                </Button>

                <button
                  type="button"
                  onClick={() => setStage("input")}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
                >
                  ← Use a different email
                </button>
              </div>
            ) : null}

            {/* Stage: verifying */}
            {stage === "verifying" ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Verifying…</p>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
