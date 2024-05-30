<template>
  <span class="dx-field-label">
    <slot>
      {{ labelText }}
      <template v-if="showName">({{ field?.name }})</template>
    </slot>
    <span
      v-if="requiredLabel"
      class="dx-field-required"
    >{{ requiredLabel }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { FormField } from "../../../../types";

const props = defineProps<{
	field?: FormField;
	label?: string;
	showName?: boolean;
	required?: boolean;
}>();

const labelText = computed(() => props.label || props.field?.label);
const requiredLabel = computed(() => props.field?.required_group || (props.required || props.field?.required ? "*" : ""));
</script>
