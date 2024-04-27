import { computed, Ref, ref, ShallowRef, shallowRef, VNode, watch } from "vue";
import { ActionTargetItem, getItem, setItem, waitForRef } from "../../helpers";
import { getFilterFromUrl } from "./listHelpers";

export interface LabelValueItem {
	label: string;
	value: string | number | boolean;
}

export interface FilterField {
	name: string;
	label: string;
	type: string;
	options?: string[] | number[] | LabelValueItem[];
	inline?: boolean;
}

export interface FilterGroup {
	name?: string;
	flat?: boolean;
	fields: FilterField[];
}

export interface ActionPanel {
	name: string;
	label: string;
	category?: string;
	enabled: boolean | (() => boolean);
	tabVnode: () => VNode;
	vnode: () => VNode;
}

export interface ListControlsFilter {
	[key: string]: object | object[] | null | undefined | string | number | boolean;
}

export interface ListControlsRoutes {
	list: (pager: object) => Promise<ActionTargetItem[]>;
	details?: (item: object) => Promise<ActionTargetItem> | null;
	summary?: (filter: object | null) => Promise<object> | null;
	filterFieldOptions?: (filter: object | null) => Promise<object> | null;
	more?: (pager: object) => Promise<ActionTargetItem[]> | null;
}

export interface ListControlsOptions {
	routes: ListControlsRoutes;
	urlPattern?: RegExp | null;
	filterDefaults?: Record<string, object>;
	refreshFilters?: boolean;
}

export interface ListControlsPagination {
	__sort: object[];
	sortBy: string | null;
	descending: boolean;
	page: number;
	rowsNumber: number;
	rowsPerPage: number;
}

export interface PagedItems {
	data: ActionTargetItem[] | undefined;
	meta: {
		total: number;
		last_page?: number;
	} | undefined;
}

