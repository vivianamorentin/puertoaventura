# Puerto Aventuras Super-App

Integrated digital ecosystem for Puerto Aventuras luxury residential community in Quintana Roo, Mexico.

---

## Overview

Comprehensive Super-App integrating security, marina, golf, marketplace, and digital wallet services.

> **Status:** In Development (Milestone: M-FOUNDATION-001 - 15% Complete)

---

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Frontend** | Next.js, React | 16, 19 |
| **Backend** | Fastify, Node.js | Latest, 20+ |
| **Database** | PostgreSQL, Prisma | 16, Latest |
| **Authentication** | JWT, bcrypt | - |
| **IoT** | MQTT | - |
| **Encryption** | AES-256 | - |

---

## Project Structure

```
puerto-aventuras-app/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Fastify backend API
├── packages/
│   ├── database/     # Prisma schema & migrations
│   ├── shared/       # Shared types & utilities
│   ├── auth/         # Authentication library
│   ├── crypto/       # AES-256 encryption
│   └── config/       # Shared configuration
└── services/
    ├── security/     # QR, LPR, visitors
    ├── marina/       # 143 slips, reservations
    ├── golf/         # Tee times, facilities
    ├── marketplace/  # Restaurants, delivery
    └── payments/     # Wallet, transactions
```

---

## Modules

### Security Module

Access control and visitor management.

[→ Security Module Details](./modules/security.md)

**Features:**
- QR code generation for access
- License Plate Recognition (LPR)
- Visitor registration and management
- Access logs and auditing

---

### Marina Module

Management of 143 boat slips.

[→ Marina Module Details](./modules/marina.md)

**Features:**
- Slip inventory (5 sizes: 20FT-60FT)
- Boat registration
- Reservation system
- Check-in/check-out
- Service requests

---

### Golf Module

Golf course and sports facilities.

[→ Golf Module Details](./modules/golf.md)

**Features:**
- Tee time booking
- Facility reservations (tennis, pickleball)
- IoT lighting control
- Equipment rental

---

### Marketplace Module

Restaurant ordering and delivery.

[→ Marketplace Module Details](./modules/marketplace.md)

**Features:**
- Restaurant menus
- Order placement
- Delivery/pickup/dine-in
- Delivery tracking
- Commission management

---

### Payments Module

Digital wallet and transactions.

[→ Payments Module Details](./modules/payments.md)

**Features:**
- Wallet balance management
- Loyalty points
- Transaction history
- Credit/debit/refund
- Payments for all services

---

## Development Commands

### Root Level

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run development servers
npm dev
```

### Database

```bash
cd packages/database

# Generate Prisma client
npm run db:generate

# Push schema
npm run db:push

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

### Individual Packages

```bash
# Run tests
npm test

# Test coverage
npm run test:coverage

# Type checking
npm run typecheck

# Linting
npm run lint

# Format
npm run format
```

---

## Quality Standards

### TRUST 5 Framework

All code must pass TRUST 5 validation:

- **Tested:** 85%+ coverage
- **Readable:** 0 lint errors, < 10 warnings
- **Unified:** Prettier formatting
- **Secured:** OWASP Top 10 compliance
- **Trackable:** Conventional commits

### TDD Methodology

All new code follows **TDD (RED-GREEN-REFACTOR)**:

1. **RED:** Write failing test
2. **GREEN:** Write minimal implementation
3. **REFACTOR:** Improve code quality

---

## LFPDPPP Compliance

Mexican data privacy law compliance.

### PII Encryption

All PII encrypted with AES-256:

- `encryptedPhone` - Phone numbers
- `encryptedRfc` - Tax ID
- `encryptedCurp` - CURP (Mexican ID)
- `encryptedOwnerName` - Property owner names

### ARCO Rights

Users can:
- **Access** - Retrieve their data
- **Rectification** - Update incorrect data
- **Cancellation** - Delete their data
- **Opposition** - Opt-out of processing

[→ Compliance Guide](./compliance.md)

---

## Database Schema

### Key Models

| Model | Purpose |
|-------|---------|
| **User** | Role-based access (RESIDENT, STAFF, ADMIN, PROVIDER) |
| **Property** | Villas, condos, apartments |
| **Vehicle** | LPR integration |
| **Visitor** | QR-based access |
| **Wallet** | Balance and loyalty |
| **Transaction** - Credit, debit, refund |
| **Slip** - 143 marina slips |
| **Boat** - Registration |
| **Reservation** - Time-based bookings |

[→ Database Details](./database.md)

---

## Implementation Milestones

| Milestone | Duration | Status |
|-----------|----------|--------|
| **M-FOUNDATION-001** | Weeks 1-4 | 15% Complete |
| **M-SEGURITY-001** | Weeks 5-8 | Planned |
| **M-WALLET-001** | Weeks 9-12 | Planned |
| **M-MARINA-001** | Weeks 13-17 | Planned |
| **M-GOLF-001** | Weeks 18-22 | Planned |
| **M-MARKETPLACE-001** | Weeks 23-27 | Planned |
| **M-INTEGRATION-001** | Weeks 28-32 | Planned |
| **M-DEPLOYMENT-001** | Weeks 33-36 | Planned |

---

## Environment Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm or pnpm

### Installation

```bash
cd puerto-aventuras-app

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Setup database
cd packages/database
npm run db:push

# Run development
npm dev
```

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/puerto_aventuras"

# Encryption (64 hex chars for AES-256)
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# JWT
JWT_SECRET="your-jwt-secret-here"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# MQTT
MQTT_BROKER_URL="mqtt://localhost:1883"
```

---

## API Documentation

API endpoints follow REST conventions.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/wallet` | Get wallet balance |
| `POST` | `/api/reservations` | Create reservation |

[→ API Documentation](./api.md)

---

## Documentation

- [Architecture](./architecture.md)
- [Database](./database.md)
- [API Reference](./api.md)
- [Compliance](./compliance.md)
- [Security](./modules/security.md)
- [Marina](./modules/marina.md)
- [Golf](./modules/golf.md)
- [Marketplace](./modules/marketplace.md)
- [Payments](./modules/payments.md)

---

## License

Proprietary - Puerto Aventuras Community

---

## Version

1.0.0 (Initial Release - Q4 2026)

---

*Last updated: 2026-03-01*
