<template>
  <Transition name="maxHeight">
    <slot />
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
	maxHeight: string,
}>();
</script>
<style lang="scss">
.maxHeight-enter-active,
.maxHeight-leave-active {
	transition: all .3s linear;
	max-height: v-bind(maxHeight);
}

.maxHeight-enter-to, .maxHeight-leave-from {
	max-height: v-bind(maxHeight);
}

.maxHeight-enter-from, .maxHeight-leave-to {
	max-height: 0;
}
</style>
