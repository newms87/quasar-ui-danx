<template>
  <NumberField
    v-bind="$props"
    :precision="0"
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
  />
</template>

<script setup lang="ts">
import { NumberFieldProps } from "../../../../types";
import NumberField from "./NumberField";

defineEmits(["update:model-value"]);
withDefaults(defineProps<NumberFieldProps>(), {
	modelValue: "",
	label: undefined,
	delay: 1000,
	min: undefined,
	max: undefined
});
</script>
