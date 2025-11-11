/**
 * Data Encryption Service
 *
 * Provides encryption/decryption for sensitive data like passport numbers,
 * phone numbers, and payment information.
 *
 * Uses AES-256-GCM encryption with Node.js crypto module.
 *
 * IMPORTANT: For production use:
 * 1. Store encryption keys in a secure key management service (AWS KMS, HashiCorp Vault, etc.)
 * 2. Rotate keys regularly
 * 3. Use different keys for different data types
 * 4. Never commit keys to version control
 * 5. Use environment variables with proper access controls
 *
 * @module security/encryption
 */

import * as crypto from 'crypto';

// ==========================================
// CONFIGURATION
// ==========================================

/**
 * Encryption configuration
 *
 * TODO: Production Implementation Required
 * - Move keys to AWS KMS or HashiCorp Vault
 * - Implement key rotation
 * - Add key versioning
 * - Set up audit logging
 */
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm' as const,
  keyLength: 32, // 256 bits
  ivLength: 16, // 128 bits
  authTagLength: 16, // 128 bits
  saltLength: 32, // 256 bits
};

// ==========================================
// KEY MANAGEMENT (Development Only)
// ==========================================

/**
 * Get encryption key from environment variables
 *
 * IMPORTANT: This is a placeholder implementation
 *
 * Production Implementation:
 * 1. Use AWS KMS for key storage
 * 2. Implement key rotation
 * 3. Use different keys for different purposes
 * 4. Add key versioning
 * 5. Enable audit logging
 */
function getEncryptionKey(purpose: 'passport' | 'phone' | 'payment' | 'general'): Buffer {
  let keyHex: string | undefined;

  switch (purpose) {
    case 'passport':
      keyHex = process.env.ENCRYPTION_KEY_PASSPORT;
      break;
    case 'phone':
      keyHex = process.env.ENCRYPTION_KEY_PHONE;
      break;
    case 'payment':
      keyHex = process.env.ENCRYPTION_KEY_PAYMENT;
      break;
    case 'general':
    default:
      keyHex = process.env.ENCRYPTION_KEY_GENERAL;
      break;
  }

  if (!keyHex) {
    // TODO: In production, throw an error instead of using a default key
    console.warn(`⚠️  WARNING: No encryption key found for ${purpose}. Using development key.`);
    console.warn(`⚠️  Set ENCRYPTION_KEY_${purpose.toUpperCase()} environment variable.`);

    // Development-only fallback
    // In production, this should throw an error
    keyHex = crypto
      .createHash('sha256')
      .update(`fly2any-${purpose}-key-${process.env.NODE_ENV || 'development'}`)
      .digest('hex');
  }

  return Buffer.from(keyHex, 'hex');
}

// ==========================================
// CORE ENCRYPTION FUNCTIONS
// ==========================================

/**
 * Encrypt data using AES-256-GCM
 *
 * @param plaintext - Data to encrypt
 * @param purpose - Purpose of encryption (determines which key to use)
 * @returns Encrypted data with IV and auth tag
 *
 * @example
 * const encrypted = encrypt('ABC123456', 'passport');
 * // Returns: 'v1:iv:authTag:encryptedData'
 */
export function encrypt(
  plaintext: string,
  purpose: 'passport' | 'phone' | 'payment' | 'general' = 'general'
): string {
  try {
    // Generate random IV (Initialization Vector)
    const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);

    // Get encryption key
    const key = getEncryptionKey(purpose);

    // Create cipher
    const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);

    // Encrypt data
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Combine version, IV, auth tag, and encrypted data
    // Format: v1:iv:authTag:encryptedData
    const result = [
      'v1', // Version for future algorithm changes
      iv.toString('hex'),
      authTag.toString('hex'),
      encrypted,
    ].join(':');

    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data encrypted with encrypt()
 *
 * @param ciphertext - Encrypted data from encrypt()
 * @param purpose - Purpose of encryption (determines which key to use)
 * @returns Decrypted plaintext
 *
 * @example
 * const decrypted = decrypt(encryptedData, 'passport');
 * // Returns: 'ABC123456'
 */
