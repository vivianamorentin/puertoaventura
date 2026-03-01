# moai-adk Agents

Complete catalog of the 28 specialized AI agents in MoAI-ADK.

---

## Agent Overview

MoAI-ADK uses **specialized agents** instead of general-purpose AI. Each agent has:

- **Specific domain expertise**
- **Controlled tool permissions**
- **Optimal model assignment** (Opus, Sonnet, or Haiku)
- **Skill preloading** for domain knowledge

---

## Manager Agents (8)

Workflow coordination and SPEC creation.

### manager-spec

**Purpose:** Create comprehensive SPEC documents using EARS format.

**Triggers:**
- `/moai plan` command
- Feature planning requests

**Tools:**
- Read, Write, Edit, Grep, Glob, Bash
- TaskCreate, TaskUpdate, TaskList

**Model:** Opus (High policy), Sonnet (Medium)

**Output:** `.moai/specs/SPEC-XXX/spec.md`

---

### manager-ddd

**Purpose:** DDD implementation (ANALYZE-PRESERVE-IMPROVE cycle).

**Triggers:**
- `/moai run` with DDD methodology
- Legacy code refactoring

**Tools:**
- Read, Write, Edit, Grep, Glob, Bash
- Task, TaskCreate, TaskUpdate

**Cycle:**
```
ANALYZE → Understand existing behavior
PRESERVE → Write characterization tests
IMPROVE → Incremental changes with test protection
```

---

### manager-tdd

**Purpose:** TDD implementation (RED-GREEN-REFACTOR cycle).

**Triggers:**
- `/moai run` with TDD methodology
- New code development

**Tools:**
- Read, Write, Edit, Grep, Glob, Bash
- Task, TaskCreate, TaskUpdate

**Cycle:**
```
RED → Write failing test
GREEN → Write minimal implementation
REFACTOR → Improve code quality
```

---

### manager-docs

**Purpose:** Generate documentation and prepare for deployment.

**Triggers:**
- `/moai sync` command
- Documentation generation requests

**Tools:**
- Read, Write, Edit, Grep, Glob

**Output:**
- API documentation
- README updates
- CHANGELOG entries
- Pull requests

---

### manager-quality

**Purpose:** TRUST 5 quality validation.

**Triggers:**
- Quality gate checks
- `/moai fix` command
- Pre-commit validation

**Tools:**
- Read, Grep, Glob, Bash
- LSP diagnostics

**Validates:**
- **T**ested: 85%+ coverage
- **R**eadable: 0 lint errors
- **U**nified: Consistent formatting
- **S**ecured: OWASP compliance
- **T**rackable: Conventional commits

---

### manager-project

**Purpose:** Project configuration and initialization.

**Triggers:**
- `moai init` command
- `/moai project` command
- Project reconfiguration

**Tools:**
- Read, Write, Edit, Bash
- AskUserQuestion

**Detects:**
- Language and framework
- Test coverage level
- Optimal methodology (TDD, DDD, Hybrid)

---

### manager-strategy

**Purpose:** System design and architecture decisions.

**Triggers:**
- Complex feature planning
- Architecture decisions
- Technology selection

**Tools:**
- Read, Grep, Glob
- WebSearch, WebFetch
- AskUserQuestion

**Deliverables:**
- System architecture diagrams
- Technology recommendations
- Risk assessment
- Implementation strategy

---

### manager-git

**Purpose:** Git operations and branching strategy.

**Triggers:**
- Git workflow requests
- Branch management
- Commit validation

**Tools:**
- Bash (git commands)
- Read, Grep

**Validates:**
- Conventional commit format
- Branch naming conventions
- Commit message quality

---

## Expert Agents (9)

Domain-specific implementation and analysis.

### expert-backend

**Purpose:** API and server development.

**Domains:**
- REST APIs, GraphQL
- Database integration
- Authentication, authorization
- Middleware, error handling

**Languages:** Go, Python, Node.js, Rust, Java, C#, Elixir, PHP

**Tools:** Read, Write, Edit, Grep, Glob, Bash

---

### expert-frontend

**Purpose:** UI and client development.

**Domains:**
- React, Vue, Angular, Svelte
- State management
- Component architecture
- Responsive design

**Languages:** TypeScript, JavaScript, Swift, Kotlin, Dart

**Tools:** Read, Write, Edit, Grep, Glob, Bash

---

### expert-security

**Purpose:** Security analysis and implementation.

**Domains:**
- OWASP Top 10 mitigation
- Input validation
- Authentication/authorization
- Encryption, hashing
- Security audits

**Tools:** Read, Grep, Glob, Bash
**Model:** Opus (critical security tasks)

