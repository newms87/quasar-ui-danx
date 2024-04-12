<template>
  <div>
    <div class="text-xs font-bold">{{ label }}</div>
    <div :class="{'mt-2': !dense, 'mt-1': dense, 'text-no-wrap': nowrap}">
      <template v-if="loading">
        <QSpinnerTail />
      </template>
      <slot v-else>{{ value || '-' }}</slot>
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
    default: '-'
  },
  dense: Boolean,
  nowrap: Boolean,
  loading: Boolean
});
</script>
