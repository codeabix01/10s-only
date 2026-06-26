"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { Hero } from "@/components/site/hero";
import { Manifesto } from "@/components/site/manifesto";
import { HostsSection } from "@/components/site/hosts-section";
import { EventsSection } from "@/components/events/events-section";
import { EventDetailModal } from "@/components/events/event-detail-modal";
import { PaymentModal } from "@/components/payment/payment-modal";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/ambient";
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
      <Hero />

      <EventsSection
        preview
        onSelectEvent={openDetail}
        onApplyToJoin={() => router.push("/apply")}
      />

      <Reveal className="mx-auto -mt-4 mb-8 flex w-full max-w-7xl justify-center px-4">
        <Button
          size="lg"
          variant="outline"
          className="gap-2 rounded-xl border-border bg-white/5 px-6 text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
          onClick={() => router.push("/events")}
        >
          View all events
          <ArrowRight className="size-4" />
        </Button>
      </Reveal>

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
