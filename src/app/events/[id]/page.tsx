"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { EventDetailModal } from "@/components/events/event-detail-modal";
import { PaymentModal } from "@/components/payment/payment-modal";
import { Button } from "@/components/ui/button";
import { eventsApi } from "@/lib/api-client";
import { getSafeEventCover } from "@/lib/event-covers";
import type { ProposedEvent } from "@/lib/types";
import { toast } from "sonner";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<ProposedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentEvent, setPaymentEvent] = useState<ProposedEvent | null>(null);

  const loadEvent = useCallback(async () => {
    const id = params?.id;
    if (!id) return;
    setLoading(true);
    // Try sessionStorage first (set by previous list navigation)
    try {
      const cached = sessionStorage.getItem(`event:${id}`);
      if (cached) {
        const parsed = JSON.parse(cached) as ProposedEvent;
        setEvent(parsed);
        setLoading(false);
        return;
      }
    } catch {
      // ignore
    }
    try {
      const e = await eventsApi.get(id);
      setEvent(e);
    } catch (err) {
      toast.error("Event not found", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  // Once event is loaded, immediately open the detail modal (which acts as the page)
  return (
    <SiteLayout>
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/events")}
        >
          <ArrowLeft className="size-4" />
          Back to events
        </Button>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="size-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading event…</p>
          </div>
        ) : event ? (
          <div className="space-y-4">
            <div className="border border-border bg-card overflow-hidden rounded-2xl">
              <img
                src={getSafeEventCover(event.cover, event.vibe, event.title, event.city)}
                alt={event.title}
                className="aspect-[16/9] w-full object-cover"
              />
              <div className="p-6">
                <h1 className="font-display text-3xl font-bold">{event.title}</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  by {event.hostName} · {event.venue}
                </p>
                <Button
                  size="lg"
                  className="mt-4 gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
                  onClick={() => setPaymentEvent(event)}
                >
                  Reserve spot
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-border bg-card rounded-2xl p-8 text-center text-sm text-muted-foreground">
            Event not found.
          </div>
        )}
      </div>

      {/* Always-open detail modal — provides the full experience */}
      {event ? (
        <EventDetailModal
          event={event}
          onClose={() => router.push("/events")}
          onReserve={(e) => setPaymentEvent(e)}
        />
      ) : null}

      <PaymentModal
        event={paymentEvent}
        onClose={() => setPaymentEvent(null)}
        onSuccess={() => {
          toast.success("You're in. See you on the floor.", {
            description: "Your ticket is confirmed — check your dashboard.",
            action: { label: "View ticket", onClick: () => router.push("/member") },
          });
        }}
      />
    </SiteLayout>
  );
}
