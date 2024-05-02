import { ListControlsPagination } from "../components";
import { ActionTargetItem, AnyObject } from "./actions";
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
		filterFieldOptions() {
			return request.get(`${baseUrl}/filter-field-options`);
		},
		applyAction(action: string, target: ActionTargetItem | null, data: object) {
			return request.post(`${baseUrl}/${target ? target.id : "new"}/apply-action`, { action, data });
		},
		batchAction(action: string, targets: ActionTargetItem[], data: object) {
			return request.post(`${baseUrl}/batch-action`, { action, filter: { id: targets.map(r => r.id) }, data });
		},
		export(filter: AnyObject) {
			return downloadFile(`${baseUrl}/export`, "agents.csv", { filter });
		}
	};
}
