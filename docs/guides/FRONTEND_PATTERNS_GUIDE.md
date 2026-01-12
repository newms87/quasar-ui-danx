# quasar-ui-danx Frontend Patterns Guide

This guide documents the reusable components, patterns, and conventions used throughout the quasar-ui-danx library.

---

## 1. Component Patterns

### Standard Component Structure

Every component follows this structure:

```vue
<template>
  <div class="my-component">
    <!-- Template content -->
  </div>
</template>

<script setup lang="ts">
// 1. Vue imports
import { computed, ref, watch, onMounted } from "vue";

// 2. Type imports
import type { MyComponentProps, MyOption } from "@/types";

// 3. Component imports
import ChildComponent from "./ChildComponent.vue";

// 4. Composable imports
import { useMyComposable } from "@/composables/useMyComposable";

// 5. Helper imports
import { formatValue } from "@/helpers/formats";

// Props
const props = withDefaults(defineProps<{
  modelValue: string;
  options?: MyOption[];
  disabled?: boolean;
}>(), {
  options: () => [],
  disabled: false
});

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: string];
  "change": [option: MyOption];
}>();

// Composables
const { someHelper } = useMyComposable();

// State
const internalValue = ref(props.modelValue);
const isLoading = ref(false);

// Computed
const displayValue = computed(() => {
  return formatValue(internalValue.value);
});

const isDisabled = computed(() => {
  return props.disabled || isLoading.value;
});

// Methods
function handleChange(value: string): void {
  internalValue.value = value;
  emit("update:modelValue", value);
}

function handleSelect(option: MyOption): void {
  handleChange(option.value);
  emit("change", option);
}

// Watchers (use sparingly)
watch(() => props.modelValue, (newVal) => {
  if (newVal !== internalValue.value) {
    internalValue.value = newVal;
  }
});
</script>

<style lang="scss" scoped>
/* Only for complex hover/animation states */
</style>
```

### Props Patterns

```typescript
// Basic props with defaults
const props = withDefaults(defineProps<{
  label: string;
  value?: string;
  disabled?: boolean;
}>(), {
  value: "",
  disabled: false
});

// Props with complex defaults
const props = withDefaults(defineProps<{
  items: Item[];
  config?: Config;
}>(), {
  items: () => [],
  config: () => ({ enabled: true, limit: 10 })
});

// v-model props
const props = defineProps<{
  modelValue: string;
}>();

// Multiple v-models
const props = defineProps<{
  modelValue: string;
  selected: Item | null;
}>();
```

### Emits Patterns

```typescript
// Basic emits
const emit = defineEmits<{
  "update:modelValue": [value: string];
  "change": [value: string];
  "submit": [];
}>();

// Multiple v-model emits
const emit = defineEmits<{
  "update:modelValue": [value: string];
  "update:selected": [item: Item | null];
}>();

// Complex event payloads
const emit = defineEmits<{
  "select": [item: Item, index: number];
  "error": [error: Error, context: string];
}>();
```

---

## 2. Composable Patterns

### Basic Composable

```typescript
// composables/useToggle.ts
import { ref } from "vue";
import type { Ref } from "vue";

interface UseToggleReturn {
  value: Ref<boolean>;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
}

export function useToggle(initialValue = false): UseToggleReturn {
  const value = ref(initialValue);

  function toggle(): void {
    value.value = !value.value;
  }

  function setTrue(): void {
    value.value = true;
  }

  function setFalse(): void {
    value.value = false;
  }

  return {
    value,
    toggle,
    setTrue,
    setFalse
  };
}
```

### Composable with Dependencies

```typescript
// composables/useAsync.ts
import { ref, computed } from "vue";
import type { Ref, ComputedRef } from "vue";

interface UseAsyncReturn<T> {
  data: Ref<T | null>;
  error: Ref<Error | null>;
  isLoading: Ref<boolean>;
  isSuccess: ComputedRef<boolean>;
  execute: () => Promise<void>;
}

export function useAsync<T>(
  asyncFn: () => Promise<T>
): UseAsyncReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>;
  const error = ref<Error | null>(null);
  const isLoading = ref(false);

  const isSuccess = computed(() => {
    return data.value !== null && error.value === null;
  });

  async function execute(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      data.value = await asyncFn();
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
    } finally {
      isLoading.value = false;
    }
  }

  return {
    data,
    error,
    isLoading,
    isSuccess,
    execute
  };
}
```

