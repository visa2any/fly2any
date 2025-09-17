/**
 * Security utilities for input sanitization and XSS prevention
 * 
 * @description This module provides comprehensive sanitization utilities
 * for protecting against XSS attacks, input validation, and secure HTML rendering.
 * 
 * @security CRITICAL: All user-provided content MUST be sanitized before rendering
 */

import DOMPurify from 'dompurify';

// Configuration for different content types
const SANITIZATION_CONFIGS = {
  // For email templates and content - allows safe HTML tags
  EMAIL_CONTENT: {
    ALLOWED_TAGS: [
      'div', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'b', 'em', 'i', 'u', 'br', 'hr',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'a', 'img', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
      'center', 'font'
    ],
    ALLOWED_ATTR: [
      'class', 'style', 'id', 'href', 'src', 'alt', 'title',
      'width', 'height', 'align', 'color', 'size', 'face',
      'cellpadding', 'cellspacing', 'border', 'bgcolor'
    ],
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover'],
  },
  
  // For user input fields - very restrictive
  USER_INPUT: {
    ALLOWED_TAGS: ['strong', 'em', 'u', 'br'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'style', 'link', 'meta', 'iframe'],
    FORBID_ATTR: ['on*'],
  },
  
  // For preview content - balanced security
  PREVIEW_CONTENT: {
    ALLOWED_TAGS: [
      'div', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'b', 'em', 'i', 'br', 'ul', 'ol', 'li', 'a', 'img'
    ],
    ALLOWED_ATTR: ['class', 'style', 'href', 'src', 'alt'],
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror'],
  }
};

/**
 * Sanitizes HTML content for email templates
 * @param html - Raw HTML content
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeEmailContent(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const config = SANITIZATION_CONFIGS.EMAIL_CONTENT;
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: config.ALLOWED_TAGS,
    ALLOWED_ATTR: config.ALLOWED_ATTR,
    FORBID_TAGS: config.FORBID_TAGS,
    FORBID_ATTR: config.FORBID_ATTR,
    // Remove data attributes that could contain scripts
    ALLOW_DATA_ATTR: false,
    // Remove unknown protocols (only allow http, https, mailto)
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|sms):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Sanitizes user input (form fields, search queries, etc.)
 * @param input - Raw user input
 * @returns Sanitized and escaped input
 */
export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const config = SANITIZATION_CONFIGS.USER_INPUT;
  
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: config.ALLOWED_TAGS,
    ALLOWED_ATTR: config.ALLOWED_ATTR,
    FORBID_TAGS: config.FORBID_TAGS,
    FORBID_ATTR: config.FORBID_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitizes content for preview purposes
 * @param html - HTML content to preview
 * @returns Sanitized HTML safe for preview
 */
export function sanitizePreviewContent(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const config = SANITIZATION_CONFIGS.PREVIEW_CONTENT;
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: config.ALLOWED_TAGS,
    ALLOWED_ATTR: config.ALLOWED_ATTR,
    FORBID_TAGS: config.FORBID_TAGS,
    FORBID_ATTR: config.FORBID_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Validates and sanitizes email addresses
 * @param email - Email address to validate
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const trimmedEmail = email.trim().toLowerCase();
  
  // Basic email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return '';
  }

  // Additional sanitization - remove any potentially dangerous characters
  return trimmedEmail.replace(/[<>'"]/g, '');
}

/**
 * Validates and sanitizes multiple email addresses (comma or newline separated)
 * @param emails - String containing multiple email addresses
 * @returns Array of valid, sanitized email addresses
 */
export function sanitizeEmailList(emails: string): string[] {
  if (!emails || typeof emails !== 'string') {
    return [];
  }

  // Split by common separators
  const emailArray = emails
    .split(/[,\n\r\t;]+/)
    .map(email => sanitizeEmail(email))
    .filter(email => email.length > 0);

  // Remove duplicates
  return [...new Set(emailArray)];
}

/**
 * Escapes HTML entities in text content
 * @param text - Text to escape
 * @returns HTML-escaped text
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Validates URLs for safety
 * @param url - URL to validate
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmedUrl = url.trim();
  
  // Only allow HTTP, HTTPS, and mailto protocols
  const allowedProtocols = /^(https?|mailto):/i;
  
  if (!allowedProtocols.test(trimmedUrl)) {
    return '';
  }

  try {
    // Validate URL structure
    new URL(trimmedUrl);
    return trimmedUrl;
  } catch {
    return '';
  }
}

/**
 * Validates and sanitizes CSS for inline styles
 * @param css - CSS string to validate
 * @returns Sanitized CSS or empty string
 */
export function sanitizeCss(css: string): string {
  if (!css || typeof css !== 'string') {
    return '';
  }

  // Remove potentially dangerous CSS properties
  const dangerousCssProps = [
    'expression',
    'javascript:',
    'vbscript:',
    'data:',
    'behavior',
    '-moz-binding',
    'binding'
  ];

  let sanitizedCss = css.toLowerCase();
  
  for (const prop of dangerousCssProps) {
    sanitizedCss = sanitizedCss.replace(new RegExp(prop, 'gi'), '');
  }

  return sanitizedCss;
}

/**
 * Security validation for file uploads
 * @param file - File object to validate
 * @returns Validation result with error message if invalid
 */
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Define allowed file types for email marketing
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/csv',
    'application/json'
  ];

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type ${file.type} not allowed. Only images, text, CSV, and JSON files are permitted.`
    };
  }

  // Check file size (max 5MB for images, 1MB for other files)
  const maxSize = file.type.startsWith('image/') ? 5 * 1024 * 1024 : 1024 * 1024;
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`
    };
  }

  // Check filename for dangerous patterns
  const dangerousPatterns = /[<>:"/\\|?*\x00-\x1f]/g;
  if (dangerousPatterns.test(file.name)) {
    return {
      valid: false,
      error: 'Filename contains invalid characters'
    };
  }

  return { valid: true };
}

/**
 * Rate limiting helper for API calls
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  /**
   * Check if rate limit is exceeded
   * @param key - Unique identifier (e.g., user ID, IP address)
   * @param maxAttempts - Maximum attempts allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if rate limit exceeded
   */
  isRateLimited(key: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the time window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return true;
    }

    // Record this attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return false;
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter();

/**
 * Content Security Policy helpers
 */
export const CSP_DIRECTIVES = {
  EMAIL_CONTENT: {
    'default-src': "'self'",
    'img-src': "'self' data: https:",
    'style-src': "'self' 'unsafe-inline'",
    'script-src': "'none'",
    'object-src': "'none'",
    'frame-src': "'none'"
  }
};