<template>
  <div class="flex items-center">
    <component :is="icon" :class="iconClass" />
    <div :class="textClass">
      <slot>{{ text }}</slot>
    </div>
  </div>
</template>
<script setup>
defineProps({
  icon: {
    type: [String, Object],
    required: true
  },
  iconClass: {
    type: String,
    default: 'w-6'
  },
  text: {
    type: String,
    default: null
  },
  textClass: {
    type: String,
    default: 'ml-2'
  }
});
</script>
