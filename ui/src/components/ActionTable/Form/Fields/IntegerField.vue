<template>
  <NumberField
    :field="field"
    :precision="0"
    :model-value="modelValue"
    :show-name="showName"
    @update:model-value="$emit('update:model-value', $event)"
  />
</template>

<script setup>
import NumberField from "src/components/ActionTable/Form/Fields/NumberField";

defineEmits(["update:model-value"]);
defineProps({
  modelValue: {
    type: [String, Number],
    required: true
  },
  field: {
    type: Object,
    required: true
  },
  showName: Boolean
});
</script>
