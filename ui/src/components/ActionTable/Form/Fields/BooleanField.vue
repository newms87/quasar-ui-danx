<template>
  <QToggle
    :data-testid="'boolean-field-' + (name || label)"
    :model-value="modelValue || (toggleIndeterminate ? modelValue : false)"
    :disable="disabled || readonly"
    :toggle-indeterminate="toggleIndeterminate"
    :indeterminate-value="undefined"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <FieldLabel
      :label="label || name"
      :name="name"
      :show-name="showName"
      :class="labelClass"
    />
  </QToggle>
</template>

<script setup lang="ts">
import FieldLabel from "./FieldLabel";

defineEmits(["update:model-value"]);
defineProps({
	label: {
		type: String,
		default: null
	},
	name: {
		type: String,
		default: null
	},
	required: Boolean,
	modelValue: {
		type: Boolean,
		default: undefined
	},
	labelClass: {
		type: String,
		default: "text-sm"
	},
	showName: Boolean,
	toggleIndeterminate: Boolean,
	disabled: Boolean,
	readonly: Boolean
});
</script>