### Composable with Cleanup

```typescript
// composables/useEventListener.ts
import { onMounted, onUnmounted } from "vue";

export function useEventListener(
  target: EventTarget,
  event: string,
  handler: EventListener
): void {
  onMounted(() => {
    target.addEventListener(event, handler);
  });

  onUnmounted(() => {
    target.removeEventListener(event, handler);
  });
}
```

---

## 3. TypeScript Patterns

### Interface Definitions

```typescript
// types/components.ts

// Component props interface
export interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
}

// Generic list item
export interface ListItem {
  id: string;
  label: string;
  value: unknown;
}

// Extended interface
export interface SelectItem extends ListItem {
  disabled?: boolean;
  description?: string;
}

// Function type
export type FormatFunction<T> = (value: T) => string;

// Event handler type
export type ClickHandler = (event: MouseEvent) => void;
```

### Generic Components

```typescript
// Generic props
interface ListProps<T extends { id: string }> {
  items: T[];
  selected?: T | null;
  keyField?: keyof T;
}

// Generic emits
interface ListEmits<T> {
  (e: "select", item: T): void;
  (e: "delete", id: string): void;
}

// Usage in component
const props = defineProps<ListProps<MyItem>>();
const emit = defineEmits<ListEmits<MyItem>>();
```

### Type Guards

```typescript
// Type guard function
function isSelectItem(item: unknown): item is SelectItem {
  return (
    typeof item === "object" &&
    item !== null &&
    "id" in item &&
    "label" in item &&
    "value" in item
  );
}

// Usage
function processItem(item: unknown): void {
  if (isSelectItem(item)) {
    // TypeScript knows item is SelectItem here
    console.log(item.label);
  }
}
```

---

## 4. Formatting Patterns

### Format Functions

```typescript
// helpers/formats/numbers.ts

export function fNumber(
  value: number | null | undefined,
  decimals = 0
): string {
  if (value == null) return "";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function fPercent(
  value: number | null | undefined,
  decimals = 1
): string {
  if (value == null) return "";
  return `${fNumber(value * 100, decimals)}%`;
}

export function fCurrency(
  value: number | null | undefined,
  currency = "USD"
): string {
  if (value == null) return "";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency
  });
}
```

### Date Formatting

```typescript
// helpers/formats/datetime.ts

export function fDate(
  date: Date | string | null | undefined,
  format = "short"
): string {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions =
    format === "short"
      ? { month: "short", day: "numeric", year: "numeric" }
      : { month: "long", day: "numeric", year: "numeric" };

  return d.toLocaleDateString("en-US", options);
}

export function fDateTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;

  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}
```

---

## 5. Testing Patterns

### Component Testing

```typescript
import { describe, it, expect, vi } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import Button from "../components/Button.vue";

describe("Button", () => {
  // Factory function for consistent setup
  function createWrapper(props = {}): VueWrapper {
    return mount(Button, {
      props: {
        label: "Click Me",
        ...props
      }
    });
  }

  describe("rendering", () => {
    it("renders the label", () => {
      const wrapper = createWrapper({ label: "Test" });
      expect(wrapper.text()).toContain("Test");
    });

    it("applies variant class", () => {
      const wrapper = createWrapper({ variant: "primary" });
      expect(wrapper.classes()).toContain("btn-primary");
    });

    it("shows loading state", () => {
      const wrapper = createWrapper({ loading: true });
      expect(wrapper.find(".loading-spinner").exists()).toBe(true);
    });
  });

  describe("interactions", () => {
    it("emits click when clicked", async () => {
      const wrapper = createWrapper();
      await wrapper.trigger("click");
      expect(wrapper.emitted("click")).toHaveLength(1);
    });

    it("does not emit click when disabled", async () => {
      const wrapper = createWrapper({ disabled: true });
      await wrapper.trigger("click");
      expect(wrapper.emitted("click")).toBeFalsy();
    });
  });
});
```

### Composable Testing

```typescript
import { describe, it, expect } from "vitest";
import { useToggle } from "../composables/useToggle";

describe("useToggle", () => {
  it("starts with initial value", () => {
    const { value } = useToggle(true);
    expect(value.value).toBe(true);
  });

  it("toggles value", () => {
    const { value, toggle } = useToggle(false);
    toggle();
    expect(value.value).toBe(true);
    toggle();
    expect(value.value).toBe(false);
  });

  it("sets true", () => {
    const { value, setTrue } = useToggle(false);
    setTrue();
    expect(value.value).toBe(true);
  });

  it("sets false", () => {
    const { value, setFalse } = useToggle(true);
    setFalse();
    expect(value.value).toBe(false);
  });
});
```

