"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  User2,
  Mail,
  MapPin,
  HelpCircle,
  Send,
  RotateCcw,
  Award,
} from "lucide-react";
import { quizApi, applicationsApi } from "@/lib/api-client";
import { CITY_LABELS, VIBE_LABELS } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-store";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ApplicationAnswer, City, EventVibe } from "@/lib/types";

type Step = 0 | 1 | 2 | 3 | 4;

const STEPS = [
  { title: "Identity", icon: User2, hint: "Who you are" },
  { title: "Profile", icon: Mail, hint: "How to reach you" },
  { title: "Vibe Check", icon: Sparkles, hint: "Match the room" },
  { title: "Why You", icon: HelpCircle, hint: "Tell us in your words" },
  { title: "Review", icon: Award, hint: "Confirm & submit" },
];

interface FormState {
  name: string;
  handle: string;
  email: string;
  phone: string;
  city: City;
  bio: string;
  answers: Record<string, string>; // questionId -> optionId
  why: string;
}

const DEFAULT_FORM: FormState = {
  name: "",
  handle: "",
  email: "",
  phone: "",
  city: "mumbai",
  bio: "",
  answers: {},
  why: "",
};

export function ApplySection() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormState>({
    ...DEFAULT_FORM,
    name: user?.name ?? "",
    handle: user?.handle ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    city: user?.city ?? "mumbai",
    bio: user?.bio ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [alignment, setAlignment] = useState<number | null>(null);
  const [dominantVibe, setDominantVibe] = useState<EventVibe | null>(null);

  const { data: questions, isLoading: qLoading } = useQuery({
    queryKey: ["quiz", "questions"],
    queryFn: () => quizApi.questions(),
  });

  const update = (patch: Partial<FormState>) =>
    setForm((f) => ({ ...f, ...patch }));

  const canNext = (() => {
    switch (step) {
      case 0:
        return form.name.trim() && form.handle.trim();
      case 1:
        return form.email.trim() && form.city;
      case 2:
        return (
          !!questions &&
          questions.every((q) => form.answers[q.id] && form.answers[q.id].length > 0)
        );
      case 3:
        return form.why.trim().length >= 30;
      default:
        return true;
    }
  })();

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Compute alignment via quizApi.submit
      const answers: ApplicationAnswer[] = Object.entries(form.answers).map(
        ([questionId, optionId]) => ({ questionId, optionId })
      );
      const result = await quizApi.submit(answers);
      setAlignment(result.vibeAlignment);
      setDominantVibe(result.dominantVibe);

      const app = await applicationsApi.submit({
        userId: user?.id ?? "guest",
        answers,
      });
      setReference(app.id.toUpperCase());
      toast.success("Application submitted", {
        description: `Reference ${app.id.toUpperCase()}`,
      });
      setStep(4);
    } catch (err) {
      toast.error("Submission failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm({ ...DEFAULT_FORM });
    setStep(0);
    setReference(null);
    setAlignment(null);
    setDominantVibe(null);
  };

  return (
    <section className="relative z-10 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Reveal className="mb-8 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Application
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Apply to <span className="text-primary font-display">join</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Five steps. Two minutes. We&apos;ll get back within 48 hours.
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
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step 0: Identity */}
              {step === 0 ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">
                      Full name
                    </Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => update({ name: e.target.value })}
                      placeholder="Aria Mehta"
                      className="glass-input h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="handle" className="text-xs uppercase tracking-wider text-muted-foreground">
                      Handle
                    </Label>
                    <Input
                      id="handle"
                      value={form.handle}
                      onChange={(e) =>
                        update({
                          handle: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_.]/g, ""),
                        })
                      }
                      placeholder="aria.m"
                      className="glass-input h-11"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Lowercase letters, numbers, dots, underscores.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Step 1: Profile */}
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => update({ email: e.target.value })}
                      placeholder="you@10sonly.club"
                      className="glass-input h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground">
                      Phone <span className="text-muted-foreground/60">(optional)</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update({ phone: e.target.value })}
                      placeholder="+91 98XXX XXXXX"
                      className="glass-input h-11"
                    />
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
                        <SelectValue placeholder="Pick your city" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(CITY_LABELS) as City[]).map((c) => (
                          <SelectItem key={c} value={c}>
                            <span className="inline-flex items-center gap-2">
                              <MapPin className="size-3.5" />
                              {CITY_LABELS[c]}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : null}

              {/* Step 2: Vibe Check */}
              {step === 2 ? (
                <div className="space-y-5">
                  {qLoading ? (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" /> Loading vibe check…
                    </div>
                  ) : null}
                  {questions?.map((q, qi) => (
                    <div key={q.id} className="space-y-2">
                      <p className="font-display text-sm font-semibold text-foreground">
                        <span className="mr-2 text-primary">Q{qi + 1}.</span>
                        {q.prompt}
                      </p>
                      {q.hint ? (
                        <p className="text-xs text-muted-foreground">{q.hint}</p>
                      ) : null}
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {q.options.map((o) => {
                          const selected = form.answers[q.id] === o.id;
                          return (
                            <button
                              key={o.id}
                              type="button"
                              onClick={() =>
                                update({
                                  answers: { ...form.answers, [q.id]: o.id },
                                })
                              }
                              className={cn(
                                "rounded-xl border p-3 text-left text-sm transition-all",
                                selected
                                  ? "border-primary/50 bg-primary/10 text-foreground "
                                  : "border-border bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground"
                              )}
                            >
                              {o.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Step 3: Why You */}
              {step === 3 ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="bio" className="text-xs uppercase tracking-wider text-muted-foreground">
                      Short bio
                    </Label>
                    <Textarea
                      id="bio"
                      rows={3}
                      value={form.bio}
                      onChange={(e) => update({ bio: e.target.value })}
                      placeholder="Designer by day, strobe-chaser by night…"
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="why" className="text-xs uppercase tracking-wider text-muted-foreground">
                      Why do you want in? <span className="text-muted-foreground/60">(min 30 chars)</span>
                    </Label>
                    <Textarea
                      id="why"
                      rows={5}
                      value={form.why}
                      onChange={(e) => update({ why: e.target.value })}
                      placeholder="Tell us about the last party that changed you. What do you bring to the room?"
                      className="glass-input"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {form.why.length}/30 chars
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Step 4: Review + Success */}
              {step === 4 ? (
                reference ? (
                  <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <div className="grid size-16 place-items-center rounded-full bg-primary/15 text-primary">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-bold">
                        Application received
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        We&apos;ll review and respond within 48 hours.
                      </p>
                    </div>
                    <div className="border border-border bg-card w-full max-w-md rounded-xl p-4 text-left">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="uppercase tracking-wider">Reference</span>
                        <span className="font-mono text-foreground">{reference}</span>
                      </div>
                      {alignment !== null ? (
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="uppercase tracking-wider">Vibe alignment</span>
                          <span className="font-mono text-primary">{alignment}%</span>
                        </div>
                      ) : null}
                      {dominantVibe ? (
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="uppercase tracking-wider">Dominant vibe</span>
                          <Badge className="border-none bg-primary/30 text-secondary">
                            {VIBE_LABELS[dominantVibe]}
                          </Badge>
                        </div>
                      ) : null}
                    </div>
                    <Button
                      variant="ghost"
                      className="gap-2 text-muted-foreground"
                      onClick={reset}
                    >
                      <RotateCcw className="size-4" />
                      Submit another
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="font-display text-lg font-bold">Review</h3>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <ReviewRow label="Name" value={form.name} />
                      <ReviewRow label="Handle" value={`@${form.handle}`} />
                      <ReviewRow label="Email" value={form.email} />
                      <ReviewRow label="City" value={CITY_LABELS[form.city]} />
                      <ReviewRow label="Why" value={form.why} span />
                    </div>
                  </div>
                )
              ) : null}
            </motion.div>
          </AnimatePresence>

          {/* Footer nav */}
          {step !== 4 || !reference ? (
            <div className="mt-6 flex items-center justify-between gap-2 border-t border-border pt-5">
              <Button
                variant="ghost"
                className="gap-1 text-muted-foreground"
                disabled={step === 0 || submitting}
                onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
              >
                <ChevronLeft className="size-4" />
                Back
              </Button>
              {step < 4 ? (
                <Button
                  className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
                  disabled={!canNext}
                  onClick={() => setStep((s) => Math.min(4, s + 1) as Step)}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? (
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
