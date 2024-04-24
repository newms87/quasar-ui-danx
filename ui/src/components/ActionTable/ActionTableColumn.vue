<template>
  <QTd
    :key="rowProps.key"
    :props="rowProps"
    :style="columnStyle"
  >
    <div :style="columnStyle">
      <div
        class="flex items-center flex-nowrap"
        :class="columnClass"
      >
        <div class="flex-grow overflow-hidden">
          <a
            v-if="column.onClick"
            :class="column.innerClass"
            @click="column.onClick(row)"
          >
            <RenderVnode
              v-if="column.vnode"
              :vnode="column.vnode(row)"
            />
            <slot v-else>{{ value }}</slot>
          </a>
          <div
            v-else
            :class="column.innerClass"
          >
            <RenderVnode
              v-if="column.vnode"
              :vnode="column.vnode(row)"
            />
            <slot v-else>
              {{ value }}
            </slot>
          </div>
          <TitleColumnFormat
            v-if="column.titleColumns"
            :row="row"
            :columns="column.titleColumns()"
          />
        </div>
        <div
          v-if="column.actionMenu"
          class="flex flex-shrink-0 pl-2"
        >
          <ActionMenu
            :actions="column.actionMenu"
            :target="row"
            :loading="isSaving"
          />
        </div>
      </div>
    </div>
  </QTd>
</template>
<script setup>
import { QTd } from "quasar";
import { computed } from "vue";
import { RenderVnode } from "../Utility";
import ActionMenu from "./ActionMenu";
import { TitleColumnFormat } from "./Columns";

const props = defineProps({
  rowProps: {
    type: Object,
    required: true
  },
  settings: {
    type: Object,
    default: null
  }
});

const row = computed(() => props.rowProps.row);
const column = computed(() => props.rowProps.col);
const value = computed(() => props.rowProps.value);
const isSaving = computed(() => row.value.isSaving?.value);

const columnStyle = computed(() => {
  const width = props.settings?.width || column.value.width;
  return {
    width: width ? `${width}px` : undefined,
    minWidth: column.value.minWidth ? `${column.value.minWidth}px` : undefined
  };
});

const columnClass = computed(() => ({
  [column.value.class || ""]: true,
  "is-saving": isSaving.value,
  "justify-end": column.value.align === "right",
  "justify-center": column.value.align === "center",
  "justify-start": column.value.align === "left"
}));
</script>