### Helper Function Testing

```typescript
import { describe, it, expect } from "vitest";
import { fCurrency, fNumber, fPercent } from "../helpers/formats/numbers";

describe("number formatters", () => {
  describe("fCurrency", () => {
    it("formats positive numbers", () => {
      expect(fCurrency(1234.56)).toBe("$1,234.56");
    });

    it("formats negative numbers", () => {
      expect(fCurrency(-1234.56)).toBe("-$1,234.56");
    });

    it("handles null", () => {
      expect(fCurrency(null)).toBe("");
    });

    it("handles undefined", () => {
      expect(fCurrency(undefined)).toBe("");
    });
  });

  describe("fPercent", () => {
    it("formats decimal as percent", () => {
      expect(fPercent(0.5)).toBe("50.0%");
    });

    it("respects decimal places", () => {
      expect(fPercent(0.12345, 2)).toBe("12.35%");
    });
  });
});
```

---

## 6. Styling Patterns

### Tailwind Utilities

```vue
<template>
  <!-- Layout -->
  <div class="flex items-center justify-between gap-4">
    <!-- Spacing -->
    <div class="p-4 px-6 py-2 m-2">
      <!-- Typography -->
      <h2 class="text-lg font-semibold text-gray-900">Title</h2>
      <p class="text-sm text-gray-600">Description</p>
    </div>

    <!-- Colors and borders -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
      <!-- Interactive states -->
      <button class="hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50">
        Click
      </button>
    </div>
  </div>
</template>
```

### Conditional Classes

```vue
<template>
  <div
    :class="[
      'base-class',
      { 'active-class': isActive },
      { 'disabled-class': isDisabled },
      sizeClass
    ]"
  >
    Content
  </div>
</template>

<script setup lang="ts">
const sizeClass = computed(() => {
  const sizes = {
    sm: "text-sm px-2 py-1",
    md: "text-base px-4 py-2",
    lg: "text-lg px-6 py-3"
  };
  return sizes[props.size];
});
</script>
```

### Scoped Styles (Complex States)

```vue
<style lang="scss" scoped>
.interactive-card {
  @apply transition-all duration-200;

  &:hover {
    @apply transform -translate-y-1 shadow-lg;
  }

  &:active {
    @apply transform translate-y-0 shadow-md;
  }

  &.is-selected {
    @apply ring-2 ring-blue-500;
  }
}

// Complex animation
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
```

---

## 7. Error Handling Patterns

### Component Error Handling

```typescript
// In component
async function loadData(): Promise<void> {
  try {
    isLoading.value = true;
    error.value = null;
    data.value = await fetchData();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "An error occurred";
  } finally {
    isLoading.value = false;
  }
}
```

### Composable Error Handling

```typescript
export function useApi<T>(url: string) {
  const data = ref<T | null>(null);
  const error = ref<string | null>(null);
  const isLoading = ref(false);

  async function fetch(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await globalThis.fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      data.value = await response.json();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Unknown error";
      data.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  return { data, error, isLoading, fetch };
}
```

---

## 8. Performance Patterns

### Computed Caching

```typescript
// Use computed for derived state (cached)
const expensiveResult = computed(() => {
  return items.value.filter(item =>
    item.tags.some(tag => selectedTags.value.includes(tag))
  );
});
```

### Lazy Loading

```typescript
// Lazy load heavy components
const HeavyComponent = defineAsyncComponent(
  () => import("./HeavyComponent.vue")
);
```

### Debounced Input

```typescript
import { useDebounceFn } from "@vueuse/core";

const debouncedSearch = useDebounceFn((query: string) => {
  performSearch(query);
}, 300);

function handleInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  debouncedSearch(value);
}
```

---

## Key Principles Summary

1. **Single Responsibility** - One component/function = one purpose
2. **TypeScript Everywhere** - No `any`, explicit types
3. **Composition API** - `<script setup>`, no Options API
4. **Tailwind First** - Use utilities, scoped styles only for complex states
5. **Test Behavior** - Test what it does, not how it does it
6. **Extract & Reuse** - Composables for logic, helpers for utilities
7. **Explicit > Implicit** - Clear types, clear returns, clear intent
