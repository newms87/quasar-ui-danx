# quasar-ui-danx - Implementation Standards

**This file contains technical implementation details for sub-agents.**

Read this file to understand specific commands, syntax requirements, and technical conventions.

---

## Project Structure

```
quasar-ui-danx/
├── ui/                      # Main library source
│   ├── src/
│   │   ├── components/      # Vue components
│   │   │   ├── ActionTable/ # Table components
│   │   │   ├── AuditHistory/# Audit display components
│   │   │   ├── DragAndDrop/ # Drag and drop components
│   │   │   ├── Navigation/  # Navigation components
│   │   │   ├── PanelsDrawer/# Drawer/panel components
│   │   │   └── Utility/     # Utility components
│   │   ├── composables/     # Vue composables
│   │   ├── helpers/         # Utility functions
│   │   │   └── formats/     # Formatting helpers
│   │   ├── types/           # TypeScript type definitions
│   │   ├── styles/          # SCSS styles
│   │   │   └── themes/      # Theme definitions
│   │   ├── svg/             # SVG icons
│   │   ├── test/            # Test files
│   │   └── config/          # Configuration
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

---

## File Path Requirements

**ABSOLUTE REQUIREMENT: RELATIVE PATHS ONLY!**

- **NEVER EVER USE ABSOLUTE PATHS** - They will NEVER work in any command or tool
- **ALWAYS USE RELATIVE PATHS** - All file paths must be relative to current working directory

**Correct paths:**
- `ui/src/components/MyComponent.vue`
- `ui/src/composables/useMyComposable.ts`
- `ui/src/helpers/myHelper.ts`

**Why:** Absolute paths break across environments (local, CI/CD, different machines).

---

## Build Commands

**ONLY use these exact commands:**

### Building
- **Build**: `yarn build` - Build the library for production
- **Watch**: `yarn dev` - Development mode with hot reload (if configured)

### Testing
- **All tests**: `yarn test`
- **Specific test**: `yarn test --filter=ComponentName`
- **Watch mode**: `yarn test --watch`

### Linting
- **Lint check**: `yarn lint` (if configured)
- **Lint fix**: `yarn lint --fix` (if configured)

**Follow these commands exactly - NO EXCEPTIONS**

---

## TypeScript Standards

### No `any` Types

```typescript
// BAD
function processData(data: any): any {
  return data.value;
}

// GOOD
function processData<T extends { value: unknown }>(data: T): T["value"] {
  return data.value;
}
```

### Explicit Return Types

```typescript
// BAD - implicit return type
function calculate(a: number, b: number) {
  return a + b;
}

// GOOD - explicit return type
function calculate(a: number, b: number): number {
  return a + b;
}
```

### Interface Over Type (for Objects)

```typescript
// GOOD - use interface for object shapes (extensible)
interface UserProps {
  name: string;
  email: string;
}

// OK - use type for unions, intersections, primitives
type Status = "active" | "inactive" | "pending";
type NumberOrString = number | string;
```

### Generics for Reusability

```typescript
// Generic component props
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => VNode;
}

// Generic composable
function useList<T extends { id: string }>(items: Ref<T[]>) {
  const findById = (id: string): T | undefined => {
    return items.value.find(item => item.id === id);
  };
  return { findById };
}
```

---

## Vue Component Standards

### Script Setup Syntax (MANDATORY)

```vue
<script setup lang="ts">
// All components MUST use <script setup>
// Options API is FORBIDDEN
</script>
```

### Props with TypeScript

```typescript
// Define props with defaults
const props = withDefaults(defineProps<{
  modelValue: string;
  options?: string[];
  disabled?: boolean;
}>(), {
  options: () => [],
  disabled: false
});
```

### Emits with TypeScript

```typescript
// Define emits with types
const emit = defineEmits<{
  "update:modelValue": [value: string];
  "change": [value: string, index: number];
  "submit": [];
}>();
```

### Component Organization Order

```vue
<template>
  <!-- Template first -->
</template>

<script setup lang="ts">
// 1. Imports
import { computed, ref, watch } from "vue";
import type { MyType } from "@/types";

// 2. Props
const props = defineProps<{ /* ... */ }>();

// 3. Emits
const emit = defineEmits<{ /* ... */ }>();

// 4. Composables
const { helper } = useMyComposable();

