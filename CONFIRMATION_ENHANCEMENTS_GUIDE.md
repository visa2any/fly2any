# Confirmation Page - Optional Enhancements Implementation Guide

This guide shows how to add the optional features to the already-complete confirmation page.

---

## 1. Add to Calendar (ICS File Download)

### Install Dependencies
```bash
npm install ics
```

### Create Calendar Utility
**File:** `lib/utils/calendar.ts`
```typescript
import { createEvent, EventAttributes } from 'ics';

export interface FlightEventData {
  bookingRef: string;
  airline: string;
  flightNumber: string;
  from: { code: string; city: string; airport: string };
  to: { code: string; city: string; airport: string };
  departure: string; // ISO date string
  arrival: string;   // ISO date string
}

export function generateFlightICS(flight: FlightEventData): string | null {
  const departureDate = new Date(flight.departure);
  const arrivalDate = new Date(flight.arrival);

  const event: EventAttributes = {
    start: [
      departureDate.getFullYear(),
      departureDate.getMonth() + 1,
      departureDate.getDate(),
      departureDate.getHours(),
      departureDate.getMinutes()
    ],
    end: [
      arrivalDate.getFullYear(),
      arrivalDate.getMonth() + 1,
      arrivalDate.getDate(),
      arrivalDate.getHours(),
      arrivalDate.getMinutes()
    ],
    title: `✈️ ${flight.airline} ${flight.flightNumber} to ${flight.to.city}`,
    description: `
Flight: ${flight.flightNumber}
From: ${flight.from.airport} (${flight.from.code})
To: ${flight.to.airport} (${flight.to.code})
Booking Reference: ${flight.bookingRef}

Check-in opens 24 hours before departure.
Arrive at airport 3 hours before international flights.
    `.trim(),
    location: `${flight.from.airport} → ${flight.to.airport}`,
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
    organizer: { name: 'Fly2Any Travel', email: 'fly2any.travel@gmail.com' },
    alarms: [
      {
        action: 'display',
        description: 'Flight reminder - Check-in now!',
        trigger: { hours: 24, before: true }
      },
      {
        action: 'display',
        description: 'Flight departure in 3 hours',
        trigger: { hours: 3, before: true }
      }
    ]
  };

  const { error, value } = createEvent(event);

  if (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }

  return value;
}

export function downloadICS(icsContent: string, filename: string) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
```

### Update BookingConfirmationContent.tsx
```typescript
import { generateFlightICS, downloadICS } from '@/lib/utils/calendar';

// Inside the component, replace the handleAddToCalendar function:

const handleAddToCalendar = (type: 'google' | 'apple' | 'outlook') => {
  if (!displayBookingData) return;

  // Generate ICS file
  const icsContent = generateFlightICS({
    bookingRef: displayBookingData.bookingRef,
    airline: displayBookingData.outboundFlight.airline,
    flightNumber: displayBookingData.outboundFlight.flightNumber,
    from: displayBookingData.outboundFlight.from,
    to: displayBookingData.outboundFlight.to,
    departure: displayBookingData.outboundFlight.departure,
    arrival: displayBookingData.outboundFlight.arrival,
  });

  if (!icsContent) {
    alert('Failed to generate calendar event');
    return;
  }

  if (type === 'google') {
    // Google Calendar web URL
    const startTime = new Date(displayBookingData.outboundFlight.departure).toISOString().replace(/-|:|\\.\\d\\d\\d/g, '');
    const endTime = new Date(displayBookingData.outboundFlight.arrival).toISOString().replace(/-|:|\\.\\d\\d\\d/g, '');
    const title = encodeURIComponent(`Flight to ${displayBookingData.outboundFlight.to.city}`);
    const details = encodeURIComponent(`Booking: ${displayBookingData.bookingRef}`);
    const location = encodeURIComponent(`${displayBookingData.outboundFlight.from.airport}`);

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
    window.open(googleUrl, '_blank');
  } else {
    // Download ICS file for Apple Calendar and Outlook
    const filename = `flight-${displayBookingData.bookingRef}.ics`;
    downloadICS(icsContent, filename);
  }

  setShowCalendarMenu(false);
};
```

