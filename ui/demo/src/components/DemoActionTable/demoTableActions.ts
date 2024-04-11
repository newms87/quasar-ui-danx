import { useListControls } from "quasar-ui-danx";
import { applyActionCb, filterFieldOptionsCb, itemListCb, summaryCb } from "./demoTableCallbacks";

export const {
    // State
    filter,
    filterFieldOptions,
    showFilters,
    isLoadingList,
    isLoadingSummary,
    quasarPagination,
    selectedRows,
    summary,
    pagedItems,

    // Actions
    refreshAll,
    applyAction
} = useListControls("items", {
    listRoute: itemListCb,
    summaryRoute: summaryCb,
    filterFieldOptionsRoute: filterFieldOptionsCb,
    applyActionRoute: applyActionCb,
    refreshFilters: true,
    urlPattern: /\/admin-v4\/campaigns/
});
