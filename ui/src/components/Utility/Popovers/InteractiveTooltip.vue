<template>
  <QTooltip
    ref="tooltipBox"
    v-model="show"
    class="interactive-tooltip"
    no-parent-event
    :transition-duration="200"
    @mouseenter="onEnterTooltip"
    @mouseleave="onLeaveTooltip"
  >
    <slot>{{ tooltip }}</slot>
  </QTooltip>
</template>
<script setup>
import { onMounted, ref } from "vue";

defineProps({ tooltip: { type: String, default: "" } });
const show = ref(false);
const tooltipBox = ref(null);
const isHovering = ref(false);
const isHoveringParent = ref(false);
let timeout = null;
onMounted(() => {
  tooltipBox.value.$el.parentNode.addEventListener("mouseover", onEnterParent);
  tooltipBox.value.$el.parentNode.addEventListener("mouseleave", onLeaveParent);
});
function onEnterParent() {
  show.value = true;
  isHoveringParent.value = true;
  if (timeout) clearTimeout(timeout);
}
function onLeaveParent() {
  isHoveringParent.value = false;
  if (show.value) delayClose();
}
function onEnterTooltip() {
  isHovering.value = true;
  show.value = true;
  if (timeout) clearTimeout(timeout);
}
function onLeaveTooltip() {
  isHovering.value = false;
  if (show.value) delayClose();
}
function delayClose() {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (isHovering.value || isHoveringParent.value) {
      delayClose();
    } else {
      show.value = false;
    }
  }, 200);
}

</script>
<style lang="scss">
body .q-tooltip {
  &.interactive-tooltip {
    pointer-events: auto !important;
    background: white;
    color: inherit;
    box-shadow: 0 0 10px 3px rgba(0, 0, 0, 0.2);
  }
}
</style>
