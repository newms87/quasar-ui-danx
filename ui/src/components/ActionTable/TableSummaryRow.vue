<template>
  <QTr
    class="dx-table-summary-tr sticky-column-1 transition-all sticky-row"
    :class="{'has-selection': selectedCount, 'is-loading': loading}"
  >
    <QTd
      :colspan="colspan"
      class="dx-table-summary-td dx-table-summary-count transition-all"
      :class="{'has-selection': selectedCount}"
    >
      <div class="flex flex-nowrap items-center">
        <div class="relative">
          <QSpinner
            v-if="loading"
            class="absolute top-0 left-0"
            size="18"
          />
          <div
            :class="{'opacity-0': loading}"
            class="flex items-center nowrap"
          >
            <ClearIcon
              v-if="selectedCount"
              class="w-6 mr-3 cursor-pointer"
              @click="$emit('clear')"
            />

            {{ fNumber(selectedCount || itemCount) }}
          </div>
        </div>
        <div class="ml-2">
          {{ selectedCount ? selectedLabel : label }}
        </div>
      </div>
    </QTd>
    <QTd
      v-for="column in summaryColumns"
      :key="column.name"
      :align="column.align || 'right'"
      :class="column.summaryClass"
      class="dx-table-summary-fd"
    >
      <div
        v-if="summary"
        :class="{'dx-summary-column-link': column.onClick}"
      >
        {{ formatValue(column) }}
      </div>
    </QTd>
  </QTr>
</template>
<script setup lang="ts">
import { XCircleIcon as ClearIcon } from "@heroicons/vue/solid";
import { QSpinner, QTd, QTr } from "quasar";
import { computed } from "vue";
import { fNumber } from "../../helpers";
import { TableColumn } from "../../types";

interface TableSummaryRowProps {
	loading: boolean;
	label?: string;
	selectedLabel?: string;
	selectedCount?: number;
	itemCount?: number;
	summary?: Record<string, any> | null;
	columns: TableColumn[];
	stickyColspan?: number;
}

defineEmits(["clear"]);
const props = withDefaults(defineProps<TableSummaryRowProps>(), {
	label: "Rows",
	selectedLabel: "Selected",
	selectedCount: 0,
	itemCount: 0,
	summary: null,
	stickyColspan: null
});

// Allow the colspan for the first summary column w/ count + label to extend out to the first column with summary data
// (ie: take up as much room as possible without affecting the summary columns)
const colspan = computed(() => {
	if (props.stickyColspan) return props.stickyColspan;

	if (props.summary) {
		for (let i = 0; i < props.columns.length; i++) {
			const fieldName = props.columns[i].field || props.columns[i].name;
			if (props.summary[fieldName]) {
				return i + 1;
			}
		}
	}

	return props.columns.length + 1;
});

const summaryColumns = computed(() => {
	// The sticky columns are where we display the selection count and should not be included in the summary columns
	return props.columns.slice(colspan.value - 1);
});

function formatValue(column) {
	const value = props.summary && props.summary[column.name];
	if (value === undefined) return "";

	if (column.format) {
		return column.format(value);
	}
	return value;
}
</script>
