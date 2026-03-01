# Workspace Wiki

Complete documentation for the `/config/workspace` containing **moai-adk** and **puerto-aventuras-app** projects.

---

## Quick Navigation

| Project | Description | Status |
|---------|-------------|--------|
| [**moai-adk**](./moai-adk/overview.md) | Agentic Development Kit for Claude Code | Active |
| [**puerto-aventuras-app**](./puerto-aventuras/overview.md) | Super-App for luxury residential community | In Development (15%) |

---

## Getting Started

1. [**Workspace Setup**](./getting-started.md) - Environment requirements and installation
2. [**Development Guides**](./guides/) - TDD, DDD, TRUST 5 methodologies
3. [**Quality Standards**](./guides/trust5.md) - Code quality requirements

---

## Workspace Structure

```
/config/workspace
├── moai-adk/              # MoAI-ADK: Go-based AI development kit
├── puerto-aventuras-app/  # Super-App monorepo (Turborepo)
└── wiki/                  # This documentation
```

---

## Quick Reference

### moai-adk Commands

```bash
cd moai-adk
make build              # Build the binary
./moai init <project>   # Initialize a new project
./moai doctor           # Check system health
```

### puerto-aventuras Commands

```bash
cd puerto-aventuras-app
npm install             # Install dependencies
npm test               # Run all tests
npm run db:push        # Push database schema
```

---

## Projects Overview

### moai-adk

**Agentic Development Kit for Claude Code**

- 28 specialized AI agents + 52 skills
- Hybrid methodology (TDD + DDD)
- Dual execution modes (Sub-Agent / Agent Teams)
- TRUST 5 quality framework
- Written in Go (34,220 lines, 32 packages)

[→ moai-adk Documentation](./moai-adk/)

### puerto-aventuras-app

**Super-App for Puerto Aventuras Community**

- Modules: Security, Marina, Golf, Marketplace, Payments
- Tech Stack: Next.js 16, Fastify, PostgreSQL 16, Prisma
- LFPDPPP compliance (Mexican data privacy law)
- AES-256 encryption for PII
- Monorepo with npm workspaces

[→ puerto-aventuras Documentation](./puerto-aventuras/)

---

## Development Methodologies

This workspace follows **MoAI Development Methodology**:

| Methodology | When Used | Cycle |
|-------------|-----------|-------|
| **TDD** | New code, new modules | RED → GREEN → REFACTOR |
| **DDD** | Legacy code refactoring | ANALYZE → PRESERVE → IMPROVE |
| **Hybrid** | Mixed projects | New: TDD, Legacy: DDD |

[→ Methodologies Guide](./guides/)

---

## Quality Standards

All code must pass **TRUST 5** validation:

- **Tested:** 85%+ code coverage
- **Readable:** 0 lint errors, < 10 warnings
- **Unified:** Consistent formatting
- **Secured:** OWASP Top 10 compliance
- **Trackable:** Conventional commits

[→ TRUST 5 Framework](./guides/trust5.md)

---

## Environment Requirements

| Tool | Version | Purpose |
|------|---------|---------|
| Go | 1.25+ | moai-adk development |
| Node.js | 20+ | puerto-aventuras-app |
| PostgreSQL | 16+ | Database |
| Git | Latest | Version control |
| pnpm/npm | 8+/9+ | Package managers |

---

## Contributing

See project-specific contributing guides:

- [moai-adk Contributing](../moai-adk/CONTRIBUTING.md)
- [puerto-aventuras Contributing](../puerto-aventuras-app/CONTRIBUTING.md)

---

## License

- **moai-adk:** Copyleft 3.0
- **puerto-aventuras-app:** Proprietary

---

*Last updated: 2026-03-01*
