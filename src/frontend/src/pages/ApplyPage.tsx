import { ExternalBlob } from "@/backend";
import { NeonCard } from "@/components/NeonCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubmitApplication } from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PhotoEntry {
  file: File;
  preview: string;
  progress: number;
  blob: ExternalBlob | null;
  uploading: boolean;
  done: boolean;
}

interface Step1Fields {
  name: string;
  instagram: string;
  email: string;
  phone: string;
}

interface Step2Fields {
  inviteCode: string;
}

interface FieldErrors {
  [key: string]: string | undefined;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const STEPS = ["Your Details", "Your Vibe", "Final Step"] as const;

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// ── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div
      className="flex items-center justify-center gap-0 mb-10"
      data-ocid="apply.step_indicator"
    >
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold transition-all duration-500 border",
                i < current
                  ? "bg-primary border-primary text-foreground shadow-[0_0_12px_oklch(var(--primary)/0.6)]"
                  : i === current
                    ? "border-accent text-accent shadow-[0_0_16px_oklch(var(--accent)/0.5)] bg-accent/10 animate-pulse"
                    : "border-border/40 text-muted-foreground bg-transparent",
              )}
            >
              {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-[10px] font-display tracking-widest uppercase whitespace-nowrap transition-colors duration-300",
                i === current
                  ? "text-accent"
                  : i < current
                    ? "text-primary"
                    : "text-muted-foreground/50",
              )}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "w-12 md:w-20 h-px mb-5 mx-1 transition-all duration-500",
                i < current ? "bg-primary/60" : "bg-border/30",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── NeonInput ──────────────────────────────────────────────────────────────────
