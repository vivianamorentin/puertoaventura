/**
 * Auth Package - Authentication Services
 *
 * TDD Implementation: GREEN phase
 * Minimal implementation to pass tests
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {
  TokenPayload,
  DecodedToken,
  RefreshTokenData,
  GeneratedRefreshToken,
  VerificationTokenData,
  FailedLoginAttempt,
  AccountLockResult,
  PasswordValidationResult,
  UserRole,
  AuthError,
} from './types';

// Re-export types for convenience
export type {
  TokenPayload,
  DecodedToken,
  RefreshTokenData,
  GeneratedRefreshToken,
  VerificationTokenData,
  FailedLoginAttempt,
  AccountLockResult,
  PasswordValidationResult,
};
export { UserRole, AuthError };

// Configuration (from environment variables)
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-key-min-32-chars';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-min-32-chars';
const JWT_ACCESS_EXPIRY = '15m';
const JWT_REFRESH_EXPIRY = '7d';
const BCRYPT_SALT_ROUNDS = 12;
const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes
const ACCOUNT_LOCK_DURATION = 30 * 60 * 1000; // 30 minutes

// In-memory storage for failed login attempts (replace with Redis in production)
const failedAttempts = new Map<string, FailedLoginAttempt>();

// Common passwords list (simplified for demo)
const COMMON_PASSWORDS = [
  'password',
  'Password123',
  '12345678',
  'qwerty123',
  'abc12345',
  'letmein123',
  'welcome123',
  'monkey123',
  'dragon123',
];

// ============================================================================
// Password Management
// ============================================================================

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return bcrypt.compare(password, hash);
  } catch (error) {
    throw new AuthError('Invalid hash format', 'INVALID_HASH');
  }
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result with errors
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Special character
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Common passwords
  if (COMMON_PASSWORDS.includes(password)) {
    errors.push('Password is too common');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// JWT Token Management
// ============================================================================

/**
 * Generate a JWT access token
 * @param payload - Token payload
 * @returns Access token
 */
export function generateAccessToken(payload: TokenPayload): string {
  if (!payload.userId) {
    throw new AuthError('User ID is required', 'MISSING_USER_ID');
  }

  const validRoles: UserRole[] = ['RESIDENT', 'STAFF', 'ADMIN', 'PROVIDER'];
  if (!validRoles.includes(payload.role)) {
    throw new AuthError('Invalid role', 'INVALID_ROLE');
  }

  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY,
  });
}

/**
 * Generate a refresh token with database storage data
 * @param userId - User ID
 * @returns Refresh token data
 */
export async function generateRefreshToken(userId: string): Promise<GeneratedRefreshToken> {
  if (!userId) {
    throw new AuthError('User ID is required', 'MISSING_USER_ID');
  }

  const tokenId = uuidv4();
  const token = jwt.sign({ userId, tokenId }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
  });

  // Hash the token for storage
  const hashedToken = await hashPassword(token);

  // Calculate expiry
  const expiresAt = new Date();
  expiresAt.setTime(expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return {
    token,
    tokenId,
    hashedToken,
    expiresAt,
  };
}

/**
 * Verify and decode an access token
 * @param token - Access token
 * @returns Decoded token payload
 */
export function verifyAccessToken(token: string): DecodedToken {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as DecodedToken;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token expired', 'TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError('Invalid token', 'INVALID_TOKEN');
    }
    throw new AuthError('Token verification failed', 'VERIFICATION_FAILED');
  }
}

/**
 * Verify a refresh token against database record
 * @param token - Refresh token
 * @param dbToken - Database token record
 * @returns Decoded token payload
 */
export async function verifyRefreshToken(token: string, dbToken: RefreshTokenData | null): Promise<TokenPayload> {
  if (!dbToken) {
    throw new AuthError('Token not found', 'TOKEN_NOT_FOUND');
  }

  if (dbToken.revoked) {
    throw new AuthError('Token revoked', 'TOKEN_REVOKED');
  }

  if (dbToken.expiresAt < new Date()) {
    throw new AuthError('Token expired', 'TOKEN_EXPIRED');
  }

  // Verify token matches hashed version
  const isValid = await comparePassword(token, dbToken.hashedToken);
  if (!isValid) {
    throw new AuthError('Invalid token', 'INVALID_TOKEN');
  }

  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    throw new AuthError('Token verification failed', 'VERIFICATION_FAILED');
  }
}

