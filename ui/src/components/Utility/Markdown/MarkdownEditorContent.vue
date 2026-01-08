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
}
</style>
