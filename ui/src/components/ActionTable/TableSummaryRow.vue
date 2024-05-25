<template>
  <QTr
    class="dx-table-summary-tr sticky-column-1 transition-all sticky-row"
    :class="{'has-selection': selectedCount, 'is-loading': loading}"
  >
    <QTd
      :colspan="stickyColspan"
      class="dx-table-summary-td transition-all"
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
      :align="column.align || 'left'"
    >
      <template v-if="summary">
        {{ formatValue(column) }}
      </template>
    </QTd>
  </QTr>
</template>
<script setup>
import { XCircleIcon as ClearIcon } from "@heroicons/vue/solid";
import { QSpinner, QTd, QTr } from "quasar";
import { computed } from "vue";
import { fNumber } from "../../helpers";

defineEmits(["clear"]);
const props = defineProps({
	loading: Boolean,
	label: {
		type: String,
		default: "Rows"
	},
	selectedLabel: {
		type: String,
		default: "Selected"
	},
	selectedCount: {
		type: Number,
		default: 0
	},
	itemCount: {
		type: Number,
		default: 0
	},
	summary: {
		type: Object,
		default: null
	},
	columns: {
		type: Array,
		required: true
	},
	stickyColspan: {
		type: Number,
		default: 2
	}
});

const summaryColumns = computed(() => {
	// The sticky columns are where we display the selection count and should not be included in the summary columns
	return props.columns.slice(props.stickyColspan - 1);
});

function formatValue(column) {
	const value = props.summary[column.name];
	if (value === undefined) return "";

	if (column.format) {
		return column.format(value);
	}
	return value;
}
</script>
