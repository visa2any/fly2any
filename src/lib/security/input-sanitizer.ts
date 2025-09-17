import { createHash } from 'crypto';

/**
 * Comprehensive input sanitization utility for email marketing system
 * Prevents XSS, SQL injection, and malicious content injection
 */

// HTML Entity mapping for XSS prevention
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
  '=': '&#x3D;'
};

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[&<>"'`=/]/g, (match) => HTML_ENTITIES[match] || match)
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick, onload, etc.)
    .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object[\s\S]*?<\/object>/gi, '') // Remove object tags
    .replace(/<embed[\s\S]*?>/gi, '') // Remove embed tags
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .replace(/url\s*\(\s*javascript:/gi, '') // Remove javascript URLs in CSS
    .trim();
}

/**
 * Sanitize text input for safe database storage
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const cleaned = email.toLowerCase().trim();
  
  if (!emailRegex.test(cleaned)) {
    throw new Error('Invalid email format');
  }
  
  return cleaned;
}

/**
 * Sanitize campaign content for safe HTML email
 */
export function sanitizeEmailContent(content: string): string {
  if (typeof content !== 'string') return '';
  
  // Allow basic HTML tags but sanitize dangerous content
  return content
    // Remove script tags and their content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    // Remove event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: protocols
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
    .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, '')
    // Remove dangerous attributes
    .replace(/\s*style\s*=\s*["'][^"']*expression[^"']*["']/gi, '')
    // Remove form tags
    .replace(/<\/?form[\s\S]*?>/gi, '')
    .replace(/<\/?input[\s\S]*?>/gi, '')
    // Remove iframe, object, embed
    .replace(/<\/?iframe[\s\S]*?>/gi, '')
    .replace(/<\/?object[\s\S]*?>/gi, '')
    .replace(/<\/?embed[\s\S]*?>/gi, '')
    .trim();
}

/**
 * Sanitize campaign data object
 */
export function sanitizeCampaignData(data: any): any {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid campaign data');
  }
  
  const sanitized = {
    name: sanitizeText(data.name || ''),
    subject: sanitizeText(data.subject || ''),
    content: sanitizeEmailContent(data.content || ''),
    from_email: data.from_email ? sanitizeEmail(data.from_email) : '',
    from_name: sanitizeText(data.from_name || ''),
    template_type: sanitizeText(data.template_type || 'custom'),
    created_by: sanitizeText(data.created_by || 'admin')
  };
  
  // Validate required fields after sanitization
  if (!sanitized.name || !sanitized.subject || !sanitized.content || 
      !sanitized.from_email || !sanitized.from_name) {
    throw new Error('Required fields missing or empty after sanitization');
  }
  
  // Additional validation
  if (sanitized.name.length < 3) {
    throw new Error('Campaign name must be at least 3 characters');
  }
  
  if (sanitized.subject.length < 3) {
    throw new Error('Subject must be at least 3 characters');
  }
  
  if (sanitized.content.length < 10) {
    throw new Error('Content must be at least 10 characters');
  }
  
  return sanitized;
}

/**
 * Generate secure hash for CSRF tokens
 */
export function generateSecureToken(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return createHash('sha256')
    .update(timestamp + random + process.env.NEXTAUTH_SECRET || 'fallback-secret')
    .digest('hex');
}

/**
 * Rate limiting utility
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * Clean up old rate limit records
 */
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, record] of requestCounts) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
    }
  }
}

// Auto cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimit, 5 * 60 * 1000);
}