---

## 2. PDF Generation

### Option A: Client-Side (jsPDF + html2canvas)

#### Install Dependencies
```bash
npm install jspdf html2canvas
```

#### Create PDF Utility
**File:** `lib/utils/pdf.ts`
```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateBookingPDF(elementId: string, filename: string) {
  try {
    // Get the element to convert
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Hide elements that shouldn't be in PDF
    const noPrintElements = element.querySelectorAll('.no-print');
    noPrintElements.forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });

    // Capture element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    // Restore hidden elements
    noPrintElements.forEach((el) => {
      (el as HTMLElement).style.display = '';
    });

    // Create PDF
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const heightLeft = imgHeight;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    let heightLeftVar = heightLeft - pageHeight;

    while (heightLeftVar >= 0) {
      position = heightLeftVar - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeftVar -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
```

#### Update BookingConfirmationContent.tsx
```typescript
import { generateBookingPDF } from '@/lib/utils/pdf';

// Add ID to main container
<div id="booking-confirmation" className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 print:bg-white">
  {/* ... rest of content */}
</div>

// Update handler
const handleDownloadPDF = async () => {
  try {
    const filename = `booking-${displayBookingData.bookingRef}.pdf`;
    await generateBookingPDF('booking-confirmation', filename);
  } catch (error) {
    alert('Failed to generate PDF. Please try printing instead.');
  }
};
```

### Option B: Server-Side (Puppeteer)

#### Install Dependencies
```bash
npm install puppeteer
```

#### Create API Endpoint
**File:** `app/api/bookings/pdf/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Navigate to confirmation page
    const confirmationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/flights/booking/confirmation?bookingId=${bookingId}`;
    await page.goto(confirmationUrl, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    await browser.close();

    // Return PDF
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="booking-${bookingId}.pdf"`
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
```

#### Update Component
```typescript
const handleDownloadPDF = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/bookings/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: bookingData.id })
    });

    if (!response.ok) throw new Error('PDF generation failed');

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `booking-${displayBookingData.bookingRef}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    alert('Failed to generate PDF');
  } finally {
    setLoading(false);
  }
};
```

---

## 3. QR Code Generation

### Install Dependencies
```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

### Create QR Code Component
**File:** `components/booking/QRCodeDisplay.tsx`
```typescript
'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  data: string;
  size?: number;
  className?: string;
}

export default function QRCodeDisplay({ data, size = 200, className = '' }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, data, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) console.error('QR Code generation error:', error);
      });
    }
  }, [data, size]);

  return <canvas ref={canvasRef} className={className} />;
}
```

### Update BookingConfirmationContent.tsx
```typescript
import QRCodeDisplay from '@/components/booking/QRCodeDisplay';

// Replace QR code placeholder section:
<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 print:hidden">
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0">
      <QRCodeDisplay
        data={`FLY2ANY:${displayBookingData.bookingRef}`}
        size={120}
        className="rounded-xl bg-white p-2"
      />
    </div>
    <div>
      <h3 className="font-bold text-gray-900 mb-2">Mobile Boarding Pass</h3>
      <p className="text-sm text-gray-600 mb-3">
        Scan this QR code at airport kiosks for quick check-in.
        Save it to your phone for offline access.
      </p>
      <button
        onClick={() => {
          // Download QR code as image
          const canvas = document.querySelector('canvas');
          if (canvas) {
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `qr-${displayBookingData.bookingRef}.png`;
            link.href = url;
            link.click();
          }
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
      >
        Download QR Code
      </button>
    </div>
  </div>
</div>
```

---

## 4. Email Confirmation

### Install Dependencies
```bash
npm install resend
```

