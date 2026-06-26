"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Clock } from "lucide-react";
import { CountdownTimer } from "./countdown-timer";
import type { Ticket } from "@/lib/types";

interface UpcomingEventNotificationProps {
  ticket: Ticket | null;
  onDismiss?: () => void;
}

export function UpcomingEventNotification({ ticket, onDismiss }: UpcomingEventNotificationProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!ticket || dismissed) return null;

  const now = new Date().getTime();
  const eventTime = new Date(ticket.event.startsAt).getTime();
  const hoursUntilEvent = (eventTime - now) / (1000 * 60 * 60);

  // Only show if event is within 24 hours
  if (hoursUntilEvent > 24 || hoursUntilEvent < 0) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        key="notification"
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="relative mx-auto mb-8 w-full max-w-4xl overflow-hidden rounded-3xl border-2 border-pink-400/60 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 p-6 sm:p-8 shadow-glow-pink animate-pulse-party"
        style={{
          boxShadow: "0 0 50px rgba(255,16,240,0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
        }}
      >
        {/* Animated vibrant border glow */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{
            background: "linear-gradient(90deg, #ff10f0, #a020f0, #0080ff, #00f0ff, #ff10f0)",
            backgroundSize: "200% 100%",
            opacity: 0.12,
            animation: "gradient-shift 6s ease-in-out infinite",
          }}
        />

        {/* Content */}
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Left side - Icon & Text */}
          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/50 to-purple-500/50 ring-2 ring-pink-400/80 animate-bounce-glow">
              <Clock className="h-7 w-7 text-pink-200 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-bold leading-tight text-white sm:text-xl">
                🎉 GET READY! Your Event is Coming! 🔥
              </h3>
              <p className="mt-2 text-base text-pink-200 font-bold">
                {ticket.event.title} · {ticket.event.venue}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(ticket.event.startsAt).toLocaleDateString("en-IN")} at {new Date(ticket.event.startsAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          {/* Center - MASSIVE Countdown Timer */}
          <div className="flex w-full items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-pink-900/40 to-purple-900/40 p-6 ring-2 ring-pink-400/50 backdrop-blur-sm animate-pulse-party">
            <div className="text-center">
              <div className="text-4xl font-bold font-display bg-gradient-to-r from-pink-300 via-cyan-300 to-pink-300 bg-clip-text text-transparent drop-shadow-lg animate-bounce-glow">
                <CountdownTimer targetDate={ticket.event.startsAt} compact />
              </div>
              <p className="mt-2 text-xs font-bold text-cyan-300 uppercase tracking-widest">Time left</p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-4 rounded-full p-2 text-pink-400 transition-all hover:bg-pink-500/30 hover:text-pink-200 hover:shadow-glow-pink sm:relative sm:right-0 sm:top-0"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Bottom action hint - PROMINENT */}
        <div className="relative mt-6 flex items-center gap-3 border-t border-pink-400/30 pt-5">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-cyan-300 animate-pulse" />
          <p className="text-sm font-bold uppercase tracking-wider text-pink-300 animate-pulse">
            ⏰ ARRIVE 15 MIN EARLY • PHONES OFF AT DOOR • LET'S PARTY! 🎉
          </p>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% center;
          }
          50% {
            background-position: 100% center;
          }
        }
      `}</style>
    </AnimatePresence>
  );
}
