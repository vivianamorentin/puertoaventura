/**
 * Auth Package - Type Definitions
 *
 * Type definitions for authentication services
 */

/**
 * User roles (matching database schema)
 */
export enum UserRole {
  RESIDENT = 'RESIDENT',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
  PROVIDER = 'PROVIDER',
}

/**
 * Authentication error class
 */
export class AuthError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

/**
 * JWT access token payload
 */
export interface TokenPayload {
  userId: string;
  role: UserRole;
  permissions: string[];
}

/**
 * Decoded JWT token with expiry
 */
export interface DecodedToken extends TokenPayload {
  iat: number; // Issued at
  exp: number; // Expiry
}

/**
 * Refresh token data from database
 */
export interface RefreshTokenData {
  tokenId: string;
  userId: string;
  hashedToken: string;
  expiresAt: Date;
  revoked: boolean;
}

/**
 * Generated refresh token with metadata
 */
export interface GeneratedRefreshToken {
  token: string;
  tokenId: string;
  hashedToken: string;
  expiresAt: Date;
}

/**
 * Email verification token data
 */
export interface VerificationTokenData {
  token: string;
  expiresAt: Date;
}

/**
 * Failed login attempt tracking
 */
export interface FailedLoginAttempt {
  userId: string;
  attempts: number;
  lastAttemptAt: Date;
  lockedUntil?: Date | null;
}

/**
 * Account lock result
 */
export interface AccountLockResult {
  locked: boolean;
  lockedUntil?: Date | null;
  reason?: string;
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Authentication result
 */
export interface AuthResult {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Token refresh result
 */
export interface TokenRefreshResult {
  accessToken: string;
  refreshToken: string;
}
