<template>
  <span>
    <slot>
      {{ labelText }}
      <template v-if="showName">({{ field?.name }})</template>
    </slot>
    <span
        v-if="requiredLabel"
        class="text-red-dark ml-1 text-xs bottom-1 relative"
    >{{ requiredLabel }}</span>
  </span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  field: {
    type: Object,
    default: null
  },
  label: {
    type: String,
    default: null
  },
  showName: Boolean,
  required: Boolean
});

const labelText = computed(() => props.label || props.field?.label);
const requiredLabel = computed(() => props.field?.required_group || (props.required || props.field?.required ? "*" : ""));
</script>
