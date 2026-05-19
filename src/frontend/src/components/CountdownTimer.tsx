import { useEffect, useState } from "react";

const EVENT_DATE = new Date("2026-05-23T23:00:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const diff = Math.max(0, EVENT_DATE.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HRS", value: timeLeft.hours },
    { label: "MIN", value: timeLeft.minutes },
    { label: "SEC", value: timeLeft.seconds },
  ];

  return (
    <div
      className="flex items-end gap-2 sm:gap-4"
      aria-live="polite"
      aria-label="Countdown to event"
    >
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-end gap-2 sm:gap-4">
          <div className="flex flex-col items-center">
            <span
              className="font-display font-bold tabular-nums leading-none"
              style={{
                fontSize: "clamp(2.5rem, 8vw, 5rem)",
                background:
                  "linear-gradient(135deg, oklch(0.68 0.27 305), oklch(0.65 0.22 290))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 12px oklch(0.68 0.27 305 / 0.7))",
              }}
            >
              {pad(unit.value)}
            </span>
            <span className="text-[0.6rem] sm:text-xs tracking-[0.2em] text-muted-foreground mt-1 font-mono">
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="font-display font-bold pb-5 sm:pb-6 text-3xl sm:text-5xl text-secondary/80">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
