import { dbDateTime } from "@ui/helpers";

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

export async function itemListCb(pager) {
  let pagedListItems = [...listItems];

  // perform filter
  if (pager.filter) {
    if (pager.filter.status) {
      pagedListItems = pagedListItems.filter((item) => pager.filter.status.includes(item.status));
    }

    if (pager.filter.filterDateRange) {
      const [start, end] = [dbDateTime(pager.filter.filterDateRange.from), dbDateTime(pager.filter.filterDateRange.to)];
      pagedListItems = pagedListItems.filter((item) => {
        return dbDateTime(item.start_date) <= end && dbDateTime(item.end_date) >= start;
      });
    }
  }

  // Track total items before sort and pagination
  const total = pagedListItems.length;

  // Perform sort
  if (pager.sort) {
    const column = pager.sort[0].column;
    const direction = pager.sort[0].order;

    pagedListItems.sort((a, b) => {
      if (a[column] > b[column]) {
        return direction === "asc" ? 1 : -1;
      }
      if (a[column] < b[column]) {
        return direction === "asc" ? -1 : 1;
      }
      return 0;
    });
  }

  // Perform pagination
  const perPage = pager.perPage || 10;
  const page = pager.page || 1;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  pagedListItems = pagedListItems.slice(start, end);

  return {
    data: pagedListItems,
    meta: {
      total,
      page,
      perPage,
    }
  };
}

export async function summaryCb() {
  return {
    total: 100,
    active: 3,
    inactive: 2,
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
