import { QNotifyCreateOptions } from "quasar";
import { FileUploadOptions } from "../helpers";

export interface DanxOptions {
    fileUpload: FileUploadOptions;
    flashMessages: {
        default: QNotifyCreateOptions;
        success: QNotifyCreateOptions;
        warning: QNotifyCreateOptions;
        error: QNotifyCreateOptions;
    };
}

export let danxOptions: DanxOptions = {
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
};

export function configure(options: DanxOptions) {
    danxOptions = {
        ...danxOptions,
        ...options
    };
}
