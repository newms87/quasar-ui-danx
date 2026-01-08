<template>
  <div class="dx-markdown-editor" :class="{ 'is-readonly': readonly }">
    <div class="dx-markdown-editor-body">
      <!-- Floating line type menu positioned next to current block -->
      <div
        ref="menuContainerRef"
        class="dx-line-type-menu-container"
        :style="lineTypeMenuStyle"
      >
        <LineTypeMenu
          :current-type="currentLineType"
          @change="onLineTypeChange"
        />
      </div>

      <MarkdownEditorContent
        ref="contentRef"
        :html="editor.renderedHtml.value"
        :readonly="readonly"
        :placeholder="placeholder"
        @input="editor.onInput"
        @keydown="editor.onKeyDown"
        @blur="editor.onBlur"
      />
    </div>

    <MarkdownEditorFooter
      :char-count="editor.charCount.value"
      @show-hotkeys="editor.showHotkeyHelp"
    />

    <HotkeyHelpPopover
      v-if="editor.isShowingHotkeyHelp.value"
      :hotkeys="editor.hotkeyDefinitions.value"
      @close="editor.hideHotkeyHelp"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useMarkdownEditor } from "../../../composables/markdown/useMarkdownEditor";
import HotkeyHelpPopover from "./HotkeyHelpPopover.vue";
import LineTypeMenu from "./LineTypeMenu.vue";
import MarkdownEditorContent from "./MarkdownEditorContent.vue";
import MarkdownEditorFooter from "./MarkdownEditorFooter.vue";
import type { LineType } from "./types";

export interface MarkdownEditorProps {
  modelValue?: string;
  placeholder?: string;
  readonly?: boolean;
  minHeight?: string;
  maxHeight?: string;
}

const props = withDefaults(defineProps<MarkdownEditorProps>(), {
  modelValue: "",
  placeholder: "Start typing...",
  readonly: false,
  minHeight: "100px",
  maxHeight: "none"
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

// Reference to the content component
const contentRef = ref<InstanceType<typeof MarkdownEditorContent> | null>(null);

// Reference to the menu container for focus handling
const menuContainerRef = ref<HTMLElement | null>(null);

// Get the actual HTMLElement from the content component
const contentElementRef = computed(() => contentRef.value?.containerRef || null);

// Initialize the markdown editor composable
const editor = useMarkdownEditor({
  contentRef: contentElementRef,
  initialValue: props.modelValue,
  onEmitValue: (markdown: string) => {
    emit("update:modelValue", markdown);
  }
});

// Track current heading level for LineTypeMenu
const currentHeadingLevel = ref(0);

// Track the current block element's top position for floating menu
const currentBlockTop = ref(0);
const isEditorFocused = ref(false);

// Map LineType to heading level (single source of truth for bidirectional mapping)
// Note: ul and ol are handled separately, not as heading levels
const LINE_TYPE_TO_LEVEL: Record<string, number> = {
  paragraph: 0,
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6
};

// Derive the inverse mapping from LINE_TYPE_TO_LEVEL
const LEVEL_TO_LINE_TYPE = Object.fromEntries(
  Object.entries(LINE_TYPE_TO_LEVEL).map(([type, level]) => [level, type as LineType])
) as Record<number, LineType>;

// Track current list type for LineTypeMenu
const currentListType = ref<"ul" | "ol" | null>(null);

// Computed current line type from heading level or list type
const currentLineType = computed<LineType>(() => {
  // If we're in a list, return the list type
  if (currentListType.value) {
    return currentListType.value;
  }
  // Otherwise, return heading type based on level
  const level = currentHeadingLevel.value;
  return LEVEL_TO_LINE_TYPE[level] ?? "paragraph";
});

// Computed style for the floating line type menu
const lineTypeMenuStyle = computed(() => {
  return {
    top: `${currentBlockTop.value}px`,
    opacity: isEditorFocused.value ? 1 : 0,
    pointerEvents: isEditorFocused.value ? "auto" : "none"
  };
});

// Find the block element containing the current selection
function findCurrentBlockElement(): HTMLElement | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  let node: Node | null = selection.anchorNode;

  // Walk up to find a block element (P, H1-H6, DIV, etc.)
  while (node && node !== contentElementRef.value) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toUpperCase();
      if (["P", "H1", "H2", "H3", "H4", "H5", "H6", "DIV", "BLOCKQUOTE", "PRE", "UL", "OL", "LI"].includes(tagName)) {
        return element;
      }
    }
    node = node.parentNode;
  }

  return null;
}

// Update the floating menu position based on current block
function updateMenuPosition(): void {
  const contentEl = contentElementRef.value;
  if (!contentEl) return;

  const blockElement = findCurrentBlockElement();
  if (!blockElement) {
    // If no block found, position at top
    currentBlockTop.value = 0;
    return;
  }

  // Get the block's position relative to the content container
  // We need to account for the content's scroll position
  const contentRect = contentEl.getBoundingClientRect();
  const blockRect = blockElement.getBoundingClientRect();

  // Calculate top position relative to the content container, accounting for scroll
  const relativeTop = blockRect.top - contentRect.top + contentEl.scrollTop;
  currentBlockTop.value = relativeTop;
}

