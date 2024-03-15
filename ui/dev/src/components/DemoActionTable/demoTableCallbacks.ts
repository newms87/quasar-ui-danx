const listItems = [
  { name: "Item 1", start_date: "2021-01-01", end_date: "2021-01-31", status: "Active" },
  { name: "Item 2", start_date: "2021-02-01", end_date: "2021-02-28", status: "Inactive" },
  { name: "Item 3", start_date: "2021-03-01", end_date: "2021-03-31", status: "Active" },
  { name: "Item 4", start_date: "2021-04-01", end_date: "2021-04-30", status: "Inactive" },
  { name: "Item 5", start_date: "2021-05-01", end_date: "2021-05-31", status: "Active" },
];

export async function itemListCb(pager) {
  console.log("pager", pager);
  const pagedListItems = [...listItems];

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

  return pagedListItems;
}

export async function summaryCb() {
  return {
    active: 3,
    inactive: 2,
  };
}

export async function filterFieldOptionsCb() {
  return {
    statuses: [
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
    ],
  };
}

export async function applyActionCb(action) {
  console.log("Action applied:", action);
}
