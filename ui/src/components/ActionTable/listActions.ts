import { getFilterFromUrl, mapSortBy, waitForRef } from "danx/src/components/ActionTable/tableHelpers";
import { getItem, setItem } from "danx/src/helpers";
import { computed, ref, watch } from "vue";

export function useListActions(name, {
  listRoute,
  filterFieldOptionsRoute,
  summaryRoute = null,
  moreRoute = null,
  applyActionRoute = null,
  applyBatchActionRoute = null,
  itemDetailsRoute = null,
  columns = null,
  filterGroups = null,
  refreshFilters = false,
  urlPattern = null,
  filterDefaults = {}
}) {
  const PAGE_SETTINGS_KEY = `${name}-pagination-settings`;
  const pagedItems = ref(null);
  const filter = ref({});
  const showFilters = ref(getItem(`${name}-show-filters`, true));
  const selectedRows = ref([]);
  const isLoadingList = ref(false);
  const isLoadingSummary = ref(false);
  const summary = ref(null);

  const filterActiveCount = computed(() => Object.keys(filter.value).filter(key => filter.value[key] !== undefined).length);

  const PAGING_DEFAULT = {
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
    filter: filter.value,
    sort: columns ? mapSortBy(quasarPagination.value, columns) : undefined
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

  if (refreshFilters) {
    watch(filter, loadFilterFieldOptions);
  }

  async function loadList() {
    isLoadingList.value = true;
    setPagedItems(await listRoute(pager.value));
    isLoadingList.value = false;
  }

  async function loadSummary() {
    if (summaryRoute) {
      isLoadingSummary.value = true;
      const summaryFilter = { id: null, ...filter.value };
      if (selectedRows.value.length) {
        summaryFilter.id = selectedRows.value.map((row) => row.id);
      }
      summary.value = await summaryRoute(summaryFilter);
      isLoadingSummary.value = false;
    }
  }

  // Filter fields are the field values available for the currently applied filter on Creative Groups
  // (ie: all states available under the current filter)
  const filterFieldOptions = ref({});
  const isLoadingFilters = ref(false);

  watch(() => showFilters.value, (show) => {
    setItem(`${name}-show-filters`, show);
  });

  async function loadFilterFieldOptions() {
    isLoadingFilters.value = true;
    filterFieldOptions.value = await filterFieldOptionsRoute(filter.value);
    isLoadingFilters.value = false;
  }

  // A flat list of valid filterable field names
  const validFilterKeys = computed(() => filterGroups?.value?.map(group => group.fields.map(field => field.name)).flat());

  /**
   * Watches for a filter URL parameter and applies the filter if it is set.
   */
  function applyFilterFromUrl(url) {
    if (url.match(urlPattern)) {
      const urlFilter = getFilterFromUrl(url, validFilterKeys.value);

      if (Object.keys(urlFilter).length > 0) {
        filter.value = urlFilter;
      }
    }
  }

  // Set the reactive pager to map from the Laravel pagination to Quasar pagination
  // and automatically update the list of ads
  function setPagedItems(items) {
    if (Array.isArray(items)) {
      pagedItems.value = { data: items, meta: { total: items.length } };
    } else {
      pagedItems.value = items;
      if (items?.meta && items.meta.total !== quasarPagination.value.rowsNumber) {
        quasarPagination.value.rowsNumber = items.meta.total;
      }
    }
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
  function setItemInPagedList(updatedItem) {
    const data = pagedItems.value?.data?.map(item => (item.id === updatedItem.id && (item.updated_at === null || item.updated_at <= updatedItem.updated_at)) ? updatedItem : item);
    pagedItems.value = { ...pagedItems.value, data };
  }

  /**
   * Loads more items into the list.
   * @param index
   * @param perPage
   */
  async function loadMore(index, perPage = undefined) {
    const newItems = await moreRoute({
      page: index + 1,
      perPage,
      filter: filter.value
    });

    if (newItems && newItems.length > 0) {
      pagedItems.value.data = [...pagedItems.value.data, ...newItems];
      return true;
    }

    return false;
  }

  /**
   * Refreshes the list, summary, and filter field options.
   * @returns {Promise<Awaited<void>[]>}
   */
  async function refreshAll() {
    return Promise.all([loadList(), loadSummary(), loadFilterFieldOptions()]);
  }

  /**
   * Loads the filter and pagination settings from local storage.
   */
  function loadSettings() {
    const settings = getItem(PAGE_SETTINGS_KEY);

    // Load the filter settings from local storage
    if (settings) {
      filter.value = { ...settings.filter, ...filter.value };
      quasarPagination.value = settings.quasarPagination;
    } else {
      // If no local storage settings, apply the default filters
      filter.value = { ...filterDefaults, ...filter.value };
    }

    // Load the URL filters if they are set
    applyFilterFromUrl(window.location.href);

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
   * Applies an action to an item.
   */
  const isApplyingActionToItem = ref(null);
  let actionResultCount = 0;

  async function applyAction(item, input, itemData = {}) {
    isApplyingActionToItem.value = item;
    const resultNumber = ++actionResultCount;
    setItemInPagedList({ ...item, ...input, ...itemData });
    const result = await applyActionRoute(item, input);
    if (result.success) {
      // Only render the most recent campaign changes
      if (resultNumber !== actionResultCount) return;

      // Update the updated item in the previously loaded list if it exists
      setItemInPagedList(result.item);

      // Update the active item if it is the same as the updated item
      if (activeItem.value?.id === result.item.id) {
        activeItem.value = { ...activeItem.value, ...result.item };
      }
    }
    isApplyingActionToItem.value = null;
    return result;
  }

  /**
   * Applies an action to all selected items.
   */
  const isApplyingBatchAction = ref(false);

  async function applyBatchAction(input) {
    isApplyingBatchAction.value = true;
    const batchFilter = { id: selectedRows.value.map(r => r.id) };
    const result = await applyBatchActionRoute(batchFilter, input);
    isApplyingBatchAction.value = false;
    await refreshAll();

    return result;
  }

  // The active ad for viewing / editing in the Ad Form
  const activeItem = ref(null);
  // Controls the tab on the Ad Form
  const formTab = ref("general");

  // Whenever the active item changes, fill the additional item details
  // (ie: tasks, verifications, creatives, etc.)
  if (itemDetailsRoute) {
    watch(() => activeItem.value, async (newItem, oldItem) => {
      if (newItem && oldItem?.id !== newItem.id) {
        const result = await itemDetailsRoute(newItem);

        // Only set the ad details if we are the response for the currently loaded item
        // NOTE: race conditions might allow the finished loading item to be different to the currently requested item
        if (result?.id === activeItem.value?.id) {
          activeItem.value = result;
        }
      }
    });
  }

  /**
   * Opens the item's form with the given item and tab
   *
   * @param item
   * @param tab
   */
  function openItemForm(item, tab) {
    activeItem.value = item;
    formTab.value = tab;
  }

  /**
   * Gets the next item in the list at the given offset (ie: 1 or -1) from the current position in the list of the
   * selected item. If the next item is on a previous or next page, it will load the page first then select the item
   * @param offset
   * @returns {Promise<void>}
   */
  async function getNextItem(offset) {
    const index = pagedItems.value?.data.findIndex(i => i.id === activeItem.value.id);
    if (index === undefined) return;
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
      if (quasarPagination.value.page < pagedItems.value.meta.last_page) {
        quasarPagination.value = { ...quasarPagination.value, page: quasarPagination.value.page + 1 };
        await waitForRef(isLoadingList, false);
        nextIndex = 0;
      } else {
        // There are no more next pages
        return;
      }
    }

    activeItem.value = pagedItems.value.data[nextIndex];
  }

  // Async load the settings for this Action List
  setTimeout(loadSettings, 1);

  return {
    // State
    pagedItems,
    filter,
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
    isApplyingActionToItem,
    isApplyingBatchAction,
    activeItem,
    formTab,
    columns,
    filterGroups,

    // Actions
    loadSummary,
    resetPaging,
    loadList,
    loadMore,
    refreshAll,
    applyAction,
    applyBatchAction,
    getNextItem,
    openItemForm,
    applyFilterFromUrl
  };
}
