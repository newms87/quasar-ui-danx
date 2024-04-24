<template>
  <QToggle
    :data-testid="'boolean-field-' + field.id"
    :model-value="modelValue || (toggleIndeterminate ? modelValue : false)"
    :disable="disable || readonly"
    :toggle-indeterminate="toggleIndeterminate"
    :indeterminate-value="undefined"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <FieldLabel
      :field="{...field, label: label || field.label}"
      :show-name="showName"
      :class="labelClass"
    />
  </QToggle>
</template>

<script setup>
import FieldLabel from "./FieldLabel";

defineEmits(["update:model-value"]);
defineProps({
  label: {
    type: String,
    default: null
  },
  modelValue: {
    type: [Boolean],
    default: undefined
  },
  field: {
    type: Object,
    required: true
  },
  labelClass: {
    type: String,
    default: "text-sm"
  },
  showName: Boolean,
  toggleIndeterminate: Boolean,
  disable: Boolean,
  readonly: Boolean
});
</script>
