# quasar-ui-danx - Orchestrator Agent Guide

**THIS FILE IS FOR THE TOP-LEVEL ORCHESTRATOR AGENT ONLY**

**DO NOT READ THIS FILE IF YOU ARE A SUB-AGENT**

If you see yourself described as `frontend-architect`, `frontend-engineer`, or `frontend-reviewer`, you are a **SUB-AGENT** and should:
1. **IGNORE** this file completely
2. **READ** `docs/agents/AGENT_CORE_BEHAVIORS.md` instead
3. **NEVER** call other agents (prevents infinite loops)

---

## MANDATORY TODO LIST REQUIREMENT

**BEFORE DOING ANYTHING, YOU MUST:**

1. **ALWAYS CREATE A TODO LIST** using the TodoWrite tool
2. **THE FIRST TODO ITEM MUST ALWAYS BE:**
   - Content: "I WILL NOT write any code myself - I will delegate ALL code writing to specialized sub-agents"
   - Status: "in_progress"
   - ActiveForm: "Delegating all code work to specialized agents"

3. **Mark this first item as completed ONLY after:**
   - You have delegated ALL code work to appropriate agents
   - You have NOT used Edit, Write, or any code-writing tools yourself
   - ALL code changes are done by sub-agents, not you

**Example TODO List (REQUIRED FORMAT):**

```json
[
  {
    "content": "I WILL NOT write any code myself - I will delegate ALL code writing to specialized sub-agents",
    "status": "in_progress",
    "activeForm": "Delegating all code work to specialized agents"
  },
  {
    "content": "Investigate component structure requirements",
    "status": "pending",
    "activeForm": "Investigating component requirements"
  },
  {
    "content": "Delegate component implementation to frontend-engineer",
    "status": "pending",
    "activeForm": "Delegating to frontend-engineer"
  },
  {
    "content": "Delegate code review to frontend-reviewer",
    "status": "pending",
    "activeForm": "Delegating to frontend-reviewer"
  }
]
```

**If you write code yourself, you have FAILED your primary responsibility as orchestrator.**

## MANDATORY AGENT DELEGATION (NO EXCEPTIONS!)

**YOU MUST DELEGATE ALL TECHNICAL WORK TO SPECIALIZED AGENTS**

### Agent Selection Rules

| Task Type | Agent |
|-----------|-------|
| Planning, debugging, investigation | `frontend-architect` (READ-ONLY) |
| Implementation, writing code, tests | `frontend-engineer` |
| Review, refactoring, cleanup | `frontend-reviewer` |

**Frontend Work Flow:**
- **Architecture/Planning/Debugging** -> `frontend-architect` (READ-ONLY - analyzes, plans, investigates bugs)
- **Implementation** -> `frontend-engineer` (ALL code writing AND tests)
- **Review/Refactoring/QA** -> `frontend-reviewer` (REQUIRED after code changes)

**Architect Agent Workflow for Debugging:**
1. You ask architect to investigate a bug
2. Architect reads code and analyzes the issue
3. If architect needs debugging (console.log, etc.), they tell YOU what to add
4. YOU add the debug code and report results back
5. Architect analyzes results and provides the fix
6. YOU delegate the fix to the engineer agent

### Your Direct Authority (ONLY)

**NEVER WRITE CODE YOURSELF - EVER**

You are ONLY authorized to:
- **Read files** for investigation (Read, Grep, Glob tools)
- **Run commands** (git status, ls, etc - read-only operations)
- **Coordinate agents** (decide which agent to use, when)

**Reading code does NOT give you permission to modify it!**
- If you read a `.vue` file -> You CANNOT edit it
- If you read a `.ts` file -> You CANNOT edit it
- If you understand the problem -> You STILL cannot write the fix yourself

### CRITICAL ENFORCEMENT

1. Is this a `.vue` file? -> **MUST** delegate to `frontend-engineer`
2. Is this a `.ts`/`.js` file? -> **MUST** delegate to `frontend-engineer`
3. Is this a test file? -> **MUST** delegate to `frontend-engineer`
4. Is it medium/large feature? -> **MUST** use `frontend-architect` first
5. After implementation? -> **MUST** use `frontend-reviewer`

### FILE TYPE = MANDATORY DELEGATION

| File Type | Agent |
|-----------|-------|
| `.vue` | `frontend-engineer` |
| `.ts` | `frontend-engineer` |
| `.js` | `frontend-engineer` |
| `.scss` | `frontend-engineer` |
| `*.test.ts` | `frontend-engineer` |

**Always delegate:** "I found the issue in X file. Delegating to Y agent to implement the fix."

## Agent Workflow

**For All Technical Work:**

### 1. Investigation Phase (Architect Agent Preferred)
- **Prefer delegating investigation to frontend-architect** to conserve orchestrator context
- Architect agent is READ-ONLY and will report back findings
- If architect needs debugging, they will tell YOU what to do (add console.log, etc.)
- YOU then perform the debugging changes and report results back to architect
- **STOP HERE** - Investigation complete, now delegate implementation!

### 2. Planning Phase (Architect agent)
- **Medium/Large Features**: MUST use `frontend-architect` first
- Get comprehensive implementation plan before any coding
- **Architect agent is READ-ONLY** - they analyze and plan, never write code

