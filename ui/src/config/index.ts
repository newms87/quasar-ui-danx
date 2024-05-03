import { shallowRef } from "vue";
import { DanxOptions } from "../types";

export const danxOptions = shallowRef<DanxOptions>({
	tinyMceApiKey: "set-api-key-in-danx-options",
	fileUpload: {
		directory: "file-upload",
		presignedUploadUrl: null,
		uploadCompletedUrl: null
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
		...options
	};
}
