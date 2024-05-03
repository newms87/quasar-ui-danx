import { onMounted, Ref } from "vue";
import { getUrlParam } from "../../helpers";
import { AnyObject, ListControlsPagination, TableColumn } from "../../types";

export function registerStickyScrolling(tableRef: Ref) {
	onMounted(() => {
		const scrollEl = tableRef.value.$el.getElementsByClassName("q-table__middle")[0];
		scrollEl.addEventListener("scroll", onScroll);

		function onScroll({ target }: { target: HTMLElement }) {
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

export function mapSortBy(pagination: ListControlsPagination, columns: TableColumn[]) {
	if (!pagination.sortBy) return null;

	const column = columns.find(c => c.name === pagination.sortBy);
	if (!column) return null;

	return [
		{
			column: column.sortBy || column.name,
			expression: column.sortByExpression || undefined,
			order: pagination.descending ? "desc" : "asc"
		}
	];
}

/**
 * Returns the filter from the URL if it is set
 * @param url
 * @param allowedKeys
 */
export function getFilterFromUrl(url: string, allowedKeys: string[] | null = null) {
	const filter: AnyObject = {};
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
