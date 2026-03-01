# moai-adk Development Guide

Guide for developing and contributing to moai-adk.

---

## Development Environment

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Go | 1.25+ | Development |
| Git | Latest | Version control |
| Make | Latest | Build automation |

### Setup

```bash
# Clone repository
git clone https://github.com/modu-ai/moai-adk.git
cd moai-adk

# Install dependencies
go mod download

# Build binary
make build

# Run tests
make test

# Install locally
make install
```

---

## Project Structure

### Template Development

**IMPORTANT:** All template changes must be made in:

```
internal/template/templates/.claude/
internal/template/templates/.moai/
internal/template/templates/CLAUDE.md
```

After editing templates, **always run:**

```bash
make build
```

This regenerates `internal/template/embedded.go`.

### Protected Directories

Never modify during template sync:

```
.claude/        # Local Claude Code configuration
.moai/project/  # Project documentation
.moai/specs/    # SPEC documents
```

---

## Code Standards

### Language: English Only

**Source Code (Go):**
- All code, comments, godoc in English
- Package names: lowercase, single word
- Exported names: PascalCase
- Private names: camelCase
- Commit messages: English (Conventional Commits)

**Configuration Files:**
- Command files (.claude/commands/**/*.md): English only
- Agent definitions (.claude/agents/**/*.md): English only
- Skill definitions (.claude/skills/**/*.md): English only
- Hook scripts (.claude/hooks/**/*.sh): English only

**Why:** These files are code, read by Claude Code (English-based).

### Go-Specific Standards

**File Naming:**
- Go files: `snake_case.go` (e.g., `template_deployer.go`)
- Test files: `snake_case_test.go`

**Package Structure:**
```go
// Package doc comment (required for godoc)
// Package template provides template deployment...
package template

// Exported types have godoc comments
// Deployer extracts and deploys templates...
type Deployer interface { ... }
```

**Error Handling:**
```go
// Always wrap errors with context
if err != nil {
    return fmt.Errorf("deploy templates: %w", err)
}
```

---

## Testing

### Run Tests

```bash
# All tests
make test

# With race detection
make test-race

# With coverage
make test-coverage

# Specific package
go test ./internal/cli/...
```

### Coverage Targets

- Package-level: **85% minimum**
- Critical packages: **90%+**

**Critical Packages:**
- `internal/cli/`
- `internal/template/`
- `internal/hook/`

### Table-Driven Tests

```go
func TestBuildRequiredPATH(t *testing.T) {
    tests := []struct {
        name    string
        goBin   string
        goPath  string
        want    string
    }{
        {"default", "", "", wantDefault},
        {"custom bin", "/custom/bin", "", wantCustom},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Test implementation
        })
    }
}
```

---

## Linting

### Run Linters

```bash
# Run all linters
make lint

# Run golangci-lint
golangci-lint run

# Fix issues
golangci-lint run --fix
```

### Configuration

`.golangci.yml`:

```yaml
linters:
  enable:
    - gofmt
    - govet
    - staticcheck
    - errcheck
    - gosimple
    - unused
```

---

## Build Commands

### Makefile Targets

```bash
make build       # Build binary
make test        # Run tests
make lint        # Run linters
make fmt         # Format code
make install     # Install to $GOPATH/bin
make clean       # Clean build artifacts
make release     # Build release binaries
```

### Build with Version

```bash
make build VERSION=1.0.0
```

### Cross-Platform Build

```bash
# macOS (AMD64)
GOOS=darwin GOARCH=amd64 go build -o moai-darwin-amd64

# macOS (ARM64)
GOOS=darwin GOARCH=arm64 go build -o moai-darwin-arm64

# Linux
GOOS=linux GOARCH=amd64 go build -o moai-linux-amd64

# Windows
GOOS=windows GOARCH=amd64 go build -o moai-windows-amd64.exe
```

---

## Git Workflow

### Before Commit

- [ ] Code in English
- [ ] Tests passing (`go test ./...`)
- [ ] Linting passing (`golangci-lint run`)
- [ ] Templates regenerated (`make build`)

### Before Push

- [ ] Branch rebased
- [ ] Commits organized
- [ ] Commit messages follow Conventional Commits

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`

**Examples:**
```
feat(template): add SessionEnd hook to settings.json generator
fix(cli): prevent race condition in hook execution
test(settings): add TestEnsureGlobalSettingsEnv test cases
```

---

## Version Management

### Version Sources

1. **Authoritative:** Git tags (e.g., `v1.0.0`)
2. **Runtime:** `git describe`
3. **Config:** `.moai/config/sections/system.yaml`

### Release Process

```bash
# 1. Update CHANGELOG.md
vim CHANGELOG.md

# 2. Create git tag
git tag v1.0.0
git push origin v1.0.0

# 3. Build release binaries
make release VERSION=1.0.0
```

### Files to Update on Release

- `README.md` (Version line)
- `README.ko.md` (Version line)
- `CHANGELOG.md` (New version entry)
- `.moai/config/sections/system.yaml` (moai.version)
- `internal/template/templates/.moai/config/config.yaml` (moai.version)

---

## Debugging

### Debug Build

```bash
go build -gcflags="all=-N -l" -o moai-debug
dlv debug ./cmd/moai
```

### Verbose Output

```bash
moai --verbose command
moai -v command
```

### Debug Hooks

```bash
# Enable hook debug logging
export MOAI_HOOK_DEBUG=1

# Run hook with debug
moai hook session-start < input.json
```

---

## Hook Development

### Hook Template

```bash
#!/bin/bash
# .claude/hooks/moai/handle-session-start.sh

# Read stdin JSON from Claude Code
INPUT=$(cat)

# Call moai binary with hook subcommand
moai hook session-start <<< "$INPUT"
```

### Hook Configuration

**settings.json:**

```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "command": "\"$CLAUDE_PROJECT_DIR/.claude/hooks/moai/handle-session-start.sh\"",
        "timeout": 5
      }]
    }]
  }
}
```

**Key Rules:**
- Always quote `$CLAUDE_PROJECT_DIR`: `"$CLAUDE_PROJECT_DIR"`
- Use full path to hook wrapper script
- Set appropriate timeout (default: 5 seconds)

---

## Creating Extensions

### Custom Agent

Create `.claude/agents/<name>.md`:

```yaml
---
name: expert-custom
description: Custom domain expert for X
tools: Read Write Edit Grep Glob Bash
model: sonnet
---

# Agent Instructions

You are an expert in X...
```

### Custom Skill

Create `.claude/skills/<name>.md`:

```yaml
---
name: moai-custom-skill
description: >
  Custom skill description
category: domain
progressive_disclosure:
  enabled: true
triggers:
  keywords: ["custom", "x"]
---

# Skill Content

Detailed skill documentation...
```

### Custom Hook

Create `.claude/hooks/<event>/<name>.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
# Process hook event
echo "Result"
```

---

## Performance Profiling

### CPU Profiling

```bash
go test -cpuprofile=cpu.prof ./internal/cli/...
go tool pprof cpu.prof
```

### Memory Profiling

```bash
go test -memprofile=mem.prof ./internal/cli/...
go tool pprof mem.prof
```

### Benchmarking

```bash
go test -bench=. -benchmem ./...
```

---

## References

- [Architecture](./architecture.md)
- [Quality Gates](./quality-gates.md)
- [Agent Authoring](../moai-adk/.claude/rules/moai/development/agent-authoring.md)
- [Skill Authoring](../moai-adk/.claude/rules/moai/development/skill-authoring.md)
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)

---

*Last updated: 2026-03-01*
