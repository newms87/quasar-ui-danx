<template>
  <QDialog
      :model-value="modelValue"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      @update:model-value="onClose"
  >
    <div class="flex justify-center min-w-xs" :class="computedClass">
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
import { XIcon } from '@ui/svg';
import { computed } from 'vue';

const emit = defineEmits(['update:model-value', 'close']);
const props = defineProps({
  modelValue: Boolean,
  center: Boolean,
  blue: Boolean,
  closeable: Boolean
});

let computedClass = computed(() => {
  return {
    'bg-blue-base text-white': props.blue,
    'bg-white text-gray-base': !props.blue,
    'items-center': props.center
  };
});

function onClose() {
  emit('update:model-value', false);
  emit('close');
}
</script>
