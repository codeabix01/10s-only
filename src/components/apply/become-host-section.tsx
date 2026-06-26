"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users2,
  History,
  HelpCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/site/ambient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hostAppApi } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-store";
import { CITY_LABELS } from "@/lib/mock-data";
import { toast } from "sonner";
import type {
  City,
  HostApplication,
  HostApplicationInput,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type Step = 0 | 1 | 2 | 3;

const STEPS = [
  { title: "Crew", icon: Users2, hint: "Who you are" },
  { title: "Track Record", icon: History, hint: "What you've done" },
  { title: "Why Host", icon: HelpCircle, hint: "Why 10s Only" },
  { title: "Review", icon: Award, hint: "Confirm & submit" },
];

type FormState = HostApplicationInput;

const DEFAULT_FORM: FormState = {
  collectiveName: "",
  bio: "",
  city: "mumbai",
  portfolio: [""],
  socialLinks: [{ label: "Instagram", url: "" }],
};

export function BecomeHostSection() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, updateUser } = useAuth();

  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM });
  const [submittedApp, setSubmittedApp] = useState<HostApplication | null>(null);
  const [forceForm, setForceForm] = useState(false);

  // Check for existing application
  const { data: existing, isLoading: existingLoading } = useQuery({
    queryKey: ["host-app", "mine", user?.id],
    queryFn: () => hostAppApi.mine(user?.id ?? "guest"),
    enabled: !!user,
  });

  // If user already has an approved app, ensure their role reflects host status
  useEffect(() => {
    if (existing?.status === "approved" && user && user.role !== "host") {
      updateUser({
        role: "host",
        hostCollective: existing.collectiveName,
        verified: true,
      });
      toast.success("Host access granted", {
        description: "Your application was approved. Redirecting…",
      });
      setTimeout(() => router.push("/host"), 1500);
    }
  }, [existing, user, updateUser, router]);

  const mutation = useMutation({
    mutationFn: (input: HostApplicationInput) =>
      hostAppApi.submit(input, user ?? ({} as never)),
    onSuccess: (app) => {
      setSubmittedApp(app);
      setStep(3);
      setForceForm(false);
      qc.invalidateQueries({ queryKey: ["host-app", "mine", user?.id] });
      toast.success("Application submitted", {
        description: `Reference ${app.id.toUpperCase()}`,
      });
    },
    onError: (err) =>
      toast.error("Submission failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      }),
  });

  const update = (patch: Partial<FormState>) =>
    setForm((f) => ({ ...f, ...patch }));

  const canNext = (() => {
    switch (step) {
      case 0:
        return form.collectiveName.trim().length >= 2 && form.city;
      case 1:
        return form.portfolio.filter((p) => p.trim().length > 0).length >= 1;
      case 2:
        return form.bio.trim().length >= 60;
      default:
        return true;
    }
  })();

  const handleSubmit = () => {
    const clean: HostApplicationInput = {
      collectiveName: form.collectiveName.trim(),
      bio: form.bio.trim(),
      city: form.city,
      portfolio: form.portfolio.map((p) => p.trim()).filter(Boolean),
      socialLinks: form.socialLinks
        .map((s) => ({ label: s.label.trim(), url: s.url.trim() }))
        .filter((s) => s.label && s.url),
    };
    mutation.mutate(clean);
  };

  const prefillAndEdit = () => {
    if (!existing) return;
    setForm({
      collectiveName: existing.collectiveName,
      bio: existing.bio,
      city: existing.city,
      portfolio:
        existing.portfolio.length > 0 ? existing.portfolio : [""],
      socialLinks:
        existing.socialLinks.length > 0
          ? existing.socialLinks
          : [{ label: "Instagram", url: "" }],
    });
    setSubmittedApp(null);
    setForceForm(true);
    setStep(0);
  };

  // Loading state
  if (existingLoading) {
    return (
      <div className="relative z-10 mx-auto flex min-h-[50vh] w-full max-w-3xl items-center justify-center px-4">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    );
  }

  // Existing application status screen (when not forcing form, and not approved)
  const showExisting =
    existing &&
    !forceForm &&
    !submittedApp &&
    existing.status !== "approved";

  if (showExisting && existing) {
    return (
      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Application <span className="text-primary font-display">in review</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We&apos;ve received your host application. Sit tight — we&apos;ll
            respond within 72 hours.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mt-8">
          <div className="border border-border bg-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div
                className="grid size-14 place-items-center rounded-2xl font-display text-xl font-bold text-white"
                style={{
                  background:
                    "#C6A769",
                }}
              >
                {existing.collectiveName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-display text-lg font-bold">
                  {existing.collectiveName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {CITY_LABELS[existing.city]} · submitted{" "}
                  {new Date(existing.submittedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="ml-auto">
                {existing.status === "pending" ? (
                  <Badge className="border border-[#ff6b00]/40 bg-[#ff6b00]/15 text-amber-600">
                    <Clock className="size-3" /> Pending
                  </Badge>
                ) : existing.status === "revision" ? (
                  <Badge className="border border-[#ff6b00]/40 bg-[#ff6b00]/15 text-amber-600">
                    <AlertCircle className="size-3" /> Revision requested
                  </Badge>
                ) : existing.status === "rejected" ? (
                  <Badge className="border border-[#ff3b3b]/40 bg-[#ff3b3b]/15 text-destructive">
                    <X className="size-3" /> Rejected
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="mt-5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Bio
              </Label>
              <p className="mt-1 text-sm text-foreground/85">{existing.bio}</p>
            </div>

            {existing.portfolio.length > 0 ? (
              <div className="mt-4">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Portfolio
                </Label>
                <ul className="mt-1 space-y-0.5">
                  {existing.portfolio.map((p, i) => (
                    <li key={i} className="text-sm text-foreground/80">
                      · {p}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {existing.reviewerNote ? (
              <div className="mt-4 rounded-xl border border-[#ff6b00]/30 bg-[#ff6b00]/5 p-3">
                <Label className="text-[10px] uppercase tracking-wider text-amber-600">
                  Reviewer note
                </Label>
                <p className="mt-1 text-sm text-foreground/90">
                  {existing.reviewerNote}
                </p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                variant="ghost"
                className="gap-1 text-muted-foreground"
                onClick={() => router.push("/member")}
              >
                <ChevronLeft className="size-4" /> Back to dashboard
              </Button>
              {existing.status === "revision" ||
              existing.status === "rejected" ? (
                <Button
                  className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
                  onClick={prefillAndEdit}
                >
                  Revise & resubmit
                </Button>
              ) : null}
            </div>
          </div>
        </Reveal>
      </section>
    );
  }

  return (
    <section className="relative z-10 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Reveal className="mb-8 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Host Application
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Become a <span className="text-primary font-display">host</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Four steps. Five minutes. We&apos;ll review within 72 hours.
        </p>
      </Reveal>

      {/* Stepper */}
      <Reveal delay={0.05} className="mb-8">
        <ol className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
          {STEPS.map((s, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <li key={s.title} className="flex flex-1 items-center gap-2">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "grid size-9 place-items-center rounded-full border transition-all",
                      active
                        ? "border-primary/60 bg-primary/15 text-primary "
                        : done
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-white/5 text-muted-foreground"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <s.icon className="size-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium uppercase tracking-wider",
                      active ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {s.title}
                  </span>
                </div>
                {i < STEPS.length - 1 ? (
                  <div className="mx-1 hidden h-px flex-1 bg-white/10 sm:block" />
                ) : null}
              </li>
            );
          })}
        </ol>
      </Reveal>

      {/* Card */}
      <Reveal delay={0.1}>
        <div className="border border-border bg-card rounded-3xl p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step + (submittedApp ? "-done" : "")}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step 0: Crew */}
              {step === 0 ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Collective name
                    </Label>
                    <Input
                      value={form.collectiveName}
                      onChange={(e) =>
                        update({ collectiveName: e.target.value })
                      }
                      placeholder="STROBE BUREAU"
                      className="glass-input h-11"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      This is what members see on your events.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Home city
                    </Label>
                    <Select
                      value={form.city}
                      onValueChange={(v) => update({ city: v as City })}
                    >
                      <SelectTrigger className="glass-input h-11 w-full">
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
                </div>
              ) : null}

              {/* Step 1: Track Record */}
              {step === 1 ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Portfolio — past nights, residencies, projects
                    </Label>
                    <div className="mt-2 space-y-2">
                      {form.portfolio.map((p, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={p}
                            onChange={(e) => {
                              const next = [...form.portfolio];
                              next[i] = e.target.value;
                              update({ portfolio: next });
                            }}
                            placeholder={`e.g. Loft Series — 6 invite-only nights, 2024`}
                            className="glass-input h-11"
                          />
                          {form.portfolio.length > 1 ? (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                const next = form.portfolio.filter(
                                  (_, idx) => idx !== i
                                );
                                update({ portfolio: next });
                              }}
                            >
                              <X className="size-4" />
                            </Button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-2 gap-1 border-border"
                      onClick={() =>
                        update({ portfolio: [...form.portfolio, ""] })
                      }
                    >
                      <Plus className="size-3.5" /> Add another
                    </Button>
                  </div>

                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Social links (optional)
                    </Label>
                    <div className="mt-2 space-y-2">
                      {form.socialLinks.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={s.label}
                            onChange={(e) => {
                              const next = [...form.socialLinks];
                              next[i] = { ...next[i], label: e.target.value };
                              update({ socialLinks: next });
                            }}
                            placeholder="Instagram"
                            className="glass-input h-11 w-32 sm:w-40"
                          />
                          <Input
                            value={s.url}
                            onChange={(e) => {
                              const next = [...form.socialLinks];
                              next[i] = { ...next[i], url: e.target.value };
                              update({ socialLinks: next });
                            }}
                            placeholder="https://…"
                            className="glass-input h-11 flex-1"
                          />
                          {form.socialLinks.length > 1 ? (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                const next = form.socialLinks.filter(
                                  (_, idx) => idx !== i
                                );
                                update({ socialLinks: next });
                              }}
                            >
                              <X className="size-4" />
                            </Button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-2 gap-1 border-border"
                      onClick={() =>
                        update({
                          socialLinks: [
                            ...form.socialLinks,
                            { label: "", url: "" },
                          ],
                        })
                      }
                    >
                      <Plus className="size-3.5" /> Add link
                    </Button>
                  </div>
                </div>
              ) : null}

              {/* Step 2: Why Host */}
              {step === 2 ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Why do you want to host on 10s Only?{" "}
                      <span className="text-muted-foreground/60">
                        (min 60 chars)
                      </span>
                    </Label>
                    <Textarea
                      rows={6}
                      value={form.bio}
                      onChange={(e) => update({ bio: e.target.value })}
                      placeholder="Tell us about your collective, your nights, your ethos. What do you bring to the room?"
                      className="glass-input"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {form.bio.length}/60 chars
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Step 3: Review + Success */}
              {step === 3 ? (
                submittedApp ? (
                  <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <div className="grid size-16 place-items-center rounded-full bg-primary/15 text-primary">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-bold">
                        Application received
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        We&apos;ll review and respond within 72 hours. Your role
                        will automatically upgrade to{" "}
                        <span className="font-semibold text-primary">
                          host
                        </span>{" "}
                        on approval.
                      </p>
                    </div>
                    <div className="border border-border bg-card w-full max-w-md rounded-xl p-4 text-left">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="uppercase tracking-wider">
                          Reference
                        </span>
                        <span className="font-mono text-foreground">
                          {submittedApp.id.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="uppercase tracking-wider">
                          Collective
                        </span>
                        <span className="font-semibold text-foreground">
                          {submittedApp.collectiveName}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="uppercase tracking-wider">City</span>
                        <span className="text-foreground">
                          {CITY_LABELS[submittedApp.city]}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="gap-2 text-muted-foreground"
                      onClick={() => router.push("/member")}
                    >
                      Back to dashboard
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="font-display text-lg font-bold">Review</h3>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <ReviewRow
                        label="Collective"
                        value={form.collectiveName}
                      />
                      <ReviewRow label="City" value={CITY_LABELS[form.city]} />
                      <ReviewRow
                        label="Portfolio items"
                        value={`${form.portfolio.filter((p) => p.trim()).length}`}
                      />
                      <ReviewRow
                        label="Social links"
                        value={`${form.socialLinks.filter((s) => s.url.trim()).length}`}
                      />
                      <ReviewRow label="Bio" value={form.bio} span />
                    </div>
                  </div>
                )
              ) : null}
            </motion.div>
          </AnimatePresence>

          {/* Footer nav */}
          {!(step === 3 && submittedApp) ? (
            <div className="mt-6 flex items-center justify-between gap-2 border-t border-border pt-5">
              <Button
                variant="ghost"
                className="gap-1 text-muted-foreground"
                disabled={step === 0 || mutation.isPending}
                onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
              >
                <ChevronLeft className="size-4" />
                Back
              </Button>
              {step < 3 ? (
                <Button
                  className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
                  disabled={!canNext}
                  onClick={() => setStep((s) => Math.min(3, s + 1) as Step)}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
                  disabled={mutation.isPending}
                  onClick={handleSubmit}
                >
                  {mutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  Submit application
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}

function ReviewRow({
  label,
  value,
  span,
}: {
  label: string;
  value: string;
  span?: boolean;
}) {
  return (
    <div
      className={cn(
        "border border-border bg-card rounded-xl p-3",
        span ? "sm:col-span-2" : ""
      )}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm text-foreground">{value || "—"}</div>
    </div>
  );
}
