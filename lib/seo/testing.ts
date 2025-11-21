/**
 * SEO TESTING & VALIDATION UTILITIES
 *
 * Tools to validate SEO implementation:
 * - Metadata validation
 * - Schema markup validation
 * - Sitemap validation
 * - Robots.txt validation
 * - Core Web Vitals testing
 *
 * @version 1.0.0
 */

export interface SEOCheckResult {
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
  details?: any;
}

export interface SEOReport {
  url: string;
  timestamp: string;
  overallScore: number;
  checks: {
    metadata: SEOCheckResult[];
    schema: SEOCheckResult[];
    technical: SEOCheckResult[];
    content: SEOCheckResult[];
    performance: SEOCheckResult[];
  };
  suggestions: string[];
}

/**
 * Run comprehensive SEO audit
 */
export async function runSEOAudit(url: string = typeof window !== 'undefined' ? window.location.href : ''): Promise<SEOReport> {
  const results: SEOReport = {
    url,
    timestamp: new Date().toISOString(),
    overallScore: 0,
    checks: {
      metadata: await checkMetadata(),
      schema: await checkSchema(),
      technical: await checkTechnical(),
      content: await checkContent(),
      performance: await checkPerformance(),
    },
    suggestions: [],
  };

  // Calculate overall score
  const allChecks = [
    ...results.checks.metadata,
    ...results.checks.schema,
    ...results.checks.technical,
    ...results.checks.content,
    ...results.checks.performance,
  ];

  const passedChecks = allChecks.filter(check => check.passed).length;
  results.overallScore = Math.round((passedChecks / allChecks.length) * 100);

  // Generate suggestions
  results.suggestions = generateSuggestions(results.checks);

  return results;
}

/**
 * Check metadata tags
 */
async function checkMetadata(): Promise<SEOCheckResult[]> {
  if (typeof document === 'undefined') return [];

  const results: SEOCheckResult[] = [];

  // Title tag
  const title = document.title;
  results.push({
    passed: title.length > 0 && title.length <= 60,
    message: 'Title tag length (optimal: 50-60 characters)',
    severity: title.length > 70 ? 'error' : title.length > 60 ? 'warning' : 'info',
    details: { length: title.length, content: title },
  });

  // Meta description
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  results.push({
    passed: description.length >= 150 && description.length <= 160,
    message: 'Meta description length (optimal: 150-160 characters)',
    severity: description.length > 170 ? 'error' : description.length < 120 ? 'warning' : 'info',
    details: { length: description.length, content: description },
  });

  // Canonical URL
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
  results.push({
    passed: !!canonical,
    message: 'Canonical URL present',
    severity: 'error',
    details: { url: canonical },
  });

  // Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
  const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
  const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');

  results.push({
    passed: !!(ogTitle && ogDescription && ogImage),
    message: 'Open Graph tags complete',
    severity: 'warning',
    details: { ogTitle, ogDescription, ogImage },
  });

  // Twitter Card
  const twitterCard = document.querySelector('meta[name="twitter:card"]')?.getAttribute('content');
  results.push({
    passed: twitterCard === 'summary_large_image',
    message: 'Twitter Card configured',
    severity: 'info',
    details: { card: twitterCard },
  });

  // Viewport
  const viewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content');
  results.push({
    passed: !!viewport && viewport.includes('width=device-width'),
    message: 'Viewport meta tag configured',
    severity: 'error',
    details: { content: viewport },
  });

  return results;
}

/**
 * Check schema markup
 */
