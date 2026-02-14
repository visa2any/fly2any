import { useCallback } from 'react';

interface ProcessOptions {
  maxWidth?: number;
  quality?: number; // 0 to 1
  watermarkUrl?: string;
}

export function useImageProcessor() {
  const processImage = useCallback(async (file: File, options: ProcessOptions = {}): Promise<File> => {
    const {
      maxWidth = 1920,
      quality = 0.8,
      watermarkUrl = '/logo.png' 
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = async () => {
        // 1. Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // 2. Setup Canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas context not available'));
          return;
        }

        // 3. Draw Base Image with "Magic Pop" Filters
        // Slight contrast and saturation boost for "Professional" look
        ctx.filter = 'contrast(1.1) saturate(1.1) brightness(1.05)';
        ctx.drawImage(img, 0, 0, width, height);
        ctx.filter = 'none'; // Reset filter for watermark

        // 4. Draw Watermark
        if (watermarkUrl) {
            try {
                const watermark = new Image();
                watermark.crossOrigin = 'anonymous'; // If serving from CDN
                watermark.src = watermarkUrl;
                
                await new Promise((r) => { watermark.onload = r; watermark.onerror = r; });
                
                if (watermark.width > 0) {
                    // Size watermark to 15% of image width
                    const wmWidth = width * 0.15;
                    const wmHeight = (watermark.height / watermark.width) * wmWidth;
                    
                    // Position: Bottom Right with padding
                    const padding = width * 0.02;
                    const x = width - wmWidth - padding;
                    const y = height - wmHeight - padding;
                    
                    ctx.globalAlpha = 0.8; // 80% opacity
                    ctx.drawImage(watermark, x, y, wmWidth, wmHeight);
                    ctx.globalAlpha = 1.0;
                }
            } catch (e) {
                console.warn('Watermark failed to load', e);
                // Continue without watermark
            }
        }

        // 5. Export as WebP
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) {
              reject(new Error('Blob creation failed'));
              return;
            }
            // Create new File object
            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(newFile);
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image load failed'));
      };

      img.src = url;
    });
  }, []);

  return { processImage };
}
