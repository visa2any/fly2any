/**
 * XSS Protection and Input Sanitization
 *
 * Comprehensive sanitization utilities to prevent Cross-Site Scripting (XSS) attacks.
 * Sanitizes user input before rendering, storing, or processing.
 *
 * Features:
 * - HTML sanitization
 * - JavaScript removal
 * - Content Security Policy headers
 * - URL sanitization
 * - Attribute sanitization
 *
 * @module security/sanitize
 */

import { NextResponse } from 'next/server';

// ==========================================
// HTML SANITIZATION
// ==========================================

/**
 * List of dangerous HTML tags that should be removed
 */
const DANGEROUS_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'link',
  'style',
  'base',
  'meta',
  'applet',
  'bgsound',
  'form',
  'input',
  'button',
  'select',
  'textarea',
];

/**
 * List of dangerous HTML attributes
 */
const DANGEROUS_ATTRIBUTES = [
  'onclick',
  'ondblclick',
  'onmousedown',
  'onmousemove',
  'onmouseover',
  'onmouseout',
  'onmouseup',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onblur',
  'onchange',
  'onfocus',
  'onload',
  'onunload',
  'onerror',
  'onabort',
  'onbeforeunload',
  'onhashchange',
  'onpageshow',
  'onpagehide',
  'onresize',
  'onscroll',
  'onmessage',
];

/**
 * List of allowed HTML tags for rich text content
 */
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  'a',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'code',
  'pre',
];

/**
 * List of allowed HTML attributes
 */
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title', 'target'],
  img: ['src', 'alt', 'title', 'width', 'height'],
};

/**
 * Sanitize HTML string to prevent XSS attacks
 *
 * @param html - HTML string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized HTML string
 *
 * @example
 * const dirty = '<script>alert("XSS")</script><p>Safe content</p>';
 * const clean = sanitizeHTML(dirty);
 * // Returns: '<p>Safe content</p>'
 */
export function sanitizeHTML(
  html: string,
  options?: {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    stripAll?: boolean;
  }
): string {
  let sanitized = html;

  // Option to strip all HTML tags
  if (options?.stripAll) {
    return sanitized.replace(/<[^>]*>/g, '');
  }

  const allowedTags = options?.allowedTags || ALLOWED_TAGS;
  const allowedAttributes = options?.allowedAttributes || ALLOWED_ATTRIBUTES;

  // Remove dangerous tags and their content
  DANGEROUS_TAGS.forEach((tag) => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');

    // Also remove self-closing versions
    const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
    sanitized = sanitized.replace(selfClosingRegex, '');
  });

  // Remove dangerous attributes from all tags
  DANGEROUS_ATTRIBUTES.forEach((attr) => {
    const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  // Remove on* event handlers
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove tags that are not in allowed list
  const tagRegex = /<(\/?)([\w-]+)([^>]*)>/gi;
  sanitized = sanitized.replace(tagRegex, (match, slash, tagName, attributes) => {
    const tag = tagName.toLowerCase();

    // If tag is not allowed, remove it
    if (!allowedTags.includes(tag)) {
      return '';
    }

    // If it's a closing tag, allow it
    if (slash === '/') {
      return `</${tag}>`;
    }

    // Filter attributes
    const allowedAttrs = allowedAttributes[tag] || [];
    let filteredAttributes = '';

    if (allowedAttrs.length > 0 && attributes) {
      const attrRegex = /([\w-]+)\s*=\s*["']([^"']*)["']/g;
      let attrMatch;

      while ((attrMatch = attrRegex.exec(attributes)) !== null) {
        const [, attrName, attrValue] = attrMatch;

        if (allowedAttrs.includes(attrName.toLowerCase())) {
          // Additional sanitization for href attributes
          if (attrName.toLowerCase() === 'href') {
            const sanitizedUrl = sanitizeURL(attrValue);
            if (sanitizedUrl) {
              filteredAttributes += ` ${attrName}="${sanitizedUrl}"`;
            }
          } else {
            filteredAttributes += ` ${attrName}="${escapeHTML(attrValue)}"`;
          }
        }
      }
    }

    return `<${tag}${filteredAttributes}>`;
  });

  return sanitized;
}

/**
 * Strip all HTML tags from string
 *
 * @param html - HTML string
 * @returns Plain text
 *
 * @example
 * const text = stripHTML('<p>Hello <strong>World</strong></p>');
 * // Returns: 'Hello World'
 */
export function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Escape HTML special characters
 *
 * @param text - Text to escape
 * @returns Escaped text
 *
 * @example
 * const escaped = escapeHTML('<script>alert("XSS")</script>');
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 */
export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Unescape HTML entities
 *
 * @param html - HTML with entities
 * @returns Unescaped text
 */
export function unescapeHTML(html: string): string {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
  };

  return html.replace(/&(?:amp|lt|gt|quot|#x27|#x2F);/g, (entity) => map[entity]);
}

// ==========================================
// URL SANITIZATION
// ==========================================

/**
 * List of allowed URL protocols
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

/**
 * Sanitize URL to prevent javascript: and data: protocol attacks
 *
 * @param url - URL to sanitize
 * @returns Sanitized URL or null if invalid
 *
 * @example
 * const safe = sanitizeURL('javascript:alert("XSS")');
 * // Returns: null
 *
 * const valid = sanitizeURL('https://example.com');
 * // Returns: 'https://example.com'
 */
export function sanitizeURL(url: string): string | null {
  try {
    const trimmed = url.trim();

    // Empty or suspicious URLs
    if (!trimmed || trimmed === '#') {
      return null;
    }

    // Relative URLs are allowed
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed;
    }

    // Parse URL
    const parsed = new URL(trimmed);

    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      console.warn(`Blocked URL with dangerous protocol: ${parsed.protocol}`);
      return null;
    }

    return parsed.toString();
  } catch {
    // If URL parsing fails, it might be a relative URL
    if (url.startsWith('/')) {
      return url;
    }
    return null;
  }
}

