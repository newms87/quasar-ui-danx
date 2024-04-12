<template>
  <QDialog
      v-model="isShowing"
      maximized
      :position="position"
      :seamless="seamless"
      :class="{'hide-backdrop': !overlay}"
  >
    <div>
      <div
          v-if="title"
          :class="cls['dialog-title']"
          @click.stop.prevent
      >
        {{ title }}
      </div>
      <div :class="{[cls['dialog-content']]: true, [contentClass]: true}">
        <slot />
      </div>
    </div>
  </QDialog>
</template>

<script setup>
import { computed } from "vue";

const emit = defineEmits(["update:show"]);

const props = defineProps({
  show: Boolean,
  seamless: Boolean,
  overlay: Boolean,
  position: {
    type: String,
    default: "bottom"
  },
  contentClass: {
    type: String,
    default: "py-8 px-12"
  },
  title: {
    type: String,
    default: "Edit"
  }
});

const isShowing = computed({
  get: () => props.show,
  set: (value) => emit("update:show", value)
});
</script>

<style lang="scss" module="cls">
.dialog-title {
  @apply font-medium uppercase text-xs px-6 py-3 border-b rounded-t-md bg-slate-100 text-gray-500 border-gray-200;
  font-family: "Roboto", sans-serif;
  letter-spacing: 0.05em;
  box-shadow: 0px -4px 12px rgba(0, 0, 0, 0.25);
}

.dialog-content {
  @apply bg-white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
}
</style>
