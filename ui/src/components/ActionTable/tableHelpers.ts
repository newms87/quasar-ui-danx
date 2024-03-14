import { onMounted, watch } from "vue";

export function registerStickyScrolling(tableRef) {
  onMounted(() => {
    const scrollEl = tableRef.value.$el.getElementsByClassName("q-table__middle")[0];
    scrollEl.addEventListener("scroll", onScroll);

    function onScroll({ target }) {
      // Add / remove scroll y class based on whether we're scrolling vertically
      if (target.scrollTop > 0) {
        scrollEl.classList.add("is-scrolling-y");
      } else {
        scrollEl.classList.remove("is-scrolling-y");
      }

      // Add / remove scroll x class based on whether we're scrolling horizontally
      if (target.scrollLeft > 0) {
        scrollEl.classList.add("is-scrolling-x");
      } else {
        scrollEl.classList.remove("is-scrolling-x");
      }
    }
  });
}

export function mapSortBy(pagination, columns) {
  if (!pagination.sortBy) return null;

  const column = columns.find(c => c.name === pagination.sortBy);
  return [
    {
      column: column.sortBy || column.name,
      expression: column.sortByExpression || undefined,
      order: pagination.descending ? "desc" : "asc"
    }
  ];
}

/**
 * Wait for a ref to have a value and then resolve the promise
 *
 * @param ref
 * @param value
 * @returns {Promise<void>}
 */
export function waitForRef(ref, value) {
  return new Promise<void>((resolve) => {
    watch(ref, (newValue) => {
      if (newValue === value) {
        resolve();
      }
    });
  });
}

/**
 * Returns the value of the URL parameter (if it is set)
 * @param key
 * @param url
 */
export function getUrlParam(key, url = undefined) {
  const params = new URLSearchParams(url?.replace(/.*\?/, "") || window.location.search);
  return params.get(key);
}

/**
 * Returns the filter from the URL if it is set
 * @param url
 * @param allowedKeys
 */
export function getFilterFromUrl(url, allowedKeys = null) {
  const filter = {};
  const urlFilter = getUrlParam("filter", url);
  if (urlFilter) {
    const fields = JSON.parse(urlFilter);
    Object.keys(fields).forEach((key) => {
      if (!allowedKeys || allowedKeys.includes(key)) {
        filter[key] = fields[key];
      }
    });
  }
  return filter;
}
