/**
 * Crypto Package - TDD Test Suite
 *
 * Test-Driven Development: RED phase
 * These tests define the expected behavior of AES-256 encryption utilities
 * for LFPDPPP compliance (Mexican data protection law)
 */

import { describe, it, expect } from '@jest/globals';
import { encrypt, decrypt, generateKey, hashPII, validateKey } from './crypto';

describe('encrypt', () => {
  it('should encrypt plaintext using AES-256-CBC', () => {
    const plaintext = 'Sensitive PII data';
    const key = generateKey();

    const encrypted = encrypt(plaintext, key);

    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(plaintext);
    expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/); // Base64 format
  });

  it('should produce different ciphertext for same plaintext (due to IV)', () => {
    const plaintext = 'Same data';
    const key = generateKey();

    const encrypted1 = encrypt(plaintext, key);
    const encrypted2 = encrypt(plaintext, key);

    expect(encrypted1).not.toBe(encrypted2);
  });

  it('should throw error for invalid key length', () => {
    const plaintext = 'Data';
    const invalidKey = 'short';

    expect(() => encrypt(plaintext, invalidKey)).toThrow('Invalid key length');
  });

  it('should handle empty string', () => {
    const plaintext = '';
    const key = generateKey();

    const encrypted = encrypt(plaintext, key);

    expect(encrypted).toBeDefined();
  });

  it('should handle unicode characters', () => {
    const plaintext = 'Usuario: José María Ñúñez';
    const key = generateKey();

    const encrypted = encrypt(plaintext, key);

    expect(encrypted).toBeDefined();
  });
});

describe('decrypt', () => {
  it('should decrypt ciphertext to original plaintext', () => {
    const plaintext = 'Original sensitive data';
    const key = generateKey();

    const encrypted = encrypt(plaintext, key);
    const decrypted = decrypt(encrypted, key);

    expect(decrypted).toBe(plaintext);
  });

  it('should handle unicode characters correctly', () => {
    const plaintext = 'Datos personales: María González López';
    const key = generateKey();

    const encrypted = encrypt(plaintext, key);
    const decrypted = decrypt(encrypted, key);

    expect(decrypted).toBe(plaintext);
  });

  it('should throw error for invalid ciphertext format', () => {
    const key = generateKey();
    const invalidCiphertext = 'not-valid-base64!!!';

    expect(() => decrypt(invalidCiphertext, key)).toThrow();
  });

  it('should throw error for wrong key', () => {
    const plaintext = 'Secret data';
    const key1 = generateKey();
    const key2 = generateKey();

    const encrypted = encrypt(plaintext, key1);

    expect(() => decrypt(encrypted, key2)).toThrow('bad decrypt');
  });

  it('should throw error for invalid key in decrypt', () => {
    const plaintext = 'Secret data';
    const key = generateKey();

    const encrypted = encrypt(plaintext, key);

    expect(() => decrypt(encrypted, 'invalid-key')).toThrow('Invalid key length');
  });

  it('should throw error for tampered ciphertext', () => {
    const plaintext = 'Secret data';
    const key = generateKey();

    const encrypted = encrypt(plaintext, key);
    const tampered = encrypted.slice(0, -5) + 'XXXXX';

    expect(() => decrypt(tampered, key)).toThrow();
  });
});

describe('generateKey', () => {
  it('should generate a 32-byte (64 hex chars) key', () => {
    const key = generateKey();

    expect(key).toHaveLength(64);
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should generate different keys on each call', () => {
    const key1 = generateKey();
    const key2 = generateKey();

    expect(key1).not.toBe(key2);
  });

  it('should produce keys suitable for AES-256', () => {
    const key = generateKey();
    const buffer = Buffer.from(key, 'hex');

    expect(buffer).toHaveLength(32); // 256 bits = 32 bytes
  });
});

describe('hashPII', () => {
  it('should hash PII for irreversible storage', () => {
    const pii = 'email@example.com';

    const hash = hashPII(pii);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(pii);
    expect(hash).toMatch(/^[0-9a-f]{64}$/); // SHA-256 produces 64 hex chars
  });

  it('should produce consistent hash for same input', () => {
    const pii = 'user@example.com';

    const hash1 = hashPII(pii);
    const hash2 = hashPII(pii);

    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for similar inputs', () => {
    const pii1 = 'user@example.com';
    const pii2 = 'user@examp1e.com'; // Similar but different

    const hash1 = hashPII(pii1);
    const hash2 = hashPII(pii2);

    expect(hash1).not.toBe(hash2);
  });

  it('should be one-way (cannot reverse)', () => {
    const pii = 'sensitive-data@example.com';
    const hash = hashPII(pii);

    // There's no way to reverse the hash
    // This is a property test - we document the expectation
    expect(hash).not.toContain('@');
    expect(hash).not.toContain('sensitive');
  });

  it('should handle empty string', () => {
    const hash = hashPII('');

    expect(hash).toBeDefined();
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('validateKey', () => {
  it('should validate correct 64-char hex key', () => {
    const validKey = generateKey();
    expect(validateKey(validKey)).toBe(true);
  });

  it('should reject keys with wrong length', () => {
    expect(validateKey('short')).toBe(false);
    expect(validateKey('a'.repeat(63))).toBe(false);
    expect(validateKey('a'.repeat(65))).toBe(false);
  });

  it('should reject keys with invalid hex characters', () => {
    expect(validateKey('g'.repeat(64))).toBe(false); // 'g' is not valid hex
    expect(validateKey('0x' + 'a'.repeat(62))).toBe(false); // '0x' prefix not valid
  });

  it('should reject empty key', () => {
    expect(validateKey('')).toBe(false);
  });
});

describe('encrypt/decrypt integration', () => {
  it('should roundtrip complex JSON data', () => {
    const complexData = {
      name: 'José García',
      email: 'jose.garcia@example.com',
      phone: '+52-984-123-4567',
      address: 'Av. Puerto Aventuras #123',
      rfc: 'GAJJ800101ABC', // Mexican tax ID
    };

    const key = generateKey();
    const encrypted = encrypt(JSON.stringify(complexData), key);
    const decrypted = decrypt(encrypted, key);
    const restored = JSON.parse(decrypted);

    expect(restored).toEqual(complexData);
  });

  it('should handle large data (>1MB)', () => {
    const largeData = 'X'.repeat(1_000_000); // 1MB
    const key = generateKey();

    const encrypted = encrypt(largeData, key);
    const decrypted = decrypt(encrypted, key);

    expect(decrypted).toHaveLength(1_000_000);
  });
});
