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
      <ActionTableColumn
          :row-props="rowProps"
          :settings="columnSettings[rowProps.col.name]"
      >
        <slot :column-name="rowProps.col.name" :row="rowProps.row" :value="rowProps.value" />
      </ActionTableColumn>
    </template>
    <template #bottom>
      <ActionVnode />
    </template>
  </q-table>
</template>

<script setup>
import { ref } from 'vue';
import { getItem, setItem } from '../../helpers';
import { DragHandleIcon as RowResizeIcon } from '../../svg';
import { HandleDraggable } from '../DragAndDrop';
import { ActionVnode, mapSortBy } from '../index';
import { ActionTableColumn, EmptyTableState, registerStickyScrolling, TableSummaryRow } from './index';

defineEmits(['update:quasar-pagination', 'update:selected-rows']);
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
  columnSettings.value = {
    ...columnSettings.value,
    [column.name]: {
      width: Math.max(Math.min(val.distance + val.startDropZoneSize, column.maxWidth || 500), column.minWidth || 80)
    }
  };
  setItem(COLUMN_SETTINGS_KEY, columnSettings.value);
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
