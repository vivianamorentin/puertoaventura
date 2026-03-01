# moai-adk Quality Gates

TRUST 5 framework and quality validation system.

---

## TRUST 5 Framework

All code changes must pass **TRUST 5** validation:

| Criterion | Meaning | Validation |
|-----------|---------|------------|
| **T**ested | 85%+ coverage, all tests passing | Coverage tools, test runners |
| **R**eadable | 0 lint errors, < 10 warnings | Linting tools |
| **U**nified | Consistent formatting | Formatters (Prettier, black, ruff) |
| **S**ecured | OWASP Top 10 compliance | Security scanners |
| **T**rackable | Conventional commits, issue refs | Git hooks |

---

## Test Coverage

### Minimum Requirements

| Metric | Threshold | Tool |
|--------|-----------|------|
| **Overall Coverage** | 85% | jest, pytest, go test |
| **Critical Packages** | 90%+ | - |
| **New Code** | 85%+ | - |
| **Modified Code** | Maintain or improve | - |

### Coverage Tools

| Language | Tool | Command |
|----------|------|---------|
| Go | go test | `go test -cover ./...` |
| Python | pytest-cov | `pytest --cov` |
| TypeScript/JavaScript | Jest | `jest --coverage` |
| Rust | tarpaulin | `cargo tarpaulin` |

### Coverage Exemptions

```yaml
# .moai/config/sections/quality.yaml
constitution:
    coverage_exemptions:
        enabled: false
        max_exempt_percentage: 5
        require_justification: true
```

**Justification Example:**

```go
// EXEMPTION: Generated code (no control over coverage)
// EXEMPTION: External SDK wrapper (tested by SDK)
// EXEMPTION: Debug logging (low business value)
```

---

## Linting Standards

### Error Limits

| Category | Limit | Action |
|----------|-------|--------|
| **Lint Errors** | 0 | Must fix |
| **Lint Warnings** | < 10 | Should fix |
| **Type Errors** | 0 | Must fix |

### Linting Tools

| Language | Tool | Config |
|----------|------|--------|
| Go | golangci-lint | `.golangci.yml` |
| Python | ruff | `ruff.toml` |
| TypeScript/JavaScript | ESLint | `.eslintrc.js` |
| Rust | clippy | `clippy.toml` |

### Example Configurations

**Go (.golangci.yml):**

```yaml
linters:
  enable:
    - gofmt
    - govet
    - staticcheck
    - errcheck
    - gosimple
    - unused
linters-settings:
  govet:
    enable-all: true
```

**TypeScript (.eslintrc.js):**

```javascript
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
  },
};
```

---

## Security Standards

### OWASP Top 10 Mitigation

| Risk | Mitigation |
|------|------------|
| **Injection** | Parameterized queries, input validation |
| **Broken Auth** | JWT with refresh tokens, bcrypt hashing |
| **XSS** | Content Security Policy, input sanitization |
| **Crypto** | AES-256 for PII, key management |
| **Authorization** | Role-based access control (RBAC) |
| **Misconfig** | Hardened defaults, no debug in production |
| **XMLEntity** | Disable DTD, secure XML parsing |
| **Dependences** | Dependabot, automated updates |
| **Logging** | No secrets in logs, structured logging |
| **SSRF** | URL allowlists, network policies |

### Security Tools

| Tool | Purpose |
|------|---------|
| npm audit | Dependency vulnerabilities |
| Snyk | Container scanning |
| Bandit | Python security |
| gosec | Go security |

---

## Code Formatting

### Unified Formatting

All code must be formatted consistently:

| Language | Tool | Command |
|----------|------|---------|
| Go | gofmt | `gofmt -w .` |
| Python | black | `black .` |
| TypeScript/JavaScript | Prettier | `prettier --write .` |
| Rust | rustfmt | `rustfmt` |

### Configuration

**Prettier (.prettierrc):**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Black (pyproject.toml):**

```toml
[tool.black]
line-length = 100
target-version = ['py311']
```

---

## Trackability

### Conventional Commits

Format: `<type>(<scope>): <description>`

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Refactoring
- `perf` - Performance
- `test` - Tests
- `chore` - Maintenance

