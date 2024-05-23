import { Ref } from "vue";
import { danxOptions } from "../config";
import { RequestApi } from "../types";

/**
 * A simple request helper that wraps the fetch API
 * to make GET and POST requests easier w/ JSON payloads
 */
export const request: RequestApi = {
	abortControllers: {},

	url(url) {
		if (url.startsWith("http")) {
			return url;
		}
		return (danxOptions.value.request?.baseUrl || "").replace(/\/$/, "") + "/" + url;
	},

	async call(url, options) {
		try {
			const abort = new AbortController();
			const timestamp = new Date().getTime();

			console.log("call", url, options);
			if (options?.abortOn) {
				console.log("setting up abort", options.abortOn);
				const previousAbort = options.abortOn && request.abortControllers[options.abortOn];
				// If there is already an abort controller set for this key, abort it
				if (previousAbort) {
					previousAbort.abort.abort();
				}

				// Set the new abort controller for this key
				request.abortControllers[options.abortOn] = { abort, timestamp };
				options.signal = abort.signal;
			}

			console.log("current timestamp:", timestamp);
			const response = await fetch(request.url(url), options);

			// handle the case where the request was aborted too late, and we need to abort the response via timestamp check
			if (options?.abortOn) {
				if (request.abortControllers[options.abortOn].timestamp !== timestamp) {
					console.log("aborting request", options.abortOn, timestamp, "!==", request.abortControllers[options.abortOn].timestamp);
					return { abort: true };
				}

				delete request.abortControllers[options.abortOn];
			}

			const result = await response.json();

			if (response.status === 401) {
				const onUnauthorized = danxOptions.value.request?.onUnauthorized;
				return onUnauthorized ? onUnauthorized(response) : {
					error: true,
					message: "Unauthorized"
				};
			}

			if (response.status > 400) {
				if (result.exception && !result.error) {
					result.error = true;
				}
			}

			return result;
		} catch (error: any) {
			return {
				error: error.message || "An error occurred fetching the data"
			};
		}
	},
	async get(url, options) {
		return await request.call(url, {
			method: "get",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				...danxOptions.value.request?.headers
			},
			...options
		});
	},

	async post(url, data, options) {
		return await request.call(url, {
			method: "post",
			body: data && JSON.stringify(data),
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				...danxOptions.value.request?.headers
			},
			...options
		});
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
