import { computed, Ref, ref, shallowRef, watch } from "vue";
import { getItem, setItem, storeObject, waitForRef } from "../../helpers";
import {
	ActionController,
	ActionTargetItem,
	AnyObject,
	FilterGroup,
	ListControlsFilter,
	ListControlsOptions,
	ListControlsPagination,
	PagedItems
} from "../../types";
import { getFilterFromUrl } from "./listHelpers";

export function useListControls(name: string, options: ListControlsOptions): ActionController {
	let isInitialized = false;
	const PAGE_SETTINGS_KEY = `dx-${name}-pager`;
	const pagedItems = shallowRef<PagedItems | null>(null);
	const activeFilter = ref<ListControlsFilter>({});
	const globalFilter = ref({});
	const showFilters = ref(false);
	const selectedRows = shallowRef<ActionTargetItem[]>([]);
	const isLoadingList = ref(false);
	const isLoadingSummary = ref(false);
	const summary = shallowRef<AnyObject | null>(null);

	// The active ad for viewing / editing
	const activeItem = shallowRef<ActionTargetItem | null>(null);
	// Controls the active panel (ie: tab) if rendering a panels drawer or similar
	const activePanel = shallowRef<string>("");

	// Filter fields are the field values available for the currently applied filter on Creative Groups
	// (ie: all states available under the current filter)
	const filterFieldOptions = ref<AnyObject>({});
	const isLoadingFilters = ref(false);

	const filterActiveCount = computed(() => Object.keys(activeFilter.value).filter(key => activeFilter.value[key] !== undefined).length);

	const PAGING_DEFAULT = {
		__sort: null,
		sortBy: null,
		descending: false,
		page: 0,
		rowsNumber: 0,
		rowsPerPage: 50
	};
	const pagination = shallowRef(PAGING_DEFAULT);

	const pager = computed(() => ({
		perPage: pagination.value.rowsPerPage,
		page: pagination.value.page,
		filter: { ...activeFilter.value, ...globalFilter.value },
		sort: pagination.value.__sort || undefined
	}));

	// When any part of the filter changes, get the new list of creatives
	watch(pager, () => {
		saveSettings();
		loadList();
	});
	watch(activeFilter, () => {
		saveSettings();
		loadSummary();
	});
	watch(selectedRows, loadSummary);

	if (options.refreshFilters) {
		watch(activeFilter, loadFilterFieldOptions);
	}

	async function loadList() {
		if (!isInitialized) return;
		isLoadingList.value = true;
		setPagedItems(await options.routes.list(pager.value));
		isLoadingList.value = false;
	}

	async function loadSummary() {
		if (!options.routes.summary || !isInitialized) return;

		isLoadingSummary.value = true;
		const summaryFilter: ListControlsFilter = { id: null, ...activeFilter.value, ...globalFilter.value };
		if (selectedRows.value.length) {
			summaryFilter.id = selectedRows.value.map((row) => row.id);
		}
		summary.value = await options.routes.summary(summaryFilter);
		isLoadingSummary.value = false;
	}

	/**
	 * Gets the field options for the given field name.
	 */
	function getFieldOptions(field: string): any[] {
		return filterFieldOptions.value[field] || [];
	}

	/**
	 * Loads the filter field options for the current filter.
	 *
	 * @returns {Promise<void>}
	 */
	async function loadFilterFieldOptions() {
		if (!options.routes.filterFieldOptions || !isInitialized) return;
		isLoadingFilters.value = true;
		filterFieldOptions.value = await options.routes.filterFieldOptions(activeFilter.value) || {};
		isLoadingFilters.value = false;
	}

	/**
	 * Watches for a filter URL parameter and applies the filter if it is set.
	 */
	function applyFilterFromUrl(url: string, filterFields: Ref<FilterGroup[]> | null = null) {
		if (options.urlPattern && url.match(options.urlPattern)) {
			// A flat list of valid filterable field names
			const validFilterKeys = filterFields?.value?.map(group => group.fields.map(field => field.name)).flat();

			const urlFilter = getFilterFromUrl(url, validFilterKeys);

			if (Object.keys(urlFilter).length > 0) {
				activeFilter.value = urlFilter;

				// Override whatever is in local storage with this new filter
				updateSettings("filter", activeFilter.value);
			}
		}
	}

	// Set the reactive pager to map from the Laravel pagination to Quasar pagination
	// and automatically update the list of ads
	function setPagedItems(items: ActionTargetItem[] | PagedItems) {
		let data: ActionTargetItem[] = [], meta;

		if (Array.isArray(items)) {
			data = items;
			meta = { total: items.length };
		} else if (items.data) {
			data = items.data;
			meta = items.meta;
		}

		// Update the Quasar pagination rows number if it is different from the total
		if (meta && meta.total !== pagination.value.rowsNumber) {
			pagination.value.rowsNumber = meta.total;
		}

		// Add a reactive isSaving property to each item (for performance reasons in checking saving state)
		data = data.map((item: ActionTargetItem) => {
			item.isSaving = item.isSaving === undefined ? false : item.isSaving;
			// We want to keep the isSaving state if it is already set, as optimizations prevent reloading the
			// components, and therefore reactivity is not responding to the new isSaving state
			return storeObject(item);
		});

		pagedItems.value = { data, meta };
	}

	/**
	 * Resets the filter and pagination settings to their defaults.
	 */
	function resetPaging() {
		pagination.value = PAGING_DEFAULT;
	}

	/**
	 * Sets the pagination settings to the given values.
	 */
	function setPagination(updated: ListControlsPagination) {
		// @ts-expect-error Seems like a bug in the typescript linting?
		pagination.value = updated;
	}

	/**
	 * Sets the selected rows in the list for batch actions or other operations.
	 */
	function setSelectedRows(selection: ActionTargetItem[]) {
		selectedRows.value = selection;
	}

	/**
	 * Clears the selected rows in the list.
	 */
	function clearSelectedRows() {
		selectedRows.value = [];
	}

	/**
	 * Loads more items into the list.
	 */
	async function loadMore(index: number, perPage: number | undefined = undefined) {
		if (!options.routes.more) return false;

		const newItems = await options.routes.more({
			page: index + 1,
			perPage,
			filter: { ...activeFilter.value, ...globalFilter.value }
		});

		if (newItems && newItems.length > 0) {
			setPagedItems({
				data: [...(pagedItems.value?.data || []), ...newItems],
				meta: { total: pagedItems.value?.meta?.total || 0 }
			});
			return true;
		}

		return false;
	}

	/**
	 * Refreshes the list, summary, and filter field options.
	 */
	async function refreshAll() {
		return Promise.all([loadList(), loadSummary(), loadFilterFieldOptions(), getActiveItemDetails()]);
	}

	/**
	 * Updates the settings in local storage
	 */
	function updateSettings(key: string, value: any) {
		const settings = getItem(PAGE_SETTINGS_KEY) || {};
		settings[key] = value;
		setItem(PAGE_SETTINGS_KEY, settings);
	}

	/**
	 * Loads the filter and pagination settings from local storage.
	 */
	function loadSettings() {
		// Only load settings when the class is fully initialized
		if (!isInitialized) return;

		const settings = getItem(PAGE_SETTINGS_KEY);

		// Load the filter settings from local storage
		if (settings) {
			activeFilter.value = { ...settings.filter, ...activeFilter.value };
			pagination.value = settings.pagination;
		} else {
			// If no local storage settings, apply the default filters
			activeFilter.value = { ...options.filterDefaults, ...activeFilter.value };
		}

		setTimeout(() => {
			if (!isLoadingList.value) {
				loadList();
			}

			if (!isLoadingSummary.value) {
				loadSummary();
			}

			if (!isLoadingFilters.value) {
				loadFilterFieldOptions();
			}
		}, 1);
	}

	/**
	 * Saves the current filter and pagination settings to local storage.
	 */
	async function saveSettings() {
		const settings = {
			filter: activeFilter.value,
			pagination: { ...pagination.value, page: 1 }
		};
		// save in local storage
		setItem(PAGE_SETTINGS_KEY, settings);
	}

	/**
	 * Gets the additional details for the currently active item.
	 * (ie: data that is not normally loaded in the list because it is not needed for the list view)
	 * @returns {Promise<void>}
	 */
	async function getActiveItemDetails() {
		if (!activeItem.value || !options.routes.details) return;

		const result = await options.routes.details(activeItem.value);

		if (!result || !result.__type || !result.id) {
			return console.error("Invalid response from details route: All responses must include a __type and id field. result =", result);
		}

		// Reassign the active item to the store object to ensure reactivity
		activeItem.value = { ...storeObject(result) };
	}

	// Whenever the active item changes, fill the additional item details
	// (ie: tasks, verifications, creatives, etc.)
	if (options.routes.details) {
		watch(() => activeItem.value, async (newItem, oldItem) => {
			if (newItem && oldItem?.id !== newItem.id) {
				await getActiveItemDetails();
			}
		});
	}

	/**
	 * Opens the item's form with the given item and tab
	 */
	function activatePanel(item: ActionTargetItem | null, panel: string = "") {
		activeItem.value = item;
		activePanel.value = panel;
	}

	/**
	 * Sets the currently active item in the list.
	 */
	function setActiveItem(item: ActionTargetItem | null) {
		activeItem.value = item;
	}

	/**
	 * Gets the next item in the list at the given offset (ie: 1 or -1) from the current position in the list of the
	 * selected item. If the next item is on a previous or next page, it will load the page first then select the item
	 */
	async function getNextItem(offset: number) {
		if (!pagedItems.value?.data) return;

		const index = pagedItems.value.data.findIndex((i: ActionTargetItem) => i.id === activeItem.value?.id);
		if (index === undefined || index === null) return;

		let nextIndex = index + offset;

		// Load the previous page if the offset is before index 0
		if (nextIndex < 0) {
			if (pagination.value.page > 1) {
				pagination.value = { ...pagination.value, page: pagination.value.page - 1 };
				await waitForRef(isLoadingList, false);
				nextIndex = pagedItems.value.data.length - 1;
			} else {
				// There are no more previous pages
				return;
			}
		}

		// Load the next page if the offset is past the last index
		if (nextIndex >= pagedItems.value.data.length) {
			if (pagination.value.page < (pagedItems.value?.meta?.last_page || 1)) {
				pagination.value = { ...pagination.value, page: pagination.value.page + 1 };
				await waitForRef(isLoadingList, false);
				nextIndex = 0;
			} else {
				// There are no more next pages
				return;
			}
		}

		activeItem.value = pagedItems.value?.data[nextIndex];
	}

	/**
	 * Sets the active filter to the given filter.
	 */
	function setActiveFilter(filter: ListControlsFilter) {
		activeFilter.value = filter;
	}

	async function exportList(filter: object) {
		return options.routes.export(filter);
	}

	// Initialize the list actions and load settings, lists, summaries, filter fields, etc.
	function initialize() {
		isInitialized = true;
		loadSettings();
	}

	return {
		// State
		name,
		label: options.label || name,
		pagedItems,
		activeFilter,
		globalFilter,
		filterActiveCount,
		showFilters,
		summary,
		filterFieldOptions,
		selectedRows,
		isLoadingList,
		isLoadingFilters,
		isLoadingSummary,
		pager,
		pagination,
		activeItem,
		activePanel,

		// Actions
		initialize,
		loadSummary,
		resetPaging,
		setPagination,
		setSelectedRows,
		clearSelectedRows,
		loadList,
		loadMore,
		refreshAll,
		exportList,
		setActiveItem,
		getNextItem,
		activatePanel,
		setActiveFilter,
		applyFilterFromUrl,
		getFieldOptions
	};
}