**Examples:**

```
feat(auth): add JWT refresh token rotation
fix(database): prevent connection pool exhaustion
docs(api): update authentication endpoints
refactor(crypto): simplify encryption utilities
```

### Issue References

Link commits to issues/SPECs:

```
feat(auth): add JWT refresh token rotation

Closes #123
Related to SPEC-AUTH-001
```

---

## LSP Integration

### LSP Quality Gates

MoAI-ADK uses LSP for real-time validation:

**Phase-Specific Thresholds:**

| Phase | Errors | Type Errors | Lint Errors |
|-------|--------|-------------|-------------|
| **plan** | Capture baseline | Capture baseline | Capture baseline |
| **run** | 0 | 0 | 0 |
| **sync** | 0 | 0 | 0 |

**Configuration:**

```yaml
# .moai/config/sections/quality.yaml
lsp_quality_gates:
    enabled: true
    plan:
        require_baseline: true
    run:
        allow_regression: false
        max_errors: 0
        max_type_errors: 0
        max_lint_errors: 0
    sync:
        max_errors: 0
        max_warnings: 10
        require_clean_lsp: true
```

### Supported Languages

| Language | LSP Server | Features |
|----------|-------------|----------|
| Go | gopls | Diagnostics, completion |
| Python | pylsp | Diagnostics, completion |
| TypeScript | tsserver | Diagnostics, completion |
| Rust | rust-analyzer | Diagnostics, completion |

---

## Regression Detection

### Baseline Tracking

```yaml
# .moai/config/sections/quality.yaml
lsp_state_tracking:
    enabled: true
    capture_points:
        - phase_start
        - post_transformation
        - pre_sync
    comparison:
        baseline: phase_start
        regression_threshold: 0
```

### Regression Rules

| Metric | Threshold | Action |
|--------|-----------|--------|
| Errors | Must be 0 or decrease | Fail if increase |
| Type Errors | Must be 0 or decrease | Fail if increase |
| Warnings | Must not increase > 10 | Fail if > 10 increase |

---

## Quality Validation Workflow

### Pre-Commit

```bash
# Run all quality checks
npm run quality    # or make quality

# Individual checks
npm run test       # Tests
npm run lint       # Linting
npm run format     # Formatting
npm run security   # Security scan
```

### CI/CD Integration

**.github/workflows/quality.yml:**

```yaml
name: Quality Gates
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
      - name: Check coverage
        run: npm run test:coverage
      - name: Run linter
        run: npm run lint
      - name: Security scan
        run: npm audit
```

---

## Ralph Engine

### Automated Error Fixing

```bash
/moai fix       # Single pass: scan → classify → fix → verify
/moai loop      # Iterative fix (max 100 iterations)
```

### Error Classification

| Level | Action |
|-------|--------|
| **Level 1** | Auto-fix (simple patterns) |
| **Level 2** | Suggest fix (requires review) |
| **Level 3** | Manual fix required |
| **Level 4** | User intervention needed |

### Convergence Detection

- Tracks error patterns across iterations
- Applies alternative strategies when stuck
- Completion criteria: 0 errors, 0 type errors, 85%+ coverage

---

## Configuration

### Quality Config

`.moai/config/sections/quality.yaml:`

```yaml
constitution:
    development_mode: hybrid      # ddd, tdd, or hybrid
    enforce_quality: true
    test_coverage_target: 85
    lsp_quality_gates:
        enabled: true
    tdd_settings:
        test_first_required: true
    ddd_settings:
        characterization_tests: true
```

### Development Mode

| Mode | When Used | Workflow |
|------|-----------|----------|
| **TDD** | New code, 50%+ coverage | RED-GREEN-REFACTOR |
| **DDD** | Legacy code, < 10% coverage | ANALYZE-PRESERVE-IMPROVE |
| **Hybrid** | Mixed (default) | New: TDD, Legacy: DDD |

---

## References

- [Development Guide](./development.md)
- [CLI Commands](./cli-commands.md)
- [Testing Guide](../guides/testing.md)
- [Security Guide](../guides/security.md)

---

*Last updated: 2026-03-01*
