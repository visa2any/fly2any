"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PostPaymentSuccess from "@/components/agent/quote-workspace/post-payment/PostPaymentSuccess";

function SuccessContent() {
  const searchParams = useSearchParams();

  // Get booking data from URL params (in production, fetch from API)
  const bookingId = searchParams.get("id") || `BK${Date.now()}`;
  const destination = searchParams.get("destination") || "Your Destination";
  const startDate = searchParams.get("start") || new Date().toISOString();
  const endDate = searchParams.get("end") || new Date().toISOString();
  const travelers = parseInt(searchParams.get("travelers") || "1", 10);
  const total = parseFloat(searchParams.get("total") || "0");

  return (
    <PostPaymentSuccess
      bookingId={bookingId}
      tripName={destination}
      destination={destination}
      startDate={startDate}
      endDate={endDate}
      travelers={travelers}
      total={total}
      agentName="Alex Martinez"
      agentEmail="alex@fly2any.com"
      agentPhone="+1 (888) 555-0123"
      onViewTrip={() => window.location.href = `/booking/${bookingId}`}
      onDownloadReceipt={() => window.print()}
      onAddToCalendar={() => {
        // Generate ICS file
        const event = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate.replace(/[-:]/g, "").split("T")[0]}
DTEND:${endDate.replace(/[-:]/g, "").split("T")[0]}
SUMMARY:Trip to ${destination}
DESCRIPTION:Your Fly2Any booking #${bookingId}
END:VEVENT
END:VCALENDAR`;
        const blob = new Blob([event], { type: "text/calendar" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `trip-${bookingId}.ics`;
        a.click();
      }}
    />
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
