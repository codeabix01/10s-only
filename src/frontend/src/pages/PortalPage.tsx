import type { ExternalBlob } from "@/backend";
import { NeonCard } from "@/components/NeonCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useApplicationStatus,
  useApprovedPhotos,
  useConfessions,
  useMyQuizResult,
  useQuizQuestions,
  useQuizResultTypes,
  useSubmitConfession,
  useSubmitQuizResult,
} from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import type { Confession, QuizQuestion, QuizResult } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const PERSONA_COLORS: Record<string, string> = {
  "The Icon": "oklch(0.68 0.27 305)",
  "The Vibe Setter": "oklch(0.65 0.22 290)",
  "The Wildcard": "oklch(0.55 0.25 315)",
  "The Phantom": "oklch(0.62 0.20 250)",
};

const PERSONA_EMOJIS: Record<string, string> = {
  "The Icon": "👑",
  "The Vibe Setter": "🎵",
  "The Wildcard": "🃏",
  "The Phantom": "🌑",
};

function QRTicket({ qrToken, plusOne }: { qrToken: string; plusOne: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !qrToken) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Simple visual QR placeholder with token display
    canvas.width = 160;
    canvas.height = 160;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 160, 160);
    ctx.fillStyle = "#000";
    // Draw finder patterns
    const drawSquare = (x: number, y: number, s: number, fill = true) => {
      if (fill) ctx.fillRect(x, y, s, s);
      else {
        ctx.fillStyle = "#fff";
        ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
        ctx.fillStyle = "#000";
      }
    };
    drawSquare(8, 8, 40);
    drawSquare(10, 10, 36, false);
    drawSquare(112, 8, 40);
    drawSquare(114, 10, 36, false);
    drawSquare(8, 112, 40);
    drawSquare(10, 114, 36, false);
    // Data dots pattern from token
    for (let i = 0; i < qrToken.length && i < 64; i++) {
      const code = qrToken.charCodeAt(i);
      const col = 56 + (i % 8) * 6;
      const row = 56 + Math.floor(i / 8) * 6;
      if (code % 2 === 0) ctx.fillRect(col, row, 4, 4);
    }
  }, [qrToken]);

  return (
    <NeonCard glow="cyan" className="max-w-xs mx-auto p-6 text-center">
      <p
        className="text-[0.6rem] font-mono tracking-[0.35em] uppercase mb-1"
        style={{ color: "oklch(0.65 0.22 290 / 0.7)" }}
      >
        ✦ EXCLUSIVE ACCESS ✦
      </p>
      <p
        className="text-base font-display font-black tracking-[0.25em] uppercase mb-4"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.72 0.25 200), oklch(0.65 0.22 290))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 10px oklch(0.65 0.22 290 / 0.5))",
        }}
      >
        YOUR ENTRY TICKET
      </p>
      <div className="mx-auto w-fit rounded-lg p-3 bg-white mb-4 shadow-[0_0_24px_oklch(0.65_0.22_290/0.3)]">
        <canvas ref={canvasRef} className="w-[120px] h-[120px]" />
      </div>
      <p className="font-mono text-xs text-muted-foreground truncate mb-3">
        {qrToken}
      </p>
      <p
        className="text-[0.65rem] font-body leading-relaxed mb-3"
        style={{ color: "oklch(0.60 0.15 290 / 0.8)" }}
      >
        Present this QR code at the door for entry.
        <br />
        Screenshot and save it.
      </p>
      {plusOne && (
        <Badge
          className="text-xs font-display"
          style={{
            background: "oklch(0.65 0.22 290 / 0.2)",
            color: "oklch(0.85 0.15 290)",
            border: "1px solid oklch(0.65 0.22 290 / 0.4)",
          }}
        >
          +1 CONFIRMED
        </Badge>
      )}
    </NeonCard>
  );
}

