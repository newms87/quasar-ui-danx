import { computed, ref, watch } from "vue";
import { getItem, setItem } from "../../helpers";
import { TableColumn } from "../../types";

export function useTableColumns(name: string, columns: TableColumn[]) {
	const COLUMN_ORDER_KEY = `${name}-column-order`;
	const VISIBLE_COLUMNS_KEY = `${name}-visible-columns`;
	const TITLE_COLUMNS_KEY = `${name}-title-columns`;

	// The list that defines the order the columns should appear in
	const columnOrder = ref(getItem(COLUMN_ORDER_KEY) || []);

	// Manages visible columns on the table
	const hiddenColumnNames = ref(getItem(VISIBLE_COLUMNS_KEY, []));

	// Title columns will have their name appear on the first column of the table as part of the records' title
	const titleColumnNames = ref(getItem(TITLE_COLUMNS_KEY, []));

	// Columns that should be locked to the left side of the table
	const lockedColumns = computed(() => orderedColumns.value.slice(0, 1));

	// The resolved list of columns in the order they should appear in
	const orderedColumns = computed(() => [...columns].sort((a, b) => {
		const aIndex = columnOrder.value.indexOf(a.name);
		const bIndex = columnOrder.value.indexOf(b.name);
		return aIndex === -1 ? 1 : bIndex === -1 ? -1 : aIndex - bIndex;
	}));

	// The ordered list of columns. The ordering of this list is editable and will be stored in localStorage
	const sortableColumns = computed({
		get() {
			return orderedColumns.value.slice(1);
		},
		set(newColumns) {
			columnOrder.value = [...lockedColumns.value.map(c => c.name), ...newColumns.map(c => c.name)];
			setItem(COLUMN_ORDER_KEY, columnOrder.value);
		}
	});

	// The list of columns that are visible. To edit the visible columns, edit the hiddenColumnNames list
	const visibleColumns = computed(() => orderedColumns.value.filter(c => !hiddenColumnNames.value.includes(c.name)));

	// The list of columns that should be included in the title of a row
	const orderedTitleColumns = computed(() => orderedColumns.value.filter(c => titleColumnNames.value.includes(c.name)));

	// Save changes to the list of hidden columns in localStorage
	watch(() => hiddenColumnNames.value, () => setItem(VISIBLE_COLUMNS_KEY, hiddenColumnNames.value));
	watch(() => titleColumnNames.value, () => setItem(TITLE_COLUMNS_KEY, titleColumnNames.value));

	return {
		sortableColumns,
		lockedColumns,
		visibleColumns,
		hiddenColumnNames,
		titleColumnNames,
		orderedTitleColumns
	};
}
