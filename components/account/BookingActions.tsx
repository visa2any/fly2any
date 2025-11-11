'use client';

import { useState } from 'react';
import {
  Download,
  Mail,
  Printer,
  Share2,
  Calendar as CalendarIcon,
  XCircle,
  Edit,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import type { Booking } from '@/lib/bookings/types';

interface BookingActionsProps {
  booking: Booking;
  onCancelClick: () => void;
}

export default function BookingActions({
  booking,
  onCancelClick,
}: BookingActionsProps) {
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      // In production, this would generate and download a PDF
      // For now, we'll simulate the action
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create a simple text file with booking details
      const bookingDetails = `
BOOKING CONFIRMATION
${booking.bookingReference}

Status: ${booking.status.toUpperCase()}
Date: ${new Date(booking.createdAt).toLocaleDateString()}

FLIGHT DETAILS
${booking.flight.segments[0].departure.iataCode} → ${
        booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode
      }
Departure: ${new Date(booking.flight.segments[0].departure.at).toLocaleString()}
Type: ${booking.flight.type}

PASSENGERS
${booking.passengers
  .map(
    (p, i) =>
      `${i + 1}. ${p.title} ${p.firstName} ${p.lastName} (${p.type})`
  )
  .join('\n')}

PAYMENT
Amount: ${booking.payment.currency} ${booking.payment.amount.toFixed(2)}
Method: ${booking.payment.method.replace('_', ' ')}
Status: ${booking.payment.status}

CONTACT
Email: ${booking.contactInfo.email}
Phone: ${booking.contactInfo.phone}
      `.trim();

      const blob = new Blob([bookingDetails], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `booking-${booking.bookingReference}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download booking confirmation');
    } finally {
      setDownloading(false);
    }
  };

  const handleEmail = async () => {
    try {
      setEmailing(true);
      // In production, this would send an email via API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (error) {
      console.error('Email error:', error);
      alert('Failed to send confirmation email');
    } finally {
      setEmailing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      setSharing(true);
      const shareData = {
        title: `Flight Booking - ${booking.bookingReference}`,
        text: `My flight from ${booking.flight.segments[0].departure.iataCode} to ${
          booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode
        }`,
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Booking link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setSharing(false);
    }
  };

  const handleAddToCalendar = () => {
    const firstSegment = booking.flight.segments[0];
    const lastSegment = booking.flight.segments[booking.flight.segments.length - 1];

    // Create iCal format
    const startDate = new Date(firstSegment.departure.at)
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0] + 'Z';
    const endDate = new Date(lastSegment.arrival.at)
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0] + 'Z';

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Fly2Any//Booking//EN
BEGIN:VEVENT
UID:${booking.id}@fly2any.com
DTSTAMP:${startDate}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:Flight ${firstSegment.departure.iataCode} to ${lastSegment.arrival.iataCode}
DESCRIPTION:Booking Reference: ${booking.bookingReference}\\nFlight: ${firstSegment.carrierCode} ${firstSegment.flightNumber}\\nPassengers: ${booking.passengers.length}
LOCATION:${firstSegment.departure.iataCode} Airport
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flight-${booking.bookingReference}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const canCancel =
    booking.status === 'confirmed' || booking.status === 'pending';
  const canModify = booking.status === 'confirmed';

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex flex-wrap gap-3">
        {/* Download Confirmation */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download
            </>
          )}
        </button>

        {/* Email Confirmation */}
        <button
          onClick={handleEmail}
          disabled={emailing || emailSent}
          className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            emailSent
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {emailing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : emailSent ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Sent!
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              Email
            </>
          )}
        </button>

        {/* Print */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Printer className="w-5 h-5" />
          Print
        </button>

        {/* Add to Calendar */}
        <button
          onClick={handleAddToCalendar}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          <CalendarIcon className="w-5 h-5" />
          Add to Calendar
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          disabled={sharing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {sharing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sharing...
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5" />
              Share
            </>
          )}
        </button>

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Modify Booking */}
        {canModify && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 font-semibold rounded-lg hover:bg-orange-200 transition-colors"
            onClick={() => alert('Modification feature coming soon!')}
          >
            <Edit className="w-5 h-5" />
            Modify
          </button>
        )}

        {/* Cancel Booking */}
        {canCancel && (
          <button
            onClick={onCancelClick}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            <XCircle className="w-5 h-5" />
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
}
