<template>
  <QTooltip
      ref="tooltipBox"
      v-model="show"
      no-parent-event
      class="!pointer-events-auto"
      @mouseenter="onEnterTooltip"
      @mouseleave="onLeaveTooltip"
  >
    <slot>{{ tooltip }}</slot>
  </QTooltip>
</template>
<script setup>
import { onMounted, ref } from 'vue';

defineProps({ tooltip: { type: String, default: '' } });
const show = ref(false);
const tooltipBox = ref(null);
const isHovering = ref(false);
const isHoveringParent = ref(false);
onMounted(() => {
  tooltipBox.value.$el.parentNode.addEventListener('mouseover', onEnterParent);
  tooltipBox.value.$el.parentNode.addEventListener('mouseleave', onLeaveParent);
});
function onEnterParent() {
  show.value = true;
  isHoveringParent.value = true;
}
function onLeaveParent() {
  isHoveringParent.value = false;
  if (!show.value) return;

  setTimeout(() => {
    if (isHovering.value || isHoveringParent.value) {
      onLeaveParent();
    } else {
      show.value = false;
    }
  }, 200);
}
function onEnterTooltip() {
  isHovering.value = true;
  show.value = true;
}
function onLeaveTooltip() {
  isHovering.value = false;
  show.value = false;
}
</script>