function NeonInput({
  id,
  label,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-xs font-display tracking-[0.15em] uppercase text-muted-foreground"
      >
        {label}
      </Label>
      <Input
        id={id}
        {...props}
        className={cn(
          "bg-card/20 border-border/40 text-foreground placeholder:text-muted-foreground/40",
          "focus:border-accent focus:ring-1 focus:ring-accent/50 focus:shadow-[0_0_12px_oklch(var(--accent)/0.25)]",
          "h-12 text-base font-body transition-all duration-200 rounded-lg",
          error &&
            "border-destructive/70 focus:border-destructive focus:ring-destructive/40",
          className,
        )}
      />
      {error && (
        <p
          className="text-xs text-destructive font-body flex items-center gap-1.5"
          data-ocid={`apply.${id}_field_error`}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Photo Upload ──────────────────────────────────────────────────────────────
function PhotoUpload({
  photos,
  onAdd,
  onRemove,
}: {
  photos: PhotoEntry[];
  onAdd: (files: FileList) => void;
  onRemove: (idx: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) onAdd(e.dataTransfer.files);
    },
    [onAdd],
  );

  const canAdd = photos.length < 5;

  return (
    <div className="space-y-4">
      {canAdd && (
        <div
          data-ocid="apply.photo_dropzone"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          // biome-ignore lint/a11y/useSemanticElements: drag-drop zone requires div for correct event handling
          role="button"
          tabIndex={0}
          aria-label="Upload photos"
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300",
            "flex flex-col items-center justify-center gap-3 min-h-[140px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            dragging
              ? "border-accent bg-accent/10 shadow-[0_0_24px_oklch(var(--accent)/0.3)]"
              : "border-border/40 hover:border-primary/50 hover:bg-primary/5",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => e.target.files && onAdd(e.target.files)}
            data-ocid="apply.photo_input"
          />
          <div
            className={cn(
              "transition-all duration-300",
              dragging ? "scale-110" : "",
            )}
          >
            <Upload className="w-8 h-8 text-primary/70" />
          </div>
          <div className="text-center">
            <p className="text-sm font-display font-semibold text-foreground/80">
              {dragging ? "Drop it like it's hot" : "Upload your photos"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Drag & drop or click — {photos.length}/5 uploaded
            </p>
          </div>
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <AnimatePresence>
            {photos.map((p, i) => (
              <motion.div
                key={p.preview}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.25 }}
                data-ocid={`apply.photo_thumb.${i + 1}`}
                className="relative aspect-square rounded-lg overflow-hidden border border-border/30 bg-card/20 group"
              >
                <img
                  src={p.preview}
                  alt={`upload ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {p.uploading && (
                  <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center gap-1">
                    <Loader2 className="w-5 h-5 text-accent animate-spin" />
                    <span className="text-[10px] font-display text-accent">
                      {p.progress}%
                    </span>
                  </div>
                )}
                {p.done && !p.uploading && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle2 className="w-4 h-4 text-primary drop-shadow-[0_0_4px_oklch(var(--primary)/0.8)]" />
                  </div>
                )}
                {!p.uploading && (
                  <button
                    type="button"
                    onClick={() => onRemove(i)}
                    aria-label={`Remove photo ${i + 1}`}
                    data-ocid={`apply.photo_remove.${i + 1}`}
                    className="absolute top-1 left-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <X className="w-3 h-3 text-foreground" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {photos.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
          <ImageIcon className="w-4 h-4" />
          Minimum 3 photos required
        </div>
      )}
    </div>
  );
}

// ── Exclusivity Quote ─────────────────────────────────────────────────────────
function ExclusivityQuote({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="text-center py-5 px-4"
    >
      <p className="text-xs font-display tracking-[0.2em] uppercase text-primary/50 italic">
        &ldquo;{text}&rdquo;
      </p>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ApplyPage() {
  const submitMutation = useSubmitApplication();

  const [step, setStep] = useState(0);
  const [successId, setSuccessId] = useState<bigint | null>(null);
  const [step1, setStep1] = useState<Step1Fields>({
    name: "",
    instagram: "",
    email: "",
    phone: "",
  });
  const [step2, setStep2] = useState<Step2Fields>({
    inviteCode: "",
  });
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [inviteError, setInviteError] = useState("");

  function validateStep1(): FieldErrors {
    const e: FieldErrors = {};
    if (!step1.name.trim()) e.name = "Your name is required";
    if (!step1.instagram.trim()) e.instagram = "Instagram handle is required";
    if (!validateEmail(step1.email)) e.email = "Enter a valid email address";
    if (!step1.phone.trim()) e.phone = "Phone number is required";
    return e;
  }

  function validateStep2(): FieldErrors {
    return {};
  }

  const handleAddPhotos = useCallback(
    async (files: FileList) => {
      const currentCount = photos.length;
      const remaining = 5 - currentCount;
      const toAdd = Array.from(files).slice(0, remaining);

      const newEntries: PhotoEntry[] = toAdd.map((f) => ({
        file: f,
        preview: URL.createObjectURL(f),
        progress: 0,
        blob: null,
        uploading: true,
        done: false,
      }));

      setPhotos((prev) => [...prev, ...newEntries]);

      for (let i = 0; i < toAdd.length; i++) {
        const file = toAdd[i];
        const globalIdx = currentCount + i;
        try {
          const bytes = new Uint8Array(await file.arrayBuffer());
          const blob = ExternalBlob.fromBytes(bytes).withUploadProgress(
            (pct) => {
              setPhotos((prev) =>
                prev.map((p, idx) =>
                  idx === globalIdx ? { ...p, progress: pct } : p,
                ),
              );
            },
          );
          setPhotos((prev) =>
            prev.map((p, idx) =>
              idx === globalIdx
                ? { ...p, blob, uploading: false, done: true, progress: 100 }
                : p,
            ),
          );
        } catch {
          toast.error(`Failed to upload ${file.name}`);
          setPhotos((prev) => prev.filter((_, idx) => idx !== globalIdx));
        }
      }
    },
    [photos.length],
  );

  const handleRemovePhoto = useCallback((idx: number) => {
    setPhotos((prev) => {
      const removed = prev[idx];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  function handleNext() {
    if (step === 0) {
      const e = validateStep1();
      if (Object.keys(e).length) {
        setErrors(e);
        return;
      }
      setErrors({});
      setStep(1);
    } else if (step === 1) {
      const e = validateStep2();
      if (Object.keys(e).length) {
        setErrors(e);
        return;
      }
      setErrors({});
      setInviteError("");
      setStep(2);
    }
  }

  function handleBack() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit() {
    const readyPhotos = photos.filter((p) => p.done && p.blob);
    if (readyPhotos.length < 3) {
      toast.error("Please upload at least 3 photos to continue");
      return;
    }
    if (photos.some((p) => p.uploading)) {
      toast.error("Please wait for all uploads to finish");
      return;
    }
    try {
      const blobs = readyPhotos.map((p) => p.blob as ExternalBlob);
      const id = await submitMutation.mutateAsync({
        name: step1.name.trim(),
        instagramHandle: step1.instagram.startsWith("@")
          ? step1.instagram
          : `@${step1.instagram}`,
        email: step1.email.trim(),
        phone: step1.phone.trim(),
        inviteCode: step2.inviteCode.trim(),
        plusOne: false,
        photos: blobs,
      });
      setSuccessId(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      if (msg.toLowerCase().includes("invite")) {
        setInviteError("Invalid invite code — try again");
        setStep(1);
      } else {
        toast.error(msg);
      }
    }
  }

  const readyCount = photos.filter((p) => p.done).length;
  const uploadingCount = photos.filter((p) => p.uploading).length;

  if (successId !== null) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-[-20%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-secondary/6 blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="relative z-10 w-full max-w-md"
          data-ocid="apply.success_state"
        >
          <NeonCard glow="cyan" className="p-8 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
            <div className="space-y-2">
              <p className="text-xs font-display tracking-[0.35em] uppercase text-primary/60">
                Application Received
              </p>
              <h2
                className="text-3xl font-display font-black tracking-tight"
                style={{ textShadow: "0 0 30px oklch(0.68 0.27 305 / 0.6)" }}
              >
                You're In The Queue
              </h2>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Your application has been submitted. The committee reviews every
                submission personally — you'll be notified at{" "}
                <span className="text-foreground font-semibold">
                  {step1.email}
                </span>{" "}
                once a decision is made.
              </p>
            </div>
            <div className="border-t border-border/30" />
            <div className="space-y-2">
              <p className="text-xs font-display tracking-widest text-muted-foreground uppercase">
                Your Application ID:
              </p>
              <p
                className="text-2xl font-mono font-bold tracking-widest"
                style={{
                  color: "oklch(0.68 0.27 305)",
                  textShadow: "0 0 16px oklch(0.68 0.27 305 / 0.5)",
                }}
                data-ocid="apply.success_app_id"
              >
                #{successId.toString().padStart(6, "0")}
              </p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(successId.toString());
                  toast.success("Application ID copied!");
                }}
                className="mt-1 flex items-center gap-1.5 mx-auto text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
                data-ocid="apply.copy_id_button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-label="Copy"
                  role="img"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                Tap to copy ID
              </button>
              <p className="text-xs text-muted-foreground font-body mt-2">
                Save this ID — visit{" "}
                <span className="font-mono text-foreground/70">/status</span>{" "}
                anytime to check your application status
              </p>
            </div>
            <div className="border-t border-border/30" />
            <Button
              type="button"
              asChild
              className="w-full font-display font-bold tracking-wide text-sm"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.22 290), oklch(0.55 0.25 315))",
                boxShadow: "0 0 20px oklch(0.65 0.22 290 / 0.4)",
              }}
              data-ocid="apply.check_status_button"
            >
              <a href={`/status?id=${successId.toString()}`}>
                Check My Application Status
              </a>
            </Button>
          </NeonCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-secondary/6 blur-[100px]" />
        <div className="absolute top-[40%] left-[-5%] w-[25vw] h-[25vw] rounded-full bg-accent/5 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-12 pb-20">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
          data-ocid="apply.page"
        >
          <p className="text-xs font-display tracking-[0.35em] uppercase text-primary/60 mb-3">
            Exclusive Access
          </p>
          <h1
            className="text-4xl md:text-5xl font-display font-black tracking-tight uppercase mb-3"
            style={{
              textShadow:
                "0 0 40px oklch(0.65 0.22 290 / 0.5), 0 0 80px oklch(0.68 0.27 305 / 0.2)",
            }}
          >
            YOUR APPLICATION
          </h1>
          <p
            className="text-sm font-display tracking-[0.2em] uppercase text-accent/80"
            style={{ textShadow: "0 0 20px oklch(0.68 0.27 305 / 0.6)" }}
          >
            The list is short. Make it count.
          </p>
        </motion.div>

        <StepIndicator current={step} />

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <NeonCard
                glow="purple"
                className="p-6"
                data-ocid="apply.step1_card"
              >
                <h2 className="text-lg font-display font-bold tracking-wide uppercase mb-1">
                  Who Are You?
                </h2>
                <p className="text-xs text-muted-foreground/60 font-body mb-6">
                  We verify every handle. Make it real.
                </p>
                <div className="space-y-4">
                  <NeonInput
                    id="name"
                    label="Full Name"
                    placeholder="Your full name"
                    value={step1.name}
                    onChange={(e) =>
                      setStep1((s) => ({ ...s, name: e.target.value }))
                    }
                    onBlur={() => {
                      if (!step1.name.trim())
                        setErrors((e) => ({
                          ...e,
                          name: "Your name is required",
                        }));
                      else
                        setErrors((e) => {
                          const n = { ...e };
                          n.name = undefined;
                          return n;
                        });
                    }}
                    error={errors.name}
                    autoComplete="name"
                    data-ocid="apply.name_input"
                  />
                  <NeonInput
                    id="instagram"
                    label="Instagram Handle"
                    placeholder="@yourhandle"
                    value={step1.instagram}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setStep1((s) => ({
                        ...s,
                        instagram:
                          raw && !raw.startsWith("@") ? `@${raw}` : raw,
                      }));
                    }}
                    onBlur={() => {
                      if (!step1.instagram.trim())
                        setErrors((e) => ({
                          ...e,
                          instagram: "Instagram handle is required",
                        }));
                      else
                        setErrors((e) => {
                          const n = { ...e };
                          n.instagram = undefined;
                          return n;
                        });
                    }}
                    error={errors.instagram}
                    data-ocid="apply.instagram_input"
                  />
                  <NeonInput
                    id="email"
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={step1.email}
                    onChange={(e) =>
                      setStep1((s) => ({ ...s, email: e.target.value }))
                    }
                    onBlur={() => {
                      if (!validateEmail(step1.email))
                        setErrors((e) => ({
                          ...e,
                          email: "Enter a valid email address",
                        }));
                      else
                        setErrors((e) => {
                          const n = { ...e };
                          n.email = undefined;
                          return n;
                        });
                    }}
                    error={errors.email}
                    autoComplete="email"
                    data-ocid="apply.email_input"
                  />
                  <NeonInput
                    id="phone"
                    label="Phone Number"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={step1.phone}
                    onChange={(e) =>
                      setStep1((s) => ({ ...s, phone: e.target.value }))
                    }
                    onBlur={() => {
                      if (!step1.phone.trim())
                        setErrors((e) => ({
                          ...e,
                          phone: "Phone number is required",
                        }));
                      else
                        setErrors((e) => {
                          const n = { ...e };
                          n.phone = undefined;
                          return n;
                        });
                    }}
                    error={errors.phone}
                    autoComplete="tel"
                    data-ocid="apply.phone_input"
                  />
                </div>
              </NeonCard>
              <ExclusivityQuote text="We curate every guest. This is not a party — it is a selection." />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <NeonCard
                glow="magenta"
                className="p-6"
                data-ocid="apply.step2_card"
              >
                <h2 className="text-lg font-display font-bold tracking-wide uppercase mb-1">
                  Prove Your Access
                </h2>
                <p className="text-xs text-muted-foreground/60 font-body mb-6">
                  Got an invite code? Enter it below — otherwise just continue.
                </p>
                <div className="space-y-5">
                  <NeonInput
                    id="inviteCode"
                    label="Invite Code (Optional)"
                    placeholder="Enter your code if you have one"
                    value={step2.inviteCode}
                    onChange={(e) => {
                      setStep2((s) => ({
                        ...s,
                        inviteCode: e.target.value.toUpperCase(),
                      }));
                      if (inviteError) setInviteError("");
                    }}
                    error={errors.inviteCode ?? inviteError}
                    data-ocid="apply.invite_code_input"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
              </NeonCard>
              <ExclusivityQuote text="Every name on this list earned their spot. Will yours?" />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <NeonCard
                glow="cyan"
                className="p-6"
                data-ocid="apply.step3_card"
              >
                <h2 className="text-lg font-display font-bold tracking-wide uppercase mb-1">
                  Show Us Your World
                </h2>
                <p className="text-xs text-muted-foreground/60 font-body mb-2">
                  3–5 photos, real ones only
                </p>
                <div className="flex items-center gap-2 mb-5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-all duration-300",
                        n <= readyCount
                          ? "bg-primary shadow-[0_0_6px_oklch(var(--primary)/0.6)]"
                          : n === readyCount + 1 && uploadingCount > 0
                            ? "bg-accent/50 animate-pulse"
                            : "bg-border/30",
                      )}
                    />
                  ))}
                  <span className="text-xs font-display text-muted-foreground ml-1">
                    {readyCount}/5
                  </span>
                </div>
                <PhotoUpload
                  photos={photos}
                  onAdd={handleAddPhotos}
                  onRemove={handleRemovePhoto}
                />
                {readyCount < 3 && photos.length === 0 && (
                  <p className="mt-3 text-xs text-muted-foreground/50 text-center font-body">
                    Start uploading to submit your application
                  </p>
                )}
              </NeonCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 flex gap-3"
        >
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/40 font-display tracking-wider uppercase text-sm bg-transparent"
              data-ocid="apply.back_button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button
              type="button"
              onClick={handleNext}
              className={cn(
                "h-12 font-display tracking-[0.12em] uppercase text-sm font-bold transition-all duration-300",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "shadow-[0_0_20px_oklch(var(--primary)/0.4)] hover:shadow-[0_0_30px_oklch(var(--primary)/0.6)]",
                step > 0 ? "flex-1" : "w-full",
              )}
              data-ocid="apply.next_button"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                submitMutation.isPending || uploadingCount > 0 || readyCount < 3
              }
              className={cn(
                "flex-1 h-12 font-display tracking-[0.12em] uppercase text-sm font-bold transition-all duration-300",
                "bg-gradient-to-r from-primary to-secondary text-primary-foreground",
                "shadow-[0_0_24px_oklch(var(--primary)/0.5)] hover:shadow-[0_0_40px_oklch(var(--secondary)/0.6)]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
              data-ocid="apply.submit_button"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                  Submitting...
                </>
              ) : uploadingCount > 0 ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  Submit Application <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </motion.div>

        {submitMutation.isError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-xs text-destructive text-center font-body"
            data-ocid="apply.error_state"
          >
            {submitMutation.error instanceof Error
              ? submitMutation.error.message
              : "Something went wrong. Try again."}
          </motion.p>
        )}
      </div>
    </div>
  );
}
