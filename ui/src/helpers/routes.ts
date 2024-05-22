import { ActionTargetItem, AnyObject, ListControlsPagination } from "../types";
import { downloadFile } from "./downloadPdf";
import { request } from "./request";

export function useActionRoutes(baseUrl: string) {
	return {
		list(pager: ListControlsPagination) {
			return request.post(`${baseUrl}/list`, pager);
		},
		summary(filter: AnyObject) {
			return request.post(`${baseUrl}/summary`, { filter });
		},
		details(target: ActionTargetItem) {
			return request.get(`${baseUrl}/${target.id}/details`);
		},
		fieldOptions() {
			return request.get(`${baseUrl}/field-options`);
		},
		applyAction(action: string, target: ActionTargetItem | null, data: object) {
			return request.post(`${baseUrl}/${target ? target.id : "new"}/apply-action`, { action, data });
		},
		batchAction(action: string, targets: ActionTargetItem[], data: object) {
			return request.post(`${baseUrl}/batch-action`, { action, filter: { id: targets.map(r => r.id) }, data });
		},
		export(filter: AnyObject, name?: string) {
			return downloadFile(`${baseUrl}/export`, name || "export.csv", { filter });
		}
	};
}
