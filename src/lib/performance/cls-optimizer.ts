/**
 * Cumulative Layout Shift (CLS) Optimizer
 * Prevents layout shifts to improve Core Web Vitals
 * Target: CLS < 0.1 for excellent score
 */

export interface CLSMetrics {
  value: number;
  sources: LayoutShiftAttribution[];
  timestamp: Date;
  page: string;
}

export interface LayoutShiftAttribution {
  element?: Element;
  currentRect?: DOMRectReadOnly;
  previousRect?: DOMRectReadOnly;
}

export class CLSOptimizer {
  private static instance: CLSOptimizer;
  private metrics: CLSMetrics[] = [];
  private observer: PerformanceObserver | null = null;
  private isInitialized = false;
  private problematicElements: WeakSet<Element> = new WeakSet();

  static getInstance(): CLSOptimizer {
    if (!CLSOptimizer.instance) {
      CLSOptimizer.instance = new CLSOptimizer();
    }
    return CLSOptimizer.instance;
  }

  /**
   * Initialize CLS optimization
   */
  public initialize(): void {
    if (typeof window === 'undefined' || this.isInitialized) return;
    this.isInitialized = true;

    // 1. Monitor layout shifts
    this.monitorLayoutShifts();
    
    // 2. Prevent image layout shifts
    this.preventImageLayoutShifts();
    
    // 3. Prevent font layout shifts
    this.preventFontLayoutShifts();
    
    // 4. Reserve space for dynamic content
    this.reserveSpaceForDynamicContent();
    
    // 5. Fix third-party content shifts
    this.fixThirdPartyContentShifts();
    
    // 6. Optimize ad loading
    this.optimizeAdLoading();

    console.log('📏 CLS Optimizer initialized');
  }

