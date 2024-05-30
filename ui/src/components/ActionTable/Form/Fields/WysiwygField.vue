<template>
  <div>
    <FieldLabel
      v-if="!noLabel"
      :field="field"
      :show-name="showName"
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
      :api-key="danxOptions.tinyMceApiKey"
      :disabled="disable"
      :model-value="modelValue"
      @update:model-value="$emit('update:model-value', $event)"
    />
  </div>
</template>

<script setup>
import { default as TinyMceEditor } from "@tinymce/tinymce-vue";
import { danxOptions } from "../../../../config";
import FieldLabel from "./FieldLabel";

defineEmits(["update:model-value"]);
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