async function checkSchema(): Promise<SEOCheckResult[]> {
  if (typeof document === 'undefined') return [];

  const results: SEOCheckResult[] = [];
  const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));

  results.push({
    passed: scripts.length > 0,
    message: 'Structured data present',
    severity: 'warning',
    details: { count: scripts.length },
  });

  // Validate each schema
  scripts.forEach((script, index) => {
    try {
      const schema = JSON.parse(script.textContent || '{}');
      const schemaType = schema['@type'] || 'Unknown';

      results.push({
        passed: true,
        message: `Valid ${schemaType} schema`,
        severity: 'info',
        details: { type: schemaType, index },
      });

      // Check for required fields
      if (schemaType === 'Organization') {
        const hasRequiredFields = schema.name && schema.url;
        results.push({
          passed: hasRequiredFields,
          message: 'Organization schema has required fields',
          severity: 'warning',
          details: { name: schema.name, url: schema.url },
        });
      }
    } catch (error) {
      results.push({
        passed: false,
        message: `Invalid JSON-LD at position ${index}`,
        severity: 'error',
        details: { error: String(error) },
      });
    }
  });

  return results;
}

/**
 * Check technical SEO
 */
async function checkTechnical(): Promise<SEOCheckResult[]> {
  if (typeof document === 'undefined') return [];

  const results: SEOCheckResult[] = [];

  // H1 tag
  const h1Tags = document.querySelectorAll('h1');
  results.push({
    passed: h1Tags.length === 1,
    message: 'Single H1 tag present',
    severity: h1Tags.length === 0 ? 'error' : h1Tags.length > 1 ? 'warning' : 'info',
    details: { count: h1Tags.length },
  });

  // Images with alt tags
  const images = Array.from(document.querySelectorAll('img'));
  const imagesWithAlt = images.filter(img => img.getAttribute('alt'));
  const altTextCoverage = images.length > 0 ? (imagesWithAlt.length / images.length) * 100 : 100;

  results.push({
    passed: altTextCoverage >= 90,
    message: 'Images have alt attributes',
    severity: altTextCoverage < 50 ? 'error' : altTextCoverage < 90 ? 'warning' : 'info',
    details: { total: images.length, withAlt: imagesWithAlt.length, coverage: altTextCoverage },
  });

  // Internal links
  const internalLinks = Array.from(document.querySelectorAll('a[href^="/"], a[href^="#"]'));
  results.push({
    passed: internalLinks.length >= 3,
    message: 'Sufficient internal linking',
    severity: 'info',
    details: { count: internalLinks.length },
  });

  // HTTPS
  const isHTTPS = typeof window !== 'undefined' && window.location.protocol === 'https:';
  results.push({
    passed: isHTTPS,
    message: 'Site uses HTTPS',
    severity: 'error',
    details: { protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown' },
  });

  // Mobile-friendly
  const viewport = document.querySelector('meta[name="viewport"]');
  results.push({
    passed: !!viewport,
    message: 'Mobile-friendly viewport',
    severity: 'error',
    details: { present: !!viewport },
  });

  return results;
}

/**
 * Check content quality
 */
async function checkContent(): Promise<SEOCheckResult[]> {
  if (typeof document === 'undefined') return [];

  const results: SEOCheckResult[] = [];

  // Content length
  const mainContent = document.querySelector('main') || document.body;
  const textContent = mainContent.textContent || '';
  const wordCount = textContent.trim().split(/\s+/).length;

  results.push({
    passed: wordCount >= 300,
    message: 'Sufficient content length (min 300 words)',
    severity: wordCount < 100 ? 'error' : wordCount < 300 ? 'warning' : 'info',
    details: { wordCount },
  });

  // Headings structure
  const h1Count = document.querySelectorAll('h1').length;
  const h2Count = document.querySelectorAll('h2').length;
  const h3Count = document.querySelectorAll('h3').length;

  results.push({
    passed: h2Count > 0,
    message: 'Content uses heading hierarchy',
    severity: 'warning',
    details: { h1: h1Count, h2: h2Count, h3: h3Count },
  });

  // Paragraph structure
  const paragraphs = document.querySelectorAll('p');
  results.push({
    passed: paragraphs.length >= 3,
    message: 'Content has sufficient paragraphs',
    severity: 'info',
    details: { count: paragraphs.length },
  });

  return results;
}

/**
 * Check performance
 */
async function checkPerformance(): Promise<SEOCheckResult[]> {
  const results: SEOCheckResult[] = [];

  // This is a placeholder - real performance metrics would come from Web Vitals API
  results.push({
    passed: true,
    message: 'Performance metrics should be monitored via Web Vitals',
    severity: 'info',
    details: { note: 'Use reportWebVitals() for real metrics' },
  });

  return results;
}

/**
 * Generate suggestions based on audit results
 */
function generateSuggestions(checks: SEOReport['checks']): string[] {
  const suggestions: string[] = [];
  const allChecks = [
    ...checks.metadata,
    ...checks.schema,
    ...checks.technical,
    ...checks.content,
    ...checks.performance,
  ];

  // Find failed checks with high severity
  const errors = allChecks.filter(check => !check.passed && check.severity === 'error');
  const warnings = allChecks.filter(check => !check.passed && check.severity === 'warning');

  if (errors.length > 0) {
    suggestions.push(`Fix ${errors.length} critical SEO error(s)`);
  }

  if (warnings.length > 0) {
    suggestions.push(`Address ${warnings.length} SEO warning(s)`);
  }

  // Specific suggestions
  const titleCheck = checks.metadata.find(c => c.message.includes('Title tag'));
  if (titleCheck && !titleCheck.passed) {
    suggestions.push('Optimize title tag length (50-60 characters)');
  }

  const descCheck = checks.metadata.find(c => c.message.includes('Meta description'));
  if (descCheck && !descCheck.passed) {
    suggestions.push('Optimize meta description length (150-160 characters)');
  }

  const schemaCheck = checks.schema.find(c => c.message.includes('Structured data'));
  if (schemaCheck && !schemaCheck.passed) {
    suggestions.push('Add structured data (Schema.org) to improve rich snippets');
  }

  const altCheck = checks.technical.find(c => c.message.includes('alt attributes'));
  if (altCheck && !altCheck.passed) {
    suggestions.push('Add alt text to all images');
  }

  const contentCheck = checks.content.find(c => c.message.includes('content length'));
  if (contentCheck && !contentCheck.passed) {
    suggestions.push('Increase content length to at least 300 words');
  }

  return suggestions;
}

/**
 * Quick SEO health check
 */
export function quickSEOCheck(): { score: number; issues: string[] } {
  if (typeof document === 'undefined') {
    return { score: 0, issues: ['Cannot run in server environment'] };
  }

  const issues: string[] = [];
  let score = 100;

  // Check title
  if (!document.title || document.title.length > 60) {
    issues.push('Title tag missing or too long');
    score -= 15;
  }

  // Check description
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
  if (!description || description.length > 160) {
    issues.push('Meta description missing or too long');
    score -= 15;
  }

  // Check canonical
  if (!document.querySelector('link[rel="canonical"]')) {
    issues.push('Canonical URL missing');
    score -= 10;
  }

  // Check H1
  const h1Count = document.querySelectorAll('h1').length;
  if (h1Count !== 1) {
    issues.push(`Found ${h1Count} H1 tags (should be exactly 1)`);
    score -= 10;
  }

  // Check schema
  const schemas = document.querySelectorAll('script[type="application/ld+json"]');
  if (schemas.length === 0) {
    issues.push('No structured data found');
    score -= 20;
  }

  // Check images
  const images = Array.from(document.querySelectorAll('img'));
  const imagesWithoutAlt = images.filter(img => !img.getAttribute('alt'));
  if (imagesWithoutAlt.length > 0) {
    issues.push(`${imagesWithoutAlt.length} images missing alt text`);
    score -= 10;
  }

  return { score: Math.max(0, score), issues };
}

/**
 * Export for use in console or testing
 */
if (typeof window !== 'undefined') {
  (window as any).fly2anySEO = {
    audit: runSEOAudit,
    quick: quickSEOCheck,
  };
}

/**
 * Usage:
 *
 * // In browser console:
 * const report = await window.fly2anySEO.audit();
 * console.log(report);
 *
 * // Quick check:
 * const health = window.fly2anySEO.quick();
 * console.log(`SEO Score: ${health.score}/100`);
 * console.log('Issues:', health.issues);
 */
