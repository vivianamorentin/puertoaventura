# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Puerto Aventuras Super-App - An integrated digital ecosystem for a luxury residential community in Quintana Roo, Mexico. This is a **Turborepo monorepo** using **Test-Driven Development (TDD)** methodology.

**Tech Stack:** Next.js 16, Fastify, PostgreSQL 16 + Prisma, JWT auth, AES-256 encryption, MQTT IoT

## Architecture

### Monorepo Structure

```
packages/
├── crypto/        # AES-256 encryption for LFPDPPP compliance (100% coverage ✅)
├── database/      # Prisma schema with 13+ models (in progress 🚧)
├── auth/          # JWT authentication with bcrypt (in progress 🚧)
└── shared/        # Common types and utilities

apps/
├── web/           # Next.js 16 frontend (planned)
└── api/           # Fastify backend API (planned)

services/
├── security/      # QR codes, LPR, visitor management
├── marina/        # 143 slips, reservations
├── golf/          # Tee times, sports facilities
├── marketplace/   # Restaurant ordering, delivery
└── payments/      # Digital wallet, transactions
```

### Package Dependency Graph

- **@pa/crypto** - Standalone, no dependencies
- **@pa/database** - Uses `@pa/crypto` for encrypted PII fields
- **@pa/auth** - Standalone authentication logic
- **@pa/shared** - Shared types, utilities
- All packages export TypeScript types from `index.ts`

## Development Commands

### Root Level
```bash
# Install all dependencies (uses npm workspaces)
npm install

# Run tests for all packages
npm test

# Run tests for specific package
npm test --workspace=@pa/crypto
npm test --workspace=@pa/auth

# Type checking (run from package directory)
npm run typecheck
```

### Database Package (@pa/database)
```bash
cd packages/database

# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Run migrations (production)
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Individual Packages
```bash
# Run tests
npm test

# Run tests with coverage (target: 85%+)
npm run test:coverage

# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

## TDD Methodology (RED-GREEN-REFACTOR)

All new code **must** follow TDD:

1. **RED Phase:** Write failing tests first
2. **GREEN Phase:** Write minimal implementation to pass tests
3. **REFACTOR Phase:** Improve code while keeping tests green

**Never skip the RED phase.** Tests define the contract.

### Test Configuration

- **Framework:** Jest 29.7.0 with ts-jest
- **Environment:** Set `NODE_ENV=test` for test execution
- **Coverage:** Minimum 85% required (statements, branches, functions, lines)
- **Location:** Test files co-located: `*.test.ts` next to `*.ts`

### Example Test Structure

```typescript
describe('functionName', () => {
  it('should do X when Y', () => {
    // Arrange
    const input = { ... };

    // Act
    const result = functionName(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

## Quality Standards: TRUST 5

All code must pass **TRUST 5** validation before committing:

- **Tested:** 85%+ coverage, all tests passing
- **Readable:** Lint errors: 0, warnings < 10
- **Unified:** Code formatted with Prettier
- **Secured:** OWASP Top 10 mitigated
- **Trackable:** Conventional commits (`feat:`, `fix:`, `refactor:`, etc.)

## LFPDPPP Compliance (Mexican Data Privacy Law)

### PII Encryption Requirements

All Personally Identifiable Information (PII) **must** be encrypted using `@pa/crypto`:

- **Encrypted fields:** `encryptedPhone`, `encryptedRfc`, `encryptedCurp`, `encryptedOwnerName`
- **Use `@pa/crypto` functions:** `encrypt()`, `decrypt()`, `hashPII()`
- **Encryption:** AES-256-CBC with random IV per encryption
- **Key management:** Store `ENCRYPTION_KEY` in environment (64 hex chars)

### ARCO Rights

Users must be able to:
- **Access:** Retrieve their data
- **Rectification:** Update incorrect data
- **Cancellation:** Delete their data
- **Opposition:** Opt-out of data processing

### Data Breach Protocol

- Notify within 72 hours of discovery
- Log breach details in database
- Notify affected users

## Database Schema Architecture

### Key Models

- **User** - Role-based access (RESIDENT, STAFF, ADMIN, PROVIDER)
- **Property** - Villas, condos, apartments linked to users
- **Vehicle** - LPR integration with confidence scores
- **Visitor** - QR-based access with expiration
- **Wallet** - Balance and loyalty points
- **Transaction** - Credit, debit, refund, loyalty earned/redeemed
- **Slip** - 143 marina slips in 5 sizes (20FT-60FT)
- **Boat** - Registration and dimensions
- **MarinaReservation** - Check-in/out with service requests
- **Facility** - Golf tees, tennis, pickleball, gym, spa, pool
- **Reservation** - Time-based bookings
- **Restaurant** - Delivery with commission
- **Order** - Delivery/pickup/dine-in with tracking

### Cascade Delete Rules

- User deleted → Properties, Visitors, Wallet, Reservations, Orders deleted
- Property deleted → Vehicles deleted

## TypeScript Configuration

**Strict mode enabled** in `tsconfig.base.json`:
- `strict: true`
- `noImplicitAny`, `strictNullChecks`
- `noUnusedLocals`, `noUnusedParameters`
- `exactOptionalPropertyTypes`
- `noUncheckedIndexedAccess`

All packages are configured as **composite** projects for proper monorepo type checking.

## Current Implementation Status

**Milestone:** M-FOUNDATION-001 (Foundation & Infrastructure) - 15% Complete

### Completed ✅
- Crypto package (@pa/crypto) - 100% test coverage
- Prisma schema with 13+ models
- Turborepo setup with TypeScript strict mode

### In Progress 🚧
- Database package testing
- Auth package (@pa/auth) - JWT with bcrypt

### Environment Requirements

- **Node.js:** 20+ (use `nvm use 20` if available)
- **Database:** PostgreSQL 16
- **Package Manager:** npm (using npm workspaces, not pnpm)

## Common Patterns

### Error Handling

Use custom `AuthError` class from `@pa/auth`:
```typescript
throw new AuthError('User not found', 'USER_NOT_FOUND');
```

### Encryption Pattern

```typescript
import { encrypt, decrypt, hashPII } from '@pa/crypto';

// Store encrypted PII
const encryptedPhone = encrypt(phone, process.env.ENCRYPTION_KEY);

// Store hash for lookup
const phoneHash = hashPII(phone);

// Retrieve
const decryptedPhone = decrypt(encryptedPhone, process.env.ENCRYPTION_KEY);
```

### Database Access

```typescript
import { PrismaClient } from '@pa/database';

const prisma = new PrismaClient();

// Always handle errors
try {
  const user = await prisma.user.findUnique({ where: { email } });
} catch (error) {
  // Handle Prisma errors
}
```

## Project-Specific Considerations

1. **Timezone:** Puerto Aventuras is in CST (UTC-6) - consider when scheduling
2. **Language:** Primary language is English, but user-facing content may be Spanish
3. **Currency:** Mexican Pesos (MXN) - use `Decimal` type for monetary values
4. **Security:** This is a high-security application (luxury residential community)
5. **IoT Integration:** MQTT protocol for facility automation (planned)