function PersonalityQuiz({ appId }: { appId: bigint }) {
  const { data: questions = [], isLoading: qLoading } = useQuizQuestions();
  const { data: resultTypes = [] } = useQuizResultTypes();
  const { data: existingResult } = useMyQuizResult(appId);
  const submitQuiz = useSubmitQuizResult();

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [resultType, setResultType] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);

  const total = questions.length || 6;

  function handleSelect(optionId: string) {
    setAnswers((prev) => ({ ...prev, [currentQ]: optionId }));
  }

  function handleNext() {
    setDirection(1);
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      handleSubmit();
    }
  }

  function handlePrev() {
    setDirection(-1);
    setCurrentQ((q) => Math.max(0, q - 1));
  }

  async function handleSubmit() {
    const resultKeys = Object.keys(answers);
    if (resultTypes.length === 0) return;
    // Pick result type based on most common answer pattern
    const hash = resultKeys.reduce(
      (acc, k) => acc + (answers[Number(k)]?.charCodeAt(0) || 0),
      0,
    );
    const picked = resultTypes[hash % resultTypes.length];
    const rt = picked?.resultType || "The Phantom";
    setResultType(rt);
    setShowResult(true);
    await submitQuiz.mutateAsync({ applicationId: appId, resultType: rt });
  }

  if (existingResult) {
    const rt = resultTypes.find(
      (r) => r.resultType === existingResult.resultType,
    );
    const color =
      PERSONA_COLORS[existingResult.resultType] || "oklch(0.65 0.22 290)";
    const emoji = PERSONA_EMOJIS[existingResult.resultType] || "⚡";
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <NeonCard glow="purple" className="p-8 text-center">
          <p className="text-5xl mb-4">{emoji}</p>
          <p className="text-xs font-display tracking-[0.4em] uppercase text-muted-foreground mb-2">
            YOUR PARTY PERSONA
          </p>
          <h2
            className="text-3xl font-display font-bold mb-3"
            style={{ color, filter: `drop-shadow(0 0 12px ${color})` }}
          >
            {existingResult.resultType}
          </h2>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            {rt?.description || "The life of every underground event."}
          </p>
        </NeonCard>
      </motion.div>
    );
  }

  if (qLoading)
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );

  const question: QuizQuestion | undefined = questions[currentQ];

  const resultData = resultTypes.find(
    (r: QuizResult) => r.resultType === resultType,
  );
  const resultColor =
    PERSONA_COLORS[resultType || ""] || "oklch(0.65 0.22 290)";
  const resultEmoji = PERSONA_EMOJIS[resultType || ""] || "⚡";

  return (
    <div className="space-y-6" data-ocid="quiz.section">
      <div className="flex items-center justify-between mb-2">
        <h2
          className="text-xl font-display font-bold tracking-wide"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.65 0.22 290), oklch(0.68 0.27 305))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          WHAT IS YOUR PARTY PERSONA?
        </h2>
        <span
          className="text-xs font-mono text-muted-foreground"
          data-ocid="quiz.progress"
        >
          Q{currentQ + 1}/{total}
        </span>
      </div>

      {/* Progress Bar */}
      <div
        className="h-1 rounded-full bg-muted/40 overflow-hidden"
        data-ocid="quiz.progress_bar"
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.65 0.22 290), oklch(0.55 0.25 315))",
          }}
          animate={{ width: `${((currentQ + 1) / total) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {showResult ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, type: "spring" }}
            data-ocid="quiz.result_card"
          >
            <NeonCard glow="purple" className="p-8 text-center space-y-4">
              <motion.p
                className="text-6xl"
                animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {resultEmoji}
              </motion.p>
              <p className="text-xs font-display tracking-[0.4em] uppercase text-muted-foreground">
                YOUR PARTY PERSONA
              </p>
              <motion.h2
                className="text-4xl font-display font-bold"
                style={{
                  color: resultColor,
                  filter: `drop-shadow(0 0 16px ${resultColor})`,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {resultType}
              </motion.h2>
              <p className="text-muted-foreground font-body text-sm leading-relaxed max-w-xs mx-auto">
                {resultData?.description ||
                  "An unforgettable force at every gathering."}
              </p>
            </NeonCard>
          </motion.div>
        ) : question ? (
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.3 }}
          >
            <NeonCard glow="none" className="p-6 mb-4">
              <p className="font-display font-semibold text-base text-foreground">
                {question.text}
              </p>
            </NeonCard>
            <div className="space-y-3">
              {question.options.map((opt, i) => (
                <motion.button
                  key={opt.id.toString()}
                  type="button"
                  data-ocid={`quiz.option.${i + 1}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleSelect(opt.id.toString())}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border backdrop-blur-md transition-all duration-300 font-body text-sm",
                    answers[currentQ] === opt.id.toString()
                      ? "border-primary/70 bg-primary/15 text-foreground shadow-[0_0_16px_rgba(104,0,255,0.3)]"
                      : "border-border/40 bg-card/10 text-muted-foreground hover:border-primary/40 hover:bg-card/20 hover:text-foreground",
                  )}
                >
                  <span className="font-mono text-xs text-primary/60 mr-3">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt.text}
                </motion.button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              {currentQ > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  data-ocid="quiz.prev_button"
                  className="border-border/40 text-muted-foreground hover:border-primary/40 font-display"
                >
                  Back
                </Button>
              )}
              <Button
                type="button"
                onClick={handleNext}
                disabled={!answers[currentQ]}
                data-ocid="quiz.next_button"
                className="flex-1 font-display font-bold tracking-wide"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.22 290), oklch(0.55 0.25 315))",
                  boxShadow: "0 0 16px oklch(0.65 0.22 290 / 0.3)",
                }}
              >
                {currentQ === questions.length - 1
                  ? "REVEAL MY PERSONA"
                  : "NEXT"}
              </Button>
            </div>
          </motion.div>
        ) : (
          <NeonCard glow="none" className="p-8 text-center">
            <p className="text-muted-foreground font-display">
              No questions available yet — check back soon.
            </p>
          </NeonCard>
        )}
      </AnimatePresence>
    </div>
  );
}

