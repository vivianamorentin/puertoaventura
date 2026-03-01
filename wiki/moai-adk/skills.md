# moai-adk Skills

Complete catalog of the 52 skills in MoAI-ADK with progressive disclosure.

---

## Skills Overview

MoAI-ADK uses **progressive disclosure** to optimize token usage:

| Level | Content | Tokens | Loading |
|-------|---------|--------|---------|
| **Level 1** | Metadata only | ~100 | Always (when trigger matches) |
| **Level 2** | Full documentation | ~5K | When trigger conditions match |
| **Level 3** | Bundled files | Variable | On-demand by Claude |

---

## Foundation Skills (5)

Core MoAI patterns and execution rules.

### moai-foundation-claude

**Category:** foundation
**Purpose:** Canonical Claude Code authoring kit

**Covers:**
- Skills, sub-agents, plugins
- Slash commands, hooks
- Memory, settings
- Sandboxing, headless mode

**Triggers:**
- Keywords: "claude code", "plugin", "hook"
- Agents: All agents

---

### moai-foundation-core

**Category:** foundation
**Purpose:** MoAI-ADK foundational principles

**Covers:**
- TRUST 5 quality framework
- SPEC-First DDD methodology
- Delegation patterns
- Progressive disclosure
- Agent catalog reference

**Triggers:**
- Keywords: "trust5", "quality", "spec"
- Agents: All agents

---

### moai-foundation-philosopher

**Category:** foundation
**Purpose:** Strategic thinking framework

**Covers:**
- First Principles Analysis
- Stanford Design Thinking
- MIT Systems Engineering

**Triggers:**
- Keywords: "architecture", "trade-off", "decision"
- Agents: manager-strategy

---

### moai-foundation-quality

**Category:** foundation
**Purpose:** Code quality orchestrator

**Covers:**
- TRUST 5 validation
- Proactive code analysis
- Linting standards
- Automated best practices

**Triggers:**
- Keywords: "quality", "review", "lint"
- Agents: manager-quality

---

### moai-foundation-context

**Category:** foundation
**Purpose:** Context window optimization

**Covers:**
- Token budget management
- Session state persistence
- Multi-agent workflows
- /clear strategies

**Triggers:**
- Keywords: "token", "context", "budget"
- Agents: All agents

---

## Workflow Skills (11)

Development methodology and workflow automation.

### moai-workflow-spec

**Category:** workflow
**Purpose:** SPEC workflow orchestration

**Covers:**
- EARS format requirements
- Acceptance criteria
- Plan-Run-Sync integration

**Triggers:**
- Keywords: "spec", "ears", "requirement"
- Phases: plan, run, sync

---

### moai-workflow-tdd

**Category:** workflow
**Purpose:** Test-Driven Development workflow

**Covers:**
- RED-GREEN-REFACTOR cycle
- Test-first development
- Coverage requirements

**Triggers:**
- Keywords: "tdd", "test-first"
- Development mode: TDD, Hybrid

---

### moai-workflow-ddd

**Category:** workflow
**Purpose:** Domain-Driven Development workflow

**Covers:**
- ANALYZE-PRESERVE-IMPROVE cycle
- Characterization tests
- Behavior preservation

**Triggers:**
- Keywords: "ddd", "refactoring"
- Development mode: DDD, Hybrid

---

### moai-workflow-testing

**Category:** workflow
**Purpose:** Testing and quality assurance

**Covers:**
- DDD testing
- Characterization tests
- Performance profiling
- Code review

**Triggers:**
- Keywords: "test", "coverage", "quality"

---

### moai-workflow-project

**Category:** workflow
**Purpose:** Project management system

**Covers:**
- Documentation generation
- Language initialization
- Template optimization

**Triggers:**
- Keywords: "project", "init", "setup"

---

### moai-workflow-worktree

**Category:** workflow
**Purpose:** Git worktree management

**Covers:**
- Parallel SPEC development
- Isolated workspaces
- Automatic branch registration

**Triggers:**
- Keywords: "worktree", "branch", "parallel"

---

### moai-workflow-loop

**Category:** workflow
**Purpose:** Ralph Engine - Automated feedback loop

**Covers:**
- LSP diagnostics
- AST-grep integration
- Continuous quality improvement

**Triggers:**
- Keywords: "fix", "loop", "ralph"

---

### moai-workflow-thinking

**Category:** workflow
**Purpose:** Sequential Thinking and UltraThink

**Covers:**
- Complex problem analysis
- Architecture decisions
- Technology trade-offs

**Triggers:**
- Keywords: "thinking", "ultrathink"
- Flag: --ultrathink

---

### moai-workflow-templates

**Category:** workflow
**Purpose:** Template management system

**Covers:**
- Code boilerplates
- Feedback templates
- Project scaffolding

**Triggers:**
- Keywords: "template", "scaffold", "boilerplate"

---

### moai-workflow-jit-docs

**Category:** workflow
**Purpose:** Just-In-Time document loading

**Covers:**
- Intelligent documentation discovery
- Context-aware loading
- Caching strategies

**Triggers:**
- Keywords: "docs", "documentation"

---

### moai-docs-generation

**Category:** workflow
**Purpose:** Documentation generation patterns

**Covers:**
- Sphinx, MkDocs, TypeDoc, Nextra
- API docs, user guides
- Knowledge bases

**Triggers:**
- Keywords: "docs", "api-docs", "documentation"

---

## Domain Skills (5)

Domain-specific expertise.

### moai-domain-backend

**Category:** domain
**Purpose:** Backend development specialist