export function decrypt(
  ciphertext: string,
  purpose: 'passport' | 'phone' | 'payment' | 'general' = 'general'
): string {
  try {
    // Split the ciphertext into components
    const parts = ciphertext.split(':');

    if (parts.length !== 4) {
      throw new Error('Invalid ciphertext format');
    }

    const [version, ivHex, authTagHex, encrypted] = parts;

    // Check version
    if (version !== 'v1') {
      throw new Error(`Unsupported encryption version: ${version}`);
    }

    // Convert hex strings back to buffers
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    // Get decryption key
    const key = getEncryptionKey(purpose);

    // Create decipher
    const decipher = crypto.createDecipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);

    // Set auth tag
    decipher.setAuthTag(authTag);

    // Decrypt data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

// ==========================================
// SPECIALIZED ENCRYPTION FUNCTIONS
// ==========================================

/**
 * Encrypt passport number
 *
 * @param passportNumber - Passport number to encrypt
 * @returns Encrypted passport number
 */
export function encryptPassport(passportNumber: string): string {
  return encrypt(passportNumber, 'passport');
}

/**
 * Decrypt passport number
 *
 * @param encryptedPassport - Encrypted passport number
 * @returns Decrypted passport number
 */
export function decryptPassport(encryptedPassport: string): string {
  return decrypt(encryptedPassport, 'passport');
}

/**
 * Encrypt phone number
 *
 * @param phoneNumber - Phone number to encrypt
 * @returns Encrypted phone number
 */
export function encryptPhone(phoneNumber: string): string {
  return encrypt(phoneNumber, 'phone');
}

/**
 * Decrypt phone number
 *
 * @param encryptedPhone - Encrypted phone number
 * @returns Decrypted phone number
 */
export function decryptPhone(encryptedPhone: string): string {
  return decrypt(encryptedPhone, 'phone');
}

// ==========================================
// HASHING FUNCTIONS (One-way)
// ==========================================

/**
 * Hash sensitive data (one-way, cannot be decrypted)
 * Use for data that doesn't need to be retrieved (e.g., for comparison)
 *
 * @param data - Data to hash
 * @param salt - Optional salt (random string)
 * @returns Hashed data with salt
 */
export function hashData(data: string, salt?: string): string {
  const actualSalt = salt || crypto.randomBytes(ENCRYPTION_CONFIG.saltLength).toString('hex');
  const hash = crypto
    .pbkdf2Sync(data, actualSalt, 100000, 64, 'sha512')
    .toString('hex');

  return `${actualSalt}:${hash}`;
}

/**
 * Verify hashed data
 *
 * @param data - Original data to verify
 * @param hashedData - Hashed data from hashData()
 * @returns True if data matches
 */
export function verifyHash(data: string, hashedData: string): boolean {
  try {
    const [salt, originalHash] = hashedData.split(':');
    const newHash = crypto
      .pbkdf2Sync(data, salt, 100000, 64, 'sha512')
      .toString('hex');

    return originalHash === newHash;
  } catch (error) {
    console.error('Hash verification error:', error);
    return false;
  }
}

// ==========================================
// TOKENIZATION (For Credit Cards)
// ==========================================

/**
 * Tokenize sensitive data (returns a secure token)
 * Use for credit card numbers that need to be stored
 *
 * @param data - Data to tokenize
 * @param metadata - Optional metadata to include
 * @returns Token and encrypted data
 */
export function tokenize(
  data: string,
  metadata?: Record<string, string>
): {
  token: string;
  encrypted: string;
  metadata?: Record<string, string>;
} {
  // Generate secure random token
  const token = crypto.randomBytes(32).toString('hex');

  // Encrypt the actual data
  const encrypted = encrypt(data, 'payment');

  return {
    token,
    encrypted,
    metadata,
  };
}

// ==========================================
// FIELD MASKING (For Display)
// ==========================================

/**
 * Mask sensitive data for display
 *
 * @param data - Data to mask
 * @param type - Type of data
 * @returns Masked data
 *
 * @example
 * maskField('4532015112830366', 'card') // Returns: '****-****-****-0366'
 * maskField('ABC123456', 'passport')     // Returns: 'ABC******'
 * maskField('+14155552671', 'phone')     // Returns: '+1***-***-2671'
 */
export function maskField(
  data: string,
  type: 'card' | 'passport' | 'phone' | 'email'
): string {
  switch (type) {
    case 'card':
      // Show last 4 digits only
      return `****-****-****-${data.slice(-4)}`;

    case 'passport':
      // Show first 3 characters only
      return `${data.slice(0, 3)}${'*'.repeat(data.length - 3)}`;

    case 'phone':
      // Show country code and last 4 digits
      const cleaned = data.replace(/\D/g, '');
      return `+${cleaned[0]}***-***-${cleaned.slice(-4)}`;

    case 'email':
      const [local, domain] = data.split('@');
      const maskedLocal = local.length > 2
        ? `${local[0]}${'*'.repeat(local.length - 2)}${local.slice(-1)}`
        : local;
      return `${maskedLocal}@${domain}`;

    default:
      return '*'.repeat(data.length);
  }
}

// ==========================================
// KEY GENERATION UTILITIES
// ==========================================

/**
 * Generate a new encryption key
 * Use this to create keys for your environment variables
 *
 * @returns 256-bit encryption key as hex string
 *
 * @example
 * const key = generateEncryptionKey();
 * console.log(`ENCRYPTION_KEY_PASSPORT=${key}`);
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(ENCRYPTION_CONFIG.keyLength).toString('hex');
}

/**
 * Generate all required encryption keys
 * Run this once to set up your environment
 */
export function generateAllKeys(): Record<string, string> {
  return {
    ENCRYPTION_KEY_PASSPORT: generateEncryptionKey(),
    ENCRYPTION_KEY_PHONE: generateEncryptionKey(),
    ENCRYPTION_KEY_PAYMENT: generateEncryptionKey(),
    ENCRYPTION_KEY_GENERAL: generateEncryptionKey(),
  };
}

// ==========================================
// PRODUCTION KEY MANAGEMENT (TODO)
// ==========================================

/**
 * TODO: Implement AWS KMS integration
 *
 * Example implementation with AWS KMS:
 *
 * import { KMSClient, DecryptCommand } from '@aws-sdk/client-kms';
 *
 * async function getKeyFromKMS(keyId: string): Promise<Buffer> {
 *   const client = new KMSClient({ region: 'us-east-1' });
 *   const command = new DecryptCommand({
 *     KeyId: keyId,
 *     CiphertextBlob: encryptedKey,
 *   });
 *   const response = await client.send(command);
 *   return Buffer.from(response.Plaintext!);
 * }
 */

/**
 * TODO: Implement key rotation
 *
 * Steps for key rotation:
 * 1. Generate new key
 * 2. Re-encrypt all data with new key
 * 3. Update key in KMS
 * 4. Remove old key after grace period
 */

// ==========================================
// EXPORTS
// ==========================================

export const encryption = {
  encrypt,
  decrypt,
  encryptPassport,
  decryptPassport,
  encryptPhone,
  decryptPhone,
  hashData,
  verifyHash,
  tokenize,
  maskField,
  generateEncryptionKey,
  generateAllKeys,
};

export default encryption;

// ==========================================
// SECURITY NOTES
// ==========================================

/**
 * CRITICAL SECURITY CONSIDERATIONS:
 *
 * 1. Key Management:
 *    - Never store keys in code
 *    - Use environment variables with proper access controls
 *    - Consider using AWS KMS, HashiCorp Vault, or similar
 *    - Rotate keys regularly (quarterly recommended)
 *
 * 2. Data Storage:
 *    - Always encrypt PII (Personally Identifiable Information)
 *    - Use different keys for different data types
 *    - Consider field-level encryption in database
 *
 * 3. Compliance:
 *    - PCI DSS for payment card data
 *    - GDPR for EU customer data
 *    - CCPA for California residents
 *    - Industry-specific regulations (aviation, etc.)
 *
 * 4. Audit & Monitoring:
 *    - Log all encryption/decryption operations
 *    - Monitor for unusual access patterns
 *    - Set up alerts for failed decryption attempts
 *    - Regular security audits
 *
 * 5. Disaster Recovery:
 *    - Backup encryption keys securely
 *    - Document key recovery procedures
 *    - Test recovery procedures regularly
 *
 * 6. Development vs Production:
 *    - Use different keys for dev/staging/prod
 *    - Never use production keys in development
 *    - Restrict access to production keys
 */
