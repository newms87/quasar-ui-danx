<template>
  <QTd
    :key="rowProps.key"
    :props="rowProps"
    :style="columnStyle"
    class="dx-column"
    :class="column.columnClass"
  >
    <div :style="columnStyle">
      <div
        class="flex items-center flex-nowrap"
        :class="wrapClass"
      >
        <div
          v-if="!column.hideContent"
          class="flex-grow overflow-hidden"
        >
          <a
            v-if="column.onClick"
            :class="column.innerClass"
            class="dx-column-link"
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
            class="dx-column-text"
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
          class="flex flex-shrink-0"
          :class="{'ml-2': !column.hideContent}"
        >
          <ActionMenu
            class="dx-column-action-menu"
            :actions="column.actionMenu"
            :target="row"
            :loading="isSaving"
          />
        </div>
      </div>
    </div>
  </QTd>
</template>
<script setup lang="ts">
import { QTd } from "quasar";
import { computed } from "vue";
import { RenderVnode } from "../../Utility";
import ActionMenu from "../ActionMenu";
import { TitleColumnFormat } from "./";
import { TableColumn } from "./../../../types";

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
const column = computed<TableColumn>(() => props.rowProps.col);
const value = computed(() => props.rowProps.value);
const isSaving = computed(() => row.value.isSaving?.value);

const columnStyle = computed(() => {
	const width = props.settings?.width || column.value.width;
	return {
		width: width ? `${width}px` : undefined,
		minWidth: column.value.minWidth ? `${column.value.minWidth}px` : undefined
	};
});

const wrapClass = computed(() => ({
	[column.value.class || ""]: true,
	"is-saving": isSaving.value,
	"justify-end": column.value.align === "right",
	"justify-center": column.value.align === "center",
	"justify-start": column.value.align === "left"
}));
</script>
