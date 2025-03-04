import { storeObject } from "../helpers";
import { ListControlsRoutes } from "../types";
import { downloadFile } from "./downloadPdf";
import { request } from "./request";

export function useActionRoutes(baseUrl: string, extend?: object): ListControlsRoutes {
	return {
		list(pager?, options?) {
			options = {
				...options,
				ignoreAbort: true
			};
			return request.post(`${baseUrl}/list`, pager, options);
		},
		summary(filter, options?) {
			options = {
				...options,
				ignoreAbort: true
			};
			return request.post(`${baseUrl}/summary`, { filter }, options);
		},
		details(target, fields, options?) {
			options = {
				...options,
				ignoreAbort: true
			};
			fields && (options.params = { fields });
			return request.get(`${baseUrl}/${target.id}/details`, options);
		},
		async detailsAndStore(target, fields, options?) {
			options = {
				...options,
				ignoreAbort: true
			};
			fields && (options.params = { fields });
			const item = await request.get(`${baseUrl}/${target.id}/details`, options);
			return storeObject(item);
		},
		fieldOptions(options?) {
			return request.get(`${baseUrl}/field-options`, options);
		},
		applyAction(action, target, data, options?) {
			options = {
				...options,
				ignoreAbort: true,
				headers: {
					...options?.headers,
					"X-Timestamp": Date.now()
				}
			};
			data = data || {};
			return request.post(`${baseUrl}/${target ? target.id : "new"}/apply-action`, { action, data }, options);
		},
		batchAction(action, targets, data, options?) {
			options = {
				...options,
				ignoreAbort: true
			};
			return request.post(`${baseUrl}/batch-action`, { action, filter: { id: targets.map(r => r.id) }, data }, options);
		},
		export(filter, name) {
			return downloadFile(`${baseUrl}/export`, name || "export.csv", { filter });
		},
		...extend
	};
}
