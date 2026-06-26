"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SiteLayout } from "@/components/site/site-layout";
import { EventsSection } from "@/components/events/events-section";
import { EventDetailModal } from "@/components/events/event-detail-modal";
import { PaymentModal } from "@/components/payment/payment-modal";
import type { ProposedEvent, Ticket } from "@/lib/types";
import { toast } from "sonner";

export default function EventsPage() {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<ProposedEvent | null>(null);
  const [paymentEvent, setPaymentEvent] = useState<ProposedEvent | null>(null);

  const openDetail = useCallback((e: ProposedEvent) => setSelectedEvent(e), []);
  const closeDetail = useCallback(() => setSelectedEvent(null), []);
  const openPayment = useCallback((e: ProposedEvent) => {
    setSelectedEvent(null);
    setTimeout(() => setPaymentEvent(e), 150);
  }, []);
  const closePayment = useCallback(() => setPaymentEvent(null), []);

  return (
    <SiteLayout>
      <EventsSection
        onSelectEvent={openDetail}
        onApplyToJoin={() => router.push("/apply")}
      />

      <EventDetailModal
        event={selectedEvent}
        onClose={closeDetail}
        onReserve={openPayment}
        onApplyToJoin={() => router.push("/apply")}
      />
      <PaymentModal
        event={paymentEvent}
        onClose={closePayment}
        onSuccess={(_t: Ticket) => {
          toast.success("You're in. See you on the floor.", {
            description: "Your ticket is confirmed — check your dashboard.",
            action: { label: "View ticket", onClick: () => router.push("/member") },
          });
        }}
      />
    </SiteLayout>
  );
}
