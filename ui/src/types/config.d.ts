import { QNotifyCreateOptions } from "quasar";
import { FileUploadOptions } from "./files";
import { RequestOptions } from "./requests";

export interface DanxOptions {
	tinyMceApiKey?: string;
	fileUpload?: FileUploadOptions;
	request?: RequestOptions,
	flashMessages?: {
		default: QNotifyCreateOptions;
		success: QNotifyCreateOptions;
		warning: QNotifyCreateOptions;
		error: QNotifyCreateOptions;
	};
}
