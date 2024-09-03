<template>
  <div
    class="dx-action-table overflow-hidden"
    :class="{'dx-no-data': !hasData, 'dx-is-loading': loadingList || loadingSummary, 'dx-is-loading-list': loadingList}"
  >
    <QTable
      ref="actionTable"
      :selected="selectedRows"
      :pagination="pagination"
      :columns="tableColumns"
      :loading="loadingList || loadingSummary"
      :rows="pagedItems?.data || []"
      :binary-state-sort="false"
      :selection="selection"
      :rows-per-page-options="rowsPerPageOptions"
      class="sticky-column sticky-header w-full h-full !border-0"
      :color="color"
      @update:selected="$emit('update:selected-rows', $event)"
      @update:pagination="() => {}"
      @request="(e) => $emit('update:pagination', {...e.pagination, __sort: mapSortBy(e.pagination, tableColumns)})"
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
          :sticky-colspan="summaryColSpan"
          :loading="loadingSummary"
          :summary="summary"
          :columns="tableColumns"
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

<script setup lang="ts">
import { QTable } from "quasar";
import { computed, ref } from "vue";
import { getItem, setItem } from "../../helpers";
import { ActionTargetItem, ListControlsPagination, ResourceAction, TableColumn } from "../../types";
import { ActionTableColumn, ActionTableHeaderColumn } from "./Columns";
import EmptyTableState from "./EmptyTableState.vue";
import { mapSortBy, registerStickyScrolling } from "./listHelpers";
import TableSummaryRow from "./TableSummaryRow.vue";

defineEmits(["update:selected-rows", "update:pagination"]);

export interface Props {
	name: string;
	label: string;
	color?: string;
	selectedRows: ActionTargetItem[];
	pagination: ListControlsPagination;
	loadingList?: boolean;
	loadingSummary?: boolean;
	pagedItems?: any;
	summary: any;
	menuActions?: ResourceAction[];
	columns: TableColumn[];
	rowsPerPageOptions?: number[];
	summaryColSpan?: number;
	selection: "multiple" | "single";
}

const props = withDefaults(defineProps<Props>(), {
	color: "",
	pagedItems: null,
	summary: null,
	loadingSummary: false,
	rowsPerPageOptions: () => [10, 25, 50, 100],
	summaryColSpan: null,
	selection: "multiple"
});

const actionTable = ref(null);
registerStickyScrolling(actionTable);

const tableColumns = computed<TableColumn[]>(() => {
	const columns = [...props.columns].map((column: TableColumn) => ({
		...column,
		field: column.field || column.name
	}));

	// Inject the Action Menu column if there are menu actions
	if (props.menuActions?.length) {
		const menuColumn = columns.find((column) => column.name === "menu");
		const menuColumnOptions: TableColumn = {
			name: "menu",
			label: "",
			required: true,
			hideContent: true,
			shrink: true,
			actionMenu: props.menuActions
		};

		if (menuColumn) {
			Object.assign(menuColumn, menuColumnOptions);
		} else {
			columns.unshift(menuColumnOptions);
		}
	}

	return columns;
});
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
