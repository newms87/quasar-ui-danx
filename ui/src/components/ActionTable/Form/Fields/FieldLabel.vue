<template>
  <span>
    <slot>
      {{ labelText }}
      <template v-if="showName">({{ field?.name }})</template>
    </slot>
    <span
      v-if="requiredLabel"
      class="text-red-900 ml-1 text-xs bottom-1 relative"
    >{{ requiredLabel }}</span>
  </span>
</template>

<script setup lang="ts">
import { FormField } from "src/types";
import { computed } from "vue";

const props = defineProps<{
	field?: FormField;
	label?: string;
	showName?: boolean;
	required?: boolean;
}>();

const labelText = computed(() => props.label || props.field?.label);
const requiredLabel = computed(() => props.field?.required_group || (props.required || props.field?.required ? "*" : ""));
</script>
