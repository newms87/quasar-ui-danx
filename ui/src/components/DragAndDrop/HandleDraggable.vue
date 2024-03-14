<template>
  <div
      :class="{
      'cursor-ew-resize': direction === 'horizontal',
      'cursor-ns-resize': direction === 'vertical',
    }"
      class="flex justify-center items-center w-full h-full"
      draggable="true"
      @dragstart="dragAndDrop.dragStart"
      @dragend="dragAndDrop.dragEnd"
  >
    <slot />
  </div>
</template>
<script setup>
import { DragAndDrop } from '@/components';
import { useDebounceFn } from '@vueuse/core';

const emit = defineEmits(['start', 'end', 'resize']);
const props = defineProps({
  initialValue: {
    type: Number,
    default: null
  },
  dropZone: {
    type: [Function, String],
    required: true
  },
  direction: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['vertical', 'horizontal'].includes(value)
  }
});

const dragAndDrop = new DragAndDrop()
    .setDropZone(props.dropZone)
    .setOptions({
      showPlaceholder: true,
      direction: props.direction,
      hideDragImage: true
    })
    .onDragging(useDebounceFn(() => {
      emit('resize', {
        distance: dragAndDrop.getDistance(),
        percent: dragAndDrop.getPercentChange(),
        startDropZoneSize: dragAndDrop.startSize,
        dropZoneSize: dragAndDrop.getDropZoneSize()
      });
    }, 20, { maxWait: 30 }))
    .onStart(() => emit('start'))
    .onEnd(() => emit('end'));
</script>
