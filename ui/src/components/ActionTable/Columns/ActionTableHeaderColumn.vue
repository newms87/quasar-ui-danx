<template>
  <QTh
    :key="rowProps.key"
    :props="rowProps"
    :data-drop-zone="isResizeable && `resize-column-` + column.name"
    :class="columnClass"
    :style="columnStyle"
  >
    {{ column.label }}
    <HandleDraggable
      v-if="isResizeable"
      :drop-zone="`resize-column-` + column.name"
      :class="cls['resize-handle']"
      @resize="onResizeColumn"
    >
      <RowResizeIcon class="w-4 text-gray-600" />
    </HandleDraggable>
  </QTh>
</template>
<script setup lang="ts">
import { QTh } from "quasar";
import { computed, useCssModule } from "vue";
import { DragHandleIcon as RowResizeIcon } from "../../../svg";
import { TableColumn } from "../../../types";
import { HandleDraggable } from "../../DragAndDrop";

const emit = defineEmits(["update:model-value"]);
const props = defineProps({
	modelValue: {
		type: Object,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	rowProps: {
		type: Object,
		required: true
	}
});

const column = computed<TableColumn>(() => props.rowProps.col);
const isResizeable = computed(() => column.value.resizeable);

const columnStyle = computed(() => {
	const width = props.settings?.width || column.value.width;
	return {
		width: width ? `${width}px` : undefined,
		minWidth: column.value.minWidth ? `${column.value.minWidth}px` : undefined,
		...(column.value.headerStyle || {})
	};
});

const clsModule = useCssModule("cls");
const columnClass = computed(() => {
	const colCls = {
		[clsModule["handle-drop-zone"]]: isResizeable.value,
		"dx-column-shrink": column.value.shrink
	};

	const headerClass = column.value.headerClass;
	if (headerClass) {
		if (typeof headerClass === "string") {
			colCls[headerClass] = true;
		} else {
			Object.keys(headerClass).forEach((key) => {
				colCls[key] = headerClass[key];
			});
		}
	}

	return colCls;
});

function onResizeColumn(val) {
	const settings = {
		...props.modelValue,
		[column.value.name]: {
			width: Math.max(Math.min(val.distance + val.startDropZoneSize, column.value.maxWidth || 500), column.value.minWidth || 80)
		}
	};
	emit("update:model-value", settings);
}
</script>

<style lang="scss" module="cls">
.handle-drop-zone {
	.resize-handle {
		position: absolute;
		top: 0;
		right: -.45em;
		width: .9em;
		opacity: 0;
		transition: all .3s;
	}

	&:hover {
		.resize-handle {
			opacity: 1;
		}
	}
}
</style>
