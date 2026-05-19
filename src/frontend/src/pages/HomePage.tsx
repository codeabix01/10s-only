import { CountdownTimer } from "@/components/CountdownTimer";
import { NeonCard } from "@/components/NeonCard";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Music2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ── Entrance animation helper ────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        animation: `fadeSlideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms both`,
      }}
    >
      {children}
    </div>
  );
}

// ── About cards data ─────────────────────────────────────────────────────────
const ABOUT_CARDS = [
  {
    glow: "purple" as const,
    emoji: "🌌",
    title: "AFTER DARK ENERGY",
    body: "No mediocrity. No tourists. Just a frequency you either vibe with or you don't. When the lights drop and the bass hits — you'll know exactly why you were chosen.",
  },
  {
    glow: "magenta" as const,
    emoji: "💎",
    title: "CURATED TO PERFECTION",
    body: "We don't do plus-one lists and random door policies. Every face in this room was handpicked. If you're here, you're meant to be here. And you'll feel it immediately.",
  },
  {
    glow: "cyan" as const,
    emoji: "🔮",
    title: "THE UNFORGETTABLE KIND",
    body: "Months from now, when someone asks where you were on May 23rd — you either have the story or you don't. This is the night people will still talk about in 2027.",
  },
] as const;

// ── Who gets in criteria ─────────────────────────────────────────────────────
const CRITERIA = [
  { icon: "✦", text: "You dress like the night has standards" },
  { icon: "✦", text: "You move different from the crowd" },
  { icon: "✦", text: "You were invited or you found us — both count" },
  { icon: "✦", text: "You understand that some things aren't for everyone" },
  { icon: "✦", text: "You're ready to leave ordinary behind for one night" },
];

