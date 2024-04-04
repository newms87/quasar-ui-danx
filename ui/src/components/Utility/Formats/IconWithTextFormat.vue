<template>
  <div class="flex items-center">
    <component :is="icon" :class="iconClass" />
    <div :class="textClass">
      <slot />
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
    default: "w-6"
  },
  textClass: {
    type: String,
    default: "ml-2"
  }
});
</script>
