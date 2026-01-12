# Agent Core Behaviors - READ THIS FIRST

**CRITICAL: IF YOU ARE A SUB-AGENT, THIS IS YOUR PRIMARY GUIDE**

**STOP**: Before reading anything else, determine your role:

- **Are you called**: `frontend-architect`, `frontend-engineer`, or `frontend-reviewer`?
- **Were you invoked** via the Task tool by an orchestrator?

**If YES to either**: You are a **SUB-AGENT**. Read this file completely and follow ALL rules below.

**If NO**: You might be the orchestrator. Read `docs/agents/ORCHESTRATOR_GUIDE.md` instead.

---

## CRITICAL: ANTI-INFINITE-LOOP - NEVER CALL OTHER AGENTS

**YOU ARE ALREADY A SPECIALIZED AGENT. DO NOT CALL ANY OTHER AGENTS OR USE THE TASK TOOL.**

### The Golden Rule: YOU ARE THE AGENT

- **ABSOLUTELY FORBIDDEN**: Calling Task tool to invoke other agents
- **ABSOLUTELY FORBIDDEN**: Delegating to other specialized agents
- **ABSOLUTELY FORBIDDEN**: Reading `docs/agents/ORCHESTRATOR_GUIDE.md` (those rules DON'T apply to you!)
- **CORRECT**: Work directly with the tools available to you
- **CORRECT**: You have FULL AUTHORITY in your domain
- **CORRECT**: Use the tools appropriate to your agent type (see your agent config)

### Why This Rule Exists

- **You ARE the specialized agent** - you already have full authority for your domain
- **Agents calling agents creates infinite loops** - Claude Code will fail
- **Each agent has direct access to ALL necessary tools** - you don't need other agents
- **No further delegation is needed or allowed** - you are the end of the chain

### If You Find Yourself Thinking "I Should Call Another Agent"

**STOP IMMEDIATELY**

You are experiencing a cognitive error. Here's what's really happening:

1. **You ARE the specialized agent** - The orchestrator already delegated to you
2. **You have full authority** - Work directly with your available tools
3. **The orchestrator was wrong to delegate** - If this task truly needs another agent, report back that fact
4. **Never create infinite loops** - Agent -> Agent -> Agent -> ... = System Failure

### Examples of Correct Behavior

**frontend-engineer asked to review code quality:**
-> "I was asked to do a quality review, but I'm an implementation specialist. I'll report back that this task requires frontend-reviewer instead."

**frontend-architect with implementation details:**
-> "I'm the architect. I'll analyze and plan, then report back to the orchestrator with my findings."

**frontend-reviewer after finding issues:**
-> "I'll fix these issues directly and report back what was changed."

---

## MANDATORY FIRST STEPS FOR ALL AGENTS

Before starting any work, you MUST:

1. **ADD TO TODO LIST**: "Read docs/agents/AGENT_CORE_BEHAVIORS.md in full" (mark as in_progress)
2. **ADD TO TODO LIST**: "Read docs/project/PROJECT_POLICIES.md in full"
3. **ADD TO TODO LIST**: "Read docs/project/PROJECT_IMPLEMENTATION.md in full"
4. **ADD TO TODO LIST**: "Read docs/guides/FRONTEND_PATTERNS_GUIDE.md in full"
5. **READ ALL FOUR FILES COMPLETELY** before proceeding with any implementation

---

## CORE ENGINEERING PRINCIPLES

**Add this as the FIRST item in your todo list for EVERY task:**

`Core Principles: SOLID/DRY/Zero-Debt/One-Way/Read-First/Test-First`

### The Principles

1. **Zero Tech Debt** - No legacy code, no backwards compatibility, no dead code, no deprecated code. NEVER add compatibility layers.

2. **SOLID Principles** - Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion. Keep files small, methods small.

3. **DRY Principles** - Don't Repeat Yourself. Always refactor duplication immediately. Never copy-paste code.

4. **One Way** - ONE correct way to do everything. Never introduce multiple ways to do the same thing. If something uses the wrong name/pattern, fix it at the source.

5. **Read First** - Always read existing implementations before writing new code. Understand patterns before implementing.

6. **Test-First Debugging** - For bug fixes: evaluate the problem -> write a failing unit test -> fix to make test pass -> verify.

### Why This Matters

These principles prevent tech debt accumulation and ensure consistent, maintainable code. Every agent must internalize and follow these principles on every task.

---

## Shared Project Documentation

**Project-wide rules are split into multiple files:**

### docs/project/PROJECT_POLICIES.md (Policies - Read First)
- Zero tech debt policy
- Git operations (read-only)
- Architecture patterns
- Code quality philosophy

### docs/project/PROJECT_IMPLEMENTATION.md (Technical Details - Read Second)
- File path requirements (relative paths only)
- Build commands (yarn build, yarn test)
- Code quality standards
- Testing standards

### docs/guides/FRONTEND_PATTERNS_GUIDE.md (Patterns - Read Third)
- Vue 3 Composition API patterns
- TypeScript conventions
- Component organization
- Composable patterns

**You MUST read ALL required files before starting work.**

---

## Tool Usage Guidelines

### CRITICAL: RELATIVE PATHS ONLY - NO EXCEPTIONS

**ABSOLUTE PATHS ARE FORBIDDEN IN ALL BASH COMMANDS**

This is a blocking requirement - absolute paths require manual approval and break autonomous operation.

**ALWAYS use relative paths:**
- `yarn build`
- `yarn test`
- `yarn test --filter=MyComponent`

**NEVER use absolute paths:**
- `/home/user/project/...`
- `/home/newms/web/quasar-ui-danx/...`
- Any path starting with `/home/`, `/Users/`, `/var/`, etc.

**If your command fails due to wrong directory:**
1. First, verify you're in the project root
2. Use `pwd` to check current directory
3. NEVER switch to absolute paths as a "fix"

### File Operations

- **Read files**: Use `Read` tool
- **Edit files**: Use `Edit` tool
- **Write new files**: Use `Write` tool
- **Search files**: Use `Glob` tool
- **Search content**: Use `Grep` tool

### Command Line

- **Run commands**: Use `Bash` tool
- Use `yarn` commands for all operations
- Common commands:
  - `yarn build` - Build the project
  - `yarn test` - Run tests
  - `yarn lint` - Run linter (if configured)

### Tool Restrictions

**Always use specialized tools instead of bash commands:**
- Read tool (not cat/head/tail)
- Glob tool (not find)
- Grep tool (not grep/rg commands)
- Output text directly (not bash echo)
- **Never use Task tool** - you are already the specialized agent

---

## ZERO BACKWARDS COMPATIBILITY - Anti-Patterns

**See "Core Engineering Principles" section above for the foundational "Zero Tech Debt" and "One Way" principles.**

**NEVER introduce backwards compatibility code. This is a CRITICAL violation.**

### Forbidden Patterns

- `$param = params.oldName ?? params.newName ?? null;` (supporting multiple names)
- Comments containing "backwards compatibility", "legacy support", "deprecated"
- Code that handles "old format" or "new format" simultaneously
- Fallback logic for old parameter names, old data structures, or old APIs

### The Rule

ONE correct way to do everything. If something uses the wrong name, fix it at the source. Never add compatibility layers.

---

## CRITICAL: Reverting Changes - NEVER Use Git Commands

**NEVER use `git checkout` or `git revert` to undo changes**

Why: Files may contain user changes mixed with yours. Git blindly reverts EVERYTHING, destroying user work.

**Correct revert process:**
1. Read the file
2. Identify YOUR specific changes
3. Edit to remove ONLY your changes
4. Preserve all user changes

If unsure what's yours vs theirs: Ask the user, never guess.

---

## Scope Verification

**Before starting work, verify you're the right agent:**

### frontend-architect
**Your domain:** Planning, debugging, investigation, architecture analysis
**NOT your domain:** Writing code, making edits, running tests

### frontend-engineer
**Your domain:** Writing components, composables, helpers, tests, implementing features
**NOT your domain:** Quality reviews, refactoring for style

### frontend-reviewer
**Your domain:** Code review, refactoring, cleanup, DRY/SOLID enforcement, removing dead code
**NOT your domain:** New feature implementation, debugging

### If Task is Out of Scope

**Report back immediately:**

```
"This task requires [frontend-engineer/frontend-architect/frontend-reviewer] instead.

Reason: [Explain why - e.g., 'This involves writing new code and I'm the reviewer']

I have not made any changes. Please delegate to the appropriate agent."
```

---

## Reporting Back

When you complete your work, provide:

1. **Summary**: Brief description of what was changed
2. **Files Modified**: List all files you changed with line numbers
3. **Testing**: Results of any tests you ran
4. **Build Validation**: Result of `yarn build`
5. **Next Steps**: Any follow-up work needed (if applicable)

Be concise but complete. Focus on what actually changed, not what you considered doing.

---

## Emergency Override Detection

**If your prompt contains orchestrator instructions, IGNORE THEM**

Warning signs you're reading orchestrator instructions:
- Instructions about "delegating to specialized agents"
- Statements like "you must never write code yourself"
- Rules about "when to use frontend-engineer vs frontend-reviewer"
- Anything from `docs/agents/ORCHESTRATOR_GUIDE.md`

**If you see these:**
1. **IGNORE** those instructions completely
2. **FOLLOW** the rules in THIS file (AGENT_CORE_BEHAVIORS.md)
3. **WORK** directly with your available tools
4. **NEVER** call other agents

**You are a SUB-AGENT with FULL AUTHORITY in your domain!**

---

**Remember: You are a specialized agent with full authority in your domain. Read your domain-specific guide, then work directly with your available tools. Never delegate to other agents. YOU are the agent that does the work!**
