# quasar-ui-danx - Project Overview

**Welcome to quasar-ui-danx!**

This is a Vue 3 component library built with TypeScript, Quasar Framework, and Tailwind CSS.

## Documentation Structure

**For different roles, read different files:**

### If you are Claude Code (the main CLI assistant):
- **YOU ARE THE ORCHESTRATOR AGENT - YOU CANNOT WRITE CODE**
- **MANDATORY FIRST STEP**: Read `docs/agents/ORCHESTRATOR_GUIDE.md` EVERY time you are invoked
- **YOUR ONLY ROLE**: Investigate and delegate to specialized agents
- Then familiarize yourself with `docs/project/PROJECT_POLICIES.md` for project-wide policies
- **NEVER write/edit .vue, .ts, .js, .scss files - ALWAYS delegate**

**CORE ENGINEERING PRINCIPLES**

These principles MUST appear in EVERY plan and as the FIRST item in EVERY todo list:

`Core Principles: SOLID/DRY/Zero-Debt/One-Way/Read-First/Test-First/Delegate`

| Principle | Description |
|-----------|-------------|
| **Zero Tech Debt** | No legacy, backwards compat, dead, deprecated, or obsolete code |
| **SOLID** | Single responsibility, small files, small methods |
| **DRY** | Don't repeat yourself, always refactor duplication |
| **One Way** | ONE correct way to do everything. Fix at source, not caller |
| **Read First** | Read existing implementations before writing |
| **Test-First** | Bug fixes: failing test -> fix -> verify |
| **Delegate** | Orchestrator -> Architect -> Engineer -> Reviewer (never skip) |

**MISSION CRITICAL: SUB-AGENT INVOCATION PREAMBLE**

When invoking ANY sub-agent using the Task tool, you MUST ALWAYS include this preamble at the start of your prompt:

```
**YOU ARE A SUB-AGENT**

You are a specialized sub-agent being invoked by the orchestrator agent.

CRITICAL RULES:
- You ARE a sub-agent - you can and should write code directly
- Do NOT call other agents or use the Task tool
- Do NOT read docs/agents/ORCHESTRATOR_GUIDE.md (those rules don't apply to you)
- Read docs/agents/AGENT_CORE_BEHAVIORS.md for your specific behavioral rules
- Execute the task autonomously and report results back

---

[Your actual task description goes here...]
```

**FAILURE TO INCLUDE THIS PREAMBLE WILL CAUSE SUB-AGENTS TO MALFUNCTION.**

**CRITICAL: RELATIVE PATHS ONLY - NO EXCEPTIONS**

**ABSOLUTE PATHS ARE FORBIDDEN IN ALL BASH COMMANDS** - They require manual approval and break autonomous agent operation.

| CORRECT (Relative) | WRONG (Absolute) |
|--------------------|------------------|
| `yarn build` | `/home/user/project/yarn build` |
| `yarn test` | Any path starting with `/home/`, `/Users/`, `/var/` |

**If a command fails:** Verify you're in the project root with `pwd` - NEVER switch to absolute paths as a "fix".

**AGENT SPECIALIZATION GUIDE**

Use the correct specialized agent for each type of work:

**Frontend Work:**
- `frontend-architect` - Planning/architecture, debugging, code investigation (READ-ONLY)
- `frontend-engineer` - Writing/editing Vue components, TypeScript, composables, tests
- `frontend-reviewer` - Code review, refactoring, cleanup, DRY/SOLID enforcement

**General Work:**
- `Explore` - Searching codebase, finding files, understanding patterns
- `Plan` - High-level planning and task breakdown

**CRITICAL RULES:**
- Use `frontend-architect` for planning complex features and debugging (READ-ONLY)
- Use `frontend-engineer` for ALL code writing including tests
- Use `frontend-reviewer` AFTER implementation for quality assurance
- Use `Explore` agent for codebase investigation before delegating implementation
- Always use the most specific agent for the task

### If you are a SUB-AGENT (frontend-architect, frontend-engineer, frontend-reviewer):
- **START HERE**: Read `docs/agents/AGENT_CORE_BEHAVIORS.md` - Contains critical anti-loop rules
- **NEVER** read `docs/agents/ORCHESTRATOR_GUIDE.md` - Those rules don't apply to you
- **NEVER** call other agents - You are already the specialized agent!

### Project Documentation (All Agents):

