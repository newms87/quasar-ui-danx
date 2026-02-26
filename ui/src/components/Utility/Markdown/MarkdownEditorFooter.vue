<template>
  <div
    class="dx-markdown-editor-footer flex items-center justify-between px-2 py-1"
  >
    <span class="char-count text-xs text-gray-500">
      {{ charCount.toLocaleString() }} chars
    </span>
    <button
      class="hotkey-help-btn text-gray-500 hover:text-gray-300 transition-colors p-1 rounded"
      title="Keyboard shortcuts (Ctrl+?)"
      type="button"
      @click="$emit('show-hotkeys')"
    >
      <KeyboardIcon class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { FaSolidKeyboard as KeyboardIcon } from "danx-icon";

export interface MarkdownEditorFooterProps {
  charCount: number;
}

defineProps<MarkdownEditorFooterProps>();

defineEmits<{
  "show-hotkeys": [];
}>();
</script>
