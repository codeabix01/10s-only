"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeRemaining(targetDate: string): TimeRemaining {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isExpired: false };
}

export function CountdownTimer({ targetDate, compact = false }: { targetDate: string; compact?: boolean }) {
  const [time, setTime] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    setTime(calculateTimeRemaining(targetDate));
    const interval = setInterval(() => {
      setTime(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!time) return null;
  if (time.isExpired) return <span className="text-xs text-destructive">Event is live</span>;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-mono">
        <Clock className="size-3 text-primary" />
        <span className="text-primary">
          {time.days > 0 && `${time.days}d `}
          {time.hours.toString().padStart(2, "0")}:
          {time.minutes.toString().padStart(2, "0")}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <div className="text-3xl font-bold text-primary">{time.days}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Days</div>
      </div>
      <div className="h-8 w-px bg-white/10" />
      <div className="text-center">
        <div className="text-3xl font-bold text-primary">{time.hours.toString().padStart(2, "0")}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Hours</div>
      </div>
      <div className="h-8 w-px bg-white/10" />
      <div className="text-center">
        <div className="text-3xl font-bold text-primary">{time.minutes.toString().padStart(2, "0")}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Mins</div>
      </div>
      <div className="h-8 w-px bg-white/10" />
      <div className="text-center">
        <div className="text-3xl font-bold text-secondary">{time.seconds.toString().padStart(2, "0")}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Secs</div>
      </div>
    </div>
  );
}