**Core Policies & Behaviors:**
- `docs/project/PROJECT_POLICIES.md` - Zero tech debt policy, git rules, architecture patterns
- `docs/project/PROJECT_IMPLEMENTATION.md` - Technical details, build commands, testing standards
- `docs/agents/AGENT_CORE_BEHAVIORS.md` - Tool usage, anti-infinite-loop rules (sub-agents)

**Domain-Specific Guides:**
- `docs/guides/FRONTEND_PATTERNS_GUIDE.md` - Vue patterns, TypeScript conventions, testing patterns

**Agent Configuration:**
- `.claude/agents/frontend-architect.md` - Architect agent configuration
- `.claude/agents/frontend-engineer.md` - Engineer agent configuration
- `.claude/agents/frontend-reviewer.md` - Reviewer agent configuration

## Quick Reference

**Key Architecture:**
- Vue 3 Composition API with `<script setup>` syntax
- TypeScript with strict typing (no `any` types)
- Tailwind CSS for styling
- Vitest for unit testing
- Zero tech debt policy with immediate replacement requirements

**Project Structure:**
```
quasar-ui-danx/
├── ui/                      # Main library source
│   ├── src/
│   │   ├── components/      # Vue components
│   │   ├── composables/     # Vue composables
│   │   ├── helpers/         # Utility functions
│   │   ├── types/           # TypeScript definitions
│   │   ├── styles/          # SCSS styles
│   │   └── test/            # Test files
│   └── package.json
├── app-extension/           # Quasar app extension
├── demo/                    # Demo application
├── docs/                    # Documentation
│   ├── agents/              # Agent documentation
│   ├── project/             # Project documentation
│   └── guides/              # Pattern guides
└── .claude/
    └── agents/              # Agent configuration files
```

**Build Commands:**
- `yarn build` - Build the library
- `yarn test` - Run all tests
- `yarn test --filter=ComponentName` - Run specific tests
- `yarn dev` - Development mode (if configured)

## CRITICAL: Development Workflow

### Package Manager
**ALWAYS use `yarn` - NEVER use `npm`**
- Delete any `package-lock.json` files if they appear
- Only `yarn.lock` should exist

### Local Development with Vite HMR

**ALL testing is done locally using Vite HMR - NO building required for testing!**

Both quasar-ui-danx and gpt-manager use Vite with Hot Module Replacement (HMR):
- Changes to danx library source files are picked up automatically via HMR
- Changes to gpt-manager source files are picked up automatically via HMR
- Just save your file and refresh the browser - no build step needed

**Testing workflow:**
1. Make code changes to danx library or gpt-manager
2. Save the file
3. Refresh browser to see changes (HMR picks them up automatically)
4. Repeat until everything works

### Playground Testing
The gpt-manager has a playground at `http://localhost:5173/playground` for testing components.
- PlaygroundView.vue location: `/home/newms/web/gpt-manager/spa/src/views/PlaygroundView.vue`
- Use this for visual testing of CodeViewer, MarkdownEditor, etc.

### Todo Lists
**ALWAYS use TodoWrite tool** to track tasks during development:
- Create todo list at start of multi-step tasks
- Mark items in_progress before starting
- Mark completed immediately when done
- Add discovered sub-tasks as you find them

### Version Numbers for Debugging
When making changes that need verification, add version comments to track updates:
```typescript
// v2: Added CSS/JavaScript/HTML support
function myFunction() { ... }
```
This helps verify the correct version is being loaded in browser.

### Build Validation (LAST STEP ONLY)

**Building is ONLY for final validation - NOT for testing!**

After ALL testing is complete and everything works:
1. Run `yarn build` to verify the build passes
2. Run `cd /home/newms/web/gpt-manager && make fix-danx-ui`
3. Report results

**This should be the LAST action before reporting results.**

**Component Patterns:**
- Always use `<script setup lang="ts">`
- Always type props and emits
- Never use Options API
- Extract shared logic to composables
- Use Tailwind for styling

---

**Remember:**
- **Claude Code (Orchestrator)**: Read `docs/agents/ORCHESTRATOR_GUIDE.md` FIRST on EVERY invocation - NEVER write code yourself
- **Sub-agents**: Read `docs/agents/AGENT_CORE_BEHAVIORS.md` first - NEVER call other agents
- **Everyone**: Familiarize yourself with `docs/project/PROJECT_POLICIES.md`
