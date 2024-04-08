<template>
  <div>
    <div class="text-xs font-bold">{{ label }}</div>
    <div :class="{'mt-2': !dense, 'mt-1': dense, 'text-no-wrap': nowrap}">
      <slot>{{ value || "-" }}</slot>
    </div>
  </div>
</template>
<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    default: "-"
  },
  dense: Boolean,
  nowrap: Boolean
});
</script>
