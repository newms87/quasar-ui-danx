<template>
  <div
    ref="containerRef"
    class="dx-markdown-editor-content dx-markdown-content"
    :class="{ 'is-readonly': readonly, 'is-empty': isEmpty }"
    :contenteditable="!readonly"
    :data-placeholder="placeholder"
    @input="$emit('input')"
    @keydown="$emit('keydown', $event)"
    @blur="$emit('blur')"
    @click="handleClick"
    v-html="html"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

export interface MarkdownEditorContentProps {
  html: string;
  readonly?: boolean;
  placeholder?: string;
}

const props = withDefaults(defineProps<MarkdownEditorContentProps>(), {
  readonly: false,
  placeholder: "Start typing..."
});

defineEmits<{
  input: [];
  keydown: [event: KeyboardEvent];
  blur: [];
}>();

const containerRef = ref<HTMLElement | null>(null);

/**
 * Find the anchor element if the click target is inside one
 */
function findLinkAncestor(node: Node | null): HTMLAnchorElement | null {
  if (!node || !containerRef.value) return null;

  let current: Node | null = node;
  while (current && current !== containerRef.value) {
    if (current.nodeType === Node.ELEMENT_NODE && (current as Element).tagName === "A") {
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

const isEmpty = computed(() => {
  return !props.html || props.html === "<p></p>" || props.html === "<p><br></p>";
});

// Expose containerRef for parent component
defineExpose({ containerRef });
</script>

<style lang="scss">
.dx-markdown-editor-content {
  min-height: 100px;
  outline: none;
  cursor: text;
  border: 2px solid transparent;
  border-radius: 0.375rem 0.375rem 0 0;
  padding: 1rem;
  background-color: #1e1e1e;
  color: #d4d4d4;
  transition: border-color 0.2s ease;
  overflow: auto;

  &:focus {
    border-color: rgba(86, 156, 214, 0.6);
  }

  &:hover:not(:focus):not(.is-readonly) {
    border-color: rgba(86, 156, 214, 0.3);
  }

  &.is-readonly {
    cursor: default;
    border-color: transparent;
  }

  // Placeholder styling when empty
  &.is-empty::before {
    content: attr(data-placeholder);
    color: #6b7280;
    pointer-events: none;
    position: absolute;
  }

  &.is-empty {
    position: relative;
  }

  // Caret color
  caret-color: #d4d4d4;

  // Link styling - show pointer cursor and hint for Ctrl+Click
  a {
    cursor: pointer;
    position: relative;

    &:hover::after {
      content: "Ctrl+Click to open";
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: #374151;
      color: #d1d5db;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      white-space: nowrap;
      z-index: 10;
      pointer-events: none;
      opacity: 0;
      animation: fadeIn 0.2s ease 0.5s forwards;
    }
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }

  // Alternating styles for nested ordered lists
  // Level 1: decimal (1, 2, 3)
  ol {
    list-style-type: decimal;

    // Level 2: lower-roman (i, ii, iii)
    ol {
      list-style-type: lower-roman;

      // Level 3: lower-alpha (a, b, c)
      ol {
        list-style-type: lower-alpha;

        // Level 4+: cycle back to decimal
        ol {
          list-style-type: decimal;

          ol {
            list-style-type: lower-roman;

            ol {
              list-style-type: lower-alpha;
            }
          }
        }
      }
    }
  }

  // Alternating styles for nested unordered lists
  // Level 1: disc
  ul {
    list-style-type: disc;

    // Level 2: circle
    ul {
      list-style-type: circle;

      // Level 3: square
      ul {
        list-style-type: square;

        // Level 4+: cycle back to disc
        ul {
          list-style-type: disc;

          ul {
            list-style-type: circle;

            ul {
              list-style-type: square;
            }
          }
        }
      }
    }
  }

  // Code block wrapper styling - distinct background to separate from editor content
  .code-block-wrapper {
    background: #0d1117;
    border-radius: 0.375rem;
    margin: 0.5rem 0;
    border: 1px solid #30363d;

    // Override CodeViewer backgrounds to be transparent so wrapper controls it
    .dx-code-viewer {
      .code-content {
        background: transparent;
        border-radius: 0.375rem 0.375rem 0 0;
      }

      .code-footer {
        background: #161b22;
        border-radius: 0 0 0.375rem 0.375rem;
      }
    }
  }

  // ==========================================
  // LIGHT THEME VARIANT
  // ==========================================
  .dx-markdown-editor.theme-light & {
    background-color: #f8fafc;
    color: #1e293b;
    caret-color: #1e293b;

    &:focus {
      border-color: rgba(14, 165, 233, 0.6);
    }

    &:hover:not(:focus):not(.is-readonly) {
      border-color: rgba(14, 165, 233, 0.3);
    }

    // Placeholder styling - light theme
    &.is-empty::before {
      color: #94a3b8;
    }

    // Link tooltip - light theme
    a:hover::after {
      background: #e2e8f0;
      color: #1e293b;
    }

    // Code block wrapper - light theme
    .code-block-wrapper {
      background: #f1f5f9;
      border-color: #e2e8f0;

      .dx-code-viewer {
        .code-footer {
          background: #e2e8f0;
        }
      }
    }
  }
}
</style>
