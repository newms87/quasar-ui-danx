<template>
  <div
    class="cursor-move"
    draggable="true"
    @dragstart="dragAndDrop.dragStart"
    @dragend="dragAndDrop.dragEnd"
  >
    <div class="flex items-center">
      <div
        v-if="showHandle"
        :class="handleClass"
      >
        <SvgImg
          :svg="DragHandleIcon"
          class="w-4 h-4"
          alt="drag-handle"
        />
      </div>
      <div class="flex-grow">
        <slot />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { DragHandleDotsIcon as DragHandleIcon } from "../../svg";
import { SvgImg } from "../Utility";
import { ListDragAndDrop } from "./listDragAndDrop";

const emit = defineEmits(["position", "update:list-items"]);
const props = withDefaults(defineProps<{
	dropZone: string | (() => string);
	direction?: "vertical" | "horizontal";
	showHandle?: boolean;
	handleClass?: string | object;
	listItems?: any[];
}>(), {
	direction: "vertical",
	showHandle: true,
	handleClass: "",
	listItems: () => []
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
