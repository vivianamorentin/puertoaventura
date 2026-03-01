/**
 * Crypto Package - AES-256 Encryption for LFPDPPP Compliance
 *
 * Implements AES-256-CBC encryption for PII (Personally Identifiable Information)
 * as required by Mexican Federal Law for Protection of Personal Data (LFPDPPP).
 *
 * @package @pa/crypto
 */

import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';

/**
 * Algorithm used for encryption
 * AES-256-CBC provides:
 * - 256-bit key (32 bytes)
 * - Cipher Block Chaining mode
 * - PKCS#7 padding
 */
const ALGORITHM = 'aes-256-cbc';

/**
 * IV length for AES-256-CBC
 * 16 bytes (128 bits) - standard block size for AES
 */
const IV_LENGTH = 16;

/**
 * Key length for AES-256
 * 32 bytes (256 bits)
 */
const KEY_LENGTH = 32;

/**
 * Hash algorithm for irreversible PII hashing
 */
const HASH_ALGORITHM = 'sha256';

/**
 * Encrypts plaintext using AES-256-CBC
 *
 * Each encryption uses a random IV (Initialization Vector) to ensure
 * that the same plaintext encrypted multiple times produces different
 * ciphertext. This prevents pattern analysis attacks.
 *
 * @param plaintext - The sensitive data to encrypt
 * @param keyHex - 64-character hex string (32 bytes) for AES-256
 * @returns Base64-encoded ciphertext (IV + encrypted data)
 * @throws Error if key is invalid length
 *
 * @example
 * ```ts
 * const key = generateKey();
 * const encrypted = encrypt('user@example.com', key);
 * // Returns: 'base64-encoded-ciphertext'
 * ```
 */
export function encrypt(plaintext: string, keyHex: string): string {
  // Validate key length
  if (keyHex.length !== 64) {
    throw new Error('Invalid key length: must be 64 hex characters (32 bytes)');
  }

  // Convert hex key to buffer
  const key = Buffer.from(keyHex, 'hex');

  // Generate random IV for each encryption
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt the plaintext
  let encrypted = cipher.update(plaintext, 'utf8', 'binary');
  encrypted += cipher.final('binary');

  // Combine IV and encrypted data, then encode as base64
  // IV is needed for decryption, so we prepend it
  const combined = Buffer.concat([iv, Buffer.from(encrypted, 'binary')]);

  return combined.toString('base64');
}

/**
 * Decrypts ciphertext that was encrypted with encrypt()
 *
 * Extracts the IV from the beginning of the ciphertext and uses it
 * along with the key to decrypt the data.
 *
 * @param ciphertext - Base64-encoded ciphertext from encrypt()
 * @param keyHex - 64-character hex string (32 bytes) for AES-256
 * @returns Original plaintext
 * @throws Error if ciphertext is invalid or key is wrong
 *
 * @example
 * ```ts
 * const key = generateKey();
 * const encrypted = encrypt('user@example.com', key);
 * const decrypted = decrypt(encrypted, key);
 * // Returns: 'user@example.com'
 * ```
 */
export function decrypt(ciphertext: string, keyHex: string): string {
  // Validate key length
  if (keyHex.length !== 64) {
    throw new Error('Invalid key length: must be 64 hex characters (32 bytes)');
  }

  // Convert hex key to buffer
  const key = Buffer.from(keyHex, 'hex');

  // Decode base64 ciphertext
  const combined = Buffer.from(ciphertext, 'base64');

  // Extract IV from the beginning
  const iv = combined.subarray(0, IV_LENGTH);

  // Extract encrypted data
  const encrypted = combined.subarray(IV_LENGTH);

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  // Decrypt the data
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generates a cryptographically secure random key for AES-256
 *
 * Uses crypto.randomBytes() which generates cryptographically strong
 * random values suitable for cryptographic keys.
 *
 * @returns 64-character hex string (32 bytes)
 *
 * @example
 * ```ts
 * const key = generateKey();
 * // Returns: 'a1b2c3d4e5f6...64chars'
 * ```
 */
export function generateKey(): string {
  const key = crypto.randomBytes(KEY_LENGTH);
  return key.toString('hex');
}

/**
 * Creates an irreversible hash of PII for indexing/comparison
 *
 * Uses SHA-256 to create a one-way hash. This allows:
 * - Checking if PII already exists (compare hashes)
 * - Indexing encrypted data (hash as index)
 * - Compliance with data minimization (hash can't reveal original)
 *
 * @param pii - Personally Identifiable Information to hash
 * @returns 64-character hex string (SHA-256 hash)
 *
 * @example
 * ```ts
 * const emailHash = hashPII('user@example.com');
 * // Returns: '1ea2e3f4...64chars'
 * // Store hash alongside encrypted data for lookup
 * ```
 */
export function hashPII(pii: string): string {
  return crypto.createHash(HASH_ALGORITHM).update(pii, 'utf8').digest('hex');
}

/**
 * Validates if a key string is valid for AES-256
 *
 * @param keyHex - Key to validate
 * @returns true if key is valid (64 hex chars)
 *
 * @example
 * ```ts
 * if (!validateKey(invalidKey)) {
 *   throw new Error('Invalid encryption key');
 * }
 * ```
 */
export function validateKey(keyHex: string): boolean {
  return keyHex.length === 64 && /^[0-9a-f]{64}$/.test(keyHex);
}
