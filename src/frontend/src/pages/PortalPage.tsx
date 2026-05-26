import { type ExternalBlob, createActor } from "@/backend";
import type { UserProfile } from "@/backend";
import { NeonCard } from "@/components/NeonCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  doUploadGalleryPhoto,
  useApplicationStatus,
  useConfessions,
  useGalleryPhotos,
  useMyQuizResult,
  useQuizQuestions,
  useQuizResultTypes,
  useSubmitConfession,
  useSubmitQuizResult,
} from "@/hooks/useBackend";
import { useUserAuth } from "@/hooks/useUserAuth";
import { cn } from "@/lib/utils";
import type { ConfessionView, QuizQuestion, QuizResult } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
  const { sessionToken } = useUserAuth();
  const {
    data: confessions = [],
    isLoading,
    refetch: refetchConfessions,
  } = useConfessions(sessionToken);
  const submitConfession = useSubmitConfession(sessionToken);
  const [text, setText] = useState("");
  const [page, setPage] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const sorted = [...confessions].sort((a: ConfessionView, b: ConfessionView) =>
    Number(b.createdAt - a.createdAt),
  );
  const visible = sorted.slice(0, page * PAGE_SIZE);

  async function handlePost() {
    if (!text.trim() || text.length > MAX_CHARS) return;
    await submitConfession.mutateAsync(text.trim());
    setText("");
    setSubmitted(true);
    refetchConfessions();
    setTimeout(() => setSubmitted(false), 2000);
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
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !submitConfession.isPending
            ) {
              e.preventDefault();
              e.stopPropagation();
              handlePost();
            }
          }}
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
      {submitted && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-body text-center pt-2"
          style={{ color: "oklch(0.75 0.18 145)" }}
        >
          Confession posted!
        </motion.p>
      )}

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
            {visible.map((c: ConfessionView, idx: number) => (
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

// ── Gallery card component — premium photo wall tile ──
function GalleryCard({
  photo,
  idx,
  getPhotoUrl,
  formatDate,
  onClick,
}: {
  photo: any;
  idx: number;
  getPhotoUrl: (photo: any, key?: string) => string;
  formatDate: (ts: bigint | number) => string;
  onClick: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const url = getPhotoUrl(photo.photo, String(photo.id));

  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 20 }}
      onClick={onClick}
      className="cursor-pointer group text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-xl"
      data-ocid={`gallery.item.${idx + 1}`}
    >
      <div
        className={[
          "bg-white/8 backdrop-blur-md border border-white/15 rounded-xl p-3",
          "transition-all duration-300 ease-out",
          "group-hover:border-pink-500/40 group-hover:shadow-[0_0_28px_oklch(0.55_0.25_315_/_0.35),0_0_8px_oklch(0.65_0.22_290_/_0.2)]",
        ].join(" ")}
      >
        {/* Locked-ratio image container */}
        <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-card/30">
          {/* Shimmer shown until image loads or fails */}
          {!imgLoaded && !imgFailed && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 via-white/10 to-white/5" />
          )}
          {!imgFailed && (
            <img
              src={url}
              alt={photo.caption || "Party photo"}
              loading="lazy"
              className={[
                "w-full h-full object-cover transition-opacity duration-500",
                imgLoaded ? "opacity-100" : "opacity-0",
              ].join(" ")}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgFailed(true)}
            />
          )}
          {imgFailed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card/40">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white/30 text-sm">✕</span>
              </div>
            </div>
          )}
        </div>
        {/* Caption / date row */}
        <div className="pt-2.5 pb-0.5 px-0.5 space-y-0.5">
          {photo.caption && (
            <p className="text-white/65 text-xs font-body truncate leading-tight">
              {photo.caption}
            </p>
          )}
          <p className="text-white/25 text-[10px] font-body tracking-wide">
            {formatDate(photo.uploadedAt)}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function GalleryTab() {
  const { actor } = useActor(createActor);
  const { sessionToken } = useUserAuth();
  const { photos: galleryPhotos, loading, refetch } = useGalleryPhotos();
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [photos, setPhotos] = useState<
    Array<{
      file: File;
      preview: string;
      progress: number;
      blob: ExternalBlob | null;
      uploading: boolean;
      done: boolean;
    }>
  >([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => refetch(), 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleAddPhotos = useCallback(
    (files: FileList) => {
      const currentCount = photos.length;
      const remaining = 10 - currentCount;
      const toAdd = Array.from(files).slice(0, remaining);
      const newEntries = toAdd.map((f) => ({
        file: f,
        preview: URL.createObjectURL(f),
        progress: 0,
        blob: null as ExternalBlob | null,
        uploading: false,
        done: true,
      }));
      setPhotos((prev) => [...prev, ...newEntries]);
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

  const handleUpload = async () => {
    const readyPhotos = photos.filter((p) => p.done);
    if (readyPhotos.length === 0) return;
    if (!actor) {
      setUploadError("Not connected to server");
      return;
    }
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    try {
      let successCount = 0;
      for (const photo of readyPhotos) {
        try {
          const result = await doUploadGalleryPhoto(
            actor,
            photo.file,
            caption || undefined,
            sessionToken,
          );
          if (result && ("ok" in result || result.__kind__ === "ok")) {
            successCount++;
          } else {
            const errMsg =
              result?.err || result?.__kind__ === "err"
                ? result.err
                : "Upload failed";
            console.error(`Failed to upload ${photo.file.name}:`, errMsg);
          }
        } catch (e) {
          console.error(`Failed to upload ${photo.file.name}:`, e);
        }
      }
      if (successCount > 0) {
        setUploadSuccess(true);
        for (const p of photos) {
          if (p.preview) URL.revokeObjectURL(p.preview);
        }
        setPhotos([]);
        setCaption("");
        refetch();
        setTimeout(() => setUploadSuccess(false), 5000);
      } else {
        setUploadError("All uploads failed. Please try again.");
      }
    } catch (e) {
      console.error("Gallery handleUpload error:", e);
      setUploadError(String(e));
    } finally {
      setUploading(false);
    }
  };

  const readyCount = photos.filter((p) => p.done).length;
  const uploadingCount = photos.filter((p) => p.uploading).length;
  const canAdd = photos.length < 10;

  const formatDate = (ts: bigint | number) => {
    const ms = typeof ts === "bigint" ? Number(ts) / 1_000_000 : ts;
    return new Date(ms).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Stable URL cache — creates ObjectURLs once per photo id, revokes on unmount
  const urlCacheRef = useRef<Map<string, string>>(new Map());
  useEffect(() => {
    const cache = urlCacheRef.current;
    return () => {
      for (const url of cache.values()) URL.revokeObjectURL(url);
      cache.clear();
    };
  }, []);

  const getPhotoUrl = useCallback((photo: any, cacheKey?: string): string => {
    if (!photo) return "";
    const key =
      cacheKey ??
      String(photo.contentType ?? "") +
        String((photo.data as Uint8Array)?.length ?? 0);
    if (urlCacheRef.current.has(key))
      return urlCacheRef.current.get(key) as string;
    const data =
      photo.data instanceof Uint8Array
        ? photo.data
        : new Uint8Array(photo.data);
    const blob = new Blob([data], { type: photo.contentType || "image/jpeg" });
    const url = URL.createObjectURL(blob);
    urlCacheRef.current.set(key, url);
    return url;
  }, []);

  return (
    <div className="space-y-8" data-ocid="gallery.section">
      {/* Upload Section */}
      <NeonCard glow="magenta" className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-display font-bold text-foreground mb-1">
            Share Your Night
          </h3>
          <p className="text-xs text-muted-foreground font-body">
            Upload photos from the party — up to 10 at once.
          </p>
        </div>

        {uploadSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-4 text-emerald-300 text-center text-sm font-body"
            data-ocid="gallery.success_state"
          >
            ✓ Photos uploaded! They will appear after admin approval.
          </motion.div>
        ) : (
          <div className="space-y-3">
            {/* Photo dropzone */}
            {canAdd && (
              <button
                type="button"
                data-ocid="gallery.dropzone"
                onClick={() => fileInputRef.current?.click()}
                tabIndex={0}
                aria-label="Upload photos"
                onKeyDown={(e) =>
                  e.key === "Enter" && fileInputRef.current?.click()
                }
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-300",
                  "flex flex-col items-center justify-center gap-2 min-h-[120px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  "border-border/40 hover:border-primary/50 hover:bg-primary/5",
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) =>
                    e.target.files && handleAddPhotos(e.target.files)
                  }
                  data-ocid="gallery.photo_input"
                />
                <Upload className="w-7 h-7 text-primary/70" />
                <div className="text-center">
                  <p className="text-sm font-display font-semibold text-foreground/80">
                    Upload your photos
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click to select — {photos.length}/10
                  </p>
                </div>
              </button>
            )}

            {/* Photo preview grid */}
            {/* Photo preview grid */}
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
                      data-ocid={`gallery.photo_thumb.${i + 1}`}
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
                          onClick={() => handleRemovePhoto(i)}
                          aria-label={`Remove photo ${i + 1}`}
                          data-ocid={`gallery.photo_remove.${i + 1}`}
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

            {/* Progress bars */}
            {photos.length > 0 && (
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <div
                    key={`progress-${n}`}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      n < readyCount
                        ? "bg-primary shadow-[0_0_6px_oklch(var(--primary)/0.6)]"
                        : n === readyCount && uploadingCount > 0
                          ? "bg-accent/50 animate-pulse"
                          : "bg-border/30",
                    )}
                  />
                ))}
                <span className="text-xs font-display text-muted-foreground ml-1">
                  {readyCount}/10
                </span>
              </div>
            )}

            {photos.length === 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                <ImageIcon className="w-4 h-4" />
                Select photos to upload
              </div>
            )}

            <input
              type="text"
              placeholder="Add a caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-card/20 border border-border/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/40 text-sm font-body focus:outline-none focus:border-secondary/50 transition-colors"
              data-ocid="gallery.input"
            />
            {uploadError && (
              <p
                className="text-destructive text-sm font-body"
                data-ocid="gallery.error_state"
              >
                {uploadError}
              </p>
            )}
            <Button
              type="button"
              onClick={handleUpload}
              disabled={
                !photos.some((p) => p.done) || uploading || uploadingCount > 0
              }
              className="w-full font-display font-bold tracking-wide"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.25 315), oklch(0.68 0.27 305))",
                boxShadow: "0 0 16px oklch(0.55 0.25 315 / 0.3)",
              }}
              data-ocid="gallery.submit_button"
            >
              {uploading
                ? "Uploading…"
                : `Submit ${readyCount > 0 ? `${readyCount} Photo${readyCount > 1 ? "s" : ""}` : "Photo"}`}
            </Button>
          </div>
        )}
      </NeonCard>

      {/* Gallery Grid */}
      {loading ? (
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8"
          data-ocid="gallery.loading_state"
        >
          {(["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"] as const).map(
            (k) => (
              <div
                key={k}
                className="rounded-xl p-3 bg-white/8 border border-white/10"
              >
                <div className="aspect-square rounded-lg bg-white/8 animate-pulse" />
                <div className="mt-2.5 h-2 w-3/4 rounded bg-white/8 animate-pulse" />
                <div className="mt-1 h-2 w-1/3 rounded bg-white/6 animate-pulse" />
              </div>
            ),
          )}
        </div>
      ) : galleryPhotos.length === 0 ? (
        <NeonCard
          glow="none"
          className="p-12 text-center space-y-2"
          data-ocid="gallery.empty_state"
        >
          <div className="text-4xl mb-2">🎞</div>
          <p className="text-foreground font-display font-semibold">
            Be the first to share the vibe.
          </p>
          <p className="text-sm text-muted-foreground font-body">
            Upload a photo above.
          </p>
        </NeonCard>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {galleryPhotos.map((photo: any, idx: number) => (
            <GalleryCard
              key={photo.id}
              photo={photo}
              idx={idx}
              getPhotoUrl={getPhotoUrl}
              formatDate={formatDate}
              onClick={() => setSelectedPhoto(photo)}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
            data-ocid="gallery.dialog"
          >
            <motion.div
              className="max-w-2xl w-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getPhotoUrl(selectedPhoto.photo, String(selectedPhoto.id))}
                alt={selectedPhoto.caption || "Party photo"}
                className="w-full rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {selectedPhoto.caption && (
                <p className="text-white/70 text-center mt-3 text-sm">
                  {selectedPhoto.caption}
                </p>
              )}
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="mt-4 mx-auto block text-white/40 hover:text-white text-sm"
                data-ocid="gallery.close_button"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Profile card shown to logged-in users who haven't applied yet ──
function ProfileCard({ profile }: { profile: UserProfile }) {
  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-sm mx-auto space-y-5"
      data-ocid="portal.profile_card"
    >
      <NeonCard glow="purple" className="p-6">
        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-4">
          {profile.profilePhoto ? (
            <img
              src={profile.profilePhoto}
              alt={profile.name}
              className="w-16 h-16 rounded-full object-cover border-2 shrink-0"
              style={{ borderColor: "oklch(0.65 0.22 290 / 0.5)" }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-display font-black shrink-0 border-2"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.22 290 / 0.25), oklch(0.55 0.25 315 / 0.25))",
                borderColor: "oklch(0.65 0.22 290 / 0.4)",
                color: "oklch(0.78 0.18 290)",
              }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p
              className="font-display font-black text-lg leading-tight truncate"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.78 0.18 290), oklch(0.68 0.27 305))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {profile.name}
            </p>
            {profile.instagramHandle && (
              <p className="text-xs font-mono text-muted-foreground mt-0.5 truncate">
                @{profile.instagramHandle}
              </p>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm font-body text-muted-foreground leading-relaxed border-t border-border/20 pt-4">
            {profile.bio}
          </p>
        )}
      </NeonCard>
    </motion.div>
  );
}

// ── No-application state for portal ──
function PortalNoApplication({ profile }: { profile: UserProfile | null }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 gap-6"
      data-ocid="portal.no_application"
    >
      {/* Ambient blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute top-[-15%] left-[5%] w-[45vw] h-[45vw] rounded-full bg-primary/8 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[8%] w-[38vw] h-[38vw] rounded-full bg-secondary/6 blur-[110px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="text-center space-y-1"
      >
        <p className="text-xs font-display tracking-[0.4em] text-muted-foreground uppercase">
          Your Portal
        </p>
        <h1
          className="text-3xl md:text-4xl font-display font-black tracking-tight"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.72 0.25 200), oklch(0.65 0.22 290))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Welcome{profile ? `, ${profile.name.split(" ")[0]}` : ""}
        </h1>
      </motion.div>

      {/* Profile info if logged in */}
      {profile && <ProfileCard profile={profile} />}

      {/* Apply CTA */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.15 }}
        className="w-full max-w-sm"
      >
        <NeonCard
          glow="magenta"
          className="p-7 text-center space-y-4"
          data-ocid="portal.apply_cta_card"
        >
          <p className="text-3xl">🎟️</p>
          <div className="space-y-1.5">
            <h2 className="font-display font-black text-xl text-foreground tracking-tight">
              You're Not on the List — Yet
            </h2>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Apply for the party and let the committee decide. Spots are
              limited and every application is reviewed personally.
            </p>
          </div>
          <Button
            type="button"
            asChild
            className="w-full font-display font-bold tracking-widest text-sm h-12"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.68 0.27 305), oklch(0.55 0.25 315))",
              boxShadow: "0 0 20px oklch(0.55 0.25 315 / 0.4)",
            }}
            data-ocid="portal.apply_now_button"
          >
            <Link to="/apply">APPLY FOR THE PARTY →</Link>
          </Button>
        </NeonCard>
      </motion.div>
    </div>
  );
}

