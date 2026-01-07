<template>
  <div class="dx-markdown-editor" :class="{ 'is-readonly': readonly }">
    <MarkdownEditorContent
      ref="contentRef"
      :html="editor.renderedHtml.value"
      :readonly="readonly"
      :placeholder="placeholder"
      @input="editor.onInput"
      @keydown="editor.onKeyDown"
      @blur="editor.onBlur"
    />

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
import { computed, onMounted, ref, watch } from "vue";
import { useMarkdownEditor } from "../../../composables/markdown/useMarkdownEditor";
import HotkeyHelpPopover from "./HotkeyHelpPopover.vue";
import MarkdownEditorContent from "./MarkdownEditorContent.vue";
import MarkdownEditorFooter from "./MarkdownEditorFooter.vue";

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
  }

  // Apply min/max height to content area
  .dx-markdown-editor-content {
    flex: 1;
    min-height: v-bind(minHeight);
    max-height: v-bind(maxHeight);
  }
}
</style>
