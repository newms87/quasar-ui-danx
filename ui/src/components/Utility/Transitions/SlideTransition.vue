<template>
  <Transition :name="name">
    <slot />
  </Transition>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    default: "slide"
  }
});
</script>
<style lang="scss">
.slide-enter-active,
.slide-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s linear;
  width: 100%;
}

.slide-right-enter-active,
.slide-enter-active {
  position: absolute !important;
  top: 0;
}

/** Slide Left (default) */
.slide-enter-from {
  right: -120%;
}

.slide-enter-to {
  right: 0;
}

.slide-leave-to {
  left: -120%;
}

.slide-leave-from {
  left: 0;
}

/** Slide Right */
.slide-right-enter-from {
  left: -120%;
}

.slide-right-enter-to {
  left: 0;
}

.slide-right-leave-to {
  right: -120%;
}

.slide-right-leave-from {
  right: 0;
}
</style>
