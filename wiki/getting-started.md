# Getting Started

Guide to set up your development environment for the workspace.

---

## System Requirements

### Minimum Requirements

| Component | Minimum Version | Recommended |
|-----------|-----------------|-------------|
| Operating System | Linux, macOS, WSL | macOS or Linux |
| Go | 1.25+ | Latest stable |
| Node.js | 20+ | 20 LTS |
| PostgreSQL | 16+ | 16+ |
| Git | Latest | Latest |
| RAM | 8 GB | 16 GB+ |
| Storage | 10 GB free | 20 GB+ |

---

## Prerequisites Installation

### Go (for moai-adk)

```bash
# macOS
brew install go

# Linux
sudo apt install golang-go

# Verify installation
go version
```

### Node.js 20+ (for puerto-aventuras)

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Verify
node --version  # Should be v20.x.x
```

### PostgreSQL 16+

```bash
# macOS
brew install postgresql@16
brew services start postgresql@16

# Linux (Ubuntu)
sudo apt install postgresql-16
sudo systemctl start postgresql

# Verify
psql --version
```

---

## Workspace Setup

### 1. Clone and Navigate

```bash
cd /config/workspace
```

### 2. Setup moai-adk

```bash
cd moai-adk

# Build the binary
make build

# Install locally (optional)
make install

# Verify installation
./moai version
```

### 3. Setup puerto-aventuras-app

```bash
cd ../puerto-aventuras-app

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Setup database
cd packages/database
npm run db:push

# Return to root
cd ../..
```

---

## Environment Variables

### puerto-aventuras-app (.env)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/puerto_aventuras"

# Encryption (64 hex characters for AES-256)
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# JWT
JWT_SECRET="your-jwt-secret-here"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# MQTT (for IoT)
MQTT_BROKER_URL="mqtt://localhost:1883"
```

---

## Verify Setup

### Test moai-adk

```bash
cd moai-adk
./moai doctor
```

Expected output:
```
✓ Go 1.25+ installed
✓ Git available
✓ Project structure valid
```

### Test puerto-aventuras-app

```bash
cd puerto-aventuras-app
npm test
```

Expected output:
```
Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

---

## IDE Setup

### VS Code (Recommended)

Install extensions:

```bash
code --install-extension golang.go
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension prisma.prisma
code --install-extension ms-azuretools.vscode-docker
```

### Cursor / Windsurf

These IDEs have native support for Claude Code and work out of the box.

---

## Common Development Tasks

### Running Tests

```bash
# moai-adk
cd moai-adk
make test

# puerto-aventuras-app
cd puerto-aventuras-app
npm test                      # All packages
npm test --workspace=@pa/crypto  # Specific package
```

### Running Development Servers

```bash
# puerto-aventuras-app
cd puerto-aventuras-app
npm dev                       # Starts web + api
```

### Database Operations

```bash
cd puerto-aventuras-app/packages/database

# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Create migration
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

---

## Troubleshooting

### Issue: "command not found: moai"

**Solution:**
```bash
cd moai-adk
make build
export PATH="$PWD:$PATH"
```

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql     # Linux

# Start PostgreSQL
brew services start postgresql@16     # macOS
sudo systemctl start postgresql      # Linux
```

### Issue: "Module not found"

**Solution:**
```bash
cd puerto-aventuras-app
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

1. Read [moai-adk Overview](./moai-adk/overview.md)
2. Read [puerto-aventuras Overview](./puerto-aventuras/overview.md)
3. Learn about [TDD Methodology](./guides/tdd.md)
4. Learn about [TRUST 5 Quality](./guides/trust5.md)

---

*Last updated: 2026-03-01*
