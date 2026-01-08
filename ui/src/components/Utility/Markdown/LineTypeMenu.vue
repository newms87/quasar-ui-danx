<template>
  <div ref="menuRef" class="dx-line-type-menu" :class="{ 'is-open': isOpen }">
    <button
      class="line-type-trigger"
      :title="currentTypeLabel"
      type="button"
      @mousedown.prevent="toggleMenu"
    >
      <span class="type-icon">{{ typeIcon }}</span>
    </button>

    <div v-if="isOpen" class="line-type-dropdown">
      <button
        v-for="option in LINE_TYPE_OPTIONS"
        :key="option.value"
        class="line-type-option"
        :class="{ active: option.value === currentType }"
        type="button"
        @mousedown.prevent="selectType(option.value)"
      >
        <span class="option-icon">{{ option.icon }}</span>
        <span class="option-label">{{ option.label }}</span>
        <span class="option-shortcut">{{ option.shortcut }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import type { LineType, LineTypeOption } from "./types";

export interface LineTypeMenuProps {
  currentType: LineType;
}

const LINE_TYPE_OPTIONS: LineTypeOption[] = [
  { value: "paragraph", label: "Paragraph", icon: "\u00B6", shortcut: "Ctrl+0" },
  { value: "h1", label: "Heading 1", icon: "H1", shortcut: "Ctrl+1" },
  { value: "h2", label: "Heading 2", icon: "H2", shortcut: "Ctrl+2" },
  { value: "h3", label: "Heading 3", icon: "H3", shortcut: "Ctrl+3" },
  { value: "h4", label: "Heading 4", icon: "H4", shortcut: "Ctrl+4" },
  { value: "h5", label: "Heading 5", icon: "H5", shortcut: "Ctrl+5" },
  { value: "h6", label: "Heading 6", icon: "H6", shortcut: "Ctrl+6" },
  { value: "ul", label: "Bullet List", icon: "\u2022", shortcut: "Ctrl+Shift+[" },
  { value: "ol", label: "Numbered List", icon: "1.", shortcut: "Ctrl+Shift+]" }
];

const props = defineProps<LineTypeMenuProps>();

const emit = defineEmits<{
  change: [type: LineType];
}>();

const isOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const currentOption = computed(() => {
  return LINE_TYPE_OPTIONS.find(o => o.value === props.currentType) || LINE_TYPE_OPTIONS[0];
});

const currentTypeLabel = computed(() => currentOption.value.label);
const typeIcon = computed(() => currentOption.value.icon);

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

function selectType(type: LineType) {
  emit("change", type);
  isOpen.value = false;
}

// Close menu on click outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node;
  if (menuRef.value && !menuRef.value.contains(target)) {
    isOpen.value = false;
  }
}

// Close menu on Escape key
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    isOpen.value = false;
  }
}

// Add/remove event listeners when menu opens/closes
watch(isOpen, (open) => {
  if (open) {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
  } else {
    document.removeEventListener("mousedown", handleClickOutside);
    document.removeEventListener("keydown", handleKeyDown);
  }
});

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  document.removeEventListener("keydown", handleKeyDown);
});
</script>

<style lang="scss">
.dx-line-type-menu {
  position: relative;
  display: inline-block;

  .line-type-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    border-radius: 0.2rem;
    color: #6b7280;
    font-size: 0.625rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #9ca3af;
    }
  }

  .line-type-dropdown {
    position: absolute;
    top: 0;
    left: 100%;
    z-index: 100;
    min-width: 180px;
    margin-left: 0.25rem;
    background: #2d2d2d;
    border: 1px solid #404040;
    border-radius: 0.375rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    overflow: hidden;
  }

  .line-type-option {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: none;
    color: #d4d4d4;
    font-size: 0.875rem;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.15s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &.active {
      background: rgba(56, 139, 253, 0.2);
      color: #58a6ff;
    }

    .option-icon {
      width: 1.5rem;
      font-weight: 700;
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .option-label {
      flex: 1;
    }

    .option-shortcut {
      font-size: 0.75rem;
      color: #6b7280;
      font-family: 'Consolas', 'Monaco', monospace;
    }
  }
}
</style>
