"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { Manifesto } from "@/components/site/manifesto";
import { HostsSection } from "@/components/site/hosts-section";
import { EventsSection } from "@/components/events/events-section";
import { EventDetailModal } from "@/components/events/event-detail-modal";
import { PaymentModal } from "@/components/payment/payment-modal";
import { Badge } from "@/components/ui/badge";
import type { ProposedEvent, Ticket } from "@/lib/types";
import { toast } from "sonner";

export default function HomePage() {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<ProposedEvent | null>(null);
  const [paymentEvent, setPaymentEvent] = useState<ProposedEvent | null>(null);

  const openDetail = useCallback((e: ProposedEvent) => setSelectedEvent(e), []);
  const closeDetail = useCallback(() => setSelectedEvent(null), []);

  const openPayment = useCallback((e: ProposedEvent) => {
    setSelectedEvent(null);
    setPaymentEvent(e);
  }, []);
  const closePayment = useCallback(() => setPaymentEvent(null), []);

  const handlePaymentSuccess = useCallback((_t: Ticket) => {
    toast.success("See you on the floor.");
  }, []);

  return (
    <SiteLayout>
      {/* Compact action header */}
      <section className="relative z-10 mx-auto w-full px-6 pt-10 pb-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-container">
          <Badge
            variant="outline"
            className="mb-3 border-primary/40 bg-primary/8 px-3 py-1 text-primary font-sans font-semibold uppercase tracking-[0.18em] text-[10px] w-fit gap-1.5"
          >
            <Lock className="size-2.5" />
            Members Only · Underground
          </Badge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
            Find your next night.
          </h1>
          <p className="mt-1.5 text-sm text-secondary font-sans">
            Vetted underground parties across India — techno, house, ambient &amp; more.
          </p>
        </div>
      </section>

      {/* Events — full discovery experience, right on the homepage */}
      <EventsSection
        onSelectEvent={openDetail}
        onApplyToJoin={() => router.push("/apply")}
      />

      <Manifesto />
      <HostsSection />

      <EventDetailModal
        event={selectedEvent}
        onClose={closeDetail}
        onReserve={openPayment}
        onApplyToJoin={() => router.push("/apply")}
      />
      <PaymentModal
        event={paymentEvent}
        onClose={closePayment}
        onSuccess={handlePaymentSuccess}
      />
    </SiteLayout>
  );
}
