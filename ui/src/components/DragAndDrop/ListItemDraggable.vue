<template>
  <div
    :class="{'cursor-move': !showHandle && !disabled}"
    :draggable="disabled ? undefined : 'true'"
    @dragstart.stop="dragAndDrop.dragStart"
    @dragend="dragAndDrop.dragEnd"
  >
    <div :class="contentClass">
      <div
        v-if="showHandle"
        :class="resolvedHandleClass"
      >
        <div
          v-if="disabled"
          :class="handleSize"
        />
        <SvgImg
          v-else
          :svg="DragHandleIcon"
          :class="handleSize"
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
import { computed, watch } from "vue";
import { DragHandleDotsIcon as DragHandleIcon } from "../../svg";
import { SvgImg } from "../Utility";
import { DropZoneResolver } from "./dragAndDrop";
import { ListDragAndDrop } from "./listDragAndDrop";

const emit = defineEmits(["position", "update:list-items", "drop-zone"]);
const dragging = defineModel<boolean>();
const props = withDefaults(defineProps<{
	dropZone: DropZoneResolver;
	direction?: "vertical" | "horizontal";
	showHandle?: boolean;
	changeDropZone?: boolean;
	contentClass?: string | object;
	handleClass?: string | object;
	handleSize?: string;
	listItems?: any[];
	disabled?: boolean;
}>(), {
	direction: "vertical",
	handleSize: "w-4 h-4",
	handleClass: "",
	contentClass: "flex flex-nowrap items-center",
	listItems: () => []
});

watch(() => props.disabled, (value) => dragAndDrop.setOptions({ disabled: value }));

const resolvedHandleClass = computed(() => ({
	"cursor-move": !props.disabled,
	...(typeof props.handleClass === "string" ? { [props.handleClass]: true } : props.handleClass)
}));

const dragAndDrop = new ListDragAndDrop()
	.setDropZone(props.dropZone)
	.setOptions({
		showPlaceholder: true,
		allowDropZoneChange: props.changeDropZone,
		direction: props.direction,
		disabled: props.disabled
	})
	.onStart(() => dragging.value = true)
	.onEnd(() => dragging.value = false)
	.onDropZoneChange((target, dropZone, newPosition, oldPosition, data) => {
		let item = null;
		let items = [];
		if (props.listItems) {
			items = [...props.listItems];
			item = items.splice(oldPosition, 1)[0];
		}

		emit("drop-zone", { target, item, items, dropZone, oldPosition, newPosition, data });
	})
	.onPositionChange((newPosition, oldPosition) => {
		emit("position", newPosition);
		if (props.listItems) {
			const items = [...props.listItems];
			items.splice(newPosition, 0, items.splice(oldPosition, 1)[0]);
			emit("update:list-items", items);
		}
	});
</script>
