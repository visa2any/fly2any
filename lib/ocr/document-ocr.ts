/**
 * Document OCR Service — Fly2Any
 * Extracts data from credit cards and ID documents using Tesseract.js
 */

import Tesseract from 'tesseract.js';

export interface CardOCRResult {
  cardNumber?: string;
  expiryDate?: string;
  cardHolder?: string;
  cardType?: string;
  isValid?: boolean;
  confidence: number;
}

export interface IDOCRResult {
  documentType?: string;
  documentNumber?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  expiryDate?: string;
  country?: string;
  confidence: number;
}

// Luhn Algorithm for card validation
export function validateLuhn(number: string): boolean {
  const digits = number.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// Detect card type from number
export function detectCardType(number: string): string {
  const digits = number.replace(/\D/g, '');

  const patterns: Record<string, RegExp> = {
    'Visa': /^4[0-9]{12}(?:[0-9]{3})?$/,
    'MasterCard': /^5[1-5][0-9]{14}$/,
    'American Express': /^3[47][0-9]{13}$/,
    'Discover': /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    'JCB': /^(?:2131|1800|35\d{3})\d{11}$/,
    'Diners Club': /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(digits)) return type;
  }

  // Fallback to prefix detection
  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'MasterCard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';

  return 'Unknown';
}

// Extract card number from OCR text
function extractCardNumber(text: string): string | undefined {
  // Pattern for card numbers (with or without spaces/dashes)
  const patterns = [
    /\b(\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4})\b/g,
    /\b(\d{4}[\s-]?\d{6}[\s-]?\d{5})\b/g, // Amex format
    /\b(\d{16})\b/g,
    /\b(\d{15})\b/g, // Amex
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const cleaned = match.replace(/[\s-]/g, '');
        if (validateLuhn(cleaned)) {
          return cleaned;
        }
      }
    }
  }

  return undefined;
}

// Extract expiry date from OCR text
function extractExpiryDate(text: string): string | undefined {
  // Common expiry date patterns
  const patterns = [
    /(?:exp(?:iry)?|valid(?:\s+thru)?|good\s+thru)[:\s]*(\d{2})[\s\/\-](\d{2}|\d{4})/i,
    /(\d{2})[\s\/\-](\d{2}|\d{4})(?:\s*(?:exp|valid))?/g,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let month = match[1];
      let year = match[2];

      // Validate month
      const monthNum = parseInt(month, 10);
      if (monthNum < 1 || monthNum > 12) continue;

      // Normalize year
      if (year.length === 4) {
        year = year.slice(-2);
      }

      return `${month}/${year}`;
    }
  }

  return undefined;
}

// Extract cardholder name from OCR text
function extractCardHolder(text: string): string | undefined {
  // Look for name patterns (usually uppercase on cards)
  const lines = text.split('\n').filter(l => l.trim());

  for (const line of lines) {
    const cleaned = line.trim().toUpperCase();

    // Skip lines that look like card numbers or dates
    if (/\d{4}/.test(cleaned)) continue;
    if (/\d{2}\/\d{2}/.test(cleaned)) continue;
    if (/valid|exp|visa|master|amex|discover/i.test(cleaned)) continue;

    // Look for name-like patterns (2-3 words, all letters)
    const namePattern = /^([A-Z]+(?:\s+[A-Z]+){1,3})$/;
    const match = cleaned.match(namePattern);
    if (match) {
      return match[1];
    }
  }

  return undefined;
}

// Extract document number from ID
function extractDocumentNumber(text: string): string | undefined {
  const patterns = [
    /(?:doc(?:ument)?|id|license|passport)\s*(?:no\.?|number|#)?[:\s]*([A-Z0-9]{6,12})/i,
    /\b([A-Z]{1,2}\d{6,8})\b/, // Common ID format
    /\b(\d{9})\b/, // SSN-like or passport number
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return undefined;
}

// Extract date from ID
function extractDate(text: string, type: 'dob' | 'exp'): string | undefined {
  const label = type === 'dob'
    ? /(?:dob|birth|born|fecha\s+de\s+nac)/i
    : /(?:exp(?:iry)?|valid|vencimiento)/i;

  const datePatterns = [
    /(\d{2})[\s\/\-](\d{2})[\s\/\-](\d{4})/,
    /(\d{4})[\s\/\-](\d{2})[\s\/\-](\d{2})/,
    /(\d{2})[\s\/\-](\d{2})[\s\/\-](\d{2})/,
  ];

  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (label.test(lines[i])) {
      // Check current and next line for date
      for (let j = 0; j <= 1 && i + j < lines.length; j++) {
        for (const pattern of datePatterns) {
          const match = lines[i + j].match(pattern);
          if (match) {
            return match[0];
          }
        }
      }
    }
  }

  return undefined;
}

// Main OCR function for credit cards
export async function processCardImage(
  imageData: string,
  side: 'front' | 'back'
): Promise<CardOCRResult> {
  try {
    const result = await Tesseract.recognize(imageData, 'eng', {
      logger: () => {}, // Silent
    });

    const text = result.data.text;
    const confidence = result.data.confidence;

    if (side === 'front') {
      const cardNumber = extractCardNumber(text);
      const expiryDate = extractExpiryDate(text);
      const cardHolder = extractCardHolder(text);

      return {
        cardNumber,
        expiryDate,
        cardHolder,
        cardType: cardNumber ? detectCardType(cardNumber) : undefined,
        isValid: cardNumber ? validateLuhn(cardNumber) : undefined,
        confidence,
      };
    } else {
      // For card back, we mainly verify it's a card
      return {
        confidence,
        isValid: text.length > 10, // Has some text
      };
    }
  } catch (error) {
    console.error('OCR Error:', error);
    return { confidence: 0 };
  }
}

// Main OCR function for ID documents
export async function processIDImage(imageData: string): Promise<IDOCRResult> {
  try {
    const result = await Tesseract.recognize(imageData, 'eng', {
      logger: () => {},
    });

    const text = result.data.text;
    const confidence = result.data.confidence;

    // Detect document type
    let documentType: string | undefined;
    if (/passport/i.test(text)) documentType = 'Passport';
    else if (/driver/i.test(text) || /license/i.test(text)) documentType = 'Driver License';
    else if (/national\s+id|identity\s+card/i.test(text)) documentType = 'National ID';
    else documentType = 'ID Document';

    return {
      documentType,
      documentNumber: extractDocumentNumber(text),
      dateOfBirth: extractDate(text, 'dob'),
      expiryDate: extractDate(text, 'exp'),
      confidence,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    return { confidence: 0 };
  }
}

// Encrypt sensitive data for transmission
export function encryptForTransmission(data: string): string {
  // In production, use proper encryption (AES-256-GCM)
  // This is a placeholder - actual implementation would use Web Crypto API
  return btoa(data);
}

// Tokenize card number for storage (show only last 4)
export function tokenizeCardNumber(number: string): string {
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.length < 4) return '****';
  return `****${cleaned.slice(-4)}`;
}
