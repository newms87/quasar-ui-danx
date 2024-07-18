import { QNotifyCreateOptions } from "quasar";
import { Router } from "vue-router";
import { FileUploadOptions } from "./files";
import { RequestOptions } from "./requests";

export interface DanxOptions {
	tinyMceApiKey?: string;
	fileUpload?: FileUploadOptions;
	request?: RequestOptions;
	router?: Router;
	flashMessages?: {
		default?: QNotifyCreateOptions;
		success?: QNotifyCreateOptions;
		warning?: QNotifyCreateOptions;
		error?: QNotifyCreateOptions;
	};
}