// ==========================================
// INPUT SANITIZATION
// ==========================================

/**
 * Sanitize text input (removes HTML, trims whitespace)
 *
 * @param input - User input to sanitize
 * @returns Sanitized input
 *
 * @example
 * const clean = sanitizeInput('  Hello<script>alert(1)</script>  ');
 * // Returns: 'Hello'
 */
export function sanitizeInput(input: string): string {
  return stripHTML(input).trim();
}

/**
 * Sanitize filename (remove path traversal attempts)
 *
 * @param filename - Filename to sanitize
 * @returns Sanitized filename
 *
 * @example
 * const safe = sanitizeFilename('../../etc/passwd');
 * // Returns: 'passwd'
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.\./g, '') // Remove ..
    .replace(/[/\\]/g, '') // Remove slashes
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
    .trim();
}

/**
 * Sanitize search query (prevent injection)
 *
 * @param query - Search query to sanitize
 * @returns Sanitized query
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[;]/g, '') // Remove semicolons
    .substring(0, 200); // Limit length
}

// ==========================================
// CONTENT SECURITY POLICY (CSP)
// ==========================================

/**
 * Content Security Policy configuration
 *
 * Defines what resources can be loaded and from where
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Next.js
    "'unsafe-eval'", // Required for Next.js dev
    'https://js.stripe.com',
    'https://challenges.cloudflare.com',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-jsx
    'https://fonts.googleapis.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:', // Allow images from CDNs
  ],
  'connect-src': [
    "'self'",
    'https://api.duffel.com',
    'https://api.stripe.com',
    process.env.NEXT_PUBLIC_API_URL || '',
  ].filter(Boolean),
  'frame-src': [
    "'self'",
    'https://js.stripe.com',
    'https://challenges.cloudflare.com',
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

/**
 * Build Content Security Policy header string
 *
 * @param directives - CSP directives object
 * @returns CSP header string
 */
export function buildCSPHeader(
  directives: Record<string, string[]> = CSP_DIRECTIVES
): string {
  return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key;
      }
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Add security headers to response
 *
 * @param response - Next.js response
 * @returns Response with security headers
 *
 * @example
 * export async function GET() {
 *   const response = NextResponse.json({ data: 'value' });
 *   return addSecurityHeaders(response);
 * }
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set('Content-Security-Policy', buildCSPHeader());

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable browser XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (formerly Feature Policy)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self)'
  );

  // HSTS (HTTP Strict Transport Security) - only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

// ==========================================
// SANITIZATION FOR SPECIFIC CONTEXTS
// ==========================================

/**
 * Sanitize data for JSON output
 *
 * @param data - Data to sanitize
 * @returns Sanitized data
 */
export function sanitizeJSON(data: any): any {
  if (typeof data === 'string') {
    return sanitizeInput(data);
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeJSON);
  }

  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeJSON(value);
    }
    return sanitized;
  }

  return data;
}

/**
 * Sanitize data for SQL (in addition to parameterized queries)
 *
 * @param input - Input to sanitize
 * @returns Sanitized input
 */
export function sanitizeSQL(input: string): string {
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/\0/g, '\\0') // Escape null bytes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(/\x1a/g, '\\Z'); // Escape Ctrl+Z
}

/**
 * Sanitize email content (for sending emails)
 *
 * @param content - Email content
 * @returns Sanitized content
 */
export function sanitizeEmailContent(content: string): string {
  return sanitizeHTML(content, {
    allowedTags: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
    allowedAttributes: {
      a: ['href', 'title'],
    },
  });
}

// ==========================================
// VALIDATION + SANITIZATION COMBO
// ==========================================

/**
 * Validate and sanitize email
 *
 * @param email - Email to validate and sanitize
 * @returns Result with sanitized email
 */
export function validateAndSanitizeEmail(email: string): {
  valid: boolean;
  email?: string;
  error?: string;
} {
  const sanitized = sanitizeInput(email).toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true, email: sanitized };
}

// ==========================================
// EXPORTS
// ==========================================

export const sanitize = {
  // HTML sanitization
  sanitizeHTML,
  stripHTML,
  escapeHTML,
  unescapeHTML,

  // URL sanitization
  sanitizeURL,

  // Input sanitization
  sanitizeInput,
  sanitizeFilename,
  sanitizeSearchQuery,

  // Content Security Policy
  buildCSPHeader,
  addSecurityHeaders,

  // Context-specific
  sanitizeJSON,
  sanitizeSQL,
  sanitizeEmailContent,

  // Combo functions
  validateAndSanitizeEmail,
};

export default sanitize;
