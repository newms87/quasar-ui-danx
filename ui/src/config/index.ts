import { QNotifyCreateOptions } from "quasar";

export interface DanxFileUploadOptions {
    directory?: string;
    presignedUploadUrl?: string | null;
    uploadCompletedUrl?: string | null;
}

export interface DanxOptions {
    fileUpload: DanxFileUploadOptions;
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
