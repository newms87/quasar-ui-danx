<template>
  <div
    ref="containerRef"
    class="dx-markdown-editor-content dx-markdown-content"
    :class="{ 'is-readonly': readonly, 'is-empty': isContentEmpty }"
    :contenteditable="!readonly"
    :data-placeholder="placeholder"
    @input="onInput"
    @keydown="$emit('keydown', $event)"
    @blur="$emit('blur')"
    @click="handleClick"
    v-html="html"
  />
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";

export interface MarkdownEditorContentProps {
  html: string;
  readonly?: boolean;
  placeholder?: string;
}

const props = withDefaults(defineProps<MarkdownEditorContentProps>(), {
  readonly: false,
  placeholder: "Start typing...",
});

const emit = defineEmits<{
  input: [];
  keydown: [event: KeyboardEvent];
  blur: [];
}>();

const containerRef = ref<HTMLElement | null>(null);
const isContentEmpty = ref(true);

/**
 * Check if the editor content is empty by examining the actual DOM text content.
 * This is needed because contenteditable changes the DOM directly without updating props.
 */
function checkIfEmpty(): void {
  if (containerRef.value) {
    const textContent = containerRef.value.textContent?.trim() || "";
    isContentEmpty.value = textContent.length === 0;
  }
}

/**
 * Handle input events - check if content is empty and emit the input event.
 */
function onInput(): void {
  checkIfEmpty();
  emit("input");
}

// Watch for external HTML changes (e.g., from parent component)
watch(
  () => props.html,
  () => {
    nextTick(() => checkIfEmpty());
  },
  { immediate: true },
);

/**
 * Find the anchor element if the click target is inside one
 */
function findLinkAncestor(node: Node | null): HTMLAnchorElement | null {
  if (!node || !containerRef.value) return null;

  let current: Node | null = node;
  while (current && current !== containerRef.value) {
    if (
      current.nodeType === Node.ELEMENT_NODE &&
      (current as Element).tagName === "A"
    ) {
      return current as HTMLAnchorElement;
    }
    current = current.parentNode;
  }

  return null;
}

/**
 * Handle clicks in the editor content.
 * Ctrl+Click (or Cmd+Click on Mac) opens links in a new tab.
 */
function handleClick(event: MouseEvent): void {
  // Check if Ctrl (Windows/Linux) or Cmd (Mac) is held
  const isModifierHeld = event.ctrlKey || event.metaKey;
  if (!isModifierHeld) return;

  // Find if the click was on or inside a link
  const link = findLinkAncestor(event.target as Node);
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href) return;

  // Prevent default behavior and open the link in a new tab
  event.preventDefault();
  event.stopPropagation();
  window.open(href, "_blank", "noopener,noreferrer");
}

// Expose containerRef for parent component
defineExpose({ containerRef });
</script>