const MAX_CHARS = 200;
const PAGE_SIZE = 10;

function ConfessionsTab() {
  const { data: confessions = [], isLoading } = useConfessions();
  const submitConfession = useSubmitConfession();
  const [text, setText] = useState("");
  const [page, setPage] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const sorted = [...confessions].sort((a: Confession, b: Confession) =>
    Number(b.createdAt - a.createdAt),
  );
  const visible = sorted.slice(0, page * PAGE_SIZE);

  async function handlePost() {
    if (!text.trim() || text.length > MAX_CHARS) return;
    await submitConfession.mutateAsync(text.trim());
    setText("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  function formatTime(ts: bigint) {
    const d = new Date(Number(ts / 1_000_000n));
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="space-y-6" data-ocid="confessions.section">
      <div>
        <h2
          className="text-xl font-display font-bold tracking-wide mb-1"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.55 0.25 315), oklch(0.68 0.27 305))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          THE VAULT
        </h2>
        <p className="text-xs text-muted-foreground font-body">
          Anonymous. No judgment. No receipts.
        </p>
      </div>

      <NeonCard glow="magenta" className="p-5 space-y-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Drop your confession into the void…"
          data-ocid="confessions.input"
          rows={3}
          className="resize-none bg-transparent border-border/30 text-foreground placeholder:text-muted-foreground/50 font-body text-sm focus:border-secondary/50 focus:ring-0 focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-xs font-mono",
              text.length >= MAX_CHARS
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {text.length}/{MAX_CHARS}
          </span>
          <Button
            type="button"
            onClick={handlePost}
            disabled={
              !text.trim() ||
              text.length > MAX_CHARS ||
              submitConfession.isPending
            }
            data-ocid="confessions.submit_button"
            size="sm"
            className="font-display font-bold tracking-wide text-xs px-5"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.25 315), oklch(0.68 0.27 305))",
              boxShadow: submitted
                ? "0 0 20px oklch(0.55 0.25 315 / 0.6)"
                : "none",
            }}
          >
            {submitConfession.isPending
              ? "Posting…"
              : submitted
                ? "✓ POSTED"
                : "POST ANONYMOUSLY"}
          </Button>
        </div>
      </NeonCard>

      <div className="space-y-3" data-ocid="confessions.list">
        {isLoading ? (
          <div data-ocid="confessions.loading_state" className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <NeonCard
            glow="none"
            className="p-8 text-center"
            data-ocid="confessions.empty_state"
          >
            <p className="text-muted-foreground font-body text-sm">
              The vault is empty. Be the first to confess.
            </p>
          </NeonCard>
        ) : (
          <AnimatePresence>
            {visible.map((c: Confession, idx: number) => (
              <motion.div
                key={c.id.toString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                data-ocid={`confessions.item.${idx + 1}`}
              >
                <NeonCard glow="none" className="p-4" hoverable>
                  <p className="text-sm font-body text-foreground/90 leading-relaxed mb-2">
                    "{c.text}"
                  </p>
                  <p className="text-xs font-mono text-muted-foreground/50">
                    {formatTime(c.createdAt)}
                  </p>
                </NeonCard>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {visible.length < sorted.length && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          data-ocid="confessions.load_more_button"
          className="w-full border-border/40 text-muted-foreground hover:border-secondary/40 font-display text-sm"
        >
          LOAD MORE
        </Button>
      )}
    </div>
  );
}

function GalleryTab() {
  const { data: photos = [], isLoading } = useApprovedPhotos();
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (isLoading)
    return (
      <div
        data-ocid="gallery.loading_state"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );

  if (photos.length === 0)
    return (
      <div className="space-y-6" data-ocid="gallery.section">
        <h2
          className="text-xl font-display font-bold tracking-wide"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.68 0.27 305), oklch(0.65 0.22 290))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          THE NIGHT
        </h2>
        <NeonCard
          glow="none"
          className="p-12 text-center"
          data-ocid="gallery.empty_state"
        >
          <p className="text-4xl mb-3">📷</p>
          <p className="font-display font-semibold text-foreground mb-1">
            The night hasn't started yet.
          </p>
          <p className="text-sm text-muted-foreground font-body">
            Photos will appear here after the event.
          </p>
        </NeonCard>
      </div>
    );

  return (
    <div className="space-y-6" data-ocid="gallery.section">
      <h2
        className="text-xl font-display font-bold tracking-wide"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.68 0.27 305), oklch(0.65 0.22 290))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        THE NIGHT
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo: ExternalBlob, idx: number) => (
          <motion.button
            key={`${idx}-${photo.getDirectURL()}`}
            type="button"
            data-ocid={`gallery.item.${idx + 1}`}
            whileHover={{
              scale: 1.04,
              rotate: 0,
              y: -4,
              boxShadow: "0 12px 40px oklch(0.65 0.22 290 / 0.5)",
            }}
            initial={{ rotate: idx % 2 === 0 ? -1.5 : 1.5 }}
            onClick={() => setLightbox(photo.getDirectURL())}
            className="relative aspect-square bg-white p-3 pb-8 shadow-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
            style={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              transform: `rotate(${idx % 2 === 0 ? -2 : 2}deg)`,
            }}
            aria-label={`Guest submission ${idx + 1}`}
          >
            <img
              src={photo.getDirectURL()}
              alt={`Guest submission ${idx + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setLightbox(null)}
            data-ocid="gallery.dialog"
          >
            <motion.img
              src={lightbox}
              alt="Expanded view"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              aria-label="Close lightbox"
              data-ocid="gallery.close_button"
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/60 backdrop-blur border border-border/40 flex items-center justify-center text-foreground hover:bg-card/90 transition-smooth"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PortalPage() {
  const navigate = useNavigate();
  const [appId, setAppId] = useState<bigint | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("applicationId");
    if (!stored) {
      navigate({ to: "/apply" });
      return;
    }
    try {
      setAppId(BigInt(stored));
    } catch {
      navigate({ to: "/apply" });
    }
  }, [navigate]);

  const { data: status, isLoading: statusLoading } =
    useApplicationStatus(appId);

  const qrToken = status?.[1] ?? null;
  const appStatus = status?.[0];
  const plusOne = false; // derived from applicationView if needed

  if (!appId || statusLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="portal.loading_state"
      >
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
          <p className="text-muted-foreground font-display text-sm tracking-widest">
            LOADING YOUR PORTAL…
          </p>
        </div>
      </div>
    );
  }

  if (appStatus !== "approved") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        data-ocid="portal.error_state"
      >
        <NeonCard
          glow="magenta"
          className="max-w-sm w-full p-8 text-center space-y-4"
        >
          <p className="text-4xl">🚫</p>
          <h2 className="font-display font-bold text-xl text-foreground">
            Access Restricted
          </h2>
          <p className="text-sm text-muted-foreground font-body">
            Your application is currently{" "}
            {appStatus === "rejected"
              ? "not approved for this event"
              : "pending review"}
            . The portal unlocks once you're approved.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/status" })}
            data-ocid="portal.status_link"
            className="w-full border-primary/30 font-display"
          >
            Check Status
          </Button>
        </NeonCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16" data-ocid="portal.page">
      {/* Hero */}
      <section className="relative py-12 px-4 text-center overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.65 0.22 290 / 0.15) 0%, transparent 70%)",
            }}
          />
          <div
            className="party-blob-1 absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, oklch(0.65 0.25 15), oklch(0.55 0.22 340))",
            }}
          />
          <div
            className="party-blob-2 absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full opacity-[0.12] blur-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, oklch(0.75 0.18 80), oklch(0.60 0.20 45))",
            }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <p className="text-xs font-display tracking-[0.4em] text-muted-foreground uppercase mb-3">
            Exclusive Access Granted
          </p>
          <h1
            className="text-4xl md:text-6xl font-display font-black tracking-tight mb-2"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.75 0.30 145), oklch(0.72 0.28 165))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 24px oklch(0.75 0.30 145 / 0.7))",
            }}
          >
            YOU ARE ON THE LIST
          </h1>
          <p className="text-sm text-muted-foreground font-body">
            Saturday, 23rd May 2026 · The most exclusive night of the year
          </p>
        </motion.div>
      </section>

      {/* QR Ticket */}
      <section
        className="px-4 max-w-sm mx-auto mb-10"
        data-ocid="portal.ticket_section"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {qrToken ? (
            <QRTicket qrToken={qrToken} plusOne={plusOne} />
          ) : (
            <NeonCard glow="cyan" className="p-6 text-center">
              <p className="text-xs font-display tracking-widest text-muted-foreground mb-4">
                YOUR ENTRY TICKET — PRESENT AT THE DOOR
              </p>
              <div className="w-[120px] h-[120px] mx-auto rounded-lg bg-muted/30 flex items-center justify-center mb-4">
                <Skeleton className="w-full h-full rounded-lg" />
              </div>
              <p className="text-xs text-muted-foreground font-body">
                Your ticket is being generated…
              </p>
            </NeonCard>
          )}
        </motion.div>
      </section>

      {/* Location Info Card */}
      <section
        className="px-4 max-w-sm mx-auto mb-10"
        data-ocid="portal.location_section"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <NeonCard
            glow="magenta"
            className="p-6 text-center"
            style={{
              boxShadow:
                "0 0 28px oklch(0.55 0.25 315 / 0.25), 0 0 60px oklch(0.55 0.25 315 / 0.1), inset 0 1px 0 oklch(1 0 0 / 0.06)",
            }}
          >
            <p
              className="text-[0.6rem] font-mono tracking-[0.35em] uppercase mb-1"
              style={{ color: "oklch(0.55 0.25 315 / 0.7)" }}
            >
              ✦ DETAILS ✦
            </p>
            <h3
              className="text-sm font-display font-black tracking-[0.25em] uppercase mb-4"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.68 0.27 305), oklch(0.55 0.25 315))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 10px oklch(0.55 0.25 315 / 0.5))",
              }}
            >
              EVENT LOCATION
            </h3>
            <p className="text-sm font-body leading-relaxed text-muted-foreground">
              The exact address will be disclosed soon on your WhatsApp number.
              Make sure your number is saved and stay ready.
            </p>
          </NeonCard>
        </motion.div>
      </section>

      {/* Tabs */}
      <section className="px-4 max-w-2xl mx-auto">
        <Tabs defaultValue="quiz" data-ocid="portal.tabs">
          <TabsList className="w-full grid grid-cols-3 bg-card/20 backdrop-blur border border-border/30 mb-8 h-12">
            <TabsTrigger
              value="quiz"
              data-ocid="portal.quiz_tab"
              className="font-display text-xs tracking-widest uppercase data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_12px_oklch(0.65_0.22_290/0.4)] transition-all duration-300"
            >
              The Quiz
            </TabsTrigger>
            <TabsTrigger
              value="confessions"
              data-ocid="portal.confessions_tab"
              className="font-display text-xs tracking-widest uppercase data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary data-[state=active]:shadow-[0_0_12px_oklch(0.55_0.25_315/0.4)] transition-all duration-300"
            >
              Confessions
            </TabsTrigger>
            <TabsTrigger
              value="gallery"
              data-ocid="portal.gallery_tab"
              className="font-display text-xs tracking-widest uppercase data-[state=active]:bg-accent/20 data-[state=active]:text-accent data-[state=active]:shadow-[0_0_12px_oklch(0.68_0.27_305/0.4)] transition-all duration-300"
            >
              Gallery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quiz" className="mt-0">
            <PersonalityQuiz appId={appId} />
          </TabsContent>

          <TabsContent value="confessions" className="mt-0">
            <ConfessionsTab />
          </TabsContent>

          <TabsContent value="gallery" className="mt-0">
            <GalleryTab />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
