<template>
  <img
    v-if="isString"
    :src="resolvedSvg"
    :alt="alt"
  >
  <component
    :is="resolvedSvg"
    v-else
  />
</template>
<script setup>
import { computed } from "vue";

const props = defineProps({
  svg: {
    type: [String, Object, Function],
    required: true
  },
  alt: {
    type: String,
    default: ""
  }
});

const resolvedSvg = computed(() => props.svg.default ? props.svg.default : props.svg);
const isString = computed(() => typeof resolvedSvg.value === "string");
</script>
