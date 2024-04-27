<template>
  <div
    class="dx-action-table overflow-hidden w-full"
    :class="{'dx-no-data': !hasData}"
  >
    <ActionVnode />
    <QTable
      ref="actionTable"
      :selected="selectedRows"
      :pagination="quasarPagination"
      :columns="columns"
      :loading="isLoadingList"
      :rows="pagedItems?.data || []"
      :binary-state-sort="false"
      selection="multiple"
      :rows-per-page-options="rowsPerPageOptions"
      class="sticky-column sticky-header w-full h-full !border-0"
      :color="color"
      @update:selected="$emit('update:selected-rows', $event)"
      @update:pagination="() => {}"
      @request="(e) => $emit('update:quasar-pagination', {...e.pagination, __sort: mapSortBy(e.pagination, columns)})"
    >
      <template #no-data>
        <slot name="empty">
          <EmptyTableState :text="`There are no ${label.toLowerCase()} matching the applied filter`" />
        </slot>
      </template>
      <template #top-row>
        <TableSummaryRow
          v-if="hasData"
          :label="label"
          :item-count="summary?.count || 0"
          :selected-count="selectedRows.length"
          :loading="isLoadingSummary"
          :summary="summary"
          :columns="columns"
          @clear="$emit('update:selected-rows', [])"
        />
      </template>
      <template #header-cell="rowProps">
        <ActionTableHeaderColumn
          v-model="columnSettings"
          :row-props="rowProps"
          :name="name"
          @update:model-value="onUpdateColumnSettings"
        />
      </template>
      <template #body-cell="rowProps">
        <ActionTableColumn
          :key="rowProps.key"
          :row-props="rowProps"
          :settings="columnSettings[rowProps.col.name]"
        >
          <slot
            :column-name="rowProps.col.name"
            :row="rowProps.row"
            :value="rowProps.value"
          />
        </ActionTableColumn>
      </template>
    </QTable>
  </div>
</template>

<script setup>
import { QTable } from "quasar";
import ActionTableColumn from "src/components/ActionTable/Columns/ActionTableColumn.vue";
import ActionTableHeaderColumn from "src/components/ActionTable/Columns/ActionTableHeaderColumn";
import { computed, ref } from "vue";
import { getItem, setItem } from "../../helpers";
import { ActionVnode } from "../Utility";
import EmptyTableState from "./EmptyTableState.vue";
import { mapSortBy, registerStickyScrolling } from "./listHelpers";
import TableSummaryRow from "./TableSummaryRow.vue";

defineEmits(["update:quasar-pagination", "update:selected-rows"]);
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: "blue-600"
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

const hasData = computed(() => props.pagedItems?.data?.length);
const COLUMN_SETTINGS_KEY = `column-settings-${props.name}`;
const columnSettings = ref(getItem(COLUMN_SETTINGS_KEY) || {});
function onUpdateColumnSettings() {
  setItem(COLUMN_SETTINGS_KEY, columnSettings.value);
}
</script>

<style scoped lang="scss">
.dx-action-table {
  &.dx-no-data {
    :deep(.q-table__middle) {
      flex-grow: 0;
      flex-shrink: 1;
    }
  }
}
</style>