export function useListControls(name: string, options: ListControlsOptions) {
	let isInitialized = false;
	const PAGE_SETTINGS_KEY = `${name}-pagination-settings`;
	const pagedItems: Ref<PagedItems | null> = shallowRef(null);
	const filter: Ref<ListControlsFilter> = ref({});
	const globalFilter = ref({});
	const showFilters = ref(false);
	const selectedRows: ShallowRef<ActionTargetItem[]> = shallowRef([]);
	const isLoadingList = ref(false);
	const isLoadingSummary = ref(false);
	const summary: ShallowRef<object | null> = shallowRef(null);

	// The active ad for viewing / editing
	const activeItem: ShallowRef<ActionTargetItem | null> = shallowRef(null);
	// Controls the active panel (ie: tab) if rendering a panels drawer or similar
	const activePanel: ShallowRef<string | null> = shallowRef(null);

	// Filter fields are the field values available for the currently applied filter on Creative Groups
	// (ie: all states available under the current filter)
	const filterFieldOptions: Ref<object> = ref({});
	const isLoadingFilters = ref(false);

	const filterActiveCount = computed(() => Object.keys(filter.value).filter(key => filter.value[key] !== undefined).length);

	const PAGING_DEFAULT = {
		__sort: null,
		sortBy: null,
		descending: false,
		page: 1,
		rowsNumber: 0,
		rowsPerPage: 50
	};
	const quasarPagination = ref(PAGING_DEFAULT);

	const pager = computed(() => ({
		perPage: quasarPagination.value.rowsPerPage,
		page: quasarPagination.value.page,
		filter: { ...filter.value, ...globalFilter.value },
		sort: quasarPagination.value.__sort || undefined
	}));

	// When any part of the filter changes, get the new list of creatives
	watch(pager, () => {
		saveSettings();
		loadList();
	});
	watch(filter, () => {
		saveSettings();
		loadSummary();
	});
	watch(selectedRows, loadSummary);

	if (options.refreshFilters) {
		watch(filter, loadFilterFieldOptions);
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
		const summaryFilter: ListControlsFilter = { id: null, ...filter.value, ...globalFilter.value };
		if (selectedRows.value.length) {
			summaryFilter.id = selectedRows.value.map((row) => row.id);
		}
		summary.value = await options.routes.summary(summaryFilter);
		isLoadingSummary.value = false;
	}

	/**
	 * Loads the filter field options for the current filter.
	 *
	 * @returns {Promise<void>}
	 */
	async function loadFilterFieldOptions() {
		if (!options.routes.filterFieldOptions || !isInitialized) return;
		isLoadingFilters.value = true;
		filterFieldOptions.value = await options.routes.filterFieldOptions(filter.value) || {};
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
				filter.value = urlFilter;

				// Override whatever is in local storage with this new filter
				updateSettings("filter", filter.value);
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
		if (meta && meta.total !== quasarPagination.value.rowsNumber) {
			quasarPagination.value.rowsNumber = meta.total;
		}

		// Add a reactive isSaving property to each item (for performance reasons in checking saving state)
		data = data.map((item) => {
			// We want to keep the isSaving state if it is already set, as optimizations prevent reloading the
			// components, and therefore reactivity is not responding to the new isSaving state
			const oldItem = pagedItems.value?.data?.find(i => i.id === item.id);
			return { ...item, isSaving: oldItem?.isSaving || ref(false) };
		});

		pagedItems.value = { data, meta };
	}

	/**
	 * Resets the filter and pagination settings to their defaults.
	 */
	function resetPaging() {
		quasarPagination.value = PAGING_DEFAULT;
	}

	/**
	 * Updates a row in the paged items list with the new item data. Uses the item's id to find the row.
	 *
	 * @param updatedItem
	 */
	function setItemInList(updatedItem: ActionTargetItem) {
		const data = pagedItems.value?.data?.map(item => (item.id === updatedItem.id && (item.updated_at === null || item.updated_at <= updatedItem.updated_at)) ? updatedItem : item);
		setPagedItems({
			data,
			meta: { total: pagedItems.value?.meta?.total || 0 }
		});

		// Update the active item as well if it is set
		if (activeItem.value?.id === updatedItem.id) {
			activeItem.value = { ...activeItem.value, ...updatedItem };
		}
	}

	/**
	 * Loads more items into the list.
	 */
	async function loadMore(index: number, perPage = undefined) {
		if (!options.routes.more) return;

		const newItems = await options.routes.more({
			page: index + 1,
			perPage,
			filter: { ...filter.value, ...globalFilter.value }
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
			filter.value = { ...settings.filter, ...filter.value };
			quasarPagination.value = settings.quasarPagination;
		} else {
			// If no local storage settings, apply the default filters
			filter.value = { ...options.filterDefaults, ...filter.value };
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
			filter: filter.value,
			quasarPagination: { ...quasarPagination.value, page: 1 }
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

		// Only set the ad details if we are the response for the currently loaded item
		// NOTE: race conditions might allow the finished loading item to be different to the currently
		// requested item
		if (result?.id === activeItem.value?.id) {
			const loadedItem = pagedItems.value?.data?.find((i: ActionTargetItem) => i.id === result.id);
			activeItem.value = { ...result, isSaving: loadedItem?.isSaving || ref(false) };
		}
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
	function activatePanel(item: ActionTargetItem, panel: string | null) {
		activeItem.value = item;
		activePanel.value = panel;
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
			if (quasarPagination.value.page > 1) {
				quasarPagination.value = { ...quasarPagination.value, page: quasarPagination.value.page - 1 };
				await waitForRef(isLoadingList, false);
				nextIndex = pagedItems.value.data.length - 1;
			} else {
				// There are no more previous pages
				return;
			}
		}

		// Load the next page if the offset is past the last index
		if (nextIndex >= pagedItems.value.data.length) {
			if (quasarPagination.value.page < (pagedItems.value?.meta?.last_page || 1)) {
				quasarPagination.value = { ...quasarPagination.value, page: quasarPagination.value.page + 1 };
				await waitForRef(isLoadingList, false);
				nextIndex = 0;
			} else {
				// There are no more next pages
				return;
			}
		}

		activeItem.value = pagedItems.value?.data[nextIndex];
	}

	// Initialize the list actions and load settings, lists, summaries, filter fields, etc.
	function initialize() {
		isInitialized = true;
		loadSettings();
	}

	return {
		// State
		pagedItems,
		filter,
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
		quasarPagination,
		activeItem,
		activePanel,

		// Actions
		initialize,
		loadSummary,
		resetPaging,
		loadList,
		loadMore,
		refreshAll,
		getNextItem,
		activatePanel,
		applyFilterFromUrl,
		setItemInList
	};
}
