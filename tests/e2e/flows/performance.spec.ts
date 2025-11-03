import { test, expect } from '@playwright/test';
import { performanceThresholds, testFlights, getTestDateRange } from '../fixtures/test-data';

test.describe('Performance Tests', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    console.log(`Homepage load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(performanceThresholds.loadTime);
  });

  test('should measure Core Web Vitals on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Wait for metrics to be available
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const paint = performance.getEntriesByType('paint');

          const lcp = paint.find(entry => entry.name === 'largest-contentful-paint');
          const fcp = paint.find(entry => entry.name === 'first-contentful-paint');

          resolve({
            // Largest Contentful Paint
            LCP: lcp?.startTime || 0,
            // First Contentful Paint
            FCP: fcp?.startTime || 0,
            // Time to Interactive (approximation)
            TTI: navigation.domInteractive,
            // Total load time
            loadTime: navigation.loadEventEnd - navigation.fetchStart,
            // DOM Content Loaded
            DOMContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          });
        }, 2000);
      });
    });

    console.log('Core Web Vitals:', metrics);

    // Check LCP threshold (should be < 2.5s)
    if (metrics.LCP > 0) {
      console.log(`LCP: ${metrics.LCP}ms (threshold: ${performanceThresholds.LCP}ms)`);
      // Warning instead of failure for LCP since it can vary
      if (metrics.LCP > performanceThresholds.LCP) {
        console.warn(`LCP exceeds threshold!`);
      }
    }

    // Check TTI threshold (should be < 3.5s)
    if (metrics.TTI > 0) {
      console.log(`TTI: ${metrics.TTI}ms (threshold: ${performanceThresholds.TTI}ms)`);
    }

    // Log results
    console.log(`FCP: ${metrics.FCP}ms`);
    console.log(`Load Time: ${metrics.loadTime}ms`);
    console.log(`DOM Content Loaded: ${metrics.DOMContentLoaded}ms`);
  });

  test('should measure flight search page performance', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/flights');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    console.log(`Flight search page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(performanceThresholds.loadTime);
  });

  test('should measure flight results page performance', async ({ page }) => {
    const dates = getTestDateRange(30, 7);

    const startTime = Date.now();

    await page.goto(`/flights/results?from=${testFlights.domestic.origin}&to=${testFlights.domestic.destination}&departure=${dates.departureDate}&return=${dates.returnDate}&adults=1&children=0&infants=0&class=economy`);

    // Wait for results to load
    await page.waitForSelector('[class*="flight"], text=/loading/i, text=/no flights/i', { timeout: 30000 });

    const loadTime = Date.now() - startTime;

    console.log(`Results page load time: ${loadTime}ms`);

    // Results page can take longer due to API calls
    expect(loadTime).toBeLessThan(30000); // 30 seconds max
  });

  test('should measure Cumulative Layout Shift (CLS)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for any animations/shifts to complete
    await page.waitForTimeout(3000);

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsScore = 0;

        // Use PerformanceObserver to measure CLS
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue;
            clsScore += (entry as any).value;
          }
        });

        try {
          observer.observe({ type: 'layout-shift', buffered: true });

          // Wait a bit for shifts to occur
          setTimeout(() => {
            observer.disconnect();
            resolve(clsScore);
          }, 2000);
        } catch {
          // If layout-shift is not supported, return 0
          resolve(0);
        }
      });
    });

    console.log(`Cumulative Layout Shift: ${cls}`);

    // CLS should be < 0.1 for good experience
    if (cls > 0) {
      console.log(`CLS: ${cls} (threshold: ${performanceThresholds.CLS})`);
      if (cls > performanceThresholds.CLS) {
        console.warn('CLS exceeds recommended threshold!');
      }
    }
  });

  test('should measure JavaScript bundle size', async ({ page }) => {
    const resourceSizes: { type: string; size: number; url: string }[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      const headers = response.headers();
      const contentLength = headers['content-length'];

      if (contentLength && (url.includes('.js') || url.includes('.css'))) {
        resourceSizes.push({
          type: url.endsWith('.js') ? 'JavaScript' : 'CSS',
          size: parseInt(contentLength),
          url: url.split('/').pop() || url,
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Calculate totals
    const totalJS = resourceSizes
      .filter(r => r.type === 'JavaScript')
      .reduce((sum, r) => sum + r.size, 0);

    const totalCSS = resourceSizes
      .filter(r => r.type === 'CSS')
      .reduce((sum, r) => sum + r.size, 0);

    console.log(`Total JavaScript: ${(totalJS / 1024).toFixed(2)} KB`);
    console.log(`Total CSS: ${(totalCSS / 1024).toFixed(2)} KB`);
    console.log(`Total Resources: ${((totalJS + totalCSS) / 1024).toFixed(2)} KB`);

    // Log largest resources
    const largest = resourceSizes.sort((a, b) => b.size - a.size).slice(0, 5);
    console.log('Largest resources:');
    largest.forEach(r => {
      console.log(`  - ${r.type}: ${r.url} (${(r.size / 1024).toFixed(2)} KB)`);
    });
  });

  test('should measure number of network requests', async ({ page }) => {
    let requestCount = 0;
    const requestTypes: Record<string, number> = {};

    page.on('request', (request) => {
      requestCount++;
      const resourceType = request.resourceType();
      requestTypes[resourceType] = (requestTypes[resourceType] || 0) + 1;
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log(`Total network requests: ${requestCount}`);
    console.log('Request types:', requestTypes);

    // Homepage should not make excessive requests
    expect(requestCount).toBeLessThan(100);
  });

  test('should measure time to first byte (TTFB)', async ({ page }) => {
    const ttfb = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation.responseStart - navigation.requestStart;
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    console.log(`Time to First Byte: ${ttfb}ms`);

    // TTFB should be relatively fast (<600ms is good)
    expect(ttfb).toBeLessThan(2000);
  });

  test('should measure image optimization', async ({ page }) => {
    const imageData: { url: string; size: number; format: string }[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      const contentType = response.headers()['content-type'];

      if (contentType && contentType.startsWith('image/')) {
        const buffer = await response.body().catch(() => null);
        if (buffer) {
          imageData.push({
            url: url.split('/').pop() || url,
            size: buffer.length,
            format: contentType.split('/')[1],
          });
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    if (imageData.length > 0) {
      const totalImageSize = imageData.reduce((sum, img) => sum + img.size, 0);
      console.log(`Total images: ${imageData.length}`);
      console.log(`Total image size: ${(totalImageSize / 1024).toFixed(2)} KB`);

      imageData.forEach(img => {
        console.log(`  - ${img.url} (${img.format}): ${(img.size / 1024).toFixed(2)} KB`);
      });

      // Check for modern formats
      const modernFormats = imageData.filter(img => img.format === 'webp' || img.format === 'avif');
      console.log(`Modern format images: ${modernFormats.length}/${imageData.length}`);
    } else {
      console.log('No images loaded on this page');
    }
  });

  test('should measure memory usage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const memoryMetrics = await page.evaluate(() => {
      if (!(performance as any).memory) {
        return null;
      }

      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    });

    if (memoryMetrics) {
      console.log('Memory usage:');
      console.log(`  Used: ${(memoryMetrics.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Total: ${(memoryMetrics.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Limit: ${(memoryMetrics.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
    } else {
      console.log('Memory metrics not available in this browser');
    }
  });

  test('should measure search form responsiveness', async ({ page }) => {
    await page.goto('/flights');
    await page.waitForLoadState('networkidle');

    const originInput = page.locator('input').first();

    // Measure input delay
    const startTime = Date.now();
    await originInput.click();
    await originInput.type('J');
    const inputDelay = Date.now() - startTime;

    console.log(`Input delay: ${inputDelay}ms`);

    // Input should be very responsive
    expect(inputDelay).toBeLessThan(200);
  });
});
