import { QNotifyCreateOptions } from "quasar";
import { Ref, shallowRef } from "vue";
import { FileUploadOptions } from "../helpers";

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

export const danxOptions: Ref<DanxOptions> = shallowRef({
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
