<template>
  <q-table
      ref="actionTable"
      :selected="selectedRows"
      :pagination="quasarPagination"
      :columns="columns"
      :loading="isLoadingList"
      :rows="pagedItems?.data || []"
      selection="multiple"
      :rows-per-page-options="rowsPerPageOptions"
      class="sticky-column sticky-header w-full !border-0"
      color="blue-base"
      @update:selected="$emit('update:selected-rows', $event)"
      @update:pagination="() => {}"
      @request="$emit('update:quasar-pagination', {...$event.pagination, __sort: mapSortBy($event.pagination, columns)})"
  >
    <template #no-data>
      <slot name="empty">
        <EmptyTableState :text="`There are no ${label.toLowerCase()} matching the applied filter`" />
      </slot>
    </template>
    <template #top-row>
      <TableSummaryRow
          :label="label"
          :item-count="summary?.count || 0"
          :selected-count="selectedRows.length"
          :loading="isLoadingSummary"
          :summary="summary"
          :columns="columns"
          @clear="$emit('update:selected-rows',  [])"
      />
    </template>
    <template #header-cell="rowProps">
      <q-th
          :key="rowProps.key"
          :props="rowProps"
          :data-drop-zone="`resize-column-` + rowProps.col.name"
      >
        {{ rowProps.col.label }}
        <HandleDraggable
            v-if="rowProps.col.resizeable"
            :drop-zone="`resize-column-` + rowProps.col.name"
            class="resize-handle"
            @resize="onResizeColumn(rowProps.col, $event)"
        >
          <RowResizeIcon class="w-4 text-neutral-base" />
        </HandleDraggable>
      </q-th>
    </template>
    <template #body-cell="rowProps">
      <q-td :key="rowProps.key" :props="rowProps">
        <component
            :is="rowProps.col.onClick ? 'a' : 'div'"
            class="flex items-center flex-nowrap"
            :class="{'justify-end': rowProps.col.align === 'right', 'justify-center': rowProps.col.align === 'center', 'justify-start': rowProps.col.align === 'left'}"
            :style="getColumnStyle(rowProps.col)"
            @click="() => rowProps.col.onClick && rowProps.col.onClick(rowProps.row)"
        >
          <RenderVNode
              v-if="rowProps.col.vnode"
              :vnode="rowProps.col.vnode(rowProps.row)"
          />
          <RenderComponent
              v-else-if="rowProps.col.component"
              :params="[rowProps.row]"
              :component="rowProps.col.component"
          />
          <div v-else-if="rowProps.col.fieldList">
            <div v-for="field in rowProps.col.fieldList" :key="field">
              {{ rowProps.row[field] }}
            </div>
          </div>
          <div v-else>
            <slot v-bind="{name: rowProps.col.name, row: rowProps.row, value: rowProps.value}">
              {{ rowProps.value }}
            </slot>
          </div>
          <div v-if="rowProps.col.actions" class="flex-grow flex justify-end pl-2">
            <ActionMenu
                :actions="rowProps.col.actions"
                :target="rowProps.row"
                :loading="isSavingRow(rowProps.row)"
                @action="(action) => $emit('action', action, rowProps.row)"
            />
          </div>
        </component>
      </q-td>
    </template>
    <template #bottom>
      <ActionInputComponent />
    </template>
  </q-table>
</template>

<script setup>
import { ref } from 'vue';
import { getItem, setItem } from '../../helpers';
import { DragHandleIcon as RowResizeIcon } from '../../svg';
import { HandleDraggable } from '../DragAndDrop';
import { ActionInputComponent, mapSortBy, RenderComponent, RenderVNode } from '../index';
import { ActionMenu, EmptyTableState, registerStickyScrolling, TableSummaryRow } from './index';

defineEmits(['action', 'update:quasar-pagination', 'update:selected-rows']);
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  selectedRows: {
    type: Array,
    required: true
  },
  quasarPagination: {
    type: Object,
    required: true
  },
  isSavingTarget: {
    type: Object,
    default: null
  },
  isLoadingList: Boolean,
  pagedItems: {
    type: Object,
    default: null
  },
  isLoadingSummary: Boolean,
  summary: {
    type: Object,
    default: null
  },
  columns: {
    type: Array,
    required: true
  },
  rowsPerPageOptions: {
    type: Array,
    default: () => [10, 25, 50, 100]
  }
});
const actionTable = ref(null);
registerStickyScrolling(actionTable);

const COLUMN_SETTINGS_KEY = `column-settings-${props.name}`;
const columnSettings = ref(getItem(COLUMN_SETTINGS_KEY) || {});
function onResizeColumn(column, val) {
  columnSettings.value[column.name] = Math.max(Math.min(val.distance + val.startDropZoneSize, column.maxWidth || 500), column.minWidth || 80);
  setItem(COLUMN_SETTINGS_KEY, columnSettings.value);
}
function getColumnStyle(column) {
  const width = columnSettings.value[column.name] || column.width;

  if (width) {
    return {
      width: `${width}px`
    };
  }
  return null;
}

function isSavingRow(row) {
  if (!props.isSavingTarget) return false;

  if (Array.isArray(props.isSavingTarget)) {
    return !!props.isSavingTarget.find(t => t.id === row.id);
  }
  return props.isSavingTarget.id === row.id;
}
</script>

<style lang="scss" scoped>
[data-drop-zone] {
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
