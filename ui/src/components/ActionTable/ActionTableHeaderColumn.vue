<template>
  <QTh
      :key="rowProps.key"
      :props="rowProps"
      :data-drop-zone="isResizeable && `resize-column-` + column.name"
      :class="isResizeable && cls['handle-drop-zone']"
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
<script setup>
import { QTh } from "quasar";
import { computed } from "vue";
import { DragHandleIcon as RowResizeIcon } from "../../svg";
import { HandleDraggable } from "../DragAndDrop";

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

const column = computed(() => props.rowProps.col);
const isResizeable = computed(() => column.value.resizeable);

const columnStyle = computed(() => {
  const width = props.settings?.width || column.value.width;
  return {
    width: width ? `${width}px` : undefined,
    minWidth: column.value.minWidth ? `${column.value.minWidth}px` : undefined,
    ...(column.value.headerStyle || {})
  };
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
