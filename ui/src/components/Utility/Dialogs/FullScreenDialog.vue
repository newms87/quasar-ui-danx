<template>
  <QDialog
    :model-value="modelValue"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @update:model-value="onClose"
  >
    <div
      class="flex justify-center min-w-xs"
      :class="computedClass"
    >
      <div
        v-if="closeable"
        v-close-popup
        class="p-4 m-4 absolute-top-right top right cursor-pointer"
      >
        <XIcon class="w-5 h-5" />
      </div>
      <slot />
    </div>
  </QDialog>
</template>

<script setup>
import { computed } from "vue";
import { XIcon } from "../../../svg";

const emit = defineEmits(["update:model-value", "close"]);
const props = defineProps({
  modelValue: Boolean,
  center: Boolean,
  blue: Boolean,
  closeable: Boolean
});

let computedClass = computed(() => {
  return {
    "bg-blue-600 text-white": props.blue,
    "bg-white text-gray-400": !props.blue,
    "items-center": props.center
  };
});

function onClose() {
  emit("update:model-value", false);
  emit("close");
}
</script>