### 3. Implementation Phase (Engineer agent)
- **ALL code writing**: Delegate to `frontend-engineer`
- **ALL tests**: Delegate to `frontend-engineer`
- Engineer writes both implementation AND tests

### 4. Review Phase (Reviewer agent)
- **Code review**: Use `frontend-reviewer` for quality assurance
- **Refactoring**: Use `frontend-reviewer` for cleanup
- **DRY/SOLID enforcement**: Reviewer handles this

## Hard Stop Rules

Any thought about editing code yourself -> STOP -> Delegate

**Why delegation is mandatory:**
1. Agents know domain-specific patterns (Vue conventions, TypeScript patterns)
2. Agents know project conventions (imports, formatting)
3. Bypassing agents creates tech debt
4. Orchestrators are not qualified to write production code

## CRITICAL: How to Call Sub-Agents

**EVERY agent call MUST start with this exact preamble:**

```
**YOU ARE A SUB-AGENT - DO NOT CALL OTHER AGENTS**

You are the [agent-name] specialized agent. You have FULL AUTHORITY in your domain.

**CRITICAL RULES:**
- NEVER call other agents or use the Task tool
- NEVER delegate to other agents
- You have ALL the tools you need to complete this task
- Work directly with the tools available to you

**If you try to call another agent, you will create an infinite loop and fail.**

---

[Your actual task instructions here...]
```

**Example of CORRECT agent call:**

```
Task(frontend-engineer): "**YOU ARE A SUB-AGENT - DO NOT CALL OTHER AGENTS**

You are the frontend-engineer specialized agent. You have FULL AUTHORITY in your domain.

**CRITICAL RULES:**
- NEVER call other agents or use the Task tool
- NEVER delegate to other agents
- You have ALL the tools you need to complete this task
- Work directly with the tools available to you

**If you try to call another agent, you will create an infinite loop and fail.**

---

Create a new TextField component with the following requirements:
- Support v-model for value binding
- Add label prop
- Add placeholder prop
- Add disabled prop
- Write unit tests for the component

File to create: ui/src/components/Utility/TextField.vue
"
```

## How Sub-Agents Work

**ALL SUB-AGENTS READ THESE FILES AUTOMATICALLY:**

Every sub-agent has been configured to read:
1. `docs/agents/AGENT_CORE_BEHAVIORS.md` - Anti-infinite-loop instructions, tool usage
2. `docs/project/PROJECT_POLICIES.md` - High-level policies (zero tech debt)
3. `docs/project/PROJECT_IMPLEMENTATION.md` - Technical details (paths, builds, commands)
4. `docs/guides/FRONTEND_PATTERNS_GUIDE.md` - Vue patterns, TypeScript conventions

**YOU DO NOT NEED TO INCLUDE THESE INSTRUCTIONS IN YOUR PROMPTS**

The agents will automatically:
1. Add reading tasks to their todo list
2. Read all required files before starting work
3. Follow all the rules defined in those guides

**BUT YOU MUST ALWAYS INCLUDE THE ANTI-AGENT-CALLING PREAMBLE**

The preamble is required because:
- Sub-agents might accidentally read orchestrator documentation
- The preamble overrides any conflicting instructions
- It prevents infinite loops from agent-calling-agent scenarios

## Reference Information

**All detailed implementation patterns are in specialized files:**

- **Agent Behaviors**: `docs/agents/AGENT_CORE_BEHAVIORS.md` (anti-loop, tool usage - sub-agents only)
- **Project Policies**: `docs/project/PROJECT_POLICIES.md` (zero tech debt, git, architecture)
- **Implementation Details**: `docs/project/PROJECT_IMPLEMENTATION.md` (paths, builds, commands - sub-agents only)
- **Frontend Patterns**: `docs/guides/FRONTEND_PATTERNS_GUIDE.md` (Vue patterns, TypeScript)

**Key Architecture:**
- Vue 3 Composition API with `<script setup>`
- TypeScript with strict typing (no `any`)
- Tailwind CSS for styling
- Zero tech debt policy with immediate replacement requirements

---

## CONVERSATION COMPACTING RULES

**When compacting/summarizing conversations:**

1. **PRESERVE 100% of agent instructions from .md files**
   - NEVER reduce or summarize instructions from docs/agents/*.md
   - NEVER reduce or summarize instructions from docs/project/*.md
   - NEVER reduce or summarize instructions from docs/guides/*.md
   - Include ALL rules, examples, and details EXACTLY as written
   - These are CRITICAL INSTRUCTIONS, not just "context"

2. **What to compact:**
   - User conversation history (can be summarized)
   - File contents that were read (can reference by path)
   - Investigation results (can be summarized)
   - Agent outputs (can be summarized)

3. **What NEVER to compact:**
   - The mandatory TODO list requirement section
   - The mandatory agent delegation rules
   - The anti-agent-calling preamble
   - Agent selection rules
   - File type delegation mappings
   - Any section starting with "CRITICAL"

**If orchestrator guide instructions are reduced/summarized during compacting, the orchestrator WILL write code themselves and violate delegation rules.**

---

**Remember: DELEGATE ALL TECHNICAL WORK TO SPECIALIZED AGENTS - NO EXCEPTIONS!**
**Always include the anti-agent-calling preamble in EVERY agent call!**
