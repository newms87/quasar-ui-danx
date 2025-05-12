import { ref, Ref } from "vue";

interface RequestOptions {
	baseUrl: string;
}

const requestOptions: Ref<RequestOptions> = ref({
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

	url(url: string, params: string | string[][] | Record<string, string> | URLSearchParams | undefined = undefined) {
		if (!url.startsWith("http")) {
			url = requestOptions.value.baseUrl + url;
		}

		if (params) {
			// Transform object values in params to JSON strings
			for (const [key, value] of Object.entries(params)) {
				if (typeof value === "object" && value !== null) {
					params[key] = JSON.stringify(value);
				}
			}

			url += (url.match(/\?/) ? "&" : "?") + new URLSearchParams(params).toString();
		}

		return url;
	},

	async get(url: string, options = {}): Promise<object> {
		url = request.url(url, options.params);
		return fetch(url, {
			method: "get",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			...options
		}).then((r) => r.json());
	},

	async post(url: string, data = {}, options = {}) {
		let body = "";
		try {
			body = JSON.stringify(data);
		} catch (e) {
			// fail silently
		}
		return fetch(request.url(url), {
			method: "post",
			body,
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
