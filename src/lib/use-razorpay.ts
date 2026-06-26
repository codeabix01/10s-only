"use client";

import { useCallback, useEffect, useState } from "react";

// Minimal Razorpay checkout types
interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // paise
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color: string };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
    backdropclose?: boolean;
    escape?: boolean;
  };
}

interface RazorpayInstance {
  open: () => void;
  on?: (event: string, handler: (response: unknown) => void) => void;
}

interface RazorpayConstructor {
  new (options: RazorpayCheckoutOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
const RAZORPAY_KEY_ID =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_000000000000";

export interface UseRazorpay {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  openCheckout: (options: {
    orderId: string;
    amount: number; // INR (rupees) — converted to paise internally
    currency?: string;
    name: string;
    description?: string;
    image?: string;
    prefill?: { name?: string; email?: string; contact?: string };
    notes?: Record<string, string>;
    onSuccess: (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => void;
    onDismiss?: () => void;
    onFailure?: (message: string) => void;
  }) => void;
}

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    // already loaded?
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`
    );
    if (existing) {
      if (window.Razorpay) resolve(true);
      else {
        existing.addEventListener("load", () => resolve(true));
        existing.addEventListener("error", () =>
          reject(new Error("Failed to load Razorpay script"))
        );
      }
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
}

export function useRazorpay(): UseRazorpay {
  const [isReady, setIsReady] = useState(false);
  // Start in loading state — the script begins loading on mount.
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (typeof window === "undefined") return;
    loadScript(RAZORPAY_SCRIPT_URL)
      .then(() => {
        if (!mounted) return;
        if (window.Razorpay) {
          setIsReady(true);
          setError(null);
        } else {
          setError("Razorpay SDK not available after load.");
        }
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Unknown Razorpay load error");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const openCheckout = useCallback<UseRazorpay["openCheckout"]>(
    (options) => {
      if (!window.Razorpay) {
        setError("Razorpay SDK is not loaded yet.");
        return;
      }
      if (!RAZORPAY_KEY_ID) {
        setError("Missing NEXT_PUBLIC_RAZORPAY_KEY_ID.");
        return;
      }

      try {
        const rzp = new window.Razorpay({
          key: RAZORPAY_KEY_ID,
          amount: Math.round(options.amount * 100), // rupees → paise
          currency: options.currency || "INR",
          name: options.name,
          description: options.description,
          image: options.image,
          order_id: options.orderId,
          prefill: options.prefill,
          notes: options.notes,
          theme: { color: "#FF007A" },
          handler: (response) => {
            options.onSuccess(response);
          },
          modal: {
            ondismiss: () => {
              options.onDismiss?.();
            },
            backdropclose: false,
            escape: true,
          },
        });
        rzp.on?.("payment.failed", (failure) => {
          const message =
            failure && typeof failure === "object"
              ? String(
                  ((failure as any).error?.description as unknown) ||
                    ((failure as any).error?.reason as unknown) ||
                    JSON.stringify(failure)
                )
              : String(failure ?? "Payment failed.");
          options.onFailure?.(message);
        });
        rzp.open();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to open Razorpay checkout");
      }
    },
    []
  );

  return {
    isReady,
    isLoading,
    error,
    setError,
    openCheckout,
  };
}