**Covers:**
- API design (REST, GraphQL)
- Database integration
- Microservices architecture

**Triggers:**
- Keywords: "api", "backend", "server"
- Agents: expert-backend

---

### moai-domain-frontend

**Category:** domain
**Purpose:** Frontend development specialist

**Covers:**
- React 19, Next.js 16, Vue 3.5
- Component architecture
- UI/UX patterns

**Triggers:**
- Keywords: "frontend", "ui", "component"
- Agents: expert-frontend

---

### moai-domain-database

**Category:** domain
**Purpose:** Database specialist

**Covers:**
- PostgreSQL, MongoDB, Redis
- Schema design
- Query optimization

**Triggers:**
- Keywords: "database", "sql", "schema"

---

### moai-domain-uiux

**Category:** domain
**Purpose:** UI/UX design systems

**Covers:**
- Accessibility (WCAG)
- Design tokens
- Dark mode theming

**Triggers:**
- Keywords: "design", "ui", "ux", "a11y"

---

### moai-foundation-thinking

**Category:** domain
**Purpose:** Structured thinking toolkit

**Covers:**
- Critical Evaluation
- Diverge-Converge Brainstorming
- Deep Questioning

**Triggers:**
- Keywords: "brainstorm", "evaluate", "analyze"

---

## Language Skills (18)

Programming language specialists.

| Skill | Language | Triggers |
|-------|----------|----------|
| moai-lang-go | Go 1.23+ | "go", "golang", "goroutine" |
| moai-lang-python | Python 3.13+ | "python", "django", "fastapi" |
| moai-lang-typescript | TypeScript 5.9+ | "typescript", "ts", "react" |
| moai-lang-javascript | JavaScript ES2024+ | "javascript", "js", "node" |
| moai-lang-rust | Rust 1.92+ | "rust", "cargo", "async" |
| moai-lang-java | Java 21 LTS | "java", "spring", "jvm" |
| moai-lang-kotlin | Kotlin 2.0+ | "kotlin", "ktor", "android" |
| moai-lang-swift | Swift 6+ | "swift", "swiftui", "ios" |
| moai-lang-csharp | C# 12 / .NET 8 | "csharp", ".net", "asp.net" |
| moai-lang-cpp | C++23/C++20 | "cpp", "c++", "stl" |
| moai-lang-php | PHP 8.3+ | "php", "laravel", "symfony" |
| moai-lang-ruby | Ruby 3.3+ | "ruby", "rails", "rubygems" |
| moai-lang-elixir | Elixir 1.17+ | "elixir", "phoenix", "otp" |
| moai-lang-scala | Scala 3.4+ | "scala", "akka", "spark" |
| moai-lang-flutter | Flutter 3.24+ / Dart 3.5+ | "flutter", "dart", "riverpod" |
| moai-lang-r | R 4.4+ | "r", "tidyverse", "ggplot2" |

---

## Platform Skills (9)

Cloud and platform integrations.

| Skill | Platform | Purpose |
|-------|----------|---------|
| moai-platform-auth | Auth0, Clerk, Firebase | Authentication |
| moai-platform-deployment | Vercel, Railway, Convex | Deployment |
| moai-platform-database-cloud | Neon, Supabase, Firestore | Cloud databases |
| moai-platform-chrome-extension | Chrome Extension Manifest V3 | Browser extensions |
| moai-framework-electron | Electron 33+ | Desktop apps |

---

## Library Skills (3)

Library-specific expertise.

| Skill | Library | Purpose |
|-------|---------|---------|
| moai-library-shadcn | shadcn/ui | React components with Tailwind |
| moai-library-nextra | Nextra | Documentation with Next.js |
| moai-library-mermaid | Mermaid | Diagrams and flowcharts |

---

## Tool Skills (2)

Specialized tool integration.

| Skill | Tool | Purpose |
|-------|------|---------|
| moai-tool-ast-grep | ast-grep | AST-based code search and refactoring |
| moai-tool-svg | SVG | Vector graphics and optimization |

---

## Specialist Skills (11)

Specialized development areas.

| Skill | Purpose | Triggers |
|-------|---------|----------|
| moai-design-tools | Figma MCP, Pencil renderer | Design-to-code workflows |
| moai-formats-data | TOON encoding, data formats | Data serialization |
| moai | MoAI super agent | Unified orchestrator |

---

## Skill Invocation

### Automatic Loading

Skills load automatically when trigger conditions match:

```bash
# MoAI detects language from file extensions
# TypeScript files → moai-lang-typescript loads
# Database keywords → moai-domain-database loads
```

### Explicit Invocation

```bash
# Via slash commands (user-invocable skills)
/moai tdd          # Loads moai-workflow-tdd
/moai ddd          # Loads moai-workflow-ddd

# Via agent preloading
# Agents preload skills defined in their frontmatter
```

---

## Creating Custom Skills

See [Skill Authoring Guide](../moai-adk/.claude/rules/moai/development/skill-authoring.md).

**Basic Structure:**

```yaml
---
name: moai-custom-skill
description: >
  Brief description of what this skill does.
category: domain
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000
triggers:
  keywords: ["custom", "domain"]
  agents: ["expert-backend"]
  phases: ["run"]
---
```

---

## References

- [Skill Authoring](../moai-adk/.claude/rules/moai/development/skill-authoring.md)
- [Progressive Disclosure](../moai-adk/.claude/rules/moai/core/moai-constitution.md)
- [Development Guide](./development.md)

---

*Last updated: 2026-03-01*
