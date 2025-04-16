import { storeObject, storeObjects } from "../helpers";
import { ActionTargetItem, ApplyActionResponse, ListControlsRoutes, PagedItems } from "../types";
import { downloadFile } from "./downloadPdf";
import { request } from "./request";

export function useActionRoutes(baseUrl: string, extend?: object): ListControlsRoutes {
	return {
		/**
		 *  Loads a paged item list from the server
		 */
		async list(pager?, options?) {
			options = {
				...options,
				ignoreAbort: true
			};
			const response = await request.post(`${baseUrl}/list`, pager, options) as PagedItems;

			if (response.data) {
				response.data = storeObjects(response.data);
			}

			return response;
		},
		/**
		 * Loads a summary from the server
		 */
		summary(filter, options?) {
			options = {
				...options,
				ignoreAbort: true
			};
			return request.post(`${baseUrl}/summary`, { filter }, options);
		},
		/**
		 *  Loads a single item from the server.
		 *  Optionally pass in the desired fields to load (otherwise it will load all default fields)
		 */
		async details(target, fields, options?) {
			options = {
				...options,
				ignoreAbort: true
			};
			fields && (options.params = { fields });
			const item = await request.get(`${baseUrl}/${target.id}/details`, options);
			return storeObject(item);
		},
		/**
		 *  Loads field options from the server
		 */
		fieldOptions(options?) {
			return request.get(`${baseUrl}/field-options`, options);
		},
		/**
		 *  Applies an action to a target item on the server to save to the DB and return the updated result
		 */
		async applyAction(action, target, data, options?) {
			options = {
				...options,
				waitOnPrevious: true,
				headers: {
					...options?.headers,
					"X-Timestamp": Date.now().toString()
				}
			};
			data = data || {};
			const response = await request.post(`${baseUrl}/${target ? target.id : "new"}/apply-action`, {
				action,
				data
			}, options) as ApplyActionResponse;

			// Store the response item in the reactive store if it is set
			if (response.item) {
				response.item = storeObject(response.item);
			}

			// Store the result item in the reactive store if it is set as an ActionTargetItem
			if (response.result?.__type && response.result?.id) {
				response.result = storeObject(response.result as ActionTargetItem);
			}

			return response;
		},
		/**
		 *  Applies an action to multiple target items on the server to save to the DB and return the updated result
		 */
		batchAction(action, targets, data, options?) {
			options = {
				...options,
				waitOnPrevious: true
			};
			return request.post(`${baseUrl}/batch-action`, { action, filter: { id: targets.map(r => r.id) }, data }, options);
		},
		/**
		 *  Exports a list of items to a CSV file
		 */
		export(filter, name) {
			return downloadFile(`${baseUrl}/export`, name || "export.csv", { filter });
		},
		...extend
	};
}
