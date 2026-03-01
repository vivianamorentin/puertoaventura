# moai-adk CLI Commands

Complete reference for all moai-adk CLI commands.

---

## Command Overview

```bash
moai <command> [options]
```

| Command | Purpose | Usage |
|---------|---------|-------|
| `init` | Initialize a new project | `moai init <name>` |
| `doctor` | System health check | `moai doctor` |
| `status` | Project status | `moai status` |
| `update` | Update MoAI-ADK | `moai update` |
| `worktree` | Git worktree management | `moai worktree <subcommand>` |
| `hook` | Claude Code hook dispatcher | `moai hook <event>` |
| `version` | Display version | `moai version` |

---

## init

Initialize a new MoAI project with interactive wizard.

```bash
moai init <project-name> [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--mode <mode>` | Development mode: `ddd`, `tdd`, `hybrid` |
| `--policy <policy>` | Model policy: `high`, `medium`, `low` |
| `--force` | Overwrite existing files |

### What It Creates

```
my-project/
├── .claude/
│   ├── settings.json         # Claude Code settings
│   ├── agents/               # Custom agent definitions
│   ├── commands/             # Slash commands
│   ├── hooks/                # Hook scripts
│   ├── rules/                # Project rules
│   └── skills/               # Custom skills
├── .moai/
│   ├── config/               # MoAI configuration
│   │   └── sections/
│   │       ├── quality.yaml
│   │       ├── language.yaml
│   │       ├── user.yaml
│   │       ├── workflow.yaml
│   │       └── statusline.yaml
│   ├── project/              # Project docs
│   │   ├── product.md
│   │   ├── structure.md
│   │   └── tech.md
│   └── specs/                # SPEC documents
└── CLAUDE.md                 # MoAI execution directives
```

### Interactive Wizard

```bash
$ moai init my-app
? Language: TypeScript
? Framework: Next.js
? Development mode: Hybrid
? Model policy: Medium
? Enable agent teams: Yes
✓ Project initialized
```

---

## doctor

Run system health checks.

```bash
moai doctor
```

### Checks

| Check | Description |
|-------|-------------|
| Go version | Go 1.25+ installed |
| Git | Git available and configured |
| Claude Code | Claude Code CLI detected |
| Project structure | Valid MoAI project structure |
| Configuration | Valid YAML configuration |
| LSP servers | Required LSP servers available |

### Example Output

```bash
$ moai doctor
✓ Go 1.25.2 installed
✓ Git 2.43.0 configured
✓ Claude Code 2.1.38 detected
✓ Project structure valid
✓ Configuration valid
✓ 8 LSP servers available

System health: OK
```

---

## status

Display project status summary.

```bash
moai status
```

### Output

```bash
$ moai status
Project: puerto-aventuras-app
Branch: feature/auth
Mode: Hybrid (TDD for new, DDD for legacy)

Quality:
  Coverage: 87.3%
  Lint Errors: 0
  Type Errors: 0
  Status: PASSED

Active SPECs:
  SPEC-AUTH-001 (In Progress)
  SPEC-WALLET-001 (Planning)

MoAI Version: v2.2.5
```

---

## update

Update MoAI-ADK to the latest version.

```bash
moai update [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--check` | Check for updates without installing |
| `--project` | Update project templates only |
| `-c` | Reconfigure project (run wizard) |

### Examples

```bash
# Check for updates
moai update --check

# Update to latest version
moai update

# Update project templates only
moai update --project

# Reconfigure project
moai update -c
```

### Auto-Rollback

If update fails, MoAI-ADK automatically rolls back to previous version.

---

## worktree

Git worktree management for parallel development.

```bash
moai worktree <subcommand> [options]
```

### Subcommands

| Subcommand | Purpose |
|------------|---------|
| `new <name>` | Create new worktree |
| `list` | List active worktrees |
| `switch <name>` | Switch to worktree |
| `sync` | Sync with upstream |
| `remove <name>` | Remove worktree |
| `clean` | Clean up stale worktrees |
| `go <name>` | Navigate to worktree |

### Examples

```bash
# Create new worktree for SPEC
moai worktree new SPEC-AUTH-001
# Creates: ../moai-adk.SPEC-AUTH-001/

# List worktrees
moai worktree list
# * main            (active)
#   SPEC-AUTH-001
#   SPEC-WALLET-001

# Switch worktree
moai worktree switch SPEC-AUTH-001

# Remove worktree
moai worktree remove SPEC-AUTH-001

# Clean stale worktrees
moai worktree clean
```

---

## hook

Claude Code hook dispatcher (internal use).

```bash
moai hook <event> < <json-input>
```

### Events

| Event | Description |
|-------|-------------|
| `session-start` | Session started |
| `session-end` | Session ended |
| `user-prompt` | User sent message |
| `response` | AI response completed |
| `pre-tool-use` | Before tool execution |
| `post-tool-use` | After tool execution |
| `agent-launch` | Subagent launched |
| `subagent-stop` | Subagent stopped |

### Usage

Hooks are called automatically by Claude Code via settings.json:

```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "command": "\"$CLAUDE_PROJECT_DIR/.claude/hooks/moai/handle-session-start.sh\""
      }]
    }]
  }
}
```

---

## version

Display MoAI-ADK version information.

```bash
moai version
```

### Output

```bash
$ moai version
MoAI-ADK v2.2.5
Commit: abc123def
Build Date: 2026-03-01T10:00:00Z
Go Version: go1.25.2
```

---

## Global Options

| Option | Description |
|--------|-------------|
| `--help, -h` | Display help for command |
| `--verbose, -v` | Verbose output |
| `--quiet, -q` | Quiet output |

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Hook returned "keep working" |
| 64 | Invalid usage |
| 70 | Internal software error |
| 71 | OS error |
| 74 | I/O error |

---

## Configuration Files

### Global Config

`~/.moai/config/config.yaml`

### Project Config

`.moai/config/config.yaml`

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `MOAI_USER_NAME` | User name for commits |
| `MOAI_CONVERSATION_LANG` | Conversation language (ko, en, ja, zh) |
| `MOAI_DEVELOPMENT_MODE` | Override development mode |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | Enable agent teams (1=enabled) |

---

## References

- [Development Guide](./development.md)
- [Quality Gates](./quality-gates.md)
- [Project Setup](../getting-started.md)

---

*Last updated: 2026-03-01*