// ============================================================================
// Email Verification
// ============================================================================

/**
 * Generate an email verification token
 * @returns Verification token data
 */
export function generateVerificationToken(): VerificationTokenData {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setTime(expiresAt.getTime() + VERIFICATION_TOKEN_EXPIRY);

  return {
    token,
    expiresAt,
  };
}

/**
 * Verify an email verification token
 * @param token - Verification token
 * @returns True if token is valid
 */
export function verifyEmailToken(token: string): boolean {
  // Check UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  if (!uuidRegex.test(token)) {
    throw new AuthError('Invalid verification token', 'INVALID_TOKEN');
  }

  // Note: In production, you would verify the token against the database
  // and check if it's expired. This is a simplified version for testing.
  return true;
}

// ============================================================================
// Account Security
// ============================================================================

/**
 * Track a failed login attempt
 * @param userId - User ID
 * @returns Failed login attempt data
 */
export async function trackFailedLogin(userId: string): Promise<FailedLoginAttempt> {
  const now = Date.now();
  const existing = failedAttempts.get(userId);

  // Reset if lockout period has expired
  if (existing && existing.lockedUntil && existing.lockedUntil.getTime() < now) {
    failedAttempts.delete(userId);
    const newAttempt: FailedLoginAttempt = {
      userId,
      attempts: 1,
      lastAttemptAt: new Date(now),
    };
    failedAttempts.set(userId, newAttempt);
    return newAttempt;
  }

  // Reset if attempt window has expired (15 minutes)
  if (existing && now - existing.lastAttemptAt.getTime() > LOGIN_ATTEMPT_WINDOW) {
    failedAttempts.delete(userId);
    const newAttempt: FailedLoginAttempt = {
      userId,
      attempts: 1,
      lastAttemptAt: new Date(now),
    };
    failedAttempts.set(userId, newAttempt);
    return newAttempt;
  }

  // Increment attempts
  const attempts = existing ? existing.attempts + 1 : 1;
  const lastAttemptAt = new Date(now);

  let lockedUntil: Date | null = null;
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    lockedUntil = new Date(now + ACCOUNT_LOCK_DURATION);
  }

  const attemptData: FailedLoginAttempt = {
    userId,
    attempts,
    lastAttemptAt,
    lockedUntil,
  };

  failedAttempts.set(userId, attemptData);
  return attemptData;
}

/**
 * Check if an account is locked
 * @param userId - User ID
 * @returns True if account is locked
 */
export async function isAccountLocked(userId: string): Promise<boolean> {
  const attemptData = failedAttempts.get(userId);

  if (!attemptData || !attemptData.lockedUntil) {
    return false;
  }

  // Check if lockout has expired
  if (attemptData.lockedUntil.getTime() < Date.now()) {
    failedAttempts.delete(userId);
    return false;
  }

  return true;
}

/**
 * Lock an account for a specified duration
 * @param userId - User ID
 * @param duration - Lock duration in milliseconds
 * @param reason - Lock reason
 * @returns Lock result
 */
export async function lockAccount(userId: string, duration: number, reason?: string): Promise<AccountLockResult> {
  const lockedUntil = new Date(Date.now() + duration);

  const attemptData: FailedLoginAttempt = {
    userId,
    attempts: MAX_LOGIN_ATTEMPTS,
    lastAttemptAt: new Date(),
    lockedUntil,
  };

  failedAttempts.set(userId, attemptData);

  return {
    locked: true,
    lockedUntil,
    reason,
  };
}

/**
 * Unlock an account
 * @param userId - User ID
 * @returns Unlock result
 */
export async function unlockAccount(userId: string): Promise<AccountLockResult> {
  failedAttempts.delete(userId);

  return {
    locked: false,
    lockedUntil: null,
  };
}
