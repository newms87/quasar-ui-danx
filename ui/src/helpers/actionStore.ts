import { ref, shallowRef } from "vue";
import { ActionStore, ActionTargetItem, ListControlsRoutes } from "../types";

export function useActionStore(routes: ListControlsRoutes): ActionStore {
	const listItems = shallowRef<ActionTargetItem[]>([]);
	const isRefreshing = ref(false);
	const hasLoadedItems = ref(false);

	async function loadItems() {
		if (hasLoadedItems.value) return;
		await refreshItems();
		hasLoadedItems.value = true;
	}

	async function refreshItems() {
		if (isRefreshing.value) return;
		isRefreshing.value = true;
		listItems.value = (await routes.list({ sort: [{ column: "name" }] })).data || [];
		isRefreshing.value = false;
	}

	return {
		listItems,
		isRefreshing,
		hasLoadedItems,
		loadItems,
		refreshItems
	};
}
