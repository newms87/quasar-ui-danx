import { storeObject } from "../helpers";
import { ListControlsRoutes } from "../types";
import { downloadFile } from "./downloadPdf";
import { request } from "./request";

export function useActionRoutes(baseUrl: string): ListControlsRoutes {
	return {
		list(pager?) {
			return request.post(`${baseUrl}/list`, pager);
		},
		summary(filter) {
			return request.post(`${baseUrl}/summary`, { filter });
		},
		details(target) {
			return request.get(`${baseUrl}/${target.id}/details`);
		},
		async detailsAndStore(target) {
			const item = await request.get(`${baseUrl}/${target.id}/details`);
			return storeObject(item);
		},
		async relation(target, relation) {
			const item = await request.get(`${baseUrl}/${target.id}/relation/${relation}`);
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
		}
	};
}
