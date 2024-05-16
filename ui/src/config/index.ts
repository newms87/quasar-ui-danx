import { shallowRef } from "vue";
import { DanxOptions } from "../types";

export const danxOptions = shallowRef<DanxOptions>({
	tinyMceApiKey: "set-api-key-in-danx-options",
	request: {
		baseUrl: "",
		headers: {}
	},
	fileUpload: {
		directory: "file-upload",
		presignedUploadUrl: (path, name, mime) => ``,
		uploadCompletedUrl: (fileId) => ""
	},
	flashMessages: {
		default: {},
		success: {},
		warning: {},
		error: {}
	}
});

export function configure(options: DanxOptions) {
	danxOptions.value = {
		...danxOptions.value,
		...options,
		fileUpload: {
			...danxOptions.value.fileUpload,
			...options.fileUpload
		},
		flashMessages: {
			...danxOptions.value.flashMessages,
			...options.flashMessages
		},
		request: {
			...danxOptions.value.request,
			...options.request
		}
	};
}