// Update current heading level, list type, and menu position when selection changes
function updateCurrentHeadingLevel(): void {
  const level = editor.headings.getCurrentHeadingLevel();
  currentHeadingLevel.value = level;
  // Also check if we're in a list
  currentListType.value = editor.lists.getCurrentListType();
  updateMenuPosition();
}

// Track focus state
function handleFocusIn(event: FocusEvent): void {
  const contentEl = contentElementRef.value;
  if (contentEl && contentEl.contains(event.target as Node)) {
    isEditorFocused.value = true;
    updateMenuPosition();
  }
}

function handleFocusOut(event: FocusEvent): void {
  const contentEl = contentElementRef.value;
  const menuEl = menuContainerRef.value;
  const relatedTarget = event.relatedTarget as Node | null;

  // Check if focus is moving outside the editor AND the menu container
  // Keep focused if moving to menu (allows clicking menu without losing focus state)
  if (contentEl && !contentEl.contains(relatedTarget)) {
    // Also check if focus is moving to the menu container
    if (!menuEl || !menuEl.contains(relatedTarget)) {
      isEditorFocused.value = false;
    }
  }
}

// Handle line type change from menu
function onLineTypeChange(type: LineType): void {
  // Handle list types
  if (type === "ul") {
    editor.lists.toggleUnorderedList();
    currentListType.value = editor.lists.getCurrentListType();
    return;
  }
  if (type === "ol") {
    editor.lists.toggleOrderedList();
    currentListType.value = editor.lists.getCurrentListType();
    return;
  }

  // Handle heading/paragraph types
  const level = LINE_TYPE_TO_LEVEL[type];
  if (level !== undefined) {
    editor.headings.setHeadingLevel(level as 0 | 1 | 2 | 3 | 4 | 5 | 6);
    // Update the tracked level immediately
    currentHeadingLevel.value = level;
    currentListType.value = null;
  }
}

// Track which element has listeners attached
let boundContentEl: HTMLElement | null = null;

// Setup/cleanup focus and scroll listeners on content element
function setupContentListeners(el: HTMLElement | null): void {
  // Cleanup previous listeners if element changed
  if (boundContentEl && boundContentEl !== el) {
    boundContentEl.removeEventListener("focusin", handleFocusIn);
    boundContentEl.removeEventListener("focusout", handleFocusOut);
    boundContentEl.removeEventListener("scroll", updateMenuPosition);
    boundContentEl = null;
  }

  // Setup new listeners
  if (el && el !== boundContentEl) {
    el.addEventListener("focusin", handleFocusIn);
    el.addEventListener("focusout", handleFocusOut);
    el.addEventListener("scroll", updateMenuPosition);
    boundContentEl = el;
  }
}

// Watch for content element to become available
watch(contentElementRef, (newEl) => {
  setupContentListeners(newEl);
}, { immediate: true });

// Listen for selection changes
onMounted(() => {
  document.addEventListener("selectionchange", updateCurrentHeadingLevel);
});

onUnmounted(() => {
  document.removeEventListener("selectionchange", updateCurrentHeadingLevel);
  // Cleanup content listeners
  setupContentListeners(null);
});

// Watch for external value changes
watch(
  () => props.modelValue,
  (newValue) => {
    // Skip if this change originated from the editor itself (internal update)
    // This prevents cursor jumping when the watch triggers after typing
    if (editor.isInternalUpdate.value) {
      editor.isInternalUpdate.value = false;
      return;
    }

    // Only update if the value is different from current
    if (newValue !== undefined) {
      editor.setMarkdown(newValue);
    }
  }
);

// Ensure content is synced on mount
onMounted(() => {
  if (props.modelValue) {
    editor.setMarkdown(props.modelValue);
  }
});

// Expose the editor for parent components that may need access
defineExpose({
  editor,
  setMarkdown: editor.setMarkdown
});
</script>

<style lang="scss">
.dx-markdown-editor {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 0.375rem;
  overflow: hidden;

  &.is-readonly {
    .dx-markdown-editor-content {
      cursor: default;
    }

    .dx-line-type-menu-container {
      display: none;
    }
  }

  // Body container with floating menu and content side by side
  .dx-markdown-editor-body {
    display: flex;
    position: relative;
    flex: 1;
  }

  // Floating line type menu container
  .dx-line-type-menu-container {
    position: absolute;
    left: 0;
    z-index: 10;
    width: 1.75rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 0.25rem;
    transition: top 0.1s ease-out, opacity 0.15s ease;
  }

  // Apply min/max height to content area with left margin for menu
  .dx-markdown-editor-content {
    flex: 1;
    min-height: v-bind(minHeight);
    max-height: v-bind(maxHeight);
    margin-left: 1.75rem;
  }
}
</style>
