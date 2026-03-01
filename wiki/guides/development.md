# Development Setup Guide

Complete guide to setting up your development environment.

---

## System Requirements

### Minimum Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **OS** | Linux, macOS, WSL | macOS or Linux |
| **RAM** | 8 GB | 16 GB+ |
| **Storage** | 10 GB free | 20 GB+ |
| **CPU** | 2 cores | 4+ cores |

---

## Prerequisites Installation

### 1. Go (for moai-adk)

**macOS:**
```bash
brew install go
```

**Linux:**
```bash
sudo apt install golang-go
```

**Verify:**
```bash
go version  # Should be 1.25+
```

---

### 2. Node.js 20+ (for puerto-aventuras)

**Using nvm (recommended):**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc  # or ~/.zshrc
nvm install 20
nvm use 20
```

**Verify:**
```bash
node --version  # Should be v20.x.x
npm --version   # Should be 10.x.x
```

---

### 3. PostgreSQL 16+

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu):**
```bash
sudo apt install postgresql-16
sudo systemctl start postgresql
```

**Verify:**
```bash
psql --version  # Should be 16.x
```

---

### 4. Git

**macOS:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt install git
```

**Verify:**
```bash
git --version
```

**Configure:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Workspace Setup

### 1. Clone Repositories

```bash
cd /config/workspace

# moai-adk (if not already present)
git clone https://github.com/modu-ai/moai-adk.git

# puerto-aventuras-app (if not already present)
git clone https://github.com/your-org/puerto-aventuras-app.git
```

---

### 2. Setup moai-adk

```bash
cd moai-adk

# Build the binary
make build

# Optional: Install locally
make install

# Verify installation
./moai version
```

---

### 3. Setup puerto-aventuras-app

```bash
cd puerto-aventuras-app

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required environment variables:**

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/puerto_aventuras"

# Encryption (generate with: openssl rand -hex 32)
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# JWT
JWT_SECRET="your-jwt-secret-here-make-it-long-and-random"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# MQTT (optional, for IoT)
MQTT_BROKER_URL="mqtt://localhost:1883"
```

---

### 4. Setup Database

```bash
cd puerto-aventuras-app/packages/database

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed database
npm run db:seed
```

---

## IDE Setup

### VS Code

**Install extensions:**

```bash
code --install-extension golang.go
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension prisma.prisma
code --install-extension ms-azuretools.vscode-docker
```

**Recommended settings:**

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "go.formatTool": "goimports"
}
```

---

### Cursor / Windsurf

These IDEs have native support for Claude Code and work out of the box.

---

## Verification

### Test moai-adk

```bash
cd moai-adk
./moai doctor
```

**Expected output:**
```
✓ Go 1.25+ installed
✓ Git available
✓ Project structure valid
```

---

### Test puerto-aventuras-app

```bash
cd puerto-aventuras-app
npm test
```

**Expected output:**
```
Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

---

## Common Commands

### moai-adk

```bash
cd moai-adk

# Build
make build

# Test
make test

# Lint
make lint

# Format
make fmt

# Initialize project
./moai init my-project
```

### puerto-aventuras-app

```bash
cd puerto-aventuras-app

# Install dependencies
npm install

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Type check
npm run typecheck

# Lint
npm run lint

# Format
npm run format

# Development servers
npm dev

# Database operations
cd packages/database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema
npm run db:studio    # Open Prisma Studio
```

---

## Troubleshooting

### "command not found: moai"

**Solution:**
```bash
cd moai-adk
make build
export PATH="$PWD:$PATH"
```

---

### "Cannot connect to database"

**Solution:**
```bash
# Check PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql     # Linux

# Start PostgreSQL
brew services start postgresql@16     # macOS
sudo systemctl start postgresql      # Linux
```

---

### "Module not found"

**Solution:**
```bash
cd puerto-aventuras-app
rm -rf node_modules package-lock.json
npm install
```

---

### "Prisma Client not generated"

**Solution:**
```bash
cd packages/database
npm run db:generate
```

---

### Port already in use

**Solution:**
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

---

## Development Workflow

### 1. Start Development Servers

```bash
cd puerto-aventuras-app
npm dev
```

This starts:
- Next.js frontend on http://localhost:3000
- Fastify backend on http://localhost:3001

---

### 2. Run Tests

```bash
# All packages
npm test

# Specific package
npm test --workspace=@pa/crypto

# Watch mode
npm test -- --watch
```

---

### 3. Database Operations

```bash
cd packages/database

# View data
npm run db:studio

# Reset database (development only)
npm run db:reset
```

---

### 4. Quality Checks

```bash
# TRUST 5 validation
npm run quality

# Individual checks
npm test          # T - Tested
npm run lint      # R - Readable
npm run format    # U - Unified
npm audit         # S - Secured
```

---

## Next Steps

1. Read [getting-started](../getting-started.md)
2. Learn [TDD methodology](./tdd.md)
3. Learn [DDD methodology](./ddd.md)
4. Learn [TRUST 5 framework](./trust5.md)

---

## Resources

- [Workspace Wiki](../README.md)
- [moai-adk Documentation](../moai-adk/overview.md)
- [puerto-aventuras Documentation](../puerto-aventuras/overview.md)

---

*Last updated: 2026-03-01*
