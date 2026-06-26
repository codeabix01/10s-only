"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Loader2,
  Lock,
  CheckCircle2,
  Ticket as TicketIcon,
  X,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { razorpayApi, ticketsApi, USE_MOCK } from "@/lib/api-client";
import { useRazorpay } from "@/lib/use-razorpay";
import { useAuth } from "@/lib/auth-store";
import { VIBE_LABELS, CITY_LABELS } from "@/lib/mock-data";
import { getSafeEventCover } from "@/lib/event-covers";
import { toast } from "sonner";
import type { ProposedEvent, Ticket } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
  event: ProposedEvent | null;
  onClose: () => void;
  onSuccess?: (ticket: Ticket) => void;
}

type Stage = "summary" | "creating" | "checkout" | "verifying" | "success" | "error";

const PLATFORM_FEE_RATE = 0.02; // 2%
const GST_RATE = 0.009; // 0.9%

function computeTotals(price: number) {
  const platformFee = Math.round(price * PLATFORM_FEE_RATE);
  const taxable = price + platformFee;
  const gst = Math.round(taxable * GST_RATE);
  const total = price + platformFee + gst;
  return { platformFee, gst, total };
}

export function PaymentModal({ event, onClose, onSuccess }: PaymentModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const razorpay = useRazorpay();
  const [stage, setStage] = useState<Stage>("summary");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!event) return null;

  const totals = computeTotals(event.price);
  const cover = getSafeEventCover(event.cover, event.vibe, event.title, event.city);

  const handlePay = async () => {
    if (!user) {
      setError("You must be signed in to reserve a spot.");
      setStage("error");
      return;
    }

    setError(null);
    setStage("creating");
    console.info("[payment] start", {
      eventId: event.id,
      userId: user.id,
      total: totals.total,
    });

    try {
      // 1. Create order
      console.info("[payment] creating_order", {
        eventId: event.id,
        amount: totals.total,
      });
      const order = await razorpayApi.createOrder({
        eventId: event.id,
        userId: user.id,
        amount: totals.total,
      });
      console.info("[payment] order_created", {
        orderId: order.id,
        amountPaise: order.amount,
        status: order.status,
      });

      // 2a. Mock mode — simulate payment
      if (USE_MOCK) {
        setStage("verifying");
        // Simulate Razorpay callback
        const fakePaymentId = `pay_${Math.random()
          .toString(36)
          .slice(2, 14)}`;
        const fakeSignature = `sig_${Math.random()
          .toString(36)
          .slice(2, 18)}`;
        console.info("[payment] verifying_payment_mock", {
          orderId: order.id,
          paymentId: fakePaymentId,
        });
        const verify = await razorpayApi.verify({
          razorpay_order_id: order.id,
          razorpay_payment_id: fakePaymentId,
          razorpay_signature: fakeSignature,
          eventId: event.id,
          amount: totals.total,
          currency: "INR",
        });
        if (verify.status !== "captured") {
          throw new Error("Payment verification failed.");
        }
        console.info("[payment] payment_verified_mock", {
          paymentId: verify.paymentId,
          ticketId: verify.ticketId,
        });
        // 3. Create ticket
        console.info("[payment] creating_booking_mock", {
          orderId: order.id,
          eventId: event.id,
          userId: user.id,
        });
        const tkt = await ticketsApi.create({
          eventId: event.id,
          userId: user.id,
          holderName: user.name,
          orderId: order.id,
          amount: totals.total,
        });
        console.info("[payment] booking_created_mock", {
          ticketId: tkt.id,
          qr: tkt.qrCode,
        });
        setTicket(tkt);
        setStage("success");
        toast.success("Ticket confirmed", {
          description: `ID ${tkt.qrCode}`,
        });
        return;
      }

      // 2b. Real Razorpay checkout
      if (!razorpay.isReady) {
        throw new Error(
          razorpay.error ?? "Razorpay SDK is still loading. Try again."
        );
      }
      setStage("checkout");
      razorpay.openCheckout({
        orderId: order.id,
        amount: totals.total,
        name: "10s Only",
        description: `${event.title} · ${CITY_LABELS[event.city]}`,
        image: cover,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        notes: { eventId: event.id, userId: user.id },
        onSuccess: async (response) => {
          console.info("[payment] razorpay_success_callback", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
          });
          setStage("verifying");
          try {
            console.info("[payment] verifying_payment", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              eventId: event.id,
            });
            const verify = await razorpayApi.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              eventId: event.id,
              amount: totals.total,
              currency: "INR",
            });
            if (verify.status !== "captured") {
              throw new Error("Payment verification failed.");
            }
            console.info("[payment] payment_verified", {
              paymentId: verify.paymentId,
              ticketId: verify.ticketId,
              status: verify.status,
            });

            // Backend creates and saves the ticket during verification.
            const tkt: Ticket = {
              id: verify.ticketId || verify.id,
              eventId: event.id,
              event,
              userId: user.id,
              holderName: user.name,
              qrCode: verify.ticketId || verify.orderId,
              status: "confirmed",
              purchasedAt: verify.verifiedAt,
              orderId: verify.orderId,
              amount: totals.total,
            };
            console.info("[payment] booking_created", {
              ticketId: tkt.id,
              qr: tkt.qrCode,
            });
            setTicket(tkt);
            setStage("success");
            toast.success("Ticket confirmed", {
              description: `ID ${tkt.qrCode}`,
            });
          } catch (err) {
            console.error("[payment] verification_or_booking_failed", err);
            setError(err instanceof Error ? err.message : "Verification failed");
            setStage("error");
          }
        },
        onDismiss: () => {
          console.info("[payment] checkout_dismissed");
          setStage("summary");
          toast("Payment cancelled", {
            description: "You closed the checkout before paying.",
          });
        },
        onFailure: (message) => {
          console.error("[payment] checkout_failure", { message });
          setError(message);
          setStage("error");
          toast.error("Payment failed", {
            description: message,
          });
        },
      });
    } catch (err) {
      console.error("[payment] create_or_checkout_failed", err);
      setError(err instanceof Error ? err.message : "Payment failed");
      setStage("error");
      toast.error("Payment failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleClose = () => {
    if (ticket && onSuccess) onSuccess(ticket);
    onClose();
    // Reset after the close animation
    setTimeout(() => {
      setStage("summary");
      setTicket(null);
      setError(null);
    }, 200);
  };

  return (
    <Dialog open={!!event} onOpenChange={(o) => !o && handleClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/70 backdrop-blur-sm" />
        <DialogContent
          showCloseButton={false}
          className="border border-border bg-card w-full overflow-hidden p-0 sm:max-w-md"
        >
          {/* Close */}
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
          >
            <X className="size-4" />
          </button>

          <div className="relative">
            {/* Top accent stripe */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-px left-1/2 h-px w-2/3 -translate-x-1/2"
              style={{ background: "linear-gradient(90deg, transparent, #C6A769, transparent)" }}
            />

            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {/* Summary */}
                {stage === "summary" ? (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                      <TicketIcon className="size-3.5 text-primary" />
                        Reserve your spot
                      </div>
                      <h2 className="font-display text-xl font-bold leading-tight">
                        {event.title}
                      </h2>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="border-white/15 bg-white/5">
                          {VIBE_LABELS[event.vibe]}
                        </Badge>
                        <span>{CITY_LABELS[event.city]}</span>
                        <span>·</span>
                        <span>{new Date(event.startsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      </div>
                    </div>

                    {/* Cover thumb */}
                    <div className="overflow-hidden rounded-xl border border-white/10">
                      <img
                        src={cover}
                        alt={event.title}
                        className="aspect-[16/7] w-full object-cover"
                      />
                    </div>

                    {/* Price breakdown */}
                    <div className="border border-border bg-card/50 rounded-xl p-4">
                      <Row label="Ticket" value={`₹${event.price.toLocaleString("en-IN")}`} />
                      <Row
                        label="Platform fee (2%)"
                        value={`₹${totals.platformFee.toLocaleString("en-IN")}`}
                        muted
                      />
                      <Row
                        label="GST (0.9%)"
                        value={`₹${totals.gst.toLocaleString("en-IN")}`}
                        muted
                      />
                      <Separator className="my-3 bg-white/10" />
                      <Row
                        label="Total"
                        value={`₹${totals.total.toLocaleString("en-IN")}`}
                        bold
                      />
                    </div>

                    {/* Security note */}
                    <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                      <ShieldCheck className="mt-0.5 size-4 text-primary" />
                      <p>
                        Payments are processed by{" "}
                        <span className="font-semibold text-primary">Razorpay</span>{" "}
                        over an encrypted, PCI-DSS compliant channel. We never
                        see or store your card details.
                      </p>
                    </div>

                    <Button
                      size="lg"
                      className="h-12 w-full gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
                      onClick={handlePay}
                    >
                      <Lock className="size-4" />
                      Pay ₹{totals.total.toLocaleString("en-IN")}
                    </Button>
                    {!user ? (
                      <p className="text-center text-[11px] text-[#ff3b3b]">
                        Sign in first to reserve a spot.
                      </p>
                    ) : null}
                  </motion.div>
                ) : null}

                {/* Creating / Checkout / Verifying */}
                {(stage === "creating" ||
                  stage === "checkout" ||
                  stage === "verifying") ? (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4 py-10 text-center"
                  >
                    <Loader2 className="size-10 animate-spin text-primary" />
                    <div>
                      <h3 className="font-display text-lg font-bold">
                        {stage === "creating"
                          ? "Securing your spot…"
                          : stage === "checkout"
                          ? "Opening secure checkout…"
                          : "Verifying payment…"}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Don&apos;t close this window.
                      </p>
                    </div>
                  </motion.div>
                ) : null}

                {/* Success */}
                {stage === "success" && ticket ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4 py-4 text-center"
                  >
                    <div className="grid size-16 place-items-center rounded-full bg-primary/15 text-primary">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-bold">
                        You&apos;re in.
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Ticket confirmed · check your dashboard for the QR.
                      </p>
                    </div>

                    {/* QR / ticket */}
                    <div className="border border-border bg-card/50 w-full rounded-xl p-4 text-left">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Ticket ID
                        </span>
                        <span className="font-mono text-xs text-foreground">
                          {ticket.qrCode}
                        </span>
                      </div>
                      {/* Fake QR — deterministic grid from ticket code */}
                      <FakeQR payload={ticket.qrCode} />
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Holder
                          </div>
                          <div className="text-foreground">{ticket.holderName}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Amount
                          </div>
                          <div className="text-foreground">
                            ₹{ticket.amount.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="h-11 w-full gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
                      onClick={() => {
                        handleClose();
                        router.push("/member");
                      }}
                    >
                      View my tickets
                    </Button>
                    <button
                      onClick={handleClose}
                      className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                    >
                      Continue browsing events
                    </button>
                  </motion.div>
                ) : null}

                {/* Error */}
                {stage === "error" ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4 py-8 text-center"
                  >
                    <div className="grid size-14 place-items-center rounded-full bg-[#ff3b3b]/15 text-[#ff3b3b]">
                      <AlertCircle className="size-7" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold">
                        Payment failed
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {error ?? "Something went wrong. Please try again."}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-white/15"
                      onClick={() => setStage("summary")}
                    >
                      Back to summary
                    </Button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

function Row({
  label,
  value,
  muted,
  bold,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span
        className={cn(
          muted ? "text-muted-foreground" : "text-foreground/85",
          bold && "font-semibold text-foreground"
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-mono",
          bold ? "font-bold text-foreground" : "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}

// Deterministic "QR" visualization from a string payload
function FakeQR({ payload }: { payload: string }) {
  const size = 21;
  const cells: boolean[] = [];
  let h = 0;
  for (let i = 0; i < payload.length; i++) {
    h = (h << 5) - h + payload.charCodeAt(i);
    h |= 0;
  }
  let s = Math.abs(h) + 1;
  const rng = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < size * size; i++) cells.push(rng() > 0.5);

  return (
    <div
      className="mx-auto grid w-full max-w-[180px]"
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gap: 1,
        background: "#ffffff",
        padding: 8,
        borderRadius: 8,
      }}
      aria-label={`QR code ${payload}`}
    >
      {cells.map((on, i) => (
        <div
          key={i}
          style={{
            background: on ? "#000000" : "#ffffff",
            aspectRatio: "1 / 1",
          }}
        />
      ))}
    </div>
  );
}
