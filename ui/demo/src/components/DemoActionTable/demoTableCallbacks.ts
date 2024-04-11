import { dbDateTime } from "quasar-ui-danx";

/**
 * Generate a list of items with statuses To Do, In Progress, and Done
 * Randomized start and end dates that occur in the current year.
 * The end date is anywhere from 1 to 31 days after the start date.
 */
const listItems = (() => {
    const items = [];
    const year = new Date().getFullYear();
    for (let i = 0; i < 100; i++) {
        const status = Math.random() * 3 < 1 ? "To Do" : Math.random() * 3 < 2 ? "In Progress" : "Done";
        const start_date = new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        const end_date = new Date(start_date);
        end_date.setDate(start_date.getDate() + Math.floor(Math.random() * 31) + 1);
        items.push({
            name: `Item ${i + 1}`,
            start_date: start_date.toISOString().split("T")[0],
            end_date: end_date.toISOString().split("T")[0],
            status
        });
    }
    return items;
})();

function getFilteredItems(filter) {
    let filteredItems = [...listItems];

    if (filter.status) {
        filteredItems = filteredItems.filter((item) => filter.status.includes(item.status));
    }

    if (filter.filterDateRange) {
        const [start, end] = [dbDateTime(filter.filterDateRange.from), dbDateTime(filter.filterDateRange.to)];
        filteredItems = filteredItems.filter((item) => {
            return dbDateTime(item.start_date) <= end && dbDateTime(item.end_date) >= start;
        });
    }

    return filteredItems;
}

function sortListItems(items, column, dir) {
    items.sort((a, b) => {
        if (a[column] > b[column]) {
            return dir === "asc" ? 1 : -1;
        }
        if (a[column] < b[column]) {
            return dir === "asc" ? -1 : 1;
        }
        return 0;
    });
}

function paginateListItems(items, perPage, page) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return items.slice(start, end);
}

export async function itemListCb(pager) {
    const filteredListItems = getFilteredItems(pager.filter || {});

    // Perform sort
    if (pager.sort) {
        sortListItems(filteredListItems, pager.sort[0].column, pager.sort[0].order);
    }

    // Perform pagination
    const perPage = pager.perPage || 10;
    const page = pager.page || 1;
    const pagedListItems = paginateListItems(filteredListItems, perPage, page);

    return {
        data: pagedListItems,
        meta: {
            total: filteredListItems.length,
            page,
            perPage,
        }
    };
}

export async function summaryCb(filter) {
    const filteredListItems = getFilteredItems(filter || {});
    const completedItems = filteredListItems.filter((item) => item.status === "Done");
    const minStartDate = filteredListItems.reduce((min, item) => item.start_date < min ? item.start_date : min, filteredListItems[0].start_date);
    const maxEndDate = filteredListItems.reduce((max, item) => item.end_date > max ? item.end_date : max, filteredListItems[0].end_date);
    return {
        name: "",
        start_date: minStartDate,
        end_date: maxEndDate,
        status: completedItems.length + " / " + filteredListItems.length,
    };
}

export async function filterFieldOptionsCb() {
    return {
        statuses: [
            { value: "To Do", label: "To Do" },
            { value: "In Progress", label: "In Progress" },
            { value: "Done", label: "Done" },
        ],
    };
}

export async function applyActionCb(action) {
    console.log("Action applied:", action);
}
