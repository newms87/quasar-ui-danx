<template>
  <div>
    <FieldLabel
        v-if="!noLabel"
        :field="field"
        :show-name="showName"
        class="text-sm font-semibold text-gray-shadow block mb-2"
    />
    <template v-if="readonly">
      <div
          class="border border-gray-300 rounded-md p-2 bg-gray-100"
          v-html="modelValue"
      />
    </template>
    <TinyMceEditor
        v-else
        class="mt-2"
        :api-key="apiKey"
        :disabled="disable"
        :model-value="modelValue"
        @update:model-value="$emit('update:model-value', $event)"
    />
  </div>
</template>

<script setup>
import { apiKey } from '@ui/vendor/tinymce-config';
import { default as TinyMceEditor } from '@tinymce/tinymce-vue';
import FieldLabel from './FieldLabel';

defineEmits(['update:model-value']);
defineProps({
  modelValue: {
    type: [String, Number],
    default: null
  },
  field: {
    type: Object,
    required: true
  },
  noLabel: Boolean,
  showName: Boolean,
  disable: Boolean,
  readonly: Boolean
});
</script>