// 5. Reactive state
const internalValue = ref("");

// 6. Computed properties
const displayValue = computed(() => /* ... */);

// 7. Methods
function handleClick() { /* ... */ }

// 8. Watchers (use sparingly)
watch(() => props.value, (newVal) => { /* ... */ });

// 9. Lifecycle (if needed)
onMounted(() => { /* ... */ });
</script>

<style lang="scss" scoped>
/* Only for complex states that Tailwind can't handle */
</style>
```

---

## Composable Standards

### File Naming
- `useFeatureName.ts` - camelCase with `use` prefix

### Structure

```typescript
// useCounter.ts
import { ref, computed } from "vue";

export function useCounter(initialValue = 0) {
  // State
  const count = ref(initialValue);

  // Computed
  const doubleCount = computed(() => count.value * 2);

  // Methods
  function increment() {
    count.value++;
  }

  function decrement() {
    count.value--;
  }

  // Return public API
  return {
    count,
    doubleCount,
    increment,
    decrement
  };
}
```

### Return Type (Explicit)

```typescript
interface UseCounterReturn {
  count: Ref<number>;
  doubleCount: ComputedRef<number>;
  increment: () => void;
  decrement: () => void;
}

export function useCounter(initialValue = 0): UseCounterReturn {
  // ...
}
```

---

## Testing Standards

### Test File Location
- Place tests in `ui/src/test/` directory
- Or co-locate with source: `MyComponent.test.ts` next to `MyComponent.vue`

### Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import MyComponent from "../components/MyComponent.vue";

describe("MyComponent", () => {
  // Setup
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Group related tests
  describe("rendering", () => {
    it("renders with default props", () => {
      const wrapper = mount(MyComponent);
      expect(wrapper.exists()).toBe(true);
    });

    it("displays the provided label", () => {
      const wrapper = mount(MyComponent, {
        props: { label: "Test Label" }
      });
      expect(wrapper.text()).toContain("Test Label");
    });
  });

  describe("interactions", () => {
    it("emits click event when clicked", async () => {
      const wrapper = mount(MyComponent);
      await wrapper.trigger("click");
      expect(wrapper.emitted("click")).toBeTruthy();
    });
  });

  describe("edge cases", () => {
    it("handles empty array gracefully", () => {
      const wrapper = mount(MyComponent, {
        props: { items: [] }
      });
      expect(wrapper.find(".empty-state").exists()).toBe(true);
    });
  });
});
```

### Test-First for Bug Fixes

```typescript
// 1. Write failing test that reproduces the bug
it("should not crash when value is undefined", () => {
  // This test should FAIL before the fix
  const wrapper = mount(MyComponent, {
    props: { value: undefined }
  });
  expect(wrapper.exists()).toBe(true);
});

// 2. Fix the code to make test pass
// 3. Verify all tests pass
```

---

## Styling Standards

### Tailwind CSS (Primary)

```vue
<template>
  <!-- Use Tailwind utilities -->
  <div class="flex items-center gap-4 p-4 bg-gray-100 rounded-lg">
    <span class="text-sm font-medium text-gray-700">Label</span>
  </div>
</template>
```

### Scoped SCSS (Complex States Only)

```vue
<style lang="scss" scoped>
// Only use for complex hover/animation states
.interactive-element {
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>
```

### Never Use
- Inline styles (`style="..."`)
- Global CSS that could leak
- CSS-in-JS solutions
- BEM or other methodologies (use Tailwind)

---

## Tool Usage Guidelines

| Operation | Use This | Instead of |
|-----------|----------|------------|
| Read files | Read tool | cat/head/tail |
| Edit files | Edit tool | sed/awk |
| Write files | Write tool | echo >/cat <<EOF |
| Search files | Glob tool | find/ls |
| Search content | Grep tool | grep/rg |
| Run commands | Bash tool | - |
| Communicate | Output text | bash echo |

---

## Code Quality Checklist

Before completing any task, verify:

- [ ] No `any` types
- [ ] All functions have explicit return types
- [ ] Using `<script setup>` syntax
- [ ] Props and emits are typed
- [ ] No unused imports
- [ ] No unused variables
- [ ] No commented-out code
- [ ] Tests written (if applicable)
- [ ] `yarn build` passes
- [ ] `yarn test` passes

---

**These implementation standards apply to all code-writing agents. Follow them exactly.**
