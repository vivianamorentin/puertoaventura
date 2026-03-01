# Puerto Aventuras Super-App

> Integrated Digital Ecosystem for Puerto Aventuras Luxury Residential Community

## Overview

Comprehensive Super-App integrating security, marina, golf, marketplace, and digital wallet services for the Puerto Aventuras community in Quintana Roo, Mexico.

## Tech Stack

- **Frontend:** Next.js 16 + React 19
- **Backend:** Node.js + Fastify
- **Database:** PostgreSQL 16 + Prisma ORM
- **Authentication:** JWT with refresh token rotation
- **IoT:** MQTT protocol
- **Encryption:** AES-256 for all PII

## Project Structure

```
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # Fastify backend API
├── packages/
│   ├── database/     # Prisma schema & migrations
│   ├── shared/       # Shared types & utilities
│   ├── auth/         # Authentication library
│   ├── crypto/       # AES-256 encryption utilities
│   └── config/       # Shared configuration
└── services/
    ├── security/     # Security module (QR, LPR, visitors)
    ├── marina/       # Marina module (143 slips)
    ├── golf/         # Golf & sports module
    ├── marketplace/  # Marketplace module
    └── payments/     # Digital wallet & transactions
```

## Development

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 16+

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env

# Setup database
pnpm --filter @pa/database db:push

# Run development
pnpm dev
```

### Testing

We use **Test-Driven Development (TDD)** for all new code:

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Target: 85%+ code coverage
```

### Quality Gates

All code must pass **TRUST 5** validation:

- **Tested:** 85%+ coverage, all tests passing
- **Readable:** Lint errors: 0, warnings < 10
- **Unified:** Code formatted consistently
- **Secured:** OWASP Top 10 addressed
- **Trackable:** Conventional commits, linked to requirements

## Regulatory Compliance

### LFPDPPP Compliance

- AES-256 encryption for all PII
- ARCO rights (Access, Rectification, Cancellation, Opposition)
- Explicit consent management
- Data breach notification within 72 hours

### Security Standards

- OWASP Top 10 mitigation
- Regular security audits
- Penetration testing
- Vulnerability scanning

## Implementation Milestones

1. **M-FOUNDATION-001** (Week 1-4): Infrastructure, database, auth
2. **M-SEGURITY-001** (Week 5-8): QR system, LPR, visitor management
3. **M-WALLET-001** (Week 9-12): Digital wallet, transactions, loyalty
4. **M-MARINA-001** (Week 13-17): Slip inventory, reservations, check-in/out
5. **M-GOLF-001** (Week 18-22): Facilities, tee times, IoT lighting
6. **M-MARKETPLACE-001** (Week 23-27): Restaurants, orders, delivery
7. **M-INTEGRATION-001** (Week 28-32): Testing, security audit, UAT
8. **M-DEPLOYMENT-001** (Week 33-36): Production deployment, launch

## Documentation

- [SPEC Document](.moai/specs/SPEC-PA-ECOSYSTEM-001/spec.md)
- [API Documentation](docs/api/README.md)
- [Architecture](docs/architecture/README.md)
- [Contributing](CONTRIBUTING.md)

## License

Proprietary - Puerto Aventuras Community

## Version

1.0.0 (Initial Release - Q4 2026)
