<template>
  <TransitionGroup
      ref="list"
      tag="div"
      appear
      :css="false"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
  >
    <slot />
  </TransitionGroup>
</template>

<script setup>
import gsap from "gsap";
import { computed, ref } from "vue";

const props = defineProps({
  height: {
    type: [String, Number],
    default: "auto"
  },
  duration: {
    type: Number,
    default: 0.5
  },
  delayOffset: {
    type: Number,
    default: 0.5
  },
  disabled: Boolean
});

const list = ref(null);
const indexDelay = computed(() => {
  return props.delayOffset / list.value.$el.children.length;
});

function onBeforeEnter(el) {
  if (props.disabled) {
    return;
  }
  el.style.opacity = 0;
  el.style.height = 0;
}

function onEnter(el, onComplete) {
  if (props.disabled) {
    onComplete();
    return;
  }

  gsap.to(el, {
    opacity: 1,
    duration: props.duration,
    height: props.height,
    delay: el.dataset.index * indexDelay.value,
    onComplete
  });
}

function onLeave(el, onComplete) {
  if (props.disabled) {
    onComplete();
    return;
  }

  gsap.to(el, {
    opacity: 0,
    height: 0,
    duration: props.duration,
    delay: el.dataset.index * indexDelay.value,
    onComplete
  });
}
</script>

<style lang="scss">
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(2em);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
