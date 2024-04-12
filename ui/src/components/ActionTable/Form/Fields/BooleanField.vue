<template>
  <QToggle
      :data-testid="'boolean-field-' + field.id"
      :model-value="modelValue"
      :toggle-indeterminate="toggleIndeterminate"
      :indeterminate-value="undefined"
      @update:model-value="$emit('update:model-value', $event)"
  >
    <FieldLabel
        :field="field"
        :show-name="showName"
        :class="labelClass"
    />
  </QToggle>
</template>

<script setup>
import FieldLabel from "./FieldLabel";

defineEmits(["update:model-value"]);
defineProps({
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
  toggleIndeterminate: Boolean
});
</script>
