/**
 * Image Sharing Utilities
 * Capture flight cards as images for sharing on social media
 */

import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

/**
 * Capture an HTML element as an image
 */
export async function captureElementAsImage(
  element: HTMLElement,
  options?: {
    backgroundColor?: string;
    scale?: number;
    quality?: number;
  }
): Promise<Blob | null> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: options?.backgroundColor || '#ffffff',
      scale: options?.scale || 2, // Higher quality
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/png',
        options?.quality || 0.95
      );
    });
  } catch (error) {
    console.error('Failed to capture element as image:', error);
    return null;
  }
}

/**
 * Generate QR code as data URL
 */
export async function generateQRCode(
  url: string,
  size: number = 200
): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    return '';
  }
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Share image using native share API (mobile)
 */
export async function shareImage(
  blob: Blob,
  title: string,
  text: string,
  url: string
): Promise<boolean> {
  try {
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], 'flight-deal.png', { type: 'image/png' });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          text,
          url,
          files: [file],
        });
        return true;
      }
    }

    // Fallback: download image
    downloadBlob(blob, `flight-deal-${Date.now()}.png`);
    return true;
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Failed to share image:', error);
    }
    return false;
  }
}

/**
 * Create a canvas with flight card + QR code at bottom
 */
export async function createSharableFlightImage(
  flightCardElement: HTMLElement,
  shareUrl: string
): Promise<Blob | null> {
  try {
    console.log('📸 Starting image capture...', {
      elementHeight: flightCardElement.offsetHeight,
      elementWidth: flightCardElement.offsetWidth,
      shareUrl: shareUrl.substring(0, 50)
    });

    // Capture the flight card
    const flightCardCanvas = await html2canvas(flightCardElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      foreignObjectRendering: false,
    });

    console.log('✅ Flight card captured:', {
      canvasWidth: flightCardCanvas.width,
      canvasHeight: flightCardCanvas.height
    });

    // Generate QR code
    const qrCodeDataUrl = await generateQRCode(shareUrl, 150);
    console.log('✅ QR code generated');

    // Create final canvas with flight card + QR code
    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');

    if (!ctx) return null;

    // Set canvas dimensions (flight card + QR code section)
    const padding = 40;
    const qrSize = 150;
    const qrSection = qrSize + padding * 2;

    finalCanvas.width = flightCardCanvas.width;
    finalCanvas.height = flightCardCanvas.height + qrSection * 2; // Scale for retina

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // Draw flight card
    ctx.drawImage(flightCardCanvas, 0, 0);

    // Draw QR code section background
    const qrSectionY = flightCardCanvas.height;
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, qrSectionY, finalCanvas.width, qrSection * 2);

    // Draw QR code
    if (qrCodeDataUrl) {
      const qrImage = new Image();
      await new Promise<void>((resolve) => {
        qrImage.onload = () => {
          const qrX = (finalCanvas.width - qrSize * 2) / 2;
          const qrY = qrSectionY + padding * 2;
          ctx.drawImage(qrImage, qrX, qrY, qrSize * 2, qrSize * 2);
          resolve();
        };
        qrImage.src = qrCodeDataUrl;
      });
    }

    // Add text below QR code
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scan to Book', finalCanvas.width / 2, qrSectionY + qrSize * 2 + padding * 3);

    ctx.fillStyle = '#6b7280';
    ctx.font = '22px system-ui, -apple-system, sans-serif';
    ctx.fillText('Powered by Fly2Any', finalCanvas.width / 2, qrSectionY + qrSize * 2 + padding * 4 + 20);

    // Convert to blob
    return new Promise((resolve) => {
      finalCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('✅ Final image created:', {
              size: blob.size,
              type: blob.type
            });
          } else {
            console.error('❌ Failed to create blob from canvas');
          }
          resolve(blob);
        },
        'image/png',
        0.95
      );
    });
  } catch (error) {
    console.error('❌ Failed to create sharable image:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return null;
  }
}

/**
 * Capture flight card and share/download
 */
export async function captureAndShareFlightCard(
  flightCardElement: HTMLElement,
  shareUrl: string,
  flightRoute: string
): Promise<{ success: boolean; method: 'shared' | 'downloaded' | 'failed' }> {
  try {
    // Create sharable image with QR code
    const imageBlob = await createSharableFlightImage(flightCardElement, shareUrl);

    if (!imageBlob) {
      return { success: false, method: 'failed' };
    }

    // Try native share first (mobile)
    const shared = await shareImage(
      imageBlob,
      `Flight Deal: ${flightRoute}`,
      `Check out this amazing flight deal!`,
      shareUrl
    );

    return {
      success: true,
      method: shared ? 'shared' : 'downloaded',
    };
  } catch (error) {
    console.error('Failed to capture and share:', error);
    return { success: false, method: 'failed' };
  }
}