  /**
   * Monitor layout shifts in real-time
   */
  private monitorLayoutShifts(): void {
    if (!PerformanceObserver) return;

    this.observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
          this.recordLayoutShift(entry);
        }
      });
    });

    this.observer.observe({ type: 'layout-shift', buffered: true });
  }

  private recordLayoutShift(entry: any): void {
    const metric: CLSMetrics = {
      value: entry.value,
      sources: entry.sources || [],
      timestamp: new Date(),
      page: window.location.pathname
    };

    this.metrics.push(metric);
    
    // Analyze problematic elements
    this.analyzeLayoutShiftSources(entry.sources);
    
    // Report significant layout shifts
    if (entry.value > 0.05) {
      this.reportLayoutShift(metric);
    }
  }

  private analyzeLayoutShiftSources(sources: LayoutShiftAttribution[]): void {
    sources.forEach(source => {
      if (source.element) {
        this.problematicElements.add(source.element);
        this.analyzeElement(source.element, source);
      }
    });
  }

  private analyzeElement(element: Element, source: LayoutShiftAttribution): void {
    const tagName = element.tagName.toLowerCase();
    
    // Identify common CLS causes
    if (tagName === 'img' && !element.hasAttribute('width') && !element.hasAttribute('height')) {
      this.fixImageElement(element as HTMLImageElement);
    } else if (tagName === 'iframe' && !element.hasAttribute('width') && !element.hasAttribute('height')) {
      this.fixIframeElement(element as HTMLIFrameElement);
    } else if (element.classList.contains('advertisement') || element.querySelector('[data-ad]')) {
      this.isAdElement(element);
    }
    
    // Log for debugging
    console.warn('Layout shift detected:', {
      element: element.tagName,
      classes: element.className,
      shift: source.currentRect,
      previous: source.previousRect
    });
  }

  private reportLayoutShift(metric: CLSMetrics): void {
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'layout_shift', {
        'cls_value': metric.value,
        'page_path': metric.page,
        'event_category': 'performance'
      });
    }
  }

  /**
   * Prevent image-related layout shifts
   */
  private preventImageLayoutShifts(): void {
    // Fix existing images
    this.fixExistingImages();
    
    // Monitor new images
    this.observeNewImages();
    
    // Add global image loading handler
    this.addImageLoadingHandler();
  }

  private fixExistingImages(): void {
    document.querySelectorAll('img').forEach(img => {
      this.fixImageElement(img);
    });
  }

  private fixImageElement(img: HTMLImageElement): void {
    // Skip if already has dimensions
    if (img.hasAttribute('width') && img.hasAttribute('height')) return;
    
    // Add aspect ratio if not present
    if (!img.style.aspectRatio && !img.style.minHeight) {
      // Default aspect ratio for unknown images
      img.style.aspectRatio = '16 / 9';
      img.style.width = '100%';
      img.style.height = 'auto';
    }

    // Add loading placeholder
    if (!img.complete && !img.src.startsWith('data:')) {
      this.addImagePlaceholder(img);
    }

    // Handle load event
    img.addEventListener('load', () => {
      this.handleImageLoad(img);
    }, { once: true });

    // Handle error event
    img.addEventListener('error', () => {
      this.handleImageError(img);
    }, { once: true });
  }

  private addImagePlaceholder(img: HTMLImageElement): void {
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.style.cssText = `
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
      width: 100%;
      aspect-ratio: 16 / 9;
      border-radius: 4px;
    `;

    // Add skeleton animation
    this.addSkeletonAnimation();

    // Replace image with placeholder temporarily
    img.style.display = 'none';
    img.parentNode?.insertBefore(placeholder, img);

    // Remove placeholder when image loads
    img.addEventListener('load', () => {
      placeholder.remove();
      img.style.display = '';
    }, { once: true });
  }

  private addSkeletonAnimation(): void {
    if (document.getElementById('skeleton-styles')) return;

    const style = document.createElement('style');
    style.id = 'skeleton-styles';
    style.textContent = `
      @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
  }

  private handleImageLoad(img: HTMLImageElement): void {
    // Set actual aspect ratio
    if (img.naturalWidth && img.naturalHeight && !img.hasAttribute('width')) {
      img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
    }
  }

  private handleImageError(img: HTMLImageElement): void {
    // Set minimum height to prevent collapse
    img.style.minHeight = '100px';
    img.style.backgroundColor = '#f3f4f6';
    img.style.display = 'flex';
    img.style.alignItems = 'center';
    img.style.justifyContent = 'center';
  }

  private observeNewImages(): void {
    if (!MutationObserver) return;

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if it's an image
            if (element.tagName === 'IMG') {
              this.fixImageElement(element as HTMLImageElement);
            }
            
            // Check for images in added subtree
            element.querySelectorAll?.('img').forEach(img => {
              this.fixImageElement(img);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private addImageLoadingHandler(): void {
    // Use event delegation for better performance
    document.addEventListener('error', (e) => {
      if (e.target instanceof HTMLImageElement) {
        this.handleImageError(e.target);
      }
    }, true);

    document.addEventListener('load', (e) => {
      if (e.target instanceof HTMLImageElement) {
        this.handleImageLoad(e.target);
      }
    }, true);
  }

  /**
   * Prevent font-related layout shifts
   */
  private preventFontLayoutShifts(): void {
    // Add font-display: swap to all fonts
    this.addFontDisplaySwap();
    
    // Preload critical fonts
    this.preloadCriticalFonts();
    
    // Add font fallbacks
    this.addFontFallbacks();
  }

  private addFontDisplaySwap(): void {
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
        src: local('Inter');
      }
      @font-face {
        font-family: 'Poppins';
        font-display: swap;
        src: local('Poppins');
      }
      /* Ensure all Google Fonts use font-display: swap */
      @import url('https://fonts.googleapis.com/css2?display=swap');
    `;
    document.head.appendChild(style);
  }

  private preloadCriticalFonts(): void {
    const criticalFonts = [
      {
        family: 'Inter',
        weight: '400',
        url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
      },
      {
        family: 'Poppins',
        weight: '600',
        url: 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLEj6Z1xlFQ.woff2'
      }
    ];

    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = font.url;
      document.head.appendChild(link);
    });
  }

  private addFontFallbacks(): void {
    const style = document.createElement('style');
    style.textContent = `
      body {
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .font-heading {
        font-family: 'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      /* Ensure consistent metrics between fallback and web fonts */
      .font-loading body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Reserve space for dynamic content
   */
  private reserveSpaceForDynamicContent(): void {
    // Reserve space for common dynamic elements
    this.reserveSpaceForElements();
    
    // Monitor dynamic content insertion
    this.monitorDynamicContent();
  }

  private reserveSpaceForElements(): void {
    const elementsToReserve = [
      { selector: '[data-dynamic-content]', minHeight: '100px' },
      { selector: '.loading-container', minHeight: '200px' },
      { selector: '.notification-area', minHeight: '60px' },
      { selector: '.modal-backdrop', minHeight: '0px' }
    ];

    elementsToReserve.forEach(({ selector, minHeight }) => {
      document.querySelectorAll(selector).forEach((element) => {
        const htmlElement = element as HTMLElement;
        if (!htmlElement.style.minHeight) {
          htmlElement.style.minHeight = minHeight;
        }
      });
    });
  }

  private monitorDynamicContent(): void {
    if (!MutationObserver) return;

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              this.handleDynamicElement(element);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private handleDynamicElement(element: HTMLElement): void {
    // Check if it's an element that might cause layout shift
    const potentialShiftElements = ['div', 'section', 'article', 'aside'];
    
    if (potentialShiftElements.includes(element.tagName.toLowerCase())) {
      // Add transition to prevent sudden appearance
      element.style.transition = 'all 0.3s ease';
      element.style.opacity = '0';
      
      // Fade in after a frame
      requestAnimationFrame(() => {
        element.style.opacity = '1';
      });
    }
  }

  /**
   * Fix third-party content shifts
   */
  private fixThirdPartyContentShifts(): void {
    // Fix embeds
    this.fixEmbeds();
    
    // Fix social media widgets
    this.fixSocialWidgets();
    
    // Fix comment systems
    this.fixCommentSystems();
  }

  private fixEmbeds(): void {
    const embedSelectors = [
      'iframe[src*="youtube"]',
      'iframe[src*="vimeo"]',
      'iframe[src*="twitter"]',
      'iframe[src*="facebook"]',
      'iframe[src*="instagram"]'
    ];

    embedSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach((element) => {
        this.fixIframeElement(element as HTMLIFrameElement);
      });
    });
  }

  private fixIframeElement(iframe: HTMLIFrameElement): void {
    if (!iframe.hasAttribute('width') && !iframe.hasAttribute('height')) {
      // Set default aspect ratio for video embeds
      if (iframe.src.includes('youtube') || iframe.src.includes('vimeo')) {
        iframe.style.aspectRatio = '16 / 9';
        iframe.style.width = '100%';
        iframe.style.height = 'auto';
      } else {
        // Default size for other iframes
        iframe.style.minHeight = '300px';
        iframe.style.width = '100%';
      }
    }
  }

  private fixSocialWidgets(): void {
    // Reserve space for common social widgets
    const socialSelectors = [
      '.twitter-tweet',
      '.fb-post',
      '.instagram-media',
      '[data-social-widget]'
    ];

    socialSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach((element) => {
        const htmlElement = element as HTMLElement;
        if (!htmlElement.style.minHeight) {
          htmlElement.style.minHeight = '200px';
        }
      });
    });
  }

  private fixCommentSystems(): void {
    const commentSelectors = [
      '#disqus_thread',
      '.fb-comments',
      '[data-comments]'
    ];

    commentSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach((element) => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.minHeight = '300px';
      });
    });
  }

  /**
   * Optimize ad loading to prevent CLS
   */
  private optimizeAdLoading(): void {
    // Reserve space for ad slots
    this.reserveAdSpace();
    
    // Monitor ad loading
    this.monitorAdLoading();
  }

  private reserveAdSpace(): void {
    const adSelectors = [
      '.advertisement',
      '[data-ad-slot]',
      '.google-ad',
      '.ad-banner'
    ];

    adSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach((element) => {
        const ad = element as HTMLElement;
        // Set standard ad sizes
        if (!ad.style.height) {
          ad.style.minHeight = '250px'; // Standard medium rectangle
          ad.style.background = '#f3f4f6';
          ad.style.display = 'flex';
          ad.style.alignItems = 'center';
          ad.style.justifyContent = 'center';
          ad.textContent = ad.textContent || 'Advertisement';
        }
      });
    });
  }

  private monitorAdLoading(): void {
    // Monitor for ad script loading
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if it's an ad-related element
            if (this.isAdElement(element)) {
              this.handleAdElement(element as HTMLElement);
            }
          }
        });
      });
    });

    observer.observe(document.head, { childList: true });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  private isAdElement(element: Element): boolean {
    const adSelectors = ['ins', 'div'];
    const adClasses = ['adsbygoogle', 'advertisement', 'ad-banner'];
    const adAttributes = ['data-ad-client', 'data-ad-slot'];

    return adSelectors.includes(element.tagName.toLowerCase()) &&
           (adClasses.some(cls => element.classList.contains(cls)) ||
            adAttributes.some(attr => element.hasAttribute(attr)));
  }

  private handleAdElement(element: HTMLElement): void {
    // Ensure ad container has reserved space
    if (!element.style.height && !element.style.minHeight) {
      element.style.minHeight = '250px';
    }
  }

  /**
   * Public API
   */
  public getCurrentCLS(): number {
    return this.metrics.reduce((sum, metric) => sum + metric.value, 0);
  }

  public getProblematicElements(): Element[] {
    // Return array of elements causing CLS (approximation since WeakSet can't be iterated)
    return Array.from(document.querySelectorAll('img:not([width]):not([height]), iframe:not([width]):not([height])'));
  }

  public getCLSReport(): {
    totalCLS: number;
    shiftCount: number;
    grade: string;
    recommendations: string[];
  } {
    const totalCLS = this.getCurrentCLS();
    const shiftCount = this.metrics.length;
    
    let grade = 'A';
    if (totalCLS > 0.1) grade = 'C';
    else if (totalCLS > 0.25) grade = 'F';

    const recommendations = [];
    if (totalCLS > 0.1) {
      recommendations.push('Reduce CLS by fixing image dimensions');
      recommendations.push('Reserve space for dynamic content');
      recommendations.push('Use font-display: swap for web fonts');
    }

    return {
      totalCLS,
      shiftCount,
      grade,
      recommendations
    };
  }

  public fixAllImages(): void {
    document.querySelectorAll('img').forEach(img => {
      this.fixImageElement(img);
    });
  }

  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.metrics = [];
    this.isInitialized = false;
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).clsOptimizer = CLSOptimizer.getInstance();
}

export default CLSOptimizer;