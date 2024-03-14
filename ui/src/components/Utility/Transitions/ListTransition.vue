<template>
  <TransitionGroup tag="div" :name="name" class="relative">
    <slot />
  </TransitionGroup>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    default: "fade-list"
  }
});
</script>

<style lang="scss">
[class*="list-move"], /* apply transition to moving elements */
[class*="list-enter-active"],
[class*=".list-leave-active"] {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
[class*="list-leave-active"] {
  position: absolute !important;
}

/** Default List */
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/** Fade */
.fade-list-enter-from,
.fade-list-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

/** Fade Down */
.fade-down-list-enter-from,
.fade-down-list-leave-to {
  opacity: 0;
  transform-origin: top;
  transform: translateY(30px);
}
</style>
