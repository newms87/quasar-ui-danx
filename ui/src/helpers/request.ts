import { Ref } from "vue";
import { danxOptions } from "../config";
import { ActiveRequest, HttpResponse, RequestApi } from "../types";
import { sleep } from "./utils";

/**
 * A simple request helper that wraps the fetch API
 * to make GET and POST requests easier w/ JSON payloads
 */
export const request: RequestApi = {
	activeRequests: {},

	url(url) {
		if (url.startsWith("http")) {
			return url;
		}
		return (danxOptions.value.request?.baseUrl || "").replace(/\/$/, "") + "/" + url;
	},

	async call(url, options) {
		options = options || {};
		const requestKey = options?.requestKey || url + JSON.stringify(options.params || "");
		const waitOnPrevious = !!options?.waitOnPrevious;
		const useMostRecentResponse = !!options?.useMostRecentResponse;
		const shouldAbortPrevious = !waitOnPrevious;
		const timestamp = Date.now();

		// If there was a request with the same key made that is still active, track that here
		const previousRequest = request.activeRequests[requestKey];

		// Set the current active request to this one
		const currentRequest: ActiveRequest = { timestamp };
		request.activeRequests[requestKey] = currentRequest;

		if (shouldAbortPrevious) {
			// If there is already an abort controller set for this key, abort it
			if (previousRequest) {
				previousRequest.abortController?.abort("Request was aborted due to a newer request being made");
			}

			const abortController = new AbortController();
			// Set the new abort controller for this key
			currentRequest.abortController = abortController;
			options.signal = abortController.signal;
		}

		if (options.params) {
			// Transform object values in params to JSON strings
			for (const [key, value] of Object.entries(options.params)) {
				if (typeof value === "object" && value !== null) {
					options.params[key] = JSON.stringify(value);
				}
			}

			url += (url.match(/\?/) ? "&" : "?") + new URLSearchParams(options.params).toString();
			delete options.params;
		}

		let resolvePromise: (value: any) => any = null;
		let rejectPromise: (reason?: any) => any = null;
		currentRequest.requestPromise = new Promise((resolve, reject) => {
			resolvePromise = resolve;
			rejectPromise = reject;
		});

		// If there is a previous request still active, wait for it to finish before proceeding (if the waitForPrevious flag is set)
		if (waitOnPrevious && previousRequest?.requestPromise) {
			try {
				await previousRequest.requestPromise;
			} catch (e) {
				// We don't care if it fails, we just need to wait for it to complete
			}
		}

		// Wait to finish the request before proceeding
		let response: Response;
		try {
			response = await fetch(request.url(url), options);
		} catch (e) {
			if (options.ignoreAbort && (e + "").match(/Request was aborted/)) {
				const abortResponse = { abort: true };
				resolvePromise(abortResponse);
				return abortResponse;
			}
			rejectPromise(e);
			throw e;
		}

		// Verify the app version of the client and server are matching
		checkAppVersion(response);

		// Track the most recent request (maybe another request with the same key was made after this request started)
		let mostRecentRequest = request.activeRequests[requestKey];

		// Always fetch the result
		let responseJson = await response.json();

		// Send the real JSON response to the promise in case other requests are waiting on this request result
		resolvePromise(responseJson);

		// If this request is not the most recent request...
		if (mostRecentRequest.timestamp !== timestamp) {
			// and it should be aborted but was aborted too late, return an aborted response
			if (shouldAbortPrevious) {
				responseJson = { abort: true };
			} else if (useMostRecentResponse) {
				// or if there is a more recent request, and the useMoreRecentResponse flag is set, update this response to the more recent one
				do {
					// Always update on each iteration to make sure we're checking the current most recent
					// (maybe additional requests will be made before the current most recent finishes)
					mostRecentRequest = request.activeRequests[requestKey];
					responseJson = await mostRecentRequest.requestPromise;

					// If the most recent request is the same as this one, break out of the loop
					if (request.activeRequests[requestKey].timestamp === mostRecentRequest.timestamp) {
						break;
					}
				} while (mostRecentRequest.timestamp !== request.activeRequests[requestKey].timestamp);
			}
		}

		if (response.status === 401) {
			const onUnauthorized = danxOptions.value.request?.onUnauthorized;
			return onUnauthorized ? onUnauthorized(responseJson, response) : {
				error: true,
				message: "Unauthorized",
				...responseJson
			};
		}

		if (response.status > 400) {
			if (responseJson.exception && !responseJson.error) {
				responseJson.error = true;
			}
		}

		return responseJson;
	},

	async poll(url: string, options, interval, fnUntil) {
		let response;
		if (!fnUntil) {
			fnUntil = (response: HttpResponse) => !!response;
		}
		do {
			response = await request.call(url, options);
			await sleep(interval || 1000);
		} while (!fnUntil(response));

		return response;
	},

	async get(url, options) {
		return await request.call(url, {
			method: "get",
			...options,
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				...danxOptions.value.request?.headers,
				...options?.headers
			}
		});
	},

	async post(url, data, options) {
		return await request.call(url, {
			method: "post",
			body: data && JSON.stringify(data),
			...options,
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				...danxOptions.value.request?.headers,
				...options?.headers
			}
		});
	}
};

/**
 * Checks the app version of the client and server to see if they match.
 * If they do not match, the onAppVersionMismatch callback is called
 */
function checkAppVersion(response: HttpResponse) {
	const requestOptions = danxOptions.value.request;
	if (!requestOptions || !requestOptions.headers || !requestOptions.onAppVersionMismatch) {
		return;
	}

	const clientAppVersion = requestOptions.headers["X-App-Version"] || "";
	const serverAppVersion = response.headers.get("X-App-Version");
	if (clientAppVersion && clientAppVersion !== serverAppVersion) {
		requestOptions.onAppVersionMismatch(serverAppVersion);
	}
}

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
