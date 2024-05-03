import { ref, Ref } from "vue";
import { RequestOptions } from "../types";

const requestOptions = ref<RequestOptions>({
	baseUrl: ""
});
/**
 * A simple request helper that wraps the fetch API
 * to make GET and POST requests easier w/ JSON payloads
 */
export const request = {
	configure(options: RequestOptions) {
		requestOptions.value = options;
	},

	url(url: string) {
		if (url.startsWith("http")) {
			return url;
		}
		return requestOptions.value.baseUrl + url;
	},

	async get(url: string, options = {}): Promise<object> {
		return fetch(request.url(url), {
			method: "get",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			...options
		}).then((r) => r.json());
	},

	async post(url: string, data = {}, options = {}) {
		return fetch(request.url(url), {
			method: "post",
			body: JSON.stringify(data),
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			...options
		}).then((r) => r.json());
	}
};

/**
 * Fetches a resource list applying the filter. If there is a selected resource,
 * stores that resource from the already populated list. If that resource does not exist
 * also fetches that resource record from the endpoint, then adds it to the list if it
 * does not exist in the filtered list
 *
 */
export async function fetchResourceListWithSelected(fetchFn: (filter: object) => Promise<any[]>, list: Ref, id: string, filter: object): Promise<void> {
	// First make sure we have the selected record, so we can always add it to the list
	let selectedResource;
	if (id) {
		selectedResource = list.value.find((c: { id: string }) => c.id === id) || (await fetchFn({ id }))[0];
	}

	// Get the filtered campaign list
	list.value = await fetchFn(filter);

	// If our selected campaign is not in the filtered list, add it
	if (selectedResource && !list.value.find((c: { id: string }) => c.id === id)) {
		list.value.push(selectedResource);
	}
}

/**
 * Returns the value of the URL parameter (if it is set)
 */
export function getUrlParam(key: string, url?: string) {
	const params = new URLSearchParams(url?.replace(/.*\?/, "") || window.location.search);
	return params.get(key);
}
