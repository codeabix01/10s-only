import { useEffect, useRef } from "react";

interface WelcomeTransitionProps {
  isVisible: boolean;
  userName?: string;
  onComplete: () => void;
}

export function WelcomeTransition({
  isVisible,
  userName,
  onComplete,
}: WelcomeTransitionProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    // Auto-dismiss after 1.8s — always fires regardless of animation state
    timerRef.current = setTimeout(() => {
      onComplete();
    }, 1800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const line1 = userName
    ? `Welcome back, ${userName}.`
    : "Welcome to 10s Only.";
  const line2 = "Your access begins now.";

  return (
    <div
      className="welcome-transition-overlay"
      aria-live="polite"
      aria-label="Welcome"
      data-ocid="welcome.overlay"
    >
      {/* Grain texture */}
      <div className="welcome-grain" />

      {/* Neon blobs */}
      <div className="welcome-blob welcome-blob--purple" />
      <div className="welcome-blob welcome-blob--cyan" />
      <div className="welcome-blob welcome-blob--magenta" />

      {/* Content */}
      <div className="welcome-content" data-ocid="welcome.content">
        {/* Neon dot accent */}
        <div className="welcome-dot" aria-hidden="true" />

        <p className="welcome-line-1" data-ocid="welcome.line1">
          {line1}
        </p>
        <p className="welcome-line-2" data-ocid="welcome.line2">
          {line2}
        </p>
      </div>
    </div>
  );
}