---

### expert-devops

**Purpose:** CI/CD and infrastructure.

**Domains:**
- Docker, Kubernetes
- CI/CD pipelines
- Cloud deployment
- Infrastructure as Code

**Tools:** Read, Write, Edit, Grep, Glob, Bash

---

### expert-performance

**Purpose:** Performance optimization.

**Domains:**
- Profiling and analysis
- Database optimization
- Caching strategies
- Load testing

**Tools:** Read, Grep, Glob, Bash

---

### expert-debug

**Purpose:** Debugging and troubleshooting.

**Domains:**
- Error analysis
- Root cause identification
- Log analysis
- Crash debugging

**Tools:** Read, Grep, Glob, Bash, LSP diagnostics

**Model:** Sonnet (balanced speed/quality)

---

### expert-testing

**Purpose:** Test creation and strategy.

**Domains:**
- Unit tests, integration tests
- Test coverage analysis
- Test strategy design
- Mutation testing

**Tools:** Read, Write, Edit, Grep, Glob, Bash

---

### expert-refactoring

**Purpose:** Code refactoring and improvement.

**Domains:**
- Code smell elimination
- Design patterns
- SOLID principles
- Technical debt reduction

**Tools:** Read, Write, Edit, Grep, Glob, Bash

---

### expert-chrome-extension

**Purpose:** Chrome Extension development.

**Domains:**
- Manifest V3
- Content scripts, service workers
- Chrome APIs
- Extension architecture

**Tools:** Read, Write, Edit, Grep, Glob, Bash

---

## Builder Agents (3)

Create new MoAI components.

### builder-agent

**Purpose:** Create new agent definitions.

**Creates:**
- `.claude/agents/<name>.md`
- Agent frontmatter (YAML)
- Agent description and triggers

**Tools:** Read, Write, Edit

---

### builder-skill

**Purpose:** Create new skills.

**Creates:**
- `.claude/skills/<name>.md`
- Skill frontmatter (YAML)
- Progressive disclosure config
- Trigger keywords

**Tools:** Read, Write, Edit

---

### builder-plugin

**Purpose:** Create plugins.

**Creates:**
- Plugin structure
- MCP server configuration
- Integration points

**Tools:** Read, Write, Edit

---

## Team Agents (8) - Experimental

Parallel development with Agent Teams mode.

### team-researcher

**Model:** haiku (fast, read-only)
**Purpose:** Codebase exploration and research
**Mode:** plan (read-only)

---

### team-analyst

**Model:** inherit
**Purpose:** Requirements analysis
**Mode:** plan (read-only)

---

### team-architect

**Model:** inherit
**Purpose:** Technical design
**Mode:** plan (read-only)

---

### team-backend-dev

**Model:** inherit
**Purpose:** Server-side implementation
**Mode:** acceptEdits (auto-accept file changes)

---

### team-designer

**Model:** inherit
**Purpose:** UI/UX design with Pencil/Figma MCP
**Mode:** acceptEdits

---

### team-frontend-dev

**Model:** inherit
**Purpose:** Client-side implementation
**Mode:** acceptEdits

---

### team-tester

**Model:** inherit
**Purpose:** Test creation
**Mode:** acceptEdits
**Special:** Exclusive test file ownership

---

### team-quality

**Model:** inherit
**Purpose:** TRUST 5 quality validation
**Mode:** plan (read-only)

---

## Agent Invocation

### Sub-Agent Mode

```bash
# Via MoAI commands
/moai plan "Add feature"    # Uses manager-spec
/moai run SPEC-XXX          # Uses manager-ddd/tdd

# Via explicit delegation
"Use the expert-backend subagent to implement the API"
```

### Agent Teams Mode

```bash
# Force team mode
/moai plan "Large feature" --team
/moai run SPEC-XXX --team

# Auto-selection (complexity-based)
/moai run SPEC-XXX  # Auto-selects if complexity >= threshold
```

---

## Model Assignment

| Policy | Plan | Run | Sync | Quality |
|--------|------|-----|------|---------|
| **High** | Opus | Opus/Sonnet | Sonnet | Opus |
| **Medium** | Sonnet | Sonnet | Sonnet | Sonnet |
| **Low** | Sonnet | Sonnet | Haiku | Sonnet |

Configure via: `moai update -c`

---

## References

- [Development Guide](./development.md)
- [Agent Authoring](../moai-adk/.claude/rules/moai/development/agent-authoring.md)
- [Agent Teams Workflow](../moai-adk/.claude/skills/moai/workflows/team-run.md)

---

*Last updated: 2026-03-01*
