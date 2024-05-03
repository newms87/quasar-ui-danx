import { QNotifyCreateOptions } from "quasar";
import { FileUploadOptions } from "./helpers";

export interface DanxOptions {
	tinyMceApiKey: string;
	fileUpload: FileUploadOptions;
	flashMessages: {
		default: QNotifyCreateOptions;
		success: QNotifyCreateOptions;
		warning: QNotifyCreateOptions;
		error: QNotifyCreateOptions;
	};
}
