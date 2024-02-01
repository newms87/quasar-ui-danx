<template>
  <div
      class="cursor-move"
      draggable="true"
      @dragstart="dragAndDrop.dragStart"
      @dragend="dragAndDrop.dragEnd"
  >
    <div class="flex items-center">
      <div v-if="showHandle">
        <SvgImg :svg="DragHandleIcon" class="w-4 h-4" alt="drag-handle" />
      </div>
      <div class="flex-grow">
        <slot />
      </div>
    </div>
  </div>
</template>
<script setup>
import SvgImg from "../Utility/SvgImg";
import { HandleDraggableDotsIcon as DragHandleIcon } from "./Icons";
import { ListDragAndDrop } from "./listDragAndDrop";

const emit = defineEmits(["position", "update:list-items"]);
const props = defineProps({
  dropZone: {
    type: [Function, String],
    required: true,
  },
  direction: {
    type: String,
    default: "vertical",
    validator: (value) => ["vertical", "horizontal"].includes(value),
  },
  showHandle: Boolean,
  listItems: {
    type: Array,
    default: null,
  }
});

const dragAndDrop = new ListDragAndDrop()
    .setDropZone(props.dropZone)
    .setOptions({ showPlaceholder: true, direction: props.direction })
    .onPositionChange((newPosition, oldPosition) => {
      emit("position", newPosition);

      if (props.listItems) {
        const items = [...props.listItems];
        items.splice(newPosition, 0, items.splice(oldPosition, 1)[0]);
        emit("update:list-items", items);
      }
    });
</script>
