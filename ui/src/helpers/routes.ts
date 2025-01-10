import { storeObject } from "../helpers";
import { ListControlsRoutes } from "../types";
import { downloadFile } from "./downloadPdf";
import { request } from "./request";

export function useActionRoutes(baseUrl: string, extend?: object): ListControlsRoutes {
	return {
		list(pager?) {
			return request.post(`${baseUrl}/list`, pager);
		},
		summary(filter) {
			return request.post(`${baseUrl}/summary`, { filter });
		},
		details(target, fields) {
			return request.get(`${baseUrl}/${target.id}/details`, { params: { fields } });
		},
		async detailsAndStore(target, fields) {
			const item = await request.get(`${baseUrl}/${target.id}/details`, { params: { fields } });
			return storeObject(item);
		},
		fieldOptions() {
			return request.get(`${baseUrl}/field-options`);
		},
		applyAction(action, target, data) {
			return request.post(`${baseUrl}/${target ? target.id : "new"}/apply-action`, { action, data });
		},
		batchAction(action, targets, data) {
			return request.post(`${baseUrl}/batch-action`, { action, filter: { id: targets.map(r => r.id) }, data });
		},
		export(filter, name) {
			return downloadFile(`${baseUrl}/export`, name || "export.csv", { filter });
		},
		...extend
	};
}