### Create Email Template
**File:** `lib/email/templates/booking-confirmation.tsx`
```tsx
interface BookingConfirmationEmailProps {
  bookingRef: string;
  passengerName: string;
  flightDetails: {
    from: string;
    to: string;
    departure: string;
    arrival: string;
    airline: string;
    flightNumber: string;
  };
  totalPrice: string;
}

export const BookingConfirmationEmail = ({
  bookingRef,
  passengerName,
  flightDetails,
  totalPrice
}: BookingConfirmationEmailProps) => {
  return (
    <html>
      <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <div style={{ backgroundColor: '#10b981', color: 'white', padding: '20px', borderRadius: '8px 8px 0 0' }}>
            <h1 style={{ margin: 0 }}>✈️ Booking Confirmed!</h1>
          </div>

          <div style={{ backgroundColor: '#f9fafb', padding: '20px', border: '1px solid #e5e7eb' }}>
            <p>Dear {passengerName},</p>

            <p>Your flight has been successfully booked!</p>

            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
              <h2 style={{ fontSize: '18px', marginTop: 0 }}>Booking Reference</h2>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>{bookingRef}</p>
            </div>

            <h2 style={{ fontSize: '18px' }}>Flight Details</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}><strong>From:</strong></td>
                <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{flightDetails.from}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}><strong>To:</strong></td>
                <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{flightDetails.to}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}><strong>Departure:</strong></td>
                <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{flightDetails.departure}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}><strong>Arrival:</strong></td>
                <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{flightDetails.arrival}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}><strong>Flight:</strong></td>
                <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{flightDetails.airline} {flightDetails.flightNumber}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}><strong>Total:</strong></td>
                <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', color: '#10b981' }}>{totalPrice}</td>
              </tr>
            </table>

            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>📋 Next Steps</h3>
              <ol style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Online check-in opens 24 hours before departure</li>
                <li>Arrive at airport 3 hours before international flights</li>
                <li>Have your passport and booking reference ready</li>
              </ol>
            </div>

            <p style={{ textAlign: 'center', margin: '30px 0' }}>
              <a href={`https://fly2any.com/flights/booking/confirmation?ref=${bookingRef}`}
                 style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 30px', textDecoration: 'none', borderRadius: '8px', display: 'inline-block' }}>
                View Full Confirmation
              </a>
            </p>
          </div>

          <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
            <p>Need help? Contact us at <a href="mailto:fly2any.travel@gmail.com">fly2any.travel@gmail.com</a></p>
            <p>© 2025 Fly2Any Travel - Based in USA</p>
          </div>
        </div>
      </body>
    </html>
  );
};
```

### Create Email API Endpoint
**File:** `app/api/bookings/send-confirmation/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { BookingConfirmationEmail } from '@/lib/email/templates/booking-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { bookingId, email } = await request.json();

    // Fetch booking data
    const bookingResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/bookings/${bookingId}`);
    const bookingResult = await bookingResponse.json();

    if (!bookingResult.success) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookingResult.booking;

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'Fly2Any Travel <bookings@fly2any.com>',
      to: email,
      subject: `✈️ Booking Confirmed - ${booking.bookingReference}`,
      react: BookingConfirmationEmail({
        bookingRef: booking.bookingReference,
        passengerName: `${booking.passengers[0].firstName} ${booking.passengers[0].lastName}`,
        flightDetails: {
          from: booking.flight.segments[0].departure.iataCode,
          to: booking.flight.segments[0].arrival.iataCode,
          departure: new Date(booking.flight.segments[0].departure.at).toLocaleString(),
          arrival: new Date(booking.flight.segments[0].arrival.at).toLocaleString(),
          airline: booking.flight.segments[0].carrierCode,
          flightNumber: booking.flight.segments[0].flightNumber,
        },
        totalPrice: `${booking.payment.currency} ${booking.payment.amount}`
      })
    });

    if (error) {
      console.error('Email send error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Update Environment Variables
**.env.local**
```
RESEND_API_KEY=re_your_api_key_here
```

### Trigger Email After Booking
**File:** `app/api/flights/booking/create/route.ts`
```typescript
// After successful booking creation, send email:

