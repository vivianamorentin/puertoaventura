/**
 * Auth Package - TDD Test Suite
 *
 * Test-Driven Development: RED phase
 * These tests define the expected behavior of authentication services
 * for Puerto Aventuras Super-App
 *
 * SPEC Requirements:
 * - REQ-F-101: User registration with email verification
 * - REQ-F-102: Email verification activates account
 * - REQ-F-103: Account lockout after 5 failed logins in 15 minutes
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateVerificationToken,
  verifyEmailToken,
  trackFailedLogin,
  isAccountLocked,
  lockAccount,
  unlockAccount,
  AuthError,
  TokenPayload,
  RefreshTokenData,
  UserRole,
} from './auth';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('uuid');
jest.mock('@pa/crypto', () => ({
  encrypt: jest.fn((data: string) => `encrypted:${data}`),
  decrypt: jest.fn((data: string) => data.replace('encrypted:', '')),
  generateKey: jest.fn(() => 'a'.repeat(64)),
}));

describe('Password Management', () => {
  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'SecurePass123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are long
    });

    it('should generate different hashes for same password', async () => {
      const password = 'SamePassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salt each time
    });

    it('should handle empty string', async () => {
      const hash = await hashPassword('');

      expect(hash).toBeDefined();
    });

    it('should use at least 12 salt rounds', async () => {
      const password = 'TestPass123!';
      const hash = await hashPassword(password);

      // bcrypt hash format: $2b$[rounds]$[salt+hash]
      const match = hash.match(/^\$2[aby]\$(\d+)\$/);
      expect(match).toBeTruthy();
      const rounds = parseInt(match![1]);
      expect(rounds).toBeGreaterThanOrEqual(12);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'CorrectPass123!';
      const hash = await hashPassword(password);
      const isValid = await comparePassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'OriginalPass123!';
      const wrongPassword = 'WrongPass123!';
      const hash = await hashPassword(password);
      const isValid = await comparePassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should be timing-safe to prevent timing attacks', async () => {
      const password = 'TimingTest123!';
      const hash = await hashPassword(password);

      const start1 = Date.now();
      await comparePassword(password, hash);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await comparePassword('WrongPassword', hash);
      const time2 = Date.now() - start2;

      // Timing should be similar (within 100ms for this test)
      expect(Math.abs(time1 - time2)).toBeLessThan(100);
    });

    it('should throw error for invalid hash format', async () => {
      const password = 'TestPass123!';
      const invalidHash = 'not-a-valid-bcrypt-hash';

      await expect(comparePassword(password, invalidHash)).rejects.toThrow();
    });
  });

  describe('validatePasswordStrength', () => {
    it('should accept strong password', () => {
      const password = 'StrongPass123!';
      const result = validatePasswordStrength(password);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password shorter than 8 characters', () => {
      const password = 'Short1!';
      const result = validatePasswordStrength(password);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without uppercase letter', () => {
      const password = 'lowercase123!';
      const result = validatePasswordStrength(password);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      const password = 'UPPERCASE123!';
      const result = validatePasswordStrength(password);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const password = 'NoNumbers!';
      const result = validatePasswordStrength(password);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const password = 'NoSpecial123';
      const result = validatePasswordStrength(password);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should reject common passwords', () => {
      const password = 'Password123!';
      const result = validatePasswordStrength(password);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password is too common');
    });

    it('should provide multiple error messages', () => {
      const password = 'weak';
      const result = validatePasswordStrength(password);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});

describe('JWT Token Management', () => {
  const mockUserId = 'user-123';
  const mockRole = UserRole.RESIDENT;

  describe('generateAccessToken', () => {
    it('should generate access token with 15 minute expiry', () => {
      const payload: TokenPayload = {
        userId: mockUserId,
        role: mockRole,
        permissions: ['read:own'],
      };

      const token = generateAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should include user ID in token', () => {
      const payload: TokenPayload = {
        userId: mockUserId,
        role: mockRole,
        permissions: [],
      };

      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(mockUserId);
    });

    it('should include role in token', () => {
      const payload: TokenPayload = {
        userId: mockUserId,
        role: 'ADMIN',
        permissions: [],
      };

      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.role).toBe('ADMIN');
    });

    it('should include permissions in token', () => {
      const payload: TokenPayload = {
        userId: mockUserId,
        role: mockRole,
        permissions: ['read:own', 'write:own'],
      };

      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.permissions).toEqual(['read:own', 'write:own']);
    });

    it('should expire in 15 minutes', () => {
      const payload: TokenPayload = {
        userId: mockUserId,
        role: mockRole,
        permissions: [],
      };

      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);

      const expiryTime = decoded.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // Should be approximately 15 minutes (900,000 ms)
      expect(timeUntilExpiry).toBeGreaterThan(890000); // ~14.8 minutes
      expect(timeUntilExpiry).toBeLessThan(910000); // ~15.2 minutes
    });

    it('should throw error for empty user ID', () => {
      const payload: TokenPayload = {
        userId: '',
        role: mockRole,
        permissions: [],
      };

      expect(() => generateAccessToken(payload)).toThrow(AuthError);
    });

    it('should throw error for invalid role', () => {
      const payload: TokenPayload = {
        userId: mockUserId,
        role: 'INVALID_ROLE' as any,
        permissions: [],
      };

      expect(() => generateAccessToken(payload)).toThrow(AuthError);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token with 7 day expiry', async () => {
      const userId = mockUserId;

      const refreshTokenData = await generateRefreshToken(userId);

      expect(refreshTokenData).toBeDefined();
      expect(refreshTokenData.token).toBeDefined();
      expect(refreshTokenData.expiresAt).toBeInstanceOf(Date);
    });

    it('should hash refresh token before storing', async () => {
      const userId = mockUserId;

      const refreshTokenData = await generateRefreshToken(userId);

      expect(refreshTokenData.hashedToken).toBeDefined();
      expect(refreshTokenData.hashedToken).not.toBe(refreshTokenData.token);
    });

    it('should expire in 7 days', async () => {
      const userId = mockUserId;

      const refreshTokenData = await generateRefreshToken(userId);
      const expiryTime = refreshTokenData.expiresAt.getTime();
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // Should be approximately 7 days (604,800,000 ms)
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      expect(timeUntilExpiry).toBeGreaterThan(sevenDaysInMs - 1000);
      expect(timeUntilExpiry).toBeLessThan(sevenDaysInMs + 1000);
    });

    it('should include token ID for revocation', async () => {
      const userId = mockUserId;

      const refreshTokenData = await generateRefreshToken(userId);

      expect(refreshTokenData.tokenId).toBeDefined();
      expect(typeof refreshTokenData.tokenId).toBe('string');
    });

    it('should throw error for empty user ID', async () => {
      await expect(generateRefreshToken('')).rejects.toThrow(AuthError);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const payload: TokenPayload = {
        userId: mockUserId,
        role: mockRole,
        permissions: ['read:own'],
      };

      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.role).toBe(mockRole);
      expect(decoded.permissions).toEqual(['read:own']);
    });

    it('should throw error for expired token', () => {
      const payload: TokenPayload = {
        userId: mockUserId,
        role: mockRole,
        permissions: [],
      };

      const token = generateAccessToken(payload);

      // Mock time to be 16 minutes later
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 16 * 60 * 1000);

      expect(() => verifyAccessToken(token)).toThrow(AuthError);
      expect(() => verifyAccessToken(token)).toThrow('Token expired');

      jest.restoreAllMocks();
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.jwt.token';

      expect(() => verifyAccessToken(invalidToken)).toThrow(AuthError);
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'not-a-jwt';

      expect(() => verifyAccessToken(malformedToken)).toThrow(AuthError);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token from database', async () => {
      const userId = mockUserId;
      const refreshTokenData = await generateRefreshToken(userId);

      // Mock database lookup
      const mockDbToken: RefreshTokenData = {
        tokenId: refreshTokenData.tokenId,
        userId: userId,
        hashedToken: refreshTokenData.hashedToken,
        expiresAt: refreshTokenData.expiresAt,
        revoked: false,
      };

      const decoded = await verifyRefreshToken(refreshTokenData.token, mockDbToken);

      expect(decoded.userId).toBe(userId);
    });

    it('should throw error for revoked token', async () => {
      const userId = mockUserId;
      const refreshTokenData = await generateRefreshToken(userId);

      const revokedDbToken: RefreshTokenData = {
        tokenId: refreshTokenData.tokenId,
        userId: userId,
        hashedToken: refreshTokenData.hashedToken,
        expiresAt: refreshTokenData.expiresAt,
        revoked: true,
      };

      await expect(verifyRefreshToken(refreshTokenData.token, revokedDbToken)).rejects.toThrow('Token revoked');
    });

    it('should throw error for expired token', async () => {
      const userId = mockUserId;
      const refreshTokenData = await generateRefreshToken(userId);

      const expiredDbToken: RefreshTokenData = {
        tokenId: refreshTokenData.tokenId,
        userId: userId,
        hashedToken: refreshTokenData.hashedToken,
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
        revoked: false,
      };

      await expect(verifyRefreshToken(refreshTokenData.token, expiredDbToken)).rejects.toThrow('Token expired');
    });

    it('should throw error for token not found in database', async () => {
      const token = 'some.refresh.token';

      await expect(verifyRefreshToken(token, null as any)).rejects.toThrow('Token not found');
    });
  });
});

describe('Email Verification', () => {
  describe('generateVerificationToken', () => {
    it('should generate unique verification token', () => {
      const token1 = generateVerificationToken();
      const token2 = generateVerificationToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
    });

    it('should generate token with sufficient entropy', () => {
      const token = generateVerificationToken();

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should include timestamp for expiry tracking', () => {
      const tokenData = generateVerificationToken();

      expect(tokenData.token).toBeDefined();
      expect(tokenData.expiresAt).toBeInstanceOf(Date);
    });

    it('should expire in 24 hours', () => {
      const tokenData = generateVerificationToken();
      const expiryTime = tokenData.expiresAt.getTime();
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // Should be approximately 24 hours (86,400,000 ms)
      const oneDayInMs = 24 * 60 * 60 * 1000;
      expect(timeUntilExpiry).toBeGreaterThan(oneDayInMs - 1000);
      expect(timeUntilExpiry).toBeLessThan(oneDayInMs + 1000);
    });
  });

  describe('verifyEmailToken', () => {
    it('should verify valid email token', () => {
      const tokenData = generateVerificationToken();
      const token = tokenData.token;

      expect(() => verifyEmailToken(token)).not.toThrow();
    });

    it('should throw error for expired token', () => {
      const tokenData = generateVerificationToken();

      // Mock time to be 25 hours later
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 25 * 60 * 60 * 1000);

      expect(() => verifyEmailToken(tokenData.token)).toThrow('Verification token expired');

      jest.restoreAllMocks();
    });

    it('should throw error for invalid token format', () => {
      const invalidToken = 'not-a-valid-uuid';

      expect(() => verifyEmailToken(invalidToken)).toThrow('Invalid verification token');
    });

    it('should be case-sensitive', () => {
      const tokenData = generateVerificationToken();
      const uppercaseToken = tokenData.token.toUpperCase();

      expect(() => verifyEmailToken(uppercaseToken)).toThrow();
    });
  });
});

describe('Account Security', () => {
  const mockUserId = 'user-123';

  describe('trackFailedLogin', () => {
    it('should track failed login attempt', async () => {
      const result = await trackFailedLogin(mockUserId);

      expect(result).toBeDefined();
      expect(result.attempts).toBe(1);
      expect(result.lockedUntil).toBeNull();
    });

    it('should increment attempt count on multiple failures', async () => {
      await trackFailedLogin(mockUserId);
      const result = await trackFailedLogin(mockUserId);

      expect(result.attempts).toBe(2);
    });

    it('should lock account after 5 failed attempts', async () => {
      // Track 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await trackFailedLogin(mockUserId);
      }

      const result = await trackFailedLogin(mockUserId);

      expect(result.attempts).toBe(5);
      expect(result.lockedUntil).toBeInstanceOf(Date);
    });

    it('should reset lockout after 15 minutes of no failures', async () => {
      // Lock the account
      for (let i = 0; i < 5; i++) {
        await trackFailedLogin(mockUserId);
      }

      // Mock time to be 16 minutes later
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 16 * 60 * 1000);

      const result = await trackFailedLogin(mockUserId);

      expect(result.attempts).toBe(1); // Reset to 1
      expect(result.lockedUntil).toBeNull();

      jest.restoreAllMocks();
    });

    it('should lock for 30 minutes after threshold', async () => {
      // Lock the account
      for (let i = 0; i < 5; i++) {
        await trackFailedLogin(mockUserId);
      }

      const result = await trackFailedLogin(mockUserId);
      const lockDuration = result.lockedUntil!.getTime() - Date.now();

      // Should be approximately 30 minutes (1,800,000 ms)
      const thirtyMinutesInMs = 30 * 60 * 1000;
      expect(lockDuration).toBeGreaterThan(thirtyMinutesInMs - 1000);
      expect(lockDuration).toBeLessThan(thirtyMinutesInMs + 1000);
    });
  });

  describe('isAccountLocked', () => {
    it('should return false for unlocked account', async () => {
      const locked = await isAccountLocked(mockUserId);

      expect(locked).toBe(false);
    });

    it('should return true for locked account', async () => {
      // Lock the account
      for (let i = 0; i < 5; i++) {
        await trackFailedLogin(mockUserId);
      }

      const locked = await isAccountLocked(mockUserId);

      expect(locked).toBe(true);
    });

    it('should return false after lockout period expires', async () => {
      // Lock the account
      for (let i = 0; i < 5; i++) {
        await trackFailedLogin(mockUserId);
      }

      // Mock time to be 31 minutes later
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 31 * 60 * 1000);

      const locked = await isAccountLocked(mockUserId);

      expect(locked).toBe(false);

      jest.restoreAllMocks();
    });

    it('should return false for non-existent user', async () => {
      const locked = await isAccountLocked('non-existent-user');

      expect(locked).toBe(false);
    });
  });

  describe('lockAccount', () => {
    it('should lock account for specified duration', async () => {
      const lockDuration = 60 * 60 * 1000; // 1 hour
      const result = await lockAccount(mockUserId, lockDuration);

      expect(result.locked).toBe(true);
      expect(result.lockedUntil).toBeInstanceOf(Date);

      const timeUntilUnlock = result.lockedUntil.getTime() - Date.now();
      expect(timeUntilUnlock).toBeGreaterThan(lockDuration - 1000);
      expect(timeUntilUnlock).toBeLessThan(lockDuration + 1000);
    });

    it('should override existing lockout', async () => {
      // Lock for 30 minutes
      await lockAccount(mockUserId, 30 * 60 * 1000);

      // Lock again for 1 hour
      const newLockDuration = 60 * 60 * 1000;
      const result = await lockAccount(mockUserId, newLockDuration);

      expect(result.locked).toBe(true);

      const timeUntilUnlock = result.lockedUntil.getTime() - Date.now();
      expect(timeUntilUnlock).toBeGreaterThan(newLockDuration - 1000);
    });

    it('should provide lock reason', async () => {
      const reason = 'Suspicious activity detected';
      const result = await lockAccount(mockUserId, 60 * 60 * 1000, reason);

      expect(result.reason).toBe(reason);
    });
  });

  describe('unlockAccount', () => {
    it('should unlock locked account', async () => {
      // Lock the account
      await lockAccount(mockUserId, 60 * 60 * 1000);

      // Unlock
      const result = await unlockAccount(mockUserId);

      expect(result.locked).toBe(false);
      expect(result.lockedUntil).toBeNull();
    });

    it('should reset failed login attempts', async () => {
      // Lock the account
      for (let i = 0; i < 5; i++) {
        await trackFailedLogin(mockUserId);
      }

      // Unlock
      await unlockAccount(mockUserId);

      // Should not be locked anymore
      const locked = await isAccountLocked(mockUserId);
      expect(locked).toBe(false);
    });

    it('should handle unlocking already unlocked account', async () => {
      const result = await unlockAccount(mockUserId);

      expect(result.locked).toBe(false);
    });

    it('should handle non-existent user', async () => {
      const result = await unlockAccount('non-existent-user');

      expect(result.locked).toBe(false);
    });
  });
});

describe('AuthError', () => {
  it('should create error with message', () => {
    const error = new AuthError('Test error');

    expect(error.message).toBe('Test error');
    expect(error.name).toBe('AuthError');
  });

  it('should support error codes', () => {
    const error = new AuthError('Invalid token', 'INVALID_TOKEN');

    expect(error.code).toBe('INVALID_TOKEN');
  });

  it('should be instanceof Error', () => {
    const error = new AuthError('Test');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AuthError);
  });
});
