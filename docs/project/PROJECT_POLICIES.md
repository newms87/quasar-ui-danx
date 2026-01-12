# quasar-ui-danx - Project Policies

**This file contains high-level policies that apply to ALL agents and the orchestrator.**

Read this file to understand the project's philosophy, architectural principles, and governance rules.

---

## Zero Tech Debt Policy

**ABSOLUTE ZERO BACKWARDS COMPATIBILITY** - No exceptions, ever

When implementing changes:

1. **IMMEDIATE REPLACEMENT** - Never work around legacy patterns
2. **COMPLETE REMOVAL** - Delete old code entirely, no compatibility layers
3. **ZERO BACKWARDS COMPATIBILITY** - Update ALL related code to new pattern instantly
4. **NO GRADUAL MIGRATION** - Replace everything in one atomic change
5. **COMPREHENSIVE TESTING** - Ensure complete replacement works correctly

If you find legacy code or old patterns:
- Replace them completely and immediately
- Remove ALL dead code
- Update ALL references to use the new pattern
- No backwards compatibility layers
- No gradual migrations

**Rationale:** Tech debt compounds exponentially. Maintaining multiple patterns or compatibility layers creates confusion, bugs, and maintenance burden. ONE correct way to do everything.

---

## Git Operations Policy

**CRITICAL: GIT OPERATIONS - READ ONLY!**

**NEVER USE GIT COMMANDS THAT MAKE CHANGES**

**ONLY READ-ONLY GIT COMMANDS ALLOWED:**
- `git status`
- `git log`
- `git diff`
- `git show`
- `git branch` (list only)

**ABSOLUTELY FORBIDDEN:**
- `git add`
- `git commit`
- `git push`
- `git pull`
- `git merge`
- `git rebase`
- `git reset`
- `git checkout`
- `git stash`
- ANY command that modifies repository state

**Rationale:** User handles ALL git operations that modify the repository. This prevents accidental commits, branch switches, or repository state changes that could disrupt the user's workflow.

---

## Key Architecture Patterns

These patterns are mandatory across the entire codebase:

### Vue Components
- **Vue 3 Composition API** with `<script setup>` syntax
- NO Options API or Vue 2 patterns
- TypeScript for all components
- Tailwind CSS for ALL styling (no inline styles)

### TypeScript
- **Strict typing** - No `any` types
- **Explicit return types** for public functions
- **Interface over type** for extensible object shapes
- **Generics** for reusable code

### Component Organization
- **Single Responsibility** - One component = one purpose
- **Small Components** - Under 200 lines
- **Composables** for shared logic
- **Helpers** for pure utility functions

### Testing
- **Vitest** for unit testing
- **Test-First for bugs** - Write failing test, then fix
- Focus on behavior, not implementation details

**Rationale:** Consistency enables developers to navigate the codebase quickly. Every component looks like every other component. Every pattern follows the same conventions.

---

## Code Quality Philosophy

### Always:
- Read existing implementations BEFORE any code work
- Follow established patterns exactly
- Write comprehensive tests for new functionality
- Use proper TypeScript types everywhere
- Add JSDoc comments for public APIs

### Never:
- Create custom patterns when established ones exist
- Add backwards compatibility layers
- Use deprecated features or syntax
- Leave TODO comments without implementation
- Use `any` types
- Skip tests for "simple" changes
- Leave dead/unused code

**Rationale:** Pattern consistency >>> clever solutions. A "worse" solution that follows established patterns is better than a "better" solution that introduces new patterns.

---

## DRY/SOLID Enforcement

### DRY (Don't Repeat Yourself)
- If you see the same code 3+ times, extract it
- Use composables for shared component logic
- Use helpers for shared utility functions
- Never copy-paste code

### SOLID Principles

1. **Single Responsibility**
   - Each component does ONE thing
   - Each function has ONE purpose
   - Each file has ONE focus

2. **Open/Closed**
   - Components extensible via props/slots
   - Avoid modifying existing components for new features
   - Create new components that compose existing ones

3. **Liskov Substitution**
   - Child components work wherever parent is used
   - Maintain consistent prop/emit interfaces

4. **Interface Segregation**
   - Don't force components to depend on unused props
   - Split large interfaces into focused ones

5. **Dependency Inversion**
   - Depend on abstractions (types, interfaces)
   - Not on concrete implementations

---

## Dead Code Policy

**ZERO TOLERANCE for dead code**

Dead code includes:
- Unused imports
- Unused variables
- Unused functions
- Commented-out code
- Deprecated features still present
- Old implementations kept "just in case"

**Action:** DELETE IT. Do not comment it out. Do not keep it around. Git history exists if we ever need it back.

---

## Legacy Code Policy

**ZERO TOLERANCE for legacy patterns**

Legacy patterns include:
- Options API (`export default { }`)
- Vue 2 syntax
- Old library APIs
- Deprecated TypeScript features
- `any` types

**Action:** CONVERT IT immediately. Do not add new code that uses legacy patterns. Do not leave legacy patterns in place.

---

## Reference Documentation

**Domain-Specific Guides:**
- **Agent Behaviors**: `docs/agents/AGENT_CORE_BEHAVIORS.md`
- **Implementation Details**: `docs/project/PROJECT_IMPLEMENTATION.md`
- **Frontend Patterns**: `docs/guides/FRONTEND_PATTERNS_GUIDE.md`

**Agent Locations:**
- Agent files are located at: `.claude/agents/*.md`
- Available agents: `frontend-architect`, `frontend-engineer`, `frontend-reviewer`

---

**These policies apply to ALL work in this project. No exceptions.**
