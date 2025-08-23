'use client';

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  lazy?: boolean;
  responsive?: boolean;
  placeholder?: 'blur' | 'skeleton' | 'none';
  priority?: boolean;
}

export class ImageOptimizer {
  private supportedFormats: Set<string> = new Set();
  private imageCache = new Map<string, HTMLImageElement>();
  private intersectionObserver?: IntersectionObserver;

  constructor() {
    if (typeof window !== 'undefined') {
      this.detectSupportedFormats();
      this.initLazyLoading();
    }
  }

  private detectSupportedFormats() {
    const formats = ['webp', 'avif'];
    
    formats.forEach(format => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        const dataUrl = canvas.toDataURL(`image/${format}`, 0.1);
        if (dataUrl.startsWith(`data:image/${format}`)) {
          this.supportedFormats.add(format);
        }
      }
    });
  }

  private initLazyLoading() {
    if (!('IntersectionObserver' in window)) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target as HTMLImageElement);
          }
        });
      },
      { rootMargin: '50px' }
    );
  }

  public optimizeImage(
    src: string, 
    options: ImageOptimizationOptions = {}
  ): string {
    const {
      quality = 85,
      format = 'webp',
      responsive = true
    } = options;

    // Determine best format based on browser support
    const bestFormat = this.getBestFormat(format);
    
    // Build optimized URL
    const params = new URLSearchParams();
    params.set('q', quality.toString());
    params.set('f', bestFormat);
    
    if (responsive) {
      params.set('w', this.getOptimalWidth().toString());
    }

    return `${src}?${params.toString()}`;
  }

  private getBestFormat(preferredFormat: string): string {
    const formatPriority = ['avif', 'webp', 'jpg'];
    
    for (const format of formatPriority) {
      if (this.supportedFormats.has(format)) {
        return format;
      }
    }
    
    return 'jpg';
  }

  private getOptimalWidth(): number {
    const screenWidth = window.innerWidth;
    const dpr = window.devicePixelRatio || 1;
    
    // Progressive image sizing based on device
    if (screenWidth <= 480) return Math.ceil(480 * dpr);
    if (screenWidth <= 768) return Math.ceil(768 * dpr);
    if (screenWidth <= 1024) return Math.ceil(1024 * dpr);
    return Math.ceil(1200 * dpr);
  }

  public createOptimizedImage(
    src: string,
    alt: string,
    options: ImageOptimizationOptions = {}
  ): HTMLImageElement {
    const img = document.createElement('img');
    const {
      lazy = true,
      placeholder = 'skeleton',
      priority = false,
      responsive = true
    } = options;

    img.alt = alt;
    img.loading = priority ? 'eager' : 'lazy';

    // Add responsive attributes
    if (responsive) {
      img.style.width = '100%';
      img.style.height = 'auto';
    }

    // Handle placeholder
    if (placeholder === 'skeleton') {
      img.style.background = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)';
      img.style.backgroundSize = '200% 100%';
      img.style.animation = 'loading 1.5s infinite';
    }

    if (lazy && !priority) {
      img.dataset.src = this.optimizeImage(src, options);
      img.src = this.generatePlaceholder(300, 200); // Low-res placeholder
      this.intersectionObserver?.observe(img);
    } else {
      img.src = this.optimizeImage(src, options);
    }

    // Progressive enhancement for WebP support
    if (this.supportedFormats.has('webp')) {
      const picture = document.createElement('picture');
      
      const webpSource = document.createElement('source');
      webpSource.srcset = this.optimizeImage(src, { ...options, format: 'webp' });
      webpSource.type = 'image/webp';
      
      picture.appendChild(webpSource);
      picture.appendChild(img);
      
      return picture as any; // Return picture element
    }

    return img;
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    if (!src) return;

    // Create a new image to preload
    const loader = new Image();
    
    loader.onload = () => {
      img.src = src;
      img.classList.add('loaded');
      img.style.background = 'none';
      img.style.animation = 'none';
    };

    loader.onerror = () => {
      img.classList.add('error');
    };

    loader.src = src;
    this.intersectionObserver?.unobserve(img);
  }

  private generatePlaceholder(width: number, height: number): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Create a simple gradient placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f0f0f0');
    gradient.addColorStop(1, '#e0e0e0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas.toDataURL('image/jpeg', 0.1);
  }

  // Next.js Image component optimization
  public getNextImageProps(src: string, options: ImageOptimizationOptions = {}) {
    const { responsive = true, priority = false } = options;
    
    return {
      src: this.optimizeImage(src, options),
      alt: '',
      priority,
      sizes: responsive ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : undefined,
      style: {
        width: '100%',
        height: 'auto',
      },
      placeholder: 'blur' as const,
      blurDataURL: this.generatePlaceholder(20, 20),
    };
  }

  // Preload critical images
  public preloadImage(src: string, options: ImageOptimizationOptions = {}) {
    const optimizedSrc = this.optimizeImage(src, options);
    
    if (this.imageCache.has(optimizedSrc)) {
      return Promise.resolve(this.imageCache.get(optimizedSrc)!);
    }

    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.imageCache.set(optimizedSrc, img);
        resolve(img);
      };
      
      img.onerror = reject;
      img.src = optimizedSrc;
    });
  }

  // Batch preload images
  public preloadImages(sources: Array<{ src: string; options?: ImageOptimizationOptions }>) {
    return Promise.allSettled(
      sources.map(({ src, options }) => this.preloadImage(src, options))
    );
  }

  public destroy() {
    this.intersectionObserver?.disconnect();
    this.imageCache.clear();
  }
}

export const imageOptimizer = new ImageOptimizer();