export default function HomePage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);

  function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
    } else {
      audio.play().catch(() => {});
      setMusicPlaying(true);
    }
  }

  // Scroll indicator pulse fade after 4s
  const [showScroll, setShowScroll] = useState(true);
  useEffect(() => {
    const onScroll = () => setShowScroll(false);
    window.addEventListener("scroll", onScroll, { once: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Hidden audio element ── */}
      {/* biome-ignore lint/a11y/useMediaCaption: ambient background music */}
      {/* biome-ignore lint/a11y/useMediaCaption: ambient background music */}
      <audio
        ref={audioRef}
        loop
        src="https://iriefm.fast.idealsolutions.media/iriefm"
        preload="none"
        onCanPlay={(e) => {
          (e.currentTarget as HTMLAudioElement).volume = 0.08;
        }}
      />

      {/* ══════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════ */}
      <section
        data-ocid="hero.section"
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Background image layer */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/assets/generated/hero-night-bg.dim_1440x810.jpg')`,
          }}
        />

        {/* Animated neon gradient blobs */}
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          <div className="neon-blob neon-blob--purple" />
          <div className="neon-blob neon-blob--magenta" />
          <div className="neon-blob neon-blob--cyan" />
        </div>

        {/* Dark vignette overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, oklch(0.08 0 0 / 0.6) 70%, oklch(0.06 0 0 / 0.92) 100%)",
          }}
        />

        {/* Grain texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%224%22 seed=%223%22/><feColorMatrix type=%22saturate%22 values=%220%22/></filter><rect width=%22200%22 height=%22200%22 fill=%22%23fff%22 filter=%22url(%23n)%22 opacity=%220.04%22/></svg>')",
            opacity: 0.4,
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 gap-6 sm:gap-8">
          {/* Eyebrow label */}
          <FadeUp delay={100}>
            <p
              className="text-xs sm:text-sm font-mono tracking-[0.35em] uppercase"
              style={{ color: "oklch(0.68 0.27 305 / 0.9)" }}
            >
              Saturday · 23 May 2026 · A Curated Experience
            </p>
          </FadeUp>

          {/* Main headline */}
          <FadeUp delay={250}>
            <h1
              className="font-display font-black uppercase leading-[0.88] text-foreground"
              style={{
                fontSize: "clamp(3rem, 14vw, 8.5rem)",
                letterSpacing: "-0.02em",
                filter:
                  "drop-shadow(0 0 40px oklch(0.65 0.22 290 / 0.7)) drop-shadow(0 0 80px oklch(0.55 0.25 315 / 0.4))",
              }}
            >
              THE NIGHT
              <br />
              IS CALLING
            </h1>
          </FadeUp>

          {/* Subtitle */}
          <FadeUp delay={400}>
            <p className="font-display text-sm sm:text-base md:text-lg tracking-[0.25em] uppercase text-muted-foreground max-w-sm sm:max-w-lg">
              By Invitation Only&nbsp;·&nbsp;Saturday 23 May 2026
            </p>
          </FadeUp>

          {/* Countdown timer in glass wrapper */}
          <FadeUp delay={550}>
            <NeonCard
              glow="purple"
              className="px-6 py-5 sm:px-10 sm:py-7"
              data-ocid="hero.countdown"
            >
              <p className="text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground mb-3 font-mono">
                Time Remaining
              </p>
              <CountdownTimer />
            </NeonCard>
          </FadeUp>

          {/* CTA block */}
          <FadeUp delay={700}>
            <div className="flex flex-col items-center gap-3">
              <Button
                asChild
                data-ocid="hero.apply_button"
                className="relative overflow-hidden px-10 py-6 text-base sm:text-lg font-display font-bold uppercase tracking-widest rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.22 290), oklch(0.55 0.25 315))",
                  boxShadow:
                    "0 0 24px oklch(0.65 0.22 290 / 0.7), 0 0 50px oklch(0.55 0.25 315 / 0.35), inset 0 1px 0 oklch(1 0 0 / 0.15)",
                  animation: "glow-pulse 2.5s ease-in-out infinite",
                }}
              >
                <Link to="/apply">✦ Apply Now ✦</Link>
              </Button>
              <p className="text-xs text-muted-foreground tracking-widest uppercase font-mono">
                Only the chosen few make the cut
              </p>
            </div>
          </FadeUp>
        </div>

        {/* Scroll chevron */}
        {showScroll && (
          <div
            aria-hidden="true"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
            style={{ animation: "chevronBounce 2s ease-in-out infinite" }}
          >
            <ChevronDown
              size={28}
              style={{ color: "oklch(0.65 0.22 290 / 0.6)" }}
            />
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════
          ABOUT THE NIGHT SECTION
      ══════════════════════════════════════════════════ */}
      <section
        data-ocid="about.section"
        className="relative py-24 sm:py-32 px-4"
        style={{ background: "oklch(0.06 0.015 280)" }}
      >
        {/* Section grain */}
        <div
          aria-hidden="true"
          className="absolute inset-0 grain pointer-events-none"
        />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-14 sm:mb-20">
            <p
              className="text-xs font-mono tracking-[0.35em] uppercase mb-3"
              style={{ color: "oklch(0.68 0.27 305 / 0.8)" }}
            >
              What Awaits
            </p>
            <h2
              className="font-display font-black uppercase"
              style={{
                fontSize: "clamp(2rem, 6vw, 4rem)",
                filter: "drop-shadow(0 0 20px oklch(0.65 0.22 290 / 0.5))",
              }}
            >
              About The Night
            </h2>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {ABOUT_CARDS.map((card, i) => (
              <NeonCard
                key={card.title}
                glow={card.glow}
                className="p-6 sm:p-8 flex flex-col gap-4"
                data-ocid={`about.card.${i + 1}`}
                style={{
                  animationDelay: `${i * 150}ms`,
                }}
              >
                <span className="text-3xl">{card.emoji}</span>
                <h3
                  className="font-display font-bold text-sm tracking-[0.2em] uppercase"
                  style={{ color: "oklch(0.68 0.27 305)" }}
                >
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {card.body}
                </p>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          WHO GETS IN SECTION
      ══════════════════════════════════════════════════ */}
      <section
        data-ocid="criteria.section"
        className="relative py-24 sm:py-32 px-4 overflow-hidden"
        style={{ background: "oklch(0.08 0 0)" }}
      >
        {/* Decorative glow blob */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.55 0.25 315 / 0.07) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-xs font-mono tracking-[0.35em] uppercase mb-3"
              style={{ color: "oklch(0.55 0.25 315 / 0.9)" }}
            >
              The Standard
            </p>
            <h2
              className="font-display font-black uppercase"
              style={{
                fontSize: "clamp(2rem, 6vw, 4rem)",
                filter: "drop-shadow(0 0 20px oklch(0.55 0.25 315 / 0.5))",
              }}
            >
              Who Gets In
            </h2>
            <p className="mt-4 text-sm text-muted-foreground max-w-lg mx-auto">
              This isn't a club night. It's a collective. Entry is earned, not
              bought.
            </p>
          </div>

          {/* Criteria list */}
          <NeonCard glow="magenta" className="p-8 sm:p-10 space-y-5">
            {CRITERIA.map((c, i) => (
              <div
                key={c.text}
                className="flex items-start gap-4"
                data-ocid={`criteria.item.${i + 1}`}
              >
                <span
                  className="mt-0.5 text-sm flex-shrink-0"
                  style={{ color: "oklch(0.55 0.25 315)" }}
                >
                  {c.icon}
                </span>
                <p className="text-sm sm:text-base font-display font-medium text-foreground/90">
                  {c.text}
                </p>
              </div>
            ))}
          </NeonCard>

          {/* Secondary CTA */}
          <div className="mt-12 text-center flex flex-col items-center gap-4">
            <p className="font-display text-muted-foreground text-sm max-w-sm">
              Think you have what it takes? Every application is reviewed
              personally.
            </p>
            <Button
              asChild
              variant="outline"
              data-ocid="criteria.apply_button"
              className="border-secondary/50 text-secondary hover:bg-secondary/10 hover:border-secondary px-8 py-5 font-display font-bold tracking-widest uppercase text-sm rounded-xl transition-smooth"
            >
              <Link to="/apply">Submit Your Application →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          URGENCY / COUNTDOWN REINFORCEMENT SECTION
      ══════════════════════════════════════════════════ */}
      <section
        data-ocid="urgency.section"
        className="relative py-24 sm:py-32 px-4 overflow-hidden"
        style={{ background: "oklch(0.06 0.015 280)" }}
      >
        {/* Glow backdrop */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 60%, oklch(0.65 0.22 290 / 0.08) 0%, transparent 65%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 grain pointer-events-none"
        />

        <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center gap-8">
          <div>
            <p
              className="text-xs font-mono tracking-[0.35em] uppercase mb-3"
              style={{ color: "oklch(0.68 0.27 305 / 0.8)" }}
            >
              The Clock Is Running
            </p>
            <h2
              className="font-display font-black uppercase leading-tight"
              style={{
                fontSize: "clamp(2rem, 6vw, 3.5rem)",
                filter: "drop-shadow(0 0 20px oklch(0.65 0.22 290 / 0.6))",
              }}
            >
              Don't Let This
              <br />
              Pass You By
            </h2>
            <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Spots are extremely limited. Applications close when we're full —
              Every hour you wait is an hour closer to missing out.
            </p>
          </div>

          {/* Countdown reprise */}
          <NeonCard
            glow="cyan"
            className="px-8 py-6 sm:px-12 sm:py-8"
            data-ocid="urgency.countdown"
          >
            <p className="text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground mb-3 font-mono">
              Saturday 23 May 2026
            </p>
            <CountdownTimer />
          </NeonCard>

          {/* Final CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Button
              asChild
              data-ocid="urgency.apply_button"
              className="relative px-10 py-6 text-base font-display font-bold uppercase tracking-widest rounded-xl transition-smooth"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.22 290), oklch(0.55 0.25 315))",
                boxShadow:
                  "0 0 24px oklch(0.65 0.22 290 / 0.6), 0 0 50px oklch(0.55 0.25 315 / 0.3)",
              }}
            >
              <Link to="/apply">Secure Your Spot</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              data-ocid="urgency.status_button"
              className="text-muted-foreground hover:text-foreground font-display tracking-wider text-sm uppercase"
            >
              <Link to="/status">Check Application Status</Link>
            </Button>
          </div>

          <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            ✦ &nbsp; Miss it and you'll only hear about it &nbsp; ✦
          </p>
        </div>
      </section>

      {/* ── Music toggle (fixed bottom-right) ───────────────────────────────── */}
      <button
        type="button"
        onClick={toggleMusic}
        aria-label={
          musicPlaying ? "Mute background music" : "Play background music"
        }
        data-ocid="music.toggle"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 h-10 rounded-full transition-smooth hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        style={{
          background: "oklch(0.12 0.02 270 / 0.88)",
          border: `1px solid ${musicPlaying ? "oklch(0.65 0.22 290 / 0.7)" : "oklch(0.65 0.22 290 / 0.3)"}`,
          backdropFilter: "blur(14px)",
          boxShadow: musicPlaying
            ? "0 0 18px oklch(0.65 0.22 290 / 0.55), 0 0 36px oklch(0.55 0.25 315 / 0.25)"
            : "0 0 8px oklch(0.65 0.22 290 / 0.15)",
        }}
      >
        {musicPlaying ? (
          <Music2 size={15} style={{ color: "oklch(0.68 0.27 305)" }} />
        ) : (
          <VolumeX size={15} className="text-muted-foreground" />
        )}
        <span
          className="text-[0.6rem] font-mono tracking-[0.25em] uppercase select-none"
          style={{
            color: musicPlaying
              ? "oklch(0.68 0.27 305)"
              : "oklch(0.55 0.15 270)",
          }}
        >
          IRIE FM
        </span>
      </button>
    </>
  );
}
