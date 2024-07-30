import { computed, Ref, ref, shallowRef, watch } from "vue";
import { RouteParams, Router } from "vue-router";
import { danxOptions } from "../../config";
import { getItem, latestCallOnly, setItem, storeObject, waitForRef } from "../../helpers";
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

	// Field options are the lists of field values available given the applied filter on the list query. These are used for drop-downs / options in forms, filters, etc.
	// (ie: all states available under the current filter)
	const fieldOptions = ref<AnyObject>({});
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
		watch(activeFilter, loadFieldOptions);
	}

	async function loadList() {
		if (!isInitialized) return;
		isLoadingList.value = true;
		try {
			setPagedItems(await options.routes.list(pager.value));
			isLoadingList.value = false;
		} catch (e) {
			// Fail silently
		}
	}

	async function loadSummary() {
		if (!options.routes.summary || !isInitialized) return;

		isLoadingSummary.value = true;
		const summaryFilter: ListControlsFilter = { id: null, ...activeFilter.value, ...globalFilter.value };
		if (selectedRows.value.length) {
			summaryFilter.id = selectedRows.value.map((row) => row.id);
		}
		try {
			summary.value = await options.routes.summary(summaryFilter);
			isLoadingSummary.value = false;
		} catch (e) {
			// Fail silently
		}
	}

	async function loadListAndSummary() {
		await Promise.all([loadList(), loadSummary()]);
	}

	/**
	 * Gets the field options for the given field name.
	 */
	function getFieldOptions(field: string): any[] {
		return fieldOptions.value[field] || [];
	}

	/**
	 * Loads the filter field options for the current filter.
	 */
	async function loadFieldOptions() {
		if (!options.routes.fieldOptions) return;
		isLoadingFilters.value = true;
		try {
			fieldOptions.value = await options.routes.fieldOptions(activeFilter.value) || {};
			isLoadingFilters.value = false;
		} catch (e) {
			// Fail silently
		}
	}

	/**
	 * Watches for a filter URL parameter and applies the filter if it is set.
	 */
	function applyFilterFromUrl(url: string, filterGroups: Ref<FilterGroup[]> | null = null) {
		if (options.urlPattern && url.match(options.urlPattern)) {
			// A flat list of valid filterable field names
			const validFilterKeys = filterGroups?.value?.map(group => group.fields.map(field => field.name)).flat();

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
	function setPagination(updated: Partial<ListControlsPagination>) {
		// @ts-expect-error Seems like a bug in the typescript linting?
		pagination.value = { ...pagination.value, ...updated };
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

		try {
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
		} catch (e) {
			// Fail silently
		}

		return false;
	}

	/**
	 * Refreshes the list, summary, and filter field options.
	 */
	async function refreshAll() {
		return Promise.all([loadList(), loadSummary(), loadFieldOptions(), getActiveItemDetails()]);
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
				loadFieldOptions();
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
		try {
			const latestResult = latestCallOnly("active-item", async () => {
				if (!activeItem.value || !options.routes.details) return undefined;
				return await options.routes.details(activeItem.value);
			});

			const result = await latestResult();

			// Undefined means we were not the latest, or the request was invalid (ie: activeItem was already cleared)
			if (result === undefined) return;

			if (!result || !result.__type || !result.id) {
				return console.error("Invalid response from details route: All responses must include a __type and id field. result =", result);
			}

			// Reassign the active item to the store object to ensure reactivity
			activeItem.value = storeObject(result);
		} catch (e) {
			// Fail silently
		}
	}

	// Whenever the active item changes, fill the additional item details
	// (ie: tasks, verifications, creatives, etc.)
	if (options.routes.details) {
		watch(() => activeItem.value, async (newItem, oldItem) => {
			// Note we want a loose comparison in case it's a string vs int for the ID
			if (newItem?.id && oldItem?.id != newItem.id) {
				await getActiveItemDetails();
			}
		});
	}

	/**
	 * Opens the item's form with the given item and tab
	 */
	function activatePanel(item: ActionTargetItem | null, panel: string = "") {
		// If we're already on the correct item and panel, don't do anything
		if (item?.id == activeItem.value?.id && panel === activePanel.value) return;

		setActiveItem(item);
		activePanel.value = panel;

		// Push vue router change /:id/:panel
		if (item?.id) {
			updateRouteParams({ id: item.id, panel });
		}
	}

	/**
	 * Sets the currently active item in the list.
	 */
	function setActiveItem(item: ActionTargetItem | null) {
		activeItem.value = item ? storeObject(item) : item;

		if (!item?.id) {
			updateRouteParams({});
		}
	}

	/**
	 * Gets the next item in the list at the given offset (ie: 1 or -1) from the current position in the list of the
	 * selected item. If the next item is on a previous or next page, it will load the page first then select the item
	 */
	async function getNextItem(offset: number) {
		if (!pagedItems.value?.data) return;

		const index = pagedItems.value.data.findIndex((i: ActionTargetItem) => i.id === activeItem.value?.id);
		if (index === undefined || index === null) return;

		const nextIndex = index + offset;

		const latestNextIndex = latestCallOnly("getNextItem", async () => {
			// Load the previous page if the offset is before index 0
			if (nextIndex < 0) {
				if (pagination.value.page > 1) {
					pagination.value = { ...pagination.value, page: pagination.value.page - 1 };
					await waitForRef(isLoadingList, false);
					return pagedItems.value.data.length - 1;
				}

				// There are no more previous pages
				return -1;
			}

			// Load the next page if the offset is past the last index
			if (nextIndex >= pagedItems.value.data.length) {
				if (pagination.value.page < (pagedItems.value?.meta?.last_page || 1)) {
					pagination.value = { ...pagination.value, page: pagination.value.page + 1 };
					await waitForRef(isLoadingList, false);
					return 0;
				}

				// There are no more next pages
				return -1;
			}

			return nextIndex;
		});

		const resolvedNextIndex = await latestNextIndex();

		if (resolvedNextIndex !== undefined && resolvedNextIndex >= 0) {
			activeItem.value = pagedItems.value?.data[resolvedNextIndex];
		}
	}

	/**
	 * Sets the active filter to the given filter.
	 */
	function setActiveFilter(filter?: ListControlsFilter) {
		activeFilter.value = filter || {};
	}

	async function exportList(filter?: ListControlsFilter) {
		options.routes.export && await options.routes.export(filter);
	}

	// Initialize the list actions and load settings, lists, summaries, filter fields, etc.
	function initialize() {
		const vueRouter = getVueRouter();
		isInitialized = true;
		loadSettings();

		/**
		 * Watch the id params in the route and set the active item to the item with the given id.
		 */
		if (options.routes.details) {
			const { params, meta, name: controlRouteName } = vueRouter.currentRoute.value;

			if (controlRouteName === name) {
				vueRouter.afterEach((to) => {
					if (to.name === controlRouteName) {
						setPanelFromRoute(to.params, to.meta);
					}
				});

				setPanelFromRoute(params, meta);
			}
		}
	}

	/**
	 * Updates the URL bar and route to the given params.
	 */
	function updateRouteParams(params: AnyObject) {
		const vueRouter = getVueRouter();
		const { name: routeName } = vueRouter.currentRoute.value;
		vueRouter.push({
			name: (Array.isArray(routeName) ? routeName[0] : routeName) || "home",
			params
		});
	}

	function setPanelFromRoute(params: RouteParams, meta: AnyObject) {
		const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
		if (id && meta.type) {
			const panel = Array.isArray(params?.panel) ? params.panel[0] : params?.panel;
			activatePanel({ id, __type: "" + meta.type }, panel || activePanel.value || "");
		}
	}

	function getVueRouter(): Router {
		if (!danxOptions.value.router) {
			throw new Error("Vue Router must be configured in danxOptions");
		}
		return danxOptions.value.router;
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
		resetPaging,
		setPagination,
		setSelectedRows,
		clearSelectedRows,
		loadList,
		loadSummary,
		loadListAndSummary,
		loadMore,
		loadFieldOptions,
		getActiveItemDetails,
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