export default function PortalPage() {
  const navigate = useNavigate();
  const {
    sessionToken,
    userProfile,
    isLoading: authLoading,
    getUserApplicationStatus,
  } = useUserAuth();
  const { actor } = useActor(createActor);

  // Resolved state: null = no application, bigint = app id found
  const [appId, setAppId] = useState<bigint | null>(null);
  const [resolved, setResolved] = useState(false);
  // Profile fetched from backend (may differ from cached userProfile)
  const [fetchedProfile, setFetchedProfile] = useState<UserProfile | null>(
    null,
  );

  useEffect(() => {
    if (authLoading) return;

    // Logged-in path: fetch status from backend
    if (sessionToken && actor) {
      Promise.all([
        getUserApplicationStatus().catch(() => null),
        actor.getUserProfile(sessionToken).catch(() => null),
      ]).then(([statusRes, profileRes]) => {
        if (profileRes && profileRes.__kind__ === "ok") {
          setFetchedProfile(profileRes.ok);
        }
        if (statusRes && statusRes.__kind__ === "ok") {
          const app = statusRes.ok;
          const idStr = String(app.id);
          try {
            setAppId(BigInt(idStr));
            // Persist so other parts of the page can use it
            localStorage.setItem("applicationId", idStr);
          } catch {
            // ignore
          }
        }
        setResolved(true);
      });
      return;
    }

    // Not logged in — fall back to localStorage
    const stored = localStorage.getItem("applicationId");
    if (stored) {
      try {
        setAppId(BigInt(stored));
      } catch {
        // invalid
      }
    }
    setResolved(true);
  }, [authLoading, sessionToken, actor, getUserApplicationStatus]);

  const { data: status, isLoading: statusLoading } = useApplicationStatus(
    resolved && appId !== null ? appId : null,
  );

  const qrToken = status?.[1] ?? null;
  const appStatus = status?.[0];
  const plusOne = false;

  // Still waiting on auth or initial fetch
  if (!resolved || authLoading || (appId !== null && statusLoading)) {
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

  // No application found → show profile + apply CTA
  if (appId === null) {
    const displayProfile = fetchedProfile ?? userProfile;
    return <PortalNoApplication profile={displayProfile} />;
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