// Send confirmation email
try {
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/bookings/send-confirmation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingId: booking.id,
      email: passengers[0].email
    })
  });
} catch (emailError) {
  console.error('Failed to send confirmation email:', emailError);
  // Don't fail the booking if email fails
}
```

---

## 5. Social Sharing

### Update BookingConfirmationContent.tsx
```typescript
const handleShare = async (platform: 'twitter' | 'facebook' | 'whatsapp' | 'native') => {
  const shareData = {
    title: '✈️ Flight Booked!',
    text: `I'm flying from ${displayBookingData.outboundFlight.from.code} to ${displayBookingData.outboundFlight.to.code} with Fly2Any!`,
    url: window.location.href
  };

  switch (platform) {
    case 'twitter':
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
        '_blank'
      );
      break;

    case 'facebook':
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
        '_blank'
      );
      break;

    case 'whatsapp':
      window.open(
        `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`,
        '_blank'
      );
      break;

    case 'native':
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.log('Share cancelled or failed');
        }
      } else {
        alert('Sharing is not supported on this browser');
      }
      break;
  }
};

// Update the share button:
<button
  onClick={() => handleShare('native')}
  className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 text-center transition-all hover:shadow-md"
>
  <svg className="w-6 h-6 mx-auto mb-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
  <span className="text-sm font-semibold text-gray-700">Share Trip</span>
</button>
```

---

## Testing Checklist

### Calendar Export
- [ ] Download ICS file works
- [ ] Google Calendar opens correctly
- [ ] Apple Calendar imports successfully
- [ ] Outlook imports successfully
- [ ] Event details are correct
- [ ] Reminders are set properly

### PDF Generation
- [ ] PDF downloads successfully
- [ ] All content is visible
- [ ] Formatting is correct
- [ ] No UI elements (buttons) in PDF
- [ ] Multi-page support works
- [ ] Print styles applied correctly

### QR Code
- [ ] QR code generates correctly
- [ ] Scannable with mobile apps
- [ ] Contains correct booking reference
- [ ] Downloads as PNG
- [ ] Looks good on different sizes

### Email
- [ ] Email sends successfully
- [ ] Correct recipient
- [ ] All booking details included
- [ ] Links work correctly
- [ ] Mobile responsive
- [ ] Spam score is good

### Social Sharing
- [ ] Twitter share works
- [ ] Facebook share works
- [ ] WhatsApp share works
- [ ] Native share works on mobile
- [ ] Correct text and URL

---

## Deployment Notes

### Environment Variables Needed
```
RESEND_API_KEY=re_your_key_here
NEXT_PUBLIC_BASE_URL=https://fly2any.com
```

### Package Dependencies
```json
{
  "dependencies": {
    "ics": "^3.7.0",
    "qrcode": "^1.5.3",
    "resend": "^3.2.0",
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1"
  },
  "devDependencies": {
    "@types/qrcode": "^1.5.5"
  }
}
```

### Build Command
```bash
npm install
npm run build
```

---

## Implementation Priority

1. **High Priority** (User expects these):
   - ✅ Calendar export (ICS file)
   - ✅ Email confirmation

2. **Medium Priority** (Nice to have):
   - ✅ PDF download
   - ✅ QR code

3. **Low Priority** (Optional):
   - Social sharing
   - Advanced features

---

## Estimated Implementation Time

| Feature | Time Required | Complexity |
|---------|--------------|------------|
| Calendar Export | 1-2 hours | Low |
| PDF Generation | 2-3 hours | Medium |
| QR Code | 30 minutes | Low |
| Email Service | 1-2 hours | Low-Medium |
| Social Sharing | 30 minutes | Low |
| **Total** | **5-8 hours** | **Low-Medium** |

---

## Support & Resources

- **ICS Library:** https://github.com/adamgibbons/ics
- **QRCode:** https://github.com/soldair/node-qrcode
- **Resend:** https://resend.com/docs
- **jsPDF:** https://artskydj.github.io/jsPDF/docs/
- **html2canvas:** https://html2canvas.hertzen.com/

---

**Ready to implement?** Choose the features you want and follow the step-by-step guides above!
